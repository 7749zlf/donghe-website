import {
  createCoverImageFile,
  isSupportedImage,
  normalizeExternalImageUrl,
  optimizeGalleryImage,
  readImageAsDataUrl
} from '@/utils/contentImages'
import {
  uploadAwardImage,
  uploadCaseCoverImage,
  uploadCaseImage
} from '@/services/cloudCases'

export function useContentImageManager({
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
}) {
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
        const preparedImage = await optimizeGalleryImage(files[index], cloudEnabled)
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

      statusText.value = `已添加 ${newImages.length} 张图片，${optimizedCount} 张已转为 WebP，并生成了轻量列表封面。`
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
      const preparedImage = await optimizeGalleryImage(file, cloudEnabled)
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
        ? '奖项图片已添加，并已转为 WebP。'
        : '奖项图片已添加。'
    } catch (error) {
      awardStatusText.value = `奖项图片上传失败：${error.message}`
    } finally {
      awardUploading.value = false
      input.value = ''
    }
  }

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

  function removeAwardImage() {
    awardForm.image = ''
  }

  return {
    addExternalImage,
    addExternalAwardImage,
    handleImageUpload,
    handleAwardImageUpload,
    setCoverImage,
    removeImage,
    removeAwardImage
  }
}
