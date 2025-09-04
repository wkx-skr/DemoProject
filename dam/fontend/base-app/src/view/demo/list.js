var no_result = 'No Result'
export default {
  data() {
    return {
      rawData: [],
      data: [],
      keyword: '',
      dataDisplay: [],

      tableHeight: 100,
      currentPage: 1,
      pageSize: 20,
      total: 0,

      multipleSelection: [],
      deleteDisabled: true,
    }
  },
  watch: {
    keyword() {
      this.filtdata()
    },
  },
  mounted() {
    const self = this
    setTimeout(() => {
      this.tableHeight = $('.table-row')[0].offsetHeight
    })
    this.$bus.$on('reload', this.loadData)
    this.loadData()
  },
  beforeDestroy() {
    this.$bus.$off('reload')
  },
  methods: {
    refresh() {
      this.loadData()
    },
    addTab() {
      this.$bus.$emit('addTab')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deletedataDisabled = this.multipleSelection.length == 0
    },
    loadData() {
      var self = this
      return
      self.$http
        .get(this.$url + '/service/')
        .then(res => {
          self.rawData = res.data
          self.filtdata()
        })
        .catch(e => {
          self.$message.error('读取失败' + e.response.data.errorMessage)
        })
    },
    filtdata() {
      this.data = []
      this.rawData.forEach(item => {
        this.data.push(item)
      })
      this.total = this.data.length
      this.currentPage = 1
      this.changedataDisplay()
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
      this.$confirm('确定要执行删除操作吗？', '', {
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
        const ids = []
        rows.forEach((row, index) => {
          ids.push(row.id)
        })
        this.$http
          .post(this.$url + '/service', ids)
          .then(res => {
            this.$message.success(this.$version.common.operationSucceed)
            this.loadData()
          })
          .catch(e => {
            this.$message.error(e.response.errorMessage)
          })
      }
    },
    handleEdit(index) {
      const detail = this.dataDisplay[index]
      this.$bus.$emit('addTab', detail)
    },
  },
}
