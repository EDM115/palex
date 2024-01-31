import commonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
    base: '/',
    plugins: [
        vue(),
            process.env.ANALYZE && visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap'
        }),
        commonjs({
            include: ['node_modules/chroma-js/chroma.js']
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
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
            include: [/chroma-js/]
        }
    }
})
