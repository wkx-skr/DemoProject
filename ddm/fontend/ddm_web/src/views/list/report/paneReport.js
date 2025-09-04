import HTTP from '@/resource/http'
import moment from 'moment'
import $ from 'jquery'
import html2pdf from 'html2pdf.js'
import LDMTypes from '@constant/LDMTypes'

export default {
  components: {},
  props: {
    detail: {
      required: true,
      type: Object
    },
    currentReport: {
      required: true,
      type: Object
    },
    path: {
      required: true
    },
    versions: {
      require: true
    },
    modelId: {},
    hideList: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      reportBody: {},
      imgSrc: require('./approved-seal.svg'),
      imgSrc1: require('./yes.svg'),
      imgSrc2: require('./no.svg'),
      imgSrc3: require('./rejected.svg'),
      loading: true,
      check: {
        status: [],
        label: [this.$store.state.$v.report.changed, this.$store.state.$v.report.dataD, this.$store.state.$v.report.domain, this.$store.state.$v.report.dataRules, this.$store.state.$v.report.scriptCheck],
        text: [],
        redText: [],
        total: {
          status: true,
          title: '',
          text: ''
        }
      },
      businessDepartment: '',
      damSystem: '',
      writable: this.detail?.permission?.editor,
      checked: false,
      assignee: null,
      currentStatus: {
        status: null,
        approve: '',
        reject: '',
        comment: '',
        user: '',
        isSelf: false,
        currentNode: null
      },
      dialogVisible: false,
      feedbackDialogVisible: false,
      checkTotalRow: 4,
      buttonLock: false,
      failedMsg: '',
      designListPromise: false,

      currentTitle: '',
      currentPath: '',
      outGoingFlows: [],
      subStep: '', // 选中的 审批结果
      lang: window.lang
    }
  },
  beforeMount () {
    if (window.lang === 'English') {
      this.imgSrc = require('./pass_en.svg')
      this.imgSrc3 = require('./rejected_en.svg')
    }
    if (!this.path && this.detail.name && this.detail.name.indexOf('/') > -1) {
      this.currentPath = this.detail.name
      this.detail.name = this.detail.name.split('/')[2]
    }
    this.moment = moment
  },
  mounted () {
    this.getReportDetail()
  },
  methods: {
    getReportDetail () {
      this.check = {
        status: [],
        label: [this.$store.state.$v.report.changed, this.$store.state.$v.report.dataD, this.$store.state.$v.report.domain, this.$store.state.$v.report.dataRules, this.$store.state.$v.report.scriptCheck],
        text: [],
        redText: [],
        total: {
          status: true,
          title: '',
          text: ''
        }
      }
      let data = this.currentReport
      this.reportBody = data
      this.businessDepartment = data.businessDepartment
      this.damSystem = data.damSystem
      this.currentStatus.status = data.state
      this.formatCheckReport(data)
      this.loading = false
      this.getProcess()
    },
    updateModelReport () {
      this.$emit('updateModelReport', this.currentReport.id)
    },
    formatCurrentStatus (data) {
      if (data.tasks) {
        this.currentStatus.isSelf = false
        let userStr = ''
        data.tasks.sort((a, b) => {
          return parseInt(a.taskDefinitionKey.split('_')[1] + a.taskDefinitionKey.split('_')[2]) - parseInt(b.taskDefinitionKey.split('_')[1] + b.taskDefinitionKey.split('_')[2])
        })
        let lock = false
        data.tasks.forEach((item, i) => {
          let outGoingFlows = item.outGoingFlows
          if (outGoingFlows) {
            // 是当前用户审批时
            userStr = userStr === '' ? userStr + item.assignee : userStr + ',' + item.assignee
            // 是审批用户
            let userArr = item.assignee.split(',')
            if (userArr.indexOf(this.$store.state.user.name) > -1 && !lock) {
              // 为了有多个审批时，从第一个开始
              lock = true
              this.currentStatus.isSelf = true
              this.outGoingFlows = outGoingFlows
              this.currentStatus.currentNode = item
              this.currentStatus.comment = ''
              this.currentTitle = item.title
            }
          }
          if (item.endTime) {
            item.date = moment(item.endTime).format(window.lang === 'English' ? 'YYYY-MM-DD ' : 'YYYY年MM月DD日')
            if (item.param && item.param.result) {
              item.comment = `[${item.param.result}] ${item.param.opinion}`
            }
          }
        })
        // 去重
        let users = [...new Set(userStr.split(','))].join(',')
        this.currentStatus.user = users
        let tasks = data.tasks
        this.assignee = tasks
      }
      this.$nextTick(() => {
        // 没有权限并且不是审批人, 退到上一页
        let permission = this.detail.permission || {}
        // if (!this.currentStatus.isSelf && !permission.admin && !permission.editor && !permission.viewer) {
        //   this.$goBack()
        // }
        setTimeout(() => {
          this.loading = false
        }, 100)
      })
    },
    approve () {
      this.handleProcess(this.currentStatus.approve, true)
    },
    handleFeedback (promise) {
      this.feedbackDialogVisible = true
      this.designListPromise = promise
    },
    feedbackReject () {
      this.designListPromise().then(() => {
        this.reject()
      })
    },
    reject () {
      this.handleProcess(this.currentStatus.reject, false)
    },
    judge () {
      this.dialogVisible = true
    },
    getWorkflow () {
      const reportId = this.currentReport.id
      HTTP.getWorkflowOfReport({
        reportId: reportId
      })
        .then(data => {
          this.formatCurrentStatus(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getProcess () {
      this.getWorkflow()
    },
    launchWorkflowOfReport () {
      this.buttonLock = true
      const reportId = this.currentReport.id
      HTTP.launchWorkflowOfReport({
        reportId: reportId,
        successCallback: data => {
          this.$message.success(this.$store.state.$v.report.apply1)
          this.updateModelReport()
        },
        finallyCallback: () => {
          this.buttonLock = false
        }
      })
    },
    handleJudgeClose () {
      this.currentStatus.comment = ''
      this.dialogVisible = false
    },
    handleProcess () {
      let nextFlow = this.outGoingFlows.find(item => item.id === this.subStep)
      nextFlow = nextFlow.id
      if (!nextFlow) {
        return
      }
      this.buttonLock = true
      this.$http.post(this.$url + '/service/workflow/model/report/task/complete', {
        taskId: this.currentStatus.currentNode.taskId,
        nextFlow: nextFlow,
        opinion: this.currentStatus.comment
      }).then(() => {
        this.updateModelReport()
        this.dialogVisible = false
        this.feedbackDialogVisible = false
      }).catch((e) => {
        this.$showFailure(e)
      }).finally(() => {
        this.buttonLock = false
      })
    },
    setProcess () {
      this.$router.push({
        name: 'workflow'
      })
    },
    formatCheckReport1 (data = { added: {}, modified: {}, removed: {} }) {
      let { added, modified, removed } = data
      // 表 80000004
      // 字段 80000005
      // 视图 80500008
      // 键  80000093L
      // 键成员  80500001
      const types = [LDMTypes.Entity, LDMTypes.View, LDMTypes.Attribute, LDMTypes.KeyGroup, LDMTypes.KeyGroupMember]
      let modifyCount = {
        [LDMTypes.Entity]: 0,
        [LDMTypes.View]: 0,
        [LDMTypes.Attribute]: 0,
        [LDMTypes.KeyGroup]: 0,
        [LDMTypes.KeyGroupMember]: 0
      }
      let removeCount = {
        [LDMTypes.Entity]: 0,
        [LDMTypes.View]: 0,
        [LDMTypes.Attribute]: 0,
        [LDMTypes.KeyGroup]: 0,
        [LDMTypes.KeyGroupMember]: 0
      }
      _.forOwn(modifyCount, (value, key) => {
        if (added[key] && added[key].length > 0) {
          modifyCount[key] += added[key].length
        }
        if (modified[key] && modified[key].length > 0) {
          modifyCount[key] += modified[key].length
        }
        if (removed[key] && removed[key].length > 0) {
          modifyCount[key] += removed[key].length
          removeCount[key] += removed[key].length
        }
      })

      let typeLabel = {
        [LDMTypes.Entity]: '表',
        [LDMTypes.View]: '视图',
        [LDMTypes.Attribute]: '字段',
        [LDMTypes.KeyGroup]: '索引',
        [LDMTypes.KeyGroupMember]: '索引成员'
      }

      // console.log(modifyCount, 'modifyCount')
      let countArr = []
      let deleteArr = []
      types.forEach(key => {
        let value = typeLabel[key]
        if (modifyCount[key] > 0) {
          countArr.push(`${modifyCount[key]}个${value}`)
        }
        if (removeCount[key] > 0) {
          deleteArr.push(`${removeCount[key]}个${value}`)
        }
      })

      let text = `共有`
      let redText = `${countArr.join('、')}发生变更`

      this.check.status.push(countArr.length === 0)
      const noChange = countArr.length === 0
      if (noChange) {
        this.check.text.push(this.$store.state.$v.report.noChange)
        this.check.redText.push(``)
      } else {
        this.check.text.push(text)
        this.check.redText.push(redText)
      }
      return {
        tableChanged: modifyCount[LDMTypes.Entity],
        columnChanged: modifyCount[LDMTypes.Attribute]
      }
    },
    formatCheckReport2 (data = {}) {
      let total = data.tableCnt + data.columnCnt
      let missCh = total - data.columnWithChName - data.tableWithChName
      if (missCh) {
        this.check.status.push(false)
        this.check.text.push(`${this.$store.state.$v.report.total} ${total} ${this.$store.state.$v.report.tableAndCol} ${this.$store.state.$v.report.inclue2}`)
        this.check.redText.push(`${missCh}${this.$store.state.$v.report.missCh}`)
        this.check.total.status = false
      } else {
        this.check.status.push(true)
        this.check.text.push(`${this.$store.state.$v.report.total} ${total} ${this.$store.state.$v.report.tableAndCol}`)
        this.check.redText.push(``)
      }
    },
    formatCheckReport3 (data = {}) {
      let hasDomain = data.columnWithPrivateDS + data.columnWithPublicDS
      let columnCnt = data.columnCnt
      if (data) {
        this.check.status.push(true)
        if (columnCnt) {
          this.check.text.push(`${this.$store.state.$v.report.total} ${hasDomain} ${this.$store.state.$v.report.domainRef} ${this.$store.state.$v.report.totalNum} ${String(hasDomain * 100 / columnCnt).split('.')[0]}%`)
        } else {
          this.check.text.push(`${this.$store.state.$v.report.total} ${hasDomain} ${this.$store.state.$v.report.domainRef}`)
        }
        this.check.redText.push(``)
      } else {
        this.check.status.push(false)
        this.check.text.push(`${this.$store.state.$v.report.total} 28 ${this.$store.state.$v.report.domainRef} ${this.$store.state.$v.report.totalNum} 2% ${this.$store.state.$v.report.inclue2}`)
        this.check.redText.push(`5 ${this.$store.state.$v.report.recommandDomain}`)
      }
    },
    formatCheckReport4 (data) {
      if (!data.ruleCheckResult || !data.ruleCheckResult.result || data.ruleCheckResult.result.length === 0) {
        this.check.status.push(true)
        this.check.text.push(`${this.$store.state.$v.report.dataRulePass}`)
        this.check.redText.push(``)
      } else {
        this.check.total.status = false
        this.check.status.push(false)
        this.check.text.push(`${this.$store.state.$v.report.dataRuleWarning}`)
        let warning = 0
        let error = 0
        data.ruleCheckResult.result.forEach(item => {
          if (item.l === 'WARN') {
            warning++
          } else if (item.l === 'ERROR') {
            error++
          }
        })
        this.check.redText.push(`${error} ${this.$store.state.$v.report.error}、${warning} ${this.$store.state.$v.report.warning}`)
      }
    },
    formatCheckReport5 (rawData) {
      let data = rawData.incrementalScriptCompare || {}
      data = _.cloneDeep(data)
      let result = data.result
      let changType = ['added', 'modified', 'removed']
      let objType = ['table', 'column', 'view', 'index']
      let objMap = {
        'table': this.$store.state.$v.report.table,
        'column': this.$store.state.$v.report.column,
        'view': this.$store.state.$v.report.view,
        'index': this.$store.state.$v.report.index
      }
      let changeMap = {
        'addArr': this.$store.state.$v.report.addArr,
        'modifiedArr': this.$store.state.$v.report.modifiedArr,
        'removeArr': this.$store.state.$v.report.removeArr
      }

      if (data.state === 'Generated') {
        let diff = ''
        let formatArr = {
          addArr: [],
          modifiedArr: [],
          removeArr: []
        }
        let changeStr = ''
        let hasDiff = false
        objType.forEach(type => {
          let objNam = objMap[type]
          let changeObj = result[type] || {}
          changType.forEach(changeWay => {
            if (changeObj[changeWay]) {
              hasDiff = true
              if (changeWay === 'added') {
                formatArr.addArr.push(`${changeObj[changeWay]} 个${objNam}`)
              } else if (changeWay === 'modified') {
                formatArr.modifiedArr.push(`${changeObj[changeWay]} 个${objNam}`)
              } else if (changeWay === 'removed') {
                formatArr.removeArr.push(`${changeObj[changeWay]} 个${objNam}`)
              }
            }
          })
        })
        if (hasDiff) {
          diff = this.$store.state.$v.report.inScript
          let arr = []
          for (let key in formatArr) {
            if (formatArr[key].length > 0) {
              arr.push(changeMap[key] + formatArr[key].join('，'))
            }
          }
          changeStr = diff + arr.join('，')
        }
        if (diff) {
          diff = diff.slice(0, -1)
          this.check.status.push(false)
          this.check.text.push(`${this.$store.state.$v.report.scriptTip1}`)
          this.check.redText.push(changeStr)
        } else {
          this.check.status.push(true)
          this.check.text.push(`${this.$store.state.$v.report.scriptTip2}`)
          this.check.redText.push(``)
        }
      } else if (data.state === 'Failed') {
        this.check.status.push(false)
        this.check.text.push(`${this.$store.state.$v.report.scriptTip3}`)
        this.check.redText.push(data.msg)
      } else {
        this.check.status.push(false)
        this.check.text.push(`${this.$store.state.$v.report.scriptTip4}`)
      }
    },
    formatCheckReport (rawData) {
      let change = this.formatCheckReport1(rawData.incrementalReport)
      if (rawData.globalReport) {
        this.formatCheckReport2(rawData.globalReport)
        this.formatCheckReport3(rawData.globalReport)
        this.formatCheckReport4(rawData.incrementalReport)
      }
      let data = true
      if (['Oracle', 'DB2LUW', 'MySQL'].includes(this.detail.modelType)) {
        // this.checkTotalRow = 5
        this.formatCheckReport5(rawData)
      }
      if (this.check.total.status) {
        this.check.total = {
          status: true,
          title: this.$store.state.$v.report.allPass,
          text: window.lang === 'English' ? 'No issues.' : `${this.$store.state.$v.report.attendModel}${change.tableChanged} ${this.$store.state.$v.report.numTable}、${change.columnChanged} ${this.$store.state.$v.report.noQuestion}`
        }
      } else {
        this.check.total = {
          status: false,
          title: this.$store.state.$v.report.notPass,
          text: window.lang === 'English' ? this.$store.state.$v.report.checkInfo : `${this.$store.state.$v.report.attendModel}${change.tableChanged} ${this.$store.state.$v.report.numTable}、${change.columnChanged} ${this.$store.state.$v.report.numCol} ${this.$store.state.$v.report.checkInfo}`
        }
      }
      this.checked = true
      // 模型生成失败
      if (rawData.state === 'Failed') {
        this.check.total = {
          status: false,
          title: this.$store.state.$v.report.modelFailed,
          text: ``
        }
        this.failedMsg = rawData.message
        this.checked = false
      }
    },
    generate () {
      $('.report-box .title').css('white-space', 'normal')
      let opt = {
        margin: 15,
        filename: this.reportBody.name + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          width: 1080,
          height: 1600
        }
      }
      html2pdf().set(opt).from($('.report-box')[0]).save()
      setTimeout(() => {
        $('.report-box .title').css('white-space', 'nowrap')
      }, 400)
    },
    checkModel () {
      this.$router.push({
        name: 'list',
        query: {
          id: this.modelId
        }
      })
    },
    scanDetail (index) {
      let permission = this.detail.permission || {}
      if (!permission.admin && !permission.editor && !permission.viewer) {
        this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
        return
      }
      switch (index) {
        case 1: // change
          this.$emit('scan-change', this.currentReport)
          break
        case 2: // dic
          this.$emit('scan-detail', this.currentReport)
          break
        case 3: // domain
          this.$emit('scan-domain', this.currentReport)
          break
        case 5: // sql
          if (this.check.label[parseInt(index - 1)] === '脚本一致' || this.check.label[parseInt(index - 1)].indexOf('Scripts are consistency') > -1) {
            this.showScriptDetail()
          }
          break
        // case 5:
        case 4: // check
        default:
          this.$emit('scan-detail', this.currentReport)
          break
      }
    },
    showScriptDetail (check) {
      this.$emit('show-script-detail', this.reportBody)
    }
  },
  computed: {
    commentNotEmpty () {
      const word = this.currentStatus.comment.trim()
      return !!word
    },
    showSkip2Model () {
      let permission = this.detail.permission
      return this.hideList && (permission.admin || permission.editor || permission.viewer)
    }
  },
  watch: {
    currentReport () {
      this.$nextTick(this.getReportDetail)
    }
  }
}
