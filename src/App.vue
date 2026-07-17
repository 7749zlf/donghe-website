<template>
  <div id="app">
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
  }
}
</script>

<style lang="scss" scoped>
#app {
  background: var(--color-paper);
  min-height: 100%;
}

:global(:root) {
  --nav-height: 73px;
  --color-ink: #171714;
  --color-ink-soft: #3f4239;
  --color-muted: #78766c;
  --color-paper: #f7f4ed;
  --color-warm: #ede6d8;
  --color-stone: #d8d1c2;
  --color-line: rgba(42, 39, 31, 0.16);
  --color-olive: #5d6549;
  --color-brass: #a98247;
  --color-clay: #9a5f47;
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
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.26) 1px, transparent 1px),
    var(--color-paper);
  background-size: 96px 96px;
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

@media (max-width: 768px) {
  :global(:root) {
    --nav-height: 60px;
  }
}
</style>
