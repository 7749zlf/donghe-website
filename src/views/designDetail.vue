<template>
  <div class="view-more-page">
    <main class="project-shell">
      <section class="project-hero">
        <button class="hero-preview-btn" type="button" :aria-label="`放大查看 ${activeItem.alt}`" @click="openPreview">
          <img v-if="activeItem.full" :src="activeItem.full" :alt="activeItem.alt" class="hero-image" loading="eager" decoding="async" />
        </button>

        <div class="project-copy">
          <span class="section-kicker">PROJECT NOTES</span>
          <h1>{{ currentCase.name }}</h1>
          <p>{{ currentCase.note || '先看条件，再看结果。这个项目的重点在尺度、材质和光线的关系是否成立。' }}</p>
          <dl class="project-meta">
            <div>
              <dt>空间</dt>
              <dd>{{ currentCase.category || '空间设计' }}</dd>
            </div>
            <div>
              <dt>属性</dt>
              <dd>{{ currentCase.type || '室内空间' }}</dd>
            </div>
            <div>
              <dt>年份</dt>
              <dd>{{ currentCase.year || '近年' }}</dd>
            </div>
            <div>
              <dt>图片</dt>
              <dd>{{ galleryItems.length }} 张</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="gallery-section">
        <div class="gallery-main">
          <button class="gallery-image-btn" type="button" :aria-label="`放大查看 ${activeItem.alt}`" @click="openPreview">
            <img v-if="activeItem.full" :src="activeItem.full" :alt="activeItem.alt" class="gallery-image" loading="lazy" decoding="async" />
          </button>
        </div>

        <div class="thumb-block">
          <button
            v-for="(item, index) in galleryItems"
            :key="item.id"
            class="thumb-btn"
            :class="{ active: index === activeIndex }"
            @click="activeIndex = index"
            :aria-label="`查看第 ${index + 1} 张图片`"
          >
            <img :src="item.thumb" :alt="item.alt" class="thumb-image" loading="lazy" decoding="async" />
          </button>
        </div>
      </section>

      <footer class="page-nav">
        <button type="button" class="dh-action" @click="goWorks">
          <span class="dh-action__label">返回索引</span>
          <span class="dh-action__mark">←</span>
        </button>
        <button v-if="URL" type="button" class="dh-action dh-action--solid" @click="go3D">
          <span class="dh-action__label">打开3D</span>
          <span class="dh-action__mark">↗</span>
        </button>
      </footer>
    </main>

    <div
      v-if="isPreviewOpen"
      class="image-preview"
      role="dialog"
      aria-modal="true"
      @click.self="closePreview"
      @wheel.prevent="handlePreviewWheel"
    >
      <div class="preview-toolbar" aria-label="图片缩放工具">
        <button type="button" :disabled="previewZoom <= MIN_PREVIEW_ZOOM" @click="zoomOutPreview">−</button>
        <span>{{ previewZoomLabel }}</span>
        <button type="button" :disabled="previewZoom >= MAX_PREVIEW_ZOOM" @click="zoomInPreview">+</button>
        <button type="button" @click="resetPreviewTransform">复位</button>
      </div>
      <button class="preview-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
      <button
        class="preview-nav preview-nav-prev"
        type="button"
        aria-label="查看上一张图片"
        @click="goPreviewPrev"
      >
        ‹
      </button>
      <button
        class="preview-nav preview-nav-next"
        type="button"
        aria-label="查看下一张图片"
        @click="goPreviewNext"
      >
        ›
      </button>
      <div class="preview-stage">
        <img
          :src="activeItem.full"
          :alt="activeItem.alt"
          class="preview-image"
          loading="lazy"
          decoding="async"
          :class="{ draggable: previewZoom > MIN_PREVIEW_ZOOM, dragging: isPreviewDragging }"
          :style="previewImageStyle"
          draggable="false"
          @dblclick="resetPreviewTransform"
          @pointerdown="startPreviewDrag"
          @pointermove="movePreviewDrag"
          @pointerup="stopPreviewDrag"
          @pointercancel="stopPreviewDrag"
          @pointerleave="stopPreviewDrag"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDisplayDesignCases, getDisplayWorksList } from '@/mock/data'

