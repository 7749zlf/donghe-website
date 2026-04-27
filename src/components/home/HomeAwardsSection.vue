<template>
  <section class="section awards">
    <div class="section-title">
      <h2>奖项荣誉</h2>
      <span class="title-line"></span>
    </div>

    <div class="container award-list">
      <article v-for="item in awards" :key="item.id || item.title" class="award-card">
        <button class="award-image-btn" type="button" :aria-label="`放大查看 ${item.title}`" @click="openPreview(item)">
          <img class="award-image" :src="item.image" :alt="item.imageAlt || item.title" />
        </button>
        <h4>{{ item.title }}</h4>
        <p>{{ item.desc }}</p>
        <span>{{ item.year }}</span>
      </article>
    </div>

    <div v-if="previewAward" class="award-preview" role="dialog" aria-modal="true" @click.self="closePreview">
      <div class="preview-panel">
        <button class="preview-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
        <img :src="previewAward.image" :alt="previewAward.imageAlt || previewAward.title" />
        <div class="preview-info">
          <h3>{{ previewAward.title }}</h3>
          <p>{{ previewAward.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  awards: {
    type: Array,
    default: () => []
  }
})

const previewAward = ref(null)

function openPreview(item) {
  previewAward.value = item
}

function closePreview() {
  previewAward.value = null
}
</script>

<style scoped lang="scss">
.container {
  max-width: 1344px;
  margin: 0 auto;
}

.section {
  padding: 80px 48px;
}

.section-title {
  text-align: center;
  margin-bottom: 64px;
}

.section-title h2 {
  margin: 0;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
}

.title-line {
  display: inline-block;
  width: 81px;
  height: 4px;
  margin-top: 12px;
  background: var(--border);
}

.awards {
  background: var(--bg-light);
}

.award-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.award-card {
  min-height: 300px;
  padding: 20px 20px 28px;
  border-radius: var(--radius-lg);
  background: #fff;
  text-align: center;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.award-image-btn {
  width: 100%;
  border: none;
  padding: 0;
  margin: 0 0 22px;
  border-radius: 10px;
  background: #f3f4f6;
  overflow: hidden;
  cursor: zoom-in;
  display: block;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.award-image-btn:hover,
.award-image-btn:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.14);
}

.award-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.award-card h4 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
}

.award-card p {
  margin: 8px 0 12px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.award-card span {
  color: var(--text-muted);
  font-size: 14px;
}

.award-preview {
  position: fixed;
  inset: 0;
  z-index: 30;
  padding: 48px 24px;
  background: rgba(12, 15, 20, 0.74);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
}

.preview-panel {
  position: relative;
  width: min(820px, 100%);
  max-height: calc(100vh - 96px);
  overflow: auto;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.32);
}

.preview-panel img {
  display: block;
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  background: #f5f5f5;
}

.preview-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.preview-info {
  padding: 22px 26px 26px;
}

.preview-info h3 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
}

.preview-info p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
}

@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }

  .award-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .section {
    padding: 56px 20px;
  }

  .section-title {
    margin-bottom: 40px;
  }

  .section-title h2 {
    font-size: 30px;
  }

  .award-list {
    grid-template-columns: 1fr;
  }

  .award-preview {
    padding: 24px 14px;
  }

  .preview-panel {
    max-height: calc(100vh - 48px);
  }
}
</style>
