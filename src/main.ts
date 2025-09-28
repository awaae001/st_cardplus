import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './css/dark.css'
import './style.css'
import './styles/mobile.css'
import { autoDetectAndPromptMigration } from './utils/migrationDetector'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(pinia)
app.use(router)
app.mount('#app')

// 应用启动后自动检测是否需要数据库迁移
router.isReady().then(() => {
  autoDetectAndPromptMigration(router)
})
