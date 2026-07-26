// 滚动观察器 - 监听元素进入视口
// ==========================================

class ScrollObserver {
  constructor(threshold = 0.1) {
    this.threshold = threshold
    this.observer = null
    this.init()
  }

  init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 添加显示类
            entry.target.classList.add('in-view')
            // 移除观察
            this.observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: this.threshold,
        rootMargin: '0px 0px -100px 0px' // 提前100px触发
      }
    )
  }

  observe(elements) {
    if (typeof elements === 'string') {
      elements = document.querySelectorAll(elements)
    } else if (elements instanceof HTMLElement) {
      elements = [elements]
    }

    elements.forEach((element) => {
      this.observer.observe(element)
    })
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Parallax 效果
class ParallaxEffect {
  constructor() {
    this.elements = []
    this.rafId = null
    this.init()
  }

  init() {
    document.addEventListener('scroll', () => this.update(), { passive: true })
  }

  addElement(selector, speed = 0.5) {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      this.elements.push({
        element: el,
        speed: speed,
        initialY: el.offsetTop
      })
    })
  }

  update() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }

    this.rafId = requestAnimationFrame(() => {
      const scrollY = window.scrollY

      this.elements.forEach(({ element, speed }) => {
        const yPos = scrollY * speed
        element.style.transform = `translateY(${yPos}px)`
      })
    })
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScrollObserver, ParallaxEffect }
}
