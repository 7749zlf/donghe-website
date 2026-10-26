import {
  deleteCustomAward,
  deleteCustomCase,
  hideBaseAward,
  hideBaseCase,
  resetAwardOverride,
  resetCaseOverride,
  saveAwardOverride,
  saveCaseOverride,
  saveCustomAward,
  saveCustomCase,
  showBaseAward,
  showBaseCase
} from '@/mock/data'
import {
  deleteCloudAward,
  deleteCloudCase,
  deleteCaseCadFiles,
  deleteCaseVideos,
  upsertCloudAward,
  upsertCloudCase
} from '@/services/cloudCases'
import { getCaseMedia, uniqueMediaUrls } from '@/utils/contentRecords'

export function useContentRecordActions({
  cloudEnabled,
  form,
  awardForm,
  editingCase,
  editingAward,
  isEditing,
  managedCases,
  managedAwards,
  statusText,
  awardStatusText,
  saving,
  uploading,
  cadUploading,
  videoUploading,
  awardSaving,
  awardUploading,
  originalCaseMedia,
  uploadedCaseMedia,
  originalCaseCadPath,
  uploadedCaseCadPaths,
  originalCaseVideoUrl,
  uploadedCaseVideoUrls,
  originalAwardMedia,
  uploadedAwardMedia,
  currentCaseId,
  currentAwardId,
  getCurrentCaseMedia,
  getUnusedCaseVideoUrls,
  getUnusedCaseCadPaths,
  cleanUnusedCloudMedia,
  resetForm,
  resetAwardForm,
  refreshList,
  refreshAwardsList,
  refreshCloudList
}) {
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
      originalCaseMedia.clear()
      uploadedCaseMedia.clear()
      originalCaseCadPath.value = saved.cadFilePath || ''
      uploadedCaseCadPaths.clear()
      originalCaseVideoUrl.value = saved.videoUrl || ''
      uploadedCaseVideoUrls.clear()
      resetForm()
      refreshList()
    } catch (error) {
      statusText.value = `保存失败：${error.message}`
    } finally {
      saving.value = false
    }
  }

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
      originalAwardMedia.clear()
      uploadedAwardMedia.clear()
      resetAwardForm()
      refreshAwardsList()
    } catch (error) {
      awardStatusText.value = `奖项保存失败：${error.message}`
    } finally {
      awardSaving.value = false
    }
  }

  async function setCaseVisibility(id, hidden) {
    try {
      const target = managedCases.value.find((item) => String(item.id) === String(id))
      if (cloudEnabled && target) {
        await upsertCloudCase({ ...target, hidden })
        await refreshCloudList()
      } else if (hidden) {
        hideBaseCase(id)
        refreshList()
      } else {
        showBaseCase(id)
        refreshList()
      }
      statusText.value = hidden ? '已隐藏作品。' : '作品已恢复显示。'
    } catch (error) {
      statusText.value = `${hidden ? '隐藏失败' : '恢复失败'}：${error.message}`
    }
  }

  async function setAwardVisibility(id, hidden) {
    try {
      const target = managedAwards.value.find((item) => String(item.id) === String(id))
      if (cloudEnabled && target) {
        await upsertCloudAward({ ...target, hidden })
        await refreshCloudList()
      } else if (hidden) {
        hideBaseAward(id)
        refreshAwardsList()
      } else {
        showBaseAward(id)
        refreshAwardsList()
      }
      awardStatusText.value = hidden ? '已隐藏奖项。' : '奖项已恢复显示。'
    } catch (error) {
      awardStatusText.value = `${hidden ? '隐藏奖项失败' : '恢复奖项失败'}：${error.message}`
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
        originalCaseMedia.clear()
        uploadedCaseMedia.clear()
        originalCaseCadPath.value = ''
        uploadedCaseCadPaths.clear()
        originalCaseVideoUrl.value = ''
        uploadedCaseVideoUrls.clear()
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
        originalAwardMedia.clear()
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

  return {
    handleSubmit,
    handleAwardSubmit,
    hideCase: (id) => setCaseVisibility(id, true),
    restoreCase: (id) => setCaseVisibility(id, false),
    hideAward: (id) => setAwardVisibility(id, true),
    restoreAward: (id) => setAwardVisibility(id, false),
    resetBase,
    resetAward,
    removeCustom,
    removeAward
  }
}
