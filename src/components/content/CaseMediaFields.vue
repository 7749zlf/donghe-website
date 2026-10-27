<template>
  <div class="case-media-fields">
    <div class="field dh-field upload-field dh-upload-field cad-upload-field">
      <span>CAD 文件</span>
      <label class="upload-box dh-upload-box">
        <input
          type="file"
          accept=".dwg,.dxf,.dwt,.dws,.dwf,.dgn"
          :disabled="!cloudEnabled || cadUploading"
          @change="$emit('cad-upload', $event)"
        />
        <strong>{{ cadUploading ? '正在上传 CAD 文件' : '选择 CAD 文件上传' }}</strong>
        <small>支持 DWG、DXF、DWT、DWS、DWF、DGN，单个文件不超过 50MB。附件仅管理员可下载。</small>
      </label>
      <div v-if="form.cadFileName" class="cad-file-entry">
        <span>{{ form.cadFileName }}</span>
        <div>
          <button type="button" :disabled="!form.cadFilePath" @click="$emit('download-cad')">下载</button>
          <button type="button" @click="$emit('remove-cad')">移除</button>
        </div>
      </div>
      <small v-if="!cloudEnabled" class="cad-local-notice dh-helper-text">本地浏览器模式不支持 CAD 文件上传，请配置云端存储后使用。</small>
    </div>

    <div class="field dh-field upload-field dh-upload-field cad-upload-field">
      <span>作品视频</span>
      <label class="upload-box dh-upload-box">
        <input
          type="file"
          accept="video/mp4,.mp4"
          :disabled="!cloudEnabled || videoUploading"
          @change="$emit('video-upload', $event)"
        />
        <strong>{{ videoUploading ? '正在上传视频' : (form.videoUrl ? '更换作品视频' : '选择视频上传') }}</strong>
        <small>支持 H.264 视频编码、AAC 音频编码的 MP4，单个文件不超过 100MB。上传前会检查画面能否正常解码。</small>
      </label>
      <div v-if="form.videoUrl" class="case-video-entry">
        <video :src="form.videoUrl" controls playsinline preload="metadata"></video>
        <button type="button" @click="$emit('remove-video')">移除视频</button>
      </div>
      <small v-if="!cloudEnabled" class="cad-local-notice dh-helper-text">本地浏览器模式不支持视频上传，请配置云端存储后使用。</small>
    </div>

    <div class="field dh-field upload-field dh-upload-field">
      <span>作品图片</span>
      <label class="upload-box dh-upload-box">
        <input type="file" accept="image/*" multiple :disabled="uploading" @change="$emit('image-upload', $event)" />
        <strong>{{ uploading ? '正在上传图片' : '选择图片上传' }}</strong>
        <small>{{ cloudEnabled ? '图片会上传到云端图库，第一张作为封面' : '本地模式会保存到当前浏览器，第一张作为封面' }}</small>
      </label>

      <div class="external-image-entry dh-external-entry">
        <input
          :value="externalImageUrl"
          class="dh-control"
          type="url"
          placeholder="https:// 外部图片链接"
          aria-label="外部作品图片链接"
          @input="$emit('update:externalImageUrl', $event.target.value.trim())"
          @keyup.enter.prevent="$emit('add-external-image')"
        />
        <button class="dh-button" type="button" @click="$emit('add-external-image')">添加链接</button>
      </div>

      <div v-if="form.images.length" class="upload-preview-grid dh-preview-grid">
        <article v-for="(image, index) in form.images" :key="`${image}-${index}`" class="upload-preview dh-preview-card">
          <button
            class="preview-image-button dh-image-button"
            type="button"
            @click="$emit('preview-image', image, `作品图片 ${index + 1}`)"
          >
            <img :src="image" :alt="`作品图片 ${index + 1}`" loading="lazy" decoding="async" />
            <span>放大</span>
          </button>
          <div class="preview-actions dh-preview-actions">
            <span>{{ index === 0 ? '封面' : `第 ${index + 1} 张` }}</span>
            <button v-if="index > 0" class="dh-button dh-button--secondary" type="button" @click="$emit('set-cover', index)">设为封面</button>
            <button class="dh-button dh-button--secondary" type="button" @click="$emit('remove-image', index)">删除</button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint vue/no-mutating-props: "off" */
defineProps({
  form: { type: Object, required: true },
  cloudEnabled: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false },
  cadUploading: { type: Boolean, default: false },
  videoUploading: { type: Boolean, default: false },
  externalImageUrl: { type: String, default: '' }
})

defineEmits([
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
  'update:externalImageUrl'
])
</script>

<style scoped lang="scss">
.case-media-fields { display: grid; gap: 18px; }
.cad-file-entry { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid #e2e5e9; padding: 10px 12px; }
.cad-file-entry span { min-width: 0; overflow-wrap: anywhere; }
.cad-file-entry div { display: flex; flex: 0 0 auto; gap: 8px; }
.cad-file-entry button { border: 0; background: transparent; color: #46515f; padding: 4px; font: inherit; cursor: pointer; }
.cad-file-entry button:last-child,
.case-video-entry button { color: #8b2f2f; }
.cad-file-entry button:disabled { opacity: 0.5; cursor: not-allowed; }
.case-video-entry { display: grid; gap: 8px; }
.case-video-entry video { display: block; width: min(100%, 480px); max-height: 270px; background: #111; }
.case-video-entry button { justify-self: start; border: 0; background: transparent; padding: 4px; font: inherit; cursor: pointer; }
.preview-actions button:last-child { color: #8b2f2f; }
</style>
