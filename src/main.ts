import { createApp } from 'vue'

// 核心样式和组件库样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // Element Plus 基础样式
import 'element-plus/theme-chalk/dark/css-vars.css' // Element Plus 暗黑主题 CSS 变量

// 你的应用主 CSS 文件，包含 Tailwind CSS 导入
import './style.css'; // <--- 这个导入是正确的！

// 应用逻辑
import App from './App.vue'
import router from './router'

// 其他自定义样式 (如果 dark.css 依赖 Tailwind，它应该在 './style.css' 之后)
// import './css/dark.css' // <--- 你有这个文件吗？如果它只是以前的残留，现在可能不需要了

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')