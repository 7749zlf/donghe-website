<template>
  <section id="about" class="section about">
    <div class="container about-layout">
      <div class="about-copy">
        <span class="section-kicker">ABOUT DONGHE</span>
        <h2>先校准生活方式，再讨论风格。</h2>
        <p>
          东禾专注商业、办公与居住空间的室内设计。我们先看现场条件、人的行为路径和预算边界，再把材质、灯光、收纳与施工细节放进同一个系统中优先级排序。
        </p>
        <p>
          好的空间不靠堆满元素取胜，而是让功能、尺度和情绪各自站稳。最终留下来的，是每天使用时依然舒服的秩序。
        </p>
        <div class="about-actions">
          <button class="dh-action" @click="$emit('view-more')">
            <span class="dh-action__label">看项目现场</span>
            <span class="dh-action__mark">→</span>
          </button>
        </div>
      </div>

      <figure class="about-figure">
        <img :src="aboutImage" alt="东禾空间设计工作室项目现场" class="about-image" loading="lazy" decoding="async" />
        <figcaption>
          <strong>商业 / 办公 / 居住</strong>
          <span>从方案到落地的空间设计服务</span>
        </figcaption>
      </figure>

      <dl class="about-stats">
        <div>
          <dt>10+</dt>
          <dd>多年空间经验</dd>
        </div>
        <div>
          <dt>3</dt>
          <dd>核心设计方向</dd>
        </div>
        <div>
          <dt>1:1</dt>
          <dd>重视落地还原</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
defineProps({
  aboutImage: {
    type: String,
    default: ''
  }
})

defineEmits(['view-more'])
</script>

<style scoped lang="scss">
@import '@/assets/animations.scss';

.container {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.section {
  padding: 118px 0 104px;
}

.about {
  background: var(--color-paper);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(93, 101, 73, 0.08), transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 6s ease-in-out infinite;
  }
}

.about-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 72px 64px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 18px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
  animation: slideInLeft 0.8s ease-out;
}

.about-copy h2 {
  max-width: 620px;
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(32px, 4vw, 54px);
  font-weight: 500;
  line-height: 1.12;
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.about-copy p {
  max-width: 620px;
  margin: 24px 0 0;
  color: var(--color-ink-soft);
  font-size: 16px;
  line-height: 1.9;
  animation: fadeInUp 0.8s ease-out 0.2s both;
  transition: color 0.3s ease;

  &:hover {
    color: var(--color-ink);
  }
}

.about-actions {
  margin-top: 34px;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.about-figure {
  position: relative;
  margin: 0;
  min-height: 520px;
  overflow: hidden;
  background: var(--color-stone);
  box-shadow: var(--shadow-soft);
  animation: scaleIn 0.8s ease-out 0.2s both;
  border-radius: 8px;
}

.about-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 520px;
  object-fit: cover;
  filter: saturate(0.88) contrast(1.02);
  transition: transform 1.2s var(--ease-smooth), filter 0.6s ease;
  will-change: transform, filter;
}

.about-figure:hover .about-image {
  transform: scale(1.045) rotate(0.5deg);
  filter: saturate(1) contrast(1.05);
}

.about-figure figcaption {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.48);
  color: rgba(255, 255, 255, 0.88);
  animation: fadeInUp 0.8s ease-out 0.5s both;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  padding-bottom: 8px;
  border-radius: 4px;
}

.about-figure strong,
.about-figure span {
  font-size: 14px;
  line-height: 1.5;
}

.about-stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin: -18px 0 0;
  padding: 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.about-stats div {
  padding: 28px 28px 26px;
  border-right: 1px solid var(--color-line);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(93, 101, 73, 0.05);
    transition: left 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    background: rgba(93, 101, 73, 0.04);

    &::before {
      left: 100%;
    }
  }
}

.about-stats div:last-child {
  border-right: 0;
}

.about-stats dt {
  color: var(--color-brass);
  font-size: 36px;
  font-weight: 500;
  line-height: 1;
  animation: scaleIn 0.8s ease-out 0.5s both;
}

.about-stats dd {
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: 14px;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

@media (max-width: 1020px) {
  .about-layout {
    grid-template-columns: 1fr;
    gap: 44px;
  }

  .about-figure {
    min-height: 440px;
  }

  .about-image {
    min-height: 440px;
  }
}

@media (max-width: 760px) {
  .container {
    width: calc(100% - 36px);
  }

  .section {
    padding: 72px 0 68px;
  }

  .about-copy h2 {
    font-size: 32px;
  }

  .about-figure,
  .about-image {
    min-height: 360px;
  }

  .about-figure figcaption {
    flex-direction: column;
    gap: 4px;
  }

  .about-stats {
    grid-template-columns: 1fr;
    margin-top: 0;
  }

  .about-stats div {
    border-right: 0;
    border-bottom: 1px solid var(--color-line);
  }

  .about-stats div:last-child {
    border-bottom: 0;
  }
}
</style>
