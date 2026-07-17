<template>
  <nav class="sticky-navbar">
    <div class="navbar-inner">
      <button class="brand" type="button" @click="toHome">
        <span>东禾</span>
        <small>INTERIOR STUDIO</small>
      </button>

      <div class="nav-container">
        <ul class="nav-list" :class="{ open: isMenuOpen }">
          <li class="nav-item">
            <button type="button" @click="scrollToSection('about')">关于</button>
          </li>
          <li class="nav-item">
            <button type="button" @click="scrollToSection('approach')">方法</button>
          </li>
          <li class="nav-item">
            <button type="button" @click="toWorks">项目</button>
          </li>
          <li class="nav-item">
            <button type="button" @click="scrollToSection('contact')">沟通</button>
          </li>
          <li class="nav-item">
            <button type="button" class="manager-link" @click="toManager">后台</button>
          </li>
        </ul>

        <button type="button" @click="toggleCollapse" class="toggle-btn" aria-label="打开或关闭导航">
          <span v-if="!isMenuOpen">☰</span>
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
      isMenuOpen: false
    }
  },
  methods: {
    toggleCollapse() {
      this.isMenuOpen = !this.isMenuOpen
    },
    toHome() {
      this.isMenuOpen = false
      this.$router.push('/')
    },
    toWorks() {
      this.isMenuOpen = false
      this.$router.push({ name: 'worksGallery' })
    },
    scrollToSection(sectionId) {
      this.isMenuOpen = false
      const scroll = () => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (this.$route.name === 'Home') {
        scroll()
        return
      }

      this.$router.push({ name: 'Home' }).then(() => {
        this.$nextTick(scroll)
      })
    },
    toManager() {
      this.isMenuOpen = false
      this.$router.push({ name: 'contentManager' })
    }
  }
}
</script>

<style scoped>
.sticky-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: var(--nav-height);
  padding: 0 clamp(20px, 4vw, 58px);
  background: rgba(247, 244, 237, 0.9);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--color-line);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.brand {
  flex-shrink: 0;
  display: grid;
  gap: 2px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-ink);
  text-align: left;
  cursor: pointer;
}

.brand span {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
}

.brand small {
  color: var(--color-muted);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 2.2px;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-item {
  position: relative;
}

.nav-item > button {
  display: block;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  color: var(--color-ink-soft);
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.24s ease, background 0.24s ease;
}

.nav-item > button:hover {
  color: var(--color-ink);
  background: rgba(93, 101, 73, 0.08);
}

.manager-link {
  color: var(--color-muted) !important;
}

.toggle-btn {
  display: none;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-line);
  background: transparent;
  color: var(--color-ink);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.toggle-btn:hover {
  background: rgba(93, 101, 73, 0.08);
}

@media (max-width: 768px) {
  .sticky-navbar {
    padding: 0 16px;
  }

  .navbar-inner {
    gap: 12px;
  }

  .brand span {
    font-size: 21px;
  }

  .brand small {
    font-size: 9px;
    letter-spacing: 1.8px;
  }

  .nav-list {
    position: absolute;
    top: var(--nav-height);
    left: 12px;
    right: 12px;
    flex-direction: column;
    align-items: stretch;
    height: auto;
    padding: 8px;
    border: 1px solid var(--color-line);
    background: rgba(247, 244, 237, 0.98);
    box-shadow: var(--shadow-soft);
    opacity: 0;
    transform: translateY(-8px);
    pointer-events: none;
    transition: opacity 0.24s ease, transform 0.24s ease;
  }

  .nav-list.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .nav-item > button {
    width: 100%;
    padding: 12px 14px;
    text-align: left;
  }

  .toggle-btn {
    display: block;
  }
}
</style>
