<template>
  <div class="view-more-page">
    <main class="project-shell">
      <ProjectGallery
        :name="currentCase.name"
        :note="currentCase.note"
        :category="currentCase.category"
        :design-style="currentCase.style"
        :type="currentCase.type"
        :year="currentCase.year"
        :images="currentCase.list || []"
      />

      <section v-if="currentCase.videoUrl" class="video-section">
        <div class="video-section-heading">
          <span class="section-kicker">PROJECT VIDEO</span>
          <h2>项目视频</h2>
        </div>
        <div
          ref="videoPlayerFrame"
          class="video-player-frame"
          :class="{ 'is-fullscreen': isVideoFullscreen }"
        >
          <video
            ref="videoPlayer"
            :src="currentCase.videoUrl"
            controls
            playsinline
            preload="auto"
            @error="handleVideoError"
            @webkitbeginfullscreen="isVideoFullscreen = true"
            @webkitendfullscreen="isVideoFullscreen = false"
          ></video>
          <button
            type="button"
            class="video-fullscreen-button"
            :aria-label="isVideoFullscreen ? '退出全屏' : '全屏播放'"
            @click="toggleVideoFullscreen"
          >
            {{ isVideoFullscreen ? '退出全屏' : '全屏播放' }}
          </button>
          <p v-if="videoStatus" class="video-status" role="alert">{{ videoStatus }}</p>
        </div>
      </section>

      <footer class="page-nav">
        <button type="button" class="dh-action" @click="goWorks">
          <span class="dh-action__label">返回索引</span>
          <span class="dh-action__mark">←</span>
        </button>

        <div class="dh-action-group">
          <button v-if="URL" type="button" class="dh-action dh-action--solid" @click="go3D">
            <span class="dh-action__label">打开3D</span>
            <span class="dh-action__mark">↗</span>
          </button>

          <button v-if="blueprintURL" type="button" class="dh-action" @click="goBlueprint">
            <span class="dh-action__label">水电底图</span>
            <span class="dh-action__mark">↗</span>
          </button>

          <button
            v-if="currentCase.cadFilePath"
            type="button"
            class="dh-action"
            :disabled="cadDownloading"
            @click="downloadCadDrawing"
          >
            <span class="dh-action__label">{{ cadDownloading ? '正在准备下载' : '下载 CAD 图纸' }}</span>
            <span class="dh-action__mark">↓</span>
          </button>
        </div>
      </footer>
    </main>

    <div
      v-if="cadDownloadStatus"
      class="cad-notice-backdrop"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cad-notice-title"
      @click.self="closeCadDownloadNotice"
    >
      <section class="cad-notice">
        <h2 id="cad-notice-title">CAD 图纸提示</h2>
        <p>{{ cadDownloadStatus }}</p>
        <button type="button" @click="closeCadDownloadNotice">知道了</button>
      </section>
    </div>

  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectGallery from '@/components/project/ProjectGallery.vue'
import { getDisplayDesignCases, getDisplayWorksList } from '@/mock/data'
import { normalizeCaseLinks, openExternalLink } from '@/services/caseLinks.mjs'
import {
  createCaseCadDownloadUrl,
  getManagerAccessState
} from '@/services/cloudCases'

const route = useRoute()
const router = useRouter()

const displayWorks = ref(getDisplayWorksList())
const displayDesignCases = ref(getDisplayDesignCases())
const cadDownloading = ref(false)
const cadDownloadStatus = ref('')
const videoPlayerFrame = ref(null)
const videoPlayer = ref(null)
const isVideoFullscreen = ref(false)
const videoStatus = ref('')
const currentCase = computed(() => {
  const routeId = String(route.params.id || '')
  const work = displayWorks.value.find((item) => String(item.id) === routeId) || displayWorks.value[0] || {}
  const designCase = displayDesignCases.value.find((item) => String(item.id) === String(work.id || routeId)) || {}
  const list = work.list || designCase.list || []

  const links = normalizeCaseLinks({
    url: designCase.url || work.url || '',
    blueprintUrl: designCase.blueprintUrl || work.blueprintUrl || ''
  })

  return {
    ...designCase,
    ...work,
    ...links,
    list,
    image: work.image || work.cover || designCase.image || list[0] || ''
  }
})

const URL = computed(() => currentCase.value.url)
const blueprintURL = computed(() => currentCase.value.blueprintUrl || '')

/**
 * 返回完整项目索引页。
 * @returns {void}
 */
function goWorks() {
  router.push({ name: 'worksGallery' })
}

/**
 * 在新标签页打开当前项目配置的外部 3D 地址。
 * @returns {void}
 */
function go3D() {
  openExternalLink(URL.value)
}

/**
 * 在新标签页打开当前项目配置的水电底图链接。
 * @returns {void}
 */
function goBlueprint() {
  openExternalLink(blueprintURL.value)
}

function closeCadDownloadNotice() {
  cadDownloadStatus.value = ''
}

