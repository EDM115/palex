import blinder from 'color-blind';
export { default as blinder } from 'color-blind';
import chroma from 'chroma-js';
export { default as chroma } from 'chroma-js';

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * Sanitizes the input to ensure it is in the correct format for further processing.
 *
 * @param {string | string[]} input - The input to be sanitized. It can be a palette string, a color string, a colors string, or an array containing any of these.
 * @returns {string | string[]} - The sanitized input. If the input is a palette string, it is returned as is. If the input is a color string, it is converted to a hex value. If the input is a colors string, it is split into individual colors and sanitized. If the input is an array, each element is recursively sanitized and returned as a flat array.
 */
function sanitizeInput(input) {
  // Case 1 : A palette string. ex : 'Set3'
  if (typeof input === 'string' && input.trim() in chroma.brewer) {
    return input.trim();
  }

  // Case 2 : A color string. ex : '#FF0000', 'rgb(255,0,0)', 'red', 'FF0', '#F00', ...
  if (typeof input === 'string' && chroma.valid(input.trim())) {
    return chroma(input.trim()).hex();
  }

  // Case 3 : A colors string. ex : 'fff, 000', '#F00, rgb(0,255,0), blue, #00F', ...
  if (typeof input === 'string' && input.includes(',')) {
    var colors = [];
    var buffer = '';
    var inParentheses = false;
    for (var i = 0; i < input.length; i++) {
      var _char = input[i];
      if (_char === '(') inParentheses = true;
      if (_char === ')') inParentheses = false;
      if (_char === ',' && !inParentheses) {
        if (buffer.trim()) {
          var trimmedBuffer = buffer.trim();
          if (trimmedBuffer.startsWith('"') && trimmedBuffer.endsWith('"')) {
            trimmedBuffer = trimmedBuffer.substring(1, trimmedBuffer.length - 1);
          }
          colors.push(trimmedBuffer);
          buffer = '';
        }
      } else {
        buffer += _char;
      }
    }
    if (buffer.trim()) {
      var _trimmedBuffer = buffer.trim();
      if (_trimmedBuffer.startsWith('"') && _trimmedBuffer.endsWith('"')) {
        _trimmedBuffer = _trimmedBuffer.substring(1, _trimmedBuffer.length - 1);
      }
      colors.push(_trimmedBuffer);
    }
    var validColors = colors.filter(function (color) {
      return color && chroma.valid(color);
    });
    return validColors.map(function (color) {
      return sanitizeInput(color);
    });
  }

  // Case 4 : An array containing any of the above, can be mixed
  if (Array.isArray(input)) {
    var flatArray = [];
    input.forEach(function (color) {
      var sanitizedColor = sanitizeInput(color);
      if (Array.isArray(sanitizedColor)) {
        flatArray.push.apply(flatArray, _toConsumableArray(sanitizedColor));
      } else if (sanitizedColor) {
        flatArray.push(sanitizedColor);
      }
    });
    return flatArray;
  }
  return [];
}

/**
 * Generates a palette of colors from a Brewer palette.
 *
 * @param {string} input - The input Brewer palette. See https://loading.io/color/feature/
 * @param {number} numColors - The number of colors to generate.
 * @returns {Array} - The generated palette of colors.
 */
function generatePaletteFromBrewer(input, numColors) {
  if (numColors < 1) return [];
  var brewer = sanitizeInput(input);
  if (brewer.length === 0) return [];
  return chroma.scale(brewer).mode('lch').colors(numColors);
}

/**
 * Adjusts a palette of colors for color blindness. It works by simulating the three types of color blindness (protanopia, deuteranopia, and tritanopia) using the 'color-blind' library. The function compares all the colors in each simulated palette and shifts one of them to a closer but not similar color if they are too similar. This process is repeated for each simulated palette until they are "fixed". The function then computes the three fixed palettes into a single palette by selecting the best color for each index. This process can be recursively applied until the palette is fully adjusted.
 *
 * @param {Array} palette - The palette of colors to adjust.
 * @returns {Array} - The adjusted palette of colors.
 */
