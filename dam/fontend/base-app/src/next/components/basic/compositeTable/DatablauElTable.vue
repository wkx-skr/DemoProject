/** * 可以监听的事件 * cellClick: 单元格被点击 (新, eltable) * // cellClicked:
单元格被点击 (aggrid, 不推荐) * selectionChange: 选中行改变 (新, eltable) * //
gridSelectionChanged: 选中行改变 (aggrid, 不推荐) * 常用方法 * refreshData *
setCurrentPara */
<template>
  <div class="tab-with-table" :class="totalClass">
    <div class="datablau-tab-top-line">
      <div class="vertical-middle top-line-inner">
        <span class="tab-title top-title" v-if="tabName">
          {{ tabName }}
        </span>
        <div
          class="custom-filter"
          style="display: inline-block"
          v-if="showCustomFilter"
        >
          <slot name="customFilter" class="btn-box"></slot>
        </div>
        <datablau-input
          v-if="!hideDefaultFilter"
          :style="{ width: searchWidth + 'px' }"
          :iconfont-state="true"
          :placeholder="searchPlaceholder"
          v-model="keyword"
          maxlength="50"
          filterable
          clearable
        ></datablau-input>
        <div class="button-container">
          <slot name="header" class="btn-box"></slot>
        </div>
      </div>
    </div>
    <div
      class="datablau-tab-table-line"
      :class="hideDefaultFilter ? 'hide-filter' : ''"
      ref="tableOuter"
    >
      <!-- :height="tableHeightInfo" -->
      <!-- height  100% 否则右侧有fixed属性，滚动会有问题 -->
      <datablau-table
        v-bind="$attrs"
        class="datablau-table-info"
        ref="deTable"
        :data="tableData"
        @selection-change="handleSelectionChange"
        @filter-change="colFilterHandler"
        @sort-change="handleSortChange"
        @cell-click="cellClick"
        v-if="gridReady"
        :row-key="rowKey"
        :height="tableHeightInfo"
        :data-selectable="tableOption.selectable"
        :auto-hide-selection="tableOption.autoHideSelectable"
        :show-column-selection="tableOption.showColumnSelection"
        :column-selection="tableOption.columnSelection"
        :border="tableOption.columnResizable"
      >
        <custom-col
          v-for="col in columns"
          :key="col.key"
          :label="col.label"
          :prop="col.prop"
          :min-width="col.minWidth"
          :width="col.width"
          :column-key="col.customKey || col.columnKey"
          :sortable="col.sortable"
          :type="col.elColType"
          :header-align="col.headerAlign"
          :align="col.align"
          :label-class-name="col.labelClassName"
          :class-name="col.className"
          :fixed="col.fixed"
          :showScope="col.showScope"
          :formatter="getFormatterFun(col)"
          :default-sort="defaultSort"
          :filters="col.filters"
          :filter-method="col.filterMethod"
          filter-placement="bottom-end"
          :show-overflow-tooltip="
            col.colType !== 'optionsCell' &&
            col.colType !== 'optionCol' &&
            col.colType !== 'iconCol'
          "
          :resizable="ifResizable(col)"
        >
          <template slot-scope="scope">
            <div class="col-container" v-if="col.colType === 'optionCol'">
              <span
                v-for="option in col.options"
                class="btn-outer"
                :key="option.name"
              >
                <datablau-button
                  v-if="showBtn(option, scope.row) && !option.btnType"
                  type="text"
                  :disabled="disabledBtn(option, scope.row)"
                  @click="
                    e => {
                      editItem(option.method, scope.row, e)
                    }
                  "
                >
                  <datablau-tooltip
                    v-if="option.icon"
                    effect="dark"
                    :content="option.text"
                    placement="bottom"
                  >
                    <i class="iconfont" :class="option.icon"></i>
                  </datablau-tooltip>
                  <span v-else>{{ option.text }}</span>
                </datablau-button>
                <datablau-button
                  v-if="showBtn(option, scope.row) && option.btnType == 'icon'"
                  type="icon"
                  low-key
                  :class="option.icon"
                  :disabled="disabledBtn(option, scope.row)"
                  @click="
                    e => {
                      editItem(option.method, scope.row, e)
                    }
                  "
                ></datablau-button>
              </span>
            </div>
            <div v-else-if="col.colType === 'customCol'">
              <slot
                class="cos-col-con"
                :row="scope.row"
                :column="scope.column"
                :$index="scope.$index"
                :store="scope.store"
                :name="col.customColName"
              >
                <p :class="col.customClass(scope.row)">
                  {{ col.customColName(scope.row) }}
                </p>
              </slot>
            </div>
            <div v-else-if="col.colType === 'optionsCell'">
              <slot
                class="cos-col-con custom123"
                :row="scope.row"
                :column="scope.column"
                :$index="scope.$index"
                :store="scope.store"
              >
                <component
                  :is="col.name"
                  :params="col.cellRendererParams"
                  :dataRrow="scope.row"
                  :dataColumn="scope.$index"
                ></component>
              </slot>
            </div>
            <div v-else-if="col.colType === 'iconCol'">
              <slot
                class="cos-col-con"
                :row="scope.row"
                :column="scope.column"
                :$index="scope.$index"
                :store="scope.store"
                :name="col.className"
              >
                <datablau-icon
                  :data-type="col.colDef.iconType"
                  :size="18"
                  style="position: relative; margin-left: 5px; top: 3px"
                ></datablau-icon>
                <!-- <i :class="col.colDef.customColName"></i> -->
              </slot>
            </div>
            <div v-else-if="col.colType === 'vueCol'">
              <slot
                class="cos-col-con"
                :row="scope.row"
                :column="scope.column"
                :$index="scope.$index"
                :store="scope.store"
                name="vueCol"
              ></slot>
            </div>
          </template>
        </custom-col>
      </datablau-table>
      <slot name="middle"></slot>
    </div>
    <div class="tab-bottom-line" v-if="!hideBottomLine">
      <div class="left-btn-container vertical-middle">
        <slot name="footer"></slot>
      </div>
      <div class="pagination-container vertical-middle">
        <datablau-pagination
          class="bottom-pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :total="totalShow"
          layout="total, sizes, prev, pager, next, jumper"
        ></datablau-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import customCol from './customCol.js'
