// 主题色 主要分为四部分:
//    1. element-ui 生成的主题色, 可以使用线上工具生成全套
//    2. 主题色, 高亮时主要的颜色, 可以每一个主题手动配置
//    3. 默认主题 和 白色主题 相同的颜色, 例如 背景色/文本颜色 等
//    4. 默认主题 和 黑色主题 相同的颜色, 例如 背景色/文本颜色 等
// 后两种可以根据不同主题尽量少的调整
const colorMap = {
  // element 主题色
  // 目前有两套, 黑色和白色, default 和 白色相同, 可以使用线上工具生成全套
  /* **************** element 主题颜色 start ********************* */
  // 主题色
  '--color-primary': '#409EFF',
  // 主要文字颜色 // 标题, tab, menu, Collapse, pagination 未选择 文本, ** dark tooltip 背景色
  '--color-text-primary': '#303133',
  // 常规文字颜色 // input, table, tree 未选择时 默认颜色
  '--color-text-regular': '#606266',
  // 次要文字颜色 // table 表头, transfer 统计, menu 图标
  '--color-text-secondary': '#909399',
  // 占位文字颜色 // placeholder, input '清空' 图标(小X) 弹框关闭图标
  '--color-text-placeholder': '#C0C4CC',

  // 一级边框颜色 // input 边框, transfer 最上层 input,checkbox 边框
  '--border-color-base': '#DCDFE6',
  // 二级边框颜色 // Slider 未选中的部分 背景色, tab 未选中的部分 边框 (选中为 primary)
  '--border-color-light': '#E4E7ED',
  // 三级边框颜色 // Progress 未选择部分 背景色, message 文本颜色, tooltip border, table 行内边框, transfer 边框, Collapse 边框
  '--border-color-lighter': '#EBEEF5',
  // 四级边框颜色 // 基本没有用
  '--border-color-extra-light': '#F2F6FC',

  // 基础白色 // input, light tooltip 等 背景色, ** dark tooltip 文本颜色
  '--color-white': '#FFFFFF',
  // 基础黑色 // 基本没用
  '--color-black': '#000000',
  // 基础背景色 // 例如: table 表头, number input 两侧 加/减 按钮
  '--background-color-base': '#F5F7FA',

  /* ************* 手动配置 主题颜色 ***************** */
  // 主题色, 和 --color-primary 相同
  '--main-color': '#4386f5',
  // 导航栏 选中项顶部边框 颜色 默认使用 主题色
  '--top-border-color': '#4386f5',
  // hover 时, 背景色, 几乎没有用
  '--hover-color': '#67AEFF',
  // 浅 主题色
  '--light-color': '#d1E5FF',
  // 浅色主题 文本
  '--light-theme-color': '#f9fbfc',
  // 背景色稍亮, dam dashboard top hover 背景色
  '--hover-light-main-color': '#f0f6ff',
  // ddc 主背景色, table 表格 默认背景色, 白/灰 背景
  '--white-grey-bgc': '#fff',
  '--menu-options-shadow': '0 0px 10px 2px rgba(232, 232, 232, 0.8)',
  '--heading-shadow': '0 5px 10px 0px rgba(144, 144, 144, 0.22)',
  // 顶部导航栏 弹框
  // 顶部导航栏 弹框 背景色
  '--menu-options-color': '#FFF',
  // 血缘图标签文本颜色
  '--lineage-label-color': '#494850',
  // 顶部导航栏 选中/hover 时 文本颜色
  '--menu-opt-item-color': '#787878',
  // 弹框内 单项 文本颜色
  '--left-hover-color': '#8f95a2',
  //  弹框内 单项 hover 时文本颜色, popover 背景色
  '--menu-opt-item-hover': '#000',
  // 灰色偏主题色 高亮
  '--grey-theme-bgc': '#cedffa',
  // 顶部导航 背景色 btn
  '--source-menu-bgc': '#fff',
  // 顶部导航按钮 border
  '--source-menu-border': '#DCDFE6',
  // drop-down 文字颜色
  '--drop-down-color': '#7d7d7d',

  /* **************** 默认, 白色主题相同, 与 黑色主题相反 ***************************************** */
  // 主要文字颜色, 同 默认背景色相反
  '--default-opposite-color': '#000',
  // 同基础背景色相反的背景色
  '--opposite-bgc': '#131315',
  // ddc 顶部导航 文本颜色
  '--ddc-header-color': '#1C1C1C',
  // document 文本颜色
  '--document-color': '#20293B',
  // about 文本颜色
  '--about-dialog-color': '#2D3546',
  // table 表头背景色
  '--table-head-bgc': '#3b4861',
  // quill 富文本编辑器 工具栏
  '--quill-tool-bar': '#777',
  // 默认 文本颜色
  '--base-font-color': '#494850',
  // 表格默认文本颜色
  '--table-color': '#606266',
  // a 标签文本颜色
  '--a-text-color': '#666666',
  // tab 非高亮 背景色
  '--tab-normal-color': '#717570',
  // tab 灰色文本
  '--tab-grey-color': '#898989',
  // tab 普通文本颜色
  '--tab-text-color': '#9b9ea2',
  // nav hover 背景色
  '--nav-item-hover-bgc': '#c5c5c5',
  // 浅灰色 背景色
  '--grey-bgc': '#e6e6e6',
  // popover hover 时背景色
  '--popover-hover-bgc': '#ecf3fe',
  // icon/btn hover 背景色
  '--icon-hover-bgc': '#F0F0F0',
  // 浅灰 table 表头
  '--grey-table-title': '#F1F5F8',
  // ddc 搜索 背景色
  '--ddc-search-main-bgc': '#f5f5f5',
  // 表格 hover 背景色
  '--table-hover-bgc': '#f5f7fa',
  // (目录导航外) 内容部分 默认背景色, 表格 默认背景色, ddc input框 背景色, ddc 表详情 字段table 表头背景色
  '--main-content-bgc': '#f6f6f6',
  // ddc 搜索 左侧过滤区域背景色
  '--search-left-bgc': '#FCFCFC',
  // 浅灰色 // table stripe 背景色
  '--light-grey': '#fafafa',
  // loading 背景色
  '--loading-mask-bgc': 'rgba(255,255,255,0.8)',
  // 默认背景色, 白色主题为 白色, 黑色主题为黑色
  '--default-bgc': '#fff',
  // 顶部导航栏 背景色 白/灰
  '--heading-ddc-bgc': '#FFF',
  // 弹框 小标题 标题文本颜色
  '--menu-opt-title-color': '#808080',
  // tree current 背景色
  '--tree-current-bgc': '#deebfe',

  /* **************** 默认, 黑色主题相同, 与 白色主题相反 ***************************************** */
  /* ************ 导航栏部分 和 map 地图 等 *********** */
  // map 背景色
  '--map-dark-bgc': '#f8f8f8',
  // map icon btn 背景色
  '--map-btn-bgc': '#d0d0ce',
  // 顶部导航栏 背景色
  '--heading-bgc': '#fff',
  // map 弹框信息 背景色
  '--map-popover-bgc': '#EDf4FF',
  // ddc
  '--check-item-bgc': '#EDf4FF',
  // table 表头背景色
  '--table-title-bgc': '#afafaf',
  // 血缘 顶部
  '--lineage-top-bar': '#aaa',
  // 顶部导航栏 文本颜色
  '--left-item-color': '#AFB4BF',
  // 默认灰色, 与主题相反
  '--white-grey-opposite': '#696969',
  // 灰色文本 普通
  '--grey-normal-color': '#4d4d4d',
  // 灰色文本 高亮
  '--grey-legend-color': '#3e3e3e',
  // 顶部导航栏 文本颜色
  '--heading-color': '#000',
  // map 文本颜色
  '--map-font-color': '#0e0a07',
  // map 文本, 默认白,与主题背景 相反
  '--white-opposite': '#000',
}

// export default colorMap
module.exports = colorMap
