import _ from 'lodash'
export default {
  data() {
    return {
      preRawData: [],
      rawData: [],
      data: [],
      keyword: '',
      dataDisplay: null,

      tableHeight: 100,
      currentPage: 1,
      pageSize: 20,
      total: 0,

      multipleSelection: [],
      deleteDisabled: true,
      filters: {},
      deleteCounter: 0,
      levelLabel: {
        GLOBAL_LEVEL: '全局',
        RULE_LEVEL: '规则级别',
        TASK_LEVEL: '任务级别',
      },
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      checkDisabledObj: {
        builtIn: 'true',
      },
    }
  },
  watch: {
    keyword() {
      this.filtdata()
    },
  },
  mounted() {
    const self = this
    // setTimeout(() => {
    //   this.resize()
    // })
    $(window).resize(this.resize)
    this.$bus.$on('reload', this.loadData)
    this.loadData()
  },
  beforeDestroy() {
    this.$bus.$off('reload')
    $(window).unbind('resize', this.resize)
  },
  methods: {
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    scopeFormatter(row, column) {
      const value = row[column.property]
      if (value == 'PUBLIC') {
        return '公共'
      } else {
        return '私有'
      }
    },
    refresh() {
      this.loadData()
    },
    addTab() {
      this.$bus.$emit('addTab')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deleteDisabled = this.multipleSelection.length == 0
    },
    loadData() {
      this.$http
        .get(this.$url + '/service/parameters/')
        .then(res => {
          res.data.sort((a, b) => b.paramId - a.paramId)
          this.preRawData = res.data
          this.rawData = _.cloneDeep(res.data)
          this.handleFilterChange()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filtdata() {
      this.data = []
      this.rawData.forEach(item => {
        if (item.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) {
          this.data.push(item)
        }
      })
      this.total = this.data.length
      this.currentPage = 1
      this.changedataDisplay()
    },
    handleSortChange() {
      if (!arguments[0].order) {
        return
      }
      const prop = arguments[0].prop
      const order = arguments[0].order
      this.rawData.sort((a, b) => {
        if (a.name.toString() < b.name.toString()) {
          if (order == 'ascending') {
            return -1
          } else {
            return 1
          }
        } else {
          if (order == 'ascending') {
            return 1
          } else {
            return -1
          }
        }
      })
      this.filtdata()
    },
    handleFilterChange() {
      if (arguments[0]) {
        this.filters[Object.keys(arguments[0])[0]] =
          arguments[0][Object.keys(arguments[0])[0]]
      }
      const table = this.$refs.multipleTable.$refs.table.columns
      const r0 = table[2].id
      const r1 = table[3].id
      const r2 = table[5].id
      this.rawData = []
      let tmpFrom = []
      let tmpTo = []

      if (this.filters[r0] && this.filters[r0].length > 0) {
        this.preRawData.forEach(item => {
          const t = item.valueType
          if (this.filters[r0].indexOf(t) > -1) {
            tmpTo.push(item)
          }
        })
      } else {
        tmpTo = _.cloneDeep(this.preRawData)
      }
      if (this.filters[r1] && this.filters[r1].length > 0) {
        tmpTo.forEach(item => {
          const g = item.valueGenerator
          if (this.filters[r1].indexOf(g) > -1) {
            tmpFrom.push(item)
          }
        })
      } else {
        tmpFrom = _.cloneDeep(tmpTo)
      }
      tmpTo = []
      if (this.filters[r2] && this.filters[r2].length > 0) {
        tmpFrom.forEach(item => {
          const s = item.scope
          if (this.filters[r2].indexOf(s) > -1) {
            tmpTo.push(item)
          }
        })
      } else {
        tmpTo = _.cloneDeep(tmpFrom)
      }
      this.rawData = tmpTo
      this.filtdata()
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.changedataDisplay()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.changedataDisplay(current)
    },
    changedataDisplay(current) {
      const self = this
      self.dataDisplay = self.data.slice(
        self.pageSize * (self.currentPage - 1),
        self.pageSize * self.currentPage
      )
    },
    preDeleteRows() {
      this.$confirm(this.$t('quality.page.settingList.deletePrompt'), '', {
        type: 'warning',
      })
        .then(() => {
          this.deleteRows()
        })
        .catch(() => {})
    },
    deleteRows() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length
      if (length == 0) {
      } else {
        rows.forEach((row, index) => {
          this.deleteRow(row.paramId, length)
        })
      }
    },
    deleteRow(id, length) {
      this.$http
        .delete(this.$url + '/service/parameters/' + id)
        .then(res => {
          this.deleteCounter++
          if (this.deleteCounter == length) {
            this.$message.success(
              this.$t('quality.page.settingList.successfullyDeleted')
            )
            this.loadData()
            this.deleteCounter = 0
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEdit(index) {
      const detail = this.dataDisplay[index]
      this.$bus.$emit('addTab', detail)
    },
    handleTest(index) {
      const detail = this.dataDisplay[index]
      this.$http
        .get(
          this.$url + '/service/parameters/' + detail.paramId + '/value/test'
        )
        .then(res => {
          this.$alert(
            detail.name + ' : ' + res.data,
            this.$t('quality.page.settingList.testResult'),
            {
              confirmButtonText: this.$t('common.button.ok'),
              closeOnPressEscape: true,
              closeOnClickModal: true,
              callback: action => {},
            }
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEditValue(index) {
      const detail = this.dataDisplay[index]
      detail.cName = 'PARAM:' + detail.name
      this.$bus.$emit('addValueTab', detail)
    },
    openValueList(index) {
      const detail = this.dataDisplay[index]
      detail.cName = 'PARAM:' + detail.name
      this.$bus.$emit('addValueTab', detail)
    },
    selectable(row) {
      return !row.builtIn
      // return (this.$isAdmin || this.$user.username==row.owner) && !row.builtIn;
    },
    levelFormatter(row, column) {
      const value = row[column.property]
      return this.levelLabel[value]
    },
  },
}
