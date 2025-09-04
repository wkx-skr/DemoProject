import echarts from 'echarts'
import multiProgress from './progressWithMultiparts.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import compareResult from './compareResult.vue'
import $ from 'jquery'
import moment from 'moment'
import HTTP from '@/resource/http.js'

export default {
  data () {
    return {
      modelDetail: {
        name: '',
        owner: '',
        currentVersion: '0',
        lastModificationTimestamp: 0,
        tableCount: 0,
        columnCount: 0,
        diagramCount: 0,
        description: this.$store.state.$v.modelDetail.noDescription,
        frozen: false,
        branch: false
      },
      // check
      reportWrongData: [],
      reportWarningData: [],
      reportTipsData: [],
      reportShowData: [],
      dupNameTableCount: 0,
      checkResultCount: [],
      reportTableHeight: 300,
      // tableWithoutCN: 0,
      withoutCNameColumnCount: 0,
      getCheckResult: false,
      // cNamePerArr: [],

      // er 图
      dataByType: {
        table: {},
        diagram: {},
        view: {},
        comment: {},
        relation: {}
      },

      // domain
      domainData: {
        pub: 0,
        pra: 0,
        none: 0
      },
      // domainPerArr: [],
      // currentTab: 'total',
      currentTab: 'compareDetail',

      // new data
      golabData: {}, // 全局报告 数据
      incrementalData: {}, // 增量报告 数据
      dataInfoTableData: [
        {
          type: this.$v.report.table,
          typeId: 'table',
          addCount: 0,
          updataCount: 0,
          removeCount: 0
        },
        {
          type: this.$v.report.column,
          typeId: 'column',
          addCount: 0,
          updataCount: 0,
          removeCount: 0
        }
      ],
      reportDetail: {
        id: '',
        name: '',
        creator: '',
        createTime: 0,
        jiraVersionName: '',
        jiraTaskNames: []
      },

      showCompareResult: false,
      orginIncreData: {},

      // new
      currentTabData: {},
      tableCount: 0,
      tableWithoutCN: 0,
      columnCount: 0,
      colWithoutCN: 0,
      tableColumnAllCount: 0,
      tableNoCnPer: 0,
      columnNoCnPer: 0,
      pubDomainPre: 0,
      praDomainPre: 0,

      loadingData: false

    }
  },
  props: {
    modelData: {},
    modelId: {
      type: [String, Number],
      default () {
        let query = this.$route.query
        return query.modelId ? query.modelId : ''
      },
      required: true
    },
    path: {
      type: [String, Array],
      required: true
    },
    reportData: {
      type: Object,
      required: true
    },
    getCurrentReportPromise: {
      required: true
    }
  },
  components: {
    multiProgress,
    spanWithTooltip,
    compareResult
  },
  computed: {
    cNamePerArr () {
      let result = [
        {
          name: this.$v.report.hasCN,
          eName: 'has-cName',
          value: 0
        },
        {
          name: this.$v.report.table,
          eName: 'table-none-cName',
          value: 0
        },
        {
          name: this.$v.report.column,
          eName: 'column-none-cName',
          value: 100
        }
      ]
      if (this.getCheckResult) {
        result = [
          {
            name: this.$v.report.hasCN,
            eName: 'has-cName',
            value: 100 - this.tableNoCnPer - this.columnNoCnPer
          },
          {
            name: this.$v.report.table,
            eName: 'table-none-cName',
            value: this.tableNoCnPer
          },
          {
            name: this.$v.report.column,
            eName: 'column-none-cName',
            value: this.columnNoCnPer
          }
        ]
      }
      return result
    },
    showReportData () {
      let result = {}
      let showData = this.currentTabData || {}
      result = {
        totalTables: showData.tableCnt,
        totalColumns: showData.columnCnt,
        totalThemes: showData.diagramCnt,
        modelVersion: this.modelDetail ? this.modelDetail.currentVersion || '' : ''
      }

      return result
    },
    domainPerArr () {
      let arr = []
      if (this.currentTabData) {
        let wPub = this.currentTabData.columnWithPublicDS || 0
        let wPra = this.currentTabData.columnWithPrivateDS || 0
        arr = [
          {
            name: this.$v.report.public1,
            value: wPub,
            eName: 'public'
          },
          {
            name: this.$v.report.private1,
            value: wPra,
            eName: 'private'
          },
          {
            name: this.$v.report.None,
            value: this.columnCount - wPub - wPra,
            eName: 'noneDomain'
          }
        ]
      }
      return arr
    },
    hasAuth () {
      return this.$isAdmin
    },
    ifFailed () {
      let bool = false
      bool = this.reportDetail.state === 'Failed'
      return bool
    }
  },
  beforeMount () {

  },
  mounted () {
    this.dataInit()
    // this.resetStyle()
    // $(window).resize(this.resetStyle)
  },
  beforeDestroy () {
    // $(window).unbind('resize', this.resetStyle)
  },
  methods: {
    dataInit () {
      this.getReportDetail()
      this.getModelInfo(this.modelId)
    },
    dateFormatter (timestamp) {
      moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    getReportDetail () {
      this.getCurrentReportPromise
        .then(data => {
          this.reportDetail = data
          this.getCheckResult = true
          this.$emit('loaded')
        })
        .catch(e => {
          this.$showFailure(e)
          this.closeLoading()
        })
    },
    setGlobalData () {
      let qrId = this.reportData.id
      if (qrId) {
        this.startLoading()
        this.getCurrentReportPromise
          .then(res => {
            let data = res.globalReport
            this.golabData = data
            if (this.currentTab === 'total') {
              this.currentTabData = this.golabData
              this.formatTabData()
            }
            this.formateRulecheck()
            this.closeLoading()
          })
          .catch(e => {
            this.$showFailure(e)
            this.closeLoading()
          })
      }
    },
    setIncrementalData () {
      let qrId = this.reportData.id
      if (qrId) {
        this.startLoading()
        this.getCurrentReportPromise
          .then(res => {
            let data = res.incrementalReport
            this.orginIncreData = data
            this.incrementalData = this.formatincreData(data)
            if (this.currentTab === 'incremental') {
              this.currentTabData = this.orginIncreData
              this.formatTabData()
            }
            this.formateRulecheck()

            let arr = []
            if (this.incrementalData) {
              arr = this.dataInfoTableData.map(item => {
                let obj = {}
                if (item.typeId === 'table') {
                  obj = {
                    type: item.type,
                    typeId: item.typeId,
                    addCount: this.incrementalData.tableAdded.length,
                    updataCount: this.incrementalData.tableModified.length,
                    removeCount: this.incrementalData.tableRemoved.length
                  }
                } else {
                  obj = {
                    type: item.type,
                    typeId: item.typeId,
                    addCount: this.incrementalData.columnAdded.length,
                    updataCount: this.incrementalData.columnModified.length,
                    removeCount: this.incrementalData.columnRemoved.length
                  }
                }
                return obj
              })
            }
            this.dataInfoTableData = arr
            this.closeLoading()
          })
          .catch(e => {
            this.$showFailure(e)
            this.closeLoading()
          })
      }
    },
    formatincreData (data) {
      let obj = {
        tableAdded: data.added['80000004'] || [],
        tableModified: data.modified['80000004'] || [],
        tableRemoved: data.removed['80000004'] || [],
        columnAdded: data.added['80000005'] || [],
        columnModified: data.modified['80000005'] || [],
        columnRemoved: data.removed['80000005'] || []
      }
      return obj
    },
    startLoading () {
      this.loadingData = true
    },
    closeLoading () {
      this.loadingData = false
    },
    backToReportList () {
      this.$emit('backToReportList')
    },
    uploadScript () {
      this.$emit('uploadScript')
    },
    handleRowClick (row) {
      this.handleCheckCnameRate(row.name)
    },
    handleChangeClick () {
      this.handleCheckCnameRate('update')
    },
    handleCheckCnameRate (type) {
      type = type || 'MQ-0'
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      let url = baseUrl + 'scanModel?id=' + this.modelId + '&path=' + this.path + '&checkResultType=' + type
      let versionId = ''
      if (this.reportDetail && this.reportDetail.ddmModelVersionId) {
        versionId = this.reportDetail.ddmModelVersionId
      }
      if (versionId) {
        url += `&versionId=${versionId}`
      }
      if (type === 'update') {
        url += '&showBottomTab=update'
      }
      let qrId = this.reportData.id
      if (qrId) {
        url += `&reportId=${qrId}`
        if (this.currentTab === 'incremental') {
          url += `&showType=incremental`
        }
      }
      window.open(url, '_blank')
    },
    handleCheckDomainRate () {
      this.$emit('checkCnameRate')
    },
    // detail
    getModelInfo (modelId) {
      this.getCurrentReportPromise
        .then(res => {
          let data = res.model
          if (!data) return
          this.modelDetail.name = data.name || ''
          this.modelDetail.owner = data.owner || ''
          this.modelDetail.currentVersion = data.currentVersion || ''
          this.modelDetail.diagramCount = data.diagramCount || 0
          this.modelDetail.frozen = data.frozen
          this.modelDetail.branch = data.branch
          this.modelDetail.description = data.description || this.$store.state.$v.modelDetail.noDescription
          this.modelDetail.lastModificationTimestamp = data.lastModificationTimestamp || 0
        })
        .catch(e => {
          this.$showFailure(e)
          // this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
        })
    },
    getModelDetail (modelId) {
      HTTP.getModelDomainDetail({
        modelId: modelId,
        successCallback: (data) => {
          if (data && Array.isArray(data)) {
            this.modelDetail.columnCount = data.length
            this.compute(data)
          }
        },
        failureCallback: (e) => {
          this.$showFailure(e)
        }
      })
    },
    compute (tableDataFull) {
      let tableSet = []
      let tableArr = []
      let report = {
        totalTable: 0,
        totalColumn: 0,
        'public': 0,
        'private': 0,
        none: 0
      }
      tableDataFull.forEach(item => {
        if (tableSet.indexOf(item.tN) === -1) {
          tableSet.push(item.tN)
        }
        if (item.p === true) {
          report['public']++
        } else if (item.p === false) {
          report['private']++
        } else if (item.p === null) {
          report.none++
        }
      })
      report.totalColumn = tableDataFull.length
      report.totalTable = tableSet.length
      this.modelDetail.tableCount = tableSet.length
      this.domainData.pub = report.public
      this.domainData.pra = report.private
      this.domainData.none = report.none
    },
    formateRulecheck () {
      // let tableWithoutCN = 0;
      let withoutCNameColumnCount = 0
      let dupNameTableCount = 0
      let resultCountMap = new Map()
      let reg = /[^/]+\/[^/]+\/[^/]+/ig

      if (!this.currentTabData || !this.currentTabData.ruleCheckResult) {
        return
      }
      let arr = this.currentTabData.ruleCheckResult.result || []
      let wrongData = []
      let warningData = []
      let tipsData = []
      if (arr && Array.isArray(arr) && arr.length > 0) {
        this.getCheckResult = true
        arr.forEach(item => {
          let obj = {}
          if (item.elementId && !item.e) {
            obj = item
          } else {
            obj = {
              type: item.t,
              elementId: item.e,
              level: item.l,
              modelId: item.mId,
              msg: item.m,
              path: item.p
            }
          }
          if (obj.type === 'MQ-5') {
            dupNameTableCount++
          }
          if (obj.type === 'MQ-0') {
            // tableWithoutCN++;
            let index = obj.path.indexOf('/')
            if (index !== -1) {
              index++
              index = obj.path.indexOf('/', index)
              if (index !== -1) {
                if (!reg.test(obj.path)) {
                  withoutCNameColumnCount++
                }
              }
            }
          }
          let resultArr = []
          if (!resultCountMap.has(obj.type)) {
            resultCountMap.set(obj.type, resultArr)
          } else {
            resultArr = resultCountMap.get(obj.type)
          }
          resultArr.push(obj)
          if (obj.level === 'ERROR') {
            wrongData.push(obj)
          } else if (obj.level === 'WARN') {
            warningData.push(obj)
          } else if (obj.level === 'INFO') {
            tipsData.push(obj)
          }
        })
      }
      let checkResultCount = []
      resultCountMap.forEach(item => {
        if (item && Array.isArray(item) && item.length > 0) {
          let obj = {
            name: item[0].type,
            msg: item[0].msg,
            level: item[0].level,
            count: item.length
          }
          checkResultCount.push(obj)
        }
      })
      this.checkResultCount = checkResultCount
      this.reportWrongData = wrongData
      this.reportWarningData = warningData
      this.reportTipsData = tipsData
      this.reportShowData = this.reportWrongData
      this.dupNameTableCount = dupNameTableCount
      // this.tableWithoutCN = tableWithoutCN;
      this.withoutCNameColumnCount = withoutCNameColumnCount

      let data = {
        seriesData: [
          {
            name: '错误',
            value: wrongData.length
          }, {
            name: '警告',
            value: warningData.length
          }, {
            name: '提示',
            value: tipsData.length
          }
        ]
      }
    },
    // resetStyle () {
    //
    // },
    handleChangeTab (name) {
      if (name === 'total') {
      }
    },
    formatTabData () {
      this.tableCount = 0
      this.columnCount = 0
      this.tableWithoutCN = 0
      this.colWithoutCN = 0
      this.tableColumnAllCount = 0
      this.tableNoCnPer = 0
      this.columnNoCnPer = 0
      this.pubDomainPre = 0
      this.praDomainPre = 0

      if (this.currentTabData) {
        this.tableCount = this.currentTabData.tableCnt
        this.columnCount = this.currentTabData.columnCnt
        if (this.tableCount) {
          this.tableWithoutCN = this.tableCount - this.currentTabData.tableWithChName
        }
        if (this.columnCount) {
          this.colWithoutCN = this.columnCount - this.currentTabData.columnWithChName
        }

        let tableColumnAllCount = (this.tableCount - 0) + (this.columnCount - 0) - 0
        if (isNaN(tableColumnAllCount)) {
          tableColumnAllCount = 0
        }
        this.tableColumnAllCount = tableColumnAllCount

        let tableNoCnPer = 0
        if (this.tableColumnAllCount) {
          tableNoCnPer = (this.tableCount - this.currentTabData.tableWithChName) / this.tableColumnAllCount * 100
          tableNoCnPer = parseInt(tableNoCnPer)
        }
        if (isNaN(tableNoCnPer)) {
          tableNoCnPer = 0
        }
        this.tableNoCnPer = tableNoCnPer

        let columnNoCnPer = 0
        if (this.tableColumnAllCount) {
          columnNoCnPer = (this.columnCount - this.currentTabData.columnWithChName) / this.tableColumnAllCount * 10000
          columnNoCnPer = parseInt(columnNoCnPer) / 100
          columnNoCnPer.toFixed(2)
        }
        if (isNaN(columnNoCnPer)) {
          columnNoCnPer = 0
        }
        this.columnNoCnPer = columnNoCnPer

        let pubDomainPre = 0
        if (this.columnCount) {
          pubDomainPre = this.currentTabData.columnWithPublicDS / this.columnCount * 10000
          pubDomainPre = parseInt(pubDomainPre) / 100
          pubDomainPre.toFixed(2)
        }
        if (isNaN(pubDomainPre)) {
          pubDomainPre = 0
        }
        this.pubDomainPre = pubDomainPre

        let praDomainPre = 0
        if (this.columnCount) {
          praDomainPre = this.currentTabData.columnWithPrivateDS / this.columnCount * 10000
          praDomainPre = parseInt(praDomainPre) / 100
          praDomainPre.toFixed(2)
        }
        if (isNaN(praDomainPre)) {
          praDomainPre = 0
        }
        this.praDomainPre = praDomainPre
      }
    }
  },
  watch: {
    modelId (newVal) {
      this.dataInit()
    },
    currentTab: {
      immediate: true,
      handler: function (newVal) {
        if (newVal === 'total') {
          if (this.golabData) {
            this.currentTabData = this.golabData
          } else {
            this.setGlobalData()
          }
        } else if (newVal === 'incremental') {
          if (this.orginIncreData) {
            this.currentTabData = this.orginIncreData
          } else {
            this.setIncrementalData()
          }
        } else if (newVal === 'compareDetail') {
          this.showCompareResult = true
        }

        this.formatTabData()

        this.$nextTick(this.formateRulecheck)
      }
    },
    reportData: {
      immediate: true,
      handler: function () {
        this.dataInit()
      }
    }
  }
}
