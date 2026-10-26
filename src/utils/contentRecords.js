export function imagesToList(list) {
  if (Array.isArray(list)) {
    return [...list]
  }

  return String(list || '')
    .split(/\r?\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function uniqueMediaUrls(values) {
  return [...new Set(
    values
      .flat()
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )]
}

export function getCaseMedia(item) {
  return uniqueMediaUrls([item?.list || item?.images || [], item?.image])
}

export function caseLabel(item, cloudEnabled) {
  if (cloudEnabled) {
    return '云端作品'
  }

  return item.source === 'base' ? '原有作品' : '新增作品'
}

export function formatCaseMeta(item) {
  return [item.style || '风格待补充', item.type, item.year]
    .filter(Boolean)
    .join(' · ')
}

export function canToggleVisibility(item, cloudEnabled) {
  return cloudEnabled || item.source === 'base'
}

export function canReset(item, cloudEnabled) {
  return !cloudEnabled && item.source === 'base'
}

export function canDelete(item, cloudEnabled) {
  return cloudEnabled || item.source === 'custom'
}

export function awardLabel(item, cloudEnabled) {
  if (cloudEnabled) {
    return '云端奖项'
  }

  return item.source === 'base' ? '原有奖项' : '新增奖项'
}

export function canToggleAwardVisibility(item, cloudEnabled) {
  return cloudEnabled || item.source === 'base'
}

export function canResetAward(item, cloudEnabled) {
  return !cloudEnabled && item.source === 'base'
}

export function canDeleteAward(item, cloudEnabled) {
  return cloudEnabled || item.source === 'custom'
}
