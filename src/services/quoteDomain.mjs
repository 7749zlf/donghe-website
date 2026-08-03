export const quoteStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发送', value: 'sent' },
  { label: '已确认', value: 'accepted' },
  { label: '已过期', value: 'expired' },
  { label: '已作废', value: 'void' }
]

export const quoteSectionOptions = ['设计服务', '施工服务', '主材', '软装', '其他']
export const quoteUnitOptions = ['项', '平方米', '米', '套', '个', '天']

/**
 * 将任意数字输入转换为不小于零的有限数值。
 * @param {*} value 原始数字输入。
 * @returns {number} 可用于金额计算的数值。
 */
export function toNonNegativeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

/**
 * 将金额四舍五入到分，避免连续计算产生浮点尾差。
 * @param {number} value 原始金额。
 * @returns {number} 保留两位小数的金额。
 */
function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

/**
 * 将随机字节转换为不包含分隔符的十六进制字符串。
 * @param {Uint8Array} bytes 随机字节。
 * @returns {string} 十六进制随机值。
 */
function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 使用浏览器加密随机源生成报价、明细和公开链接标识。
 * @param {string} prefix 标识前缀。
 * @param {Crypto|Object} cryptoProvider 可注入的加密随机数提供者。
 * @returns {string} 至少包含 122 位随机性的标识。
 * @throws {Error} 当前环境不支持加密安全随机数时抛出错误。
 */
export function createSecureRandomId(prefix, cryptoProvider = globalThis.crypto) {
  let randomValue = ''

  if (typeof cryptoProvider?.randomUUID === 'function') {
    randomValue = cryptoProvider.randomUUID().replace(/-/g, '')
  } else if (typeof cryptoProvider?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    cryptoProvider.getRandomValues(bytes)
    randomValue = bytesToHex(bytes)
  } else {
    throw new Error('当前浏览器不支持安全随机数，无法创建报价单。')
  }

  return `${prefix}-${randomValue}`
}

/**
 * 计算报价单小计、优惠、税费、总价和预付款。
 * @param {Object} quote 报价单数据。
 * @returns {Object} 全部金额汇总。
 */
export function calculateQuoteTotals(quote = {}) {
  const items = Array.isArray(quote.items) ? quote.items : []
  const subtotal = roundCurrency(items.reduce((sum, item) => {
    return sum + toNonNegativeNumber(item.quantity) * toNonNegativeNumber(item.unitPrice)
  }, 0))
  const discount = Math.min(subtotal, roundCurrency(toNonNegativeNumber(quote.discount)))
  const taxableAmount = Math.max(0, subtotal - discount)
  const tax = roundCurrency(taxableAmount * toNonNegativeNumber(quote.taxRate ?? quote.tax_rate) / 100)
  const total = roundCurrency(taxableAmount + tax)
  const deposit = roundCurrency(total * Math.min(100, toNonNegativeNumber(quote.depositRate ?? quote.deposit_rate)) / 100)

  return { subtotal, discount, taxableAmount, tax, total, deposit }
}

/**
 * 格式化人民币金额。
 * @param {*} value 金额数值。
 * @returns {string} 带人民币符号的金额文本。
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(toNonNegativeNumber(value))
}

/**
 * 获取报价状态的中文标签。
 * @param {string} status 状态值。
 * @returns {string} 状态中文标签。
 */
export function quoteStatusLabel(status) {
  return quoteStatusOptions.find((option) => option.value === status)?.label || '未知状态'
}
