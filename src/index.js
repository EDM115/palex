import blinder from 'color-blind'
import chroma from 'chroma-js'

/*
sources :
- https://loading.io/color/feature/
- https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options
- https://gka.github.io/palettes/#/10|d|00429d,96ffea,ffffe0|ffffe0,ff005e,93003a|1|1
- https://gka.github.io/chroma.js/
*/

function sanitizeInput(input, mode = 'hex') {
    // The input can be several things, so we need to sanitize it
    // Case 1 : A palette string. ex : 'Set3'
    // Case 2 : A color string. ex : '#FF0000', 'rgb(255,0,0)', 'red', 'FF0', '#F00', ...
    // Case 3 : A colors string. ex : 'fff, 000', '#F00, rgb(0,255,0), blue, #00F', ...
    // Case 4 : An array containing any of the above, can be mixed

    // Case 1
    if (typeof input === 'string' && input in chroma.brewer) {
        return input
    }
    // Case 2
    if (typeof input === 'string' && chroma.valid(input)) {
        return mode === 'chroma' ? chroma(input) : chroma(input).hex()
    }
    // Case 3
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
    // Case 4
    if (Array.isArray(input)) {
        const flatArray = [];
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

function generatePaletteFromBrewer(input, numColors) {
    if (numColors < 1) return []
    const brewer = sanitizeInput(input)
    if (brewer.length === 0) return []
    return chroma.scale(brewer).mode('lch').colors(numColors)
}

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

function beautifyPalette(colors) {
    const bezier = chroma.bezier(colors)
    const bezierColors = bezier.scale().correctLightness().colors(colors.length)

    return bezierColors
}

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
        greyscale.push(chroma(`rgb(${lightness},${lightness},${lightness})`).hex())
    }
    return greyscale
}

function generateDynamicPalette(baseColors, paletteType, size) {
    let colors = []
    if (paletteType === 'hues') {
        const hues = []
        const length = Math.floor(size / baseColors.length)
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
        const length = Math.floor(size / baseColors.length)
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

function generateHuesFromColor(colorHex, numColors = 10) {
    const baseColor = chroma(colorHex)
    let colors = [baseColor.hex()]
    for (let i = 1; i < numColors; i++) {
        const color = baseColor.set('hsl.l', '*' + (1 + i / numColors)).saturate(1)
        colors.push(color.hex())
    }

    return colors
}

function generatePaletteFromColor(colorHex, numColors = 10) {
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

    return colors
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
    generateGreyscale
}
