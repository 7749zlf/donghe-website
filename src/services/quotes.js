import { getCloudClient, isCloudCasesEnabled } from './cloudCases'
import {
  calculateQuoteTotals,
  createSecureRandomId,
  formatCurrency,
  quoteSectionOptions,
  quoteStatusLabel,
  quoteStatusOptions,
  quoteUnitOptions,
  toNonNegativeNumber
} from './quoteDomain.mjs'

export {
  calculateQuoteTotals,
  formatCurrency,
  quoteSectionOptions,
  quoteStatusLabel,
  quoteStatusOptions,
  quoteUnitOptions
}

const QUOTES_TABLE = process.env.VUE_APP_SUPABASE_QUOTES_TABLE || 'design_quotes'
const LOCAL_QUOTES_KEY = 'donghe-design-quotes'
const QUOTE_EVENT = 'donghe-quotes-updated'
const VALID_STATUSES = new Set(['draft', 'sent', 'accepted', 'expired', 'void'])

/**
 * 将日期转换为浏览器本地时区的 YYYY-MM-DD 字符串。
 * @param {Date} date 待格式化日期。
 * @returns {string} 本地日期字符串。
 */
function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 生成适用于报价、明细和公开链接的随机标识。
 * @param {string} prefix 标识前缀。
 * @returns {string} 随机标识。
 */
function createRandomId(prefix) {
  return createSecureRandomId(prefix)
}

/**
 * 生成便于人工识别的东禾报价单编号。
 * @returns {string} 由日期和随机尾号组成的报价编号。
 */
function createQuoteNumber() {
  const date = formatLocalDate(new Date()).replace(/-/g, '')
  const suffix = createSecureRandomId('number').slice(-6).toUpperCase()
  return `DH-${date}-${suffix}`
}

/**
 * 生成默认三十天后的报价有效期。
 * @returns {string} YYYY-MM-DD 日期字符串。
 */
function defaultValidUntil() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return formatLocalDate(date)
}

/**
 * 标准化单条报价明细并补全可编辑字段。
 * @param {Object} item 原始报价明细。
 * @param {number} index 明细顺序。
 * @returns {Object} 标准化报价明细。
 */
export function normalizeQuoteItem(item = {}, index = 0) {
  return {
    id: String(item.id || createRandomId('item')),
    section: String(item.section || quoteSectionOptions[0]),
    name: String(item.name || '').trim(),
    description: String(item.description || '').trim(),
    unit: String(item.unit || quoteUnitOptions[0]),
    quantity: toNonNegativeNumber(item.quantity ?? 1),
    unitPrice: toNonNegativeNumber(item.unitPrice ?? item.unit_price),
    sortOrder: Number.isFinite(Number(item.sortOrder ?? item.sort_order))
      ? Number(item.sortOrder ?? item.sort_order)
      : index
  }
}

/**
 * 标准化完整报价单并补齐版本一所需字段。
 * @param {Object} quote 原始报价单数据。
 * @returns {Object} 标准化报价单。
 */
export function normalizeQuote(quote = {}) {
  const items = (Array.isArray(quote.items) ? quote.items : [])
    .map(normalizeQuoteItem)
    .sort((left, right) => left.sortOrder - right.sortOrder)

  return {
    id: String(quote.id || createRandomId('quote')),
    quoteNo: String(quote.quoteNo || quote.quote_no || createQuoteNumber()),
    publicToken: String(quote.publicToken || quote.public_token || createRandomId('share')),
    clientName: String(quote.clientName || quote.client_name || '').trim(),
    clientPhone: String(quote.clientPhone || quote.client_phone || '').trim(),
    projectName: String(quote.projectName || quote.project_name || '').trim(),
    projectAddress: String(quote.projectAddress || quote.project_address || '').trim(),
    category: String(quote.category || '居住空间'),
    style: String(quote.style || '').trim(),
    area: toNonNegativeNumber(quote.area),
    status: VALID_STATUSES.has(quote.status) ? quote.status : 'draft',
    issueDate: String(quote.issueDate || quote.issue_date || formatLocalDate(new Date())),
    validUntil: String(quote.validUntil || quote.valid_until || defaultValidUntil()),
    items,
    discount: toNonNegativeNumber(quote.discount),
    taxRate: toNonNegativeNumber(quote.taxRate ?? quote.tax_rate),
    depositRate: toNonNegativeNumber(quote.depositRate ?? quote.deposit_rate ?? 30),
    paymentTerms: String(quote.paymentTerms || quote.payment_terms || '报价确认后支付预付款，余款按项目节点结算。').trim(),
    notes: String(quote.notes || '').trim(),
    createdAt: quote.createdAt || quote.created_at || new Date().toISOString(),
    updatedAt: quote.updatedAt || quote.updated_at || new Date().toISOString()
  }
}

/**
 * 创建一份带默认明细行的新报价草稿。
 * @returns {Object} 可直接载入编辑器的报价草稿。
 */
export function createQuoteDraft() {
  return normalizeQuote({
    items: [
      { section: '设计服务', name: '空间设计服务', unit: '平方米', quantity: 1, unitPrice: 0 }
    ]
  })
}

