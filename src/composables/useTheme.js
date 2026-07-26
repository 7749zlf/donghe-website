// 主题管理 composable
// ==========================================

import { ref, watch, onMounted } from 'vue'

const currentTheme = ref('light')

export function useTheme() {
  // 初始化主题
  function initTheme() {
    // 检查本地存储
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
      return
    }

    // 检查系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  // 设置主题
  function setTheme(theme) {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  // 切换主题
  function toggleTheme() {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // 监听系统主题变化
  function watchSystemTheme() {
    if (!window.matchMedia) return

    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    darkMode.addEventListener('change', (e) => {
      const stored = localStorage.getItem('theme')
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  onMounted(() => {
    initTheme()
    watchSystemTheme()
  })

  return {
    currentTheme,
    setTheme,
    toggleTheme
  }
}
