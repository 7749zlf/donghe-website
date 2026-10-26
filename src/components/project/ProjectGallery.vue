<template>
  <section class="project-gallery">
    <section class="project-hero">
      <button
        class="hero-preview-btn"
        type="button"
        :aria-label="`放大查看 ${activeItem.alt}`"
        @click="openPreview"
      >
        <img
          v-if="activeItem.full"
          :src="activeItem.full"
          :alt="activeItem.alt"
          class="hero-image"
          loading="eager"
          decoding="async"
        />
      </button>

      <div class="project-copy">
        <span class="section-kicker">PROJECT NOTES</span>
        <h1>{{ name }}</h1>
        <p>{{ note || '先看条件，再看结果。这个项目的重点在尺度、材质和光线的关系是否成立。' }}</p>
        <dl class="project-meta">
          <div>
            <dt>空间</dt>
            <dd>{{ category || '空间设计' }}</dd>
          </div>
          <div>
            <dt>风格</dt>
            <dd>{{ designStyle || '待补充' }}</dd>
          </div>
          <div>
            <dt>属性</dt>
            <dd>{{ type || '室内空间' }}</dd>
          </div>
          <div>
            <dt>年份</dt>
            <dd>{{ year || '近年' }}</dd>
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
        <button
          class="gallery-image-btn"
          type="button"
          :aria-label="`放大查看 ${activeItem.alt}`"
          @click="openPreview"
        >
          <img
            v-if="activeItem.full"
            :src="activeItem.full"
            :alt="activeItem.alt"
            class="gallery-image"
            loading="lazy"
            decoding="async"
          />
        </button>
      </div>

      <div class="thumb-block desktop-thumbs">
        <button
          v-for="(item, index) in galleryItems"
          :key="item.id"
          class="thumb-btn"
          :class="{ active: index === activeIndex }"
          :aria-label="`查看第 ${index + 1} 张图片`"
          @click="activeIndex = index"
        >
          <img :src="item.thumb" :alt="item.alt" class="thumb-image" loading="lazy" decoding="async" />
        </button>
      </div>

      <div class="mobile-thumbs">
        <div class="thumb-block">
          <button
            v-for="(item, index) in mobileGalleryItems"
            :key="item.id"
            type="button"
            class="thumb-btn"
            :class="{ active: index + mobilePageStart === activeIndex }"
            :aria-label="`查看第 ${index + mobilePageStart + 1} 张图片`"
            @click="activeIndex = index + mobilePageStart"
          >
            <img :src="item.thumb" :alt="item.alt" class="thumb-image" loading="lazy" decoding="async" />
          </button>
        </div>
        <div v-if="mobilePageCount > 1" class="thumb-pagination" aria-label="缩略图分页">
          <button type="button" :disabled="mobilePage === 0" @click="mobilePage -= 1">上一页</button>
          <span>{{ mobilePage + 1 }} / {{ mobilePageCount }}</span>
          <button type="button" :disabled="mobilePage >= mobilePageCount - 1" @click="mobilePage += 1">下一页</button>
        </div>
      </div>
    </section>

    <ProjectImageLightbox
      v-model:open="isPreviewOpen"
      :index="activeIndex"
      :items="galleryItems"
      @update:index="activeIndex = $event"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ProjectImageLightbox from './ProjectImageLightbox.vue'

const props = defineProps({
  name: { type: String, default: '' },
  note: { type: String, default: '' },
  category: { type: String, default: '' },
  designStyle: { type: String, default: '' },
  type: { type: String, default: '' },
  year: { type: String, default: '' },
  images: { type: Array, default: () => [] }
})

const activeIndex = ref(0)
const mobilePage = ref(0)
const isPreviewOpen = ref(false)
const MOBILE_THUMB_PAGE_SIZE = 8

const galleryItems = computed(() => props.images.map((url, index) => ({
  id: `${props.name}-${index}`,
  alt: `${props.name}-${index + 1}`,
  full: url,
  thumb: url
})))

const mobilePageCount = computed(() => Math.ceil(galleryItems.value.length / MOBILE_THUMB_PAGE_SIZE))
const mobilePageStart = computed(() => mobilePage.value * MOBILE_THUMB_PAGE_SIZE)
const mobileGalleryItems = computed(() => galleryItems.value.slice(
  mobilePageStart.value,
  mobilePageStart.value + MOBILE_THUMB_PAGE_SIZE
))
const activeItem = computed(() => galleryItems.value[activeIndex.value] || galleryItems.value[0] || {
  id: '',
  alt: '',
  full: '',
  thumb: ''
})

watch(activeIndex, (index) => {
  mobilePage.value = Math.floor(index / MOBILE_THUMB_PAGE_SIZE)
})

watch(
  () => [props.name, props.images],
  () => {
    activeIndex.value = 0
    mobilePage.value = 0
    isPreviewOpen.value = false
  },
  { deep: true }
)

function openPreview() {
  if (activeItem.value.full) {
    isPreviewOpen.value = true
  }
}
</script>

<style scoped lang="scss">
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

.project-meta div:last-child {
  grid-column: 1 / -1;
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
  max-height: 74vh;
  overflow-y: auto;
  align-content: start;
  padding-right: 4px;
}

.mobile-thumbs {
  display: none;
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

.thumb-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 14px;
  color: var(--color-muted);
  font-size: 13px;
}

.thumb-pagination button {
  border: 1px solid var(--color-line);
  padding: 8px 12px;
  background: transparent;
  color: var(--color-ink);
  cursor: pointer;
}

.thumb-pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 760px) {
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
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }

  .desktop-thumbs {
    display: none;
  }

  .mobile-thumbs {
    display: block;
  }
}
</style>
