const ABOUT_IMAGE = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'
export const aboutImage = ABOUT_IMAGE

export const tags = ['全部', '商业空间', '办公空间', '居住空间']
export const stylePresets = ['现代简约', '原木自然', '侘寂自然', '新中式', '法式轻奢', '工业风', '混搭']

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

/**
 * 判断当前运行环境是否可使用浏览器本地存储。
 * @returns {boolean} localStorage 可用时返回 true。
 */
function hasStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

/**
 * 将图片数组或分隔字符串统一转换为非空 URL 数组。
 * @param {Array|string} value 原始图片数据。
 * @returns {string[]} 标准化后的图片地址列表。
 */
function normalizeImages(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value || '')
    .split(/\r?\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * 校验并补全本地项目数据，缺少名称或图片时返回 null。
 * @param {Object} caseItem 原始项目数据。
 * @returns {Object|null} 标准化项目或无效标记。
 */
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
    style: String(caseItem.style || '').trim(),
    type: String(caseItem.type || '商业空间 / 上饶'),
    year: String(caseItem.year || `${new Date().getFullYear()}年`),
    url: String(caseItem.url || '').trim(),
    list,
    image: String(caseItem.image || list[0]),
    note: String(caseItem.note || '新增案例，等待补充更完整的空间说明。').trim(),
    createdAt: Number(caseItem.createdAt || Date.now())
  }
}

/**
 * 标准化后台管理项目，并保留其既有唯一标识。
 * @param {Object} caseItem 后台项目数据。
 * @returns {Object|null} 标准化项目或无效标记。
 */
function normalizeManagedCase(caseItem) {
  return normalizeCustomCase({
    ...caseItem,
    id: caseItem.id
  })
}

/**
 * 通知当前页面重新读取项目和荣誉数据。
 * @returns {void}
 */
function notifyCustomCasesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('donghe-custom-cases-updated'))
  }
}

/**
 * 保存已加载的云端项目，并通知所有展示页面刷新。
 * @param {Array} caseList 云端项目列表。
 * @returns {void}
 */
export function setCloudCases(caseList) {
  cloudCases = Array.isArray(caseList) ? caseList : []
  cloudCasesLoaded = true
  notifyCustomCasesChanged()
}

/**
 * 保存已加载的云端荣誉，并通知所有展示页面刷新。
 * @param {Array} awardList 云端荣誉列表。
 * @returns {void}
 */
export function setCloudAwards(awardList) {
  cloudAwards = Array.isArray(awardList) ? awardList : []
  cloudAwardsLoaded = true
  notifyCustomCasesChanged()
}

/**
 * 从浏览器存储读取并清洗本地自定义项目。
 * @returns {Object[]} 有效的本地项目列表。
 */
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

/**
 * 标准化并覆盖写入本地自定义项目列表。
 * @param {Array} caseList 待保存的项目列表。
 * @returns {void}
 */
export function writeCustomCases(caseList) {
  if (!hasStorage()) {
    return
  }

  const normalized = caseList.map(normalizeCustomCase).filter(Boolean)
  window.localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(normalized))
  notifyCustomCasesChanged()
}

/**
 * 创建并保存一个本地自定义项目。
 * @param {Object} caseItem 待保存的项目数据。
 * @returns {Object|null} 已保存项目或无效标记。
 */
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

/**
 * 从本地自定义项目中删除指定记录。
 * @param {string|number} id 项目唯一标识。
 * @returns {void}
 */
export function deleteCustomCase(id) {
  writeCustomCases(readCustomCases().filter((item) => String(item.id) !== String(id)))
}

/**
 * 校验并补全荣誉数据，缺少标题或图片时返回 null。
 * @param {Object} awardItem 原始荣誉数据。
 * @returns {Object|null} 标准化荣誉或无效标记。
 */
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

/**
 * 标准化后台管理荣誉，并保留其既有唯一标识。
 * @param {Object} awardItem 后台荣誉数据。
 * @returns {Object|null} 标准化荣誉或无效标记。
 */
function normalizeManagedAward(awardItem) {
  return normalizeAward({
    ...awardItem,
    id: awardItem.id
  })
}

