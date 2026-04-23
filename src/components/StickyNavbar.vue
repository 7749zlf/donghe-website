<template>
  <nav class="sticky-navbar">
    <div class="navbar-inner">
      <div class="brand">LUXE DESIGN</div>
      <div class="nav-container">
        <ul class="nav-list" :class="{ collapsed: isCollapsed }">
          <li class="nav-item">
            <a href="" @click.prevent="scrollToSection('about')">关于</a>
          </li>
          <li class="nav-item dropdown" @mouseenter="showDropdown('works')" @mouseleave="hideDropdown">
            <a href="" @click.prevent="scrollToSection('works')">作品</a>
            <ul v-if="activeDropdown === 'works'" class="dropdown-menu">
              <li><a href="" @click.prevent="scrollToSection('works')">商业设计</a></li>
              <li><a href="" @click.prevent="scrollToSection('works')">居家设计</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a href="" @click.prevent="scrollToSection('contact')">联系</a>
          </li>
        </ul>
        <button @click="toggleCollapse" class="toggle-btn">
          <span v-if="!isCollapsed">=</span>
          <span v-else>x</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'StickyNavbar',
  data() {
    return {
      activeDropdown: null,
      isCollapsed: false
    }
  },
  methods: {
    showDropdown(menu) {
      this.activeDropdown = menu
    },
    hideDropdown() {
      this.activeDropdown = null
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    scrollToSection(id) {
      const target = document.getElementById(id)
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
</script>

<style scoped lang="scss">
.sticky-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 48px;
  border-bottom: 1px solid rgba(243, 244, 246, 0.8);
  height: 73px;
  width: 100%;

  .navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .nav-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .brand {
    font-size: 24px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
    align-items: center;
    transition: all 0.3s ease;

    &.collapsed .nav-item > a {
      opacity: 0;
      transform: translateX(20px);
    }
  }

  .nav-item {
    position: relative;
    margin-right: 32px;

    &:last-child {
      margin-right: 0;
    }

    > a {
      text-decoration: none;
      color: #333;
      font-size: 18px;
      padding: 10px 16px;
      display: block;
      transition: opacity 0.3s ease, transform 0.3s ease, color 0.2s;

      &:hover {
        color: #0078ff;
      }
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    min-width: 140px;
    padding: 8px 0;
    margin-top: 4px;
    z-index: 1001;

    li {
      list-style: none;
    }

    a {
      display: block;
      padding: 8px 20px;
      color: #333;
      text-decoration: none;
      font-size: 16px;
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: #f5f7fa;
        color: #0078ff;
      }
    }
  }

  .toggle-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
    transition: color 0.2s;
    flex-shrink: 0;

    &:hover {
      color: #0078ff;
    }
  }
}
</style>
