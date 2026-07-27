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
.container {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.section {
  padding: 108px 0;
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
}

.section-kicker {
  display: inline-block;
  margin-bottom: 14px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.section-head h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(34px, 4.8vw, 62px);
  font-weight: 500;
  line-height: 1;
}

.section-head p {
  max-width: 360px;
  margin: 0;
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.8;
}

.work-tags {
  margin-bottom: 34px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  min-height: 38px;
  border: 1px solid var(--color-line);
  background: transparent;
  color: var(--color-ink-soft);
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.24s ease, color 0.24s ease, border-color 0.24s ease;
}

.tag.active,
.tag:hover {
  border-color: var(--color-graphite);
  background: var(--color-graphite);
  color: #fff;
}

.work-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(340px, 0.88fr);
  grid-auto-rows: 300px;
  gap: 22px;
}

.work-card {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: #d8d1c2;
  cursor: pointer;
  box-shadow: 0 20px 62px rgba(30, 27, 20, 0.08);
}

.work-card.featured {
  grid-row: span 2;
}

.work-card:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
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
  transition: transform 0.9s var(--ease-smooth), filter 0.4s ease;
}

.work-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(16, 15, 12, 0.72), rgba(16, 15, 12, 0.08) 62%);
  transition: background 0.4s ease;
}

.work-card:hover img,
.work-card:focus-visible img {
  transform: scale(1.045);
  filter: saturate(1) contrast(1.04);
}

.work-card:hover::after,
.work-card:focus-visible::after {
  background: linear-gradient(0deg, rgba(16, 15, 12, 0.82), rgba(16, 15, 12, 0.14) 62%);
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
}

.work-content h3 {
  margin: 0;
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 500;
  line-height: 1.18;
}

.work-content p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
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
}

.work-detail-btn span {
  display: inline-block;
  transition: transform 0.28s var(--ease-smooth);
}

.work-detail-btn:hover span,
.work-detail-btn:focus-visible span {
  transform: translate(2px, -2px);
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
