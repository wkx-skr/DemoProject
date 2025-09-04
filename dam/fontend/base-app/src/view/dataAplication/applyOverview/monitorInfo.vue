<template>
  <div class="my-appinfo">
    <el-form
      class="st-page-form search-list"
      id="standardListForm"
      label-position="right"
      label-width="100px"
      ref="searchForm"
      :inline="inlineInfo"
      :model="searchFormData"
      style="margin-top: 5px; min-width: 980px"
    >
      <el-form-item>
        <datablau-input
          placeholder="请输入API名称"
          maxlength="50"
          style="width: 240px"
          filterable
          clearable
          size="mini"
          v-model="searchFormData.apiName"
        ></datablau-input>
      </el-form-item>
      <el-form-item prop="dateDetail">
        <datablau-dateRange
          size="mini"
          v-model="searchFormData.dateDetail"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></datablau-dateRange>
      </el-form-item>
      <el-form-item class="list-button">
        <!-- <el-button size="mini" type="primary" @click="handleCurrentChange(1)">
          查询
        </el-button> -->
        <!-- <el-button size="mini" type="primary" @click="resetQuery()">重置</el-button> -->
      </el-form-item>
    </el-form>
    <div class="list-info">
      <datablau-table
        class="datablau-table"
        height="100%"
        ref="domainTable"
        :data="tableData"
        v-loading="tableLoading"
      >
        <el-table-column
          label="API名称"
          min-width="60"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="分类"
          prop="apiCatalog"
          min-width="60"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="创建人"
          prop="creator"
          min-width="60"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="最近调用时间"
          prop="latelyTime"
          min-width="60"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="平均响应时间(ms)"
          prop="averageTime"
          min-width="60"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="授权应用数"
          min-width="60"
          prop="authCount"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="调用次数"
          min-width="60"
          prop="callCount"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="progressInfo"
          label="调用成功率"
          min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-progress
              style="transform: scale(0.5)"
              type="circle"
              :percentage="getPercentage(scope.row)"
              :width="70"
              :color="successRateColor(scope.row)"
            ></el-progress>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="bottom-info">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
    <!-- <datablau-tab-with-table ref="tabWitdTable" :total ="total " :getShowData="getShowData"
      :columnDefs="columnDefs" :hideDefaultFilter="hideDefaultFilter" :hideTopLine="hideTopLine"
      :defaultParaData="defaultParaData" :tableOption="tableOption">
    </datablau-tab-with-table> -->
  </div>
</template>

<script>
import HTTP from '../ddsHTTP.js'
const moment = require('moment')
export default {
  props: {
    detailData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tableData: [],
      tableLoading: false,
      searchFormData: {
        statusDetail: 1,
        dateDetail: '',
        appCatalog: '',
        apiName: '',
      },
      appOption: [],
      inlineInfo: true,
      total: 0,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: true,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      pageSize: 20,
      currentPage: 1,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
      statusOpt: [
        {
          label: '使用中',
          value: '1',
        },
        {
          label: '已归还',
          value: '0',
        },
      ],
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    const formatterPath = para => {
      return para.value && para.value.join('/')
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: 'API名称',
        field: 'name',
        tooltipField: 'name',
        width: 200,
      },
      // {
      //     headerName: 'API url',
      //     field: 'appName',
      //     tooltipField: 'appName',
      //     width: 100,
      // },
      {
        headerName: '分类',
        field: 'apiCatalog',
        tooltipField: 'apiCatalog',
        width: 100,
      },
      {
        headerName: '创建人',
        field: 'creator',
        tooltipField: 'creator',
        width: 100,
      },
      {
        headerName: '最近调用时间',
        field: 'latelyTime',
        tooltipField: 'latelyTime',
        width: 200,
      },
      {
        headerName: '平均响应时间(ms)',
        field: 'averageTime',
        tooltipField: 'averageTime',
        width: 200,
      },
      {
        headerName: '授权应用数',
        field: 'authCount',
        tooltipField: 'authCount',
        width: 150,
      },
      {
        headerName: '调用次数',
        field: 'callCount',
        tooltipField: 'callCount',
        width: 100,
      },
      {
        headerName: '调用成功率',
        field: 'successRate',
        tooltipField: 'successRate',
        width: 100,
      },
    ]
    this.columnDefs = columnDefs
    this.defaultParaData = {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {
    this.getShowData(this.defaultParaData)
  },
  methods: {
    getPercentage(data) {
      const result = data.successRate ? +data.successRate.slice(0, -1) : 0
      return result
    },
    successRateColor(data) {
      const dataNum = data.successRate ? +data.successRate.slice(0, -1) : 0
      let color = null
      if (dataNum > 80) {
        // this.successRateStatus = 'success'
        color = '#66D9BA'
      } else if (dataNum > 60 && dataNum <= 80) {
        // this.successRateStatus = 'exception'
        color = '#e6a23c'
      } else if (dataNum <= 60) {
        // this.successRateStatus = 'exception'
        color = '#ff4949'
      }
      return color
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initTableData()
    },
    getAppOption() {
      const obj = {
        applicationName: '',
        applicationOwner: '',
        status: null,
        currentPage: 1,
        pageSize: 1000,
      }
      HTTP.getApplyLists(obj)
        .then(res => {
          this.appOption = res.data.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCurrentChange() {
      this.refreshData()
    },
    getShowData(para) {
      this.tableLoading = true
      const id = this.detailData.appId || this.detailData.id
      let startTime = ''
      let endTime = ''
      if (
        this.searchFormData.dateDetail &&
        this.searchFormData.dateDetail !== null
      ) {
        startTime = moment(this.searchFormData.dateDetail[0]).format(
          'YYYY-MM-DD'
        )
        endTime = moment(this.searchFormData.dateDetail[1]).format('YYYY-MM-DD')
      }
      return new Promise((resolve, reject) => {
        const obj = {
          apiName: this.searchFormData.apiName,
          startTime: startTime,
          endTime: endTime,
          currentPage: para.currentPage,
          pageSize: para.pageSize,
        }
        const newPromise = HTTP.getManageSpy(id, obj)
        newPromise
          .then(res => {
            this.tableLoading = false
            this.tableData = res.data.content
            this.total = res.data.totalItems
          })
          .catch(e => {
            this.tableLoading = false
            reject(e)
          })
      })
    },
    refreshData() {
      this.getShowData(this.defaultParaData)
    },
  },
  watch: {
    searchFormData: {
      deep: true,
      handler: function () {
        this.handleCurrentChange(1)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.my-appinfo {
  position: absolute;
  top: 10px;
  right: 20px;
  bottom: 0;
  left: 20px;
  overflow: auto;

  .search-list {
    .el-form-item {
      margin-right: 20px !important;
    }
    .list-button {
      margin-left: -6px;
    }
  }
  .bottom-info {
    position: fixed;
    left: 157px;
    height: 50px;
    bottom: 0;
    width: 100%;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    .datablau-pagination {
      float: right;
      margin-top: 9px;
      margin-right: 177px;
    }
  }
}

.my-appinfo > .list-info {
  position: absolute;
  left: 0;
  right: 0;
  top: 58px;
  bottom: 50px;
  .el-progress-circle {
    width: 50px !important;
    height: 50px !important;
  }
}
</style>
