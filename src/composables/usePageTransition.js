// 页面过渡和加载管理
// ==========================================

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isLoading = ref(false)
const loadingProgress = ref(0)

export function usePageTransition() {
  const router = useRouter()

  // 启动加载
  function startLoading() {
    isLoading.value = true
    loadingProgress.value = 0
    simulateProgress()
  }

  // 完成加载
  function finishLoading() {
    loadingProgress.value = 100
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }

  // 模拟进度条
  function simulateProgress() {
    const interval = setInterval(() => {
      if (loadingProgress.value >= 90) {
        clearInterval(interval)
        return
      }
      loadingProgress.value += Math.random() * 40
    }, 200)
  }

  // 初始化路由监听
  function initRouterHooks() {
    router.beforeEach((to, from, next) => {
      startLoading()
      next()
    })

    router.afterEach(() => {
      finishLoading()
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return {
    isLoading,
    loadingProgress,
    initRouterHooks,
    startLoading,
    finishLoading
  }
}
