
export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/index.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/view-more',
    name: 'ViewMore',
    component: () => import('@/components/ViewMore.vue')
  }
]

