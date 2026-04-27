<template>
  <section class="hero">
    <div
      ref="trackRef"
      class="hero-track"
      :class="{ 'no-transition': !isTransitionEnabled }"
      :style="{ transform: `translateX(-${trackIndex * 100}%)` }"
      @transitionend="handleTransitionEnd"
    >
      <div v-for="(slide, index) in displaySlides" :key="`${slide.id}-${index}`" class="hero-slide">
        <img :src="slide.list?.[0] || ''" :alt="slide.name || '轮播图'" class="hero-image" />
      </div>
    </div>

    <div class="hero-mask">
      <button class="hero-arrow" aria-label="上一张" @click="$emit('prev')">
        <span class="arrow-icon">‹</span>
      </button>

      <div class="hero-center">
        <h1>{{ currentSlide.name }}</h1>
        <p>专注于为您打造独具品味的空间美学</p>
        <button class="pill-btn" @click="$emit('view-more')">了解更多</button>
      </div>

      <button class="hero-arrow" aria-label="下一张" @click="$emit('next')">
        <span class="arrow-icon">›</span>
      </button>
    </div>

    <div class="indicators" role="tablist" aria-label="轮播图">
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        :class="['dot-btn', { active: index === currentSlideIndex }]"
        :aria-label="`切换到第 ${index + 1} 张`"
        @click="$emit('set-slide', index)"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    default: () => []
  },
  currentSlideIndex: {
    type: Number,
    default: 0
  }
})

defineEmits(['prev', 'next', 'set-slide', 'view-more'])

const trackIndex = ref(1)
const trackRef = ref(null)
const isTransitionEnabled = ref(true)

const currentSlide = computed(() => props.slides[props.currentSlideIndex] || {})

const displaySlides = computed(() => {
  if (!props.slides.length) {
    return []
  }

  const firstSlide = props.slides[0]
  const lastSlide = props.slides[props.slides.length - 1]
  return [lastSlide, ...props.slides, firstSlide]
})

function jumpToRealSlide(index) {
  isTransitionEnabled.value = false
  trackIndex.value = index

  nextTick(() => {
    if (trackRef.value) {
      trackRef.value.getBoundingClientRect()
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitionEnabled.value = true
      })
    })
  })
}

function handleTransitionEnd(event) {
  if (event.target !== event.currentTarget || !props.slides.length) {
    return
  }

  if (trackIndex.value === props.slides.length + 1) {
    jumpToRealSlide(1)
  }

  if (trackIndex.value === 0) {
    jumpToRealSlide(props.slides.length)
  }
}

watch(
  () => props.currentSlideIndex,
  (newIndex, oldIndex) => {
    if (!props.slides.length) {
      trackIndex.value = 0
      return
    }

    const lastIndex = props.slides.length - 1

    if (oldIndex === lastIndex && newIndex === 0) {
      trackIndex.value = props.slides.length + 1
      return
    }

    if (oldIndex === 0 && newIndex === lastIndex) {
      trackIndex.value = 0
      return
    }

    trackIndex.value = newIndex + 1
  }
)

watch(
  () => props.slides.length,
  () => {
    jumpToRealSlide(props.slides.length ? props.currentSlideIndex + 1 : 0)
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.hero {
  position: relative;
  height: 700px;
  overflow: hidden;
  background: #f3f4f6;
}

.hero-track {
  height: 100%;
  display: flex;
  transition: transform 0.72s cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}

.hero-track.no-transition {
  transition: none;
}

.hero-slide {
  width: 100%;
  height: 100%;
  flex: 0 0 100%;
}

.hero-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-mask {
  position: absolute;
  inset: 0;
  padding: 0 32px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-center {
  text-align: center;
  color: #fff;
}

.hero-center h1 {
  margin: 0;
  font-size: 48px;
  line-height: 1.2;
}

.hero-center p {
  margin: 16px 0 32px;
  font-size: 20px;
  line-height: 1.2;
}

.hero-arrow {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.arrow-icon {
  display: block;
  width: 1em;
  height: 1em;
  font-size: 32px;
  line-height: 0.85;
  text-align: center;
}

.pill-btn {
  height: 48px;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #333;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.indicators {
  position: absolute;
  left: 50%;
  bottom: 36px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.dot-btn {
  width: 8px;
  height: 8px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  padding: 0;
  cursor: pointer;
}

.dot-btn.active {
  width: 12px;
  height: 12px;
  background: #fff;
}

@media (max-width: 860px) {
  .hero {
    height: 520px;
  }

  .hero-mask {
    padding: 0 18px;
  }

  .hero-center h1 {
    font-size: 32px;
  }

  .hero-center p {
    font-size: 16px;
  }

  .hero-arrow {
    width: 42px;
    height: 42px;
  }
}
</style>
