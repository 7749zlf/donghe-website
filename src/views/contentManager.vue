<template>
  <main class="manager-page">
    <section class="manager-shell">
      <header class="manager-header">
        <p>内容管理</p>
        <h1>新增官网作品</h1>
      </header>

      <form class="case-form" @submit.prevent="handleSubmit">
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
          <button type="submit">保存作品</button>
        </div>
      </form>

      <section class="saved-panel">
        <div class="saved-head">
          <h2>已新增作品</h2>
          <span>{{ customCases.length }} 个</span>
        </div>

        <div v-if="customCases.length" class="saved-list">
          <article v-for="item in customCases" :key="item.id" class="saved-item">
            <img :src="item.image" :alt="item.name" />
            <div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.type }} · {{ item.year }}</p>
              <button type="button" @click="removeCase(item.id)">删除</button>
            </div>
          </article>
        </div>

        <p v-else class="empty">还没有新增作品。保存后会出现在首页、作品页和详情页。</p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { deleteCustomCase, readCustomCases, saveCustomCase, tags } from '@/mock/data'

const caseTags = tags.slice(1)
const customCases = ref(readCustomCases())
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

function resetForm() {
  form.name = ''
  form.category = caseTags[0]
  form.type = ''
  form.year = `${new Date().getFullYear()}年`
  form.url = ''
  form.images = ''
  form.note = ''
}

function refreshList() {
  customCases.value = readCustomCases()
}

function handleSubmit() {
  const saved = saveCustomCase({
    name: form.name,
    category: form.category,
    type: form.type,
    year: form.year,
    url: form.url,
    images: form.images,
    note: form.note
  })

  if (!saved) {
    statusText.value = '请至少填写作品名称和一张图片链接。'
    return
  }

  statusText.value = `已保存《${saved.name}》。`
  resetForm()
  refreshList()
}

function removeCase(id) {
  deleteCustomCase(id)
  refreshList()
  statusText.value = '已删除作品。'
}
</script>

<style scoped lang="scss">
.manager-page {
  min-height: calc(100vh - 73px);
  background: #f1f1f1;
  padding: 44px 0 80px;
}

.manager-shell {
  width: min(1120px, calc(100% - 40px));
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

.case-form,
.saved-panel {
  border: 1px solid rgba(17, 22, 29, 0.1);
  background: #fff;
}

.case-form {
  display: grid;
  gap: 18px;
  padding: 28px;
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
.empty {
  margin: 0;
  color: #69717d;
}

.form-actions button,
.saved-item button {
  border: 0;
  background: #11161d;
  color: #fff;
  padding: 12px 20px;
  cursor: pointer;
}

.saved-panel {
  margin-top: 24px;
  padding: 26px;
}

.saved-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.saved-head h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.saved-head span {
  color: #69717d;
}

.saved-list {
  display: grid;
  gap: 14px;
}

.saved-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  align-items: center;
  border: 1px solid #e2e5e9;
  padding: 12px;
}

.saved-item img {
  width: 140px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: #ddd;
}

.saved-item h3,
.saved-item p {
  margin: 0;
}

.saved-item p {
  margin: 8px 0 14px;
  color: #69717d;
}

.saved-item button {
  background: #8b2f2f;
  padding: 9px 14px;
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

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .saved-item img {
    width: 100%;
  }
}
</style>
