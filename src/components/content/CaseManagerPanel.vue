<template>
  <div class="manager-layout">
    <form class="case-form" @submit.prevent="$emit('submit')">
      <div class="form-title">
        <h2>{{ editingCase ? '编辑作品' : '新增作品' }}</h2>
        <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
        <button v-if="editingCase" type="button" class="plain-btn" @click="$emit('create')">新建</button>
      </div>

      <div ref="formScroll" class="case-form-scroll">
        <label class="field dh-field">
          <span>作品名称</span>
          <input v-model.trim="form.name" type="text" required placeholder="例如：东禾新办公室" />
        </label>

        <div class="form-grid dh-form-grid">
          <label class="field dh-field">
            <span>空间类型</span>
            <div class="select-control">
              <select v-model="form.category">
                <option v-for="tag in caseTags" :key="tag" :value="tag">{{ tag }}</option>
              </select>
            </div>
          </label>
          <label class="field dh-field">
            <span>设计风格</span>
            <div class="select-control">
              <select :value="selectedStyleOption" @change="$emit('style-option-change', $event)">
                <option value="">请选择设计风格</option>
                <option v-for="style in caseStylePresets" :key="style" :value="style">{{ style }}</option>
                <option :value="customStyleValue">自定义风格</option>
              </select>
            </div>
            <input
              v-if="customStyleEnabled"
              v-model.trim="form.style"
              class="custom-style-input"
              type="text"
              placeholder="输入自定义风格"
            />
          </label>
          <label class="field dh-field">
            <span>空间信息</span>
            <input v-model.trim="form.type" type="text" placeholder="例如：商业空间 / 上饶" />
          </label>
          <label class="field dh-field">
            <span>年份</span>
            <input v-model.trim="form.year" type="text" placeholder="例如：2026年" />
          </label>
        </div>

        <label class="field dh-field">
          <span>3D 链接</span>
          <input v-model.trim="form.url" type="url" placeholder="https://..." />
        </label>
        <label class="field dh-field">
          <span>水电底图</span>
          <input v-model.trim="form.blueprintUrl" type="url" placeholder="https://..." />
        </label>

        <CaseMediaFields
          :form="form"
          :cloud-enabled="cloudEnabled"
          :uploading="uploading"
          :cad-uploading="cadUploading"
          :video-uploading="videoUploading"
          :external-image-url="externalImageUrl"
          @cad-upload="$emit('cad-upload', $event)"
          @download-cad="$emit('download-cad')"
          @remove-cad="$emit('remove-cad')"
          @video-upload="$emit('video-upload', $event)"
          @remove-video="$emit('remove-video')"
          @image-upload="$emit('image-upload', $event)"
          @add-external-image="$emit('add-external-image')"
          @preview-image="(src, alt) => $emit('preview-image', src, alt)"
          @set-cover="$emit('set-cover', $event)"
          @remove-image="$emit('remove-image', $event)"
          @update:external-image-url="$emit('update:externalImageUrl', $event)"
        />

        <label class="field">
          <span>作品说明</span>
          <textarea v-model.trim="form.note" rows="3" placeholder="简单写一句这个案例的空间特点"></textarea>
        </label>
      </div>

      <div class="form-actions">
        <p>{{ statusText }}</p>
        <button type="submit" :disabled="saving || uploading || cadUploading || videoUploading">
          {{ uploading || cadUploading || videoUploading ? '上传中' : (saving ? '保存中' : (editingCase ? '保存修改' : '保存作品')) }}
        </button>
      </div>
    </form>

    <CaseSavedList
      :items="items"
      :page="page"
      :page-count="pageCount"
      :case-label="caseLabel"
      :format-case-meta="formatCaseMeta"
      :can-toggle-visibility="canToggleVisibility"
      :can-reset="canReset"
      :can-delete="canDelete"
      @preview-image="(src, alt) => $emit('preview-image', src, alt)"
      @edit="$emit('edit', $event)"
      @hide="$emit('hide', $event)"
      @restore="$emit('restore', $event)"
      @reset="$emit('reset', $event)"
      @delete="$emit('delete', $event)"
      @page-change="$emit('page-change', $event)"
    />
  </div>
