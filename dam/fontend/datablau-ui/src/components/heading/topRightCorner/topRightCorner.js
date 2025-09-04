import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
export default {
  components: {
    spanWithTooltip,
  },
  props: {
    stablePromise: {
      required: true,
    },
    appsMap: {
      required: true,
      type: Map,
    },
    pagesMap: {},
    env: {
      required: true,
    },

  },
  data() {
    return {
      displayName: '',
      keyword: '',
      unReadNotiCount: 0,
      pollingTimer: null,
      logsArr: [],
      hidenDropdown: true,
      showLogLoading: 'notstart',
      gatewayEnable: true,
      otherProduct: true,
      taskData: null,
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      deleteDisabled: true,
      selection: [],
      taskPopover: false,
      eventInterval: {}, // 将eventInterval定义为object类型，用来存放多个任务的定时器（查询任务进度）
      taskId: null,
      taskTabName: 'import',
      taskTableExpends: [],
      importTaskResult: {
        errorMsg: [],
      },
      hasLogAuth: false,
      globalSearchAuth: false,
      currentProduct: window.localStorage.getItem('currentProduct') || 'dam',
      checkProduct: false,
    }
  },
  mounted() {
    document.addEventListener('mousedown', (e) => {
      let flag = false
      const ele = $('.common_ui_header_task_pop')
      const left = ele.offset().left
      const right = ele.offset().left + ele.width()
      const top = ele.offset().top
      const bottom = ele.offset().left + ele.height()
      if (
        left < e.clientX &&
        e.clientX < right &&
        top < e.clientY &&
        e.clientY < bottom
      ) {
        flag = true
      }
      /*const flag = Array.isArray(e.path) && e.path.some(p => {
        return p.className && p.className.includes('common_ui_header_task_pop')
      })*/
      if (flag) {
      } else {
        if (this.taskPopover === true) {
          this.taskPopover = false
        }
      }
    })
    this.getDisplayName()
    this.taskTabName = 'import'
    this.getNoti()
    this.pollingCheckNoti()
    this.$bus.$on('getInfication', this.getNoti)
    this.$bus.$on('getTaskJobResult', this.getTaskJobResult)
  },
  beforeDestroy() {
    document.removeEventListener('mousedown')
    this.$bus.$off('getTaskJobResult', this.getTaskJobResult)
    this.$bus.$off('getInfication', this.getNoti)
  },
  methods: {
    switchProduct() {
      console.log('切换系统');
      // 因为默认就是dam
      const currentProduct = window.localStorage.getItem('currentProduct') || 'dam'
      if (this.env.toLowerCase().startsWith('dev')) {
        location.href = `${location.protocol}//${location.hostname}:8074/#/main/list`
      } else if (this.env.toLowerCase().startsWith('prod')) {
        if (currentProduct == 'dam') {
          window.localStorage.setItem('currentProduct', 'ddm')
        }
        location.href = `${location.origin}/ddm-app/#/main/list`
      }
    },

    globalSearch() {
      this.$bus.$emit('clearHighlightTopNav')
      this.$emit('openUserModal', 'searchGlobal')
    },
    handleDownload(id) {
      const url = '/base' + '/files/download?fileId=' + id
      this.$downloadFilePost(url)
    },
    getTaskJobResult(data, type) {
      if (data) {
        this.taskTabName = type
        this.taskId = data
        this.showTask()
      }
    },
    getStatus(str) {
      let status = ''
      switch (str) {
        case 'RUNNING':
          status = '运行中'
          break
        case 'FINISHED':
          status = '已完成'
          break
        case 'FAILED':
          status = '失败'
          break
        case 'IN_QUEUE':
          status = '排队中'
          break
        default:
          status = '未运行'
      }
      return status
    },
    showTask(e, type) {
      this.taskPopover = true
      if (this.taskPopover === true) {
        this.getJobs()
      }
    },
    handleTaskTabChange(tab) {
      this.taskData = []
      this.getJobs()
    },
    goProfiling(row) {
      this.$http
        .post(
          `/base/instantJob/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
        )
        .then((res) => {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl + `main/meta?objectId=${res.data.objectId}&isQuality=true`
          )
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    getJobs() {
      this.$http
        .post(
          `/base/instantJob/getJobs/type?type=${this.taskTabName.toUpperCase()}`
        )
        .then((res) => {
          this.taskData = res.data.filter((item) => {
            return !!item
          })
          // 默认按照接口返回的数据排序（任务生成时间）
          // this.taskData.sort((a, b) => {
          //   const x = a.jobName.toLowerCase()
          //   const y = b.jobName.toLowerCase()
          //   if (x > y) {
          //     return -1
          //   }
          //   if (x < y) {
          //     return 1
          //   }
          //   return 0
          // })
          // this.taskData.map((item, indexto) => {
          //   if (item.stage === 'RUNNING') {
          //     this.taskData.unshift(this.taskData.splice(indexto, 1)[0])
          //   }
          // })
          this.taskData.forEach((element) => {
            this.eventInterval[element.jobId] &&
              clearInterval(this.eventInterval[element.jobId])
            if (element.stage === 'RUNNING') {
              this.getJobStatus(element)
            }
            if (this.taskId) {
              if (this.taskId === element.jobId) {
                element.highlight = true
              }
            }
          })
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    getJobStatus(ele) {
      this.$http
        .post(
          `/base/instantJob/getJobStatus?name=${encodeURI(ele.jobName)}&jobId=${
            ele.jobId
          }`
        )
        .then((res) => {
          clearInterval(this.eventInterval[ele.jobId])
          if (res.data.stage === 'RUNNING') {
            this.eventInterval[ele.jobId] = setInterval(() => {
              this.getJobStatus(ele)
            }, 2000)
          } else {
            this.getJobs()
            return false
          }
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    // 关闭任务弹窗
    closeTask() {
      this.taskId = null
      Object.keys(this.eventInterval).forEach((k) => {
        clearInterval(this.eventInterval[k])
      })
      this.taskTableExpends = []
      this.taskPopover = false
    },
    // 下载 导出的文件
    scanResult(row) {
      this.$http
        .post(
          `/base/instantJob/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
        )
        .then((res) => {
          const url = '/base' + '/files/download?fileId=' + res.data.fileId

          if (row.jobName.indexOf('系统日志导出') !== -1) {
            this.$downloadFilePost(url, {}, '系统日志.csv')
          } else {
            this.$downloadFilePost(url)
          }
        })
        .then(() => {
          this.closeTask()
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    // table  row-click 回调
    handleRowClick(row, column) {
      if (
        this.taskTabName === 'import' &&
        (row.stage === 'FINISHED' || row.stage === 'FAILED') &&
        column.label !== '操作'
      ) {
        this.handleTableExpand(row)
      }
    },
    // table expand-change 回调
    handleTableExpand(row) {
      if (
        this.taskTabName === 'import' &&
        (row.stage === 'FINISHED' || row.stage === 'FAILED')
      ) {
        if (this.taskTableExpends[0] === row.jobId) {
          this.taskTableExpends = []
        } else {
          this.taskTableExpends = []
          // 调接口，查询导入结果
          this.$http
            .post(
              `/base/instantJob/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
            )
            .then((res) => {
              if (
                res.data.resultType ===
                  'com.datablau.data.common.data.instantjob.ImportInstantJobResult' ||
                res.data.resultType ===
                  'com.datablau.data.common.data.instantjob.FailedInstantJobResult'
              ) {
                this.importTaskResult = res.data
                this.taskTableExpends = [row.jobId]
              } else {
                this.importTaskResult.resultType = ''
                this.importTaskResult = JSON.parse(res.data.errorMessage)
                this.importTaskResult.resultType = res.data.resultType
                this.taskTableExpends = [row.jobId]
              }
            })
        }
      }
    },
    // table 上加了一个自定义的 row-class-name，用来判断是否展示“展开”图标
    getRowClassName({ row, rowIndex }) {
      if (
        this.taskTabName === 'import' &&
        (row.stage === 'FINISHED' || row.stage === 'FAILED')
      )
        return 'show-expand'
      return 'hide-expand'
    },
    // 删除任务
    deleteThis(row) {
      let deleteRequest
      if (this.taskTabName === 'import') {
        deleteRequest = this.$http?.post(
          `/base/instantJob/deleteImportJob?name=${row.jobName}&jobId=${row.jobId}`
        )
      } else {
        deleteRequest = this.$http?.post(
          `/base/instantJob/deleteJob?name=${encodeURI(row.jobName)}&jobId=${
            row.jobId
          }`
        )
      }
      if (deleteRequest instanceof Promise) {
        deleteRequest
          .then((res) => {
            this.getJobs()
          })
          .catch((e) => {
            this.$showFailure(e)
          })
      }
    },
    handleSearch() {
      if (this.keyword) {
        this.$router.push({
          name: 'searchForDam',
          query: { keyword: this.keyword },
        })
        this.$bus.$emit('searchForDam', this.keyword)
      }
    },
    handleDevCommand(command) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      switch (command) {
        case 'productDocument':
          this.openDocument()
          break
        case 'commonComponentDocument':
          window.open(baseUrl + 'commonComponentDocument', '_blank')
          break
        case 'frontendDevelopmentDocument':
          window.open(baseUrl + 'frontendDevelopmentDocument', '_blank')
          break
        default:
          break
      }
    },
    openDocument() {
      this.$bus.$emit('open-document')
    },
    skip2Noti() {
      this.$emit('openUserModal', 'message')
    },
    getNoti() {
      this.$http
        .get(
          `/base/notifications/getNotificationsByPage?pageSize=1&currentPage=0&inbox=true&isRead=false&sort=desc&orderBy=createdOn`
        )
        .then((res) => {
          this.unReadNotiCount = res.data.totalItems
        })
        .catch((e) => {
          console.log(e)
        })
    },
    pollingCheckNoti() {
      this.pollingTimer = setTimeout(() => {
        this.getNoti()
        this.pollingCheckNoti()
      }, 1000 * 30)
    },
    showInfo() {
      this.$bus.$emit('showVersionMessage')
    },
    handleDownlogEnter() {
      this.hidenDropdown = false
      this.showLogLoading = 'start'
      this.popoverThemevisible = false
      this.getLogs()
    },
    handleDownlogLeave() {
      this.hidenDropdown = true
    },
    handleCommand(command) {
      switch (command) {
        case 'user':
          // 点击工作台时 不让语言和主题菜单显示
          this.userLock = true
          clearTimeout(this.userLockTimer)
          this.userLockTimer = setTimeout(() => {
            this.userLock = false
          }, 200)
          this.$bus.$emit('clearHighlightTopNav')
          this.openUserModal()
          break
        case 'logout':
          this.logout()
          break
        case 'changeProduct':
          this.changeProduct()
          break
        case 'allLogs':
          this.$downloadFilePost(`/base/logs/getAllLogs`)
          break
        case 'help':
          window.open('http://www.datablau.cn/FQA')
          break
        case 'error':
          this.$parent.$parent.showMessageList = true
          break
        case 'version':
          this.showInfo()
          break
        case 'language':
          this.popoverLanguagevisible = true
          break
        case 'theme':
          this.popoverThemevisible = true
          break
        case 'themeChange':
          break
        default:
          break
      }
    },
    openUserModal() {
      this.$emit('openUserModal')
    },
    getLogs() {
      this.$http
        .get('/base' + '/service/logs/')
        .then((res) => {
          this.showLogLoading = 'finished'
          const arr = []
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach((item) => {
              const obj = {
                name: item.slice(0, -4),
                fullName: item,
              }
              arr.push(obj)
            })
          }
          if (this.$isAdmin || this.$auth.SYSTEM_SETUP_VIEW) {
            arr.unshift({
              name: 'all',
              fullName: this.$t('common.bucket.allLogs'),
            })
          }
          this.logsArr = arr
        })
        .catch((e) => {
          this.$showFailure(e)
          this.showLogLoading = 'finished'
        })
    },
    handleDownloadLog(log) {
      let url = `/base/service/logs/single/${log.name}`
      if (log.name === 'all') {
        // 下载所有日志
        url = `/base/service/logs/all`
      }
      this.$downloadFile(url)
    },
    handleHideDropdown(show) {
      if (!show) {
        this.showLogLoading = 'notstart'
      }
      if (!show) {
        this.popoverLanguagevisible = false
        this.popoverThemevisible = false
      }
    },
    logout() {
      // window.localStorage.setItem('fromDam',false)
      let requestUrl = '/gateway/logout'
      this.$http.post(requestUrl).then(() => {
        window.sessionStorage.setItem('showLicNotify', 'false')
        if (window.setting.ssoLoginUrl) {
          window.$ssoLogin(true)
        } else {
          location.href = '../base-app/datablau.html'
        }
      })
    },
    changeProduct() {
      location.href = '../base-app/datablau.html'
    },
    getDisplayName() {
      this.stablePromise.getUserInfo().then((data) => {
        this.displayName = data.fullname
        this.hasLogAuth = data.roles?.includes('SYSTEM_SETUP_VIEW')
        this.globalSearchAuth = data.roles?.includes('GLOBAL_SEARCH_MANAGE')
      })
    },
  },
  computed: {
    userNameDisabled() {
      const name = this.displayName
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = name
      $(document.body).append(span)
      const width = $(span).css('width')
      span.remove()
      return parseInt(width) < 48
    },
    tableHeight() {
      const maxHeight =
        document.getElementsByTagName('body')[0].clientHeight - 136
      if (this.taskData) {
        const allDataHeight = this.taskData.length * 40 + 42
        return allDataHeight > maxHeight
          ? maxHeight
          : allDataHeight < 300
          ? 300
          : allDataHeight
      }
    },
  },
}
