// 驾驶舱名称（请务必确保唯一，且一经确定不允许修改）,中文名允许修改
// @ts-ignore
const vThis = window.vueThis;
export const dashboardName = 'dataCatalog'
export const displayName = vThis.$mainVue.$t('common.dashboard.metadata')
// 该驾驶舱包含的组件（仅为默认初始值，允许用户在UI上调整）
export let defaultComponents: Array<string> = [
  'modelCategory',
  'dataSource',
  'domain',
  'rule',
  'catalogCountList'
]

// 该驾驶舱允许用户选择的组件
export let selectableComponents: Array<string> = [
  'problemStatistics',
  'ruleStatistics',
  'systemStatistics',
  'otherStatistics',
  'problemDetail',
  'topPerson',
  'modelCategory',
  'dataSource',
  'domain',
  'rule',
  'catalogCountList',
  'overview',
  'dataQualiyToDo',
  'infoList',
  'taskAndApply',
  'toDoTaskRelease',
]
// @ts-ignore
if(window.setting.metadata_Report) {
  defaultComponents.push('report')
  selectableComponents.push('report')
}
// 窗口的最小宽度限制,暂未应用
export const pageMinWidth = 1200

// 列默认栅格数
// @ts-ignore
export const COL_AMOUNT = window.setting.metadata_Report ? 5 : 4

// 编辑模式的画布最大高度，一般情况下无需修改
export const ROW_MAX_AMOUNT = 20

// 高度的基准，单位为px, 组件可以为1倍或若干倍高
export const HEIGHT_BASE = 150

// 组件之间的距离
export const COMPONENT_GAP = 16

// 画布的背景色
export const BACKGROUND_COLOR = '#f6f6f6'
