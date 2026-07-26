<template>
  <div id="app" :data-theme="currentTheme">
    <!-- 加载条 -->
    <div v-if="isLoading" class="loading-bar" :class="{ finished: false }"></div>

    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="toggleTheme" :aria-label="`切换至${currentTheme === 'light' ? '深' : '浅'}色主题`">
      {{ currentTheme === 'light' ? '🌙' : '☀️' }}
    </button>

    <!-- 导航栏 -->
    <StickyNavbar />

    <!-- 页面过渡 -->
    <Transition
      name="slide-up"
      mode="out-in"
      @enter="onPageEnter"
      @leave="onPageLeave"
    >
      <router-view :key="$route.fullPath" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StickyNavbar from './components/StickyNavbar.vue'
import { useTheme } from './composables/useTheme'
import { usePageTransition } from './composables/usePageTransition'
import { useMobileOptimize } from './composables/useMobileOptimize'

const { currentTheme, toggleTheme } = useTheme()
const { isLoading, initRouterHooks } = usePageTransition()
const { isMobile } = useMobileOptimize()

// 页面进入动画钩子
function onPageEnter(el) {
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px)'
  setTimeout(() => {
    el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }, 10)
}

// 页面离开动画钩子
function onPageLeave(el) {
  el.style.transition = 'all 0.4s ease'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px)'
}

onMounted(() => {
  initRouterHooks()
})
</script>

<style lang="scss">
@import './assets/animations.scss';
@import './assets/scroll-animations.scss';
@import './assets/page-transitions.scss';
@import './assets/theme.scss';

#app {
  background: var(--theme-bg);
  color: var(--theme-text);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
}

:global(:root) {
  --nav-height: 73px;
  --color-paper: #f5f1e8;
  --color-ink: #171714;
  --color-ink-soft: #3f4239;
  --color-muted: #78766c;
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
  color: var(--theme-text);
  background: var(--theme-bg);
  font-family: 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:global(button),
:global(input),
:global(textarea),
:global(select) {
  font: inherit;
  color: inherit;
}

:global(button) {
  -webkit-tap-highlight-color: transparent;
}

:global(img) {
  max-width: 100%;
}

:global(.dh-action) {
  --dh-action-fg: var(--theme-text);
  --dh-action-bg: transparent;
  --dh-action-hover-bg: var(--theme-text);
  --dh-action-hover-fg: var(--theme-bg);
  min-height: 46px;
  display: inline-flex;
  align-items: stretch;
  border: 1px solid currentColor;
  background: var(--dh-action-bg);
  color: var(--dh-action-fg);
  padding: 0;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.32s var(--ease-smooth);
  border-radius: 4px;
  overflow: hidden;
}

:global(.dh-action:hover),
:global(.dh-action:focus-visible) {
  background: var(--dh-action-hover-bg);
  color: var(--dh-action-hover-fg);
  transform: translateY(-2px);
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
  --dh-action-bg: var(--theme-text);
  --dh-action-fg: var(--theme-bg);
  --dh-action-hover-bg: transparent;
  --dh-action-hover-fg: var(--theme-text);
}

@media (max-width: 768px) {
  :global(:root) {
    --nav-height: 60px;
  }
}
</style>
