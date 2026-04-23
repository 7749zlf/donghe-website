
import IndexView from '@/views/index.vue'
import ViewMore from '@/components/ViewMore.vue'

export default [
  {
    path: '/',
    name: 'Home',
    component: IndexView,
    meta: { keepAlive: true }
  },
  {
    path: '/view-more',
    name: 'ViewMore',
    component: ViewMore
  }
]
