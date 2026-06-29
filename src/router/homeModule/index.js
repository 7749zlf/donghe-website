
import IndexView from '@/views/index.vue'

export default [
  {
    path: '/',
    name: 'Home',
    component: IndexView,
    meta: { keepAlive: true }
  },
  {
    path: '/works',
    name: 'worksGallery',
    component: () => import('@/views/worksGallery.vue')
  },
  {
    path: '/designDetail/:id',
    name: 'designDetail',
    component: () => import('@/views/designDetail.vue')
  },
  {
    path: '/manager',
    name: 'contentManager',
    component: () => import('@/views/contentManager.vue')
  }
]
