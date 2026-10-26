<template>
  <div
    v-if="open"
    class="image-preview"
    role="dialog"
    aria-modal="true"
    @click.self="closePreview"
    @wheel.prevent="handlePreviewWheel"
  >
    <div class="preview-toolbar" aria-label="图片缩放工具">
      <button type="button" :disabled="previewZoom <= MIN_PREVIEW_ZOOM" @click="zoomOutPreview">−</button>
      <span>{{ previewZoomLabel }}</span>
      <button type="button" :disabled="previewZoom >= MAX_PREVIEW_ZOOM" @click="zoomInPreview">+</button>
      <button type="button" @click="resetPreviewTransform">复位</button>
    </div>
    <button class="preview-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
    <button
      class="preview-nav preview-nav-prev"
      type="button"
      aria-label="查看上一张图片"
      @click="goPreviewPrev"
    >
      ‹
    </button>
    <button
      class="preview-nav preview-nav-next"
      type="button"
      aria-label="查看下一张图片"
      @click="goPreviewNext"
    >
      ›
    </button>
    <div class="preview-stage" @click.self="closePreview">
      <img
        :src="activeItem.full"
        :alt="activeItem.alt"
        class="preview-image"
        loading="lazy"
        decoding="async"
        :class="{ draggable: previewZoom > MIN_PREVIEW_ZOOM, dragging: isPreviewDragging }"
        :style="previewImageStyle"
        draggable="false"
        @dblclick="resetPreviewTransform"
        @pointerdown="startPreviewDrag"
        @pointermove="movePreviewDrag"
        @pointerup="stopPreviewDrag"
        @pointercancel="stopPreviewDrag"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  index: { type: Number, default: 0 },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:open', 'update:index'])

const MIN_PREVIEW_ZOOM = 1
const MAX_PREVIEW_ZOOM = 4
const PREVIEW_ZOOM_STEP = 0.25
const previewZoom = ref(MIN_PREVIEW_ZOOM)
const previewPan = reactive({ x: 0, y: 0 })
const isPreviewDragging = ref(false)
const previewDragStart = reactive({
  pointerId: null,
  x: 0,
  y: 0,
  panX: 0,
  panY: 0
})
const previewPointers = new Map()
const previewPinchStart = {
  distance: 0,
  zoom: MIN_PREVIEW_ZOOM,
  midpointX: 0,
  midpointY: 0,
  stageCenterX: 0,
  stageCenterY: 0,
  panX: 0,
  panY: 0
}
let isPreviewPinching = false

const activeItem = computed(() => props.items[props.index] || props.items[0] || {
  id: '',
  alt: '',
  full: '',
  thumb: ''
})
const previewZoomLabel = computed(() => `${Math.round(previewZoom.value * 100)}%`)
const previewImageStyle = computed(() => ({
  transform: `translate3d(${previewPan.x}px, ${previewPan.y}px, 0) scale(${previewZoom.value})`
}))

function closePreview() {
  emit('update:open', false)
  resetPreviewTransform()
}

function clampPreviewZoom(value) {
  return Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, Number(value.toFixed(2))))
}

function setPreviewZoom(value) {
  previewZoom.value = clampPreviewZoom(value)
  if (previewZoom.value === MIN_PREVIEW_ZOOM) {
    previewPan.x = 0
    previewPan.y = 0
  }
}

function zoomInPreview() {
  setPreviewZoom(previewZoom.value + PREVIEW_ZOOM_STEP)
}

function zoomOutPreview() {
  setPreviewZoom(previewZoom.value - PREVIEW_ZOOM_STEP)
}

function changePreviewImage(direction) {
  const imageCount = props.items.length
  if (!imageCount) {
    return
  }

  emit('update:index', (props.index + direction + imageCount) % imageCount)
  resetPreviewTransform()
}

function goPreviewPrev() {
  changePreviewImage(-1)
}

function goPreviewNext() {
  changePreviewImage(1)
}

