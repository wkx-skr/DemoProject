import chooseDatasource from './chooseTableItem.vue'
import jobDetail from '@/components/jobManagement/jobDetail.vue'
import jobResult from './jobResult.vue'
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
      tabsArr: ['showDadaSource', 'jobResult', 'showJobDetail'],
      tryeEnableJbo: false,
      getJobStatusTimer: null,
      isDestory: false,
      compareConfigObj: {},
    }
  },
  components: {
    // dataSourceTab,
    jobResult,
    jobDetail,
    chooseDatasource,
  },
  computed: {
    btnDisable() {},
  },
  mounted() {
    this.$bus.$on('goBackHome', this.backClick)
    this.$bus.$on('removeTab', this.backClick)
    this.getJob()
    // this.getModles();
    const obj = this.$route.query
    if (Object.keys(obj).length > 0) {
      this.checkResult()
      // this.$nextTick(() => {
      //   this.currentTab = 'dataFind';
      // });
    }
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
            .put(
              this.$url + '/service/datablau_jobs/' + this.recJob.id + '/run'
            )
            .then(res => {
              this.showStopJobBtn = true
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
        .put(this.$url + '/service/datablau_jobs/' + this.recJob.id + '/enable')
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
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: 'RecommendDomainForColumnJobDescriptor',
      }
      this.$http
        .post(`${this.$url}/service/datablau_jobs/page`, options)
        .then(res => {
          const job = res.data.content[0]
          if (job) {
            this.jobExist = true
            this.recJob = job
            this.lastInstantsId = job.jobInstanceId
            if (this.$utils.isJSON(this.recJob.jobContent)) {
              const obj = JSON.parse(this.recJob.jobContent)
              this.jobContent = obj
              const modelIds = obj.modelIds
              if (modelIds && Array.isArray(modelIds)) {
                this.choosedModels = modelIds
              }
              if (obj.compareConfig) {
                this.compareConfigObj = obj.compareConfig
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
      this.$http
        .get(this.$url + '/service/datablau_jobs/' + this.recJob.id)
        .then(res => {
          jobStatus = res.data.status
          const instanceId = res.data.id
          if (!instanceId) {
            started = false
          } else if (
            (this.lastInstantsId || this.lastInstantsId === 0) &&
            this.lastInstantsId === instanceId
          ) {
            started = false
          } else {
            started = true
          }
          if (instanceId) {
            this.currentInstanceId = instanceId
            this.$http
              .get(
                this.$url + '/service/datablau_jobs/' + instanceId + '/events'
              )
              .then(res => {
                const arr = res.data
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
                  let ifFinished = true
                  const obj = arr[arr.length - 1]
                  if (started) {
                    if (obj.status === 'INFO' && obj.percent < 100) {
                      ifFinished = false
                    } else {
                      ifFinished = true
                    }
                  } else {
                    if (jobStatus === 'RUNNING') {
                      ifFinished = false
                    }
                  }
                  obj.percent = obj.percent > 0 ? obj.percent : 0
                  this.jobSta = obj
                  if (!ifFinished && !this.isDestory) {
                    this.showStopJobBtn = true
                    this.countResult = count
                    $('.progress-bar .finished').css({
                      width: this.jobSta.percent + '%',
                    })
                    if (this.getJobStatusTimer) {
                      clearTimeout(this.getJobStatusTimer)
                      this.getJobStatusTimer = null
                    }
                    this.getJobStatusTimer = setTimeout(() => {
                      this.getStatus()
                    }, 200)
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
      // this.$http.get( this.$url + '/service/entities/domains/candidates?pageSize=1')
      // .then(res => {
      //   this.countResult = res.data.totalElements;
      // })
      // .catch(e => this.$showFailure(e));
    },
    getTotalItem() {
      setTimeout(() => {
        this.$http
          .get(this.$meta_url + '/service/entities/domains/candidates?pageSize=1')
          .then(res => {
            this.countResult = res.data.totalElements
            if (this.countResult > 0) {
              this.jobNeverRun = false
              $('.progress-bar .finished').css({ width: '100%' })
            }
          })
          .catch(e => this.$showFailure(e))
      }, 500)
    },
    stopJob() {
      if (!this.currentInstanceId) {
        this.$message.info(this.$t('domain.dataFind.taskNotFind'))
        return
      }
      this.$http
        .put(
          this.$url +
            '/service/datablau_jobs/instances/' +
            this.currentInstanceId +
            '/stop'
        )
        .then(res => {})
        .catch(e => this.$showFailure(e))
    },
    handleChangeModel(datasources, compareConfig) {
      const ids = datasources
      const json = JSON.parse(this.recJob.jobContent)
      json.modelIds = ids
      json.compareConfig = compareConfig
      this.$http
        .put(this.$url + '/service/datablau_jobs/' + this.recJob.id, json)
        .then(res => {
          this.$message.success(this.$t('domain.common.modifySuccessfully'))
          this.handleRemoveTab('showDadaSource')
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