function adjustForColorBlindness(palette) {
  // How it works :
  // 1. Grab the palette (array of hex values)
  // 2. Make 3 new arrays, each of them mapping the original palette to a new one, simulating the 3 types of color blindness (uses color-blind)
  // 3. For each array, compare all the colors to each other. If 2 colors are too similar, shift one of them to a the closer but not similar color. Repeat the process for each array until the said array is "fixed"
  // 4. Return 1 array that computes the 3 other ones into a single one, by taking the best color for each index
  // 5. Eventually recurse the process until the palette is fixed
  // 6. Return the fixed palette

  palette = sanitizeInput(palette);
  var types = ['protanopia', 'deuteranopia', 'tritanopia'];
  var adjustedPalettes = types.map(function (type) {
    return palette.map(function (color) {
      return blinder[type](color);
    });
  });
  var isColorTooSimilar = function isColorTooSimilar(color1, color2) {
    // Calculate the color difference using CMC l:c (1984), see https://en.wikipedia.org/wiki/Color_difference#CMC_l:c_.281984.29
    var threshold = 7; // This threshold can be adjusted based on how you define "too similar". 7 seemed like a good choice based on this : https://www.vis4.net/chromajs/#chroma-deltae
    var deltaE = chroma.deltaE(color1, color2);
    return deltaE < threshold;
  };
  var adjustColor = function adjustColor(originalColor, allColors) {
    // Adjust color based on importance: hue (75%), luminance (15%), saturation (10%)
    var bestMatch = originalColor;
    var minDifference = Infinity;
    var _loop = function _loop() {
      var testColor = chroma(bestMatch).set('hsl.h', "+".concat(hueShift));
      var luminanceAdjustment = 0.15 * (hueShift / 360);
      var saturationAdjustment = 0.1 * (hueShift / 360);
      testColor = testColor.set('hsl.l', "+".concat(luminanceAdjustment)).set('hsl.s', "+".concat(saturationAdjustment)).hex();
      if (!allColors.some(function (otherColor) {
        return isColorTooSimilar(testColor, otherColor);
      })) {
        var difference = chroma.deltaE(originalColor, testColor);
        if (difference < minDifference) {
          minDifference = difference;
          bestMatch = testColor;
        }
      }
    };
    for (var hueShift = 0; hueShift < 360; hueShift += 10) {
      _loop();
    }
    return bestMatch;
  };
  var fixedPalettes = adjustedPalettes.map(function (adjustedPalette) {
    return adjustedPalette.map(function (color, index) {
      if (adjustedPalette.some(function (otherColor, otherIndex) {
        return index !== otherIndex && isColorTooSimilar(color, otherColor);
      })) {
        return adjustColor(color, adjustedPalette);
      }
      return color; // Return original if not too similar
    });
  });

  // Combine the fixed palettes into a single palette by choosing the best color for each index
  var finalPalette = palette.map(function (originalColor, index) {
    var colorOptions = fixedPalettes.map(function (fixedPalette) {
      return fixedPalette[index];
    });
    var distances = colorOptions.map(function (color) {
      return chroma.deltaE(originalColor, color);
    });
    var minDistanceIndex = distances.indexOf(Math.min.apply(Math, _toConsumableArray(distances)));
    return colorOptions[minDistanceIndex];
  });
  return finalPalette;
}

/**
 * Simulates color blindness for a given color.
 *
 * @param {string} color - The color to simulate color blindness for.
 * @returns {Array} - An array containing the original color and the color blindness simulations (protanopia, deuteranopia, tritanopia, and achromatopsia).
 */
function simulateColorBlindness(color) {
  var normalColor = sanitizeInput(color);
  var cb = [normalColor];
  var protanopia = blinder.protanopia(normalColor);
  var deuteranopia = blinder.deuteranopia(normalColor);
  var tritanopia = blinder.tritanopia(normalColor);
  var achromatopsia = blinder.achromatopsia(normalColor);
  cb.push(protanopia, deuteranopia, tritanopia, achromatopsia);
  return cb;
}

/**
 * Returns a golden color based on the input color.
 *
 * @param {string} color - The input color in any valid format (hex, rgb, etc.).
 * @returns {string} - The golden color in hex format.
 */
