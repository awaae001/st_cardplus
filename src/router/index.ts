import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  //设置URL为history模式
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
      meta: { title: '主页' }
    },
    {
      path: '/card',
      name: 'card',
      component: () => import('../pages/CardPage.vue'),
      meta: { title: '角色卡' }
    },
    {
      path: '/world',
      name: 'world',
      component: () => import('../pages/WorldPage.vue'),
      meta: { title: '世界设定' }
    },
    {
      path:'/cardoutput',
      name:'cardoutput',
      component: () => import('../pages/CardOutput.vue'),
      meta: { title: '角色卡导出' }
    },
    {
      path:'/worldbook',
      name:'worldbook',
      component: () => import('../pages/WorldBook.vue'),
      meta: { title: '世界书' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/About.vue'),
      meta: { title: '关于' }
    },
    {
      path: '/toolbox',
      name: 'toolbox',
      component: () => import('../pages/ToolboxPage.vue'),
      meta: { title: '工具箱' }
    },
    {
      path: '/toolbox/json-formatter',
      name: 'jsonFormatter',
      component: () => import('../components/toolsbox/JsonFormatter.vue'),
      meta: { title: 'JSON 格式化' }
    },
    {
      path: '/toolbox/separator',
      name: 'separator',
      component: () => import('../components/toolsbox/separator.vue'),
      meta: { title: '分隔符工具' }
    },
    {
      path: '/toolbox/worldbook-converter',
      name: 'worldbookConverter',
      component: () => import('../components/toolsbox/WorldBookConverterTool.vue'),
      meta: { title: '世界书转换器' }
    },
    {
      path: '/toolbox/png-metadata',
      name: 'pngMetadata',
      component: () => import('../components/toolsbox/PngMetadataTool.vue'),
      meta: { title: 'PNG 元数据工具' }
    },
    {
      path: '/regex-editor',
      name: 'regexEditor',
      component: () => import('../pages/RegexEditorPage.vue'),
      meta: { title: '正则表达式编辑器' }
    },
    {
      path: '/ejs-editor',
      name: 'ejsEditor',
      component: () => import('../pages/EjsEditorPage.vue'),
      meta: { title: 'EJS 编辑器' }
    }
  ]
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `酒馆角色卡工具箱 · ${to.meta.title}`
  } else {
    document.title = '酒馆角色卡工具箱'
  }
})
// router.beforeEach((to, from, next) => {
//   if (from.name) { // 如果不是首次加载
//     const confirmLeave = window.confirm('确定离开？离开后数据清空')
//     if (!confirmLeave) {
//       return false
//     }
//   }
//   next()
// })

export default router
