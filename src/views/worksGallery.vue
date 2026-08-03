<template>
  <div class="works-page">
    <div class="works-shell">
      <header class="works-header">
        <div class="works-title">
          <span>PROJECT INDEX</span>
          <h1>项目索引</h1>
          <p>按空间类型、设计风格、名称和年份查找项目，再进入完整画册阅读。</p>
        </div>

        <label class="works-search">
          <span>查找</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="输入名称、空间、风格或年份"
            aria-label="搜索作品"
          />
        </label>

        <div class="filter-groups">
          <label class="filter-select">
            <span>空间</span>
            <select :value="activeCategory" @change="setCategory($event.target.value)">
              <option v-for="option in spaceOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label v-if="styleOptions.length > 1" class="filter-select">
            <span>风格</span>
            <select :value="activeStyle" @change="setStyle($event.target.value)">
              <option v-for="option in styleOptions" :key="option.value || 'all-styles'" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>
      </header>

      <section v-if="filteredWorks.length" class="works-grid">
        <article
          v-for="item in paginatedWorks"
          :key="item.id"
          class="work-card"
          role="button"
          tabindex="0"
          @click="openDetail(item.id)"
          @keyup.enter="openDetail(item.id)"
        >
          <div class="card-media">
            <img v-lazy-image="item.cover" :alt="item.name" />
          </div>
          <div class="card-caption">
            <span>{{ formatProjectLabel(item) }}</span>
            <h2>{{ item.name }}</h2>
            <p>{{ formatProjectMeta(item) }}</p>
            <button class="card-link" type="button" @click.stop="openDetail(item.id)">
              阅读项目
              <span>↗</span>
            </button>
          </div>
        </article>
      </section>

      <p v-else class="works-empty">暂无匹配作品</p>

      <nav v-if="totalPages > 1" class="pagination" aria-label="项目列表分页">
        <button
          class="pagination-arrow"
          type="button"
          :disabled="currentPage === 1"
          aria-label="上一页"
          @click="setPage(currentPage - 1)"
        >
          ←
        </button>
        <template v-for="(page, index) in paginationItems" :key="page || `ellipsis-${index}`">
          <button
            v-if="page"
            class="pagination-page"
            :class="{ active: page === currentPage }"
            type="button"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="setPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis" aria-hidden="true">...</span>
        </template>
        <button
          class="pagination-arrow"
          type="button"
          :disabled="currentPage === totalPages"
          aria-label="下一页"
          @click="setPage(currentPage + 1)"
        >
          →
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorksGalleryView'
}
</script>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDisplayWorksList, tags } from '@/mock/data'
import vLazyImage from '@/directives/lazyImage'

const router = useRouter()
const route = useRoute()
const displayWorks = ref(getDisplayWorksList())
const searchQuery = ref('')
const PAGE_SIZE = 9

const spaceOptions = [
  { label: '全部空间', value: tags[0] },
  { label: '商业空间', value: tags[1] },
  { label: '办公空间', value: tags[2] },
  { label: '居住空间', value: tags[3] }
]

// 只展示当前作品实际使用的风格，避免用户选中后得到无意义的空结果。
const styleOptions = computed(() => {
  const styles = new Set()

  displayWorks.value.forEach((item) => {
    if (item.style) {
      styles.add(item.style)
    }
  })

  return [
    { label: '全部风格', value: '' },
    ...[...styles].map((style) => ({ label: style, value: style }))
  ]
})

/**
 * 校验空间筛选值，未知值统一回退为“全部空间”。
 * @param {*} category 路由参数或用户选择的空间值。
 * @returns {string} 可用于筛选的有效空间值。
 */
function normalizeCategory(category) {
  const value = String(category || tags[0])
  return spaceOptions.some((option) => option.value === value) ? value : tags[0]
}

/**
 * 将风格筛选值转换为去除首尾空格的字符串。
 * @param {*} style 路由参数或用户选择的风格值。
 * @returns {string} 标准化后的风格值，空字符串表示全部风格。
 */
function normalizeStyle(style) {
  return String(style || '').trim()
}

/**
 * 将路由页码转换为不小于 1 的整数。
 * @param {*} page 路由参数或目标页码。
 * @returns {number} 标准化页码。
 */
function normalizePage(page) {
  const value = Number.parseInt(String(page || '1'), 10)
  return Number.isFinite(value) && value > 0 ? value : 1
}

const activeCategory = ref(normalizeCategory(route.query.category))
const activeStyle = ref(normalizeStyle(route.query.style))

// 先收窄空间和风格范围，再在结果内执行关键词搜索。
const filteredWorks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const categoryWorks = activeCategory.value === tags[0]
    ? displayWorks.value
    : displayWorks.value.filter((item) => item.category === activeCategory.value)
  const styleWorks = activeStyle.value
    ? categoryWorks.filter((item) => item.style === activeStyle.value)
    : categoryWorks

  if (!query) {
    return styleWorks
  }

  return styleWorks.filter((item) => {
    return [item.name, item.category, item.style, item.type, item.year]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredWorks.value.length / PAGE_SIZE)))
const initialPage = normalizePage(route.query.page)
const currentPage = ref(filteredWorks.value.length ? Math.min(totalPages.value, initialPage) : initialPage)
const paginatedWorks = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredWorks.value.slice(start, start + PAGE_SIZE)
})
const paginationItems = computed(() => createPaginationItems(currentPage.value, totalPages.value))

