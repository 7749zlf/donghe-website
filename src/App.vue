<template>
  <div id="app" @pointermove="handlePointerMove">
    <div v-if="!$route.meta.hideNavigation" class="site-atmosphere" aria-hidden="true"></div>
    <Transition name="studio-intro">
      <section
        v-if="showIntro && !$route.meta.skipIntro"
        class="studio-intro"
        :class="{ 'is-leaving': introLeaving }"
        aria-label="东禾空间设计进场动画"
        @click="skipIntro"
      >
        <div class="intro-grid" aria-hidden="true"></div>
        <div class="intro-light" aria-hidden="true"></div>
        <div class="intro-mark">
          <span>东禾</span>
          <span>DH</span>
        </div>
        <div class="intro-copy">
          <span>LIGHT</span>
          <span>MATERIAL</span>
          <span>ORDER</span>
        </div>
        <button class="intro-skip" type="button" @click.stop="skipIntro">跳过</button>
      </section>
    </Transition>
    <StickyNavbar v-if="!$route.meta.hideNavigation" />
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
  /**
   * 创建应用级动画与指针状态。
   * @returns {Object} Vue 组件的响应式初始状态。
   */
  data() {
    return {
      pendingPointer: null,
      pointerFrame: null,
      showIntro: false,
      introLeaving: false,
      introTimers: []
    }
  },
  /**
   * 组件挂载后按当前会话状态启动进场动画。
   * @returns {void}
   */
  mounted() {
    this.startIntro()
  },
  methods: {
    /**
     * 创建受组件统一管理的进场动画计时器。
     * @param {Function} callback 计时结束后执行的回调。
     * @param {number} delay 延迟毫秒数。
     * @returns {number} 浏览器计时器标识。
     */
    setIntroTimer(callback, delay) {
      const timer = window.setTimeout(callback, delay)
      this.introTimers.push(timer)
      return timer
    },
    /**
     * 清除全部进场动画计时器，防止卸载后继续修改状态。
     * @returns {void}
     */
    clearIntroTimers() {
      this.introTimers.forEach((timer) => window.clearTimeout(timer))
      this.introTimers = []
    },
    /**
     * 检查当前浏览器会话是否已经播放过进场动画。
     * @returns {boolean} 已播放时返回 true。
     */
    wasIntroPlayed() {
      try {
        return window.sessionStorage.getItem('donghe-intro-played') === '1'
      } catch {
        return false
      }
    },
    /**
     * 将进场动画完成状态写入当前会话存储。
     * @returns {void}
     */
    markIntroPlayed() {
      try {
        window.sessionStorage.setItem('donghe-intro-played', '1')
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }
    },
    /**
     * 根据设备尺寸与减少动态效果偏好安排进场动画时序。
     * @returns {void}
     */
    startIntro() {
      if (this.$route.meta.skipIntro || this.wasIntroPlayed()) {
        return
      }

      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const isMobileIntro = window.matchMedia?.('(max-width: 768px)').matches
      const leaveDelay = isMobileIntro ? 1950 : 2750
      const finishDelay = isMobileIntro ? 2450 : 3350
      this.showIntro = true

      if (prefersReducedMotion) {
        this.setIntroTimer(() => this.skipIntro(), 320)
        return
      }

      this.setIntroTimer(() => {
        this.introLeaving = true
      }, leaveDelay)

      this.setIntroTimer(() => {
        this.finishIntro()
      }, finishDelay)
    },
    /**
     * 完成进场动画并清理所有相关状态和计时器。
     * @returns {void}
     */
    finishIntro() {
      this.markIntroPlayed()
      this.showIntro = false
      this.introLeaving = false
      this.clearIntroTimers()
    },
    /**
     * 提前结束正在播放的进场动画，并保留短暂退场过渡。
     * @returns {void}
     */
    skipIntro() {
      if (!this.showIntro) {
        return
      }

      this.clearIntroTimers()
      this.introLeaving = true
      this.setIntroTimer(() => {
        this.finishIntro()
      }, 220)
    },
    /**
     * 将鼠标位置节流写入全局 CSS 变量，驱动页面环境光效果。
     * @param {PointerEvent} event 指针移动事件。
     * @returns {void}
     */
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
  /**
   * 组件卸载前取消动画帧和计时器，避免残留异步任务。
   * @returns {void}
   */
  beforeUnmount() {
    if (this.pointerFrame) {
      cancelAnimationFrame(this.pointerFrame)
    }
    this.clearIntroTimers()
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

#app > :not(.site-atmosphere):not(.studio-intro) {
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

.studio-intro {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 68% 26%, rgba(169, 130, 71, 0.24), transparent 28%),
    linear-gradient(135deg, #171714 0%, #24241f 48%, #5d6549 100%);
  color: var(--color-porcelain);
  cursor: pointer;
}

.intro-grid,
.intro-light {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.intro-grid {
  opacity: 0.32;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 88px 88px;
  transform: scale(1.08);
  animation: introGridSettle 2.35s var(--ease-smooth) both;
}

.intro-light {
  width: 150%;
  left: -25%;
  background:
    linear-gradient(112deg, transparent 0 36%, rgba(255, 255, 255, 0.5) 46%, rgba(169, 130, 71, 0.32) 54%, transparent 66% 100%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18), transparent 28%);
  mix-blend-mode: screen;
  transform: translate3d(-36%, 0, 0);
  animation: introLightPass 2.7s var(--ease-smooth) both;
}

.intro-mark {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  text-align: center;
  transform: translateY(18px);
  animation: introMarkIn 1.35s var(--ease-smooth) 0.28s both;
}

.intro-mark span {
  font-size: clamp(58px, 11vw, 132px);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: 0.08em;
}

.intro-mark strong {
  color: rgba(248, 247, 242, 0.68);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.42em;
}

.intro-copy {
  position: absolute;
  left: 50%;
  bottom: clamp(54px, 8vw, 92px);
  z-index: 1;
  display: flex;
  gap: clamp(20px, 5vw, 68px);
  color: rgba(248, 247, 242, 0.62);
  font-size: 12px;
  letter-spacing: 0.28em;
  transform: translateX(-50%);
  animation: introCopyIn 1.05s ease 1.08s both;
}

.intro-skip {
  position: absolute;
  top: 24px;
  right: 28px;
  z-index: 2;
  min-width: 58px;
  min-height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(248, 247, 242, 0.78);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition: background 0.24s ease, color 0.24s ease, transform 0.24s var(--ease-smooth);
}

.intro-skip:hover,
.intro-skip:focus-visible {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  transform: translateY(-2px);
}

.studio-intro.is-leaving {
  pointer-events: none;
}

.studio-intro.is-leaving .intro-mark,
.studio-intro.is-leaving .intro-copy,
.studio-intro.is-leaving .intro-skip {
  animation: introFadeOut 0.34s ease both;
}

.studio-intro-leave-active {
  transition: opacity 0.5s ease, transform 0.5s var(--ease-smooth);
}

.studio-intro-leave-to {
  opacity: 0;
  transform: scale(1.015);
}

.studio-intro-enter-active {
  transition: none;
}

.studio-intro-enter-from {
  opacity: 1;
  transform: none;
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

@keyframes introGridSettle {
  0% {
    opacity: 0;
    transform: scale(1.16) translate3d(0, 18px, 0);
  }

  100% {
    opacity: 0.32;
    transform: scale(1.08) translate3d(0, 0, 0);
  }
}

@keyframes introLightPass {
  0% {
    opacity: 0;
    transform: translate3d(-42%, 0, 0);
  }

  42% {
    opacity: 0.86;
  }

  100% {
    opacity: 0.28;
    transform: translate3d(26%, 0, 0);
  }
}

@keyframes introMarkIn {
  0% {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(28px) scale(0.96);
  }

  100% {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0) scale(1);
  }
}

@keyframes introCopyIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
  }

  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes introFadeOut {
  100% {
    opacity: 0;
    filter: blur(8px);
    transform: translateY(-14px);
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

  .studio-intro {
    background:
      radial-gradient(circle at 70% 28%, rgba(169, 130, 71, 0.2), transparent 30%),
      linear-gradient(145deg, #171714 0%, #24241f 58%, #5d6549 100%);
  }

  .intro-grid {
    background-size: 64px 64px;
    animation-duration: 1.6s;
  }

  .intro-light {
    animation-duration: 2s;
  }

  .intro-mark {
    animation-duration: 1s;
    animation-delay: 0.18s;
  }

  .intro-copy {
    width: calc(100% - 48px);
    justify-content: space-between;
    gap: 12px;
    font-size: 10px;
    letter-spacing: 0.2em;
    animation-duration: 0.8s;
    animation-delay: 0.72s;
  }

  .intro-skip {
    top: 18px;
    right: 18px;
  }

  :global(.dh-action) {
    min-height: 42px;
  }

  :global(.dh-action__label) {
    padding: 0 15px;
    font-size: 13px;
  }

  :global(.dh-action__mark) {
    width: 42px;
    min-height: 40px;
    font-size: 16px;
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

  .studio-intro {
    display: none;
  }
}
</style>
