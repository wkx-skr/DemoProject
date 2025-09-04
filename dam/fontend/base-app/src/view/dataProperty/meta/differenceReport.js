import reportDetail from './modelCompareReportDetail.vue'
import chooseModel from '../../dataQuality/techRules/chooseModel.vue'
import HTTP from '@/http/main'
import moment from 'moment'
import axios from 'axios'
const CancelToken = axios.CancelToken

export default {
  components: {
    reportDetail,
    chooseModel,
  },
  data() {
    return {
      dsToDdm: '',
      category: {},
      targetDdmModelId: undefined,
      bindModelTree: null,
      modelClicked: null,
      disableBindModel2: true,
      dialog2Visible: false,
      businessDefaultProps: {
        label: 'name',
        id: 'id',
      },
      time: '',
      data: {},
      businessData: [],

      itemData: {},
      tableData: [],
      modelId: undefined,
      versionId: undefined,
      requestUrl: '',
      result: {
        table: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        column: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        view: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        index: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        sp: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        func: {
          added: 0,
          removed: 0,
          modified: 0,
        },
      },
      modelProMap: {},
      getAllModels: false,
      nameObj: {
        leftObject: '',
        rightObject: '',
      },
      cancelSource: null,
      componentKey: 1,
      defaultResult: null,
      typeMap: {
        table: this.$t('meta.DS.treeSubOperation.table'),
        column: this.$t('meta.DS.treeSubOperation.column'),
        index: this.$t('meta.DS.treeSubOperation.index'),
        view: this.$t('meta.DS.treeSubOperation.view'),
      },
      loading: true,
      histories: [],
      autoSetJob: {
        modelId: '',
        modelName: '',
      },
      resultFileUrl: '',
      compareMappings: [],
      ddmMap: new Map(),
      ddmMapVersion: 1,
      showCompareMappings: false,
      selectedSchemas: [],
      schemasOptions: [],
      compareMappingBody: {
        id: '',
        damModelId: '',
        ddmModelId: '',
        schemas: [],
      },
      currentMapping: null,
      showTree: false,
      schemasReady: false,
      hasSchemas: false,
      hasDiff: false,
      componentDestroyed: false,
      // performOperation: 'only_compare',
      modelVersion: '',
      versionName: '',
      defaultVersion: [],
      modelVersionData: [],
      modelVersionDataFirst: '',
      ddmModelId: '',
      couldSaveState: false,
      strategyArr1: 'DAM_FIRST',
      strategyArr2: 'DAM_FIRST',
      strategyArr3: 'DAM_FIRST',
      strategyArr4: 'DAM_FIRST',
      strategyArr5: 'DAM_FIRST',
      syncStrategies: [],
      syncTimeArr: [],
      syncTime: '',
      syncDataTable: [],
      syncDataTableName: {
        domainCounts: this.$t('meta.DS.treeSubOperation.dataStandard'),
        standardCounts: this.$t('meta.DS.treeSubOperation.standardCode'),
        aliasNameCounts: this.$t('meta.DS.treeSubOperation.chineseName'),
        definitionCounts: this.$t('meta.DS.treeSubOperation.descInfo'),
        udpCounts: this.$t('meta.DS.treeSubOperation.customPro'),
      },
      getVersionsState: true,
      udpSyncStrategyArr: false,
      defaultVersionUdp: true,
      // 空字符串
      emptyString: '',
      curTab: 'compare',
      compareEnable: false,
      lineageEnable: false,
      syncEnable: false,
      branch: 'master',
      path: '',
    }
  },
  props: ['sourceData'],
  beforeMount() {},
  mounted() {
    this.defaultResult = _.cloneDeep(this.result)
    this.modelId = Array.isArray(this.sourceData.id)
      ? this.sourceData.id[0]
      : this.sourceData.id
    this.getCompareMappings()
    this.$bus.$on('modelSelected', model => {
      this.bind2(model)
    })
    this.$bus.$on('removeModelSelectDialog', () => {
      this.dialog2Visible = false
    })
    this.$bus.$on('downloadResult', this.handleDownload)
  },
  beforeDestroy() {
    if (this.cancelSource) {
      this.cancelSource.cancel('Operation canceled by the user.')
    }
    this.clearAll()
    this.$bus.$off('modelSelected')
    this.$bus.$off('removeModelSelectDialog')
    this.$bus.$off('downloadResult', this.handleDownload)
    this.$el.innerHTML = ''
  },
  destroyed() {
    this.$el.innerHTML = ''
    this.data = null
  },
  computed: {
    diffCountTable() {
      let hasDiff = false
      let result = [
        {
          name: this.$t('meta.DS.treeSubOperation.table'),
          added: this.result.table.added,
          modified: this.result.table.modified,
          removed: this.result.table.removed,
        },
        {
          name: this.$t('meta.DS.treeSubOperation.column'),
          added: this.result.column.added,
          modified: this.result.column.modified,
          removed: this.result.column.removed,
        },
        {
          name: this.$t('meta.DS.treeSubOperation.index'),
          added: this.result.index.added,
          modified: this.result.index.modified,
          removed: this.result.index.removed,
        },
        {
          name: this.$t('meta.DS.treeSubOperation.view'),
          added: this.result.view.added,
          modified: this.result.view.modified,
          removed: this.result.view.removed,
        },
      ]
      result = []
      const changeMap = {
        added: this.$t('meta.DS.treeSubOperation.onlyDataSource'),
        modified: this.$t('meta.DS.treeSubOperation.allContains'),
        removed: this.$t('meta.DS.treeSubOperation.onlyModel'),
      }
      for (const change in changeMap) {
        const obj = {
          type: changeMap[change],
        }
        for (const key in this.typeMap) {
          obj[key] = this.result[key] ? this.result[key][change] : 0
          if (obj[key]) {
            hasDiff = true
          }
        }
        result.push(obj)
      }
      this.hasDiff = hasDiff
      return result
    },
    isDiff() {
      return this.hasDiff
    },
    couldSave() {
      let bool = true
      if (
        !this.dsToDdm ||
        !this.selectedSchemas ||
        !this.selectedSchemas.length
      ) {
        bool = false
      }
      return bool
    },
  },
  watch: {
    keyword(value) {
      this.$refs.tree1.filter(value)
    },
  },
  methods: {
    changeVersion(value) {
      this.modelVersionData.forEach(m => {
        if (value === m.value) {
          this.versionName = m.label
        }
      })
    },
    handleTabChange(name) {},
    getSyncHistoryList() {
      this.syncTimeArr = []
      this.$http
        .get(this.$meta_url + `/models/sync/history/${this.currentMapping}`)
        .then(res => {
          if (!res.data) {
            this.syncTimeArr = []
            this.syncTime = ''
            this.syncDataTable = []
            return
          }
          res.data.sort((a, b) => {
            return b.syncTime - a.syncTime
          })
          res.data.forEach(element => {
            this.syncTimeArr.push({
              lable: moment(element.syncTime).format('YYYY-MM-DD HH:mm:ss'),
              value: element.syncTime,
            })
          })
          this.syncTime = this.syncTimeArr[0].value
          this.getDataSync(this.syncTimeArr[0].value)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataSync(value) {
      this.syncDataTable = []
      this.$http
        .get(
          this.$meta_url +
            `/models/sync/history/${this.currentMapping}/${value}`
        )
        .then(res => {
          for (const change in this.syncDataTableName) {
            this.syncDataTable.push({
              type: this.syncDataTableName[change],
              column: res.data.dataInfo[change],
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getVersions(id, modelId, versionName) {
      this.modelVersionData = []
      this.$http
        .get(this.$meta_url + `/models/ddm/models/${id}/versions`)
        .then(res => {
          res.data[0] = res.data[0] || {}
          // latest version id, 理论上不能为空
          this.modelVersionDataFirst = res.data[0].id || ''
          res.data.forEach(element => {
            if (element.name !== 'Latest Version') {
              this.modelVersionData.push({
                value: element.id,
                label: element.name,
              })
            }
          })
          if (!this.modelVersion) {
            this.modelVersion = modelId || this.modelVersionData[0].value
            this.versionName = versionName || this.modelVersionData[0].label
          }
        })
        .catch(e => {
          // ddm 模型被删除, 清空 绑定开发模型名称
          this.handleModelDelete(e)
          this.$showFailure(e)
        })
    },
    handleModelDelete(e) {
      if (
        e &&
        e.response &&
        e.response.data &&
        e.response.data.errorMessage &&
        e.response.data.errorMessage.includes(
          this.$t('meta.DS.treeSubOperation.alreadyDeleted')
        )
      ) {
        this.dsToDdm = ''
        this.$message.closeAll()
        HTTP.refreshModels()
      }
    },
    defaultVersionChange(value) {
      if (value.indexOf('udp') > -1) {
        this.defaultVersionUdp = false
      } else {
        this.defaultVersionUdp = true
      }
    },
    handleDownload(isVersion) {
      if (isVersion) {
        return
      }
      if (this.resultFileUrl) {
        const url = this.resultFileUrl
        this.$downloadFile(url)
      } else {
        this.$message.info(this.$t('meta.DS.message.noDataSource'))
      }
    },
    getSchemas() {
      this.$http
        .get(this.$meta_url + `/models/${this.modelId}/schemas`)
        .then(res => {
          this.schemasOptions = res.data
          this.hasSchemas = !!res.data.length
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.showTree = true
          this.getFreeModels2()
          this.schemasReady = true
        })
    },
    getCompareMappings() {
      this.showTree = false
      this.$http
        .get(this.$meta_url + `/models/${this.modelId}/compareMappings`)
        .then(res => {
          let tempData = res.data
          tempData.length &&
            tempData.forEach(t => {
              if (!t.compareStrategy) {
              } else if (t.compareStrategy === 'only_compare') {
                t.compareEnable = true
                t.lineageEnable = false
                t.syncEnable = false
              } else if (t.compareStrategy === 'all') {
                t.compareEnable = true
                t.lineageEnable = false
                t.syncEnable = true
              } else if (t.compareStrategy === 'only_sync') {
                t.compareEnable = false
                t.lineageEnable = false
                t.syncEnable = true
              }
            })
          // 处理版本

          this.compareMappings = res.data
          this.ddmModelId = res.data[0]?.ddmModelId
          this.getModelData()
          if (!this.currentMapping) {
            if (res.data[0]) {
              this.currentMapping = res.data[0].id
              this.getHistory(res.data[0])
            } else {
              this.currentMapping = 'add'
              this.loading = false
            }
          } else {
            this.loading = false
          }
          // setTimeout(()=>{
          //   this.showTree = true;
          // })
        })
        .catch(e => {
          this.$showFailure(e)
          // this.showTree = true;
          this.loading = false
        })
        .then(() => {
          this.getSchemas()
        })
    },
    getModelData() {
      const arr = this.compareMappings
      if (arr && Array.isArray(arr) && arr.length > 0) {
        arr.forEach(item => {
          const modelId = item.ddmModelId
          if (!this.ddmMap.get(modelId)) {
            if (!this.modelProMap[modelId]) {
              this.modelProMap[modelId] = HTTP.getModelDetail({ modelId })
            }
            this.modelProMap[modelId]
              .then(res => {
                this.addDdmMpa(res.data)
              })
              .catch(e => {
                console.log(e)
              })
          }
        })
      }
    },
    deleteCompareMapping(mapping, $event) {
      $event.stopPropagation()
      this.$http
        .delete(
          this.$meta_url +
            `/models/binding/${mapping.damModelId}/ddm/model/${mapping.id}`
        )
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.delSolutionSucceed'))
          this.getCompareMappings()
          if (mapping.id === this.currentMapping) {
            this.addNewMapping()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存
    saveCompareMapping() {
      this.syncStrategies = []
      if (this.syncEnable) {
        this.defaultVersion.forEach(element => {
          if (element === 'domain') {
            this.syncStrategies.push({
              syncType: element,
              strategy: this.strategyArr1,
            })
          } else if (element === 'aliasName') {
            this.syncStrategies.push({
              syncType: element,
              strategy: this.strategyArr2,
            })
          } else if (element === 'udp') {
            this.syncStrategies.push({
              syncType: element,
              strategy: this.strategyArr3,
              udpSyncStrategy:
                this.udpSyncStrategyArr === true ? 'UDP_SYNC_INSERT' : null,
            })
          } else if (element === 'definition') {
            this.syncStrategies.push({
              syncType: element,
              strategy: this.strategyArr4,
            })
          } else if (element === 'standard') {
            this.syncStrategies.push({
              syncType: element,
              strategy: this.strategyArr5,
            })
          }
        })
      }
      const compareMappingBody = {
        id: null,
        damModelId: this.modelId,
        ddmModelId: this.targetDdmModelId,
        schemas: this.selectedSchemas,
        // ddm 版本为 最新, 传空值给后台
        ddmModelVerId:
          this.modelVersion === this.modelVersionDataFirst
            ? null
            : this.modelVersion,
        versionName:
          this.modelVersion === this.modelVersionDataFirst
            ? null
            : this.versionName,
        // compareStrategy: this.performOperation,
        compareEnable: this.compareEnable,
        syncEnable: this.syncEnable,
        lineageEnable: this.lineageEnable,
        originPath: this.path,
        originBranch: this.branch,
      }
      if (this.syncEnable && this.defaultVersion.length > 0) {
        compareMappingBody.syncStrategies = this.syncStrategies
      }
      if (this.currentMapping !== 'add') {
        compareMappingBody.id = this.currentMapping
      }
      this.$http
        .post(this.$meta_url + '/models/binding/ddm/model', compareMappingBody)
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.saveSolutionSucceed'))
          this.getCompareMappings()
          if (this.currentMapping !== 'add') {
          } else {
            this.currentMapping = null
          }
          this.couldSaveState = true
          this.autoSetJob.modelId = this.modelId
          this.sourceData = this.sourceData || {}
          this.autoSetJob.modelName = this.sourceData.name
          // this.findJobAdded() // --
        })
        .catch(e => {
          this.$showFailure(e.response.data.errorMessage)
        })
      this.getCompareMappings()
    },
    addNewMapping() {
      this.getVersionsState = true
      this.couldSaveState = false
      this.currentMapping = 'add'
      this.tableData = []
      this.histories = []
      this.targetDdmModelId = null
      this.dsToDdm = null
      this.selectedSchemas = []
      this.modelVersion = ''
      this.versionName = ''
      this.modelVersionData = []
      // this.performOperation = 'only_compare'
      this.defaultVersion = []
      this.strategyArr1 = 'DAM_FIRST'
      this.strategyArr2 = 'DAM_FIRST'
      this.strategyArr3 = 'DAM_FIRST'
      this.strategyArr4 = 'DAM_FIRST'
      this.time = null
      this.syncTime = null
      this.syncTimeArr = []
      this.syncDataTable = []
      this.clearData()
      this.componentDestroyed = false
      this.curTab = 'compare'
      this.compareEnable = false
      this.lineageEnable = false
      this.syncEnable = false
    },
    /**
     * 切换对比方案
     * @param mapping
     */
    getHistory(mapping) {
      this.curTab = 'compare'
      this.versionName = mapping.versionName || ''
      this.branch = mapping.originBranch || ''
      this.path = mapping.originPath || ''
      this.defaultVersion = []
      this.getVersionsState = false
      this.couldSaveState = true
      // this.performOperation = mapping.compareStrategy
      this.clearData()
      this.modelVersion = mapping.ddmModelVerId || ''
      this.versionName = mapping.versionName || ''
      // 获取模型版本列表, 如果当前 mapping 没有 ddm 版本, 则选择最新版本
      this.getVersions(
        mapping.ddmModelId,
        mapping.ddmModelVerId,
        mapping.versionName
      )
      // 转换参数
      if (!mapping.compareStrategy) {
        this.compareEnable = mapping.compareEnable
        this.lineageEnable = mapping.lineageEnable
        this.syncEnable = mapping.syncEnable
      } else if (mapping.compareStrategy === 'only_compare') {
        this.compareEnable = true
        this.lineageEnable = false
        this.syncEnable = false
      } else if (mapping.compareStrategy === 'all') {
        this.compareEnable = true
        this.lineageEnable = false
        this.syncEnable = true
      } else if (mapping.compareStrategy === 'only_sync') {
        this.compareEnable = false
        this.lineageEnable = false
        this.syncEnable = true
      }
      if (
        (mapping.compareStrategy &&
          mapping.compareStrategy !== 'only_compare') ||
        mapping.syncEnable
      ) {
        if (mapping.syncStrategies !== null) {
          mapping.syncStrategies.forEach(element => {
            if (element.syncType === 'domain') {
              this.defaultVersion.push(element.syncType)
              this.strategyArr1 = element.strategy
            } else if (element.syncType === 'aliasName') {
              this.defaultVersion.push(element.syncType)
              this.strategyArr2 = element.strategy
            } else if (element.syncType === 'udp') {
              this.defaultVersion.push(element.syncType)
              this.strategyArr3 = element.strategy
              if (element.udpSyncStrategy && element.udpSyncStrategy !== null) {
                this.udpSyncStrategyArr = true
              } else {
                this.udpSyncStrategyArr = false
              }
            } else if (element.syncType === 'definition') {
              this.defaultVersion.push(element.syncType)
              this.strategyArr4 = element.strategy
            } else if (element.syncType === 'standard') {
              this.defaultVersion.push(element.syncType)
              this.strategyArr5 = element.strategy
            }
            if (this.defaultVersion.indexOf('udp') > -1) {
              this.defaultVersionUdp = false
            } else {
              this.defaultVersionUdp = true
            }
          })
        } else {
          this.defaultVersion = []
          this.strategyArr1 = 'DAM_FIRST'
          this.strategyArr2 = 'DAM_FIRST'
          this.strategyArr3 = 'DAM_FIRST'
          this.strategyArr4 = 'DAM_FIRST'
        }
      }
      this.componentDestroyed = false
      this.currentMapping = mapping.id
      const mappingId = mapping.id
      this.targetDdmModelId = mapping.ddmModelId
      this.selectedSchemas = mapping.schemas
      this.getBindedModels()
      this.getSyncHistoryList()
      this.$http
        .get(
          this.$meta_url +
            `/models/${this.modelId}/${mappingId}/compareResultHistory`
        )
        .then(res => {
          this.histories = []
          Array.isArray(res.data) &&
            res.data.forEach(item => {
              this.histories.push({
                damModelId: item.damModelId,
                damModelVersion: item.compareId.split(':')[1].split('/')[0],
                ddmModelId: item.compareId.split(':')[1].split('/')[1],
                ddmModelVersion: item.compareId.split(':')[2].split('/')[0],
                time: moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss'),
              })
            })
          this.time = this.histories[0]
          if (this.time) {
            this.getData(this.histories[0])
          } else {
            this.loading = false
          }
          // ddm model 已经被删除
          if (!this.getMasterName(mapping.ddmModelId)) {
            this.modelVersion = ''
            this.versionName = ''
            this.dsToDdm = ''
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    addDdmMpa(modelData) {
      modelData = _.cloneDeep(modelData)
      const modelId = modelData.id
      if (!this.ddmMap.get(modelId)) {
        this.ddmMap.set(modelId, modelData)
        this.ddmMapVersion++
      }
    },
    oldGetHistories() {
      this.$http
        .get(
          this.$meta_url + '/models/' + this.modelId + '/compareResultHistory'
        )
        .then(res => {
          this.histories = []
          Array.isArray(res.data) &&
            res.data.forEach(item => {
              this.histories.push({
                damModelId: item.damModelId,
                damModelVersion: item.compareId.split(':')[1].split('/')[0],
                ddmModelId: item.compareId.split(':')[1].split('/')[1],
                ddmModelVersion: item.compareId.split(':')[2],
                time: moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss'),
              })
            })
          this.time = this.histories[0]
          if (this.time) {
            this.getData(this.histories[0])
          }
        })
        .catch(e => {
          console.log(e)
          this.$message.info(e.response.data.errorMessage)
          //      this.$showFailure(e);
          this.loading = false
        })
    },
    addBind2() {
      this.dialog2Visible = true
    },
    getBindedModels() {
      if (this.targetDdmModelId) {
        const modelId = this.targetDdmModelId
        if (!this.modelProMap[modelId]) {
          this.modelProMap[modelId] = HTTP.getModelDetail({ modelId })
        }
        this.modelProMap[modelId]
          .then(res => {
            if (res && res.data) {
              this.addDdmMpa(res.data)
              if (this.getVersionsState === true) {
                this.getVersions(res.data.id)
              }
              this.dsToDdm = res.data.name
              if (res.data.referredModelId) {
                const modelId = res.data.referredModelId
                if (!this.modelProMap[modelId]) {
                  this.modelProMap[modelId] = HTTP.getModelDetail({ modelId })
                }
                // this.$http.get(this.$url + '/service/models/ddm/models/' + res.data.referredModelId)
                this.modelProMap[modelId]
                  .then(res => {
                    this.dsToDdm = res.data.name + '/' + this.dsToDdm
                    this.addDdmMpa(res.data)
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .get(this.$meta_url + '/service/models/' + this.modelId + '/plain')
          .then(res => {
            if (res.data.ddmModelId) {
              const modelId = res.data.ddmModelId
              if (!this.modelProMap[modelId]) {
                this.modelProMap[modelId] = HTTP.getModelDetail({ modelId })
              }
              return this.modelProMap[modelId]
            } else {
              // throw new Error('该数据源未绑定开发模型');
            }
          })
          .then(res => {
            if (res && res.data) {
              this.addDdmMpa(res.data)
              this.dsToDdm = res.data.name
              this.nameObj.rightObject = this.dsToDdm
              if (res.data.referredModelId) {
                const modelId = res.data.referredModelId
                if (!this.modelProMap[modelId]) {
                  this.modelProMap[modelId] = HTTP.getModelDetail({ modelId })
                }
                // this.$http.get(this.$url + '/service/models/ddm/models/' + res.data.referredModelId)
                this.modelProMap[modelId]
                  .then(res => {
                    this.addDdmMpa(res.data)
                    this.dsToDdm = res.data.name + '/' + this.dsToDdm
                    this.nameObj.rightObject = this.dsToDdm
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }

      // this.dsToDdm = 'abc';
    },
    getActiveBranch(modelId) {
      this.$http
        .get(this.$url + '/service/models/' + modelId + '/activeBranch')
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getMasterName(modelId) {
      const model = this.ddmMap.get(modelId)
      let result = ''
      if (model) {
        if (model.branch && model.referredModelId) {
          const master = this.ddmMap.get(model.referredModelId)
          if (master && master.name) {
            result = `${master.name}/${model.name}`
          } else {
            result = model.name
          }
        } else {
          result = model.name
        }
      }
      return result
    },
    bind2(model) {
      this.path = model.path
      this.targetDdmModelId = model.id
      this.modelVersion = ''
      this.versionName = ''
      model = model || {}
      if (model.type == 'branch') {
        this.branch = model.name
        const parent = model.parent || {}
        this.targetDdmModelName = model.parent + '/' + model.name
      } else {
        this.branch = 'master'
        this.targetDdmModelName = model.name
      }
      this.dialog2Visible = false
      this.getVersionsState = true
      this.getBindedModels()
      if (!this.hasSchemas) {
        this.saveCompareMapping()
      }
      /* this.$http.post(this.$url + '/service/models/' + this.modelId + '/ddm/models/' + this.targetDdmModelId).then(res => {
        this.$message.success("模型绑定成功");
        this.dialog2Visible = false;
        this.getBindedModels();
        this.autoSetJob.modelId = this.modelId;
        this.autoSetJob.modelName = this.sourceData.name;
        this.findJobAdded();

      }).catch(e => {
        this.$showFailure(e);
      }); */
    },

    //  findModelAdded(models){
    //    models.forEach(model=>{
    //      if(model.connectionInfo.sourceName == this.autoSetJob.modelName){
    //        this.autoSetJob.modelId = model.connectionInfo.modelId;
    //        this.findJobAdded();
    //      }
    //    });
    //  },
    findJobAdded() {
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: 'ModelCompareJobDescriptor',
      }
      this.$http
        .post(`${this.$url}/service/datablau_jobs/page`, options)
        .then(res => {
          const job = res.data.content[0]
          const modelId = JSON.parse(job.jobContent).damModelId
          if (modelId === this.autoSetJob.modelId) {
            this.autoSetJob.jobId = job.id
            this.setJob()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setJob() {
      this.$http
        .put(
          this.$url +
            '/service/datablau_jobs/' +
            this.autoSetJob.jobId +
            '/enable'
        )
        .then(res => {
          this.scheduleJob()
          this.$confirm(
            this.$t('meta.DS.treeSubOperation.exeTips', {
              modelName: this.autoSetJob.modelName,
            }),
            this.$t('meta.DS.treeSubOperation.tips'),
            {
              confirmButtonText: this.$t('common.button.ok'),
              cancelButtonText: this.$t('common.button.cancel'),
              type: 'success',
            }
          )
            .then(() => {
              this.scheduleJobNow()
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: this.$t('meta.DS.treeSubOperation.runMsg', {
                  modelName: this.autoSetJob.modelName,
                }),
              })
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    scheduleJobNow() {
      this.$http
        .put(
          this.$url + '/service/datablau_jobs/' + this.autoSetJob.jobId + '/run'
        )
        .then(res => {
          this.$message.success(
            this.$t('meta.DS.treeSubOperation.runningMsg', {
              modelName: this.autoSetJob.modelName,
            })
          )
          // this.getHistories();
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    scheduleJob() {
      this.$http
        .put(
          this.$url +
            '/service/datablau_jobs/' +
            this.autoSetJob.jobId +
            '/reschedule',
          {
            schedule: 'cron:0 0 0 ? * 1,Sun',
          }
        )
        .then(res => {
          //      this.$message.success(this.autoSetJob.modelName + '的模型差异比较任务已经被设为每周日重启一次')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    getFreeModels2() {
      HTTP.getAllModels()
        // this.$http.get(this.$url + '/service/models/ddm/models')
        .then(res => {
          const data = _.cloneDeep(res.data)
          this.modifyArrKey(data)
          this.freeModels2 = [data]
          this.showCompareMappings = true
          this.ddmMapVersion++
          this.getAllModels = true
          setTimeout(() => {
            Ps.initialize($('#diff-tree-box')[0])
          })
          this.loading = false
        })
        .catch(e => {
          console.log(e)
          this.getAllModels = true
        })
    },
    modifyArrKey(obj) {
      const self = this
      obj.sId = 'c' + obj.id
      if (obj.children != null) {
        obj.children.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.models != null) {
        obj.models.forEach(item => {
          if (obj.children == null) {
            obj.children = []
          }
          this.ddmMap.set(item.id, item)
          item.type = 'model'
          item.children = []
          item.sId = 'm' + item.id
          obj.children.push(item)
        })
      }
    },
    clearData() {
      this.result = _.cloneDeep(this.defaultResult)
      if (this.tableData) {
        this.tableData.length = 0
      }

      this.nameObj.rightObject = null
      this.nameObj.leftObject = null
      this.data = null
      this.componentDestroyed = true
      this.componentKey++
    },
    clearAll() {
      this.currentMapping = 'add'
      this.tableData.length = 0
      this.histories.length = 0
      this.targetDdmModelId = ''
      this.dsToDdm = ''
      this.selectedSchemas.length = 0
      this.time = ''
      this.modelVersion = ''
      this.versionName = ''
      this.clearData()
    },
    getData() {
      this.loading = true
      const source = CancelToken.source()
      this.cancelSource = source
      const a = arguments[0]
      this.clearData()
      this.resultFileUrl =
        this.$meta_url +
        '/models/' +
        this.modelId +
        '/' +
        a.damModelVersion +
        '/compareResultFile/' +
        this.currentMapping +
        '/' +
        a.ddmModelId +
        '/' +
        a.ddmModelVersion
      this.$http
        .get(
          this.$meta_url +
            '/models/' +
            this.modelId +
            '/' +
            a.damModelVersion +
            '/compareResult/' +
            this.currentMapping +
            '/' +
            a.ddmModelId +
            '/' +
            a.ddmModelVersion,
          { cancelToken: source.token }
        )
        .then(res => {
          this.cancelSource = null
          this.componentDestroyed = false
          this.result = res.data
          this.data = res.data.compareResult
          this.nameObj.rightObject = this.dsToDdm
          this.nameObj.leftObject = this.sourceData.name
          // this.data.rightObject = this.dsToDdm;
          // this.data.leftObject = this.sourceData.name;
          this.tableData = this.data.differences
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          // this.$message.error(e.response.data.errorMessage);
          this.loading = false
        })
    },
    getCountCellClass({ row, column, rowIndex, columnIndex }) {
      // console.log({row, column, rowIndex, columnIndex}, '{row, column, rowIndex, columnIndex}')
      let result = 'count-table-cell '
      const property = column.property || ''
      if (property && property !== 'type') {
        if (row[property] > 0) {
          result += 'diff-data-count count-not-none'
        } else {
          result += 'diff-data-count'
        }
      } else {
        result += 'type-column'
      }
      return result
    },
  },
}
