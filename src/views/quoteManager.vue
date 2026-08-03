<template>
  <main class="quote-manager-page">
    <section v-if="cloudEnabled && !authReady" class="state-panel">
      <h1>正在检查权限</h1>
      <p>请稍候。</p>
    </section>

    <form v-else-if="cloudEnabled && !managerSession" class="state-panel auth-panel" @submit.prevent="handleLogin">
      <h1>管理员登录</h1>
      <label class="field">
        <span>邮箱</span>
        <input v-model.trim="loginForm.email" type="email" autocomplete="username" required />
      </label>
      <label class="field">
        <span>密码</span>
        <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
      </label>
      <button class="primary-button" type="submit" :disabled="authLoading">
        {{ authLoading ? '登录中' : '登录' }}
      </button>
      <p class="status-text">{{ statusText }}</p>
    </form>

    <section v-else-if="cloudEnabled && !managerIsAdmin" class="state-panel">
      <h1>没有管理权限</h1>
      <p>当前账号未加入管理员名单。</p>
      <button class="secondary-button" type="button" @click="handleLogout">退出登录</button>
    </section>

    <section v-else class="quote-shell">
      <header class="manager-header">
        <div>
          <span class="section-kicker">STUDIO DOCUMENTS</span>
          <h1>报价单管理</h1>
          <div class="manager-tabs" role="tablist" aria-label="管理内容切换">
            <button type="button" @click="goContentManager">作品与荣誉</button>
            <button type="button" class="active">报价单</button>
          </div>
        </div>
        <div class="header-actions">
          <span v-if="cloudEnabled">{{ managerEmail }}</span>
          <button class="secondary-button" type="button" @click="startNewQuote">新建报价</button>
          <button v-if="cloudEnabled" class="text-button" type="button" @click="handleLogout">退出</button>
        </div>
      </header>

      <div class="quote-layout">
        <form class="quote-editor" @submit.prevent="handleSave">
          <div class="editor-heading">
            <div>
              <span>{{ editingQuoteId ? 'EDITING QUOTE' : 'NEW QUOTE' }}</span>
              <h2>{{ editor.quoteNo }}</h2>
            </div>
            <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
          </div>

          <section class="form-section">
            <h3>客户与项目</h3>
            <div class="form-grid">
              <label class="field">
                <span>客户名称</span>
                <input v-model.trim="editor.clientName" type="text" required />
              </label>
              <label class="field">
                <span>联系电话</span>
                <input v-model.trim="editor.clientPhone" type="tel" />
              </label>
              <label class="field wide">
                <span>项目名称</span>
                <input v-model.trim="editor.projectName" type="text" required />
              </label>
              <label class="field wide">
                <span>项目地址</span>
                <input v-model.trim="editor.projectAddress" type="text" />
              </label>
              <label class="field">
                <span>空间类型</span>
                <div class="select-control">
                  <select v-model="editor.category">
                    <option v-for="tag in categoryOptions" :key="tag" :value="tag">{{ tag }}</option>
                  </select>
                </div>
              </label>
              <label class="field">
                <span>设计风格</span>
                <input v-model.trim="editor.style" type="text" list="quote-style-options" />
                <datalist id="quote-style-options">
                  <option v-for="style in styleOptions" :key="style" :value="style"></option>
                </datalist>
              </label>
              <label class="field">
                <span>面积（平方米）</span>
                <input v-model.number="editor.area" type="number" min="0" step="0.1" />
              </label>
              <label class="field">
                <span>报价状态</span>
                <div class="select-control">
                  <select v-model="editor.status">
                    <option v-for="option in quoteStatusOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </label>
              <label class="field">
                <span>报价日期</span>
                <input v-model="editor.issueDate" type="date" />
              </label>
              <label class="field">
                <span>有效期至</span>
                <input v-model="editor.validUntil" type="date" />
              </label>
            </div>
          </section>

          <section class="form-section line-items-section">
            <div class="section-heading">
              <h3>报价明细</h3>
              <button class="secondary-button" type="button" @click="addQuoteItem">添加项目</button>
            </div>

            <div class="line-items">
              <article v-for="(item, index) in editor.items" :key="item.id" class="line-item">
                <label class="line-field section-field">
                  <span>分类</span>
                  <div class="select-control">
                    <select v-model="item.section">
                      <option v-for="section in quoteSectionOptions" :key="section" :value="section">{{ section }}</option>
                    </select>
                  </div>
                </label>
                <label class="line-field name-field">
                  <span>项目名称</span>
                  <input v-model.trim="item.name" type="text" required />
                </label>
                <label class="line-field description-field">
                  <span>说明</span>
                  <input v-model.trim="item.description" type="text" />
                </label>
                <label class="line-field unit-field">
                  <span>单位</span>
                  <div class="select-control">
                    <select v-model="item.unit">
                      <option v-for="unit in quoteUnitOptions" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                  </div>
                </label>
                <label class="line-field number-field">
                  <span>数量</span>
                  <input v-model.number="item.quantity" type="number" min="0" step="0.01" />
                </label>
                <label class="line-field price-field">
                  <span>单价</span>
                  <input v-model.number="item.unitPrice" type="number" min="0" step="0.01" />
                </label>
                <div class="line-amount">
                  <span>金额</span>
                  <strong>{{ formatCurrency(itemAmount(item)) }}</strong>
                </div>
                <button
                  class="remove-item-button"
                  type="button"
                  :disabled="editor.items.length === 1"
                  :aria-label="`删除第 ${index + 1} 项`"
                  @click="removeQuoteItem(index)"
                >
                  ×
                </button>
              </article>
            </div>
          </section>

          <section class="form-section totals-section">
            <div class="totals-inputs">
              <label class="field">
                <span>优惠金额</span>
                <input v-model.number="editor.discount" type="number" min="0" step="0.01" />
              </label>
              <label class="field">
                <span>税率（%）</span>
                <input v-model.number="editor.taxRate" type="number" min="0" step="0.01" />
              </label>
              <label class="field">
                <span>预付款比例（%）</span>
                <input v-model.number="editor.depositRate" type="number" min="0" max="100" step="1" />
              </label>
            </div>
            <dl class="totals-list">
              <div><dt>项目小计</dt><dd>{{ formatCurrency(totals.subtotal) }}</dd></div>
              <div><dt>优惠</dt><dd>- {{ formatCurrency(totals.discount) }}</dd></div>
              <div><dt>税费</dt><dd>{{ formatCurrency(totals.tax) }}</dd></div>
              <div class="grand-total"><dt>报价总额</dt><dd>{{ formatCurrency(totals.total) }}</dd></div>
              <div><dt>预付款</dt><dd>{{ formatCurrency(totals.deposit) }}</dd></div>
            </dl>
          </section>

          <section class="form-section notes-section">
            <label class="field">
              <span>付款方式</span>
              <textarea v-model.trim="editor.paymentTerms" rows="2"></textarea>
            </label>
            <label class="field">
              <span>报价说明</span>
              <textarea v-model.trim="editor.notes" rows="3"></textarea>
            </label>
          </section>

          <footer class="editor-footer">
            <p>{{ statusText }}</p>
            <div>
              <button v-if="editingQuoteId" class="secondary-button" type="button" @click="openQuote(editor)">预览</button>
              <button class="primary-button" type="submit" :disabled="saving">
                {{ saving ? '保存中' : '保存报价单' }}
              </button>
            </div>
          </footer>
        </form>

        <aside class="quote-list-panel">
          <div class="list-heading">
            <div>
              <span>QUOTE ARCHIVE</span>
              <h2>全部报价</h2>
            </div>
            <strong>{{ quotes.length }}</strong>
          </div>

          <div v-if="quotes.length" class="quote-list">
            <article v-for="quote in quotes" :key="quote.id" class="quote-list-item">
              <div class="quote-list-main">
                <div>
                  <span>{{ quote.quoteNo }}</span>
                  <strong>{{ quote.projectName }}</strong>
                  <p>{{ quote.clientName }} · {{ quote.issueDate }}</p>
                </div>
                <span :class="['status-badge', `status-${quote.status}`]">{{ quoteStatusLabel(quote.status) }}</span>
              </div>
              <div class="quote-list-total">
                <span>报价总额</span>
                <strong>{{ formatCurrency(calculateQuoteTotals(quote).total) }}</strong>
              </div>
              <div class="quote-list-actions">
                <button type="button" @click="editQuote(quote)">编辑</button>
                <button type="button" @click="openQuote(quote)">查看</button>
                <button type="button" @click="copyQuoteLink(quote)">复制链接</button>
                <button class="danger-button" type="button" @click="removeQuote(quote)">删除</button>
              </div>
            </article>
          </div>
          <p v-else class="empty-state">还没有报价单。</p>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isCloudCasesEnabled, getManagerSession, isManagerAdmin, onManagerAuthChange, signInManager, signOutManager } from '@/services/cloudCases'
