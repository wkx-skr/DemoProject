import jobList from './jobList.vue'
import jobDetail from './jobDetail.vue'
import jobDomainDetail from './jobDomainDetail.vue'

import jResult from './result.vue'
import problemDetail from '../repairJob/jobDetail.vue'
export default {
  components: {
    jobList,
    jobDetail,
    jResult,
    problemDetail,
    jobDomainDetail,
  },
  data() {
    return {
      currentTab: 'jobList',
      showAddPane: false,
      jobs: {},
      jobsArray: [],
      jobsResult: [],
      jobsResult2: [],
      jobsResultMap: {},
      rules: [],
      rulesMap: {},
      rulesIdMap: {},
      categories: [],
      showPart: 1,
      detail: '',
      historyResult: '',
      questionData: '',
      jobListData: {},
      dataQualityDelete: ['rules', 'jobsResult', 'categories'],
      nodeData: [],
    }
  },
  mounted() {
    // 获取系统
    this.$getModelCategories()
    this.$bus.$on('addJob', this.addJob)
    this.$bus.$on('editJob', (job, jobListData) => {
      this.jobListData = jobListData
      this.editJob(job)
    })
    this.$bus.$on('jobAddedOrUpdated', name => {
      if (name) {
        // this.removeTab(name);
      } else {
        this.removeTab('add')
      }
    })
    this.$bus.$on('tabRemoved', name => {
      this.removeTab(name)
    })
    this.$bus.$on('jobsDeleted', jobs => {
      jobs.forEach(job => {
        this.removeTab(job.name)
      })
    })
    this.$bus.$on('showJobResult', (job, jobListData) => {
      this.jobListData = jobListData
      this.showJobResult(job)
    })
    this.$bus.$on('showJobResult2', (job, jobListData) => {
      this.jobListData = jobListData
      this.showJobResult2(job)
    })
    // this.loadAllRules();
    this.$bus.$on('loadJobs', () => {
      this.loadQualityJobs()
    })
  },
  beforeDestroy() {
    this.$bus.$off('addJob')
    this.$bus.$off('editJob')
    this.$bus.$off('jobAddedOrUpdated')
    this.$bus.$off('jobsDeleted')
    this.$bus.$off('tabRemoved')
    this.$bus.$off('showJobResult')
    this.$bus.$off('showJobResult2')
    this.$bus.$off('loadJobs')
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
  },
  methods: {
    reloadJobs() {
      this.$refs.jobList.getJobs()
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.removeDetail()
      }
    },
    removeDetail() {
      this.showPart = 1
    },
    addJob(jobListData) {
      // this.showAddPane = true;
      // this.currentTab = 'add';
      this.jobListData = jobListData
      this.showPart = 2
      this.detail = ''
      this.nodeData = [
        { name: this.$t('common.page.qualityExamineJob'), couldClick: false },
        {
          name: this.$t('quality.page.qualityExamineJob.createTask'),
          couldClick: false,
        },
      ]
    },
    addJobDomain(jobListData) {
      // this.showAddPane = true;
      // this.currentTab = 'add';
      // this.jobListData = jobListData
      this.showPart = 5
      this.detail = ''
      this.nodeData = [
        { name: this.$t('common.page.qualityExamineJob'), couldClick: false },
        {
          name: '新建标准检核任务',
          couldClick: false,
        },
      ]
    },
    editJob(job) {
      if (job.jobType === '标准核检任务') {
        this.showPart = 5
      } else {
        this.showPart = 2
      }
      this.detail = job
      const jobName = job.name
      if (this.jobs[jobName]) {
      } else {
        this.jobs[jobName] = job
        this.jobsArray.push(job)
      }
      this.currentTab = jobName
      this.nodeData = [
        { name: this.$t('common.page.qualityExamineJob'), couldClick: false },
        { name: job.name, couldClick: false },
      ]
    },
    toBackList(jobListData) {
      this.showPart = 1
      this.jobListData = jobListData
    },
    showProblemDetail(val) {
      this.showPart = 4
      this.questionData = val
    },
    showJobResult(job) {
      this.showPart = 3
      const jobName = job.name
      this.jobsResult = job
      this.currentTab = 'result:' + jobName
      this.historyResult = ''
      this.nodeData = [
        { name: this.$t('common.page.qualityExamineJob'), couldClick: false },
        { name: jobName, couldClick: false },
      ]
    },
    showJobResult2(job) {
      this.showPart = 3
      const jobName = job.name
      this.jobsResult = job
      this.currentTab = 'result:' + jobName
      this.nodeData = [
        { name: this.$t('common.page.qualityExamineJob'), couldClick: false },
        { name: job.name, couldClick: false },
      ]
    },
    removeTab(tabName) {
      // if (tabName == 'add') {
      //   this.currentTab = 'jobList'
      //   this.showAddPane = false
      // } else if (tabName.indexOf('result:') == 0) {
      //   this.currentTab = 'jobList'
      //   delete this.jobsResultMap[tabName.slice(7)]
      //   this.jobsResult.forEach((item, index) => {
      //     if (item.name == tabName.slice(7)) {
      //       this.jobsResult.splice(index, 1)
      //     }
      //   })
      // } else {
      //   this.currentTab = 'jobList'
      //   delete this.jobs[tabName]
      //   this.jobsArray.forEach((item, index) => {
      //     if (item.name == tabName) {
      //       this.jobsArray.splice(index, 1)
      //     }
      //   })
      //   if (Object.keys(this.jobs) == 0) {
      //     this.jobs = {}
      //   }
      // }
    },
    historyData(val) {
      this.historyResult = val
    },
    loadAllRules() {
      var self = this
      self.$http
        .get(this.$url + '/service/quality/rules/tech/report')
        .then(res => {
          self.rules = res.data
          self.rulesMap = {}
          self.rulesIdMap = {}
          self.rules.forEach(item => {
            if (item.name) {
              this.rulesMap[item.name] = item
              this.rulesIdMap[item.id] = item
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    resetTableStyle(currentTab) {
      const ruleResultTab = this.$refs.ruleResultTab
      if (ruleResultTab && Array.isArray(ruleResultTab)) {
        ruleResultTab.forEach(item => {
          if (item.resize) {
            this.$nextTick(item.resize)
          }
        })
      }
    },
  },
  computed: {
    showTabs() {
      return (
        this.showAddPane ||
        this.jobsResult.length > 0 ||
        this.jobsArray.length > 0
      )
    },
  },
  watch: {
    currentTab(newVal) {
      if (/result:/.test(newVal)) {
        this.resetTableStyle(newVal)
      }
    },
  },
}
