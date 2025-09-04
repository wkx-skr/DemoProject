import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
export default {
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    spanWithTooltip,
  },
  data() {
    return {
      keyword: '',
      unReadNotiCount: 0,
      pollingTimer: null,
      logsArr: [],
      hidenDropdown: true,
      showLogLoading: 'notstart',
      gatewayEnable: window.setting.gatewayEnable,
      otherProduct:
        window.setting.servicesAlive.ddm || window.setting.servicesAlive.ddd,
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
    }
  },
  mounted() {
    this.taskTabName = 'import'
    this.getNoti()
    this.pollingCheckNoti()
    this.$bus.$on('getInfication', this.getNoti)
    this.$bus.$on('getTaskJobResult', this.getTaskJobResult)
  },
  beforeDestroy() {
    this.$bus.$off('getTaskJobResult', this.getTaskJobResult)
    this.$bus.$off('getInfication', this.getNoti)
  },
  methods: {
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
          this.$url +
            `/service/instant_job/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
        )
        .then(res => {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl + `main/meta?objectId=${res.data.objectId}&isQuality=true`
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getJobs() {
      this.$http
        .post(
          this.$url +
            `/service/instant_job/getJobs/type?type=${this.taskTabName.toUpperCase()}`
        )
        .then(res => {
          this.taskData = res.data
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
          this.taskData.forEach(element => {
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
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getJobStatus(ele) {
      this.$http
        .post(
          this.$url +
            `/service/instant_job/getJobStatus?name=${ele.jobName}&jobId=${ele.jobId}`
        )
        .then(res => {
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
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 关闭任务弹窗
    closeTask() {
      this.taskId = null
      Object.keys(this.eventInterval).forEach(k => {
        clearInterval(this.eventInterval[k])
      })
      this.taskTableExpends = []
      this.taskPopover = false
    },
    // 下载 导出的文件
    scanResult(row) {
      this.$http
        .post(
          this.$url +
            `/service/instant_job/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
        )
        .then(res => {
          const url =
            this.$url + '/service/files/' + res.data.fileId + '/download'
          this.$downloadFile(url)
        })
        .then(() => {
          this.closeTask()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // table  row-click 回调
    handleRowClick(row, column) {
      if (
        this.taskTabName === 'import' &&
        row.stage === 'FINISHED' &&
        column.label !== '操作'
      ) {
        this.handleTableExpand(row)
      }
    },
    // table expand-change 回调
    handleTableExpand(row) {
      if (this.taskTabName === 'import' && row.stage === 'FINISHED') {
        if (this.taskTableExpends[0] === row.jobId) {
          this.taskTableExpends = []
        } else {
          this.taskTableExpends = []
          // 调接口，查询导入结果
          this.$http
            .post(
              this.$url +
                `/service/instant_job/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
            )
            .then(res => {
              console.log(JSON.parse(res.data.errorMessage))
              this.importTaskResult = JSON.parse(res.data.errorMessage)
              this.taskTableExpends = [row.jobId]
            })
        }
      }
    },
    // table 上加了一个自定义的 row-class-name，用来判断是否展示“展开”图标
    getRowClassName({ row, rowIndex }) {
      if (this.taskTabName === 'import' && row.stage === 'FINISHED')
        return 'show-expand'
      return 'hide-expand'
    },
    // 删除任务
    deleteThis(row) {
      let deleteRequest
      if (this.taskTabName === 'import') {
        deleteRequest = this.$http.post(
          this.$url +
            `/service/instant_job/deleteImportJob?name=${row.jobName}&jobId=${row.jobId}`
        )
      } else {
        deleteRequest = this.$http.post(
          this.$url +
            `/service/instant_job/deleteJob?name=${row.jobName}&jobId=${row.jobId}`
        )
      }
      if (deleteRequest instanceof Promise) {
        deleteRequest
          .then(res => {
            this.getJobs()
          })
          .catch(e => {
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
      this.$router.push({
        name: 'userModal',
        query: {
          currentNav: 'message',
        },
      })
      this.$bus.$emit('clearHighlightTopNav')
    },
    getNoti() {
      this.$http
        .get(
          `${this.$url}/service/notification/page/?pageSize=100&currentPage=0&inbox=true&isRead=false&sort=desc&orderBy=createdOn`
        )
        .then(res => {
          const startTime = new Date().getTime() - 1000 * 60 * 60 * 24
          const notiArr = res.data.content
          const resultArr = []
          if (notiArr && Array.isArray(notiArr) && notiArr.length > 0) {
            notiArr.forEach(item => {
              if (item.lastModification > startTime && !item.read) {
                resultArr.push(item)
              }
            })
          }
          this.unReadNotiCount = resultArr.length
        })
        .catch(e => {
          console.log(e)
        })
    },
    pollingCheckNoti() {
      this.pollingTimer = setTimeout(() => {
        this.getNoti()
        this.pollingCheckNoti()
      }, 1000 * 60 * 5)
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
      this.$router.push({ name: 'userModal' })
    },
    getLogs() {
      this.$http
        .get(this.$url + '/service/logs/')
        .then(res => {
          this.showLogLoading = 'finished'
          const arr = []
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
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
        .catch(e => {
          this.$showFailure(e)
          this.showLogLoading = 'finished'
        })
    },
    handleDownloadLog(log) {
      let url = `${this.$url}/service/logs/single/${log.name}`
      if (log.name === 'all') {
        // 下载所有日志
        url = `${this.$url}/service/logs/all`
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
      let requestUrl
      if (this.gatewayEnable) {
        requestUrl = '/gateway/logout'
      } else {
        requestUrl = this.$url + '/service/j_spring_security_logout'
      }
      this.$http
        .post(requestUrl)
        .then(() => {
          if (this.gatewayEnable) {
            if (window.setting.ssoLoginUrl) {
              window.$ssoLogin(true)
            } else {
              location.href = './datablau.html?product=ddd'
            }
          } else {
            if (window.setting.ssoLoginUrl) {
              window.$ssoLogin(true)
            } else {
              location.href = './datablau.html'
            }
          }
        })
        .catch(() => {
          if (!this.gatewayEnable) {
            if (window.setting.ssoLoginUrl) {
              window.$ssoLogin(true)
            } else {
              location.href = './datablau.html'
            }
          }
        })
    },
    changeProduct() {
      location.href = '/datablau.html'
    },
    isIE() {
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        return true
      } else {
        return false
      }
    },
    isIE11() {
      if (/Trident\/7\./.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
  },
  computed: {
    displayName() {
      return this.$user.fullname || this.$user.username
    },
    userNameDisabled() {
      const name = this.displayName
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = name
      $(document.body).append(span)
      const width = $(span).css('width')
      if (this.isIE() || this.isIE11()) {
        span.removeNode(true)
      } else {
        span.remove()
      }

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
