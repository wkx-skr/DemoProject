<template>
  <div class="call-container">
    <div class="call-list">
      <el-form
        class="st-page-form"
        id="standardListForm"
        label-position="right"
        label-width="60px"
        ref="searchForm"
        :inline="inlineInfo"
        :model="searchFormData"
        style="min-width: 980px"
      >
        <el-form-item prop="appName">
          <datablau-input
            placeholder="请输入API名称"
            class="select-style"
            style="width: 240px"
            :iconfont-state="true"
            filterable
            clearable
            v-model="searchFormData.appName"
          ></datablau-input>
        </el-form-item>
        <el-form-item prop="dateDetail">
          <datablau-dateRange
            v-model="searchFormData.dateDetail"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></datablau-dateRange>
        </el-form-item>
        <el-form-item class="check-button">
          <!-- <datablau-button type="primary" @click="handleCurrentChange(1)">
            查询
          </datablau-button> -->
        </el-form-item>
        <el-form-item class="download-button">
          <datablau-button type="primary" @click="downloadFile">
            下载Excel
          </datablau-button>
        </el-form-item>
      </el-form>
      <div class="table-outer">
        <datablau-eltable
          ref="tabWitdTable"
          tableHeightInfo="100%"
          :totalShow="totalShow"
          :getShowData="getShowData"
          :columnDefs="columnDefs"
          :hideDefaultFilter="hideDefaultFilter"
          :hideTopLine="hideTopLine"
          :defaultParaData="defaultParaData"
          :tableOption="tableOption"
        ></datablau-eltable>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '../ddsHTTP.js'
const moment = require('moment')
const ddmConfig = window.setting.products.dam
export default {
  props: {},
  data() {
    return {
      searchFormData: {
        appName: '',
        dateDetail: '',
        apiCatalog: '',
      },
      appOption: [],
      baseUrl: `${ddmConfig.serverPath}/service`,
      inlineInfo: true,
      totalShow: 0,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: true,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    const formatterClassRate = para => {
      let classStr = ''
      const rate = parseInt(para.successRate)
      if (rate > 80) {
        classStr = 'rate-col high-rate'
      } else if (rate > 60) {
        classStr = 'rate-col middle-rate'
      } else {
        classStr = 'rate-col low-rate'
      }
      return classStr
    }
    const formatterRate = para => {
      return para.successRate
    }
    const columnDefs = [
      {
        headerName: 'API名称',
        field: 'name',
        tooltipField: 'name',
        // width: 200,
        // minWidth: 200,
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
        // width: 100,
        // minWidth: 100,
      },
      {
        headerName: '创建人',
        field: 'creator',
        tooltipField: 'creator',
        // width: 100,
        // minWidth: 100,
      },
      {
        headerName: '最近调用时间',
        field: 'latelyTime',
        tooltipField: 'latelyTime',
        // width: 150,
        suppressSizeToFit: true,
        resizable: false,
      },
      {
        headerName: '平均响应时间(ms)',
        field: 'averageTime',
        tooltipField: 'averageTime',
        // width: 120,
        suppressSizeToFit: true,
        // minWidth: 100,
      },
      {
        headerName: '授权应用数',
        field: 'authCount',
        tooltipField: 'authCount',
        // width: 120,
        suppressSizeToFit: true,
        // minWidth: 100,
      },
      {
        headerName: '调用次数',
        field: 'callCount',
        tooltipField: 'callCount',
        // width: 200,
        suppressSizeToFit: true,
        // minWidth: 100,
      },
      {
        headerName: '调用成功率',
        field: 'successRate',
        type: ['customCol'],
        customClass: formatterClassRate,
        customColName: formatterRate,
        tooltipField: 'successRate',
        // width: 100,
        resizable: false,
        suppressSizeToFit: true,
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
    this.getAppOption()
  },
  methods: {
    handleCurrentChange(val) {
      this.refreshData(val)
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
    downloadFile() {
      let startTime = ''
      let endTime = ''
      let obj
      if (
        this.searchFormData.dateDetail &&
        this.searchFormData.dateDetail !== null
      ) {
        startTime = moment(this.searchFormData.dateDetail[0]).format(
          'YYYY-MM-DD'
        )
        endTime = moment(this.searchFormData.dateDetail[1]).format('YYYY-MM-DD')
      }
      obj = {
        apiName: this.searchFormData.appName,
        startTime: startTime,
        endTime: endTime,
      }
      const url = `/dds/app/apiAuth/export`
      this.$downloadFilePost(url, obj, 'api列表')
    },
    getShowData(para) {
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
          apiName: this.searchFormData.appName,
          startTime: startTime,
          endTime: endTime,
          currentPage: para.currentPage,
          pageSize: para.pageSize,
        }
        const newPromise = HTTP.getCallList(obj)
        newPromise
          .then(res => {
            this.totalShow = res.data.totalItems
            resolve(res.data.content)
          })
          .catch(e => {
            this.tableLoading = false
            reject(e)
          })
      })
    },
    refreshData(val) {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData(val)
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
.call-container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
}
.call-list {
  .st-page-form {
    position: relative;
    z-index: 2;

    & /deep/ .el-form-item {
      margin-right: 20px;
      vertical-align: middle;
      //border: 1px solid red;

      .el-form-item__content {
        vertical-align: middle;

        & > div,
        & > button {
          //border: 1px solid red;
          vertical-align: middle;
        }

        //button.el-button--primary {
        //  height: 28px;
        //}
      }
    }
  }
}
</style>

<style lang="scss" scoped>
/*
.call-list>.st-page-form {
    margin-left: -1%;
} */
.call-list {
  padding: 16px;
  //border: 1px solid red;

  .left-line {
    display: inline-block;
    margin: 0 6px 0 20px;
    vertical-align: middle;
    border-radius: 2px;
    width: 4px;
    height: 18px;
    background-color: #4386f5;
  }

  .download-button {
    position: absolute;
    right: 0px;
  }

  .component-title {
    display: inline-block;
    //border-left: 4px solid #4386F5;
    //padding-left: 6px;
    color: #20293b;
    font-size: 15px;
    vertical-align: middle;
  }
  /deep/.rate-col {
    font-weight: bold;

    &.high-rate {
      color: #57a07f;
    }

    &.middle-rate {
      color: #f79b3f;
    }

    &.low-rate {
      color: #f46565;
    }
  }
  .table-outer {
    //border: 1px solid red;
    position: absolute;
    top: 60px;
    left: 16px;
    right: 16px;
    bottom: 0px;
    /deep/.tab-with-table {
      .tab-bottom-line {
        left: -20px;
      }
      .datablau-tab-table-line {
        left: -20px;
      }
    }
  }
}

// .call-list > .tab-with-table {
//   top: 35px;

//   .tab-table-line {
//     top: 23px;
//   }

//   .tab-top-line {
//     display: none;
//   }
// }
</style>
