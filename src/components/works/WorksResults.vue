<template>
  <section v-if="works.length" class="works-grid">
    <article
      v-for="item in works"
      :key="item.id"
      class="work-card"
      role="button"
      tabindex="0"
      @click="$emit('open-detail', item.id)"
      @keyup.enter="$emit('open-detail', item.id)"
    >
      <div class="card-media">
        <img v-lazy-image="item.cover" :alt="item.name" />
      </div>
      <div class="card-caption">
        <span>{{ formatLabel(item) }}</span>
        <h2>{{ item.name }}</h2>
        <p>{{ formatMeta(item) }}</p>
        <button class="card-link" type="button" @click.stop="$emit('open-detail', item.id)">
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
      @click="$emit('page-change', currentPage - 1)"
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
        @click="$emit('page-change', page)"
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
      @click="$emit('page-change', currentPage + 1)"
    >
      →
    </button>
  </nav>
</template>

<script setup>
import vLazyImage from '@/directives/lazyImage'

defineProps({
  works: { type: Array, default: () => [] },
  totalPages: { type: Number, default: 1 },
  currentPage: { type: Number, default: 1 },
  paginationItems: { type: Array, default: () => [] },
  formatLabel: { type: Function, required: true },
  formatMeta: { type: Function, required: true }
})

defineEmits(['open-detail', 'page-change'])
</script>

<style scoped lang="scss">
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
