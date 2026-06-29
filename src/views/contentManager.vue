<template>
  <main class="manager-page">
    <section class="manager-shell">
      <header class="manager-header">
        <p>内容管理</p>
        <h1>管理官网作品</h1>
      </header>

      <div class="manager-layout">
        <form class="case-form" @submit.prevent="handleSubmit">
          <div class="form-title">
            <h2>{{ isEditing ? '编辑作品' : '新增作品' }}</h2>
            <button v-if="isEditing" type="button" class="plain-btn" @click="startCreate">新建</button>
          </div>

          <label class="field">
            <span>作品名称</span>
            <input v-model.trim="form.name" type="text" required placeholder="例如：东禾新办公室" />
          </label>

          <div class="form-grid">
            <label class="field">
              <span>分类</span>
              <select v-model="form.category">
                <option v-for="tag in caseTags" :key="tag" :value="tag">{{ tag }}</option>
              </select>
            </label>

            <label class="field">
              <span>空间信息</span>
              <input v-model.trim="form.type" type="text" placeholder="例如：商业空间 / 上饶" />
            </label>

            <label class="field">
              <span>年份</span>
              <input v-model.trim="form.year" type="text" placeholder="例如：2026年" />
            </label>
          </div>

          <label class="field">
            <span>3D 链接</span>
            <input v-model.trim="form.url" type="url" placeholder="https://..." />
          </label>

          <label class="field">
            <span>图片链接</span>
            <textarea v-model.trim="form.images" rows="6" required placeholder="每行粘贴一张图片链接，第一张会作为封面"></textarea>
          </label>

          <label class="field">
            <span>作品说明</span>
            <textarea v-model.trim="form.note" rows="3" placeholder="简单写一句这个案例的空间特点"></textarea>
          </label>

          <div class="form-actions">
            <p>{{ statusText }}</p>
            <button type="submit">{{ isEditing ? '保存修改' : '保存作品' }}</button>
          </div>
        </form>

        <section class="saved-panel">
          <div class="saved-head">
            <div>
              <h2>全部作品</h2>
              <p>现有作品可编辑、隐藏或恢复默认；新增作品可编辑或删除。</p>
            </div>
            <span>{{ managedCases.length }} 个</span>
          </div>

          <div class="saved-list">
            <article
              v-for="item in managedCases"
              :key="item.id"
              class="saved-item"
              :class="{ muted: item.hidden }"
            >
              <img :src="item.image" :alt="item.name" />
              <div class="saved-copy">
                <div class="item-head">
                  <h3>{{ item.name }}</h3>
                  <span>{{ item.source === 'base' ? '原有作品' : '新增作品' }}</span>
                </div>
                <p>{{ item.type }} · {{ item.year }}</p>
                <p class="item-note">{{ item.hidden ? '已隐藏，不会在前台展示。' : item.note }}</p>
                <div class="item-actions">
                  <button type="button" @click="editCase(item)">编辑</button>
                  <button v-if="item.source === 'base' && !item.hidden" type="button" @click="hideCase(item.id)">隐藏</button>
                  <button v-if="item.source === 'base' && item.hidden" type="button" @click="restoreCase(item.id)">显示</button>
                  <button v-if="item.source === 'base'" type="button" @click="resetBase(item.id)">恢复默认</button>
                  <button v-if="item.source === 'custom'" type="button" class="danger" @click="removeCustom(item.id)">删除</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import {
  deleteCustomCase,
  getManagedCases,
  hideBaseCase,
  resetCaseOverride,
  saveCaseOverride,
  saveCustomCase,
  showBaseCase,
  tags
} from '@/mock/data'

const caseTags = tags.slice(1)
const managedCases = ref(getManagedCases())
const editingCase = ref(null)
const statusText = ref('信息会保存在当前浏览器中。')

const form = reactive({
  name: '',
  category: caseTags[0],
  type: '',
  year: `${new Date().getFullYear()}年`,
  url: '',
  images: '',
  note: ''
})

const isEditing = computed(() => Boolean(editingCase.value))

function imagesToText(list) {
  return Array.isArray(list) ? list.join('\n') : ''
}

function resetForm() {
  editingCase.value = null
  form.name = ''
  form.category = caseTags[0]
  form.type = ''
  form.year = `${new Date().getFullYear()}年`
  form.url = ''
  form.images = ''
  form.note = ''
}

function refreshList() {
  managedCases.value = getManagedCases()
}

function startCreate() {
  resetForm()
  statusText.value = '正在新增作品。'
}

