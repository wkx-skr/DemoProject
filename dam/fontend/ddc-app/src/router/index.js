import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import dopRoutes from './dopRoutes'

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
const dataAssetDashboard = r =>
  require.ensure(
    [],
    () => r(require('@/view/dashboard/dataAssetDashboard.vue')),
    'dataAssetDashboard'
  )
// ddc
const assetAnalysis = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/analysis')),
    'assetAnalysis'
  )
const assetManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/assetManage/index.vue')),
    'assetManage'
  )
const assetRecognition = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/intelligence/main.vue')),
    'assetRecognition'
  )

const generalSetting = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/generalSetting')),
    'generalSetting'
  )
const directoryStructure = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/directoryStructure')),
    'directoryStructure'
  )
const logsRecord = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/logsRecord')),
    'logsRecord'
  )
const portal = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/marketplace/portal.vue')),
    'assetCart'
  )

const assetCart = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/marketplace/assetCart/index.vue')),
    'assetCart'
  )
const dataMarketplace = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/marketplace/home/index.vue')),
    'dataMarketplace'
  )

const assetSupermarket = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/marketplace/supermarket/index.vue')),
    'assetHome'
  )

const details = r =>
  require.ensure(
    [],
    () =>
      r(require('@/view/dataAsset/marketplace/supermarket/details/index.vue')),
    'details'
  )

const tableDetails = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataAsset/marketplace/supermarket/details/tableDetails.vue')
      ),
    'tableDetails'
  )

const metaModelDetails = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataAsset/marketplace/supermarket/details/metaModelDetails.vue')
      ),
    'metaModelDetails'
  )

const columnDetails = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataAsset/marketplace/supermarket/details/columnDetails.vue')
      ),
    'columnDetails'
  )

const catalogDetails = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataAsset/marketplace/supermarket/details/catalogDetails.vue')
      ),
    'catalogDetails'
  )
const fileDetails = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataAsset/marketplace/supermarket/details/fileDetails.vue')
      ),
    'fileDetails'
  )
const reportDetails = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataAsset/marketplace/supermarket/details/reportDetails.vue')
      ),
    'fileDetails'
  )

const noticeManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/noticeManage/index.vue')),
    'noticeManage'
  )

const newsDetails = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/marketplace/home/newsDetails.vue')),
    'newsDetails'
  )
const taskManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/taskManage/index.vue')),
    'taskManage'
  )

const metaModelCollect = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/metaModelCollect/main.vue')),
    'metaModelCollect'
  )
const metaModelQuery = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/metaModelQuery/main.vue')),
    'metaModelQuery'
  )
const techModelCollect = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/techModelCollect/main.vue')),
    'techModelCollect'
  )
// 模型映射任务 模型映射管理
const modelAutoMapping = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/modelAutoMapping/main.vue')),
    'modelAutoMapping'
  )
const modelMappingManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/modelMappingManage/main.vue')),
    'modelMappingManage'
  )
// 元数据映射任务 元数据映射管理
const metaDataAutoMapping = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/metaDataAutoMapping/main.vue')),
    'metaDataAutoMapping'
  )
const metaDataMappingManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/metaDataMappingManage/main.vue')),
    'metaDataMappingManage'
  )
const designDropInspection = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/designDropInspection/main.vue')),
    'designDropInspection'
  )
const techDropInspection = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/techDropInspection/main.vue')),
    'techDropInspection'
  )
const dataFlowManagement = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/dataFlowManagement/main.vue')),
    'dataFlowManagement'
  )
const dataFlowDiagrams = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/dataFlowDiagrams/main.vue')),
    'dataFlowDiagrams'
  )
const dopList = r =>
  require.ensure([], () => r(require('@/view/dopList/list.vue')), 'dopList')
