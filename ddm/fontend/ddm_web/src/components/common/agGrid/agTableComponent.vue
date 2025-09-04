<template>
  <ag-grid-vue
    style="height: 100%;"
    class="ag-theme-balham ag-grid-default-style"
    ref="agGridTable"
    @grid-ready="onGridReady"
    @modelUpdated="modelUpdated"
    :gridOptions="gridOptionsResult"
    :columnDefs="columnDefsResult"
    v-bind="tableBind"
    v-on="$listeners"
  ></ag-grid-vue>
</template>

<script>
// 注意:
// 1 使用值为Boolean的属性, 确保属性在 BOOLEAN_KEYS 里面
// localeText 内为中文翻译, 用到的需要翻译
import $ from 'jquery'
import vue from 'vue'
import filterCol1 from './filterCol.vue'
import optionsCell1 from './optionsCell.vue'
import iconCol1 from './iconCol.vue'
import { AgGridVue } from 'ag-grid-vue'
import '@/../node_modules/ag-grid-community/dist/styles/ag-grid.css'
import '@/../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css'
// import '../node_modules/ag-grid-community/dist/styles/ag-theme-balham-dark.css'
// import '../node_modules/ag-grid-community/dist/styles/ag-theme-blue.css'
// import '../node_modules/ag-grid-community/dist/styles/ag-theme-bootstrap.css'
// import '../node_modules/ag-grid-community/dist/styles/ag-theme-dark.css'
// import '../node_modules/ag-grid-community/dist/styles/ag-theme-fresh.css'
// import '../node_modules/ag-grid-community/dist/styles/ag-theme-material.css'
let filterCol = vue.extend(filterCol1)
let optionsCell = vue.extend(optionsCell1)
let iconCol = vue.extend(iconCol1)
let noSortFunction = (valueA, valueB, nodeA, nodeB, isInverted) => {
  return !isInverted
}
// set default value
let cellHeight = 40
let gridOptionsDefault = {
  frameworkComponents: {
    filterCol: filterCol
  },
  defaultColDef: {
    resizable: true,
    headerClass: 'gride-table-header',
    cellStyle: {
      fontSize: '12px',
      lineHeight: cellHeight + 'px'
    },
    unSortIcon: true,
    icons: {
      sortUnSort: '<i class="fa fa-sort"/>',
      sortAscending: '<i class="fa fa-sort-asc"/>',
      sortDescending: '<i class="fa fa-sort-desc"/>'
    }
  },
  rowSelection: 'multiple',
  enableCellTextSelection: true,
  rowMultiSelectWithClick: true,
  suppressRowClickSelection: true,
  colResizeDefault: 'shift',
  headerHeight: 40,
  rowHeight: cellHeight,
  stopEditingWhenGridLosesFocus: true,
  localeText: {
    // for filter panel
    page: '页面',
    more: '更多',
    to: 'to',
    of: 'of',
    next: '>',
    last: '<',
    first: '第一页',
    previous: '上一页',
    loadingOoo: 'loading...',

    // for set filter
    selectAll: '全选',
    searchOoo: '搜索...',
    blanks: '空白页',

    // for number filter and text filter
    filterOoo: '过滤...',
    applyFilter: '应用过滤...',
    equals: '等于',
    notEqual: '不等于',

    // for number filter
    lessThan: '小于',
    greaterThan: '大于',
    lessThanOrEqual: '小于等于',
    greaterThanOrEqual: '大于等于',
    inRange: '区间',

    // for text filter
    contains: '包含',
    notContains: '不包含',
    startsWith: '匹配开头',
    endsWith: '匹配结尾',

    // filter conditions
    andCondition: '并且',
    orCondition: '或者',

    // the header of the default group column
    group: 'group',

    // tool panel
    columns: '字段',
    filters: '过滤器',
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
    noRowsToShow: 'No Data',

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
    sum: '求和',
    min: '最小',
    max: '最大',
    none: '无',
    count: '计数',
    average: '平均',
    filteredRows: '过滤后的行',
    selectedRows: '选中的行',
    totalRows: '所有行',
    totalAndFilteredRows: 'totalAndFilteredRows',

    // standard menu
    copy: '复制',
    copyWithHeaders: 'copyWithHeaders',
    ctrlC: 'ctrlC',
    paste: '粘贴',
    ctrlV: 'ctrlV'
  },
  enableBrowserTooltips: true,
  columnTypes: {
    // 左侧 空行
    firstEmptyColumn: {
      width: 20,
      suppressSizeToFit: true,
      pinned: 'left',
      headerClass: 'empty-column-header',
      cellClass: 'empty-column-cell',
      resizable: false
    },
    // 左侧 icon
    // iconCol
    iconCol: {
      // pinned: 'right',
      headerClass: 'icon-column-header',
      cellClass: 'icon-column-cell',
      suppressSizeToFit: true,
      width: 50,
      lockPosition: true,
      resizable: false,
      minWidth: 40,
      cellRendererFramework: iconCol
    },
    // 右侧 操作 列
    optionsCell: {
      // pinned: 'right',
      headerClass: 'options-column-header',
      cellClass: 'options-column-cell',
      suppressSizeToFit: true
    },
    // 右侧 操作列, 带参数:
    // tabComponent: 调用这个组件的组件, 回调函数中会用到
    // options: 数组, 每一项是一个操作的 按钮
    // options的item:
    // name: 操作的id, text: 显示的按钮名称, method: 按钮调用的方法, 是上级组件上的方法的名称
    // 回调函数的参数: {data, api, e}
    optionsWithContent: {
      headerClass: 'options-column-header',
      pinned: 'right',
      lockPinned: true,
      cellClass: 'options-column-cell',
      suppressSizeToFit: true,
      cellRendererFramework: optionsCell
    },
    selectionCheckboxColumn: {
      checkboxSelection: true,
      width: 50,
      resizable: false,
      suppressSizeToFit: true,
      headerCheckboxSelection: true
    },
    customSortCol: {
      sortable: true,
      comparator: noSortFunction
    },
    // 有过滤的字段,
    // 参数:
    // 必须: 获得所有备选项的函数, 返回一个promise, 结果为字符串数组
    // 可选: autoRefresh, 是否在显示候选项时自动刷新, 默认为false
    customFilter: {
      filter: 'filterCol'
    }
  }
}
let cellStyle = gridOptionsDefault.defaultColDef.cellStyle || {}

