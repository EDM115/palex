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

/*
sources :
- https://loading.io/color/feature/
- https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options
- https://gka.github.io/palettes/#/10|d|00429d,96ffea,ffffe0|ffffe0,ff005e,93003a|1|1
- https://gka.github.io/chroma.js/
*/

function sanitizeInput(input) {
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'hex';
  // The input can be several things, so we need to sanitize it
  // Case 1 : A palette string. ex : 'Set3'
  // Case 2 : A color string. ex : '#FF0000', 'rgb(255,0,0)', 'red', 'FF0', '#F00', ...
  // Case 3 : A colors string. ex : 'fff, 000', '#F00, rgb(0,255,0), blue, #00F', ...
  // Case 4 : An array containing any of the above, can be mixed

  // Case 1
  if (typeof input === 'string' && input in chroma.brewer) {
    return input;
  }
  // Case 2
  if (typeof input === 'string' && chroma.valid(input)) {
    return mode === 'chroma' ? chroma(input) : chroma(input).hex();
  }
  // Case 3
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
      return sanitizeInput(color, mode);
    });
  }
  // Case 4
  if (Array.isArray(input)) {
    var flatArray = [];
    input.forEach(function (color) {
      var sanitizedColor = sanitizeInput(color, mode);
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
function generatePaletteFromBrewer(input, numColors) {
  if (numColors < 1) return [];
  var brewer = sanitizeInput(input);
  if (brewer.length === 0) return [];
  return chroma.scale(brewer).mode('lch').colors(numColors);
}
function adjustForColorBlindness(palette) {
  // How it works :
  // 1. Grab the palette (array of hex values)
  // 2. Make 3 new arrays, each of them mapping the original palette to a new one, simulating the 3 types of color blindness (uses blinder)
  // 3. For each array, compare all the colors to each other. If 2 colors are too similar, shift one of them to a the closer but not similar color. Repeat the process for each array until the said array is "fixed"
  // 4. Return 1 array that computes the 3 other ones into a single one, by taking the best color for each index
  // 5. Eventually recurse the process until the palette is fixed
  // 6. Return the fixed palette

  palette = sanitizeInput(palette, 'hex');
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
  var fixedPalettes = adjustedPalettes.map(function (palette, paletteIndex) {
    return palette.map(function (color, index) {
      if (palette.some(function (otherColor, otherIndex) {
        return index !== otherIndex && isColorTooSimilar(color, otherColor);
      })) {
        return adjustColor(color, palette);
      }
      return color; // Return original if not too similar
    });
  });

  // Combine the fixed palettes into a single palette by choosing the best color for each index
  var finalPalette = palette.map(function (originalColor, index) {
    var colorOptions = fixedPalettes.map(function (palette) {
      return palette[index];
    });
    var distances = colorOptions.map(function (color) {
      return chroma.deltaE(originalColor, color);
    });
    var minDistanceIndex = distances.indexOf(Math.min.apply(Math, _toConsumableArray(distances)));
    return colorOptions[minDistanceIndex];
  });
  return finalPalette;
}
function simulateColorBlindness(colorHex) {
  var normalColor = chroma(colorHex).hex();
  var cb = [normalColor];
  var protanopia = blinder.protanopia(normalColor);
  var deuteranopia = blinder.deuteranopia(normalColor);
  var tritanopia = blinder.tritanopia(normalColor);
  var achromatopsia = blinder.achromatopsia(normalColor);
  cb.push(protanopia, deuteranopia, tritanopia, achromatopsia);
  return cb;
}
function beautifyPalette(colors) {
  var bezier = chroma.bezier(colors);
  var bezierColors = bezier.scale().correctLightness().colors(colors.length);
  return bezierColors;
}
function getGoldenColor(color) {
  var goldenRatio = 0.618033988749895;
  var hue = chroma(color).hsl()[0];
  var hueGolden = (hue + goldenRatio / 360) % 360;
  return chroma.hsl(hueGolden, 0.75, 0.5).hex();
}
function generateGreyscale(start, end, steps) {
  var greyscale = [];
  for (var i = start; i <= end; i++) {
    var lightness = Math.round(i / steps * 255);
    greyscale.push(chroma("rgb(".concat(lightness, ",").concat(lightness, ",").concat(lightness, ")")).hex());
  }
  return greyscale;
}

export { adjustForColorBlindness, beautifyPalette, generateGreyscale, generatePaletteFromBrewer, getGoldenColor, sanitizeInput, simulateColorBlindness };
