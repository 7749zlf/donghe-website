<template>
  <div class="view-more-page">
    <main class="gallery-shell">
      <section class="hero-block">
        <button class="hero-preview-btn" type="button" :aria-label="`放大查看 ${activeItem.alt}`" @click="openPreview">
          <img :src="activeItem.full" :alt="activeItem.alt" class="hero-image" />
        </button>
      </section>

      <section class="thumb-block">
        <button v-for="(item, index) in galleryItems" :key="item.id" class="thumb-btn"
          :class="{ active: index === activeIndex }" @click="activeIndex = index"
          :aria-label="`show image ${index + 1}`">
          <img :src="item.thumb" :alt="item.alt" class="thumb-image" />
        </button>
      </section>

      <footer class="page-nav">
        <a href="#" class="nav-link" @click.prevent="goNext">
          <span class="nav-caret">&lt;</span>
          <span class="nav-label">下一页</span>
        </a>
        <a href="#" class="nav-link" @click.prevent="goPrev">
          <span class="nav-caret">&lt;</span>
          <span class="nav-label">上一页</span>
        </a>
        <a href="#" class="nav-link" @click.prevent="go3D">
          <span class="nav-caret">&lt;</span>
          <span class="nav-label">3D查看</span>
        </a>
      </footer>
    </main>

    <div v-if="isPreviewOpen" class="image-preview" role="dialog" aria-modal="true" @click.self="closePreview">
      <button class="preview-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
      <img :src="activeItem.full" :alt="activeItem.alt" class="preview-image" />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDesignCaseById, getDisplayDesignCases } from '@/mock/data'

const route = useRoute()

const activeIndex = ref(0)
const isPreviewOpen = ref(false)

const currentCase = computed(() => {
  return getDesignCaseById(route.params.id) || getDisplayDesignCases()[0]
})
const URL = computed(() => {
  return currentCase.value.url 
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
const prevImageIndex = computed(() => {
  if (!galleryItems.value.length) return 0
  return (activeIndex.value - 1 + galleryItems.value.length) % galleryItems.value.length
})
const nextImageIndex = computed(() => {
  if (!galleryItems.value.length) return 0
  return (activeIndex.value + 1) % galleryItems.value.length
})

function goPrev() {
  if (!galleryItems.value.length) return
  activeIndex.value = prevImageIndex.value
}

function goNext() {
  if (!galleryItems.value.length) return
  activeIndex.value = nextImageIndex.value
}
function go3D() {
  console.log('URL', URL.value)
  if (URL.value) {
    window.open(URL.value, '_blank')
  }
}

function openPreview() {
  isPreviewOpen.value = true
}

function closePreview() {
  isPreviewOpen.value = false
}

watch(
  () => route.params.id,
  () => {
    activeIndex.value = 0
    isPreviewOpen.value = false
  }
)

function refreshDetail() {
  activeIndex.value = 0
}

onMounted(() => {
  window.addEventListener('donghe-custom-cases-updated', refreshDetail)
})

onBeforeUnmount(() => {
  window.removeEventListener('donghe-custom-cases-updated', refreshDetail)
})
</script>

<style scoped lang="scss">
.view-more-page {
  box-sizing:content-box;
  min-height: calc(100vh - 60px);
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

.hero-preview-btn {
  width: 100%;
  border: none;
  padding: 0;
  background: transparent;
  display: block;
  cursor: zoom-in;
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
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 160px;
  padding: 2px 0;
  transition: color 0.25s ease;
}

.nav-caret {
  display: inline-block;
  transition: transform 0.28s ease;
}

.nav-label {
  text-align: right;
}

.nav-link:hover {
  color: #6b7280;
}

.nav-link:hover .nav-caret {
  transform: translateX(-1ch);
}

.image-preview {
  position: fixed;
  inset: 0;
  z-index: 50;
  padding: 48px;
  background: rgba(12, 15, 20, 0.82);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: zoom-out;
}

.preview-image {
  max-width: min(1200px, 100%);
  max-height: calc(100vh - 96px);
  object-fit: contain;
  display: block;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.4);
  cursor: default;
}

.preview-close {
  position: fixed;
  top: 85px;
  right: 28px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.preview-close:hover {
  background: rgba(255, 255, 255, 0.28);
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
    width: 200px;
  }

  .image-preview {
    padding: 20px;
  }

  .preview-image {
    max-height: calc(100vh - 40px);
  }
}
</style>
