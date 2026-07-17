<template>
  <section id="contact" class="section contact">
    <div class="container contact-layout">
      <div class="contact-copy">
        <span class="section-kicker">CONTACT</span>
        <h2>从一次现场沟通开始，整理空间真正需要解决的问题。</h2>
      </div>

      <address class="contact-info">
        <div>
          <span>地址</span>
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
.container {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.section {
  padding: 108px 0 114px;
}

.contact {
  background: var(--color-paper);
}

.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(420px, 0.78fr);
  gap: 72px;
  align-items: start;
  padding-top: 42px;
  border-top: 1px solid var(--color-line);
}

.section-kicker {
  display: inline-block;
  margin-bottom: 18px;
  color: var(--color-olive);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.contact-copy h2 {
  max-width: 760px;
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(34px, 5vw, 66px);
  font-weight: 500;
  line-height: 1.08;
}

.contact-info {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  font-style: normal;
  border-top: 1px solid var(--color-line);
}

.contact-info div {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--color-line);
}

.contact-info span {
  color: var(--color-muted);
  font-size: 14px;
}

.contact-info strong {
  color: var(--color-ink);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.55;
}

@media (max-width: 980px) {
  .contact-layout {
    grid-template-columns: 1fr;
    gap: 42px;
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