// 属性值为Boolean时, 若仅写属性名, 如 element 的border 属性, 将会将值设置为 true, 否则, 值将可能由 空字符串 转换为 false
// 仅检测以下属性
const BOOLEAN_KEYS = [
  'suppressColumnMoveAnimation',
  'suppressMovableColumns',
  'suppressFieldDotNotation',
  'unSortIcon',
  'suppressMultiSort',
  'suppressMenuHide',
  'suppressSetColumnStateEvents',
  'cacheQuickFilter',
  'accentedSort',
  'enableOldSetFilterModel',
  'suppressMaintainUnsortedOrder',
  'excludeChildrenWhenTreeDataFiltering',
  'rowMultiSelectWithClick',
  'rowDeselection',
  'suppressRowClickSelection',
  'suppressCellSelection',
  'enableRangeSelection',
  'rowDragManaged',
  'suppressRowDrag',
  'singleClickEdit',
  'suppressClickEdit',
  'enableGroupEdit',
  'enableCellChangeFlash',
  'stopEditingWhenGridLosesFocus',
  'enterMovesDown↵enterMovesDownAfterEdit',
  'groupUseEntireRow',
  'groupSuppressAutoColumn',
  'groupMultiAutoColumn',
  'groupSuppressRow',
  'groupSelectsChildren',
  'groupIncludeFooter',
  'groupIncludeTotalFooter',
  'groupSuppressBlankHeader',
  'groupRemoveSingleChildren',
  'groupRemoveLowestSingleChildren',
  'groupHideOpenParents',
  'pivotMode',
  'rememberGroupStateWhenNewData',
  'suppressAggFuncInHeader',
  'suppressAggAtRootLevel',
  'functionsReadOnly',
  'suppressMakeVisibleAfterUnGroup',
  'alwaysShowVerticalScroll',
  'suppressHorizontalScroll',
  'suppressColumnVirtualisation',
  'suppressScrollOnNewData',
  'suppressAnimationFrame',
  'suppressPaginationPanel',
  'groupRowRenderer↵groupRowRendererFramework↵groupRowRendererParams',
  'groupRowInnerRenderer↵groupRowInnerRendererFramework',
  'masterDetail',
  'animateRows',
  'suppressRowHoverHighlight',
  'valueCache',
  'valueCacheNeverExpires',
  'suppressMiddleClickScrolls',
  'suppressPreventDefaultOnMouseWheel',
  'enableBrowserTooltips',
  'enableCellExpressions',
  'ensureDomOrder',
  'suppressParentsInRowNodes',
  'suppressDragLeaveHidesColumns',
  'suppressCopyRowsToClipboard',
  'copyHeadersToClipboard',
  'suppressFocusAfterRefresh',
  'enableRtl',
  'enableCellTextSelection',
  'debug',
  'suppressContextMenu',
  'serverSideSortingAlwaysResets'
]

