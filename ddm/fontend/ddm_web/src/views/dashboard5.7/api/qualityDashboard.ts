// 驾驶舱名称（请务必确保唯一，且一经确定不允许修改）,中文名允许修改
// @ts-ignore
const vThis = window.vueThis;
export const dashboardName = 'dataQuality'
export const displayName = vThis.$mainVue.$t('quality.page.dataQualityDashboard.dashboardName')
// 该驾驶舱包含的组件（仅为默认初始值，允许用户在UI上调整）
export const defaultComponents: Array<string> = [
  // 'searchHead',
  'allQuestionsNum',
  'problemRecordNum',
  'overdueIssuesNum',
  'overdueProblemRecordNum',
  // 'metadataCoverage',
  'customModule',
  'problemArea',
  'problemSystem',
  'importance',
  'ruleSource',
  'ruleType',
  'hisProblemsOverdue',
  'hisOverdueStatistics',
  'overdueDistribution',
  'problemSummary'
  // 'problemStatistics',
  // 'ruleStatistics',
  // 'systemStatistics',
  // 'otherStatistics',
  // 'problemDetail',
  // 'topPerson'
]
// 该驾驶舱允许用户选择的组件
export const selectableComponents: Array<string> = [
  'problemStatistics',
  'ruleStatistics',
  'systemStatistics',
  'otherStatistics',
  'problemDetail',
  'topPerson',
  'modelCategory',
  'dataSource',
  'report',
  'domain',
  'rule',
  'catalogCountList'
]

// 窗口的最小宽度限制,暂未应用
export const pageMinWidth = 1200

// 列默认栅格数
export const COL_AMOUNT = 8

// 编辑模式的画布最大高度，一般情况下无需修改
export const ROW_MAX_AMOUNT = 30

// 高度的基准，单位为px, 组件可以为1倍或若干倍高
export const HEIGHT_BASE = 80

// 组件之间的距离
export const COMPONENT_GAP = 16