</template>

<script setup>
/* eslint vue/no-mutating-props: "off" */
import { ref } from 'vue'
import CaseMediaFields from '@/components/content/CaseMediaFields.vue'
import CaseSavedList from '@/components/content/CaseSavedList.vue'

defineProps({
  form: { type: Object, required: true },
  editingCase: { type: Object, default: null },
  cloudEnabled: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false },
  cadUploading: { type: Boolean, default: false },
  videoUploading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  statusText: { type: String, default: '' },
  caseTags: { type: Array, default: () => [] },
  caseStylePresets: { type: Array, default: () => [] },
  customStyleValue: { type: String, default: '' },
  selectedStyleOption: { type: String, default: '' },
  customStyleEnabled: { type: Boolean, default: false },
  externalImageUrl: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },
  caseLabel: { type: Function, required: true },
  formatCaseMeta: { type: Function, required: true },
  canToggleVisibility: { type: Function, required: true },
  canReset: { type: Function, required: true },
  canDelete: { type: Function, required: true }
})

defineEmits([
  'submit',
  'create',
  'style-option-change',
  'cad-upload',
  'download-cad',
  'remove-cad',
  'video-upload',
  'remove-video',
  'image-upload',
  'add-external-image',
  'preview-image',
  'set-cover',
  'remove-image',
  'edit',
  'hide',
  'restore',
  'reset',
  'delete',
  'page-change',
  'update:externalImageUrl'
])

const formScroll = ref(null)

function resetScroll() {
  formScroll.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

defineExpose({ resetScroll })
</script>

<style scoped lang="scss">
.manager-layout { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(360px, 0.84fr) minmax(0, 1.16fr); gap: 24px; align-items: stretch; }
.case-form { min-height: 0; overflow: hidden; display: flex; flex-direction: column; padding: 0; border: 1px solid rgba(17, 22, 29, 0.1); background: #fff; }
.case-form > .form-title { flex: 0 0 auto; display: flex; align-items: center; gap: 14px; padding: 28px 28px 18px; }
.form-title h2 { margin: 0; font-size: 24px; font-weight: 500; }
.mode-badge { margin-right: auto; padding: 7px 10px; background: #eef2f7; color: #46515f; font-size: 13px; }
.plain-btn { border: 1px solid #d8dde4; background: #fff; color: #11161d; padding: 9px 14px; cursor: pointer; }
.case-form-scroll { flex: 1 1 auto; min-height: 0; display: grid; gap: 18px; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; padding: 0 28px 20px; scrollbar-color: #c5ccd5 transparent; scrollbar-width: thin; }
.select-control { position: relative; min-width: 0; }
.select-control::after { content: ''; position: absolute; top: 50%; right: 16px; width: 7px; height: 7px; border-right: 1.5px solid #69717d; border-bottom: 1.5px solid #69717d; pointer-events: none; transform: translateY(-70%) rotate(45deg); }
.select-control select { display: block; padding: 0 42px 0 13px; appearance: none; }
.select-control:focus-within::after { border-color: #11161d; transform: translateY(-35%) rotate(225deg); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.form-actions p { margin: 0; color: #69717d; }
.form-actions button { border: 0; background: #11161d; color: #fff; padding: 11px 16px; cursor: pointer; }
.form-actions button:disabled { opacity: 0.55; cursor: not-allowed; }
.case-form > .form-actions { flex: 0 0 auto; padding: 18px 28px 28px; border-top: 1px solid #eef0f3; background: #fff; }

@media (max-width: 1080px) {
  .manager-layout { grid-template-columns: 1fr; }
  .case-form { height: auto; max-height: none; overflow: visible; }
  .case-form-scroll { overflow: visible; }
}
@media (max-width: 760px) {
  .form-actions { align-items: stretch; flex-direction: column; }
}
</style>
