<template>
  <div class="report-info-item">
    <datablau-tab-with-table
      class="table-tab-container"
      ref="modelsTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    >
      <!-- @gridSelectionChanged="gridSelectionChanged" -->
      <!-- <div class="right-btn-container" slot="header">
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div> -->
    </datablau-tab-with-table>
  </div>
</template>

<script>
export default {
  name: 'relationDb',
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
      selection: [],
    }
  },
  props: {
    reportDetailPro: {
      type: Promise,
      required: true,
    },
  },
  components: {},
  beforeMount() {
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      // {
      //   type: ['firstEmptyColumn'],
      // },
      {
        type: ['indexCol'],
        headerName: this.$t('meta.report.tables.index'),
        width: 80,
      },
      {
        headerName: this.$t('meta.report.dbs'),
        // field: 'modelId',
        cellRenderer: params => {
          let result = '-'
          if (params.data.modelName) {
            result = params.data.modelName
          } else if (params.data.modelId) {
            result = params.data.modelId
          }
          return `<span title="${result}">${result}</span>`
        },
        // tooltipField: 'modelId',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.report.table'),
        // field: 'tableId',
        // tooltipField: 'tableId',
        cellRenderer: params => {
          let result = ''
          if (params.data.tableName) {
            result = params.data.tableName
          } else {
            result = params.data.tableId
          }
          return `<span title="${result}">${result}</span>`
        },
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.report.column'),
        // field: 'columnId',
        // tooltipField: 'columnId',
        cellRenderer: params => {
          let result = ''
          if (params.data.columnName) {
            result = params.data.columnName
          } else {
            result = params.data.columnId
          }
          return `<span title="${result}">${result}</span>`
        },
        width: 150,
        // type: ['customSortCol'],
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    // *** tab with table ***
    getShowData(para) {
      return new Promise((resolve, reject) => {
        this.reportDetailPro
          .then(res => {
            const keyword = para.keyword || ''
            const data = res.data || {}
            let resultArea = data.relatedTable || []
            resultArea = resultArea.filter(item => {
              return this.$MatchKeyword(
                item,
                keyword,
                'modelName',
                'tableName',
                'columnName'
              )
            })
            this.totalShow = resultArea.length
            const s = para.pageSize
            const c = para.currentPage
            const result = resultArea.slice(s * (c - 1), s * c)
            // console.log(result, 'result')
            resolve(result)
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

    // *** edit dialog ***
    refreshTable() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },

    tableLayout() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
/deep/ .tab-with-table {
  top: 3px;
  .tab-top-line {
    padding-top: 10px !important;
  }
}
</style>