import {
  calculateQuoteTotals,
  createQuoteDraft,
  deleteQuote,
  fetchManagedQuotes,
  formatCurrency,
  normalizeQuote,
  normalizeQuoteItem,
  quoteSectionOptions,
  quoteStatusLabel,
  quoteStatusOptions,
  quoteUnitOptions,
  saveQuote
} from '@/services/quotes'
import { stylePresets, tags } from '@/mock/data'

const router = useRouter()
const cloudEnabled = isCloudCasesEnabled()
const categoryOptions = tags.slice(1)
const styleOptions = stylePresets
const quotes = ref([])
const editingQuoteId = ref('')
const saving = ref(false)
const authReady = ref(!cloudEnabled)
const authLoading = ref(false)
const managerSession = ref(null)
const managerIsAdmin = ref(false)
const statusText = ref(cloudEnabled ? '报价单会保存到云端数据库。' : '报价单会保存在当前浏览器中。')
const editor = reactive(createQuoteDraft())
const loginForm = reactive({ email: '', password: '' })
let stopAuthListener = null

const managerEmail = computed(() => managerSession.value?.user?.email || '')
const totals = computed(() => calculateQuoteTotals(editor))

/**
 * 从数据源刷新后台报价列表。
 * @returns {Promise<void>}
 */
