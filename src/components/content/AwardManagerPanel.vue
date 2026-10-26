<template>
  <div class="manager-layout">
    <form class="case-form" @submit.prevent="$emit('submit')">
      <div class="form-title">
        <h2>{{ editingAward ? '编辑奖项' : '新增奖项' }}</h2>
        <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
        <button v-if="editingAward" type="button" class="plain-btn" @click="$emit('create')">新建</button>
      </div>

      <div ref="formScroll" class="case-form-scroll">
        <label class="field">
          <span>奖项名称</span>
          <input v-model.trim="awardForm.title" type="text" required placeholder="例如：年度设计奖" />
        </label>

        <div class="form-grid award-form-grid">
          <label class="field">
            <span>年份 / 时间</span>
            <input v-model.trim="awardForm.year" type="text" placeholder="例如：2026年" />
          </label>

          <label class="field wide-field">
            <span>图片说明</span>
            <input v-model.trim="awardForm.imageAlt" type="text" placeholder="例如：年度设计奖证书" />
          </label>
        </div>

        <label class="field">
          <span>奖项说明</span>
          <textarea v-model.trim="awardForm.desc" rows="3" placeholder="例如：由某某设计协会颁发"></textarea>
        </label>

        <div class="field upload-field">
          <span>奖项图片</span>
          <label class="upload-box">
            <input type="file" accept="image/*" @change="$emit('image-upload', $event)" />
            <strong>{{ awardUploading ? '正在上传图片' : '选择奖项图片' }}</strong>
            <small>{{ cloudEnabled ? '图片会上传到云端图库' : '本地模式会保存到当前浏览器' }}</small>
          </label>

          <div class="external-image-entry">
            <input
              :value="externalImageUrl"
              type="url"
              placeholder="https:// 外部图片链接"
              aria-label="外部奖项图片链接"
              @input="$emit('update:externalImageUrl', $event.target.value.trim())"
              @keyup.enter.prevent="$emit('add-external-image')"
            />
            <button type="button" @click="$emit('add-external-image')">添加链接</button>
          </div>

          <div v-if="awardForm.image" class="upload-preview-grid award-preview-grid">
            <article class="upload-preview">
              <button
                class="preview-image-button"
                type="button"
                @click="$emit('preview-image', awardForm.image, awardForm.imageAlt || awardForm.title)"
              >
                <img :src="awardForm.image" :alt="awardForm.imageAlt || awardForm.title || '奖项图片'" loading="lazy" decoding="async" />
                <span>放大</span>
              </button>
              <div class="preview-actions">
                <span>当前图片</span>
                <button type="button" @click="$emit('remove-image')">删除</button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <p>{{ statusText }}</p>
        <button type="submit" :disabled="awardSaving || awardUploading">
          {{ awardUploading ? '上传图片中' : (awardSaving ? '保存中' : (editingAward ? '保存修改' : '保存奖项')) }}
        </button>
      </div>
    </form>

    <section class="saved-panel">
      <div class="saved-head">
        <div>
          <h2>全部奖项</h2>
          <p>现有奖项可编辑、隐藏或恢复默认；新增奖项可编辑或删除。</p>
        </div>
        <span>{{ items.length }} 个</span>
      </div>

      <div class="saved-list">
        <article
          v-for="item in items"
          :key="item.id"
          class="saved-item"
          :class="{ muted: item.hidden }"
        >
          <button
            class="saved-image-button"
            type="button"
            @click="$emit('preview-image', item.image, item.imageAlt || item.title)"
          >
            <img :src="item.image" :alt="item.imageAlt || item.title" loading="lazy" decoding="async" />
          </button>
          <div class="saved-copy">
            <div class="item-head">
              <h3>{{ item.title }}</h3>
              <span>{{ awardLabel(item) }}</span>
            </div>
            <p>{{ item.year }}</p>
            <p class="item-note">{{ item.hidden ? '已隐藏，不会在前台展示。' : item.desc }}</p>
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
    </section>
  </div>
</template>

<script setup>
/* eslint vue/no-mutating-props: "off" */
import { ref } from 'vue'

defineProps({
  awardForm: { type: Object, required: true },
  editingAward: { type: Object, default: null },
  cloudEnabled: { type: Boolean, default: false },
  awardUploading: { type: Boolean, default: false },
  awardSaving: { type: Boolean, default: false },
  externalImageUrl: { type: String, default: '' },
  statusText: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  awardLabel: { type: Function, required: true },
  canToggleVisibility: { type: Function, required: true },
  canReset: { type: Function, required: true },
  canDelete: { type: Function, required: true }
})

defineEmits([
  'submit',
  'create',
  'image-upload',
  'add-external-image',
  'preview-image',
  'remove-image',
  'edit',
  'hide',
  'restore',
  'reset',
  'delete',
  'update:externalImageUrl'
])

const formScroll = ref(null)

function resetScroll() {
  formScroll.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

defineExpose({ resetScroll })
</script>

<style scoped lang="scss">
.manager-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(360px, 0.84fr) minmax(0, 1.16fr);
  gap: 24px;
  align-items: stretch;
}

.case-form,
.saved-panel {
  border: 1px solid rgba(17, 22, 29, 0.1);
  background: #fff;
}

