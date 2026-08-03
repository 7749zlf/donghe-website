<template>
  <main class="quote-view-page">
    <section v-if="loading" class="quote-state">
      <span>DH / QUOTATION</span>
      <h1>正在读取报价单</h1>
    </section>

    <section v-else-if="errorMessage || !quote" class="quote-state">
      <span>DH / QUOTATION</span>
      <h1>报价单暂时无法查看</h1>
      <p>{{ errorMessage || '链接不存在、尚未发送或已经失效。' }}</p>
    </section>

    <template v-else>
      <div class="document-actions">
        <span>{{ quote.quoteNo }}</span>
        <button type="button" @click="printQuote">打印 / 保存 PDF</button>
      </div>

      <article class="quote-document">
        <header class="document-header">
          <div class="brand-mark">
            <strong>东禾</strong>
            <span>DH INTERIOR STUDIO</span>
          </div>
          <div class="document-title">
            <span>QUOTATION</span>
            <h1>项目报价单</h1>
          </div>
        </header>

        <section class="document-meta">
          <dl>
            <div><dt>报价编号</dt><dd>{{ quote.quoteNo }}</dd></div>
            <div><dt>报价日期</dt><dd>{{ formatDate(quote.issueDate) }}</dd></div>
            <div><dt>有效期至</dt><dd>{{ formatDate(quote.validUntil) }}</dd></div>
            <div><dt>当前状态</dt><dd><span :class="['status-label', `status-${displayStatus}`]">{{ quoteStatusLabel(displayStatus) }}</span></dd></div>
          </dl>
        </section>

        <section class="client-project-band">
          <div>
            <span>CLIENT</span>
            <h2>{{ quote.clientName }}</h2>
            <p v-if="quote.clientPhone">{{ quote.clientPhone }}</p>
          </div>
          <dl>
            <div><dt>项目</dt><dd>{{ quote.projectName }}</dd></div>
            <div v-if="quote.projectAddress"><dt>地址</dt><dd>{{ quote.projectAddress }}</dd></div>
            <div><dt>空间</dt><dd>{{ quote.category }}</dd></div>
            <div v-if="quote.style"><dt>风格</dt><dd>{{ quote.style }}</dd></div>
            <div v-if="quote.area"><dt>面积</dt><dd>{{ quote.area }} 平方米</dd></div>
          </dl>
        </section>

        <section class="items-section">
          <table>
            <thead>
              <tr>
                <th>分类</th>
                <th>报价项目</th>
                <th>单位</th>
                <th>数量</th>
                <th>单价</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in quote.items" :key="item.id">
                <td data-label="分类">{{ item.section }}</td>
                <td data-label="报价项目">
                  <strong>{{ item.name }}</strong>
                  <span v-if="item.description">{{ item.description }}</span>
                </td>
                <td data-label="单位">{{ item.unit }}</td>
                <td data-label="数量">{{ formatNumber(item.quantity) }}</td>
                <td data-label="单价">{{ formatCurrency(item.unitPrice) }}</td>
                <td data-label="金额">{{ formatCurrency(item.quantity * item.unitPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="document-summary">
          <div class="terms-copy">
            <div>
              <span>PAYMENT</span>
              <p>{{ quote.paymentTerms }}</p>
            </div>
            <div v-if="quote.notes">
              <span>NOTES</span>
              <p>{{ quote.notes }}</p>
            </div>
          </div>

          <dl class="amount-summary">
            <div><dt>项目小计</dt><dd>{{ formatCurrency(totals.subtotal) }}</dd></div>
            <div v-if="totals.discount"><dt>优惠</dt><dd>- {{ formatCurrency(totals.discount) }}</dd></div>
            <div v-if="totals.tax"><dt>税费</dt><dd>{{ formatCurrency(totals.tax) }}</dd></div>
            <div class="grand-total"><dt>报价总额</dt><dd>{{ formatCurrency(totals.total) }}</dd></div>
            <div><dt>预付款（{{ quote.depositRate }}%）</dt><dd>{{ formatCurrency(totals.deposit) }}</dd></div>
          </dl>
        </section>

        <footer class="document-footer">
          <p>本报价仅用于当前项目范围，项目内容或现场条件发生变化时应重新确认。</p>
          <div>
            <span>DONGHE INTERIOR STUDIO</span>
            <strong>东禾空间设计</strong>
          </div>
        </footer>
      </article>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { calculateQuoteTotals, fetchQuoteByToken, formatCurrency, quoteStatusLabel } from '@/services/quotes'

const route = useRoute()
const quote = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const totals = computed(() => calculateQuoteTotals(quote.value || {}))
const displayStatus = computed(() => {
  if (quote.value?.status === 'sent' && quote.value.validUntil) {
    const validUntil = new Date(`${quote.value.validUntil}T23:59:59`)
    if (validUntil.getTime() < Date.now()) {
      return 'expired'
    }
  }
  return quote.value?.status || 'draft'
})

/**
 * 将日期字段格式化为中文年月日。
 * @param {string} value YYYY-MM-DD 日期值。
 * @returns {string} 中文日期文本。
 */
function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(`${value}T00:00:00`))
}

/**
 * 格式化数量，整数不显示多余小数位。
 * @param {*} value 数量数值。
 * @returns {string} 可读数量文本。
 */
function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(Number(value || 0))
}

