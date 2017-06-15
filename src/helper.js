import path from "path";

export default {
  prepareSizes: config =>
    [config.height ? [
      {
        height: config.height,
        width: config.width || config.height
      }
    ] : ((config.sizes || [])
      .map(val => val.trim())
      .map(val => [val, (/([0-9]+)(x([0-9]+))?/).exec(val)])
      .map(val => val[1])
      .map(val => ({
        height: val[1],
        width: val[3] || val[1]
      })))]
      .map(val => {
        if (val.length === 0) {
          throw new Error("");
        }
        return val;
      })[0],
  prepareName: (template, templateData) => Object.keys(templateData)
    .reduce(function (ac, cu) {
      return ac
        .replace(
          new RegExp("\\[" + cu + "\\]", "g"),
          (templateData[cu] + "").replace(/\.svg$/i, ""));
    }, template || "[name]-[height]x[width].png"),
  convert: (config, helper, child_process, os, dryRun) =>
    Promise.all(helper.prepareSizes(config).map(size =>
      new Promise((resolve, reject) => {

        const name = helper.prepareName(config.name, {
          name: path.basename(config.resourcePath),
          height: size.height,
          width: size.width
        });

        const exportPng = path.join(config.outputPath, name);

        const inkscapeConfig = config.inkscape || {};

        const inkscapeBin = inkscapeConfig.bin || (os === "darwin" ?
            "/Applications/Inkscape.app/Contents/Resources/bin/inkscape" :
            "inkscape");

        const inkscapeCmd = `
        ${inkscapeBin}
          --export-png=${exportPng}
          --export-height=${size.height}
          --export-width=${size.width}
          ${config.resourcePath}
      `.replace(/\n/g, " ").replace(/[ ]+/g, " ").trim();
        if (dryRun) {
          resolve();
        } else {
          child_process.exec(inkscapeCmd, (err, stdout, stderr) => {
            const log = function (line, stream) {
              if (stream.length > 0) {
                stream.apply(null, line);
              }
            };
            log(stdout, console.log);
            log(stderr, console.error);
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }

      })
    ))
};
