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
  background: #fff;
  min-height: 100%;
}

:global(:root) {
  --nav-height: 73px;
}

:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
}

:global(*) {
  box-sizing: border-box;
}

@media (max-width: 768px) {
  :global(:root) {
    --nav-height: 60px;
  }
}
</style>
