/**
 * 数据标准 dashboard 组件
 */
import domainDashboard from '@/view/newDataStandard/dashboard/index.js'
const vThis = window.vueThis
let [
  termsTopCount,
  domainTopCount,
  codeTopCount,
  standardBusinessDistributionChart,
  publishingBusinessTermsTop5Chart,
  oneyearStandardsReleaseTrendsChart,
  standardSpecificationData,
  cumulativeApprovalsPerYear,
  governanceDataStandards,
  // domainQuoteTop,
  // departmentDomainCount,
  // departmentDomainQuote,
  // domainQuoteTrend,
  // systemDomainQuote,
  // themeDomainQuote,

  // indexTopCount,
  // nameRuleTopCount,
  // dimTopCount,
] = domainDashboard

const componentsOfVue = {
  components: {
    termsTopCount,
    domainTopCount,
    codeTopCount,
    standardBusinessDistributionChart,
    publishingBusinessTermsTop5Chart,
    oneyearStandardsReleaseTrendsChart,
    standardSpecificationData,
    cumulativeApprovalsPerYear,
    governanceDataStandards,
    // 数据标准
    // themeDomainQuote,
    // domainQuoteTop,
    // departmentDomainCount,
    // departmentDomainQuote,
    // domainQuoteTrend,
    // systemDomainQuote,
    // indexTopCount,
    // nameRuleTopCount,
    // dimTopCount,
  },
}

/*
组件的api调用可以通过下列配置进行托管。避免多重复调用相同API。组件使用rootData属性进行接收。
框架将确保rootData已经产生才渲染组件。
如果是专用API，你也可以在自己的组件内自行安排，不必在此处配置
 */
const componentsApiUrl = {
  otherStatistics: '/service/dashboard/quality/main',
  dataSource: '/service/dashboard/main',
  domain: '/service/dashboard/main',
  domainCount: '/service/dashboard/domain/count',
}

/*
组件的默认格子占用,如果不设置，默认为 1 * 1,如果width或height缺省，也默认为 1
 */
