import blinder from 'color-blind'
import chroma from 'chroma-js'


/**
 * Sanitizes the input to ensure it is in the correct format for further processing.
 *
 * @param {string | string[]} input - The input to be sanitized. It can be a palette string, a color string, a colors string, or an array containing any of these.
 * @param {string} [mode='hex'] - The mode in which the input should be sanitized. Defaults to 'hex', can be 'chroma'.
 * @returns {string | string[]} - The sanitized input. If the input is a palette string, it is returned as is. If the input is a color string, it is converted to the specified mode. If the input is a colors string, it is split into individual colors and sanitized. If the input is an array, each element is recursively sanitized and returned as a flat array.
 */
function sanitizeInput(input, mode = 'hex') {
    // Case 1 : A palette string. ex : 'Set3'
    if (typeof input === 'string' && input.trim() in chroma.brewer) {
        return input.trim()
    }

    // Case 2 : A color string. ex : '#FF0000', 'rgb(255,0,0)', 'red', 'FF0', '#F00', ...
    if (typeof input === 'string' && chroma.valid(input.trim())) {
        return mode === 'chroma' ? chroma(input.trim()) : chroma(input.trim()).hex()
    }

    // Case 3 : A colors string. ex : 'fff, 000', '#F00, rgb(0,255,0), blue, #00F', ...
    if (typeof input === 'string' && input.includes(',')) {
        const colors = []
        let buffer = ''
        let inParentheses = false

        for (let i = 0; i < input.length; i++) {
            const char = input[i]

            if (char === '(') inParentheses = true
            if (char === ')') inParentheses = false

            if (char === ',' && !inParentheses) {
                if (buffer.trim()) {
                    let trimmedBuffer = buffer.trim()

                    if (trimmedBuffer.startsWith('"') && trimmedBuffer.endsWith('"')) {
                        trimmedBuffer = trimmedBuffer.substring(1, trimmedBuffer.length - 1)
                    }

                    colors.push(trimmedBuffer)
                    buffer = ''
                }
            } else {
                buffer += char
            }
        }

        if (buffer.trim()) {
            let trimmedBuffer = buffer.trim()

            if (trimmedBuffer.startsWith('"') && trimmedBuffer.endsWith('"')) {
                trimmedBuffer = trimmedBuffer.substring(1, trimmedBuffer.length - 1)
            }

            colors.push(trimmedBuffer)
        }

        const validColors = colors.filter(color => color && chroma.valid(color))

        return validColors.map(color => sanitizeInput(color, mode))
    }

    // Case 4 : An array containing any of the above, can be mixed
    if (Array.isArray(input)) {
        const flatArray = []

        input.forEach(color => {
            const sanitizedColor = sanitizeInput(color, mode)

            if (Array.isArray(sanitizedColor)) {
                flatArray.push(...sanitizedColor)
            } else if (sanitizedColor) {
                flatArray.push(sanitizedColor)
            }
        })

        return flatArray
    }

    return []
}

/**
 * Generates a palette of colors from a Brewer palette.
 *
 * @param {string} input - The input Brewer palette.
 * @param {number} numColors - The number of colors to generate.
 * @returns {Array} - The generated palette of colors.
 */
function generatePaletteFromBrewer(input, numColors) {
    if (numColors < 1) return []

    const brewer = sanitizeInput(input)

    if (brewer.length === 0) return []

    return chroma.scale(brewer).mode('lch').colors(numColors)
}

/**
 * Adjusts a palette of colors for color blindness. It works by simulating the three types of color blindness (protanopia, deuteranopia, and tritanopia) using the 'blinder' library. The function compares all the colors in each simulated palette and shifts one of them to a closer but not similar color if they are too similar. This process is repeated for each simulated palette until they are "fixed". The function then computes the three fixed palettes into a single palette by selecting the best color for each index. This process can be recursively applied until the palette is fully adjusted.
 *
 * @param {Array} palette - The palette of colors to adjust.
 * @returns {Array} - The adjusted palette of colors.
 */
