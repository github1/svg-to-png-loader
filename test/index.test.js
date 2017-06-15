import test from "ava";
import loader from "../src/index.js";

test.cb("the loader runs", t => {
  loader.apply({
    options: {
      output: {
        path: "/dist"
      }
    },
    resourcePath: "input.svg",
    outputPath: "dist",
    query: "?sizes[]=32x32&name=[name].png",
    async: function() {
      return function(err, result) {
        console.log(err, result);
        t.end();
      }
    }
  });
});
