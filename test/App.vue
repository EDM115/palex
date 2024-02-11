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
import { generatePaletteFromBrewer } from '../src/index'
import { onMounted, ref } from 'vue'

export default {
    setup() {
        const palettes = ref([])

        onMounted(() => {
            palettes.value = [
                { title: 'Set1, 10', colors: generatePaletteFromBrewer('Set1', 10) }
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