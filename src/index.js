import * as loaderUtils from "loader-utils";
import os from "os";
import child_process from "child_process";
import helper from "./helper.js";
export default function () {
  const callback = this.async();
  helper
    .convert(
      Object.assign({
        resourcePath: this.resourcePath,
        outputPath: this.options.output.path
      }, loaderUtils.getOptions(this)),
      helper,
      child_process,
      os.platform(),
      process.env["SVG_TO_PNG_DRYRUN"] == "true"
    )
    .then(() => {
      callback(null, "");
    })
    .catch(callback);
}