const componentsDefaultSize = {
  topPerson: {
    width: 3,
    height: 5,
  },
  problemDetail: {
    width: 5,
    height: 5,
  },
  catalogCountList: {
    width: window.setting.metadata_Report ? 5 : 4,
    height: 4,
  },
  searchHead: {
    width: 10,
    height: 1,
  },
  allQuestionsNum: {
    width: 2,
    height: 2,
  },
  problemRecordNum: {
    width: 2,
    height: 2,
  },
  overdueIssuesNum: {
    width: 2,
    height: 2,
  },
  overdueProblemRecordNum: {
    width: 2,
    height: 2,
  },
  // metadataCoverage: {
  //   width: 2,
  //   height: 2,
  // },
  customModule: {
    width: 4,
    height: 8,
  },
  problemArea: {
    width: 4,
    height: 4,
  },
  problemSystem: {
    width: 4,
    height: 4,
  },
  importance: {
    width: 2,
    height: 3,
  },
  ruleSource: {
    width: 3,
    height: 3,
  },
  ruleType: {
    width: 3,
    height: 3,
  },
  hisProblemsOverdue: {
    width: 8,
    height: 5,
  },
  hisOverdueStatistics: {
    width: 4,
    height: 4,
  },
  overdueDistribution: {
    width: 4,
    height: 4,
  },
  problemSummary: {
    width: 8,
    height: 5,
  },
  problemStatistics: {
    width: 2,
    height: 1,
  },
  ruleStatistics: {
    width: 2,
  },
  systemStatistics: {
    width: 2,
  },
  otherStatistics: {
    width: 2,
  },
  callActive: {
    width: 5,
    height: 4,
  },
  callCount: {
    width: 5,
    height: 4,
  },
  apiCount: {
    width: 2,
    height: 1,
  },
  appCount: {
    width: 2,
    height: 1,
  },
  apiCall: {
    width: 2,
    height: 1,
  },
  apiCallMonth: {
    width: 2,
    height: 1,
  },
  apiSuccessRate: {
    width: 2,
    height: 1,
  },
  callList: {
    width: 10,
    height: 6,
  },
  overview: {
    width: 10,
    height: 1,
  },
  dataQualiyToDo: {
    width: 7,
    height: 4,
  },
  infoList: {
    width: 3,
    height: 4,
  },
  taskAndApply: {
    width: 7,
    height: 4,
  },
  toDoTaskRelease: {
    width: 3,
    height: 4,
  },
  systemCountEchart: {
    width: 1,
    height: 1,
  },
  everyFolderCount: {
    width: 2,
    height: 1,
  },
  everySystemCount: {
    width: 2,
    height: 1,
  },
  // 数据标准
  termsTopCount: {
    width: 2,
    height: 1,
  },
  domainTopCount: {
    width: 2,
    height: 1,
  },
  codeTopCount: {
    width: 2,
    height: 1,
  },
  standardBusinessDistributionChart: {
    width: 4,
    height: 4,
  },
  publishingBusinessTermsTop5Chart: {
    width: 2,
    height: 4,
  },
  oneyearStandardsReleaseTrendsChart: {
    width: 4,
    height: 2,
  },
  standardSpecificationData: {
    width: 1,
    height: 1,
  },
  cumulativeApprovalsPerYear: {
    width: 1,
    height: 1,
  },
  governanceDataStandards: {
    width: 2,
    height: 1,
  },
  // domainQuoteTop: {
  //   width: 2,
  //   height: 4,
  // },
  // departmentDomainCount: {
  //   width: window.setting.domain_Field ? 3 : 2,
  //   height: 4,
  // },
  // departmentDomainQuote: {
  //   width: 2,
  //   height: 4,
  // },
  // domainQuoteTrend: {
  //   width: 2,
  //   height: 4,
  // },
  // domainSystemCover: {
  //   width: 2,
  //   height: 3,
  // },
  // systemDomainCount: {
  //   width: 2,
  //   height: 3,
  // },
  // systemDomainQuote: {
  //   width: window.setting.domain_Field ? 3 : 2,
  //   height: 4,
  // },
  // themeDomainQuote: {
  //   width: window.setting.domain_Field ? 3 : 2,
  //   height: 4,
  // },
  // indexTopCount: {
  //   width: 1,
  //   height: 1,
  // },
  // nameRuleTopCount: {
  //   width: 1,
  //   height: 1,
  // },
  // dimTopCount: {
  //   width: 1,
  //   height: 1,
  // },
  // 数据资产
  assetTotal: {
    width: 8,
    height: 1,
  },
  assetTypeStatistics: {
    width: 2,
    height: 4,
  } /*
  assetCarousel: {
    width: 3,
    height: 4,
  }, */,
  safetyLevelDistribution: {
    width: 3,
    height: 4,
  },
  securityLevelRatio: {
    width: 2,
    height: 4,
  },
  // applyTrend: {
  //   width: 3,
  //   height: 4,
  // },
  /* assetDistributionByDept: {
    width: 3,
    height: 4,
  }, */
  catalogOverview: {
    width: 2,
    height: 4,
  },
  qualityProblemRate: { width: 3, height: 4 },
  assetHeatTop: { width: 3, height: 4 },
  catalogStatusStatistics: {
    width: 2,
    height: 4,
  },
  catalogTypeStatistics: { width: 2, height: 4 },
  // assetDistribution: { width: 3, height: 4 },
  catalogActivity: { width: 3, height: 4 },
  enterLakeStatistics: { width: 2, height: 4 },
  qualityProblemRateByCatalog: { width: 3, height: 4 },
  catalogProcessStatistics: { width: 3, height: 4 },
  // 数据安全
  overviewOfDataAsset: {
    width: 4,
    height: 5,
  },
  overviewOfClassificationAndClassification: {
    width: 10,
    height: 5,
  },
  classificationOfDataAssets: {
    width: 6,
    height: 5,
  },
}

export { componentsOfVue, componentsApiUrl, componentsDefaultSize }
