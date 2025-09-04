import HTTP from '@/resource/http'
import agTable from '@/components/common/agTableComponent'
import userPane from '@constant/userPane'
import editAnnouncement from './editAnnouncement.vue'
import sentImg from '@/assets/images/userCenter/sent.png'
import readImg from '@/assets/images/userCenter/read.png'
import unreadImg from '@/assets/images/userCenter/unread.png'

// 注意: ddm 新增 分页获取 信息 api, dam 原本的分页api有问题, 没有使用, dam 直接获取了全量数据

export default {
  mixins: [userPane],
  data () {
    return {
      sentImg,
      readImg,
      unreadImg,
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
      // 数量
      num: 0,
      nums: 0,
      ifAll: false,
      switchType: false,
      isRead: '',
      keyword: '',
      typeValue: '',
      typeOption: [],
      baseLen: 0,
      allMessage: [],
      announcement: {},
      showAnnouncement: false

      // 全选
      // multipleSelection: []
    }
  },
  props: {
    showAll: {
      type: Boolean,
      default: true
    },
    showSentNoti: {
      type: Boolean,
      default: false
    },
    classStr: {
      type: String
    },
    type: {
      type: String,
      default: false
    }
  },
  components: {
    agTable,
    editAnnouncement
  },
  computed: {
    hasUnread () {
      return this.displayData.some(item => item.read === false)
    },
    couldDelete () {
      return (
        this.selection &&
        this.selection.length > 0 &&
        this.selection.some(item => item.read === true)
      )
    },
    chooseUnread () {
      return this.selection && this.selection.some(item => item.read === false)
    }
  },
  created () {
    this.$user = this.$store.state.user
    if (this.$store.state.user.isAdmin || this.type !== 'messageSendMailbox') {
      this.updateAnnouncement()
    }
  },
  beforeMount () {
  },
  mounted () {
    // this.dataInit(); // 父组件直接调用调用
    this.resize()
    $(window).resize(this.resize)
  },
  destroyed () {
    $(window).unbind('resize', this.resize)
  },
  methods: {
    handleKeywordInput () {
      clearTimeout(this.keyTimer)
      this.keyTimer = setTimeout(() => {
        this.loadingMsg = true
        this.dataInit()
      }, 300)
    },
    filterUnRead (arr) {
      return arr.filter(v => !v.read)
    },
    handleSwitchChange (val) {
      if (val) {
        this.isRead = false
      } else {
        this.isRead = ''
      }
      this.dataInit()
    },
    setType (val) {
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
        1400: '#F46565'
      }
      // let typeToColorObj = { 0: '#3466C0', 1: '#57a07f', 2: '#F46565',3:'#53A7AD',4:'#E3F1FF'}
      return typeToColorObj[val]
    },
    setBg (val) {
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
        1400: 'rgba(244, 101, 101, 0.15)' // 红
      }
      return typeToBgObj[val]
    },
    typeChange (value) {
      this.getShowData()
    },
    dataInit (para) {
      // if (!this.showSentNoti) {
      this.getNotification()
      // } else {
      //   this.getSentNotification(para)
      // }
    },
    resize () {
      // if ($('.table-row')[0].offsetHeight === 0) {
      //   return
      // }
      // this.tableHeight = $('.table-row')[0].offsetHeight

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
    clickAll () {
    },
    handleSelectionChange (val) {
      this.selection = val
    },
    checkAnnouncement () {
      let obj = _.cloneDeep(this.announcement)
      obj.content = this.announcement.contentBr
      this.$emit('checkNoti', obj)
    },
    checkMsg (obj) {
      let needFresh = !obj.read
      HTTP.getMessageDetails(obj.id)
        .then(res => {
          this.$emit('checkNoti', res)
          if (needFresh) {
            setTimeout(() => {
              this.handleRefresh()
            }, 500)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    handleRemoveMsg (row) {
      const ids = [row.id]
      this.deleMessages(ids)
    },
    deleMessages (ids) {
      HTTP.deleteMessage(ids)
        .then(res => {
          this.$message.success('删除成功')
          this.getNotification()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleDeleteNotis () {
      this.$confirm('消息删除后不可恢复，确认删除？', '提示', {
        type: 'warning'
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
    changeIsRead (ids, isRead) {
      HTTP.changeIsRead(ids, isRead)
        .then(res => {
          this.dataInit()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleSetSectionedReaded () {
      const resultArr = []
      if (this.selection && Array.isArray(this.selection)) {
        this.selection.forEach(item => {
          if (!item.read) {
            resultArr.push(item.id)
          }
        })
        this.changeIsRead(resultArr, true)
      }
    },
    handleSetSectionedReadeds () {
      const resultArr = []
      if (this.selection && Array.isArray(this.selection)) {
        this.selection.forEach(item => {
          if (item.read) {
            resultArr.push(item.id)
          }
        })
        this.changeIsRead(resultArr, false)
      }
    },
    handleSetAllReaded () {
      const resultArr = []
      if (this.displayData && Array.isArray(this.displayData)) {
        this.displayData.forEach(item => {
          if (!item.read) {
            resultArr.push(item.id)
          }
        })
        this.changeIsRead(resultArr, true)
      }
      // const resultArr = []
      // this.ifAll = true
      // this.allDataArr.forEach(item => {
      //   if (!item.read) {
      //     resultArr.push(item)
      //   }
      // })
      // this.setNotificationReaded(resultArr)
    },
    handleRefresh () {
      this.getShowData()
      // this.loadingMsg = true
      // const para = {
      //   sortData: this.sortData,
      //   currentPage: this.currentPage,
      //   pageSize: this.pageSize
      // }
      // if (!this.showSentNoti) {
      //   this.getNotification(para)
      // } else {
      //   this.getSentNotification(para)
      // }
    },
    handleRowClick (row, column, event) {
      // console.log(row, column, event, 'row, column, event')
      this.checkMsg(row)
    },

    handleSortChange (sortData) {
      this.currentPage = 1
      this.sortData = sortData
      this.getPageShowData()
    },
    handleSizeChange (size) {
      // console.log(size, 'size')
      this.pageSize = size
      const para = {
        sortData: this.sortData,
        currentPage: 1,
        pageSize: size
      }
      this.getPageShowData(para)
    },
    handleCurrentChange (currentPage) {
      // console.log(currentPage, 'currentPage')
      this.currentPage = currentPage
      const para = {
        sortData: this.sortData,
        currentPage: currentPage,
        pageSize: this.pageSize
      }
      this.getPageShowData(para)
    },

    getNotification (para = {}) {
      this.loadingMsg = true
      HTTP.getMessageList({
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        inbox: !!this.showSentNoti,
        isRead: !this.switchType,
        orderBy: this.sortData.prop || '',
        sort: this.sortData.order === null ? '' : this.sortData.order === 'ascending',
        keyword: encodeURIComponent(this.keyword)
      })
        .then(res => {
          this.displayData = res.content
          this.loadingMsg = false
          this.total = res.totalItems
        })
        .catch(err => {
          this.loadingMsg = false
          this.$showFailure(err)
          console.error(err)
        })
    },
    getShowData () {
      this.dataInit()
    },
    // ddm 废弃
    getShowData2 (type, para) {
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
          pageSize: this.pageSize
        }
      }
      this.getPageShowData(para)
    },
    getPageShowData () {
      this.dataInit()
    },
    // ddm 废弃
    getPageShowData2 (para) {
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
              value: Number(key)
            })
          }
        }
      })
      this.typeOption = [
        ...new Set(this.typeOption.map(e => JSON.stringify(e)))
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

    removeNotifications (ids = []) {
      const obj = {
        ids: ids
      }
      HTTP.removeNotifis({
        succesedCallback: data => {
          this.$showSuccess(this.$t('system.systemSetting.delSucceed'))
          this.handleRefresh()
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: obj
      })
    },
    // ddm 废弃
    setNotificationReaded (notis = []) {
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
          nId: item.nId
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
          para: obj
        })
      })
    },
    // ddm 废弃
    getSentNotification (para = {}) {
      this.loadingMsg = true
      HTTP.getMessageList({
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        inbox: true,
        isRead: this.isRead,
        orderBy: this.sortData.prop || '',
        sort: this.sortData.order === null ? '' : this.sortData.order === 'ascending',
        keyword: encodeURIComponent(this.keyword)
      })
        .then(res => {
          // this.allMessage = _.cloneDeep(res.content)
          // if (this.switchType) {
          //   this.filterUnRead(res.content)
          // }
          this.displayData = res.content
          this.loadingMsg = false
          this.total = res.totalItems
        })
        .catch(err => {
          this.$showFailure(err)
          console.error(err)
          this.loadingMsg = false
        })
    },

    getRowClassName ({ row, column, rowIndex, columnIndex }) {
      let str = 'table-row-class'
      if (!row.read && !this.showSentNoti) {
        str += ' read-msg'
      }
      return str
    },
    // new tabel
    onGridReady (params) {
      // console.log('grid ready')
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid () {
      this.$refs.newsList.sizeColumnsToFit()
      // console.log('fit')
    },
    cellClicked () {
      // console.log('cellClicked')
    },
    gridSelectionChanged () {
    },
    editAnnouncement () {
      this.$refs.editAnnouncement.open()
    },
    updateAnnouncement () {
      HTTP.getAnnouncement()
        .then(res => {
          let announcement = res[0] || {}
          if (announcement.content || announcement.title) {
            this.showAnnouncement = true
            this.announcement = announcement || {}
            this.announcement.contentBr = announcement.content
            this.announcement.content = announcement.content.replace(/<br\/>/g, '')
          } else {
            this.showAnnouncement = false
            this.announcement = {}
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  watch: {
    keyword (newVal) {
      this.currentPage = 1
      this.getShowData()
    },
    // 废弃
    showUnread (newVal) {
      this.getShowData(this.allDataArr, !newVal)
    },
    switchType (newVal) {
      this.currentPage = 1
      if (newVal === true) {
        this.getShowData('unread')
      } else {
        this.getShowData('all')
      }
    }
  }
}
