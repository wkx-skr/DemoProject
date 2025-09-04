import chooseQualityRules from '../../../components/quality/qualityJob/chooseQualityRules.vue'
import sectionLabel from '../components/sectionLabel.vue'
import RuleImpl from '../techRules/ruleImpl.vue'
import listInRule from '@/components/systemManagement/systemSetting/listInRule.vue'
import moment from 'moment'
import techRule from './techRules'
export default {
  components: {
    chooseQualityRules,
    sectionLabel,
    RuleImpl,
    listInRule,
  },
  props: ['details', 'jobListData'],
  beforeMount() {
    this.moment = moment
  },
  mixins: [techRule],
  data() {
    return {
      rulesDisplay: this.details ? null : [],
      chooseRulesDialogVisible: false,
      writable: this.details ? this.details.directEdit : true,
      jobDetails: {
        owner: this.$user.username,
        modelId: '',
        selectedTime: new Date(0, 0, 0),
        selectedWeekDays: ['Sun'],
        name: '',
        jobId: '',
        jobContent: '',
        creator: '',
        status: '',
        schedule: '',
        createOn: '',
        startTime: '',
        endTime: '',
        nextRun: '',
        result: '',
        log: '',
        // disable: false,
        // autoDistributeIssue: false,
        // sendMail: false,
      },
      disable: false,
      autoDistributeIssue: true,
      sendMail: false,
      emailReceivers: [],
      scheduleType: 'wait',
      chosen: [],
      loadedDatasources: [],
      dataSources: [],
      firstTime: true,
      modelCategoryId: '',
      autoCreateTask: true,
      allUsers: [],
      mailList: [],
      cronData: '',
      validateRules: {
        name: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.name1'
            ),
            trigger: 'blur',
          },
          {
            max: 128,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.name2'
            ),
            trigger: 'change',
          },
        ],
        selectedWeekDays: [
          {
            type: 'array',
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.selectedWeekDays'
            ),
            trigger: 'change',
          },
        ],
        selectedTime: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.selectedTime'
            ),
            trigger: 'change',
          },
        ],
        modelCategoryId: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.modelCategoryId'
            ),
            trigger: 'change',
          },
        ],
        modelId: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.modelId'
            ),
            trigger: 'change',
          },
        ],
        owner: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.owner'
            ),
            trigger: 'change',
          },
        ],
      },
      showRuleTable: true,
      smallClassList: [],
      searchFormData: {
        ruleName: '',
        smallClassSelectOption: '',
        bigClassSelectOption: '',
        bizTypeSelectOption: '',
      },
      systemList: [],
      smallTableLoading: false,
      oldModelCategoryId: null,
      isUserCron: false,
      parameterIds: null,
      sendMailArr: JSON.stringify([
        {
          value: '01',
          label: '发送邮件通知',
        },
      ]),
      dateTemplates: [],
      canExecuteDateTemplates: [],
    }
  },
  created() {
    // 获取系统
    this.$getModelCategories()
    this.$bus.$emit('getRuleType')
  },
  mounted() {
    // this.systemList = this.$modelCategories.filter(e => e.canQuery === 1)
    this.systemList = _.cloneDeep(this.$modelCategories)
    if (this.details) {
      this.innerLoadDataSources()
      this.details.selectedWeekDays = []
      this.details.selectedTime = ''
      this.details.owner = ''
      this.details.modelId = ''
      this.jobDetails = _.cloneDeep(this.details)
      this.jobDetails.jobContent = this.details.jobContent
      if (JSON.parse(this.jobDetails.jobContent).schedule) {
        const schedule = JSON.parse(this.jobDetails.jobContent).schedule
        if (schedule.includes('cron')) {
          this.jobDetails.schedule = schedule.slice(5)
        }
      }
      if (JSON.parse(this.jobDetails.jobContent).schedule === null) {
        this.jobDetails.schedule = null
      }
      if (JSON.parse(this.jobDetails.jobContent).runCycle === '自定义') {
        this.isUserCron = true
      }
      this.getDefaultDetail()
    }
    this.getDateTemplate()
    this.$bus.$on('closeDialog', () => {
      this.chooseRulesDialogVisible = false
    })
  },
  beforeDestroy() {
    this.$bus.$off('closeDialog')
  },
  methods: {
    statusFormatter(row) {
      const value = row.publicState
      switch (value) {
        case 'X':
          return this.$t('quality.page.qualityRule.publishStatus.deprecated')
        case 'D':
          return this.$t(
            'quality.page.qualityRule.publishStatus.shortToBeAudited'
          )
        case 'C':
          return this.$t('quality.page.qualityRule.publishStatus.inReview')
        case 'A':
          return this.$t('quality.page.qualityRule.publishStatus.adopted')
      }
    },
    handleClose(idx) {
      this.emailReceivers.splice(idx, 1)
    },
    getDateTemplate() {
      this.$http
        .post(this.$job_url + `/dateTemplate/list`)
        .then(res => {
          this.dateTemplates = res.data.filter(i => i.state === 1)
          this.canExecuteDateTemplates = this.canExecuteDateTemplates.filter(
            item => this.dateTemplates.map(i => i.id).includes(item)
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateParameterIds(parameterIds) {
      this.parameterIds = parameterIds
    },
    getSmallClassList() {
      this.searchFormData.smallClassSelectOption = ''
      this.smallClassList = []
      const pId = this.$bigClassList.filter(
        e => e.value === this.searchFormData.bigClassSelectOption
      )[0].id
      this.$http
        .post(`${this.$url}/select/option/getByParentId?parentId=${pId}`)
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.smallClassList.push(obj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    qualityRulesSelected(data) {
      data
        .filter(rule => {
          return !this.ruleIds.includes(rule.id)
        })
        .map(i => i.id)
        .forEach(add => {
          this.ruleIds.push(add)
        })
      this.getMultiPage()
    },
    removeAllRules() {
      this.$DatablauCofirm(
        this.$t('quality.page.qualityExamineJob.removeAllTips'),
        '',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.removeIsPending = true
          this.$http
            .post(
              this.$quality_url + `/quality/rule/tech/multiCheck`,
              this.ruleIds
            )
            .then(res => {
              this.ruleIds = this.ruleIds.filter(i => {
                return !res.data.includes(i)
              })
              this.getMultiPage()
              this.removeIsPending = false
            })
        })
        .catch(() => {})
    },
    closeDialog() {
      this.chooseRulesDialogVisible = false
    },
    labelFormatter(label, value) {
      if (label === 'scheduleType') {
        if (value === 'wait') {
          return '暂不运行'
        } else if (value === 'run') {
          return '立即运行'
        } else if (value === 'schedule') {
          return '周期调度'
        }
      } else if (label === 'selectedWeekDays') {
        switch (value) {
          case 'Mon':
            return '星期一'
          case 'Tue':
            return '星期二'
          case 'Wed':
            return '星期三'
          case 'Thu':
            return '星期四'
          case 'Fri':
            return '星期五'
          case 'Sat':
            return '星期六'
          case 'Sun':
            return '星期日'
        }
      }
    },
    disabledEmail(val) {
      if (val === false) {
        this.sendMail = false
      }
    },
    handleModelCategoryChange(val) {
      this.rulesDisplay = []
      this.ruleIds = []
      val && this.innerLoadDataSources()
    },
    getCronString(cron, type) {
      this.jobDetails.schedule = cron
    },
    showSearch() {
      this.updateMultipleCriteriaByCondition()
    },
    reset() {
      this.$refs.searchForm.resetFields()
      this.showSearch()
    },
    addReceiver() {
      this.mailList.push({})
    },
    removeReceiver(index) {
      this.mailList.splice(index, 1)
    },
    // getAllUsers(){
    //   this.$http.get(this.$url + '/service/main/users').then(res=>{
    //     this.allUsers = res.data;
    //   }).catch(e=>{
    //     this.$showFailure(e);
    //   });
    // },
    innerLoadDataSources: function () {
      if (!this.jobDetails.modelCategoryId && !this.details) {
        this.dataSources = []
        return
      } else {
        var categoryId = this.jobDetails.modelCategoryId
          ? this.jobDetails.modelCategoryId
          : this.details.modelCategoryId
      }
      /* this.$http
        .get(this.$meta_url + '/service/models/fromre/')
        .then(res => {
          this.dataSources = []
          res.data.forEach(item => {
            if (item.categoryId == categoryId) {
              this.dataSources.push(item)
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        }) */
    },
    removeTab() {
      // this.$bus.$emit('tabRemoved',this.details ? this.details.name : 'add');
      this.$emit('toBackList', this.jobListData)
    },
    closeAdd() {
      this.$emit('toBackList', this.jobListData)
    },
    getDefaultDetail() {
      let ruleIds = ''
      const jobDetail = JSON.parse(this.jobDetails.jobContent)
      jobDetail.parameters.forEach(p => {
        if (p.parameterName === 'modelCategoryId') {
          this.jobDetails.modelCategoryId = p.value - 0
        } else if (p.parameterName === 'sendMail') {
          this.sendMail = p.value === 'true'
        } else if (p.parameterName === 'techRuleIds') {
          ruleIds = JSON.parse(p.value)
          this.ruleIds = ruleIds
        } else if (p.parameterName === 'mailList') {
          this.emailReceivers = JSON.parse(p.value)
        }
      })
      this.rulesDisplay = null
      this.canExecuteDateTemplates = JSON.parse(
        this.jobDetails.jobContent
      ).canExecuteDateTemplates
      this.getMultiPage()
    },
    handleChange() {},
    removeSelect(data) {},
    disableFormat(row, column) {
      var disabled = row[column.property]
      if (disabled == undefined) {
        return ''
      } else if (disabled == 0) {
        return '有效'
      } else if (disabled == 1) {
        return '无效'
      }
    },
    deleteRule(id) {
      const idx = this.ruleIds.indexOf(id)
      if (idx > -1) {
        this.ruleIds.splice(idx, 1)
      }
      this.getMultiPage()
    },
    selectStaff() {
      this.$utils.staffSelect.open([], false).then(res => {
        if (res && Array.isArray(res)) {
          res.forEach(item => {
            if (!this.emailReceivers.includes(item.username)) {
              this.emailReceivers.push(item.username)
            }
          })
        }
      })
    },
    emit(cron) {
      const simpleSchedule = {
        repeatCount: '0',
        interval: '3', // 负值表示不立刻跑
        intervalUnit: 'SEC',
      }
      if (!cron) {
        if (this.scheduleType === 'wait') {
          simpleSchedule.interval = -1
        }
      }
      let schedule = 'simple:' + JSON.stringify(simpleSchedule)
      if (cron) {
        schedule = cron
      }
      {
        // todo 更新id列表
        // this.chosen = []
        // this.allDisplay.forEach(item => {
        //   this.chosen.push(item.id)
        // })
      }
      var requestBody = {
        name: this.jobDetails.name, // 11
        schedule: schedule, // 11
        '@class': 'com.datablau.job.scheduler.data.DatablauJobDescriptor', // 11
        boundResourceId: this.jobDetails.modelCategoryId, // 11
        boundResourceType: 'modelCategory',
        disable: this.disable, // 11
        runCycle: this.isUserCron ? '自定义' : this.getScheduleTime(schedule),
        canExecuteDateTemplates: this.canExecuteDateTemplates, // 11
        typeName: 'DataQuality',
        parameters: [
          {
            deleted: false,
            mandatory: true,
            parameterDescription: '技术规则列表',
            parameterName: 'techRuleIds',
            type: 'LIST_LONG',
            value: JSON.stringify(this.ruleIds),
          },
          {
            deleted: false,
            mandatory: true,
            parameterDescription: '应用系统',
            parameterName: 'modelCategoryId',
            type: 'LONG',
            value: `${this.jobDetails.modelCategoryId}`,
          },
          {
            deleted: false,
            mandatory: false,
            parameterDescription: '是否发送邮件',
            parameterName: 'sendMail',
            type: 'BOOL',
            value: `${this.sendMail}`,
          },
        ],
      }
      if (this.jobDetails.name === '') {
        this.$message.warning(
          this.$t('quality.page.qualityExamineJob.validateRules.name1')
        )
      } else {
        if (this.parameterIds) {
          requestBody.parameters.push({
            deleted: false,
            mandatory: false,
            parameterDescription: '参数列表',
            parameterName: 'paramList',
            type: 'LIST_LONG',
            value: JSON.stringify(this.parameterIds),
          })
        }
        if (this.emailReceivers) {
          requestBody.parameters.push({
            deleted: false,
            mandatory: false,
            parameterDescription: '收件人',
            parameterName: 'mailList',
            type: 'LIST_STRING',
            value: JSON.stringify(this.emailReceivers),
          })
        }
        if (this.details) {
          // when update job
          this.$http
            .put(
              this.$quality_url + '/quality/job/' + this.jobDetails.jobId,
              requestBody
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityExamineJob.successfullyModified')
              )
              this.$bus.$emit('jobAddedOrUpdated', this.jobDetails.name)
              this.writable = false
              this.$emit('reload-jobs')
              this.$emit('toBackList', this.jobListData) // 关闭页面
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          // add new job
          this.$http
            .post(this.$quality_url + '/quality/job/', requestBody)
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityExamineJob.operationSucceed')
              )
              this.$bus.$emit('jobAddedOrUpdated')
              this.$emit('reload-jobs')
              this.$emit('toBackList', this.jobListData) // 关闭页面
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    updateJobSchedule(cron) {
      const cronJobRequest = {
        schedule: cron ? 'cron:' + cron : null,
      }
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          if (cron) {
            this.emit(cronJobRequest.schedule)
          } else {
            this.emit()
          }
        }
      })
    },
    onSubmit() {
      const self = this
      var cronString = null
      if (this.jobDetails.schedule === '') {
        this.$message.error(
          this.$t('quality.page.qualityExamineJob.periodicScheduling')
        )
      } else {
        self.updateJobSchedule(this.jobDetails.schedule)
      }
    },
    refreshtableHeigth() {
      const $tableBox = $('.sub-table-row')
      $tableBox.css({
        minHeight: $tableBox.height(),
      })
      this.showRuleTable = false
      this.$nextTick(() => {
        this.showRuleTable = true
        this.$nextTick(() => {
          $tableBox.css({
            minHeight: '0',
          })
        })
      })
    },
    categoryFocus() {},
    stateFormatter(val) {
      if (val === 1) {
        return '业务规则'
      } else {
        return '技术规则'
      }
    },
    typeFormatter(val) {
      if (val === 2) {
        return '标准映射'
      } else {
        return '监管报送'
      }
    },
    smallRuleFormatter(val) {
      switch (val) {
        case 1:
          return '空值检查'
        case 2:
          return '一致性检查'
        case 3:
          return '主外键关联检查'
        case 4:
          return '唯一性检查'
        case 6:
          return '长度检查'
        case 7:
          return '值域检查'
      }
    },
    bigRuleFormatter(val) {
      switch (val) {
        case 1:
          return this.$t('quality.page.qualityExamineJob.type.integrity')
        case 2:
          return this.$t('quality.page.qualityExamineJob.type.consistent')
        case 3:
          return this.$t('quality.page.qualityExamineJob.type.veracity')
        case 4:
          return this.$t('quality.page.qualityExamineJob.type.uniqueness')
        case 6:
          return this.$t('quality.page.qualityExamineJob.type.normative')
        case 7:
          return this.$t('quality.page.qualityExamineJob.type.effectiveness')
      }
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
          return '暂不调度'
        }
      } catch (e) {
        return '暂不调度'
      }
    },
  },
  computed: {
    addReceiverDisabled() {
      let hasNull = false
      this.mailList.forEach(item => {
        if (!item.address) {
          hasNull = true
        }
      })
      return hasNull
    },
  },
  watch: {
    rulesDisplay: {
      handler: function (newVal) {
        if (this.$refs.listInRule) {
          const allSqls = {}
          if (Array.isArray(newVal)) {
            newVal.forEach(rule => {
              allSqls['formattedContent' + rule.id] = rule.formattedContent
              allSqls['countTotalSql' + rule.id] = rule.countTotalSql
              allSqls['countProblemSql' + rule.id] = rule.countProblemSql
            })
          }
          this.$refs.listInRule.setRules(newVal)
          this.$refs.listInRule.setSqls(allSqls)
        }
        // this.refreshtableHeigth()
      },
    },
    immediate: true,
  },
}