/**
 * 从浏览器存储读取并清洗本地自定义荣誉。
 * @returns {Object[]} 有效的本地荣誉列表。
 */
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

/**
 * 标准化并覆盖写入本地自定义荣誉列表。
 * @param {Array} awardList 待保存的荣誉列表。
 * @returns {void}
 */
export function writeCustomAwards(awardList) {
  if (!hasStorage()) {
    return
  }

  const normalized = awardList.map(normalizeAward).filter(Boolean)
  window.localStorage.setItem(CUSTOM_AWARDS_KEY, JSON.stringify(normalized))
  notifyCustomCasesChanged()
}

/**
 * 创建并保存一个本地自定义荣誉。
 * @param {Object} awardItem 待保存的荣誉数据。
 * @returns {Object|null} 已保存荣誉或无效标记。
 */
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

/**
 * 从本地自定义荣誉中删除指定记录。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {void}
 */
export function deleteCustomAward(id) {
  writeCustomAwards(readCustomAwards().filter((item) => String(item.id) !== String(id)))
}

/**
 * 读取默认项目在本地保存的内容覆盖记录。
 * @returns {Object<string, Object>} 按项目 id 索引的覆盖数据。
 */
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

/**
 * 覆盖写入默认项目的本地修改记录。
 * @param {Object<string, Object>} overrides 按项目 id 索引的覆盖数据。
 * @returns {void}
 */
export function writeCaseOverrides(overrides) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(CASE_OVERRIDES_KEY, JSON.stringify(overrides))
  notifyCustomCasesChanged()
}

/**
 * 保存单个默认项目的本地修改记录。
 * @param {Object} caseItem 修改后的项目数据。
 * @returns {Object|null} 已保存项目或无效标记。
 */
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

/**
 * 删除指定默认项目的本地修改，使其恢复原始内容。
 * @param {string|number} id 项目唯一标识。
 * @returns {void}
 */
export function resetCaseOverride(id) {
  const overrides = readCaseOverrides()
  delete overrides[String(id)]
  writeCaseOverrides(overrides)
}

/**
 * 读取默认荣誉在本地保存的内容覆盖记录。
 * @returns {Object<string, Object>} 按荣誉 id 索引的覆盖数据。
 */
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

/**
 * 覆盖写入默认荣誉的本地修改记录。
 * @param {Object<string, Object>} overrides 按荣誉 id 索引的覆盖数据。
 * @returns {void}
 */
export function writeAwardOverrides(overrides) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(AWARD_OVERRIDES_KEY, JSON.stringify(overrides))
  notifyCustomCasesChanged()
}

/**
 * 保存单个默认荣誉的本地修改记录。
 * @param {Object} awardItem 修改后的荣誉数据。
 * @returns {Object|null} 已保存荣誉或无效标记。
 */
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

/**
 * 删除指定默认荣誉的本地修改，使其恢复原始内容。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {void}
 */
export function resetAwardOverride(id) {
  const overrides = readAwardOverrides()
  delete overrides[String(id)]
  writeAwardOverrides(overrides)
}

/**
 * 读取已在本地隐藏的默认项目 id。
 * @returns {string[]} 去重前由存储恢复的项目 id 列表。
 */
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

/**
 * 去重并保存需要隐藏的默认项目 id。
 * @param {Array<string|number>} ids 项目 id 列表。
 * @returns {void}
 */
export function writeHiddenCaseIds(ids) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(HIDDEN_CASES_KEY, JSON.stringify([...new Set(ids.map(String))]))
  notifyCustomCasesChanged()
}

/**
 * 将默认项目加入本地隐藏列表。
 * @param {string|number} id 项目唯一标识。
 * @returns {void}
 */
export function hideBaseCase(id) {
  writeHiddenCaseIds([...readHiddenCaseIds(), String(id)])
}

/**
 * 将默认项目移出本地隐藏列表。
 * @param {string|number} id 项目唯一标识。
 * @returns {void}
 */
export function showBaseCase(id) {
  writeHiddenCaseIds(readHiddenCaseIds().filter((item) => item !== String(id)))
}

/**
 * 读取已在本地隐藏的默认荣誉 id。
 * @returns {string[]} 荣誉 id 列表。
 */
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

