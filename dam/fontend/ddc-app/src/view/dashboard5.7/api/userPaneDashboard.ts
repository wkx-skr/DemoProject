// 驾驶舱名称（请务必确保唯一，且一经确定不允许修改）,中文名允许修改
// @ts-ignore
const vThis = window.vueThis;
export const dashboardName = 'userPane'
export const displayName = vThis.$mainVue.$t('userPane.title.userPane')

// 该驾驶舱包含的组件（仅为默认初始值，允许用户在UI上调整）
export const defaultComponents: Array<string> = [
  'overview',
  'taskAndApply',
  'infoList',
  'dataQualiyToDo',
  'toDoTaskRelease',
  // 'apiCount',   //API 统计  （累计发布接口数量）
  // 'appCount',   //APP 统计 (授权应用组)
  // 'apiCall',    //API 调用 （累计接口调用）
  // 'apiCallMonth',  //API 按月调用
  // 'apiSuccessRate',   //API 调用成功率
  // 'callActive',   //服务调用活跃度
  // 'callCount',   //按应用组统计月度服务调用次数
  // 'callList',   //数据服务调用统计
]
// 该驾驶舱允许用户选择的组件
export const selectableComponents: Array<string> = [
  'overview',
  'dataQualiyToDo',
  'infoList',
  'taskAndApply',
  'toDoTaskRelease',
  'apiCount',
  'appCount',
  'apiCall',
  'apiCallMonth',
  'apiSuccessRate',
  'callActive',
  'callCount',
  'callList',
]

// 窗口的最小宽度限制,暂未应用
export const pageMinWidth = 1200

// 列默认栅格数
export const COL_AMOUNT = 10

// 编辑模式的画布最大高度，一般情况下无需修改
export const ROW_MAX_AMOUNT = 20

// 高度的基准，单位为px, 组件可以为1倍或若干倍高
export const HEIGHT_BASE:number = 135

// 组件之间的距离
export const COMPONENT_GAP = 16
