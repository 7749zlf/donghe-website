<template>
  <section class="saved-panel">
    <div class="saved-head">
      <div>
        <h2>全部作品</h2>
        <p>现有作品可编辑、隐藏或恢复默认；新增作品可编辑或删除。</p>
      </div>
      <span>{{ items.length }} 个</span>
    </div>

    <div class="saved-list">
      <article v-for="item in items" :key="item.id" class="saved-item" :class="{ muted: item.hidden }">
        <button class="saved-image-button" type="button" @click="$emit('preview-image', item.image, item.name)">
          <img v-lazy-image="item.image" :alt="item.name" />
        </button>
        <div class="saved-copy">
          <div class="item-head">
            <h3>{{ item.name }}</h3>
            <span>{{ caseLabel(item) }}</span>
          </div>
          <p>{{ formatCaseMeta(item) }}</p>
          <p class="item-note">{{ item.hidden ? '已隐藏，不会在前台展示。' : item.note }}</p>
          <div class="item-actions">
            <button type="button" @click="$emit('edit', item)">编辑</button>
            <button v-if="canToggleVisibility(item) && !item.hidden" type="button" @click="$emit('hide', item.id)">隐藏</button>
            <button v-if="canToggleVisibility(item) && item.hidden" type="button" @click="$emit('restore', item.id)">显示</button>
            <button v-if="canReset(item)" type="button" @click="$emit('reset', item.id)">恢复默认</button>
            <button v-if="canDelete(item)" type="button" class="danger" @click="$emit('delete', item.id)">删除</button>
          </div>
        </div>
      </article>
    </div>

    <nav v-if="pageCount > 1" class="manager-pagination" aria-label="后台作品列表分页">
      <button type="button" :disabled="page === 1" aria-label="上一页" @click="$emit('page-change', page - 1)">←</button>
      <span>第 {{ page }} / {{ pageCount }} 页</span>
      <button type="button" :disabled="page === pageCount" aria-label="下一页" @click="$emit('page-change', page + 1)">→</button>
    </nav>
  </section>
</template>

<script setup>
import vLazyImage from '@/directives/lazyImage'

defineProps({
  items: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },
  caseLabel: { type: Function, required: true },
  formatCaseMeta: { type: Function, required: true },
  canToggleVisibility: { type: Function, required: true },
  canReset: { type: Function, required: true },
  canDelete: { type: Function, required: true }
})

defineEmits(['preview-image', 'edit', 'hide', 'restore', 'reset', 'delete', 'page-change'])
</script>

<style scoped lang="scss">
.saved-panel { min-height: 0; overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(17, 22, 29, 0.1); background: #fff; }
.saved-head { flex: 0 0 auto; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 26px 26px 18px; }
.saved-head h2 { margin: 0; font-size: 24px; font-weight: 500; }
.saved-head p { margin: 0; color: #69717d; }
.saved-head span,
.item-head span { color: #69717d; font-size: 13px; white-space: nowrap; }
.saved-list { flex: 1 1 auto; min-height: 0; display: grid; gap: 14px; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; padding: 0 26px 26px; scrollbar-color: #c5ccd5 transparent; scrollbar-width: thin; }
.saved-item { display: grid; grid-template-columns: 150px 1fr; gap: 16px; align-items: center; border: 1px solid #e2e5e9; padding: 12px; }
.saved-item.muted { opacity: 0.58; background: #f7f7f7; }
.saved-item img { width: 150px; aspect-ratio: 4 / 3; opacity: 1; object-fit: cover; background: #ddd; transition: opacity 0.3s ease; }
.saved-item img.lazy-image:not(.is-loaded) { opacity: 0; }
.saved-image-button { width: 150px; border: 0; padding: 0; background: transparent; cursor: zoom-in; }
.saved-image-button img { display: block; }
.saved-image-button:focus-visible { outline: 2px solid #11161d; outline-offset: 2px; }
.saved-copy { min-width: 0; }
.saved-item h3,
.saved-item p { margin: 0; }
.saved-item h3 { font-size: 20px; font-weight: 500; }
.saved-item p { margin-top: 8px; color: #69717d; }
.item-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.item-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; margin-top: 14px; }
.item-actions button { border: 0; background: #2f3640; color: #fff; padding: 8px 12px; cursor: pointer; }
.item-actions .danger { background: #8b2f2f; }
.manager-pagination { flex: 0 0 auto; min-height: 64px; display: flex; align-items: center; justify-content: center; gap: 14px; border-top: 1px solid #eef0f3; padding: 10px 26px; background: #fff; }
.manager-pagination span { min-width: 92px; color: #69717d; font-size: 14px; text-align: center; }
.manager-pagination button { width: 40px; height: 40px; border: 1px solid #d8dde4; background: #fff; color: #11161d; font: inherit; cursor: pointer; }
.manager-pagination button:hover,
.manager-pagination button:focus-visible { border-color: #11161d; background: #11161d; color: #fff; }
.manager-pagination button:focus-visible { outline: 2px solid rgba(17, 22, 29, 0.16); outline-offset: 2px; }
.manager-pagination button:disabled { opacity: 0.35; cursor: not-allowed; }
.manager-pagination button:disabled:hover { border-color: #d8dde4; background: #fff; color: #11161d; }

@media (max-width: 1080px) {
  .saved-panel { height: auto; max-height: none; overflow: visible; }
  .saved-list { overflow: visible; }
}
@media (max-width: 760px) {
  .saved-item { grid-template-columns: 1fr; }
  .saved-head,
  .item-head { align-items: stretch; flex-direction: column; }
  .saved-item img,
  .saved-image-button { width: 100%; }
  .manager-pagination { padding-inline: 18px; }
}
</style>
