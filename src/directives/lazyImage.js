const observerOptions = {
  rootMargin: '360px 0px',
  threshold: 0.01
}

let imageObserver = null

/**
 * 将指令值转换为可加载的图片地址。
 * @param {*} value 指令绑定值。
 * @returns {string} 清洗后的图片地址。
 */
function normalizeSource(value) {
  return String(value || '').trim()
}

/**
 * 将延迟保存的真实地址写入图片元素，开始网络请求。
 * @param {HTMLImageElement} element 图片元素。
 * @returns {void}
 */
function loadImage(element) {
  const source = element.dataset.lazySrc

  if (!source) {
    element.classList.add('is-error')
    return
  }

  if (element.getAttribute('src') !== source) {
    element.setAttribute('src', source)
  }
}

/**
 * 获取所有懒加载图片共享的可见性观察器。
 * @returns {IntersectionObserver|null} 浏览器观察器或不支持标记。
 */
function getImageObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  if (!imageObserver) {
    imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        loadImage(entry.target)
        imageObserver.unobserve(entry.target)
      })
    }, observerOptions)
  }

  return imageObserver
}

/**
 * 观察图片位置；不支持 IntersectionObserver 时立即加载。
 * @param {HTMLImageElement} element 图片元素。
 * @returns {void}
 */
function observeImage(element) {
  const observer = getImageObserver()

  if (observer) {
    observer.observe(element)
    return
  }

  loadImage(element)
}

/**
 * 标记图片加载完成，触发展示淡入效果。
 * @param {Event} event 图片 load 事件。
 * @returns {void}
 */
function handleLoad(event) {
  event.currentTarget.classList.add('is-loaded')
  event.currentTarget.classList.remove('is-error')
}

/**
 * 标记图片加载失败，保留稳定的占位背景。
 * @param {Event} event 图片 error 事件。
 * @returns {void}
 */
function handleError(event) {
  event.currentTarget.classList.add('is-error')
}

export default {
  /**
   * 元素插入 DOM 前保存真实地址，避免浏览器提前请求图片。
   * @param {HTMLImageElement} element 图片元素。
   * @param {Object} binding Vue 指令绑定信息。
   * @returns {void}
   */
  beforeMount(element, binding) {
    element.dataset.lazySrc = normalizeSource(binding.value)
    element.removeAttribute('src')
    element.setAttribute('loading', 'lazy')
    element.setAttribute('decoding', 'async')
    element.classList.add('lazy-image')
  },

  /**
   * 注册图片状态监听并开始观察元素位置。
   * @param {HTMLImageElement} element 图片元素。
   * @returns {void}
   */
  mounted(element) {
    element.addEventListener('load', handleLoad)
    element.addEventListener('error', handleError)
    observeImage(element)
  },

  /**
   * 图片地址变化时重置状态并重新进入懒加载流程。
   * @param {HTMLImageElement} element 图片元素。
   * @param {Object} binding Vue 指令绑定信息。
   * @returns {void}
   */
  updated(element, binding) {
    const source = normalizeSource(binding.value)

    if (source === element.dataset.lazySrc) {
      return
    }

    getImageObserver()?.unobserve(element)
    element.dataset.lazySrc = source
    element.removeAttribute('src')
    element.classList.remove('is-loaded', 'is-error')
    observeImage(element)
  },

  /**
   * 元素卸载时移除观察和事件监听，避免残留引用。
   * @param {HTMLImageElement} element 图片元素。
   * @returns {void}
   */
  unmounted(element) {
    getImageObserver()?.unobserve(element)
    element.removeEventListener('load', handleLoad)
    element.removeEventListener('error', handleError)
  }
}
