'use strict';

var blinder = require('color-blind');
var chroma = require('chroma-js');

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
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'chroma';
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

exports.blinder = blinder;
exports.chroma = chroma;
exports.generatePaletteFromBrewer = generatePaletteFromBrewer;
exports.sanitizeInput = sanitizeInput;
