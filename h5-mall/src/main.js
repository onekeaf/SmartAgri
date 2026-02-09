import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vant/lib/index.css'
import './assets/styles/global.scss'

const app = createApp(App)
app.use(router)
app.mount('#app')
