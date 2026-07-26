<template>
  <section id="contact" class="section contact">
    <div class="contact-bg"></div>
    <div class="container contact-layout">
      <div class="contact-copy">
        <span class="section-kicker">SITE VISIT</span>
        <h2>把项目聊清楚，再决定风格该往哪边走。</h2>
        <p>如果你手上已经有现场照片、平面图或预算范围，发给我们，判断会更快。</p>
        <a class="dh-action dh-action--light contact-cta" href="mailto:info@luxedesign.com">
          <span class="dh-action__label">预约现场沟通</span>
          <span class="dh-action__mark">↗</span>
        </a>
      </div>

      <address class="contact-info">
        <div>
          <span>工作室</span>
          <strong>上饶市信州区洋码头B座13A1307</strong>
        </div>
        <div>
          <span>电话</span>
          <strong>400-888-9999</strong>
        </div>
        <div>
          <span>邮箱</span>
          <strong>info@luxedesign.com</strong>
        </div>
        <div>
          <span>时间</span>
          <strong>周一至周五 9:00 - 18:00</strong>
        </div>
      </address>
    </div>
  </section>
</template>

<style scoped lang="scss">
@import '@/assets/animations.scss';

.container {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.section {
  padding: 108px 0 114px;
  position: relative;
}

.contact {
  background: var(--color-rust);
  overflow: hidden;
}

.contact-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 0%, rgba(169, 130, 71, 0.1), transparent 40%),
    radial-gradient(circle at 80% 100%, rgba(235, 110, 70, 0.08), transparent 40%);
  pointer-events: none;
  animation: gradientShift 8s ease-in-out infinite;
}

.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(420px, 0.78fr);
  gap: 72px;
  align-items: start;
  padding: 42px 0 0 42px;
  border-top: 1px solid rgba(255, 255, 255, 0.42);
  position: relative;
  z-index: 1;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 18px;
  color: var(--color-brass);
  font-size: 12px;
  letter-spacing: 3.4px;
  animation: slideInLeft 0.8s ease-out;
}

.contact-copy h2 {
  max-width: 760px;
  margin: 0;
  color: var(--color-porcelain);
  font-size: clamp(34px, 5vw, 66px);
  font-weight: 500;
  line-height: 1.08;
  animation: fadeInUp 0.8s ease-out 0.1s both;
  text-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
}

.contact-copy p {
  max-width: 520px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  line-height: 1.8;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.contact-cta {
  margin-top: 30px;
  animation: fadeInUp 0.8s ease-out 0.3s both;

  &:hover {
    animation: buttonPulse 0.6s ease-out;
  }
}

.contact-info {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  font-style: normal;
  border-top: 1px solid var(--color-line);
  background: rgba(248, 247, 242, 0.9);
  padding: 0 28px;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.8s ease-out 0.15s both;
  backdrop-filter: blur(10px);
}

.contact-info div {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--color-line);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-brass), transparent);
    transition: width 0.4s ease;
  }

  &:hover {
    background: rgba(93, 101, 73, 0.04);

    &::before {
      width: 60px;
    }
  }

  &:last-child {
    border-bottom: 0;
  }
}

.contact-info span {
  color: var(--color-muted);
  font-size: 14px;
  animation: slideInLeft 0.6s ease-out 0.2s both;
}

.contact-info strong {
  color: var(--color-ink);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.55;
  animation: slideInLeft 0.6s ease-out 0.25s both;
}

@media (max-width: 980px) {
  .contact-layout {
    grid-template-columns: 1fr;
    gap: 42px;
    padding-left: 0;
  }
}

@media (max-width: 760px) {
  .container {
    width: calc(100% - 36px);
  }

  .section {
    padding: 74px 0 80px;
  }

  .contact-copy h2 {
    font-size: 34px;
  }

  .contact-info div {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
