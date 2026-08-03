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

      <div v-if="managerMode === 'cases'" class="manager-layout">
        <form class="case-form" @submit.prevent="handleSubmit">
          <div class="form-title">
            <h2>{{ isEditing ? '编辑作品' : '新增作品' }}</h2>
            <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
            <button v-if="isEditing" type="button" class="plain-btn" @click="startCreate">新建</button>
          </div>

          <div ref="caseFormScroll" class="case-form-scroll">
            <label class="field">
              <span>作品名称</span>
              <input v-model.trim="form.name" type="text" required placeholder="例如：东禾新办公室" />
            </label>

            <div class="form-grid">
              <label class="field">
                <span>空间类型</span>
                <div class="select-control">
                  <select v-model="form.category">
                    <option v-for="tag in caseTags" :key="tag" :value="tag">{{ tag }}</option>
                  </select>
                </div>
              </label>

              <label class="field">
                <span>设计风格</span>
                <div class="select-control">
                  <select :value="selectedStyleOption" @change="handleStyleOptionChange">
                    <option value="">请选择设计风格</option>
                    <option v-for="style in caseStylePresets" :key="style" :value="style">{{ style }}</option>
                    <option :value="CUSTOM_STYLE_VALUE">自定义风格</option>
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

              <div class="external-image-entry">
                <input
                  v-model.trim="externalImageUrl"
                  type="url"
                  placeholder="https:// 外部图片链接"
                  aria-label="外部作品图片链接"
                  @keyup.enter.prevent="addExternalImage"
                />
                <button type="button" @click="addExternalImage">添加链接</button>
              </div>

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
                    <img :src="image" :alt="`作品图片 ${index + 1}`" loading="lazy" decoding="async" />
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
          </div>

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
              v-for="item in paginatedManagedCases"
              :key="item.id"
              class="saved-item"
              :class="{ muted: item.hidden }"
            >
              <button
                class="saved-image-button"
                type="button"
                @click="openImagePreview(item.image, item.name)"
              >
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
                  <button type="button" @click="editCase(item)">编辑</button>
                  <button v-if="canToggleVisibility(item) && !item.hidden" type="button" @click="hideCase(item.id)">隐藏</button>
                  <button v-if="canToggleVisibility(item) && item.hidden" type="button" @click="restoreCase(item.id)">显示</button>
                  <button v-if="canReset(item)" type="button" @click="resetBase(item.id)">恢复默认</button>
                  <button v-if="canDelete(item)" type="button" class="danger" @click="removeCustom(item.id)">删除</button>
                </div>
              </div>
            </article>
          </div>

          <nav v-if="caseListPageCount > 1" class="manager-pagination" aria-label="后台作品列表分页">
            <button
              type="button"
              :disabled="caseListPage === 1"
              aria-label="上一页"
              @click="setCaseListPage(caseListPage - 1)"
            >
              ←
            </button>
            <span>第 {{ caseListPage }} / {{ caseListPageCount }} 页</span>
            <button
              type="button"
              :disabled="caseListPage === caseListPageCount"
              aria-label="下一页"
              @click="setCaseListPage(caseListPage + 1)"
            >
              →
            </button>
          </nav>
        </section>
      </div>

      <div v-else class="manager-layout">
        <form class="case-form" @submit.prevent="handleAwardSubmit">
          <div class="form-title">
            <h2>{{ editingAward ? '编辑奖项' : '新增奖项' }}</h2>
            <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
            <button v-if="editingAward" type="button" class="plain-btn" @click="startCreateAward">新建</button>
          </div>

          <div ref="awardFormScroll" class="case-form-scroll">
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
                <input type="file" accept="image/*" @change="handleAwardImageUpload" />
                <strong>{{ awardUploading ? '正在上传图片' : '选择奖项图片' }}</strong>
                <small>{{ cloudEnabled ? '图片会上传到云端图库' : '本地模式会保存到当前浏览器' }}</small>
              </label>

              <div class="external-image-entry">
                <input
                  v-model.trim="externalAwardImageUrl"
                  type="url"
                  placeholder="https:// 外部图片链接"
                  aria-label="外部奖项图片链接"
                  @keyup.enter.prevent="addExternalAwardImage"
                />
                <button type="button" @click="addExternalAwardImage">添加链接</button>
              </div>

              <div v-if="awardForm.image" class="upload-preview-grid award-preview-grid">
                <article class="upload-preview">
                  <button
                    class="preview-image-button"
                    type="button"
                    @click="openImagePreview(awardForm.image, awardForm.imageAlt || awardForm.title)"
                  >
                    <img :src="awardForm.image" :alt="awardForm.imageAlt || awardForm.title || '奖项图片'" loading="lazy" decoding="async" />
                    <span>放大</span>
                  </button>
                  <div class="preview-actions">
                    <span>当前图片</span>
                    <button type="button" @click="removeAwardImage">删除</button>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <p>{{ awardStatusText }}</p>
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
            <span>{{ managedAwards.length }} 个</span>
          </div>

          <div class="saved-list">
            <article
              v-for="item in managedAwards"
              :key="item.id"
              class="saved-item"
              :class="{ muted: item.hidden }"
            >
              <button
                class="saved-image-button"
                type="button"
                @click="openImagePreview(item.image, item.imageAlt || item.title)"
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
                  <button type="button" @click="editAward(item)">编辑</button>
                  <button v-if="canToggleAwardVisibility(item) && !item.hidden" type="button" @click="hideAward(item.id)">隐藏</button>
                  <button v-if="canToggleAwardVisibility(item) && item.hidden" type="button" @click="restoreAward(item.id)">显示</button>
                  <button v-if="canResetAward(item)" type="button" @click="resetAward(item.id)">恢复默认</button>
                  <button v-if="canDeleteAward(item)" type="button" class="danger" @click="removeAward(item.id)">删除</button>
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
        <img :src="imagePreview.src" :alt="imagePreview.alt" loading="lazy" decoding="async" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import vLazyImage from '@/directives/lazyImage'
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
  getManagerSession,
  isManagerAdmin,
  isCloudCasesEnabled,
  onManagerAuthChange,
  signInManager,
  signOutManager,
  deleteCloudImages,
  uploadAwardImage,
  uploadCaseCoverImage,
  uploadCaseImage,
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
const authReady = ref(!cloudEnabled)
const authLoading = ref(false)
const managerSession = ref(null)
const managerIsAdmin = ref(false)
const loginStatus = ref('请输入管理员账号。')
const saving = ref(false)
const uploading = ref(false)
const awardSaving = ref(false)
const awardUploading = ref(false)
const draftCaseId = ref(createCaseId())
const draftAwardId = ref(createAwardId())
const imagePreview = ref(null)
const caseFormScroll = ref(null)
const awardFormScroll = ref(null)
const externalImageUrl = ref('')
const externalAwardImageUrl = ref('')
const customStyleEnabled = ref(false)
const caseListPage = ref(1)
let originalCaseMedia = new Set()
let uploadedCaseMedia = new Set()
let originalAwardMedia = new Set()
let uploadedAwardMedia = new Set()
let stopAuthListener = null

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

