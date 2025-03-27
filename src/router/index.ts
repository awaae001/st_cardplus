import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  //设置URL为history模式
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
      component: () => import('../pages/WorldBook.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/About.vue')
    }
  ]
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
