import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import CardPage from '../pages/CardPage.vue'
import WorldPage from '../pages/WorldPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
    }
  ]
})

export default router
