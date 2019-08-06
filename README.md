# svg-to-png-loader

A webpack loader which converts SVG files to PNG files.

## Install

```bash
npm install svg-to-png-loader --save-dev
```

[![build status](https://img.shields.io/travis/github1/svg-to-png-loader/master.svg?style=flat-square)](https://travis-ci.org/github1/svg-to-png-loader)
[![npm version](https://img.shields.io/npm/v/svg-to-png-loader.svg?style=flat-square)](https://www.npmjs.com/package/svg-to-png-loader)
[![npm downloads](https://img.shields.io/npm/dm/svg-to-png-loader.svg?style=flat-square)](https://www.npmjs.com/package/svg-to-png-loader)

_Note: This package requires [inkscape][inkscape] to be available on your path._

## Usage

The loader may be configured to export a single or multiple PNGs with varying dimensions. For a single PNG, the height and width can be specified directly:

- `name` - _(Optional)_. A template string for the output file name. Defaults to `[name]-[height]x[width].png`.
- `height` - The height of the resulting PNG.
- `width` - The width of the resulting PNG.
- `sizes` - Used to export multiple PNGs for a single input SVG. Holds an array of sizes. Size entries may be formatted like `[height]x[width]` (e.g. `57x32`) or just `[number]` (e.g. `57`) for square dimensions. 

### Examples
The following example generates a single 32x32 PNG:
```js
require("svg-to-png-loader?height=32&width=32!img.svg");
```
The following example generates multiple PNGs at `${output.path}/assets/icon-[height]x[width].png` using the `sizes` option along with a custom name template specified in the `name` option:
```js
require("svg-to-png-loader?" +
    "sizes[]=57," +
    "sizes[]=72," +
    "sizes[]=76," +
    "sizes[]=114," +
    "sizes[]=120," +
    "sizes[]=144," +
    "sizes[]=152," +
    "sizes[]=180," +
    "sizes[]=192" +
    "&name=assets/icon-[height]x[width].png!./assets/icon.svg");
```
You can also use the loader directly in your webpack config. The below example will transform imported `svg` files with a suffix of `.icon.svg` (e.g. to distinguish icons from other svgs):
```js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.icon\.svg$/,
        use: [
          {
            loader: path.resolve('svg-to-png-loader'),
            options: {
              sizes: ['57x57', ...]
            }
          }
        ]
      }
    ]
  }
};
```
[inkscape]: https://inkscape.org/

## License
[MIT](LICENSE.md)
