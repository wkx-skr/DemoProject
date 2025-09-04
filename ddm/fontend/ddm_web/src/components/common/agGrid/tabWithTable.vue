/**
  * 可以监听的事件
  * cellClicked: 单元格被点击
  * gridSelectionChanged: 选中行改变
  * 常用方法
  * refreshData
  * setCurrentPara
 */
<template>
  <div class="tab-with-table" :class="totalClass">
    <div class="tab-top-line">
      <div class="vertical-middle top-line-inner" v-if="labelPosition === 'normal'">
        <slot name="header-left"></slot>
        <el-input
          v-if="!hideDefaultFilter"
          class="search-input"
          size="small"
          :placeholder="$v.udp.searchTips"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :clearable="true"
        ></el-input>
        <div class="button-container">
          <slot name="header" class="btn-box"></slot>
        </div>
      </div>
      <div class="vertical-middle top-line-inner right-search" v-if="labelPosition === 'leftName'">
        <span class="tab-title top-title">
          {{tabName}}
        </span>
        <el-input
          v-if="!hideDefaultFilter"
          class="search-input"
          size="small"
          :placeholder="$v.udp.searchTips"
          v-model="keyword"
          :clearable="true"
        ></el-input>
        <div class="button-container">
          <slot name="header" class="btn-box"></slot>
        </div>
      </div>
    </div>
    <div class="tab-table-line">
      <ag-table
        ref="columnsTable"
        @grid-ready="onGridReady"
        @cellClicked="cellClicked"
        @selectionChanged="gridSelectionChanged"
        @sortChanged="sortChanged"
        @filterChanged="filterChanged"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="tableData"
        :loading="tableLoading"
        :frameworkComponents="frameworkComponents"
      ></ag-table>
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
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import agTable from '@/components/common/agGrid/agTableComponent.vue'
export default {
  name: 'TabWithTable',
  data () {
    return {
      currentRequest: 1,
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
        domLayout: 'normal',
        headerHeight: '32',
        suppressRowClickSelection: true,
        overlayNoRowsTemplate: '暂无数据'
      },
      filterType: null,
      selectionChangePara: {},
      hasDefaultSort: false
    }
  },
  props: {
    frameworkComponents: {
      type: Object
    },
    totalShow: {
      // 项目 总数
      type: Number,
      required: true
    },
    columnDefs: {
      type: Array,
      required: true
    },
    getShowData: {
      // 获取显示的函数, 返回一个 promise, resolve 参数是显示的 数组
      type: Function,
      required: true
    },
    noPagination: {
      type: Boolean
    },
    hideDefaultFilter: {
      // 是否显示顶部的搜索框
      type: Boolean,
      default: false
    },
    hideTopLine: {
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
    tableOption: {
      // table 的option, 会覆盖默认的option
      type: Object,
      default () {
        return {}
      }
    },
    tableHidePagination: {
      // 是否隐藏分页, table 高度自动
      type: Boolean,
      default: false
    },
    labelPosition: {
      // 显示新模式, 将搜索框右移
      type: String,
      default: 'leftName'
    },
    tabName: {
      // 左上角显示 tab name
      type: String,
      default: ''
    }
  },
  components: {
    agTable
  },
  computed: {
    gridOptions () {
      let obj = _.cloneDeep(this.defaultTableOption)
      return _.merge(obj, this.tableOption)
    },
    totalClass () {
      let result = {
        'hide-top-line': this.hideTopLine,
        'table-auto-height': this.tableHidePagination && !this.noPagination,
        'hide-bottom-line': this.hideBottomLine,
        'show-title': this.labelPosition === 'leftName'
      }
      return result
    }
  },
  beforeMount () {
    let para = this.defaultParaData
    if (para.sortData && para.sortData.colId) {
      this.hasDefaultSort = true
    }
    if (this.tableHidePagination && !this.noPagination) {
      this.defaultTableOption.domLayout = 'autoHeight'
    }
    this.dataInit()
  },
  mounted () {

  },
  methods: {
    // handle event
    dataInit () {
      this.pageSize = this.defaultParaData.pageSize
      this.currentPage = this.defaultParaData.currentPage
      this.keyword = this.defaultParaData.keyword
      this.sortData = this.defaultParaData.sortData || {}
      let para = _.cloneDeep(this.defaultParaData)
      if (!this.hasDefaultSort) {
        this.getPageData(para)
      }
    },
    refreshData () {
      let para = this.getCurrentPara()
      this.getPageData(para)
    },
    handleSizeChange (newVal) {
      let para = this.getCurrentPara()
      para.pageSize = newVal
      para.currentPage = 1

      this.currentPage = 1
      this.pageSize = newVal
      this.getPageData(para)
    },
    handleCurrentChange (newVal) {
      let para = this.getCurrentPara()
      para.currentPage = newVal
      this.currentPage = newVal
      this.getPageData(para)
    },
    sortChanged (sortPara) {
      let sortArr = this.gridApi.getSortModel() || []
      this.sortData = sortArr[0] || {}
      this.currentPage = 1
      let para = this.getCurrentPara()
      this.getPageData(para)
    },
    filterChanged (filterPara) {
      let filterType = null
      if (filterPara.api.getFilterModel) {
        filterType = filterPara.api.getFilterModel()
        this.filterType = filterType
      }
      this.currentPage = 1
      let para = this.getCurrentPara()
      this.getPageData(para)
    },
    gridSelectionChanged (para) {
      this.selectionChangePara = para
      this.$emit('gridSelectionChanged', para)
    },
    cellClicked (para) {
      this.$emit('cellClicked', para)
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
      this.$refs.columnsTable && this.$refs.columnsTable.sizeColumnsToFit && this.$refs.columnsTable.sizeColumnsToFit()
      let para = this.defaultParaData
      if (this.gridApi && this.gridApi.setSortModel && this.hasDefaultSort) {
        this.gridApi.setSortModel([{
          colId: (para.sortData && para.sortData.colId) || '',
          sort: (para.sortData && para.sortData.sort) || 'asc'
        }])
      }
    },
    resetTableStyle () {
      this.$refs.columnsTable.sizeColumnsToFit()
    },

    // get data
    getPageData (para) {
      this.currentRequest++
      let requestId = this.currentRequest
      this.tableLoading = true
      this.getShowData(para)
        .then(data => {
          if (requestId !== this.currentRequest) { return }
          this.tableData = data
          this.tableLoading = false
          let selectionChangePara = this.selectionChangePara
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
      let obj = {
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
      for (let key in para) {
        if (para[key]) {
          this[key] = para[key]
          if (key === 'sortData' && para[key] && para[key].colId) {
            hasSort = true
          }
        }
      }
      let para2 = this.getCurrentPara()
      if (hasSort) {
        this.gridApi.setSortModel([{
          colId: (para.sortData && para.sortData.colId) || '',
          sort: (para.sortData && para.sortData.sort) || 'asc'
        }])
      } else {
        this.getPageData(para2)
      }
    }
  },
  watch: {
    keyword (newVal, oldVal) {
      if (!newVal && !oldVal) {
        return
      }
      let defaultPara = this.getCurrentPara()
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
      this.gridApi && this.gridApi.setDomLayout && this.gridApi.setDomLayout(domLayout)
    }
  }
}
</script>

<style lang="scss" scoped>
$topLineH: 60px;
$bottomLineH: 50px;
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
    height: 60px;
    .top-line-inner {
      width: 100%;
      &.right-search {
        text-align: right;
        .tab-title {
          float: left;
          margin-left: 8px;
          padding-top: 5px;
          line-height: 32px;
        }
        .search-input {
          margin-right: 20px;
        }
      }
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
    top: 60px;
    bottom: $bottomLineH;
    left: 0;
    right: 0;
    border-bottom: 1px solid #eee;
  }
  .tab-bottom-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: $bottomLineH;
    .left-btn-container {
      z-index: 1;
    }
    .pagination-container {
      // right: 20px;
      //padding-top: 4px;
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
      height:0;
      overflow:auto;
    }
    .tab-table-line {
      bottom:0;
    }
  }
  &.table-auto-height {
    @include clearPosition;
    .tab-top-line, .tab-table-line, .tab-bottom-line {
      @include clearPosition;
    }
    .pagination-container {
      display: none;
    }
  }
  &.show-title {
    left: 20px;
    border: transparent;
    .tab-table-line {
      .ag-theme-balham.ag-root-wrapper {
        border-color: transparent;
      }
    }
  }
}
</style>
