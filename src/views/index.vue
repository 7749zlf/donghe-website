<template>
  <div class="page">
    <HomeHeroSection
      :slides="heroSlides"
      :current-slide-index="currentSlideIndex"
      @prev="prevSlide"
      @next="nextSlide"
      @set-slide="setSlide"
      @view-more="goWorksGallery"
    />

    <HomeAboutSection :about-image="aboutImage" @view-more="goWorksGallery" />

    <HomeMaterialsSection />

    <HomeWorksSection
      :space-options="workSpaceOptions"
      :style-options="workStyleOptions"
      :active-space="activeSpace"
      :active-style="activeStyle"
      :projects="filteredProjects"
      @change-space="setHomeSpace"
      @change-style="setHomeStyle"
      @view-detail="viewMoreCases"
      @view-more="goWorksGallery"
    />

    <HomeAwardsSection :awards="displayAwards" />

    <HomeContactSection />

    <!-- <HomeSiteFooter /> -->
  </div>
</template>

<script>
export default {
  name: 'HomePageView'
}
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { aboutImage, getDisplayAwards, getDisplayDesignCases, getDisplayProjects, setCloudAwards, setCloudCases, tags } from '@/mock/data'
import HomeAboutSection from '@/components/home/HomeAboutSection.vue'
import HomeAwardsSection from '@/components/home/HomeAwardsSection.vue'
import HomeContactSection from '@/components/home/HomeContactSection.vue'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import HomeMaterialsSection from '@/components/home/HomeMaterialsSection.vue'
// import HomeSiteFooter from '@/components/home/HomeSiteFooter.vue'
import HomeWorksSection from '@/components/home/HomeWorksSection.vue'
import { fetchCloudAwards, fetchCloudCases, isCloudCasesEnabled } from '@/services/cloudCases'

const router = useRouter()
const cloudEnabled = isCloudCasesEnabled()

const displayDesignCases = ref(cloudEnabled ? [] : getDisplayDesignCases())
const displayProjects = ref(cloudEnabled ? [] : getDisplayProjects())
const displayAwards = ref(cloudEnabled ? [] : getDisplayAwards())
const heroSlides = computed(() => displayDesignCases.value.slice(0, 3))
const currentSlideIndex = ref(0)
const activeSpace = ref(tags[0])
const activeStyle = ref('')
const workSpaceOptions = [
  { label: '全部空间', value: tags[0] },
  { label: '商业空间', value: tags[1] },
  { label: '办公空间', value: tags[2] },
  { label: '居住空间', value: tags[3] }
]
const workStyleOptions = computed(() => {
  const styles = new Set()

  displayProjects.value.forEach((item) => {
    if (item.style) {
      styles.add(item.style)
    }
  })

  return [
    { label: '全部风格', value: '' },
    ...[...styles].map((style) => ({ label: style, value: style }))
  ]
})

let autoTimer = null

const currentSlide = computed(() => heroSlides.value[currentSlideIndex.value] || null)

const representativeProjects = computed(() => {
  return workSpaceOptions
    .slice(1)
    .map((option) => displayProjects.value.find((item) => item.category === option.value))
    .filter(Boolean)
})

const filteredProjects = computed(() => {
  if (activeSpace.value === tags[0] && !activeStyle.value) {
    return representativeProjects.value
  }

  return displayProjects.value
    .filter((item) => activeSpace.value === tags[0] || item.category === activeSpace.value)
    .filter((item) => !activeStyle.value || item.style === activeStyle.value)
    .slice(0, 3)
})

/**
 * 循环切换到下一张首页主视觉，并重新计算自动播放时间。
 * @returns {void}
 */
function nextSlide() {
  if (!heroSlides.value.length) return
  currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.value.length
  restartAutoSlide()
}

/**
 * 循环切换到上一张首页主视觉，并重新计算自动播放时间。
 * @returns {void}
 */
function prevSlide() {
  if (!heroSlides.value.length) return
  currentSlideIndex.value = (currentSlideIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length
  restartAutoSlide()
}

/**
 * 切换到指定首页主视觉并重新计算自动播放时间。
 * @param {number} index 目标轮播索引。
 * @returns {void}
 */
function setSlide(index) {
  currentSlideIndex.value = index
  restartAutoSlide()
}

/**
 * 在存在主视觉数据时启动五秒间隔的自动轮播。
 * @returns {void}
 */
function startAutoSlide() {
  if (!heroSlides.value.length) return
  autoTimer = setInterval(() => {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.value.length
  }, 5000)
}

/**
 * 停止并清空首页自动轮播计时器。
 * @returns {void}
 */
function stopAutoSlide() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

/**
 * 重置首页自动轮播计时周期。
 * @returns {void}
 */
function restartAutoSlide() {
  stopAutoSlide()
  startAutoSlide()
}

/**
 * 进入指定项目详情，未传 id 时使用当前主视觉项目。
 * @param {string|number|undefined} id 项目唯一标识。
 * @returns {void}
 */
function viewMoreCases(id = currentSlide.value?.id) {
  if (!id) return
  router.push({ name: 'designDetail', params: { id } })
}

/**
 * 更新首页项目的空间筛选条件。
 * @param {string} space 空间筛选值。
 * @returns {void}
 */
function setHomeSpace(space) {
  activeSpace.value = space || tags[0]
}

/**
 * 更新首页项目的风格筛选条件。
 * @param {string} style 风格筛选值。
 * @returns {void}
 */
function setHomeStyle(style) {
  activeStyle.value = style || ''
}

/**
 * 进入项目索引，并通过 URL 传递首页当前的有效筛选条件。
 * @returns {void}
 */
function goWorksGallery() {
  const query = {}
  if (activeSpace.value !== tags[0]) {
    query.category = activeSpace.value
  }
  if (activeStyle.value) {
    query.style = activeStyle.value
  }
  router.push({ name: 'worksGallery', query })
}

/**
 * 内容更新后刷新首页项目、主视觉和荣誉数据。
 * @returns {void}
 */
function refreshCustomCases() {
  displayDesignCases.value = getDisplayDesignCases()
  displayProjects.value = getDisplayProjects()
  displayAwards.value = getDisplayAwards()
  if (currentSlideIndex.value >= heroSlides.value.length) {
    currentSlideIndex.value = 0
  }
}

/**
 * 分别加载云端项目与荣誉，并在请求结束后刷新首页展示数据。
 * @returns {Promise<void>}
 */
async function refreshCloudContent() {
  if (!cloudEnabled) {
    return
  }

  try {
    setCloudCases(await fetchCloudCases())
  } catch (error) {
    console.warn('Failed to load cases:', error)
    setCloudCases([])
  }

  try {
    setCloudAwards(await fetchCloudAwards())
  } catch (error) {
    console.warn('Failed to load awards:', error)
  }

  refreshCustomCases()
}

onMounted(() => {
  window.addEventListener('donghe-custom-cases-updated', refreshCustomCases)
  if (cloudEnabled) {
    refreshCloudContent().finally(startAutoSlide)
  } else {
    startAutoSlide()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('donghe-custom-cases-updated', refreshCustomCases)
  stopAutoSlide()
})
</script>

<style lang="scss">
:root {
  --text-primary: var(--color-ink);
  --text-secondary: var(--color-ink-soft);
  --text-muted: var(--color-muted);
  --border: var(--color-line);
  --border-light: rgba(42, 39, 31, 0.08);
  --bg-light: var(--color-warm);
  --bg-footer: var(--color-ink);
  --radius-lg: 8px;
  --radius-sm: 4px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-primary);
  background: var(--color-paper);
}
</style>
