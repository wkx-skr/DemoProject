import moment from 'moment'
export default {
  props: ['appTypes', 'defaultOpen', 'hasAccess'],
  data() {
    const reportFormManageUrl = this.$meta_url + '/service/dataReport/'
    return {
      reportFormManageUrl: reportFormManageUrl,
      // hasAccess: true,
      // nameArr: [],

      /* table 设置 */
      tableHeight: undefined,
      tableDataAll: [],
      tableDataShow: [],
      selection: [],
      deleteDisabled: true,

      totalShow: 0,
      pageSize: 20,
      currentPage: 1, // 从1开始

      sortData: {},
      keyword: '',
      filterArr: [
        'code',
        'name',
        'dataRequirementCode',
        'type',
        'owner',
        'frequency',
      ], // 搜索设置
      filter2Arr: ['frequency', 'owner'], // 列筛选 'type'不需要
      colFilter: {},
      dupliFilterMap: {},
      frequencyFilterArr: [],
      ownerFilterArr: [],

      // ***********************************
      // typeFilterArr: [],
      // ownerFilterArr: [],
      // fileTypeFilter: [],
      // creatorFilter: '',
      // timer: null,
      // onUpload: false,
      // fakeData: {},
      // deleteId: null,
      // demandStation: [],
    }
  },
  mounted() {
    // 页面布局
    this.tableHeight = $('.table-row')[0].offsetHeight
    $(window).resize(this.resizeTable)

    // // 数据初始化
    // this.timer = 'first';
    // this.resetTableData();
    this.getTableDataAll()
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    // 响应事件
    resizeTable() {
      if (!$('.table-row')[0]) return
      this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
    },
    handleSelectionChange(val) {
      this.selection = val
      this.deleteDisabled = this.selection.length == 0
    },
    colFilterHandler(obj) {
      for (const key in obj) {
        this.colFilter[key] = obj[key]
      }
      this.resetTableData({
        colFilter: this.colFilter,
      })
    },

    /* table 回调函数 */
    handleSortChange(sortData) {
      const obj = {
        order: sortData.order,
        prop: sortData.prop,
      }
      this.sortData = obj
      this.resetTableData({
        sortData: obj,
      })
    },

    // 处理显示的数据
    /**
     * 1. 排序
     * 2. 过滤关键词
     * 3. 筛选列
     * 4. 根据分页, 确定显示的数据
     */
    resetTableData(para, callback) {
      para = para || {}
      para.sortData = para.sortData || this.sortData || {}
      para.keyword = para.keyword || this.keyword || ''
      para.colFilter = para.colFilter || this.colFilter || {}
      para.currentPage = para.currentPage || 1
      para.pageSize = para.pageSize || this.pageSize
      this.currentPage = para.currentPage
      const sortFun = (arr, prop) => {
        const result = _.sortBy(arr, o => {
          return o[prop]
        })
        return result
      }
      if (!para.sortData || !para.sortData.prop) {
        this.tableDataAll = sortFun(this.tableDataAll, 'code')
      } else if (para.sortData && para.sortData.prop) {
        this.tableDataAll = sortFun(this.tableDataAll, para.sortData.prop)
      }
      if (para.sortData && para.sortData.prop && para.sortData.order) {
        if (para.sortData.order === 'descending') {
          this.tableDataAll.reverse()
        }
      }
      const arr = []
      this.tableDataAll.forEach(item => {
        let testKeyword = false
        let testCol = true
        this.filterArr.forEach(attr => {
          if (
            item[attr] &&
            item[attr].toLowerCase().indexOf(this.keyword.toLowerCase()) >= 0
          ) {
            testKeyword = true
          }
        })
        if (testKeyword) {
          for (const key in para.colFilter) {
            const selectedArr = para.colFilter[key]
            if (selectedArr.length === 0) {
              continue
            }
            const index = selectedArr.indexOf(item[key])
            if (index === -1) {
              testCol = false
            }
          }
        }
        if (testKeyword && testCol) {
          arr.push(item)
        }
      })
      this.totalShow = arr.length
      this.tableDataShow = arr.slice(
        (para.currentPage - 1) * para.pageSize,
        para.currentPage * para.pageSize
      )
      callback && callback()
    },
    deleteRow() {
      this.$confirm('确定要删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          const ids = []
          this.selection.forEach(item => {
            ids.push(String(item.id))
          })
          this.$http
            .post(this.reportFormManageUrl + 'delete', ids)
            .then(res => {
              this.getTableDataAll()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {})
    },
    showBegain() {
      this.$message.success('开始上传')
    },
    handleUploadSuccess() {
      this.$message.success('上传成功')
      this.getCodes()
    },
    editReportForm(item, index) {
      this.$bus.$once('reportAddedToCatalog', () => {
        this.tableDataShow.splice(index, 1)
      })
      this.$emit('editReportForm', item)
    },
    typeFilter(value, row, column) {
      return row.type === value
    },

    sortHandle(obj) {
      const orderByMap = {
        chineseName: 'chname',
        englishName: 'enname',
        abbreviation: 'abbr',
      }
      const sortMap = {
        ascending: 'asc',
        descending: 'desc',
      }
      const para = {
        orderBy: orderByMap[obj.prop],
        sort: sortMap[obj.order],
      }
      this.orderBy = para.orderBy
      this.sort = para.sort
      this.getTableData(para)
    },

    // set view, 处理与直接显示的数据,函数
    /* 分页设置:  */
    handleSizeChange(size) {
      this.pageSize = size
      this.resetTableData({
        pageSize: this.pageSize,
      })
    },
    handleCurrentChange() {
      this.resetTableData({
        currentPage: this.currentPage,
      })
    },
    timeFormatter(row, column, cellValue, index) {
      return cellValue ? moment(cellValue).format('L') : '-'
    },
    typeFommatter(row, column, cellValue, index) {
      const map = {}
      this.appTypes.forEach(item => {
        map[item.value] = item.label
      })
      return cellValue ? map[cellValue] : ''
    },
    // table data
    getTableDataAll(para) {
      let addName = ''
      if (para) {
        addName = para.addName
      }
      this.$http
        .get(this.reportFormManageUrl)
        .then(res => {
          this.tableDataAll = res.data
          if (this.tableDataAll && Array.isArray(this.tableDataAll)) {
            this.clearAllFilter()
            this.getFilterArr()
            this.resetTableData()
            if (this.defaultOpen) {
              const index = this.tableDataAll.findIndex(item => {
                return item.code === this.defaultOpen
              })
              if (index >= 0) {
                this.editReportForm(this.tableDataAll[index])
              }
            }
            if (addName) {
              const index = this.tableDataAll.findIndex(item => {
                return item.name === addName
              })
              if (index >= 0) {
                this.editReportForm(this.tableDataAll[index])
              }
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getFilterArr() {
      const arr = []
      this.frequencyFilterArr = []
      this.ownerFilterArr = []
      this.dupliFilterMap = {}
      this.tableDataAll.forEach(item => {
        arr.push(item)
        this.filter2Arr.forEach(attr => {
          if (
            item[attr] &&
            !this.dupliFilterMap[attr + 'FilterArr/' + item[attr]]
          ) {
            this[attr + 'FilterArr'].push({
              text: item[attr],
              value: item[attr],
            })
            this.dupliFilterMap[attr + 'FilterArr/' + item[attr]] = true
          }
        })
      })
      this.$emit('sentNameArr', arr)
    },
    clearAllFilter() {
      this.colFilter = {}
      this.sortData = {}
      this.$refs.deTable && this.$refs.deTable.clearFilter()
      this.$refs.deTable && this.$refs.deTable.clearSort()
    },
  },
  watch: {
    keyword(newVal) {
      /* 清除排序, 筛选条件 */
      this.clearAllFilter()
      const para = {}
      para.keyword = newVal
      this.resetTableData(para)
    },
  },
  computed: {},
}
