<template>
  <main class="manager-page">
    <section v-if="cloudEnabled && !authReady" class="manager-shell compact-shell">
      <div class="auth-panel">
        <h1>正在检查权限</h1>
        <span>请稍候。</span>
      </div>
    </section>

    <section v-else-if="cloudEnabled && !managerSession" class="manager-shell compact-shell">
      <form class="auth-panel" @submit.prevent="handleLogin">
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
          <h1>{{ managerMode === 'cases' ? '管理官网作品' : '管理荣誉奖项' }}</h1>
          <div class="manager-tabs" role="tablist" aria-label="管理内容切换">
            <button
              type="button"
              :class="{ active: managerMode === 'cases' }"
              @click="managerMode = 'cases'"
            >
              作品管理
            </button>
            <button
              type="button"
              :class="{ active: managerMode === 'awards' }"
              @click="managerMode = 'awards'"
            >
              荣誉奖项
            </button>
            <button type="button" @click="$router.push({ name: 'quoteManager' })">
              报价单
            </button>
          </div>
        </div>
        <div v-if="cloudEnabled" class="manager-account">
          <span>{{ managerEmail }}</span>
          <button type="button" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <CaseManagerPanel
        v-if="managerMode === 'cases'"
        ref="caseManagerPanel"
        v-model:external-image-url.trim="externalImageUrl"
        :form="form"
        :editing-case="editingCase"
        :cloud-enabled="cloudEnabled"
        :uploading="uploading"
        :cad-uploading="cadUploading"
        :video-uploading="videoUploading"
        :saving="saving"
        :status-text="statusText"
        :case-tags="caseTags"
        :case-style-presets="caseStylePresets"
        :custom-style-value="CUSTOM_STYLE_VALUE"
        :selected-style-option="selectedStyleOption"
        :custom-style-enabled="customStyleEnabled"
        :items="paginatedManagedCases"
        :page="caseListPage"
        :page-count="caseListPageCount"
        :case-label="caseLabel"
        :format-case-meta="formatCaseMeta"
        :can-toggle-visibility="canToggleVisibility"
        :can-reset="canReset"
        :can-delete="canDelete"
        @submit="handleSubmit"
        @create="startCreate"
        @style-option-change="handleStyleOptionChange"
        @cad-upload="handleCadUpload"
        @download-cad="downloadCaseCadFile"
        @remove-cad="removeCaseCadFile"
        @video-upload="handleVideoUpload"
        @remove-video="removeCaseVideo"
        @image-upload="handleImageUpload"
        @add-external-image="addExternalImage"
        @preview-image="openImagePreview"
        @set-cover="setCoverImage"
        @remove-image="removeImage"
        @edit="editCase"
        @hide="hideCase"
        @restore="restoreCase"
        @reset="resetBase"
        @delete="removeCustom"
        @page-change="setCaseListPage"
      />

      <AwardManagerPanel
        v-else
        ref="awardManagerPanel"
        v-model:external-image-url.trim="externalAwardImageUrl"
        :award-form="awardForm"
        :editing-award="editingAward"
        :cloud-enabled="cloudEnabled"
        :award-uploading="awardUploading"
        :award-saving="awardSaving"
        :status-text="awardStatusText"
        :items="managedAwards"
        :award-label="awardLabel"
        :can-toggle-visibility="canToggleAwardVisibility"
        :can-reset="canResetAward"
        :can-delete="canDeleteAward"
        @submit="handleAwardSubmit"
        @create="startCreateAward"
        @image-upload="handleAwardImageUpload"
        @add-external-image="addExternalAwardImage"
        @preview-image="openImagePreview"
        @remove-image="removeAwardImage"
        @edit="editAward"
        @hide="hideAward"
        @restore="restoreAward"
        @reset="resetAward"
        @delete="removeAward"
      />
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
        <img :src="imagePreview.src" :alt="imagePreview.alt" loading="lazy" decoding="async" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import AwardManagerPanel from '@/components/content/AwardManagerPanel.vue'
import CaseManagerPanel from '@/components/content/CaseManagerPanel.vue'
import { useContentManagerAuth } from '@/composables/useContentManagerAuth'
import { useContentImageManager } from '@/composables/useContentImageManager'
import {
  awardLabel as getAwardLabel,
  canDelete as canDeleteContent,
  canDeleteAward as canDeleteAwardContent,
  canReset as canResetContent,
  canResetAward as canResetAwardContent,
  canToggleAwardVisibility as canToggleAwardVisibilityContent,
  canToggleVisibility as canToggleVisibilityContent,
  caseLabel as getCaseLabel,
  formatCaseMeta,
  getCaseMedia,
  imagesToList,
  uniqueMediaUrls
} from '@/utils/contentRecords'
import {
  deleteCustomAward,
  deleteCustomCase,
  getManagedAwards,
  getManagedCases,
  hideBaseAward,
  hideBaseCase,
  resetAwardOverride,
  resetCaseOverride,
  saveAwardOverride,
  saveCaseOverride,
  saveCustomAward,
  saveCustomCase,
  showBaseAward,
  showBaseCase,
  setCloudAwards,
  setCloudCases,
  stylePresets,
  tags
} from '@/mock/data'
import {
  deleteCloudAward,
  deleteCloudCase,
  fetchCloudAwards,
  fetchCloudCases,
  isCloudCasesEnabled,
  createCaseCadDownloadUrl,
  deleteCaseCadFiles,
  deleteCaseVideos,
  deleteCloudImages,
  uploadCaseCadFile,
  uploadCaseVideo,
  upsertCloudAward,
  upsertCloudCase
} from '@/services/cloudCases'

