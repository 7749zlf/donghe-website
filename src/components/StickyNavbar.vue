<template>
  <nav class="sticky-navbar">
    <div class="navbar-inner">
      <div class="brand" @click="toHome">LUXE DESIGN</div>
      <div class="nav-container">
        <ul class="nav-list" :class="{ collapsed: isCollapsed }">
          <li class="nav-item">
            <a href="#about">关于</a>
          </li>
          <li class="nav-item dropdown">
            <a href="#works">作品</a>
          </li>
          <li class="nav-item">
            <a href="#contact">联系</a>
          </li>
        </ul>
        <button type="button" @click="toggleCollapse" class="toggle-btn">
          <span v-if="isCollapsed">☰</span>
          <span v-else>✕</span>
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
      isCollapsed: false,
    };
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    toHome() {
      this.$router.push('/');
    }
  },
};
</script>

<style scoped>
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
}

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
  /* 调整导航和开关之间的间距 */
}

.brand {
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
  cursor: pointer;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  align-items: center;
  transition: all 0.3s ease;
}

.nav-list.collapsed {
  opacity: 0;
  transform: translateX(10px);
}

.nav-item {
  position: relative;
  margin-right: 32px;
}

.nav-item:last-child {
  margin-right: 0;
}

.nav-item>a {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  padding: 10px 16px;
  display: block;
  transition: opacity 0.3s ease, transform 0.3s ease, color 0.2s;
}

.nav-item>a:hover {
  color: #0078ff;
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
}

.dropdown-menu li {
  list-style: none;
}

.dropdown-menu a {
  display: block;
  padding: 8px 20px;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  transition: background 0.2s, color 0.2s;
}

.dropdown-menu a:hover {
  background: #f5f7fa;
  color: #0078ff;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toggle-btn:hover {
  color: #0078ff;
}

@media (max-width: 768px) {
  .sticky-navbar {
    padding: 0 12px;
    height: 60px;
  }

  .navbar-inner {
    gap: 12px;
  }

  .brand {
    font-size: 20px;
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100vw;
    height: auto;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 10px 0;
    border-radius: 0 0 10px 10px;
    opacity: 1;
    transform: translateY(10px);
    pointer-events: auto;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .nav-item {
    margin: 0;
  }

  .nav-list.collapsed {
    opacity: 0;
    transform: none;
    pointer-events: auto;
  }

  .toggle-btn {
    display: block;
  }


  .nav-list.collapsed .nav-item {
    margin: 0;
  }

  .nav-list.collapsed .nav-item>a {
    padding: 12px 16px;
    width: 100%;
    box-sizing: border-box;
  }
}
</style>