const isEditing = computed(() => Boolean(editingCase.value))
const managerEmail = computed(() => managerSession.value?.user?.email || '')
const selectedStyleOption = computed(() => customStyleEnabled.value ? CUSTOM_STYLE_VALUE : form.style)
const caseListPageCount = computed(() => Math.max(1, Math.ceil(managedCases.value.length / MANAGER_CASE_PAGE_SIZE)))
const paginatedManagedCases = computed(() => {
  const start = (caseListPage.value - 1) * MANAGER_CASE_PAGE_SIZE
  return managedCases.value.slice(start, start + MANAGER_CASE_PAGE_SIZE)
})
const MAX_IMAGE_UPLOAD_BYTES = 9 * 1024 * 1024
const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024
const GALLERY_MAX_EDGE = 1920
const GALLERY_MAX_BYTES = 1.5 * 1024 * 1024
const GALLERY_QUALITY = 0.84
const COVER_MAX_EDGE = 960
const COVER_MAX_BYTES = 280 * 1024
const COVER_QUALITY = 0.78
const MIN_IMAGE_QUALITY = 0.62
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

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
 * 将图片数组或分隔字符串转换为独立副本的 URL 列表。
 * @param {Array|string} list 原始图片字段。
 * @returns {string[]} 标准化图片列表。
 */