const caseTags = tags.slice(1)
const caseStylePresets = stylePresets
const CUSTOM_STYLE_VALUE = '__custom__'
const MANAGER_CASE_PAGE_SIZE = 6
const cloudEnabled = isCloudCasesEnabled()
const managerMode = ref('cases')
const managedCases = ref(getManagedCases())
const managedAwards = ref(getManagedAwards())
const editingCase = ref(null)
const editingAward = ref(null)
const statusText = ref(cloudEnabled ? '信息会保存到云端数据库。' : '信息会保存在当前浏览器中。')
const awardStatusText = ref(cloudEnabled ? '奖项信息会保存到云端数据库。' : '奖项信息会保存在当前浏览器中。')
const loginStatus = ref('请输入管理员账号。')
const saving = ref(false)
const uploading = ref(false)
const cadUploading = ref(false)
const videoUploading = ref(false)
const awardSaving = ref(false)
const awardUploading = ref(false)
const draftCaseId = ref(createCaseId())
const draftAwardId = ref(createAwardId())
const imagePreview = ref(null)
const caseManagerPanel = ref(null)
const awardManagerPanel = ref(null)
const externalImageUrl = ref('')
const externalAwardImageUrl = ref('')
const customStyleEnabled = ref(false)
const caseListPage = ref(1)
let originalCaseMedia = new Set()
const uploadedCaseMedia = new Set()
let originalCaseCadPath = ''
let uploadedCaseCadPaths = new Set()
let originalCaseVideoUrl = ''
let uploadedCaseVideoUrls = new Set()
let originalAwardMedia = new Set()
const uploadedAwardMedia = new Set()

const loginForm = reactive({
  email: '',
  password: ''
})

const form = reactive({
  name: '',
  category: caseTags[0],
  style: '',
  type: '',
  year: `${new Date().getFullYear()}年`,
  url: '',
  blueprintUrl: '',
  cadFileName: '',
  cadFilePath: '',
  videoUrl: '',
  images: [],
  coverImage: '',
  note: ''
})

const awardForm = reactive({
  title: '',
  desc: '',
  year: `${new Date().getFullYear()}年`,
  image: '',
  imageAlt: ''
})

const {
  addExternalImage,
  addExternalAwardImage,
  handleImageUpload,
  handleAwardImageUpload,
  setCoverImage,
  removeImage,
  removeAwardImage
} = useContentImageManager({
  cloudEnabled,
  form,
  awardForm,
  statusText,
  awardStatusText,
  uploading,
  awardUploading,
  externalImageUrl,
  externalAwardImageUrl,
  uploadedCaseMedia,
  uploadedAwardMedia,
  currentCaseId,
  currentAwardId
})

const isEditing = computed(() => Boolean(editingCase.value))
const managerEmail = computed(() => managerSession.value?.user?.email || '')
const selectedStyleOption = computed(() => customStyleEnabled.value ? CUSTOM_STYLE_VALUE : form.style)
const caseListPageCount = computed(() => Math.max(1, Math.ceil(managedCases.value.length / MANAGER_CASE_PAGE_SIZE)))
const caseLabel = (item) => getCaseLabel(item, cloudEnabled)
const canToggleVisibility = (item) => canToggleVisibilityContent(item, cloudEnabled)
const canReset = (item) => canResetContent(item, cloudEnabled)
const canDelete = (item) => canDeleteContent(item, cloudEnabled)
const awardLabel = (item) => getAwardLabel(item, cloudEnabled)
const canToggleAwardVisibility = (item) => canToggleAwardVisibilityContent(item, cloudEnabled)
const canResetAward = (item) => canResetAwardContent(item, cloudEnabled)
const canDeleteAward = (item) => canDeleteAwardContent(item, cloudEnabled)
const paginatedManagedCases = computed(() => {
  const start = (caseListPage.value - 1) * MANAGER_CASE_PAGE_SIZE
  return managedCases.value.slice(start, start + MANAGER_CASE_PAGE_SIZE)
})
/**
 * 生成当前浏览器会话内低碰撞的项目草稿 id。
 * @returns {string} 新项目草稿 id。
 */
