import { createApp, defineAsyncComponent } from 'vue'

const asyncApp = defineAsyncComponent(() => import('./App.vue'))
const app = createApp(asyncApp)

app.mount('#app')