/**
 * 将数据库行转换为前端报价模型。
 * @param {Object} row Supabase 报价行。
 * @returns {Object} 前端报价模型。
 */
function rowToQuote(row) {
  return normalizeQuote(row)
}

/**
 * 将前端报价模型转换为 Supabase 写入字段。
 * @param {Object} quote 前端报价数据。
 * @returns {Object} Supabase 报价行。
 */
function quoteToRow(quote) {
  const normalized = normalizeQuote(quote)
  return {
    id: normalized.id,
    quote_no: normalized.quoteNo,
    public_token: normalized.publicToken,
    client_name: normalized.clientName,
    client_phone: normalized.clientPhone,
    project_name: normalized.projectName,
    project_address: normalized.projectAddress,
    category: normalized.category,
    style: normalized.style,
    area: normalized.area,
    status: normalized.status,
    issue_date: normalized.issueDate,
    valid_until: normalized.validUntil,
    items: normalized.items.map((item, index) => ({
      ...item,
      sortOrder: index
    })),
    discount: normalized.discount,
    tax_rate: normalized.taxRate,
    deposit_rate: normalized.depositRate,
    payment_terms: normalized.paymentTerms,
    notes: normalized.notes,
    updated_at: new Date().toISOString()
  }
}

/**
 * 判断浏览器本地存储是否可用。
 * @returns {boolean} localStorage 可用时返回 true。
 */
function hasStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

/**
 * 触发报价数据更新事件，通知当前页面刷新列表。
 * @returns {void}
 */
function notifyQuotesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(QUOTE_EVENT))
  }
}

/**
 * 从浏览器读取本地报价单。
 * @returns {Object[]} 本地报价列表。
 */
function readLocalQuotes() {
  if (!hasStorage()) {
    return []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_QUOTES_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.map(rowToQuote) : []
  } catch (error) {
    return []
  }
}

/**
 * 覆盖写入本地报价单并通知页面刷新。
 * @param {Object[]} quotes 报价列表。
 * @returns {void}
 */
function writeLocalQuotes(quotes) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(quotes.map(normalizeQuote)))
  notifyQuotesChanged()
}

/**
 * 获取后台可管理的全部报价单。
 * @returns {Promise<Object[]>} 按更新时间倒序排列的报价列表。
 */
export async function fetchManagedQuotes() {
  if (!isCloudCasesEnabled()) {
    return readLocalQuotes().sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
  }

  const client = await getCloudClient()
  const { data, error } = await client
    .from(QUOTES_TABLE)
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(rowToQuote)
}

/**
 * 保存报价单；云端模式按 id 写入，离线模式写入 localStorage。
 * @param {Object} quote 待保存报价单。
 * @returns {Promise<Object>} 数据源返回的最终报价单。
 */
export async function saveQuote(quote) {
  const normalized = normalizeQuote(quote)

  if (!isCloudCasesEnabled()) {
    const quotes = readLocalQuotes()
    const index = quotes.findIndex((item) => item.id === normalized.id)
    const saved = { ...normalized, updatedAt: new Date().toISOString() }
    if (index >= 0) {
      quotes.splice(index, 1, saved)
    } else {
      quotes.unshift(saved)
    }
    writeLocalQuotes(quotes)
    return saved
  }

  const client = await getCloudClient()
  const { data, error } = await client
    .from(QUOTES_TABLE)
    .upsert(quoteToRow(normalized), { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  notifyQuotesChanged()
  return rowToQuote(data)
}

/**
 * 删除指定报价单。
 * @param {string|number} id 报价单唯一标识。
 * @returns {Promise<void>}
 */
export async function deleteQuote(id) {
  if (!isCloudCasesEnabled()) {
    writeLocalQuotes(readLocalQuotes().filter((quote) => String(quote.id) !== String(id)))
    return
  }

  const client = await getCloudClient()
  const { error } = await client.from(QUOTES_TABLE).delete().eq('id', String(id))
  if (error) {
    throw error
  }
  notifyQuotesChanged()
}

/**
 * 使用不可枚举的公开 token 获取客户报价；管理员可预览草稿。
 * @param {string} token 报价公开访问 token。
 * @returns {Promise<Object|null>} 匹配报价或不存在标记。
 */
export async function fetchQuoteByToken(token) {
  const normalizedToken = String(token || '').trim()
  if (!normalizedToken) {
    return null
  }

  if (!isCloudCasesEnabled()) {
    return readLocalQuotes().find((quote) => quote.publicToken === normalizedToken) || null
  }

  const client = await getCloudClient()
  const { data, error } = await client.rpc('get_public_design_quote', {
    access_token: normalizedToken
  })

  if (error) {
    throw error
  }

  const publicQuote = Array.isArray(data) ? data[0] : data
  if (publicQuote) {
    return rowToQuote(publicQuote)
  }

  const { data: sessionData } = await client.auth.getSession()
  if (!sessionData.session) {
    return null
  }

  const { data: adminQuote, error: adminError } = await client
    .from(QUOTES_TABLE)
    .select('*')
    .eq('public_token', normalizedToken)
    .maybeSingle()

  if (adminError) {
    throw adminError
  }

  return adminQuote ? rowToQuote(adminQuote) : null
}
