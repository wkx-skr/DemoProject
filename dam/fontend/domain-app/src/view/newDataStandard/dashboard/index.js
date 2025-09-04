// import domainQuoteTop from './domainQuoteTop.vue'
// import departmentDomainCount from './departmentDomainCount.vue'
// import departmentDomainQuote from './departmentDomainQuote.vue'
// import domainQuoteTrend from './domainQuoteTrend.vue'
// import systemDomainQuote from './systemDomainQuote.vue'
// import themeDomainQuote from './themeDomainQuote.vue'
// import topCountSingle from './topCountSingle.vue'
import topCountCouple from './newDomainChart/topCountCouple.vue'
// new components
import standardBusinessDistributionChart from './newDomainChart/standardBusinessDistributionChart.vue'
import publishingBusinessTermsTop5Chart from './newDomainChart/publishingBusinessTermsTop5Chart.vue'
import oneyearStandardsReleaseTrendsChart from './newDomainChart/oneyearStandardsReleaseTrendsChart.vue'
import standardSpecificationData from './newDomainChart/standardSpecificationData.vue'
import cumulativeApprovalsPerYear from './newDomainChart/cumulativeApprovalsPerYear.vue'
import governanceDataStandards from './newDomainChart/governanceDataStandards.vue'

import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'
import Vue from 'vue'

let getStatisticsDataPromise = async () => {
  let getData1 = null
  let getData2 = null
  try {
    getData1 = await HTTP.getDomainStatisticsCount()
    getData2 = await HTTP.getBusinessStatisticsCount()
  } catch (e) {
    // this.$showFailure(e)
    Vue.prototype.$showFailure(e)
    return {}
  }
  let result = {}
  if (getData1) {
    let data = getData1.data
    result = {
      glossary: nUtils.insertComma(data.namingStandard),
      dimTopCount: nUtils.insertComma(data.domainStandard), // 领域数据标准
      publishedDomain: nUtils.insertComma(data.publishedDomain),
      unpublishedDomain: nUtils.insertComma(data.developingDomain),
      publishedCode: nUtils.insertComma(data.publishedStandardCode),
      unpublishedCode: nUtils.insertComma(data.developingStandardCode),
      publishedIndex: nUtils.insertComma(data.publishedMetric),
      unpublishedIndex: nUtils.insertComma(data.developingMetric),
    }
  }
  if (getData2) {
    let data = getData2.data
    result = {
      ...result,
      publishedBusinessTerm: nUtils.insertComma(data.publishedBusinessTerm),
      developingBusinessTerm: nUtils.insertComma(data.developingBusinessTerm),
    }
  }
  return result
}

// let singleArr = [
//   {
//     name: 'nameRuleTopCount',
//     title: 'domain.common.glossary',
//     description: 'domain.dashboard.topCard.glossaryDescription',
//     label: 'domain.dashboard.topCard.glossaryCount',
//     prop: 'glossary',
//     getData: getStatisticsDataPromise,
//   },
//   {
//     name: 'dimTopCount',
//     title: 'domain.common.fieldDomain',
//     description: 'domain.dashboard.topCard.fieldDomainDescription',
//     label: 'domain.dashboard.topCard.fieldDomainCount',
//     prop: 'dimTopCount',
//     getData: getStatisticsDataPromise,
//   },
// ]

let coupleArr = [
  {
    name: 'termsTopCount',
    title: '业务术语',
    description: '业务术语统计',
    label: '已发布标准',
    label2: '审核中标准',
    prop: 'publishedBusinessTerm',
    prop2: 'developingBusinessTerm',
    getData: getStatisticsDataPromise,
  },
  {
    name: 'domainTopCount',
    title: '标准数据元',
    description: '标准数据元统计',
    label: '已发布标准',
    label2: '审核中标准',
    prop: 'publishedDomain',
    prop2: 'unpublishedDomain',
    getData: getStatisticsDataPromise,
  },
  {
    name: 'codeTopCount',
    title: '参考数据',
    description: '参考数据统计',
    label: '已发布标准',
    label2: '审核中标准',
    prop: 'publishedDomain',
    prop2: 'unpublishedDomain',
    getData: getStatisticsDataPromise,
  },
  // {
  //   name: 'domainTopCount',
  //   title: 'domain.common.basicDomain',
  //   description: 'domain.dashboard.topCard.domainDescription',
  //   label: 'domain.dashboard.topCard.domainPublicCount',
  //   label2: 'domain.dashboard.topCard.domainUnderReviewCount',
  //   prop: 'publishedDomain',
  //   prop2: 'unpublishedDomain',
  //   getData: getStatisticsDataPromise,
  // },
  // {
  //   name: 'codeTopCount',
  //   title: 'domain.common.domainCode',
  //   description: 'domain.dashboard.topCard.codeDescription',
  //   label: 'domain.dashboard.topCard.codePublicCount',
  //   label2: 'domain.dashboard.topCard.codeUnderReviewCount',
  //   prop: 'publishedCode',
  //   prop2: 'unpublishedCode',
  //   getData: getStatisticsDataPromise,
  // },
  // {
  //   name: 'indexTopCount',
  //   title: 'domain.common.index',
  //   description: 'domain.dashboard.topCard.indexDescription',
  //   label: 'domain.dashboard.topCard.indexPublicCount',
  //   label2: 'domain.dashboard.topCard.indexUnderReviewCount',
  //   prop: 'publishedIndex',
  //   prop2: 'unpublishedIndex',
  //   getData: getStatisticsDataPromise,
  // },
]

// domainTopCount
// codeTopCount
// indexTopCount
// nameRuleTopCount
// dimTopCount
let componentsArr = []
coupleArr.forEach(item => {
  let obj = {
    template: `
      <top-count-couple :showData="showData"></top-count-couple>`,
    name: item.name,
    data() {
      return {
        showData: item,
      }
    },
    components: { topCountCouple },
  }
  componentsArr.push(obj)
})
// singleArr.forEach(item => {
//   let obj = {
//     template: `
//       <top-count-single :showData="showData"></top-count-single>`,
//     name: item.name,
//     data() {
//       return {
//         showData: item,
//       }
//     },
//     components: { topCountSingle },
//   }
//   componentsArr.push(obj)
// })

export default [
  // domainQuoteTop,
  // departmentDomainCount,
  // departmentDomainQuote,
  // domainQuoteTrend,
  // domainSystemCover,
  // systemDomainCount,
  // systemDomainQuote,
  // themeDomainQuote,
  ...componentsArr,
  standardBusinessDistributionChart,
  publishingBusinessTermsTop5Chart,
  oneyearStandardsReleaseTrendsChart,
  standardSpecificationData,
  cumulativeApprovalsPerYear,
  governanceDataStandards,
]
