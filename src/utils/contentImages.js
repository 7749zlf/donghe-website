const MAX_IMAGE_UPLOAD_BYTES = 9 * 1024 * 1024
const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024
const MIN_IMAGE_QUALITY = 0.62
const GALLERY_MAX_EDGE = 1920
const GALLERY_MAX_BYTES = 1.5 * 1024 * 1024
const GALLERY_QUALITY = 0.84
const COVER_MAX_EDGE = 960
const COVER_MAX_BYTES = 280 * 1024
const COVER_QUALITY = 0.78
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function fileSizeLabel(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function uploadFileName(file) {
  return String(file.name || 'image.webp').replace(/\.[^.]+$/, '') + '.webp'
}

export function isSupportedImage(file) {
  return SUPPORTED_IMAGE_TYPES.has(file.type)
}

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
    context.drawImage(image, 0, 0, width, height)

    let quality = options.quality
    let blob = await canvasToBlob(canvas, 'image/webp', quality)
    if (blob.type !== 'image/webp') {
      throw new Error('当前浏览器不支持 WebP 图片转换，请换用新版浏览器重试。')
    }

    while (blob.size > options.maxBytes && quality > MIN_IMAGE_QUALITY) {
      quality = Math.max(MIN_IMAGE_QUALITY, quality - 0.06)
      blob = await canvasToBlob(canvas, 'image/webp', quality)
      if (blob.type !== 'image/webp') {
        throw new Error('当前浏览器不支持 WebP 图片转换，请换用新版浏览器重试。')
      }
    }

    if (blob.size <= options.maxBytes || Math.max(width, height) <= 720) {
      if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
        throw new Error(`图片处理后仍超过 ${fileSizeLabel(MAX_IMAGE_UPLOAD_BYTES)}，请先裁剪后重试。`)
      }

      return {
        file: new File([blob], uploadFileName(file), {
          type: 'image/webp',
          lastModified: Date.now()
        }),
        optimized: true
      }
    }

    scale *= 0.82
  }

  throw new Error('图片压缩失败，请换一张图片重试。')
}

export function optimizeGalleryImage(file, cloudEnabled) {
  return createImageVariant(file, {
    maxEdge: GALLERY_MAX_EDGE,
    maxBytes: GALLERY_MAX_BYTES,
    quality: GALLERY_QUALITY,
    keepGif: !cloudEnabled
  })
}

export function createCoverImageFile(file) {
  return createImageVariant(file, {
    maxEdge: COVER_MAX_EDGE,
    maxBytes: COVER_MAX_BYTES,
    quality: COVER_QUALITY,
    keepGif: false
  })
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

export function normalizeExternalImageUrl(value) {
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
