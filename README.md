# palex
**A javascript package to help you create and manage color palettes**

![NPM Version](https://img.shields.io/npm/v/palex) ![NPM Downloads](https://img.shields.io/npm/dt/palex) ![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/palex)  
![npm bundle size](https://img.shields.io/bundlephobia/min/palex) ![npm bundle size (gzip)](https://img.shields.io/bundlephobia/minzip/palex)  
![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/palex) ![Dependent repos (via libraries.io)](https://img.shields.io/librariesio/dependent-repos/npm/palex) ![Dependents (via libraries.io)](https://img.shields.io/librariesio/dependents/npm/palex)  
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/palex) [![DeepSource](https://app.deepsource.com/gh/EDM115/palex.svg/?label=active+issues&show_trend=true&token=xJS8bnp9wldi4n1Se07fkY5S)](https://app.deepsource.com/gh/EDM115/palex/)

Did you ever wanted to create a *color palette* for your website or your app but you didn't knew how to do it ? Did you had the idea to create a whole palette from a *single* color but thought it was too hard ? Or maybe you were wondering how to make a color palette *colorblind friendly* ?  
Well today is your lucky day because `palex` is here to help you with all of that !

> [!NOTE]
> `palex` was created when I was working on [@data-fair/app-charts](https://github.com/data-fair/app-charts) and I needed to create color palettes for the charts. During this time I created several functions to help me with that, and some didn't make it to the final version, so I decided to release `palex` as a standalone library to help anyone struggling with color palettes !

## Installation

You can install `palex` using your favorite package manager, here are some examples :

```bash
npm install palex

yarn add palex
```

Find the package on : [NPM](https://www.npmjs.com/package/palex) | [jsDelivr](https://www.jsdelivr.com/package/npm/palex)

## Usage

You can instanciate `palex` the CommonJS way :

```js
const palex = require('palex')

console.log(palex.palex('#FFB86C', 'color', 10, cbf = true, golden = true))
```

Or the ESM way (used in the following documentation) :

```js
import { palex } from 'palex'

console.log(palex('#FFB86C', 'color', 10, cbf = true, golden = true))
```

> [!IMPORTANT]
> If you're using the ESM way, you'll need to either use the `.mjs` extension or have a `"type": "module"` in your `package.json` file.

## Documentation

The following documentation will explain how to use `palex` and its functions. It tries to be as comprehensive as possible, but if you have any question, feel free to open an issue ! Pull requests are also welcome if you want to add a feature or fix a bug !

### `palex(input, type, numColors = 10, cbf = false, golden = false, grey = false)`

The main entrypoint of `palex`. It generates a color palette based on a given input and type.
- `input` : The input color(s). It can be a palette string (brewer), a color(s) string (hex, rgb, or named color) or an array containing any of these.
- `type` : The type of the input. It can be `brewer`, `hues`, `complementary`, `color` or `greyscale`.
- `numColors` : The number of colors to generate. It defaults to 10.
- `cbf` : If `true`, the palette will be colorblind friendly. It defaults to `false`. Have no effect if the type is `brewer` or `greyscale`.
- `golden` : If `true`, the palette will be based on the golden ratio. It defaults to `false`. Not recommended to use along with `cbf`.
- `grey` : If `true`, a greyscale will be added to the generated palette if the number of colors is less than numColors. It defaults to `false`.

Returns an array of colors in hexadecimal format.

```js
import { palex } from 'palex'

console.log(palex('#FFB86C', 'color', 10, cbf = true, golden = true))
// ["#df9220", "#2520df", "#dfb220", "#df3720", "#c6df20", "#df20a7", "#dfde20", "#2c20df", "#ccdf20", "#205fdf"]
```

### `sanitizeInput(input)`

Did you ever wanted to know how every function in `palex` can accept such a wide range of inputs ? Well, it's because of `sanitizeInput` ! I wanted to create something easy to use so *you* don't have to worry about changing the input to fit the function.
- `input` : The input to sanitize. It can be a palette string (brewer), a color(s) string (hex, rgb, or named color) or an array containing any of these.

Returns the sanitized input.

```js
import { sanitizeInput } from 'palex'

console.log(sanitizeInput('#FFB86C'))
// "#ffb86c"
console.log(sanitizeInput('Set3'))
// "Set3"
console.log(sanitizeInput('rgb(255, 184, 108)'))
// "#ffb86c"
console.log(sanitizeInput('ff0, #abc, FFB86C, , ,, ,,, rgb(100, 200, 81)'))
// ["#ffff00", "#aabbcc", "#ffb86c", "#64c851"]
```

### `generatePaletteFromBrewer(input, numColors)`

Generates a color palette from a brewer palette string.

> [!TIP]
> You can find strings to use here : https://loading.io/color/feature/  
> All strings in the Diverging section are valid, all from Qualitative except HCL, and most from Gradient too :\)

- `input` : The brewer palette string.
- `numColors` : The number of colors to generate. If not provided, it defaults to 2 and will return the 2 base colors of the palette.

Returns an array of colors in hexadecimal format.

```js
import { generatePaletteFromBrewer } from 'palex'

console.log(generatePaletteFromBrewer('Set3', 10))
// ["#8dd3c7", "#ffe3b1", "#e19ec9", "#aaa1df", "#ffa778", "#d4d766", "#f1d1e1", "#caa8ca", "#dbd29f", "#ffed6f"]
```

### `getGoldenColor(color)`

Returns a color based on the golden ratio from a given color. The idea behind it stems from the very good [PleaseJS](https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options) library.
- `color` : The color to base the new color on.

Returns a color in hexadecimal format.

```js
import { getGoldenColor } from 'palex'

console.log(getGoldenColor('#FFB86C'))
// "#df8320"
```

### `generateGreyscale(start, end, steps)`

Generates a greyscale palette from a start point to an end point with a given number of steps.
- `start` : The start point of the greyscale, from 0 to 255.
- `end` : The end point of the greyscale, from 0 to 255.
- `steps` : The number of steps to generate.

Returns an array of colors in hexadecimal format.

```js
import { generateGreyscale } from 'palex'

console.log(generateGreyscale(0, 10, 5))
// generates 11 colors, from black at 0 to white at 5, and values above steps and below end are white
// ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]

console.log(generateGreyscale(6, 10, 6))
// generates 5 colors. they are all pure white
// ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]

console.log(generateGreyscale(1, 5, 10))
// generates 5 colors. since steps is bigger than end - start, we will have a greyscale that avoids black and white
// ["#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080"]
```

### `generateHues(palette, numColors, cbf = false)`

Generates a hue palette from a given color palette and a number of colors. It can also make the palette colorblind friendly.
- `palette` : The palette to base the hue on.
- `numColors` : The number of colors to generate.
- `cbf` : If `true`, the palette will be colorblind friendly. It defaults to `false`.

Returns an array of colors in hexadecimal format.

```js
import { generateHues } from 'palex'

console.log(generateHues(['#BD93F9', '#F1FA8C', '#6272A4'], 10))
// ["#bd93f9", "#f1fa8c", "#6272a4", "#fdecff", "#faffc8", "#7997db", "#fff3ff", "#a6bcf5", "#cee3ff"]

import { generatePaletteFromBrewer } from 'palex'

console.log(generateHues(generatePaletteFromBrewer('Set3', 10), 10))
// ["#8dd3c7", "#ffe3b1", "#e19ec9", "#aaa1df", "#ffa778", "#d4d766", "#f1d1e1", "#caa8ca", "#dbd29f", "#ffed6f"]
```

### `generateHuesFromColor(color, numColors, cbf = false)`

Generates a color palette hue from a given color and a number of colors. It can also make the palette colorblind friendly.
- `color` : The color to base the hue on.
- `numColors` : The number of colors to generate.
- `cbf` : If `true`, the palette will be colorblind friendly. It defaults to `false`.

Returns an array of colors in hexadecimal format.

```js
import { generateHuesFromColor } from 'palex'

console.log(generateHuesFromColor('#FFB86C', 10))
// ["#ffb86c", "#ffc56e", "#ffd794", "#ffe9b7", "#fffadb", "#fff3ff", "#fff3ff", "#fff3ff", "#fff3ff", "#fff3ff"]
```

### `generateComplementary(palette, numColors, cbf = false)`

Generates a complementary palette from a given color palette and a number of colors. It can also make the palette colorblind friendly.
- `palette` : The palette to base the complementary on.
- `numColors` : The number of colors to generate.
- `cbf` : If `true`, the palette will be colorblind friendly. It defaults to `false`.

Returns an array of colors in hexadecimal format.

```js
import { generateComplementary } from 'palex'

console.log(generateComplementary(['#BD93F9', '#F1FA8C', '#6272A4'], 10))
// ["#bd93f9", "#f1fa8c", "#6272a4", "#cff993", "#958cfa", "#a49462", "#f093f9", "#bafa8c", "#7362a4", "#939cf9"]

import { generatePaletteFromBrewer } from 'palex'

console.log(generateComplementary(generatePaletteFromBrewer('Set3', 10), 10))
// ["#8dd3c7", "#ffe3b1", "#e19ec9", "#aaa1df", "#ffa778", "#d4d766", "#f1d1e1", "#caa8ca", "#dbd29f", "#ffed6f"]
```

### `generatePaletteFromColor(color, numColors, cbf = false)`

Generates a color palette from a given color and a number of colors. Starts by generating a complementary color, then generates a number of analogous colors. If the number of colors is not reached, it generates a number of triadic colors. It can also make the palette colorblind friendly.
- `color` : The color to base the palette on.
- `numColors` : The number of colors to generate.
- `cbf` : If `true`, the palette will be colorblind friendly. It defaults to `false`.

Returns an array of colors in hexadecimal format.

```js
import { generatePaletteFromColor } from 'palex'

console.log(generatePaletteFromColor('#FFB86C', 10))
// ["#ffb86c", "#6cb3ff", "#fcff6c", "#ff6f6c", "#b3ff6c", "#ff6cb3", "#6cff6f", "#ff6cfc", "#6cffb8", "#b86cff"]
```

### `adjustForColorBlindness(palette)`

Adjusts a given palette to make it colorblind friendly. It works by simulating the three types of color blindness (protanopia, deuteranopia, and tritanopia) using the `color-blind` library. The function compares all the colors in each simulated palette and shifts one of them to a closer but not similar color if they are too similar. This process is repeated for each simulated palette until they are "fixed". The function then computes the three fixed palettes into a single palette by selecting the best color for each index. This process can be recursively applied until the palette is fully adjusted.
- `palette` : The palette to adjust.

Returns an array of colors in hexadecimal format.

```js
import { adjustForColorBlindness } from 'palex'

console.log(adjustForColorBlindness(['#FFB86C', '#6CB3FF', '#FCFF6C', '#FF6F6C', '#B3FF6C', '#FF6CB3', '#6CFF6F', '#FF6CFC', '#6CFFB8', '#B86CFF']))
// ["#f3bc6a", "#8e8bff", "#fff7dd", "#ff8170", "#f1ff93", "#ab9aa6", "#fbfa68", "#9690ec", "#eef5af", "#548cff"]
```

### `simulateColorBlindness(color)`

Simulates color blindness on a given color using the `color-blind` library. It works by simulating the 4 types of color blindness (protanopia, deuteranopia, tritanopia, and achromatopsia) and returns the base color + the simulated colors.
- `color` : The color to simulate color blindness on.

Returns an array containing the base color and the simulated colors in hexadecimal format.

```js
import { simulateColorBlindness } from 'palex'

console.log(simulateColorBlindness('#FFB86C'))
// ["#ffb86c", "#d9c570", "#f3bc6a", "#ffb0bb", "#c2c2c2"]
```

### Re-exposure

> [!TIP]
> Since this package uses the libraries `chroma.js` and `color-blind`, you can use them directly to create your own color palettes or to simulate color blindness.  
> `palex` re-expose their object so you can directly use them without adding a line to your `package.json` file :\)  
> Find their documentation here : [chroma.js](https://www.vis4.net/chromajs) and [color-blind](https://github.com/skratchdot/color-blind)

```js
import { chroma, blinder } from 'palex'

console.log(chroma.bezier(['#FFB86C', '#6CB3FF']).scale().colors(5))
// ["#ffb86c", "#e8b693", "#ccb5b7", "#a7b4db", "#6cb3ff"]

console.log(blinder.protanopia('#FFB86C'))
// "#d9c570"
```

## Contributing

Here's a quick guide to contributing to `palex` :

1. Fork the repository (and star it)
2. Clone your fork
```bash
git clone https://github.com/your-username/palex.git
cd palex
```
3. Do your changes
4. Test your changes  
  Import the function you wanna test in `test/App.vue` and instanciate it like the others are
```bash
npm run test
```
5. Commit your changes
```bash
git add -A
git commit -m "Your changes"
git push
```
6. Open a pull request

## Donate

I'm a small developer from France, and as I write this I'm still pursuing my studies. If you want to support me, here's how you can do it :
- Star this repository
- Follow me on [GitHub](https://github.com/EDM115)
- Donate :
  - [PayPal](https://paypal.me/8EDM115)
  - [GitHub Sponsors](https://github.com/sponsors/EDM115)
  - [BuyMeACoffee](https://www.buymeacoffee.com/EDM115)
  - [Donate on Telegram](https://t.me/EDM115bots/698)

## License

- `palex` is licensed under the [MIT License](https://github.com/EDM115/palex/blob/master/LICENSE)
- `chroma.js` is licensed under the [BSD License](https://github.com/gka/chroma.js/blob/main/LICENSE)
- `color-blind` is licensed under the [MIT License + CC-BY-SA-4.0](https://github.com/skratchdot/color-blind?tab=readme-ov-file#license)

> [!NOTE]
> Sources that helped during development :
> - [vis4/chroma.js](https://www.vis4.net/chromajs)
> - [vis4/palettes](https://www.vis4.net/palettes/#/10|d|00429d,96ffea,ffffe0|ffffe0,ff005e,93003a|1|1)
> - [Fooidge/PleaseJS#make_color-options](https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options)
> - [loading.io/color/feature](https://loading.io/color/feature/)
