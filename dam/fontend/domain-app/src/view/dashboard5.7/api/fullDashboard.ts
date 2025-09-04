// 驾驶舱名称（请务必确保唯一，且一经确定不允许修改）,中文名允许修改
// export const dashboardName = 'dataCatalog'
// export const displayName = '元数据驾驶舱'
// 该驾驶舱包含的组件（仅为默认初始值，允许用户在UI上调整）
export const defaultComponents: Array<string> = [
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
  'catalogCountList',
  'apiCount',
  'appCount',
  'apiCall',
  'apiCallMonth',
  'apiSuccessRate',
  'callActive',
  'callCount',
  'callList',
  'systemCountEchart',
  'securityLevel5',
  'securityLevel4',
  'securityLevel1',
  'systemObj',
  'folderCountEchart',
  'everyFolderCount',
  'classifyObj',
  'departmentObj',
  'everySystemCount'
]

// 窗口的最小宽度限制,暂未应用
export const pageMinWidth = 1200

// 列默认栅格数
export const COL_AMOUNT = 5

// 编辑模式的画布最大高度，一般情况下无需修改
export const ROW_MAX_AMOUNT = 20

// 高度的基准，单位为px, 组件可以为1倍或若干倍高
export const HEIGHT_BASE = 150

// 组件之间的距离
export const COMPONENT_GAP = 16

// 画布的背景色
export const BACKGROUND_COLOR = '#f6f6f6'
