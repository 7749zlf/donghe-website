// 滚动视差效果管理
// ==========================================

import { onMounted, onUnmounted } from 'vue'

export function useScrollParallax() {
  let rafId = null
  const elements = new Map()

  // 添加视差元素
  function addElement(selector, speed = 0.5, axis = 'y') {
    const els = document.querySelectorAll(selector)
    els.forEach((el) => {
      if (!elements.has(el)) {
        elements.set(el, {
          speed,
          axis,
          initialY: el.offsetTop,
          initialX: el.offsetLeft
        })
      }
    })
  }

  // 移除视差元素
  function removeElement(selector) {
    const els = document.querySelectorAll(selector)
    els.forEach((el) => {
      elements.delete(el)
    })
  }

  // 更新视差
  function updateParallax() {
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    elements.forEach((config, el) => {
      let transform = ''

      if (config.axis === 'y' || config.axis === 'both') {
        const offset = scrollY * config.speed
        transform += `translateY(${offset}px)`
      }

      if (config.axis === 'x' || config.axis === 'both') {
        const offset = scrollX * config.speed
        transform += ` translateX(${offset}px)`
      }

      el.style.transform = transform
    })
  }

  // 启动监听
  function start() {
    function loop() {
      updateParallax()
      rafId = requestAnimationFrame(loop)
    }
    loop()
  }

  // 停止监听
  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    addElement,
    removeElement,
    updateParallax
  }
}
