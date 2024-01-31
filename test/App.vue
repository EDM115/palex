<template>
    <div id="color">
        <div class="palette" v-for="(palette, index) in palettes" :key="index">
            <div class="palette-title">{{ palette.title }}</div>
            <div class="palette-colors">
                <div class="palette-color" v-for="color in palette.colors" :key="color" :style="{ backgroundColor: color }">
                </div>
            </div>
        </div>
        <div class="palette" v-for="(palette, index) in vuetifyColors" :key="index">
            <br>
            <div class="palette-title">{{ vuetifyColorsKeys[index] }}</div>
            <div class="palette-colors">
                <div class="palette-color" :key=palette :style="{ backgroundColor: palette }"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { generatePalette, generatePaletteFromColor, generateHuesFromColor, simulateColorBlindness, beautifyPalette, getGoldenColor } from '../src/index'
import { onMounted, ref } from 'vue'

export default {
    setup() {
        const primaryColor = '#FFB86C'
        const secondaryColor = '#F1FA8C'
        const accentColor = '#BD93F9'
        const palettes = ref([])

        onMounted(() => {
            palettes.value = [
                { title: 'Qualitative', colors: generatePalette('Qualitative', 10) },
                { title: 'Beautify Palette', colors: beautifyPalette(generatePalette('Qualitative', 10)) },
                { title: 'Divergente', colors: generatePalette('Divergente', 10) },
                { title: 'Sequentielle', colors: generatePalette('Sequentielle', 10) },
                { title: 'Default', colors: generatePalette() },
                { title: 'Hues From Color', colors: generateHuesFromColor(primaryColor) },
                { title: 'Hues From Color (CBF)', colors: generateHuesFromColor(primaryColor, true) },
                { title: 'Color Blindness (primary color)', colors: simulateColorBlindness(primaryColor) },
                { title: 'Palette from Primary color', colors: generatePaletteFromColor(primaryColor) },
                { title: 'Beautify Palette From Color', colors: beautifyPalette(generatePaletteFromColor(primaryColor)) },
                { title: 'Palette from Secondary color', colors: generatePaletteFromColor(primaryColor) },
                { title: 'Beautify Palette From Color', colors: beautifyPalette(generatePaletteFromColor(secondaryColor)) },
                { title: 'Palette from Accent color', colors: generatePaletteFromColor(accentColor) },
                { title: 'Beautify Palette From Color', colors: beautifyPalette(generatePaletteFromColor(accentColor)) },
                { title: 'Golden Color', colors: [getGoldenColor(primaryColor), getGoldenColor(primaryColor), getGoldenColor(accentColor)] },
                { title: 'Goldenify the palette from primary', colors: generatePaletteFromColor(primaryColor).map(color => getGoldenColor(color)) },
                { title: 'Goldenify the palette from secondary', colors: generatePaletteFromColor(secondaryColor).map(color => getGoldenColor(color)) },
                { title: 'Goldenify the palette from accent', colors: generatePaletteFromColor(accentColor).map(color => getGoldenColor(color)) }
            ]
        })

        return {
            palettes
        }
    }
}
</script>

<style lang="css">
#color {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    padding: 1rem;
    max-height: 100vh;
    overflow-y: auto;
    background: #282A36;
}

.palette-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    width: 100%;
    text-align: center;
    color: #F8F8F2;
}

.palette-colors {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}

.palette-color {
    width: 3rem;
    height: 3rem;
    margin: 0.5rem;
    border-radius: 50%;
}
</style>