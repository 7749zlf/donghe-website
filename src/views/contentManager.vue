<template>
  <main class="manager-page">
    <section v-if="cloudEnabled && !authReady" class="manager-shell compact-shell">
      <div class="auth-panel">
        <p>内容管理</p>
        <h1>正在检查权限</h1>
        <span>请稍候。</span>
      </div>
    </section>

    <section v-else-if="cloudEnabled && !managerSession" class="manager-shell compact-shell">
      <form class="auth-panel" @submit.prevent="handleLogin">
        <p>内容管理</p>
        <h1>管理员登录</h1>

        <label class="field">
          <span>邮箱</span>
          <input v-model.trim="loginForm.email" type="email" autocomplete="username" required />
        </label>

        <label class="field">
          <span>密码</span>
          <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
        </label>

        <div class="form-actions auth-actions">
          <p>{{ loginStatus }}</p>
          <button type="submit" :disabled="authLoading">{{ authLoading ? '登录中' : '登录' }}</button>
        </div>
      </form>
    </section>

    <section v-else-if="cloudEnabled && !managerIsAdmin" class="manager-shell compact-shell">
      <div class="auth-panel">
        <p>内容管理</p>
        <h1>没有管理权限</h1>
        <span>当前账号未加入管理员名单。</span>
        <div class="form-actions auth-actions">
          <p>{{ managerEmail }}</p>
          <button type="button" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </section>

    <section v-else class="manager-shell">
      <header class="manager-header">
        <div>
          <p>内容管理</p>
          <h1>管理官网作品</h1>
        </div>
        <div v-if="cloudEnabled" class="manager-account">
          <span>{{ managerEmail }}</span>
          <button type="button" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <div class="manager-layout">
        <form class="case-form" @submit.prevent="handleSubmit">
          <div class="form-title">
          <h2>{{ isEditing ? '编辑作品' : '新增作品' }}</h2>
          <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
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

          <div class="field upload-field">
            <span>作品图片</span>
            <label class="upload-box">
              <input type="file" accept="image/*" multiple @change="handleImageUpload" />
              <strong>{{ uploading ? '正在上传图片' : '选择图片上传' }}</strong>
              <small>{{ cloudEnabled ? '图片会上传到云端图库，第一张作为封面' : '本地模式会保存到当前浏览器，第一张作为封面' }}</small>
            </label>

            <div v-if="form.images.length" class="upload-preview-grid">
              <article
                v-for="(image, index) in form.images"
                :key="`${image}-${index}`"
                class="upload-preview"
              >
                <button
                  class="preview-image-button"
                  type="button"
                  @click="openImagePreview(image, `作品图片 ${index + 1}`)"
                >
                  <img :src="image" :alt="`作品图片 ${index + 1}`" />
                  <span>放大</span>
                </button>
                <div class="preview-actions">
                  <span>{{ index === 0 ? '封面' : `第 ${index + 1} 张` }}</span>
                  <button v-if="index > 0" type="button" @click="setCoverImage(index)">设为封面</button>
                  <button type="button" @click="removeImage(index)">删除</button>
                </div>
              </article>
            </div>
          </div>

          <label class="field">
            <span>作品说明</span>
            <textarea v-model.trim="form.note" rows="3" placeholder="简单写一句这个案例的空间特点"></textarea>
          </label>

          <div class="form-actions">
            <p>{{ statusText }}</p>
            <button type="submit" :disabled="saving || uploading">
              {{ uploading ? '上传图片中' : (saving ? '保存中' : (isEditing ? '保存修改' : '保存作品')) }}
            </button>
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
              <button
                class="saved-image-button"
                type="button"
                @click="openImagePreview(item.image, item.name)"
              >
                <img :src="item.image" :alt="item.name" />
              </button>
              <div class="saved-copy">
                <div class="item-head">
                  <h3>{{ item.name }}</h3>
                  <span>{{ caseLabel(item) }}</span>
                </div>
                <p>{{ item.type }} · {{ item.year }}</p>
                <p class="item-note">{{ item.hidden ? '已隐藏，不会在前台展示。' : item.note }}</p>
                <div class="item-actions">
                  <button type="button" @click="editCase(item)">编辑</button>
                  <button v-if="canToggleVisibility(item) && !item.hidden" type="button" @click="hideCase(item.id)">隐藏</button>
                  <button v-if="canToggleVisibility(item) && item.hidden" type="button" @click="restoreCase(item.id)">显示</button>
                  <button v-if="canReset(item)" type="button" @click="resetBase(item.id)">恢复默认</button>
                  <button v-if="canDelete(item)" type="button" class="danger" @click="removeCustom(item.id)">删除</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>

    <div
      v-if="imagePreview"
      class="image-lightbox"
      role="dialog"
      aria-modal="true"
      @click.self="closeImagePreview"
    >
      <div class="lightbox-panel">
        <button class="lightbox-close" type="button" @click="closeImagePreview">关闭</button>
        <img :src="imagePreview.src" :alt="imagePreview.alt" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  deleteCustomCase,
  getManagedCases,
  hideBaseCase,
  resetCaseOverride,
  saveCaseOverride,
  saveCustomCase,
  showBaseCase,
  setCloudCases,
  tags
} from '@/mock/data'
import {
  deleteCloudCase,
  fetchCloudCases,
  getManagerSession,
  isManagerAdmin,
  isCloudCasesEnabled,
  onManagerAuthChange,
  signInManager,
  signOutManager,
  uploadCaseImage,
  upsertCloudCase
} from '@/services/cloudCases'

