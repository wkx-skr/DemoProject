import HTTP from '@/http/main'
export default {
  data() {
    return {
      rawDataMap: [],
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
      // loading: true, // 设置表格加载
    }
  },
  watch: {
    keyword() {
      this.filtData()
    },
  },
  mounted() {
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
      this.deleteDisabled = this.multipleSelection.length === 0
    },
    loadData() {
      // this.loading = true
      HTTP.getAllGroups()
        .then(res => {
          this.rawDataMap = res.data
          this.rawData = []
          for (const user in this.rawDataMap) {
            const item = this.rawDataMap[user]
            this.rawData.push(item)
          }
          this.filtData()
        })
        .catch(e => {
          this.$showFailure(e)
          this.dataDisplay = []
        })
        .then(() => {
          // this.loading = false
        })
    },
    filtData() {
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
      this.$DatablauCofirm(
        this.$t('system.group.info.sureToDelete'),
        this.$t('common.info.title'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.deleteRows()
        })
        .catch(() => {})
    },
    deleteRows() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length
      if (length === 0) {
      } else {
        rows.forEach((row, index) => {
          this.$http
            .delete( this.$user_url + '/usermanagement/groups/' + row.id)
            .then(res => {
              if (index === rows.length - 1) {
                this.$message.success(this.$version.common.operationSucceed)
                this.loadData()
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      }
    },
    editDetail(index) {
      const detail = this.dataDisplay[index]
      this.$bus.$emit('addTab', detail, this.rawDataMap)
    },
  },
}
