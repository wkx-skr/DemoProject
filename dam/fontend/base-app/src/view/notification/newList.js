import HTTP from '@/http/main.js'
import userPane from '@constant/userPane'
import NotificationController from '../../../../base-components/http/baseController/NotificationController'

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
        1: '#5dc4c0',
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
        66601: '#38B48B',
        66602: '#38B48B',
        66603: '#38B48B',
        66604: '#53A7AD',
        66605: '#53A7AD',
        66606: '#FFDE6A',
        66607: '#FFDE6A',
        66608: '#FFDE6A',
        66609: '#57a07f',
        66610: '#57a07f',
        66611: '#A4CE62',
        66612: '#A4CE62',
        66613: '#A4CE62',
        66614: '#9D5B8B',
        66615: '#9D5B8B',
        66616: '#9D5B8B',
        66617: '#F46565',
        66618: '#F46565',
        66619: '#D1495B',
        66620: '#D1495B',
        66621: '#D1495B',
        66622: '#3466C0',
        66623: '#88d0d0',
        66624: '#3466C0',
        66625: '#EDAD4A',
        66626: '#EDAD4A',
        66627: '#EDAD4A',
        66628: '#EDAD4A',
        66629: '#3466C0',
        66630: '#3466C0',
        66631: '#3466C0',
        66632: '#F46565',
        66633: '#F46565',
        66634: '#5DC4C0',
        66635: '#5DC4C0',
        66636: '#409EFF',
        66637: '#5DC4C0',
        66638: '#409EFF',
        66639: '#409EFF',
        66640: '#5DC4C0',
        66641: '#85A452',
        66642: '#BF794E',
        66643: '#88d0d0',
        66644: '#88d0d0',
        66645: '#88d0d0',
        66646: '#88d0d0',
        66647: '#0095D9',
        66648: '#0095D9',
        66649: '#0095D9',
        66650: '#0095D9',
      }
      // let typeToColorObj = { 0: '#3466C0', 1: '#57a07f', 2: '#F46565',3:'#53A7AD',4:'#E3F1FF'}
      return typeToColorObj[val]
    },
    setBg(val) {
      let typeToBgObj = {
        0: 'rgba(52, 102, 192, 0.15)', // 蓝
        1: 'rgba(93, 196, 192, 0.15)',
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
        66601: 'rgba(56, 180, 139, 0.15)',
        66602: 'rgba(56, 180, 139, 0.15)',
        66603: 'rgba(56, 180, 139, 0.15)',
        66604: 'rgba(83, 167, 173, 0.15)',
        66605: 'rgba(83, 167, 173, 0.15)',
        66606: 'rgba(255, 222, 106, 0.15)',
        66607: 'rgba(255, 222, 106, 0.15)',
        66608: 'rgba(255, 222, 106, 0.15)',
        66609: 'rgba(87, 160, 127, 0.15)',
        66610: 'rgba(87, 160, 127, 0.15)',
        66611: 'rgba(164, 206, 98, 0.15)',
        66612: 'rgba(164, 206, 98, 0.15)',
        66613: 'rgba(164, 206, 98, 0.15)',
        66614: 'rgba(157, 91, 139, 0.15)',
        66615: 'rgba(157, 91, 139, 0.15)',
        66616: 'rgba(157, 91, 139, 0.15)',
        66617: 'rgba(244, 101, 101, 0.15)',
        66618: 'rgba(244, 101, 101, 0.15)',
        66619: 'rgba(209, 73, 91, 0.15)',
        66620: 'rgba(209, 73, 91, 0.15)',
        66621: 'rgba(209, 73, 91, 0.15)',
        66622: 'rgba(52, 102, 192, 0.15)',
        66623: 'rgba(96,170,199,0.15)',
        66624: 'rgba(52, 102, 192, 0.15)',
        66625: 'rgba(237, 173, 74, 0.15)',
        66626: 'rgba(237, 173, 74, 0.15)',
        66627: 'rgba(237, 173, 74, 0.15)',
        66628: 'rgba(237, 173, 74, 0.15)',
        66629: 'rgba(52, 102, 192, 0.15)',
        66630: 'rgba(52, 102, 192, 0.15)',
        66631: 'rgba(52, 102, 192, 0.15)',
        66632: 'rgba(244, 101, 101, 0.15)',
        66633: 'rgba(244, 101, 101, 0.15)',
        66634: 'rgba(93,196,192,0.15)',
        66635: 'rgba(93,196,192,0.15)',
        66636: 'rgba(64,158,255,0.15)',
        66637: 'rgba(93,196,192,0.15)',
        66638: 'rgba(64,158,255,0.15)',
        66639: 'rgba(64,158,255,0.15)',
        66640: 'rgba(93,196,192,0.15)',
        66641: 'rgba(133, 164, 82, 0.15)',
        66642: 'rgba(191, 121, 78, 0.15)',
        66643: 'rgba(96,170,199,0.15)',
        66644: 'rgba(96,170,199,0.15)',
        66645: 'rgba(96,170,199,0.15)',
        66646: 'rgba(96,170,199,0.15)',
        66647: 'rgba(0, 149, 217, 0.15)',
        66648: 'rgba(0, 149, 217, 0.15)',
        66649: 'rgba(0, 149, 217, 0.15)',
        66650: 'rgba(0, 149, 217, 0.15)',
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
        this.getNotification()
      } else {
        this.getSentNotification()
      }
    },
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    clickAll() {},
    handleSelectionChange(val) {
      this.selection = val
    },
    checkMsg(obj) {
      this.$emit('checkNoti', obj)
      if (!obj.read) {
        this.handleRefresh()
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
      if (this.selection && Array.isArray(this.selection)) {
        NotificationController.updateNotificationsRead({
          read: true,
          ifAll: false,
          requestBody: this.selection.map(item => item.id),
        }).then(() => {
          this.selection.forEach(item => {
            if (!item.read) {
              item.read = true
            }
          })
          this.$refs.dsTable.clearSelection()
        })
      }
    },
    handleSetSectionedReadeds() {
      if (this.selection && Array.isArray(this.selection)) {
        NotificationController.updateNotificationsRead({
          read: false,
          ifAll: false,
          requestBody: this.selection.map(item => item.id),
        }).then(() => {
          this.selection.forEach(item => {
            if (item.read) {
              item.read = false
            }
          })
          this.$refs.dsTable.clearSelection()
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
      if (!row.read) {
        NotificationController.updateNotificationsRead({
          read: true,
          ifAll: false,
          requestBody: [row.id],
        }).then(() => {
          this.checkMsg(row)
        })
      } else {
        this.checkMsg(row)
      }
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
      this.currentPage = 1
      NotificationController.getNotifications()
        .then(res => {
          const data = res.data
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
          // this.$bus.$emit('getInfication', arr) // 全局通知获得消息;pageHeading已不在使用
          this.allDataArr = arr
          this.getShowData(this.showNotiType, para)
        })
        .catch(e => {
          this.$showFailure(e)
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
        for (let key in this.$messageTypeMap) {
          if (`${element.type}` === `${key}`) {
            this.typeOption.push({
              label: this.$messageTypeMap[key],
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
        for (let key in this.$messageTypeMap) {
          if (`${item.type}` === `${key}`) {
            item.typeName = this.$messageTypeMap[key]
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
      NotificationController.updateNotificationsRead({
        read: true,
        ifAll: true,
      }).then(() => {
        callback()
      })
    },

    getSentNotification(para) {
      this.loadingMsg = true
      NotificationController.getUserSentNotifications()
        .then(res => {
          const data = res.data
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
        })
        .catch(e => {
          this.$showFailure(e)
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
        this.currentPage = 1
        this.pageSize = 20
        this.getShowData('unread')
      } else {
        this.currentPage = 1
        this.pageSize = 20
        this.getShowData('all')
      }
    },
  },
}
