<template>
  <section class="section awards">
    <div class="section-title">
      <h2>奖项荣誉</h2>
      <span class="title-line"></span>
    </div>

    <div class="container award-list">
      <article v-for="item in awards" :key="item.title" class="award-card">
        <div class="award-icon">奖</div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.desc }}</p>
        <span>{{ item.year }}</span>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  awards: {
    type: Array,
    default: () => []
  }
})
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

.awards {
  background: var(--bg-light);
}

.award-list {
  display: grid;
  grid-template-columns: repeat(4, 300px);
  gap: 32px;
}

.award-card {
  min-height: 220px;
  padding: 32px 24px;
  border-radius: var(--radius-lg);
  background: #fff;
  text-align: center;
}

.award-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 20px;
  font-weight: 600;
}

.award-card h4 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
}

.award-card p {
  margin: 8px 0 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.award-card span {
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }

  .award-list {
    grid-template-columns: 1fr;
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
