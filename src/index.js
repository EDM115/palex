const blinder = require('color-blind');
import chroma from "chroma-js";

/**
 * Generates a color palette based on the specified type and number of colors.
 *
 * @param {string} type - The type of color palette to generate. Possible values are 'Qualitative', 'Divergente', and 'Sequentielle'.
 * @param {string} [set='Set3'] - The color set to use for qualitative palettes. Defaults to 'Set3'. Possible values are 'Set1', 'Set2', 'Set3', 'Dark2', 'Paired', 'Accent', 'Pastel1', 'Pastel2', and 'HCL'.
 * @param {number} [numColors=10] - The number of colors to include in the palette. Defaults to 10.
 * @returns {Array<string>} - An array of color values representing the generated palette.
 */
function generatePalette(type, set = 'Set3', numColors = 10) {
    let scale
    const vuetifyColors = inject('vuetify').theme.current.value.colors
    const paletteSets = ['Set1', 'Set2', 'Set3', 'Dark2', 'Paired', 'Accent', 'Pastel1', 'Pastel2', 'HCL']
    if (!set || !paletteSets[set]) set = 'Set3'
    switch (type) {
        case 'Qualitative':
        scale = chroma.scale(set).colors(numColors)
            break
        case 'Divergente':
            scale = chroma.scale([vuetifyColors.primary, vuetifyColors.success, vuetifyColors.accent]).mode('lch').colors(numColors)
        break
        case 'Sequentielle':
            scale = chroma.scale([vuetifyColors.background, vuetifyColors.primary]).mode('lch').colors(numColors)
            break
        default:
        scale = chroma.scale(set).colors(numColors)
    }
    return scale
}

/**
 * Generates a color palette based on the specified type and number of colors.
 *
 * @param {string} [colorscheme] - The colorscheme object to use. Contains both the type (qualitative or diverging) and the name of the colorscheme to use.
 * @param {number} [numColors=10] - The number of colors to include in the palette. Defaults to 10.
 * @returns {Array<string>} - An array of color values representing the generated palette.
 */
function generatePalette2(colorscheme, numColors = 10) {
    let set
    if (colorscheme.type === 'qualitative') {
        const paletteSets = ['Set1', 'Set2', 'Set3', 'Dark2', 'Paired', 'Accent', 'Pastel1', 'Pastel2']
        set = paletteSets.includes(colorscheme.qualitativeName) ? colorscheme.qualitativeName : 'Dark2'
    } else if (colorscheme.type === 'diverging') {
        const paletteSets = ['BrBG', 'PRGn', 'PiYG', 'PuOr', 'RdBu', 'RdGy', 'RdYlBu', 'RdYlGn', 'Spectral']
        set = paletteSets.includes(colorscheme.divergingName) ? colorscheme.divergingName : 'RdYlGn'
    }
    return chroma.scale(set).mode('lch').colors(numColors)
}

function getColors(colorscheme, size, vuetifyColors = null) {
    if (colorscheme.type === 'vuetify-theme' && vuetifyColors) {
        const baseColors = [vuetifyColors.primary, vuetifyColors.secondary]
        if (colorscheme.useAccent) {
            baseColors.push(vuetifyColors.accent)
        }
    
        if (colorscheme.generatePalette) {
            return generateDynamicPalette(baseColors, colorscheme.paletteType, size)
        } else {
            return baseColors.slice(0, size)
        }
    }
  
    const colors = generatePalette(colorscheme, size)
    if (colorscheme.reverse) colors.reverse()
    const greyscaleColors = generateGreyscale(0, size - colors.length - 1, size - colors.length)
    return colors.concat(greyscaleColors)
}

function generateDynamicPalette(baseColors, paletteType, size) {
    let colors = []
    if (paletteType === 'hues') {
        const hues = []
        const effectiveSize = Math.min(size, 20)
        const length = Math.floor(effectiveSize / baseColors.length)
        baseColors.forEach(baseColor => {
            hues.push(generateHuesFromColor(baseColor, length + 1))
        })
        for (let i = 0; i < length + 1; i++) {
            hues.forEach(hue => {
                colors.push(hue[i])
            })
        }
    } else if (paletteType === 'complementary') {
        const generatedColors = []
        const effectiveSize = Math.min(size, 20)
        const length = Math.floor(effectiveSize / baseColors.length)
        baseColors.forEach(baseColor => {
            generatedColors.push(generatePaletteFromColor(baseColor, length + 1))
        })
        for (let i = 0; i < length + 1; i++) {
            generatedColors.forEach(color => {
                colors.push(color[i])
            })
        }
    }
  
    colors = [...new Set(colors)]
    if (colors.length > size) {
        colors = colors.slice(0, size)
    } else {
        const numGreyscaleColors = size - colors.length
        const start = 0
        const end = numGreyscaleColors - 1
        const steps = numGreyscaleColors
        const greyscaleColors = generateGreyscale(start, end, steps)
        colors = colors.concat(greyscaleColors)
    }
  
    return colors
}

/**
 * Adjusts a color for color blindness.
 * Totally not perfect yet, currently just shifts the hue and reduces saturation.
 *
 * @param {string} colorHex - The hexadecimal representation of the color.
 * @returns {string} The adjusted color in hexadecimal format.
 */
function adjustForColorBlindness(colorHex) {
    let color = chroma(colorHex)
    // Example adjustment: shift hue and reduce saturation
    color = color.set('hsl.h', '+20').desaturate(0.5)
    return color.hex()
}

