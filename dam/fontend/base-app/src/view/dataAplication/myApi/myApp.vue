<template>
  <div class="my-app">
    <datablau-dialog
      :close-on-click-modal="false"
      title="申请API"
      :visible.sync="showApplyDetail"
      append-to-body
      width="900px"
    >
      <apply-info
        componentType="requestAPI"
        @cancelItem="cancelItem"
        @applySuccess="applySuccess"
        :applyDetail="apiData"
        v-if="showApplyDetail"
      ></apply-info>
    </datablau-dialog>
    <datablau-page-title
      parent-name="数据服务"
      name="我申请的API"
    ></datablau-page-title>
    <el-form
      class="st-page-form nav-list"
      id="standardListForm"
      label-position="right"
      ref="searchForm"
      :inline="inlineInfo"
      :model="searchFormData"
      style="margin-top: 5px; margin-left: 20px; min-width: 980px"
    >
      <el-form-item prop="statusDetail" label="状态:">
        <datablau-select
          placeholder="请选择状态"
          class="select-style"
          style="width: 170px"
          filterable
          clearable
          size="mini"
          v-model="searchFormData.statusDetail"
        >
          <el-option
            v-for="item in statusOpt"
            :key="item.label"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
      </el-form-item>

      <el-form-item prop="dateDetail">
        <datablau-dateRange
          format="yyyy-MM-dd"
          size="mini"
          v-model="searchFormData.dateDetail"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></datablau-dateRange>
      </el-form-item>
      <el-form-item class="list-button">
        <!-- <datablau-button type="primary" @click="handleCurrentChange(0)">
          查询
        </datablau-button> -->
        <!-- <datablau-button size="mini" type="primary" @click="resetQuery()">重置</datablau-button> -->
      </el-form-item>
    </el-form>
    <datablau-eltable
      ref="tabWitdTable"
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
import HTTP from '../ddsHTTP.js'
import applyInfo from '../apiOverview/applyInfo.vue'
export default {
  props: {
    // 我申请的api=》“api”
    modeType: {
      type: String,
      required: true,
    },
  },
  components: { applyInfo },
  data() {
    return {
      showApplyDetail: false,
      searchFormData: {
        statusDetail: '',
        dateDetail: '',
        appCatalog: '',
      },
      ApiBaseurl: '',
      apiData: {},
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
      statusOpt: [
        {
          label: '全部',
          value: '',
        },
        {
          label: '已归还',
          value: '3',
        },
        {
          label: '审核中',
          value: '0',
        },
        {
          label: '审核通过',
          value: '1',
        },
        {
          label: '审核未通过',
          value: '2',
        },
      ],
    }
  },
  computed: {},
  beforeMount() {
    const formatterPath = para => {
      return para.value && para.value.join('/')
    }
    const formatterCreateTime = data => {
      const t = this.$timeFormatter(data.data.createTime)
      return t
    }
    const formatterStatus = data => {
      const t = data.applyStatus
      return t
    }
    const formatterClassStatus = data => {
      let status, t
      status = data.applyStatus
      if (status === '审核通过') {
        t = 'dot-shape approved'
      } else if (status === '审核未通过') {
        t = 'dot-shape disapproved'
      } else if (status === '审核中') {
        t = 'dot-shape approving'
      } else if (status === '已归还') {
        t = 'dot-shape return'
      }
      return t
    }
    const formatterEffectiveTime = data => {
      let result, effectiveTime
      effectiveTime = data.data.effectiveTime
      if (effectiveTime) {
        result = effectiveTime
      } else {
        result = '长期'
      }

      return result
    }
    const formatterApplyTime = data => {
      const t = this.$timeFormatter(data.applyTime)
      return t
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '应用名称',
        field: 'appName',
        tooltipField: 'appName',
      },
      {
        headerName: '应用描述',
        field: 'domainCode',
        tooltipField: 'domainCode',
      },
      {
        headerName: '分类',
        field: 'englishName',
        tooltipField: 'englishName',
      },
      {
        headerName: '申请状态',
        //   field: 'abbreviation',
        cellRenderer: params => {
          let result = ''
          if (params.data.auditStatus === 0) {
            result = '审核中'
          } else if (params.data.auditStatus === -1) {
            result = '驳回'
          } else if (params.data.auditStatus === 1) {
            result = '通过'
          }
          return result
        },
      },
      {
        headerName: '申请时效',
        //   field: 'abbreviation',
        cellRenderer: params => {
          let result = ''
          if (params.data.dataType === 0) {
            result = '长期'
          } else if (params.data.dataType === 1) {
            result = params.data.dataContent + '天'
          } else if (params.data.dataType === 2) {
            result = new Date(params.data.dataContent).toLocaleDateString()
          }
          return result
        },
      },
      {
        headerName: '审核意见',
        field: 'auditComment',
        tooltipField: 'auditComment',
      },
      {
        headerName: '申请时间',
        cellRenderer: params => {
          return formatterApplyTime(params)
        },
      },
      {
        headerName: '到期时间',
        cellRenderer: params => {
          let result = ''
          if (params.data.dataType === 0) {
            result = '长期'
          } else {
            if (params.data.effectiveTime) {
              result = result = formatterEffectiveTime(params)
            } else {
              result = ''
            }
          }
          return result
        },
      },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [{ name: 'return', text: '归还', method: 'returnItem' }],
        },
      },
    ]
    const columnDefsApi = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: 'API名称',
        field: 'name',
        tooltipField: 'name',
      },
      {
        headerName: '应用名称',
        field: 'appName',
        tooltipField: 'appName',
      },
      {
        headerName: 'API描述',
        field: 'description',
        tooltipField: 'description',
      },
      {
        headerName: '分类',
        field: 'apiCatalog',
        tooltipField: 'apiCatalog',
        width: 90,
      },
      {
        headerName: '状态',
        // field: 'applyStatus',
        // tooltipField: 'applyStatus',
        width: 90,
        type: ['customCol'],
        customClass: formatterClassStatus,
        customColName: formatterStatus,
      },
      // {
      //   headerName: '申请时效',
      //   //   field: 'abbreviation',
      //   cellRenderer: (params) => {
      //     let result = '';
      //     if (params.data.dataType === 0) {
      //       result = "长期";
      //     } else if (params.data.dataType === 1) {
      //       result = params.data.dataContent + "天";
      //     } else if (params.data.dataType === 2) {
      //       result = new Date(params.data.dataContent).toLocaleDateString()
      //     }
      //     return result;
      //   },
      //   width: 100,
      // },
      {
        headerName: '审核意见',
        field: 'auditComment',
        tooltipField: 'auditComment',
      },
      {
        headerName: '申请时间',
        valueFormatter: formatterCreateTime,
        tooltipValueGetter: formatterCreateTime,
        width: 100,
        // cellRenderer: (params) => {
        //   let result = new Date(params.data.createTime).toLocaleDateString();
        //   return result;
        // },
      },
      {
        headerName: '到期时间',
        tooltipField: 'createTime',
        valueFormatter: formatterEffectiveTime,
        width: 100,
      },
      {
        headerName: '操作',
        width: 200,
        headerAlign: 'center',
        align: 'center',
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'apply',
              text: '再申请',
              method: 'applyItem',
              ifBtnShow: this.ifCheckShow,
            },
            {
              name: 'return',
              text: '归还',
              method: 'returnItem',
              ifBtnDisabled: this.ifCheckDisabled,
              ifBtnShow: !this.ifCheckShow,
            },
          ],
        },
      },
    ]
    const columnDefAppMonitor = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: 'API名称',
        field: 'name',
        tooltipField: 'name',
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
      },
      {
        headerName: '创建人',
        field: 'creator',
        tooltipField: 'creator',
      },
      {
        headerName: '最近调用时间',
        field: 'latelyTime',
        tooltipField: 'latelyTime',
      },
      {
        headerName: '平均响应时间(ms)',
        field: 'averageTime',
        tooltipField: 'averageTime',
      },
      {
        headerName: '授权应用数',
        field: 'authCount',
        tooltipField: 'authCount',
      },
      {
        headerName: '调用次数',
        field: 'callCount',
        tooltipField: 'callCount',
      },
      {
        headerName: '调用成功率',
        field: 'successRate',
        tooltipField: 'successRate',
      },
    ]
    if (this.modeType === 'app') {
      this.columnDefs = columnDefs
    } else if (this.modeType === 'api') {
      this.columnDefs = columnDefsApi
    } else if (this.modeType === 'appMonitor') {
      this.columnDefs = columnDefAppMonitor
    }
    this.defaultParaData = {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {
    this.getBaseurl()
  },
  methods: {
    getColor(data, info) {
      if (info === 'background') {
        if (data.currentState === '审核通过') {
          return 'background-color:#57A07F'
        } else if (data.currentState === '审核未通过') {
          return 'background-color:#F46565'
        } else if (data.currentState === '审核中') {
          return 'background-color:#AFB4BF'
        } else if (data.currentState === '已归还') {
          return 'background-color:#4386F5'
        }
      } else {
        if (data.currentState === '审核通过') {
          return 'color:#57A07F'
        } else if (data.currentState === '审核未通过') {
          return 'color:#F46565'
        } else if (data.currentState === '审核中') {
          return 'color:#AFB4BF'
        } else if (data.currentState === '已归还') {
          return 'color:#4386F5'
        }
      }
    },
    cancelItem() {
      this.showApplyDetail = false
    },
    getBaseurl() {
      HTTP.getApiBaseurl()
        .then(res => {
          this.ApiBaseurl = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    applySuccess() {
      this.showApplyDetail = false
      this.refreshData()
      this.$showSuccess('提交申请成功')
    },
    ifCheckDisabled(data) {
      let bool = true
      if (data.applyStatus === '审核通过') {
        bool = false
      }
      return bool
    },
    ifCheckShow(data) {
      let bool = false
      if (data.applyStatus === '已归还') {
        bool = true
      }
      return bool
    },
    applyItem(data) {
      this.showApplyDetail = true
      this.apiData = data.data
      this.apiData.baseURL =
        this.ApiBaseurl.slice() + '/' + data.data.name + '/' + data.data.version
    },
    handleCurrentChange(val) {
      this.refreshData(val)
    },
    returnItem(data) {
      this.$DatablauCofirm('是否确认归还?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          let newPromise
          if (this.modeType === 'app') {
            newPromise = HTTP.returnApply(data.data.appId)
          } else if (this.modeType === 'api') {
            newPromise = HTTP.returnApi(data.data.id)
          }
          newPromise
            .then(() => {
              this.$showSuccess('归还成功')
              this.refreshData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {})
    },
    getShowData(para) {
      let startTime = ''
      let endTime = ''
      if (
        this.searchFormData.dateDetail &&
        this.searchFormData.dateDetail !== null
      ) {
        startTime = new Date(this.searchFormData.dateDetail[0])
          .toLocaleDateString()
          .replaceAll('/', '-')
        endTime = new Date(this.searchFormData.dateDetail[1])
          .toLocaleDateString()
          .replaceAll('/', '-')
      }
      return new Promise((resolve, reject) => {
        const obj = {
          appStatus: this.searchFormData.statusDetail,
          startTime: startTime,
          endTime: endTime,
          currentPage: para.currentPage,
          pageSize: para.pageSize,
        }

        let newPromise
        if (this.modeType === 'app') {
          newPromise = HTTP.getMyApp(obj)
        } else if (this.modeType === 'api') {
          newPromise = HTTP.getMyApi(obj)
        }

        newPromise
          .then(res => {
            // this.tableLoading = false
            this.totalShow = res.data.totalItems || 0
            resolve(res.data.content)
          })
          .catch(e => {
            this.$showFailure(e)
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
        this.handleCurrentChange('treeClick')
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.my-app {
  position: relative;
  height: 100%;
  margin-right: 20px;
  .nav-list {
    .el-form-item {
      margin-right: 20px !important;
    }
    .list-button {
      margin-left: -6px;
    }
  }

  .page-title-row {
    span {
      margin-left: 0 !important;
    }
  }
}

/deep/.dot-shape {
  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 8px;
  }
  &.disapproved {
    color: #f46565;
    &:before {
      background-color: #f46565;
    }
  }
  &.approved {
    color: #57a07f;
    &:before {
      background-color: #57a07f;
    }
  }
  &.approving {
    color: #afb4bf;
    &:before {
      background-color: #afb4bf;
    }
  }
  &.return {
    color: #4386f5;
    &:before {
      background-color: #4386f5;
    }
  }

  /* background-color: grey; */
}

.check-button {
  position: absolute;
  right: 10px;
}

.my-app > .tab-with-table {
  /* right: 13%; */
  top: 87px;
}
</style>