function imagesToList(list) {
  if (Array.isArray(list)) {
    return [...list]
  }

  return String(list || '')
    .split(/\r?\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * 展平、清洗并去重多组媒体地址。
 * @param {Array} values 媒体地址或媒体地址数组集合。
 * @returns {string[]} 唯一且非空的媒体地址。
 */
function uniqueMediaUrls(values) {
  return [...new Set(
    values
      .flat()
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )]
}

/**
 * 收集项目画册与封面引用的全部媒体地址。
 * @param {Object|null|undefined} item 项目数据。
 * @returns {string[]} 项目使用的唯一媒体地址。
 */
function getCaseMedia(item) {
  return uniqueMediaUrls([item?.list || item?.images || [], item?.image])
}

/**
 * 收集当前项目表单引用的全部媒体地址。
 * @returns {string[]} 当前表单使用的唯一媒体地址。
 */
function getCurrentCaseMedia() {
  return uniqueMediaUrls([form.images, form.coverImage])
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

  uploadedCaseMedia = new Set()
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

  uploadedAwardMedia = new Set()
}

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
    caseFormScroll.value?.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

/**
 * 在 DOM 更新后将荣誉表单平滑滚动到顶部。
 * @returns {void}
 */
function resetAwardFormScroll() {
  nextTick(() => {
    awardFormScroll.value?.scrollTo({ top: 0, behavior: 'smooth' })
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
 * 重新校验当前会话的管理员权限并更新页面状态。
 * @returns {Promise<boolean>} 当前账号是否拥有管理权限。
 */
async function refreshAdminStatus() {
  if (!cloudEnabled || !managerSession.value) {
    managerIsAdmin.value = false
    return false
  }

  managerIsAdmin.value = await isManagerAdmin()
  return managerIsAdmin.value
}

/**
 * 放弃未保存上传并切换项目编辑器到新增状态。
 * @returns {Promise<void>}
 */
async function startCreate() {
  await discardUploadedCaseMedia()
  originalCaseMedia = new Set()
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
  await discardUploadedCaseMedia()
  editingCase.value = item
  customStyleEnabled.value = Boolean(item.style && !caseStylePresets.includes(item.style))
  form.name = item.name
  form.category = item.category
  form.style = item.style || ''
  form.type = item.type
  form.year = item.year
  form.url = item.url
  form.images = imagesToList(item.list)
  form.coverImage = item.image || form.images[0] || ''
  form.note = item.note
  originalCaseMedia = new Set(getCaseMedia(item))
  uploadedCaseMedia = new Set()
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
  uploadedAwardMedia = new Set()
  awardStatusText.value = `正在编辑《${item.title}》。`
  resetAwardFormScroll()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 将字节数格式化为一位小数的 MB 文本。
 * @param {number} bytes 文件字节数。
 * @returns {string} 可读文件大小。
 */
function fileSizeLabel(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

/**
 * 为转码后的 JPEG 文件生成上传文件名。
 * @param {File} file 原始文件。
 * @returns {string} 使用 jpg 扩展名的文件名。
 */
function uploadFileName(file) {
  return String(file.name || 'image.jpg').replace(/\.[^.]+$/, '') + '.jpg'
}

/**
 * 判断文件 MIME 类型是否属于允许上传的图片格式。
 * @param {File|Blob} file 待检查文件。
 * @returns {boolean} 格式受支持时返回 true。
 */
function isSupportedImage(file) {
  return SUPPORTED_IMAGE_TYPES.has(file.type)
}

/**
 * 通过临时对象地址将本地文件解码为图片元素。
 * @param {File|Blob} file 图片文件。
 * @returns {Promise<HTMLImageElement>} 已完成解码的图片元素。
 */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('图片读取失败，请换成 JPG、PNG、WebP 或 GIF 后重试。'))
    }
    image.src = objectUrl
  })
}

/**
 * 将画布异步编码为指定格式和质量的 Blob。
 * @param {HTMLCanvasElement} canvas 待编码画布。
 * @param {string} type 输出 MIME 类型。
 * @param {number} quality 输出质量比例。
 * @returns {Promise<Blob>} 编码后的图片 Blob。
 */
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('图片压缩失败，请换一张图片重试。'))
      }
    }, type, quality)
  })
}

