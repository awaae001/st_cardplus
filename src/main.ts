// src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // 引入持久化插件

// 核心样式和组件库样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // Element Plus 基础样式
import 'element-plus/theme-chalk/dark/css-vars.css' // Element Plus 暗黑主题 CSS 变量

// 你的应用主 CSS 文件，包含 Tailwind CSS 导入
import './style.css'; // 应用主样式入口 (包含 Tailwind)

// 应用逻辑
import App from './App.vue'
import router from './router' // 假设你仍然使用 Vue Router

// --- Pinia 设置 ---
// 1. 创建 Pinia 实例
const pinia = createPinia()
// 2. 让 Pinia 实例使用持久化插件
// 这会使得 Pinia store 中的状态默认持久化到 localStorage
pinia.use(piniaPluginPersistedstate)
// --- Pinia 设置结束 ---

// 3. 创建 Vue 应用实例
const app = createApp(App)

// 4. 注册插件 (确保在 app.mount() 之前调用)
//    Pinia 应该首先注册，因为它管理状态
app.use(pinia)
//    然后注册其他插件
app.use(ElementPlus)
app.use(router) // 注册 Router

// 5. 挂载 Vue 应用
app.mount('#app')