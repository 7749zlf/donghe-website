const ABOUT_IMAGE = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'
export const aboutImage = ABOUT_IMAGE

export const tags = ['全部', '商业空间', '办公空间', '居住空间']

const CUSTOM_CASES_KEY = 'donghe-custom-design-cases'
const CASE_OVERRIDES_KEY = 'donghe-design-case-overrides'
const HIDDEN_CASES_KEY = 'donghe-hidden-design-cases'
const CUSTOM_AWARDS_KEY = 'donghe-custom-awards'
const AWARD_OVERRIDES_KEY = 'donghe-award-overrides'
const HIDDEN_AWARDS_KEY = 'donghe-hidden-awards'
let cloudCases = []
let cloudAwards = []
let cloudCasesLoaded = false
let cloudAwardsLoaded = false

function hasStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalizeImages(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value || '')
    .split(/\r?\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeCustomCase(caseItem) {
  const list = normalizeImages(caseItem.list || caseItem.images)
  const name = String(caseItem.name || '').trim()

  if (!name || !list.length) {
    return null
  }

  return {
    id: String(caseItem.id || `custom-${Date.now()}`),
    name,
    category: String(caseItem.category || tags[1]),
    type: String(caseItem.type || '商业空间 / 上饶'),
    year: String(caseItem.year || `${new Date().getFullYear()}年`),
    url: String(caseItem.url || '').trim(),
    list,
    image: String(caseItem.image || list[0]),
    note: String(caseItem.note || '新增案例，等待补充更完整的空间说明。').trim(),
    createdAt: Number(caseItem.createdAt || Date.now())
  }
}

function normalizeManagedCase(caseItem) {
  return normalizeCustomCase({
    ...caseItem,
    id: caseItem.id
  })
}

function notifyCustomCasesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('donghe-custom-cases-updated'))
  }
}

export function setCloudCases(caseList) {
  cloudCases = Array.isArray(caseList) ? caseList : []
  cloudCasesLoaded = true
  notifyCustomCasesChanged()
}

export function setCloudAwards(awardList) {
  cloudAwards = Array.isArray(awardList) ? awardList : []
  cloudAwardsLoaded = true
  notifyCustomCasesChanged()
}

export function readCustomCases() {
  if (!hasStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_CASES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.map(normalizeCustomCase).filter(Boolean)
      : []
  } catch (error) {
    return []
  }
}

export function writeCustomCases(caseList) {
  if (!hasStorage()) {
    return
  }

  const normalized = caseList.map(normalizeCustomCase).filter(Boolean)
  window.localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(normalized))
  notifyCustomCasesChanged()
}

export function saveCustomCase(caseItem) {
  const nextCase = normalizeCustomCase({
    ...caseItem,
    id: caseItem.id || `custom-${Date.now()}`,
    createdAt: caseItem.createdAt || Date.now()
  })

  if (!nextCase) {
    return null
  }

  writeCustomCases([nextCase, ...readCustomCases()])
  return nextCase
}

export function deleteCustomCase(id) {
  writeCustomCases(readCustomCases().filter((item) => String(item.id) !== String(id)))
}

function normalizeAward(awardItem) {
  const title = String(awardItem.title || awardItem.name || '').trim()
  const image = String(awardItem.image || '').trim()

  if (!title || !image) {
    return null
  }

  return {
    id: String(awardItem.id || `award-${Date.now()}`),
    title,
    desc: String(awardItem.desc || '').trim(),
    year: String(awardItem.year || `${new Date().getFullYear()}年`).trim(),
    image,
    imageAlt: String(awardItem.imageAlt || awardItem.image_alt || title).trim(),
    hidden: Boolean(awardItem.hidden),
    createdAt: Number(awardItem.createdAt || awardItem.created_at || Date.now())
  }
}

function normalizeManagedAward(awardItem) {
  return normalizeAward({
    ...awardItem,
    id: awardItem.id
  })
}

export function readCustomAwards() {
  if (!hasStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_AWARDS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.map(normalizeAward).filter(Boolean)
      : []
  } catch (error) {
    return []
  }
}

export function writeCustomAwards(awardList) {
  if (!hasStorage()) {
    return
  }

  const normalized = awardList.map(normalizeAward).filter(Boolean)
  window.localStorage.setItem(CUSTOM_AWARDS_KEY, JSON.stringify(normalized))
  notifyCustomCasesChanged()
}

export function saveCustomAward(awardItem) {
  const nextAward = normalizeAward({
    ...awardItem,
    id: awardItem.id || `award-${Date.now()}`,
    createdAt: awardItem.createdAt || Date.now()
  })

  if (!nextAward) {
    return null
  }

  writeCustomAwards([nextAward, ...readCustomAwards()])
  return nextAward
}

export function deleteCustomAward(id) {
  writeCustomAwards(readCustomAwards().filter((item) => String(item.id) !== String(id)))
}