function resetPreviewTransform() {
  previewZoom.value = MIN_PREVIEW_ZOOM
  previewPan.x = 0
  previewPan.y = 0
  isPreviewDragging.value = false
  previewDragStart.pointerId = null
  previewPointers.clear()
  isPreviewPinching = false
}

function handlePreviewWheel(event) {
  const direction = event.deltaY < 0 ? 1 : -1
  setPreviewZoom(previewZoom.value + direction * PREVIEW_ZOOM_STEP)
}

function startPreviewDrag(event) {
  previewPointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  event.currentTarget.setPointerCapture(event.pointerId)

  if (previewPointers.size >= 2) {
    beginPreviewPinch(event.currentTarget.parentElement)
  } else if (previewZoom.value > MIN_PREVIEW_ZOOM) {
    beginPreviewDrag(event)
  }
}

function movePreviewDrag(event) {
  if (!previewPointers.has(event.pointerId)) {
    return
  }

  previewPointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (previewPointers.size >= 2) {
    updatePreviewPinch()
    return
  }
  if (!isPreviewDragging.value || previewDragStart.pointerId !== event.pointerId) {
    return
  }

  previewPan.x = previewDragStart.panX + event.clientX - previewDragStart.x
  previewPan.y = previewDragStart.panY + event.clientY - previewDragStart.y
}

function stopPreviewDrag(event) {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  previewPointers.delete(event.pointerId)
  if (previewPointers.size >= 2) {
    beginPreviewPinch(event.currentTarget.parentElement)
    return
  }

  isPreviewPinching = false
  if (previewPointers.size === 1 && previewZoom.value > MIN_PREVIEW_ZOOM) {
    const [pointerId, point] = previewPointers.entries().next().value
    beginPreviewDrag({ pointerId, clientX: point.x, clientY: point.y })
    return
  }

  isPreviewDragging.value = false
  previewDragStart.pointerId = null
}

function beginPreviewDrag(event) {
  isPreviewDragging.value = true
  previewDragStart.pointerId = event.pointerId
  previewDragStart.x = event.clientX
  previewDragStart.y = event.clientY
  previewDragStart.panX = previewPan.x
  previewDragStart.panY = previewPan.y
}

function beginPreviewPinch(stage) {
  const points = Array.from(previewPointers.values()).slice(0, 2)
  const [first, second] = points
  const rect = stage.getBoundingClientRect()
  previewPinchStart.distance = Math.hypot(second.x - first.x, second.y - first.y)
  previewPinchStart.zoom = previewZoom.value
  previewPinchStart.midpointX = (first.x + second.x) / 2
  previewPinchStart.midpointY = (first.y + second.y) / 2
  previewPinchStart.stageCenterX = rect.left + rect.width / 2
  previewPinchStart.stageCenterY = rect.top + rect.height / 2
  previewPinchStart.panX = previewPan.x
  previewPinchStart.panY = previewPan.y
  isPreviewPinching = true
  isPreviewDragging.value = true
  previewDragStart.pointerId = null
}

function updatePreviewPinch() {
  if (!isPreviewPinching) {
    return
  }

  const points = Array.from(previewPointers.values()).slice(0, 2)
  const [first, second] = points
  const midpointX = (first.x + second.x) / 2
  const midpointY = (first.y + second.y) / 2
  const distance = Math.hypot(second.x - first.x, second.y - first.y)
  const zoom = clampPreviewZoom(
    previewPinchStart.zoom * distance / Math.max(previewPinchStart.distance, 1)
  )

  previewZoom.value = zoom
  if (zoom === MIN_PREVIEW_ZOOM) {
    previewPan.x = 0
    previewPan.y = 0
    return
  }

  const scale = zoom / previewPinchStart.zoom
  const startX = previewPinchStart.midpointX - previewPinchStart.stageCenterX - previewPinchStart.panX
  const startY = previewPinchStart.midpointY - previewPinchStart.stageCenterY - previewPinchStart.panY
  previewPan.x = midpointX - previewPinchStart.stageCenterX - scale * startX
  previewPan.y = midpointY - previewPinchStart.stageCenterY - scale * startY
}
</script>