function getGoldenColor(color) {
  color = sanitizeInput(color);
  var goldenRatio = 0.618033988749895;
  var hue = chroma(color).hsl()[0];
  var hueGolden = (hue + goldenRatio / 360) % 360;
  return chroma.hsl(hueGolden, 0.75, 0.5).hex();
}

/**
 * Generates a greyscale palette.
 *
 * @param {number} start - The starting value for the greyscale palette.
 * @param {number} end - The ending value for the greyscale palette.
 * @param {number} steps - The number of steps in the greyscale palette.
 * @returns {string[]} - An array of hexadecimal color values representing the greyscale palette.
 */
function generateGreyscale(start, end, steps) {
  var greyscale = [];
  // foolproofing
  if (start < 0) start = 0;
  if (start > 255) start = 255;
  if (end < 0) end = -end;
  if (end > 255) end = 255;
  if (end < start) {
    var _ref = [end, start];
    start = _ref[0];
    end = _ref[1];
  }
  if (steps < 1) steps = 1;
  if (steps > 255) steps = 255;
  for (var i = start; i <= end; i++) {
    var lightness = Math.round(i / steps * 255);
    greyscale.push(chroma("rgb(".concat(lightness, ",").concat(lightness, ",").concat(lightness, ")")).hex());
  }
  return greyscale;
}

/**
 * Generates a palette of hues based on the given palette and number of colors.
 *
 * @param {string[]} palette - The base palette of colors.
 * @param {number} numColors - The number of colors to generate in the palette.
 * @param {boolean} [cbf=false] - Whether to adjust the palette for color blindness.
 * @returns {string[]} The generated palette of hues.
 */
function generateHues(palette, numColors) {
  var cbf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (numColors < 1) return [];
  palette = sanitizeInput(palette);
  var colors = [];
  var hues = [];
  var length = Math.floor(numColors / palette.length);
  palette.forEach(function (baseColor) {
    hues.push(generateHuesFromColor(baseColor, length + 1));
  });
  var _loop2 = function _loop2(i) {
    hues.forEach(function (hue) {
      colors.push(hue[i]);
    });
  };
  for (var i = 0; i < length + 1; i++) {
    _loop2(i);
  }
  colors = _toConsumableArray(new Set(colors));
  if (colors.length > numColors) {
    colors = colors.slice(0, numColors);
  }
  if (cbf) {
    colors = adjustForColorBlindness(colors);
  }
  return colors;
}

/**
 * Generates a range of hues from a given color.
 *
 * @param {string} color - The base color from which to generate the hues.
 * @param {number} numColors - The number of hues to generate.
 * @param {boolean} [cbf=false] - Whether to adjust the generated hues for color blindness.
 * @returns {string[]} An array of generated hues.
 */
function generateHuesFromColor(color, numColors) {
  var cbf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (numColors < 1) return [];
  color = sanitizeInput(color);
  var baseColor = '';
  if (typeof color === 'string') {
    baseColor = chroma(color);
  } else if (Array.isArray(color)) {
    baseColor = chroma(color[0]);
  }
  var colors = [baseColor.hex()];
  for (var i = 1; i < numColors; i++) {
    var colorHue = baseColor.set('hsl.l', "*".concat(1 + i / numColors)).saturate(1);
    colors.push(colorHue.hex());
  }
  if (cbf) {
    colors = adjustForColorBlindness(colors);
  }
  return colors;
}

/**
 * Generates a palette of complementary colors based on the given palette.
 *
 * @param {string[]|string} palette - The input palette of colors.
 * @param {number} numColors - The number of colors to generate in the palette.
 * @param {boolean} [cbf=false] - Whether to adjust the colors for color blindness.
 * @returns {string[]} The generated palette of complementary colors.
 */
function generateComplementary(palette, numColors) {
  var cbf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (numColors < 1) return [];
  palette = sanitizeInput(palette);
  var colors = [];
  var generatedColors = [];
  var length = Math.floor(numColors / palette.length);
  palette.forEach(function (baseColor) {
    generatedColors.push(generatePaletteFromColor(baseColor, length + 1));
  });
  var _loop3 = function _loop3(i) {
    generatedColors.forEach(function (color) {
      colors.push(color[i]);
    });
  };
  for (var i = 0; i < length + 1; i++) {
    _loop3(i);
  }
  colors = _toConsumableArray(new Set(colors));
  if (colors.length > numColors) {
    colors = colors.slice(0, numColors);
  }
  if (cbf) {
    colors = adjustForColorBlindness(colors);
  }
  return colors;
}

