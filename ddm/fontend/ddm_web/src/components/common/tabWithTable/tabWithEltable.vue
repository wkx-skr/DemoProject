/** * 可以监听的事件 * cellClick: 单元格被点击 (新, eltable) * // cellClicked:
单元格被点击 (aggrid, 不推荐) * selectionChange: 选中行改变 (新, eltable) * //
gridSelectionChanged: 选中行改变 (aggrid, 不推荐) * 常用方法 * refreshData *
setCurrentPara */
<template>
  <div class="tab-with-table" :class="totalClass">
    <div class="tab-top-line">
      <div class="vertical-middle top-line-inner">
        <el-input
          v-if="!hideDefaultFilter"
          class="search-input"
          size="small"
          placeholder="输入关键字进行搜索"
          v-model="keyword"
          :clearable="true"
        ></el-input>
        <div class="button-container">
          <slot name="header" class="btn-box"></slot>
        </div>
      </div>
    </div>
    <div class="tab-table-line" ref="tableOuter">
      <el-table
        class="el-table datablau-table"
        ref="deTable"
        :height="tableHeight"
        :data="tableData"
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
        @filter-change="colFilterHandler"
        @sort-change="handleSortChange"
        @cell-click="cellClick"
        v-if="gridReady"
      >
        <custom-col
          v-for="col in columns"
          :key="col.key"
          :label="col.label"
          :prop="col.prop"
          :min-width="col.minWidth"
          :width="col.width"
          :column-key="col.columnKey"
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
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div class="col-container" v-if="col.colType === 'optionCol'">
              <span
                v-for="option in col.options"
                class="btn-outer"
                :key="option.name"
              >
                <el-button
                  v-if="showBtn(option, scope.row)"
                  type="text"
                  size="small"
                  :disabled="disabledBtn(option, scope.row)"
                  @click="
                    e => {
                      editItem(option.method, scope.row, e)
                    }
                  "
                >
                  {{ option.text }}
                </el-button>
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
              ></slot>
            </div>
          </template>
        </custom-col>
      </el-table>
      <slot name="middle"></slot>
    </div>
    <div class="tab-bottom-line" v-if="!hideBottomLine">
      <div class="left-btn-container vertical-middle">
        <slot name="footer"></slot>
      </div>
      <div class="pagination-container vertical-middle">
        <el-pagination
          class="bottom-pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :total="totalShow"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import customCol from './customCol.js'
