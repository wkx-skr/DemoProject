import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/common/main.vue'
import store from '@/store'
import inElectron from '@/resource/utils/environment'
import HTTP from '@/resource/http'

// page
// 组件库文档
const FrontendDevelopmentDocument = () => import('@/next/components/document/main.vue')
// 个人工作台
const Dashboard = () => import('@/views/dashboard5.7/api/userPane.vue')
const myMaterial = () => import('@/views/userModal/entrance/myMaterial.vue')
const myMessage = () => import('@/views/userModal/entrance/myMessage.vue')
const myMessageSent = () => import('@/views/userModal/entrance/myMessageSent.vue')
const myApply = () => import('@/views/userModal/entrance/myApply.vue')
const myTodo = () => import('@/views/userModal/entrance/myTodo.vue')
const myDone = () => import('@/views/userModal/entrance/myDone.vue')
const userInformation = () => import('@/views/userModal/entrance/userInformation.vue')
const myReport = () => import('@/views/userModal/myReport.vue')

const List = () => import('../views/modelLibrary/modelLibrary.vue')
const ModelEdit = () => import('../views/list/modelEdit.vue')
const User = () => import('../views/user/user.vue')
const Udp = () => import('../views/udp/udp.vue')
const Tag = () => import('../views/tag/tag.vue')
const Workflow = () => import('../views/workflow/workflow.vue')
const Update = () => import('../views/update/update.vue')
const License = () => import('../views/license/main.vue')
const Report = () => import('../views/report/report.vue')
const ModelRules = () => import('../views/modelRules/main.vue')
const RuleGroup = () => import('../views/ruleGroup/main.vue')
const DefaultRules = () => import('../views/defaultRules/main.vue')
const SearchResult = () => import('../views/globalSearch/searchResult.vue')
const Log = () => import('../views/log/tag.vue')
const domainManage = () => import('../views/domainManage/domainManage.vue')
const driveManagement = () => import('../views/driveManagement/driveManagement.vue')
const Phases = () => import('../views/phases/phases.vue')
const processControl = () => import('../views/processControl/main.vue')
const userModal = () => import('../views/userModal/main.vue')
const ddlSetting = () => import('@/views/ddlSetting/ddlSetting.vue')
const configPane = () => import('@/views/configPane/configPane.vue')
const messageManage = () => import('@/views/notification/messageManage.vue')
const datatypeMapping = () => import('@/views/datatypeMapping/main.vue')
const modelTemplate = () => import('@/views/modelTemplate/main.vue')

// dam iframeContainer
const iframeContainer = () => import('@/components/common/iframeContainer/iframeContainer.vue')
// 数据标准
const newDataStandard = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const domainStandard = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const dataStandardCode = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const dataStandardField = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const dataStandardGlossary = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const domainSetting = () => import('@/components/common/iframeContainer/iframeContainer.vue')

// layer 层管理
const layerManager = () => import('@/views/layerManage/main.vue')
// 主题管理
const themeManagement = () => import('@/views/themeManagement/main.vue')

// 用户管理
const organizationManage = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const user = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const group = () => import('@/components/common/iframeContainer/iframeContainer.vue')

// 企业级模型地图
// const Enterprise = () => import('../views/enterprise/common/main.vue')
// const Architecture = () => import('../views/enterprise/architecture/architecture.vue')
const webLicense = () => import('../views/webLicense/main.vue')
const modelLevel = () => import('../views/modelLevel/modelLevel.vue')
const modelLineage = () => import('@/views/modelLevel/lineage/modelLineage.vue')
const dashboardDemo = () => import('@/components/dashboard/api/demo.vue')
// 模型资产
const modelTheme = () => import('../views/modelTheme/modelTheme.vue')
const modelThemeDetail = () => import('../views/modelTheme/detail.vue')
const topic = () => import('@/views/assets/topic/main.vue')
const modelCategory = () => import('@/views/assets/modelCategory/main.vue')
const businessObj = () => import('@/views/assets/businessObj/main.vue')
const businessArea = () => import('@/views/assets/businessArea/main.vue')
// const businessObjDetail = () => import('@/views/assets/businessObjDetail/main.vue')
// const businessAreaDetail = () => import('@/views/assets/businessAreaDetail/main.vue')
// const modelTreeDetail = () => import('@/views/assets/modelTreeDetail/main.vue')

