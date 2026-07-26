<template>
  <section id="works" class="section works">
    <div class="container section-head">
      <div>
        <span class="section-kicker">SELECTED WORKS</span>
        <h2>被现场验证过的空间。</h2>
      </div>
      <p>不按热闹排序，只保留能说明尺度、材质和落地能力的项目。</p>
    </div>

    <div class="container work-tags">
      <button
        v-for="option in displayFilterOptions"
        :key="option.value"
        :class="['tag', { active: option.value === activeTag }]"
        @click="$emit('change-tag', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="projects.length" class="container work-grid">
      <article
        v-for="(item, index) in projects"
        :key="item.id"
        class="work-card"
        :class="{ featured: index === 0 }"
        role="button"
        tabindex="0"
        @click="$emit('view-detail', item.id)"
        @keyup.enter="$emit('view-detail', item.id)"
      >
        <div class="work-image-wrap">
          <img :src="item.image" :alt="item.name" loading="lazy" decoding="async" />
          <div class="work-overlay"></div>
        </div>
        <div class="work-content">
          <span>{{ item.category }}</span>
          <h3>{{ item.name }}</h3>
          <p>{{ item.type }} / {{ item.year }}</p>
          <button class="work-detail-btn" @click.stop="$emit('view-detail', item.id)">
            阅读项目
            <span>↗</span>
          </button>
        </div>
      </article>
    </div>

    <p v-else class="container work-empty">暂无匹配作品</p>

    <button class="dh-action more-btn" @click="$emit('view-more')">
      <span class="dh-action__label">打开完整项目索引</span>
      <span class="dh-action__mark">→</span>
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  filterOptions: {
    type: Array,
    default: () => []
  },
  activeTag: {
    type: String,
    default: ''
  },
  projects: {
    type: Array,
    default: () => []
  }
})

defineEmits(['change-tag', 'view-detail', 'view-more'])

const displayFilterOptions = computed(() => {
  if (props.filterOptions.length) {
    return props.filterOptions
  }

  return props.tags.map((tag) => ({
    label: tag,
    value: tag
  }))
})
</script>

<style scoped lang="scss">
@import '@/assets/animations.scss';

.container {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.section {
  padding: 108px 0;
  position: relative;
}

.works {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    var(--color-sage);
  background-size: 88px 88px;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 34px;
  animation: fadeInUp 0.8s ease-out;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 14px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
  animation: slideInLeft 0.8s ease-out;
}

.section-head h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(34px, 4.8vw, 62px);
  font-weight: 500;
  line-height: 1;
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.section-head p {
  max-width: 360px;
  margin: 0;
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.8;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.work-tags {
  margin-bottom: 34px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  animation: fadeInUp 0.8s ease-out 0.15s both;
}

.tag {
  min-height: 38px;
  border: 1px solid var(--color-line);
  background: transparent;
  color: var(--color-ink-soft);
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(32, 35, 31, 0.1);
    transition: left 0.4s ease;
  }

  &:hover {
    border-color: var(--color-graphite);
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }

  &.active,
  &.active:hover {
    border-color: var(--color-graphite);
    background: var(--color-graphite);
    color: #fff;
    box-shadow: 0 8px 24px rgba(32, 35, 31, 0.15);
    transform: translateY(-4px);
  }
}

.work-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(340px, 0.88fr);
  grid-auto-rows: 300px;
  gap: 22px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.work-card {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: #d8d1c2;
  cursor: pointer;
  box-shadow: 0 20px 62px rgba(30, 27, 20, 0.08);
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, box-shadow;

  &.featured {
    grid-row: span 2;
  }

  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 32px 80px rgba(30, 27, 20, 0.16);
  }

  &:focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 3px;
  }
}

.work-image-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.work-image-wrap img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02);
  transition: transform 1s var(--ease-smooth), filter 0.5s ease;
  will-change: transform, filter;
}

.work-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(16, 15, 12, 0.72), rgba(16, 15, 12, 0.08) 62%);
  transition: background 0.4s ease;
}

.work-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(93, 101, 73, 0.15), transparent 80%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.work-card:hover {
  .work-image-wrap img {
    transform: scale(1.065) rotate(1deg);
    filter: saturate(1.1) contrast(1.08);
  }

  .work-overlay {
    background: linear-gradient(0deg, rgba(16, 15, 12, 0.88), rgba(16, 15, 12, 0.2) 62%);
  }

  &::after {
    opacity: 1;
  }
}

.work-card:focus-visible {
  .work-image-wrap img {
    transform: scale(1.045);
  }
}

.work-content {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 22px;
  z-index: 1;
  color: #fff;
}

.work-content span {
  display: inline-block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  letter-spacing: 2.4px;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.work-content h3 {
  margin: 0;
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 500;
  line-height: 1.18;
  animation: fadeInUp 0.8s ease-out 0.35s both;
}

.work-content p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.work-detail-btn {
  margin-top: 18px;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.72);
  background: transparent;
  padding: 0 0 5px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.08em;
  transition: all 0.28s var(--ease-smooth);
  animation: fadeInUp 0.8s ease-out 0.45s both;

  span {
    display: inline-block;
    transition: transform 0.28s var(--ease-smooth);
  }

  &:hover,
  &:focus-visible {
    border-bottom-color: rgba(255, 255, 255, 1);

    span {
      transform: translate(3px, -3px);
    }
  }
}

.work-empty {
  margin: 0 auto;
  padding: 42px 0 12px;
  color: var(--color-muted);
  font-size: 15px;
}

.more-btn {
  display: flex;
  width: fit-content;
  margin: 42px auto 0;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

@media (max-width: 980px) {
  .section-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .work-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 380px;
  }

  .work-card.featured {
    grid-row: span 1;
  }
}

@media (max-width: 760px) {
  .container {
    width: calc(100% - 36px);
  }

  .section {
    padding: 74px 0;
  }

  .section-head h2 {
    font-size: 36px;
  }

  .work-grid {
    grid-auto-rows: 330px;
    gap: 14px;
  }

  .work-content {
    left: 18px;
    right: 18px;
    bottom: 18px;
  }
}
</style>