const caseTags = tags.slice(1)
const cloudEnabled = isCloudCasesEnabled()
const managedCases = ref(getManagedCases())
const editingCase = ref(null)
const statusText = ref(cloudEnabled ? '信息会保存到云端数据库。' : '信息会保存在当前浏览器中。')
const authReady = ref(!cloudEnabled)
const authLoading = ref(false)
const managerSession = ref(null)
const managerIsAdmin = ref(false)
const loginStatus = ref('请输入管理员账号。')
const saving = ref(false)
const uploading = ref(false)
const draftCaseId = ref(createCaseId())
const imagePreview = ref(null)
let stopAuthListener = null

const loginForm = reactive({
  email: '',
  password: ''
})

const form = reactive({
  name: '',
  category: caseTags[0],
  type: '',
  year: `${new Date().getFullYear()}年`,
  url: '',
  images: [],
  note: ''
})

const isEditing = computed(() => Boolean(editingCase.value))
const managerEmail = computed(() => managerSession.value?.user?.email || '')

function createCaseId() {
  return `case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function currentCaseId() {
  return editingCase.value?.id || draftCaseId.value
}

function imagesToList(list) {
  if (Array.isArray(list)) {
    return [...list]
  }

  return String(list || '')
    .split(/\r?\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function resetForm() {
  editingCase.value = null
  draftCaseId.value = createCaseId()
  form.name = ''
  form.category = caseTags[0]
  form.type = ''
  form.year = `${new Date().getFullYear()}年`
  form.url = ''
  form.images = []
  form.note = ''
}

function refreshList() {
  managedCases.value = getManagedCases()
}

async function refreshCloudList() {
  if (!cloudEnabled) {
    refreshList()
    return
  }

  const cases = await fetchCloudCases()
  setCloudCases(cases)
  refreshList()
}

async function refreshAdminStatus() {
  if (!cloudEnabled || !managerSession.value) {
    managerIsAdmin.value = false
    return false
  }

  managerIsAdmin.value = await isManagerAdmin()
  return managerIsAdmin.value
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
  form.images = imagesToList(item.list)
  form.note = item.note
  statusText.value = `正在编辑《${item.name}》。`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

async function handleImageUpload(event) {
  const input = event.target
  const files = Array.from(input.files || []).filter((file) => file.type.startsWith('image/'))

  if (!files.length) {
    statusText.value = '请选择图片文件。'
    return
  }

  uploading.value = true
  statusText.value = `正在上传 ${files.length} 张图片。`

  try {
    const images = cloudEnabled
      ? await Promise.all(files.map((file) => uploadCaseImage(file, currentCaseId())))
      : await Promise.all(files.map(readImageAsDataUrl))

    form.images = [...form.images, ...images]
    statusText.value = `已添加 ${images.length} 张图片，第一张会作为封面。`
  } catch (error) {
    statusText.value = `图片上传失败：${error.message}`
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function setCoverImage(index) {
  const images = [...form.images]
  const [cover] = images.splice(index, 1)
  form.images = [cover, ...images]
}

function removeImage(index) {
  form.images = form.images.filter((_, imageIndex) => imageIndex !== index)
}

function openImagePreview(src, alt = '作品图片') {
  if (!src) {
    return
  }

  imagePreview.value = { src, alt }
}

function closeImagePreview() {
  imagePreview.value = null
}

function handlePreviewKeydown(event) {
  if (event.key === 'Escape') {
    closeImagePreview()
  }
}

function caseLabel(item) {
  if (cloudEnabled) {
    return '云端作品'
  }

  return item.source === 'base' ? '原有作品' : '新增作品'
}

function canToggleVisibility(item) {
  return cloudEnabled || item.source === 'base'
}

function canReset(item) {
  return !cloudEnabled && item.source === 'base'
}

function canDelete(item) {
  return cloudEnabled || item.source === 'custom'
}

function formPayload() {
  return {
    id: currentCaseId(),
    name: form.name,
    category: form.category,
    type: form.type,
    year: form.year,
    url: form.url,
    images: form.images,
    image: form.images[0] || '',
    note: form.note,
    createdAt: editingCase.value?.createdAt || Date.now(),
    hidden: Boolean(editingCase.value?.hidden)
  }
}

async function handleSubmit() {
  let saved = null

  if (uploading.value) {
    statusText.value = '图片还在上传，请稍等。'
    return
  }

  if (!form.images.length) {
    statusText.value = '请至少上传一张作品图片。'
    return
  }

  saving.value = true

  try {
    if (cloudEnabled) {
      saved = await upsertCloudCase(formPayload())
      await refreshCloudList()
    } else {
      saved = isEditing.value
        ? saveCaseOverride(formPayload())
        : saveCustomCase(formPayload())
    }

    if (!saved) {
      statusText.value = '请至少填写作品名称和上传一张作品图片。'
      return
    }

    statusText.value = `已保存《${saved.name}》。`
    resetForm()
    refreshList()
  } catch (error) {
    statusText.value = `保存失败：${error.message}`
  } finally {
    saving.value = false
  }
}

async function hideCase(id) {
  try {
    const target = managedCases.value.find((item) => String(item.id) === String(id))
    if (cloudEnabled && target) {
      await upsertCloudCase({ ...target, hidden: true })
      await refreshCloudList()
    } else {
      hideBaseCase(id)
      refreshList()
    }
    statusText.value = '已隐藏作品。'
  } catch (error) {
    statusText.value = `隐藏失败：${error.message}`
  }
}

async function restoreCase(id) {
  try {
    const target = managedCases.value.find((item) => String(item.id) === String(id))
    if (cloudEnabled && target) {
      await upsertCloudCase({ ...target, hidden: false })
      await refreshCloudList()
    } else {
      showBaseCase(id)
      refreshList()
    }
    statusText.value = '作品已恢复显示。'
  } catch (error) {
    statusText.value = `恢复失败：${error.message}`
  }
}

function resetBase(id) {
  if (cloudEnabled) {
    statusText.value = '云端模式下没有本地默认内容可恢复。'
    return
  }

  resetCaseOverride(id)
  showBaseCase(id)
  refreshList()
  resetForm()
  statusText.value = '已恢复默认内容。'
}

async function removeCustom(id) {
  try {
    if (cloudEnabled) {
      await deleteCloudCase(id)
      await refreshCloudList()
    } else {
      deleteCustomCase(id)
      refreshList()
    }
    resetForm()
    statusText.value = '已删除新增作品。'
  } catch (error) {
    statusText.value = `删除失败：${error.message}`
  }
}

async function handleLogin() {
  authLoading.value = true
  loginStatus.value = '正在登录。'

  try {
    managerSession.value = await signInManager(loginForm.email, loginForm.password)
    loginForm.password = ''
    const hasAccess = await refreshAdminStatus()
    if (!hasAccess) {
      loginStatus.value = '当前账号没有管理权限。'
      return
    }
    loginStatus.value = '登录成功。'
    await refreshCloudList()
  } catch (error) {
    loginStatus.value = `登录失败：${error.message}`
  } finally {
    authLoading.value = false
  }
}

async function handleLogout() {
  try {
    await signOutManager()
    managerSession.value = null
    managerIsAdmin.value = false
    resetForm()
    loginStatus.value = '已退出，请重新登录。'
  } catch (error) {
    statusText.value = `退出失败：${error.message}`
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handlePreviewKeydown)

  if (!cloudEnabled) {
    return
  }

  try {
    managerSession.value = await getManagerSession()
    stopAuthListener = onManagerAuthChange((session) => {
      managerSession.value = session
      if (!session) {
        managerIsAdmin.value = false
      }
    })
    authReady.value = true

    if (!managerSession.value) {
      loginStatus.value = '请输入管理员账号。'
      return
    }

    const hasAccess = await refreshAdminStatus()
    if (!hasAccess) {
      loginStatus.value = '当前账号没有管理权限。'
      return
    }

    await refreshCloudList()
    statusText.value = '已连接云端数据库。'
  } catch (error) {
    authReady.value = true
    statusText.value = `云端数据库连接失败：${error.message}`
    loginStatus.value = `权限检查失败：${error.message}`
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlePreviewKeydown)

  if (stopAuthListener) {
    stopAuthListener()
  }
})
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

.compact-shell {
  width: min(520px, calc(100% - 40px));
}

.manager-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
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

.manager-account {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #69717d;
}

.manager-account button {
  border: 1px solid #d8dde4;
  background: #fff;
  color: #11161d;
  padding: 9px 14px;
  cursor: pointer;
}

.manager-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.84fr) minmax(0, 1.16fr);
  gap: 24px;
  align-items: start;
}

.auth-panel,
.case-form,
.saved-panel {
  border: 1px solid rgba(17, 22, 29, 0.1);
  background: #fff;
}

.auth-panel {
  display: grid;
  gap: 18px;
  padding: 34px;
}

.auth-panel p,
.auth-panel h1,
.auth-panel span {
  margin: 0;
}

.auth-panel > p {
  color: #69717d;
  letter-spacing: 2px;
}

.auth-panel h1 {
  color: #11161d;
  font-size: 34px;
  font-weight: 500;
}

.auth-actions {
  margin-top: 4px;
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

.mode-badge {
  margin-right: auto;
  padding: 7px 10px;
  background: #eef2f7;
  color: #46515f;
  font-size: 13px;
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

.upload-field {
  gap: 12px;
}

.upload-box {
  position: relative;
  display: grid;
  gap: 6px;
  border: 1px dashed #c8d0da;
  background: #fbfbfb;
  padding: 18px;
  cursor: pointer;
}

.upload-box input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.upload-box strong {
  color: #11161d;
  font-size: 16px;
  font-weight: 500;
}

.upload-box small {
  color: #69717d;
  font-size: 13px;
}

.upload-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.upload-preview {
  border: 1px solid #e2e5e9;
  background: #fff;
}

.preview-image-button,
.saved-image-button {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: zoom-in;
}

.preview-image-button {
  position: relative;
  display: block;
  width: 100%;
}

.preview-image-button span {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 5px 8px;
  background: rgba(17, 22, 29, 0.82);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-image-button:hover span,
.preview-image-button:focus-visible span {
  opacity: 1;
}

.preview-image-button:focus-visible,
.saved-image-button:focus-visible {
  outline: 2px solid #11161d;
  outline-offset: 2px;
}

.upload-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: #ddd;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
}

.preview-actions span {
  color: #69717d;
  font-size: 13px;
}

.preview-actions button {
  border: 1px solid #d8dde4;
  background: #fff;
  color: #11161d;
  padding: 6px 8px;
  cursor: pointer;
}

.preview-actions button:last-child {
  color: #8b2f2f;
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

.form-actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.saved-image-button {
  width: 150px;
}

.saved-image-button img {
  display: block;
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

.image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(9, 12, 16, 0.82);
}

.lightbox-panel {
  position: relative;
  max-width: min(1080px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
}

.lightbox-panel img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 96px);
  object-fit: contain;
  background: #0f1318;
}

.lightbox-close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: 0;
  background: rgba(255, 255, 255, 0.92);
  color: #11161d;
  padding: 9px 12px;
  cursor: pointer;
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
  .upload-preview-grid,
  .saved-item {
    grid-template-columns: 1fr;
  }

  .form-actions,
  .manager-header,
  .saved-head,
  .item-head {
    align-items: stretch;
    flex-direction: column;
  }

  .saved-item img {
    width: 100%;
  }

  .saved-image-button {
    width: 100%;
  }
}
</style>