/**
 * 按尺寸和体积限制生成网页 JPEG；允许配置保留合规 GIF。
 * @param {File} file 原始图片文件。
 * @param {Object} options 最大边长、体积、质量及 GIF 策略。
 * @returns {Promise<{file: File, optimized: boolean}>} 可上传文件和是否转码标记。
 * @throws {Error} 文件格式、大小或浏览器图片处理能力不符合要求时抛出。
 */
async function createImageVariant(file, options) {
  if (!isSupportedImage(file)) {
    throw new Error('仅支持 JPG、PNG、WebP 或 GIF 图片。')
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(`原图过大（${fileSizeLabel(file.size)}），请先导出为 25MB 以下的图片。`)
  }

  if (file.type === 'image/gif' && options.keepGif) {
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error(`GIF 过大（${fileSizeLabel(file.size)}），请先压缩到 ${fileSizeLabel(MAX_IMAGE_UPLOAD_BYTES)} 以下。`)
    }

    return { file, optimized: false }
  }

  const image = await loadImageFromFile(file)
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('图片尺寸读取失败，请换一张图片重试。')
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('当前浏览器无法处理图片，请换用新版浏览器重试。')
  }

  let scale = Math.min(1, options.maxEdge / Math.max(image.naturalWidth, image.naturalHeight))

  while (scale > 0.1) {
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    canvas.width = width
    canvas.height = height
    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    let quality = options.quality
    let blob = await canvasToBlob(canvas, 'image/jpeg', quality)

    while (blob.size > options.maxBytes && quality > MIN_IMAGE_QUALITY) {
      quality = Math.max(MIN_IMAGE_QUALITY, quality - 0.06)
      blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    }

    if (blob.size <= options.maxBytes || Math.max(width, height) <= 720) {
      if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
        throw new Error(`图片处理后仍超过 ${fileSizeLabel(MAX_IMAGE_UPLOAD_BYTES)}，请先裁剪后重试。`)
      }

      return {
        file: new File([blob], uploadFileName(file), {
          type: 'image/jpeg',
          lastModified: Date.now()
        }),
        optimized: true
      }
    }

    scale *= 0.82
  }

  throw new Error('图片压缩失败，请换一张图片重试。')
}

/**
 * 按画册展示规格优化项目或荣誉图片。
 * @param {File} file 原始图片文件。
 * @returns {Promise<{file: File, optimized: boolean}>} 画册图片处理结果。
 */
function optimizeGalleryImage(file) {
  return createImageVariant(file, {
    maxEdge: GALLERY_MAX_EDGE,
    maxBytes: GALLERY_MAX_BYTES,
    quality: GALLERY_QUALITY,
    keepGif: true
  })
}

/**
 * 按轻量列表封面规格生成 JPEG 文件。
 * @param {File} file 原始或已处理图片文件。
 * @returns {Promise<{file: File, optimized: boolean}>} 封面图片处理结果。
 */
function createCoverImageFile(file) {
  return createImageVariant(file, {
    maxEdge: COVER_MAX_EDGE,
    maxBytes: COVER_MAX_BYTES,
    quality: COVER_QUALITY,
    keepGif: false
  })
}

/**
 * 将本地图片读取为 Data URL，供无云端配置时保存。
 * @param {File|Blob} file 图片文件。
 * @returns {Promise<string>} 图片 Data URL。
 */
function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * 校验外部图片地址，仅接受完整的 HTTP 或 HTTPS URL。
 * @param {*} value 用户输入地址。
 * @returns {string} 标准化地址；无效输入返回空字符串。
 */
function normalizeExternalImageUrl(value) {
  try {
    const url = new URL(String(value || '').trim())

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return ''
    }

    return url.href
  } catch (error) {
    return ''
  }
}

/**
 * 将有效且未重复的外部图片链接加入项目画册。
 * @returns {void}
 */
function addExternalImage() {
  try {
    const imageUrl = normalizeExternalImageUrl(externalImageUrl.value)

    if (!imageUrl) {
      throw new Error('请输入以 http:// 或 https:// 开头的有效图片链接。')
    }

    if (form.images.includes(imageUrl)) {
      statusText.value = '这张外部图片已经添加。'
      return
    }

    form.images = [...form.images, imageUrl]
    if (!form.coverImage) {
      form.coverImage = imageUrl
    }
    externalImageUrl.value = ''
    statusText.value = '已添加外部图片链接。'
  } catch (error) {
    statusText.value = `图片链接无效：${error.message}`
  }
}

