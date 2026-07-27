<template>
  <div id="app" @pointermove="handlePointerMove">
    <div class="site-atmosphere" aria-hidden="true"></div>
    <StickyNavbar />
    <router-view />
  </div>
</template>

<script>
import StickyNavbar from './components/StickyNavbar.vue'

export default {
  name: 'App',
  components: {
    StickyNavbar
  },
  data() {
    return {
      pendingPointer: null,
      pointerFrame: null
    }
  },
  methods: {
    handlePointerMove(event) {
      if (event.pointerType === 'touch') {
        return
      }

      this.pendingPointer = {
        x: `${Math.round((event.clientX / Math.max(window.innerWidth, 1)) * 100)}%`,
        y: `${Math.round((event.clientY / Math.max(window.innerHeight, 1)) * 100)}%`
      }

      if (this.pointerFrame) {
        return
      }

      this.pointerFrame = requestAnimationFrame(() => {
        if (this.pendingPointer) {
          document.documentElement.style.setProperty('--pointer-x', this.pendingPointer.x)
          document.documentElement.style.setProperty('--pointer-y', this.pendingPointer.y)
        }

        this.pointerFrame = null
      })
    }
  },
  beforeUnmount() {
    if (this.pointerFrame) {
      cancelAnimationFrame(this.pointerFrame)
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  position: relative;
  background: var(--color-paper);
  min-height: 100%;
  isolation: isolate;
  overflow-x: hidden;
}

#app > :not(.site-atmosphere) {
  position: relative;
  z-index: 1;
}

.site-atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(255, 255, 255, 0.5), transparent 18%),
    radial-gradient(circle at calc(var(--pointer-x) + 18%) calc(var(--pointer-y) + 16%), rgba(169, 130, 71, 0.13), transparent 22%),
    linear-gradient(90deg, rgba(42, 39, 31, 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgba(42, 39, 31, 0.034) 1px, transparent 1px),
    linear-gradient(180deg, rgba(93, 101, 73, 0.06), transparent 34%, rgba(154, 95, 71, 0.045) 78%, transparent),
    var(--color-paper);
  background-size: 100% 100%, 100% 100%, 96px 96px, 96px 96px, 100% 100%, 100% 100%;
}

.site-atmosphere::before,
.site-atmosphere::after {
  content: '';
  position: absolute;
  inset: 0;
}

.site-atmosphere::before {
  opacity: 0.42;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.12) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(90deg, rgba(42, 39, 31, 0.018) 0 1px, transparent 1px 11px),
    linear-gradient(128deg, transparent 0 34%, rgba(93, 101, 73, 0.08) 44%, transparent 56% 100%);
  mix-blend-mode: multiply;
  animation: atmosphereTexture 16s ease-in-out infinite alternate;
}

.site-atmosphere::after {
  width: 150%;
  left: -25%;
  opacity: 0.56;
  background: linear-gradient(112deg, transparent 0 33%, rgba(255, 255, 255, 0.3) 43%, rgba(169, 130, 71, 0.12) 51%, transparent 64% 100%);
  transform: translate3d(-8%, 0, 0);
  animation: atmosphereDrift 14s var(--ease-smooth) infinite alternate;
}

:global(:root) {
  --pointer-x: 50%;
  --pointer-y: 34%;
  --nav-height: 73px;
  --color-ink: #171714;
  --color-ink-soft: #3f4239;
  --color-muted: #78766c;
  --color-paper: #f5f1e8;
  --color-porcelain: #f8f7f2;
  --color-warm: #ede6d8;
  --color-stone: #d5d0c3;
  --color-sage: #dfe5d9;
  --color-ash: #e7e9e4;
  --color-graphite: #20231f;
  --color-line: rgba(42, 39, 31, 0.16);
  --color-olive: #5d6549;
  --color-brass: #a98247;
  --color-clay: #9a5f47;
  --color-rust: #7c4f3f;
  --shadow-soft: 0 26px 80px rgba(30, 27, 20, 0.12);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --text-primary: var(--color-ink);
  --text-secondary: var(--color-ink-soft);
  --text-muted: var(--color-muted);
  --border: var(--color-line);
  --border-light: rgba(42, 39, 31, 0.08);
  --bg-light: var(--color-warm);
  --bg-footer: #171714;
  --radius-lg: 8px;
  --radius-sm: 4px;
}

:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  scroll-behavior: smooth;
}

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  color: var(--color-ink);
  background: var(--color-paper);
  font-family: 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:global(button),
:global(input),
:global(textarea),
:global(select) {
  font: inherit;
}

:global(button) {
  -webkit-tap-highlight-color: transparent;
}

:global(img) {
  max-width: 100%;
}

:global(.page > section) {
  position: relative;
  isolation: isolate;
}

