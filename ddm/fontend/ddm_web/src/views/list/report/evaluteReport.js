import echarts from 'echarts'
import multiProgress from './progressWithMultiparts.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import $ from 'jquery'
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
      withoutCNameCount: 0,
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
      domainPerArr: [],

      reportDetail: {},
      currentTabData: {},
      tableCount: 0,
      columnCount: 0,
      tableWithoutCN: 0,
      colWithoutCN: 0,
      tableColumnAllCount: 0,
      tableNoCnPer: 0,
      columnNoCnPer: 0,
      pubDomainPre: 0,
      praDomainPre: 0
    }
  },
  props: {
    modelId: {},
    path: {},
    detail: {},
    reportName: {},
    reportData: {},
    versions: {},
    getCurrentReportPromise: {
      required: true
    }
  },
  components: {
    multiProgress,
    spanWithTooltip
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
    }
  },
  mounted () {
    this.dataInit()
  },
  beforeDestroy () {
  },
  methods: {
    dataInit () {
      this.getReportDetail()
      this.getModelInfo(this.modelId)
    },
    handleRowClick (row) {
      // this.handleCheckCnameRate(row.name)
    },
    // handleCheckCnameRate (type) {
    //   type = type || 'MQ-0'
    //   const pos = location.href.indexOf('#/')
    //   const baseUrl = location.href.slice(0, pos + 2)
    //   window.open(baseUrl + 'scanModel?id=' + this.modelId + '&path=' + this.path + '&checkResultType=' + type, '_blank')
    // },
    handleCheckDomainRate () {
      this.$emit('checkCnameRate')
    },
    // detail
    getModelInfo (modelId) {
      let data = this.detail
      if (data) {
        this.modelDetail.name = data.name || ''
        this.modelDetail.owner = data.owner || ''
        this.modelDetail.diagramCount = this.detail.diagramCount
        this.modelDetail.frozen = data.frozen
        this.modelDetail.branch = data.branch
        this.modelDetail.description = data.description || this.$store.state.$v.modelDetail.noDescription
        this.modelDetail.lastModificationTimestamp = data.lastModificationTimestamp || 0
      }
    },
    resetStyle () {
    },
    getReportDetail () {
      this.getCurrentReportPromise
        .then(data => {
          this.reportDetail = data
          let modelVersionIds = this.getVersionString(data, this.versions)

          if (Array.isArray(data.modelVersionIds) && data.modelVersionIds.length > 0 && !modelVersionIds) {
            HTTP.getVersions({ modelId: this.modelId })
              .then(res => {
                let versions = new Map()
                res = res || []
                res.forEach(obj => {
                  versions.set(obj.id, obj.name)
                })
                this.modelDetail.currentVersion = this.getVersionString(data, versions)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
          this.modelDetail.currentVersion = modelVersionIds
          this.currentTabData = data.globalReport
          this.formatTabData()
          let ruleCheckResult = data.incrementalReport ? data.incrementalReport.ruleCheckResult : {}
          this.ruleFormatter(ruleCheckResult)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getVersionString (data, versions) {
      let modelVersionIds = data.modelVersionIds || []
      if (modelVersionIds && Array.isArray(modelVersionIds)) {
        modelVersionIds = modelVersionIds.map(item => {
          return versions.get(item)
        }).join(',')
      } else {
        modelVersionIds = ''
      }
      return modelVersionIds
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
        this.modelDetail.diagramCount = this.currentTabData.diagramCnt
        this.tableCount = this.currentTabData.tableCnt
        this.columnCount = this.currentTabData.columnCnt
        this.withoutCNameCount = (this.currentTabData.tableCnt + this.currentTabData.columnCnt) - (this.currentTabData.columnWithChName + this.currentTabData.tableWithChName)
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
          tableNoCnPer = (this.tableCount - this.currentTabData.tableWithChName) / this.tableColumnAllCount * 100000
          tableNoCnPer = parseInt(tableNoCnPer) / 1000
          // tableNoCnPer = tableNoCnPer.toFixed(2)
        }
        if (isNaN(tableNoCnPer)) {
          tableNoCnPer = 0
        }
        this.tableNoCnPer = tableNoCnPer

        let columnNoCnPer = 0
        if (this.tableColumnAllCount) {
          columnNoCnPer = (this.columnCount - this.currentTabData.columnWithChName) / this.tableColumnAllCount * 100000
          columnNoCnPer = parseInt(columnNoCnPer) / 1000
          // columnNoCnPer = columnNoCnPer.toFixed(2)
        }
        if (isNaN(columnNoCnPer)) {
          columnNoCnPer = 0
        }
        this.withoutCNameColumnCount = this.columnCount - this.currentTabData.columnWithChName
        this.columnNoCnPer = columnNoCnPer

        let pubDomainPre = 0
        if (this.columnCount) {
          pubDomainPre = this.currentTabData.columnWithPublicDS / this.columnCount * 100000
          pubDomainPre = parseInt(pubDomainPre) / 1000
          // pubDomainPre.toFixed(2)
        }
        if (isNaN(pubDomainPre)) {
          pubDomainPre = 0
        }
        this.pubDomainPre = pubDomainPre

        let praDomainPre = 0
        if (this.columnCount) {
          praDomainPre = this.currentTabData.columnWithPrivateDS / this.columnCount * 100000
          praDomainPre = parseInt(praDomainPre) / 1000
          // praDomainPre.toFixed(2)
        }
        if (isNaN(praDomainPre)) {
          praDomainPre = 0
        }
        this.praDomainPre = praDomainPre

        this.modelDetail.tableCount = this.tableCount
        this.modelDetail.columnCount = this.columnCount
        this.domainData.pub = this.currentTabData.columnWithPublicDS
        this.domainData.pra = this.currentTabData.columnWithPrivateDS
        this.domainData.none = this.columnCount - this.domainData.pub - this.domainData.pra
        this.domainPerArr = [
          {
            name: this.$v.report.public1,
            value: this.domainData.pub,
            eName: 'public'
          },
          {
            name: this.$v.report.private1,
            value: this.domainData.pra,
            eName: 'private'
          },
          {
            name: this.$v.report.None,
            value: this.domainData.none,
            eName: 'noneDomain'
          }
        ]
      }
    },
    ruleFormatter (data) {
      let withoutCNameCount = 0
      let withoutCNameColumnCount = 0
      let dupNameTableCount = 0
      let resultCountMap = new Map()
      let reg = /[^/]+\/[^/]+\/[^/]+/ig

      let arr = data ? data.result : []
      let wrongData = []
      let warningData = []
      let tipsData = []
      this.getCheckResult = true
      if (arr && Array.isArray(arr) && arr.length > 0) {
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
            withoutCNameCount++
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
            // console.log(obj.level, 'obj.level')
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
    },
    backToReportList () {
      this.$emit('backToReportList')
    }
  },
  watch: {
  }
}
