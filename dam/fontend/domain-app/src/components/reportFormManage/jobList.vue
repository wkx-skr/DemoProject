<template>
  <div class="bi-import-job-list">
    <datablau-tab-with-table
      class="table-tab-container"
      ref="jobTable"
      :isDatablau="false"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
      @cellClicked="cellClicked"
    >
      <div class="right-btn-container" slot="header">
        <!-- <el-button size="mini" @click="realRefresh">刷新</el-button> -->
        <datablau-button type="normal" @click="realRefresh">
          刷新
        </datablau-button>
      </div>
      <div class="bottom-btn-container" slot="footer">
        <!-- <el-button
          type="danger"
          size="small"
          class="delete-btn"
          @click="deleteBatch"
          :disabled="!couldDeleteBatch"
        >删 除</el-button> -->
      </div>
    </datablau-tab-with-table>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableApi: null,
      tableOption: {
        rowSelection: 'single',
        isFullWidthCell: function (rowNode) {
          return rowNode.data && rowNode.data.rowType === 'result'
        },
        fullWidthCellRenderer: function (params) {
          const resultArr = params.node.data.resultArr || []
          let pContent = ''
          resultArr.forEach(item => {
            pContent += `<p class="result-item" style="line-height: 25px;">${item.label}: ${item.value}</p>`
          })
          return `<div class="job-result-detail ag-selectable" style="padding: 20px 0 0 40px;">${pContent}</div>`
        },
        getRowHeight(para) {
          let height = 40
          const data = para.data
          if (data && data.rowType === 'result') {
            const resultArr = data.resultArr || []
            if (resultArr && Array.isArray(resultArr)) {
              height = 40 + resultArr.length * 26
            } else {
              height = 80
            }
          }
          return height
        },
      },
      fullWidthLineId: '',
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],
      getAllSystemJobs: null,

      // *** edit dialog ***
      dialogVisible: false,
      editJobData: {
        job: '',
        id: '',
      },
      dialogTitle: '创建同义词',
      isAddJob: false,
      couldDeleteBatch: false,
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    this.getAllSystemJobs = HTTP.getAllSystemJobs()
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      {
        type: ['firstEmptyColumn'],
      },
      // {
      //   headerName: '序号',
      //   field: 'domainName',
      //   tooltipField: 'domainName',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '任务名称',
        field: 'name',
        tooltipField: 'name',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建人',
        field: 'creator',
        tooltipField: 'creator',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: 'BI 类型',
        field: 'biType',
        tooltipField: 'biType',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '上次运行时间',
        field: 'lastRunStartTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 200,
        suppressSizeToFit: true,
        // type: ['customSortCol'],
      },
      {
        headerName: '下次运行时间',
        field: 'nextRunTime',
        // tooltipField: 'modifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 200,
        suppressSizeToFit: true,
        // type: ['customSortCol'],
      },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            { name: 'check', text: '查看', method: 'checkItem' },
            { name: 'remove', text: '删除', method: 'deleteJobItem' },
            // {name: 'edit', text: '查看', method: 'showEditDialog', ifBtnDisabled: this.ifCheckDisabled, ifBtnShow: this.ifCheckShow},
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {},
  methods: {
    // *** tab with table ***
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const c = para.currentPage
        const s = para.pageSize
        const keyword = _.trim(para.keyword || '')
        this.getAllSystemJobs
          .then(res => {
            const data = res.data
            let arr = []
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                if (item.type === 'BIReportSyncJobDescriptor') {
                  let jobContent = item.jobContent
                  if (this.$utils.isJSON(jobContent)) {
                    jobContent = JSON.parse(jobContent)
                  }
                  const obj = _.merge(jobContent, item)
                  // biType
                  const info = jobContent.info || {}
                  const auth = info.auth || {}
                  const additionalProp = info.additionalProp || {}
                  const detailShow = [
                    { label: '服务器', value: info.host },
                    { label: '端口', value: info.port },
                    { label: '用户名', value: auth.user },
                  ]
                  if (obj.biType === 'COGNOS') {
                    detailShow.push({
                      label: 'Dispatcher URI',
                      value: additionalProp.CM_URL,
                    })
                    detailShow.push({
                      label: 'Gateway URI',
                      value: additionalProp.GATEWAY_URL,
                    })
                    detailShow.push({
                      label: '命名空间',
                      value: additionalProp.NAMINGSPACE,
                    })
                  }
                  item.detailShow = detailShow
                  arr.push(_.merge(jobContent, item))
                }
              })
            }
            this.totalShow = arr.length
            arr = arr.filter(item => {
              let bool = false
              if (item.name.indexOf(keyword) !== -1) {
                bool = true
              }
              return bool
            })

            arr = arr.slice(s * (c - 1), s * c)
            if (this.fullWidthLineId && arr.length > 0) {
              const fullWidthIndex = arr.findIndex(
                item => item.id === this.fullWidthLineId
              )
              if (fullWidthIndex > -1) {
                const fullWidthData = arr[fullWidthIndex]
                const obj = {
                  rowType: 'result',
                  resultArr: fullWidthData.detailShow,
                }
                arr.splice(fullWidthIndex + 1, 0, obj)
                setTimeout(() => {
                  if (this.tableApi) {
                    this.tableApi.ensureNodeVisible(obj, 'middle')
                  }
                }, 100)
              }
            }
            resolve(arr)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },
    deleteJobItem({ data, api, e }) {
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          const id = data.id
          const para = { jobId: id }
          const callback = () => {
            this.$message.success('删除成功')
            this.refreshTable()
          }
          this.deleteItem(para, callback)
        })
        .catch(e => {
          console.info(e)
        })
      e.stopPropagation()
    },
    realRefresh() {
      this.fullWidthLineId = ''
      this.getAllSystemJobs = HTTP.getAllSystemJobs()
      this.refreshTable()
    },
    refreshTable() {
      if (this.$refs.jobTable && this.$refs.jobTable.refreshData) {
        this.$refs.jobTable.refreshData()
      }
    },
    cellClicked(para) {
      this.tableApi = para.api
      this.fullWidthLineId = para.data.id || ''
      this.refreshTable()
    },
    checkItem(para) {
      const e = para.e
      e.stopPropagation()
      this.$emit('showJobDetail', para)
    },
    deleteItem(para, callback) {
      HTTP.deleteSystemJob(para)
        .then(res => {
          this.$message.success('删除成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // async delete  job item
    async deleteItemAsync(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/synonym/?id=${id}`

      await this.$http.delete(url)
      callback && callback()
    },

    deleteBatch() {
      const arr = this.selection.map(item => {
        const obj = {
          id: item.id,
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      const callback = () => {
        this.$message.success('删除成功')
        this.refreshTable()
      }
      const para = {
        fun: this.deleteItemAsync,
        paraArr: arr,
        callback,
      }
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.seriesFunCallback(para)
        })
        .catch(e => console.info(e))
    },
    seriesFunCallback({ fun, paraArr, callback }) {
      let delCallback = null
      const nextCallback = () => {
        paraArr.shift()
        this.seriesFunCallback({ fun, paraArr, callback })
      }
      let obj = null
      if (paraArr && Array.isArray(paraArr) && paraArr.length > 1) {
        delCallback = nextCallback
        obj = paraArr[0]
      } else if (paraArr && Array.isArray(paraArr) && paraArr.length == 1) {
        obj = paraArr[0]
        delCallback = () => {
          paraArr.shift()
          callback && callback()
        }
      } else {
        callback && callback()
      }
      try {
        obj && fun(obj, delCallback)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    tableLayout() {
      if (this.$refs.jobTable && this.$refs.jobTable.resetTableStyle) {
        this.$refs.jobTable.resetTableStyle()
      }
    },
    ifCheckDisabled(data) {
      let bool = false
      if (data.processInstanceName === '表 [dam_tag_item] 的权限申请') {
        bool = true
      }
      return bool
    },
    ifCheckShow(data) {
      let bool = false
      if (data.processInstanceName === '特殊他') {
        bool = true
      }
      return bool
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.bi-import-job-list {
  /deep/ .tab-top-line {
    .top-line-inner {
      padding: 0 20px;
      .button-container {
        padding-right: 0;
      }
    }
  }
}
</style>

<style lang="scss">
.bi-import-job-list {
  .ag-full-width-row.ag-row-level-0.ag-row-position-absolute {
    background-color: #fafafa;
  }
}
</style>
