<template>
  <footer class="footer">
    <div class="container footer-main">
      <div>
        <h3>LUXE DESIGN</h3>
        <p>专注于高端室内设计，为您打造理想的生活与工作空间。</p>
      </div>

      <div>
        <h4>快速链接</h4>
        <ul>
          <li>关于我们</li>
          <li>服务项目</li>
          <li>设计案例</li>
          <li>联系我们</li>
        </ul>
      </div>

      <div>
        <h4>服务范围</h4>
        <ul>
          <li>商业空间设计</li>
          <li>办公空间设计</li>
          <li>居住空间设计</li>
          <li>软装设计服务</li>
          <li>全案设计服务</li>
        </ul>
      </div>
    </div>
    <p class="copyright">© 2024 LUXE DESIGN. All rights reserved.</p>
  </footer>
</template>

<style scoped lang="scss">
.container {
  max-width: 1344px;
  margin: 0 auto;
}

.footer {
  margin-top: 80px;
  padding: 48px;
  background: var(--bg-footer);
  color: #fff;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
}

.footer h3,
.footer h4 {
  margin: 0;
}

.footer p,
.footer li {
  color: #ccc;
  font-size: 14px;
  line-height: 1.7;
  flex: 1 1 120px;
  min-width: 120px;
}

.footer ul {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.footer li {
  white-space: nowrap;
}

.copyright {
  max-width: 1344px;
  margin: 32px auto 0;
  border-top: 1px solid #374151;
  padding-top: 20px;
  color: #999;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 860px) {
  .footer {
    padding: 40px 20px;
  }

  .footer-main {
    grid-template-columns: 1fr;
  }
}
</style>
