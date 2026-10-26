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
        <QuoteEditorForm
          :editor="editor"
          :editing-quote-id="editingQuoteId"
          :cloud-enabled="cloudEnabled"
          :saving="saving"
          :status-text="statusText"
          :totals="totals"
          :category-options="categoryOptions"
          :style-options="styleOptions"
          :quote-status-options="quoteStatusOptions"
          :quote-section-options="quoteSectionOptions"
          :quote-unit-options="quoteUnitOptions"
          :item-amount="itemAmount"
          :format-currency="formatCurrency"
          @submit="handleSave"
          @add-item="addQuoteItem"
          @remove-item="removeQuoteItem"
          @preview="openQuote(editor)"
        />

        <QuoteArchive
          :quotes="quotes"
          :calculate-quote-totals="calculateQuoteTotals"
          :format-currency="formatCurrency"
          :quote-status-label="quoteStatusLabel"
          @edit="editQuote"
          @view="openQuote"
          @copy-link="copyQuoteLink"
          @remove="removeQuote"
        />
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import QuoteArchive from '@/components/quotes/QuoteArchive.vue'
import QuoteEditorForm from '@/components/quotes/QuoteEditorForm.vue'
import { getManagerAccessState, isCloudCasesEnabled, onManagerAccessChange, signInManager, signOutManager } from '@/services/cloudCases'
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
 * 应用经过权限复核的认证事件，并在账号切换后刷新报价列表。
 * @param {Object} accessState 统一后台访问状态。
 * @returns {Promise<void>}
 */
async function handleManagerAccessChange(accessState) {
  const previousUserId = managerSession.value?.user?.id || ''
  managerSession.value = accessState.session
  managerIsAdmin.value = accessState.isAdmin

  if (accessState.error) {
    statusText.value = `权限检查失败：${accessState.error.message}`
    return
  }

  if (!accessState.session) {
    quotes.value = []
    statusText.value = '请输入管理员账号。'
    return
  }

  if (!accessState.isAdmin) {
    quotes.value = []
    statusText.value = '当前账号没有管理权限。'
    return
  }

  if (accessState.session.user?.id === previousUserId) {
    return
  }

  await handleQuotesUpdated()
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
    const session = await signInManager(loginForm.email, loginForm.password)
    const accessState = await getManagerAccessState(session)
    managerSession.value = accessState.session
    managerIsAdmin.value = accessState.isAdmin
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
    const accessState = await getManagerAccessState()
    managerSession.value = accessState.session
    managerIsAdmin.value = accessState.isAdmin
    stopAuthListener = onManagerAccessChange(handleManagerAccessChange)

    if (managerSession.value) {
      if (managerIsAdmin.value) {
        await loadQuotes()
      }
    }
  } catch (error) {
    statusText.value = `初始化失败：${error.message}`
  } finally {
    authReady.value = true
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
.quote-shell { width: min(1440px, calc(100% - 40px)); margin: 0 auto; }
.manager-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; margin-bottom: 26px; }
.section-kicker { color: #69717d; font-size: 12px; letter-spacing: 2.4px; }
.manager-header h1 { margin: 6px 0 0; font-size: 38px; font-weight: 500; }
.manager-tabs { display: inline-flex; margin-top: 16px; padding: 5px; background: #dfe4e8; }
.manager-tabs button { min-height: 38px; border: 0; background: transparent; color: #46515f; padding: 0 16px; cursor: pointer; }
.manager-tabs button.active { background: #11161d; color: #fff; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.header-actions > span { color: #69717d; font-size: 14px; }
.quote-layout { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.55fr); gap: 24px; align-items: start; }
.state-panel { width: min(460px, calc(100% - 36px)); margin: 60px auto; padding: 32px; background: #fff; border: 1px solid #dfe3e7; }
.state-panel h1 { margin: 0 0 14px; font-size: 30px; font-weight: 500; }
.state-panel p { color: #69717d; }
.auth-panel { display: grid; gap: 16px; }
.auth-panel .field { min-width: 0; display: grid; gap: 7px; }
.auth-panel .field span { color: #59616c; font-size: 13px; }
.auth-panel .field input { box-sizing: border-box; width: 100%; height: 44px; border: 1px solid #d5dbe0; background: #fbfbfb; color: #11161d; padding: 11px 12px; font: inherit; }
.auth-panel .field input:focus { outline: 2px solid rgba(95, 94, 65, 0.16); border-color: #5f5e41; }
.status-text { margin: 0; color: #69717d; font-size: 14px; }
.primary-button,
.secondary-button,
.text-button { min-height: 40px; border: 0; padding: 0 14px; font: inherit; cursor: pointer; }
.primary-button { background: #11161d; color: #fff; }
.secondary-button { border: 1px solid #cfd5da; background: #fff; color: #11161d; }
.text-button { background: transparent; color: #59616c; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1240px) {
  .quote-layout { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .quote-manager-page { padding: 26px 0 54px; }
  .quote-shell { width: calc(100% - 28px); }
  .manager-header,
  .header-actions { align-items: stretch; flex-direction: column; }
  .manager-header h1 { font-size: 32px; }
  .header-actions > span { overflow-wrap: anywhere; }
}
</style>
