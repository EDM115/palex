import blinder from 'color-blind'
import chroma from 'chroma-js'

/*
sources :
- https://loading.io/color/feature/
- https://github.com/Fooidge/PleaseJS?tab=readme-ov-file#make_color-options
- https://gka.github.io/palettes/#/10|d|00429d,96ffea,ffffe0|ffffe0,ff005e,93003a|1|1
- https://gka.github.io/chroma.js/
*/

function sanitizeInput(input, mode = 'chroma') {
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

function adjustForColorBlindness(colorHex) {
    let color = chroma(colorHex)
    // Example adjustment: shift hue and reduce saturation
    color = color.set('hsl.h', '+20').desaturate(0.5)
    return color.hex()
}

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

function generateHuesFromColor2(colorHex, numColors = 10) {
    const baseColor = chroma(colorHex)
    const colors = [baseColor.hex()]
    for (let i = 1; i < numColors; i++) {
        const color = baseColor.set('hsl.l', '*' + (1 + i / numColors)).saturate(1)
        colors.push(color.hex())
    }
  
    return colors
}

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

export {
    blinder,
    chroma,
    sanitizeInput,
    generatePaletteFromBrewer
}
