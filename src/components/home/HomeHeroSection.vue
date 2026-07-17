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
        <img
          :src="slide.list?.[0] || ''"
          :alt="slide.name || '空间作品'"
          class="hero-image"
          :loading="index === trackIndex ? 'eager' : 'lazy'"
          decoding="async"
          :fetchpriority="index === trackIndex ? 'high' : 'auto'"
        />
      </div>
    </div>

    <div class="hero-shade"></div>

    <div class="hero-content">
      <Transition name="hero-copy" mode="out-in">
        <div :key="currentSlide.id || currentSlideIndex" class="hero-copy">
          <span class="eyebrow">DONGHE INTERIOR STUDIO</span>
          <h1>东禾空间设计</h1>
          <p>以结构、材质与光影，建立可被日常使用的空间秩序。</p>
          <div class="hero-actions">
            <button class="primary-btn" @click="$emit('view-more')">查看作品</button>
            <span v-if="currentSlide.name" class="project-note">
              {{ currentSlide.name }} / {{ currentSlide.type || '空间设计' }} / {{ currentSlide.year || '近年' }}
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <aside class="hero-atelier" aria-label="设计语言">
      <span>01 / LIGHT</span>
      <span>02 / MATERIAL</span>
      <span>03 / ORDER</span>
    </aside>

    <div class="hero-controls">
      <button class="hero-arrow" aria-label="上一张" @click="$emit('prev')">
        <span class="arrow-icon">‹</span>
      </button>
      <div class="indicators" role="tablist" aria-label="轮播图">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          :class="['dot-btn', { active: index === currentSlideIndex }]"
          :aria-label="`切换到第 ${index + 1} 张`"
          @click="$emit('set-slide', index)"
        ></button>
      </div>
      <button class="hero-arrow" aria-label="下一张" @click="$emit('next')">
        <span class="arrow-icon">›</span>
      </button>
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
  min-height: 560px;
  height: calc(100svh - var(--nav-height) - 34px);
  max-height: 780px;
  overflow: hidden;
  background: #1a1a16;
}

.hero-track {
  height: 100%;
  display: flex;
  transition: transform 1.05s var(--ease-smooth);
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
  transform: scale(1.02);
  filter: saturate(0.88) contrast(1.02);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(14, 13, 10, 0.78) 0%, rgba(14, 13, 10, 0.36) 48%, rgba(14, 13, 10, 0.2) 100%),
    linear-gradient(0deg, rgba(14, 13, 10, 0.62) 0%, transparent 42%);
}

.hero-content {
  position: absolute;
  inset: 0;
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.hero-atelier {
  position: absolute;
  top: 34px;
  right: clamp(28px, 5vw, 74px);
  display: grid;
  grid-template-columns: repeat(3, 78px);
  align-items: end;
  gap: 1px;
  color: rgba(255, 255, 255, 0.78);
}

.hero-atelier span {
  min-height: 128px;
  display: flex;
  align-items: flex-end;
  padding: 12px 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(18, 18, 14, 0.2);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  letter-spacing: 1.8px;
  backdrop-filter: blur(8px);
}

.hero-atelier span:nth-child(2) {
  min-height: 168px;
  background: rgba(93, 101, 73, 0.28);
}

.hero-atelier span:nth-child(3) {
  min-height: 108px;
  background: rgba(154, 95, 71, 0.26);
}

.hero-copy {
  max-width: 720px;
  color: #fff;
  will-change: opacity, transform, filter;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.74);
  font-size: 12px;
  letter-spacing: 4px;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(52px, 7vw, 92px);
  font-weight: 500;
  line-height: 0.98;
}

.hero-copy p {
  max-width: 560px;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.6;
}

.hero-actions {
  margin-top: 34px;
  display: flex;
  align-items: center;
  gap: 20px;
  pointer-events: auto;
}

.primary-btn {
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  background: rgba(255, 255, 255, 0.92);
  color: #171714;
  padding: 0 24px;
  cursor: pointer;
  transition: background 0.28s ease, transform 0.28s ease;
}

.primary-btn:hover {
  background: #fff;
  transform: translateY(-2px);
}

.project-note {
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 1.5;
}

.hero-controls {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-arrow {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(16, 15, 12, 0.28);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.24s ease, border-color 0.24s ease;
}

.hero-arrow:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.72);
}

.arrow-icon {
  display: block;
  width: 1em;
  height: 1em;
  font-size: 30px;
  line-height: 0.82;
  text-align: center;
}

.indicators {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot-btn {
  width: 34px;
  height: 2px;
  border: none;
  background: rgba(255, 255, 255, 0.35);
  padding: 0;
  cursor: pointer;
  transition: background 0.24s ease, width 0.24s ease;
}

.dot-btn.active {
  width: 52px;
  background: #fff;
}

.hero-copy-enter-active,
.hero-copy-leave-active {
  transition:
    opacity 0.7s ease,
    transform 0.7s var(--ease-smooth),
    filter 0.7s ease;
}

.hero-copy-enter-from,
.hero-copy-leave-to {
  opacity: 0;
  transform: translateY(18px);
  filter: blur(6px);
}

.hero-copy-enter-to,
.hero-copy-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

@media (max-width: 860px) {
  .hero {
    min-height: 560px;
    height: calc(100svh - var(--nav-height) - 24px);
  }

  .hero-content {
    width: calc(100% - 36px);
    align-items: flex-end;
    padding-bottom: 112px;
  }

  .hero-copy h1 {
    font-size: clamp(42px, 13vw, 62px);
  }

  .hero-copy p {
    font-size: 17px;
  }

  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .hero-atelier {
    display: none;
  }

  .hero-controls {
    width: calc(100% - 36px);
    justify-content: space-between;
    gap: 12px;
  }

  .dot-btn {
    width: 24px;
  }

  .dot-btn.active {
    width: 38px;
  }
}
</style>
