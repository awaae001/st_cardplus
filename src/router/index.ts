import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import CardPage from '../pages/CardPage.vue'
import WorldPage from '../pages/WorldPage.vue'
import CardOutput from '../pages/CardOutput.vue'

const router = createRouter({
  //设置URL为history模式
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/card',
      name: 'card',
      component: CardPage
    },
    {
      path: '/world',
      name: 'world',
      component: WorldPage
    },
    {
      path:'/cardoutput',
      name:'cardoutput',
      component:CardOutput
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
