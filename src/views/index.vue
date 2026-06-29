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

    <HomeAwardsSection :awards="awards" />

    <HomeWorksSection
      :tags="tags"
      :active-tag="activeTag"
      :projects="filteredProjects"
      @change-tag="handleTagChange"
      @view-detail="viewMoreCases"
      @view-more="goWorksGallery"
    />

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
import { aboutImage, awards, getDisplayDesignCases, getDisplayProjects, tags } from '@/mock/data'
import HomeAboutSection from '@/components/home/HomeAboutSection.vue'
import HomeAwardsSection from '@/components/home/HomeAwardsSection.vue'
import HomeContactSection from '@/components/home/HomeContactSection.vue'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
// import HomeSiteFooter from '@/components/home/HomeSiteFooter.vue'
import HomeWorksSection from '@/components/home/HomeWorksSection.vue'

const router = useRouter()

const displayDesignCases = ref(getDisplayDesignCases())
const displayProjects = ref(getDisplayProjects())
const heroSlides = computed(() => displayDesignCases.value.slice(0, 3))
const currentSlideIndex = ref(0)
const activeTag = ref('全部')

let autoTimer = null

const currentSlide = computed(() => heroSlides.value[currentSlideIndex.value] || null)

const filteredProjects = computed(() => {
  if (activeTag.value === '全部') {
    return displayProjects.value
  }
  return displayProjects.value.filter((item) => item.category === activeTag.value)
})

function nextSlide() {
  if (!heroSlides.value.length) return
  currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.value.length
  restartAutoSlide()
}

function prevSlide() {
  if (!heroSlides.value.length) return
  currentSlideIndex.value = (currentSlideIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length
  restartAutoSlide()
}

function setSlide(index) {
  currentSlideIndex.value = index
  restartAutoSlide()
}

function handleTagChange(tag) {
  activeTag.value = tag
}

function startAutoSlide() {
  if (!heroSlides.value.length) return
  autoTimer = setInterval(() => {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.value.length
  }, 5000)
}

function stopAutoSlide() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

function restartAutoSlide() {
  stopAutoSlide()
  startAutoSlide()
}

function viewMoreCases(id = currentSlide.value?.id) {
  if (!id) return
  router.push({ name: 'designDetail', params: { id } })
}

function goWorksGallery() {
  router.push({ name: 'worksGallery' })
}

function refreshCustomCases() {
  displayDesignCases.value = getDisplayDesignCases()
  displayProjects.value = getDisplayProjects()
  if (currentSlideIndex.value >= heroSlides.value.length) {
    currentSlideIndex.value = 0
  }
}

onMounted(() => {
  window.addEventListener('donghe-custom-cases-updated', refreshCustomCases)
  startAutoSlide()
})

onBeforeUnmount(() => {
  window.removeEventListener('donghe-custom-cases-updated', refreshCustomCases)
  stopAutoSlide()
})
</script>

<style lang="scss">
:root {
  --text-primary: #1a1a1a;
  --text-secondary: #666;
  --text-muted: #999;
  --border: #d1d5db;
  --border-light: #f3f4f6;
  --bg-light: #f9fafb;
  --bg-footer: #181a1d;
  --radius-lg: 12px;
  --radius-sm: 8px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-primary);
  background: #fff;
}
</style>
