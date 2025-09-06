import Vue from 'vue'
import Router from 'vue-router'
// import store from '@/store'

Vue.use(Router)

//  修复路由重复报错
const originalPush = Router.prototype.push
const originalReplace = Router.prototype.replace
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}
/*const lineageDemo = r =>
  require.ensure(
    [],
    () => r(require('@/next/service/lineage/main/lineageGraph.vue')),
    'lineageDemo'
  )*/

const routes = [/*
  {
    name: 'lineageDemo',
    path: '/',
    component: lineageDemo,
  },*/
]
const router = new Router({
  routes: routes,
})
export default router
