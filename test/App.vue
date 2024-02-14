<template>
    <div id="color">
        <div class="palette" v-for="(palette, index) in palettes" :key="index">
            <div class="palette-title">{{ palette.title }}</div>
            <div class="palette-colors">
                <div class="palette-color" v-for="color in palette.colors" :key="color" :style="{ backgroundColor: color }">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    generatePaletteFromBrewer,
    generateHuesFromColor,
    generateComplementaries,
    generatePaletteFromColor,
    generateGreyscale,
    adjustForColorBlindness,
    getGoldenColor,
    simulateColorBlindness
} from '../src/index'
import { onMounted, ref } from 'vue'

export default {
    name: 'Showcase',
    setup() {
        const palettes = ref([])

        onMounted(() => {
            palettes.value = [
                { title: 'Brewer Palette - Set2', colors: generatePaletteFromBrewer('Set2', 10) },
                { title: 'Brewer Palette - Accent', colors: generatePaletteFromBrewer('Accent', 10) },
                { title: 'Hues from #f55', colors: generateHuesFromColor(['#f55'], 10) },
                { title: 'Complementary Colors of #50FA7B', colors: generateComplementaries(['#50FA7B'], 10) },
                { title: 'Palette from Color #BD93F9', colors: generatePaletteFromColor('#BD93F9', 10) },
                { title: 'Colorblind vision of #BD93F9', colors: simulateColorBlindness('#BD93F9') },
                { title: 'Adjusted for Color Blindness : Palette from Color #BD93F9', colors: adjustForColorBlindness(generatePaletteFromColor('#BD93F9', 10)) },
                { title: 'Greyscale (10 shades)', colors: generateGreyscale(0, 9, 9) },
                { title: 'Golden colors from Set2', colors: generatePaletteFromBrewer('Set2', 10).map(color => getGoldenColor(color)) }
            ]
        })

        return {
            palettes
        }
    }
}
</script>

<style lang="css">
body {
    background: #282A36;
    margin: 1rem;
}

#color {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    max-height: 100vh;
}

.palette-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem;
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
    margin: 0rem 0.5rem 1rem 0.5rem;
    border-radius: 50%;
}
</style>