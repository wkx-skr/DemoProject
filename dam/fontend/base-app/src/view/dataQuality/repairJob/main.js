import jobList from './jobList.vue'
const jobDetail = () => import('./jobDetail.vue')
const showProblemData = () => import('./showProblemData.vue')
export default {
  props: {
    isMonitor: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCheck: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    jobList,
    jobDetail,
    showProblemData,
  },
  data() {
    return {
      currentTab: 'jobList',
      showAddPane: false,
      jobs: {},
      jobsArray: [],
      jobsDetail: [], // the varible be send to quality-detail.vue
      jobsResult: [],
      jobsResultMap: {},
      total: null,
      jobsDisplay: null,
      defaultPara: {
        currentPage: 1,
        pageSize: 20,
        taskName: '',
        modelCategoryId: null,
        status: '',
        beginTime: null,
        endTime: null,
        owner: '',
        orderCol: 'createOn',
        orderType: 'DESC',
        verifyStatus: '',
        verify: this.isCheck,
        monitor: this.isMonitor,
        techRuleId: '',
      },
      isOwner: false,
      taskId: null,
      task: Object,
      // isMonitor: {
      //   type: Boolean,
      //   required: false,
      //   default: false
      // },
      showProblemDataPane: false,
      lastTabName: '',
      canSave: false,
      nameMapping: {},
      deleteArr: [
        'jobs',
        'jobsArray',
        'jobsDetail',
        'jobsResult',
        'jobsResultMap',
        'jobsDisplay',
        'defaultPara',
        'task',
      ],
      nodeData: [],
      showName: '',
      jobData: [],
    }
  },
  beforeRouteEnter(to, from, next) {
    //  这里的vm指的就是vue实例，可以用来当做this使用
    if (from.fullPath === '/main/dashboard/dataCatalogDashboard') {
      sessionStorage.setItem('getInitInfoFlag', 'true')
      next()
    } else {
      sessionStorage.setItem('getInitInfoFlag', 'false')
      next()
    }
  },
  mounted() {
    this.$bus.$on('addJob', this.addJob)
    this.$bus.$on('editJob', (job, canSave) => {
      this.canSave = canSave
      this.editJob(job)
      this.jobData = job
    })
    this.$bus.$on('jobAddedOrUpdated', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
    this.$bus.$on('tabRemoved', name => {
      this.removeTab(name)
    })
    this.$bus.$on('removeProblemData', name => {
      this.removeProblemData()
    })
    this.$bus.$on('jobsDeleted', jobs => {
      jobs.forEach(job => {
        this.removeTab(job.name)
      })
    })
    this.$bus.$on('showJobResult', job => {
      this.showJobResult(job)
    })
    this.$bus.$on('showProblemData', (taskId, task, isMonitor) => {
      // this.lastTabName = this.currentTab
      this.showProblemData(taskId, task, isMonitor)
      this.nodeData = [
        {
          name: this.isCheck
            ? this.$t('common.page.dataQualityCheck')
            : this.isMonitor
            ? this.$t('common.page.dataQualityMonitor')
            : this.$t('common.page.dataQualityRepairJob'),
          couldClick: false,
        },
        { name: task.name, level: 2 },
        {
          name: this.$t('quality.page.dataQualityRepairJob.problemData'),
          couldClick: false,
        },
      ]
      this.showProblemDataPane = true
      this.showName = 'seetask'
    })
    this.$bus.$on('refreshList', isDelay => {
      if (!isDelay) {
        this.refreshCallback()
        return
      }
      setTimeout(() => {
        this.refreshCallback()
      }, 5000)
    })
    //  this.loadAllRules();
  },
  beforeDestroy() {
    this.$bus.$off('addJob')
    this.$bus.$off('editJob')
    this.$bus.$off('jobAddedOrUpdated')
    this.$bus.$off('jobsDeleted')
    this.$bus.$off('tabRemoved')
    this.$bus.$off('showJobResult')
    this.$bus.$off('showSelf')
    this.$bus.$off('showProblemData')
    this.$bus.$off('refreshList')
    this.deleteArr.forEach(item => {
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
  },
  methods: {
    nodeClickTaskName(node) {
      if (node.level === 1) {
        this.removeTab()
      } else if (node.level === 2) {
        this.$refs.jobList.handleRowClick(this.task)
      }
    },
    removeProblemData() {
      this.showProblemDataPane = false
    },
    refreshCallback() {
      this.$refs.jobList.reloadJobs()
    },
    saveNameMapping(nameMapping) {
      this.nameMapping = nameMapping
    },
    addJob() {
      this.showAddPane = true
      this.currentTab = 'add'
      this.showProblemDataPane = true
      this.showName = 'add'
      this.nodeData = [
        {
          name: this.isCheck
            ? this.$t('common.page.dataQualityCheck')
            : this.isMonitor
            ? this.$t('common.page.dataQualityMonitor')
            : this.$t('common.page.dataQualityRepairJob'),
          couldClick: false,
        },
        {
          name: this.$t('quality.page.dataQualityRepairJob.createProblem'),
          couldClick: false,
        },
      ]
    },
    editJob(job) {
      const jobName = job.name
      if (this.jobs[jobName]) {
      } else {
        this.jobs[jobName] = job
        this.jobsArray.push(job)
      }
      this.currentTab = jobName
      this.showProblemDataPane = true
      this.showName = 'seedetail'
      this.nodeData = [
        {
          name: this.isCheck
            ? this.$t('common.page.dataQualityCheck')
            : this.isMonitor
            ? this.$t('common.page.dataQualityMonitor')
            : this.$t('common.page.dataQualityRepairJob'),
          couldClick: false,
        },
        { name: jobName, couldClick: false },
      ]
    },
    showJobResult(job) {
      const jobName = job.name
      if (this.jobsResultMap[jobName]) {
      } else {
        this.jobsResultMap[jobName] = job
        this.jobsResult.push(job)
      }
      this.currentTab = 'result:' + jobName
    },
    showProblemData(taskId, task, isMonitor) {
      // this.currentTab = 'showProblemData'
      this.taskId = taskId
      this.task = task
      // this.isMonitor = isMonitor
    },
    removeTab(tabName) {
      this.showProblemDataPane = false
      this.refreshCallback()
      // if (tabName === 'add') {
      //   this.currentTab = 'jobList'
      //   this.showAddPane = false
      // } else if (tabName === 'showProblemData') {
      //   this.currentTab = this.lastTabName
      //   this.showProblemDataPane = false
      // } else if (tabName.indexOf('result:') === 0) {
      //   this.currentTab = 'jobList'
      //   delete this.jobsResultMap[tabName.slice(7)]
      //   this.jobsResult.forEach((item, index) => {
      //     if (item.name === tabName.slice(7)) {
      //       this.jobsResult.splice(index, 1)
      //     }
      //   })
      // } else {
      //   this.currentTab = this.showProblemDataPane
      //     ? 'showProblemData'
      //     : 'jobList'
      //   delete this.jobs[tabName]
      //   this.jobsArray.forEach((item, index) => {
      //     if (item.name === tabName) {
      //       this.jobsArray.splice(index, 1)
      //     }
      //   })
      //   if (Object.keys(this.jobs) === 0) {
      //     this.jobs = {}
      //   }
      //   this.lastTabName = 'jobList'
      //   !this.isCheck && !this.isMonitor && this.refreshCallback()
      // }
    },
    loadAllRules(para) {
      var self = this
      self.$http
        .get(this.$quality_url + '/quality/rules/tech/report')
        .then(res => {
          self.rules = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    loadQualityJobs(para) {
      if (!para) {
        para = _.clone(this.defaultPara)
        this.$refs.jobList.resetTableSta(para)
      }
      for (const key in para) {
        if (key !== 'taskType' && !para[key]) {
          para[key] = null
        }
      }
      if (this.isMonitor && para.owner && para.owner.length === 0) {
        this.total = 0
        this.jobsDetail = []
        this.jobsDisplay = []
        this.$bus.$emit('repairJobLoaded', [])
      } else {
        this.$bus.$emit('setLoading', true)
        this.$http
          .post(this.$quality_url + '/quality/rule/tasks', para)
          .then(res => {
            this.$bus.$emit('setLoading', false)
            let arr = []
            this.total = arr.length
            if (res.data && Array.isArray(res.data.content)) {
              arr = res.data.content
              this.total = res.data.totalItems
              if (
                arr.length === 0 &&
                this.$route.query.name &&
                this.$route.query.name === para.taskName
              ) {
                this.$datablauMessage.warning(
                  '您暂无权限查看此问题清单，或该问题清单已被删除'
                )
              }
            }
            this.jobsDetail = arr
            this.jobsDisplay = arr
            this.$bus.$emit('repairJobLoaded', arr)
          })
          .catch(e => {
            this.$bus.$emit('setLoading', false)
            this.$showFailure(e)
          })
      }
    },
  },
  computed: {
    showTabs() {
      return (
        this.showAddPane ||
        this.showProblemDataPane ||
        this.jobsArray.length > 0
      )
    },
  },
}
