// 带分页的 table 组件, 提供一下公共方法
// 调用此 mxinx 需要实现以下方法:
// getShowData
let tableWithPage = {
  data() {
    return {
      keyword: '',
      currentPage: 1,
      pageSize: 20,
      tableLoading: false,
      totalShow: 0,
    }
  },
  methods: {
    getTableData() {},
    handleSizeChange(size) {
      this.pageSize = size
      this.getShowData()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getShowData()
    },
  },
  watch: {
    keyword() {
      this.currentPage = 1
      this.getShowData()
    },
  },
}

export default {
  tableWithPage,
}
