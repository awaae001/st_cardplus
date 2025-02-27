import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import CharacterCardEditor from '../components/CharacterCardEditor.vue'
import WorldEditor from '../components/WorldEditor.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/card',
      name: 'card',
      component: CharacterCardEditor
    },
    {
      path: '/world',
      name: 'world',
      component: WorldEditor
    }
  ]
})

export default router
