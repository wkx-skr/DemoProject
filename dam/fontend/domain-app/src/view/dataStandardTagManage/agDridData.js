const cellHeight = 40
const gridOptions = {
  defaultColDef: {
    resizable: true,
    headerClass: 'gride-table-header',
    cellStyle: {
      backgroundColor: '#fcfcfc',
      fontSize: '12px',
      lineHeight: cellHeight + 'px',
    },
    unSortIcon: true,
    icons: {
      sortUnSort: '<i class="fa fa-sort"/>',
      sortAscending: '<i class="fa fa-sort-asc"/>',
      sortDescending: '<i class="fa fa-sort-desc"/>',
    },
  },
  enableCellTextSelection: true,
  rowSelection: 'multiple',
  alwaysShowVerticalScroll: true,
  colResizeDefault: 'shift',
  headerHeight: 40,
  rowHeight: cellHeight,
  localeText: {
    // for filter panel
    page: '页面',
    more: '更多',
    to: 'to',
    of: 'of',
    next: '>',
    last: '<',
    first: '第一页',
    previous: 'previous',
    loadingOoo: '加载中...',

    // for set filter
    selectAll: '全选',
    searchOoo: '搜索...',
    blanks: '空白页',

    // for number filter and text filter
    filterOoo: '过滤...',
    applyFilter: 'applyFilter...',
    equals: '等于',
    notEqual: '不等于',

    // for number filter
    lessThan: 'lessThan',
    greaterThan: 'greaterThan',
    lessThanOrEqual: 'lessThanOrEqual',
    greaterThanOrEqual: 'greaterThanOrEqual',
    inRange: 'inRange',

    // for text filter
    contains: '包含',
    notContains: '不包含',
    startsWith: '匹配开头',
    endsWith: '匹配结尾',

    // filter conditions
    andCondition: 'andCondition',
    orCondition: 'orCondition',

    // the header of the default group column
    group: 'group',

    // tool panel
    columns: 'columns',
    filters: 'filters',
    rowGroupColumns: 'rowGroupColumns',
    rowGroupColumnsEmptyMessage: 'rowGroupColumnsEmptyMessage',
    valueColumns: 'valueColumns',
    pivotMode: 'pivotMode',
    groups: 'groups',
    values: 'values',
    pivots: 'pivots',
    valueColumnsEmptyMessage: 'valueColumnsEmptyMessage',
    pivotColumnsEmptyMessage: 'pivotColumnsEmptyMessage',
    toolPanelButton: 'toolPanelButton',

    // other
    noRowsToShow: '暂无数据',

    // enterprise menu
    pinColumn: 'pinColumn',
    valueAggregation: 'valueAggregation',
    autosizeThiscolumn: 'autosizeThiscolumn',
    autosizeAllColumns: 'autosizeAllColumns',
    groupBy: 'groupBy',
    ungroupBy: 'ungroupBy',
    resetColumns: 'resetColumns',
    expandAll: 'expandAll',
    collapseAll: 'collapseAll',
    toolPanel: 'toolPanel',
    export: 'export',
    csvExport: 'csvExport',
    excelExport: 'excelExport',
    excelXmlExport: 'excelXmlExport',

    // enterprise menu pinning
    pinLeft: 'pinLeft',
    pinRight: 'pinRight',
    noPin: 'noPin',

    // enterprise menu aggregation and status bar
    sum: 'sum',
    min: 'min',
    max: 'max',
    none: 'none',
    count: 'count',
    average: 'average',
    filteredRows: 'filteredRows',
    selectedRows: 'selectedRows',
    totalRows: 'totalRows',
    totalAndFilteredRows: 'totalAndFilteredRows',

    // standard menu
    copy: 'copy',
    copyWithHeaders: 'copyWithHeaders',
    ctrlC: 'ctrlC',
    paste: 'paste',
    ctrlV: 'ctrlV',
  },
  enableBrowserTooltips: true,
}

export default { gridOptions }
