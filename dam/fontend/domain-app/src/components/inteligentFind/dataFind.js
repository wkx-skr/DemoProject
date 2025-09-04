import chooseDatasource from './chooseTableItem.vue'
// import jobDetail from '@/components/jobManagement/jobDetail.vue'
import DomainJob from './DomainJob.vue'
import jobResult from './jobResult.vue'
import rejectTab from './rejectTab.vue'
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  data() {
    return {
      currentTab: 'showDadaSource',
      currentName: this.$t('domain.dataFind.dataRange'),
      breadcrumbData: [
        this.$t('domain.dataFind.dataFind'),
        this.$t('domain.common.preview'),
      ],
      showHome: true,
      recJob: {},
      jobSta: {},
      countResult: 0,
      showStopJobBtn: false,
      currentInstanceId: '',
      lastInstantsId: null,
      jobExist: false,
      choosedModels: [],
      jobNeverRun: true,
      tabsArr: ['showDadaSource', 'jobResult', 'showJobDetail', 'openSeeRejectTable'],
      tryeEnableJbo: false,
      getJobStatusTimer: null,
      isDestory: false,
      compareConfigObj: {},
      currentJobId: '',
    }
  },
  components: {
    // dataSourceTab,
    jobResult,
    // jobDetail,
    chooseDatasource,
    rejectTab,
    DomainJob,
  },
  computed: {
    btnDisable() {},
  },
  mounted() {
    const obj = this.$route.query
    const showDetail = () => {
      if (Object.keys(obj).length > 0) {
        if (obj.showJobDetail) {
          this.checkJobDetail()
        } else {
          this.checkResult()
        }
      }
    }
    this.$bus.$on('goBackHome', this.backClick)
    this.$bus.$on('removeTab', this.backClick)
    this.getJob(showDetail)
    // this.getModles();
  },
  beforeDestroy() {
    this.isDestory = true
    if (this.getJobStatusTimer) {
      clearTimeout(this.getJobStatusTimer)
      // this.getJobStatusTimer = null;
    }
    this.$bus.$off('removeTab')
    this.$bus.$off('goBackHome')
  },
  methods: {
    backClick(e) {
      console.log(e, 'e')
      this.showHome = true
      this.getJob()
    },
    nodeClick(node) {
      let clickNode = node.name || node
      console.log(clickNode, 'clickNode')
      if (clickNode === this.$t('domain.dataFind.dataFind')) {
        this.showHome = true
      }
    },
    startJob() {
      this.$nextTick(() => {
        if (this.recJob) {
          this.$http
            // .put( this.$job_url + '/service/datablau_jobs/' + this.recJob.jobId + '/run' )
            .post(
              this.$job_url +
                `/main/startJob?jobId=${this.recJob.jobId}&executor=admin`
            )
            .then(res => {
              // this.showStopJobBtn = true
              this.getStatus()
              this.tryeEnableJbo = false
            })
            .catch(e => {
              const message =
                (e.response &&
                  e.response.data &&
                  e.response.data.errorMessage) ||
                ''
              // TODO
              // 后台国际化时, 需要处理, 前后台需要同步
              if (
                message === this.$t('domain.dataFind.taskDisabled') &&
                !this.tryeEnableJbo
              ) {
                this.enableAndRumJob()
              } else {
                this.$showFailure(e)
              }
              this.tryeEnableJbo = false
            })
        }
      })
    },
    enableAndRumJob() {
      this.tryeEnableJbo = true
      this.$http
        .put(
          this.$job_url +
            '/service/datablau_jobs/' +
            this.recJob.jobId +
            '/enable'
        )
        .then(res => {
          this.startJob()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleShowDatasource() {
      const callback = () => {
        this.addTabsArr('showDadaSource')
      }
      this.getJob(callback)
    },
    checkResult() {
      this.addTabsArr('jobResult')
    },
    checkJobDetail() {
      this.addTabsArr('showJobDetail')
    },
    handleRemoveTab(name) {
      this.removeTab(name)
    },
    getJob(callback) {
      // TODO i18n
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: '数据标准-数据标准智能推荐任务',
      }
      this.$http
        .post(`${this.$job_url}/main/query/jobs/byDto`, options)
        .then(res => {
          const job = res.data.content[0]
          if (job) {
            this.currentJobId = job.jobId
            this.jobExist = true
            this.recJob = job
            this.lastInstantsId = job.jobInstanceId
            if (this.$utils.isJSON(this.recJob.jobContent)) {
              const obj = JSON.parse(this.recJob.jobContent)
              this.jobContent = obj
              let modelIds = []
              try {
                modelIds = JSON.parse(obj.parameters.find(i => i.parameterName === 'modelIds').value)
              } catch(e) {}

              if (modelIds && Array.isArray(modelIds)) {
                this.choosedModels = modelIds
              }
              let compareConfig = {}
              try {
                compareConfig = JSON.parse(obj.parameters.find(i => i.parameterName === 'searchConfig').value)
              } catch(e) {}
              if (compareConfig) {
                this.compareConfigObj = compareConfig
              }
            }
            callback && callback()
            this.getStatus()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getStatus() {
      let jobStatus = ''
      let started = true
      let param = {
        '@type': '.MultipleCriteria',
        criteria: [
          {
            '@type': '.FieldEqualsCriteria',
            fieldName: 'jobId',
            compareValue: this.recJob.jobId,
            notEqual: false,
          },
        ],
        page: {
          currentPage: 1,
          pageSize: 1,
          sortBy: [
            {
              field: 'createOn',
              order: 'DESC',
            },
          ],
        },
      }
      this.$http
        // .get(this.$job_url + '/main/' + this.recJob.jobId)
        .post(this.$job_url + '/main/query/jobResults/byCriteria', param)
        .then(res => {
          // {
          //   if (jobStatus === 'FINISHED' || jobStatus === 'FAILED') {
          //     this.showStopJobBtn = false
          //   } else {
          //     this.showStopJobBtn = true
          //   }
          //   this.getTotalItem()
          //   if (this.getJobStatusTimer) {
          //     clearTimeout(this.getJobStatusTimer)
          //     this.getJobStatusTimer = null
          //   }
          //   this.getJobStatusTimer = setTimeout(() => {
          //     this.getStatus()
          //   }, 5000)
          // }
          //
          clearTimeout(this.getJobStatusTimer)
          this.getJobStatusTimer = setTimeout(() => {
            this.getStatus()
          }, 5000)
          const instanceId = res.data.content[0].id
          if (!instanceId) {
            started = false
          } else if (
            (this.lastInstantsId || this.lastInstantsId === 0) &&
            this.lastInstantsId === instanceId
          ) {
            started = false
          } else {
            // started = true
          }
          if (instanceId) {
            this.currentInstanceId = instanceId
            // todo events接口已废弃，需要根据新接口重构以下逻辑
            this.$http
              .post(`/job/main/query/jobEvents/byCriteria`, {
                '@type': '.FieldEqualsCriteria',
                page: null,
                fieldName: 'jobId',
                compareValue: this.recJob.jobId,
                notEqual: false,
              })
              .then(res => {
                const arr = res.data.content
                if (arr && Array.isArray(arr) && arr.length > 0) {
                  this.jobNeverRun = false
                  let count = 0
                  arr.forEach(item => {
                    let msg = item.message
                    // TODO
                    if (
                      msg &&
                      msg.indexOf(this.$t('domain.dataFind.save')) === 0
                    ) {
                      const num = Number.parseInt(item.message.slice(2))
                      if (num > 0) {
                        count += num
                      }
                    }
                  })
                  let ifFinished = false
                  const obj = arr[arr.length - 1]
                  if (started) {
                    if (obj.percent < 100) {
                      ifFinished = false
                      this.showStopJobBtn = true
                    } else {
                      this.showStopJobBtn = false
                      ifFinished = true
                    }
                  } else {
                    if (jobStatus === 'RUNNING') {
                      ifFinished = false
                      this.showStopJobBtn = false
                    }
                  }
                  obj.percent = obj.percent > 0 ? obj.percent : 0
                  this.jobSta = obj
                  if (!ifFinished && !this.isDestory) {
                    // this.showStopJobBtn = true
                    this.countResult = count
                    $('.progress-bar .finished').css({
                      width: this.jobSta.percent + '%',
                    })
                  } else {
                    this.showStopJobBtn = false
                    $('.progress-bar .finished').css({ width: '100%' })
                    this.getTotalItem()
                  }
                } else {
                  this.jobSta = null
                  this.getTotalItem()
                }
              })
              .catch(e => this.$showFailure(e))
          }
        })
        .catch(e => this.$showFailure(e))

      // // get result data
      // this.$http.get( this.$meta_url + '/service/entities/domains/candidates?pageSize=1')
      // .then(res => {
      //   this.countResult = res.data.totalElements;
      // })
      // .catch(e => this.$showFailure(e));
    },
    getTotalItem() {
      this.$http
        .get(
          this.$meta_url + '/service/entities/domains/candidates?pageSize=1'
        )
        .then(res => {
          this.countResult = res.data.totalElements
          if (this.countResult > 0) {
            this.jobNeverRun = false
          }
        })
        .catch(e => this.$showFailure(e))
    },
    stopJob() {
      if (!this.currentInstanceId) {
        this.$message.info(this.$t('domain.dataFind.taskNotFind'))
        return
      }
      this.$http
        .post(this.$job_url + '/main/stopJob?jobId=' + this.currentJobId)
        .then(res => {
          this.showStopJobBtn = false
        })
        .catch(e => this.$showFailure(e))
    },
    handleChangeModel(datasources, compareConfig) {
      const json = JSON.parse(this.recJob.jobContent)
      json.parameters.forEach(p => {
        if (p.parameterName === 'searchConfig') {
          p.value = JSON.stringify(compareConfig)
        } else if (p.parameterName === 'modelIds') {
          p.value = JSON.stringify(datasources)
        }
      })
      this.$http
        .post(
          this.$meta_url + `/service/jobs/updateJob?jobId=${this.recJob.jobId}`,
          json
        )
        .then(res => {
          this.$message.success(this.$t('domain.common.modifySuccessfully'))
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeTab(name) {
      // const index = this.tabsArr.findIndex(item => {
      //   return item === name
      // })
      // if (index !== -1) {
      //   this.tabsArr.splice(index, 1)
      // }
      this.currentTab = 'showDadaSource'
    },
    addTabsArr(name) {
      this.currentName =
        name === 'showJobDetail'
          ? this.$t('domain.dataFind.runTime')
          : name === 'showDadaSource'
          ? this.$t('domain.dataFind.dataRange')
          : this.$t('domain.dataFind.scanResult')
      // this.nodeClick(this.currentName)
      // const index = this.tabsArr.findIndex(item => {
      //   return item === name
      // })
      // if (index === -1) {
      //   this.tabsArr.push(name)
      // }
      // this.
      this.$nextTick(() => {
        this.currentTab = name
        this.showHome = false
      })
    },
    tabClick(node) {
      if (node.name === 'showDadaSource') {
        const callback = () => {
          this.addTabsArr('showDadaSource')
        }
        this.getJob(callback)
      } else {
        if (node.name !== 'showJobDetail') {
          this.$refs[node.name][0].refresh()
        }
        this.$nextTick(() => {
          this.currentTab = node.name
        })
      }
    },
  },
  watch: {
    currentTab(newVal) {
      if (this.$refs[newVal] && this.$refs[newVal][0].resizeTable) {
        this.$refs[newVal][0].resizeTable()
      }
    },
  },
}
