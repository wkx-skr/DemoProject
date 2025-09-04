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
const damEmptyPage = r =>
  require.ensure(
    [],
    () => r(require('@/view/homePage/emptyPage.vue')),
    'damEmptyPage'
  )
const damHomePage = r =>
  require.ensure(
    [],
    () => r(require('@/view/homePage/main.vue')),
    'damHomePage'
  )
// dam
const main = r =>
  require.ensure(
    [],
    () => r(require('@/components/common/main/main.vue')),
    'main'
  )
const dataSubject = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/dataSubject/dataSubject.vue')),
    'dataSubject'
  )
const dataSubjectDetail = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/dataSubject/dataSubjectDetail.vue')),
    'dataSubjectDetail'
  )
const domainVertify = r =>
  require.ensure(
    [],
    () => r(require('@/components/domainVertify/domainVertify.vue')),
    'domainVertify'
  )
const similarityCheck = r =>
  require.ensure(
    [],
    () => r(require('@/view/similarityCheckTask/index.vue')),
    'similarityCheck'
  )
const newDataStandard = r =>
  require.ensure(
    [],
    () => r(require('@/view/newDataStandard/main.vue')),
    'newDataStandard'
  )
const abandonDomain = r =>
  require.ensure(
    [],
    () => r(require('@/view/newDataStandard/AbandonDomain.vue')),
    'abandonDomain'
  )
const dataStandardDashboard = r =>
  require.ensure(
    [],
    () => r(require('@/view/dashboard5.7/api/dataStandardDashboard.vue')),
    'dataStandardDashboard'
  )
const domainStandard = r =>
  require.ensure(
    [],
    () => r(require('@/view/domainStandard/main.vue')),
    'domainStandard'
  )
const dataStandardField = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardField/main.vue')),
    'dataStandardField'
  )
const index = r =>
  require.ensure([], () => r(require('@/view/indexs/main.vue')), 'index')

const dimension = r =>
  require.ensure([], () => r(require('@/view/dimension/main.vue')), 'dimension')
const queryStandard = r =>
  require.ensure(
    [],
    () => r(require('@/view/newDataStandard/statistic/queryStandard.vue')),
    'queryStandard'
  )
const domainSetting = r =>
  require.ensure(
    [],
    () => r(require('@/view/domainSystemSetting/domainSetting.vue')),
    'domainSetting'
  )
const dataStandardCode = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardCode/code.vue')),
    'dataStandardCode'
  )
const dataGlossarys = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataGlossarys/main.vue')),
    'dataGlossarys'
  )
const dataStandardGlossary = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardGlossary/glossary.vue')),
    'dataStandardGlossary'
  )
const homeForDam = r =>
  require.ensure(
    [],
    () => r(require('@/view/homeForDam/homeForDam.vue')),
    'homeForDam'
  )
const modelDifference = r =>
  require.ensure(
    [],
    () => r(require('@/view/modelDifference/main.vue')),
    'modelDifference'
  )
const commonComponentDocument = r =>
  require.ensure(
    [],
    () => r(require('@/view/commonComponentDocument/main.vue')),
    'commonComponentDocument'
  )
const frontendDevelopmentDocument = r =>
  require.ensure(
    [],
    () => r(require('@/next/components/document/main.vue')),
    'frontendDevelopmentDocument'
  )
const sql = r =>
  require.ensure(
    [],
    () => r(require('@/view/gateway/components/audit/sql.vue')),
    'sql'
  )
const auditDetail = r =>
  require.ensure(
    [],
    () => r(require('@/view/gateway/components/audit/detail.vue')),
    'auditDetail'
  )
const dataFind = r =>
  require.ensure(
    [],
    () => r(require('@/components/inteligentFind/dataFind.vue')),
    'dataFind'
  )
const domainCluster = r =>
  require.ensure(
    [],
    () => r(require('@/components/domainCluster/dataFind.vue')),
    'domainCluster'
  )

// ddc
const ddc = r =>
  require.ensure([], () => r(require('@/view/ddc/ddc.vue')), 'ddc')