export default {
  name: 'TabWithEltable',
  data () {
    return {
      currentPage: 1,
      pageSize: 20,
      tableLoading: false,
      sortData: {},
      tableData: [],
      keyword: '',
      gridApi: null,
      columnApi: null,
      keywordTimer: null,
      defaultTableOption: {
        domLayout: 'normal'
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
        getSelectedNodes: null
      },
      selection: [],
      defaultSort: {},
      gridReady: false
    }
  },
  props: {
    totalShow: {
      // 项目 总数
      type: Number,
      required: true
    },
    columnDefs: {
      // 字段定义
      type: Array,
      required: true
    },
    getShowData: {
      // 获取显示的函数, 返回一个 promise, resolve 参数是显示的 数组
      type: Function,
      required: true
    },
    noPagination: {
      // 是否隐藏分页
      type: Boolean
    },
    hideDefaultFilter: {
      // 是否显示顶部的搜索框
      type: Boolean,
      default: false
    },
    hideTopLine: {
      // 隐藏上方 搜索行
      type: Boolean,
      default: false
    },
    hideBottomLine: {
      // 隐藏底部 所有内容
      type: Boolean,
      default: false
    },
    defaultParaData: {
      // 第一次显示时, 获取数据的参数
      type: Object,
      default () {
        return {
          keyword: '',
          sortData: {},
          filterType: {},
          currentPage: 1,
          pageSize: 20
        }
      }
    },
    tableHidePagination: {
      // 是否隐藏分页, table 高度自动
      type: Boolean,
      default: false
    },

    // eltable parameters
    disableAutoFit: {
      // 是否 禁止自动调整宽度
      // aggrid 不推荐使用
      type: Boolean,
      default: false
    }
  },
  components: {
    customCol
  },
  computed: {
    totalClass () {
      const result = {
        'hide-top-line': this.hideTopLine,
        'table-auto-height': this.tableHidePagination && !this.noPagination,
        'hide-bottom-line': this.hideBottomLine
      }
      return result
    }
  },
  beforeMount () {
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
  mounted () {
    this.tablePropFomatter()
  },
  methods: {
    // handle event
    dataInit () {
      this.pageSize = this.defaultParaData.pageSize
      this.currentPage = this.defaultParaData.currentPage
      this.keyword = this.defaultParaData.keyword
      this.sortData = this.defaultParaData.sortData || {}
      const para = _.cloneDeep(this.defaultParaData)
      // if (!this.hasDefaultSort) {
      //   this.getPageData(para);
      // }
    },
    refreshData () {
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    handleSizeChange (newVal) {
      const para = this.getCurrentPara()
      para.pageSize = newVal
      para.currentPage = 1

      this.currentPage = 1
      this.pageSize = newVal
      this.getPageData(para)
    },
    handleCurrentChange (newVal) {
      const para = this.getCurrentPara()
      para.currentPage = newVal
      this.currentPage = newVal
      this.getPageData(para)
    },
    sortChanged (sortPara) {
      const sortArr = this.gridApi.getSortModel() || []
      this.sortData = sortArr[0] || {}
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    filterChanged (filterPara) {
      let filterType = null
      if (filterPara.api.getFilterModel) {
        filterType = filterPara.api.getFilterModel()
        this.filterType = filterType
      }
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    gridSelectionChanged (para) {
      this.selectionChangePara = para
      this.$emit('gridSelectionChanged', para)
    },
    cellClicked (para) {
      this.$emit('cellClicked', para)
    },
    cellClick (row, column, cell, event) {
      const para = {
        data: row,
        event,
        column: column,
        type: 'cellClicked',
        vaule: row[column.property] || '',
        api: this.tableApi,
        colDef: this.columnDefs[column.columnKey - 1]
        // columnApi: {},
        // node: cell,
        // rowIndex: 0,
      }
      this.$emit('cellClicked', para)
      this.$emit('cellClick', { row, column, cell, event })
    },
    onGridReady (params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.selectionChangePara = {
        api: this.gridApi
      }
      this.initAgGrid()
    },
    initAgGrid () {
      this.$refs.columnsTable &&
        this.$refs.columnsTable.sizeColumnsToFit &&
        this.$refs.columnsTable.sizeColumnsToFit()
      const para = this.defaultParaData
      if (this.gridApi && this.gridApi.setSortModel && this.hasDefaultSort) {
        this.gridApi.setSortModel([
          {
            colId: (para.sortData && para.sortData.colId) || '',
            sort: (para.sortData && para.sortData.sort) || 'asc'
          }
        ])
      }
    },
    resetTableStyle () {
      this.$refs.columnsTable.sizeColumnsToFit()
    },

    // get data
    getPageData (para) {
      this.tableLoading = true
      this.getShowData(para)
        .then(data => {
          this.tableData = data
          this.tableLoading = false
          const selectionChangePara = this.selectionChangePara
          this.$nextTick(() => {
            this.gridSelectionChanged(selectionChangePara)
          })
        })
        .catch(e => {
          console.log(e)
          this.tableLoading = false
          this.tableData = []
        })
    },
    getCurrentPara () {
      const obj = {
        keyword: this.keyword,
        sortData: this.sortData,
        filterType: this.filterType,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
      return obj
    },
    setCurrentPara (para) {
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
          sort: para.sortData.sort
        }
      } else {
        this.getPageData(para2)
      }
    },

    // eltable function formatter
    tablePropFomatter () {
      const tableOuter = this.$refs.tableOuter
      const height = $(tableOuter).height() || 300
      this.tableHeight = height

      const tableCom = this.$refs.deTable
      this.tableApi.getSelectedNodes = () => {
        const arr = this.selection.map(item => {
          return {
            data: item
          }
        })
        return arr
      }
      // this.gridApi = params.api;
      // this.columnApi = params.columnApi;
      this.selectionChangePara = {
        api: this.tableApi
      }
      this.gridReady = true
      const para = this.defaultParaData
      this.getPageData(para)
    },
    columnFomatter () {
      const columns = this.columnDefs.map((item, index) => {
        const col = {
          key: index + 1,
          label: item.label || item.headerName,
          prop: item.prop || item.field,
          columnKey: index + 1 + '',
          sortable: false,
          valueFormatter: item.valueFormatter,
          formatter: item.formatter,
          colDef: item
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
                  value: filter
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
            className: 'empty-column-cell'
          },
          selectionCheckboxColumn: {
            width: 50,
            elColType: 'selection',
            labelClassName: 'empty-column-header',
            className: 'empty-column-cell'
          },
          iconCol: {
            width: 40,
            labelClassName: 'icon-column-header',
            className: 'icon-column-cell'
          },
          customSortCol: {
            sortable: 'custom'
          },
          optionsWithContent: {
            labelClassName: 'options-column-header',
            className: 'options-column-cell',
            headerAlign: 'right',
            align: 'right',
            colType: 'optionCol',
            showScope: true,
            minWidth: null,
            fixed: 'right'
          },
          customCol: {
            showScope: true,
            colType: 'customCol'
          }
        }

        const types = item.type || []
        types.forEach(type => {
          const obj = typeData[type]
          for (const key in obj) {
            col[key] = col[key] || obj[key]
          }
          if (type === 'optionsWithContent') {
            col.minWidth = null
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
        }
        return col
      })
      this.columns = columns
    },
    colFilterHandler (filters) {
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
    handleSortChange ({ column, prop, order }) {
      this.sortData = {
        colId: prop,
        sort: order === 'ascending' ? 'asc' : 'desc'
      }
      this.currentPage = 1
      const para = this.getCurrentPara()
      this.getPageData(para)
    },
    tableDolayout () {
      this.$refs.deTable &&
        this.$refs.deTable.doLayout &&
        this.$refs.deTable.doLayout()
    },
    editItem (method, data, e) {
      const tabComponent = this.tabComponent
      if (tabComponent && tabComponent[method]) {
        const para = {
          data: data,
          api: this.tableApi,
          e
        }
        tabComponent[method](para)
      }
    },
    showBtn (option, data) {
      if (option.ifBtnShow) {
        return option.ifBtnShow(data)
      } else {
        return true
      }
    },
    disabledBtn (option, data) {
      if (option.ifBtnDisabled) {
        return option.ifBtnDisabled(data)
      } else {
        return false
      }
    },
    getFormatterFun (col) {
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
            api: this.tableApi
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
    handleSelectionChange (selection) {
      this.selection = selection
      this.$emit('selectionChange', selection)
      const para = {
        api: this.tableApi,
        // columnApi: ColumnApi,
        type: 'selectionChanged'
      }
      this.gridSelectionChanged(para)
    },
    getFilterHandler (col) {
      const filters = col.filters || []
      let fn = null
      if (filters && filters.length > 0) {
        fn = this.filterHandler
      }
      return fn
    },
    filterHandler () {
      return true
    }
  },
  watch: {
    keyword (newVal, oldVal) {
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
    tableHidePagination (newVal) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
$topLineH: 60px;
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
  .tab-top-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: $topLineH;
    .top-line-inner {
      width: 100%;
    }
    .search-input {
      max-width: 300px;
      margin-left: 20px;
      display: inline-block;
    }
    .button-container {
      float: right;
      padding-right: 20px;
    }
  }
  .tab-table-line {
    position: absolute;
    top: $topLineH;
    bottom: 60px;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--border-color-lighter);
    border-top: 1px solid var(--border-color-lighter);
  }
  .tab-bottom-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
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
    .tab-top-line {
      height: 0;
      overflow: hidden;
    }
    .tab-table-line {
      top: 0px;
    }
  }
  &.hide-bottom-line {
    .tab-bottom-line {
      height: 0;
      overflow: auto;
    }
    .tab-table-line {
      bottom: 0;
    }
  }
  &.table-auto-height {
    @include clearPosition;
    .tab-top-line,
    .tab-table-line,
    .tab-bottom-line {
      @include clearPosition;
    }
    .pagination-container {
      display: none;
    }
  }
  .btn-outer {
    margin-right: 10px;
  }
}
</style>
<style lang="scss">
.tab-with-table {
  .pagination-container {
      .el-pagination__total {
        font-weight: 400;
        color: #606266;
        float: none;
      }
    }
}
</style>
