import test from "ava";
import helper from "../src/helper.js";

const execSpy = (err, stdout, stderr) => {
  const fakeExecSpy = [];
  return {
    cmds: fakeExecSpy,
    exec: function (cmd, cb) {
      fakeExecSpy.push(cmd);
      cb(err || null, stdout || [], stderr || []);
    }
  }
};

test.cb("error thrown if no sizes defined", t => {
  try {
    helper.prepareSizes({});
  } catch (err) {
    t.true(true);
  }
  t.end();
});

test.cb("sizes can be height/width pairs or single values", t => {
  const sizes = helper.prepareSizes({
    sizes: ["32x32", "16", "32x64", "64x128", "92", "92x"]
  });
  t.is(sizes[0].height, "32");
  t.is(sizes[0].width, "32");
  t.is(sizes[1].height, "16");
  t.is(sizes[1].width, "16");
  t.is(sizes[2].height, "32");
  t.is(sizes[2].width, "64");
  t.is(sizes[3].height, "64");
  t.is(sizes[3].width, "128");
  t.is(sizes[4].height, "92");
  t.is(sizes[4].width, "92");
  t.is(sizes[5].height, "92");
  t.is(sizes[5].width, "92");
  t.end();
});

test.cb("height and width can be set explicitly", t => {
  const sizes = helper.prepareSizes({
    height: "16",
    width: "16"
  });
  t.is(sizes[0].height, "16");
  t.is(sizes[0].width, "16");
  t.end();
});

test.cb("width defaults to height if not specified", t => {
  const sizes = helper.prepareSizes({
    height: "16"
  });
  t.is(sizes[0].height, "16");
  t.is(sizes[0].width, "16");
  t.end();
});

test.cb("the name defaults to [name]-[height]x[width].png", t => {
  const name = helper.prepareName(undefined, {
    name: 'foo.svg',
    height: 320,
    width: 200
  });
  t.is(name, "foo-320x200.png");
  t.end();
});

test.cb("the supplied name template is processed", t => {
  const name = helper.prepareName('[height].[width].[name].png', {
    name: 'foo.svg',
    height: 320,
    width: 200
  });
  t.is(name, "320.200.foo.png");
  t.end();
});

test.cb("it converts to png as promise", t => {
  const fakeExec = execSpy(null, 'something-from-stdout');
  helper.convert({
    resourcePath: 'img.svg',
    outputPath: '/dist',
    height: 32,
    width: 32
  }, helper, fakeExec, "some-os").then(function () {
    t.is(fakeExec.cmds[0], "inkscape --export-png=/dist/img-32x32.png --export-height=32 --export-width=32 img.svg");
    t.end();
  });
});

test.cb("it can fail converting to png", t => {
  const fakeExec = execSpy(new Error("error"));
  helper.convert({
      resourcePath: 'img.svg',
      outputPath: '/dist',
      height: 32,
      width: 32
    }, helper, fakeExec, "some-os")
    .then(function () {
      t.true(false);
    })
    .catch(function () {
      t.true(true);
      t.end();
    });
});
