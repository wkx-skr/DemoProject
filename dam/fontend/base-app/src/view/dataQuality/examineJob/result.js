import { truncate } from 'lodash'
import * as echarts from 'echarts'
import moment from 'moment'
// import jobRunReport from '@/components/jobManagement/jobRunReport'
import jobRunReport from '@/view/jobScheduler/jobRunReport.vue'
import techRulesFromResult from './techRulesFromResult'
export default {
  props: ['job', 'historyResult', 'jobListData'],
  components: {
    jobRunReport,
  },
  mixins: [techRulesFromResult],
  data() {
    return {
      showInstanceId: '',
      showTopLine: false,
      showJobsStaPop: false,
      histories: [],
      selectedHistory: null,
      displayRules: null,
      allRules: [],
      problemMap: {},
      totalCntMap: {},
      problemCntMap: {},
      problemRaTio: {},
      errorMap: {},
      dialogVisible: false,
      errorMsg: '',
      cnt: {
        error: 0,
        warning: 0,
        success: 0,
        total: 1,
        successNumber: 0,
        warningNumber: 0,
        errorNumber: 0,
      },
      searchFormData: {
        runResult: '全部',
        ruleName: '',
        countResult: '全部',
      },
      runResultList: [
        {
          label: this.$t('quality.page.qualityExamineJob.runResultList.all'),
          value: '全部',
        },
        {
          label: this.$t(
            'quality.page.qualityExamineJob.runResultList.dataProblems'
          ),
          value: this.$t('quality.page.qualityExamineJob.results.problem'),
        },
        {
          label: this.$t(
            'quality.page.qualityExamineJob.runResultList.noDataProblems'
          ),
          value: this.$t('quality.page.qualityExamineJob.results.good'),
        },
        {
          label: this.$t(
            'quality.page.qualityExamineJob.runResultList.runFailed'
          ),
          value: this.$t('quality.page.qualityExamineJob.results.fail'),
        },
      ],
      hasProblem: false,
      countResultList: [
        {
          label: this.$t('quality.page.qualityExamineJob.countResultList.all'),
          value: '全部',
        },
        {
          label: this.$t('quality.page.qualityExamineJob.countResultList.has'),
          value: 'hasException',
        },
        {
          label: this.$t('quality.page.qualityExamineJob.countResultList.no'),
          value: 'noException',
        },
      ],
      currentJob: {},
      score: '',
      scoreboard: '',
      count: 0,
      showHistoryDialog: false,
      historyTitle: '',
      historyData: [],
      historyLoading: false,
      jobData: '',
      isProblem: false,
      dialogVisibleJobData: false,
      rulesResultArr: {},
      resultPartTitle: this.$t('quality.page.qualityExamineJob.latestResults'),
      jobInstanceId: null,
    }
  },
  filters: {
    bigClassFilter(value, bigClassList) {
      let result = ''
      bigClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
  },
  created() {
    this.$bus.$emit('getRuleType')
  },
  mounted() {
    this.getHistory()
    this.darw()
    if (this.historyResult !== '') {
      this.currentJob = _.cloneDeep(this.historyResult)
      this.mapResult(this.historyResult.result)
    }
  },
  methods: {
    displayValue(value) {
      return Number(value) === -1 ? '-' : value
    },
    checkStatus(status) {
      const finishStatus = ['FAILED', 'FINISHED', 'STOPPED', 'SKIPPED']
      return finishStatus.includes(status)
    },
    showJobLog(row) {
      this.showJobsStaPop = true
      this.showInstanceId = row.id
    },
    darw() {
      var myChart = echarts.init(document.getElementById('darwMain'))
      // 指定图表的配置项和数据
      var chartData = {
        total: 100,
        value: parseInt(this.cnt.success),
      }
      var total = chartData.total
      var value = [chartData.value]
      var color = 'rgba(240,87,91,1)'
      var bgColor = '#F5F5F5'
      var option
      option = {
        backgroundColor: 'transparent',
        title: {
          text: value,
          subtext: this.$t('quality.page.qualityExamineJob.scoreboard'),
          x: 'center',
          y: '27%',
          textStyle: {
            fontSize: 30,
            fontWeight: 'bolder',
            color: '#555555',
          },
          subtextStyle: {
            fontSize: 14,
            fontWeight: 'normal',
            align: 'center',
            color: '#999999',
          },
        },
        angleAxis: {
          max: total,
          clockwise: true, // 逆时针
          // 隐藏刻度线
          show: false,
        },
        radiusAxis: {
          type: 'category',
          show: true,
          axisLabel: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        polar: {
          center: ['50%', '50%'],
          radius: '180%', // 图形大小
        },
        series: [
          {
            stack: 'round',
            type: 'bar',
            data: value,
            showBackground: true,
            coordinateSystem: 'polar',
            roundCap: true,
            barWidth: 10,
            silent: true,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  {
                    offset: 1,
                    color: 'rgba(80, 196, 227, 1)',
                  },
                  {
                    offset: 0,
                    color: 'rgba(167, 234, 220, 1)',
                  },
                ]),
              },
            },
          },
          {
            stack: 'round',
            type: 'bar',
            data: [0.01],
            showBackground: true,
            backgroundStyle: {
              color: bgColor,
              // shadowColor: 'rgba(0, 0, 0, 0.2)',
              // shadowBlur: 10,
              // shadowOffsetY: 2,
            },
            coordinateSystem: 'polar',
            roundCap: true,
            barWidth: 10,
            itemStyle: {
              color: '#fff',
              borderColor: '#fff',
              borderWidth: 0.00001,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10,
              shadowOffsetY: 2,
            },
          },
        ],
      }
      option && myChart.setOption(option)
    },
    // 跳转技术规则
    jumpTotechRuleName(row) {
      this.$http
        .post(this.$quality_url + '/quality/rule/tech/' + row.id + '/check')
        .then(res => {
          window.open(
            this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
              id: row.id,
              blank: true,
            })
          )
        })
        .catch(err => {
          this.$message.error('您暂无权限访问')
        })
    },
    getCurrent(id) {
      this.$http
        .post(`/job/main/query/jobResults/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'id',
              compareValue: id,
              notEqual: false,
            },
          ],
        })
        .then(res => {
          let tempData = res.data.content
          if (tempData.length === 0) {
            this.getMultiPage()
            return
          }
          var result = tempData[0].result
          this.currentJob = _.cloneDeep(tempData[0])
          if (this.job.jobType === '标准核检任务') {
            this.jobInstanceId = id
            this.getJobResultDashboard(id)
            this.getJobResult(id)
          } else {
            this.mapResult(result)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getJobResultDashboard(id) {
      this.$http
        .post(
          this.$quality_url +
            `/quality/dataRule/getJobResultDashboard?jobInstanceId=${id}`
        )
        .then(res => {
          this.cnt.success = res.data.successRatio
          if (this.job.jobType === '标准核检任务') {
            this.darw()
          }
          this.cnt.errorNumber = res.data.failedDataRuleNumber
          this.cnt.warningNumber = res.data.problemDataRuleNumber
          this.cnt.successNumber = res.data.successDataRuleNumber
          this.cnt.exceptionNumber = res.data.exceptionNumber
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getHistory() {
      this.$http
        .post(`/job/main/query/jobResults/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobId',
              compareValue: this.job.jobId,
              notEqual: false,
            },
          ],
        })
        .then(res => {
          this.histories = res.data.content
          let result = Math.max(...res.data.content.map(x => x.id))
          this.getCurrent(result)
          if (res.data.content.length === 0) {
            return
          }
          if (
            this.historyResult.jobId === res.data.content[0].jobId ||
            this.job.jobId === res.data.content[0].jobId
          ) {
            this.resultPartTitle = this.$t(
              'quality.page.qualityExamineJob.latestResults'
            )
          } else {
            this.resultPartTitle = this.$t(
              'quality.page.qualityExamineJob.historicalSituation'
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showSearch() {
      if (this.job.jobType === '标准核检任务') {
        this.multipleCriteria.page.currentPage = 1
        this.getJobResult(this.jobInstanceId)
      } else {
        this.updateMultipleCriteriaByCondition()
      }
    },
    reset() {
      this.$refs.searchForm.resetFields()
      this.showSearch()
    },
    handleHistorySelect(history, index) {
      if (index !== 0) {
        this.resultPartTitle = this.$t(
          'quality.page.qualityExamineJob.historicalSituation'
        )
      } else {
        this.resultPartTitle = this.$t(
          'quality.page.qualityExamineJob.latestResults'
        )
      }
      this.showHistoryDialog = false
      if (this.job.jobType === '标准核检任务') {
        this.jobInstanceId = history.id
        this.getJobResult(history.id)
        this.getJobResultDashboard(history.id)
      }
      if (history === 'current') {
      } else if (history.result) {
        if (this.job.jobType !== '标准核检任务') {
          this.mapResult(history.result)
        }
        this.currentJob = _.cloneDeep(history)
      } else {
        this.currentJob = _.cloneDeep(history)
      }
    },
    exportResult() {
      const id = this.currentJob.id || ''
      if (this.job.jobType === '标准核检任务') {
        const url =
          this.$quality_url +
          `/quality/dataRule/exportJobResult?jobInstanceId=${id}`
        this.$downloadFilePost(url)
      } else {
        const url =
          this.$quality_url + `/quality/rule/result/export?jobResultId=${id}`
        this.$downloadFile(url)
      }
    },
    toBack() {
      // this.$emit('toBackList', this.jobListData)
      this.handleHistorySelect(this.histories[0], 0)
    },
    mapResult(result) {
      if (!result) {
        this.cnt = {
          total: 0,
          error: 0,
          warning: 0,
          success: 0,
        }
        return
      }
      const rulesResultsMap = JSON.parse(result).resultMap
      this.problemMap = {}
      this.totalCntMap = {}
      this.problemCntMap = {}
      this.problemRaTio = {}
      this.cnt.total = 0
      this.cnt.error = 0
      this.cnt.warning = 0
      this.cnt.success = 0
      this.cnt.exception = 0
      this.cnt.errorNumber = 0
      this.cnt.warningNumber = 0
      this.cnt.successNumber = 0
      this.cnt.exceptionNumber = 0
      // 错误数
      this.cnt.error = Object.keys(JSON.parse(result).errorMap).length || 0
      this.cnt.errorNumber =
        Object.keys(JSON.parse(result).errorMap).length || 0

      for (const i in rulesResultsMap) {
        this.cnt.total++
        const v = rulesResultsMap[i]
        this.rulesResultArr[i] = v
        if (Object.keys(JSON.parse(result).errorMap).includes(i)) {
          this.problemMap[i] = '-'
        } else {
          if (v.outputCnt != -1) {
            if (v.outputCnt === 0) {
              this.cnt.success++
              this.cnt.successNumber++
            } else {
              this.cnt.warning++
              this.cnt.warningNumber++
            }
            this.problemMap[i] = v.outputCnt
          } /* else {
            this.cnt.error++
            this.cnt.errorNumber++
            this.problemMap[i] = '-'
          } */
        }
        if (v.totalCnt != -1) {
          this.totalCntMap[i] = v.totalCnt
        } else {
          this.totalCntMap[i] = '-'
        }
        if (v.problemCnt != -1) {
          this.problemCntMap[i] = v.problemCnt
        } else {
          this.problemCntMap[i] = '-'
        }
        if (v.problemRate != -1 && v.problemRate) {
          this.problemRaTio[i] = v.problemRate
        } else {
          this.problemRaTio[i] = '-'
        }
        // 统计异常
        if (v.problemCnt === -1 || v.totalCnt === -1) {
          this.cnt.exception++
          this.cnt.exceptionNumber++
        }
      }
      // 优化性能
      // let list = _.cloneDeep(this.rules);
      this.displayRules = []
      const arr = Object.keys(rulesResultsMap).map(item => parseInt(item))
      this.ruleIds = arr
      this.allRuleIds = arr
      this.getMultiPage()
      // this.handleHasProblemChange()
      this.cnt.error = (this.cnt.error / this.cnt.total) * 100
      this.cnt.success = (this.cnt.success / this.cnt.total) * 100
      this.cnt.warning = (this.cnt.warning / this.cnt.total) * 100

      const rulesErrorMap = JSON.parse(result).errorMap
      this.errorMap = rulesErrorMap
      this.darw()
    },
    showError(msg) {
      if (msg === null) {
        this.errorMsg = `${msg}`
      } else {
        this.errorMsg = msg.replace(/\n/g, '<br>')
      }
      this.dialogVisible = true
    },
    tryParseJSON(value) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    },
    scoreFormatter(value) {
      let count = 0
      if (value !== null) {
        if (this.job.jobType === '标准核检任务') {
          const result = this.tryParseJSON(value)
          return result.successRatio
        } else {
          const result = this.tryParseJSON(value)
          const nameArr = Object.keys(result.resultMap)
          nameArr.forEach(item => {
            if (result.resultMap[item].outputCnt === 0) {
              count += 1
            }
          })
          return parseInt((count / nameArr.length) * 100)
        }
      } else {
        return ''
      }
    },
    showProblems(id) {
      this.$bus.$emit('showJobHistoryResult', {
        jobId: this.job.id,
        historyId: this.currentJob.id,
        ruleId: id,
      })
    },
    showHistory() {
      this.historyTitle =
        `${this.job.name}` +
        this.$t('quality.page.qualityExamineJob.historyTitle')
      this.showHistoryDialog = true
      this.historyData = this.histories
    },
    downloadProblems(id) {
      const jobId = this.job.id
      const historyId = this.currentJob.id
      const ruleId = id
      const url =
        this.$url +
        '/service/quality/job/' +
        jobId +
        '/history/' +
        historyId +
        '/resultfile/' +
        ruleId
      this.$downloadFile(url)
    },
    iconFormat(result) {
      var self = this
      var style = 'icon-header-row '
      if (result === 'N/A') {
        // (result == undefined) {
        return style + 'icon-red ' + 'icon-ic-quality-error'
      } else if (result == 0) {
        return style + 'icon-green ' + 'icon-ic-quality-correct'
      } else {
        return style + 'icon-yellow ' + 'el-icon-question'
      } /* else {
        return style + 'icon-red ' + 'icon-ic-quality-error';
      } */
    },
    dateFormatter(timezone) {
      //      return this.$timeFormatter(timezone);
      return moment(timezone).format('YYYY-MM-DD HH:mm:ss')
    },
    initProblemData() {},
    jumpToIssues(id) {
      if (this.job.jobType === '标准核检任务') {
        var pos = location.href.indexOf('#/')
        var baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + `main/dataQuality/repairJob?name=${id}&type=2`)
      } else {
        this.$http
          .get(
            this.$quality_url +
              `/quality/rule/tasks/detail?ruleId=${id}&jobResultId=${this.currentJob.id}`
          )
          .then(res => {
            this.jobData = _.cloneDeep(res.data)
            this.jobData.writable = true
            this.jobData.directEdit = true
            if (this.jobData.length > 1) {
              this.dialogVisibleJobData = true
            } else {
              var pos = location.href.indexOf('#/')
              var baseUrl = location.href.slice(0, pos + 2)
              window.open(
                baseUrl +
                  `main/dataQuality/repairJob?name=${encodeURIComponent(
                    this.jobData[0].name
                  )}&type=0`
              )
            }
            // this.$emit('showProblemDetail',this.jobData);
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    jumpToJobData(data) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/dataQuality/repairJob?name=${data.name}`)
    },
    typeFormatter(type) {
      switch (type) {
        case 1:
          return '完整性'
        case 2:
          return '一致性'
        case 3:
          return '准确性'
        case 4:
          return '唯一性'
        case 6:
          return '规范性'
        case 7:
          return '有效性'
        default:
          return ''
      }
    },
    importFormatter(value) {
      switch (value) {
        case 1:
          return this.$t('quality.page.qualityExamineJob.importanceList.p1')
        case 2:
          return this.$t('quality.page.qualityExamineJob.importanceList.p2')
        case 3:
          return this.$t('quality.page.qualityExamineJob.importanceList.p3')
        default:
          return ''
      }
    },
    mapFormatter(value) {
      if (value > 0) {
        return this.$t('quality.page.qualityExamineJob.results.problem')
      } else if (value === 0) {
        return this.$t('quality.page.qualityExamineJob.results.good')
      } else {
        return this.$t('quality.page.qualityExamineJob.results.fail')
      }
    },
  },
}