function adjustForColorBlindness(palette) {
    // How it works :
    // 1. Grab the palette (array of hex values)
    // 2. Make 3 new arrays, each of them mapping the original palette to a new one, simulating the 3 types of color blindness (uses blinder)
    // 3. For each array, compare all the colors to each other. If 2 colors are too similar, shift one of them to a the closer but not similar color. Repeat the process for each array until the said array is "fixed"
    // 4. Return 1 array that computes the 3 other ones into a single one, by taking the best color for each index
    // 5. Eventually recurse the process until the palette is fixed
    // 6. Return the fixed palette

    palette = sanitizeInput(palette, 'hex')
    const types = ['protanopia', 'deuteranopia', 'tritanopia']
    const adjustedPalettes = types.map(type => palette.map(color => blinder[type](color)))

    const isColorTooSimilar = (color1, color2) => {
        // Calculate the color difference using CMC l:c (1984), see https://en.wikipedia.org/wiki/Color_difference#CMC_l:c_.281984.29
        const threshold = 7 // This threshold can be adjusted based on how you define "too similar". 7 seemed like a good choice based on this : https://www.vis4.net/chromajs/#chroma-deltae
        const deltaE = chroma.deltaE(color1, color2)

        return deltaE < threshold
    }

    const adjustColor = (originalColor, allColors) => {
        // Adjust color based on importance: hue (75%), luminance (15%), saturation (10%)
        let bestMatch = originalColor
        let minDifference = Infinity

        for (let hueShift = 0; hueShift < 360; hueShift += 10) {
            let testColor = chroma(bestMatch).set('hsl.h', `+${hueShift}`)
            let luminanceAdjustment = 0.15 * (hueShift / 360)
            let saturationAdjustment = 0.1 * (hueShift / 360)
            testColor = testColor.set('hsl.l', `+${luminanceAdjustment}`).set('hsl.s', `+${saturationAdjustment}`).hex()

            if (!allColors.some(otherColor => isColorTooSimilar(testColor, otherColor))) {
                const difference = chroma.deltaE(originalColor, testColor)

                if (difference < minDifference) {
                    minDifference = difference
                    bestMatch = testColor
                }
            }
        }

        return bestMatch
    }

    const fixedPalettes = adjustedPalettes.map((palette, paletteIndex) => 
        palette.map((color, index) => {
            if (palette.some((otherColor, otherIndex) => index !== otherIndex && isColorTooSimilar(color, otherColor))) {
                return adjustColor(color, palette)
            }

            return color // Return original if not too similar
        })
    )

    // Combine the fixed palettes into a single palette by choosing the best color for each index
    const finalPalette = palette.map((originalColor, index) => {
        const colorOptions = fixedPalettes.map(palette => palette[index])
        const distances = colorOptions.map(color => chroma.deltaE(originalColor, color))
        const minDistanceIndex = distances.indexOf(Math.min(...distances))

        return colorOptions[minDistanceIndex]
    })

    return finalPalette
}

/**
 * Simulates color blindness for a given color.
 *
 * @param {string} color - The color to simulate color blindness for.
 * @returns {Array} - An array containing the original color and the color blindness simulations (protanopia, deuteranopia, tritanopia, and achromatopsia).
 */
function simulateColorBlindness(color) {
    const normalColor = sanitizeInput(color, 'hex')
    const cb = [normalColor]
    const protanopia = blinder.protanopia(normalColor)
    const deuteranopia = blinder.deuteranopia(normalColor)
    const tritanopia = blinder.tritanopia(normalColor)
    const achromatopsia = blinder.achromatopsia(normalColor)
    cb.push(protanopia, deuteranopia, tritanopia, achromatopsia)

    return cb
}

/**
 * Beautifies a palette by applying a bezier scale and correcting lightness.
 *
 * @param {Array} palette - The palette to be beautified.
 * @returns {Array} - The beautified palette.
 */
function beautifyPalette(palette) {
    palette = sanitizeInput(palette, 'hex')
    const bezier = chroma.bezier(palette)
    const bezierColors = bezier.scale().correctLightness().colors(palette.length)

    return bezierColors
}

/**
 * Returns a golden color based on the input color.
 *
 * @param {string} color - The input color in any valid format (hex, rgb, etc.).
 * @returns {string} - The golden color in hex format.
 */
function getGoldenColor(color) {
    color = sanitizeInput(color, 'hex')
    const goldenRatio = 0.618033988749895
    const hue = chroma(color).hsl()[0]
    const hueGolden = (hue + (goldenRatio / 360)) % 360

    return chroma.hsl(hueGolden, 0.75, 0.5).hex()
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
    const greyscale = []
    // foolproofing
    if (start < 0) start = 0
    if (start > 255) start = 255
    if (end < 0) end = -end
    if (end > 255) end = 255
    if (end < start) [start, end] = [end, start]
    if (steps < 1) steps = 1
    if (steps > 255) steps = 255

    for (let i = start; i <= end; i++) {
        const lightness = Math.round((i / steps) * 255)
        greyscale.push(chroma(`rgb(${lightness},${lightness},${lightness})`).hex())
    }

    return greyscale
}

/**
 * Generates a palette of hues based on the given palette and number of colors.
 *
 * @param {string[]} palette - The base palette of colors.
 * @param {number} numColors - The number of colors to generate in the palette.
 * @param {boolean} [cbf=false] - Whether to adjust the palette for color blindness.
 * @returns {string[]} The generated palette of hues.
 */
function generateHues(palette, numColors, cbf = false) {
    if (numColors < 1) return []
    palette = sanitizeInput(palette, 'hex')
    let colors = []
    const hues = []
    const length = Math.floor(numColors / palette.length)

    palette.forEach(baseColor => {
        hues.push(generateHuesFromColor(baseColor, length + 1))
    })

    for (let i = 0; i < length + 1; i++) {
        hues.forEach(hue => {
            colors.push(hue[i])
        })
    }

    colors = [...new Set(colors)]

    if (colors.length > numColors) {
        colors = colors.slice(0, numColors)
    }

    if (cbf) {
        colors = adjustForColorBlindness(colors)
    }

    return colors
}