/**
 * 为管理员下载当前作品 CAD 图纸，并保留上传时的原始文件名。
 * @returns {Promise<void>}
 */
async function downloadCadDrawing() {
  if (!currentCase.value.cadFilePath || cadDownloading.value) {
    return
  }

  cadDownloading.value = true
  cadDownloadStatus.value = ''
  try {
    let accessState
    try {
      accessState = await getManagerAccessState()
    } catch (error) {
      cadDownloadStatus.value = `管理员权限检查失败：${error.message}`
      return
    }

    if (!accessState.isAdmin) {
      cadDownloadStatus.value = '请先登录后台管理员'
      return
    }

    const fileName = currentCase.value.cadFileName || 'drawing'
    const url = await createCaseCadDownloadUrl(currentCase.value.cadFilePath, fileName)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`文件服务器返回错误（${response.status}）。`)
    }

    const fileBlob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(fileBlob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 60000)
  } catch (error) {
    cadDownloadStatus.value = `CAD 图纸下载失败：${error.message}`
  } finally {
    cadDownloading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    refreshDetail()
  }
)

/**
 * 内容更新后重新读取当前详情数据并回到画册首图。
 * @returns {void}
 */
function refreshDetail() {
  displayWorks.value = getDisplayWorksList()
  displayDesignCases.value = getDisplayDesignCases()
  cadDownloadStatus.value = ''
}

onMounted(() => {
  window.addEventListener('donghe-custom-cases-updated', refreshDetail)
  document.addEventListener('fullscreenchange', syncVideoFullscreenState)
  document.addEventListener('webkitfullscreenchange', syncVideoFullscreenState)
})

onBeforeUnmount(() => {
  window.removeEventListener('donghe-custom-cases-updated', refreshDetail)
  document.removeEventListener('fullscreenchange', syncVideoFullscreenState)
  document.removeEventListener('webkitfullscreenchange', syncVideoFullscreenState)
})

function syncVideoFullscreenState() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
  isVideoFullscreen.value = fullscreenElement === videoPlayerFrame.value
}

function handleVideoError() {
  videoStatus.value = '视频无法播放，请确认文件编码为 H.264 的 MP4，或检查视频链接是否有效。'
}

async function toggleVideoFullscreen() {
  const frame = videoPlayerFrame.value
  const video = videoPlayer.value
  if (!frame || !video) {
    return
  }

  videoStatus.value = ''
  try {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    if (fullscreenElement === frame) {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen
      if (exitFullscreen) {
        await exitFullscreen.call(document)
      }
      return
    }

    if (frame.requestFullscreen) {
      await frame.requestFullscreen()
      return
    }
    if (frame.webkitRequestFullscreen) {
      frame.webkitRequestFullscreen()
      return
    }
    if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen()
      return
    }
    videoStatus.value = '当前浏览器不支持全屏播放。'
  } catch (error) {
    videoStatus.value = '无法进入全屏，请检查浏览器权限后重试。'
  }
}
</script>

<style scoped lang="scss">
.view-more-page {
  min-height: calc(100vh - var(--nav-height));
  min-height: calc(100svh - var(--nav-height));
  background: var(--color-paper);
}

.project-shell {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
  padding: 56px 0 86px;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.video-section {
  display: grid;
  gap: 20px;
  margin-top: 64px;
}

.video-section-heading h2 {
  margin: 8px 0 0;
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 500;
}

.video-player-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
  overflow: hidden;
}

.video-player-frame video {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-player-frame.is-fullscreen {
  width: 100vw;
  height: 100vh;
  aspect-ratio: auto;
  background: #000;
}

.video-fullscreen-button {
  position: absolute;
  z-index: 1;
  top: 16px;
  right: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  padding: 9px 14px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.video-fullscreen-button:hover {
  background: rgba(0, 0, 0, 0.85);
}

.video-status {
  position: absolute;
  z-index: 1;
  right: 16px;
  bottom: 56px;
  left: 16px;
  margin: 0;
  color: #fff;
  text-align: center;
  text-shadow: 0 1px 4px #000;
}

.page-nav {
  margin-top: 52px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid var(--color-line);
  padding-top: 24px;
}

.dh-action-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: auto;
}

.cad-notice-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(12, 15, 20, 0.56);
  backdrop-filter: blur(4px);
}

.cad-notice {
  width: min(100%, 420px);
  padding: 32px;
  background: var(--color-paper);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.24);
}

.cad-notice h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 500;
}

.cad-notice p {
  margin: 16px 0 24px;
  color: var(--color-ink-soft);
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.cad-notice button {
  min-width: 96px;
  border: 0;
  padding: 10px 18px;
  background: var(--color-ink);
  color: var(--color-paper);
  cursor: pointer;
}

@media (max-width: 760px) {
  .project-shell {
    width: calc(100% - 36px);
    padding: 36px 0 68px;
  }

  .page-nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .dh-action-group {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