/* const home = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/home/index.vue')),
    'home'
  ) */

const mainForDdc = r =>
  require.ensure(
    [],
    () => r(require('@/view/mainForDdc/mainForDdc.vue')),
    'mainForDdc'
  )
const domain = r =>
  require.ensure([], () => r(require('@/view/myItem/domain.vue')), 'domain')

const dimensionDefinition = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndex/indexManagement/dimensionDefinition/main.vue')
      ),
    'dimensionDefinition'
  )
const indexDefinition = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndex/indexManagement/indexDefinition/entrance/basicAndDerive')
      ),
    'indexDefinition'
  )
const forkIndexDefinition = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndex/indexManagement/indexDefinition/entrance/fork.vue')
      ),
    'forkIndexDefinition'
  )
const indexModifier = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/modifier/entrance/indexModifier.vue')),
    'indexModifier'
  )
const indexTimer = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/modifier/entrance/indexTimer.vue')),
    'indexTimer'
  )
const demandManagement = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/demandManagement/main.vue')),
    'demandManagement'
  )
const themeDirectory = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/themeDirectory/main.vue')),
    'themeDirectory'
  )
const autonomousQuery = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/indexApply/autonomousQuery.vue')),
    'autonomousQuery'
  )
const homePage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/homePage/main.vue')),
    'homePage'
  )
// ddm heading
const ddmMain = r =>
  require.ensure(
    [],
    () => r(require('@/components/ddmHeading/main.vue')),
    'ddmMain'
  )
const ddmDefaultEmptyPage = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/components/ddmHeading/defaultEmptyPage/defaultEmptyPage.vue')
      ),
    'ddmDefaultEmptyPage'
  )