function editCase(item) {
  editingCase.value = item
  form.name = item.name
  form.category = item.category
  form.type = item.type
  form.year = item.year
  form.url = item.url
  form.images = imagesToText(item.list)
  form.note = item.note
  statusText.value = `正在编辑《${item.name}》。`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formPayload() {
  return {
    id: editingCase.value?.id,
    name: form.name,
    category: form.category,
    type: form.type,
    year: form.year,
    url: form.url,
    images: form.images,
    note: form.note,
    createdAt: editingCase.value?.createdAt || Date.now()
  }
}

function handleSubmit() {
  const saved = isEditing.value
    ? saveCaseOverride(formPayload())
    : saveCustomCase(formPayload())

  if (!saved) {
    statusText.value = '请至少填写作品名称和一张图片链接。'
    return
  }

  statusText.value = `已保存《${saved.name}》。`
  resetForm()
  refreshList()
}

function hideCase(id) {
  hideBaseCase(id)
  refreshList()
  statusText.value = '已隐藏作品。'
}

function restoreCase(id) {
  showBaseCase(id)
  refreshList()
  statusText.value = '作品已恢复显示。'
}

function resetBase(id) {
  resetCaseOverride(id)
  showBaseCase(id)
  refreshList()
  resetForm()
  statusText.value = '已恢复默认内容。'
}

function removeCustom(id) {
  deleteCustomCase(id)
  refreshList()
  resetForm()
  statusText.value = '已删除新增作品。'
}
</script>

<style scoped lang="scss">
.manager-page {
  min-height: calc(100vh - 73px);
  background: #f1f1f1;
  padding: 44px 0 80px;
}

.manager-shell {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
}

.manager-header {
  margin-bottom: 28px;
}

.manager-header p {
  margin: 0 0 8px;
  color: #69717d;
  letter-spacing: 2px;
}

.manager-header h1 {
  margin: 0;
  font-size: 38px;
  font-weight: 500;
  color: #11161d;
}

.manager-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.84fr) minmax(0, 1.16fr);
  gap: 24px;
  align-items: start;
}

.case-form,
.saved-panel {
  border: 1px solid rgba(17, 22, 29, 0.1);
  background: #fff;
}

.case-form {
  position: sticky;
  top: 92px;
  display: grid;
  gap: 18px;
  padding: 28px;
}

.form-title,
.saved-head,
.item-head,
.item-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.form-title,
.saved-head,
.item-head {
  justify-content: space-between;
}

.form-title h2,
.saved-head h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.plain-btn {
  border: 1px solid #d8dde4;
  background: #fff;
  color: #11161d;
  padding: 9px 14px;
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #242a32;
  font-size: 15px;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid #d8dde4;
  background: #fbfbfb;
  color: #11161d;
  padding: 12px 13px;
  font: inherit;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: 2px solid rgba(17, 22, 29, 0.16);
  border-color: #11161d;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.form-actions p,
.saved-head p,
.item-note {
  margin: 0;
  color: #69717d;
}

.form-actions button,
.item-actions button {
  border: 0;
  background: #11161d;
  color: #fff;
  padding: 11px 16px;
  cursor: pointer;
}

.saved-panel {
  padding: 26px;
}

.saved-head {
  margin-bottom: 18px;
  align-items: flex-start;
}

.saved-head span,
.item-head span {
  color: #69717d;
  white-space: nowrap;
}

.saved-list {
  display: grid;
  gap: 14px;
}

.saved-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  align-items: center;
  border: 1px solid #e2e5e9;
  padding: 12px;
}

.saved-item.muted {
  opacity: 0.58;
  background: #f7f7f7;
}

.saved-item img {
  width: 150px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: #ddd;
}

.saved-copy {
  min-width: 0;
}

.saved-item h3,
.saved-item p {
  margin: 0;
}

.saved-item h3 {
  font-size: 20px;
  font-weight: 500;
}

.saved-item p {
  margin-top: 8px;
  color: #69717d;
}

.item-actions {
  margin-top: 14px;
  flex-wrap: wrap;
}

.item-actions button {
  background: #2f3640;
  padding: 8px 12px;
}

.item-actions .danger {
  background: #8b2f2f;
}

@media (max-width: 1080px) {
  .manager-layout {
    grid-template-columns: 1fr;
  }

  .case-form {
    position: static;
  }
}

@media (max-width: 760px) {
  .manager-page {
    min-height: calc(100vh - 60px);
    padding-top: 28px;
  }

  .form-grid,
  .saved-item {
    grid-template-columns: 1fr;
  }

  .form-actions,
  .saved-head,
  .item-head {
    align-items: stretch;
    flex-direction: column;
  }

  .saved-item img {
    width: 100%;
  }
}
</style>
