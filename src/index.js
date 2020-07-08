import * as loaderUtils from "loader-utils";
import path from "path";
import os from "os";
import child_process from "child_process";
import fs from "fs";

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
  const outputPathBase = loaderUtils.interpolateName(
    this,
    options.name,
    {
      context,
      content,
      regExp: options.regExp,
    }
  );

  Promise.all(prepareSizes(options).map((size) => {
    return new Promise((resolve, reject) => {
      const outputPath = outputPathBase.replace(/\[([^\]]+)]/g, (match) => {
        match = match.replace(/^\[|]$/g, '');
        return size[match] ? size[match] : match
      });
      const inkscapeBin = options.inkscape || (os.platform() === "darwin" ?
        "/Applications/Inkscape.app/Contents/Resources/bin/inkscape" :
        "inkscape");
      const exportOutputPath = path.join(context, `${outputPath}.export`);
      const cp = child_process.spawn(inkscapeBin, [`--export-png=${exportOutputPath}`,
        `--export-height=${size.height}`,
        `--export-width=${size.width}`, this.resourcePath]);
      cp.stdout.on('data', (data) => {
        logger.info(`${data}`);
      });
      cp.stderr.on('data', (data) => {
        logger.error(`${data}`);
      });
      cp.on('close', (code) => {
        if (code === 0) {
          fs.readFile(exportOutputPath, (err, content) => {
            if (err) {
              logger.error(`Failed to load ${exportOutputPath}`, err);
              reject(new Error(`Failed to load ${exportOutputPath}`));
            } else {
              fs.unlink(exportOutputPath, (err) => {
                if(err) {
                  logger.error(`Failed to clean ${exportOutputPath}`, err);
                }
              });
              this.emitFile(outputPath, content);
              resolve({size, outputPath});
            }
          });
        } else {
          reject(new Error(`Failed to export ${outputPath}`));
        }
      });
    })
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
    });
}
