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
      :frameworkComponents="frameworkComponents"
    >
      <!-- @gridSelectionChanged="gridSelectionChanged" -->
      <!-- 暂不要刷新功能 -->
      <!-- <div class="right-btn-container" slot="header">
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div> -->
    </datablau-tab-with-table>
  </div>
</template>

<script>
import Vue from 'vue'
import HTTP from '@/http/main'

let dimAndIndexCol = Vue.extend({
  template: `
    <el-button type="text" size="mini" @click.stop="handleClick">{{ label }}</el-button>
  `,
  data() {
    return {
      label: '',
    }
  },
  methods: {
    dataInit(params) {
      this.label = params.vueComponent.getDomainOrIndexName(params)
    },
    handleClick() {
      if (JSON.parse(localStorage.getItem('allServers')).includes('METRIC')) {
        if (this.params.data.type === 'Index') {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          const url = `main/indexDefinitionNew?id=${this.params.data.code}`
          window.open(baseUrl + url)
        } else {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          const url = `main/dimensionDefinitionNew`
          window.open(baseUrl + url)
        }
      } else {
        this.params.vueComponent.skipToDomainOrIndex(this.params.data)
      }
    },
  },
  mounted() {
    // console.log(this.params, 'this.params')
    this.dataInit(this.params)
  },
})
export default {
  name: 'reportInfoItem',
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
      typeMap: {
        // 查询结果区 类型
        Index: this.$t('meta.report.index'),
        Lat: this.$t('meta.report.dimension'),
        Other: this.$t('meta.report.common'),
      },
      frameworkComponents: {
        dimAndIndexCol,
      },
    }
  },
  props: {
    reportDetailPro: {
      type: Promise,
      required: true,
    },
    dimMap: {},
    indexMap: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  components: {},
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
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
        headerName: this.$t('meta.report.tables.name'),
        field: 'columnName',
        tooltipField: 'columnName',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.report.tables.intro'),
        field: 'description',
        tooltipField: 'description',
        width: 300,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.report.tables.dataType'),
        field: 'datatype',
        // sortable: true,
        // filter: true,
        tooltipField: 'datatype',
        width: 150,
      },
      {
        headerName: this.$t('meta.report.tables.subReportName'),
        field: 'category',
        tooltipField: 'category',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.report.tables.relType'),
        // field: 'type',
        // tooltipField: 'type',
        cellRenderer: params => {
          let result = ''
          if (params.data.type) {
            result = params.data.type
            result = this.typeMap[result]
          }
          return result ? `<span title="${result}">${result}</span>` : ''
        },
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('meta.report.tables.relDimOrindex'),
        // field: 'code',
        // tooltipField: 'code',
        cellRenderer: 'dimAndIndexCol',
        cellRendererParams: {
          vueComponent: this,
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
            // console.log(data, 'data')
            let resultArea = data.resultArea || []
            resultArea = resultArea.filter(item => {
              return this.$MatchKeyword(item, keyword, 'columnName')
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
    checkIndexExist(code, resolve, reject) {
      HTTP.getDomainItemDetail(code)
        .then(res => {
          resolve()
        })
        .catch(e => {
          this.$showFailure(e)
          reject()
        })
    },
    skipToDomainOrIndex(row) {
      let obj = {}
      if (row.type === 'Lat') {
        obj = this.dimMap[row.code]
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dimension', {
          catalogId: obj.catalogId,
        })
        window.open(pageUrl)
      } else if (row.type === 'Index') {
        obj = this.indexMap[row.code]
        this.checkIndexExist(
          obj.id,
          () => {
            this.$skip2Domain(obj.id)
          },
          () => {
            this.$t('meta.report.notFind', { name: obj.name })
          }
        )
      }
    },
    getDomainOrIndexName(params) {
      let result = ''
      const row = params.data
      const self = this
      const cellValue = row.code
      if (row.type === 'Lat') {
        // 维度
        result = self.dimMap[cellValue] ? self.dimMap[cellValue].catalog : ''
      } else if (row.type === 'Index') {
        // 指标
        result = self.indexMap[cellValue] ? self.indexMap[cellValue].name : ''
      } else if (row.type === 'Other') {
        // 普通
        result = cellValue
      }
      return result || ''
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
