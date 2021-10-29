import path from "path";
import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";
import test from "ava";

const getCompiler = (fixture, config = {}) => {
  const fullConfig = {
    mode: 'development',
    devtool: config.devtool || false,
    context: path.resolve(__dirname, 'fixtures'),
    entry: path.resolve(__dirname, 'fixtures', fixture),
    output: {
      path: path.resolve(__dirname, '../outputs')
    },
    plugins: [],
    ...config,
  };
  const compiler = webpack(fullConfig);
  if (!config.outputFileSystem) {
    const outputFileSystem = createFsFromVolume(new Volume());
    outputFileSystem.join = path.join.bind(path);
    compiler.outputFileSystem = outputFileSystem;
  }
  return compiler;
};

const compile = (compiler) => {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error);
      }
      return resolve(stats);
    });
  });
};

const readAsset = (asset, compiler, stats) => {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  let data = "";
  try {
    data = usedFs.readFileSync(path.join(outputPath, asset)).toString();
  } catch (error) {
    data = error.toString();
  }
  return data;
};

test.cb("inline require", (t) => {
  const compiler = getCompiler('inline-require.js');
  compile(compiler)
    .then((stats) => {
      try {
        const mainjs = readAsset('main.js', compiler, stats);
        t.true(mainjs.includes('module.exports = {"16x16": __webpack_require__.p + "images/Freesample-16x16.png","24x24": __webpack_require__.p + "images/Freesample-24x24.png","32x32": __webpack_require__.p + "images/Freesample-32x32.png","48x48": __webpack_require__.p + "images/Freesample-48x48.png","128x128": __webpack_require__.p + "images/Freesample-128x128.png"};'),
          "output should include map of images by size");
      } finally {
        t.end();
      }
    })
    .catch((err) => {
      t.fail(err);
    });
});

test.cb("with resource query", (t) => {
  const compiler = getCompiler("with-resource-query.js", {
    module: {
      rules: [
        {
          test: /\.svg/i,
          rules: [
            {
              loader: path.resolve(__dirname, "../lib/index"),
              options: {
                name: "[name]-[height]x[width].png",
              }
            },
          ],
        },
      ]
    }
  });
  compile(compiler)
    .then((stats) => {
      try {
        const mainjs = readAsset('main.js', compiler, stats);
        t.true(mainjs.includes('module.exports = {"120x120": __webpack_require__.p + "Freesample-120x120.png"}'),
          "output should include map of images by size");
      } finally {
        t.end();
      }
    })
    .catch((err) => {
      t.fail(err);
    });
});

test.cb("with loader", (t) => {
  const compiler = getCompiler("with-loader.js", {
    module: {
      rules: [
        {
          test: /\.svg$/i,
          rules: [
            {
              loader: path.resolve(__dirname, "../lib/index"),
              options: {
                name: "[name]-[height]x[width].png",
                sizes: ["57", "72", "88x101"]
              }
            },
          ],
        },
      ]
    }
  });
  compile(compiler)
    .then((stats) => {
      try {
        const mainjs = readAsset('main.js', compiler, stats);
        t.true(mainjs.includes('module.exports = {"57x57": __webpack_require__.p + "Freesample-57x57.png","72x72": __webpack_require__.p + "Freesample-72x72.png","88x101": __webpack_require__.p + "Freesample-88x101.png"}'),
          "output should include map of images by size");
      } finally {
        t.end();
      }
    })
    .catch((err) => {
      t.fail(err);
    });
});

test.cb("with outputPath", (t) => {
  const compiler = getCompiler("with-loader.js", {
    module: {
      rules: [
        {
          test: /\.svg$/i,
          rules: [
            {
              loader: path.resolve(__dirname, "../lib/index"),
              options: {
                name: "[name]-[height]x[width].png",
                outputPath: "images",
                sizes: ["160x160"]
              }
            },
          ],
        },
      ]
    }
  });
  compile(compiler)
    .then((stats) => {
      try {
        t.true(Object.keys(stats.compilation.assets).includes(`images${path.sep}Freesample-160x160.png`));
      } finally {
        t.end();
      }
    })
    .catch((err) => {
      t.fail(err);
    });
});

test.cb("auto calculates size if no size provided", (t) => {
  const compiler = getCompiler("with-loader.js", {
    module: {
      rules: [
        {
          test: /\.svg$/i,
          rules: [
            {
              loader: path.resolve(__dirname, "../lib/index"),
              options: {
                name: "[name]-[height]x[width].png"
              }
            },
          ],
        },
      ]
    }
  });
  compile(compiler)
    .then((stats) => {
      try {
        console.log(stats.compilation.assets);
        t.true(Object.keys(stats.compilation.assets).includes(`Freesample-392x472.png`));
      } finally {
        t.end();
      }
    })
    .catch((err) => {
      t.fail(err);
    });
});
