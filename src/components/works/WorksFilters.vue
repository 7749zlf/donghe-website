<template>
  <header class="works-header">
    <div class="works-title">
      <span>PROJECT INDEX</span>
      <h1>项目索引</h1>
      <p>按空间类型、设计风格、名称和年份查找项目，再进入完整画册阅读。</p>
    </div>

    <label class="works-search">
      <span>查找</span>
      <input
        :value="searchQuery"
        type="search"
        placeholder="输入名称、空间、风格或年份"
        aria-label="搜索作品"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
    </label>

    <div class="filter-groups">
      <label class="filter-select">
        <span>空间</span>
        <select :value="activeCategory" @change="$emit('category-change', $event.target.value)">
          <option v-for="option in spaceOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label v-if="styleOptions.length > 1" class="filter-select">
        <span>风格</span>
        <select :value="activeStyle" @change="$emit('style-change', $event.target.value)">
          <option v-for="option in styleOptions" :key="option.value || 'all-styles'" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
  </header>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  activeCategory: { type: String, default: '' },
  activeStyle: { type: String, default: '' },
  spaceOptions: { type: Array, default: () => [] },
  styleOptions: { type: Array, default: () => [] }
})

defineEmits(['update:searchQuery', 'category-change', 'style-change'])
</script>