// archy 7.0
// 数据流转图
const modelGraphCirculation = () => import('@/views/archy/modelGraphCirculation/main.vue')
// 数据分布图
const modelGraphDistribution = () => import('@/views/archy/modelGraphDistribution/main.vue')
// 企业逻辑模型
const enterpriseLogicalModel = () => import('@/views/archy/enterpriseLogicalModel/enterpriseLogicalModel.vue')
// 应用物理模型
const applicationSystemModel = () => import('@/views/archy/applicationSystemModel/applicationSystemModel.vue')
// 企业领域模型
const enterpriseAreaModel = () => import('@/views/archy/enterpriseAreaModel/enterpriseAreaModel.vue')
const archyHomePage = () => import('@/views/archy/homePage/main.vue')

// bpmn
const bpmnModelEdit = () => import('@/views/bpmn/bpmnModel/bpmnModelEdit.vue')
const bpmnModelManage = () => import('@/views/bpmn/modelManage/main.vue')

// electron
const ElectronMain = () => import('@/views/electron/main/main.vue')
const ElectronList = () => import('@/views/electron/list/main.vue')

//  修复路由重复报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location: any) {
  return (originalPush.call(this, location) as any).catch((err: any): any => err)
}
Vue.use(VueRouter)

const routes = [
  {
    path: '/main',
    name: 'main',
    component: Main,
    children: [
      // 前端组件库文档
      {
        name: 'frontendDevelopmentDocument',
        path: '/frontendDevelopmentDocument',
        component: FrontendDevelopmentDocument
      },
      // 个人工作台
      {
        name: 'dashboard',
        path: 'dashboard',
        component: Dashboard
      },
      // {
      //   name: 'myMaterial',
      //   path: 'myMaterial',
      //   component: myMaterial
      // },
      {
        name: 'layerManage',
        path: 'layerManage',
        component: layerManager
      },
      {
        name: 'themeManagement',
        path: 'themeManagement',
        component: themeManagement
      },

      {
        name: 'userInformation',
        path: 'userInformation',
        component: userInformation
      },
      {
        name: 'myMessage',
        path: 'myMessage',
        component: myMessage
      },
      {
        name: 'myMessageSent',
        path: 'myMessageSent',
        component: myMessageSent
      },
      {
        name: 'myApply',
        path: 'myApply',
        component: iframeContainer,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'myTodo',
        path: 'myTodo',
        component: iframeContainer,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'myDone',
        path: 'myDone',
        component: iframeContainer,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'myReport',
        path: 'myReport',
        component: myReport
      },
      {
        name: 'list',
        path: 'list',
        component: List
      }, {
        name: 'modeledit',
        path: 'modeledit',
        component: ModelEdit
      }, {
        //   name: 'user',
        //   path: 'user',
        //   component: User
        // }, {
        name: 'udp',
        path: 'udp',
        component: Udp
      }, {
        name: 'drive',
        path: 'drive',
        component: driveManagement
      }, {
        name: 'ddlSetting',
        path: 'ddlSetting',
        component: ddlSetting
      }, {
        name: 'tag',
        path: 'tag',
        component: Tag
      }, {
        name: 'workflow',
        path: 'workflow',
        component: Workflow
      }, {
        name: 'update',
        path: 'update',
        component: Update
      }, {
        name: 'license',
        path: 'license',
        component: License
      }, {
        name: 'report',
        path: 'report',
        component: Report
      }, {
        name: 'modelRules',
        path: 'modelRules',
        component: ModelRules
      },
      {
        name: 'ruleGroup',
        path: 'ruleGroup',
        component: RuleGroup
      },
      {
        name: 'defaultRules',
        path: 'defaultRules',
        component: DefaultRules
      },
      {
        name: 'searchResult',
        path: 'searchResult',
        component: SearchResult
      }, {
        name: 'log',
        path: 'log',
        component: Log
      }, {
        name: 'dashboardDemo',
        path: 'dashboardDemo',
        component: dashboardDemo
      }, {
        name: 'domainManage',
        path: 'domainManage',
        component: domainManage
      },
      {
        name: 'phases',
        path: 'phases',
        component: Phases
      },
      {
        name: 'messageManage',
        path: 'messageManage',
        component: messageManage
      },
      {
        name: 'processControl',
        path: 'processControl',
        component: processControl
      },
      {
        name: 'userModal',
        path: 'userModal',
        component: userModal
      },

      // dam
      {
        name: 'dataStandardDdm',
        path: 'dataStandard',
        component: newDataStandard,
        meta: {
          keepAlive: true,
          app: 'domain-app'
        }
      },
      {
        name: 'domainStandardDdm',
        path: 'domainStandard',
        component: domainStandard,
        meta: {
          keepAlive: true,
          app: 'domain-app'
        }
      },
      {
        name: 'codeDdm',
        path: 'code',
        component: dataStandardCode,
        meta: {
          keepAlive: true,
          app: 'domain-app'
        }
      },
      {
        name: 'dataStandardFieldDdm',
        path: 'dataStandardField',
        component: dataStandardField,
        meta: {
          keepAlive: true,
          app: 'domain-app'
        }
      },
      {
        name: 'glossaryDdm',
        path: 'glossary',
        component: dataStandardGlossary,
        meta: {
          keepAlive: true,
          app: 'domain-app'
        }
      },
      {
        name: 'domainSettingDdm',
        path: 'domainSetting',
        component: domainSetting,
        meta: {
          keepAlive: true,
          app: 'domain-app'
        }
      },
      {
        name: 'organizationManageDdm',
        path: 'organizationManage',
        component: organizationManage,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'userDdm',
        path: 'user',
        component: user,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'groupDdm',
        path: 'group',
        component: group,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },

      // 流程管理
      {
        name: 'processCenterDdm',
        path: 'processCenter',
        component: iframeContainer,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'allApplyDdm',
        path: 'allApply',
        component: iframeContainer,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      {
        name: 'monitorDdm',
        path: 'monitor',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'licenseManageDdm',
        path: 'licenseManage',
        component: iframeContainer,
        meta: {
          keepAlive: true,
          app: 'base-app'
        }
      },
      // 控制面板
      {
        name: 'configPane',
        path: 'configPane',
        component: configPane
      },
      // 企业级模型地图
      // {
      //   name: 'enterprise',
      //   path: 'enterprise',
      //   component: Enterprise,
      //   children: [
      //     {
      //       name: 'architecture',
      //       path: 'architecture',
      //       components: {
      //         enterpriseBox: Architecture
      //       }
      //     }
      //   ]
      // },
      {
        name: 'modelLevel',
        path: 'modelLevel',
        component: modelLevel
      },
      {
        name: 'modelTheme',
        path: 'modelTheme',
        component: modelTheme,
        children: [{
          name: 'modelThemeDetail',
          path: 'detail/:id',
          props: true,
          component: modelThemeDetail
        }]
      },
      {
        name: 'modelLineage',
        path: 'modelLineage',
        component: modelLineage
      },
      {
        name: 'webLicense',
        path: 'webLicense',
        component: webLicense
      },
      {
        name: 'topic',
        path: 'topic',
        component: topic
      },
      {
        name: 'datatypeMapping',
        path: 'datatypeMapping',
        component: datatypeMapping
      },
      {
        name: 'modelTemplate',
        path: 'modelTemplate',
        component: modelTemplate
      },
      {
        name: 'modelCategory',
        path: 'modelCategory/:type',
        props: true,
        component: modelCategory
        // children: [{
        //   name: 'modelTreeDetail',
        //   path: 'detail/:id',
        //   props: true,
        //   component: modelTreeDetail
        // }]
      },
      {
        name: 'businessObj',
        path: 'businessObj',
        component: businessObj
        // children: [{
        //   name: 'businessObjDetail',
        //   path: 'detail/:id',
        //   props: true,
        //   component: businessObjDetail
        // }]
      },
      {
        name: 'businessArea',
        path: 'businessArea/:type',
        props: true,
        component: businessArea
        // children: [{
        //   name: 'businessAreaDetail',
        //   path: 'detail/:id',
        //   props: true,
        //   component: businessAreaDetail
        // }]
      },
      // archy 7.0
      {
        name: 'archy',
        path: 'archy',
        component: archyHomePage
      },
      {
        name: 'modelGraphCirculation',
        path: 'modelGraphCirculation',
        component: modelGraphCirculation
      },
      {
        name: 'modelGraphDistribution',
        path: 'modelGraphDistribution',
        component: modelGraphDistribution
      },
      {
        name: 'enterpriseLogicalModel', // 企业逻辑模型
        path: 'enterpriseLogicalModel',
        component: enterpriseLogicalModel
      },
      {
        name: 'applicationSystemModel', // 应用物理模型
        path: 'applicationSystemModel',
        component: applicationSystemModel
      },
      {
        name: 'enterpriseAreaModel', // 企业领域模型
        path: 'enterpriseAreaModel',
        component: enterpriseAreaModel
      },
      {
        name: 'bpmnModelEdit',
        path: 'bpmnModelEdit',
        component: bpmnModelEdit
      },
      {
        name: 'bpmnModelManage', // 企业领域模型
        path: 'bpmnModelManage',
        component: bpmnModelManage
      }
    ]
  },

  {
    path: '/electron/main',
    name: 'electronMain',
    component: ElectronMain,
    children: [{
      name: 'electronList',
      path: 'list',
      component: ElectronList
    }]
  },
  {
    path: '*',
    redirect: inElectron ? '/electron/main/list' : '/main/dashboard'
  }
]

// @ts-ignore
const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (from && from.path) {
    store.state.lastPath = from.path
  }
  next()
})

export default router
