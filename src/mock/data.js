const IMG_1 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg'
const IMG_2 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg'
const IMG_3 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg'
const IMG_4 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
const IMG_5 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg'
const IMG_6 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg'
const IMG_7 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg'
const IMG_8 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg'
const IMG_9 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg'
const IMG_10 = 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'
const AWARD_ARCHITECTURE_TROPHY = require('@/assets/awards/award-architecture-trophy.jpg')
const AWARD_CERTIFICATE_TROPHY = require('@/assets/awards/award-certificate-trophy.jpg')
const AWARD_COMMERCIAL_CERTIFICATE = require('@/assets/awards/award-commercial-certificate.jpg')
const AWARD_RESIDENTIAL_MEDAL = require('@/assets/awards/award-residential-medal.jpg')
const HE_JIN_YUAN_1 = require('@/assets/cases/he-jin-yuan/he-jin-yuan-01.png')
const HE_JIN_YUAN_2 = require('@/assets/cases/he-jin-yuan/he-jin-yuan-02.png')
const HE_JIN_YUAN_3 = require('@/assets/cases/he-jin-yuan/he-jin-yuan-03.png')
const HE_JIN_YUAN_4 = require('@/assets/cases/he-jin-yuan/he-jin-yuan-04.png')

const HE_JIN_YUAN_IMAGES = [HE_JIN_YUAN_1, HE_JIN_YUAN_2, HE_JIN_YUAN_3, HE_JIN_YUAN_4]

export const designCases = [
  { id: 101, name: '和锦园', list: HE_JIN_YUAN_IMAGES, url: 'https://vr.justeasy.cn/view/177046cy3630q394-1776687415.html' },
  { id: 102, name: '极简办公总部', list: [IMG_5, IMG_9, IMG_2], url: 'https://www.baidu.com' },
  { id: 103, name: '北欧住宅样板间', list: [IMG_6, IMG_8, IMG_3], url: 'https://www.baidu.com' },
  { id: 104, name: '中庭艺术展馆', list: [IMG_1, IMG_10, IMG_4], url: 'https://www.baidu.com' },
  { id: 105, name: '工业风餐饮空间', list: [IMG_7, IMG_4, IMG_1], url: 'https://www.baidu.com' },
  { id: 106, name: '日式静谧公寓', list: [IMG_8, IMG_6, IMG_3], url: 'https://www.baidu.com' },
  { id: 107, name: 'Loft联合办公中心', list: [IMG_9, IMG_5, IMG_2], url: 'https://www.baidu.com' },
  { id: 108, name: '山景度假酒店大堂', list: [IMG_3, IMG_10, IMG_6], url: 'https://www.baidu.com' },
  { id: 109, name: '书香住宅空间', list: [IMG_6, IMG_10, IMG_8], url: 'https://www.baidu.com' },
  { id: 110, name: '海岸咖啡馆室内', list: [IMG_7, IMG_3, IMG_4], url: 'https://www.baidu.com' },
  { id: 111, name: '科技企业会客厅', list: [IMG_2, IMG_5, IMG_9], url: 'https://www.baidu.com' },
  { id: 112, name: '光影美术馆', list: [IMG_1, IMG_3, IMG_10], url: 'https://www.baidu.com' },
  { id: 113, name: '私享温泉会所', list: [IMG_3, IMG_8, IMG_10], url: 'https://www.baidu.com' },
  { id: 114, name: '城市天际公寓', list: [IMG_6, IMG_3, IMG_8], url: 'https://www.baidu.com' },
  { id: 115, name: '私宴餐叙会馆', list: [IMG_7, IMG_1, IMG_4], url: 'https://www.baidu.com' }
]

export function getDesignCaseById(id) {
  return getDisplayDesignCases().find((item) => String(item.id) === String(id))
}

export const aboutImage = IMG_10

