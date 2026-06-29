<template>
  <div class="works-page">
    <div class="works-shell">
      <header class="works-header">
        <h1>WORKS</h1>
        <div class="filter-row">
          <button
            v-for="option in filterOptions"
            :key="option.label"
            :class="['filter-btn', { active: option.value === activeCategory }]"
            @click="setCategory(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </header>

      <section class="works-grid">
        <article
          v-for="item in filteredWorks"
          :key="item.id"
          class="work-card"
          role="button"
          tabindex="0"
          @click="openDetail(item.id)"
          @keyup.enter="openDetail(item.id)"
        >
          <div class="card-media">
            <div class="media-track">
              <img :src="item.cover" :alt="item.name" />
              <div class="card-caption">
                <h3>{{ item.name }}</h3>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorksGalleryView'
}
</script>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { tags, worksList } from '@/mock/data'

const router = useRouter()

const filterOptions = [
  { label: '全部', value: tags[0] },
  { label: '商业空间', value: tags[1] },
  { label: '平层', value: tags[2] },
  { label: '别墅', value: tags[3] }
]

const activeCategory = ref(tags[0])

const filteredWorks = computed(() => {
  if (activeCategory.value === tags[0]) {
    return worksList
  }
  return worksList.filter((item) => item.category === activeCategory.value)
})

function setCategory(category) {
  activeCategory.value = category
}

function openDetail(id) {
  router.push({ name: 'designDetail', params: { id } })
}
</script>

<style scoped lang="scss">
.works-page {
  min-height: 100vh;
  background: #efefef;
  padding: 0 0 80px;
}

.works-shell {
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
}

.works-header {
  padding-top: 24px;
}

.works-header h1 {
  margin: 0;
  font-size: 36px;
  letter-spacing: 2px;
  font-weight: 500;
  color: #0f1318;
}

.filter-row {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 34px;
}

.filter-btn {
  border: none;
  padding: 0;
  background: transparent;
  font-size: 24px;
  letter-spacing: 1px;
  color: #6d7682;
  cursor: pointer;
  transition: color 0.3s ease;
}

.filter-btn.active,
.filter-btn:hover {
  color: #11161d;
}

.works-grid {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px 26px;
}

.work-card {
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.card-media {
  position: relative;
  overflow: hidden;
  background: #d8d8d8;
  aspect-ratio: 4 / 3;
}

.media-track {
  --caption-height: 46px;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  transform: translateY(0);
  transition: transform 0.52s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-media img {
  display: block;
  width: 100%;
  height: 100%;
  flex: 0 0 100%;
  object-fit: cover;
}

.card-caption {
  height: var(--caption-height);
  flex: 0 0 var(--caption-height);
  display: flex;
  align-items: center;
  padding: 0 14px;
  background: #fff;
  border-top: 1px solid rgba(21, 26, 33, 0.08);
}

.card-caption h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  color: #5e6570;
  line-height: 1;
}

.work-card:hover .media-track,
.work-card:focus-visible .media-track {
  transform: translateY(calc(var(--caption-height) * -1));
}

@media (max-width: 1100px) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .works-shell {
    width: calc(100% - 32px);
  }

  .works-header h1 {
    font-size: 30px;
  }

  .filter-row {
    gap: 16px 24px;
  }

  .filter-btn {
    font-size: 20px;
  }

  .works-grid {
    margin-top: 34px;
    grid-template-columns: 1fr;
    gap: 18px;
  }
}
</style>
