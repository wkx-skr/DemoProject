import ddm from './ddmMenu'
import ddd from './dddMenu'
import dds from './ddsMenu'
import ddsGw from './ddsGwMenu'
import ddc from './ddcMenu'

let { ddmPageMap, ddmPageTree } = ddm
let { dddPageMap, dddPageTree, dddIconMap } = ddd
let { ddsPageMap, ddsIconMap, ddsPageTree } = dds
let { ddsGwPageMap, ddsGwIconMap, ddsGwPageTree } = ddsGw

let { ddcPageMap, ddcPageTree } = ddc

const directory = {
  /** 页面配置
     本文件为所有页面的配置文件，包含名称、路径、权限等
     apps项目属性说明: {
        "name": "与pages item的appName一致",
        "devPort": "开发环境端口",
        "productionPath": "生产环境路由path",
        "enable": "是否允许使用"
      }
     pages项目属性说明: {
        "name": "添加新页面时请确保全局唯一,中英文不限，不做展示用途",
        "label": "如果base-components的公共国际化资源文件里包含当前页面，请使用资源路径。如果没有必要使用国际化资源，也可以hardcode。该项必需。",
        "vueRouter": "添加新页面时请确保全局唯一。",
        "appName": "项目名称",
        "path": "目录，需要确保全局唯一，共两级。该项必须。",
        "licenseRequired": "该页面需要何种license权限，多个权限之间为或的关系。可以缺省，表示无License控制。",
        "accessRequired": "需要何种用户权限,多个权限之间为或的关系。可以缺省，表示无用户权限控制。",
        "hideLeftNav": "布尔值，真表示该页面隐藏左侧导航栏。可以缺省。",
        "hidePageHeading": "布尔值，真表示隐藏页面顶部标题栏。可以缺省。隐藏顶部标题，则自动隐藏左侧导航栏",
        "hide": "布尔值，真表示隐藏该页面。可以缺省。"
        "hideInMenu": 布尔值，表示不在目录中展示
        "openByWindow": 布尔值，表示通过新窗口方式打开页面
      }
     */
  products: {
    dam: {
      name: 'dam',
      label: '强大的数据治理',
      index: 'dataCatalogDashboard',
      pages: {
        ...ddcPageTree,
        "$t('common.page.数据标准')": {
          "$t('common.page.dataStandardDashboard')": ['dataStandardDashboard'],
          "$t('common.page.domain')": [
            'glossary',
            'dataStandard',
            'code',
            'abandonDomain',
          ],
          // "$t('common.page.otherDomain')": [
          //     "dataStandardField",
          //     "domainStandard",
          // ],
          // "$t('common.page.indexMenu')": [
          //     "index",
          //     "dimension",
          // ],
          "$t('common.page.domainLanding')": [
            // "dataFind",
            // "domainCluster",
            // "domainVertify",
            'similarityCheck',
          ],
          // "$t('common.page.statistical')": [
          //     "queryStandard",
          // ],
          // "$t('common.page.domainSystemSetting')": [
          //     "domainSetting",
          // ],
        },
        "$t('common.page.元数据')": {
          "$t('common.page.metaData')": [
            'searchGlobal1',
            'dataCatalogDashboard',
            'map',
            'dataCatalog',
            'dataCatalogForDDC',
            'reportFormManage',
            'metaFolder',
          ],
          "$t('common.page.domain')": ['mapDataStandardDashboard'],
          "$t('common.page.mapAssetDirManage')": ['mapAssetDirManage'],
          "$t('common.page.dataResourceFile')": [
            'modelCategory',
            'dataSource',
            'metaDatasource',
            'metaModel',
          ],
          "$t('common.page.metadataQualityAndInspection')": [
            'metadataQualityDetection',
            'metadataSimilarityCheck',
          ],
          "$t('common.page.lineage')": [
            'lineageFile',
            'lineageCatalogue',
            'scriptManage',
          ],
        },
        // "$t('common.page.数据质量')": {
        //     "$t('common.page.dataQualityReport')": [
        //         "dataQualityDashboard",
        //         "ruleReport",
        //         "problemReport",
        //     ],
        //     "$t('common.page.ruleManagement')": [
        //         "ruleTemplate",
        //         "dataQualityRules",
        //         "qualityRule",
        //     ],
        //     "$t('common.page.qualityExamineJob')": [
        //         "qualityExamineJob",
        //     ],
        //     "$t('common.page.repairJobManagement')": [
        //         "dataQualityRepairJob",
        //         // "dataQualityMonitor",
        //         "dataQualityCheck",
        //         "knowledgebase",
        //     ],
        //     "$t('common.page.settingListSet')": [
        //         "settingList",
        //         "qualityAssurance",
        //         "problemProgramme",
        //         "ruleTypeSetting",
        //     ],
        // },
        ...ddsPageMap,
        ...ddsGwPageMap,
        "$t('common.page.数据服务')": {
          服务总览: ['serviceOverview'],
          API市场: ['apiOverview'],
          应用列表: ['applyOverview'],
          服务管理: [
            'manageApi',
            'manageApp',
            'apiAudit',
            'applyAudit',
            'requestApi',
            'devApi',
            'requestApp',
            'devApp',
          ],
        },
        "$t('common.page.指标管理')": {
          指标管理: [
            'dimensionDefinitionNew',
            'indexDefinitionNew',
            'forkIndexDefinitionNew',
            'indexModifierNew',
            'indexTimerNew',
          ],
          主题目录: ['themeDirectoryNew'],
          指标应用: ['autonomousQueryNew'],
        },
        "$t('common.page.systemManage')": {
          "$t('common.page.dataSourceManagement')": [
            // "modelCategory",
            'interfacepage',
            // "dataSource",
            'driveManagement',
            'pluginManager',
          ],
          "$t('common.page.process')": ['processCenter', 'allApply'],
          "$t('common.page.organizationalManagement')": [
            'organizationManage',
            'user',
            'group',
            'userGroup',
          ],
          "$t('common.page.taskManagement')": [
            'jobScheduler',
            'jobMonitor',
            'jobFile',
            'dateTemplate',
          ],
          "$t('common.page.configurationManagement')": [
            'tagManage',
            'setMail',
            'licenseManage',
            'newConfigPane',
          ],
          "$t('common.page.logManagement')": ['devLogs', 'operationLog'],
        },
      },
    },
    ddm: {
      name: 'ddm',
      label: '专业的数据建模',
      index: 'dashboard',
      pages: {
        ...ddmPageTree,
      },
    },
    // ddc: {
    //     name: 'ddc',
    //     label: '先进的数据资产',
    //     index: 'assetAnalysis',
    //     pages: {
    //         ...ddcPageTree
    //     },
    // },
    ddd: {
      name: 'ddd',
      label: 'Agile 3D',
      index: 'project',
      pages: {
        ...dddPageTree,
        // "$t('common.page.indexManagement')": {
        //     "$t('common.page.homePage')": [
        //         "homePage"
        //     ],
        //     "$t('common.page.demandManagement')": [
        //         "demandManagement"
        //     ],
        //     "$t('common.page.indexDefinition')": [
        //         "dimensionDefinition",
        //         "indexDefinition",
        //     ],
        //     "$t('common.page.themeDirectory')": [
        //         "themeDirectory"
        //     ],
        //     "$t('common.page.indexApply')": [
        //         "autonomousQuery"
        //     ],
        // }
      },
    },
    // dds: {
    //     name: 'dds',
    //     label: '专业的数据安全',
    //     index: 'assetCount',
    //     pages: {
    //         ...ddsPageMap
    //     }
    // },
  },
  apps: [
    {
      name: 'base-app',
      devPort: 8071,
      productionPath: 'base-app',
      enable: true,
    },
    {
      name: 'domain-app',
      devPort: 8073,
      productionPath: 'domain-app',
      enable: true,
    },
    {
      name: 'ddm-app',
      devPort: 8074,
      productionPath: 'ddm-app',
      enable: true,
    },
    {
      name: 'ddc-app',
      devPort: 8075,
      productionPath: 'ddc-app',
      enable: true,
    },
    {
      name: 'dds-app',
      devPort: 8076,
      productionPath: 'dds-app',
      enable: true,
    },
    {
      name: 'ddd-app',
      devPort: 8077,
      productionPath: 'ddd-app',
      enable: true,
    },
    {
      name: 'ds-app',
      devPort: 5173,
      productionPath: 'ds-app',
      enable: true,
    },
  ],
  mainPage: 'dataCatalogDashboard',
  iconMap: {
    "$t('common.page.dataResourceFile')": 'icon-menu-cjgl',
    "$t('common.page.metadataQualityAndInspection')": 'icon-menu-cjgl',
    "$t('common.page.metaData')": 'icon-menu-ysjgl',
    "$t('common.page.lineage')": 'icon-menu-ysjgl',
    "$t('common.page.userModal')": 'icon-workbench',
    "$t('common.page.process')": 'icon-menu-lcgl',
    "$t('common.page.systemManage')": 'icon-menu-xtgl',
    "$t('common.page.dataStandardDashboard')": 'icon-menu-fwzl',
    "$t('common.page.domain')": 'icon-menu-sjbz',
    "$t('common.page.otherDomain')": 'icon-menu-sjbz',
    "$t('common.page.indexMenu')": 'icon-menu-zbtix',
    "$t('common.page.qualityExamineJob')": 'icon-menu-jhrw',
    "$t('common.page.repairJobManagement')": 'icon-menu-wtgl',
    "$t('common.page.settingListSet')": 'icon-menu-gzcs',
    "$t('common.page.domainLanding')": 'icon-menu-bzld',
    "$t('common.page.statistical')": 'icon-menu-sjtm',
    "$t('common.page.domainSystemSetting')": 'icon-shezhi',
    "$t('common.page.dataQualityReport')": 'icon-menu-zlbg',
    "$t('common.page.ruleManagement')": 'icon-menu-gzgl',
    "$t('common.page.assetApplication')": 'icon-menu-fwzl',
    "$t('common.page.assetManage')": 'icon-menu-zbgl',
    "$t('common.page.assetMetadataCollection')": 'icon-menu-cjgl',
    "$t('common.page.assetMetadataMapping')": 'icon-menu-cjgl',
    "$t('common.page.assetModelMapping')": 'icon-menu-cjgl',
    "$t('common.page.droppingInspection')": 'icon-menu-cjgl',
    "$t('common.page.dataFlow')": 'icon-menu-cjgl',
    "$t('common.page.assetWorkbench')": 'icon-workbench',
    "$t('common.page.assetSystemManage')": 'icon-menu-xtgl',
    ...ddsIconMap,
    ...ddsGwIconMap,
    ...dddIconMap,
  },
  pagesMap: {
    mapDataStandardDashboard: {
      name: 'mapDataStandardDashboard', // 技术元数据采集
      label: "$t('common.page.domain')",
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_DASHBOARD'],
      isMapPage: true, // 是否是映射到已经有的页面
      mapAppName: 'domain-app', // 映射到的应用名称
      mapVueRouter: '/main/dataStandard/dashboard', // 映射到的路由
    },
    mapAssetDirManage: {
      name: 'mapAssetDirManage', // 数据资产管理
      label: "$t('common.page.assetDirManage')",
      licenseRequired: ['FE_ASSETS'],
      accessRequired: ['DATA_ASSET_MANAGE'],
      isMapPage: true, // 是否是映射到已经有的页面
      mapAppName: 'ddc-app', // 映射到的应用名称
      mapVueRouter: '/main/dataAsset/manage', // 映射到的路由
    },
    searchGlobal: {
      name: 'searchGlobal',
      label: '全局搜索',
      vueRouter: '/main/searchGlobal',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_SEARCH'],
      hideLeftNav: true,
      hideInMenu: true,
    },
    singlePageDemo: {
      name: 'singlePageDemo',
      label: '测试单页',
      vueRouter: '/singlePageDemo',
      appName: 'base-app',
      hideLeftNav: true,
      hidePageHeading: true,
      hide: false,
      hideInMenu: true,
    },
    lineageDemo: {
      name: 'lineageDemo',
      label: '血缘详情',
      vueRouter: '/lineageDemo',
      appName: 'base-app',
      hideLeftNav: true,
      hidePageHeading: true,
      hideInMenu: true,
    },
    modelCategory: {
      name: 'modelCategory',
      label: "$t('common.page.modelCategory')",
      vueRouter: '/main/modelCategory',
      appName: 'base-app',
      accessRequired: ['BASE_SYSTEM_MANAGE'],
      hideLeftNav: false,
      hidePageHeading: false,
      hide: false,
    },
    interfacepage: {
      name: 'interfacepage',
      label: "$t('common.page.interfacepage')",
      vueRouter: '/main/interfacepage',
      appName: 'base-app',
      accessRequired: ['BASE_SYSTEM_CALL_MANAGE'],
    },
    dataSource: {
      name: 'dataSource',
      label: "$t('common.page.dataSource')",
      vueRouter: '/main/systemManage/dataSource',
      appName: 'base-app',
      accessRequired: ['BASE_DATASOURCE_MANAGE'],
    },
    driveManagement: {
      name: 'driveManagement',
      label: "$t('common.page.driveManagement')",
      vueRouter: '/main/systemManage/driveManagement',
      appName: 'base-app',
      accessRequired: ['BASE_DRIVER_MANAGE'],
    },
    userModal: {
      name: 'userModal',
      label: "$t('common.page.userModal')",
      vueRouter: '/main/userModal',
      appName: 'base-app',
      licenseRequired: null,
      accessRequired: null,
      hideLeftNav: true,
      hideInMenu: true,
    },
    processCenter: {
      name: 'processCenter',
      label: "$t('common.page.processCenter')",
      vueRouter: '/main/processCenter',
      appName: 'base-app',
      accessRequired: ['BASE_WORKFLOW_CENTER_MANAGE'],
    },
    allApply: {
      name: 'allApply',
      label: "$t('common.page.allApply')",
      vueRouter: '/main/allApply',
      appName: 'base-app',
      accessRequired: ['BASE_WORKFLOW_MONITOR_MANAGE'],
    },

    organizationManage: {
      name: 'organizationManage',
      label: "$t('common.page.organizationManage')",
      vueRouter: '/main/organizationManage',
      appName: 'base-app',
      accessRequired: ['BASE_ORGANIZATION_MANAGE'],
    },
    user: {
      name: 'user',
      label: "$t('common.page.user')",
      vueRouter: '/main/user',
      appName: 'base-app',
      accessRequired: ['BASE_USER_MANAGE'],
    },
    group: {
      name: 'group',
      label: "$t('common.page.group')",
      vueRouter: '/main/group',
      appName: 'base-app',
      accessRequired: ['BASE_ROLE_MANAGE'],
    },
    userGroup: {
      name: 'userGroup',
      label: "$t('common.page.userGroup')",
      vueRouter: '/main/userGroup',
      appName: 'base-app',
      accessRequired: ['BASE_USER_GROUP_MANAGE'],
    },
    tagManage: {
      name: 'tagManage',
      label: "$t('common.page.tagManage')",
      vueRouter: '/main/dataStandard/tagManage',
      appName: 'base-app',
      accessRequired: ['BASE_TAG_VIEW'],
    },
    jobScheduler: {
      name: 'jobScheduler',
      label: "$t('common.page.jobScheduler')",
      vueRouter: '/main/jobScheduler',
      appName: 'base-app',
      accessRequired: ['BASE_TASK_SCHEDULER_MANAGE'],
    },
    jobMonitor: {
      name: 'jobMonitor',
      label: "$t('common.page.jobMonitor')",
      vueRouter: '/main/jobMonitor',
      appName: 'base-app',
      accessRequired: ['BASE_TASK_MONITOR_MANAGE'],
    },
    jobFile: {
      name: 'jobFile',
      label: "$t('common.page.jobFile')",
      vueRouter: '/main/jobFile',
      appName: 'base-app',
      accessRequired: ['BASE_TASK_FILE_MANAGE'],
    },
    setMail: {
      name: 'setMail',
      label: "$t('common.page.setMail')",
      vueRouter: '/main/setMail',
      appName: 'base-app',
      accessRequired: ['BASE_EMAIL_MANAGE'],
    },
    licenseManage: {
      name: 'licenseManage',
      label: "$t('common.page.licenseManage')",
      vueRouter: '/main/licenseManage',
      appName: 'base-app',
      accessRequired: ['BASE_LICENSE_MANAGE'],
    },
    // 控制面板的内容
    newConfigPane: {
      name: 'newConfigPane',
      label: "$t('common.page.configPane')",
      vueRouter: '/main/newConfigPane',
      appName: 'base-app',
      accessRequired: ['BASE_CONTROL_PANEL_MANAGE'],
    },
    dateTemplate: {
      name: 'dateTemplate',
      label: "$t('common.page.dateTemplate')",
      vueRouter: '/main/dateTemplate',
      appName: 'base-app',
      accessRequired: ['BASE_TIME_TEMPLATES_MANAGE'],
    },
    pluginManager: {
      name: 'pluginManager',
      label: "$t('common.page.plugInManager')",
      vueRouter: '/main/pluginManager',
      appName: 'base-app',
      accessRequired: ['BASE_PLUGIN_MANAGE'],
    },
    devLogs: {
      name: 'devLogs',
      label: "$t('common.page.devLogs')",
      vueRouter: '/main/devLogs',
      appName: 'base-app',
      accessRequired: ['SYSTEM_LOG_MANAGE'],
    },
    operationLog: {
      name: 'operationLog',
      label: "$t('common.page.operationLog')",
      vueRouter: '/main/operationLog',
      appName: 'base-app',
      accessRequired: ['FULL_OPERATION_LOG_MANAGE'],
    },
    dataCatalogDashboard: {
      name: 'dataCatalogDashboard',
      label: "$t('common.page.dataCatalogDashboard')",
      vueRouter: '/main/dashboard/dataCatalogDashboard',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['MAIN_ASSET_SUMMARY'],
      openByWindow: false,
    },
    searchGlobal1: {
      name: 'searchGlobal1',
      label: '全局搜索',
      vueRouter: '/main/searchGlobal1',
      appName: 'base-app',  
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_SEARCH'],
    },
    map: {
      name: 'map',
      label: "$t('common.page.map')",
      vueRouter: '/main/map',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['MAIN_SYS_DATA_MAP'],
    },
    dataCatalog: {
      name: 'dataCatalog',
      label: "$t('common.page.dataCatalog')",
      vueRouter: '/main/meta',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_VIEW'],
    },
    metaModel: {
      name: 'metaModel',
      label: "$t('common.page.metaModel')",
      vueRouter: '/main/metaModel',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_VIEW'],
    },
    dataCatalogForDDC: {
      name: 'dataCatalogForDDC',
      label: "$t('common.page.dataCatalog')",
      vueRouter: '/main/metaForDDC',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_VIEW'],
      hideLeftNav: true,
      hideInMenu: true,
    },
    reportFormManage: {
      name: 'reportFormManage',
      label: "$t('common.page.reportFormManage')",
      vueRouter: '/main/reportFormManage',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_REPORT_VIEW'],
    },
    metaFolder: {
      name: 'metaFolder',
      label: "$t('common.page.metaFolder')",
      vueRouter: '/main/metaFolder',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_FILE_VIEW'],
    },
    metaDatasource: {
      name: 'metaDatasource',
      label: "$t('common.page.dataResource')",
      vueRouter: '/main/metaDatasource',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_MODEL_VIEW'],
    },
    metadataQualityDetection: {
      name: 'metadataQualityDetection',
      label: "$t('common.page.metadataQualityDetection')",
      vueRouter: '/main/metadataQualityDetection',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA', 'METADATA_AQ_VIEW'], // 数据质量探查
    },
    metadataSimilarityCheck: {
      name: 'metadataSimilarityCheck',
      label: "$t('common.page.metadataSimilarityCheck')",
      vueRouter: '/main/metadataSimilarityCheck',
      appName: 'base-app',
      licenseRequired: ['FE_META'],
      accessRequired: ['METADATA_SAME'], // 相似度检查
    },
    metaDatasourceJob: {
      name: 'metaDatasourceJob',
      label: "$t('common.page.dataResource')",
      vueRouter: '/main/metaDatasourceJob',
      appName: 'base-app',
      accessRequired: null,
      hideInMenu: true,
    },
    lineageFile: {
      name: 'lineageFile',
      label: "$t('common.page.lineageFile')",
      vueRouter: '/main/systemManage/lineageFile',
      appName: 'base-app',
      licenseRequired: ['FE_LINEAGE'],
      accessRequired: ['BLODD_FILE', 'BLODD_VIEW'],
    },
    lineageCatalogue: {
      name: 'lineageCatalogue',
      label: "$t('common.page.lineageCatalogue')",
      vueRouter: '/main/systemManage/lineageCatalogue',
      appName: 'base-app',
      licenseRequired: ['FE_LINEAGE'],
      accessRequired: ['BLODD_FOLDER'],
    },
    scriptManage: {
      name: 'scriptManage',
      label: "$t('common.page.scriptManage')",
      vueRouter: '/main/systemManage/scriptManage',
      appName: 'base-app',
      licenseRequired: ['FE_LINEAGE'],
      accessRequired: ['BLODD_SCRIPT'],
    },
    dataStandardDashboard: {
      name: 'dataStandardDashboard',
      label: "$t('common.dashboard.domain')",
      vueRouter: '/main/dataStandard/dashboard',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_DASHBOARD'],
    },
    dataStandard: {
      name: 'dataStandard',
      label: "$t('common.page.dataStandard')",
      vueRouter: '/main/dataStandard',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_VIEW'],
    },
    abandonDomain: {
      name: 'abandonDomain',
      label: "$t('common.page.abandonDomain')",
      vueRouter: '/main/abandonDomain',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['ABOLISH_STANDARD_VIEW'],
    },
    code: {
      name: 'code',
      label: "$t('common.page.code')",
      vueRouter: '/main/dataStandard/code',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['STANDARD_CODE_VIEW'],
    },
    glossary: {
      name: 'glossary',
      label: "$t('common.page.glossary')",
      vueRouter: '/main/dataStandard/glossary',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['BUSI_TERM_VIEW'],
    },
    dataStandardField: {
      name: 'dataStandardField',
      label: "$t('common.page.dataStandardField')",
      vueRouter: '/main/dataStandardField',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_CATEGORY_VIEW'],
    },
    domainStandard: {
      name: 'domainStandard',
      label: "$t('common.page.domainStandard')",
      vueRouter: '/main/domainStandard',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: [
        'DATA_STANDARD_FIELD_MANAGE',
        'DATA_STANDARD_FIELD_VIEW',
      ],
    },
    index: {
      name: 'index',
      label: "$t('common.page.index')",
      vueRouter: '/main/index',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_DIM_VIEW'],
    },
    dimension: {
      name: 'dimension',
      label: "$t('common.page.dimension')",
      vueRouter: '/main/dimension',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_DIM_CATALOG_VIEW'],
    },
    dataFind: {
      name: 'dataFind', // 智能对标
      label: "$t('common.page.dataFind')",
      vueRouter: '/main/dataFind',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['INTELLIGENT_VIEW'],
    },
    domainCluster: {
      name: 'domainCluster', // 聚合推荐
      label: "$t('common.page.domainCluster')",
      vueRouter: '/main/domainCluster',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['RECOMMENDED_VIEW'],
    },
    domainVertify: {
      name: 'domainVertify', // 自动核标
      label: "$t('common.page.domainVertify')",
      vueRouter: '/main/domainVertify',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['EXAMINATION_VIEW'],
    },
    similarityCheck: {
      name: 'similarityCheck', // 相似度检查
      label: "$t('common.page.similarityCheck')",
      vueRouter: '/main/similarityCheck',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['SIMILARITY_CHECK_VIEW'],
    },
    queryStandard: {
      name: 'queryStandard',
      label: "$t('common.page.queryStandard')",
      vueRouter: '/main/dataStandard/queryStandard',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_STATISTICS_VIEW'],
    },
    domainSetting: {
      name: 'domainSetting',
      label: "$t('common.page.domainSetting')",
      vueRouter: '/main/domainSetting',
      appName: 'domain-app',
      licenseRequired: ['FE_DOMAIN'],
      accessRequired: ['DATA_STANDARD_PARAM_MANAGE'],
    },
    homePage: {
      name: 'homePage',
      label: "$t('common.page.homePage')",
      vueRouter: '/main/homePage',
      appName: 'domain-app',
    },
    dimensionDefinition: {
      name: 'dimensionDefinition',
      label: "$t('common.page.dimensionDefinition')",
      vueRouter: '/main/dimensionDefinition',
      appName: 'domain-app',
    },
    indexDefinition: {
      name: 'indexDefinition',
      label: "$t('common.page.indexDefinition')",
      vueRouter: '/main/indexDefinition',
      appName: 'domain-app',
    },
    demandManagement: {
      name: 'demandManagement',
      label: "$t('common.page.demandManagement')",
      vueRouter: '/main/demandManagement',
      appName: 'domain-app',
    },
    themeDirectory: {
      name: 'themeDirectory',
      label: "$t('common.page.themeDirectory')",
      vueRouter: '/main/themeDirectory',
      appName: 'domain-app',
    },
    autonomousQuery: {
      name: 'autonomousQuery',
      label: "$t('common.page.autonomousQuery')",
      vueRouter: '/main/autonomousQuery',
      appName: 'domain-app',
    },
    dataQualityDashboard: {
      name: 'dataQualityDashboard', // 驾驶舱
      label: "$t('common.page.dataQualityDashboard')",
      vueRouter: '/main/dataQuality/dashboard',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_COCKPIT_VIEW'],
    },
    ruleReport: {
      name: 'ruleReport', // 规则报告
      label: "$t('common.page.ruleReport')",
      vueRouter: '/main/dataQuality/ruleReport',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_PLANNING_REPORT_VIEW'],
    },
    problemReport: {
      name: 'problemReport', // 问题报告
      label: "$t('common.page.problemReport')",
      vueRouter: '/main/dataQuality/problemReport',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_PROBLEM_REPORTING_VIEW'],
    },
    ruleTemplate: {
      name: 'ruleTemplate', // 规则模板
      label: "$t('common.page.ruleTemplate')",
      vueRouter: '/main/dataQuality/ruleTemplate',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_RULE_TEMPLATE_VIEW'],
    },
    dataQualityRules: {
      name: 'dataQualityRules', // 业务规则
      label: "$t('common.page.dataQualityRules')",
      vueRouter: '/main/dataQuality/rules',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: [
        'QUALITY_BUSINESS_RULE_VIEW_MY',
        'QUALITY_BUSINESS_RULE_VIEW_ALL',
      ],
    },
    qualityRule: {
      name: 'qualityRule', // 技术规则
      label: "$t('common.page.qualityRule')",
      vueRouter: '/main/dataQuality/qualityRule',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: [
        'QUALITY_TECHNICAL_REGULATION_VIEW_MY',
        'QUALITY_TECHNICAL_REGULATION_VIEW_ALL',
      ],
    },
    qualityExamineJob: {
      name: 'qualityExamineJob', // 检核任务
      label: "$t('common.page.qualityExamineJob')",
      vueRouter: '/main/dataQuality/examineJob',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: [
        'QUALITY_CHECK_TASK_VIEW_MY',
        'QUALITY_CHECK_TASK_VIEW_ALL',
      ],
    },
    dataQualityRepairJob: {
      name: 'dataQualityRepairJob', // 问题清单
      label: "$t('common.page.dataQualityRepairJob')",
      vueRouter: '/main/dataQuality/repairJob',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: [
        'QUALITY_ISSUE_LIST_VIEW_MY',
        'QUALITY_ISSUE_LIST_VIEW_ALL',
      ],
    },
    dataQualityCheck: {
      name: 'dataQualityCheck', // 问题核验
      label: "$t('common.page.dataQualityCheck')",
      vueRouter: '/main/dataQuality/check',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: [
        'QUALITY_PROBLEM_CHECK_VIEW_MY',
        'QUALITY_PROBLEM_CHECK_VIEW_ALL',
      ],
    },
    knowledgebase: {
      name: 'knowledgebase', // 知识库管理
      label: "$t('common.page.knowledgebase')",
      vueRouter: '/main/knowledge',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_KBM_VIEW'],
    },
    settingList: {
      name: 'settingList', // 参数设置
      label: "$t('common.page.settingList')",
      vueRouter: '/main/settingList',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_PARAMETER_SETTING'],
    },
    qualityAssurance: {
      name: 'qualityAssurance', // 质量权限管理
      label: "$t('common.page.qualityAssurance')",
      vueRouter: '/main/dataQuality/qualityAssurance',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_UNI_CATALOG_MANAGE'],
    },
    problemProgramme: {
      name: 'problemProgramme', // 问题分配方案
      label: "$t('common.page.problemProgramme')",
      vueRouter: '/main/dataQuality/problemProgramme',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['QUALITY_TASK_DATA_DISPATCH_DOC'],
    },
    ruleTypeSetting: {
      name: 'ruleTypeSetting', // 规则类型设置
      label: "$t('common.page.ruleTypeSetting')",
      vueRouter: '/main/dataQuality/ruleTypeSetting',
      appName: 'base-app',
      licenseRequired: ['FE_QUALITY'],
      accessRequired: ['RULE_TYPE_MANAGE'],
    },
    // dds
    serviceOverviewDam: {
      name: 'serviceOverviewDam',
      label: '服务总览',
      vueRouter: '/main/serviceOverview',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['DDS_COCKPIT_VIEW'],
    },
    apiOverview: {
      name: 'apiOverview',
      label: 'API市场',
      vueRouter: '/main/apiOverview',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: [
        'API_DEVELOP_ALL',
        'API_DEVELOP_VIEW',
        'API_DEVELOP_APPLYING',
      ],
    },
    applyOverview: {
      name: 'applyOverview',
      label: '应用列表',
      vueRouter: '/main/applyOverview',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: [
        'APP_MANAGE_ALL',
        'APP_MANAGE_VIEW',
        'APP_MANAGE_APPLYING',
      ],
    },

    manageApi: {
      name: 'manageApi',
      label: '管理API',
      vueRouter: '/main/manageApi',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['API_DEVELOP_ADMIN'],
    },
    manageApp: {
      name: 'manageApp',
      label: '管理应用',
      vueRouter: '/main/manageApp',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['APP_MANAGE_ADMIN'],
    },

    apiAudit: {
      name: 'apiAudit',
      label: 'API审核',
      vueRouter: '/main/apiAudit',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['API_DEVELOP_AUTH'],
    },
    applyAudit: {
      name: 'applyAudit',
      label: '应用审核',
      vueRouter: '/main/applyAudit',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: [
        'APP_MANAGE_ALL',
        'APP_MANAGE_VIEW',
        'APP_MANAGE_APPLYING',
      ],
    },
    requestApi: {
      name: 'requestApi',
      label: '我申请的API',
      vueRouter: '/main/requestApi',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['API_DEVELOP_APPLY'],
    },
    devApi: {
      name: 'devApi',
      label: '我开发的API',
      vueRouter: '/main/devApi',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['API_DEVELOP_FOUND'],
    },
    requestApp: {
      name: 'requestApp',
      label: '我申请的应用',
      vueRouter: '/main/requestApp',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['APP_MANAGE_APPLY'],
    },
    devApp: {
      name: 'devApp',
      label: '我创建的应用',
      vueRouter: '/main/devApp',
      appName: 'base-app',
      licenseRequired: ['FE_DATASERVICE'],
      accessRequired: ['APP_MANAGE_CREATE'],
    },
    // 指标管理
    dimensionDefinitionNew: {
      name: 'dimensionDefinitionNew',
      label: '维度定义',
      vueRouter: '/main/dimensionDefinitionNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_DIMENSION'],
    },
    indexDefinitionNew: {
      name: 'indexDefinitionNew',
      label: '原子/衍生指标',
      vueRouter: '/main/indexDefinitionNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_ATOM'],
    },
    forkIndexDefinitionNew: {
      name: 'forkIndexDefinitionNew',
      label: '派生指标',
      vueRouter: '/main/forkIndexDefinitionNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_DERIVE'],
    },
    indexModifierNew: {
      name: 'indexModifierNew',
      label: '修饰词管理',
      vueRouter: '/main/indexModifierNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_MODIFIER'],
    },
    indexTimerNew: {
      name: 'indexTimerNew',
      label: '时间周期管理',
      vueRouter: '/main/indexTimerNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_TIME'],
    },
    themeDirectoryNew: {
      name: 'themeDirectoryNew',
      label: '主题目录',
      vueRouter: '/main/themeDirectoryNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_TOPIC'],
    },
    autonomousQueryNew: {
      name: 'autonomousQueryNew',
      label: '自主查询',
      vueRouter: '/main/autonomousQueryNew',
      appName: 'base-app',
      licenseRequired: ['FE_METRIC'],
      accessRequired: ['METRIC_INDEX_SEARCHSELF'],
    },
    ...ddcPageMap,
    ...ddsPageTree,
    ...ddsGwPageTree,
    ...ddmPageMap,
    ...dddPageMap,
  },
  pages: [
    // ...ddm,
  ],
}
// window.$directory = directory;
export default directory
