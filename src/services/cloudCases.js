const SUPABASE_URL = process.env.VUE_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VUE_APP_SUPABASE_ANON_KEY
const CASES_TABLE = process.env.VUE_APP_SUPABASE_CASES_TABLE || 'design_cases'
const AWARDS_TABLE = process.env.VUE_APP_SUPABASE_AWARDS_TABLE || 'design_awards'
const CASE_IMAGES_BUCKET = process.env.VUE_APP_SUPABASE_CASE_IMAGES_BUCKET || 'case-images'

const enabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
let clientPromise = null

/**
 * 延迟创建并复用 Supabase 客户端；未配置环境变量时返回 null。
 * @returns {Promise<Object|null>} Supabase 客户端或未配置标记。
 */
async function getClient() {
  if (!enabled) {
    return null
  }

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    })
  }

  return clientPromise
}

/**
 * 向其他业务服务提供当前项目共享的 Supabase 客户端。
 * @returns {Promise<Object|null>} Supabase 客户端或未配置标记。
 */
export function getCloudClient() {
  return getClient()
}

/**
 * 获取已配置的 Supabase 客户端，否则抛出明确错误。
 * @returns {Promise<Object>} 可用的 Supabase 客户端。
 * @throws {Error} 云端服务未配置时抛出。
 */
async function requireClient() {
  const client = await getClient()

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  return client
}

/**
 * 将数据库图片字段统一转换为非空 URL 数组。
 * @param {Array|string} value 原始图片字段。
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
 * 判断当前构建是否已配置 Supabase 云端服务。
 * @returns {boolean} 配置完整时返回 true。
 */
export function isCloudCasesEnabled() {
  return enabled
}

/**
 * 将用户输入转换为可安全用于存储路径的片段。
 * @param {*} value 原始路径值。
 * @returns {string} 清洗后的非空路径片段。
 */
function safePathPart(value) {
  return String(value || 'case')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'case'
}

/**
 * 上传图片到项目存储桶并返回公开访问地址。
 * @param {File|Blob} file 待上传图片文件。
 * @param {string|number} caseId 所属项目或荣誉标识。
 * @param {string} variant 文件用途标记，例如 cover。
 * @returns {Promise<string>} 上传后的公开图片地址。
 */
