const assert = require('node:assert/strict')
const test = require('node:test')

/**
 * 加载 ES 模块并注册报价领域测试。
 * @returns {Promise<void>}
 */
async function registerQuoteDomainTests() {
  const {
    calculateQuoteTotals,
    createSecureRandomId,
    quoteStatusLabel,
    toNonNegativeNumber
  } = await import('../src/services/quoteDomain.mjs')

  test('calculateQuoteTotals calculates discount, tax and deposit in order', () => {
    const totals = calculateQuoteTotals({
      items: [
        { quantity: 120, unitPrice: 680 },
        { quantity: 2, unitPrice: 1500 }
      ],
      discount: 1000,
      taxRate: 6,
      depositRate: 30
    })

    assert.deepEqual(totals, {
      subtotal: 84600,
      discount: 1000,
      taxableAmount: 83600,
      tax: 5016,
      total: 88616,
      deposit: 26584.8
    })
  })

  test('calculateQuoteTotals clamps invalid values and percentage boundaries', () => {
    const totals = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 100 },
        { quantity: -2, unitPrice: 500 },
        { quantity: Number.NaN, unitPrice: 500 }
      ],
      discount: -10,
      taxRate: -5,
      depositRate: 150
    })

    assert.deepEqual(totals, {
      subtotal: 100,
      discount: 0,
      taxableAmount: 100,
      tax: 0,
      total: 100,
      deposit: 100
    })
  })

  test('calculateQuoteTotals caps discount at subtotal and rounds currency', () => {
    const totals = calculateQuoteTotals({
      items: [{ quantity: 3, unitPrice: 0.105 }],
      discount: 10,
      taxRate: 13,
      depositRate: 30
    })

    assert.deepEqual(totals, {
      subtotal: 0.32,
      discount: 0.32,
      taxableAmount: 0,
      tax: 0,
      total: 0,
      deposit: 0
    })
  })

  test('toNonNegativeNumber normalizes non-finite and negative input', () => {
    assert.equal(toNonNegativeNumber('12.5'), 12.5)
    assert.equal(toNonNegativeNumber(-1), 0)
    assert.equal(toNonNegativeNumber(Number.POSITIVE_INFINITY), 0)
    assert.equal(toNonNegativeNumber('not-a-number'), 0)
  })

  test('createSecureRandomId uses randomUUID when available', () => {
    const cryptoProvider = {
      randomUUID: () => '12345678-1234-4abc-8def-1234567890ab'
    }

    assert.equal(
      createSecureRandomId('share', cryptoProvider),
      'share-1234567812344abc8def1234567890ab'
    )
  })

  test('createSecureRandomId falls back to getRandomValues without weakening entropy', () => {
    const cryptoProvider = {
      getRandomValues(bytes) {
        bytes.fill(0xab)
        return bytes
      }
    }

    assert.equal(
      createSecureRandomId('share', cryptoProvider),
      `share-${'ab'.repeat(16)}`
    )
  })

  test('createSecureRandomId refuses to generate a public token without secure randomness', () => {
    assert.throws(
      () => createSecureRandomId('share', {}),
      /不支持安全随机数/
    )
  })

  test('quoteStatusLabel returns stable labels and a safe unknown fallback', () => {
    assert.equal(quoteStatusLabel('accepted'), '已确认')
    assert.equal(quoteStatusLabel('unexpected'), '未知状态')
  })
}

registerQuoteDomainTests().catch((error) => {
  process.exitCode = 1
  throw error
})