export const awards = [
  {
    id: 'annual-design-award-2023',
    title: '2023 Annual Design Award',
    desc: 'Presented by Interior Design Association',
    year: 'Dec 2023',
    image: AWARD_CERTIFICATE_TROPHY,
    imageAlt: '年度设计奖证书与奖杯'
  },
  {
    id: 'best-commercial-space-2022',
    title: 'Best Commercial Space',
    desc: 'Presented by Asia Design Awards',
    year: 'Sep 2022',
    image: AWARD_COMMERCIAL_CERTIFICATE,
    imageAlt: '商业空间设计奖证书'
  },
  {
    id: 'top-design-studio-2021',
    title: 'Top Design Studio',
    desc: 'Presented by International Design Alliance',
    year: 'Nov 2021',
    image: AWARD_ARCHITECTURE_TROPHY,
    imageAlt: '建筑空间设计奖杯'
  },
  {
    id: 'residential-gold-award-2020',
    title: 'Residential Gold Award',
    desc: 'Presented by National Design Competition',
    year: 'Jul 2020',
    image: AWARD_RESIDENTIAL_MEDAL,
    imageAlt: '住宅设计金奖奖章'
  }
]

export const tags = ['\u5168\u90e8', '\u5546\u4e1a\u7a7a\u95f4', '\u529e\u516c\u7a7a\u95f4', '\u5c45\u4f4f\u7a7a\u95f4']

export const projects = [
  { id: 101, name: '和锦园', category: tags[1], type: '商业空间 / 上海', year: '2023年', image: designCases[0].list[0] },
  { id: 102, name: '极简办公总部', category: tags[2], type: '办公空间 / 北京', year: '2022年', image: designCases[1].list[0] },
  { id: 103, name: '北欧住宅样板间', category: tags[3], type: '居住空间 / 深圳', year: '2023年', image: designCases[2].list[0] },
  { id: 104, name: '中庭艺术展馆', category: tags[1], type: '商业空间 / 苏州', year: '2024年', image: designCases[3].list[0] },
  { id: 105, name: '工业风餐饮空间', category: tags[1], type: '商业空间 / 广州', year: '2021年', image: designCases[4].list[0] },
  { id: 106, name: '日式静谧公寓', category: tags[3], type: '居住空间 / 杭州', year: '2022年', image: designCases[5].list[0] },
  { id: 107, name: 'Loft联合办公中心', category: tags[2], type: '办公空间 / 成都', year: '2023年', image: designCases[6].list[0] },
  { id: 108, name: '山景度假酒店大堂', category: tags[1], type: '商业空间 / 丽江', year: '2024年', image: designCases[7].list[0] },
  { id: 109, name: '书香住宅空间', category: tags[3], type: '居住空间 / 南京', year: '2025年', image: designCases[8].list[0] },
  { id: 110, name: '海岸咖啡馆室内', category: tags[1], type: '商业空间 / 厦门', year: '2025年', image: designCases[9].list[0] },
  { id: 111, name: '科技企业会客厅', category: tags[2], type: '办公空间 / 深圳', year: '2025年', image: designCases[10].list[0] },
  { id: 112, name: '光影美术馆', category: tags[1], type: '商业空间 / 北京', year: '2026年', image: designCases[11].list[0] },
  { id: 113, name: '私享温泉会所', category: tags[3], type: '居住空间 / 大理', year: '2024年', image: designCases[12].list[0] },
  { id: 114, name: '城市天际公寓', category: tags[3], type: '居住空间 / 上海', year: '2026年', image: designCases[13].list[0] },
  { id: 115, name: '私宴餐叙会馆', category: tags[1], type: '商业空间 / 成都', year: '2026年', image: designCases[14].list[0] }
]

const caseMap = Object.fromEntries(designCases.map((item) => [item.id, item]))

const curatorNotes = [
  '以光影层次重塑动线秩序，强调空间叙事感。',
  '通过材质碰撞塑造理性与温度并存的场域。',
  '在比例与留白中，营造可呼吸的生活美学。',
  '将结构力量与细节工艺融合为沉浸式体验。',
  '借自然肌理与柔和色阶构成安静的情绪场。',
  '让开放协作与独立专注在同一空间达成平衡。'
]

