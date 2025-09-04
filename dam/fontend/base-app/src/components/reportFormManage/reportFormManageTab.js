import moment from 'moment'
import treeStyleReport from './treeStyleReport.vue'
import importTask from './importTask.vue'
import SetUdp from '@/view/dataProperty/meta/setUdp.vue'
import HTTP from '@/http/main.js'

export default {
  props: ['appTypes', 'defaultOpen', 'defaultOpenById', 'hasAccess', 'postUrl'],
  components: {
    treeStyleReport,
    SetUdp,
    importTask,
  },
  data() {
    const reportFormManageUrl = this.$meta_url + '/dataReport/'
    return {
      editDialogVisible: false,
      reportFormManageUrl: reportFormManageUrl,
      // hasAccess: true,
      // nameArr: [],

      /* table 设置 */
      // tableHeight: undefined,
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
      showTable: true,

      showTreeReport: true,
      // reportUdpPro: null,

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
      udpDialogVisible: false,
    }
  },
  mounted() {
    // 页面布局
    // this.tableHeight = $(this.$refs.tableRow)[0].offsetHeight
    $(window).resize(this.resizeTable)

    // // 数据初始化
    // this.timer = 'first';
    // this.resetTableData();
    // this.getTableDataAll();
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    // 响应事件
    showImportTask() {
      this.editDialogVisible = true
    },
    closeUdp() {
      this.udpDialogVisible = false
    },
    close() {
      this.editDialogVisible = false
    },
    resizeTable() {
      if (!$('.table-row')[0]) return
      this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
      this.$nextTick(() => {
        this.$refs.reportTable &&
          this.$refs.reportTable.doLayout &&
          this.$refs.reportTable.doLayout()
      })
    },
    handleSelectionChange(val) {
      this.selection = val
      this.deleteDisabled = this.selection.length == 0
    },
    /* 分页设置:  */

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
    deleteRow(selection) {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          const ids = []
          if (!selection) {
            selection = this.selection
          }
          selection.forEach(item => {
            ids.push(item.id)
          })
          if (ids.length > 0) {
            this.$http
              .post(this.reportFormManageUrl + 'delete', ids)
              .then(res => {
                // this.getTableDataAll();
                this.refreshTreeData()
                this.$message.success(this.$t('meta.DS.message.delSucceed'))
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(e => {})
    },
    // 刷新 报表树 数据
    refreshTreeData() {
      setTimeout(() => {
        if (this.$refs.reportTree && this.$refs.reportTree.refreshTree) {
          this.$refs.reportTree.refreshTree()
        }
      }, 500)

      // setTimeout(() => {
      //   this.refreshTreeData()
      // }, 10000)
    },
    showBegain() {
      this.$message.success(this.$t('meta.DS.message.beginUpload'))
    },
    handleUploadSuccess() {
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
      this.getCodes()
    },
    editReportForm(item) {
      this.$emit('editReportForm', item)
      // localStorage.setItem('summary',arr);
      this.$router.push({
        query: {
          objectId: item.id,
          blank: this.$route.query.blank,
          isAssets: this.$route.query.isAssets,
        },
      })
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
    /* showJobMange() {
      this.$emit('showJobMange')
    }, */

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
            if (this.defaultOpenById) {
              const index = this.tableDataAll.findIndex(item => {
                return String(item.id) === this.defaultOpenById
              })
              if (index >= 0) {
                this.editReportForm(this.tableDataAll[index])
              }
            }
            if (addName) {
              const index = this.tableDataAll.findIndex(item => {
                return item.name === addName && item.id === para.id
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
    downloadFile(para) {
      this.$emit('downloadFile', para)
    },
    showAddReportFormManageTab(para) {
      this.$emit('showAddReportFormManageTab', para)
    },
    handleBeforeUpload(para) {
      this.$emit('handleBeforeUpload', para)
    },
    showImportJobSet() {
      this.$emit('showImportJobSet')
    },
    onError(para) {
      this.$emit('onError', para)
    },
    onSuccess(para) {
      if (para === 0) {
        this.$emit('onError', para)
      } else {
        this.$emit('onSuccess', para)
        this.editDialogVisible = false
      }
    },
    /* showTreeStyle() {
      // this.$emit('showTreeStyle');
      this.showTreeReport = true
    }, */
    /* showListStyle() {
      this.showTreeReport = false
    }, */
    showReportDetail(para) {
      this.$emit('showReportDetail', para)
    },
    setUdp() {
      this.udpDialogVisible = true
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
    udpDialogVisible() {
      this.$emit('refreshGetUdp')
    },
  },
  computed: {},
}
