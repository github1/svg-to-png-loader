# svg-to-png-loader

A webpack loader which converts SVG files to PNG files.

[![build status](https://img.shields.io/travis/github1/svg-to-png-loader/master.svg?style=flat-square)](https://travis-ci.org/github1/svg-to-png-loader)
[![npm version](https://img.shields.io/npm/v/svg-to-png-loader.svg?style=flat-square)](https://www.npmjs.com/package/svg-to-png-loader)
[![npm downloads](https://img.shields.io/npm/dm/svg-to-png-loader.svg?style=flat-square)](https://www.npmjs.com/package/svg-to-png-loader)

## Prerequisites

- Node.js v10.12.0 or greater
- [inkscape]

## Install

```bash
npm install svg-to-png-loader --save-dev
```

## Usage

The loader can be configured to export one or more PNGs with varying dimensions. For a single PNG, the height and width can be specified directly. The height/width and size options are mutually exclusive:

- __name__ - _(Optional)_. A template string for the output file name. Defaults to `[name]-[height]x[width].png`.
- __height__ - The height of the resulting PNG. Use
- __width__ - The width of the resulting PNG.
- __sizes__ - An array of sizes (height, width). Size entries should be formatted like `[height]x[width]` (e.g. `57x32`) or just `[number]` (e.g. `57`) for square dimensions. 
- __outputPath__ - _(Optional)_. Path where the PNG file(s) will be placed.
- __inkscape__ - _(Optional)_. Path to inkscape binary.

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
    "&name=assets/icon-[height]x[width]-[contenthash].png!./assets/icon.svg");
```
You can also use the loader in your webpack config. The below example will transform imported `svg` files with a suffix of `.icon.svg` (e.g. to distinguish icons from other svgs):
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
