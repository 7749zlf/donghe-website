<template>
  <div class="page">
    <section class="hero">
      <img :src="currentSlide.image" :alt="currentSlide.alt" class="hero-image" />
      <div class="hero-mask">
        <button class="hero-arrow" aria-label="上一张" @click="prevSlide">‹</button>

        <div class="hero-center">
          <h1>{{ currentSlide.title }}</h1>
          <p>{{ currentSlide.subtitle }}</p>
          <button class="pill-btn" @click="viewMoreCases">了解更多</button>
        </div>

        <button class="hero-arrow" aria-label="下一张" @click="nextSlide">›</button>
      </div>

      <div class="indicators" role="tablist" aria-label="轮播图">
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.alt"
          :class="['dot-btn', { active: index === currentSlideIndex }]"
          :aria-label="`切换到第 ${index + 1} 张`"
          @click="setSlide(index)"
        ></button>
      </div>
    </section>

    <section id="about" class="section about">
      <div class="section-title">
        <h2>关于我们</h2>
        <span class="title-line"></span>
      </div>

      <div class="container about-grid">
        <img :src="aboutImage" alt="关于我们" class="about-image" />
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
            <button class="ghost-btn" @click="viewMoreCases">查看更多案例</button>
          </div>
        </div>
      </div>
    </section>

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

    <section id="works" class="section works">
      <div class="section-title">
        <h2>设计作品</h2>
        <span class="title-line"></span>
      </div>

      <div class="container work-tags">
        <button
          v-for="tag in tags"
          :key="tag"
          :class="['tag', { active: tag === activeTag }]"
          @click="activeTag = tag"
        >
          {{ tag }}
        </button>
      </div>

      <div class="container work-grid">
        <article v-for="item in filteredProjects" :key="item.name" class="work-card">
          <div class="work-image-wrap">
            <img :src="item.image" :alt="item.name" />
            <div class="work-overlay">
              <span>{{ item.name }}</span>
            </div>
          </div>
          <div class="work-content">
            <h4>{{ item.name }}</h4>
            <p>{{ item.type }}</p>
            <div class="work-meta" >
              <span>{{ item.year }}</span>
              <span @click="viewMoreCases">查看详情 →</span>
            </div>
          </div>
        </article>
      </div>

      <button class="more-btn" @click="viewMoreCases">查看更多作品</button>
    </section>

    <section id="contact" class="section contact">
      <div class="section-title">
        <h2>联系我们</h2>
        <span class="title-line"></span>
      </div>

      <div class="container contact-grid">
        <div class="contact-info">
          <h3>让我们一起打造理想空间</h3>
          <p>无论您是有商业项目需求，还是想要打造梦想中的家，我们都将为您提供专业的设计服务。欢迎随时联系我们，让我们一起开启您的空间设计之旅。</p>
          <ul>
            <li><strong>公司地址：</strong>上饶市信州区洋码头B座13A1307</li>
            <li><strong>联系电话：</strong>400-888-9999</li>
            <li><strong>电子邮箱：</strong>info@luxedesign.com</li>
            <li><strong>工作时间：</strong>周一至周五 9:00 - 18:00</li>
          </ul>
        </div>
      </div>
    </section>

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
  </div>
</template>

<script>
export default {
  name: 'HomePageView'
}
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const heroSlides = [
  {
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
    alt: '轮播图1-商业空间',
    title: '匠心设计 · 品质生活',
    subtitle: '专注于为您打造独具品味的空间美学'
  },
  {
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg',
    alt: '轮播图2-办公空间',
    title: '重塑办公体验',
    subtitle: '平衡效率、协作与品牌气质的空间解决方案'
  },
  {
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
    alt: '轮播图3-居住空间',
    title: '营造理想居所',
    subtitle: '让家的每个角落都拥有温度与秩序'
  }
]

const currentSlideIndex = ref(0)
let autoTimer = null

const aboutImage =
  'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'

const awards = [
  { title: '2023年度设计大奖', desc: '中国室内设计协会颁发', year: '2023年12月' },
  { title: '最佳商业空间设计', desc: '亚洲设计奖组委会颁发', year: '2022年9月' },
  { title: '年度优秀设计机构', desc: '国际设计联盟颁发', year: '2021年11月' },
  { title: '居住空间设计金奖', desc: '全国设计大赛组委会颁发', year: '2020年7月' }
]

const tags = ['全部', '商业空间', '办公空间', '居住空间']
const activeTag = ref('全部')

