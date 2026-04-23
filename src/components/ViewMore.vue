<template>
  <div class="view-more-page">
    <main class="gallery-shell">
      <section class="hero-block">
        <img :src="activeItem.full" :alt="activeItem.alt" class="hero-image" />
      </section>

      <section class="thumb-block">
        <button
          v-for="(item, index) in galleryItems"
          :key="item.seed"
          class="thumb-btn"
          :class="{ active: index === activeIndex }"
          @click="activeIndex = index"
          :aria-label="`show image ${index + 1}`"
        >
          <img :src="item.thumb" :alt="item.alt" class="thumb-image" />
        </button>
      </section>

      <footer class="page-nav">
        <a href="#" class="nav-link">&lt;&nbsp;&nbsp;NEXT: 太原罗马花园</a>
        <a href="#" class="nav-link">&lt;&nbsp;&nbsp;PREVIOUS: F HOUSE</a>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const seeds = [
  'interior-01', 'interior-02', 'interior-03', 'interior-04', 'interior-05', 'interior-06',
  'interior-07', 'interior-08', 'interior-09', 'interior-10', 'interior-11', 'interior-12',
  'interior-13', 'interior-14', 'interior-15', 'interior-16', 'interior-17', 'interior-18',
  'interior-19', 'interior-20', 'interior-21', 'interior-22', 'interior-23', 'interior-24',
  'interior-25', 'interior-26', 'interior-27', 'interior-28', 'interior-29', 'interior-30',
  'interior-31', 'interior-32', 'interior-33', 'interior-34'
]

const activeIndex = ref(0)
const galleryItems = seeds.map((seed, index) => ({
  seed,
  alt: `Interior case ${index + 1}`,
  full: `https://picsum.photos/seed/${seed}/1600/900`,
  thumb: `https://picsum.photos/seed/${seed}/220/124`
}))

const activeItem = computed(() => galleryItems[activeIndex.value])
</script>

<style scoped lang="scss">
.view-more-page {
  min-height: 100vh;
  background: #e9e9e9;
}

.gallery-shell {
  width: min(1320px, 94vw);
  margin: 0 auto;
  padding: 16px 0 40px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 180px;
  left: -34px;
  width: 28px;
  height: 28px;
  border: 1px solid #bdbdbd;
  color: #9b9b9b;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.hero-block {
  width: min(1000px, 100%);
  margin: 0 auto;
}

.hero-image {
  width: 100%;
  aspect-ratio: 1000 / 380;
  object-fit: cover;
  display: block;
}

.thumb-block {
  margin: 182px auto 0;
  width: min(1210px, 100%);
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 10px;
}

.thumb-btn {
  border: none;
  padding: 0;
  line-height: 0;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.2s ease;

  &:hover,
  &.active {
    opacity: 1;
  }
}

.thumb-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.page-nav {
  margin-top: 52px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.nav-link {
  color: #222;
  font-size: 18px;
  text-decoration: none;
  font-family: 'Times New Roman', serif;
  letter-spacing: 0.2px;
}

@media (max-width: 1100px) {
  .thumb-block {
    grid-template-columns: repeat(8, 1fr);
    margin-top: 96px;
  }

  .close-btn {
    display: none;
  }
}

@media (max-width: 760px) {
  .gallery-shell {
    width: 94vw;
  }

  .thumb-block {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .page-nav {
    align-items: flex-start;
  }

  .nav-link {
    font-size: 16px;
  }
}
</style>
