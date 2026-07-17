<template>
  <div class="works-page">
    <div class="works-shell">
      <header class="works-header">
        <div class="works-title">
          <span>PROJECT INDEX</span>
          <h1>项目索引</h1>
          <p>按空间类型、名称和年份查找项目，再进入完整画册阅读。</p>
        </div>

        <label class="works-search">
          <span>查找</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="输入名称、空间或年份"
            aria-label="搜索作品"
          />
        </label>

        <div class="filter-row">
          <button
            v-for="option in filterOptions"
            :key="option.label"
            :class="['filter-btn', { active: option.value === activeCategory }]"
            @click="setCategory(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </header>

      <section v-if="filteredWorks.length" class="works-grid">
        <article
          v-for="item in filteredWorks"
          :key="item.id"
          class="work-card"
          role="button"
          tabindex="0"
          @click="openDetail(item.id)"
          @keyup.enter="openDetail(item.id)"
        >
          <div class="card-media">
            <img :src="item.cover" :alt="item.name" loading="lazy" decoding="async" />
          </div>
          <div class="card-caption">
          <span>{{ item.category }}</span>
          <h2>{{ item.name }}</h2>
          <p>{{ item.type }} / {{ item.year }}</p>
          <button class="card-link" type="button" @click.stop="openDetail(item.id)">
            阅读项目
            <span>↗</span>
          </button>
        </div>
      </article>
      </section>

      <p v-else class="works-empty">暂无匹配作品</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorksGalleryView'
}
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDisplayWorksList, tags } from '@/mock/data'

const router = useRouter()
const route = useRoute()
const displayWorks = ref(getDisplayWorksList())
const searchQuery = ref('')

const filterOptions = [
  { label: '全部', value: tags[0] },
  { label: '商业空间', value: tags[1] },
  { label: '办公空间', value: tags[2] },
  { label: '居住空间', value: tags[3] }
]

function normalizeCategory(category) {
  const value = String(category || tags[0])
  return filterOptions.some((option) => option.value === value) ? value : tags[0]
}

const activeCategory = ref(normalizeCategory(route.query.category))

const filteredWorks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const categoryWorks = activeCategory.value === tags[0]
    ? displayWorks.value
    : displayWorks.value.filter((item) => item.category === activeCategory.value)

  if (!query) {
    return categoryWorks
  }

  return categoryWorks.filter((item) => {
    return [item.name, item.category, item.type, item.year]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })
})

function setCategory(category) {
  const nextCategory = normalizeCategory(category)
  activeCategory.value = nextCategory
  router.replace({
    name: 'worksGallery',
    query: nextCategory === tags[0] ? {} : { category: nextCategory }
  })
}

function openDetail(id) {
  router.push({ name: 'designDetail', params: { id } })
}

function refreshWorks() {
  displayWorks.value = getDisplayWorksList()
}

onMounted(() => {
  window.addEventListener('donghe-custom-cases-updated', refreshWorks)
})

watch(
  () => route.query.category,
  (category) => {
    activeCategory.value = normalizeCategory(category)
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('donghe-custom-cases-updated', refreshWorks)
})
</script>

<style scoped lang="scss">
.works-page {
  min-height: calc(100vh - var(--nav-height));
  min-height: calc(100svh - var(--nav-height));
  padding: 68px 0 96px;
  background: var(--color-paper);
}

.works-shell {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.works-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  gap: 28px 64px;
  align-items: end;
  padding-bottom: 38px;
  border-bottom: 1px solid var(--color-line);
}

.works-title span {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.works-title h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(42px, 7vw, 86px);
  font-weight: 500;
  line-height: 0.98;
}

.works-title p {
  max-width: 520px;
  margin: 22px 0 0;
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.8;
}

.works-search {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--color-ink);
  background: transparent;
}

.works-search span {
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.works-search input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  font-size: 15px;
}

.works-search input::placeholder {
  color: var(--color-muted);
}

.filter-row {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  height: 38px;
  border: 1px solid var(--color-line);
  background: transparent;
  padding: 0 16px;
  color: var(--color-ink-soft);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.24s ease, color 0.24s ease, border-color 0.24s ease;
}

.filter-btn.active,
.filter-btn:hover {
  border-color: var(--color-olive);
  background: var(--color-olive);
  color: #fff;
}

.works-grid {
  margin-top: 42px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 34px 24px;
}

.works-empty {
  margin: 56px 0 0;
  color: var(--color-muted);
  font-size: 15px;
}

.work-card {
  display: grid;
  gap: 16px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.work-card:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 4px;
}

.card-media {
  position: relative;
  overflow: hidden;
  background: var(--color-stone);
  aspect-ratio: 4 / 3;
}

.card-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02);
  transition: transform 0.8s var(--ease-smooth), filter 0.35s ease;
}

.work-card:hover img,
.work-card:focus-visible img {
  transform: scale(1.045);
  filter: saturate(1) contrast(1.04);
}

.card-caption {
  display: grid;
  gap: 8px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--color-line);
}

.card-caption span {
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 2.2px;
}

.card-caption h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 500;
  line-height: 1.25;
}

.card-caption p {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
}

.card-link {
  margin-top: 8px;
  justify-self: start;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-ink);
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  letter-spacing: 0.06em;
}

.card-link span {
  transition: transform 0.28s var(--ease-smooth);
}

.card-link:hover span,
.card-link:focus-visible span {
  transform: translate(2px, -2px);
}

@media (max-width: 1100px) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .works-page {
    padding: 46px 0 72px;
  }

  .works-shell {
    width: calc(100% - 36px);
  }

  .works-header {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .works-title h1 {
    font-size: 44px;
  }

  .works-grid {
    margin-top: 34px;
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
