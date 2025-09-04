// import setMail from "./setMail.vue";
import DatabaseType from './DatabaseType.vue'
import HTTP from '@/http/main'

const moment = require('moment')
// import jobHistory from "@/components/common/simpleJobHistory.vue"
export default {
  data() {
    this.BASE_URL = this.$url + '/service/'
    this.uploadHost = this.BASE_URL + 'upload'
    if (this.$customerId === 'gszc') {
      this.parameterMap = {
        PortNumber: '端口号',
        Zone: '用途',
        Deploy: '部署地',
        State: '状态',
        Description: '备注',
        HostServer: '服务器名称',
        DatabaseName: '数据库名称',
        DBVersion: '数据库版本',
        SelectedSchemas: '选择的schemas',
        SelectedTables: '选择的表',
      }
    } else {
      this.parameterMap = {
        PortNumber: '端口号',
        HostServer: this.$version.dataSource.hostName,
        DatabaseName: '数据库名称',
        DBVersion: '数据库版本',
        SelectedSchemas: '选择的schemas',
        SelectedTables: '选择的表',
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
      displayData: [],
      keyword: '',
      keywordFilterProps: ['definition', 'type', 'categoryName'],
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
      tableHeight: undefined,
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
      AuthenticationType: 0, // 授权方式 0:用户名/密码; 1:kerberos
      requireDbport: true,
      userPasswordRequ: false,
      dialogCrVdsVisible: false,
      ESwithSsl: '',
      currentModelId: null,
      expandRowKeys: [],

      parameterMapForFile: {
        // SelectedTables:'选择的表'
        sharePath: '文件路径',
        description: '描述',
      },
    }
  },
  props: {
    dsformConstant: Object,
    formatDataSource: Function,
  },

  components: {
    // setMail,
    // createVirds,
    DatabaseType,
    // jobHistory
  },

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

  mounted() {
    this.$bus.$on('callDataSourceTabToAddDs', this.addDs)
    this.$bus.$on('forceUpdataNav', () => {
      // 根据权限,刷新数据源 操作栏
      this.showMore = false
      setTimeout(() => {
        this.showMore = true
      }, 0)
    })
    var self = this
    //  self.innerLoadDataSources();
    this.checkREProgress()
    this.tableHeight = $('.table-row')[0].offsetHeight
    $(window).resize(this.resizeTable)

    this.$bus.$on('changeDs', (dsform, para) => {
      this.requireDbport = true
      if (dsform && para) {
        // 传入参数, 修改ds
        this.schemaSelected = para.schemaSelected
        this.AuthenticationType = para.AuthenticationType
        this.requireDbport = para.requireDbport
        this.userPasswordRequ = para.userPasswordRequ
        this.ESwithSsl = para.ESwithSsl
        this.ediDS(dsform, para)
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
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
    this.$bus.$off('changeDs')
    this.$bus.$off('dataSourceTabOntop')
    this.$bus.$off('forceUpdataNav')
    this.$bus.$off('callDataSourceTabToAddDs')
    this.$bus.$off('updateDataSourceJobStatus')
  },

  methods: {
    callOptionsMenu(row, evt) {
      this.currentModelId = row.modelId
      const x = evt.clientX
      const y = evt.clientY
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
      if (this.$featureMap.FE_META && this.$ddmConnectable) {
        options.push({
          label: '比较任务',
          callback: () => {
            this.goToJob(row, 2)
          },
        })
      }
      if (this.$featureMap.FE_META) {
        options.push({
          label: '更新任务',
          callback: () => {
            this.goToJob(row, 1)
          },
        })
      }
      if (!this.isFileItem(row) && false) {
        options.push({
          label: '检测能否连接',
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
        keyword: encodeURI(this.keyword),
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
        keyword: encodeURI(this.keyword),
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
        keyword: encodeURI(this.keyword),
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },

    handleSelectionChange(val) {
      this.selection = val
      this.deleteDisabled = this.selection.length == 0
      if (val.length > 1) {
        const del_row = val.shift()
        this.$refs.dsTable.toggleRowSelection(del_row, false)
      }
      this.$emit('selectionChange', this.selection[0])
    },

    handleCreated() {
      this.dialogCrVdsVisible = false
    },
    handleCreateVirDS() {
      this.dialogCrVdsVisible = true
      this.$nextTick(() => {
        this.$refs.createVirds.dataInit()
      })
    },
    downloadMetadata(row) {
      this.$emit('downloadMetadata', row.modelId)
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
      this.$router.push({
        name: 'jobManagement',
        query: { dataSourceId: row.modelId, jobType: jobType },
      })
    },
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: '更新元数据',
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
      this.$http
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
        })
    },
    deleteRow() {
      const self = this
      const deletSucces = () => {
        this.showSuccess(this.$version.dataSource.datasourceRemoveSucceed)
        this.innerLoadDataSources()
        this.loadingDS = false
      }
      self
        .$confirm('数据源绑定的采集任务也会被删除，确定删除数据源吗?', '删除', {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        })
        .then(() => {
          this.loadingDS = true
          const deletNext = callback => {
            if (this.selection.length > 0) {
              this.deleteCurrentRow(this.selection[0], deletNext)
              this.selection.shift()
            } else {
              deletSucces()
            }
          }
          deletNext()
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 触发 编辑数据源
    handleEdit(idx, row) {
      var self = this
      self.isEditing = true
      var ds = {
        displayName: row.definition,
      }
      ds.dbtype = row.type
      const environmentParams = [
        'Zone',
        'Deploy',
        'State' /*, 'DBVersion' */,
        'Description',
      ]
      environmentParams.forEach(item => {
        if (row.connectionInfo.parameterMap[item]) {
          ds[item] = row.connectionInfo.parameterMap[item]
        } else {
          ds[item] = ''
        }
      })
      ds.connectType = row.connectionInfo.connectType
      ds.hostname = row.connectionInfo.parameterMap.HostServer
      ds.dbport = row.connectionInfo.parameterMap.PortNumber
      ds.dbname = row.connectionInfo.parameterMap.DatabaseName
      ds.delimiter = row.connectionInfo.parameterMap.Delimiter
      const is = row.connectionInfo.parameterMap.IsFirstRowColumnName
      if (is === 'true') {
        ds.IsFirstRowColumnName = 't'
      } else {
        ds.IsFirstRowColumnName = 'f'
      }
      ds.categoryName = row.categoryName
      ds.categoryId = row.categoryId
      ds.modelCategoryId = row.categoryId
      // ds.username = row.connectionInfo.credentialInfo.user;
      if (
        row.connectionInfo.parameterMap.CommentToLogicalName &&
        row.connectionInfo.parameterMap.CommentToLogicalName == 'true'
      ) {
        ds.CommentToLogicalName = true
      } else {
        ds.CommentToLogicalName = false
      }

      ds.versioning = row.connectionInfo.versioning
      if (ds.connectType == 'WebLogic') {
        ds.JNDIName = row.connectionInfo.parameterMap.JNDIName
        ds.dbname = [row.connectionInfo.parameterMap.DatabaseName]
      }

      ds.id = row.modelId
      ds.original = row

      if (ds.dbtype === 'ORACLE' /* || ds.dbtype === 'OCEANBASE-ORACLE' */) {
        if (ds.dbname.indexOf(':') > 0) {
          var part = ds.dbname.split(':')
          ds.extraDbPara = part[0]
          ds.dbname = part[1]
        }
      }
      this.dsform = ds
      this.showaddtab()
    },
    // 触发 添加数据源
    addDs() {
      var self = this
      //      var randomNumber = Math.round(Math.random() * 1000);
      const randomNumber =
        moment().format('YYMMDD-HH') + '' + Math.round(Math.random() * 10)
      this.isEditing = false
      self.dsform = JSON.parse(JSON.stringify(self.dsformConstant))
      // console.log(self.dsformConstant);
      self.dsform.displayName = 'm-' + randomNumber.toString()
      this.showaddtab()
    },

    /** 处理显示的数据 */
    parameterFormat: function (row) {
      return JSON.stringify(row.connectionInfo.parameterMap)
    },
    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
        this.dsDataKey++
      })
    },
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
      localStorage.setItem('arr', JSON.stringify(arr))
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
      return row.connectionInfo.versioning ? '是' : '否'
    },
    // 操作 table 数据
    deleteCurrentRow(row, callback) {
      var self = this
      this.$http
        .delete(self.BASE_URL + 'models/' + row.modelId)
        .then(res => {
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          this.innerLoadDataSources()
          this.loadingDS = false
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
    // 对 数据源 进行修改
    ediDS(dsform, para) {
      this.loadingDS = true
      var self = this
      const ds = dsform
      let formatPara = {
        isFileData: this.isFileItem(ds),
        isOracle: ds.dbtype === 'ORACLE',
        // isEditing: para.dsEditing,
        // schemaSelected: para.schemaSelected,
        // AuthenticationType: para.AuthenticationType,
        // requireDbport: para.requireDbport,
        // userPasswordRequ: para.userPasswordRequ,
        // ESwithSsl: para.ESwithSsl,
        // dbNameRequ: para.dbNameRequ,
        // hasFunction: para.hasFunction,
        // testPw: para.testPw,
        // useOfflineDs: para.useOfflineDs,
        // OfflineDumpTargetSchemaName: para.OfflineDumpTargetSchemaName,
        // OfflineDumpTargetDBName: para.OfflineDumpTargetDBName,
        // OfflineProSchema: para.OfflineProSchema,
      }
      const obj = _.cloneDeep(para)
      formatPara = _.merge(obj, formatPara)

      const json = this.formatDataSource(ds, false, formatPara)
      if (!json) {
        this.editDsFail(ds.displayName)
        return
      }
      if (formatPara.isEditing) {
        if (Array.isArray(json.parameterMap.DatabaseName)) {
          json.parameterMap.DatabaseName = json.parameterMap.DatabaseName[0]
        }
        if (this.schemaSelected.length > 0) {
          json.parameterMap.SelectedSchemas = this.schemaSelected.join(';')
        }
        if (formatPara.useOfflineDs) {
          json.parameterMap.SelectedSchemas =
            formatPara.OfflineProSchema.join(';')
        }
        json.backupDatasourceId = ds.backupDatasourceId
        json.dataConnect = ds.dataConnect
        json.dataSample = ds.dataSample
        let query = ''
        if (ds.dbtype === 'HBASE') {
          const paraObj = {
            ScanSize: ds.ScanSize || 1000,
            Encoding: ds.Encoding || 'UTF-8',
          }
          query += '?options=' + encodeURIComponent(JSON.stringify(paraObj))
        }
        if (json.type === 'MYSQL') {
          delete json.parameterMap.SelectedSchemas
        }
        const url = self.BASE_URL + 'models/' + ds.id + query
        self.$http
          .put(url, json)
          .then(res => {
            this.$message.success('数据源修改成功')
            var row = res.data
            this.removetab(ds.id + '')
            for (var i = 0; i < self.dsData.length; i++) {
              if (self.dsData[i].modelId === row.modelId) {
                self.dsData.splice(i, 1)
                self.dsData.push(row)
                self.innerLoadDataSources()
                return
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
            this.$dataSource.fakeData = null
            this.editDsFail(ds.displayName)
          })
        this.loadingDS = false
      } else {
        self.loadingDS = true
        this.updateDataSource = true
        const fakeData = {
          categoryId: ds.categoryId,
          categoryName: ds.categoryName,
          type: ds.dbtype,
          username: '',
          definition: ds.displayName,
          creationTime: '',
          modelId: 'fake',
        }
        json.backupDatasourceId = ds.backupDatasourceId
        json.dataConnect = ds.dataConnect
        json.dataSample = ds.dataSample
        json.readMetadata = ds.readMetadata
        fakeData.connectionInfo = {
          connectType: ds.connectType,
          database: ds.dbname,
          hostServer: ds.hostname,
          modelId: '',
          sourceName: ds.displayName,
          versioning: ds.versioning,
          createTime: '',
          type: ds.dbtype,
        }
        fakeData.connectionInfo.parameterMap = {
          AuthenticationType: '',
          CommentToLogicalName: ds.CommentToLogicalName,
          DatabaseName: ds.dbname,
          hostServer: ds.hostname,
          PortNumber: ds.dbport,
        }
        const request = json
        let query = ''
        if (ds.dbtype === 'HBASE') {
          const paraObj = {
            ScanSize: ds.ScanSize || 1000,
            Encoding: ds.Encoding || 'UTF-8',
          }
          query += '?options=' + encodeURIComponent(JSON.stringify(paraObj))
        }

        if (this.schemaSelected.length > 0) {
          request.parameterMap.SelectedSchemas = this.schemaSelected.join(';')
        }
        if (formatPara.useOfflineDs) {
          request.parameterMap.SelectedSchemas =
            formatPara.OfflineProSchema.join(';')
        }
        let dbTarget = []
        const dbSource = _.clone(json.parameterMap.DatabaseName)
        if (typeof dbSource === 'string') {
          dbTarget.push(dbSource)
        } else if (Array.isArray(dbSource)) {
          // maybe useless
          dbTarget = dbSource
        }
        const url = self.BASE_URL + 'models/re'
        if (dbTarget.length == 0) {
          self.$http
            .post(url + query, _.cloneDeep(request))
            .then(res => {
              try {
                this.autoSetJob.modelName = request.sourceName
              } catch (e) {}
              this.$dataSource.fakeData = fakeData
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.removetab('add')
              self.showSuccess(this.$version.dataSource.datasourceRESucceed)
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
              this.$dataSource.fakeData = null
              this.editDsFail(ds.displayName)
            })
        }
        dbTarget.forEach(db => {
          request.parameterMap.DatabaseName = db
          self.$http
            .post(url + query, _.cloneDeep(request))
            .then(res => {
              try {
                this.autoSetJob.modelName = request.sourceName
              } catch (e) {}
              this.$dataSource.fakeData = fakeData
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
              self.showSuccess(this.$version.dataSource.datasourceRESucceed)
              self.checkREProgress(res.data)
              self.loadingDS = false
            })
            .catch(e => {
              this.$showFailure(e)
              self.loadingDS = false
              this.innerLoadDataSources()
              this.$dataSource.fakeData = null
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
        }, 1000)
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
      if (this.$dataSource.fakeData.type) {
        this.$http
          .get(this.BASE_URL + 'models/re/' + jobId + '/progress')
          .then(res => {
            if (res.data.percentage === 100 || !!res.data.exception) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              delete this.$dataSource.interval[jobId]
              this.$dataSource.fakeData = {}
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
              this.$dataSource.fakeData = {}
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              this.$removeIntervalArr(jobInfo)
            }

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
            this.$dataSource.fakeData = {}
            window.localStorage.setItem(
              'dataSourcesOf' + this.$user.username,
              JSON.stringify(this.$dataSource)
            )
            this.innerLoadDataSources()
          })
      }
    },
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      this.refreshDataSourceList()
      HTTP.getAllDataSource()
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.$utils.sort.sortConsiderChineseNumber(
            res.data,
            'creationTime',
            'descending'
          )
          self.allData = res.data
          if (this.$dataSource.fakeData && this.$dataSource.fakeData.type) {
            self.allData.unshift(this.$dataSource.fakeData)
          }
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
          if (item.modelId === Number.parseInt(modelId)) {
            this.handleEdit(null, item)
          }
        })
      }
    },
    removetab(name) {
      this.$emit('removeEdiTab', name)
    },
    isFileItem(ds) {
      const arr = ['DATADICTIONARY', 'DATADICTIONARY_LOGICAL', 'TABLEAU']
      return arr.indexOf(ds.dbtype) !== -1
    },
    handleRowClick(row, column, event) {
      if (row.modelId === 'fake') return
      const localName = event.path[0].localName
      if (event.path[0].localName === 'td' || localName === 'div') {
        if (this.expandRowKeys.indexOf(row.modelId) > -1) {
          this.expandRowKeys.splice(this.expandRowKeys.indexOf(row.modelId), 1)
        } else {
          //          this.expandRowKeys.push(row.modelId);
          this.expandRowKeys = [row.modelId]
        }
      }
    },
    itemSelectable(row) {
      let bool = true
      if (row.modelId === 'fake') {
        bool = false
      }
      return bool
    },
    couldDoMore(data) {
      let bool = false
      if (data.type.toUpperCase() === 'SMBSHAREFILE') {
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