/**
 * 调用浏览器打印面板，支持选择保存为 PDF。
 * @returns {void}
 */
function printQuote() {
  window.print()
}

/**
 * 根据路由 token 加载客户可见报价单。
 * @returns {Promise<void>}
 */
async function loadQuote() {
  loading.value = true
  errorMessage.value = ''

  try {
    quote.value = await fetchQuoteByToken(route.params.token)
    if (!quote.value) {
      errorMessage.value = '链接不存在、报价尚未发送或已经失效。'
    }
  } catch (error) {
    errorMessage.value = `报价单读取失败：${error.message}`
  } finally {
    loading.value = false
  }
}

onMounted(loadQuote)
</script>

<style scoped lang="scss">
.quote-view-page {
  min-height: 100vh;
  min-height: 100svh;
  background: #e7e8e6;
  color: #20231f;
  padding: 34px 20px 72px;
}

.document-actions {
  width: min(1040px, 100%);
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.document-actions span {
  color: #667069;
  font-size: 13px;
}

.document-actions button {
  min-height: 42px;
  border: 1px solid #20231f;
  background: #20231f;
  color: #fff;
  padding: 0 16px;
  font: inherit;
  cursor: pointer;
}

.quote-document {
  width: min(1040px, 100%);
  margin: 0 auto;
  background: #faf9f5;
  box-shadow: 0 22px 70px rgba(28, 33, 28, 0.12);
}

.document-header {
  min-height: 188px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  padding: 42px 52px 34px;
  border-bottom: 1px solid #cdd1ca;
}

.brand-mark,
.document-title {
  display: grid;
}

.brand-mark strong {
  font-size: 34px;
  line-height: 1;
}

.brand-mark span,
.document-title > span,
.client-project-band > div > span,
.terms-copy span,
.document-footer span {
  color: #6b746b;
  font-size: 11px;
  letter-spacing: 2.2px;
}

.brand-mark span {
  margin-top: 8px;
}

.document-title {
  text-align: right;
}

.document-title h1 {
  margin: 7px 0 0;
  font-size: 42px;
  font-weight: 500;
}

.document-meta {
  padding: 20px 52px;
  border-bottom: 1px solid #d9dcd6;
}

.document-meta dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.document-meta dl div,
.client-project-band dl div {
  display: grid;
  gap: 5px;
}

dt {
  color: #737b73;
  font-size: 12px;
}

dd {
  margin: 0;
}

.status-label {
  display: inline-block;
  padding: 4px 7px;
  background: #e8ece4;
  color: #4e5b48;
  font-size: 12px;
}

.status-expired,
.status-void {
  background: #eee5e2;
  color: #7f4840;
}

.client-project-band {
  display: grid;
  grid-template-columns: minmax(200px, 0.55fr) minmax(0, 1.45fr);
  gap: 48px;
  padding: 34px 52px;
  background: #f0f1ec;
}

.client-project-band h2 {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 500;
}

.client-project-band p {
  margin: 8px 0 0;
  color: #5e675f;
}

.client-project-band dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 28px;
}