/**
 * 将有效外部图片链接设为当前荣誉图片。
 * @returns {void}
 */
function addExternalAwardImage() {
  try {
    const imageUrl = normalizeExternalImageUrl(externalAwardImageUrl.value)
    if (!imageUrl) {
      throw new Error('请输入以 http:// 或 https:// 开头的有效图片链接。')
    }

    awardForm.image = imageUrl
    externalAwardImageUrl.value = ''
    if (!awardForm.imageAlt) {
      awardForm.imageAlt = awardForm.title || '奖项图片'
    }
    awardStatusText.value = '已添加外部图片链接。'
  } catch (error) {
    awardStatusText.value = `图片链接无效：${error.message}`
  }
}

/**
 * 依次优化并上传所选项目图片，首批图片同时生成轻量封面。
 * @param {Event} event 文件输入框 change 事件。
 * @returns {Promise<void>}
 */
async function handleImageUpload(event) {
  const input = event.target
  const files = Array.from(input.files || []).filter(isSupportedImage)

  if (!files.length) {
    statusText.value = '请选择图片文件。'
    return
  }

  uploading.value = true
  statusText.value = `正在处理并上传 ${files.length} 张图片。`

  const newImages = []
  const needsCover = !form.images.length
  let optimizedCount = 0

  try {
    let firstPreparedFile = null

    for (let index = 0; index < files.length; index += 1) {
      statusText.value = `正在处理并上传第 ${index + 1}/${files.length} 张图片。`
      const preparedImage = await optimizeGalleryImage(files[index])
      const imageUrl = cloudEnabled
        ? await uploadCaseImage(preparedImage.file, currentCaseId())
        : await readImageAsDataUrl(preparedImage.file)

      if (!firstPreparedFile) {
        firstPreparedFile = preparedImage.file
      }
      if (preparedImage.optimized) {
        optimizedCount += 1
      }
      if (cloudEnabled) {
        uploadedCaseMedia.add(imageUrl)
      }
      newImages.push(imageUrl)
    }

    form.images = [...form.images, ...newImages]

    if (needsCover && firstPreparedFile) {
      statusText.value = '正在生成列表封面。'
      const coverFile = await createCoverImageFile(firstPreparedFile)
      const coverUrl = cloudEnabled
        ? await uploadCaseCoverImage(coverFile.file, currentCaseId())
        : await readImageAsDataUrl(coverFile.file)

      form.coverImage = coverUrl
      if (cloudEnabled) {
        uploadedCaseMedia.add(coverUrl)
      }
    }

    statusText.value = `已添加 ${newImages.length} 张图片，${optimizedCount} 张已转为网页展示图，并生成了轻量列表封面。`
  } catch (error) {
    if (newImages.length) {
      form.images = [...form.images, ...newImages]
      if (!form.coverImage) {
        form.coverImage = form.images[0]
      }
    }
    statusText.value = newImages.length
      ? `图片处理未完成，已保留 ${newImages.length} 张：${error.message}`
      : `图片上传失败：${error.message}`
  } finally {
    uploading.value = false
    input.value = ''
  }
}

/**
 * 优化并上传第一张有效荣誉图片。
 * @param {Event} event 文件输入框 change 事件。
 * @returns {Promise<void>}
 */
async function handleAwardImageUpload(event) {
  const input = event.target
  const file = Array.from(input.files || []).find(isSupportedImage)

  if (!file) {
    awardStatusText.value = '请选择图片文件。'
    return
  }

  awardUploading.value = true
  awardStatusText.value = '正在处理并上传奖项图片。'

  try {
    const preparedImage = await optimizeGalleryImage(file)
    awardForm.image = cloudEnabled
      ? await uploadAwardImage(preparedImage.file, currentAwardId())
      : await readImageAsDataUrl(preparedImage.file)
    if (cloudEnabled) {
      uploadedAwardMedia.add(awardForm.image)
    }
    if (!awardForm.imageAlt) {
      awardForm.imageAlt = awardForm.title || '奖项图片'
    }
    awardStatusText.value = preparedImage.optimized
      ? '奖项图片已添加，并已转为网页展示图。'
      : '奖项图片已添加。'
  } catch (error) {
    awardStatusText.value = `奖项图片上传失败：${error.message}`
  } finally {
    awardUploading.value = false
    input.value = ''
  }
}

