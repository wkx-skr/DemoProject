// 驾驶舱名称（请务必确保唯一，且一经确定不允许修改）,中文名允许修改
// @ts-ignore
const vThis = window.vueThis;
export const dashboardName = 'dataStandard'
export const displayName = vThis.$mainVue.$t('common.dashboard.domain')
// 该驾驶舱包含的组件（仅为默认初始值，允许用户在UI上调整）
export let defaultComponents: Array<string> = [
  'termsTopCount',
  'domainTopCount',
  'codeTopCount',
  'standardBusinessDistributionChart',
  'publishingBusinessTermsTop5Chart',
  'oneyearStandardsReleaseTrendsChart',
  'standardSpecificationData',
  'cumulativeApprovalsPerYear',
  'governanceDataStandards',
  // 'indexTopCount',
  // 'nameRuleTopCount',
  // 'systemDomainQuote',
  // 'domainQuoteTop',
  // 'themeDomainQuote',
  // 'departmentDomainQuote',
  // 'departmentDomainCount',
  // 'domainQuoteTrend',
  // 'domainSystemCover',
  // 'systemDomainCount',
]
// 该驾驶舱允许用户选择的组件
export let selectableComponents: Array<string> = [
  'termsTopCount',
  'domainTopCount',
  'codeTopCount',
  'standardBusinessDistributionChart',
  'publishingBusinessTermsTop5Chart',
  'oneyearStandardsReleaseTrendsChart',
  'standardSpecificationData',
  'cumulativeApprovalsPerYear',
  'governanceDataStandards',
  // 'systemDomainQuote',
  // 'themeDomainQuote',
  // 'domainQuoteTop',
  // 'departmentDomainCount',
  // 'departmentDomainQuote',
  // 'domainQuoteTrend',
  // 'domainSystemCover',
  // 'systemDomainCount',
  // 'indexTopCount',
  // 'nameRuleTopCount',
]
// @ts-ignore
// if(window.setting.domain_Field) {
//   defaultComponents.push('dimTopCount')
//   selectableComponents.push('dimTopCount')
// }
// 窗口的最小宽度限制,暂未应用
export const pageMinWidth = 1200

// 列默认栅格数
// @ts-ignore
// export const COL_AMOUNT = window.setting.domain_Field ? 5 : 4
export const COL_AMOUNT = 6

// 编辑模式的画布最大高度，一般情况下无需修改
export const ROW_MAX_AMOUNT = 20

// 高度的基准，单位为px, 组件可以为1倍或若干倍高
export const HEIGHT_BASE = 140

// 组件之间的距离
export const COMPONENT_GAP = 16

// 画布的背景色
export const BACKGROUND_COLOR = '#f6f6f6'