function createCaseId() {
  return `case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 生成当前浏览器会话内低碰撞的荣誉草稿 id。
 * @returns {string} 新荣誉草稿 id。
 */
function createAwardId() {
  return `award-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 获取正在编辑项目的 id，新增状态下使用草稿 id。
 * @returns {string|number} 当前项目 id。
 */
function currentCaseId() {
  return editingCase.value?.id || draftCaseId.value
}

/**
 * 获取正在编辑荣誉的 id，新增状态下使用草稿 id。
 * @returns {string|number} 当前荣誉 id。
 */
function currentAwardId() {
  return editingAward.value?.id || draftAwardId.value
}

/**
 * 将风格下拉选项同步到表单，并切换自定义风格输入状态。
 * @param {Event} event 风格下拉框 change 事件。
 * @returns {void}
 */
function handleStyleOptionChange(event) {
  const value = event.target.value
  customStyleEnabled.value = value === CUSTOM_STYLE_VALUE
  form.style = customStyleEnabled.value ? '' : value
}

/**
 * 切换后台作品列表页码，并限制在当前有效页数内。
 * @param {*} page 目标页码。
 * @returns {void}
 */
function setCaseListPage(page) {
  const value = Number.parseInt(String(page || '1'), 10)
  const normalizedPage = Number.isFinite(value) && value > 0 ? value : 1
  caseListPage.value = Math.min(caseListPageCount.value, normalizedPage)
}

/**
 * 收集当前项目表单引用的全部媒体地址。
 * @returns {string[]} 当前表单使用的唯一媒体地址。
 */
function getCurrentCaseMedia() {
  return uniqueMediaUrls([form.images, form.coverImage])
}

/**
 * 筛出未被已加载作品引用的视频地址。
 * @param {string|string[]} urls 候选视频地址。
 * @returns {string[]} 可删除的视频地址。
 */
function getUnusedCaseVideoUrls(urls) {
  const referenced = new Set(managedCases.value.map((item) => item.videoUrl).filter(Boolean))
  return uniqueMediaUrls(urls).filter((url) => !referenced.has(url))
}

/**
 * 从候选地址中筛出未被任何项目或荣誉引用的媒体。
 * @param {string|string[]} urls 候选媒体地址。
 * @returns {string[]} 可安全尝试清理的未引用地址。
 */
function getUnusedMediaUrls(urls) {
  const referenced = new Set([
    ...managedCases.value.flatMap(getCaseMedia),
    ...managedAwards.value.map((item) => item.image)
  ])

  return uniqueMediaUrls(urls).filter((url) => !referenced.has(url))
}

/**
 * 删除未被当前内容引用的云端媒体。
 * @param {string|string[]} urls 候选媒体地址。
 * @returns {Promise<number>} 实际提交删除的地址数量。
 */
async function cleanUnusedCloudMedia(urls) {
  const unusedUrls = getUnusedMediaUrls(urls)

  if (unusedUrls.length) {
    await deleteCloudImages(unusedUrls)
  }

  return unusedUrls.length
}

/**
 * 清理当前项目表单已上传但尚未保存的云端图片。
 * @returns {Promise<void>}
 */
async function discardUploadedCaseMedia() {
  if (cloudEnabled && uploadedCaseMedia.size) {
    try {
      await deleteCloudImages([...uploadedCaseMedia])
    } catch (error) {
      console.warn('Failed to discard unsaved case images:', error)
    }
  }

  uploadedCaseMedia.clear()
}

/**
 * 清理当前编辑器已上传但尚未保存的 CAD 文件。
 * @returns {Promise<void>}
 */
async function discardUploadedCaseCadFiles() {
  if (cloudEnabled && uploadedCaseCadPaths.size) {
    try {
      await deleteCaseCadFiles([...uploadedCaseCadPaths])
    } catch (error) {
      console.warn('Failed to discard unsaved case CAD files:', error)
    }
  }

  uploadedCaseCadPaths = new Set()
}

/**
 * 清理当前编辑器已上传但尚未保存的视频。
 * @returns {Promise<void>}
 */
async function discardUploadedCaseVideos() {
  if (cloudEnabled && uploadedCaseVideoUrls.size) {
    try {
      await deleteCaseVideos([...uploadedCaseVideoUrls])
    } catch (error) {
      console.warn('Failed to discard unsaved case videos:', error)
    }
  }

  uploadedCaseVideoUrls = new Set()
}

/**
 * 筛出未被任一已加载作品继续引用的 CAD 文件。
 * @param {string[]} paths 候选存储路径。
 * @returns {string[]} 可删除的存储路径。
 */
function getUnusedCaseCadPaths(paths) {
  const referenced = new Set(
    managedCases.value.map((item) => item.cadFilePath).filter(Boolean)
  )
  return [...new Set(paths)].filter((path) => path && !referenced.has(path))
}

/**
 * 清理当前荣誉表单已上传但尚未保存的云端图片。
 * @returns {Promise<void>}
 */
async function discardUploadedAwardMedia() {
  if (cloudEnabled && uploadedAwardMedia.size) {
    try {
      await deleteCloudImages([...uploadedAwardMedia])
    } catch (error) {
      console.warn('Failed to discard unsaved award image:', error)
    }
  }

  uploadedAwardMedia.clear()
}

const {
  authReady,
  authLoading,
  managerSession,
  managerIsAdmin,
  handleLogin,
  handleLogout
} = useContentManagerAuth({
  cloudEnabled,
  loginForm,
  loginStatus,
  statusText,
  refreshCloudList,
  discardUploadedCaseMedia,
  discardUploadedCaseVideos,
  discardUploadedAwardMedia,
  resetForm,
  resetAwardForm,
  resetOriginalMedia: () => {
    originalCaseMedia = new Set()
    originalCaseVideoUrl = ''
    originalAwardMedia = new Set()
  }
})

/**
 * 将项目编辑器恢复为新的空白草稿状态。
 * @returns {void}
 */
function resetForm() {
  editingCase.value = null
  draftCaseId.value = createCaseId()
  customStyleEnabled.value = false
  form.name = ''
  form.category = caseTags[0]
  form.style = ''
  form.type = ''
  form.year = `${new Date().getFullYear()}年`
  form.url = ''
  form.blueprintUrl = ''
  form.cadFileName = ''
  form.cadFilePath = ''
  form.videoUrl = ''
  originalCaseCadPath = ''
  originalCaseVideoUrl = ''
  form.images = []
  form.coverImage = ''
  form.note = ''
  externalImageUrl.value = ''
}

/**
 * 将荣誉编辑器恢复为新的空白草稿状态。
 * @returns {void}
 */
function resetAwardForm() {
  editingAward.value = null
  draftAwardId.value = createAwardId()
  awardForm.title = ''
  awardForm.desc = ''
  awardForm.year = `${new Date().getFullYear()}年`
  awardForm.image = ''
  awardForm.imageAlt = ''
  externalAwardImageUrl.value = ''
}

/**
 * 从统一数据层重新读取后台项目列表。
 * @returns {void}
 */
function refreshList() {
  managedCases.value = getManagedCases()
  caseListPage.value = Math.min(caseListPage.value, caseListPageCount.value)
}

/**
 * 从统一数据层重新读取后台荣誉列表。
 * @returns {void}
 */
function refreshAwardsList() {
  managedAwards.value = getManagedAwards()
}

/**
 * 在 DOM 更新后将项目表单平滑滚动到顶部。
 * @returns {void}
 */
function resetCaseFormScroll() {
  nextTick(() => {
    caseManagerPanel.value?.resetScroll()
  })
}

/**
 * 在 DOM 更新后将荣誉表单平滑滚动到顶部。
 * @returns {void}
 */
function resetAwardFormScroll() {
  nextTick(() => {
    awardManagerPanel.value?.resetScroll()
  })
}

/**
 * 刷新云端项目和荣誉缓存；本地模式下仅重读浏览器数据。
 * @returns {Promise<void>}
 */
async function refreshCloudList() {
  if (!cloudEnabled) {
    refreshList()
    refreshAwardsList()
    return
  }

  const cases = await fetchCloudCases()
  setCloudCases(cases)
  try {
    const awards = await fetchCloudAwards()
    setCloudAwards(awards)
  } catch (error) {
    awardStatusText.value = `奖项云端数据连接失败：${error.message}`
  }
  refreshList()
  refreshAwardsList()
}

/**
 * 放弃未保存上传并切换项目编辑器到新增状态。
 * @returns {Promise<void>}
 */
async function startCreate() {
  if (cadUploading.value || videoUploading.value) {
    statusText.value = '文件还在上传，请稍候。'
    return
  }
  await discardUploadedCaseMedia()
  await discardUploadedCaseCadFiles()
  await discardUploadedCaseVideos()
  originalCaseMedia = new Set()
  originalCaseCadPath = ''
  originalCaseVideoUrl = ''
  resetForm()
  statusText.value = '正在新增作品。'
  resetCaseFormScroll()
}

/**
 * 清理旧草稿后，将指定项目载入编辑器。
 * @param {Object} item 待编辑项目。
 * @returns {Promise<void>}
 */
async function editCase(item) {
  if (cadUploading.value || videoUploading.value) {
    statusText.value = '文件还在上传，请稍候。'
    return
  }
  await discardUploadedCaseMedia()
  await discardUploadedCaseCadFiles()
  await discardUploadedCaseVideos()
  editingCase.value = item
  customStyleEnabled.value = Boolean(item.style && !caseStylePresets.includes(item.style))
  form.name = item.name
  form.category = item.category
  form.style = item.style || ''
  form.type = item.type
  form.year = item.year
  form.url = item.url
  form.blueprintUrl = item.blueprintUrl || ''
  form.cadFileName = item.cadFileName || ''
  form.cadFilePath = item.cadFilePath || ''
  form.videoUrl = item.videoUrl || ''
  form.images = imagesToList(item.list)
  form.coverImage = item.image || form.images[0] || ''
  form.note = item.note
  originalCaseMedia = new Set(getCaseMedia(item))
  originalCaseCadPath = form.cadFilePath
  originalCaseVideoUrl = form.videoUrl
  uploadedCaseMedia.clear()
  statusText.value = `正在编辑《${item.name}》。`
  resetCaseFormScroll()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 放弃未保存上传并切换荣誉编辑器到新增状态。
 * @returns {Promise<void>}
 */
async function startCreateAward() {
  await discardUploadedAwardMedia()
  originalAwardMedia = new Set()
  resetAwardForm()
  awardStatusText.value = '正在新增奖项。'
  resetAwardFormScroll()
}

/**
 * 清理旧草稿后，将指定荣誉载入编辑器。
 * @param {Object} item 待编辑荣誉。
 * @returns {Promise<void>}
 */
async function editAward(item) {
  await discardUploadedAwardMedia()
  editingAward.value = item
  awardForm.title = item.title
  awardForm.desc = item.desc
  awardForm.year = item.year
  awardForm.image = item.image
  awardForm.imageAlt = item.imageAlt || item.title
  originalAwardMedia = new Set(uniqueMediaUrls([item.image]))
  uploadedAwardMedia.clear()
  awardStatusText.value = `正在编辑《${item.title}》。`
  resetAwardFormScroll()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 上传 CAD 文件并写入当前作品附件字段。
 * @param {Event} event 文件输入框 change 事件。
 * @returns {Promise<void>}
 */
async function handleCadUpload(event) {
  const input = event.target
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  if (!cloudEnabled) {
    statusText.value = '本地浏览器模式不支持 CAD 文件上传，请配置云端存储后使用。'
    return
  }

  cadUploading.value = true
  statusText.value = `正在上传 CAD 文件：${file.name}`
  try {
    const filePath = await uploadCaseCadFile(file, currentCaseId())
    form.cadFileName = file.name
    form.cadFilePath = filePath
    uploadedCaseCadPaths.add(filePath)
    statusText.value = 'CAD 文件上传完成，请保存作品。'
  } catch (error) {
    statusText.value = `CAD 文件上传失败：${error.message}`
  } finally {
    cadUploading.value = false
  }
}

/**
 * 创建 CAD 文件的限时下载链接并打开。
 * @returns {Promise<void>}
 */
async function downloadCaseCadFile() {
  try {
    const url = await createCaseCadDownloadUrl(form.cadFilePath)
    window.open(url, '_blank', 'noopener')
  } catch (error) {
    statusText.value = `CAD 文件下载失败：${error.message}`
  }
}

/**
 * 从作品草稿中移除 CAD 附件，保存成功后清理云端文件。
 * @returns {void}
 */
function removeCaseCadFile() {
  form.cadFileName = ''
  form.cadFilePath = ''
}

/**
 * 从当前作品草稿中移除视频，保存成功后清理云端文件。
 * @returns {void}
 */
function removeCaseVideo() {
  form.videoUrl = ''
}

/**
 * 上传作品视频并将其地址关联到当前作品草稿。
 * @param {Event} event 文件输入框 change 事件。
 * @returns {Promise<void>}
 */
async function handleVideoUpload(event) {
  const input = event.target
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  if (!cloudEnabled) {
    statusText.value = '本地浏览器模式不支持视频上传，请配置云端存储后使用。'
    return
  }

  videoUploading.value = true
  statusText.value = `正在上传视频：${file.name}`
  try {
    const videoUrl = await uploadCaseVideo(file, currentCaseId())
    form.videoUrl = videoUrl
    uploadedCaseVideoUrls.add(videoUrl)
    statusText.value = '视频上传完成，请保存作品。'
  } catch (error) {
    statusText.value = `视频上传失败：${error.message}`
  } finally {
    videoUploading.value = false
  }
}

/**
 * 打开指定图片的后台放大预览。
 * @param {string} src 图片地址。
 * @param {string} alt 图片替代文本。
 * @returns {void}
 */
function openImagePreview(src, alt = '作品图片') {
  if (!src) {
    return
  }

  imagePreview.value = { src, alt }
}

/**
 * 关闭后台图片放大预览。
 * @returns {void}
 */
function closeImagePreview() {
  imagePreview.value = null
}

/**
 * 在图片预览打开时响应 Escape 键关闭操作。
 * @param {KeyboardEvent} event 键盘事件。
 * @returns {void}
 */
function handlePreviewKeydown(event) {
  if (event.key === 'Escape') {
    closeImagePreview()
  }
}

/**
 * 将当前项目表单组装为数据层可保存的完整载荷。
 * @returns {Object} 项目保存载荷。
 */
function formPayload() {
  return {
    id: currentCaseId(),
    name: form.name,
    category: form.category,
    style: form.style,
    type: form.type,
    year: form.year,
    url: form.url,
    blueprintUrl: form.blueprintUrl,
    cadFileName: form.cadFileName,
    cadFilePath: form.cadFilePath,
    videoUrl: form.videoUrl,
    images: form.images,
    image: form.coverImage || form.images[0] || '',
    note: form.note,
    createdAt: editingCase.value?.createdAt || Date.now(),
    hidden: Boolean(editingCase.value?.hidden)
  }
}

/**
 * 将当前荣誉表单组装为数据层可保存的完整载荷。
 * @returns {Object} 荣誉保存载荷。
 */
function awardPayload() {
  return {
    id: currentAwardId(),
    title: awardForm.title,
    desc: awardForm.desc,
    year: awardForm.year,
    image: awardForm.image,
    imageAlt: awardForm.imageAlt || awardForm.title,
    createdAt: editingAward.value?.createdAt || Date.now(),
    hidden: Boolean(editingAward.value?.hidden)
  }
}

/**
 * 校验并保存项目；云端成功后清理不再引用的旧图片。
 * @returns {Promise<void>}
 */
async function handleSubmit() {
  let saved = null
  let cleanupMessage = ''

  if (uploading.value || cadUploading.value || videoUploading.value) {
    statusText.value = '文件还在上传，请稍等。'
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
      const retainedMedia = new Set(getCurrentCaseMedia())
      const removedMedia = uniqueMediaUrls([
        [...originalCaseMedia],
        [...uploadedCaseMedia]
      ]).filter((url) => !retainedMedia.has(url))

      try {
        const cleanedCount = await cleanUnusedCloudMedia(removedMedia)
        if (cleanedCount) {
          cleanupMessage = `，并清理了 ${cleanedCount} 张旧图片`
        }
      } catch (cleanupError) {
        cleanupMessage = '；旧图片暂未清理，可稍后再次保存处理'
        console.warn('Failed to clean unused case images:', cleanupError)
      }
      const removedCadPaths = getUnusedCaseCadPaths([
        originalCaseCadPath,
        ...uploadedCaseCadPaths
      ])
      if (removedCadPaths.length) {
        try {
          await deleteCaseCadFiles(removedCadPaths)
        } catch (cleanupError) {
          cleanupMessage += '；旧 CAD 文件暂未清理'
          console.warn('Failed to clean unused case CAD files:', cleanupError)
        }
      }
      const removedVideoUrls = getUnusedCaseVideoUrls([
        originalCaseVideoUrl,
        ...uploadedCaseVideoUrls
      ])
      if (removedVideoUrls.length) {
        try {
          await deleteCaseVideos(removedVideoUrls)
        } catch (cleanupError) {
          cleanupMessage += '；旧视频暂未清理'
          console.warn('Failed to clean unused case videos:', cleanupError)
        }
      }
    } else {
      saved = isEditing.value
        ? saveCaseOverride(formPayload())
        : saveCustomCase(formPayload())
    }

    if (!saved) {
      statusText.value = '请至少填写作品名称和上传一张作品图片。'
      return
    }

    statusText.value = `已保存《${saved.name}》${cleanupMessage}。`
    originalCaseMedia = new Set()
    uploadedCaseMedia.clear()
    originalCaseCadPath = saved.cadFilePath || ''
    uploadedCaseCadPaths = new Set()
    originalCaseVideoUrl = saved.videoUrl || ''
    uploadedCaseVideoUrls = new Set()
    resetForm()
    refreshList()
  } catch (error) {
    statusText.value = `保存失败：${error.message}`
  } finally {
    saving.value = false
  }
}

/**
 * 校验并保存荣誉；云端成功后清理不再引用的旧图片。
 * @returns {Promise<void>}
 */
async function handleAwardSubmit() {
  let saved = null
  let cleanupMessage = ''

  if (awardUploading.value) {
    awardStatusText.value = '奖项图片还在上传，请稍等。'
    return
  }

  if (!awardForm.image) {
    awardStatusText.value = '请上传一张奖项图片。'
    return
  }

  awardSaving.value = true

  try {
    if (cloudEnabled) {
      saved = await upsertCloudAward(awardPayload())
      await refreshCloudList()
      const retainedMedia = new Set(uniqueMediaUrls([awardForm.image]))
      const removedMedia = uniqueMediaUrls([
        [...originalAwardMedia],
        [...uploadedAwardMedia]
      ]).filter((url) => !retainedMedia.has(url))

      try {
        const cleanedCount = await cleanUnusedCloudMedia(removedMedia)
        if (cleanedCount) {
          cleanupMessage = '，并清理了旧图片'
        }
      } catch (cleanupError) {
        cleanupMessage = '；旧图片暂未清理，可稍后再次保存处理'
        console.warn('Failed to clean unused award image:', cleanupError)
      }
    } else {
      saved = editingAward.value
        ? saveAwardOverride(awardPayload())
        : saveCustomAward(awardPayload())
    }

    if (!saved) {
      awardStatusText.value = '请至少填写奖项标题和上传一张图片。'
      return
    }

    awardStatusText.value = `已保存《${saved.title}》${cleanupMessage}。`
    originalAwardMedia = new Set()
    uploadedAwardMedia.clear()
    resetAwardForm()
    refreshAwardsList()
  } catch (error) {
    awardStatusText.value = `奖项保存失败：${error.message}`
  } finally {
    awardSaving.value = false
  }
}

/**
 * 隐藏指定项目；云端模式更新记录，本地模式写入隐藏列表。
 * @param {string|number} id 项目唯一标识。
 * @returns {Promise<void>}
 */
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

/**
 * 恢复指定项目显示；云端模式更新记录，本地模式移出隐藏列表。
 * @param {string|number} id 项目唯一标识。
 * @returns {Promise<void>}
 */
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

/**
 * 隐藏指定荣誉；云端模式更新记录，本地模式写入隐藏列表。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {Promise<void>}
 */
async function hideAward(id) {
  try {
    const target = managedAwards.value.find((item) => String(item.id) === String(id))
    if (cloudEnabled && target) {
      await upsertCloudAward({ ...target, hidden: true })
      await refreshCloudList()
    } else {
      hideBaseAward(id)
      refreshAwardsList()
    }
    awardStatusText.value = '已隐藏奖项。'
  } catch (error) {
    awardStatusText.value = `隐藏奖项失败：${error.message}`
  }
}

/**
 * 恢复指定荣誉显示；云端模式更新记录，本地模式移出隐藏列表。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {Promise<void>}
 */
async function restoreAward(id) {
  try {
    const target = managedAwards.value.find((item) => String(item.id) === String(id))
    if (cloudEnabled && target) {
      await upsertCloudAward({ ...target, hidden: false })
      await refreshCloudList()
    } else {
      showBaseAward(id)
      refreshAwardsList()
    }
    awardStatusText.value = '奖项已恢复显示。'
  } catch (error) {
    awardStatusText.value = `恢复奖项失败：${error.message}`
  }
}

/**
 * 删除本地项目覆盖和隐藏状态，恢复默认项目内容。
 * @param {string|number} id 项目唯一标识。
 * @returns {void}
 */
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

/**
 * 删除本地荣誉覆盖和隐藏状态，恢复默认荣誉内容。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {void}
 */
function resetAward(id) {
  if (cloudEnabled) {
    awardStatusText.value = '云端模式下没有本地默认内容可恢复。'
    return
  }

  resetAwardOverride(id)
  showBaseAward(id)
  refreshAwardsList()
  resetAwardForm()
  awardStatusText.value = '已恢复默认奖项。'
}

/**
 * 永久删除项目；云端删除记录后再清理没有引用的媒体。
 * @param {string|number} id 项目唯一标识。
 * @returns {Promise<void>}
 */
async function removeCustom(id) {
  let mediaCleanupFailed = false
  let cadCleanupFailed = false

  try {
    if (cloudEnabled) {
      const target = managedCases.value.find((item) => String(item.id) === String(id))
      const mediaToClean = uniqueMediaUrls([
        getCaseMedia(target),
        [...uploadedCaseMedia]
      ])
      const cadPathToClean = target?.cadFilePath
      const videoUrlsToClean = uniqueMediaUrls([target?.videoUrl, [...uploadedCaseVideoUrls]])
      await deleteCloudCase(id)
      await refreshCloudList()
      try {
        await cleanUnusedCloudMedia(mediaToClean)
      } catch (cleanupError) {
        console.warn('Failed to clean deleted case images:', cleanupError)
        mediaCleanupFailed = true
      }
      const unusedCadPaths = getUnusedCaseCadPaths([cadPathToClean])
      if (unusedCadPaths.length) {
        try {
          await deleteCaseCadFiles(unusedCadPaths)
        } catch (cleanupError) {
          console.warn('Failed to clean deleted case CAD file:', cleanupError)
          cadCleanupFailed = true
        }
      }
      const unusedVideoUrls = getUnusedCaseVideoUrls(videoUrlsToClean)
      if (unusedVideoUrls.length) {
        try {
          await deleteCaseVideos(unusedVideoUrls)
        } catch (cleanupError) {
          console.warn('Failed to clean deleted case videos:', cleanupError)
          mediaCleanupFailed = true
        }
      }
      originalCaseMedia = new Set()
      uploadedCaseMedia.clear()
      originalCaseCadPath = ''
      uploadedCaseCadPaths = new Set()
      originalCaseVideoUrl = ''
      uploadedCaseVideoUrls = new Set()
    } else {
      deleteCustomCase(id)
      refreshList()
    }
    resetForm()
    statusText.value = mediaCleanupFailed || cadCleanupFailed
      ? '作品已删除，部分旧文件暂未清理。'
      : '已删除作品。'
  } catch (error) {
    statusText.value = `删除失败：${error.message}`
  }
}

/**
 * 永久删除荣誉；云端删除记录后再清理没有引用的图片。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {Promise<void>}
 */
async function removeAward(id) {
  let mediaCleanupFailed = false

  try {
    if (cloudEnabled) {
      const target = managedAwards.value.find((item) => String(item.id) === String(id))
      const mediaToClean = uniqueMediaUrls([target?.image, [...uploadedAwardMedia]])
      await deleteCloudAward(id)
      await refreshCloudList()
      try {
        await cleanUnusedCloudMedia(mediaToClean)
      } catch (cleanupError) {
        console.warn('Failed to clean deleted award image:', cleanupError)
        mediaCleanupFailed = true
      }
      originalAwardMedia = new Set()
      uploadedAwardMedia.clear()
    } else {
      deleteCustomAward(id)
      refreshAwardsList()
    }
    resetAwardForm()
    awardStatusText.value = mediaCleanupFailed ? '奖项已删除，旧图片暂未清理。' : '已删除奖项。'
  } catch (error) {
    awardStatusText.value = `删除奖项失败：${error.message}`
  }
}

onMounted(() => {
  window.addEventListener('keydown', handlePreviewKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlePreviewKeydown)


})
</script>

<style scoped lang="scss">
.manager-page { min-height: calc(100vh - var(--nav-height)); min-height: calc(100svh - var(--nav-height)); background: #f1f1f1; }
.manager-shell { width: min(1280px, calc(100% - 40px)); margin: 0 auto; }
.manager-page > .manager-shell:not(.compact-shell) { height: calc(100vh - var(--nav-height)); height: calc(100svh - var(--nav-height)); min-height: 0; display: flex; flex-direction: column; }
.compact-shell { width: min(520px, calc(100% - 40px)); min-height: calc(100vh - var(--nav-height)); min-height: calc(100svh - var(--nav-height)); display: flex; align-items: center; justify-content: center; }
.compact-shell > .auth-panel { width: 100%; }
.manager-header { flex: 0 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
.manager-header p { margin: 0 0 8px; color: #69717d; letter-spacing: 2px; }
.manager-header h1 { margin: 0; color: #11161d; font-size: 38px; font-weight: 500; }
.manager-tabs { display: inline-flex; gap: 8px; margin-top: 14px; padding: 5px; background: #e7ebf0; }
.manager-tabs button { border: 0; background: transparent; color: #46515f; padding: 9px 16px; cursor: pointer; }
.manager-tabs button.active { background: #11161d; color: #fff; }
.manager-account { display: flex; align-items: center; gap: 12px; color: #69717d; }
.manager-account button { border: 1px solid #d8dde4; background: #fff; color: #11161d; padding: 9px 14px; cursor: pointer; }
.auth-panel { display: grid; gap: 18px; border: 1px solid rgba(17, 22, 29, 0.1); background: #fff; padding: 34px; }
.auth-panel p,
.auth-panel h1,
.auth-panel span { margin: 0; }
.auth-panel > p { color: #69717d; letter-spacing: 2px; }
.auth-panel h1 { color: #11161d; font-size: 34px; font-weight: 500; }
.auth-actions { margin-top: 4px; }
.auth-panel .field { min-width: 0; display: grid; gap: 8px; }
.auth-panel .field span { color: #242a32; font-size: 15px; }
.auth-panel .field input { box-sizing: border-box; width: 100%; height: 46px; border: 1px solid #d8dde4; background: #fbfbfb; color: #11161d; padding: 12px 13px; font: inherit; }
.auth-panel .field input:focus { outline: 2px solid rgba(17, 22, 29, 0.16); border-color: #11161d; }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.form-actions p { margin: 0; color: #69717d; }
.form-actions button { border: 0; background: #11161d; color: #fff; padding: 11px 16px; cursor: pointer; }
.form-actions button:disabled { opacity: 0.55; cursor: not-allowed; }
.image-lightbox { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: rgba(9, 12, 16, 0.82); }
.lightbox-panel { position: relative; max-width: min(1080px, calc(100vw - 48px)); max-height: calc(100vh - 48px); }
.lightbox-panel img { display: block; max-width: 100%; max-height: calc(100vh - 96px); object-fit: contain; background: #0f1318; }
.lightbox-close { position: absolute; top: 12px; right: 12px; border: 0; background: rgba(255, 255, 255, 0.92); color: #11161d; padding: 9px 12px; cursor: pointer; }

@media (max-width: 1080px) {
  .manager-page > .manager-shell:not(.compact-shell) { height: auto; min-height: 0; display: block; }
}
@media (max-width: 760px) {
  .manager-page { min-height: calc(100vh - var(--nav-height)); min-height: calc(100svh - var(--nav-height)); padding-top: 28px; }
  .compact-shell { min-height: calc(100vh - var(--nav-height) - 28px); min-height: calc(100svh - var(--nav-height) - 28px); }
  .form-actions,
  .manager-header { align-items: stretch; flex-direction: column; }
}
</style>
