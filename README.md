# palex
A javascript package to help you create color palettes

![NPM Version](https://img.shields.io/npm/v/palex) ![NPM Downloads](https://img.shields.io/npm/dt/palex) ![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/palex)  
![npm bundle size](https://img.shields.io/bundlephobia/min/palex) ![npm bundle size (gzip)](https://img.shields.io/bundlephobia/minzip/palex)  
![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/palex) ![Dependent repos (via libraries.io)](https://img.shields.io/librariesio/dependent-repos/npm/palex) ![Dependents (via libraries.io)](https://img.shields.io/librariesio/dependents/npm/palex)  
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/palex) [![DeepSource](https://app.deepsource.com/gh/EDM115/palex.svg/?label=active+issues&show_trend=true&token=xJS8bnp9wldi4n1Se07fkY5S)](https://app.deepsource.com/gh/EDM115/palex/)

The CommonJS way :
```js
const palex = require('palex')

console.log(palex.generatePaletteFromBrewer('Set1', 10))
```

The ESM way (have a type: module in your package.json or use .mjs files) :
```js
import { generatePaletteFromBrewer } from 'palex'

console.log(generatePaletteFromBrewer('Set1', 10))
```

sources :
- https://loading.io/color/feature/
- https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options
- https://gka.github.io/palettes/#/10|d|00429d,96ffea,ffffe0|ffffe0,ff005e,93003a|1|1
- https://gka.github.io/chroma.js/