<style scoped lang="scss">
.image-preview {
  position: fixed;
  inset: 0;
  z-index: 2000;
  padding: clamp(20px, 4vw, 48px);
  background: rgba(12, 15, 20, 0.82);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(10px, 2vw, 18px);
  overflow: hidden;
  cursor: default;
}

.preview-stage {
  width: 100%;
  height: auto;
  max-height: calc(100svh - clamp(120px, 18vw, 168px));
  order: 1;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.preview-toolbar {
  order: 2;
  z-index: 2001;
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(48px, 5vw, 64px) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(5px, 1vw, 8px);
  width: min(100%, clamp(320px, 42vw, 460px));
  padding: clamp(5px, 0.8vw, 8px);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
}

.preview-toolbar button {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #11161d;
  min-width: 0;
  height: clamp(32px, 3vw, 38px);
  padding: 0 clamp(8px, 1.5vw, 12px);
  font-size: clamp(12px, 1.4vw, 14px);
  white-space: nowrap;
  cursor: pointer;
}

.preview-toolbar button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.preview-toolbar span {
  min-width: 0;
  color: #fff;
  text-align: center;
  font-size: clamp(12px, 1.4vw, 14px);
  line-height: clamp(32px, 3vw, 38px);
  white-space: nowrap;
}

.preview-image {
  max-width: min(1200px, 100%);
  max-height: calc(100svh - clamp(120px, 18vw, 168px));
  object-fit: contain;
  display: block;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.4);
  transform-origin: center center;
  transition: transform 0.16s ease;
  user-select: none;
  touch-action: none;
  cursor: zoom-in;
}

.preview-image.draggable {
  cursor: grab;
}

.preview-image.dragging {
  cursor: grabbing;
  transition: none;
}

.preview-close {
  position: fixed;
  top: 85px;
  right: 28px;
  z-index: 2001;
  width: 42px;
  height: 42px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.preview-close:hover,
.preview-nav:hover {
  background: rgba(255, 255, 255, 0.28);
}

.preview-nav {
  position: fixed;
  top: 50%;
  z-index: 2001;
  width: 54px;
  height: 78px;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 52px;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background 0.2s ease;
}

.preview-nav-prev {
  left: 28px;
}

.preview-nav-next {
  right: 28px;
}

@media (max-width: 760px) {
  .image-preview {
    gap: 8px;
    padding:
      max(12px, env(safe-area-inset-top))
      max(12px, env(safe-area-inset-right))
      max(12px, env(safe-area-inset-bottom))
      max(12px, env(safe-area-inset-left));
  }

  .preview-stage {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
  }

  .preview-toolbar {
    grid-template-columns: minmax(0, 1fr) clamp(44px, 14vw, 58px) minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(4px, 1.5vw, 8px);
    width: min(100%, clamp(292px, 92vw, 430px));
    padding: clamp(5px, 1.6vw, 8px);
  }

  .preview-toolbar button {
    min-width: 0;
    height: clamp(30px, 8vw, 38px);
    padding: 0 clamp(6px, 2.2vw, 12px);
    font-size: clamp(12px, 3.4vw, 14px);
    white-space: nowrap;
  }

  .preview-toolbar span {
    min-width: 0;
    font-size: clamp(12px, 3.4vw, 14px);
    line-height: clamp(30px, 8vw, 38px);
    white-space: nowrap;
  }

  .preview-close {
    top: 16px;
    right: 16px;
  }

  .preview-nav {
    width: 44px;
    height: 62px;
    font-size: 42px;
  }

  .preview-nav-prev {
    left: 12px;
  }

  .preview-nav-next {
    right: 12px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
