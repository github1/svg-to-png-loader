import * as loaderUtils from "loader-utils";
import path from "path";
import fs from "fs";
import { createConverter } from 'convert-svg-to-png';

const prepareSizes = options =>
  [options.height ? [
    {
      height: options.height,
      width: options.width || options.height
    }
  ] : ((options.sizes || [])
    .map(val => val.trim())
    .map(val => [val, (/([0-9]+)([x,])?([0-9]+)?/).exec(val)])
    .map(val => val[1])
    .map(val => ({
      height: val[1],
      width: val[3] || val[1]
    })))]
    .map(val => {
      if (val.length === 0) {
        throw new Error("No size provided");
      }
      return val;
    })[0];

export default function (content) {
  const options = loaderUtils.getOptions(this);
  const context = options.context || this.rootContext;
  const callback = this.async();
  const logger = this.getLogger ? this.getLogger('svg-to-png-loader') : console;
  options.name = options.name || '[contenthash].png';
  options.name = options.name.replace('[name]', path
    .basename(this.resourcePath)
    .replace(/\..*$/, ''));
  let outputPathBase = loaderUtils.interpolateName(
    this,
    options.name,
    {
      context,
      content,
      regExp: options.regExp,
    }
  );
  if (options.outputPath) {
    outputPathBase = path.join(options.outputPath, outputPathBase);
  }

  const converter = createConverter();
  Promise.all(prepareSizes(options).map((size) => {
    return new Promise((resolve, reject) => {
      const outputPath = outputPathBase.replace(/\[([^\]]+)]/g, (match) => {
        match = match.replace(/^\[|]$/g, '');
        return size[match] ? size[match] : match
      });

      const exportNum = Math.floor(100000 + Math.random() * 9000000);
      const exportOutputPath = path.join(context, `${outputPath}.${exportNum}.export`);
      fs.mkdirSync(path.dirname(exportOutputPath), { recursive: true });

      converter.convertFile(this.resourcePath, {
        outputFilePath: exportOutputPath,
        width: size.width,
        height: size.height,
      })
        .then(() => {
          fs.readFile(exportOutputPath, (err, content) => {
            if (err) {
              logger.error(`Failed to load ${exportOutputPath}`, err);
              reject(new Error(`Failed to load ${exportOutputPath}`));
            } else {
              fs.unlink(exportOutputPath, (err) => {
                if (err) {
                  logger.error(`Failed to clean ${exportOutputPath}`, err);
                }
              });
              this.emitFile(outputPath, content);
              resolve({ size, outputPath });
            }
          });
        });
    });
  }))
    .then((results) => {
      let output = 'module.exports = {';
      output += results.map((result) => {
        const sizeKey = `${result.size.height}x${result.size.width}`;
        return `"${sizeKey}": __webpack_public_path__ + "${result.outputPath}"`
      }).join(',');
      output += '};';
      callback(null, output);
    })
    .catch((error) => {
      callback(error);
    })
    .finally(() => {
      converter.destroy();
    });
}
