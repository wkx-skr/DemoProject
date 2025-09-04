<template>
  <div class="tab-page">
    <div class="filter-row">
      <div class="row-inner">
        <div class="search-container">
          <datablau-input
            placeholder="输入关键字进行搜索"
            v-model="keyword"
            clearable
            :iconfont-state="true"
          ></datablau-input>
        </div>
        <datablau-button style="margin-left: 10px" type="normal" @click="query">
          查询
        </datablau-button>
      </div>
    </div>
    <div class="table-row-data">
      <datablau-table
        class="datablau-table-info"
        ref="dsTable"
        :data="displayData"
        height="100%"
        :data-selectable="optionData.selectable"
        :auto-hide-selection="optionData.autoHideSelectable"
        :show-column-selection="optionData.showColumnSelection"
        :border="optionData.columnResizable"
        highlight-current-row
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          label="名称"
          show-overflow-tooltip
          prop="businessTabName"
        ></el-table-column>
        <!--<el-table-column label="模型" show-overflow-tooltip prop="businessTabName"></el-table-column>-->
        <el-table-column
          label="操作"
          width="100"
          fixed="right"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <datablau-button
              v-if="fromDialog"
              size="mini"
              type="text"
              @click="bind(scope.row)"
            >
              绑定
            </datablau-button>
            <datablau-button
              v-else
              size="mini"
              type="text"
              @click="modify(scope.row)"
            >
              修改
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="dialog-bottom footer-row-all">
      <span v-show="mutipleLength" class="check-info"></span>
      <span v-show="mutipleLength" class="footer-row-info">
        当前选中“{{ mutipleLength }}条”信息，是否
      </span>
      <datablau-button
        type="danger"
        v-show="mutipleLength"
        @click="preDeleteRows"
        :disabled="deleteDisabled"
      >
        <i class="el-icon-delete"></i>
        {{ $t('common.button.delete') }}
      </datablau-button>
      <datablau-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 500]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import ComponentCaseName from '@constant/ComponentCaseName'
export default {
  props: ['fromDialog'],
  data() {
    return {
      componentCaseName: ComponentCaseName.BusinessObjectList,
      loadingData: false,
      keyword: '',
      allData: [],
      displayData: null,
      deleteDisabled: true,
      optionData: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnResizable: true,
      },
      pageSize: 20,
      currentPage: 1,
      total: 0,
      multipleSelection: [],
      mutipleLength: 0,
    }
  },
  beforeMount() {
    if (this.fromDialog) {
      this.optionData.selectable = false
      this.optionData.showColumnSelection = false
    }
    this.getData()
  },

  methods: {
    query() {
      this.currentPage = 1
      this.getData()
    },
    getData() {
      const params = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.$http
        .post(`${this.$url}/service/busiObjects/getall`, params)
        .then(res => {
          this.allData = res.data.content
          this.$utils.sort.sortConsiderChineseNumber(
            this.allData,
            'businessTabName'
          )
          this.displayData = this.allData
          this.total = res.data.totalItems
        })
      return
      this.$http
        .get(`${this.$url}/service/busiObjects/tabs`)
        .then(res => {
          this.allData = res.data
          this.$utils.sort.sortConsiderChineseNumber(
            this.allData,
            'businessTabName'
          )
          this.filtData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filtData() {
      const keyword = this.keyword.trim().toLowerCase()
      let allList =
        this.allData.filter(item =>
          item.businessTabName.toLowerCase().includes(keyword)
        ) || []
      this.displayData =
        allList.slice(
          this.pageSize * (this.currentPage - 1),
          this.pageSize * this.currentPage
        ) || []
      this.total = allList.length
    },
    handleRowClick() {},
    modify(row) {
      this.$emit('modify', row)
    },
    bind(row) {
      this.$emit('bind', row)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.mutipleLength = val.length
      this.deleteDisabled = this.multipleSelection.length === 0
    },
    preDeleteRows() {
      const length = this.multipleSelection.length
      const tabsIds = this.multipleSelection
        .map(item => item.businessTabId)
        .join(',')
      this.$DatablauCofirm(`确定要删除${length}条业务实体吗？该操作不可恢复`)
        .then(() => {
          this.$http
            .delete(`${this.$url}/service/busiObjects/tabs?tabIds=${tabsIds}`)
            .then(res => {
              this.$message.success(`已成功删除${length}条业务实体`)
              this.multipleSelection = []
              this.getData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info('操作已取消')
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getData()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getData()
    },
  },
  watch: {
    // keyword() {
    //   this.filtData()
    // },
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.tab-page {
  // position: absolute;
  // top: 0;
  // left: 0;
  // right: 0;
  // bottom: 0;
  // overflow: hidden;
  position: static !important;
  .filter-row {
    position: absolute;
    height: 34px;
    border-bottom: none;
    top: 10px;
    .row-inner {
      height: 35px;
      line-height: 34px;
      margin-top: 0px;
    }
    .search-container {
      display: inline-block;
      width: 220px;
    }
    .addButton {
      float: right;
      margin-right: 20px;
    }
  }
  .table-row-data {
    position: absolute;
    left: 20px;
    right: 20px;
    top: 45px;
    bottom: 50px;

    /deep/ .el-table {
      &:before {
        background-color: transparent;
      }
    }
    .datablau-table-info {
      height: 100%;
    }
  }
  .footer-row-all {
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    padding: 10px 20px 0px 21px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    .check-info {
      width: 14px;
      height: 14px;
      display: inline-block;
      background: $primary-color;
      margin-right: -13px;
      vertical-align: middle;
    }
    .footer-row-info {
      height: 50px;
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        vertical-align: middle;
        line-height: 13px;
        color: white;
      }
    }
  }
}
</style>
