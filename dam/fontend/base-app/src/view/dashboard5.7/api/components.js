/*
来自原数据质量驾驶舱页面的6个组件
 */
import problemStatistics from '@/view/dataQuality/dashboard/problemStatistics'
import ruleStatistics from '@/view/dataQuality/dashboard/ruleStatistics'
import systemStatistics from '@/view/dataQuality/dashboard/systemStatistics'
import otherStatistics from '@/view/dataQuality/dashboard/otherStatistics'
import topPerson from '@/view/dataQuality/dashboard/topPerson'
import problemDetail from '@/view/dataQuality/dashboard/problemDetail.vue'

import searchHead from '@/view/dataQuality/dashboard6.5/searchHead'
import allQuestionsNum from '@/view/dataQuality/dashboard6.5/allQuestionsNum'
import problemRecordNum from '@/view/dataQuality/dashboard6.5/problemRecordNum'
import overdueIssuesNum from '@/view/dataQuality/dashboard6.5/overdueIssuesNum'
import overdueProblemRecordNum from '@/view/dataQuality/dashboard6.5/overdueProblemRecordNum'
import metadataCoverage from '@/view/dataQuality/dashboard6.5/metadataCoverage'
import customModule from '@/view/dataQuality/dashboard6.5/customModule'
import problemArea from '@/view/dataQuality/dashboard6.5/problemArea'
import problemSystem from '@/view/dataQuality/dashboard6.5/problemSystem'
import importance from '@/view/dataQuality/dashboard6.5/importance'
import ruleSource from '@/view/dataQuality/dashboard6.5/ruleSource'
import ruleType from '@/view/dataQuality/dashboard6.5/ruleType'
import hisProblemsOverdue from '@/view/dataQuality/dashboard6.5/hisProblemsOverdue'
import hisOverdueStatistics from '@/view/dataQuality/dashboard6.5/hisOverdueStatistics'
import overdueDistribution from '@/view/dataQuality/dashboard6.5/overdueDistribution'
import problemSummary from '@/view/dataQuality/dashboard6.5/problemSummary'

/*
来自原元数据驾驶舱页面的6个组件
*/
import modelCategory from '@/view/dashboard5.5/metaComponent/modelCategory.vue'
import dataSource from '@/view/dashboard5.5/metaComponent/dataSource.vue'
import report from '@/view/dashboard5.5/metaComponent/report.vue'
import domain from '@/view/dashboard5.5/metaComponent/domain.vue'
import rule from '@/view/dashboard5.5/metaComponent/rule.vue'
import catalogCountList from '@/view/dashboard/catalogCountList.vue'

/**
 * 数据服务 服务总览 组件
 */
import dataServerTopData from '@/view/dataAplication/serviceOverview/dataServerTopData.js'
import callActive from '@/view/dataAplication/serviceOverview/callActive.vue'
import callCount from '@/view/dataAplication/serviceOverview/callCount.vue'
import callList from '@/view/dataAplication/serviceOverview/callList.vue'

/**
 * 数据标准 dashboard 组件
 */
import domainDashboard from '@/view/newDataStandard/dashboard/index.js'

/*
 *来自个人工作台页面的组件
 */
import overview from '@/view/userModal/userPaneComponent/overview.vue'
import dataQualiyToDo from '@/view/userModal/userPaneComponent/dataQualiyToDo.vue'
import infoList from '@/view/userModal/userPaneComponent/infoList.vue'
import toDoTaskRelease from '@/view/userModal/userPaneComponent/toDoTaskRelease.vue'
import taskAndApply from '@/view/userModal/userPaneComponent/taskAndApply.vue'
const vThis = window.vueThis
let [
  domainQuoteTop,
  departmentDomainCount,
  departmentDomainQuote,
  domainQuoteTrend,
  systemDomainQuote,
  themeDomainQuote,

  domainTopCount,
  codeTopCount,
  indexTopCount,
  nameRuleTopCount,
  dimTopCount,
] = domainDashboard
const { apiCount, appCount, apiCall, apiCallMonth, apiSuccessRate } =
  dataServerTopData
