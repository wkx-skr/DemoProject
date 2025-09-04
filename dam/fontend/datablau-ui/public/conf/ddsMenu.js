const pageMapDds = {
  "$t('common.page.数据安全')": {
    "$t('common.page.securityOverview')": [
      "assetCount",
    ],
    "$t('common.page.enterpriseDataManagement')": [
      "informationItems",
      "accessControl",
      "dataLevel",
      "statutoryProvisions",
    ],
    "$t('common.page.classificationTool')": [
      "reviewAndRelease",
      "intelligenceClassification",
      "coordinationClassification",
      // "dataCatalogForDDC",
    ],
    "$t('common.page.securityPolicy')": [
      "accessStrategy",
      "datamaskingRule",
    ],
    "$t('common.page.securitySystemManage')": [
      "classificationStructure",
      "itemParamConfig",
      "algorithm",
    ],
    // "$t('common.page.gatewayManager')": [
    //   "dataSecurityGateway",
    //   "logAudit",
    //   "logging",
    // ],
  }
}
const pageIconDds = {
  "$t('common.page.securityOverview')": 'icon-menu-fwzl',
  "$t('common.page.enterpriseDataManagement')": 'icon-menu-flfj',
  "$t('common.page.classificationTool')": 'icon-menu-flfjtool',
  "$t('common.page.securityPolicy')": 'icon-accesspolicy',
  "$t('common.page.securitySystemManage')": 'icon-menu-xtgl',
  // "$t('common.page.gatewayManager')": 'icon-menu-aqwg',
}
const pageTreeDds = {
  // dataCatalogForDDC: {
  //   name: 'dataCatalogForDDC',
  //   label: '元数据',
  //   vueRouter: '/main/metaForDDC',
  //   appName: "base-app",
  //   hideInMenu: true,
  //   hideLeftNav: true,
  // },
  assetCount: {
    name: "assetCount", // 安全概览
    label: "$t('common.page.assetCount')",
    vueRouter: "/main/assetCount",
    appName: "dds-app",
    accessRequired: ["MAIN_DATA_AUTH_DASHBOARD"],
    licenseRequired: ['FE_SECURITY'],
  },
  informationItems: {
    name: "informationItems", // 分类信息项
    label: "$t('common.page.informationItems')",
    vueRouter: "/main/informationItems",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_AUTH_STANDARD_MANAGE", "DATA_SECURITY_AUTH_STANDARD", "DATA_SECURITY_AUTH_STANDARD_CATALOG_MANAGE", "DATA_SECURITY_AUTH_STANDARD_CATALOG"],
    licenseRequired: ['FE_SECURITY'],
  },
  accessControl: {
    name: "accessControl", // 数据分类
    label: "$t('common.page.accessControl')",
    vueRouter: "/main/accessControl",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_CATALOG_MANAGE", "DATA_SECURITY_CATALOG", "DATA_SECURITY_ASSET_MANAGE"],
    licenseRequired: ['FE_SECURITY'],
  },
  dataLevel: {
    name: "dataLevel", // 数据分级
    label: "$t('common.page.dataLevel')",
    vueRouter: "/main/dataLevel",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_LEVEL_MANAGE", "DATA_SECURITY_LEVEL"],
    licenseRequired: ['FE_SECURITY'],
  },
  statutoryProvisions: {
    name: "statutoryProvisions", // 法规条文
    label: "$t('common.page.statutoryProvisions')",
    vueRouter: "/main/statutoryProvisions",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_REGULATION_MANAGE", "DATA_SECURITY_REGULATION"],
    licenseRequired: ['FE_SECURITY'],
  },
  reviewAndRelease: {
    name: "reviewAndRelease", // 评审与发布
    label: "$t('common.page.reviewAndRelease')",
    vueRouter: "/main/reviewAndRelease",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_REVIEW_PUBLISH"],
    licenseRequired: ['FE_SECURITY'],
  },
  intelligenceClassification: {
    name: "intelligenceClassification", // 智能分类分级
    label: "$t('common.page.intelligenceClassification')",
    vueRouter: "/main/intelligenceClassification",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_DISCERN_RULE_MANAGE", "DATA_SECURITY_DISCERN_RULE", "DATA_SECURITY_DISCERN_TASK_MANAGE", "DATA_SECURITY_DISCERN_TASK", "DATA_SECURITY_DISCERN_RESULT_MANAGE", "DATA_SECURITY_DISCERN_RESULT"],
    licenseRequired: ['FE_SECURITY'],
  },
  coordinationClassification: {
    name: "coordinationClassification", // 协同分类分级
    label: "$t('common.page.coordinationClassification')",
    vueRouter: "/main/coordinationClassification",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_ASSET_IMPORT", "DATA_SECURITY_ASSET_EXPORT", "DATA_SECURITY_CATALOG_ELEMENT_MANAGE"],
    licenseRequired: ['FE_SECURITY'],
  },
  accessStrategy: {
    name: "accessStrategy", // 访问策略
    label: "$t('common.page.accessStrategy')",
    vueRouter: "/main/accessStrategy",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_STRATEGY_MANAGE", "DATA_SECURITY_STRATEGY", "DATA_SECURITY_ACCESS_CATALOG_MANAGE", "DATA_SECURITY_ACCESS_CATALOG_VIEW"],
    licenseRequired: ['FE_SECURITY'],
  },
  datamaskingRule: {
    name: "datamaskingRule", // 脱敏规则管理
    label: "$t('common.page.datamaskingRule')",
    vueRouter: "/main/datamaskingRule",
    appName: "dds-app",
    accessRequired: ["MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE"],
    licenseRequired: ['FE_SECURITY'],
  },
  classificationStructure: {
    name: "classificationStructure", // 数据分类设计
    label: "$t('common.page.classificationStructure')",
    vueRouter: "/main/classificationStructure",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_STRUCTURE_MANAGE"],
    licenseRequired: ['FE_SECURITY'],
  },
  itemParamConfig: {
    name: "itemParamConfig", // 参数配置
    label: "$t('common.page.itemParamConfig')",
    vueRouter: "/main/itemParamConfig",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_PARAM_SETTING_MANAGE"],
    licenseRequired: ['FE_SECURITY'],
  },
  algorithm: {
    name: "algorithm", // 识别算法
    label: "$t('common.page.algorithm')",
    vueRouter: "/main/algorithm",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_DISCERN_ALGORITHM_MANAGE", "DATA_SECURITY_DISCERN_ALGORITHM", "DATA_SECURITY_DISCERN_CC", "DATA_SECURITY_DISCERN_ML", "DATA_SECURITY_DISCERN_ALGORITHM_CATALOG", "DATA_SECURITY_DISCERN_ALGORITHM_CATALOG_MANAGE"],
    licenseRequired: ['FE_SECURITY'],
  },
}
export default {
  ddsPageMap: pageMapDds,
  ddsIconMap: pageIconDds,
  ddsPageTree: pageTreeDds
}