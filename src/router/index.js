import { createRouter, createWebHashHistory } from 'vue-router'

const routes = []
const modulesContext = require.context('./', true, /\/index\.js$/)

modulesContext.keys().forEach((key) => {
  if (key !== './index.js') {
    const module = modulesContext(key)
    const moduleRoutes = module.default || []
    if (Array.isArray(moduleRoutes)) {
      routes.push(...moduleRoutes)
    } else {
      routes.push(moduleRoutes)
    }
  }
})

routes.push({
  path: '/:pathMatch(.*)*',
  redirect: '/'
})

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

