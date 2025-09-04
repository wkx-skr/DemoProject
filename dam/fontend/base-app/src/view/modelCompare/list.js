var no_result = 'No Result'
export default {
  data() {
    return {
      rawData: [],
      data: [],
      keyword: '',
      dataDisplay: [],
      loading: true,
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
      this.getSourcesData()
    },
    getSourcesData() {
      this.rawData = []
      const categories = this.$modelCategories
      if (categories.length == 0) {
        this.loading = false
      }
      categories.forEach((category, index) => {
        setTimeout(() => {
          this.getSourceBySystem(category, list => {
            if (index == categories.length - 1) {
              this.loading = false
              this.filtdata()
            }
          })
        })
      })
    },
    getSourceBySystem(category, callback) {
      const getUrl =
        this.$url +
        '/service/models/category/' +
        category.categoryId +
        '/simple'
      this.$http
        .get(getUrl)
        .then(res => {
          res.data.forEach(source => {
            this.rawData.push({
              categoryName: category.categoryName,
              categoryAbbreviation: category.categoryAbbreviation,
              name: source.definition,
              id: source.modelId,
            })
          })
          if (callback) {
            callback(res.data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filtdata() {
      this.data = []
      this.data = this.rawData
      //    this.rawData.forEach(item=>{
      //      this.data.push(item);
      //    });
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
    handleEdit(index) {
      const detail = this.dataDisplay[index]
      this.$bus.$emit('addTab', detail)
    },
  },
}