async function loadQuotes() {
  quotes.value = await fetchManagedQuotes()
}

/**
 * 响应同一浏览器内的报价更新事件，并将刷新错误显示在页面上。
 * @returns {Promise<void>}
 */
async function handleQuotesUpdated() {
  try {
    await loadQuotes()
  } catch (error) {
    statusText.value = `刷新报价列表失败：${error.message}`
  }
}

/**
 * 将编辑器恢复为新的报价草稿。
 * @returns {void}
 */
function startNewQuote() {
  editingQuoteId.value = ''
  Object.assign(editor, createQuoteDraft())
  statusText.value = '正在新建报价单。'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 将指定报价完整载入编辑器。
 * @param {Object} quote 报价单数据。
 * @returns {void}
 */
function editQuote(quote) {
  const normalized = normalizeQuote(quote)
  editingQuoteId.value = normalized.id
  Object.assign(editor, normalized)
  statusText.value = `正在编辑 ${normalized.quoteNo}。`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 向当前报价追加一条空白明细。
 * @returns {void}
 */
function addQuoteItem() {
  editor.items.push(normalizeQuoteItem({
    section: quoteSectionOptions[0],
    unit: quoteUnitOptions[0],
    quantity: 1
  }, editor.items.length))
}

/**
 * 删除指定报价明细，至少保留一条可编辑行。
 * @param {number} index 明细索引。
 * @returns {void}
 */
function removeQuoteItem(index) {
  if (editor.items.length > 1) {
    editor.items.splice(index, 1)
  }
}

/**
 * 计算单条报价明细金额。
 * @param {Object} item 报价明细。
 * @returns {number} 数量乘单价后的金额。
 */
function itemAmount(item) {
  return Number(item.quantity || 0) * Number(item.unitPrice || 0)
}

/**
 * 校验并保存当前报价单。
 * @returns {Promise<void>}
 */
async function handleSave() {
  if (!editor.clientName || !editor.projectName) {
    statusText.value = '请填写客户名称和项目名称。'
    return
  }

  if (!editor.items.length || editor.items.some((item) => !item.name)) {
    statusText.value = '请填写每一条报价项目名称。'
    return
  }

  saving.value = true
  try {
    const saved = await saveQuote(editor)
    await loadQuotes()
    editQuote(saved)
    statusText.value = `已保存 ${saved.quoteNo}。`
  } catch (error) {
    statusText.value = `保存失败：${error.message}`
  } finally {
    saving.value = false
  }
}

/**
 * 生成报价客户查看页的完整地址。
 * @param {Object} quote 报价单数据。
 * @returns {string} 可分享的完整 URL。
 */
function createShareUrl(quote) {
  const route = router.resolve({ name: 'quoteView', params: { token: quote.publicToken } })
  return new URL(route.href, window.location.href).href
}

/**
 * 在新标签页打开报价客户页面。
 * @param {Object} quote 报价单数据。
 * @returns {void}
 */
function openQuote(quote) {
  window.open(createShareUrl(quote), '_blank', 'noopener')
}

/**
 * 将报价链接写入剪贴板；草稿首次分享时自动标记为已发送。
 * @param {Object} quote 报价单数据。
 * @returns {Promise<void>}
 */
async function copyQuoteLink(quote) {
  try {
    let shareQuote = quote
    if (quote.status === 'draft') {
      shareQuote = await saveQuote({ ...quote, status: 'sent' })
      await loadQuotes()
      if (editingQuoteId.value === quote.id) {
        editQuote(shareQuote)
      }
    }

    const url = createShareUrl(shareQuote)
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    } else {
      const input = document.createElement('textarea')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    statusText.value = `已复制 ${shareQuote.quoteNo} 的客户链接。`
  } catch (error) {
    statusText.value = `复制链接失败：${error.message}`
  }
}

/**
 * 确认后永久删除指定报价单。
 * @param {Object} quote 报价单数据。
 * @returns {Promise<void>}
 */
async function removeQuote(quote) {
  if (!window.confirm(`确认删除 ${quote.quoteNo}？`)) {
    return
  }

  try {
    await deleteQuote(quote.id)
    await loadQuotes()
    if (editingQuoteId.value === quote.id) {
      startNewQuote()
    }
    statusText.value = `已删除 ${quote.quoteNo}。`
  } catch (error) {
    statusText.value = `删除失败：${error.message}`
  }
}

/**
 * 返回作品与荣誉管理页面。
 * @returns {void}
 */
function goContentManager() {
  router.push({ name: 'contentManager' })
}

/**
 * 使用管理员账号登录并加载报价数据。
 * @returns {Promise<void>}
 */
async function handleLogin() {
  authLoading.value = true
  try {
    managerSession.value = await signInManager(loginForm.email, loginForm.password)
    managerIsAdmin.value = await isManagerAdmin()
    if (managerIsAdmin.value) {
      await loadQuotes()
      statusText.value = '登录成功。'
    } else {
      statusText.value = '当前账号没有管理权限。'
    }
    loginForm.password = ''
  } catch (error) {
    statusText.value = `登录失败：${error.message}`
  } finally {
    authLoading.value = false
  }
}

/**
 * 注销管理员会话并返回统一的内容后台登录入口。
 * @returns {Promise<void>}
 */
async function handleLogout() {
  try {
    await signOutManager()
    managerSession.value = null
    managerIsAdmin.value = false
    quotes.value = []
    statusText.value = '已退出登录。'
    await router.replace({ name: 'contentManager' })
  } catch (error) {
    statusText.value = `退出失败：${error.message}`
  }
}

onMounted(async () => {
  window.addEventListener('donghe-quotes-updated', handleQuotesUpdated)

  if (!cloudEnabled) {
    await loadQuotes()
    return
  }

  try {
    managerSession.value = await getManagerSession()
    stopAuthListener = onManagerAuthChange((session) => {
      managerSession.value = session
      if (!session) {
        managerIsAdmin.value = false
      }
    })
    authReady.value = true

    if (managerSession.value) {
      managerIsAdmin.value = await isManagerAdmin()
      if (managerIsAdmin.value) {
        await loadQuotes()
      }
    }
  } catch (error) {
    authReady.value = true
    statusText.value = `初始化失败：${error.message}`
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('donghe-quotes-updated', handleQuotesUpdated)
  stopAuthListener?.()
})
</script>

<style scoped lang="scss">
.quote-manager-page {
  min-height: calc(100vh - var(--nav-height));
  min-height: calc(100svh - var(--nav-height));
  background: #eef0f1;
  color: #11161d;
  padding: 38px 0 72px;
}

.quote-shell {
  width: min(1440px, calc(100% - 40px));
  margin: 0 auto;
}

.manager-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 26px;
}

.section-kicker,
.editor-heading > div > span,
.list-heading span {
  color: #69717d;
  font-size: 12px;
  letter-spacing: 2.4px;
}

.manager-header h1 {
  margin: 6px 0 0;
  font-size: 38px;
  font-weight: 500;
}

.manager-tabs {
  display: inline-flex;
  margin-top: 16px;
  padding: 5px;
  background: #dfe4e8;
}

.manager-tabs button {
  min-height: 38px;
  border: 0;
  background: transparent;
  color: #46515f;
  padding: 0 16px;
  cursor: pointer;
}

.manager-tabs button.active {
  background: #11161d;
  color: #fff;
}

.header-actions,
.editor-footer,
.editor-footer > div,
.section-heading,
.quote-list-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions > span {
  color: #69717d;
  font-size: 14px;
}

.quote-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.55fr);
  gap: 24px;
  align-items: start;
}

