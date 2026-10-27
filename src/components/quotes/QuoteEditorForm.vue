<template>
  <form class="quote-editor" @submit.prevent="$emit('submit')">
    <div class="editor-heading">
      <div>
        <span>{{ editingQuoteId ? 'EDITING QUOTE' : 'NEW QUOTE' }}</span>
        <h2>{{ editor.quoteNo }}</h2>
      </div>
      <span class="mode-badge">{{ cloudEnabled ? '云端数据库' : '本地浏览器' }}</span>
    </div>

    <section class="form-section">
      <h3>客户与项目</h3>
      <div class="form-grid dh-form-grid">
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
        <button class="secondary-button" type="button" @click="$emit('add-item')">添加项目</button>
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
            @click="$emit('remove-item', index)"
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
        <button v-if="editingQuoteId" class="secondary-button" type="button" @click="$emit('preview')">预览</button>
        <button class="primary-button" type="submit" :disabled="saving">
          {{ saving ? '保存中' : '保存报价单' }}
        </button>
      </div>
    </footer>
  </form>
</template>

<script setup>
/* eslint vue/no-mutating-props: "off" */
defineProps({
  editor: { type: Object, required: true },
  editingQuoteId: { type: String, default: '' },
  cloudEnabled: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  statusText: { type: String, default: '' },
  totals: { type: Object, required: true },
  categoryOptions: { type: Array, default: () => [] },
  styleOptions: { type: Array, default: () => [] },
  quoteStatusOptions: { type: Array, default: () => [] },
  quoteSectionOptions: { type: Array, default: () => [] },
  quoteUnitOptions: { type: Array, default: () => [] },
  itemAmount: { type: Function, required: true },
  formatCurrency: { type: Function, required: true }
})

defineEmits(['submit', 'add-item', 'remove-item', 'preview'])
</script>

<style scoped lang="scss">
.quote-editor { min-width: 0; background: #fff; border: 1px solid #dfe3e7; }
.editor-heading,
.form-section,
.editor-footer { padding: 24px 28px; border-bottom: 1px solid #e8ebee; }
.editor-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.editor-heading > div > span { color: #69717d; font-size: 12px; letter-spacing: 2.4px; }
.editor-heading h2,
.form-section h3 { margin: 0; font-weight: 500; }
.editor-heading h2 { margin-top: 5px; font-size: 24px; }
.mode-badge { padding: 7px 10px; background: #eef2f2; color: #59625d; font-size: 13px; }
.form-section h3 { margin-bottom: 18px; font-size: 19px; }
.field,
.line-field { min-width: 0; display: grid; gap: 7px; }
.field.wide { grid-column: 1 / -1; }
.field span,
.line-field span,
.line-amount span { color: #59616c; font-size: 13px; }
.field input,
.field select,
.field textarea,
.line-field input,
.line-field select {
  box-sizing: border-box; width: 100%; border: 1px solid #d5dbe0; border-radius: 0;
  background: #fbfbfb; color: #11161d; padding: 11px 12px; font: inherit;
}
.field input,
.field select,
.line-field input,
.line-field select { height: 44px; }
.field textarea { resize: vertical; }
.select-control { position: relative; min-width: 0; }
.select-control::after {
  content: ''; position: absolute; top: 50%; right: 16px; width: 7px; height: 7px;
  border-right: 1.5px solid #69717d; border-bottom: 1.5px solid #69717d;
  pointer-events: none; transform: translateY(-70%) rotate(45deg);
}
.select-control select { display: block; padding: 0 42px 0 12px; appearance: none; cursor: pointer; }
.line-field .select-control::after { right: 10px; width: 6px; height: 6px; }
.line-field .select-control select { padding-right: 28px; }
.field input:focus,
.field select:focus,
.field textarea:focus,
.line-field input:focus,
.line-field select:focus { outline: 2px solid rgba(95, 94, 65, 0.16); border-color: #5f5e41; }
.line-items { display: grid; gap: 12px; }
.line-item {
  display: grid;
  grid-template-columns: minmax(96px, 0.9fr) minmax(120px, 1.25fr) minmax(120px, 1fr) 88px 76px 98px minmax(112px, 0.95fr) 34px;
  gap: 8px; align-items: end; border: 1px solid #e1e5e8; padding: 12px;
}
.line-amount {
  min-width: 0; height: 44px; display: grid; align-content: center; gap: 2px; border-bottom: 1px solid #c9cfd4;
}
.line-amount strong { overflow: hidden; text-overflow: ellipsis; font-size: 14px; font-weight: 600; white-space: nowrap; }
.remove-item-button {
  width: 36px; height: 44px; border: 1px solid #d8dde1; background: #fff; color: #8b2f2f;
  font-size: 20px; cursor: pointer;
}
.remove-item-button:disabled { opacity: 0.3; cursor: not-allowed; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
.section-heading h3 { margin: 0; }
.totals-section { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.55fr); gap: 32px; }
.totals-inputs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.totals-list { margin: 0; display: grid; gap: 10px; }
.totals-list div { display: flex; justify-content: space-between; gap: 20px; color: #59616c; }
.totals-list dt,
.totals-list dd { margin: 0; }
.totals-list .grand-total { border-top: 1px solid #cdd2d6; padding-top: 12px; color: #11161d; font-size: 18px; font-weight: 600; }
.notes-section { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.editor-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 0; }
.editor-footer > div { display: flex; align-items: center; gap: 10px; }
.editor-footer p { margin: 0; color: #69717d; font-size: 14px; }
.primary-button,
.secondary-button { min-height: 40px; border: 0; padding: 0 14px; font: inherit; cursor: pointer; }
.primary-button { background: #11161d; color: #fff; }
.secondary-button { border: 1px solid #cfd5da; background: #fff; color: #11161d; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1240px) {
  .line-item { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .name-field,
  .description-field { grid-column: span 2; }
}
@media (max-width: 760px) {
  .editor-heading,
  .editor-footer { align-items: stretch; flex-direction: column; }
  .form-grid,
  .totals-inputs,
  .totals-section,
  .notes-section { grid-template-columns: 1fr; }
  .editor-heading,
  .form-section,
  .editor-footer { padding: 20px; }
  .line-item { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .name-field,
  .description-field,
  .line-amount { grid-column: 1 / -1; }
  .remove-item-button { justify-self: end; }
  .editor-footer > div { justify-content: flex-end; }
}
</style>