const componentsOfVue = {
  components: {
    problemStatistics,
    ruleStatistics,
    systemStatistics,
    otherStatistics,
    topPerson,
    problemDetail,
    searchHead,
    allQuestionsNum,
    problemRecordNum,
    overdueIssuesNum,
    overdueProblemRecordNum,
    metadataCoverage,
    customModule,
    problemArea,
    problemSystem,
    importance,
    ruleSource,
    ruleType,
    hisProblemsOverdue,
    hisOverdueStatistics,
    overdueDistribution,
    problemSummary,
    modelCategory,
    dataSource,
    report,
    domain,
    rule,
    catalogCountList,
    // 数据标准
    themeDomainQuote,
    domainQuoteTop,
    departmentDomainCount,
    departmentDomainQuote,
    domainQuoteTrend,
    // domainSystemCover,
    // systemDomainCount,
    systemDomainQuote,
    domainTopCount,
    codeTopCount,
    indexTopCount,
    nameRuleTopCount,
    dimTopCount,

    overview,
    dataQualiyToDo,
    infoList,
    toDoTaskRelease,
    taskAndApply,

    apiCount,
    appCount,
    apiCall,
    apiCallMonth,
    apiSuccessRate,
    callActive,
    callCount,
    callList,
  },
}

/*
组件的api调用可以通过下列配置进行托管。避免多重复调用相同API。组件使用rootData属性进行接收。
框架将确保rootData已经产生才渲染组件。
如果是专用API，你也可以在自己的组件内自行安排，不必在此处配置
 */
const componentsApiUrl = {
  problemStatistics: '/dashboard/quality/main',
  ruleStatistics: '/dashboard/quality/main',
  systemStatistics: '/dashboard/quality/main',
  otherStatistics: '/dashboard/quality/main',
  topPerson: '/dashboard/quality/main',
  problemDetail: '/dashboard/quality/rule',
  modelCategory: '/service/dashboard/main',
  dataSource: '/service/dashboard/main',
  report: '/service/dashboard/main',
  domain: '/service/dashboard/main',
  domainCount: '/service/dashboard/domain/count',
  rule: '/service/dashboard/main',
  apiCallCount: '/service/api/apiCallCount',
  allOrganizations: '/service/org/organization/all',
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
  everyFolderCount: {
    width: 2,
    height: 1,
  },
  everySystemCount: {
    width: 2,
    height: 1,
  },
  // 数据标准
  domainQuoteTop: {
    width: 2,
    height: 4,
  },
  departmentDomainCount: {
    width: window.setting.domain_Field ? 3 : 2,
    height: 4,
  },
  departmentDomainQuote: {
    width: 2,
    height: 4,
  },
  domainQuoteTrend: {
    width: 2,
    height: 4,
  },
  // domainSystemCover: {
  //   width: 2,
  //   height: 3,
  // },
  // systemDomainCount: {
  //   width: 2,
  //   height: 3,
  // },
  systemDomainQuote: {
    width: window.setting.domain_Field ? 3 : 2,
    height: 4,
  },
  themeDomainQuote: {
    width: window.setting.domain_Field ? 3 : 2,
    height: 4,
  },
  domainTopCount: {
    width: 1,
    height: 1,
  },
  codeTopCount: {
    width: 1,
    height: 1,
  },
  indexTopCount: {
    width: 1,
    height: 1,
  },
  nameRuleTopCount: {
    width: 1,
    height: 1,
  },
  dimTopCount: {
    width: 1,
    height: 1,
  },
  // 数据资产
  assetTotal: {
    width: 8,
    height: 1,
  },
  assetTypeStatistics: {
    width: 2,
    height: 4,
  },
  assetCarousel: {
    width: 3,
    height: 4,
  },
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
  assetDistributionByDept: {
    width: 3,
    height: 4,
  },
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
  assetDistribution: { width: 3, height: 4 },
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
