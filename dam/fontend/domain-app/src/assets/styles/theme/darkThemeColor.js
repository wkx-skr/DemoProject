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
  '--color-text-primary': '#F1F1F1',
  // 常规文字颜色 // input, table, tree 未选择时 默认颜色
  '--color-text-regular': '#E3E3E3',
  // 次要文字颜色 // table 表头, transfer 统计, menu 图标
  '--color-text-secondary': '#D9D9D9',
  // 占位文字颜色 // placeholder, input '清空' 图标(小X) 弹框关闭图标
  '--color-text-placeholder': '#A9A9A9',

  // 一级边框颜色 // input 边框, transfer 最上层 input,checkbox 边框
  '--border-color-base': '#313131',
  // 二级边框颜色 // Slider 未选中的部分 背景色, tab 未选中的部分 边框 (选中为 primary)
  '--border-color-light': '#313131',
  // 三级边框颜色 // Progress 未选择部分 背景色, message 文本颜色, tooltip border, table 行内边框, transfer 边框, Collapse 边框
  '--border-color-lighter': '#313131',
  // 四级边框颜色 // 基本没有用
  '--border-color-extra-light': '#313131',

  // 基础白色 // input, light tooltip 等 背景色, ** dark tooltip 文本颜色
  '--color-white': '#222222',
  // 基础黑色 // 基本没用
  '--color-black': '#101010',
  // 基础背景色 // 例如: table 表头, number input 两侧 加/减 按钮
  '--background-color-base': '#000000',

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
  '--light-theme-color': '#add8e6',
  // 背景色稍亮, dam dashboard top hover 背景色
  '--hover-light-main-color': '#051015',
  // ddc 主背景色, table 表格 默认背景色, 白/灰 背景
  '--white-grey-bgc': '#303133',
  '--menu-options-shadow': '0 5px 5px 2px rgba(4, 4, 4, 0.5)',
  '--heading-shadow': 'none',
  // 顶部导航栏 弹框
  // 顶部导航栏 弹框 背景色
  '--menu-options-color': '#222',
  // 血缘图标签文本颜色
  '--lineage-label-color': '#494850',
  // 顶部导航栏 选中/hover 时 文本颜色
  '--menu-opt-item-color': '#A1A1A1',
  // 弹框内 单项 文本颜色
  '--left-hover-color': '#fafafa',
  //  弹框内 单项 hover 时文本颜色, popover 背景色
  '--menu-opt-item-hover': '#fff',
  // 灰色偏主题色 高亮
  '--grey-theme-bgc': '#4D6181',
  // 顶部导航 背景色 btn
  '--source-menu-bgc': '#5B5B5B',
  // 顶部导航按钮 border
  '--source-menu-border': 'transparent',
  // drop-down 文字颜色
  '--drop-down-color': '#e3e3e3',

  /* **************** 默认, 白色主题相同, 与 黑色主题相反 ***************************************** */
  // 主要文字颜色, 同 默认背景色相反
  '--default-opposite-color': '#fff',
  // 同基础背景色相反的背景色
  '--opposite-bgc': '#fefefe',
  // ddc 顶部导航 文本颜色
  '--ddc-header-color': '#F1F5F7',
  // document 文本颜色
  '--document-color': '#cdced3',
  // about 文本颜色
  '--about-dialog-color': '#d7d2e3',
  // table 表头背景色
  '--table-head-bgc': '#becedc',
  // quill 富文本编辑器 工具栏
  '--quill-tool-bar': '#ccc',
  // 默认 文本颜色
  '--base-font-color': '#D0D0D0',
  // 表格默认文本颜色
  '--table-color': '#D0D0D0',
  // a 标签文本颜色
  '--a-text-color': '#999',
  // tab 非高亮 背景色
  '--tab-normal-color': '#c9c9c9',
  // tab 灰色文本
  '--tab-grey-color': '#767676',
  // tab 普通文本颜色
  '--tab-text-color': '#9b9ea2',
  // nav hover 背景色
  '--nav-item-hover-bgc': '#817d7d',
  // 浅灰色 背景色
  '--grey-bgc': '#363636',
  // popover hover 时背景色
  '--popover-hover-bgc': '#606060',
  // icon/btn hover 背景色
  '--icon-hover-bgc': '#0f0f0f',
  // 浅灰 table 表头
  '--grey-table-title': '#454749',
  // ddc 搜索 背景色
  '--ddc-search-main-bgc': '#080808',
  // 表格 hover 背景色
  '--table-hover-bgc': '#606060',
  // (目录导航外) 内容部分 默认背景色, 表格 默认背景色, ddc input框 背景色, ddc 表详情 字段table 表头背景色
  '--main-content-bgc': '#0a0a0a',
  // ddc 搜索 左侧过滤区域背景色
  '--search-left-bgc': '#313131',
  // 浅灰色 // table stripe 背景色
  '--light-grey': '#0f0f0f',
  // loading 背景色
  '--loading-mask-bgc': 'rgba(12, 12, 12,0.8)',
  // 默认背景色, 白色主题为 白色, 黑色主题为黑色
  '--default-bgc': '#000',
  // 顶部导航栏 背景色 白/灰
  '--heading-ddc-bgc': '#303133',
  // 弹框 小标题 标题文本颜色
  '--menu-opt-title-color': '#A1A1A1',
  // tree current 背景色
  '--tree-current-bgc': '#4a535e',

  /* **************** 默认, 黑色主题相同, 与 白色主题相反 ***************************************** */
  /* ************ 导航栏部分 和 map 地图 等 *********** */
  // map 背景色
  '--map-dark-bgc': '#131315',
  // map icon btn 背景色
  '--map-btn-bgc': '#2f2f31',
  // 顶部导航栏 背景色
  '--heading-bgc': '#303133',
  // map 弹框信息 背景色
  '--map-popover-bgc': '#444',
  // ddc
  '--check-item-bgc': '#484848',
  // table 表头背景色
  '--table-title-bgc': '#606060',
  // 血缘 顶部
  '--lineage-top-bar': '#666',
  // 顶部导航栏 文本颜色
  '--left-item-color': '#858585',
  // 默认灰色, 与主题相反
  '--white-grey-opposite': '#969696',
  // 灰色文本 普通
  '--grey-normal-color': '#c3c3c3',
  // 灰色文本 高亮
  '--grey-legend-color': '#D6D6D6',
  // 顶部导航栏 文本颜色
  '--heading-color': '#F1F5F7',
  // map 文本颜色
  '--map-font-color': '#F1F5F8',
  // map 文本, 默认白,与主题背景 相反
  '--white-opposite': '#fff',
}

// export default colorMap
module.exports = colorMap