/**
 * Generates a list of color hues based on a given base color.
 *
 * @param {string} colorHex - The hexadecimal representation of the base color.
 * @param {boolean} [colorBlindFriendly=false] - Indicates whether the generated colors should be adjusted for color blindness.
 * @param {number} [numColors=10] - The number of color hues to generate.
 * @returns {string[]} An array of color hues in hexadecimal format.
 */
function generateHuesFromColor(colorHex, colorBlindFriendly = false, numColors = 10) {
    const baseColor = chroma(colorHex)
    let colors = [baseColor.hex()]
    for (let i = 1; i < numColors; i++) {
        const color = baseColor.set('hsl.l', '*' + (1 + i / numColors)).saturate(1)
        colors.push(color.hex())
    }

    if (colorBlindFriendly) {
        colors = colors.map(c => adjustForColorBlindness(c))
    }

    return colors
}

/**
 * Generates a list of color hues based on a given base color.
 *
 * @param {string} colorHex - The hexadecimal representation of the base color.
 * @param {number} [numColors=10] - The number of color hues to generate.
 * @returns {string[]} An array of color hues in hexadecimal format.
 */
function generateHuesFromColor2(colorHex, numColors = 10) {
    const baseColor = chroma(colorHex)
    const colors = [baseColor.hex()]
    for (let i = 1; i < numColors; i++) {
        const color = baseColor.set('hsl.l', '*' + (1 + i / numColors)).saturate(1)
        colors.push(color.hex())
    }
  
    return colors
}

/**
 * Generates a color palette based on a given base color.
 *
 * @param {string} colorHex - The base color in hexadecimal format.
 * @param {boolean} [colorBlindFriendly=false] - Indicates whether the palette should be adjusted for color blindness.
 * @param {number} [numColors=10] - The number of colors to generate in the palette.
 * @returns {string[]} An array of colors in hexadecimal format representing the generated palette.
 */
function generatePaletteFromColor(colorHex, colorBlindFriendly = false, numColors = 10) {
    const baseColor = chroma(colorHex)
    let colors = [baseColor.hex()]

    const complementaryColor = baseColor.set('hsl.h', '+180')
    colors.push(complementaryColor.hex())

    for (let i = 1; i <= Math.floor((numColors - 2) / 2); i++) {
        const analogousColor1 = baseColor.set('hsl.h', `+${i * 30}`)
        const analogousColor2 = baseColor.set('hsl.h', `-${i * 30}`)
        colors.push(analogousColor1.hex(), analogousColor2.hex())
    }

    if (colors.length < numColors) {
        const triadicColor1 = baseColor.set('hsl.h', '+120')
        const triadicColor2 = baseColor.set('hsl.h', '-120')
        colors.push(triadicColor1.hex(), triadicColor2.hex())
    }

    colors = colors.slice(0, numColors)

    if (colorBlindFriendly) {
        colors = colors.map(c => adjustForColorBlindness(c))
    }

    return colors
}

/**
 * Simulates color blindness for a given color.
 *
 * @param {string} colorHex - The hexadecimal representation of the color.
 * @returns {Array} - An array of color hex values representing the simulated color blindness versions of the input color.
 */
function simulateColorBlindness(colorHex) {
    const normalColor = chroma(colorHex).hex()
    const cb = [normalColor]

    const protanopia = blinder.protanopia(normalColor)
    const deuteranopia = blinder.deuteranopia(normalColor)
    const tritanopia = blinder.tritanopia(normalColor)
    const achromatopsia = blinder.achromatopsia(normalColor)
    cb.push(protanopia, deuteranopia, tritanopia, achromatopsia)

    return cb
}

/**
 * Beautifies a palette of colors using chroma-js library.
 * Source for the ideas : https://gka.github.io/palettes/#/9|s|00429d,96ffea,ffffe0|ffffe0,ff005e,93003a|1|1
 * Might look further into this "configuration"
 *
 * @param {Array} colors - The array of colors to be beautified.
 * @returns {Array} - The beautified array of colors.
 */
function beautifyPalette(colors) {
    const bezier = chroma.bezier(colors)
    const bezierColors = bezier.scale().correctLightness().colors(colors.length)

    return bezierColors
}

/**
 * Returns a golden color based on the input color.
 * The idea of "golden color" is taken from the golden ratio.
 * As seen on pleasejs : https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options
 *
 * @param {string} color - The input color in any valid CSS color format.
 * @returns {string} - The golden color in hexadecimal format.
 */
function getGoldenColor(color) {
    const goldenRatio = 0.618033988749895
    const hue = chroma(color).hsl()[0]
    const hueGolden = (hue + (goldenRatio / 360)) % 360
    return chroma.hsl(hueGolden, 0.75, 0.5).hex()
}

function generateGreyscale(start, end, steps) {
    const greyscale = []
    for (let i = start; i <= end; i++) {
        const lightness = Math.round((i / steps) * 255)
        greyscale.push(`rgb(${lightness},${lightness},${lightness})`)
    }
    return greyscale
  }

module.exports = {
    blinder,
    chroma,
    generatePalette,
    generatePalette2,
    getColors,
    generateDynamicPalette,
    adjustForColorBlindness,
    getGoldenColor,
    generateHuesFromColor,
    generateHuesFromColor2,
    generatePaletteFromColor,
    simulateColorBlindness,
    beautifyPalette,
    generateGreyscale
};