/**
 * 生成包含首尾页、当前页邻近页和省略号的紧凑页码列表。
 * @param {number} current 当前页码。
 * @param {number} total 总页数。
 * @returns {Array<number|null>} 页码列表，null 表示省略号。
 */
function createPaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right)

  return pages.reduce((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      items.push(null)
    }
    items.push(page)
    return items
  }, [])
}

/**
 * 更新当前空间筛选，并将结果同步到页面网址。
 * @param {*} category 用户选择的空间值。
 * @returns {void}
 */
function setCategory(category) {
  activeCategory.value = normalizeCategory(category)
  currentPage.value = 1
  updateQuery()
}

/**
 * 更新当前风格筛选，并将结果同步到页面网址。
 * @param {*} style 用户选择的风格值。
 * @returns {void}
 */
function setStyle(style) {
  activeStyle.value = normalizeStyle(style)
  currentPage.value = 1
  updateQuery()
}

/**
 * 切换项目列表页码、同步 URL，并将新结果滚动到可视区域。
 * @param {*} page 目标页码。
 * @returns {void}
 */
function setPage(page) {
  const nextPage = Math.min(totalPages.value, normalizePage(page))

  if (nextPage === currentPage.value) {
    return
  }

  currentPage.value = nextPage
  updateQuery()
  nextTick(() => {
    document.querySelector('.works-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

/**
 * 将有效筛选条件写入 URL，全部选项不生成冗余参数。
 * @returns {void}
 */
function updateQuery() {
  const query = {}
  if (activeCategory.value !== tags[0]) {
    query.category = activeCategory.value
  }
  if (activeStyle.value) {
    query.style = activeStyle.value
  }
  if (currentPage.value > 1) {
    query.page = String(currentPage.value)
  }

  router.replace({
    name: 'worksGallery',
    query
  })
}

/**
 * 组合项目的空间类型与设计风格，作为卡片分类标签。
 * @param {Object} item 项目数据。
 * @returns {string} 已过滤空值的分类标签。
 */
function formatProjectLabel(item) {
  return [item.category, item.style].filter(Boolean).join(' · ')
}

/**
 * 组合项目类型与完成年份，作为卡片辅助信息。
 * @param {Object} item 项目数据。
 * @returns {string} 已过滤空值的项目辅助信息。
 */
function formatProjectMeta(item) {
  return [item.type, item.year].filter(Boolean).join(' / ')
}

/**
 * 跳转到指定项目的详情页。
 * @param {string|number} id 项目唯一标识。
 * @returns {void}
 */
function openDetail(id) {
  router.push({ name: 'designDetail', params: { id } })
}

/**
 * 重新读取作品数据，用于响应后台内容更新事件。
 * @returns {void}
 */
function refreshWorks() {
  displayWorks.value = getDisplayWorksList()
}

onMounted(() => {
  window.addEventListener('donghe-custom-cases-updated', refreshWorks)
})

watch(
  () => [route.query.category, route.query.style, route.query.page],
  ([category, style, page]) => {
    activeCategory.value = normalizeCategory(category)
    activeStyle.value = normalizeStyle(style)
    currentPage.value = Math.min(totalPages.value, normalizePage(page))
  }
)

watch(searchQuery, () => {
  if (currentPage.value > 1) {
    currentPage.value = 1
    updateQuery()
  }
})

watch(totalPages, (total) => {
  if (currentPage.value > total) {
    currentPage.value = total
    updateQuery()
  }
})

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

.filter-groups {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.filter-select {
  width: min(240px, 100%);
  display: grid;
  gap: 8px;
}

.filter-select span {
  color: var(--color-muted);
  font-size: 13px;
}

.filter-select select {
  width: 100%;
  height: 44px;
  border: 1px solid var(--color-line);
  background: transparent;
  padding: 0 12px;
  color: var(--color-ink);
  font: inherit;
  cursor: pointer;
}

.filter-select select:focus {
  outline: 2px solid rgba(95, 94, 65, 0.18);
  outline-offset: 2px;
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
  opacity: 1;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02);
  transition: opacity 0.4s ease, transform 0.8s var(--ease-smooth), filter 0.35s ease;
}

.card-media img.lazy-image:not(.is-loaded) {
  opacity: 0;
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

.pagination {
  min-height: 44px;
  margin-top: 48px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pagination button {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-line);
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.pagination button:hover,
.pagination button:focus-visible,
.pagination-page.active {
  border-color: var(--color-ink);
  background: var(--color-ink);
  color: #fff;
}

.pagination button:focus-visible {
  outline: 2px solid rgba(42, 39, 31, 0.18);
  outline-offset: 2px;
}

.pagination button:disabled {
  opacity: 0.32;
  cursor: not-allowed;
}

.pagination button:disabled:hover {
  border-color: var(--color-line);
  background: transparent;
  color: var(--color-ink);
}

.pagination-ellipsis {
  width: 28px;
  color: var(--color-muted);
  text-align: center;
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

  .filter-select {
    width: 100%;
  }

  .works-grid {
    margin-top: 34px;
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .pagination {
    margin-top: 38px;
    gap: 6px;
  }

  .pagination button {
    width: 40px;
    height: 40px;
  }
}
</style>
