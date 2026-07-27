import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import reveal from './directives/reveal'
import { setCloudCases } from './mock/data'
import { fetchCloudCases, isCloudCasesEnabled } from './services/cloudCases'

createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')

async function bootCloudCases() {
  if (!isCloudCasesEnabled()) {
    return
  }

  try {
    setCloudCases(await fetchCloudCases())
  } catch (error) {
    console.warn('Failed to load cloud cases:', error)
  }
}

bootCloudCases()
