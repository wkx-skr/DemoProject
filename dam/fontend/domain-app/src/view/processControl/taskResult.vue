<template>
  <div class="process-result">
    <datablau-tab-with-eltable
      class="table-tab-container"
      ref="processTaskResult"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="true"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    >
      <div class="right-btn-container" slot="header">
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div>
    </datablau-tab-with-eltable>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      getAllInfo: null,
    }
  },
  props: {
    taskId: {
      required: true,
      type: [String, Number],
    },
  },
  components: {},
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      // {
      //   headerName: '任务名称',
      //   field: 'taskName',
      //   tooltipField: 'taskName',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '审批人',
        field: 'assignee',
        tooltipField: 'assignee',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '开始时间',
        field: 'startTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '结束时间',
        field: 'endTime',
        // tooltipField: 'modifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '审批意见',
      //   field: 'comment',
      //   tooltipField: 'comment',
      //   width: 300,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '审批状态',
        field: 'asResult',
        tooltipField: 'asResult',
        width: 150,
        // type: ['customSortCol'],
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    editBottomItemConfirm() {
      let bool = false
      bool = !!(this.editSynonymsData && this.editSynonymsData.synonyms)
      return bool
    },
  },
  mounted() {},
  methods: {
    getShowData(para) {
      if (!this.getAllInfo) {
        this.setTaskResult()
      }
      return new Promise((resolve, reject) => {
        const keyword = para.keyword || ''

        if (this.getAllInfo) {
          this.getAllInfo
            .then(res => {
              let data = res.data
              if (!data || !Array.isArray(data)) {
                data = []
              }
              data.forEach(item => {
                if (item.endTime) {
                  if (item.param && item.param.result) {
                    item.asResult = item.param.result
                  } else {
                    item.asResult = '通过'
                  }
                  item.comment = item.param ? item.param.opinion : ''
                } else {
                  if (item.startTime) {
                    item.asResult = '审批中'
                  } else {
                    item.asResult = '待审批'
                  }
                }
              })

              let keyword = para.keyword || ''
              keyword = _.trim(keyword)
              if (keyword) {
                const result = []
                keyword = keyword.toLowerCase()
                let taskName = ''
                data.forEach(item => {
                  taskName = item.taskName || ''
                  taskName = taskName.toLowerCase()
                  const index = taskName.indexOf(keyword)
                  if (index !== -1) {
                    result.push(item)
                  }
                })
                data = result
              }

              this.totalShow = data.length

              const s = para.pageSize
              const c = para.currentPage

              const arr = data.slice(s * (c - 1), s * c)
              resolve(arr)
            })
            .catch(e => {
              this.$showFailure(e)
              reject(e)
            })
        } else {
          resolve([])
          this.$showFailure('找不到指定任务')
        }
      })
    },

    setTaskResult() {
      const taskId = this.taskId
      if (!taskId) return
      const url = `${this.$url}/service/workflow/task/detail/info?processInstanceId=${taskId}`
      this.getAllInfo = this.$http.get(url)
    },

    refreshTable() {
      this.setTaskResult()
      if (
        this.$refs.processTaskResult &&
        this.$refs.processTaskResult.refreshData
      ) {
        this.$refs.processTaskResult.refreshData()
      }
    },
    tableLayout() {
      if (
        this.$refs.processTaskResult &&
        this.$refs.processTaskResult.resetTableStyle
      ) {
        this.$refs.processTaskResult.resetTableStyle()
      }
    },
  },
  watch: {
    taskId(newVal) {
      this.refreshTable()
    },
  },
}
</script>

<style lang="scss">
.process-result {
  .delete-btn {
    margin-left: 20px;
  }
}
</style>

<style lang="scss">
.edit-synonyms-dia {
  .synonyms-dialog-body {
    .el-textarea {
      max-width: 400px;
    }
  }
}
</style>
