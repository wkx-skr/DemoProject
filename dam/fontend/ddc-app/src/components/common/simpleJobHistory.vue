<template>
  <div class="simple-job-history">
    <div class="job-result">
      <datablau-tab-with-table
        class="table-tab-container"
        ref="jobHistoryList"
        :totalShow="totalShow"
        :columnDefs="columnDefs"
        :getShowData="getShowData"
        :hideTopLine="true"
        :hideBottomLine="false"
        :tableOption="tableOption"
        :tableHidePagination="tableHidePagination"
        :defaultParaData="defaultParaData"
      >
        <div class="right-btn-container" slot="header">
          <!-- <el-button size="mini" @click="refreshTable">刷新</el-button> -->

          <datablau-button type="secondary" @click="refreshTable">
            {{ $t('meta.lineageManage.reload') }}
          </datablau-button>
        </div>
      </datablau-tab-with-table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  data() {
    return {
      // *** tab with table ***
      allData: [],
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
            pContent += `<p class="result-item" style="line-height: 25px;">${item}</p>`
          })
          return `<div class="job-result-detail" style="padding: 20px 0 0 40px;">${pContent}</div>`
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
      detailData: null,
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      getAllInfo: null,
      statusList: {
        FINISHED: this.$t('quality.page.qualityExamineJob.statusList.FINISHED'),
        RUNNING: this.$t('quality.page.qualityExamineJob.statusList.RUNNING'),
        // FAILED: '失败',
        NOT_RUN: this.$t('quality.page.qualityExamineJob.statusList.NOT_RUN'),
        INIT: this.$t('quality.page.qualityExamineJob.statusList.INIT'),
        CREATED: this.$t('quality.page.qualityExamineJob.statusList.CREATED'),
        FAILED: this.$t('quality.page.qualityExamineJob.statusList.FAILED'),
        STOPPED: this.$t('quality.page.qualityExamineJob.statusList.STOPPED'),
        SKIPPED: this.$t('quality.page.qualityExamineJob.statusList.SKIPPED'),
      },
    }
  },
  props: {
    dataType: {
      type: String,
      default: 'lineage',
    },
  },
  components: {},
  beforeMount() {
    const formatterTime = data => {
      let t = this.$timeFormatter(data.value)
      if (
        data.colDef.field === 'endTime' &&
        data.data.jobStatus === 'RUNNING'
      ) {
        t = ''
      }
      return t
    }
    const jobStatusFormatter = data => {
      const t = this.jobStatusFormatter(data.value)
      return t
    }
    const progressFormater = data => {
      const value = data.value || 0
      const t = parseInt(value) + '%'
      return t
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: this.$t('meta.lineageManage.taskName'),
        field: 'name',
        tooltipField: 'name',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.lineageManage.taskType'),
        field: 'objType',
        tooltipField: 'objType',
        width: 100,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.lineageManage.taskStatus'),
        field: 'jobStatus',
        // tooltipField: 'assignee',
        valueFormatter: jobStatusFormatter,
        tooltipValueGetter: jobStatusFormatter,
        width: 100,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.lineageManage.startTime'),
        field: 'startTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.lineageManage.endTime'),
        field: 'endTime',
        // tooltipField: 'modifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.lineageManage.taskResult'),
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'edit',
              text: this.$t('meta.lineageManage.detail'),
              method: 'showEditDialog',
              ifBtnDisabled: this.ifCheckDisabled,
            },
            // {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
            // {name: 'edit', text: '查看', method: 'showEditDialog', ifBtnDisabled: this.ifCheckDisabled, ifBtnShow: this.ifCheckShow},
          ],
        },
      },
    ]
    if (this.dataType === 'dataSource') {
      columnDefs.splice(6, 0, {
        headerName: this.$t('meta.lineageManage.progress'),
        field: 'progress',
        // tooltipField: 'progress',
        valueFormatter: progressFormater,
        tooltipValueGetter: progressFormater,
        width: 150,
        // type: ['customSortCol'],
      })
    }
    this.columnDefs = columnDefs

    this.$bus.$on('updateSimpleJobHistory', this.dataInit)
  },
  computed: {
    editBottomItemConfirm() {
      let bool = false
      bool = !!(this.editSynonymsData && this.editSynonymsData.synonyms)
      return bool
    },
  },
  mounted() {},
  destroyed() {
    this.$bus.$off('updateSimpleJobHistory')
  },
  methods: {
    jobStatusFormatter(value) {
      return this.statusList[value]
    },
    dataInit() {
      this.getAllData(this.dataType)
      this.refreshTable()
    },
    getAllData(dataType) {
      const historyKey = this.$user.username + 'SimpleJobHsitory'
      let allData = sessionStorage.getItem(historyKey) || []
      if (this.$utils.isJSON(allData)) {
        const arr = []
        const history = JSON.parse(allData)[dataType] || {}
        for (const key in history) {
          arr.push(history[key])
        }
        allData = arr
        arr.sort((a, b) => b.startTime - a.startTime)
      } else {
        allData = []
      }
      this.allData = allData
    },
    isFullWidth(para) {
      return para.result || true
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const keyword = para.keyword || ''
        if (this.allData) {
          let data = this.allData
          if (!data || !Array.isArray(data)) {
            data = []
          }

          let keyword = para.keyword || ''
          keyword = _.trim(keyword)
          if (keyword) {
            const result = []
            keyword = keyword.toLowerCase()
            let name = ''
            data.forEach(item => {
              name = item.name || ''
              name = name.toLowerCase()
              const index = name.indexOf(keyword)
              if (index !== -1) {
                result.push(item)
              }
            })
            data = result
          }

          this.totalShow = data.length

          const s = para.pageSize
          const c = para.currentPage

          let arr = data.slice(s * (c - 1), s * c)
          if (arr.length > 0 && this.detailData) {
            const result = this.detailData.resultArr || []
            const detailNode = {
              rowType: 'result',
              resultArr: result,
            }
            const resultArr = []
            arr.forEach(item => {
              resultArr.push(item)
              if (item.jobId === this.detailData.referenceId) {
                resultArr.push(detailNode)
              }
            })
            arr = resultArr

            setTimeout(() => {
              if (this.tableApi) {
                this.tableApi.ensureNodeVisible(detailNode, 'middle')
              }
            }, 100)
          }
          resolve(arr)
        } else {
          resolve([])
        }
      })
    },
    refreshTable() {
      if (this.$refs.jobHistoryList && this.$refs.jobHistoryList.refreshData) {
        this.$refs.jobHistoryList.refreshData()
      }
    },
    tableLayout() {
      if (
        this.$refs.jobHistoryList &&
        this.$refs.jobHistoryList.resetTableStyle
      ) {
        this.$refs.jobHistoryList.resetTableStyle()
      }
    },
    ifCheckDisabled(data) {
      let bool = true
      const result = data.result
      if (result && Array.isArray(result) && result.length > 0) {
        bool = false
      } else if (data.errorMessage) {
        bool = false
      } else if (typeof data.result === 'string') {
        bool = false
      }
      return bool
    },
    showEditDialog({ data, api, e }) {
      this.tableApi = api
      const resultArr = []
      let str = ''
      const result = data.result
      let type = 'info'
      if (data.errorMessage) {
        type = 'error'
        str = data.errorMessage
        resultArr.push(str)
      } else if (result && Array.isArray(result)) {
        // str = result.join('<br/>')
        result.forEach(item => {
          if (typeof item !== 'string') {
            type = 'error'
            let msg = ''
            for (const key in item) {
              msg += item[key] + ': '
            }
            item = msg.slice(0, -2)
          }
          str += `<p style="line-height: 20px;">${item}</p>`
          resultArr.push(item)
        })
        // str = `<p>${str}</p>`
      } else if (typeof result === 'string' && result.length > 0) {
        str = result
        resultArr.push(str)
      } else if (result.totalFilesCount) {
      }
      const detailData = {
        resultArr: resultArr,
        type: type,
        id: 'detail',
        referenceId: data.jobId,
      }
      this.detailData = detailData
      this.refreshTable()
    },
  },
  watch: {
    dataType: {
      immediate: true,
      handler: function (newVal) {
        this.dataInit()
      },
    },
  },
}
</script>

<style lang="scss">
.simple-job-history {
  position: relative;
  min-height: 500px;
  .job-result {
  }
}
</style>

<style lang="scss">
.simple-job-history {
  .ag-full-width-row.ag-row-level-0.ag-row-position-absolute {
    background-color: #fafafa;
  }
}
</style>