.case-form {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.case-form > .form-title {
  flex: 0 0 auto;
  padding: 28px 28px 18px;
}

.case-form-scroll {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  gap: 18px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 28px 20px;
  scrollbar-color: #c5ccd5 transparent;
  scrollbar-width: thin;
}

.form-title,
.saved-head,
.item-head,
.item-actions { display: flex; align-items: center; gap: 14px; }
.form-title,
.saved-head,
.item-head { justify-content: space-between; }
.form-title h2,
.saved-head h2 { margin: 0; font-size: 24px; font-weight: 500; }
.plain-btn { border: 1px solid #d8dde4; background: #fff; color: #11161d; padding: 9px 14px; cursor: pointer; }
.mode-badge { margin-right: auto; padding: 7px 10px; background: #eef2f7; color: #46515f; font-size: 13px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.award-form-grid { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); }
.field { display: grid; gap: 8px; }
.field span { color: #242a32; font-size: 15px; }
.field input,
.field select,
.field textarea,
.external-image-entry input {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #d8dde4;
  background: #fbfbfb;
  color: #11161d;
  padding: 12px 13px;
  font: inherit;
}
.field input,
.field select { height: 46px; }
.field textarea { resize: vertical; }
.upload-field { gap: 12px; }
.upload-box { position: relative; display: grid; gap: 6px; border: 1px dashed #c8d0da; background: #fbfbfb; padding: 18px; cursor: pointer; }
.upload-box input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.upload-box strong { color: #11161d; font-size: 16px; font-weight: 500; }
.upload-box small { color: #69717d; font-size: 13px; }
.external-image-entry { display: flex; gap: 8px; }
.external-image-entry input { min-width: 0; background: #fff; padding: 10px 12px; }
.external-image-entry button { flex: 0 0 auto; border: 1px solid #11161d; background: #11161d; color: #fff; padding: 0 14px; cursor: pointer; }
.upload-preview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.award-preview-grid { grid-template-columns: minmax(0, 1fr); }
.upload-preview { border: 1px solid #e2e5e9; background: #fff; }
.preview-image-button,
.saved-image-button { border: 0; padding: 0; background: transparent; cursor: zoom-in; }
.preview-image-button { position: relative; display: block; width: 100%; }
.preview-image-button span { position: absolute; right: 8px; bottom: 8px; padding: 5px 8px; background: rgba(17, 22, 29, 0.82); color: #fff; font-size: 12px; opacity: 0; transition: opacity 0.2s ease; }
.preview-image-button:hover span,
.preview-image-button:focus-visible span { opacity: 1; }
.preview-image-button:focus-visible,
.saved-image-button:focus-visible { outline: 2px solid #11161d; outline-offset: 2px; }
.upload-preview img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #ddd; }
.preview-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; padding: 8px; }
.preview-actions span,
.saved-head span,
.item-head span { color: #69717d; font-size: 13px; }
.preview-actions button { border: 1px solid #d8dde4; background: #fff; color: #11161d; padding: 6px 8px; cursor: pointer; }
.preview-actions button:last-child { color: #8b2f2f; }
.form-actions { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
.form-actions p,
.saved-head p,
.item-note { margin: 0; color: #69717d; }
.form-actions button,
.item-actions button { border: 0; background: #11161d; color: #fff; padding: 11px 16px; cursor: pointer; }
.form-actions button:disabled { opacity: 0.55; cursor: not-allowed; }
.case-form > .form-actions { flex: 0 0 auto; padding: 18px 28px 28px; border-top: 1px solid #eef0f3; background: #fff; }
.saved-panel { min-height: 0; overflow: hidden; display: flex; flex-direction: column; padding: 0; }
.saved-head { flex: 0 0 auto; margin-bottom: 0; align-items: flex-start; padding: 26px 26px 18px; }
.saved-list { flex: 1 1 auto; min-height: 0; display: grid; gap: 14px; overflow-y: auto; padding: 0 26px 26px; scrollbar-color: #c5ccd5 transparent; scrollbar-width: thin; }
.saved-item { display: grid; grid-template-columns: 150px 1fr; gap: 16px; align-items: center; border: 1px solid #e2e5e9; padding: 12px; }
.saved-item.muted { opacity: 0.58; background: #f7f7f7; }
.saved-item img { width: 150px; aspect-ratio: 4 / 3; object-fit: cover; background: #ddd; }
.saved-image-button { width: 150px; }
.saved-image-button img { display: block; }
.saved-copy { min-width: 0; }
.saved-item h3,
.saved-item p { margin: 0; }
.saved-item h3 { font-size: 20px; font-weight: 500; }
.saved-item p { margin-top: 8px; color: #69717d; }
.item-actions { margin-top: 14px; flex-wrap: wrap; }
.item-actions button { background: #2f3640; padding: 8px 12px; }
.item-actions .danger { background: #8b2f2f; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1080px) {
  .manager-layout { grid-template-columns: 1fr; }
  .case-form,
  .saved-panel { height: auto; max-height: none; overflow: visible; }
  .case-form-scroll,
  .saved-list { overflow: visible; }
}

@media (max-width: 760px) {
  .form-grid,
  .award-form-grid,
  .upload-preview-grid,
  .saved-item { grid-template-columns: 1fr; }
  .form-actions,
  .saved-head,
  .item-head,
  .external-image-entry { align-items: stretch; flex-direction: column; }
  .external-image-entry button { min-height: 42px; }
  .saved-item img,
  .saved-image-button { width: 100%; }
}
</style>
