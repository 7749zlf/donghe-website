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
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 页面过渡动画配置
router.beforeEach((to, from, next) => {
  // 可以在这里添加页面加载动画
  next()
})

export default router
