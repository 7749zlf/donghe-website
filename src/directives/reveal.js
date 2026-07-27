const revealOptions = {
  threshold: 0.16,
  rootMargin: '0px 0px -8% 0px'
}

let revealObserver = null

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

  unmounted(el) {
    getObserver()?.unobserve(el)
  }
}
