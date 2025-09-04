import HTTP from '@/resource/http'
import paneList from './paneList.vue'
import EvaluteReport from './evaluateReport.vue'
import ChangeReport from './changeReport.vue'
import paneReport from './paneReport.vue'
import AddReport from './addReport.vue'
import DomainReport from './domainReport.vue'
import _ from 'lodash'
import scriptDetail from './scriptDetail.vue'
import modelItemTitle from '@/views/list/modelItemTitle.vue'

export default {
  props: {
    detail: {
      type: Object,
      required: true
    },
    currentPath: {
      type: String
    },
    // 通过 id 跳转到审批报告页面时使用
    hideList: {
      type: Boolean,
      default: false
    }
  },
  components: {
    paneList,
    paneReport,
    EvaluteReport,
    ChangeReport,
    DomainReport,
    AddReport,
    scriptDetail,
    modelItemTitle
  },
  mounted () {
    // 不显示列表时, 版本数据通过 报表 api 获取
    if (!this.hideList) {
      this.getVersions()
    }
  },
  beforeDestroy () {
    let query = _.clone(this.$route.query)
    delete query.rId
    this.$router.replace({ query: query })
  },
  data () {
    return {
      currentTab: 'list',
      tabLoading: false,
      reportsMap: {},
      tabs: [],
      addReportVisible: false,
      tabsKey: 0,
      Const: {
        publish: 'publish',
        change: 'change',
        domain: 'domain'
      },
      scriptPre: 'script/',
      modelVersionMap: new Map(),
      versions: new Map(), // 模型所有版本
      showReportDetailItem: false,
      // currentDetailItem: '',
      itemType: '',
      // reportDetailMap: {},
      getCurrentReportPromise: null,
      reportPromiseMap: new Map(),
      // currentReport: '',
      currentReportId: ''
    }
  },
  methods: {
    clickTab (tab) {
      console.log(tab)
      if (tab.name === 'list') {
        this.$router.replace({
          query: {
            id: this.$route.query.id,
            pId: this.$route.query.pId
          }
        })
      } else {
        this.$router.replace({
          query: {
            id: this.$route.query.id,
            pId: this.$route.query.pId,
            rId: tab.name
          }
        })
      }
    },
    removeTab (id) {
      if (id === this.Const.publish) {
        this.addReportVisible = false
        this.currentTab = 'list'
      } else {
        let query = _.clone(this.$route.query)
        delete query.rId
        this.$router.replace({ query: query })
        let index = this.tabs.indexOf(Number.parseInt(id))
        this.tabs.splice(index, 1)
        this.currentTab = 'list'
      }

      if (this.tabs.indexOf(this.currentTab) === -1) {
        this.currentTab = 'list'
      }
    },
    handldeRowDelete (row) {
      this.removeTab(row.id)
    },
    handleRowClick (row) {
      if (!row.id) {
        return this.$showFailure('未找到指定报告')
      }
      this.currentReportId = row.id
      let index = this.tabs.indexOf(row.id)
      if (index === -1 || !this.reportPromiseMap.get(row.id)) {
        let getCurrentReportPromise = HTTP.getReport({ id: row.id, entire: true })
        this.reportPromiseMap.set(row.id, getCurrentReportPromise)
      }
      this.getCurrentReportPromise = this.reportPromiseMap.get(row.id)
      this.currentTab = String(row.id)
      this.getCurrentReportPromise
        .then(res => {
          let data = res
          if (data.state.toLowerCase() === 'generating') {
            // 报告生成中, 1s 后继续刷新
            setTimeout(() => {
              this.updateModelReport(row.id)
            }, 1000)
            return
          }
          // this.reportsMap[row.id] = res
          this.$set(this.reportsMap, row.id, res)
          this.$bus.$emit('update-status', data)
          if (this.hideList) {
            let versions = res.version
            let versionsMap = new Map()
            for (let key in versions) {
              versionsMap.set(Number(key), versions[key])
            }
            this.versions = versionsMap
          }
          if (index === -1) {
            this.tabs.push(row.id)
          }

          this.updateModelVersion({
            id: res.id,
            versions: res.modelVersionIds
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateModelReport (reportId) {
      this.reportPromiseMap.set(reportId, null)
      this.handleRowClick({ id: Number(this.currentTab) })
    },
    getVersions () {
      this.tabLoading = true
      HTTP.getVersions({
        modelId: this.detail.id,
        successCallback: data => {
          data.forEach(item => {
            this.versions.set(item.id, item.name)
          })
        },
        finallyCallback: () => {
          this.tabLoading = false
        }
      })
    },
    scanDetail (report) {
      this.currentReportId = report.id
      // this.currentReport = '|' + String(report.id)
      this.itemType = 'detail'
      // this.currentDetailItem = `${report.name} ${this.$store.state.$v.report.detail}`
      this.showReportDetailItem = true
    },
    scanChange (report) {
      this.currentReportId = report.id
      // this.currentReport = '|' + String(report.id)
      this.itemType = 'change'
      // this.currentDetailItem = this.Const.change + report.id

      this.showReportDetailItem = true
    },
    scanDomain (report) {
      this.currentReportId = report.id
      // this.currentReport = '|' + String(report.id)
      this.itemType = 'domain'
      // this.currentDetailItem = this.Const.domain + String(report.id)

      this.showReportDetailItem = true
    },
    reloadReports () {
      this.$refs.paneList.getData()
    },
    addReport () {
      this.addReportVisible = true
      this.currentTab = this.Const.publish
    },
    handleCloseAddReport () {
      this.addReportVisible = false
      this.currentTab = 'list'
    },
    updateModelVersion (obj) {
      let report = obj.id
      let versions = obj.versions
      versions.sort().reverse()
      this.modelVersionMap.set(obj.id, {
        endVersion: versions[0],
        startVersion: versions[1] ? versions[1] : versions[0]
      })
    },
    showScriptDetail (report) {
      this.currentReportId = report.id
      // this.currentReport = '|' + String(report.id)
      this.itemType = 'script'
      // this.currentDetailItem = this.scriptPre + String(report.id)
      this.showReportDetailItem = true
    },
    uploadScript () {
      this.reportPromiseMap.set(Number(this.currentTab), null)
      this.handleRowClick({ id: Number(this.currentTab) })
    },
    backToReportList () {
      this.itemType = ''
      // this.currentReport = ''
      // this.currentDetailItem = ''
      this.showReportDetailItem = false
    }
  },
  watch: {
    showTabs (newVal, oldVal) {
      this.$emit('hideTabs', !newVal)
    }
  },
  computed: {
    showTabs () {
      const res = !!(this.tabs.length > 0 || this.addReportVisible)
      return res
    }
  }
}
