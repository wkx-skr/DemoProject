import domainQuoteTop from './domainQuoteTop.vue'
import departmentDomainCount from './departmentDomainCount.vue'
import departmentDomainQuote from './departmentDomainQuote.vue'
import domainQuoteTrend from './domainQuoteTrend.vue'
import systemDomainQuote from './systemDomainQuote.vue'
import themeDomainQuote from './themeDomainQuote.vue'
import topCountCouple from './topCountCouple.vue'
import topCountSingle from './topCountSingle.vue'
import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'
import Vue from 'vue'

let getStatisticsDataPromise = async () => {
  let getData = null
  try {
    getData = await HTTP.getDomainStatisticsCount()
    // getData = await HTTP.dashboardDomainCount()
  } catch (e) {
    // this.$showFailure(e)
    Vue.prototype.$showFailure(e)
    return {}
  }
  if (getData) {
    let data = getData.data
    let result = {
      glossary: nUtils.insertComma(data.namingStandard),
      dimTopCount: nUtils.insertComma(data.domainStandard), // 领域数据标准
      publishedDomain: nUtils.insertComma(data.publishedDomain),
      unpublishedDomain: nUtils.insertComma(data.developingDomain),
      publishedCode: nUtils.insertComma(data.publishedStandardCode),
      unpublishedCode: nUtils.insertComma(data.developingStandardCode),
      publishedIndex: nUtils.insertComma(data.publishedMetric),
      unpublishedIndex: nUtils.insertComma(data.developingMetric),
    }
    return result
  } else {
    return {}
  }
}

let singleArr = [
  {
    name: 'nameRuleTopCount',
    title: 'domain.common.glossary',
    description: 'domain.dashboard.topCard.glossaryDescription',
    label: 'domain.dashboard.topCard.glossaryCount',
    prop: 'glossary',
    getData: getStatisticsDataPromise,
  },
  {
    name: 'dimTopCount',
    title: 'domain.common.fieldDomain',
    description: 'domain.dashboard.topCard.fieldDomainDescription',
    label: 'domain.dashboard.topCard.fieldDomainCount',
    prop: 'dimTopCount',
    getData: getStatisticsDataPromise,
  },
]

let coupleArr = [
  {
    name: 'domainTopCount',
    title: 'domain.common.basicDomain',
    description: 'domain.dashboard.topCard.domainDescription',
    label: 'domain.dashboard.topCard.domainPublicCount',
    label2: 'domain.dashboard.topCard.domainUnderReviewCount',
    prop: 'publishedDomain',
    prop2: 'unpublishedDomain',
    getData: getStatisticsDataPromise,
  },
  {
    name: 'codeTopCount',
    // title: '标准代码',
    title: 'domain.common.domainCode',
    description: 'domain.dashboard.topCard.codeDescription',
    label: 'domain.dashboard.topCard.codePublicCount',
    label2: 'domain.dashboard.topCard.codeUnderReviewCount',
    prop: 'publishedCode',
    prop2: 'unpublishedCode',
    getData: getStatisticsDataPromise,
  },
  {
    name: 'indexTopCount',
    title: 'domain.common.index',
    description: 'domain.dashboard.topCard.indexDescription',
    label: 'domain.dashboard.topCard.indexPublicCount',
    label2: 'domain.dashboard.topCard.indexUnderReviewCount',
    prop: 'publishedIndex',
    prop2: 'unpublishedIndex',
    getData: getStatisticsDataPromise,
  },
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
singleArr.forEach(item => {
  let obj = {
    template: `
      <top-count-single :showData="showData"></top-count-single>`,
    name: item.name,
    data() {
      return {
        showData: item,
      }
    },
    components: { topCountSingle },
  }
  componentsArr.push(obj)
})

export default [
  domainQuoteTop,
  departmentDomainCount,
  departmentDomainQuote,
  domainQuoteTrend,
  // domainSystemCover,
  // systemDomainCount,
  systemDomainQuote,
  themeDomainQuote,
  ...componentsArr,
]
