import path from "path";
import webpack from "webpack";
import {createFsFromVolume, Volume} from "memfs";
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
      const mainjs = readAsset('main.js', compiler, stats);
      t.true(mainjs.includes('module.exports = {"57x57": __webpack_require__.p + "Freesample-57x57.png"};'),
        "output should include map of images by size");
      t.end();
    })
    .catch((err) => {
      t.fail(err)
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
      const mainjs = readAsset('main.js', compiler, stats);
      t.true(mainjs.includes('module.exports = {"57x57": __webpack_require__.p + "Freesample-57x57.png","72x72": __webpack_require__.p + "Freesample-72x72.png","88x101": __webpack_require__.p + "Freesample-88x101.png"}'),
        "output should include map of images by size");
      t.end();
    })
    .catch((err) => {
      t.fail(err)
    });
});

test.cb("throws error if no size provided", (t) => {
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
      console.log(stats.compilation.errors.length > 0);
      t.true(stats.compilation.errors.length > 0);
      t.true(`${stats.compilation.errors[0].message}`.includes('No size provided'));
      t.end();
    })
    .catch((err) => {
      t.fail(err)
    });
});
