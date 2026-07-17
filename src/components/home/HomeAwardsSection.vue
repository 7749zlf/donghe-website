<template>
  <section class="section awards">
    <div class="container section-head">
      <span class="section-kicker">RECOGNITION</span>
      <h2>荣誉，是项目被看见的结果。</h2>
      <p>它说明设计不只停留在概念层面，也经得起审美、执行和行业标准的验证。</p>
    </div>

    <div class="container award-list">
      <article v-for="item in awards" :key="item.id || item.title" class="award-card">
        <button class="award-image-btn" type="button" :aria-label="`放大查看 ${item.title}`" @click="openPreview(item)">
          <img class="award-image" :src="item.image" :alt="item.imageAlt || item.title" loading="lazy" decoding="async" />
        </button>
        <div class="award-copy">
          <span>{{ item.year }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </article>
    </div>

    <div v-if="previewAward" class="award-preview" role="dialog" aria-modal="true" @click.self="closePreview">
      <div class="preview-panel">
        <button class="preview-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
        <img :src="previewAward.image" :alt="previewAward.imageAlt || previewAward.title" loading="lazy" decoding="async" />
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
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.section {
  padding: 104px 0;
}

.awards {
  background: var(--color-ink);
  color: #fff;
}

.section-head {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(280px, 0.45fr);
  gap: 34px 64px;
  align-items: end;
  margin-bottom: 46px;
}

.section-kicker {
  grid-column: 1 / -1;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(34px, 4.8vw, 60px);
  font-weight: 500;
  line-height: 1;
}

.section-head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: 15px;
  line-height: 1.8;
}

.award-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  border-left: 1px solid rgba(255, 255, 255, 0.16);
}

.award-card {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.16);
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.025);
}

.award-image-btn {
  width: 100%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  cursor: zoom-in;
  display: block;
}

.award-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  filter: saturate(0.86);
  transition: transform 0.7s var(--ease-smooth), filter 0.35s ease;
}

.award-image-btn:hover .award-image,
.award-image-btn:focus-visible .award-image {
  transform: scale(1.04);
  filter: saturate(1);
}

.award-copy {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 22px;
}

.award-copy span {
  color: rgba(255, 255, 255, 0.52);
  font-size: 13px;
}

.award-copy h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.25;
}

.award-copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
  line-height: 1.7;
}

.award-preview {
  position: fixed;
  inset: 0;
  z-index: 2000;
  padding: 48px 24px;
  background: rgba(12, 15, 20, 0.76);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
}

.preview-panel {
  position: relative;
  width: min(820px, 100%);
  max-height: calc(100vh - 96px);
  padding: 34px 32px 28px;
  overflow: auto;
  background: var(--color-paper);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.32);
  text-align: center;
}

.preview-panel img {
  display: block;
  width: 100%;
  max-height: 66vh;
  object-fit: contain;
  background: #fff;
}

.preview-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border: none;
  background: rgba(23, 23, 20, 0.78);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.preview-info {
  max-width: 680px;
  margin: 0 auto;
  padding: 22px 0 0;
  color: var(--color-ink);
  text-align: center;
}

.preview-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.25;
}

.preview-info p {
  margin: 8px 0 0;
  color: var(--color-ink-soft);
  font-size: 15px;
  line-height: 1.7;
}

@media (max-width: 1120px) {
  .award-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .container {
    width: calc(100% - 36px);
  }

  .section {
    padding: 74px 0;
  }

  .section-head {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .award-list {
    grid-template-columns: 1fr;
  }

  .award-card {
    min-height: 0;
  }

  .award-preview {
    padding: 24px 14px;
  }

  .preview-panel {
    max-height: calc(100vh - 48px);
    padding: 50px 14px 20px;
  }
}
</style>
