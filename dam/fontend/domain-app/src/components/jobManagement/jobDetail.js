import sourceSelect from './sourceSelect.vue'
import standardSelect from './standardSelect.vue'
import jobContentParam from './jobContentParam.vue'
import jobRunReport from './jobRunReport.vue'
import dataSourceModel from './dataSourceModel.vue'
import HTTP from '@/http/main'
;('use strict')
const id = 100
const moment = require('moment')
export default {
  props: {
    job: {
      type: Object,
      require: true,
    },
    isFromDataSource: {
      type: Boolean,
      default: false,
    },
    isLineagejob: {
      type: Boolean,
      default: false,
    },
    query: {
      type: Object,
      default: () => {
        return {}
      },
    },
    lineageTab: {
      type: Boolean,
      default: false,
    },
    lineageId: {
      type: Number,
    },
    jobtype: {
      type: String,
    },
  },
  components: {
    sourceSelect,
    standardSelect,
    jobContentParam,
    jobRunReport,
    dataSourceModel,
  },
  data() {
    this.BASE_URL = this.$url + '/service/datablau_jobs/'
    return {
      jobInRunning: false,
      selectedHour: null,
      selectedMin: null,
      selectedWeekDays: [],
      radio: 'schduleByWeekdays',

      isDeletable: false,

      isTestTrue: true,

      jobDetails: {
        name: '',
        jobId: '',
        creator: '',
        status: '',
        schedule: '',
        createOn: '',
        startTime: '',
        endTime: '',
        nextRun: '',
        result: '',
        log: '',
        disabled: '',
        type: '',
        jobContent: {
          // syncType: 'MODEL_NOT_NULL',
        },
      },
      lineageTabForm: {
        lineageName: '',
      },
      lineageTabName: false,
      rule1: {
        lineageName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
        ],
      },
      resourceModeType: false,
      jobLog: [],

      jobHistory: [],

      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      // re-schedule request body
      jobScheduleRequest: {
        id: '',
        schedule: '',
      },

      scheduleTime: {
        scheduleWeekdays: '',
        scheduleTime: '',
      },

      jobLogFresh: {
        listRefresh: false,
        interval: null,
        interval1: null,
      },
      /* 该变量存储将要提交给Term Recognizer Job的附加信息，如数据源选择结果，数据标准选择结果等 */
      uploadMsg: {
        source: [],
        standard: [],
      },
      preFloderAddress: 'smb:',
      isAdd: false,
      jobName: '',
      paraJobsList: [
        'JobResultArchiveJobDescriptor',
        'ClusterColumnJobDescriptor',
        'LoadDataStageJobFileJobDescriptor',
        'SyncDataStandardJobDescriptor',
        'DatablauJobPlanJobDescriptor',
        'LoadLineageJobDescriptor',
      ],
      couldTestShareCatalog: false,
      couldEditName: false,
      addressType: 'local',
      resultDialogVisible: false,
      resultString: '',
      showJobsStaPop: false,
      showInstanceId: '',
      showTopLine: false,
      // showTopLine: true, //暂时设置
      expandRowKeys: [],
      memoryList: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
        57, 58, 59, 60, 61, 62, 63, 64,
      ],
      syncTypeList: [
        // { label: '仅同步数据库表字段中文名不为空', value: 'MODEL_NOT_NULL' },
        { label: this.$t('system.job.byModel'), value: 'MODEL_ALL' },
        // { label: '仅同步元数据表字段中文名为空的数据', value: 'DAM_IS_NULL' },
        { label: this.$t('system.job.byMeta'), value: 'SYNC_NULL' },
      ],
      paramsValidation: true, // 参数是否填写完整, false 时不能保存任务
      tableHight: '',
      jobCount: 0, // 设置编辑的次数
      jobAllParamsCount: 0, // 计算所有的编辑次数
      currentStep: '',
      syncType: 'SYNC_NULL',
      modelIds: [], // 关联数据源
      skipProcessed: false, // 跳过已解析
      selDataSource: [],
      dateTemplates: [],
      uploadHost: this.$url + '/service/' + 'files/upload/re/file',
      acceptTypes: '.xlsx',
      jobLoading: true,
      appName: HTTP.$appName,
      // generateQualityTaskPolicy: 'DEPEND_ON_DOMAIN',
    }
  },
  beforeMount() {
    const jobId = this.job.id
    this.isAdd = false
    if (jobId === 'add') {
      this.isAdd = true
      this.jobDetails.type = this.job.type
      this.jobDetails.schedule = this.getScheduleTime(this.job.schedule)
      this.jobName = this.getDefatulname()
    } else {
      if (JSON.stringify(this.job) === '{}') {
        this.jobLoading = true
      } else {
        this.jobLoading = false
        this.jobDetails = _.clone(this.job)
        this.jobDetails.id = this.job.id || this.job.jobId
        this.jobDetails.jobContent = JSON.parse(this.jobDetails.jobContent)
        /* if (this.job.type === 'DomainVerifyJobDescriptor') {
          this.generateQualityTaskPolicy =
            this.jobDetails.jobContent.generateQualityTaskPolicy ||
            'DEPEND_ON_DOMAIN'
        } */

        if (
          this.jobDetails.type === 'LoadLineageJobDescriptor' &&
          this.lineageTab
        ) {
          this.lineageTabForm.lineageName = this.jobDetails.name
        }
        if (
          this.job.type === 'MetadataSyncJobDescriptor' ||
          this.query.update
        ) {
          // 中文名同步策略针对--元数据更新扫描任务
          this.syncType = this.jobDetails.jobContent.syncType
            ? this.jobDetails.jobContent.syncType
            : 'SYNC_NULL'
        }
        // 血缘任务
        if (
          this.$route.query.jobType == 3 ||
          this.job.type === 'MetadataLineageJobDescriptor'
        ) {
          this.getDataSourceName(this.jobDetails.jobContent.modelIds)
          this.skipProcessed = this.jobDetails.jobContent.skipProcessed
          this.modelIds = this.jobDetails.jobContent.modelIds
        }
      }
    }
    if (!this.jobDetails.jobContent.canExecuteDateTemplates) {
      this.$set(this.jobDetails.jobContent, 'canExecuteDateTemplates', [])
      // this.jobDetails.jobContent.canExecuteDateTemplates = []
    }
    this.getDateTemplate()
  },
  mounted() {
    const self = this
    const jobId = this.jobDetails.id
    if (jobId !== 'add') {
      self.innerLoadJobDetail(jobId)
      self.initBoardcastListeners()
    }
    this.jobDetails.disabled = !this.jobDetails.disabled
    if (
      this.jobDetails.type === 'MetadataSyncJobDescriptor' ||
      this.jobDetails.jobType === 'MetadataSyncJobDescriptor'
    ) {
      this.resourceModeType = this.jobDetails.jobContent.resourceMode
        ? this.jobDetails.jobContent.resourceMode
        : false
    }
  },
  beforeDestroy() {
    this.$bus.$off('termRecognizerJob--dataSource')
    this.$bus.$off('termRecognizerJob--dataStandard')
    clearInterval(this.jobLogFresh.interval1)
    this.currentStep = ''
  },
  methods: {
    showJobLog(row) {
      this.showJobsStaPop = true
      this.showInstanceId = row.id
    },
    openDataSource() {
      this.$refs.dataSourceModel.showModel = true
    },
    dataSource(data) {
      this.selDataSource = data
      let tempIds = []
      data.forEach(item => {
        tempIds.push(item.modelId)
      })
      this.modelIds = tempIds
    },
    getDataSourceName(ids) {
      if (!ids) return
      this.$http
        .post(this.$url + '/service/models/model/modelNames', ids)
        .then(res => {
          let tempData = []
          if (res.data) {
            for (let key in res.data) {
              tempData.push({ modelId: Number(key), definition: res.data[key] })
            }
            this.selDataSource = tempData
          } else {
            this.selDataSource = []
          }
        })
    },
    handleBeforeUpload(file, type) {},
    handleUploadSuccess(res, file, type) {
      this.$http.put(this.$url + '/service/files/commit?fileIds=' + res.fileId)
      let obj = {
        parameterMap: {
          FileNames: res.fileOrginalName,
          FilePath: res.fileStorePath,
        },
      }
      this.$http
        .post(this.$url + `/service/models/${this.jobDetails.id}/update`, obj)
        .then(res => {
          if (res.data === true) {
            this.setActiveState(true)
            this.preRunAtOnce()
            this.showJobStatus()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleFileRemoved(file, fileList, type) {
      console.log(file, fileList, type, 'handleFileRemoved')
    },
    handleUploadChange(file, fileList, type) {
      console.log(file, fileList, type, 'handleUploadChange')
    },
    updateLogical() {},
    getDateTemplate() {
      this.$http
        .post(this.$job_url + `/dateTemplate/list`)
        .then(res => {
          this.dateTemplates = res.data.filter(i => i.state === 1)
          this.jobDetails.jobContent.canExecuteDateTemplates =
            this.jobDetails.jobContent.canExecuteDateTemplates.filter(item =>
              this.dateTemplates.map(i => i.id).includes(item)
            )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clickChange() {
      this.showJobsStaPop = true
    },
    initBoardcastListeners() {
      const self = this
      this.$bus.$on('termRecognizerJob--dataSource', checkedIds => {
        self.uploadMsg.source = checkedIds
      })
      this.$bus.$on('termRecognizerJob--dataStandard', checkedIds => {
        self.uploadMsg.standard = checkedIds
      })
    },
    // 循环调用接口查询
    refreshJobStatus() {
      const self = this
      setTimeout(() => {
        const jobId = this.jobDetails.id
        const url = `${this.$url}/service/datablau_jobs/${jobId}/history`
        this.$http
          .get(url)
          .then(res => {
            const data = res.data
            // this.$refs.uploadFileUpdates.clearFiles()
            if (data && Array.isArray(data)) {
              const instance = data[0] || {}
              const instanceId = instance.id
              if (instanceId) {
                const url = `${this.$url}/service/datablau_jobs/${instanceId}/events`
                clearInterval(self.jobLogFresh.interval1)
                self.jobLogFresh.interval1 = setInterval(() => {
                  this.$http
                    .get(url)
                    .then(res => {
                      if (res.data && Array.isArray(res.data)) {
                        const data = res.data.reverse()[0]
                        if (data) {
                        }
                        this.currentStep = data.message + '...'
                      }
                    })
                    .catch(e => {
                      this.$showFailure(e)
                    })
                }, 2000)
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 500)
    },
    showJobStatus() {
      this.showJobsStaPop = true
      this.showTopLine = true
      setTimeout(() => {
        const jobId = this.jobDetails.id
        const url = `${this.$url}/service/datablau_jobs/${jobId}/history`
        this.$http
          .get(url)
          .then(res => {
            const data = res.data
            if (data && Array.isArray(data)) {
              const instance = data[0] || {}
              const instanceId = instance.id
              if (instanceId) {
                this.showInstanceId = instanceId
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 500)
    },
    innerLoadJobDetail(job_Id) {
      const self = this
      self.loadCurrentJob(job_Id)
      self.loadJobHistory(job_Id)
      if (this.jobDetails.type === 'DatablauJobPlanJobDescriptor') {
        this.couldEditName = true
      } else {
        this.couldEditName = false
      }
    },
    refreshCheck(jobId) {
      if (this.jobInRunning) {
        this.jobLogFresh.listRefresh = true
        this.loadCurrentJob(jobId)
      } else {
        if (this.jobLogFresh.listRefresh) {
          this.loadJobHistory(jobId)
          this.jobLogFresh.listRefresh = false
          clearInterval(this.jobLogFresh.interval)
          clearInterval(this.jobLogFresh.interval1)
          this.currentStep = ''
        }
      }
    },
    loadCurrentJob(jobId) {
      if (!jobId) return
      const self = this
      self.jobLog = []

      self.$http
        .get(this.$url + '/service/datablau_jobs/' + jobId)
        .then(res => {
          this.$bus.$emit('getInfication')
          if (res.data.length !== 0) {
            const data = res.data
            // if API will return all log, need to add cycle to get data.
            self.jobLog.push(data)
          }
          if (
            self.jobLog.length > 0 &&
            self.jobLog[0].status != 'FINISHED' &&
            self.jobLog[0].status != 'STOPPED' &&
            self.jobLog[0].status != 'FAILED' &&
            self.jobLog[0].status != 'SKIPPED' &&
            self.jobLog[0].status != 'NOT_RUN'
          ) {
            self.jobInRunning = true
            self.refreshJobStatus()
          } else {
            self.jobInRunning = false
            clearInterval(self.jobLogFresh.interval1)
            self.currentStep = ''
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    loadJobHistory(jobId) {
      if (!jobId) return
      const self = this
      self.jobHistory = []

      self.$http
        .get(this.$url + '/service/datablau_jobs/' + jobId + '/history')
        .then(res => {
          if (res.data.length != 0) {
            const data = res.data
            for (let i = 0; i < data.length; i++) {
              // if API will return all log, need to add cycle to get data.
              self.jobHistory.push(data[i])
            }
          }
        })
    },
    addressTypeChange(addressType) {
      this.addressType = addressType
    },
    // 时间格式化
    dateFormat(row, column) {
      const date = row[column.property]
      if (row == undefined || date == undefined) {
        return ''
      }
      //			return (new Date(date)).toString();
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    setActiveState(jobState) {
      const self = this
      const jobId = self.jobDetails.id
      if (jobState == true) {
        self.$http
          .put(this.$url + '/service/datablau_jobs/' + jobId + '/enable')
          .then(res => {
            // it will return the next job run, but nothing will do here
            if (res.data.length != 0) {
              const data = res.data
            }
          })
          .catch(e => {
            self.$message({
              type: 'info',
              message: this.$t('system.job.jobEnabledFail'),
            })
          })
      } else if (jobState == false) {
        self.$http
          .put(this.$url + '/service/datablau_jobs/' + jobId + '/disable')
          .then(res => {
            // it will none
            self.$message({
              type: 'info',
              message: this.$t('system.job.jobDisabled'),
            })
          })
          .catch(e => {
            self.$message({
              type: 'info',
              message: this.$t('system.job.jobDisabledFail'),
            })
          })
      }
    },
    preRunAtOnce() {
      const run = () => {
        if (this.jobInRunning) {
          return
        }
        const jobId = this.jobDetails.id
        this.jobInRunning = true
        this.$http
          .put(this.$url + '/service/datablau_jobs/' + jobId + '/run')
          .then(res => {
            // 聚合推荐任务启动时接收信号
            this.$emit('runJob')
            if (this.jobInRunning) {
              this.jobLogFresh.interval = setInterval(() => {
                this.refreshCheck(jobId)
              }, 3000)
              this.refreshJobStatus()
            }
          })
          .catch(e => {
            this.jobInRunning = false
            this.$message({
              type: 'info',
              message: this.$t('system.job.jobRunFailureMessage'),
            })
          })
      }
      const check = () => {
        this.$http
          .post(
            this.$url +
              `/service/datablau_jobs/canExecuteToday?jobId=${this.jobDetails.id}`
          )
          .then(res => {
            const canExecute = !!res.data
            if (canExecute) {
              run()
            } else {
              this.$confirm(
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
    runAtOnce() {
      const self = this
      const jobId = self.jobDetails.id
      // "schedule": "simple:{\"repeatCount\":0, \"interval\":5, \"intervalUnit\":\"SEC\"}"
      const simpleSchedule = {
        repeatCount: '0',
        interval: '3',
        intervalUnit: 'SEC',
      }

      const simpleJobRequest = {
        schedule: 'simple:' + JSON.stringify(simpleSchedule),
      }

      this.$http
        .put(
          this.$url + '/service/datablau_jobs/' + jobId + '/reschedule',
          simpleJobRequest
        )
        .then(res => {
          this.jobInRunning = true
          this.jobLogFresh.interval = setInterval(() => {
            this.refreshCheck(jobId)
          }, 3000)
        })
        .catch(e => {
          this.$message({
            type: 'info',
            message: this.$t('system.job.jobRunFailureMessage'),
          })
        })
    },
    // Read original schedule to show it on the page and convert cron expression to weekdays.
    // not support day, month yet.
    getScheduleTime(scheduleInCron) {
      //   //cron string sample: 0 50 15 * * ?
      const scheduleString = scheduleInCron.split(':')
      let cron = null
      cron = scheduleString[1]
      this.jobDetails.schedule = cron
      return cron
    },
    // When re-scheudle the job
    onSubmit() {
      const scheduleString = this.jobDetails.schedule
      if (this.isAdd) {
        this.createJob(scheduleString)
      } else {
        this.updateJobSchedule(scheduleString)
      }
    },
    // 取消按钮
    remove() {
      if (this.appName === 'DDD') {
        window.parent.postMessage(
          JSON.stringify({ type: 'databaseManagement' }),
          '*'
        )
        this.$bus.$emit('removeTab', this.job.id)
        return
      }
      if (this.isFromDataSource) {
        this.$emit('skip2DataSource')
      } else {
        let count =
          this.jobCount +
          (!!this.$refs.jobParams && !!this.$refs.jobParams.paramsCount
            ? this.$refs.jobParams.paramsCount
            : 0)
        if (this.job.id === 'add') {
          if (count > 1) {
            this.detablauDialog()
          } else {
            this.removeJobId()
          }
        } else {
          let arr = [
            'JobResultArchiveJobDescriptor',
            'SyncDataStandardJobDescriptor',
            'ClusterColumnJobDescriptor',
            'LoadLineageJobDescriptor',
          ]
          if (arr.indexOf(this.job.type) > -1) {
            if (count > 3) {
              this.detablauDialog()
            } else {
              this.removeJobId()
            }
          } else if (this.job.type === 'DatablauJobPlanJobDescriptor') {
            if (count > 4) {
              this.detablauDialog()
            } else {
              this.removeJobId()
            }
          } else {
            if (count > 2) {
              this.detablauDialog()
            } else {
              this.removeJobId()
            }
          }
        }
      }
    },
    detablauDialog() {
      this.$DatablauCofirm(
        this.$t('common.info.savePage'),
        this.$t('common.info.title'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          this.onSubmit()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('common.info.editCancelled'),
          })
          this.removeJobId()
        })
    },
    removeJobId() {
      if (this.isFromDataSource) {
        this.$emit('skip2DataSource')
      } else {
        if (this.job.id !== 'add') {
          this.$bus.$emit('removeTab', this.job.id)
        } else {
          this.$bus.$emit('removeTab')
        }
        this.$bus.$emit('updateJobs')
      }
    },
    updateJob() {
      if (this.showJobPram) {
        let params = {}
        if (this.$refs.jobParams && this.$refs.jobParams.getParam) {
          params = this.$refs.jobParams.getParam()
          params.canExecuteDateTemplates =
            this.jobDetails.jobContent.canExecuteDateTemplates
        } else {
          params = this.jobDetails.jobContent
        }
        params.expectedMemory = this.jobDetails.jobContent.expectedMemory
        params.name = this.jobDetails.name
        if (!this.jobDetails.schedule && this.jobDetails.schedule !== null) {
          return
        }
        params.schedule = this.jobDetails.schedule
          ? 'cron:' + this.jobDetails.schedule
          : null

        if (this.lineageTab) {
          params.folderId = this.lineageId
          params.name = this.lineageTabForm.lineageName
          params.typeName = this.lineageTabForm.lineageName
          params['@class'] =
            'com.datablau.dam.data.job.descriptor.LoadLineageJobDescriptor'
          if (
            !this.lineageTabForm.lineageName ||
            !params.lineageType ||
            (!params.localFolder && !params.shareFolder)
          ) {
            this.$datablauMessage.warning('信息填写不完整')
            return
          }
        }

        this.$http
          .put(
            this.$url + '/service/datablau_jobs/' + this.jobDetails.id,
            params
          )
          .then(res => {
            this.$emit('pageJob')
            this.setJobSuccessed(res.data)
            if (this.lineageTab === true) {
              this.$emit('getTreeRef')
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.jobDetails.jobContent.schedule = this.jobDetails.schedule
          ? 'cron:' + this.jobDetails.schedule
          : null
        if (
          this.jobDetails.type === 'MetadataSyncJobDescriptor' ||
          this.jobDetails.jobType === 'MetadataSyncJobDescriptor'
        ) {
          this.jobDetails.jobContent.resourceMode = this.resourceModeType
          this.jobDetails.jobContent.syncType = this.syncType
        }
        this.jobDetails.jobContent.modelIds = this.modelIds
        this.jobDetails.jobContent.skipProcessed = this.skipProcessed
        /* if (this.jobDetails.type === 'DomainVerifyJobDescriptor') {
          this.jobDetails.jobContent.generateQualityTaskPolicy =
            this.generateQualityTaskPolicy
        } */
        this.$http
          .put(
            this.$url + `/service/datablau_jobs/${this.jobDetails.id}`,
            this.jobDetails.jobContent
          )
          .then(res => {
            this.setJobSuccessed(res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // for 血缘目录
    resetForLineage() {
      this.lineageTabForm.lineageName = ''
      this.$refs.formData1?.resetFields()
    },
    createJob(cron) {
      if (!cron && cron !== null) {
        this.$message.warning(this.$t('system.job.noCronWarning'))
        return
      }
      let params = {}
      if (this.$refs.jobParams && this.$refs.jobParams.getParam) {
        params = this.$refs.jobParams.getParam()
        params.canExecuteDateTemplates =
          this.jobDetails.jobContent.canExecuteDateTemplates
      } else {
        params = this.jobDetails.jobContent
      }
      params.schedule = cron ? 'cron:' + cron : null

      params.expectedMemory = this.jobDetails.jobContent.expectedMemory
      let url = ''
      if (this.lineageTab) {
        url = `${this.$url}/service/lineage/folder/job`
        params.folderId = this.lineageId
        params.name = this.lineageTabForm.lineageName
        params.typeName = this.lineageTabForm.lineageName
        params['@class'] =
          'com.datablau.dam.data.job.descriptor.LoadLineageJobDescriptor'
        if (
          !this.lineageTabForm.lineageName ||
          !params.lineageType ||
          (!params.localFolder && !params.shareFolder)
        ) {
          this.$datablauMessage.warning('信息填写不完整')
          return
        }
      } else {
        url = `${this.$url}/service/datablau_jobs/`
        params.name = this.jobName
        params['@class'] =
          'com.datablau.server.core.job.DatablauJobPlanJobDescriptor'
      }

      this.$http
        .post(url, params)
        .then(res => {
          this.$message({
            message: this.$t(
              'quality.page.dataQualityRules.createdSuccessfully'
            ),
            type: 'success',
          })
          this.setJobSuccessed()
          this.$nextTick(() => {
            this.$emit('addSuccess', res.data)
          })
          if (this.lineageTab === true) {
            this.$emit('getTreeRef')
          }
          // this.$bus.$emit('removeTab')
          // this.$bus.$emit('reload')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDefatulname() {
      let result = ''
      const nowDate = new Date()
      result =
        `${this.$t('system.job.workflowJob')} -` +
        nowDate.getFullYear() +
        (nowDate.getMonth() + 1) +
        nowDate.getDate() +
        '-' +
        parseInt(Math.random() * 100)
      return result
    },
    // request to put new schedule
    updateJobSchedule(cron) {
      if (!cron && cron !== null) {
        this.$message.warning(this.$t('system.job.noCronWarning'))
        return
      }
      this.updateJob()
    },
    setJobSuccessed(job) {
      if (job && job.id && job.id != '8') {
        this.$message({
          type: 'success',
          message: this.$t('system.job.jobSetSuccess'),
        })
      }
      if (this.appName === 'DDD') {
        window.parent.postMessage(
          JSON.stringify({ type: 'databaseManagement' }),
          '*'
        )
        return
      }
      if (job && job.name && job.type === 'ClusterColumnJobDescriptor') {
        this.$emit('pageJob')
      }
      this.removeJobId()
    },
    testShareCatalog() {
      if (this.showTestBtn) {
        const self = this
        let jobCon = {}
        let params = {}
        if (this.$refs.jobParams && this.$refs.jobParams.getParam) {
          params = this.$refs.jobParams.getParam()
        } else {
          params = this.jobDetails.jobContent
        }
        jobCon = params
        jobCon.schedule = 'cron:' + this.getSchedule()
        let test = false
        if (this.$refs.jobParams && this.$refs.jobParams.validateForTest) {
          test = this.$refs.jobParams.validateForTest()
        }
        if (!test) {
          return
        }
        let shareFolder = ''
        if (this.$refs.jobParams && this.$refs.jobParams.getFolder) {
          shareFolder = this.$refs.jobParams.getFolder()
        }
        self.jobDetails.jobContent.shareFolder =
          this.preFloderAddress + shareFolder
        // false &&
        if (this.lineageTab) {
          jobCon['@class'] =
            'com.datablau.dam.data.job.descriptor.LoadLineageJobDescriptor'
        }
        self.$http
          .post(this.$url + '/service/main/tryAccessShareFolder', jobCon)
          .then(res => {
            const data = res
            self.$message({
              type: 'success',
              message: this.$t('system.job.shareFolderTestSuccess'),
            })
            this.isTestTrue = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getSchedule() {
      return this.jobDetails.schedule
    },
    getCronString(cronString, type) {
      this.jobDetails.schedule = cronString
    },
    shareStateChange(bool) {
      this.couldTestShareCatalog = bool
    },
    handleTermRecognizerJob() {},
    showJobResult(row) {
      let resultStr = ''
      if (row.failureCause) {
        resultStr = row.failureCause
      } else if (!this.$utils.isJSON(row.result)) {
        resultStr = row.result
      }
      // resultStr = ``
      this.resultDialogVisible = true
      this.resultString = resultStr
    },
    formatJobResult(str) {
      str = str || ''
      let totalCount = 0
      let failCount = 0
      let hasFail = false
      let failArr = []
      const arr = str.split('。其中')
      const success = arr[0] || ''
      const result = []
      let allFileArr = success.split(':')
      // allFileArr = (allFileArr[1] || '').split(',')
      if (allFileArr[1] && allFileArr[1] !== '') {
        allFileArr = (allFileArr[1] || '').split(',')
      } else {
        allFileArr = []
      }
      totalCount = allFileArr.length || 0
      if (arr.length > 1) {
        hasFail = true
        failArr = arr[1] || ''
        failArr = failArr.split('失败的文件:')
        failArr = failArr[1] || ''
        failArr = failArr.split('|')
        failCount = failArr.length || 0
      }
      if (hasFail) {
        result.push(`共处理文件 ${totalCount} 个，其中失败 ${failCount} 个。`)
        failArr.forEach(item => {
          result.push(item)
        })
      } else {
        result.push(`共处理文件 ${totalCount} 个, 全部成功`)
      }

      const resultHtml = `<span>${result.join('</span><br/><span>')}</span>`
      let allFileArrHtml = ''
      if (allFileArr.length > 0) {
        allFileArrHtml = `<span>所有文件列表：</span><br/><span>${allFileArr.join(
          '</span><br/><span>'
        )}</span>`
      }

      return { resultHtml, allFileArrHtml, failArr }
    },
    expandDetailRow(row, column, event) {
      if (this.jobDetails.type === 'LoadLineageJobDescriptor' && row.result) {
        if (this.expandRowKeys.includes(row.id)) {
          this.expandRowKeys = []
        } else {
          this.expandRowKeys = [row.id]
        }
      } else {
        this.expandRowKeys = []
      }
    },
    paramsValidationChange(newVal) {
      this.paramsValidation = newVal
    },
    statusFormatter(status) {
      return this.$t('quality.page.qualityExamineJob.statusList.' + status)
    },
    // 设置颜色
    getJobColor(status) {
      let color = '#ccc'
      switch (status) {
        case 'FINISHED':
          color = '#66BF16'
          break
        case 'FAILED':
          color = '#F2220A'
          break
        case 'NOT_RUN':
          color = '#5dc4c0'
          break
        case 'SKIPPED':
        case 'STOPPED':
          color = '#999999'
          break
        case 'RUNNING':
          color = '#409EFF'
          break
        case 'INIT':
          color = '#e6ad00'
          break
      }
      return color
    },
  },
  computed: {
    showJobPram() {
      let bool = false
      const typeList = this.paraJobsList
      typeList.forEach(item => {
        if (this.jobDetails.type === item) {
          bool = true
        }
      })
      return bool
    },
    showTestBtn() {
      let result = false
      if (this.jobDetails.type === 'LoadDataStageJobFileJobDescriptor') {
        result = true
      }
      if (
        this.jobDetails.type === 'LoadLineageJobDescriptor' &&
        this.addressType === 'share'
      ) {
        result = true
      }
      return result
    },
    // couldTestShareCatalog() {
    //   let bool = false;
    //   let jobCon = {};
    //   jobCon = this.jobDetails.jobContent;
    //   if (
    //     this.jobDetails.type === 'LoadDataStageJobFileJobDescriptor'
    //     && jobCon
    //     && jobCon.shareFolder
    //   ) {
    //     bool = true;
    //   }
    //   return bool;
    // }
  },
  watch: {
    job: {
      handler(val) {
        if (val) {
          this.isAdd = this.job.id === 'add'
          if (this.jobtype === 'ClusterColumnJobDescriptor') {
            if (JSON.stringify(val) === '{}') {
              this.jobLoading = true
            } else {
              this.jobLoading = false
              this.jobDetails = _.clone(val)
              this.jobDetails.id = val.id || val.jobId
              this.jobDetails.jobContent = JSON.parse(
                this.jobDetails.jobContent
              )
            }
          }
        }
      },
      immediate: true,
      deep: true,
    },
    jobDetails: {
      handler(val) {
        if (val) {
          this.jobCount++
        }
      },
      deep: true,
    },
    'lineageTabForm.lineageName': {
      handler(val) {
        if (val !== '') {
          this.lineageTabName = true
        } else {
          this.lineageTabName = false
        }
      },
      deep: true,
    },
  },
}
