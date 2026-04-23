import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './Home.vue'
import ViewMore from './components/ViewMore.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/view-more',
    name: 'ViewMore',
    component: ViewMore
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router