/**
 * Generates a range of hues from a given color.
 *
 * @param {string} color - The base color from which to generate the hues.
 * @param {number} numColors - The number of hues to generate.
 * @param {boolean} [cbf=false] - Whether to adjust the generated hues for color blindness.
 * @returns {string[]} An array of generated hues.
 */
function generateHuesFromColor(color, numColors, cbf = false) {
    if (numColors < 1) return []
    const baseColor = sanitizeInput(color, 'chroma')
    let colors = [baseColor.hex()]

    for (let i = 1; i < numColors; i++) {
        const color = baseColor.set('hsl.l', '*' + (1 + i / numColors)).saturate(1)
        colors.push(color.hex())
    }

    if (cbf) {
        colors = adjustForColorBlindness(colors)
    }

    return colors
}

/**
 * Generates a palette of complementary colors based on the given palette.
 *
 * @param {string[]|string} palette - The input palette of colors.
 * @param {number} numColors - The number of colors to generate in the palette.
 * @param {boolean} [cbf=false] - Whether to adjust the colors for color blindness.
 * @returns {string[]} The generated palette of complementary colors.
 */
function generateComplementaries(palette, numColors, cbf = false) {
    if (numColors < 1) return []

    palette = sanitizeInput(palette, 'hex')
    let colors = []
    const generatedColors = []
    const length = Math.floor(numColors / palette.length)

    palette.forEach(baseColor => {
        generatedColors.push(generatePaletteFromColor(baseColor, length + 1))
    })

    for (let i = 0; i < length + 1; i++) {
        generatedColors.forEach(color => {
            colors.push(color[i])
        })
    }

    colors = [...new Set(colors)]

    if (colors.length > size) {
        colors = colors.slice(0, numColors)
    }

    if (cbf) {
        colors = adjustForColorBlindness(colors)
    }

    return colors
}

/**
 * Generates a palette of colors based on a given base color. Starts by generating a complementary color, then generates a number of analogous colors. If the number of colors is not reached, it generates a number of triadic colors.
 *
 * @param {string} color - The base color to generate the palette from.
 * @param {number} numColors - The number of colors to generate in the palette.
 * @param {boolean} [cbf=false] - Whether to adjust the palette for color blindness.
 * @returns {string[]} An array of colors representing the generated palette.
 */
function generatePaletteFromColor(color, numColors, cbf = false) {
    if (numColors < 1) return []

    const baseColor = sanitizeInput(color, 'chroma')
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

    if (cbf) {
        colors = adjustForColorBlindness(colors)
    }

    return colors
}

/**
 * Generates a color palette based on the given input and type.
 *
 * @param {string} input - The input for generating the color palette. 
 * @param {string} type - The type of color palette to generate. Can be one of: 'brewer', 'hues', 'complementary', 'color', 'greyscale'. Returns an empty array if the type is not recognized.
 * @param {number} [numColors=10] - The number of colors to generate in the palette. Default is 10.
 * @param {boolean} [cbf=false] - Whether to adjust the colors for color blindness. Default is false.
 * @param {boolean} [golden=false] - Whether to apply the golden ratio to the colors. Default is false.
 * @param {boolean} [beautify=false] - Whether to beautify the colors using bezier interpolation. Default is false.
 * @param {boolean} [grey=false] - Whether to add greyscale colors to the palette if it has less colors than numColors once generated. Default is false.
 * @returns {Array} - The generated color palette.
 */
function palex(input, type, numColors = 10, cbf = false, golden = false, beautify = false, grey = false) {
    if (numColors < 1) {
        return []
    }

    let palette = []
    
    switch (type) {
        case 'brewer':
            palette = generatePaletteFromBrewer(input, numColors)
            break
        case 'hues':
            palette = generateHues(input, numColors, cbf)
            break
        case 'complementary':
            palette = generateComplementaries(input, numColors, cbf)
            break
        case 'color':
            palette = generatePaletteFromColor(input, numColors, cbf)
            break
        case 'greyscale':
            palette = generateGreyscale(0, 255, numColors)
            break
        default:
            return []
    }

    if (golden) {
        palette = palette.map(color => getGoldenColor(color))
    }

    if (beautify) {
        palette = beautifyPalette(palette)
    }

    if (grey) {
        if (palette.length < numColors) {
            const numGreyscaleColors = numColors - colors.length
            const start = 0
            const end = numGreyscaleColors - 1
            const steps = numGreyscaleColors
            const greyscaleColors = generateGreyscale(start, end, steps)
            palette = palette.concat(greyscaleColors)
        }
    }

    return palette
}

export {
    blinder,
    chroma,
    sanitizeInput,
    generatePaletteFromBrewer,
    adjustForColorBlindness,
    simulateColorBlindness,
    beautifyPalette,
    getGoldenColor,
    generateGreyscale,
    generateHues,
    generateHuesFromColor,
    generateComplementaries,
    generatePaletteFromColor
}

export default palex
