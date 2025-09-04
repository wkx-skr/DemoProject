/** * 可以监听的事件 * cellClicked: 单元格被点击 * gridSelectionChanged:
选中行改变 * gridReady 表格渲染完成 * 常用方法 * refreshData * getCurrentPara:
获取当前参数状态, 需要修改参数时, 可以先或者当前参数 * setCurrentPara *
clearFilters: 清空 过滤条件, 保留了 pageSize 和 排序 数据, 并刷新列表 *
forceUpdateCell 强制重新加载数据 */
<template>
  <div class="tab-with-table" :class="totalClass">
    <div class="tab-top-line">
      <div class="vertical-middle top-line-inner">
        <!--少量过滤条件可以使用, 如果过滤条件复杂, 可以隐藏过滤栏, 在组件外直接写新的-->
        <div class="custom-filter" v-if="showCustomFilter">
          <slot name="customFilter" class="btn-box"></slot>
        </div>
        <datablau-input
          :clearable="true"
          maxlength="50"
          class="search-input"
          v-if="!hideDefaultFilter"
          :placeholder="searchPlaceholder"
          v-model="keyword"
        ></datablau-input>
        <div class="button-container">
          <slot name="header" class="btn-box"></slot>
        </div>
      </div>
    </div>
    <div class="tab-table-line">
      <datablau-table
        v-if="isDatablau"
        :data="tableData"
        :data-selectable="isCheckbox"
        @selection-change="datablauSelectionChanged"
        :showColumnSelection="false"
        height="100%"
      >
        <el-table-column
          v-for="item in columnDefs"
          :key="item.field"
          :label="item.headerName"
          :prop="item.field"
          show-overflow-tooltip
          :width="item.isIcon ? 30 : ''"
        >
          <template slot-scope="scope">
            <datablau-icon
              v-if="item.isIcon"
              :data-type="scope.row.dataType"
              :size="18"
              style="position: relative; margin-left: 5px; top: 3px"
            ></datablau-icon>
            <span v-else>{{ scope.row[item.field] }}</span>
          </template>
        </el-table-column>
      </datablau-table>
      <ag-table
        v-else
        ref="columnsTable"
        @grid-ready="onGridReady"
        @cellClicked="cellClicked"
        @selectionChanged="gridSelectionRealChange"
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
        <datablau-pagination
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
import agTable from '@/components/common/agTableComponent.vue'
export default {
  name: 'TabWithTable',
  data() {
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
        domLayout: 'normal',
      },
      filterType: null,
      selectionChangePara: {},
      hasDefaultSort: false,
    }
  },
  props: {
    isDatablau: {
      // 是否使用datablau-table组件
      type: Boolean,
      default: false,
    },
    isCheckbox: {
      // 是否有复选框
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default() {
        return this.$t('meta.report.placeholder')
      },
    },
    frameworkComponents: {
      type: Object,
    },
    totalShow: {
      // 项目 总数
      type: Number,
      required: true,
    },
    columnDefs: {
      type: Array,
      required: true,
    },
    getShowData: {
      // 获取显示的函数, 返回一个 promise, resolve 参数是显示的 数组
      type: Function,
      required: true,
    },
    noPagination: {
      type: Boolean,
    },
    hideDefaultFilter: {
      // 是否显示顶部的搜索框
      type: Boolean,
      default: false,
    },
    hideTopLine: {
      type: Boolean,
      default: false,
    },
    showCustomFilter: {
      type: Boolean,
      default: false,
    },
    hideBottomLine: {
      // 隐藏底部 所有内容
      type: Boolean,
      default: false,
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
    tableOption: {
      // table 的option, 会覆盖默认的option
      type: Object,
      default() {
        return {}
      },
    },
    tableHidePagination: {
      // 是否隐藏分页, table 高度自动
      type: Boolean,
      default: false,
    },
  },
  components: {
    agTable,
  },
  computed: {
    gridOptions() {
      const obj = _.cloneDeep(this.defaultTableOption)
      return _.merge(obj, this.tableOption)
    },
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
    const para = this.defaultParaData
    if (para.sortData && para.sortData.colId) {
      this.hasDefaultSort = true
    }
    if (this.tableHidePagination && !this.noPagination) {
      this.defaultTableOption.domLayout = 'autoHeight'
    }
    this.dataInit()
  },
  // mounted() {
  //   console.log(this.columnDefs)
  // },
  methods: {
    // handle event
    dataInit() {
      this.pageSize = this.defaultParaData.pageSize
      this.currentPage = this.defaultParaData.currentPage
      this.keyword = this.defaultParaData.keyword
      this.sortData = this.defaultParaData.sortData || {}
      const para = _.cloneDeep(this.defaultParaData)
      if (!this.hasDefaultSort) {
        this.getPageData(para)
      }
    },
    /**
     * 刷新列表, 各种参数不变
     */
    refreshData(val) {
      const para = this.getCurrentPara()
      if ((val && typeof +val === 'number') || val == 0) {
        para.currentPage = val == 0 ? 1 : val
        this.currentPage = para.currentPage
      }
      this.getPageData(para)
    },
    /**
     * 清空 除了每页数量外的 过滤条件, 并刷新列表
     */
    clearFilters() {
      this.sortData = {}
      this.filterType = null
      this.currentPage = 1
      this.keyword = ''

      this.refreshData()
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
    gridSelectionRealChange(para) {
      // 真实的选中行改变会触发事件, 翻页不会触发事件
      this.$emit('gridSelectionRealChange', para)
      this.gridSelectionChanged(para)
    },
    datablauSelectionChanged(para) {
      this.selectionChangePara = para
      this.$emit('datablauSelectionChanged', para)
    },
    gridSelectionChanged(para) {
      this.selectionChangePara = para
      // 选中行改变, 显示数据变化, 触发事件
      this.$emit('gridSelectionChanged', para)
    },
    cellClicked(para) {
      this.$emit('cellClicked', para)
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.selectionChangePara = {
        api: this.gridApi,
      }
      this.initAgGrid()

      this.$emit('gridReady')
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
    /**
     * 重置行选中装个
     * ifChoosen: 函数, 判断该行是否选中
     * */
    setChosenRow(ifChoosen) {
      if (ifChoosen) {
        this.gridApi.forEachNode(node => {
          node.setSelected(ifChoosen(node))
        })
      }
    },
    resetTableStyle() {
      this.$refs.columnsTable.sizeColumnsToFit()
    },

    // get data
    getPageData(para) {
      this.tableLoading = true
      this.getShowData(para)
        .then(data => {
          this.tableData = [] // 防止tab切换时，图标不变化
          this.$nextTick(() => {
            this.tableData = data
            this.tableLoading = false
            const selectionChangePara = this.selectionChangePara
            this.gridSelectionChanged(selectionChangePara)
          })
        })
        .catch(e => {
          this.tableLoading = false
          this.tableData = []
        })
    },
    /**
     * 获取当前参数状态, 需要修改参数时, 可以先或者当前参数
     * @returns {{pageSize: number, keyword: string, filterType: null, currentPage: number, sortData: {}}}
     */
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
    forceUpdateCell() {
      if (this.gridApi && this.gridApi.refreshCells) {
        this.gridApi.refreshCells()
      }
    },
    /**
     * 修改当前过滤参数, 如果某个参数为空, 则不变
     * @param para
     */
    setCurrentPara(para) {
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
      // 如果排序数据改变, 需要调用 table 组件,改变排序图标显示等
      if (this.isDatablau) {
        this.getPageData(para2)
      } else {
        if (hasSort) {
          this.gridApi.setSortModel([
            {
              colId: (para.sortData && para.sortData.colId) || '',
              sort: (para.sortData && para.sortData.sort) || 'asc',
            },
          ])
        } else {
          this.getPageData(para2)
        }
      }
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
// $topLineH: 44px; // 搜索框上下间距10px
@mixin clearPosition() {
  position: relative;
  top: 0;
  left: 0;
  bottom: auto;
  right: 0;
}
/deep/ .el-pagination {
  .el-select {
    .el-input__inner {
      height: 30px;
      line-height: 30px;
    }
  }
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
      width: 240px;
      margin-left: 20px;
      // margin-left: 20px;
      display: inline-block;
    }

    .custom-filter {
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
    bottom: 50px;
    left: 0;
    right: 0;
    padding: 0 20px;
    // border-bottom: 1px solid var(--border-color-lighter);
    // border-top: 1px solid var(--border-color-lighter);
    /deep/ .datablau-table {
      height: 100%;
      .el-table__body-wrapper {
        position: absolute;
        top: 41px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      }
    }
  }
  .tab-bottom-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    background: #fff;
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
      overflow-y: auto;
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
}
</style>
