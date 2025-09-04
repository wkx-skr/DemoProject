import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '@/dataWarehouse/views/common/main.vue'
const FrontendDevelopmentDocument = () => import('@/next/components/document/main.vue')

// sql 页面
const sqlEditor = () => import('@/dataWarehouse/views/sqlEditor/main.vue')

const modelLibrary = () => import('@/views/modelLibrary/modelLibrary.vue')
const ModelEditD = () => import('@/views/list/modelEdit.vue')

// project 项目管理

const projectManager = () => import('@/dataWarehouse/views/project/main.vue')
const projectDetail = () => import('@/dataWarehouse/views/project/projectDetail.vue')
const dsPublish = () => import('@/dataWarehouse/views/dsPublish/main.vue')
const dataSourceMapping = () => import('@/dataWarehouse/views/dataSourceMapping/main.vue')
// const dataTransform = () => import('@/dataWarehouse/views/project/dataTransform.vue')
// 需求管理
const demandManage = () => import('@/dataWarehouse/views/demandManagement/main.vue')

// layer 层管理
const layerManager = () => import('@/dataWarehouse/views/layer/main.vue')
const specificationProject = () => import('@/dataWarehouse/views/specificationProject/main.vue')

const iframeContainer = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const subjectDomain = () => import('@/dataWarehouse/views/subjectDomain/main.vue')

// 系统管理
const organizationManage = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const user = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const group = () => import('@/components/common/iframeContainer/iframeContainer.vue')
// const modelCategory = () => import('@/components/common/iframeContainer/iframeContainer.vue')
const tenantManage = () => import('@/dataWarehouse/views/userManagement/tenantManage.vue')

const userModal = () => import('@/views/userModal/main.vue')
const updManage = () => import('@/dataWarehouse/views/udpManage/main.vue')

const modelLineage = () => import('@/views/modelLevel/lineage/modelLineage.vue')
const ModelEdit = () => import('@/views/list/modelEdit.vue')
const processManagement = () => import('@/dataWarehouse/views/processManagement/main.vue')
const databaseManagement = () => import('@/dataWarehouse/views/databaseManagement/databaseMain.vue')
const userManagement = () => import('@/dataWarehouse/views/userManagement/main.vue')
const dataMap = () => import('@/dataWarehouse/views/dataMap/main.vue')
// const dataMap3D = () => import('@/dataWarehouse/views/dataMap3D/main.vue')

// 指标管理
const demandManagement = import('@/components/common/iframeContainer/iframeContainer.vue')
// const dimensionDefinition = import('@/components/common/iframeContainer/iframeContainer.vue')
const dimensionDefinition = () => import('@/dataWarehouse/views/dataIndex/indexManagement/dimensionDefinition/main.vue')
const indexDefinition = () => import('@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/entrance/basicAndDerive.vue')
const forkIndexDefinition = () => import('@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/entrance/fork.vue')
const indexModifier = () => import('@/dataWarehouse/views/dataIndex/modifier/entrance/indexModifier.vue')
const indexTimer = () => import('@/dataWarehouse/views/dataIndex/modifier/entrance/indexTimer.vue')
const themeDirectory = () => import('@/dataWarehouse/views/dataIndex/themeDirectory/main.vue')
const autonomousQuery = () => import('@/dataWarehouse/views/dataIndex/indexApply/autonomousQuery.vue')
const jobSchedulerDdd = () => import('@/dataWarehouse/views/dataIndex/jobScheduler/main.vue')