export default {
  name: 'DatablauEltable',
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      tableLoading: false,

      sortData: {},
      tableData: null,
      keyword: '',
      gridApi: null,
      columnApi: null,
      keywordTimer: null,
      defaultTableOption: {
        domLayout: 'normal',
      },
      filterType: null,
      selectionChangePara: {},
      hasDefaultSort: false,
      // eltable data
      columns: null,
      isLoading: false,
      tableHeight: undefined,
      tabComponent: null,
      tableApi: {
        // table 组件的函数集合
        getSelectedNodes: null,
      },
      selection: [],
      defaultSort: {},
      gridReady: false,
    }
  },
  props: {
    totalShow: {
      // 项目 总数
      type: Number,
      required: true,
    },
    rowKey: {
      type: String | Function,
    },
    reserveSelection: {
      type: Boolean,
      default: false,
    },
    tableHeightInfo: {
      type: String,
      default: '100%',
    },
    searchPlaceholder: {
      type: String,
      default() {
        return this.$t('meta.lineageManage.searchPlaceholder')
      },
    },
    searchWidth: {
      type: Number,
      default: 240,
    },
    showCustomFilter: {
      type: Boolean,
      default: false,
    },
    columnDefs: {
      // 字段定义
      type: Array,
      required: true,
    },
    getShowData: {
      // 获取显示的函数, 返回一个 promise, resolve 参数是显示的 数组
      type: Function,
      required: true,
    },
    noPagination: {
      // 是否隐藏分页
      type: Boolean,
    },
    hideDefaultFilter: {
      // 是否显示顶部的搜索框
      type: Boolean,
      default: false,
    },
    hideTopLine: {
      // 隐藏上方 搜索行
      type: Boolean,
      default: false,
    },
    hideBottomLine: {
      // 隐藏底部 所有内容
      type: Boolean,
      default: false,
    },
    tableOption: {
      // 第一次显示时, 获取数据的参数
      type: Object,
      default() {
        return {
          selectable: true,
          autoHideSelectable: false,
          showColumnSelection: true,
          columnSelection: [],
          columnResizable: true,
        }
      },
    },
    defaultParaData: {
      // 第一次显示时, 获取数据的参数
      type: Object,
      default() {
        return {
          keyword: '',
          sortData: {},
          filterType: {},
          currentPage: 1,
          pageSize: 20,
        }
      },
    },
    tableHidePagination: {
      // 是否隐藏分页, table 高度自动
      type: Boolean,
      default: false,
    },

    // eltable parameters
    disableAutoFit: {
      // 是否 禁止自动调整宽度
      // aggrid 不推荐使用
      type: Boolean,
      default: false,
    },
    tabName: {
      // 左上角显示 tab name
      type: String,
      default: '',
    },
  },
  components: {
    customCol,
  },
  computed: {
    totalClass() {
      const result = {
        'hide-top-line': this.hideTopLine,
        'table-auto-height': this.tableHidePagination && !this.noPagination,
        'hide-bottom-line': this.hideBottomLine,
      }
      return result
    },
  },
  beforeMount() {
    this.columnFomatter()
    const para = this.defaultParaData
    if (para.sortData && para.sortData.colId) {
      this.hasDefaultSort = true
    }
    if (this.tableHidePagination && !this.noPagination) {
      this.defaultTableOption.domLayout = 'autoHeight'
    }
    this.dataInit()
  },
  mounted() {
    this.tablePropFomatter()
  },
  methods: {
    // handle event
    dataInit() {
      this.pageSize = this.defaultParaData.pageSize
      this.currentPage = this.defaultParaData.currentPage
      this.keyword = this.defaultParaData.keyword
      this.sortData = this.defaultParaData.sortData || {}
      const para = _.cloneDeep(this.defaultParaData)
      // if (!this.hasDefaultSort) {
      //   this.getPageData(para);
      // }
    },
    refreshData(type) {
      const para = this.getCurrentPara()
      if (type === 'treeClick') {
        para.currentPage = 1
      }
      this.getPageData(para)
    },
    handleSizeChange(newVal) {
      const para = this.getCurrentPara()
      para.pageSize = newVal
      para.currentPage = 1

      this.currentPage = 1
      this.pageSize = newVal
      this.getPageData(para)
    },
    handleCurrentChange(newVal) {
      const para = this.getCurrentPara()
      para.currentPage = newVal
      this.currentPage = newVal
      this.getPageData(para)
    },
    sortChanged(sortPara) {
      const sortArr = this.gridApi.getSortModel() || []
      this.sortData = sortArr[0] || {}
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    filterChanged(filterPara) {
      let filterType = null
      if (filterPara.api.getFilterModel) {
        filterType = filterPara.api.getFilterModel()
        this.filterType = filterType
      }
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    gridSelectionChanged(para) {
      this.selectionChangePara = para
      this.$emit('gridSelectionChanged', para)
    },
    cellClicked(para) {
      this.$emit('cellClicked', para)
    },
    cellClick(row, column, cell, event) {
      const para = {
        data: row,
        event,
        column: column,
        type: 'cellClicked',
        vaule: row[column.property] || '',
        api: this.tableApi,
        colDef: this.columnDefs[column.columnKey - 1],
        // columnApi: {},
        // node: cell,
        // rowIndex: 0,
      }
      this.$emit('cellClicked', para)
      this.$emit('cellClick', { row, column, cell, event })
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.selectionChangePara = {
        api: this.gridApi,
      }
      // this.initAgGrid()
    },
    initAgGrid() {
      this.$refs.columnsTable &&
        this.$refs.columnsTable.sizeColumnsToFit &&
        this.$refs.columnsTable.sizeColumnsToFit()
      const para = this.defaultParaData
      if (this.gridApi && this.gridApi.setSortModel && this.hasDefaultSort) {
        this.gridApi.setSortModel([
          {
            colId: (para.sortData && para.sortData.colId) || '',
            sort: (para.sortData && para.sortData.sort) || 'asc',
          },
        ])
      }
    },
    resetTableStyle() {
      // this.$refs.columnsTable.sizeColumnsToFit()
    },

    // get data
    getPageData(para) {
      this.tableData = null
      this.tableLoading = true
      this.getShowData(para)
        .then(data => {
          this.tableData = data
          const selectionChangePara = this.selectionChangePara
          this.$nextTick(() => {
            this.tableLoading = false
            this.gridSelectionChanged(selectionChangePara)
          })
        })
        .catch(e => {
          console.log(e)
          this.tableLoading = false
          this.tableData = []
        })
    },
    getCurrentPara() {
      const obj = {
        keyword: this.keyword,
        sortData: this.sortData,
        filterType: this.filterType,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      return obj
    },
    setCurrentPara(para) {
      // TODO
      // 对 keyword, currentPage 等变化进行特殊处理
      let hasSort = {}
      for (const key in para) {
        if (para[key]) {
          this[key] = para[key]
          if (key === 'sortData' && para[key] && para[key].colId) {
            hasSort = true
          }
        }
      }
      const para2 = this.getCurrentPara()
      if (hasSort && para.sortData && para.sortData.colId) {
        // this.gridApi.setSortModel([{
        //   colId: para.sortData && para.sortData.colId || '',
        //   sort: para.sortData && para.sortData.sort || 'asc',
        // }]);

        // ascending, descending
        let sort = para.sortData.sort
        if (sort === 'asc' || sort === 'ascending') {
          sort = 'ascending'
        } else {
          sort = 'descending'
        }
        this.defaultSort = {
          prop: para.sortData.colId || '',
          sort: para.sortData.sort,
        }
      } else {
        this.getPageData(para2)
      }
    },

    // eltable function formatter
    tablePropFomatter() {
      const tableOuter = this.$refs.tableOuter
      const height = $(tableOuter).height() || 300
      this.tableHeight = height

      const tableCom = this.$refs.deTable
      this.tableApi.getSelectedNodes = () => {
        const arr = this.selection.map(item => {
          return {
            data: item,
          }
        })
        return arr
      }
      // this.gridApi = params.api;
      // this.columnApi = params.columnApi;
      this.selectionChangePara = {
        api: this.tableApi,
      }
      this.gridReady = true
      const para = this.defaultParaData
      this.getPageData(para)
    },
    columnFomatter() {
      const columns = this.columnDefs.map((item, index) => {
        const col = {
          key: index + 1,
          label: item.label || item.headerName,
          prop: item.prop || item.field,
          columnKey: index + 1 + '',
          sortable: false,
          valueFormatter: item.valueFormatter,
          formatter: item.formatter,
          colDef: item,
          customKey: item.columnKey || '',
        }
        if (this.disableAutoFit || item.suppressSizeToFit) {
          col.width = item.width || item.minWidth
        } else {
          col.width = item.width
          col.minWidth = item.minWidth || item.width
        }
        if (item.filterParams && item.filterParams.getFilterItem) {
          col.filters = ['a'] // 占位
          item.filterParams.getFilterItem().then(res => {
            const filters = (res || [])
              .filter(item => !!item)
              .map(filter => {
                return {
                  text: filter,
                  value: filter,
                }
              })
            col.filters = filters || null
          })
        } else {
          col.filters = item.filters || null
        }
        const filterMethod = this.getFilterHandler(col)
        if (filterMethod) {
          col.filterMethod = filterMethod
        }
        const typeData = {
          firstEmptyColumn: {
            width: 20,
            labelClassName: 'empty-column-header',
            className: 'empty-column-cell',
          },
          selectionCheckboxColumn: {
            width: 50,
            elColType: 'selection',
            labelClassName: 'empty-column-header',
            className: 'empty-column-cell',
          },
          iconCol: {
            width: 28,
            labelClassName: 'icon-column-header',
            className: 'icon-column-cell',
            showScope: true,
            colType: 'iconCol',
          },
          customSortCol: {
            sortable: 'custom',
          },
          optionsWithContent: {
            labelClassName: 'options-column-header',
            className: 'options-column-cell',
            headerAlign: 'center',
            align: 'center',
            colType: 'optionCol',
            showScope: true,
            minWidth: null,
            fixed: 'right',
          },
          optionsWithContent2: {
            labelClassName: 'options-column-header',
            className: 'options-column-cell',
            headerAlign: 'center',
            align: 'center',
            colType: 'optionCol',
            showScope: true,
            minWidth: null,
          },
          optionsCell: {
            labelClassName: 'options-column-header',
            className: 'options-column-cell',
            headerAlign: 'center',
            align: 'center',
            colType: 'optionsCell',
            showScope: true,
            minWidth: null,
            fixed: 'right',
          },
          customCol: {
            showScope: true,
            colType: 'customCol',
            // headerAlign: 'center',
            // align: 'center',
          },
          vueCol: {
            showScope: true,
            colType: 'vueCol',
          },
        }

        const types = item.type || []
        types.forEach(type => {
          const obj = typeData[type]
          for (const key in obj) {
            col[key] = col[key] || obj[key]
          }
          if (type === 'optionsWithContent') {
            col.minWidth = null
            col.align = 'center'
            col.headerAlign = 'center'
          }
        })

        if (col.colType === 'optionCol') {
          let options = []
          if (item.cellRendererParams) {
            options = item.cellRendererParams.options || []
            this.tabComponent = item.cellRendererParams.tabComponent
          }
          col.options = options
        } else if (col.colType === 'customCol') {
          col.customColName = item.customColName
          col.customClass = item.customClass
        } else if (col.colType === 'optionsCell') {
          col.cellRendererFramework = item.cellRendererFramework
          col.cellRendererParams = item.cellRendererParams
          col.name = item.name
        }
        return col
      })
      this.columns = columns
    },
    colFilterHandler(filters) {
      const filterType = {}
      for (const key in filters) {
        const colDef = this.columnDefs[key - 1]
        const field = colDef.field
        filterType[field] = filters[key]
      }
      this.filterType = filterType
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    handleSortChange({ column, prop, order }) {
      this.sortData = {
        colId: prop,
        sort: order === 'ascending' ? 'asc' : 'desc',
      }
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    tableDolayout() {
      this.$refs.deTable &&
        this.$refs.deTable.doLayout &&
        this.$refs.deTable.doLayout()
    },
    editItem(method, data, e) {
      const tabComponent = this.tabComponent
      if (tabComponent && tabComponent[method]) {
        const para = {
          data: data,
          api: this.tableApi,
          e,
        }
        tabComponent[method](para)
      }
    },
    showBtn(option, data) {
      if (option.ifBtnShow) {
        return option.ifBtnShow(data)
      } else {
        return true
      }
    },
    disabledBtn(option, data) {
      if (option.ifBtnDisabled) {
        return option.ifBtnDisabled(data)
      } else {
        return false
      }
    },
    getFormatterFun(col) {
      let fun
      if (col.valueFormatter) {
        // aggrid

        // value: any, // the value before the change
        // data: any, // the data you provided for this row
        // node: RowNode, // the row node for this row
        // colDef: ColDef, // the column def for this column
        // column: Column, // the column for this column
        // api: GridApi, // the grid API
        // columnApi: ColumnApi, // the grid Column API
        // context: any  // the context

        fun = (row, column, cellValue, index) => {
          const colDef = this.columnDefs[column.columnKey - 1]
          const params = {
            value: cellValue,
            data: row,
            // node: row,
            colDef,
            column: column,
            api: this.tableApi,
            // columnApi: columnApi,
            // context: context
          }
          return col.valueFormatter(params)
        }
      } else if (col.formatter) {
        fun = (row, column, cellValue, index) => {
          return col.formatter(row, column, cellValue, index)
        }
      }
      return fun
    },
    handleSelectionChange(selection) {
      if (
        this.tableOption.rowSelection &&
        this.tableOption.rowSelection === 'single'
      ) {
        if (selection.length > 1) {
          this.selection.splice(0, 1)
          const del_row = selection.shift()
          this.$refs.deTable.$refs.table.toggleRowSelection(del_row, false)
        } else {
          this.selection = selection
        }
      } else {
        this.selection = selection
      }

      this.$emit('selectionChange', this.selection)
      const para = {
        api: this.tableApi,
        // columnApi: ColumnApi,
        type: 'selectionChanged',
      }
      this.gridSelectionChanged(para)
    },
    getFilterHandler(col) {
      const filters = col.filters || []
      let fn = null
      if (filters && filters.length > 0) {
        fn = this.filterHandler
      }
      return fn
    },
    filterHandler() {
      return true
    },
    ifResizable(col) {
      return !['iconCol', 'optionCol', 'optionsWithContent'].includes(
        col.colType
      )
    },
  },
  watch: {
    keyword(newVal, oldVal) {
      if (!newVal && !oldVal) {
        return
      }
      const defaultPara = this.getCurrentPara()
      defaultPara.keyword = newVal
      defaultPara.currentPage = 1
      this.currentPage = defaultPara.currentPage
      if (this.keywordTimer) {
        clearTimeout(this.keywordTimer)
        this.keywordTimer = null
      }
      this.keywordTimer = setTimeout(() => {
        this.getPageData(defaultPara)
      }, 300)
      this.$emit('changeKeyWord', newVal)
    },
    tableHidePagination(newVal) {
      // set domLayout
      let domLayout = ''
      if (newVal) {
        // autoHeight
        domLayout = 'autoHeight'
      } else {
        // normal
        domLayout = 'normal'
      }
      this.gridApi &&
        this.gridApi.setDomLayout &&
        this.gridApi.setDomLayout(domLayout)
    },
  },
}
</script>

<style lang="scss" scoped>
$topLineH: 54px;
@mixin clearPosition() {
  position: relative;
  top: 0;
  left: 0;
  bottom: auto;
  right: 0;
}
.tab-with-table {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  .datablau-tab-top-line {
    position: absolute;
    top: 0px;
    left: 20px;
    right: 0;
    height: 54px;

    .top-line-inner {
      width: 100%;

      .tab-title {
        float: left;
        margin-left: 8px;
        margin-right: 8px;
        padding-top: 5px;
        font-size: 16px;
        color: #20293b;
        font-weight: bolder;
      }

      .search-input {
        display: inline-block;
      }

      .button-container {
        display: inline-block;
        float: right;
      }
    }
  }
  .datablau-tab-table-line {
    position: absolute;
    top: $topLineH;
    bottom: 50px;
    left: 0;
    right: 0;
    margin-left: 20px;
    &.hide-filter {
      top: 0;
    }
    /deep/.datablau-table-info {
      height: 100%;
      .datablau-table {
        height: 100%;
        .el-table__body-wrapper {
          // position: absolute;
          overflow-y: auto;
          height: 95%;
          bottom: 0;
          // top: 41px;
        }
      }
    }
  }
  .tab-bottom-line {
    position: absolute;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    bottom: 0;
    left: 0;
    right: -20px;
    height: 50px;
    z-index: 9;
    .left-btn-container {
      left: 30px;
    }
    .pagination-container {
      right: 20px;
    }
  }
  .vertical-middle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  &.hide-top-line {
    .datablau-tab-top-line {
      height: 0;
      overflow: hidden;
    }
    .datablau-tab-table-line {
      top: 0px;
    }
  }
  &.hide-bottom-line {
    .tab-bottom-line {
      height: 0;
      overflow: auto;
    }
    .datablau-tab-table-line {
      bottom: 0;
    }
  }
  &.table-auto-height {
    @include clearPosition;
    .datablau-tab-top-line,
    .datablau-tab-table-line,
    .tab-bottom-line {
      @include clearPosition;
    }
    .pagination-container {
      display: none;
    }
  }
}
.btn-outer {
  margin-right: 0px;
}
</style>
