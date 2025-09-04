import { AgGridVue } from 'ag-grid-vue'
import agTableComponent from '@/components/common/agTableComponent.vue'

export default {
  components: {
    AgGridVue,
    agTableComponent,
  },
  props: ['domainId', 'details'],
  mounted() {
    setTimeout(() => {
      this.getData()
    }, 600)
  },
  data() {
    return {
      gridApi: null,
      columnApi: null,
      data: [],
      getRowHeight: null,
      gridOptions: {
        rowSelection: 'multiple',
        enableCellTextSelection: true,
      },
      columnDefs: null,
      defaultColDef: null,
      tableData: null,
      selectedHistoryIds: null,
      historyDetails: null,
      compareDialogVisible: false,
      compareDialogData: null,

      compareResult: [],
      compareResultMap: {},
      compareResultProperties: [],
      showCompareResult: false,
      onlyShowDifferent: true,
    }
  },
  beforeMount() {
    const cellStyle = {}
    this.defaultColDef = {}
    this.getRowHeight = param => {
      return 40
    }
    this.columnDefs = [
      {
        checkboxSelection: params => {
          return params.data.version !== -1
        },
        width: 50,
        resizable: false,
        suppressSizeToFit: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: '版本',
        field: 'version',
        valueFormatter: params => {
          if (params.value === -1) {
            return ''
          } else {
            return params.value
          }
        },
        minWidth: 50,
      },
      {
        headerName: '变更时间',
        field: 'timestamp',
        cellRenderer: params => {
          if (typeof params.value === 'number') {
            return this.$timeFormatter(params.value)
          } else {
            if (this.details.firstPublish) {
              return this.$timeFormatter(this.details.firstPublish)
            } else {
              return '初始'
            }
          }
        },
        minWidth: 160,
      },
      {
        headerName: '操作者',
        field: 'operator',
        tooltipField: 'operator',
        minWidth: 80,
      },
      {
        headerName: '变化',
        field: 'changes',
        tooltipField: 'changes',
        minWidth: 300,
      },
    ]
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      this.$refs.versionsTable.sizeColumnsToFit()
    },
    getDetails(callback) {
      this.$http
        .get(this.$url + `/service/domains/${this.domainId}/oldVersions`)
        .then(res => {
          /* Array.isArray(res.data) &&
          (this.historyDetails = new Map()) &&
          res.data.forEach(item=>{
            this.historyDetails.set(item.id,item);
          }); */
          this.historyDetails = res.data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    compareVersions() {
      if (!this.historyDetails) {
        this.getDetails(this.handleHistoryDetails)
      } else {
        this.handleHistoryDetails()
      }
    },
    propertyFormatter(column, row) {
      switch (column.property) {
        case 'domainCode':
          return '标准代码'
        case 'chineseName':
          return '中文名称'
        case 'englishName':
          return '英文名称'
        case 'abbreviation':
          return '英文简写'
        case 'referenceCode':
          return '引用代码'
        case 'description':
          return '业务定义'
        case 'dataType':
          return '数据类型'
        case 'dataScale':
          return '数据长度'
        case 'dataPrecision':
          return '数据精度'
        case 'notNull':
          return '非空'
        default:
          return column.property
      }
    },
    propertyValueFormatter(column, row) {
      return this.compareResultMap[row.label][column.property]
    },
    handleHistoryDetails() {
      const [details] = [_.cloneDeep(this.details)]
      ;[this.compareResult, this.compareResultMap] = [[], {}]
      if (typeof this.details.additionalProperties === 'object') {
        details.additionalProperties = JSON.stringify(
          details.additionalProperties
        )
      }
      details.chineseName = this.details.domainChName
      details.englishName = this.details.domainEnName
      details.abbreviation = this.details.domainAbbr
      const historyDetails = []
      this.historyDetails.forEach(item => {
        historyDetails.push(item)
      })
      this.$utils.sort.sort(historyDetails, 'version')
      const c = _.cloneDeep(details)
      historyDetails.push(c)
      const histories = this.selectedHistoryIds
      const historiesSet = new Set()
      histories.forEach(item => {
        historiesSet.add(item.version)
      })
      for (let i = historyDetails.length - 1; i >= 0; i--) {
        const item = historyDetails[i]
        if (historiesSet.has(item.version)) {
          this.compareResultMap[item.version] = item
        }
      }
      const udpDefinition = null
      Object.keys(this.historyDetails[0]).forEach(key => {
        if (key === 'udpDefinition') {
          this.udpDefinition = JSON.parse(this.historyDetails[0][key])
        } else if (
          key === 'udpDefinition' ||
          key === 'id' ||
          key === 'domainId' ||
          key === 'lastModification' ||
          key === 'additionalProperties' ||
          key === 'submitter' ||
          key === 'path' ||
          key === 'version'
        ) {
        } else {
          const result = {
            property: key,
          }
          for (const i in this.compareResultMap) {
            if (!i) {
              result.vacant = String(this.compareResultMap[i][key])
            } else {
              result[i] = String(this.compareResultMap[i][key])
            }
          }
          if (this.onlyShowDifferent) {
            const arr = Object.values(result)
            let same = true
            for (let i = 1; i < arr.length - 1; i++) {
              if (arr[0] !== arr[i]) {
                same = false
                break
              }
            }
            if (!same) {
              this.compareResult.push(result)
            }
          } else {
            this.compareResult.push(result)
          }
        }
      })
      this.udpDefinition.forEach((item, index) => {
        const key = item.name
        const result = {
          property: key,
        }
        for (const i in this.compareResultMap) {
          if (!i) {
            result.vacant = JSON.parse(
              this.compareResultMap[i].additionalProperties
            )[index]
          } else {
            result[i] = JSON.parse(
              this.compareResultMap[i].additionalProperties
            )[index]
          }
        }
        if (this.onlyShowDifferent) {
          const arr = Object.values(result)
          let same = true
          for (let i = 1; i < arr.length - 1; i++) {
            if (arr[0] !== arr[i]) {
              if (arr[i] || arr[0]) {
                same = false
                break
              }
            }
          }
          if (!same) {
            this.compareResult.push(result)
          }
        } else {
          this.compareResult.push(result)
        }
      })

      this.showCompareResult = true
    },
    getData() {
      const url =
        this.$url +
        `/service/domains/${this.domainId}/history?pageSize=500&currentPage=0`
      this.$http
        .get(url)
        .then(res => {
          if (res.data.content.length < 10) {
            this.gridApi.setDomLayout('autoHeight')
          } else {
            $(this.$el).find('.table-container.one').css('height', '400px')
          }
          this.tableData = res.data.content
          this.tableData.forEach(item => {
            if (item.version >= 1) {
              item.version++
            }
          })
          this.tableData.push({
            changes: '新建标准',
            version: 1,
            operator: this.details.submitter,
            timestamp: '',
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    onSelectionChanged() {
      this.selectedHistoryIds = this.gridApi.getSelectedRows()
    },
  },
  computed: {
    canCompare() {
      return (
        Array.isArray(this.selectedHistoryIds) &&
        this.selectedHistoryIds.length >= 2
      )
    },
  },
  watch: {
    onlyShowDifferent() {
      this.handleHistoryDetails()
    },
  },
}
