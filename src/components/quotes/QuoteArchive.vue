<template>
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
          <button type="button" @click="$emit('edit', quote)">编辑</button>
          <button type="button" @click="$emit('view', quote)">查看</button>
          <button type="button" @click="$emit('copy-link', quote)">复制链接</button>
          <button class="danger-button" type="button" @click="$emit('remove', quote)">删除</button>
        </div>
      </article>
    </div>
    <p v-else class="empty-state">还没有报价单。</p>
  </aside>
</template>

<script setup>
defineProps({
  quotes: { type: Array, default: () => [] },
  calculateQuoteTotals: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
  quoteStatusLabel: { type: Function, required: true }
})

defineEmits(['edit', 'view', 'copy-link', 'remove'])
</script>

<style scoped lang="scss">
.quote-list-panel {
  position: sticky;
  top: calc(var(--nav-height) + 20px);
  max-height: calc(100vh - var(--nav-height) - 40px);
  max-height: calc(100svh - var(--nav-height) - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe3e7;
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e8eb;
}

.list-heading span { color: #69717d; font-size: 12px; letter-spacing: 2.4px; }
.list-heading h2 { margin: 4px 0 0; font-size: 24px; font-weight: 500; }
.list-heading > strong { font-size: 26px; font-weight: 500; }
.quote-list { min-height: 0; overflow-y: auto; padding: 14px; display: grid; gap: 12px; }
.quote-list-item { border: 1px solid #e0e4e7; padding: 16px; }
.quote-list-main,
.quote-list-total { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.quote-list-main > div { min-width: 0; display: grid; gap: 4px; }
.quote-list-main > div > span,
.quote-list-total span { color: #69717d; font-size: 12px; }
.quote-list-main strong { overflow-wrap: anywhere; font-size: 17px; font-weight: 600; }
.quote-list-main p { margin: 0; color: #69717d; font-size: 13px; }
.status-badge { flex: 0 0 auto; padding: 5px 8px; background: #edf0f1; color: #4d5861; font-size: 12px; }
.status-sent,
.status-accepted { background: #e7ece2; color: #485541; }
.status-void,
.status-expired { background: #f0e8e6; color: #7c4740; }
.quote-list-total { align-items: end; margin-top: 16px; padding-top: 14px; border-top: 1px solid #eceeef; }
.quote-list-total strong { font-size: 20px; font-weight: 600; }
.quote-list-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; }
.quote-list-actions button {
  min-height: 34px; border: 0; background: #eef0f2; color: #27303a;
  padding: 0 10px; font: inherit; font-size: 13px; cursor: pointer;
}
.quote-list-actions .danger-button { color: #8b2f2f; }
.empty-state { margin: 0; padding: 42px 24px; color: #69717d; }

@media (max-width: 1240px) {
  .quote-list-panel { position: static; max-height: none; }
  .quote-list { overflow: visible; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .quote-list { grid-template-columns: 1fr; }
}
</style>