/**
 * 根据当前画册首图重新生成并上传轻量封面。
 * @returns {Promise<void>}
 */
async function refreshCoverImage() {
  const firstImage = form.images[0]

  if (!firstImage) {
    form.coverImage = ''
    return
  }

  if (!cloudEnabled) {
    form.coverImage = firstImage
    return
  }

  const response = await fetch(firstImage)
  if (!response.ok) {
    throw new Error('封面图片读取失败，请稍后重试。')
  }

  const sourceBlob = await response.blob()
  const sourceFile = new File([sourceBlob], 'cover-source.jpg', {
    type: sourceBlob.type || 'image/jpeg',
    lastModified: Date.now()
  })
  const coverFile = await createCoverImageFile(sourceFile)
  const coverUrl = await uploadCaseCoverImage(coverFile.file, currentCaseId())
  form.coverImage = coverUrl
  uploadedCaseMedia.add(coverUrl)
}

/**
 * 将指定画册图片移到首位并重新生成项目封面。
 * @param {number} index 目标图片索引。
 * @returns {Promise<void>}
 */
async function setCoverImage(index) {
  if (index <= 0 || !form.images[index]) {
    return
  }

  const images = [...form.images]
  const [cover] = images.splice(index, 1)
  form.images = [cover, ...images]

  statusText.value = '正在更新列表封面。'
  try {
    await refreshCoverImage()
    statusText.value = '封面已更新。'
  } catch (error) {
    form.coverImage = form.images[0]
    statusText.value = `封面已更新，轻量封面生成失败：${error.message}`
  }
}

/**
 * 从项目画册移除指定图片；移除首图时同步更新封面。
 * @param {number} index 待移除图片索引。
 * @returns {Promise<void>}
 */
async function removeImage(index) {
  const removedWasCover = index === 0
  form.images = form.images.filter((_, imageIndex) => imageIndex !== index)

  if (removedWasCover && form.images.length) {
    statusText.value = '正在更新列表封面。'
    try {
      await refreshCoverImage()
      statusText.value = '图片已移除，封面已更新。'
    } catch (error) {
      form.coverImage = form.images[0]
      statusText.value = `图片已移除，轻量封面生成失败：${error.message}`
    }
  } else if (!form.images.length) {
    form.coverImage = ''
  }
}

/**
 * 清空当前荣誉表单的图片引用。
 * @returns {void}
 */
