import { createRouter, createWebHashHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import WelcomePage from '../components/WelcomePage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainPage
    },
    {
      path: '/welcome',
      name: 'welcome', 
      component: WelcomePage
    }
  ]
})

export default router
