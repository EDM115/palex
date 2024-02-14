# palex
A javascript package to help you create color palettes

![NPM Version](https://img.shields.io/npm/v/palex) ![NPM Downloads](https://img.shields.io/npm/dt/palex) ![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/palex)  
![npm bundle size](https://img.shields.io/bundlephobia/minzip/palex) ![npm bundle size (gzip)](https://deno.bundlejs.com/badge?q=palex)  
![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/palex) ![Dependent repos (via libraries.io)](https://img.shields.io/librariesio/dependent-repos/npm/palex) ![Dependents (via libraries.io)](https://img.shields.io/librariesio/dependents/npm/palex)  
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/palex)

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
