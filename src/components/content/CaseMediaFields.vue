<template>
  <div class="case-media-fields">
    <div class="field upload-field cad-upload-field">
      <span>CAD 文件</span>
      <label class="upload-box">
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
      <small v-if="!cloudEnabled" class="cad-local-notice">本地浏览器模式不支持 CAD 文件上传，请配置云端存储后使用。</small>
    </div>

    <div class="field upload-field cad-upload-field">
      <span>作品视频</span>
      <label class="upload-box">
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogv"
          :disabled="!cloudEnabled || videoUploading"
          @change="$emit('video-upload', $event)"
        />
        <strong>{{ videoUploading ? '正在上传视频' : (form.videoUrl ? '更换作品视频' : '选择视频上传') }}</strong>
        <small>支持 MP4、WebM、MOV、OGV，单个视频不超过 100MB。视频会在作品详情页播放。</small>
      </label>
      <div v-if="form.videoUrl" class="case-video-entry">
        <video :src="form.videoUrl" controls playsinline preload="metadata"></video>
        <button type="button" @click="$emit('remove-video')">移除视频</button>
      </div>
      <small v-if="!cloudEnabled" class="cad-local-notice">本地浏览器模式不支持视频上传，请配置云端存储后使用。</small>
    </div>

    <div class="field upload-field">
      <span>作品图片</span>
      <label class="upload-box">
        <input type="file" accept="image/*" multiple @change="$emit('image-upload', $event)" />
        <strong>{{ uploading ? '正在上传图片' : '选择图片上传' }}</strong>
        <small>{{ cloudEnabled ? '图片会上传到云端图库，第一张作为封面' : '本地模式会保存到当前浏览器，第一张作为封面' }}</small>
      </label>

      <div class="external-image-entry">
        <input
          :value="externalImageUrl"
          type="url"
          placeholder="https:// 外部图片链接"
          aria-label="外部作品图片链接"
          @input="$emit('update:externalImageUrl', $event.target.value.trim())"
          @keyup.enter.prevent="$emit('add-external-image')"
        />
        <button type="button" @click="$emit('add-external-image')">添加链接</button>
      </div>

      <div v-if="form.images.length" class="upload-preview-grid">
        <article v-for="(image, index) in form.images" :key="`${image}-${index}`" class="upload-preview">
          <button
            class="preview-image-button"
            type="button"
            @click="$emit('preview-image', image, `作品图片 ${index + 1}`)"
          >
            <img :src="image" :alt="`作品图片 ${index + 1}`" loading="lazy" decoding="async" />
            <span>放大</span>
          </button>
          <div class="preview-actions">
            <span>{{ index === 0 ? '封面' : `第 ${index + 1} 张` }}</span>
            <button v-if="index > 0" type="button" @click="$emit('set-cover', index)">设为封面</button>
            <button type="button" @click="$emit('remove-image', index)">删除</button>
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
.field { min-width: 0; display: grid; gap: 8px; }
.case-media-fields { display: grid; gap: 18px; }
.field span { color: #242a32; font-size: 15px; }
.field input,
.field select,
.field textarea,
.external-image-entry input {
  box-sizing: border-box; width: 100%; border: 1px solid #d8dde4;
  background: #fbfbfb; color: #11161d; padding: 12px 13px; font: inherit;
}
.field input,
.field select { height: 46px; }
.field textarea { resize: vertical; }
.field input:focus,
.field select:focus,
.field textarea:focus { outline: 2px solid rgba(17, 22, 29, 0.16); border-color: #11161d; }
.upload-field { gap: 12px; }
.upload-box { position: relative; display: grid; gap: 6px; border: 1px dashed #c8d0da; background: #fbfbfb; padding: 18px; cursor: pointer; }
.upload-box input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.upload-box strong { color: #11161d; font-size: 16px; font-weight: 500; }
.upload-box small,
.cad-local-notice { color: #69717d; font-size: 13px; }
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
.external-image-entry { display: flex; gap: 8px; }
.external-image-entry input { min-width: 0; background: #fff; padding: 10px 12px; }
.external-image-entry button { flex: 0 0 auto; border: 1px solid #11161d; background: #11161d; color: #fff; padding: 0 14px; cursor: pointer; }
.upload-preview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.upload-preview { border: 1px solid #e2e5e9; background: #fff; }
.preview-image-button { position: relative; display: block; width: 100%; border: 0; padding: 0; background: transparent; cursor: zoom-in; }
.preview-image-button span { position: absolute; right: 8px; bottom: 8px; padding: 5px 8px; background: rgba(17, 22, 29, 0.82); color: #fff; font-size: 12px; opacity: 0; }
.preview-image-button:hover span,
.preview-image-button:focus-visible span { opacity: 1; }
.preview-image-button:focus-visible { outline: 2px solid #11161d; outline-offset: 2px; }
.upload-preview img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #ddd; }
.preview-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; padding: 8px; }
.preview-actions span { color: #69717d; font-size: 13px; }
.preview-actions button { border: 1px solid #d8dde4; background: #fff; color: #11161d; padding: 6px 8px; cursor: pointer; }
.preview-actions button:last-child { color: #8b2f2f; }

@media (max-width: 760px) {
  .external-image-entry { align-items: stretch; flex-direction: column; }
  .external-image-entry button { min-height: 42px; }
  .upload-preview-grid { grid-template-columns: 1fr; }
}
</style>
