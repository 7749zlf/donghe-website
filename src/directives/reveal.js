const revealOptions = {
  threshold: 0.16,
  rootMargin: '0px 0px -8% 0px'
}

let revealObserver = null

/**
 * 获取共享的元素入场观察器；浏览器不支持时返回 null。
 * @returns {IntersectionObserver|null} 可复用的观察器实例。
 */
function getObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      })
    }, revealOptions)
  }

  return revealObserver
}

/**
 * 将指令绑定值统一转换为入场动画配置对象。
 * @param {string|Object|undefined} value 指令绑定值。
 * @returns {Object} 标准化后的动画配置。
 */
function resolveRevealConfig(value) {
  if (typeof value === 'string') {
    return { variant: value }
  }

  if (value && typeof value === 'object') {
    return value
  }

  return {}
}

export default {
  /**
   * 初始化元素入场样式并注册可见性观察。
   * @param {HTMLElement} el 指令绑定元素。
   * @param {Object} binding Vue 指令绑定信息。
   * @returns {void}
   */
  mounted(el, binding) {
    const config = resolveRevealConfig(binding.value)
    const delay = Number(config.delay || 0)
    const variant = config.variant || binding.arg || 'up'

    el.classList.add('reveal-item', `reveal-${variant}`)
    el.style.setProperty('--reveal-delay', `${Math.max(0, delay)}ms`)

    const observer = getObserver()
    if (observer) {
      observer.observe(el)
      return
    }

    el.classList.add('is-visible')
  },

  /**
   * 元素卸载时停止观察，释放观察器引用。
   * @param {HTMLElement} el 指令绑定元素。
   * @returns {void}
   */
  unmounted(el) {
    getObserver()?.unobserve(el)
  }
}
