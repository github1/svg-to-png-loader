import * as loaderUtils from "loader-utils";
import path from "path";
import sharp from "sharp";

const prepareSizes = options => {
  const result = [options.height ? [
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
    })))][0];

  if (result.length === 0) {
    return [{width: 1, height: 1}];
  }
  return result.map(size => ({
      width: parseInt(`${size.width || 1}`),
      height: parseInt(`${size.height || 1}`)
    }
  ));
}

export default function (content) {
  const options = Object.assign({}, loaderUtils.getOptions(this), loaderUtils.parseQuery(this.resourceQuery || '?'));
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

  Promise.all(prepareSizes(options).map((size) => {
    return new Promise((resolve, reject) => {
      // Determine webpack output path
      const outputPath = outputPathBase.replace(/\[([^\]]+)]/g, (match) => {
        match = match.replace(/^\[|]$/g, '');
        return (size[match] || size[match] === 0) ? size[match] : match
      });
      // Do conversion
      sharp(this.resourcePath)
        .resize(size.width, size.height)
        .png()
        .toBuffer()
        .then(data => {
          this.emitFile(outputPath, data);
          resolve({size, outputPath});
        });
    });
  }))
    .then((results) => {
      let output = 'module.exports = {';
      output += results.map((result) => {
        const sizeKey = `${result.size.height}x${result.size.width}`;
        return `"${sizeKey}": __webpack_public_path__ + "${result.outputPath}"`;
      }).join(',');
      output += '};';
      callback(null, output);
    })
    .catch((error) => {
      callback(error);
    });
}
