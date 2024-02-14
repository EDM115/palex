import commonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    plugins: [
        vue(),
        commonjs({
            include: [
                'node_modules/chroma-js/chroma.js',
                'node_modules/color-blind/lib/color-blind.js'
            ]
        })
    ],
    server: {
        port: 3000,
        hmr: {
            port: 3000,
            protocol: 'ws'
        },
        publicPath: '/'
    },
    build: {
        commonjsOptions: {
            include: [/chroma-js/, /color-blind/]
        }
    }
})
