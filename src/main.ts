import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './css/dark.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')