// methods mixin
const methods = {}
const METHOD_NAMES = [
  'sizeColumnsToFit',
  'setColumnDefs',
  'setRowData',
  'updateRowData',
  'setDatasource',
  'setPinnedTopRowData',
  'getModel',
  'refreshClientSideRowModel',
  'getRowNode',
  'forEachNode',
  'forEachNodeAfterFilter',
  'forEachNodeAfterFilterAndSort',
  'forEachLeafNode',
  'getDisplayedRowAtIndex',
  'getDisplayedRowCount',
  'getFirstDisplayedRow',
  'getLastDisplayedRow',
  'getDetailGridInfo',
  'forEachDetailGridInfo',
  'selectAll',
  'deselectAll',
  'selectAllFiltered',
  'deselectAllFiltered',
  'getSelectedNodes',
  'getSelectedRows',
  'getBestCostNodeSelection',
  'getRangeSelections',
  'addRangeSelection',
  'clearRangeSelection',
  'refreshCells',
  'redrawRows',
  'refreshHeader',
  'flashCells',
  'setQuickFilter',
  'isQuickFilterPresent',
  'isColumnFilterPresent',
  'isAnyFilterPresent',
  'getFilterInstance',
  'getFilterModel',
  'setFilterModel',
  'onFilterChanged',
  'destroyFilter',
  'onSortChanged',
  'setSortModel',
  'getSortModel',
  'getFocusedCell',
  'setFocusedCell',
  'clearFocusedCell',
  'tabToNextCell',
  'tabToPreviousCell',
  'stopEditing',
  'startEditingCell',
  'getEditingCells',
  'exportDataAsCsv',
  'getDataAsCsv',
  'exportDataAsExcel',
  'getDataAsExcel',
  'addEventListener',
  'addGlobalListener',
  'removeEventListener',
  'removeGlobalListener',
  'dispatchEvent',
  'expandAll',
  'collapseAll',
  'onGroupExpandedOrCollapsed',
  'getRenderedNodes',
  'getCellRendererInstances',
  'getCellEditorInstances',
  'setAlwaysShowVerticalScroll',
  'ensureIndexVisible',
  'ensureNodeVisible',
  'ensureColumnVisible',
  'getHorizontalPixelRange',
  'getVerticalPixelRange',
  'showLoadingOverlay',
  'showNoRowsOverlay',
  'hideOverlay',
  'copySelectedRangeToClipboard',
  'copySelectedRangeDown',
  'paginationIsLastPageFound',
  'paginationGetPageSize',
  'paginationSetPageSize',
  'paginationGetCurrentPage',
  'paginationGetTotalPages',
  'paginationGetRowCount',
  'paginationGoToPage',
  'paginationGoToNextPage',
  'setHeaderHeight',
  'setGroupHeaderHeight',
  'setFloatingFiltersHeight',
  'setPivotHeaderHeight',
  'setPivotGroupHeaderHeight',
  'getStatusBarComponent',
  'setPopupParent',
  'addRenderedRowListener',
  'showToolPanel',
  'isToolPanelShowing',
  'doLayout',
  'getValue',
  'destroy',
  'showColumnMenuAfterButtonClick',
  'checkGridSize',
  'resetRowHeights',
  'onRowHeightChanged',
  'copySelectedRowsToClipboard',
  'addAggFunc',
  'hidePopupMenu',
  'setSuppressRowDrag',
  'setEnableCellTextSelection',
  'setGridAutoHeight',
  'isAnimationFrameQueueEmpty',
  'purgeServerSideCache'
]
METHOD_NAMES.forEach(name => {
  methods[name] = function (...args) {
    let gridApi = this.gridApi
    if (gridApi && gridApi[name]) {
      return gridApi[name](...args)
    } else {
      console.warn('ag-grid method ' + name + ' didn\'t work')
    }
  }
})
let mixin = {
  methods: methods
}
// methods mixin end

