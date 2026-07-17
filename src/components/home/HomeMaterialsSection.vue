<template>
  <section id="approach" class="materials-section">
    <div class="materials-shell">
      <div class="materials-copy">
        <span class="section-kicker">MATERIAL LANGUAGE</span>
        <h2>材料不是背景，是空间性格。</h2>
        <p>
          木的温润、石的重量、金属的冷感、织物的柔软，都会改变人对空间的判断。东禾把这些细节放在同一张秩序表里推敲。
        </p>
      </div>

      <div class="material-board" aria-label="东禾空间设计的材质语言">
        <article class="material-panel panel-sage">
          <span>01</span>
          <h3>光</h3>
          <p>先判断光从哪里来，再决定空间该安静还是聚焦。</p>
        </article>
        <article class="material-panel panel-clay">
          <span>02</span>
          <h3>材</h3>
          <p>让木、石、金属与织物形成真实可触的温差。</p>
        </article>
        <article class="material-panel panel-ink">
          <span>03</span>
          <h3>序</h3>
          <p>把动线、收纳和视觉中心放回清楚的位置。</p>
        </article>
        <article class="material-panel panel-brass">
          <span>04</span>
          <h3>落地</h3>
          <p>让效果图里的判断，能在现场被完整执行。</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.materials-section {
  padding: 106px 0;
  background:
    linear-gradient(90deg, rgba(32, 35, 31, 0.06) 1px, transparent 1px),
    var(--color-porcelain);
  background-size: 72px 72px;
}

.materials-shell {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(520px, 1fr);
  gap: 58px;
  align-items: stretch;
}

.materials-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 18px;
  color: var(--color-rust);
  font-size: 12px;
  letter-spacing: 3.4px;
}

.materials-copy h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(34px, 4.6vw, 58px);
  font-weight: 500;
  line-height: 1.1;
}

.materials-copy p {
  max-width: 520px;
  margin: 24px 0 0;
  color: var(--color-ink-soft);
  font-size: 16px;
  line-height: 1.9;
}

.material-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: minmax(230px, auto);
  gap: 12px;
}

.material-panel {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  overflow: hidden;
  position: relative;
  transition: transform 0.45s var(--ease-smooth), box-shadow 0.45s ease;
}

.material-panel::after {
  content: '';
  position: absolute;
  inset: auto 24px 24px auto;
  width: 74px;
  height: 74px;
  border: 1px solid currentColor;
  opacity: 0.18;
  transform: rotate(18deg);
  transition: transform 0.45s var(--ease-smooth);
}

.material-panel:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-soft);
}

.material-panel:hover::after {
  transform: rotate(0deg) scale(1.08);
}

.material-panel span {
  position: relative;
  z-index: 1;
  font-size: 13px;
  letter-spacing: 2.4px;
  opacity: 0.72;
}

.material-panel h3 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 42px;
  font-weight: 500;
  line-height: 1;
}

.material-panel p {
  position: relative;
  z-index: 1;
  max-width: 260px;
  margin: 18px 0 0;
  font-size: 14px;
  line-height: 1.8;
}

.panel-sage {
  background: var(--color-sage);
  color: #2f382b;
}

.panel-clay {
  background: var(--color-clay);
  color: #fff;
}

.panel-ink {
  background: var(--color-graphite);
  color: #fff;
}

.panel-brass {
  background: #c5a15e;
  color: #211b12;
}

@media (max-width: 1020px) {
  .materials-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .materials-section {
    padding: 76px 0;
  }

  .materials-shell {
    width: calc(100% - 36px);
    gap: 34px;
  }

  .materials-copy h2 {
    font-size: 34px;
  }

  .material-board {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(210px, auto);
  }

  .material-panel {
    min-height: 210px;
  }
}
</style>