async function uploadStorageImage(file, caseId = 'case', variant = '') {
  const client = await requireClient()

  const fileName = safePathPart(file.name || 'image')
  const folder = safePathPart(caseId)
  const variantPrefix = variant ? `${safePathPart(variant)}-` : ''
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${variantPrefix}${fileName}`
  const { error } = await client.storage
    .from(CASE_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || 'application/octet-stream',
      upsert: true
    })

  if (error) {
    throw error
  }

  const { data } = client.storage.from(CASE_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * 上传项目画册图片。
 * @param {File|Blob} file 待上传图片文件。
 * @param {string|number} caseId 项目标识。
 * @returns {Promise<string>} 上传后的公开图片地址。
 */
export function uploadCaseImage(file, caseId = 'case') {
  return uploadStorageImage(file, caseId)
}

/**
 * 上传项目封面图片并在文件名中标记封面用途。
 * @param {File|Blob} file 待上传图片文件。
 * @param {string|number} caseId 项目标识。
 * @returns {Promise<string>} 上传后的公开封面地址。
 */
export function uploadCaseCoverImage(file, caseId = 'case') {
  return uploadStorageImage(file, caseId, 'cover')
}

/**
 * 上传荣誉图片到独立的荣誉路径。
 * @param {File|Blob} file 待上传图片文件。
 * @param {string|number} awardId 荣誉标识。
 * @returns {Promise<string>} 上传后的公开图片地址。
 */
export function uploadAwardImage(file, awardId = 'award') {
  return uploadCaseImage(file, `awards-${awardId}`)
}

/**
 * 从当前存储桶公开链接中提取可删除的对象路径。
 * @param {*} value 待解析的图片地址。
 * @returns {string} 存储对象路径；外部或无效地址返回空字符串。
 */
function getStoragePathFromPublicUrl(value) {
  try {
    const url = new URL(String(value || ''))
    const marker = `/storage/v1/object/public/${CASE_IMAGES_BUCKET}/`
    const markerIndex = url.pathname.indexOf(marker)

    if (markerIndex < 0) {
      return ''
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
  } catch (error) {
    return ''
  }
}

/**
 * 批量删除属于当前 Supabase 存储桶的图片，自动忽略外部链接。
 * @param {string|string[]} urls 一个或多个公开图片地址。
 * @returns {Promise<void>}
 */
export async function deleteCloudImages(urls) {
  const paths = [...new Set(
    (Array.isArray(urls) ? urls : [urls])
      .map(getStoragePathFromPublicUrl)
      .filter(Boolean)
  )]

  if (!paths.length) {
    return
  }

  const client = await requireClient()
  const { error } = await client.storage
    .from(CASE_IMAGES_BUCKET)
    .remove(paths)

  if (error) {
    throw error
  }
}

/**
 * 获取当前后台登录会话；未配置云端时返回 null。
 * @returns {Promise<Object|null>} 当前认证会话。
 */
export async function getManagerSession() {
  const client = await getClient()

  if (!client) {
    return null
  }

  const { data, error } = await client.auth.getSession()
  if (error) {
    throw error
  }

  return data.session
}

/**
 * 订阅后台认证状态变化，并返回可重复调用的取消函数。
 * @param {Function} callback 会话变化时执行的回调。
 * @returns {Function} 取消认证监听的函数。
 */
export function onManagerAuthChange(callback) {
  if (!enabled) {
    return () => {}
  }

  let cancelled = false
  let subscription = null

  getClient().then((client) => {
    if (!client || cancelled) {
      return
    }

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })

    subscription = data.subscription
  }).catch((error) => {
    console.warn('Failed to listen for manager auth changes:', error)
  })

  return () => {
    cancelled = true
    subscription?.unsubscribe()
  }
}

/**
 * 使用邮箱和密码登录后台管理账号。
 * @param {string} email 管理员邮箱。
 * @param {string} password 登录密码。
 * @returns {Promise<Object|null>} 登录成功后的认证会话。
 */
export async function signInManager(email, password) {
  const client = await requireClient()

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data.session
}

/**
 * 注销当前后台管理会话。
 * @returns {Promise<void>}
 */
export async function signOutManager() {
  const client = await getClient()

  if (!client) {
    return
  }

  const { error } = await client.auth.signOut()
  if (error) {
    throw error
  }
}

/**
 * 校验当前登录邮箱是否存在于管理员授权表。
 * @returns {Promise<boolean>} 具有后台权限时返回 true。
 */
export async function isManagerAdmin() {
  const client = await getClient()

  if (!client) {
    return false
  }

  const session = await getManagerSession()
  const email = session?.user?.email

  if (!email) {
    return false
  }

  const { data, error } = await client
    .from('design_admins')
    .select('email')
    .ilike('email', email)
    .maybeSingle()

  if (error) {
    throw error
  }

  return Boolean(data)
}

/**
 * 将 Supabase 项目行转换为前端统一项目模型。
 * @param {Object} row 数据库项目行。
 * @returns {Object} 前端项目数据。
 */
export function rowToCase(row) {
  const list = normalizeImages(row.images)

  return {
    id: String(row.id),
    name: row.name || '',
    category: row.category || '商业空间',
    style: row.style || '',
    type: row.type || '',
    year: row.year || '',
    url: row.url || '',
    list,
    image: row.image || list[0] || '',
    note: row.note || '',
    source: 'cloud',
    hidden: Boolean(row.hidden),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  }
}

/**
 * 将前端项目模型转换为 Supabase 可写入字段。
 * @param {Object} caseItem 前端项目数据。
 * @returns {Object} 数据库项目行。
 */
function caseToRow(caseItem) {
  const images = normalizeImages(caseItem.list || caseItem.images)

  return {
    id: String(caseItem.id || `case-${Date.now()}`),
    name: String(caseItem.name || '').trim(),
    category: String(caseItem.category || '商业空间'),
    style: String(caseItem.style || '').trim(),
    type: String(caseItem.type || ''),
    year: String(caseItem.year || ''),
    url: String(caseItem.url || ''),
    images,
    image: String(caseItem.image || images[0] || ''),
    note: String(caseItem.note || ''),
    hidden: Boolean(caseItem.hidden)
  }
}

/**
 * 将 Supabase 荣誉行转换为前端统一荣誉模型。
 * @param {Object} row 数据库荣誉行。
 * @returns {Object} 前端荣誉数据。
 */
export function rowToAward(row) {
  return {
    id: String(row.id),
    title: row.title || '',
    desc: row.desc || '',
    year: row.year || '',
    image: row.image || '',
    imageAlt: row.image_alt || row.title || '',
    source: 'cloud',
    hidden: Boolean(row.hidden),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  }
}

/**
 * 将前端荣誉模型转换为 Supabase 可写入字段。
 * @param {Object} awardItem 前端荣誉数据。
 * @returns {Object} 数据库荣誉行。
 */
function awardToRow(awardItem) {
  return {
    id: String(awardItem.id || `award-${Date.now()}`),
    title: String(awardItem.title || '').trim(),
    desc: String(awardItem.desc || ''),
    year: String(awardItem.year || ''),
    image: String(awardItem.image || ''),
    image_alt: String(awardItem.imageAlt || awardItem.image_alt || awardItem.title || ''),
    hidden: Boolean(awardItem.hidden)
  }
}

/**
 * 按创建时间倒序获取全部云端项目。
 * @returns {Promise<Object[]>} 标准化后的项目列表。
 */
export async function fetchCloudCases() {
  const client = await getClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from(CASES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(rowToCase)
}

/**
 * 按创建时间倒序获取全部云端荣誉。
 * @returns {Promise<Object[]>} 标准化后的荣誉列表。
 */
export async function fetchCloudAwards() {
  const client = await getClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from(AWARDS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(rowToAward)
}

/**
 * 按项目 id 新增或更新云端项目，并返回数据库最终结果。
 * @param {Object} caseItem 待保存的项目数据。
 * @returns {Promise<Object>} 已保存的标准化项目。
 */
export async function upsertCloudCase(caseItem) {
  const client = await requireClient()

  const row = caseToRow(caseItem)
  const { data, error } = await client
    .from(CASES_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  return rowToCase(data)
}

/**
 * 按荣誉 id 新增或更新云端荣誉，并返回数据库最终结果。
 * @param {Object} awardItem 待保存的荣誉数据。
 * @returns {Promise<Object>} 已保存的标准化荣誉。
 */
export async function upsertCloudAward(awardItem) {
  const client = await requireClient()

  const row = awardToRow(awardItem)
  const { data, error } = await client
    .from(AWARDS_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  return rowToAward(data)
}

/**
 * 从云端项目表删除指定项目记录。
 * @param {string|number} id 项目唯一标识。
 * @returns {Promise<void>}
 */
export async function deleteCloudCase(id) {
  const client = await requireClient()

  const { error } = await client
    .from(CASES_TABLE)
    .delete()
    .eq('id', String(id))

  if (error) {
    throw error
  }
}

/**
 * 从云端荣誉表删除指定荣誉记录。
 * @param {string|number} id 荣誉唯一标识。
 * @returns {Promise<void>}
 */
export async function deleteCloudAward(id) {
  const client = await requireClient()

  const { error } = await client
    .from(AWARDS_TABLE)
    .delete()
    .eq('id', String(id))

  if (error) {
    throw error
  }
}