:global(.page > section:not(.hero)::before) {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  z-index: 0;
  height: 92px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
  mix-blend-mode: soft-light;
}

:global(.page > section:not(.hero) > *) {
  position: relative;
  z-index: 1;
}

:global(.dh-action) {
  --dh-action-fg: var(--color-ink);
  --dh-action-bg: transparent;
  --dh-action-hover-bg: var(--color-ink);
  --dh-action-hover-fg: #fff;
  position: relative;
  min-height: 46px;
  display: inline-flex;
  align-items: stretch;
  border: 1px solid currentColor;
  background: var(--dh-action-bg);
  color: var(--dh-action-fg);
  padding: 0;
  cursor: pointer;
  text-decoration: none;
  border-radius: 4px;
  overflow: hidden;
  isolation: isolate;
  transition:
    background 0.32s var(--ease-smooth),
    color 0.32s var(--ease-smooth),
    border-color 0.32s var(--ease-smooth),
    transform 0.32s var(--ease-smooth);
}

:global(.dh-action::before) {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.26) 44%, transparent 62%);
  transform: translateX(-130%);
  transition: transform 0.72s var(--ease-smooth);
}

:global(.dh-action:hover),
:global(.dh-action:focus-visible) {
  background: var(--dh-action-hover-bg);
  color: var(--dh-action-hover-fg);
  transform: translateY(-2px);
}

:global(.dh-action:hover::before),
:global(.dh-action:focus-visible::before) {
  transform: translateX(130%);
}

:global(.dh-action__label) {
  display: inline-flex;
  align-items: center;
  padding: 0 18px;
  font-size: 14px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

:global(.dh-action__mark) {
  width: 46px;
  min-height: 44px;
  display: inline-grid;
  place-items: center;
  border-left: 1px solid currentColor;
  font-size: 18px;
  line-height: 1;
  transition: transform 0.32s var(--ease-smooth);
}

:global(.dh-action:hover .dh-action__mark),
:global(.dh-action:focus-visible .dh-action__mark) {
  transform: translateX(2px);
}

:global(.dh-action--light) {
  --dh-action-fg: #fff;
  --dh-action-hover-bg: #fff;
  --dh-action-hover-fg: var(--color-ink);
}

:global(.dh-action--solid) {
  --dh-action-bg: var(--color-ink);
  --dh-action-fg: #fff;
  --dh-action-hover-bg: transparent;
  --dh-action-hover-fg: var(--color-ink);
}

:global(.dh-action--glass) {
  --dh-action-fg: #fff;
  --dh-action-bg: rgba(255, 255, 255, 0.12);
  --dh-action-hover-bg: rgba(255, 255, 255, 0.92);
  --dh-action-hover-fg: var(--color-ink);
  border-color: rgba(255, 255, 255, 0.46);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 18px 42px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(18px);
}

:global(.reveal-item) {
  opacity: 0;
  filter: blur(7px);
  transform: translate3d(0, 28px, 0);
  transition:
    opacity 0.76s ease,
    filter 0.76s ease,
    transform 0.76s var(--ease-smooth);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, filter, transform;
}

:global(.reveal-left) {
  transform: translate3d(-28px, 0, 0);
}

:global(.reveal-right) {
  transform: translate3d(28px, 0, 0);
}

:global(.reveal-scale) {
  transform: translate3d(0, 18px, 0) scale(0.97);
}

:global(.reveal-item.is-visible) {
  opacity: 1;
  filter: blur(0);
  transform: translate3d(0, 0, 0) scale(1);
}

@keyframes atmosphereDrift {
  0% {
    opacity: 0.24;
    transform: translate3d(-10%, 0, 0);
  }

  100% {
    opacity: 0.44;
    transform: translate3d(8%, 0, 0);
  }
}

@keyframes atmosphereTexture {
  0% {
    background-position: 0 0, 0 0, -8vw 0;
  }

  100% {
    background-position: 0 12px, 10px 0, 8vw 0;
  }
}

@media (max-width: 768px) {
  :global(:root) {
    --nav-height: 60px;
  }

  .site-atmosphere {
    background-size: 100% 100%, 100% 100%, 118px 118px, 118px 118px, 100% 100%, 100% 100%;
  }

  .site-atmosphere::before {
    opacity: 0.24;
  }

  .site-atmosphere::after {
    opacity: 0.2;
    animation-duration: 24s;
  }

  :global(.reveal-item) {
    filter: none;
    transform: translate3d(0, 18px, 0);
    transition-duration: 0.52s;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(html),
  :global(body) {
    scroll-behavior: auto;
  }

  :global(*),
  :global(*::before),
  :global(*::after) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  :global(.reveal-item) {
    opacity: 1;
    filter: none;
    transform: none;
  }

  .site-atmosphere::after {
    animation: none;
  }
}
</style>
