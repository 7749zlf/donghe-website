<template>
  <section id="works" class="section works">
    <div class="section-title">
      <h2>设计作品</h2>
      <span class="title-line"></span>
    </div>

    <div class="container work-controls">
      <label class="work-search">
        <span>搜索</span>
        <input
          :value="searchQuery"
          type="search"
          placeholder="作品名称、空间、年份"
          aria-label="搜索设计作品"
          @input="$emit('update-search', $event.target.value)"
        />
      </label>
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
        v-for="item in projects"
        :key="item.id"
        class="work-card"
        role="button"
        tabindex="0"
        @click="$emit('view-detail', item.id)"
        @keyup.enter="$emit('view-detail', item.id)"
      >
        <div class="work-image-wrap">
          <img :src="item.image" :alt="item.name" loading="lazy" decoding="async" />
          <div class="work-overlay">
            <span>{{ item.name }}</span>
          </div>
        </div>
        <div class="work-content">
          <h4>{{ item.name }}</h4>
          <p>{{ item.type }}</p>
          <div class="work-meta">
            <span>{{ item.year }}</span>
            <button class="work-detail-btn" @click.stop="$emit('view-detail', item.id)">查看详情 →</button>
          </div>
        </div>
      </article>
    </div>

    <p v-else class="container work-empty">暂无匹配作品</p>

    <button class="more-btn" @click="$emit('view-more')">查看更多作品</button>
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
  searchQuery: {
    type: String,
    default: ''
  },
  projects: {
    type: Array,
    default: () => []
  }
})

defineEmits(['change-tag', 'update-search', 'view-detail', 'view-more'])

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

.work-controls {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.work-search {
  width: min(520px, 100%);
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  padding: 0 18px;
}

.work-search span {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.work-search input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 15px;
}

.work-search input::placeholder {
  color: var(--text-muted);
}

.work-tags {
  margin-bottom: 48px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.tag {
  height: 38px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.tag.active {
  background: #1f2937;
  color: #fff;
  border-color: #1f2937;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(3, 400px);
  gap: 32px;
}

.work-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.work-card:focus-visible {
  outline: 2px solid #1f2937;
  outline-offset: 2px;
}

.work-image-wrap {
  position: relative;
  width: 400px;
  height: 520px;
  overflow: hidden;
}

.work-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.work-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  opacity: 0;
  transition: opacity 0.25s ease;
  font-size: 24px;
  font-weight: 600;
}

.work-card:hover .work-overlay {
  opacity: 1;
}

.work-card:hover img {
  transform: scale(1.04);
}

.work-content {
  padding: 24px;
}

.work-content h4 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
}

.work-content p {
  margin: 8px 0 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.work-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.work-meta span {
  color: var(--text-muted);
  font-size: 14px;
}

.work-detail-btn {
  border: none;
  background: transparent;
  padding: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.work-detail-btn:hover {
  color: #111827;
  transform: translateX(2px);
}

.work-detail-btn:focus-visible {
  outline: 2px solid #1f2937;
  outline-offset: 2px;
  border-radius: 4px;
}

.work-empty {
  margin: 0 auto;
  padding: 48px 0 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
}

.more-btn {
  display: block;
  margin: 48px auto 0;
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }

  .work-grid {
    grid-template-columns: 1fr;
  }

  .work-image-wrap {
    width: 100%;
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

  .work-tags {
    grid-template-columns: repeat(2, 1fr);
  }

  .work-search {
    height: 46px;
    padding: 0 14px;
  }
}
</style>
