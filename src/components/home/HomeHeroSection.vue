<template>
  <section class="hero">
    <img :src="currentSlide.list?.[0] || ''" :alt="currentSlide.name || '轮播图'" class="hero-image" />
    <div class="hero-mask">
      <button class="hero-arrow" aria-label="上一张" @click="$emit('prev')">‹</button>

      <div class="hero-center">
        <h1>{{ currentSlide.name }}</h1>
        <p>专注于为您打造独具品味的空间美学</p>
        <button class="pill-btn" @click="$emit('view-more')">了解更多</button>
      </div>

      <button class="hero-arrow" aria-label="下一张" @click="$emit('next')">›</button>
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
import { computed } from 'vue'

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

const currentSlide = computed(() => props.slides[props.currentSlideIndex] || {})
</script>

<style scoped lang="scss">
.hero {
  position: relative;
  height: 700px;
  overflow: hidden;
  background: #f3f4f6;
}

.hero-image {
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
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
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

  .hero-center h1 {
    font-size: 32px;
  }

  .hero-center p {
    font-size: 16px;
  }
}
</style>
