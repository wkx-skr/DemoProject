import chooseDatasource from './chooseTableItem.vue'
import redomainFind from './redomainFind.vue'
// import domainCluster from './domainCluster.vue'
import clusterResult from './clusterResult.vue'
import DomainJob from '@/components/inteligentFind/DomainJob.vue'
import clusterItem from './clusterItem.vue'
import reClusterItem from './reClusterItem.vue'
import createDomain from './createDomain.vue'
// import jobResult from './jobResult.vue'
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  data() {
    return {
      currentShowPageName: 'jobResult',
      allDataLoading: false,
      currentTab: 'showDadaSource',
      currentName: this.$t('domain.dataFind.dataRange'),
      breadcrumbData: [this.$t('domain.domainCluster.domainCluster'), this.$t('domain.common.preview')],
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
      tabsArr: ['showDadaSource', 'jobResult', 'showJobDetail', 'reReCommendation'],
      tryeEnableJbo: false,
      getJobStatusTimer: null,
      isDestory: false,
      compareConfigObj: {},
      colDataPromiseMap: {},
      currentShowPageData: {},
      recurrentShowPageData: {},
      classificationResultData: {},
      reClassificationResultData: {},
      columnTabArr: [],
      currentJobId: '',
      creDomOpt: [],
      udps: {},
    }
  },
  components: {
    // dataSourceTab,
    // jobResult,
    DomainJob,
    chooseDatasource,
    redomainFind, // 重新推荐
    // domainCluster,
    clusterResult,
    clusterItem,
    reClusterItem,
    createDomain,
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
    this.resizeTable()
    $(window).resize(this.resizeTable)
    this.getUdps()
    this.getCreateOption()
    // this.getModles();
  },
  beforeDestroy() {
    this.isDestory = true
    if (this.getJobStatusTimer) {
      clearTimeout(this.getJobStatusTimer)
      // this.getJobStatusTimer = null;
    }
    this.$bus.$off('removeTab')
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    resizeTable() {
      this.$nextTick(() => {
        console.log('$(.data-cluster .table-row)[0]', $('.data-cluster .table-row')[0])
        this.tableHeight = $('.data-cluster .table-row')[0].offsetHeight
      })
    },
    addItemTab(clusterData) {
      const column = clusterData.columns[0]
      this.currentShowPageData = {
        name: 'clusterId' + clusterData.clusterId,
        label: `${(column.alias || column.name)}`,
        clusterId: clusterData.clusterId,
        type: 'clusterItem',
        clusterData: clusterData,
        propDomainId: '',
      }
      this.breadcrumbData.push(this.currentShowPageData.label)
      this.breadcrumbData[3] && this.breadcrumbData.pop();
      this.currentShowPageName = 'clusterItem'
      this.showHome = false
    },
    readdItemTab(clusterData) {
      const column = clusterData.columns[0]
      this.recurrentShowPageData = {
        name: 'clusterId' + clusterData.clusterId,
        label: `${(column.alias || column.name)}`,
        clusterId: clusterData.clusterId,
        type: 'clusterItem',
        clusterData: clusterData,
        propDomainId: '',
      }
      this.breadcrumbData.push(this.recurrentShowPageData.label)
      this.breadcrumbData[3] && this.breadcrumbData.pop()
      this.currentShowPageName = 'reClusterItem'
      this.showHome = false
    },
    getColumnsData(ids) {
      const self = this
      const resultMap = {}
      let result = Promise.resolve(resultMap)
      if (ids && !Array.isArray(ids) && ids == ids - 0) {
        ids = [ids]
      }
      if (ids && Array.isArray(ids) && ids.length > 0) {
        const p = ids.reduce((promise, currentId, currentIndex, array) => {
          return promise
            .then(function (res) {
              if (res.data) {
                resultMap[res.data.objectId] = res.data
              }
              return self.getColumnData(currentId)
            })
            .catch(e => console.log(e.toString()))
        }, Promise.resolve('init'))
        result = p.then(res => {
          if (res.data) {
            resultMap[res.data.objectId] = res.data
          }
          return resultMap
        })
      }

      return result
    },
    getColumnData(columnId) {
      let p = null
      if (!this.colDataPromiseMap[columnId]) {
        p = this.$http.get(
          this.$meta_url + '/service/entities/' + columnId + '/summary'
        )
        this.colDataPromiseMap[columnId] = p
        p.catch(e => {
          this.colDataPromiseMap[columnId] = null
        })
      } else {
        p = this.colDataPromiseMap[columnId]
      }
      return p
    },
    getPrecision(data) {
      let str = ''
      if (typeof data === 'string') {
        str = data
      } else if (typeof data === 'object') {
        if (data.dataType && data.dataType) {
          str = data.dataType
        }
      }
      let result = ''
      if (str) {
        const start = str.indexOf('(')
        const comma = str.indexOf(',')
        const end = str.indexOf(')')
        if (start !== -1 && comma !== -1 && comma < end) {
          result = str.slice(comma + 1, end)
        }
      }
      return result
    },
    columnsSort(arr, prop, order) {
      order = order || 'descending'
      if (prop === 'score') {
        arr.sort((a, b) => {
          let result = a[prop] - b[prop]
          if (result === 0 && a.name !== b.name) {
            let cou = 0
            const aname = a.name || ''
            const bname = b.name || ''
            while (result === 0 && cou < aname.length && cou < bname.length) {
              result = aname[cou].charCodeAt() - bname[cou].charCodeAt()
              cou++
            }
            if (result === 0) {
              result = aname.length - bname.length
            }
          }
          return result
        })
      } else {
        this.$utils.sort.sortConsiderChineseNumber(arr, prop)
      }
      if (order === 'descending') {
        arr.reverse()
      }
    },
    handleCreateDom(column, clusterData, selectionColumns) {
      this.columnTabArr = [column]
      if (column && column.id) {
        this.getColumnData(column.id)
          .then(res => {
            const columnData = res.data
            this.addCreateDomainTab(columnData, clusterData, selectionColumns)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    addCreateDomainTab(columnData, clusterData, selectionColumns) {
      const colName = columnData.logicalName || columnData.physicalName
      this.classificationResultData = _.cloneDeep(this.currentShowPageData)
      this.currentShowPageData = {
        name: 'createDomain' + columnData.objectId,
        label: `"${colName}" ${this.$t('domain.common.createDomain')}`,
        columnId: columnData.objectId,
        type: 'createDomain',
        columnData: columnData,
        clusterId: clusterData.clusterId,
        selectionColumns: selectionColumns,
      }
      this.currentShowPageName = 'createDomain'
      this.breadcrumbData.push(this.currentShowPageData.label)
      this.showHome = false
      // this.addTab(tab)
    },
    getItemData(clusterId) {
      return this.$refs.jobResult.getItemData(clusterId)
    },
    backClick(e) {
      console.log('e', this.currentShowPageName, this.currentShowPageData, this.recurrentShowPageData)
      if (this.currentShowPageName === 'clusterItem') {
        this.currentShowPageData = _.cloneDeep(this.classificationResultData)
        this.currentShowPageName = 'jobResult'
        this.breadcrumbData.pop()
      } else if (this.currentShowPageName === 'reClusterItem') {
        this.recurrentShowPageData = _.cloneDeep(this.reClassificationResultData)
        this.currentShowPageName = 'reReCommendation'
        this.breadcrumbData.pop()
      } else {
        this.currentShowPageName = 'jobResult'
        this.showHome = true
        this.currentShowPageData = {}
        this.recurrentShowPageData = {}
        this.getJob()
      }
    },
    getCreateOption() {
      if (this.gotOption) {
        return
      }
      this.gotOption = true
      const self = this
      const get_url =
        this.$meta_url + '/service/domains/tree?onlyFolder=true&categoryId=1'
      self.$http
        .get(get_url)
        .then(res => {
          this.creDomOpt = [res.data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUdps() {
      if (this.gotUdps) {
        return
      }
      this.gotUdps = true
      this.$http
        .get(this.$meta_url + '/service/domains/udps')
        .then(res => {
          this.udps = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setCurrentTab(tabName) {
      const index = this.tabsArr.findIndex(item => {
        return item.name === tabName
      })
      if (index !== -1) {
        this.currentTab = tabName
      }
      this.allDataLoading = false
    },
    handleDomainCreated(domain, clusterId, columnData, selectionColumns) {
      this.allDataLoading = true
      const itemTabName = 'clusterId' + clusterId
      const domainTabName = 'createDomain' + columnData.objectId
      // remove create domain tab
      this.removeTab(domainTabName)

      // domain can't auto published with workflow
      // remove auto bind
      this.setCurrentTab(itemTabName)
      return

      // bind selected columns with domain
      const callback = () => {
        this.$message.success(this.$t('domain.domainCluster.domainBindSuccess'))
        this.setCurrentTab(itemTabName)
      }
      this.bindColumn2Domain(selectionColumns, domain, clusterId, callback)
      // remove binded columns and updata cluster result
      // callback after bindColumn2Domain()
    },
    closeDomin() {
      this.currentShowPageData = _.cloneDeep(this.classificationResultData)
      this.currentShowPageName = 'clusterItem'
      this.breadcrumbData.pop()
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
              if (message === this.$t('domain.dataFind.taskDisabled') && !this.tryeEnableJbo) {
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
        type: '数据标准-聚合推荐数据标准任务',
      }
      this.$http
        .post(`${this.$job_url}/main/query/jobs/byDto`, options)
        .then(res => {
          const job = res.data.content[0]
          this.currentJobId = job.jobId
          if (job) {
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
              // 获取是否加入推荐的系统id
              if (modelIds && Array.isArray(modelIds)) {
                this.choosedModels = modelIds
              }
              // if (obj.compareConfig) {
              //   this.compareConfigObj = obj.compareConfig
              // }
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
        .post(this.$job_url + '/main/query/jobResults/byCriteria', param)
        .then(res => {
          // jobStatus = res.data.content[0].status
          // {
          //   if (jobStatus === 'FINISHED' ||jobStatus === 'FAILED') {
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
                  // let count = 0
                  // arr.forEach(item => {
                  //   let msg = item.message
                  //   TODO
                  //   if (msg && msg.indexOf(this.$t('domain.dataFind.save')) === 0) {
                  //     const num = Number.parseInt(item.message.slice(2))
                  //     if (num > 0) {
                  //       count += num
                  //     }
                  //   }
                  // })
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
                    // this.countResult = count
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
    },
    getTotalItem() {
      this.$http
        .get(
          this.$meta_url + '/domains/cluster_result/count'
        )
        .then(res => {
          this.countResult = res.data
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
    handleChangeModel(datasources) {
      const json = JSON.parse(this.recJob.jobContent)
      const models = json.parameters.find(p => p.parameterName === 'modelIds')
      if (models) {
        models.value = JSON.stringify(datasources)
      } else {
        json.parameters.push({
          parameterName: 'modelIds',
          value: JSON.stringify(datasources)
        })
      }
      // json.parameters.forEach(p => {
      //   if (p.parameterName === 'modelIds') {
      //
      //   }
      // })
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
      // this.currentTab = 'showDadaSource'
      // const index = this.tabsArr.findIndex(item => {
      //   return item.name === name
      // })
      // if (index !== -1) {
      //   this.tabsArr.splice(index, 1)
      // }
      // if (name === this.currentTab) {
      //   this.currentTab = this.defaultTab
      // }
    },
    addTabsArr(name) {
      this.currentName = name === 'showJobDetail'
        ? this.$t('domain.dataFind.runTime')
        : name === 'showDadaSource'
          ? this.$t('domain.dataFind.dataRange')
          : name === 'reReCommendation'
          ? this.$t('domain.dataFind.reRecommend')
          : this.$t('domain.dataFind.scanResult')
      this.$nextTick(() => {
        console.log(name, 'name');
        this.currentTab = name
        this.showHome = false
      })
    },
    refreshResultOk() {
      this.allDataLoading = true
      this.tabsArr.forEach(tab => {
        if (tab.type === 'clusterItem') {
          tab.clusterData = this.getItemData(tab.clusterId)
          const columns = tab.clusterData.columns
          if (this.jobRunFinished || (columns && columns.length === 0)) {
            this.removeTab(tab.name)
          } else {
            this.updataItemTab(tab)
          }
        }
      })
      this.jobRunFinished = false
      this.allDataLoading = false
    },
    reRefreshResultOk() {
      this.allDataLoading = true
      this.tabsArr.forEach(tab => {
        if (tab.type === 'clusterItem') {
          tab.clusterData = this.getItemData(tab.clusterId)
          const columns = tab.clusterData.columns
          if (this.jobRunFinished || (columns && columns.length === 0)) {
            this.removeTab(tab.name)
          } else {
            this.updataItemTab(tab)
          }
        }
      })
      this.jobRunFinished = false
      this.allDataLoading = false
    },
    tabClick(node) {
      this.currentShowPageName = node.name
      if (this.breadcrumbData.length > 2) {
        this.breadcrumbData = this.breadcrumbData.slice(0, 2)
      }
      if (node.name === 'showDadaSource') {
        const callback = () => {
          this.addTabsArr('showDadaSource')
        }
        this.getJob(callback)
      } else {
        if (node.name === 'jobResult') {
          this.$nextTick(() => {
            this.$refs.jobResult[0].refresh()
          })
        }
        if (node.name === 'reReCommendation') {
          this.$nextTick(() => {
            this.$refs.reReCommendation[0].reRefresh()
          })
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
