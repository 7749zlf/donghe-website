<template>
  <section id="contact" class="section contact">
    <div class="section-title">
      <h2>联系我们</h2>
      <span class="title-line"></span>
    </div>

    <div class="container contact-grid">
      <div class="contact-info">
        <h3>让我们一起打造理想空间</h3>
        <p>
          无论您是有商业项目需求，还是想要打造梦想中的家，我们都将为您提供专业的设计服务。欢迎随时联系我们，让我们一起开启您的空间设计之旅。
        </p>
        <ul>
          <li><strong>公司地址：</strong>上饶市信州区洋码头B座13A1307</li>
          <li><strong>联系电话：</strong>400-888-9999</li>
          <li><strong>电子邮箱：</strong>info@luxedesign.com</li>
          <li><strong>工作时间：</strong>周一至周五 9:00 - 18:00</li>
        </ul>
      </div>
    </div>
  </section>
</template>

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

.contact {
  background: #f9fafb;
}

.contact-grid {
  display: grid;
  grid-template-columns: 647px 650px;
  gap: 48px;
}

.contact-info h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.contact-info p {
  margin: 24px 0 40px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.contact-info ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 24px;
}

@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }

  .contact-grid {
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
