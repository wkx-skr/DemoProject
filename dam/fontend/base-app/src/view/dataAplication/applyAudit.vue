<template>
  <div class="apply-audit">
    <datablau-dialog
      :close-on-click-modal="false"
      title="审核"
      :visible.sync="auditVisible"
      size="s"
      height="300"
      append-to-body
    >
      <el-form
        :model="appForm"
        :rules="rules"
        ref="auditFrom"
        label-width="80px"
        class="apply-form"
        v-if="auditVisible"
      >
        <el-form-item label="审批操作" prop="status">
          <datablau-radio v-model="appForm.status">
            <el-radio label="approve" name="dateContent">通过</el-radio>
            <el-radio label="reject" name="dateContent">拒绝</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item label="审批意见" style="margin-top: 16px" prop="remark">
          <datablau-input
            type="textarea"
            :row="2"
            style="width: 300px"
            resize="none"
            v-model="appForm.remark"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" size="mini" @click="cancelAudit">
          取 消
        </datablau-button>
        <datablau-button size="mini" type="primary" @click="auditRemark">
          提 交
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-page-title
      parent-name="数据服务"
      :name="isApi ? 'API审核' : '应用审核'"
    ></datablau-page-title>
    <datablau-eltable
      :searchPlaceholder="searchPlaceholder"
      ref="tabWitdTable"
      class="audit-list"
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
import HTTP from './ddsHTTP.js'
export default {
  data() {
    return {
      appForm: {
        remark: '',
        status: 'approve',
      },
      auditMap: {
        app: {
          approve: 1,
          reject: 4,
        },
        api: {
          approve: 1,
          reject: 2,
        },
      },
      approveStatus: 1,
      rejectStatus: 4,
      auditVisible: false,
      totalShow: 0,
      appId: null,
      apiId: null,
      realAppId: null,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: false,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
      rules: {
        status: [
          { required: true, message: '请勾选审批意见', trigger: 'blur' },
        ],
        remark: { max: 200, message: '字符长度200以下', trigger: 'blur' },
      },
    }
  },
  props: ['modeType'], // api市场列表   apiList
  components: {},
  computed: {
    isApi() {
      return this.modeType === 'apiList'
    },
  },
  beforeMount() {
    const formatterPath = para => {
      return para.value && para.value.join('/')
    }
    const formatterTime = data => {
      const t = this.$timeFormatter(data.data.createTime)
      return t
    }
    const formatterdateContent = data => {
      let result = ''
      if (data.data.dateType == 1) {
        result = '长期'
      } else if (data.data.dateType == 2) {
        result = data.data.dateContent + '天'
      } else if (data.data.dateType == 3) {
        result = new Date(parseInt(data.data.dateContent)).toLocaleDateString()
      }
      return result
    }
    const formatterApplyTime = data => {
      const t = this.$timeFormatter(data.data.applyTime)
      return t
    }
    const columnDefs = [
      // {
      //   //  type: ['selectionCheckboxColumn'],
      //   type: ['firstEmptyColumn'],
      // },
      {
        headerName: '应用名称',
        field: 'applicationName',
        tooltipField: 'applicationName',
      },
      {
        headerName: '申请人',
        field: 'authUser',
        tooltipField: 'authUser',
      },
      {
        headerName: '申请原因',
        field: 'applyReason',
        tooltipField: 'applyReason',
      },
      // {
      //   headerName: '申请时效',
      //   //   field: 'abbreviation',
      //   cellRenderer: (params) => {
      //     let result = '';
      //     if (params.data.dataType === 0) {
      //       result = "长期";
      //     } else if (params.data.dataType === 1) {
      //       result = params.data.dataContent;
      //     } else if (params.data.dataType === 2) {
      //       result = new Date(parseInt(params.data.dataContent)).toLocaleDateString();
      //       console.log(params.data.dataContent, result, 'guojiamin')
      //     }
      //     return result;
      //   },
      //   width: 300,
      // },
      {
        headerName: '申请时间',
        field: 'applyTime',
        valueFormatter: formatterApplyTime,
        tooltipValueGetter: formatterApplyTime,
      },
      {
        headerName: '操作',
        width: 80,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // { name: 'approve', text: '通过', method: 'appoveItem' },
            // { name: 'reject', text: '拒绝', method: 'rejectItem' },
            { name: 'auit', text: '审批', method: 'auditItem' },
            // {name: 'edit', text: '查看', method: 'showEditDialog', ifBtnDisabled: this.ifCheckDisabled, ifBtnShow: this.ifCheckShow},
          ],
        },
      },
    ]
    const columnDefsApi = [
      {
        //  type: ['selectionCheckboxColumn'],
        type: ['firstEmptyColumn'],
      },
      {
        headerName: 'API名称',
        field: 'apiName',
        tooltipField: 'apiName',
      },
      {
        headerName: '申请人',
        field: 'applyUser',
        tooltipField: 'applyUser',
      },
      {
        headerName: '申请原因',
        field: 'applyReason',
        tooltipField: 'applyReason',
      },
      {
        headerName: '申请时效',
        //   field: 'abbreviation',
        valueFormatter: formatterdateContent,
        tooltipValueGetter: formatterdateContent,
      },
      {
        headerName: '申请时间',
        field: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // cellRenderer: (params) => {
        //   let result = new Date(params.data.createTime).toLocaleDateString();
        //   return result;
        // },
      },
      {
        headerName: '操作',
        width: 80,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // { name: 'approve', text: '通过', method: 'appoveItem' },
            // { name: 'reject', text: '拒绝', method: 'rejectItem' },
            { name: 'auit', text: '审批', method: 'auditItem' },
            // {name: 'edit', text: '查看', method: 'showEditDialog', ifBtnDisabled: this.ifCheckDisabled, ifBtnShow: this.ifCheckShow},
          ],
        },
      },
    ]
    if (this.modeType === 'apiList') {
      this.columnDefs = columnDefsApi
      this.searchPlaceholder = '请根据API名称搜索'
    } else {
      this.columnDefs = columnDefs
      this.searchPlaceholder = '请根据应用名称搜索'
    }
    this.defaultParaData = {
      appName: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {
    // this.getData();
  },
  methods: {
    cancelAudit() {
      this.auditVisible = false
      this.appForm = {
        remark: '',
        status: null,
      }
    },
    auditItem(item) {
      this.auditVisible = true
      this.appForm.status = 'approve'
      if (this.modeType === 'apiList') {
        this.apiId = item.data.id
      } else {
        this.appId = item.data.id
        this.realAppId = item.data.appId
      }
    },
    auditRemark(item) {
      this.$refs.auditFrom.validate(valid => {
        if (valid) {
          let obj
          let objApi
          const status = this.appForm.status
          if (this.modeType === 'apiList') {
            objApi = {
              id: this.apiId,
              status: this.auditMap.api[status],
              comment: this.appForm.remark,
            }
            this.auditRequest('', objApi)
          } else {
            obj = {
              appId: this.realAppId,
              auditStatus: this.auditMap.app[status],
              auditComment: this.appForm.remark,
            }
            this.auditRequest(this.appId, obj)
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    auditRequest(id, para) {
      let newPromise
      if (this.modeType === 'apiList') {
        newPromise = HTTP.auditApi(para)
      } else {
        newPromise = HTTP.auditApply(id, para)
      }

      newPromise
        .then(() => {
          this.appForm = {
            remark: '',
            status: null,
          }
          this.refreshData()
          this.$showSuccess('审核成功')
          this.auditVisible = false
        })
        .catch(e => {
          this.$showFailure(e)
          const res = e.response
          if (res) {
            if (res.data.errorMessage.includes('被审核')) {
              this.auditVisible = false
            }
          }
          this.refreshData()
        })
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const obj1 = {
          appName: para.keyword,
          currentPage: para.currentPage,
          pageSize: para.pageSize,
          currentUserId: this.$user.userid,
        }
        const obj2 = {
          apiName: para.keyword,
          currentPage: para.currentPage - 1,
          pageSize: para.pageSize,
        }
        this.tableLoading = true
        let newPromise
        if (this.modeType === 'apiList') {
          newPromise = HTTP.getApiAuditList(obj2)
        } else {
          newPromise = HTTP.getProposeList(obj1, this.$user.userid)
        }

        newPromise
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
      if (this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData) {
        this.$refs.tabWitdTable.refreshData()
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.apply-audit {
  background-color: white;
  width: 100%;
  height: 100%;
  .audit-list {
    top: 35px;
    right: 20px;
  }
}

.apply-form {
  margin-bottom: 40px;
}
</style>