function removeAwardImage() {
  awardForm.image = ''
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
 * 根据运行模式和数据来源生成项目来源标签。
 * @param {Object} item 项目数据。
 * @returns {string} 后台展示的项目来源文本。
 */
function caseLabel(item) {
  if (cloudEnabled) {
    return '云端作品'
  }

  return item.source === 'base' ? '原有作品' : '新增作品'
}

/**
 * 组合项目风格、类型和年份作为后台辅助信息。
 * @param {Object} item 项目数据。
 * @returns {string} 已过滤空值的项目辅助信息。
 */
function formatCaseMeta(item) {
  return [item.style || '风格待补充', item.type, item.year]
    .filter(Boolean)
    .join(' · ')
}

/**
 * 判断项目是否支持隐藏或恢复操作。
 * @param {Object} item 项目数据。
 * @returns {boolean} 可切换可见性时返回 true。
 */
function canToggleVisibility(item) {
  return cloudEnabled || item.source === 'base'
}

/**
 * 判断项目是否可恢复为本地默认内容。
 * @param {Object} item 项目数据。
 * @returns {boolean} 可恢复默认内容时返回 true。
 */
function canReset(item) {
  return !cloudEnabled && item.source === 'base'
}

/**
 * 判断项目是否允许永久删除。
 * @param {Object} item 项目数据。
 * @returns {boolean} 可删除时返回 true。
 */
function canDelete(item) {
  return cloudEnabled || item.source === 'custom'
}

/**
 * 根据运行模式和数据来源生成荣誉来源标签。
 * @param {Object} item 荣誉数据。
 * @returns {string} 后台展示的荣誉来源文本。
 */
function awardLabel(item) {
  if (cloudEnabled) {
    return '云端奖项'
  }

  return item.source === 'base' ? '原有奖项' : '新增奖项'
}

/**
 * 判断荣誉是否支持隐藏或恢复操作。
 * @param {Object} item 荣誉数据。
 * @returns {boolean} 可切换可见性时返回 true。
 */
function canToggleAwardVisibility(item) {
  return cloudEnabled || item.source === 'base'
}

/**
 * 判断荣誉是否可恢复为本地默认内容。
 * @param {Object} item 荣誉数据。
 * @returns {boolean} 可恢复默认内容时返回 true。
 */
function canResetAward(item) {
  return !cloudEnabled && item.source === 'base'
}

/**
 * 判断荣誉是否允许永久删除。
 * @param {Object} item 荣誉数据。
 * @returns {boolean} 可删除时返回 true。
 */
function canDeleteAward(item) {
  return cloudEnabled || item.source === 'custom'
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
    uploadedCaseMedia = new Set()
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
    uploadedAwardMedia = new Set()
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

  try {
    if (cloudEnabled) {
      const target = managedCases.value.find((item) => String(item.id) === String(id))
      const mediaToClean = uniqueMediaUrls([
        getCaseMedia(target),
        [...uploadedCaseMedia]
      ])
      await deleteCloudCase(id)
      await refreshCloudList()
      try {
        await cleanUnusedCloudMedia(mediaToClean)
      } catch (cleanupError) {
        console.warn('Failed to clean deleted case images:', cleanupError)
        mediaCleanupFailed = true
      }
      originalCaseMedia = new Set()
      uploadedCaseMedia = new Set()
    } else {
      deleteCustomCase(id)
      refreshList()
    }
    resetForm()
    statusText.value = mediaCleanupFailed ? '作品已删除，旧图片暂未清理。' : '已删除作品。'
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
      uploadedAwardMedia = new Set()
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

/**
 * 登录管理员账号、校验授权并加载云端内容。
 * @returns {Promise<void>}
 */
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

/**
 * 清理未保存上传、注销会话并重置后台编辑状态。
 * @returns {Promise<void>}
 */
async function handleLogout() {
  try {
    await discardUploadedCaseMedia()
    await discardUploadedAwardMedia()
    await signOutManager()
    managerSession.value = null
    managerIsAdmin.value = false
    originalCaseMedia = new Set()
    originalAwardMedia = new Set()
    resetForm()
    resetAwardForm()
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
  min-height: calc(100vh - var(--nav-height));
  min-height: calc(100svh - var(--nav-height));
  background: #f1f1f1;
  // padding: 44px 0 80px;
}

.manager-shell {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
}

.manager-page > .manager-shell:not(.compact-shell) {
  height: calc(100vh - var(--nav-height));
  height: calc(100svh - var(--nav-height));
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.compact-shell {
  width: min(520px, calc(100% - 40px));
  min-height: calc(100vh - var(--nav-height));
  min-height: calc(100svh - var(--nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
}

.compact-shell > .auth-panel {
  width: 100%;
}

.manager-header {
  flex: 0 0 auto;
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

.manager-tabs {
  display: inline-flex;
  gap: 8px;
  margin-top: 14px;
  padding: 5px;
  background: #e7ebf0;
}

.manager-tabs button {
  border: 0;
  background: transparent;
  color: #46515f;
  padding: 9px 16px;
  cursor: pointer;
}

.manager-tabs button.active {
  background: #11161d;
  color: #fff;
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
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(360px, 0.84fr) minmax(0, 1.16fr);
  gap: 24px;
  align-items: stretch;
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
  scrollbar-gutter: stable;
  padding: 0 28px 20px;
  scrollbar-color: #c5ccd5 transparent;
  scrollbar-width: thin;
}

.case-form-scroll::-webkit-scrollbar,
.saved-list::-webkit-scrollbar {
  width: 8px;
}

.case-form-scroll::-webkit-scrollbar-track,
.saved-list::-webkit-scrollbar-track {
  background: transparent;
}

.case-form-scroll::-webkit-scrollbar-thumb,
.saved-list::-webkit-scrollbar-thumb {
  background: #c5ccd5;
}

.case-form-scroll::-webkit-scrollbar-thumb:hover,
.saved-list::-webkit-scrollbar-thumb:hover {
  background: #9da7b3;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.award-form-grid {
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
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
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #d8dde4;
  background: #fbfbfb;
  color: #11161d;
  padding: 12px 13px;
  font: inherit;
}

.field input,
.field select {
  height: 46px;
}

.select-control {
  position: relative;
  min-width: 0;
}

.select-control::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid #69717d;
  border-bottom: 1.5px solid #69717d;
  pointer-events: none;
  transform: translateY(-70%) rotate(45deg);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.select-control select {
  display: block;
  padding: 0 42px 0 13px;
  appearance: none;
}

.select-control:focus-within::after {
  border-color: #11161d;
  transform: translateY(-35%) rotate(225deg);
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

.external-image-entry {
  display: flex;
  gap: 8px;
}

.external-image-entry input {
  width: 100%;
  min-width: 0;
  border: 1px solid #d8dde4;
  background: #fff;
  color: #11161d;
  padding: 10px 12px;
  font: inherit;
}

.external-image-entry input:focus {
  outline: 2px solid rgba(17, 22, 29, 0.16);
  border-color: #11161d;
}

.external-image-entry button {
  flex: 0 0 auto;
  border: 1px solid #11161d;
  background: #11161d;
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
}

.upload-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.award-preview-grid {
  grid-template-columns: minmax(0, 1fr);
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

.case-form > .form-actions {
  flex: 0 0 auto;
  padding: 18px 28px 28px;
  border-top: 1px solid #eef0f3;
  background: #fff;
}

.saved-panel {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.saved-head {
  flex: 0 0 auto;
  margin-bottom: 0;
  align-items: flex-start;
  padding: 26px 26px 18px;
}

.saved-head span,
.item-head span {
  color: #69717d;
  white-space: nowrap;
}

.saved-list {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  gap: 14px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 0 26px 26px;
  scrollbar-color: #c5ccd5 transparent;
  scrollbar-width: thin;
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
  opacity: 1;
  object-fit: cover;
  background: #ddd;
  transition: opacity 0.3s ease;
}

.saved-item img.lazy-image:not(.is-loaded) {
  opacity: 0;
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

.manager-pagination {
  flex: 0 0 auto;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-top: 1px solid #eef0f3;
  padding: 10px 26px;
  background: #fff;
}

.manager-pagination span {
  min-width: 92px;
  color: #69717d;
  font-size: 14px;
  text-align: center;
}

.manager-pagination button {
  width: 40px;
  height: 40px;
  border: 1px solid #d8dde4;
  background: #fff;
  color: #11161d;
  font: inherit;
  cursor: pointer;
}

.manager-pagination button:hover,
.manager-pagination button:focus-visible {
  border-color: #11161d;
  background: #11161d;
  color: #fff;
}

.manager-pagination button:focus-visible {
  outline: 2px solid rgba(17, 22, 29, 0.16);
  outline-offset: 2px;
}

.manager-pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.manager-pagination button:disabled:hover {
  border-color: #d8dde4;
  background: #fff;
  color: #11161d;
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
  .manager-page > .manager-shell:not(.compact-shell) {
    height: auto;
    min-height: 0;
    display: block;
  }

  .manager-layout {
    grid-template-columns: 1fr;
  }

  .case-form,
  .saved-panel {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .case-form-scroll,
  .saved-list {
    overflow: visible;
  }
}

@media (max-width: 760px) {
  .manager-page {
    min-height: calc(100vh - var(--nav-height));
    min-height: calc(100svh - var(--nav-height));
    padding-top: 28px;
  }

  .compact-shell {
    min-height: calc(100vh - var(--nav-height) - 28px);
    min-height: calc(100svh - var(--nav-height) - 28px);
  }

  .form-grid,
  .award-form-grid,
  .upload-preview-grid,
  .saved-item {
    grid-template-columns: 1fr;
  }

  .form-actions,
  .manager-header,
  .saved-head,
  .item-head,
  .external-image-entry {
    align-items: stretch;
    flex-direction: column;
  }

  .external-image-entry button {
    min-height: 42px;
  }

  .saved-item img {
    width: 100%;
  }

  .saved-image-button {
    width: 100%;
  }

  .manager-pagination {
    padding-inline: 18px;
  }
}
</style>