.items-section {
  padding: 36px 52px;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  border-bottom: 1px solid #8f968e;
  padding: 0 10px 12px;
  color: #687168;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
}

th:nth-child(1) { width: 13%; }
th:nth-child(2) { width: 33%; }
th:nth-child(3) { width: 9%; }
th:nth-child(4) { width: 10%; }
th:nth-child(5) { width: 17%; }
th:nth-child(6) { width: 18%; }

td {
  border-bottom: 1px solid #d9dcd6;
  padding: 16px 10px;
  vertical-align: top;
  overflow-wrap: anywhere;
  font-size: 14px;
}

td strong,
td span {
  display: block;
}

td strong {
  font-weight: 500;
}

td span {
  margin-top: 5px;
  color: #737b73;
  font-size: 12px;
  line-height: 1.55;
}

td:nth-child(n + 4),
th:nth-child(n + 4) {
  text-align: right;
}

.document-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.62fr);
  gap: 52px;
  padding: 8px 52px 40px;
}

.terms-copy {
  display: grid;
  gap: 22px;
}

.terms-copy p {
  margin: 7px 0 0;
  color: #5e675f;
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-line;
}

.amount-summary {
  margin: 0;
  display: grid;
  align-content: start;
  gap: 12px;
}

.amount-summary div {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.amount-summary .grand-total {
  margin-top: 5px;
  border-top: 1px solid #92998f;
  padding-top: 15px;
  font-size: 21px;
  font-weight: 600;
}

.document-footer {
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  border-top: 1px solid #cdd1ca;
  padding: 26px 52px;
}

.document-footer p {
  max-width: 600px;
  margin: 0;
  color: #727a72;
  font-size: 12px;
  line-height: 1.7;
}

.document-footer > div {
  display: grid;
  gap: 4px;
  text-align: right;
}

.document-footer strong {
  font-size: 16px;
  font-weight: 500;
}

.quote-state {
  width: min(720px, calc(100% - 36px));
  margin: 100px auto;
  border-top: 1px solid #7c857c;
  padding-top: 28px;
}

.quote-state span {
  color: #697269;
  font-size: 12px;
  letter-spacing: 2.4px;
}

.quote-state h1 {
  margin: 12px 0;
  font-size: 38px;
  font-weight: 500;
}

.quote-state p {
  color: #697269;
}

@media (max-width: 760px) {
  .quote-view-page {
    padding: 18px 0 50px;
  }

  .document-actions {
    width: calc(100% - 28px);
  }

  .quote-document {
    width: 100%;
    box-shadow: none;
  }

  .document-header,
  .document-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .document-header,
  .document-meta,
  .client-project-band,
  .items-section,
  .document-summary,
  .document-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .document-title,
  .document-footer > div {
    text-align: left;
  }

  .document-title h1 {
    font-size: 34px;
  }

  .document-meta dl,
  .client-project-band,
  .client-project-band dl,
  .document-summary {
    grid-template-columns: 1fr;
  }

  .client-project-band,
  .document-summary {
    gap: 28px;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tr {
    border-bottom: 1px solid #9aa198;
    padding: 12px 0;
  }

  td {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 12px;
    border-bottom: 0;
    padding: 7px 0;
    text-align: left !important;
  }

  td::before {
    content: attr(data-label);
    color: #737b73;
    font-size: 12px;
  }

  .document-actions button {
    min-height: 40px;
    padding-inline: 12px;
  }
}

@media print {
  .quote-view-page {
    min-height: 0;
    background: #fff;
    padding: 0;
  }

  .document-actions {
    display: none;
  }

  .quote-document {
    width: 100%;
    box-shadow: none;
  }

  .items-section,
  .document-summary,
  tr {
    break-inside: avoid;
  }
}
</style>
