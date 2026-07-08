<template>
  <section id="about" class="section about">
    <div class="section-title">
      <h2>关于我们</h2>
      <span class="title-line"></span>
    </div>

    <div class="container about-grid">
      <img :src="aboutImage" alt="关于我们" class="about-image" loading="lazy" decoding="async" />
      <div class="about-copy">
        <h3>打造理想空间，传递生活美学</h3>
        <p>
          LUXE DESIGN 成立于2010年，是一家专注于高端室内设计的专业机构。我们拥有一支由资深设计师组成的团队，致力于为客户提供从概念设计到落地执行的全流程服务。
        </p>
        <p>
          多年来，我们始终坚持“设计创造价值”的理念，将功能性与艺术性完美融合，为每一位客户量身定制专属的空间解决方案。我们的作品涵盖商业空间、办公空间、居住空间等多个领域，在业内享有良好的声誉。
        </p>
        <p>
          我们相信，好的设计不仅能够提升空间的使用价值，更能够传递生活的美好与温度。未来，我们将继续秉持专业、创新的态度，为更多客户创造独具魅力的空间作品。
        </p>
        <div class="about-actions">
          <button class="ghost-btn" @click="$emit('view-more')">查看更多案例</button>
        </div>
      </div>
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
.container {
  max-width: 1344px;
  margin: 0 auto;
}

.section {
  padding: 80px 48px;
}

.section-title {
  text-align: center;
  margin-bottom: 64px;
}

.section-title h2 {
  margin: 0;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
}

.title-line {
  display: inline-block;
  width: 81px;
  height: 4px;
  margin-top: 12px;
  background: var(--border);
}

.about-grid {
  display: grid;
  grid-template-columns: 672px 624px;
  gap: 48px;
  align-items: center;
}

.about-image {
  width: 672px;
  height: 500px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.about-copy h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.about-copy p {
  margin: 20px 0 0;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
}

.about-actions {
  margin-top: 32px;
  display: flex;
  gap: 16px;
}

.ghost-btn {
  height: 46px;
  border-radius: var(--radius-sm);
  padding: 0 24px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: #fff;
  color: #333;
}

@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }

  .about-image {
    width: 100%;
  }
}

@media (max-width: 860px) {
  .section {
    padding: 56px 20px;
  }

  .section-title {
    margin-bottom: 40px;
  }

  .section-title h2 {
    font-size: 30px;
  }
}
</style>