const projects = [
  {
    name: '轻奢风商业展厅',
    category: '商业空间',
    type: '商业空间 / 上海',
    year: '2023年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
  },
  {
    name: '极简风办公楼',
    category: '办公空间',
    type: '办公空间 / 北京',
    year: '2022年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg'
  },
  {
    name: '北欧风别墅',
    category: '居住空间',
    type: '居住空间 / 深圳',
    year: '2023年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg'
  },
  {
    name: '工业风主题餐厅',
    category: '商业空间',
    type: '商业空间 / 广州',
    year: '2021年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg'
  },
  {
    name: '日式风公寓',
    category: '居住空间',
    type: '居住空间 / 杭州',
    year: '2022年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg'
  },
  {
    name: 'Loft风联合办公',
    category: '办公空间',
    type: '办公空间 / 成都',
    year: '2023年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg'
  }
]

const currentSlide = computed(() => heroSlides[currentSlideIndex.value])

const filteredProjects = computed(() => {
  if (activeTag.value === '全部') {
    return projects
  }
  return projects.filter((item) => item.category === activeTag.value)
})

function nextSlide() {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.length
  restartAutoSlide()
}

function prevSlide() {
  currentSlideIndex.value = (currentSlideIndex.value - 1 + heroSlides.length) % heroSlides.length
  restartAutoSlide()
}

function setSlide(index) {
  currentSlideIndex.value = index
  restartAutoSlide()
}

function startAutoSlide() {
  autoTimer = setInterval(() => {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.length
  }, 5000)
}

function stopAutoSlide() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

function restartAutoSlide() {
  stopAutoSlide()
  startAutoSlide()
}

async function viewMoreCases() {
  if (route.name === 'ViewMore') return

  try {
    await router.push({ name: 'ViewMore' })
  } catch (error) {
    window.location.hash = '#/view-more'
  }
}

onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  stopAutoSlide()
})
</script>

<style lang="scss">
:root {
  --text-primary: #1a1a1a;
  --text-secondary: #666;
  --text-muted: #999;
  --border: #d1d5db;
  --border-light: #f3f4f6;
  --bg-light: #f9fafb;
  --bg-footer: #181a1d;
  --radius-lg: 12px;
  --radius-sm: 8px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-primary);
  background: #fff;
}

.container {
  max-width: 1344px;
  margin: 0 auto;
}

.top-nav {
  height: 73px;
  padding: 16px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--border-light);
}

.brand {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.menu {
  display: flex;
  gap: 32px;
}

.menu a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

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

.ghost-btn,
.dark-btn {
  height: 46px;
  border-radius: var(--radius-sm);
  padding: 0 24px;
  font-size: 14px;
  cursor: pointer;
}

.ghost-btn {
  border: 1px solid var(--border);
  background: #fff;
  color: #333;
}

.dark-btn {
  border: 1px solid #1f2937;
  background: #1f2937;
  color: #fff;
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

.work-tags {
  margin-bottom: 48px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.tag {
  height: 38px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.tag.active {
  background: #1f2937;
  color: #fff;
  border-color: #1f2937;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(3, 400px);
  gap: 32px;
}

.work-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.work-image-wrap {
  position: relative;
  width: 400px;
  height: 520px;
  overflow: hidden;
}

.work-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.work-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  opacity: 0;
  transition: opacity 0.25s ease;
  font-size: 24px;
  font-weight: 600;
}

.work-card:hover .work-overlay {
  opacity: 1;
}

.work-card:hover img {
  transform: scale(1.04);
}

.work-content {
  padding: 24px;
}

.work-content h4 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
}

.work-content p {
  margin: 8px 0 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.work-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.work-meta span {
  color: var(--text-muted);
  font-size: 14px;
}

.work-meta a {
  color: #1f2937;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.more-btn {
  display: block;
  margin: 48px auto 0;
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
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


.error {
  color: #dc2626;
  font-size: 12px;
}

.submit-message {
  margin: 0;
  color: #059669;
  font-size: 13px;
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

@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }

  .about-grid,
  .contact-grid,
  .award-list,
  .work-grid {
    grid-template-columns: 1fr;
  }

  .about-image,
  .work-image-wrap {
    width: 100%;
  }
}

@media (max-width: 860px) {
  .top-nav {
    height: auto;
    padding: 12px 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .menu {
    gap: 20px;
  }

  .hero {
    height: 520px;
  }

  .hero-center h1 {
    font-size: 32px;
  }

  .hero-center p {
    font-size: 16px;
  }

  .section {
    padding: 56px 20px;
  }

  .section-title {
    margin-bottom: 40px;
  }

  .section-title h2 {
    font-size: 30px;
  }

  .work-tags {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer {
    padding: 40px 20px;
  }

  .footer-main {
    grid-template-columns: 1fr;
  }
}

</style>