const routes = [
  {
    name: 'modelDifference',
    path: '/modelDifference',
    component: modelDifference,
  },
  {
    name: 'damHomePage',
    path: '/damHomePage',
    component: damHomePage,
  },
  {
    name: 'damEmptyPage',
    path: '/damEmptyPage',
    component: damEmptyPage,
  },
  /* {
    name: 'lineageGraph',
    path: '/lineageGraph',
    component: lineageGraph,
  },
  {
    name: 'lineageDemo',
    path: '/lineageDemo',
    component: lineageDemo,
  }, */
  {
    name: 'main',
    path: '/main',
    component: main,
    children: [
      {
        name: 'commonComponentDocument',
        path: '/commonComponentDocument',
        component: commonComponentDocument,
      },
      {
        name: 'frontendDevelopmentDocument',
        path: '/frontendDevelopmentDocument',
        component: frontendDevelopmentDocument,
      },
      {
        name: 'sql',
        path: '/dataSecurityGateway/sql',
        component: sql,
      },
      {
        name: 'auditDetail',
        path: '/dataSecurityGateway/detail',
        component: auditDetail,
      },
      {
        name: 'homeForDam',
        path: 'homeForDam',
        component: homeForDam,
      },
      {
        name: 'dataSubject',
        path: 'dataSubject',
        component: dataSubject,
      },
      {
        name: 'dataSubjectDetail',
        path: 'dataSubject/dataSubjectDetail',
        component: dataSubjectDetail,
      },
      {
        name: 'domainVertify',
        path: 'domainVertify',
        component: domainVertify,
      },
      {
        name: 'similarityCheck',
        path: 'similarityCheck',
        component: similarityCheck,
      },
      {
        name: 'queryStandard',
        path: 'dataStandard/queryStandard',
        component: queryStandard,
      },
      {
        name: 'domainSetting',
        path: 'domainSetting',
        component: domainSetting,
      },
      {
        name: 'dataStandardDashboard',
        path: 'dataStandard/dashboard',
        component: dataStandardDashboard,
      },
      {
        name: 'dataStandard',
        path: 'dataStandard',
        component: newDataStandard,
      },
      {
        name: 'abandonDomain',
        path: 'abandonDomain',
        component: abandonDomain,
      },
      // {
      //   name: 'dataStandardDdm',
      //   path: 'dataStandard',
      //   component: newDataStandard,
      // },
      {
        name: 'dataStandardField',
        path: 'dataStandardField',
        component: dataStandardField,
      },
      // {
      //   name: 'dataStandardFieldDdm',
      //   path: 'dataStandardField',
      //   component: dataStandardField,
      // },
      {
        name: 'domainStandard',
        path: 'domainStandard',
        component: domainStandard,
      },
      // {
      //   name: 'domainStandardDdm',
      //   path: 'domainStandard',
      //   component: domainStandard,
      // },
      {
        name: 'index',
        path: 'index',
        component: index,
      },
      {
        name: 'dimension',
        path: 'dimension',
        component: dimension,
      },
      {
        name: 'code',
        path: 'dataStandard/code',
        component: dataStandardCode,
      },
      // {
      //   name: 'codeDdm',
      //   path: 'dataStandard/code',
      //   component: dataStandardCode,
      // },
      {
        name: 'glossarys',
        path: 'data/glossarys',
        component: dataGlossarys,
      },
      {
        name: 'glossary',
        path: 'dataStandard/glossary',
        component: dataStandardGlossary,
      },
      // {
      //   name: 'glossaryDdm',
      //   path: 'dataStandard/glossary',
      //   component: dataStandardGlossary,
      // },
      {
        name: 'dataFind',
        path: 'dataFind',
        component: dataFind,
      },
      {
        name: 'domainCluster',
        path: 'domainCluster',
        component: domainCluster,
      },
      {
        name: 'dimensionDefinition',
        path: 'dimensionDefinition',
        component: dimensionDefinition,
      },
      {
        name: 'indexDefinition',
        path: 'indexDefinition',
        component: indexDefinition,
      },
      {
        name: 'forkIndexDefinition',
        path: 'forkIndexDefinition',
        component: forkIndexDefinition,
      },
      {
        name: 'indexModifier',
        path: 'indexModifier',
        component: indexModifier,
      },
      {
        name: 'indexTimer',
        path: 'indexTimer',
        component: indexTimer,
      },
      {
        name: 'demandManagement',
        path: 'demandManagement',
        component: demandManagement,
      },
      {
        name: 'themeDirectory',
        path: 'themeDirectory',
        component: themeDirectory,
      },
      {
        name: 'homePage',
        path: 'homePage',
        component: homePage,
      },
      {
        name: 'autonomousQuery',
        path: 'autonomousQuery',
        component: autonomousQuery,
      },
    ],
  },
  {
    name: 'ddmMain',
    path: '/ddm/main',
    component: ddmMain,
    children: [
      {
        name: 'ddmDefaultEmptyPage',
        path: 'ddmDefaultEmptyPage',
        component: ddmDefaultEmptyPage,
      },
      {
        name: 'dataStandardDdm',
        path: 'dataStandard',
        component: newDataStandard,
      },
      {
        name: 'domainStandardDdm',
        path: 'domainStandard',
        component: domainStandard,
      },
      {
        name: 'codeDdm',
        path: 'code',
        component: dataStandardCode,
      },
      {
        name: 'dataStandardFieldDdm',
        path: 'dataStandardField',
        component: dataStandardField,
      },
      {
        name: 'glossaryDdm',
        path: 'glossary',
        component: dataStandardGlossary,
      },
      {
        name: 'domainSettingDdm',
        path: 'domainSetting',
        component: domainSetting,
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
        path: '/damHomePage',
      }
    },
  },
]
const router = new Router({
  base: window.__MICRO_APP_BASE_ROUTE__ || '/',
  routes: routes,
})
// router.beforeEach((to, from, next) => {
//   if (!Vue.prototype.$authServerEnabled && securitPageList.includes(to.name)) {
//     next('/')
//   } else {
//     next()
//   }
// })

router.beforeEach((to, from, next) => {
  // if (!store.state.lic.domain && to.path === '/ddm/main/dataStandard') {
  //   next('/')
  // } else {
  //   next()
  // }
  next()
})
export default router