/**
 * 去重并保存需要隐藏的默认荣誉 id。
 * @param {Array<string|number>} ids 荣誉 id 列表。
 * @returns {void}
 */
export function writeHiddenAwardIds(ids) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(HIDDEN_AWARDS_KEY, JSON.stringify([...new Set(ids.map(String))]))
  notifyCustomCasesChanged()
}

/**
 * 将默认荣誉加入本地隐藏列表。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {void}
 */
export function hideBaseAward(id) {
  writeHiddenAwardIds([...readHiddenAwardIds(), String(id)])
}

/**
 * 将默认荣誉移出本地隐藏列表。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {void}
 */
export function showBaseAward(id) {
  writeHiddenAwardIds(readHiddenAwardIds().filter((item) => item !== String(id)))
}

/**
 * 获取后台管理使用的项目；云端加载完成后以云端结果为准。
 * @returns {Object[]} 带数据来源标记的项目列表。
 */
export function getManagedCases() {
  if (cloudCasesLoaded) {
    return cloudCases.map((item) => ({ ...item, source: 'cloud' }))
  }

  return readCustomCases().map((item) => ({ ...item, source: 'custom', hidden: false }))
}

/**
 * 获取后台管理使用的荣誉；云端加载完成后以云端结果为准。
 * @returns {Object[]} 带数据来源标记的荣誉列表。
 */
export function getManagedAwards() {
  if (cloudAwardsLoaded) {
    return cloudAwards.map((item) => ({ ...item, source: 'cloud' }))
  }

  return readCustomAwards().map((item) => ({ ...item, source: 'custom', hidden: false }))
}

/**
 * 将管理项目转换为详情画册所需的数据结构。
 * @param {Object} caseItem 管理项目数据。
 * @returns {Object} 详情画册项目。
 */
function toDesignCase(caseItem) {
  return {
    id: caseItem.id,
    name: caseItem.name,
    list: caseItem.list,
    url: caseItem.url
  }
}

/**
 * 将管理项目转换为首页项目卡片数据结构。
 * @param {Object} caseItem 管理项目数据。
 * @returns {Object} 首页项目卡片数据。
 */
function toProject(caseItem) {
  return {
    id: caseItem.id,
    name: caseItem.name,
    category: caseItem.category,
    style: caseItem.style,
    type: caseItem.type,
    year: caseItem.year,
    image: caseItem.image || caseItem.list[0]
  }
}

/**
 * 将管理项目转换为完整项目索引数据结构。
 * @param {Object} caseItem 管理项目数据。
 * @returns {Object} 项目索引卡片数据。
 */
function toWork(caseItem) {
  return {
    ...toProject(caseItem),
    cover: caseItem.image || caseItem.list[0],
    list: caseItem.list,
    note: caseItem.note
  }
}

/**
 * 获取前台详情页可见的项目画册列表。
 * @returns {Object[]} 已过滤隐藏项的详情数据。
 */
export function getDisplayDesignCases() {
  return [
    ...getManagedCases().filter((item) => !item.hidden).map(toDesignCase)
  ]
}

/**
 * 获取首页可见的项目卡片列表。
 * @returns {Object[]} 已过滤隐藏项的首页项目数据。
 */
export function getDisplayProjects() {
  return [
    ...getManagedCases().filter((item) => !item.hidden).map(toProject)
  ]
}

/**
 * 获取项目索引页可见的完整项目列表。
 * @returns {Object[]} 已过滤隐藏项的索引项目数据。
 */
export function getDisplayWorksList() {
  return [
    ...getManagedCases().filter((item) => !item.hidden).map(toWork)
  ]
}

/**
 * 将管理荣誉转换为前台荣誉卡片数据结构。
 * @param {Object} awardItem 管理荣誉数据。
 * @returns {Object} 前台荣誉卡片数据。
 */
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

/**
 * 获取前台可见的荣誉列表。
 * @returns {Object[]} 已过滤隐藏项的荣誉数据。
 */
export function getDisplayAwards() {
  return [
    ...getManagedAwards().filter((item) => !item.hidden).map(toAward)
  ]
}