const route = useRoute()
const router = useRouter()

const displayWorks = ref(getDisplayWorksList())
const displayDesignCases = ref(getDisplayDesignCases())
const activeIndex = ref(0)
const isPreviewOpen = ref(false)
const MIN_PREVIEW_ZOOM = 1
const MAX_PREVIEW_ZOOM = 4
const PREVIEW_ZOOM_STEP = 0.25
const previewZoom = ref(MIN_PREVIEW_ZOOM)
const previewPan = reactive({ x: 0, y: 0 })
const isPreviewDragging = ref(false)
const previewDragStart = reactive({
  pointerId: null,
  x: 0,
  y: 0,
  panX: 0,
  panY: 0
})

const currentCase = computed(() => {
  const routeId = String(route.params.id || '')
  const work = displayWorks.value.find((item) => String(item.id) === routeId) || displayWorks.value[0] || {}
  const designCase = displayDesignCases.value.find((item) => String(item.id) === String(work.id || routeId)) || {}
  const list = work.list || designCase.list || []

  return {
    ...designCase,
    ...work,
    url: designCase.url || work.url || '',
    list,
    image: work.image || work.cover || designCase.image || list[0] || ''
  }
})

const URL = computed(() => currentCase.value.url)

const galleryItems = computed(() => {
  return (currentCase.value.list || []).map((url, index) => ({
    id: `${currentCase.value.id}-${index}`,
    alt: `${currentCase.value.name}-${index + 1}`,
    full: url,
    thumb: url
  }))
})

const activeItem = computed(() => galleryItems.value[activeIndex.value] || galleryItems.value[0] || {
  id: '',
  alt: '',
  full: '',
  thumb: ''
})
const previewZoomLabel = computed(() => `${Math.round(previewZoom.value * 100)}%`)
const previewImageStyle = computed(() => ({
  transform: `translate3d(${previewPan.x}px, ${previewPan.y}px, 0) scale(${previewZoom.value})`
}))
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

function goWorks() {
  router.push({ name: 'worksGallery' })
}

function go3D() {
  if (URL.value) {
    window.open(URL.value, '_blank')
  }
}

function openPreview() {
  if (!activeItem.value.full) {
    return
  }

  resetPreviewTransform()
  isPreviewOpen.value = true
}

function closePreview() {
  isPreviewOpen.value = false
  resetPreviewTransform()
}

function clampPreviewZoom(value) {
  return Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, Number(value.toFixed(2))))
}

function setPreviewZoom(value) {
  previewZoom.value = clampPreviewZoom(value)
  if (previewZoom.value === MIN_PREVIEW_ZOOM) {
    previewPan.x = 0
    previewPan.y = 0
  }
}

function zoomInPreview() {
  setPreviewZoom(previewZoom.value + PREVIEW_ZOOM_STEP)
}

function zoomOutPreview() {
  setPreviewZoom(previewZoom.value - PREVIEW_ZOOM_STEP)
}

function goPreviewPrev() {
  goPrev()
  resetPreviewTransform()
}

function goPreviewNext() {
  goNext()
  resetPreviewTransform()
}

function resetPreviewTransform() {
  previewZoom.value = MIN_PREVIEW_ZOOM
  previewPan.x = 0
  previewPan.y = 0
  isPreviewDragging.value = false
  previewDragStart.pointerId = null
}

function handlePreviewWheel(event) {
  const direction = event.deltaY < 0 ? 1 : -1
  setPreviewZoom(previewZoom.value + direction * PREVIEW_ZOOM_STEP)
}

