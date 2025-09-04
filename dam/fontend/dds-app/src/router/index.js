import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

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

// dam
const main = r =>
  require.ensure(
    [],
    () => r(require('@/components/common/main/main.vue')),
    'main'
  )

const assetCount = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/assetCount/index.vue')),
    'assetCount'
  )
const informationItems = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/informationItems/index.vue')),
    'informationItems'
  )
const accessControl = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/accessControl/main.vue')),
    'accessControl'
  )
const dataLevel = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/dataLevel/index.vue')),
    'dataLevel'
  )
const statutoryProvisions = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/statutoryProvisions/main.vue')),
    'statutoryProvisions'
  )
const reviewAndRelease = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/reviewAndRelease/main.vue')),
    'reviewAndRelease'
  )
const intelligenceClassification = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/intelligenceClassification/main.vue')),
    'intelligenceClassification'
  )
const coordinationClassification = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/coordinationClassification/main.vue')),
    'coordinationClassification'
  )
const accessStrategy = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/accessStrategy/main.vue')),
    'accessStrategy'
  )
const datamaskingRule = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/datamaskingRule/datamaskingRule.vue')),
    'datamaskingRule'
  )
const classificationStructure = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/classificationStructure/main.vue')),
    'classificationStructure'
  )
const itemParamConfig = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/config/index.vue')),
    'itemParamConfig'
  )
const algorithm = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/algorithm/main.vue')),
    'algorithm'
  )
const accessDetail = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/access/index.vue')),
    'accessDetail'
  )
/**
 * =================================  安全网关  =====================================
 */
// 安全网关模块
const dataSecurityGateway = r =>
  require.ensure(
    [],
    () => r(require('@/view/gateway/index.vue')),
    'dataSecurityGateway'
  )

const logAudit = r =>
  require.ensure(
    [],
    () => r(require('@/view/gateway/logAudit.vue')),
    'logAudit'
  )
const logging = r =>
  require.ensure([], () => r(require('@/view/gateway/logging.vue')), 'logging')

const frontendDevelopmentDocument = r =>
  require.ensure(
    [],
    () => r(require('@/next/components/document/main.vue')),
    'frontendDevelopmentDocument'
  )

const routes = [
  {
    name: 'main',
    path: '/main',
    component: main,
    children: [
      {
        name: 'assetCount',
        path: 'assetCount',
        component: assetCount,
      },
      {
        name: 'informationItems',
        path: 'informationItems',
        component: informationItems,
      },
      {
        name: 'accessControl',
        path: 'accessControl',
        component: accessControl,
      },
      {
        name: 'dataLevel',
        path: 'dataLevel',
        component: dataLevel,
      },
      {
        name: 'statutoryProvisions',
        path: 'statutoryProvisions',
        component: statutoryProvisions,
      },
      {
        name: 'reviewAndRelease',
        path: 'reviewAndRelease',
        component: reviewAndRelease,
      },
      {
        name: 'intelligenceClassification',
        path: 'intelligenceClassification',
        component: intelligenceClassification,
      },
      {
        name: 'coordinationClassification',
        path: 'coordinationClassification',
        component: coordinationClassification,
      },
      {
        name: 'accessStrategy',
        path: 'accessStrategy',
        component: accessStrategy,
      },
      {
        name: 'datamaskingRule',
        path: 'datamaskingRule',
        component: datamaskingRule,
      },
      {
        name: 'classificationStructure',
        path: 'classificationStructure',
        component: classificationStructure,
      },
      {
        name: 'itemParamConfig',
        path: 'itemParamConfig',
        component: itemParamConfig,
      },
      {
        name: 'algorithm',
        path: 'algorithm',
        component: algorithm,
      },
      {
        name: 'accessDetail',
        path: 'accessDetail',
        component: accessDetail,
      },
      {
        name: 'dataSecurityGateway',
        path: 'dataSecurityGateway',
        component: dataSecurityGateway,
      },
      {
        name: 'logAudit',
        path: 'logAudit',
        component: logAudit,
      },
      {
        name: 'logging',
        path: 'logging',
        component: logging,
      },
      {
        name: 'frontendDevelopmentDocument',
        path: '/frontendDevelopmentDocument',
        component: frontendDevelopmentDocument,
      },
    ],
  },
  {
    path: '*',
    redirect: to => {
      // let $ddmFirst = Vue.prototype.$ddmFirst
      // 首页跳转逻辑:
      // 当 damEnable 为 false, 首页跳转到 ddm 数据标准
      // 当 damEnable 为 true, 首页跳转到 dam 首页
      // TODO
      // 根据当前页面 header 判断, 如果 当前为 ddm header ,首页跳转到 ddm 数据标准
      return {
        path: '/main/assetCount',
      }
    },
  },
]
const router = new Router({
  routes: routes,
})

// router.beforeEach((to, from, next) => {
//   if (!store.state.lic.domain && to.path === '/ddm/main/dataStandard') {
//     next('/')
//   } else {
//     next()
//   }
// })
export default router