.quote-editor,
.quote-list-panel,
.state-panel {
  background: #fff;
  border: 1px solid #dfe3e7;
}

.quote-editor {
  min-width: 0;
}

.editor-heading,
.form-section,
.editor-footer {
  padding: 24px 28px;
  border-bottom: 1px solid #e8ebee;
}

.editor-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.editor-heading h2,
.form-section h3,
.list-heading h2 {
  margin: 0;
  font-weight: 500;
}

.editor-heading h2 {
  margin-top: 5px;
  font-size: 24px;
}

.mode-badge {
  padding: 7px 10px;
  background: #eef2f2;
  color: #59625d;
  font-size: 13px;
}

.form-section h3 {
  margin-bottom: 18px;
  font-size: 19px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field,
.line-field {
  min-width: 0;
  display: grid;
  gap: 7px;
}

.field.wide {
  grid-column: 1 / -1;
}

.field span,
.line-field span,
.line-amount span {
  color: #59616c;
  font-size: 13px;
}

.field input,
.field select,
.field textarea,
.line-field input,
.line-field select {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #d5dbe0;
  border-radius: 0;
  background: #fbfbfb;
  color: #11161d;
  padding: 11px 12px;
  font: inherit;
}

.field input,
.field select,
.line-field input,
.line-field select {
  height: 44px;
}

.field textarea {
  resize: vertical;
}

.select-control {
  position: relative;
  min-width: 0;
}

.select-control::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid #69717d;
  border-bottom: 1.5px solid #69717d;
  pointer-events: none;
  transform: translateY(-70%) rotate(45deg);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.select-control select {
  display: block;
  appearance: none;
  padding: 0 42px 0 12px;
  cursor: pointer;
}

.select-control:focus-within::after {
  border-color: #11161d;
  transform: translateY(-35%) rotate(225deg);
}

.line-field .select-control::after {
  right: 10px;
  width: 6px;
  height: 6px;
}

.line-field .select-control select {
  padding-right: 28px;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.line-field input:focus,
.line-field select:focus {
  outline: 2px solid rgba(95, 94, 65, 0.16);
  border-color: #5f5e41;
}

.line-items {
  display: grid;
  gap: 12px;
}

.line-item {
  display: grid;
  grid-template-columns: minmax(96px, 0.9fr) minmax(120px, 1.25fr) minmax(120px, 1fr) 88px 76px 98px minmax(112px, 0.95fr) 34px;
  gap: 8px;
  align-items: end;
  border: 1px solid #e1e5e8;
  padding: 12px;
}

.line-amount {
  min-width: 0;
  height: 44px;
  display: grid;
  align-content: center;
  gap: 2px;
  border-bottom: 1px solid #c9cfd4;
}

.line-amount strong {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.remove-item-button {
  width: 36px;
  height: 44px;
  border: 1px solid #d8dde1;
  background: #fff;
  color: #8b2f2f;
  font-size: 20px;
  cursor: pointer;
}

.remove-item-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.section-heading {
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-heading h3 {
  margin: 0;
}

.totals-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.55fr);
  gap: 32px;
}

.totals-inputs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.totals-list {
  margin: 0;
  display: grid;
  gap: 10px;
}

.totals-list div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #59616c;
}

.totals-list dt,
.totals-list dd {
  margin: 0;
}

.totals-list .grand-total {
  border-top: 1px solid #cdd2d6;
  padding-top: 12px;
  color: #11161d;
  font-size: 18px;
  font-weight: 600;
}

.notes-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.editor-footer {
  justify-content: space-between;
  border-bottom: 0;
}

.editor-footer p,
.status-text {
  margin: 0;
  color: #69717d;
  font-size: 14px;
}

.primary-button,
.secondary-button,
.text-button,
.quote-list-actions button {
  min-height: 40px;
  border: 0;
  padding: 0 14px;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  background: #11161d;
  color: #fff;
}

.secondary-button {
  border: 1px solid #cfd5da;
  background: #fff;
  color: #11161d;
}

.text-button {
  background: transparent;
  color: #59616c;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quote-list-panel {
  position: sticky;
  top: calc(var(--nav-height) + 20px);
  max-height: calc(100vh - var(--nav-height) - 40px);
  max-height: calc(100svh - var(--nav-height) - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e8eb;
}

.list-heading h2 {
  margin-top: 4px;
  font-size: 24px;
}

.list-heading > strong {
  font-size: 26px;
  font-weight: 500;
}

.quote-list {
  min-height: 0;
  overflow-y: auto;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.quote-list-item {
  border: 1px solid #e0e4e7;
  padding: 16px;
}

.quote-list-main,
.quote-list-total {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.quote-list-main > div {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.quote-list-main > div > span,
.quote-list-total span {
  color: #69717d;
  font-size: 12px;
}

.quote-list-main strong {
  overflow-wrap: anywhere;
  font-size: 17px;
  font-weight: 600;
}

.quote-list-main p {
  margin: 0;
  color: #69717d;
  font-size: 13px;
}

.status-badge {
  flex: 0 0 auto;
  padding: 5px 8px;
  background: #edf0f1;
  color: #4d5861;
  font-size: 12px;
}

.status-sent,
.status-accepted {
  background: #e7ece2;
  color: #485541;
}

.status-void,
.status-expired {
  background: #f0e8e6;
  color: #7c4740;
}

.quote-list-total {
  align-items: end;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #eceeef;
}

.quote-list-total strong {
  font-size: 20px;
  font-weight: 600;
}

.quote-list-actions {
  flex-wrap: wrap;
  margin-top: 14px;
}

.quote-list-actions button {
  min-height: 34px;
  background: #eef0f2;
  color: #27303a;
  padding-inline: 10px;
  font-size: 13px;
}

.quote-list-actions .danger-button {
  color: #8b2f2f;
}

.empty-state {
  margin: 0;
  padding: 42px 24px;
  color: #69717d;
}

.state-panel {
  width: min(460px, calc(100% - 36px));
  margin: 60px auto;
  padding: 32px;
}

.state-panel h1 {
  margin: 0 0 14px;
  font-size: 30px;
  font-weight: 500;
}

.state-panel p {
  color: #69717d;
}

.auth-panel {
  display: grid;
  gap: 16px;
}

@media (max-width: 1240px) {
  .quote-layout {
    grid-template-columns: 1fr;
  }

  .quote-list-panel {
    position: static;
    max-height: none;
  }

  .quote-list {
    overflow: visible;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .line-item {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .name-field,
  .description-field {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .quote-manager-page {
    padding: 26px 0 54px;
  }

  .quote-shell {
    width: calc(100% - 28px);
  }

  .manager-header,
  .header-actions,
  .editor-heading,
  .editor-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .manager-header h1 {
    font-size: 32px;
  }

  .header-actions > span {
    overflow-wrap: anywhere;
  }

  .form-grid,
  .totals-inputs,
  .totals-section,
  .notes-section,
  .quote-list {
    grid-template-columns: 1fr;
  }

  .editor-heading,
  .form-section,
  .editor-footer {
    padding: 20px;
  }

  .line-item {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .name-field,
  .description-field,
  .line-amount {
    grid-column: 1 / -1;
  }

  .remove-item-button {
    justify-self: end;
  }

  .editor-footer > div {
    justify-content: flex-end;
  }
}
</style>
