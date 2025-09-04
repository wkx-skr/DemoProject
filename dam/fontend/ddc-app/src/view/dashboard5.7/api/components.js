// 数据资产dashboard
import assetTotal from '@/view/dataAsset/analysis/components/total.vue'
import assetTypeStatistics from '@/view/dataAsset/analysis/components/assetTypeStatistics.vue'
import assetCarousel from '@/view/dataAsset/analysis/components/assetCarousel.vue'
import securityLevelRatio from '@/view/dataAsset/analysis/components/securityLevelRatio.vue'
// import applyTrend from '@/view/dataAsset/analysis/components/applyTrend.vue'
import assetDistributionByDept from '@/view/dataAsset/analysis/components/assetDistributionByDept.vue'
import catalogOverview from '@/view/dataAsset/analysis/components/catalogOverview.vue'
import qualityProblemRate from '@/view/dataAsset/analysis/components/qualityProblemRate.vue'
import assetHeatTop from '@/view/dataAsset/analysis/components/assetHeatTop.vue'
import catalogStatusStatistics from '@/view/dataAsset/analysis/components/catalogStatusStatistics.vue'
import assetDistribution from '@/view/dataAsset/analysis/components/assetDistribution.vue'
import qualityProblemRateByCatalog from '@/view/dataAsset/analysis/components/qualityProblemRateByCatalog.vue'
import catalogProcessStatistics from '@/view/dataAsset/analysis/components/catalogProcessStatistics.vue'

// 管网定开驾驶舱组件
import registrationStatus from '@/view/dataAsset/analysis/components/registrationStatus.vue'
import businessDomainCoverageStatistics from '@/view/dataAsset/analysis/components/businessDomainCoverageStatistics.vue'
import proportionFailedBids from '@/view/dataAsset/analysis/components/proportionFailedBids.vue'

const componentsOfVue = {
  components: {
    // 数据资产
    assetTotal,
    // 原本的组件
    // assetTypeStatistics,
    assetCarousel,
    // securityLevelRatio,
    // // applyTrend,
    // assetDistributionByDept,
    // catalogOverview,
    // qualityProblemRate,
    // assetHeatTop,
    // catalogStatusStatistics,
    // assetDistribution,
    // qualityProblemRateByCatalog,
    // catalogProcessStatistics,
    // 新增组件
    registrationStatus,
    businessDomainCoverageStatistics,
    proportionFailedBids,
  },
}

/*
组件的api调用可以通过下列配置进行托管。避免多重复调用相同API。组件使用rootData属性进行接收。
框架将确保rootData已经产生才渲染组件。
如果是专用API，你也可以在自己的组件内自行安排，不必在此处配置
 */
const componentsApiUrl = {
  problemStatistics: '/service/dashboard/quality/main',
  ruleStatistics: '/service/dashboard/quality/main',
  systemStatistics: '/service/dashboard/quality/main',
  otherStatistics: '/service/dashboard/quality/main',
  topPerson: '/service/dashboard/quality/main',
  problemDetail: '/service/dashboard/quality/rule',
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
  // 数据资产
  assetTotal: {
    width: 24,
    height: 1,
  },
  registrationStatus: {
    width: 8,
    height: 4,
  },
  assetCarousel: {
    width: 8,
    height: 4,
  },
  proportionFailedBids: {
    width: 8,
    height: 4,
  },
  businessDomainCoverageStatistics: {
    width: 24,
    height: 4,
  },
  // assetTypeStatistics: {
  //   width: 2,
  //   height: 4,
  // },

  // securityLevelRatio: {
  //   width: 2,
  //   height: 4,
  // },
  // assetDistributionByDept: {
  //   width: 3,
  //   height: 4,
  // },
  // catalogOverview: {
  //   width: 2,
  //   height: 4,
  // },
  // qualityProblemRate: { width: 3, height: 4 },
  // assetHeatTop: { width: 3, height: 4 },
  // catalogStatusStatistics: {
  //   width: 2,
  //   height: 4,
  // },
  // assetDistribution: { width: 3, height: 4 },
  // qualityProblemRateByCatalog: { width: 3, height: 4 },
  // catalogProcessStatistics: { width: 3, height: 4 },
}

export { componentsOfVue, componentsApiUrl, componentsDefaultSize }