export default {
  name: 'AgTableComponent',
  data () {
    return {
      gridApi: null,
      columnApi: null,
      defaultProps: {
        animateRows: false
      }
    }
  },
  mixins: [mixin],
  components: {
    AgGridVue
  },
  props: {
    gridOptions: {
      type: Object
    },
    columnDefs: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    loading: {
      type: Boolean
    }
  },
  computed: {
    tableBind () {
      // TODO 增加 BOOLEAN_KEYS 数组, 判断非vue组件属性(html原生属性) 是否适用
      const { $attrs } = this
      const bind = this.defaultProps
      Object.keys($attrs).forEach(key => {
        const v = $attrs[key]
        const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
        bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
      })
      return bind
    },
    gridOptionsResult () {
      let obj = _.cloneDeep(gridOptionsDefault)
      obj = _.merge(obj, this.gridOptions)
      return obj
    },
    columnDefsResult () {
      return this.columnDefs.map(item => {
        let obj = _.cloneDeep(cellStyle)
        obj = _.merge(obj, item.cellStyle)
        return item
      })
    }
  },
  mounted () {
    $(window).resize(this.resetTableStyle)
  },
  beforeDestroy () {
    $(window).unbind('resize', this.resetTableStyle)
  },
  methods: {
    onGridReady (params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.$emit('grid-ready', params)
      this.loading && this.showLoading()
      this.initAgGrid()
    },
    initAgGrid () {
      // this.gridApi.sizeColumnsToFit();
    },
    modelUpdated (params) {
      this.$emit('modelUpdated', params)
      this.$nextTick(() => {
        this.resetTableStyle()
      })
    },
    cellClicked (eventData) {
      if (eventData.column.colId === 'tableName') {
        this.handleSkipTo({
          row: eventData.data
        }, 'table')
      } else if (eventData.column.colId === 'columnName') {
        this.handleSkipTo({
          row: eventData.data
        }, 'column')
      }
    },
    gridSelectionChanged (eventData) {
      let arr = this.gridApi.getSelectedNodes()
      let result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },
    useGridFun (funName, ...paraArr) {
      if (this.$devMode && (!this.gridApi || !this.gridApi[funName])) {
        console.debug('ag-grid method ' + funName + ' didn\'t work')
      }
      this.gridApi && this.gridApi[funName] && this.gridApi[funName](...paraArr)
    },
    resetTableStyle () {
      if (this.$refs.agGridTable && this.$refs.agGridTable.$el.clientWidth) {
        this.gridApi && this.gridApi.sizeColumnsToFit && this.useGridFun('sizeColumnsToFit')
      }
    },
    showLoading () {
      this.gridApi && this.gridApi.showLoadingOverlay && this.useGridFun('showLoadingOverlay')
    },
    hideLoading () {
      this.useGridFun('hideOverlay')
    },
    testLoading (showLoading) {
      if (showLoading) {
        this.showLoading()
      } else {
        this.hideLoading()
      }
    }
  },
  watch: {
    loading: {
      immediate: true,
      handler (newVal, oldVal) {
        this.testLoading(newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
// ag-grid default style
$selectedColor: #ecf5ff;
$hoverColor: #f6faff;
.ag-grid-default-style {
  .ag-root {
    // ag-grid 根元素
    $headerHigth: 40px;
    $borderColor: #EBEEF5;
    $backgroundColor: #fcfcfc;
    border: none;
    color: #606266;;
    font-size: 12px;
    .ag-header {
      border-bottom: 1px solid $borderColor;
      // line-height: 30px;
      .ag-header-row {
        border: 1px solid red;
        border: none;
        .ag-header-cell {
          background-color: $backgroundColor;
          height: $headerHigth;
          line-height: $headerHigth;
          color: #606060;
          &::after {
            border-color: rgba(0,0,0,0);
            height: $headerHigth;
          }
          &:hover::after {
            margin-top: 0;
            border-color: rgba(189, 195, 199, 0.5);
          }
        }
      }
      .ag-pinned-left-header {
        border-right: none;
        ::after {
          border-right: none;
        }
      }
      .options-column-header {
        text-align: right;
      }
    }
    .ag-row {
      border: none;
      border-bottom: 1px solid $borderColor;
      &.ag-row-odd, &.ag-row-even {
        background-color: #fff;
      }
      &.ag-row-hover {
        background-color: $hoverColor;
      }
      &.ag-row-selected {
        background-color: $selectedColor;
      }
      .ag-cell-focus {
        border: 1px solid rgba(0,0,0,0);
      }
      .empty-column-cell.ag-cell-last-left-pinned {
        border-right: none;
      }
      .options-column-cell.ag-cell-first-right-pinned {
        border-left: none;
      }
    }
  }
  &.ag-theme-balham {
    .ag-pinned-right-header {
      border-left: none;
    }
  }
  .ag-cell.ag-cell-not-inline-editing.ag-cell-auto-height.ag-cell-focus {
    border-color: transparent;
  }
  &.ag-theme-balham .ag-root-wrapper {
    border-color: transparent;
  }
  .ag-root .ag-header .ag-header-row .ag-header-cell {
    background-color: #fff;
  }
  &.ag-theme-balham .ag-header-cell::after, &.ag-theme-balham .ag-header-group-cell::after {
    // ag-cell-label-container ag-header-cell-sorted-none
    background-color: transparent;
    top: auto;
  }
  &.ag-theme-balham .ag-header-cell:hover, &.ag-theme-balham .ag-header-group-cell:hover {
    &::after {
      background-color: var(--ag-header-column-separator-color, rgba(189, 195, 199, 0.5));
    }
  }
  $headerHight: 32px;
  .ag-root .ag-header .ag-header-row .ag-header-cell {
    height: $headerHight;
  }
  .ag-root .ag-header .ag-header-row .ag-header-cell {
    line-height: $headerHight;
  }
  &.ag-theme-balham .ag-filter-toolpanel-header, &.ag-theme-balham .ag-filter-toolpanel-search, &.ag-theme-balham .ag-status-bar, &.ag-theme-balham .ag-header-row {
    font-weight: normal;
  }
  .ag-root .ag-row.ag-row-selected {
    background-color: #F5F7FA;
  }
}
</style>
