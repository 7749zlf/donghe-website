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

/**
 * 应用启动后加载云端项目；未配置云服务或请求失败时保留本地数据。
 * @returns {Promise<void>}
 */
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
