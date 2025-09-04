<template>
  <div class="api-userinfo api-user-info">
    <div class="filter-line">
      <div class="left-filter">
        <span class="filter-label">调用日志记录：</span>
        <datablau-select
          clearable
          size="mini"
          v-model="filterRange"
          placeholder="请选择"
          @change="changeRange"
          style="height: 30px; display: inline-block"
        >
          <el-option
            v-for="(item, index) in filterRangeType"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
    </div>
    <datablau-eltable
      ref="tabWitdTable"
      class="api-detail-list"
      :totalShow="totalShow"
      :getShowData="getShowData"
      :columnDefs="columnDefs"
      :hideDefaultFilter="hideDefaultFilter"
      :hideTopLine="hideTopLine"
      :defaultParaData="defaultParaData"
      :tableOption="tableOption"
    ></datablau-eltable>
  </div>
</template>

<script>
import ddsHTTP from '../ddsHTTP.js'

export default {
  components: {},
  props: {
    detailData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showApplyDetail: false,
      inlineInfo: true,
      searchFormData: {},
      totalShow: 0,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: true,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
      filterRangeType: [
        { name: '近一周', value: 'week' },
        { name: '近一月', value: 'month' },
        { name: '近一年', value: 'year' },
      ],
      filterRange: '',
    }
  },
  computed: {},
  beforeMount() {
    const formatterTime = data => {
      return this.$timeFormatter(data.value)
    }
    const columnDefs = [
      // {
      //   type: ['indexCol'],
      // },
      {
        headerName: 'API 名称',
        field: 'apiName',
        tooltipField: 'apiName',
        width: 150,
        minWidth: 150,
      },
      {
        headerName: '调用应用',
        field: 'appName',
        tooltipField: 'appName',
        width: 150,
        minWidth: 150,
      },
      // {
      //   headerName: '调用用户',
      //   field: 'callUser',
      //   tooltipField: 'callUser',
      //   width: 150,
      //   minWidth: 150
      // },
      {
        headerName: '调用时间',
        field: 'callTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // cellRenderer: (params) => {
        //   let result = new Date(params.data.callTime).toLocaleDateString()
        //   return result
        // },
        width: 150,
      },
      {
        headerName: '状态',
        field: 'callResultStatus',
        valueFormatter: params => {
          // 方法改变，使用新的方法
          return params.data.callResultStatus ? '成功' : '失败'
        },
        width: 100,
      },
      {
        headerName: '调用URL',
        field: 'api',
        tooltipField: 'api',
        minWidth: 200,
      },
      {
        headerName: '详情',
        field: 'callFailedReason',
        tooltipField: 'callFailedReason',
        width: 150,
        minWidth: 150,
      },
      // {
      //   headerName: '详情',
      //   width: 100,
      //   type: ['optionsWithContent'],
      //   cellRendererParams: {
      //     tabComponent: this,
      //     options: [
      //       {
      //         name: 'showFailedReason',
      //         text: '错误原因',
      //         method: 'showFailedReason',
      //         ifBtnShow: (data) => !data.callResultStatus
      //       }
      //     ]
      //   }
      // }
    ]
    this.columnDefs = columnDefs

    this.defaultParaData = {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {},
  methods: {
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const obj = {
          currentPage: para.currentPage - 1,
          pageSize: para.pageSize,
          type: this.filterRange,
          apiId: this.detailData ? this.detailData.id : '',
        }

        ddsHTTP
          .getApiCallLog(obj)
          .then(res => {
            // this.tableLoading = false
            this.totalShow = res.data.totalItems
            resolve(res.data.content)
          })
          .catch(e => {
            this.tableLoading = false
            reject(e)
          })
      })
    },
    refreshData() {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData()
    },
    changeRange() {
      this.refreshData()
    },
    showFailedReason(para) {
      this.$message.info(para.data.callFailedReason || '')
    },
  },
  watch: {
    detailData() {
      this.refreshData()
    },
  },
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.api-userinfo {
  @include absPos();
  //border: 1px solid red;
  left: 0;
  height: auto;
  //top: 20px;

  .filter-line {
    margin-top: 10px;
    height: 40px;

    .left-filter {
      display: inline-block;
      width: 50%;
      .filter-label {
        margin-left: 20px;
      }
    }

    .right-btn-container {
      float: right;
    }
  }
  .api-detail-list {
    top: 45px;
    /deep/.tab-bottom-line {
      position: fixed;
      left: 161px;
      right: 0;
    }
  }
}
</style>

<style lang="scss" scoped>
.api-user-info {
  .tab-with-table .tab-top-line .button-container {
    float: none;
    //border: 1px solid red;
  }
}
</style>