function startPreviewDrag(event) {
  if (previewZoom.value <= MIN_PREVIEW_ZOOM) {
    return
  }

  isPreviewDragging.value = true
  previewDragStart.pointerId = event.pointerId
  previewDragStart.x = event.clientX
  previewDragStart.y = event.clientY
  previewDragStart.panX = previewPan.x
  previewDragStart.panY = previewPan.y
  event.currentTarget.setPointerCapture(event.pointerId)
}

function movePreviewDrag(event) {
  if (!isPreviewDragging.value || previewDragStart.pointerId !== event.pointerId) {
    return
  }

  previewPan.x = previewDragStart.panX + event.clientX - previewDragStart.x
  previewPan.y = previewDragStart.panY + event.clientY - previewDragStart.y
}

function stopPreviewDrag(event) {
  if (!isPreviewDragging.value || previewDragStart.pointerId !== event.pointerId) {
    return
  }

  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  isPreviewDragging.value = false
  previewDragStart.pointerId = null
}

watch(
  () => route.params.id,
  () => {
    displayWorks.value = getDisplayWorksList()
    displayDesignCases.value = getDisplayDesignCases()
    activeIndex.value = 0
    isPreviewOpen.value = false
  }
)

function refreshDetail() {
  displayWorks.value = getDisplayWorksList()
  displayDesignCases.value = getDisplayDesignCases()
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
  min-height: calc(100vh - var(--nav-height));
  min-height: calc(100svh - var(--nav-height));
  background: var(--color-paper);
}

.project-shell {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
  padding: 56px 0 86px;
}

.project-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.7fr);
  gap: 58px;
  align-items: end;
}

.hero-preview-btn {
  width: 100%;
  border: none;
  padding: 0;
  background: var(--color-stone);
  display: block;
  line-height: 0;
  overflow: hidden;
  cursor: zoom-in;
  box-shadow: var(--shadow-soft);
}

.hero-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02);
  transition: transform 0.9s var(--ease-smooth);
}

.hero-preview-btn:hover .hero-image {
  transform: scale(1.035);
}

.section-kicker {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.project-copy h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(42px, 6vw, 76px);
  font-weight: 500;
  line-height: 1;
}

.project-copy p {
  margin: 24px 0 0;
  color: var(--color-ink-soft);
  font-size: 16px;
  line-height: 1.9;
}

.project-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin: 34px 0 0;
  padding: 0;
  border-top: 1px solid var(--color-line);
  border-left: 1px solid var(--color-line);
}

.project-meta div {
  padding: 18px;
  border-right: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}

.project-meta dt {
  margin: 0 0 8px;
  color: var(--color-muted);
  font-size: 12px;
}

.project-meta dd {
  margin: 0;
  color: var(--color-ink);
  font-size: 15px;
  line-height: 1.5;
}

.gallery-section {
  margin-top: 72px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 168px;
  gap: 22px;
  align-items: start;
}

.gallery-main {
  min-width: 0;
}

.gallery-image-btn {
  width: 100%;
  border: 0;
  padding: 0;
  background: var(--color-stone);
  line-height: 0;
  cursor: zoom-in;
  display: block;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  max-height: 74vh;
  display: block;
  object-fit: contain;
  background: var(--color-stone);
}

