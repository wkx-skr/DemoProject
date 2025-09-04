const pageMap = {
  assetAnalysis: {
    name: 'assetAnalysis', // 资产分析
    label: "$t('common.page.assetAnalysis')",
    vueRouter: '/main/dataAsset/analysis',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_ANALYSE_MANAGE'],
  },
  // assetHome: {
  //   name: "assetHome", // 资产门户
  //   label: "$t('common.page.assetHome')",
  //   vueRouter: "/main/dataAsset/home",
  //   appName: "ddc-app",
  //   hideLeftNav: true,
  //   hidePageHeading: true,
  //   licenseRequired: ['FE_ASSETS'],
  //   accessRequired: ['DATA_ASSET_DOOR_MANAGE'],
  //   openByWindow: true,
  // },
  // assetOverview: {
  //   name: "assetOverview", // 资产浏览
  //   label: "$t('common.page.assetOverview')",
  //   vueRouter: "/main/dataAsset/overview",
  //   appName: "ddc-app",
  //   hideLeftNav: true,
  //   // hidePageHeading: true,
  //   licenseRequired: ['FE_ASSETS'],
  //   accessRequired: ['DATA_ASSET_DOOR_MANAGE'],
  //   openByWindow: true
  // },
  dataMarketplace: {
    name: 'dataMarketplace', // 数据市场
    label: "$t('common.page.dataMarketplace')",
    vueRouter: '/main/dataAsset/marketplace',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_MARKET_MANAGE'],
    openByWindow: true,
  },
  assetRecognition: {
    name: 'assetRecognition', // 数据资产识别
    label: "$t('common.page.assetRecognition')",
    vueRouter: '/main/dataAsset/recognition',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: [
      'IDENTIFY_TASK_MANAGE',
      'IDENTIFY_TASK_CATALOG_VIEW',
      'IDENTIFY_RULE_IMPORT',
      'DATA_ASSET_DISCERN_ALGORITHM_CATALOG',
      'DATA_ASSET_DISCERN_ALGORITHM_MANAGE',
      'IDENTIFY_RULE_VIEW',
      'RECOMMEND_RESULT_VIEW',
      'IDENTIFY_RULE_CATALOG_VIEW',
      'DATA_ASSET_DISCERN_ALGORITHM',
      'RECOMMEND_RESULT_MANAGE',
      'IDENTIFY_TASK_CATALOG_MANAGE',
      'DATA_ASSET_DISCERN_ALGORITHM_UPLOAD',
      'IDENTIFY_TASK_VIEW',
      'IDENTIFY_RULE_MANAGE',
      'IDENTIFY_RULE_CATALOG_MANAGE',
      'DATA_ASSET_DISCERN_ALGORITHM_DOWNLOAD',
      'DATA_ASSET_DISCERN_ALGORITHM_CATALOG_MANAGE',
      'IDENTIFY_RULE_EXPORT',
    ],
  },
  assetDirManage: {
    name: 'assetDirManage', // 数据资产管理
    label: "$t('common.page.assetDirManage')",
    vueRouter: '/main/dataAsset/manage',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_MANAGE'],
  },
  dopList: {
    name: 'dopList',
    label: '批次管理',
    vueRouter: '/main/dopList',
    appName: 'ddc-app',
    licenseRequired: ['FE_DOMAIN'],
    accessRequired: ['APPLY_VIEW'],
  },
  metaModelCollect: {
    name: 'metaModelCollect', // 模型元数据采集
    label: "$t('common.page.metaModelCollect')",
    vueRouter: '/main/dataAsset/metaModelCollect',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_COLLECT_MANAGE'],
  },
  metaModelQuery: {
    name: 'metaModelQuery', // 模型元数据查询
    label: "$t('common.page.metaModelQuery')",
    vueRouter: '/main/dataAsset/metaModelQuery',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_ELEMENT_MANAGE'],
  },
  techModelCollect: {
    name: 'techModelCollect', // 技术元数据采集
    label: "$t('common.page.techModelCollect')",
    licenseRequired: ['FE_META'],
    accessRequired: ['METADATA_MODEL_VIEW'],
    isMapPage: true, // 是否是映射到已经有的页面
    mapAppName: 'base-app', // 映射到的应用名称
    mapVueRouter: '/main/metaDatasource', // 映射到的路由
  },
  mapDataStandardDashboard: {
    name: 'mapDataStandardDashboard', // 技术元数据采集
    label: "$t('common.page.domain')",
    licenseRequired: ['FE_DOMAIN'],
    accessRequired: ['DATA_STANDARD_DASHBOARD'],
    isMapPage: true, // 是否是映射到已经有的页面
    mapAppName: 'domain-app', // 映射到的应用名称
    mapVueRouter: '/main/dataStandard/dashboard', // 映射到的路由
  },
  mapList: {
    name : 'mapList', // 映射列表
    label: "$t('common.page.dataModel')",
    isMapPage: true, // 是否是映射到已经有的页面
    mapAppName: 'ddm-app', // 映射到的应用名称
    mapVueRouter: '/main/list', // 映射到的路由
  },
  modelAutoMapping: {
    name: 'modelAutoMapping', // 模型映射任务
    label: "$t('common.page.modelAutoMapping')",
    vueRouter: '/main/dataAsset/modelAutoMapping',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_AUTO_MAPPING_MANAGE'],
  },
  modelMappingManage: {
    name: 'modelMappingManage', // 模型映射管理
    label: "$t('common.page.modelMappingManage')",
    vueRouter: '/main/dataAsset/modelMappingManage',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_MANUAL_MANAGE'],
  },
  metaDataAutoMapping: {
    name: 'metaDataAutoMapping', // 元数据映射任务
    label: "$t('common.page.metaDataAutoMapping')",
    vueRouter: '/main/dataAsset/metaDataAutoMapping',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_META_DATA_AUTO_MAPPING_MANAGE'],
  },
  metaDataMappingManage: {
    name: 'metaDataMappingManage', // 元数据映射管理
    label: "$t('common.page.metaDataMappingManage')",
    vueRouter: '/main/dataAsset/metaDataMappingManage',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_META_DATA_MANUAL_MAPPING_MANAGE'],
  },
  designDropInspection: {
    name: 'designDropInspection', // 数据模型核查
    label: "$t('common.page.designDropInspection')",
    vueRouter: '/main/dataAsset/designDropInspection',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_DESIGN_LABEL_DROP_MANAGE'],
  },
  techDropInspection: {
    name: 'techDropInspection', // 技术落标检查
    label: "$t('common.page.techDropInspection')",
    vueRouter: '/main/dataAsset/techDropInspection',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_TECH_LABEL_DROP_MANAGE'],
  },
  dataFlowManagement: {
    name: 'dataFlowManagement',
    label: "$t('common.page.dataFlowManagement')",
    vueRouter: '/main/dataAsset/dataFlowManagement',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_FLOW_MANAGE'],
  },
  dataFlowDiagrams: {
    name: 'dataFlowDiagrams',
    label: "$t('common.page.dataFlowDiagrams')",
    vueRouter: '/main/dataAsset/dataFlowDiagrams',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_FLOW_DIAGRAM_MANAGE'],
  },
  // myAsset: {
  //   name: "myAsset", // 我的资产
  //   label: "$t('common.page.myAsset')",
  //   vueRouter: "/main/dataAsset/myAsset",
  //   appName: "ddc-app",
  // },
  // myAssetApply: {
  //   name: "myAssetApply", // 我的申请
  //   label: "$t('common.page.myAssetApply')",
  //   vueRouter: "/main/dataAsset/myApply",
  //   appName: "ddc-app",
  // },
  // myAssetTodo: {
  //   name: "myAssetTodo", // 办理事项
  //   label: "$t('common.page.workItems')",
  //   vueRouter: "/main/dataAsset/myTodo",
  //   appName: "ddc-app",
  // },
  directoryStructure: {
    name: 'directoryStructure', // 目录空间设计
    label: "$t('common.page.directoryStructure')",
    vueRouter: '/main/dataAsset/directoryStructure',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_CATALOG_STRUCTURE_MANAGE'],
  },
  generalSetting: {
    name: 'generalSetting', // 目录类型设置
    label: "$t('common.page.generalSetting')",
    vueRouter: '/main/dataAsset/generalSetting',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_CATALOG_TYPE_MANAGE'],
  },
  logsRecord: {
    name: 'logsRecord', // 日志记录
    label: "$t('common.page.logsRecord')",
    vueRouter: '/main/dataAsset/logsRecord',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_LOG_MANAGE'],
  },
  taskManage: {
    name: 'taskManage', // 任务管理
    label: "$t('common.page.taskManage')",
    vueRouter: '/main/dataAsset/taskManage',
    appName: 'ddc-app',
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_CATALOG_TASK_MANAGE'],
  },
  tableDetails: {
    name: 'tableDetails', // 表详情
    label: '',
    vueRouter: '/main/dataAsset/details/table',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  metaModelDetails: {
    name: 'metaModelDetails', // 表详情
    label: '',
    vueRouter: '/main/dataAsset/details/metaModel',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  viewDetails: {
    name: 'viewDetails', // 表详情
    label: '',
    vueRouter: '/main/dataAsset/details/view',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  catalogDetails: {
    name: 'catalogDetails', // 目录详情
    label: '',
    vueRouter: '/main/dataAsset/details/catalog',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  columnDetails: {
    name: 'columnDetails', // 数据项详情
    label: '',
    vueRouter: '/main/dataAsset/details/column',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  fileDetails: {
    name: 'fileDetails', // 文件详情
    label: '',
    vueRouter: '/main/dataAsset/details/file',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  reportDetails: {
    name: 'reportDetails', // 报表详情
    label: '',
    vueRouter: '/main/dataAsset/details/report',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  assetCart: {
    name: 'assetCart', // 购物车
    label: "$t('common.page.assetCart')",
    vueRouter: '/main/dataAsset/assetCart',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
    accessRequired: ['DATA_ASSET_MARKET_MANAGE'],
  },
  assetsSupermarket: {
    name: 'assetsSupermarket', // 数据超市
    label: "$t('common.page.assetsSupermarket')",
    vueRouter: '/main/dataAsset/supermarket',
    appName: 'ddc-app',
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
    accessRequired: ['DATA_ASSET_MARKET_MANAGE'],
  },
}
const pageTree = {
  "$t('common.page.数据资产')": {
    "$t('common.page.assetApplication')": [
      'assetAnalysis',
      'assetDirManage',
      // "assetHome",
      // "assetOverview",
      // "dataMarketplace",
    ],
    "$t('common.page.domain')": ['mapDataStandardDashboard'],
    "$t('common.page.dataModel')": ['mapList'],
    "$t('common.page.dataFlow')": ['dataFlowManagement', 'dataFlowDiagrams'],
    // "$t('common.page.assetManage')": [
    //   // "assetRecognition",
    // ],
    // 元数据采集模块
    "$t('common.page.assetMetadataCollection')": [
      // 在这里增加 模型元数据采集，模型元数据查询，技术元数据采集 模块
      'metaModelCollect',
      'metaModelQuery',
      'techModelCollect',
    ],
    "$t('common.page.assetModelMapping')": [
      // 在这里增加模型映射任务和模型映射管理模块
      'modelAutoMapping',
      'modelMappingManage',
    ],
    // 元数据映射模块
    "$t('common.page.assetMetadataMapping')": [
      // 在这里增加元数据映射任务和元数据映射管理模块
      'metaDataAutoMapping',
      'metaDataMappingManage',
    ],
    "$t('common.page.droppingInspection')": [
      'designDropInspection',
      'techDropInspection',
    ],
    // "$t('common.page.assetWorkbench')": [
    //     "myAsset",
    //     "myAssetApply",
    //     "myAssetTodo",
    // ],
    "$t('common.page.assetSystemManage')": [
      'directoryStructure',
      'generalSetting',
      // "logsRecord",
      // "taskManage",
    ],
    "$t('common.page.batchManager')": ['dopList'],
  },
}

export default {
  ddcPageMap: pageMap,
  ddcPageTree: pageTree,
}
