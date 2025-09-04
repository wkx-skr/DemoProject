// 数字化运营平台相关路由配置
export default [
  {
    path: '/dop/batchManager',
    name: 'BatchManager',
    component: () => import('@/view/dopList/batchManager.vue'),
  },
  {
    path: '/dop/batchDetail',
    name: 'BatchDetail',
    component: () => import('@/view/dopList/batchDetail.vue'),
  },
]
