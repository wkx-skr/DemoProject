import HTTP from '@/http/main.js'
import agTable from '@/components/common/agTableComponent'
import userPane from '@constant/userPane'

export default {
  mixins: [userPane],
  data() {
    return {
      loadingMsg: false,
      selection: [],
      tableHeight: 0,

      allDataArr: [],
      typeFilterArr: [],
      displayData: [],
      showUnread: false,
      showNotiType: 'all',
      sortData: {},
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // new table
      columnDefs: null,
      gridOptions: null,
      // 数量
      num: 0,
      nums: 0,
      ifAll: false,
      switchType: false,
      keyword: '',
      typeValue: '',
      typeOption: [],
      baseLen: 0,

      // 全选
      // multipleSelection: []
    }
  },
  props: {
    showAll: {
      type: Boolean,
      default: true,
    },
    showSentNoti: {
      type: Boolean,
      default: false,
    },
    classStr: {
      type: String,
    },
    type: {
      type: String,
      default: false,
    },
  },
  components: {
    agTable,
  },
  computed: {
    hasUnread() {
      return this.typeFilterArr.some(item => item.read === false)
    },
    couldDelete() {
      return (
        this.selection &&
        this.selection.length > 0 &&
        this.selection.some(item => item.read === true)
      )
    },
    chooseUnread() {
      return this.selection && this.selection.some(item => item.read === false)
    },
  },
  beforeMount() {
    const cellStyle = {}
    const gridOptions = {
      suppressRowClickSelection: true,
    }

    let userortarget = null
    if (this.showSentNoti) {
      userortarget = {
        headerName: '收信箱',
        field: 'target',
        tooltipField: 'target',
        width: 100,
      }
    } else {
      userortarget = {
        headerName: '发信箱',
        field: 'source',
        tooltipField: 'source',
        width: 100,
      }
    }

    const columnDefs = [
      {
        checkboxSelection: true,
        width: 50,
        suppressSizeToFit: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: '标题',
        field: 'title',
        tooltipField: 'title',
        width: 500,
      },
      userortarget,
      {
        headerName: '类型',
        field: 'type',
        // tooltipField: 'type',
        width: 200,
        filter: true,
        valueFormatter: params => {
          return this.$messageTypeMap[params.value]
        },
      },
      {
        headerName: '发送时间',
        field: 'createdOn',
        width: 200,
        valueFormatter: params => {
          return this.$timeFormatter(params.value)
        },
      },
    ]
    this.columnDefs = columnDefs
    this.gridOptions = gridOptions
  },
  mounted() {
    // this.dataInit(); // 父组件直接调用调用
    this.resize()
    $(window).resize(this.resize)
  },
  destroyed() {
    $(window).unbind('resize', this.resize)
  },
  methods: {
    setType(val) {
      // 数据标准审核   数据权限申请

      let typeToColorObj = {
        0: '#3466C0',
        1: '#53A7AD',
        1000: '3466C0', // 蓝色
        1001: '#57a07f', // 绿色
        1003: '#53A7AD',
        1500: '#53A7AD',
        1200: '#53A7AD',
        1300: '#53A7AD', // 青色
        1100: '#85c9ff', // 淡天蓝色
        1002: '#F46565',
        9999: '#F46565',
        1600: '#F46565',
        1400: '#F46565',
      }
      // let typeToColorObj = { 0: '#3466C0', 1: '#57a07f', 2: '#F46565',3:'#53A7AD',4:'#E3F1FF'}
      return typeToColorObj[val]
    },
    setBg(val) {
      let typeToBgObj = {
        0: 'rgba(52, 102, 192, 0.15)', // 蓝
        1: 'rgba(83, 167, 173, 0.15)',
        1000: 'rgba(52, 102, 192, 0.15)', // 蓝
        1001: 'rgba(87, 160, 127, 0.15)', // 绿
        1002: 'rgba(244, 101, 101, 0.15)', // 红
        9999: 'rgba(244, 101, 101, 0.15)', // 红
        1600: 'rgba(244, 101, 101, 0.15)', // 红
        1003: 'rgba(83, 167, 173, 0.15)', // 青
        1500: 'rgba(83, 167, 173, 0.15)', // 青
        1200: 'rgba(83, 167, 173, 0.15)', // 青
        1300: 'rgba(83, 167, 173, 0.15)', // 青
        1100: '#e6f2ff', // 淡天蓝色
        1400: 'rgba(244, 101, 101, 0.15)', // 红
      }
      return typeToBgObj[val]
    },
    typeChange(value) {
      if (!this.showSentNoti) {
        this.getNotification()
      } else {
        this.getSentNotification()
      }
    },
    dataInit() {
      if (!this.showSentNoti) {
        // HTTP.getNotiPage({
        //   succesedCallback: (data) => {
        //     console.log(data, 'data')
        //     this.getNotification();
        //   },
        //   failureCallback: (e) => {
        //     this.$showFailure(e);
        //   },
        //   para: {
        //     pageSize: 20,
        //     currentPage: 1
        //   }
        // });

        this.getNotification()

        // HTTP.getFirstPage({
        //   succesedCallback: (data) => {
        //     console.log(data, 'firstPage')
        //   },
        //   failureCallback: (e) => {
        //     this.$showFailure(e);
        //   },
        //   para: {
        //     pageSize: 25,
        //     currentPage: 1,
        //     userName: this.$user.username
        //   }
        // });
      } else {
        this.getSentNotification()
      }
    },
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight

      /* this.$nextTick(() => {
        const str = this.classStr ? '.' + this.classStr : ''
        let heightResult = ''
        if ($(str + '.mes-page .table-line')[0]) {
          heightResult =
            $(str + '.mes-page .table-line')[0].offsetHeight || this.tableHeight
        } else {
          heightResult =
            $('.mes-page .table-line')[0].offsetHeight || this.tableHeight
        }
        this.tableHeight = heightResult
      }) */
    },
    clickAll() {},
    handleSelectionChange(val) {
      this.selection = val
    },
    checkMsg(obj) {
      this.$emit('checkNoti', obj)
      if (!obj.read) {
        setTimeout(() => {
          this.handleRefresh()
        }, 500)
      }
    },

    handleRemoveMsg(row) {
      // this.removeNotifications([row.nId]);

      const obj = {
        id: row.nId,
      }
      HTTP.removeSingleNotifi({
        succesedCallback: data => {
          this.$showSuccess('删除成功')
          this.handleRefresh()
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: obj,
      })
    },
    handleDeleteNotis() {
      this.$confirm('消息删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          const ids = []
          this.selection.forEach(item => {
            ids.push(item.nId)
          })
          this.removeNotifications(ids)
        })
        .catch(() => {
          console.log('cancel')
        })
    },
    handleSetSectionedReaded() {
      const resultArr = []
      if (this.selection && Array.isArray(this.selection)) {
        this.selection.forEach(item => {
          if (!item.read) {
            resultArr.push(item)
          }
        })
        this.setNotificationReaded(resultArr)
      }
    },
    handleSetSectionedReadeds() {
      const resultArr = []
      this.ifAll = false
      if (this.selection && Array.isArray(this.selection)) {
        this.selection.forEach(item => {
          if (item.read) {
            item.read = false
            resultArr.push(item.nId)
          }
        })
        this.$http
          .post(
            this.$url +
              `/service/notification/read?read=false&ifAll=${this.ifAll}`,
            resultArr
          )
          .then(res => {
            this.setNotificationReaded()
          })
      }
    },
    handleSetAllReaded() {
      const resultArr = []
      this.ifAll = true
      this.allDataArr.forEach(item => {
        if (!item.read) {
          resultArr.push(item)
        }
      })
      this.setNotificationReaded(resultArr)
    },
    handleRefresh() {
      this.loadingMsg = true
      const para = {
        sortData: this.sortData,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      if (!this.showSentNoti) {
        this.getNotification(para)
      } else {
        this.getSentNotification(para)
      }
    },
    handleRowClick(row, column, event) {
      // console.log(row, column, event, 'row, column, event')
      this.checkMsg(row)
    },

    handleSortChange(sortData) {
      this.sortData = sortData
      const para = {
        sortData: sortData,
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.getPageShowData(para)
      // let arr = [];
      // this.allDataArr.forEach(item => {
      //   arr.push(item);
      // });
      // if (sortData.prop) {
      //   this.$utils.sort.sortConsiderChineseNumber(arr, sortData.prop);
      //   if (sortData.order !== 'ascending') {
      //     arr.reverse();
      //   }
      // } else {
      //   this.$utils.sort.sortConsiderChineseNumber(arr, 'createdOn');
      //   arr.reverse();
      // }
      // this.getShowData(arr, this.showAll);
    },
    handleSizeChange(size) {
      // console.log(size, 'size')
      this.pageSize = size
      const para = {
        sortData: this.sortData,
        currentPage: 1,
        pageSize: size,
      }
      this.getPageShowData(para)
    },
    handleCurrentChange(currentPage) {
      // console.log(currentPage, 'currentPage')
      this.currentPage = currentPage
      const para = {
        sortData: this.sortData,
        currentPage: currentPage,
        pageSize: this.pageSize,
      }
      this.getPageShowData(para)
    },

    getNotification(para) {
      const username = this.$user.username
      this.loadingMsg = true
      HTTP.getNotification({
        succesedCallback: data => {
          const arr = []
          if (data && Array.isArray(data)) {
            // arr = data.reverse();
            data.forEach(item => {
              if (item.target === username) {
                if (this.keyword !== '') {
                  if (this.typeValue !== '') {
                    const keyword = this.keyword.trim().toLowerCase()
                    if (item.title.toLowerCase().indexOf(keyword) !== -1) {
                      if (item.type === this.typeValue) {
                        arr.push(item)
                      }
                    }
                  } else {
                    const keyword = this.keyword.trim().toLowerCase()
                    if (item.title.toLowerCase().indexOf(keyword) !== -1) {
                      arr.push(item)
                    }
                  }
                } else if (this.typeValue !== '') {
                  if (item.type === this.typeValue) {
                    arr.push(item)
                  }
                } else {
                  arr.push(item)
                }
              }
            })
            arr.reverse()
          }
          this.$bus.$emit('getInfication', arr) // 全局通知获得消息
          this.allDataArr = arr
          this.getShowData(this.showNotiType, para)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    },
    getShowData(type, para) {
      this.showNotiType = type
      const data = this.allDataArr
      let arr = []
      if (this.showNotiType === 'all') {
        const datas = []
        this.num = data.length

        data.forEach(item => {
          if (!item.read) {
            datas.push(item)
          }
        })
        this.nums = datas.length
        arr = data
      } else if (this.showNotiType === 'unread') {
        data.forEach(item => {
          if (!item.read) {
            arr.push(item)
          }
        })
        this.nums = arr.length
      } else {
        data.forEach(item => {
          if (item.type === this.showNotiType) {
            arr.push(item)
          }
        })
      }
      this.typeFilterArr = arr
      this.total = this.typeFilterArr.length
      if (!para) {
        para = {
          sortData: this.sortData,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        }
      }
      this.getPageShowData(para)
    },
    getPageShowData(para) {
      this.loadingMsg = true
      // let arr = [];
      const allData = this.typeFilterArr
      if (this.sortData && this.sortData.prop) {
        const sortData = this.sortData
        this.$utils.sort.sortConsiderChineseNumber(allData, sortData.prop)
        if (sortData.order !== 'ascending') {
          allData.reverse()
        }
      } else {
        this.$utils.sort.sortConsiderChineseNumber(allData, 'createdOn')
        allData.reverse()
      }
      allData.forEach(element => {
        for (let key in this.messageTypeMap) {
          if (`${element.type}` === `${key}`) {
            this.typeOption.push({
              label: this.messageTypeMap[key],
              value: Number(key),
            })
          }
        }
      })
      this.typeOption = [
        ...new Set(this.typeOption.map(e => JSON.stringify(e))),
      ].map(e => JSON.parse(e))
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = allData.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )
      let baseLen = 0
      /* let hasIndex = this.displayData.find(item => {
        // 数据指标预警
        return (
          item.type === 1 &&
          item.title.startsWith('指标管理') &&
          item.title.includes('预警')
        )
      }) */
      this.displayData.forEach(item => {
        for (let key in this.messageTypeMap) {
          if (`${item.type}` === `${key}`) {
            item.typeName = this.messageTypeMap[key]
          }
        }
        baseLen =
          item.typeName.length > baseLen ? item.typeName.length : baseLen
      })
      this.$nextTick(() => {
        if (this.$i18n.locale === 'zh') {
          this.baseLen = baseLen * 12 + 12 + 'px'
        } else {
          this.baseLen = baseLen * 7 + 12 + 'px'
        }
      })
      // baseLen = hasIndex && baseLen < 6 ? 6 : baseLen
      this.loadingMsg = false
    },

    removeNotifications(ids = []) {
      const obj = {
        ids: ids,
      }
      HTTP.removeNotifis({
        succesedCallback: data => {
          this.$showSuccess(this.$t('system.systemSetting.delSucceed'))
          this.handleRefresh()
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: obj,
      })
    },
    setNotificationReaded(notis = []) {
      const callback = () => {
        this.$showSuccess(this.$t('system.systemSetting.modifySucceed'))
        this.handleRefresh()
      }
      let notiCount = notis.length
      if (notiCount <= 0) {
        callback()
      }
      notis.forEach(item => {
        const obj = {
          nId: item.nId,
        }
        HTTP.getNotifiDetail({
          succesedCallback: data => {
            // console.log(data);
            notiCount--
            if (notiCount <= 0) {
              callback()
            }
          },
          failureCallback: e => {
            this.$showFailure(e)
          },
          para: obj,
        })
      })
    },

    getSentNotification(para) {
      this.loadingMsg = true
      HTTP.getSentNotification({
        succesedCallback: data => {
          const arr = []
          if (data && Array.isArray(data)) {
            // arr = data.reverse();
            data.reverse().forEach(element => {
              element.messageType = 'collect'
              if (this.keyword !== '') {
                if (this.typeValue !== '') {
                  const keyword = this.keyword.trim().toLowerCase()
                  if (element.title.toLowerCase().indexOf(keyword) !== -1) {
                    if (element.type === this.typeValue) {
                      arr.push(element)
                    }
                  }
                } else {
                  const keyword = this.keyword.trim().toLowerCase()
                  if (element.title.toLowerCase().indexOf(keyword) !== -1) {
                    arr.push(element)
                  }
                }
              } else if (this.typeValue !== '') {
                if (element.type === this.typeValue) {
                  arr.push(element)
                }
              } else {
                arr.push(element)
              }
            })
          }
          this.allDataArr = arr
          this.getShowData(this.showNotiType, para)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    },

    getRowClassName({ row, column, rowIndex, columnIndex }) {
      let str = 'table-row-class'
      if (!row.read && !this.showSentNoti) {
        str += ' read-msg'
      }
      return str
    },
    // new tabel
    onGridReady(params) {
      // console.log('grid ready')
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      this.$refs.newsList.sizeColumnsToFit()
      // console.log('fit')
    },
    cellClicked() {
      // console.log('cellClicked')
    },
    gridSelectionChanged() {},
  },
  watch: {
    keyword(newVal) {
      if (!this.showSentNoti) {
        this.getNotification()
      } else {
        this.getSentNotification()
      }
    },
    showUnread(newVal) {
      this.getShowData(this.allDataArr, !newVal)
    },
    switchType(newVal) {
      if (newVal === true) {
        this.getShowData('unread')
      } else {
        this.getShowData('all')
      }
    },
  },
}
