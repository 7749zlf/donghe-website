
import IndexView from '@/views/index.vue'

export default [
  {
    path: '/',
    name: 'Home',
    component: IndexView,
    meta: { keepAlive: true }
  },
  {
    path: '/designDetail/:id',
    name: 'designDetail',
    component: () => import('@/views/designDetail.vue')
  }
]