const routes = [
  // 数字化运营平台相关路由
  ...dopRoutes,
  {
    name: 'main',
    path: '/main',
    redirect: '/dataAsset/analysis',
    component: main,
    children: [
      {
        name: 'dopList',
        path: 'dopList',
        component: dopList,
      },
      {
        name: 'dataAsset',
        path: 'dataAsset',
        redirect: '/dataAsset/analysis',
        component: portal,
        children: [
          {
            name: 'assetCart',
            path: 'assetCart',
            component: assetCart,
          },
          {
            name: 'dataMarketplace',
            path: 'marketplace',
            component: dataMarketplace,
          },
          {
            name: 'assetSupermarket',
            path: 'supermarket',
            component: assetSupermarket,
            meta: {
              keepAlive: true,
            },
          },
          {
            name: 'details',
            path: 'details',
            component: details,
            children: [
              {
                name: 'viewDetails',
                path: 'view',
                component: tableDetails,
              },
              {
                name: 'tableDetails',
                path: 'table',
                component: tableDetails,
              },
              {
                name: 'metaModelDetails',
                path: 'metaModel',
                component: metaModelDetails,
              },
              {
                name: 'columnDetails',
                path: 'column',
                component: columnDetails,
              },
              {
                name: 'catalogDetails',
                path: 'catalog',
                component: catalogDetails,
              },
              {
                name: 'fileDetails',
                path: 'file',
                component: fileDetails,
              },
              {
                name: 'reportDetails',
                path: 'report',
                component: reportDetails,
              },
            ],
          },
          {
            name: 'newsDetails',
            path: 'news',
            component: newsDetails,
          },
        ],
      },
      {
        name: 'dataAssetDashboard',
        path: 'dashboard/dataAssetDashboard',
        component: dataAssetDashboard,
      },
      {
        name: 'assetAnalysis',
        path: 'dataAsset/analysis',
        component: assetAnalysis,
      },
      {
        name: 'assetDirManage',
        path: 'dataAsset/manage',
        component: assetManage,
      },
      {
        name: 'assetRecognition',
        path: 'dataAsset/recognition',
        component: assetRecognition,
      },
      {
        name: 'generalSetting',
        path: 'dataAsset/generalSetting',
        component: generalSetting,
        meta: {
          // keepAlive: true, // 需要缓存
        },
      },
      {
        name: 'directoryStructure',
        path: 'dataAsset/directoryStructure',
        component: directoryStructure,
      },
      {
        name: 'logsRecord',
        path: 'dataAsset/logsRecord',
        component: logsRecord,
      },
      {
        name: 'taskManage',
        path: 'dataAsset/taskManage',
        component: taskManage,
      },
      {
        name: 'metaModelCollect',
        path: 'dataAsset/metaModelCollect',
        component: metaModelCollect,
      },
      {
        name: 'metaModelQuery',
        path: 'dataAsset/metaModelQuery',
        component: metaModelQuery,
      },
      {
        name: 'techModelCollect',
        path: 'dataAsset/techModelCollect',
        component: techModelCollect,
      },
      {
        name: 'modelAutoMapping',
        path: 'dataAsset/modelAutoMapping',
        component: modelAutoMapping,
      },
      {
        name: 'modelMappingManage',
        path: 'dataAsset/modelMappingManage',
        component: modelMappingManage,
      },
      {
        name: 'metaDataAutoMapping',
        path: 'dataAsset/metaDataAutoMapping',
        component: metaDataAutoMapping,
      },
      {
        name: 'metaDataMappingManage',
        path: 'dataAsset/metaDataMappingManage',
        component: metaDataMappingManage,
      },
      {
        name: 'designDropInspection',
        path: 'dataAsset/designDropInspection',
        component: designDropInspection,
      },
      {
        name: 'techDropInspection',
        path: 'dataAsset/techDropInspection',
        component: techDropInspection,
      },
      {
        name: 'dataFlowManagement',
        path: 'dataAsset/dataFlowManagement',
        component: dataFlowManagement,
      },
      {
        name: 'dataFlowDiagrams',
        path: 'dataAsset/dataFlowDiagrams',
        component: dataFlowDiagrams,
      },
    ],
  },
  {
    path: '/ddc.html*',
    redirect: '/home',
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
        path:
          window.setting.damEnabled === 'true'
            ? '/damHomePage'
            : '/ddm/main/dataStandard',
      }
    },
  },
]
const router = new Router({
  routes: routes,
})

router.beforeEach((to, from, next) => {
  if (!store.state.lic.domain && to.path === '/ddm/main/dataStandard') {
    next('/')
  } else {
    // console.log(to, next)
    next()
  }
})
export default router
