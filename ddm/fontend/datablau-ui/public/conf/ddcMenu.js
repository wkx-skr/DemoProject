const pageMap= {
  assetAnalysis: {
    name: "assetAnalysis", // 资产分析
    label: "$t('common.page.assetAnalysis')",
    vueRouter: "/main/dataAsset/analysis",
    appName: "ddc-app",
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
    name: "dataMarketplace", // 数据市场
    label: "$t('common.page.dataMarketplace')",
    vueRouter: "/main/dataAsset/marketplace",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_MARKET_MANAGE'],
    openByWindow: true
  },
  assetDirManage: {
    name: "assetDirManage", // 数据资产管理
    label: "$t('common.page.assetDirManage')",
    vueRouter: "/main/dataAsset/manage",
    appName: "ddc-app",
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_MANAGE'],
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
    name: "directoryStructure", // 目录空间设计
    label: "$t('common.page.directoryStructure')",
    vueRouter: "/main/dataAsset/directoryStructure",
    appName: "ddc-app",
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_CATALOG_STRUCTURE_MANAGE'],
  },
  generalSetting: {
    name: "generalSetting", // 目录类型设置
    label: "$t('common.page.generalSetting')",
    vueRouter: "/main/dataAsset/generalSetting",
    appName: "ddc-app",
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_CATALOG_TYPE_MANAGE'],
  },
  logsRecord: {
    name: "logsRecord", // 日志记录
    label: "$t('common.page.logsRecord')",
    vueRouter: "/main/dataAsset/logsRecord",
    appName: "ddc-app",
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_LOG_MANAGE'],
  },
  taskManage: {
    name: "taskManage", // 任务管理
    label: "$t('common.page.taskManage')",
    vueRouter: "/main/dataAsset/taskManage",
    appName: "ddc-app",
    licenseRequired: ['FE_ASSETS'],
    accessRequired: ['DATA_ASSET_CATALOG_TASK_MANAGE'],
  },
  tableDetails: {
    name: "tableDetails", // 表详情
    label: "",
    vueRouter: "/main/dataAsset/details/table",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  viewDetails: {
    name: "viewDetails", // 表详情
    label: "",
    vueRouter: "/main/dataAsset/details/view",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  catalogDetails: {
    name: "catalogDetails", // 目录详情
    label: "",
    vueRouter: "/main/dataAsset/details/catalog",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  columnDetails: {
    name: "columnDetails", // 数据项详情
    label: "",
    vueRouter: "/main/dataAsset/details/column",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  fileDetails: {
    name: "fileDetails", // 文件详情
    label: "",
    vueRouter: "/main/dataAsset/details/file",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  reportDetails: {
    name: "reportDetails", // 报表详情
    label: "",
    vueRouter: "/main/dataAsset/details/report",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
  },
  assetCart: {
    name: "assetCart", // 购物车
    label: "$t('common.page.assetCart')",
    vueRouter: "/main/dataAsset/assetCart",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
    accessRequired:['DATA_ASSET_MARKET_MANAGE'],
  },
  assetsSupermarket: {
    name: "assetsSupermarket", // 数据超市
    label: "$t('common.page.assetsSupermarket')",
    vueRouter: "/main/dataAsset/supermarket",
    appName: "ddc-app",
    hideLeftNav: true,
    hidePageHeading: true,
    hide: true,
    hideInMenu: true,
    accessRequired:['DATA_ASSET_MARKET_MANAGE'],
  },
}
const pageTree = {
  "$t('common.page.数据资产')": {
    "$t('common.page.assetApplication')": [
        "assetAnalysis",
        // "assetHome",
        // "assetOverview",
        "dataMarketplace",
    ],
    "$t('common.page.assetManage')": [
        "assetDirManage",
    ],
    // "$t('common.page.assetWorkbench')": [
    //     "myAsset",
    //     "myAssetApply",
    //     "myAssetTodo",
    // ],
    "$t('common.page.assetSystemManage')": [
        "directoryStructure",
        "generalSetting",
        "logsRecord",
        "taskManage",
    ]
}
}

export default {
	ddcPageMap: pageMap,
	ddcPageTree: pageTree
}