import jobRunReport from '@/view/jobScheduler/jobRunReport.vue'

export default {
  props: ['jobListData', 'typeState', 'buRuleId'],
  data() {
    return {
      writable: this.$auth.ROLE_DS_ADMIN,
      tableHeight: 100,
      keyword: '',
      jobs: [],
      rawData: [],
      jobsMap: {},
      jobsFiltered: [],
      jobsDisplay: null,
      multipleSelection: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      isSelf: false,
      deleteJobDisabled: true,
      currentJob: {},
      interval: null,
      done: true,
      jobStatus: {},
      lastClicked: undefined,
      lastClickedShown: false,

      dataLoading: false,
      allowTableLoading: true,

      showJobsStaPop: false,
      jobStaData: [],
      checkStaJobId: null,
      autoRefresh: true,
      timeout: null,
      timeoutWeird: null,
      stopDisabled: true,
      tableKey: 0,
      showHistoryDialog: false,
      historyTitle: '',
      historyData: [],
      historyLoading: false,
      historyId: '',
      runCycleArr: [
        {
          value: '全部',
          label: this.$t('quality.page.qualityExamineJob.selectPeriod.all'),
        },
        {
          value: '不重复',
          label: this.$t(
            'quality.page.qualityExamineJob.selectPeriod.noRepeat'
          ),
        },
        {
          value: '每天',
          label: this.$t(
            'quality.page.qualityExamineJob.selectPeriod.everyday'
          ),
        },
        {
          value: '每周',
          label: this.$t('quality.page.qualityExamineJob.selectPeriod.weekly'),
        },
        {
          value: '每月',
          label: this.$t('quality.page.qualityExamineJob.selectPeriod.monthly'),
        },
        {
          value: '每季',
          label: this.$t(
            'quality.page.qualityExamineJob.selectPeriod.quarterly'
          ),
        },
        {
          value: '每年',
          label: this.$t('quality.page.qualityExamineJob.selectPeriod.yearly'),
        },
        {
          value: '暂不调度',
          label: this.$t(
            'quality.page.qualityExamineJob.selectPeriod.schedulings'
          ),
        },
        {
          value: '自定义',
          label: this.$t('quality.page.qualityExamineJob.selectPeriod.custom'),
        },
      ],
      runCycleObj: {
        不重复: this.$t('quality.page.qualityExamineJob.selectPeriod.noRepeat'),
        每天: this.$t('quality.page.qualityExamineJob.selectPeriod.everyday'),
        每周: this.$t('quality.page.qualityExamineJob.selectPeriod.weekly'),
        每月: this.$t('quality.page.qualityExamineJob.selectPeriod.monthly'),
        每季: this.$t('quality.page.qualityExamineJob.selectPeriod.quarterly'),
        每年: this.$t('quality.page.qualityExamineJob.selectPeriod.yearly'),
        暂不调度: this.$t(
          'quality.page.qualityExamineJob.selectPeriod.schedulings'
        ),
        自定义: this.$t('quality.page.qualityExamineJob.selectPeriod.custom'),
      },
      runCycle: '',
      systemList: [],
      dataTime: [],
      systemValue: '',
      hasRun: false,
      creator: '',
      nameMapping: {},
      dataQualityDelete: ['jobStaData', 'jobs', 'jobsDisplay', 'systemList'],
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      statusList: {
        FINISHED: this.$t('quality.page.qualityExamineJob.statusList.FINISHED'),
        RUNNING: this.$t('quality.page.qualityExamineJob.statusList.RUNNING'),
        // FAILED: '失败',
        NOT_RUN: this.$t('quality.page.qualityExamineJob.statusList.NOT_RUN'),
        INIT: this.$t('quality.page.qualityExamineJob.statusList.INIT'),
        CREATED: this.$t('quality.page.qualityExamineJob.statusList.CREATED'),
        FAILED: this.$t('quality.page.qualityExamineJob.statusList.FAILED'),
        STOPPED: this.$t('quality.page.qualityExamineJob.statusList.STOPPED'),
        SKIPPED: this.$t('quality.page.qualityExamineJob.statusList.SKIPPED'),
      },
      paginationShow: true,
      eventInterval: null,
      jobInstanceId: '',
      eventIntervals: {},
      currentStep: null,
      showTop: false,
      typeOption: [],
      jobTypeName: '',
    }
  },
  components: {
    jobRunReport,
  },
  created() {
    this.$getModelCategories()
  },
  mounted() {
    this.creator = this.$user.username
    // this.systemList = this.$modelCategories.filter(e => e.canQuery === 1)
    this.systemList = _.cloneDeep(this.$modelCategories)
    setTimeout(() => {
      this.resize()
    })
    $(window).resize(this.resize)
    this.allowTableLoading = true
    if (Object.keys(this.jobListData).length !== 0) {
      this.isSelf = this.jobListData.isSelf
      this.pageSize = this.jobListData.pageSize
      this.currentPage = this.jobListData.currentPage
      this.systemValue = this.jobListData.systemValue
      this.creator = this.jobListData.creator
      this.dataTime = this.jobListData.dataTime
      this.keyword = this.jobListData.keyword
      this.runCycle = this.jobListData.runCycle
      this.paginationShow = false
    } else {
      this.isSelf = !this.$auth.QUALITY_CHECK_TASK_VIEW_ALL
    }
    this.getJobs()
    this.$bus.$on('jobsLoaded', () => {
      this.changeDisplay()
    })
    if (this.$versionFeature.domain_DataRule) {
      this.getTypeOption()
    }
  },
  beforeDestroy() {
    this.$bus.$off('jobsLoaded')
    clearTimeout(this.timeout)
    $(window).unbind('resize', this.resize)
    setTimeout(() => {
      this.dataQualityDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
    for (let key in this.eventIntervals) {
      clearInterval(this.eventIntervals[key])
    }
  },
  watch: {
    keyword() {
      this.filterJobByKeyword()
    },
  },
  methods: {
    getJobTypeName(type) {
      return type === '数据质量-检核任务' ? '质量核检任务' : '标准核检任务'
    },
    getTypeOption() {
      this.typeOption = []
      this.$http
        .post(this.$quality_url + '/quality/jobs/getTypeOption')
        .then(res => {
          for (let key in res.data) {
            this.typeOption.push({
              label: key,
              value: res.data[key],
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCommand(type) {
      if (type === 'dataQualityAdd') {
        this.addJob()
      } else {
        this.$emit('addJobDomain')
      }
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleAutoRefreshChange() {
      let text = ''
      if (this.autoRefresh) {
        text = this.$t('quality.page.qualityExamineJob.autoRefresh1')
      } else {
        text = this.$t('quality.page.qualityExamineJob.autoRefresh2')
      }
      this.$message.info(text)
    },
    getScheduleTime(scheduleInCron) {
      try {
        const scheduleString = scheduleInCron.split(':')
        const expressionFormat = scheduleString[0]
        let cron = null
        if (expressionFormat === 'cron') {
          cron = scheduleString[1]
          const cronFormatted = cron.split(' ')
          if (cronFormatted[3] !== '?') {
          } else {
            return '每周'
          }
          if (cronFormatted[4] === '*' && cronFormatted[5] === '?') {
            if (cronFormatted[3] === '*') {
              return '每天'
            } else {
              return '每月'
            }
          } else if (cronFormatted[4].includes(',')) {
            return '每季'
          } else if (cronFormatted.length === 7) {
            if (cronFormatted[6] === '*') {
              return '每年'
            } else {
              return '不重复'
            }
          }
        } else {
          return '不重复'
        }
      } catch (e) {
        console.error('cron格式化错误')
      }
    },
    resize() {
      const tableDom = $('.table-row')[0]
      if (!tableDom || tableDom.offsetHeight === 0) {
        return
      }
      this.tableHeight = tableDom.offsetHeight
    },
    handleRowClick(row, column, evt) {
      if (evt.target.className.includes('el-switch')) {
        return
      }
      const rule = _.cloneDeep(row)
      rule.writable = this.writable
      rule.directEdit = false
      this.$bus.$emit('editJob', rule)
    },
    editJob($index) {
      this.currentJob = _.cloneDeep(this.jobsDisplay[$index])
      this.currentJob.writable = true
      this.currentJob.directEdit = true
      //      this.currentJob.writable = this.$user.username === this.currentJob.creator;
      var jobListData = {
        creator: this.creator,
        keyword: this.keyword,
        systemValue: this.systemValue,
        runCycle: this.runCycle === '全部' ? '' : this.runCycle,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        dataTime: this.dataTime,
        isSelf: this.isSelf,
      }
      this.$bus.$emit('editJob', this.currentJob, jobListData)
    },
    showJobResult(row) {
      if (this.typeState !== 'rules') {
        var jobListData = {
          creator: this.creator,
          keyword: this.keyword,
          systemValue: this.systemValue,
          runCycle: this.runCycle === '全部' ? '' : this.runCycle,
          pageSize: this.pageSize,
          currentPage: this.currentPage,
          dataTime: this.dataTime,
          isSelf: this.isSelf,
        }
        this.currentJob = _.cloneDeep(row)
        this.$bus.$emit('showJobResult', this.currentJob, jobListData)
      } else {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl(
          'qualityExamineJob',
          {
            id: row.jobId,
          }
        )
        window.open(pageUrl)
      }
    },
    showJobResult2(index) {
      var jobListData = {
        creator: this.creator,
        keyword: this.keyword,
        systemValue: this.systemValue,
        runCycle: this.runCycle === '全部' ? '' : this.runCycle,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        dataTime: this.dataTime,
        isSelf: this.isSelf,
      }
      this.$bus.$emit(
        'showJobResult2',
        _.cloneDeep(this.jobsDisplay[this.historyId]),
        jobListData
      )
      this.$emit('historyData', this.historyData[index])
      this.showHistoryDialog = false
    },
    showHistory(index) {
      this.historyId = index
      this.historyTitle =
        `${this.jobsDisplay[index].name}` +
        this.$t('quality.page.qualityExamineJob.historyTitle')
      this.historyTable(this.jobsDisplay[index].jobId)
      this.showHistoryDialog = true
    },
    historyTable(id) {
      this.historyLoading = true
      this.$http
        .get(this.$url + `/service/datablau_jobs/${id}/history`)
        .then(res => {
          this.historyData = res.data
          this.historyLoading = false
        })
        .catch(e => {
          this.historyLoading = false
        })
    },
    scoreFormatter(value) {
      let count = 0
      if (value !== null && value !== undefined) {
        const result = JSON.parse(value)
        const nameArr = Object.keys(result.resultMap)
        nameArr.forEach(item => {
          if (result.resultMap[item].outputCnt === 0) {
            count += 1
          }
        })
        return parseInt((count / nameArr.length) * 100)
      } else {
        return ''
      }
    },
    expend(val) {
      if (val < 0) {
        return ''
      } else {
        return val / 1000 + '秒'
      }
    },
    addJob() {
      var jobListData = {
        creator: this.creator,
        keyword: this.keyword,
        systemValue: this.systemValue,
        runCycle: this.runCycle === '全部' ? '' : this.runCycle,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        dataTime: this.dataTime,
        isSelf: this.isSelf,
      }
      this.$bus.$emit('addJob', jobListData)
    },
    searchTab() {
      this.currentPage = 1
      this.getJobs()
    },
    reset() {
      this.keyword = ''
      this.runCycle = ''
      this.systemValue = ''
      this.dataTime = []
      this.getJobs()
    },
    tryParseJSON(value) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    },
    getJobs() {
      this.dataLoading = true
      const requestBody = {
        creator: this.isSelf ? this.creator : '',
        name: this.keyword,
        modelCategoryId: this.systemValue,
        runCycle: this.runCycle === '全部' ? '' : this.runCycle,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        startTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        endTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
        jobType: this.jobTypeName,
      }
      if (this.$route.query.id && this.$route.name !== 'dataQualityRules') {
        requestBody.jobId = this.$route.query.id
        requestBody.pageSize = 2000
      }
      if (this.typeState === 'rules') {
        requestBody.buRuleId = this.buRuleId
      }
      this.$http
        .post(this.$quality_url + '/quality/jobs/', requestBody)
        .then(res => {
          this.hasRun = false
          this.dataLoading = false
          this.rawData = res.data.content
          this.total = res.data.totalElements
          this.jobsDisplay = res.data.content
          this.jobsDisplay.forEach(element => {
            if (element.jobType === '标准核检任务') {
              let result =
                element.lastRunStatus !== 'FAILED' &&
                element.lastRunStatus !== 'NOT_RUN' &&
                element.lastRunResult
                  ? this.tryParseJSON(element.lastRunResult)
                  : ''
              let failedDataRuleNumber = 0
              let problemDataRuleNumber = 0
              let successDataRuleNumber = 0
              if (result) {
                if (element.lastRunResult) {
                  let lastRunResultJson = this.tryParseJSON(
                    element.lastRunResult
                  )
                  failedDataRuleNumber = lastRunResultJson.failedDataRuleNumber
                  problemDataRuleNumber =
                    lastRunResultJson.problemDataRuleNumber
                  successDataRuleNumber =
                    lastRunResultJson.successDataRuleNumber
                }
              }
              element.lastRunFailedNumber = failedDataRuleNumber
              element.lastRunErrorNumber = problemDataRuleNumber
              element.lastRunNoErrorNumber = successDataRuleNumber
              let obj = this.progressWidth([
                element.lastRunFailedNumber || 0,
                element.lastRunErrorNumber || 0,
                element.lastRunNoErrorNumber || 0,
              ])
              element.lastResult = obj
            } else {
              let result =
                element.lastRunStatus !== 'FAILED' &&
                element.lastRunStatus !== 'NOT_RUN' &&
                element.lastRunResult
                  ? JSON.parse(element.lastRunResult)
                  : ''
              element.lastRunFailedNumber = result
                ? Object.keys(result.errorMap).length
                : 0
              let proNum = 0
              let noProNum = 0
              if (result) {
                let tempResMap = _.cloneDeep(result.resultMap)
                for (let res in tempResMap) {
                  if (Object.keys(result.errorMap).includes(res)) {
                  } else {
                    if (tempResMap[res].outputCnt > 0) {
                      proNum += 1
                    } else if (tempResMap[res].outputCnt === 0) {
                      noProNum += 1
                    }
                  }
                }
              }
              element.lastRunErrorNumber = proNum
              element.lastRunNoErrorNumber = noProNum
              let obj = this.progressWidth([
                element.lastRunFailedNumber || 0,
                element.lastRunErrorNumber || 0,
                element.lastRunNoErrorNumber || 0,
              ])
              element.lastResult = obj
            }
          })
          this.paginationShow = true
          console.log(this.jobsDisplay, 'this.jobsDisplay')
          const currentStep = {}
          res.data.content.forEach(element => {
            currentStep[element.jobId] = this.$t(
              'quality.page.qualityExamineJob.table.currentStep'
            )
          })
          this.currentStep = currentStep
          if (this.$route.query.id && this.$route.name !== 'dataQualityRules') {
            this.showJobResult(
              res.data.content.filter(
                res => `${res.jobId}` === `${this.$route.query.id}`
              )[0]
            )
          }
          if (
            this.jobsDisplay.filter(
              e => e.status === 'INIT' || e.status === 'RUNNING'
            ).length
          ) {
            // 如果列表里有在跑的任务，每15秒刷新一下列表直到跑完
            clearTimeout(this.timeoutWeird)
            this.timeoutWeird = setTimeout(() => {
              this.getJobs()
            }, 15000)
          }
          let arr2 = []
          this.jobsDisplay.forEach(e => {
            arr2.push(e.creator)
          })
          arr2 = [...new Set(arr2)]
          // this.getUserByIds(arr2)
          if (this.jobs.length === 0) {
            this.jobs = _.cloneDeep(res.data.content)
          }
          // this.$bus.$emit('getInfication');
          this.rawData.forEach(job => {
            if (
              job.lastRunStatus &&
              job.lastRunStatus !== 'FAILED' &&
              job.lastRunStatus !== 'SKIPPED' &&
              job.lastRunStatus !== 'FINISHED' &&
              job.lastRunStatus !== 'STOPPED' &&
              job.lastRunStatus !== 'NOT_RUN'
            ) {
              this.jobStatus[job.jobId] = true
            } else {
              this.jobStatus[job.jobId] = false
            }
            if (
              job.lastRunStatus === 'RUNNING' ||
              job.lastRunStatus === 'PREPARED'
            ) {
              this.hasRun = true
              this.getCurListStatus(job.jobId)
            }
          })
          if (!this.hasRun) {
            clearInterval(this.timeout)
            clearInterval(this.eventInterval)
            /* this.currentStep = this.$t(
              'quality.page.qualityExamineJob.table.currentStep'
            ) */
          }
          this.rawData.forEach(item => {
            this.jobsMap[item.jobId] = item
          })
          // this.filterSelf();
          this.filterJobByKeyword()
        })
        .catch(e => {
          // this.timeout = setTimeout(()=>{
          //   this.getJobs();
          // },5000);
          this.dataLoading = false
          this.$showFailure(e)
        })
    },
    progressWidth(rateArr) {
      let tempShowArr = []
      let idx = 0
      let totalRate = 0

      rateArr.forEach((r, i) => {
        if (r > 0) {
          let obj = {
            rate: Number(r),
            type: i,
          }
          if (idx > 0) {
            tempShowArr.push({
              type: -1,
            })
          }
          tempShowArr.push(obj)
          idx++
          // 总数值
          totalRate += r
        }
      })
      const colors = ['#F2220A', '#FF7519', '#66BF16', '#000']
      // 总宽度
      const totalWidth = 100
      const restWidth = totalWidth - ((tempShowArr.length - 1) / 2) * 2

      tempShowArr = tempShowArr.map(t => {
        let obj = {
          width: t.rate ? (t.rate * restWidth) / totalRate : 2,
          color: t.type === -1 ? '#fff' : colors[t.type],
        }
        return {
          ...t,
          ...obj,
        }
      })
      return tempShowArr
    },
    handleFilterChange() {
      this.isSelf = arguments[0][Object.keys(arguments[0])[0]].length === 1
      this.filterSelf()
    },
    filterSelf(val) {
      // let rules = this.rawData;
      // if(this.isSelf){
      //   this.jobs = [];
      //   let username = this.$user.username;
      //   rules.forEach(item=>{
      //     if(item.creator === username){
      //       this.jobs.push(item);
      //     }
      //   });
      // }else{
      //   this.jobs = rules;
      // }
      // this.filterJobByKeyword();
      this.currentPage = 1
      if (this.isSelf) {
        this.creator = this.$user.username
        this.getJobs()
      } else {
        this.creator = ''
        this.getJobs()
      }
    },
    handleSortChange(arg) {
      const [propertyName, order] = [arg.prop, arg.order]
      if (propertyName) {
        this.$utils.sort.sortConsiderChineseNumber(
          this.jobs,
          propertyName,
          order
        )
        this.filterJobByKeyword()
      }
    },
    filterJobByKeyword() {
      this.jobsFiltered = []
      this.jobs.forEach(job => {
        const category = this.$modelCategoriesMap[job.modelCategoryId]
        if (
          job.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 ||
          (category &&
            category.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1)
        ) {
          this.jobsFiltered.push(job)
        }
      })
      //  this.currentPage = 1;
      // this.total = this.jobsFiltered.length;
      this.changeDisplay()
      // },
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deleteJobDisabled = this.multipleSelection.length === 0
    },
    preDeleteRows() {
      let text = ''
      if (this.multipleSelection.length === 1) {
        text = this.$t('quality.page.qualityExamineJob.deleteTips1', {
          name: this.multipleSelection[0].name,
        })
      } else {
        text = this.$t('quality.page.qualityExamineJob.deleteTips2', {
          selection: this.multipleSelection.length,
        })
      }
      this.$DatablauCofirm(
        text,
        this.$t('quality.page.qualityExamineJob.deleteInspection'),
        {
          type: 'warning',
          closeOnClickModal: false,
        }
      )
        .then(() => {
          this.deleteRows()
        })
        .catch()
    },
    deleteRows() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length

      if (length === 0) {
      } else {
        // 只有未运行和自己建立的系统才能被删除
        rows.forEach((row, index) => {
          if (index === length - 1) {
            if (
              this.$user.username === row.creator ||
              row.status !== 'RUNNING'
            ) {
              self.confirmDelete(row, true)
            }
          } else {
            if (
              this.$user.username === row.creator ||
              row.status !== 'RUNNING'
            ) {
              self.confirmDelete(row)
            }
          }
        })
      }
    },
    confirmDelete(row, isLast) {
      this.$http
        .delete(this.$quality_url + '/quality/job/' + row.jobId)
        .then(res => {
          this.getJobs()
          if (isLast) {
            this.$message.success(this.$t('common.info.deleted'))
            this.$bus.$emit('jobsDeleted', this.multipleSelection)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      // this.changeDisplay();
      this.getJobs()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      // this.changeDisplay();
      this.getJobs()
    },
    changeDisplay() {
      this.jobsDisplay.forEach(item => {
        const jobContent = JSON.parse(item.jobContent)
        const categoryId = jobContent.parameters.filter(c => {
          return c.parameterName === 'modelCategoryId'
        })[0].value
        item.modelCategoryId = Number(categoryId)
        /* if (this.jobsMap[item.jobId]) {
          item.modelCategoryId = JSON.parse(
            this.jobsMap[item.jobId].jobContent
          ).modelCategoryId
        } */
      })
    },
    runJob($index) {
      const run = () => {
        this.lastClicked = this.jobsDisplay[$index].jobId
        this.jobStatus[this.jobsDisplay[$index].jobId] = true
        this.tableKey++
        this.jobsDisplay[$index].status = 'RUNNING'
        this.$http
          .post(
            `/job/main/startJob?jobId=${this.jobsDisplay[$index].jobId}&executor=admin`
          )
          .then(res => {
            this.getCurListStatus(this.lastClicked)
            clearInterval(this.timeout)
            this.timeout = setInterval(() => {
              this.getJobs()
            }, 5000)
          })
          .catch(e => {
            this.getJobs()
            this.$showFailure(e)
          })
      }
      const check = () => {
        this.$http
          .post(
            `/job/main/canExecuteToday?jobId=${this.jobsDisplay[$index].jobId}`
          )
          .then(res => {
            const canExecute = !!res.data
            if (canExecute) {
              run()
            } else {
              this.$DatablauCofirm(
                '当前操作不在系统时间模版允许范围内执行，是否继续执行？'
              )
                .then(() => {
                  run()
                })
                .catch(() => {})
            }
          })
          .catch(e => {
            run()
            this.$showFailure(e)
          })
      }
      check()
    },
    // 循环调用 events
    getCurListStatus(jobId) {
      if (!jobId) return
      const vm = this
      this.eventIntervals[jobId] && clearInterval(this.eventIntervals[jobId])
      this.eventIntervals[jobId] = setInterval(() => {
        vm.$http
          .post(`/job/main/query/jobEvents/byCriteria`, {
            '@type': '.FieldEqualsCriteria',
            compareValue: jobId,
            fieldName: 'jobId',
            notEqual: false,
            page: null,
          })
          .then(res => {
            if (res.data.content.length > 0) {
              let lastItem = res.data.content.reverse()[0]
              if (lastItem.status === 'COMPLETE' || lastItem.percent === 100) {
                clearInterval(this.eventIntervals[jobId])
                this.getJobs()
              }
              if (res.data.content && Array.isArray(res.data.content)) {
                this.$nextTick(() => {
                  this.currentStep[jobId] = lastItem.message
                })
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 1000)
    },
    enableOrDisableJob(row) {
      let url = !row.disabled ? `/job/main/enableJob` : '/job/main/disableJob'
      this.$http
        .post(url + `?jobId=${row.jobId}`)
        .then(() => {
          this.getJobs()
        })
        .catch(e => {
          this.$showFailure(e)
          this.getJobs()
        })
    },
    showJobsStatu({ row, column, $index, store }) {
      this.jobStaData = [] // 初始化
      const jobId = row ? row.jobId : ''
      this.checkStaJobId = jobId
      // this.initJobStatus(jobId)
      this.jobInstanceId = jobId
      this.showJobsStaPop = true
    },
    initJobStatus(jobId) {
      this.jobStaData = []
      if (!jobId && jobId !== 0) {
        return
      }
      this.$http
        .post(`/job/main/query/jobResults/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobId',
              compareValue: jobId,
              notEqual: false,
            },
          ],
        })
        .then(res => {
          let result = Math.max(...res.data.content.map(x => x.id))
          this.jobInstanceId = result
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'status') {
        const style = {}
        switch (row.status) {
          case 'FAILED':
            style.color = 'red'
            break
          case 'RUNNING':
            style.color = 'green'
        }
        return style
      }
    },
  },
}
