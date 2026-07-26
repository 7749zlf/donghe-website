// 移动端优化
// ==========================================

import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(false)
const isTablet = ref(false)
const deviceWidth = ref(0)
const deviceHeight = ref(0)

export function useMobileOptimize() {
  // 检测设备类型
  function detectDevice() {
    deviceWidth.value = window.innerWidth
    deviceHeight.value = window.innerHeight

    isMobile.value = deviceWidth.value < 768
    isTablet.value = deviceWidth.value >= 768 && deviceWidth.value < 1024
  }

  // 获取视口信息
  function getViewportInfo() {
    return {
      width: deviceWidth.value,
      height: deviceHeight.value,
      isMobile: isMobile.value,
      isTablet: isTablet.value,
      isDesktop: !isMobile.value && !isTablet.value
    }
  }

  // 防止过度滚动（iOS）
  function disableOverscroll() {
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.scrollable')) return
      e.preventDefault()
    }, { passive: false })
  }

  // 禁用长按菜单
  function disableLongPress() {
    document.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('input, textarea')) {
        e.preventDefault()
      }
    })
  }

  // 优化触摸反馈
  function optimizeTouchFeedback() {
    const style = document.createElement('style')
    style.textContent = `
      @media (hover: none) and (pointer: coarse) {
        button:active,
        a:active,
        .clickable:active {
          opacity: 0.7 !important;
          transform: scale(0.98) !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  // 监听窗口变化
  function watchResize() {
    window.addEventListener('resize', detectDevice)
    window.addEventListener('orientationchange', detectDevice)
  }

  onMounted(() => {
    detectDevice()
    watchResize()
    optimizeTouchFeedback()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', detectDevice)
    window.removeEventListener('orientationchange', detectDevice)
  })

  return {
    isMobile,
    isTablet,
    deviceWidth,
    deviceHeight,
    getViewportInfo,
    disableOverscroll,
    disableLongPress
  }
}