/**
 * Generates a palette of colors based on a given base color. Starts by generating a complementary color, then generates a number of analogous colors. If the number of colors is not reached, it generates a number of triadic colors.
 *
 * @param {string} color - The base color to generate the palette from.
 * @param {number} numColors - The number of colors to generate in the palette.
 * @param {boolean} [cbf=false] - Whether to adjust the palette for color blindness.
 * @returns {string[]} An array of colors representing the generated palette.
 */
function generatePaletteFromColor(color, numColors) {
  var cbf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (numColors < 1) return [];
  color = sanitizeInput(color);
  var baseColor = '';
  if (typeof color === 'string') {
    baseColor = chroma(color);
  } else if (Array.isArray(color)) {
    baseColor = chroma(color[0]);
  }
  var colors = [baseColor.hex()];
  var complementaryColor = baseColor.set('hsl.h', '+180');
  colors.push(complementaryColor.hex());
  for (var i = 1; i <= Math.floor((numColors - 2) / 2); i++) {
    var analogousColor1 = baseColor.set('hsl.h', "+".concat(i * 30));
    var analogousColor2 = baseColor.set('hsl.h', "-".concat(i * 30));
    colors.push(analogousColor1.hex(), analogousColor2.hex());
  }
  if (colors.length < numColors) {
    var triadicColor1 = baseColor.set('hsl.h', '+120');
    var triadicColor2 = baseColor.set('hsl.h', '-120');
    colors.push(triadicColor1.hex(), triadicColor2.hex());
  }
  colors = colors.slice(0, numColors);
  if (cbf) {
    colors = adjustForColorBlindness(colors);
  }
  return colors;
}

/**
 * Generates a color palette based on the given input and type.
 *
 * @param {string} input - The input for generating the color palette. 
 * @param {string} type - The type of color palette to generate. Can be one of: 'brewer', 'hues', 'complementary', 'color', 'greyscale'.
 * @param {number} [numColors=10] - The number of colors to generate in the palette. Default is 10.
 * @param {boolean} [cbf=false] - Whether to adjust the colors for color blindness. Default is false.
 * @param {boolean} [golden=false] - Whether to apply the golden ratio to the colors. Default is false.
 * @param {boolean} [grey=false] - Whether to add greyscale colors to the palette if it has less colors than numColors once generated. Default is false.
 * @returns {Array} - The generated color palette, or an empty array if the type is not recognized.
 */
function palex(input, type) {
  var numColors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  var cbf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var golden = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var grey = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  if (numColors < 1) {
    return [];
  }
  input = sanitizeInput(input);
  var palette = [];
  switch (type) {
    case 'brewer':
      palette = generatePaletteFromBrewer(input, numColors);
      break;
    case 'hues':
      palette = generateHues(input, numColors, cbf);
      break;
    case 'complementary':
      palette = generateComplementary(input, numColors, cbf);
      break;
    case 'color':
      palette = generatePaletteFromColor(input, numColors, cbf);
      break;
    case 'greyscale':
      palette = generateGreyscale(0, 255, numColors);
      break;
    default:
      return [];
  }
  if (golden) {
    palette = palette.map(function (color) {
      return getGoldenColor(color);
    });
  }
  if (grey) {
    if (palette.length < numColors) {
      var numGreyscaleColors = numColors - palette.length;
      var start = 0;
      var end = numGreyscaleColors - 1;
      var steps = numGreyscaleColors;
      var greyscaleColors = generateGreyscale(start, end, steps);
      palette = palette.concat(greyscaleColors);
    }
  }
  return palette;
}

export { adjustForColorBlindness, generateComplementary, generateGreyscale, generateHues, generateHuesFromColor, generatePaletteFromBrewer, generatePaletteFromColor, getGoldenColor, palex, sanitizeInput, simulateColorBlindness };