export const worksList = projects.map((project, index) => {
  const matchedCase = caseMap[project.id]
  const list = matchedCase?.list?.length ? matchedCase.list : [project.image]

  return {
    ...project,
    cover: list[0],
    list,
    note: curatorNotes[index % curatorNotes.length]
  }
})

const CUSTOM_CASES_KEY = 'donghe-custom-design-cases'
const CASE_OVERRIDES_KEY = 'donghe-design-case-overrides'
const HIDDEN_CASES_KEY = 'donghe-hidden-design-cases'
const CUSTOM_AWARDS_KEY = 'donghe-custom-awards'
const AWARD_OVERRIDES_KEY = 'donghe-award-overrides'
const HIDDEN_AWARDS_KEY = 'donghe-hidden-awards'
let cloudCases = []
let cloudAwards = []

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
  notifyCustomCasesChanged()
}

export function setCloudAwards(awardList) {
  cloudAwards = Array.isArray(awardList) ? awardList : []
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

function baseManagedCases() {
  const projectsById = Object.fromEntries(projects.map((item) => [String(item.id), item]))
  const hiddenIds = new Set(readHiddenCaseIds())
  const overrides = readCaseOverrides()

  return designCases
    .map((caseItem, index) => {
      const project = projectsById[String(caseItem.id)] || {}
      const fallback = {
        id: String(caseItem.id),
        name: caseItem.name,
        category: project.category || tags[1],
        type: project.type || '商业空间 / 上海',
        year: project.year || `${new Date().getFullYear()}年`,
        url: caseItem.url || '',
        list: caseItem.list,
        image: project.image || caseItem.list[0],
        note: curatorNotes[index % curatorNotes.length],
        createdAt: 0,
        source: 'base',
        hidden: hiddenIds.has(String(caseItem.id))
      }

      return {
        ...fallback,
        ...(overrides[String(caseItem.id)] || {}),
        source: 'base',
        hidden: hiddenIds.has(String(caseItem.id))
      }
    })
}

function baseManagedAwards() {
  const hiddenIds = new Set(readHiddenAwardIds())
  const overrides = readAwardOverrides()

  return awards.map((awardItem) => {
    const fallback = {
      id: String(awardItem.id),
      title: awardItem.title,
      desc: awardItem.desc,
      year: awardItem.year,
      image: awardItem.image,
      imageAlt: awardItem.imageAlt || awardItem.title,
      createdAt: 0,
      source: 'base',
      hidden: hiddenIds.has(String(awardItem.id))
    }

    return {
      ...fallback,
      ...(overrides[String(awardItem.id)] || {}),
      source: 'base',
      hidden: hiddenIds.has(String(awardItem.id))
    }
  })
}

export function getManagedCases() {
  if (cloudCases.length) {
    return cloudCases.map((item) => ({ ...item, source: 'cloud' }))
  }

  return [
    ...readCustomCases().map((item) => ({ ...item, source: 'custom', hidden: false })),
    ...baseManagedCases()
  ]
}

export function getManagedAwards() {
  const localAwards = [
    ...readCustomAwards().map((item) => ({ ...item, source: 'custom', hidden: false })),
    ...baseManagedAwards()
  ]

  if (!cloudAwards.length) {
    return localAwards
  }

  const baseIds = new Set(awards.map((item) => String(item.id)))
  const cloudById = Object.fromEntries(cloudAwards.map((item) => [String(item.id), item]))
  const cloudCustomAwards = cloudAwards
    .filter((item) => !baseIds.has(String(item.id)))
    .map((item) => ({ ...item, source: 'cloud' }))
  const mergedBaseAwards = baseManagedAwards().map((item) => ({
    ...item,
    ...(cloudById[String(item.id)] || {}),
    source: cloudById[String(item.id)] ? 'cloud' : item.source
  }))

  return [
    ...cloudCustomAwards,
    ...mergedBaseAwards
  ]
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
