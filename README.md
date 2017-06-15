[![npm][npm]][npm-url]

# svg-to-png-loader

A webpack loader which converts SVG files to PNG files.

## Install

```bash
npm install svg-to-png-loader --save-dev
```

## Usage

The loader may be configured to export a single or multiple PNGs with varying dimensions. For a single PNG, the height and width can be specified directly:

- `name` - A template string for the output file name.
- `height` - The height of the resulting PNG.
- `width` - The width of the resulting PNG.
- `sizes` - Used if exporting multiple PNGs from a single SVG. Holds an array of sizes.

### Examples
The following example yeilds a single 32x32 PNG:
```js
// Generates a single PNG at ${output}/img-32x32.png
require("svg-to-png-loader?height=32&width=32!img.svg");
```
The following example yields multiple PNGs at ${output}/assets/icon-[height]x[width].png using the `sizes` option along with a custom name template specified in the `name` option:
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
[npm]: https://img.shields.io/npm/v/svg-to-png-loader.svg
[npm-url]: https://npmjs.com/package/svg-to-png-loader