export function readCaseOverrides() {
  if (!hasStorage()) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(CASE_OVERRIDES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([id, item]) => [String(id), normalizeManagedCase({ ...item, id })])
        .filter(([, item]) => Boolean(item))
    )
  } catch (error) {
    return {}
  }
}

export function writeCaseOverrides(overrides) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(CASE_OVERRIDES_KEY, JSON.stringify(overrides))
  notifyCustomCasesChanged()
}

export function saveCaseOverride(caseItem) {
  const nextCase = normalizeManagedCase(caseItem)

  if (!nextCase) {
    return null
  }

  writeCaseOverrides({
    ...readCaseOverrides(),
    [String(nextCase.id)]: nextCase
  })

  return nextCase
}

export function resetCaseOverride(id) {
  const overrides = readCaseOverrides()
  delete overrides[String(id)]
  writeCaseOverrides(overrides)
}

export function readAwardOverrides() {
  if (!hasStorage()) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(AWARD_OVERRIDES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([id, item]) => [String(id), normalizeManagedAward({ ...item, id })])
        .filter(([, item]) => Boolean(item))
    )
  } catch (error) {
    return {}
  }
}

export function writeAwardOverrides(overrides) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(AWARD_OVERRIDES_KEY, JSON.stringify(overrides))
  notifyCustomCasesChanged()
}

export function saveAwardOverride(awardItem) {
  const nextAward = normalizeManagedAward(awardItem)

  if (!nextAward) {
    return null
  }

  writeAwardOverrides({
    ...readAwardOverrides(),
    [String(nextAward.id)]: nextAward
  })

  return nextAward
}

export function resetAwardOverride(id) {
  const overrides = readAwardOverrides()
  delete overrides[String(id)]
  writeAwardOverrides(overrides)
}

export function readHiddenCaseIds() {
  if (!hasStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(HIDDEN_CASES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch (error) {
    return []
  }
}

export function writeHiddenCaseIds(ids) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(HIDDEN_CASES_KEY, JSON.stringify([...new Set(ids.map(String))]))
  notifyCustomCasesChanged()
}

export function hideBaseCase(id) {
  writeHiddenCaseIds([...readHiddenCaseIds(), String(id)])
}

export function showBaseCase(id) {
  writeHiddenCaseIds(readHiddenCaseIds().filter((item) => item !== String(id)))
}

export function readHiddenAwardIds() {
  if (!hasStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(HIDDEN_AWARDS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch (error) {
    return []
  }
}

export function writeHiddenAwardIds(ids) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(HIDDEN_AWARDS_KEY, JSON.stringify([...new Set(ids.map(String))]))
  notifyCustomCasesChanged()
}

export function hideBaseAward(id) {
  writeHiddenAwardIds([...readHiddenAwardIds(), String(id)])
}

export function showBaseAward(id) {
  writeHiddenAwardIds(readHiddenAwardIds().filter((item) => item !== String(id)))
}

export function getManagedCases() {
  if (cloudCasesLoaded) {
    return cloudCases.map((item) => ({ ...item, source: 'cloud' }))
  }

  return readCustomCases().map((item) => ({ ...item, source: 'custom', hidden: false }))
}

export function getManagedAwards() {
  if (cloudAwardsLoaded) {
    return cloudAwards.map((item) => ({ ...item, source: 'cloud' }))
  }

  return readCustomAwards().map((item) => ({ ...item, source: 'custom', hidden: false }))
}

function toDesignCase(caseItem) {
  return {
    id: caseItem.id,
    name: caseItem.name,
    list: caseItem.list,
    url: caseItem.url
  }
}

function toProject(caseItem) {
  return {
    id: caseItem.id,
    name: caseItem.name,
    category: caseItem.category,
    type: caseItem.type,
    year: caseItem.year,
    image: caseItem.image || caseItem.list[0]
  }
}

function toWork(caseItem) {
  return {
    ...toProject(caseItem),
    cover: caseItem.image || caseItem.list[0],
    list: caseItem.list,
    note: caseItem.note
  }
}

export function getDisplayDesignCases() {
  return [
    ...getManagedCases().filter((item) => !item.hidden).map(toDesignCase)
  ]
}

export function getDisplayProjects() {
  return [
    ...getManagedCases().filter((item) => !item.hidden).map(toProject)
  ]
}

export function getDisplayWorksList() {
  return [
    ...getManagedCases().filter((item) => !item.hidden).map(toWork)
  ]
}

function toAward(awardItem) {
  return {
    id: awardItem.id,
    title: awardItem.title,
    desc: awardItem.desc,
    year: awardItem.year,
    image: awardItem.image,
    imageAlt: awardItem.imageAlt || awardItem.title
  }
}

export function getDisplayAwards() {
  return [
    ...getManagedAwards().filter((item) => !item.hidden).map(toAward)
  ]
}
