<template>
  <div class="view-more-page">
    <main class="gallery-shell">
      <section class="hero-block">
        <img :src="activeItem.full" :alt="activeItem.alt" class="hero-image" />
      </section>

      <section class="thumb-block">
        <button
          v-for="(item, index) in galleryItems"
          :key="item.id"
          class="thumb-btn"
          :class="{ active: index === activeIndex }"
          @click="activeIndex = index"
          :aria-label="`show image ${index + 1}`"
        >
          <img :src="item.thumb" :alt="item.alt" class="thumb-image" />
        </button>
      </section>

      <footer class="page-nav">
        <a href="#" class="nav-link" @click.prevent="goNext">
          NEXT: {{ nextCase.name }} &gt;
        </a>
        <a href="#" class="nav-link" @click.prevent="goPrev">
          &lt; PREVIOUS: {{ prevCase.name }}
        </a>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { designCases, getDesignCaseById } from '@/mock/data'

const route = useRoute()
const router = useRouter()

const activeIndex = ref(0)

const currentCase = computed(() => {
  return getDesignCaseById(route.params.id) || designCases[0]
})

const currentCaseIndex = computed(() => {
  return designCases.findIndex((item) => item.id === currentCase.value.id)
})

const prevCase = computed(() => {
  const index = currentCaseIndex.value
  const prevIndex = (index - 1 + designCases.length) % designCases.length
  return designCases[prevIndex]
})

const nextCase = computed(() => {
  const index = currentCaseIndex.value
  const nextIndex = (index + 1) % designCases.length
  return designCases[nextIndex]
})

const galleryItems = computed(() => {
  return currentCase.value.list.map((url, index) => ({
    id: `${currentCase.value.id}-${index}`,
    alt: `${currentCase.value.name}-${index + 1}`,
    full: url,
    thumb: url
  }))
})

const activeItem = computed(() => galleryItems.value[activeIndex.value] || galleryItems.value[0])

function goPrev() {
  activeIndex.value = 0
  router.push({ name: 'designDetail', params: { id: prevCase.value.id } })
}

function goNext() {
  activeIndex.value = 0
  router.push({ name: 'designDetail', params: { id: nextCase.value.id } })
}

watch(
  () => route.params.id,
  () => {
    activeIndex.value = 0
  }
)
</script>

<style scoped lang="scss">
.view-more-page {
  min-height: 100vh;
  background: #e9e9e9;
}

.gallery-shell {
  width: min(1320px, 94vw);
  margin: 0 auto;
  padding: 16px 0 40px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 180px;
  left: -34px;
  width: 28px;
  height: 28px;
  border: 1px solid #bdbdbd;
  color: #9b9b9b;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.hero-block {
  width: min(1000px, 100%);
  margin: 0 auto;
}

.hero-image {
  width: 100%;
  aspect-ratio: 1000 / 380;
  object-fit: cover;
  display: block;
}

.thumb-block {
  margin: 182px auto 0;
  width: min(1210px, 100%);
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 10px;
}

.thumb-btn {
  border: none;
  padding: 0;
  line-height: 0;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.2s ease;

  &:hover,
  &.active {
    opacity: 1;
  }
}

.thumb-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.page-nav {
  margin-top: 52px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.nav-link {
  color: #222;
  font-size: 18px;
  text-decoration: none;
  font-family: 'Times New Roman', serif;
  letter-spacing: 0.2px;
}

@media (max-width: 1100px) {
  .thumb-block {
    grid-template-columns: repeat(8, 1fr);
    margin-top: 96px;
  }

  .close-btn {
    display: none;
  }
}

@media (max-width: 760px) {
  .gallery-shell {
    width: 94vw;
  }

  .thumb-block {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .page-nav {
    align-items: flex-start;
  }

  .nav-link {
    font-size: 16px;
  }
}
</style>
