import DatabaseType from './DatabaseType.vue'
import HTTP from '@/http/main'
import jobHistory from '@/components/common/simpleJobHistory.vue'
import DatasourceController from '../../../../base-components/http/baseController/DatasourceController'

const moment = require('moment')
export default {
  data() {
    this.BASE_URL = this.$url + '/service/'
    this.uploadHost = this.BASE_URL + 'upload'
    if (this.$customerId === 'gszc') {
      this.parameterMap = {
        PortNumber: this.$t('meta.dataSource.portNum'),
        Zone: this.$t('meta.dataSource.usage'),
        Deploy: this.$t('meta.dataSource.deploy'),
        State: this.$t('meta.dataSource.state'),
        Description: this.$t('meta.dataSource.mask'),
        HostServer: this.$t('meta.dataSource.serverName'),
        DatabaseName: this.$t('meta.dataSource.dbName'),
        DBVersion: this.$t('meta.dataSource.dbVersion'),
        SelectedSchemas: this.$t('meta.dataSource.selectedSchemas'),
        SelectedTables: this.$t('meta.dataSource.selectedTable'),
      }
    } else {
      this.parameterMap = {
        PortNumber: this.$t('meta.dataSource.portNum'),
        HostServer: this.$t('meta.dataSource.hostName'),
        DatabaseName: this.$t('meta.dataSource.dbName'),
        DBVersion: this.$t('meta.dataSource.dbVersion'),
        SelectedSchemas: this.$t('meta.dataSource.selectedSchemas'),
        SelectedTables: this.$t('meta.dataSource.selectedTable'),
      }
    }
    return {
      // 显示table
      selection: [],
      selectCal: 0,
      deltaData: [],
      allData: [],
      total: 0,
      dsData: [], // 过滤后的数组
      dsDataKey: 0,
      testBtnKey: 0,
      displayData: undefined,
      keyword: '',
      keywordFilterProps: ['sourceName', 'type', 'categoryName'],
      emptyPara: {
        keyword: '',
        currentPage: 1,
        sortData: {
          prop: '',
          order: 'ascending',
        },
        pageSize: 20,
      },
      sortData: {
        prop: '',
        order: 'ascending',
      },
      loadingDS: true,
      deleteDisabled: true,
      currentRow: null,
      // tableHeight: undefined,
      showTable: false,
      currentPage: 1,
      pageSize: 20,

      // 修改,添加 数据源
      schemaSelected: [],
      isEditing: false,
      dsform: {},
      updateDataSource: false,
      autoSetJob: {
        modelId: '',
        modelName: '',
      },
      showHistory: false,
      hasHistory: false,
      showMore: true,
      AuthenticationType: '0', // 授权方式 0:用户名/密码; 1:kerberos
      requireDbport: true,
      userPasswordRequ: false,
      dialogCrVdsVisible: false,
      ESwithSsl: '',
      currentModelId: null,
      expandRowKeys: [],
      hasUsage: [],
      hasUsageDialog: false,
      deleting: false,
      parameterMapForFile: {
        // SelectedTables:'选择的表'
        sharePath: this.$t('meta.dataSource.edit.filePath'),
        description: this.$t('meta.dataSource.edit.desc'),
      },
      mutipleLength: 0,
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      checkDisabledObj: {
        modelId: ['fake'],
      },
      eventInterval: null,
      jobInRunning: false,
      jobId: null,
      eventInterval1: null,
      eventVisible: false,
      loadingData: true,
      jobStaData: [],
      agentMessage: null,
      insertFlag: false,
      appName: HTTP.$appName,
      bindingDsVisible: false,
      request: {},
      rules: {},
      dsSelectList: [],
      seniorBind: false,
    }
  },
  props: {
    dsformConstant: Object,
    formatDataSource: Function,
  },

  components: { DatabaseType, jobHistory },

  computed: {
    isFileData() {
      var self = this
      var ds = self.dsform
      return (
        // ds.dbtype == 'CSV' ||
        // ds.dbtype == 'EXCEL' ||
        ds.dbtype == 'DATADICTIONARY' ||
        ds.dbtype == 'DATADICTIONARY_LOGICAL' ||
        ds.dbtype == 'TABLEAU'
      )
    },
  },
  created() {},
  mounted() {
    this.$bus.$on('callDataSourceTabToAddDs', this.addDs)
    this.$bus.$on('forceUpdataNav', () => {
      // 根据权限,刷新数据源 操作栏
      this.showMore = false
      setTimeout(() => {
        this.showMore = true
      }, 0)
    })
    let self = this
    //  self.innerLoadDataSources();
    this.checkREProgress()
    // this.tableHeight = $('.table-row')[0].offsetHeight
    $(window).resize(this.resizeTable)
    this.$bus.$on('agent-message', obj => {
      this.agentMessage = obj
    })
    this.$bus.$on('changeDs', ({ dsform, para }, type) => {
      this.requireDbport = true
      if (dsform && para) {
        // 传入参数, 修改ds
        this.schemaSelected = para.schemaSelected
        this.AuthenticationType = para.AuthenticationType
        this.requireDbport = para.requireDbport
        this.userPasswordRequ = para.userPasswordRequ
        this.ESwithSsl = para.ESwithSsl
        if (type && type === 'forRe') {
          const forReParam = this.handleSaveParam(dsform, para)
          this.$bus.$emit('forReParam', forReParam)
        } else {
          if (!this.insertFlag) {
            this.ediDS(dsform, para)
          }
        }
      } else {
        this.innerLoadDataSources()
      }
    })
    this.$bus.$on('dataSourceTabOntop', () => {
      self.resizeTable()
    })

    const history = this.$getSimpleHistory('dataSource')
    if (history && Array.isArray(history) && history.length > 0) {
      this.hasHistory = true
    }
    this.$bus.$on('updateDataSourceJobStatus', ({ jobId, timer }) => {
      if (timer) {
        clearTimeout(timer)
      }
    })
    let dom = this.$refs.dsTable.$el.querySelector('.el-table__body-wrapper')
    dom.addEventListener('scroll', this.hideContextMenu)
    $(document).on('keydown', this.advancedSetting)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
    this.$bus.$off('changeDs')
    this.$bus.$off('dataSourceTabOntop')
    this.$bus.$off('forceUpdataNav')
    this.$bus.$off('callDataSourceTabToAddDs')
    this.$bus.$off('updateDataSourceJobStatus')
    this.$store.commit('setDataSourceScan', false)
    clearInterval(this.eventInterval)
    let dom = this.$refs.dsTable.$el.querySelector('.el-table__body-wrapper')
    dom && dom.removeEventListener('scroll', this.hideContextMenu)
    $(document).off('keydown')
  },

  methods: {
    advancedSetting(e) {
      if (e.keyCode === 77 && e.ctrlKey) {
        this.seniorBind = true
      }
    },
    requestDsChange() {
      let lineObj = this.dsSelectList.filter(
        item => item.id.toString() === this.request.dsDsId.split('/')[0]
      )
      this.request.dsDsId = lineObj[0].id + '/' + lineObj[0].name
    },
    getDsList(row) {
      this.$http
        .post(`${HTTP.$dddServerUrl}workflow/datasource/${row.type}`)
        .then(res => {
          this.dsSelectList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bindingSave() {
      let params = {
        damDsId: this.request.damDsId.split('/')[0],
        damDsName: this.request.damDsId.split('/')[1],
        dsDsId: this.request.dsDsId.split('/')[0],
        dsDsName: this.request.dsDsId.split('/')[1],
        type: this.request.type,
        env: this.request.env,
      }
      this.$http
        .post(`${HTTP.$dddServerUrl}datasource/bind`, params)
        .then(res => {
          this.$datablauMessage.success('映射成功')
          this.bindingDsVisible = false
          this.request = {}
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    goToMeta(row) {
      let msg = JSON.stringify({ metaModelId: row.modelId, type: 'goToMeta' })
      window.parent.postMessage(msg, '*')
    },
    hideContextMenu() {
      $('#context-menu').css('display', 'none')
    },
    callOptionsMenu(row, evt, idx) {
      this.currentModelId = row.id
      const x = evt.clientX + 73
      const y = evt.clientY + 5
      const options = []
      // if(this.$featureMap['FE_META']){
      //   options.push({
      //     label:'导出元数据',
      //     callback:()=>{
      //       this.downloadMetadata(row);
      //     }
      //   })
      // }
      // if(this.$featureMap['FE_META']&&!this.isFileItem(row)) {
      //   options.push({
      //     label: '更新元数据',
      //     callback: () => {
      //       let ref = this.$refs.refreshMeta;
      //       ref.$el.click();
      //     }
      //   });
      // }
      // 报表类型数据源没有 比较任务
      if (row && row.parameterMap && row.parameterMap.biType) {
      } else if (this.$featureMap.FE_META && this.appName !== 'DDD') {
        if (
          this.$ddmConnectable &&
          this.$versionFeature.metadata_ModelCompare
        ) {
          options.push({
            label: this.$t('meta.dataSource.compare'),
            callback: () => {
              this.goToJob(row, 2)
            },
          })
        }
        // 非文件系统有血缘任务
        if (!this.isFileItem(row)) {
          options.push({
            label: this.$t('meta.dataSource.lineage'),
            callback: () => {
              this.goToJob(row, 3)
            },
          })
        }
      }
      if (this.$featureMap.FE_META && this.appName !== 'DDD') {
        options.push({
          label: this.$t('meta.dataSource.update'),
          callback: () => {
            this.goToJob(row, 1)
          },
        })
      }
      if (this.appName === 'DDD' && this.seniorBind) {
        options.push({
          label: '绑定',
          callback: () => {
            this.request = {
              damDsId: row.modelId + '/' + row.definition,
              damDsName: row.definition,
              type: row.type,
              env: 'dev',
            }
            this.getDsList(row)
            this.bindingDsVisible = true
          },
        })
      }
      if (!this.isFileItem(row) && false) {
        options.push({
          label: this.$t('meta.dataSource.checkCon'),
          callback: () => {
            this.handleTest(row)
          },
        })
      }

      //        icon:'el-icon-upload',
      //        label:'批量导入',
      //        callback:()=>{
      //          if(!this.uploading){
      //            $('#ban-upload-btn').click();
      //          }else{
      //            this.$message.warning('正在导入中，请稍候');
      //          }
      //        }
      //      },
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
        isLeft: true,
        placement: 'bottom-left',
      })
    },
    isRowFileData(data) {
      let type = data.type || ''
      type = type.toUpperCase()
      const map = {
        // CSV: true,
        // EXCEL: true,
        DATADICTIONARY: true,
        DATADICTIONARY_LOGICAL: true,
        TABLEAU: true,
      }
      return !!map[type]
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange(size) {
      const obj = {
        keyword: this.keyword,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: size,
      }
      this.currentPage = 1
      this.pageSize = size
      this.changeDSDisplay(obj)
    },
    handleCurrentChange(currentPage) {
      const obj = {
        keyword: this.keyword,
        currentPage: currentPage,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.changeDSDisplay(obj)
    },
    handleSortChange(sortData) {
      this.sortData = sortData
      // sortData = {column, prop, order}
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },
    handleDiaChange(sortData) {
      this.sortData = sortData
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
      }
      this.changeDiaDisplay(obj)
    },
    // 列表数据
    changeDiaDisplay(para) {
      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          this.hasUsage,
          para.sortData.prop,
          order
        )
      }
    },

    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
      this.deleteDisabled = this.selection.length == 0
    },

    handleCreated() {
      this.dialogCrVdsVisible = false
    },
    downloadMetadata(row) {
      this.$emit('downloadMetadata', row.id)
    },
    handleRefresh(index, row) {
      // deprecated
      /* const self = this;
      row.isRefreshing = true;
      this.dsDataKey++;
      self.$http
        .get(self.BASE_URL + "models/" + row.modelId + "/delta")
        .then(res => {
          this.deltaData = res.data;
          row.isRefreshing = false;
          if (!res.data.changedObjects) {
            this.$message.success("模型无变化");
            this.dsDataKey++;
          } else {
            self.innerLoadDataSources();
            this.dialogShowDifferenceVisible = true;
            self.showSuccess("更新数据源成功");
            this.dsDataKey++;
          }
        })
        .catch(e => {
          row.isRefreshing = false;
          this.$showFailure(e);
        }); */
    },
    goToJob(row, jobType) {
      let isReport = this.$globalData.$importTypeArr.filter(item => {
        return item.value === row.type
      })
      let update = jobType === 1 && isReport.length === 0
      if (
        row.parameterMap &&
        row.parameterMap.biType &&
        row.parameterMap.jobId
      ) {
        this.$router.push({
          name: 'jobManagement',
          query: {
            jobId: row.parameterMap.jobId,
            from: 'dataSource',
            update: update,
          },
        })
      } else {
        this.$router.push({
          name: 'jobManagement',
          query: {
            dataSourceId: row.id,
            jobType: jobType,
            update: update,
          },
        })
      }
    },
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('meta.dataSource.updateMetadata'),
        time: 10,
      })
    },
    handleUpdateMetadataSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
    },
    handleTest(row, index) {
      if (row.type === 'AGENT') {
        const agentForm = {
          host: row.parameterMap.agentHost,
          port: row.parameterMap.agentPort,
          agentModelId: row.parameterMap.agentModelId,
        }
        this.$http
          .post(this.$url + `/service/agent/database`, agentForm)
          .then(res => {
            row.isError = false
            row.isSuccess = true
            this.testBtnKey++
          })
          .catch(e => {
            row.isSuccess = false
            row.isError = true
            this.testBtnKey++
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(`${this.$url}/datasources/testConnection?dsId=${row.id}`)
          .then(res => {
            row.isError = false
            row.isSuccess = true
            this.testBtnKey++
          })
          .catch(e => {
            row.isSuccess = false
            row.isError = true
            this.testBtnKey++
            this.$showFailure(e)
          })
        /* this.$http
          .get(this.BASE_URL + 'models/connection/test/' + row.modelId)
          .then(res => {
            row.isError = false
            row.isSuccess = true
            this.testBtnKey++
          })
          .catch(e => {
            row.isSuccess = false
            row.isError = true
            this.testBtnKey++
            this.$showFailure(e)
          }) */
      }
    },
    findUsage() {
      let datasourceIds = []
      this.selection.forEach(element => {
        datasourceIds.push(element.id)
      })
      let resIds = datasourceIds.join(',')
      let obj = {
        predicates: {
          datasourceIds: resIds,
        },
      }
      this.$http
        .post(`${this.$meta_url}/service/models/confirmDelete`, obj)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length) {
            this.hasUsage = []
            res.data.forEach(item => {
              this.selection.forEach(sel => {
                if (sel.id === item) {
                  this.hasUsage.push({
                    id: item,
                    sourceName: sel.sourceName,
                    type: sel.type,
                    createTime: sel.createTime,
                  })
                }
              })
            })
            this.hasUsageDialog = true
          } else {
            this.deleteRow()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteRow() {
      this.$DatablauCofirm(
        this.$t('meta.dataSource.delTips'),
        this.$t('common.button.delete'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          this.loadingDS = true
          this.delmodel()
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 触发 编辑数据源
    handleEdit(rowInfo, isSee) {
      this.$store.commit('setDataSourceScan', isSee)
      const row = _.cloneDeep(rowInfo)
      this.isEditing = true
      this.$emit('showDSeditab', this.isEditing, row)
    },
    // 触发 添加数据源
    addDs() {
      var self = this
      //      var randomNumber = Math.round(Math.random() * 1000);
      const randomNumber =
        moment().format('YYMMDD-HH') + '' + Math.round(Math.random() * 10)
      this.isEditing = false
      self.dsform = JSON.parse(JSON.stringify(self.dsformConstant))
      // self.dsform.displayName = 'm-' + randomNumber.toString()
      self.dsform.displayName = ''
      self.dsform.displayNameAdd = ''
      this.$store.commit('setDataSourceScan', false)
      this.showaddtab()
    },
    reMetaData() {
      this.$emit('showRe')
    },

    /** 处理显示的数据 */
    parameterFormat: function (row) {
      return JSON.stringify(row.parameterMap)
    },
    resizeTable() {
      this.$nextTick(() => {
        // this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
        this.dsDataKey++
      })
    },
    // 列表数据
    changeDSDisplay(para, allData) {
      allData = allData || this.allData
      const arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        this.currentPage = para.currentPage
      }
      para.keyword = para.keyword || this.keyword
      const keyword = para.keyword.trim().toLowerCase()
      allData.forEach(item => {
        let bool = false
        this.keywordFilterProps.forEach(prop => {
          if (item[prop] && item[prop].toLowerCase().indexOf(keyword) !== -1) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      this.total = arr.length
      this.dsData = arr
      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )
      this.loadingDS = false
    },

    /** 处理不显示的数据 */
    isOracle() {
      const ds = this.dsform
      return ds.dbtype === 'ORACLE'
    },
    versionFormat: function (row) {
      return row.versioning
        ? this.$t('meta.common.true')
        : this.$t('meta.common.false')
    },
    formateJobSta(row, column, cellValue, index) {
      const sta = cellValue
      const staMap = {
        INFO: '信息',
        ERROR: '错误',
        STOP: '停止',
        COMPLETE: '完成',
      }
      return staMap[sta] ? staMap[sta] : sta
    },
    // 删除数据源
    delmodel() {
      this.deleting = true
      this.loadingDS = true
      let datasourceIds = []
      this.selection.forEach(element => {
        datasourceIds.push(element.id)
      })
      this.jobStaData = []
      this.$http
        .post(`${this.$url}/datasources/deleteDatasources`, datasourceIds)
        .then(res => {
          this.hasUsageDialog = false
          this.deleting = false
          this.$datablauMessage.success(
            this.$t('meta.dataSource.datasourceRemoveSucceed')
          )
          this.innerLoadDataSources()

          // todo  任务弹窗
          /* this.jobId = res.data
          this.runObject(res.data)
          this.eventVisible = true */
        })
        .catch(e => {
          this.$showFailure(e)
          this.innerLoadDataSources()
          this.loadingDS = false
          this.deleting = false
        })
    },
    runObject(id) {
      const self = this
      this.$http
        .put(this.$url + `/service/datablau_jobs/${id}/run`)
        .then(res => {
          self.jobInRunning = true
          this.innerLoadDataSources()
          this.loadingDS = false
          if (self.jobInRunning == true) {
            clearInterval(self.eventInterval1)
            self.eventInterval1 = setInterval(() => {
              self.refreshCheck(id)
            }, 3000)
            self.refreshJobStatus()
          } else {
            clearInterval(self.eventInterval1)
            clearInterval(self.eventInterval)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshCheck(id) {
      const self = this
      if (self.jobInRunning == true) {
        self.loadCurrentJob(id)
      } else {
        clearInterval(self.eventInterval)
        clearInterval(self.eventInterval1)
      }
    },
    // 循环调用接口查询
    refreshJobStatus() {
      const self = this
      setTimeout(() => {
        const url = `${this.$url}/service/datablau_jobs/${this.jobId}/history`
        this.$http
          .get(url)
          .then(res => {
            const data = res.data
            if (data && Array.isArray(data)) {
              const instance = data[0] || {}
              const instanceId = instance.id
              if (instanceId) {
                const url = `${this.$url}/service/datablau_jobs/${instanceId}/events`
                clearInterval(self.eventInterval)
                self.eventInterval = setInterval(() => {
                  this.$http
                    .get(url)
                    .then(res => {
                      if (res.data && Array.isArray(res.data)) {
                        const data = res.data.reverse()
                        this.jobStaData = data
                        this.loadingData = false
                      }
                    })
                    .catch(e => {
                      this.$showFailure(e)
                    })
                }, 2000)
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 500)
    },
    loadCurrentJob(jobId) {
      if (!jobId) return
      const self = this
      self.jobLog = []

      self.$http
        .get(this.$url + '/service/datablau_jobs/' + jobId)
        .then(res => {
          if (res.data.length != 0) {
            const data = res.data
            // if API will return all log, need to add cycle to get data.
            self.jobLog.push(data)
          }
          if (
            self.jobLog.length > 0 &&
            self.jobLog[0].status != 'FINISHED' &&
            self.jobLog[0].status != 'STOPPED' &&
            self.jobLog[0].status != 'FAILED' &&
            self.jobLog[0].status != 'SKIPPED' &&
            self.jobLog[0].status != 'NOT_RUN'
          ) {
            // self.jobInRunning = true
            self.refreshJobStatus()
          } else {
            self.jobInRunning = false
            clearInterval(this.eventInterval)
            clearInterval(this.eventInterval1)
            if (self.jobLog[0].status === 'FAILED') {
              this.$showFailure(
                this.$t('meta.dataSource.datasourceRemoveFailed')
              )
            } else {
              this.showSuccess(
                this.$t('meta.dataSource.datasourceRemoveSucceed')
              )
            }
            this.innerLoadDataSources()
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    showSuccess(msg) {
      this.$message({
        title: 'Success',
        message: msg,
        type: 'success',
      })
    },
    refreshDataSourceList() {
      HTTP.refreshDataSource()
    },

    // 显示 标签(修改,添加)
    showaddtab() {
      var self = this
      const para = {}
      const ds = _.cloneDeep(self.dsform)
      this.$emit('showDSeditab', this.isEditing, ds, para)
    },
    handleSaveParam(dsform, para) {
      const ds = dsform
      let formatPara = {
        isFileData: this.isFileItem(ds),
        isOracle: ds.dbtype === 'ORACLE',
      }
      const obj = _.cloneDeep(para)
      formatPara = _.merge(obj, formatPara)

      const json = this.formatDataSource(ds, false, formatPara)
      if (!json) {
        this.editDsFail(ds.displayName)
        return
      }
      if (dsform.connUrl) {
        json.connUrl = dsform.connUrl
        json.parameterMap.HostServer = ''
        json.parameterMap.PortNumber = ''
      }
      if (this.isEditing) {
        if (Array.isArray(json.parameterMap.DatabaseName)) {
          json.parameterMap.DatabaseName = json.parameterMap.DatabaseName[0]
        }
        if (this.schemaSelected.length > 0) {
          json.parameterMap.SelectedSchemas = this.schemaSelected.join(';')
        }
        json.driverId = ds.driverId
        let query = ''
        if (ds.dbtype === 'HBASE') {
          const paraObj = {
            ScanSize: ds.ScanSize || 1000,
            Encoding: ds.Encoding || 'UTF-8',
          }
          query += '?options=' + encodeURIComponent(JSON.stringify(paraObj))
        }
        if (ds.dbtype === 'INFORMIX') {
          json.parameterMap.InstanceName = ds.InstanceName
        }
        if (json.type === 'MYSQL') {
          delete json.parameterMap.SelectedSchemas
        }
        if (`${json.parameterMap.AuthenticationType}` === '0') {
          delete json.parameterMap.KeyTabPath
          delete json.parameterMap.Krb5Path
        }
        const url1 = self.BASE_URL + 'models/' + ds.id + query
        if (this.isFileData && json.parameterMap.ShareFilePath) {
          json.parameterMap.ShareFilePath =
            json.parameterMap.ShareFilePath.replace(/\s+/g, '')
          json.parameterMap.FilePath = json.parameterMap.ShareFilePath.replace(
            /\s+/g,
            ''
          )
        }
        if (!this.$versionFeature.metadata_Relationships) {
          delete json.parameterMap.ReFK
        }
        return json
      } else {
        json.readMetadata = ds.readMetadata
        json.driverId = ds.driverId
        json.sourceName = ds.displayName
        const request = json
        let query = ''
        if (ds.dbtype === 'HBASE') {
          const paraObj = {
            ScanSize: ds.ScanSize || 1000,
            Encoding: ds.Encoding || 'UTF-8',
          }
          query += '?options=' + encodeURIComponent(JSON.stringify(paraObj))
        }
        if (ds.dbtype === 'INFORMIX') {
          request.parameterMap.InstanceName = ds.InstanceName
        }

        if (this.schemaSelected.length > 0) {
          request.parameterMap.SelectedSchemas = this.schemaSelected.join(';')
        }
        let dbTarget = []
        const dbSource = _.clone(json.parameterMap.DatabaseName)
        if (typeof dbSource === 'string') {
          dbTarget.push(dbSource)
        } else if (Array.isArray(dbSource)) {
          // maybe useless
          dbTarget = dbSource
        }
        if (`${request.parameterMap.AuthenticationType}` === '0') {
          delete request.parameterMap.KeyTabPath
          delete request.parameterMap.Krb5Path
        }

        // 处理agent情况
        if (this.agentMessage) {
          Object.keys(this.agentMessage).forEach(k => {
            request.parameterMap[k] = this.agentMessage[k]
          })
          request.type = 'AGENT'
          fakeData.type = 'AGENT'
        }

        if (!this.$versionFeature.metadata_Relationships) {
          delete request.parameterMap.ReFK
        }
        return request
      }
    },
    // 对 数据源 进行修改
    ediDS(dsform, para) {
      this.loadingDS = true
      this.insertFlag = true
      const saveParam = this.handleSaveParam(dsform, para)
      var self = this
      if (this.isEditing) {
        // 编辑保存
        let url = this.isEditing
          ? this.$url + '/datasources/updateDatasource'
          : this.$url + '/datasources/createDatasource'
        this.$http
          .post(url, saveParam)
          .then(() => {
            this.showSuccess(
              this.isEditing
                ? this.$t('meta.dataSource.modifySucceed')
                : this.$t('meta.dataSource.addedSucceed')
            )
            this.removetab()
            this.innerLoadDataSources()
            this.insertFlag = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.insertFlag = false
          })
      } else {
        // 新建保存
        self.loadingDS = true
        this.updateDataSource = true
        let url = this.isEditing
          ? this.$url + '/datasources/updateDatasource'
          : this.$url + '/datasources/createDatasource'
        this.$http
          .post(url, saveParam)
          .then(() => {
            this.showSuccess(
              this.isEditing
                ? this.$t('meta.dataSource.modifySucceed')
                : this.$t('meta.dataSource.addedSucceed')
            )
            this.removetab('add')
            this.innerLoadDataSources()
          })
          .catch(e => {
            this.$showFailure(e)
          })
        return

        const url1 = self.BASE_URL + 'models/re'
        if (this.isFileData && request.parameterMap.ShareFilePath) {
          request.parameterMap.ShareFilePath =
            request.parameterMap.ShareFilePath.replace(/\s+/g, '')
          request.parameterMap.FilePath =
            request.parameterMap.ShareFilePath.replace(/\s+/g, '')
        }
        if (dbTarget.length == 0) {
          let jobId = null
          self.$http
            .post(url + query, _.cloneDeep(request))
            .then(res => {
              jobId = res.data
              try {
                this.autoSetJob.modelName = request.sourceName
              } catch (e) {}
              /* if (jobId) {
                this.$dataSource.fakeData[jobId] = fakeData
              } */
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.insertFlag = false
              this.removetab('add')
              if (json.readMetadata === true) {
                self.showSuccess(this.$t('meta.dataSource.datasourceRESucceed'))
              } else {
                self.showSuccess(this.$t('meta.dataSource.addedSucceed'))
              }
              self.checkREProgress(res.data)
              self.loadingDS = false

              this.$saveJobHistory({
                name: ds.displayName,
                jobStatus: '',
                jobId: res.data,
                jobName: '',
                errorMessage: '',
                result: [],
                startTime: '',
                endTime: '',
                objType: ds.dbtype,
                jobType: 'dataSource',
                progress: 0,
              })
            })
            .catch(e => {
              this.$showFailure(e)
              self.loadingDS = false
              this.insertFlag = false
              if (jobId) {
                delete this.$dataSource.fakeData[jobId]
              }
              this.editDsFail(ds.displayName)
            })
        }
        dbTarget.forEach(db => {
          request.parameterMap.DatabaseName = db
          let jobId = null
          self.$http
            .post(url + query, _.cloneDeep(request))
            .then(res => {
              jobId = res.data
              try {
                this.autoSetJob.modelName = request.sourceName
              } catch (e) {}
              fakeData.jobIds = jobId
              this.$dataSource.fakeData[jobId] = fakeData
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )

              this.$saveJobHistory({
                name: ds.displayName,
                jobStatus: '',
                jobId: res.data,
                jobName: db,
                errorMessage: '',
                result: [],
                startTime: '',
                endTime: '',
                objType: ds.dbtype,
                jobType: 'dataSource',
                progress: 0,
              })

              this.removetab('add')
              if (json.readMetadata === true) {
                self.showSuccess(this.$t('meta.dataSource.datasourceRESucceed'))
              } else {
                self.showSuccess(this.$t('meta.dataSource.addedSucceed'))
              }
              self.checkREProgress(res.data)
              self.loadingDS = false
              this.insertFlag = false
            })
            .catch(e => {
              this.$showFailure(e)
              self.loadingDS = false
              this.insertFlag = false
              this.innerLoadDataSources()
              delete this.$dataSource.fakeData[jobId]
              this.editDsFail(ds.displayName)
            })
        })

        this.$showSimpleJobHistory.dataSource = true
        this.hasHistory = true
      }
    },
    editDsFail(displayName) {
      this.$bus.$emit('editDsFail', displayName)
    },
    checkREProgress(jobId) {
      this.innerLoadDataSources()
      const self = this
      if (jobId) {
        this.$dataSource.interval[jobId] = setInterval(() => {
          self.checkREProgressStep(jobId)
        }, 3000)
        window.localStorage.setItem(
          'dataSourcesOf' + this.$user.username,
          JSON.stringify(this.$dataSource)
        )
      } else {
        const local = window.localStorage.getItem(
          'dataSourcesOf' + this.$user.username
        )
        if (local) {
          this.$dataSource = JSON.parse(
            window.localStorage.getItem('dataSourcesOf' + this.$user.username)
          )
        }
        const keys = Object.keys(this.$dataSource.interval)
        keys.forEach(jobId => {
          this.$dataSource.interval[jobId] = setInterval(() => {
            self.checkREProgressStep(jobId)
          }, 1000)
        })
        window.localStorage.setItem(
          'dataSourcesOf' + this.$user.username,
          JSON.stringify(this.$dataSource)
        )
        if (keys.length == 0) {
        }
      }
    },
    checkREProgressStep(jobId) {
      const jobInfo = {
        jobId: jobId,
        type: 'datasource',
      }
      this.$addIntervalArr(jobInfo)
      if (this.$dataSource.fakeData[jobId].type) {
        this.$http
          .get(this.BASE_URL + 'models/re/' + jobId + '/progress')
          .then(res => {
            if (res.data.percentage === 100 || !!res.data.exception) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              delete this.$dataSource.interval[jobId]
              delete this.$dataSource.fakeData[jobId]
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              if (new Date().getTime() - this.lastLoadTimeStamp > 1000) {
                this.lastLoadTimeStamp = new Date().getTime()
              }
              this.$removeIntervalArr(jobInfo)
            } else if (!res.data) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              delete this.$dataSource.interval[jobId]
              delete this.$dataSource.fakeData[jobId]
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              this.$removeIntervalArr(jobInfo)
            }
            this.allData.slice(0, 20).forEach((a, i) => {
              if (a.jobIds && a.jobIds === jobId) {
                this.$set(
                  this.allData[i],
                  'percent',
                  Number(res.data.percentage)
                )
              }
            })
            const data = res.data
            this.$saveJobHistory({
              name: '',
              jobStatus:
                data.stopped || data.percentage === 100 || !!data.exception
                  ? 'FINISHED'
                  : 'RUNNING',
              jobId: jobId,
              jobName: '',
              errorMessage: '',
              result: data.message,
              startTime: '',
              endTime: data.timestamp,
              objType: '',
              jobType: 'dataSource',
              progress: data.percentage,
            })
          })
          .catch(e => {
            this.$showFailure(e)
            this.updateDataSource = false
            clearInterval(this.$dataSource.interval[jobId])
            delete this.$dataSource.interval[jobId]
            delete this.$dataSource.fakeData[jobId]
            window.localStorage.setItem(
              'dataSourcesOf' + this.$user.username,
              JSON.stringify(this.$dataSource)
            )
            this.innerLoadDataSources()
          })
      }
    },
    /**
     * 刷新列表数据
     */
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      this.refreshDataSourceList()
      let param = {
        keyword: this.keyword,
      }
      DatasourceController.findDatasources({ requestBody: param })
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.$utils.sort.sortConsiderChineseNumber(
            res.data,
            'createTime',
            'descending'
          )
          self.allData = res.data
          let flagNames = []
          /* if (JSON.stringify(this.$dataSource.fakeData) !== '{}') {
            Object.values(this.$dataSource.fakeData).forEach(item => {
              flagNames = self.allData.slice(0, 20).map(a => {
                return a.definition
              })
              if (item.type && !flagNames.includes(item.definition)) {
                self.allData.unshift(item)
              }
            })
          } */
          if (this.keyword === '') {
            self.changeDSDisplay()
          } else {
            this.keyword = ''
          }
          this.openTabByQuery()
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
    openTabByQuery() {
      const modelId = this.$route.query.id
      if (modelId) {
        this.allData.forEach(item => {
          if (item.id === Number.parseInt(modelId)) {
            this.handleEdit(item, true)
          }
        })
      }
    },
    removetab(name) {
      this.$emit('removeEdiTab', name)
    },
    isFileItem(ds) {
      const arr = ['DATADICTIONARY', 'DATADICTIONARY_LOGICAL', 'TABLEAU']
      return arr.indexOf(ds.dbtype) !== -1 || arr.indexOf(ds.type) !== -1
    },
    handleRowClick(row, column, event) {
      const localName = event.path[0].localName
      if (event.path[0].localName === 'td' || localName === 'div') {
        if (this.expandRowKeys.indexOf(row.id) > -1) {
          this.expandRowKeys.splice(this.expandRowKeys.indexOf(row.id), 1)
        } else {
          this.expandRowKeys = [row.id]
        }
      }
    },
    itemSelectable(row) {
      let bool = true
      if (typeof row.id === 'string' && row.id.indexOf('fake') === 0) {
        bool = false
      }
      return bool
    },
    couldDoMore(data) {
      // todo --zl || !this.$auth.SYSTEM_TASK_VIEW
      let bool = false
      if (
        data.type.toUpperCase() === 'SMBSHAREFILE'
        // || !this.$auth.SYSTEM_TASK_VIEW
      ) {
        bool = true
      }
      return bool
    },
  },
  watch: {
    keyword(newVal) {
      const obj = {
        keyword: newVal,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },
  },
}
