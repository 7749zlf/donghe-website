const VIDEO_METADATA_TIMEOUT = 15000
const MAX_METADATA_BYTES = 16 * 1024 * 1024
const H264_SIGNATURES = ['avc1', 'avc3']

function boxType(view, offset) {
  return String.fromCharCode(...[0, 1, 2, 3].map((index) => view.getUint8(offset + index)))
}

function readBox(view, offset, end) {
  if (offset + 8 > end) return null
  let size = view.getUint32(offset)
  let headerSize = 8
  if (size === 1) {
    if (offset + 16 > end) return null
    size = view.getUint32(offset + 8) * 4294967296 + view.getUint32(offset + 12)
    headerSize = 16
  }
  if (size === 0) size = end - offset
  if (!Number.isSafeInteger(size) || size < headerSize || offset + size > end) return null
  return { type: boxType(view, offset + 4), start: offset + headerSize, end: offset + size }
}

function childBoxes(view, start, end) {
  const boxes = []
  while (start < end) {
    const box = readBox(view, start, end)
    if (!box) break
    boxes.push(box)
    start = box.end
  }
  return boxes
}

function videoCodecs(view, start, end) {
  const codecs = []
  for (const track of childBoxes(view, start, end).filter((box) => box.type === 'trak')) {
    const media = childBoxes(view, track.start, track.end).find((box) => box.type === 'mdia')
    if (!media) continue
    const children = childBoxes(view, media.start, media.end)
    const handler = children.find((box) => box.type === 'hdlr')
    if (!handler || handler.start + 12 > handler.end || boxType(view, handler.start + 8) !== 'vide') continue
    const minf = children.find((box) => box.type === 'minf')
    if (!minf) continue
    const stbl = childBoxes(view, minf.start, minf.end).find((box) => box.type === 'stbl')
    if (!stbl) continue
    const stsd = childBoxes(view, stbl.start, stbl.end).find((box) => box.type === 'stsd')
    if (!stsd || stsd.start + 8 > stsd.end) continue
    codecs.push(...childBoxes(view, stsd.start + 8, stsd.end).map((box) => box.type))
  }
  return codecs
}

/**
 * 读取 MP4 的 moov/trak 元数据识别视频轨，不扫描压缩画面中的偶然字符串。
 * @param {File|Blob} file MP4 文件。
 * @returns {Promise<string>} 识别到的编码标记。
 */
export async function detectMp4VideoCodec(file) {
  if (typeof file?.arrayBuffer !== 'function' || typeof file?.slice !== 'function') {
    throw new Error('无法读取视频编码信息，请重新选择视频文件。')
  }

  const size = Number(file.size || 0)
  let offset = 0
  while (offset + 8 <= size) {
    const header = new DataView(await file.slice(offset, Math.min(offset + 16, size)).arrayBuffer())
    let length = header.getUint32(0)
    const type = boxType(header, 4)
    let headerSize = 8
    if (length === 1) {
      if (header.byteLength < 16) return ''
      length = header.getUint32(8) * 4294967296 + header.getUint32(12)
      headerSize = 16
    }
    if (length === 0) length = size - offset
    if (!Number.isSafeInteger(length) || length < headerSize || offset + length > size) return ''
    if (type === 'moov') {
      if (length > MAX_METADATA_BYTES) return ''
      const view = new DataView(await file.slice(offset + headerSize, offset + length).arrayBuffer())
      const codecs = videoCodecs(view, 0, view.byteLength)
      return codecs.find((codec) => !H264_SIGNATURES.includes(codec)) || codecs[0] || ''
    }
    offset += length
  }
  return ''
}

export async function validateMp4VideoCodec(file) {
  const codec = await detectMp4VideoCodec(file)
  if (H264_SIGNATURES.includes(codec)) return
  if (['hvc1', 'hev1'].includes(codec)) {
    throw new Error('检测到 HEVC/H.265 视频编码，该编码会在部分浏览器中黑屏。请转换为 H.264/AAC MP4。')
  }
  throw new Error('无法确认视频为 H.264 编码，请转换为 H.264/AAC MP4 后重试。')
}

/**
 * 校验视频容器。官网统一使用 MP4，降低不同浏览器间的播放差异。
 * @param {File|Object} file 待上传视频文件。
 * @returns {void}
 * @throws {Error} 文件不是 MP4 时抛出错误。
 */
export function validateVideoContainer(file) {
  const extension = String(file?.name || '').split('.').pop().toLowerCase()
  const mimeType = String(file?.type || '').toLowerCase()
  if (extension !== 'mp4' || (mimeType && mimeType !== 'video/mp4')) {
    throw new Error('请上传 H.264 视频编码、AAC 音频编码的 MP4 文件。')
  }
}

/**
 * 使用当前浏览器读取本地视频元数据，阻止只有音轨可解码的视频上传。
 * @param {File} file 待检查视频文件。
 * @param {Object} browserApi 可注入的浏览器 API，便于测试。
 * @returns {Promise<{width: number, height: number, duration: number}>} 视频信息。
 */
export async function validatePlayableVideo(file, browserApi = {}) {
  validateVideoContainer(file)
  await validateMp4VideoCodec(file)

  const createElement = browserApi.createElement || document.createElement.bind(document)
  const createObjectURL = browserApi.createObjectURL || URL.createObjectURL.bind(URL)
  const revokeObjectURL = browserApi.revokeObjectURL || URL.revokeObjectURL.bind(URL)
  const setTimer = browserApi.setTimeout || setTimeout
  const clearTimer = browserApi.clearTimeout || clearTimeout
  const video = createElement('video')

  if (!video.canPlayType?.('video/mp4')) {
    throw new Error('当前浏览器无法验证 MP4 视频，请换用最新版 Chrome、Edge 或 Safari。')
  }

  return new Promise((resolve, reject) => {
    const objectUrl = createObjectURL(file)
    let settled = false

    const finish = (error) => {
      if (settled) return
      settled = true
      const metadata = { width: video.videoWidth, height: video.videoHeight, duration: Number.isFinite(video.duration) ? video.duration : 0 }
      clearTimer(timer)
      video.onloadeddata = null
      video.onerror = null
      video.removeAttribute?.('src')
      video.load?.()
      revokeObjectURL(objectUrl)
      if (error) {
        reject(error)
      } else {
        resolve(metadata)
      }
    }

    const timer = setTimer(() => {
      finish(new Error('视频读取超时，请转换为 H.264/AAC MP4 后重试。'))
    }, VIDEO_METADATA_TIMEOUT)

    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.onloadeddata = () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish(new Error('检测到音轨，但浏览器无法解码视频画面。请转换为 H.264/AAC MP4。'))
        return
      }
      finish()
    }
    video.onerror = () => {
      finish(new Error('浏览器无法读取视频画面，请转换为 H.264/AAC MP4 后重试。'))
    }
    video.src = objectUrl
  })
}