// const indexDefinition = import('@/components/common/iframeContainer/iframeContainer.vue')
// const forkIndexDefinition = import('@/components/common/iframeContainer/iframeContainer.vue')
// const indexModifier = import('@/components/common/iframeContainer/iframeContainer.vue')
// const indexTimer = import('@/components/common/iframeContainer/iframeContainer.vue')
// const themeDirectory = import('@/components/common/iframeContainer/iframeContainer.vue')
// const autonomousQuery = import('@/components/common/iframeContainer/iframeContainer.vue')

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
      {
        name: 'project',
        path: 'project',
        component: projectManager,
        children: [{
          name: 'projectDetail',
          path: ':id/:name',
          props: true,
          component: projectDetail
        }]
      },
      {
        name: 'demandManage',
        path: 'demandManage',
        component: demandManage
      },
      // {
      //   name: 'dataTransform',
      //   path: 'dataTransform',
      //   component: dataTransform
      // },
      {
        name: 'dsPublish',
        path: 'dsPublish',
        component: dsPublish
      },
      {
        name: 'dataSourceMapping',
        path: 'dataSourceMapping',
        component: dataSourceMapping
      },
      {
        name: 'layer',
        path: 'layer',
        component: layerManager
      },
      {
        name: 'specificationProject',
        path: 'specificationProject',
        component: specificationProject
      },
      {
        name: 'subjectDomain',
        path: 'subjectDomain',
        component: subjectDomain
      },
      {
        name: 'frontendDevelopmentDocument',
        path: '/frontendDevelopmentDocument',
        component: FrontendDevelopmentDocument
      },
      {
        name: 'modelLibrary',
        path: 'modelLibrary',
        component: modelLibrary
      },
      {
        name: 'modeleditD',
        path: 'modeledit',
        component: ModelEditD
      },
      {
        name: 'dataCatalogDdm',
        path: 'meta',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'modelCategoryDdm',
        path: 'modelCategory',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'dataSourceDdm',
        path: 'dataSource',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'driveManagementDdm',
        path: 'driveManagement',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'organizationManageDdm',
        path: 'organizationManage',
        component: organizationManage,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'userDdm',
        path: 'user',
        component: user,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'groupDdm',
        path: 'group',
        component: group,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'tenantManage',
        path: 'tenantManage',
        component: tenantManage
      },
      {
        name: 'userModal',
        path: 'userModal',
        component: userModal
      },
      {
        name: 'processManagement',
        path: 'processManagement',
        component: processManagement
      },
      {
        name: 'databaseManagement',
        path: 'databaseManagement',
        component: databaseManagement
      },
      {
        name: 'userManagement',
        path: 'userManagement',
        component: userManagement
      },
      {
        name: 'dataMap',
        path: 'dataMap',
        component: dataMap
      },
      // {
      //   name: 'dataMap3D',
      //   path: 'dataMap3D',
      //   component: dataMap3D
      // },
      {
        name: 'demandManagementDdm',
        path: 'demandManagement',
        component: demandManagement,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'dimensionDefinition',
        path: 'dimensionDefinition',
        component: dimensionDefinition
        /* meta: {
          keepAlive: true
        } */
      },
      {
        name: 'indexDefinition',
        path: 'indexDefinition',
        component: indexDefinition
        // meta: {
        //   keepAlive: true
        // }
      },
      {
        name: 'forkIndexDefinition',
        path: 'forkIndexDefinition',
        component: forkIndexDefinition
        // meta: {
        //   keepAlive: true
        // }
      },
      {
        name: 'indexModifier',
        path: 'indexModifier',
        component: indexModifier
        // meta: {
        //   keepAlive: true
        // }
      },
      {
        name: 'indexTimer',
        path: 'indexTimer',
        component: indexTimer
        // meta: {
        //   keepAlive: true
        // }
      },
      {
        name: 'themeDirectory',
        path: 'themeDirectory',
        component: themeDirectory
        // meta: {
        //   keepAlive: true
        // }
      },
      {
        name: 'autonomousQuery',
        path: 'autonomousQuery',
        component: autonomousQuery
        // meta: {
        //   keepAlive: true
        // }
      },

      {
        name: 'jobSchedulerDdd',
        path: 'jobSchedulerDdd',
        component: jobSchedulerDdd
      },
      // dds
      {
        name: 'serviceOverviewDdm',
        path: 'serviceOverview',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'apiOverviewDdm',
        path: 'apiOverview',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'applyOverviewDdm',
        path: 'applyOverview',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'manageApiDdm',
        path: 'manageApi',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'manageAppDdm',
        path: 'manageApp',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'apiAuditDdm',
        path: 'apiAudit',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'applyAuditDdm',
        path: 'applyAudit',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'requestApiDdm',
        path: 'requestApi',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'devApiDdm',
        path: 'devApi',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'requestAppDdm',
        path: 'requestApp',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'devAppDdm',
        path: 'devApp',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'udpManage',
        path: 'udpManage',
        component: updManage
      },
      {
        name: 'modelLineage',
        path: 'modelLineage',
        component: modelLineage
      },
      {
        name: 'modeledit',
        path: 'modeledit',
        component: ModelEdit
      },
      // 流程管理
      {
        name: 'processCenterDdm',
        path: 'processCenter',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      },
      {
        name: 'allApplyDdm',
        path: 'allApply',
        component: iframeContainer,
        meta: {
          keepAlive: true
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
        name: 'databaseManagement',
        path: 'databaseManagement/jobManagement',
        component: iframeContainer,
        meta: {
          keepAlive: true
        }
      }

    ]
  },
  {
    name: 'sqlEditor',
    path: '/sql_editor',
    component: sqlEditor
  },
  {
    path: '*',
    redirect: '/main/project'
  }
]

// @ts-ignore
const router = new VueRouter({
  routes
})

export default router
