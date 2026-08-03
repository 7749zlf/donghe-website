
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
  },
  {
    path: '/manager/quotes',
    name: 'quoteManager',
    component: () => import('@/views/quoteManager.vue'),
    meta: {
      hideNavigation: true,
      skipIntro: true
    }
  },
  {
    path: '/quote/:token',
    name: 'quoteView',
    component: () => import('@/views/quoteView.vue'),
    meta: {
      hideNavigation: true,
      skipIntro: true
    }
  }
]
