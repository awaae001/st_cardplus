import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue')
    },
    {
      path: '/card',
      name: 'card',
      component: () => import('../pages/CardPage.vue')
    },
    {
      path: '/world',
      name: 'world',
      component: () => import('../pages/WorldPage.vue')
    },
    {
      path:'/cardoutput',
      name:'cardoutput',
      component: () => import('../pages/CardOutput.vue')
    },
    {
      path:'/worldbook',
      name:'worldbook',
      component: () => import('../pages/WorldBook.vue') // 假设这个是你的世界书编辑器
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/About.vue')
    },
    {
      path: '/toolbox',
      name: 'toolbox',
      component: () => import('../pages/ToolboxPage.vue')
    },
    {
      path: '/toolbox/json-formatter',
      name: 'jsonFormatter',
      component: () => import('../components/toolsbox/JsonFormatter.vue')
    },
    {
      path: '/toolbox/separator',
      name: 'separator',
      component: () => import('../components/toolsbox/separator.vue') // 注意这里文件名是小写 separator.vue
    },
    {
      path: '/toolbox/regex-editor',
      name: 'regexEditor',
      component: () => import('../components/toolsbox/RegexEditorPage.vue')
    }
  ]
})

export default router