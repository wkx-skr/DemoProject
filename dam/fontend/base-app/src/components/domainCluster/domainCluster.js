import clusterResult from './clusterResult.vue'
import clusterItem from './clusterItem.vue'
import createDomain from './createDomain.vue'
import jobDetail from '@/components/jobManagement/jobDetail.vue'

export default {
  data() {
    return {
      showHome: true,
      breadcrumbData: [this.$t('domain.domainCluster.domainCluster')],
      currentShowPageName: 'dataCluster',
      currentShowPageData: {},
      classificationResultData: {},
      defaultTab: 'dataCluster',
      currentTab: 'dataCluster',
      tabsArr: [],
      gotOption: false,
      creDomOpt: [],
      gotUdps: false,
      udps: {},
      removeColumnsArr: [],
      // updating: false,
      removeColumnTimer: '',
      removeColumn: [],
      updatingResult: false,
      jobExist: false,
      cluJob: {},
      lastInstantsId: '',
      currentInstanceId: '',
      jobRunFinished: false,
      // show loading when create domain and bind to field
      allDataLoading: false,
      columnsDataMap: {},
      colDataPromiseMap: {},
      getJobsList: null,
      columnTabArr: [],
    }
  },
  components: {
    clusterResult,
    clusterItem,
    createDomain,
    jobDetail,
  },
  computed: {
    showTabs() {
      return this.tabsArr && this.tabsArr.length > 0
    },
  },
  mounted() {
    this.getUdps()
    this.getCreateOption()
    this.getJob()
    this.$bus.$on('removeTab', this.backClick)
    this.$bus.$on('getremoveTab', name => {
      this.removeTab(name)
    })
  },
  beforeDestroy() {
    this.$bus.$off('getremoveTab')
    this.$bus.$off('removeTab')
  },
  methods: {
    backClick(e) {
      if (this.breadcrumbData[2]) {
        this.currentShowPageData = _.cloneDeep(this.classificationResultData)
        this.currentShowPageName = 'clusterItem'
        this.breadcrumbData.pop()
      } else {
        this.currentShowPageName = 'dataCluster'
        this.showHome = true
        this.currentShowPageData = {}
      }
    },
    nodeClick(node) {
      let clickNode = node.name || node
      console.log(clickNode, 'clickNode')
      if (clickNode === this.$t('domain.domainCluster.domainCluster')) {
        this.currentShowPageName = 'dataCluster'
        this.showHome = true
        this.currentShowPageData = {}
      } else {
        // TODO:
        this.currentShowPageData = _.cloneDeep(this.classificationResultData)
        this.currentShowPageName = 'clusterItem'
        this.breadcrumbData.pop()
      }
    },
    closeDomin() {
      this.currentShowPageData = _.cloneDeep(this.classificationResultData)
      this.currentShowPageName = 'clusterItem'
      this.breadcrumbData.pop()
    },
    removeTab(name) {
      const index = this.tabsArr.findIndex(item => {
        return item.name === name
      })
      if (index !== -1) {
        this.tabsArr.splice(index, 1)
      }
      if (name === this.currentTab) {
        this.currentTab = this.defaultTab
      }
    },
    addTab(tab) {
      const index = this.tabsArr.findIndex(item => {
        return item.name === tab.name
      })
      if (index === -1) {
        this.tabsArr.push(tab)
        this.currentTab = tab.name
      } else {
        this.currentTab = this.tabsArr[index].name
      }
    },
    addItemTab(clusterData) {
      const column = clusterData.columns[0]
      this.currentShowPageData = {
        name: 'clusterId' + clusterData.clusterId,
        label: `"${(column.alias || column.name)}" ${this.$t('domain.domainCluster.clusterResult')}`,
        clusterId: clusterData.clusterId,
        type: 'clusterItem',
        clusterData: clusterData,
        propDomainId: '',
      }
      this.breadcrumbData[1] = this.currentShowPageData.label
      this.breadcrumbData[2] && this.breadcrumbData.pop();
      this.currentShowPageName = 'clusterItem'
      this.showHome = false
      // this.addTab(tab)
    },
    removeItemTab() {
      const arr = [...this.tabsArr]
      arr.forEach(item => {
        if (item.type === 'clusterItem') {
          this.removeTab(item.name)
        }
      })
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
      // debugger
      console.log('this.breadcrumbData', this.breadcrumbData)
      this.showHome = false
      // this.addTab(tab)
    },
    addJobTab() {
      this.currentShowPageData = {
        name: 'jobDetail',
        label: this.$t('domain.domainCluster.clusterFieldForDomainJob'),
        type: 'jobDetail',
      }
      this.currentShowPageName = 'jobDetail'
      this.breadcrumbData[1] = this.$t(
        'domain.domainCluster.clusterFieldForDomainJob'
      )
      this.breadcrumbData[2] && this.breadcrumbData.pop();
      this.showHome = false
      // this.addTab(tab)
      // let callback = ()=> {
      // };
      // this.getJob(callback);
    },
    clickTab(node) {
      this.currentTab = node.name
    },
    getJob(callback) {
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: 'ClusterColumnJobDescriptor',
      }
      this.$http
        .post(`${this.$url}/service/datablau_jobs/page`, options)
        .then(res => {
          const job = res.data.content[0]
          if (job) {
            this.jobExist = true
            this.cluJob = job
            this.lastInstantsId = job.jobInstanceId
            callback && callback()
            // } else {
            //   let loca = window.location.hash;
            //   let index = loca.indexOf('#/main/domainCluster');
            //   if (index !== -1) {
            //     this.$router.push({
            //       name: 'dataCatalogDashboard'
            //     });
            //   }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCreateDom(column, clusterData, selectionColumns) {
      this.columnTabArr = column
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
    handleRemoveItemColumn(removeColumns) {
      const arr = [...removeColumns]
      this.removeColumnsArr.push(arr)
      // this.clearRemoveArr(this.updataClusterResult);
      this.updataClusterResult()
    },
    bindColumn2Domain(selectionColumns, domain, clusterId, callback) {
      const arr = [...selectionColumns]
      const showSucces = () => {
        callback && callback()
      }
      const binddom = item => {
        const json = {
          domainId: domain.domainId,
          objectId: item.objectId,
        }
        json.objectId &&
          this.$http
            .post(this.$url + '/service/domains/entities', json)
            .then(res => {
              this.addRemoveColumn(item, clusterId)
              arr.shift()
              if (arr.length > 0) {
                binddom(arr[0])
              } else {
                showSucces()
              }
            })
            .catch(e => {
              this.$showFailure(e)
              this.allDataLoading = false
            })
      }
      binddom(arr[0])
    },
    addRemoveColumn(column, clusterId) {
      if (this.removeColumnTimer) {
        clearTimeout(this.removeColumnTimer)
      }
      const obj = {
        id: column.objectId,
        clusterId: clusterId,
      }
      this.removeColumn.push(obj)
      this.removeColumnTimer = setTimeout(() => {
        this.handleRemoveItemColumn(this.removeColumn)
        this.removeColumn = []
        this.removeColumnTimer = null
      }, 500)
    },
    updataClusterResult() {
      if (!this.updatingResult) {
        const callback = () => {
          // refresh result
          // refresh success, call refreshResultOk
          this.$refs.dataCluster.refresh()
          this.updatingResult = false
          this.allDataLoading = false
        }
        this.clearRemoveArr(callback)
      }
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
    clearRemoveArr(callback) {
      this.updatingResult = true
      if (this.removeColumnsArr.length > 0) {
        const removeCol0 = () => {
          const removeColumns = this.removeColumnsArr[0]
          this.$http
            .get(this.$url + '/service/domains/cluster_result')
            .then(res => {
              let resultArr = []
              res.data = Array.from(res.data)
              if (res.data && Array.isArray(res.data)) {
                resultArr = res.data
                const newcallback = () => {
                  this.removeColumnsArr.shift()
                  if (this.removeColumnsArr.lenth > 0) {
                    removeCol0()
                  } else {
                    callback && callback()
                  }
                }
                this.removeColumns(resultArr, removeColumns, newcallback)
              }
            })
            .catch(e => {
              this.$showFailure(e)
              this.allDataLoading = false
            })
        }
        removeCol0()
      } else {
        callback && callback()
      }
    },
    removeColumns(allData, removeColumns, callback) {
      const removeColumnsMap = {}
      if (removeColumns && Array.isArray(removeColumns)) {
        removeColumns.forEach(item => {
          if (!removeColumnsMap[item.clusterId]) {
            removeColumnsMap[item.clusterId] = []
          }
          removeColumnsMap[item.clusterId].push(item.id)
        })
      }
      if (allData && Array.isArray(allData) && allData.length > 0) {
        const newColums = []
        allData.forEach(item => {
          const ids = removeColumnsMap[item.clusterId]
          if (ids && ids.length > 0) {
            const columns = item.columns
            const idsMap = {}
            ids.forEach(id => {
              idsMap[id] = true
            })
            if (columns && columns.length) {
              const arr = []
              columns.forEach(column => {
                if (!idsMap[column.id]) {
                  arr.push(column)
                }
              })
              item.columns = arr
            }
            newColums.push(item)
          }
        })
        const clearNewColumns = () => {
          if (newColums.length > 0) {
            this.postNewResult(newColums[0])
              .then(res => {
                newColums.shift()
                clearNewColumns()
              })
              .catch(e => {
                this.$showFailure(e)
                this.allDataLoading = false
              })
          } else {
            callback && callback()
          }
        }
        if (newColums.length > 0) {
          clearNewColumns()
        } else {
          callback && callback()
        }
      } else {
        callback && callback()
      }
    },
    postNewResult(data) {
      return this.$http.post(
        this.$url + '/service/domains/cluster_result',
        data
      )
    },
    handleRunJob() {
      this.getJobStatus()
    },

    getColumnData(columnId) {
      let p = null
      if (!this.colDataPromiseMap[columnId]) {
        p = this.$http.get(
          this.$url + '/service/entities/' + columnId + '/summary'
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
    getCreateOption() {
      if (this.gotOption) {
        return
      }
      this.gotOption = true
      const self = this
      const get_url =
        this.$url + '/service/domains/tree?onlyFolder=true&categoryId=1'
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
        .get(this.$url + '/service/domains/udps')
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
    },
    getItemData(clusterId) {
      return this.$refs.dataCluster.getItemData(clusterId)
    },
    updataItemTab(tab) {
      let vm = this.$refs[tab.name]
      if (vm && Array.isArray(vm)) {
        vm = vm[0]
      }
      vm.handleRefresh && vm.handleRefresh()
    },
    getJobStatus() {
      if (!this.cluJob || !this.cluJob.id) {
        setTimeout(() => {
          this.getJob(this.getJobStatus)
        }, 500)
        return
      }
      // jobStatus,
      // 1 not start, 2 RUNNING, 3 finished
      let jobStatus = ''
      let started = true
      const lastInstantsId = this.lastInstantsId
      this.$http
        .get(this.$url + '/service/datablau_jobs/' + this.cluJob.id)
        .then(res => {
          jobStatus = res.data.status
          if (jobStatus === 'RUNNING') {
            setTimeout(() => {
              this.getJobStatus()
            }, 500)
            // return;
          }
          const instanceId = res.data.id
          if (!instanceId) {
            // never start
            started = false
          } else if (
            (lastInstantsId || lastInstantsId === 0) &&
            lastInstantsId === instanceId
          ) {
            // not running
            started = false
          } else {
            // started
            started = true
          }
          if (started) {
            this.removeItemTab()
            if (jobStatus !== 'RUNNING') {
              this.lastInstantsId = instanceId
              this.jobFinished()
            }
          }
        })
        .catch(e => this.$showFailure(e))
    },
    jobFinished() {
      this.jobRunFinished = true
      this.updataClusterResult()
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
  },
  watch: {
    // currentTab(newVal) {
    //   let vm = this.$refs[newVal]
    //   if (Array.isArray(vm)) {
    //     vm = vm[0]
    //   }
    //   if (vm && vm.resetStyle) {
    //     vm.resetStyle()
    //   }
    //   // if (newVal === 'dataCluster') {
    //   // }
    //   this.getJobStatus()
    // },
    currentShowPageName(newVal) {
      let vm = this.$refs[newVal]
      if (Array.isArray(vm)) {
        vm = vm[0]
      }
      if (vm && vm.resetStyle) {
        vm.resetStyle()
      }
      // if (newVal === 'dataCluster') {
      // }
      this.getJobStatus()
    },
  },
}