.thumb-block {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.thumb-btn {
  border: 1px solid transparent;
  padding: 0;
  line-height: 0;
  aspect-ratio: 4 / 3;
  background: var(--color-stone);
  cursor: pointer;
  opacity: 0.72;
  overflow: hidden;
  transition: opacity 0.24s ease, border-color 0.24s ease;
}

.thumb-btn:hover,
.thumb-btn.active {
  opacity: 1;
  border-color: var(--color-olive);
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.page-nav {
  margin-top: 52px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid var(--color-line);
  padding-top: 24px;
}

.image-preview {
  position: fixed;
  inset: 0;
  z-index: 2000;
  padding: clamp(20px, 4vw, 48px);
  background: rgba(12, 15, 20, 0.82);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(10px, 2vw, 18px);
  overflow: hidden;
  cursor: default;
}

.preview-stage {
  width: 100%;
  height: auto;
  max-height: calc(100svh - clamp(120px, 18vw, 168px));
  order: 1;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.preview-toolbar {
  order: 2;
  z-index: 2001;
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(48px, 5vw, 64px) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(5px, 1vw, 8px);
  width: min(100%, clamp(320px, 42vw, 460px));
  padding: clamp(5px, 0.8vw, 8px);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
}

.preview-toolbar button {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #11161d;
  min-width: 0;
  height: clamp(32px, 3vw, 38px);
  padding: 0 clamp(8px, 1.5vw, 12px);
  font-size: clamp(12px, 1.4vw, 14px);
  white-space: nowrap;
  cursor: pointer;
}

.preview-toolbar button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.preview-toolbar span {
  min-width: 0;
  color: #fff;
  text-align: center;
  font-size: clamp(12px, 1.4vw, 14px);
  line-height: clamp(32px, 3vw, 38px);
  white-space: nowrap;
}

.preview-image {
  max-width: min(1200px, 100%);
  max-height: calc(100svh - clamp(120px, 18vw, 168px));
  object-fit: contain;
  display: block;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.4);
  transform-origin: center center;
  transition: transform 0.16s ease;
  user-select: none;
  touch-action: none;
  cursor: zoom-in;
}

.preview-image.draggable {
  cursor: grab;
}

.preview-image.dragging {
  cursor: grabbing;
  transition: none;
}

.preview-close {
  position: fixed;
  top: 85px;
  right: 28px;
  z-index: 2001;
  width: 42px;
  height: 42px;
  border: none;
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

.preview-nav {
  position: fixed;
  top: 50%;
  z-index: 2001;
  width: 54px;
  height: 78px;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 52px;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background 0.2s ease;
}

.preview-nav:hover {
  background: rgba(255, 255, 255, 0.28);
}

.preview-nav-prev {
  left: 28px;
}

.preview-nav-next {
  right: 28px;
}

@media (max-width: 980px) {
  .project-hero {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .gallery-section {
    grid-template-columns: 1fr;
  }

  .thumb-block {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .project-shell {
    width: calc(100% - 36px);
    padding: 36px 0 68px;
  }

  .project-copy h1 {
    font-size: 42px;
  }

  .project-meta {
    grid-template-columns: 1fr;
  }

  .gallery-section {
    margin-top: 46px;
  }

  .thumb-block {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .page-nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .image-preview {
    gap: clamp(10px, 3.2vw, 16px);
    padding: clamp(14px, 4vw, 20px);
  }

  .preview-stage {
    max-height: calc(100svh - clamp(118px, 30vw, 156px));
  }

  .preview-toolbar {
    grid-template-columns: minmax(0, 1fr) clamp(44px, 14vw, 58px) minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(4px, 1.5vw, 8px);
    width: min(100%, clamp(292px, 92vw, 430px));
    padding: clamp(5px, 1.6vw, 8px);
  }

  .preview-toolbar button {
    min-width: 0;
    height: clamp(30px, 8vw, 38px);
    padding: 0 clamp(6px, 2.2vw, 12px);
    font-size: clamp(12px, 3.4vw, 14px);
    white-space: nowrap;
  }

  .preview-toolbar span {
    min-width: 0;
    font-size: clamp(12px, 3.4vw, 14px);
    line-height: clamp(30px, 8vw, 38px);
    white-space: nowrap;
  }

  .preview-close {
    top: 16px;
    right: 16px;
  }

  .preview-nav {
    width: 44px;
    height: 62px;
    font-size: 42px;
  }

  .preview-nav-prev {
    left: 12px;
  }

  .preview-nav-next {
    right: 12px;
  }

  .preview-image {
    max-width: calc(100vw - clamp(28px, 8vw, 40px));
    max-height: calc(100svh - clamp(118px, 30vw, 156px));
  }
}
</style>
