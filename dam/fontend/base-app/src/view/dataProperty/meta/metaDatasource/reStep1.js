import chooseTag from '@/components/dataSource/chooseTag.vue'
import UserSelect from '@/components/common/UserSelect.vue'
import editDs from '@/components/dataSource/editDs.vue'
import HTTP from '@/http/main.js'
import Agent from '@/components/dataSource/agent'
import Compare from '@/components/dataSource/compare'
import DatasourceController from '../../../../../../base-components/http/baseController/DatasourceController'
import _ from 'lodash'

export default {
  mixins: [Agent, Compare],
  props: ['dsEditing', 'editRow'],
  data() {
    return {
      dsDeleted: false,
      delDsId: '',
      testConnectSucceed: false,
      // 元数据start
      lastDataSourceId: null,
      jdbcDs: {},
      isJDBC: true,
      dsform: {
        definition: '',
        CommentToLogicalName: false,
        TagIds: [],
        datasourceId: '',
        categoryId: '',
        modelCategoryId: '',
        isOld: false,
      },
      databaseList: null,
      schemaList: null,

      requiredForm: [
        'datasourceId',
        'definition',
        'categoryId',
        'modelCategoryId',
      ],
      // dsEditing: false,
      dataSourceData: [],
      dataSourceDataBackup: [], // 备用数据源
      currentDataSource: {},
      btnLoad: false,
      editRowData: null,
      fileBtnDisabled: false,

      // end
      dbsVersion: '',
      preDbnames: [],
      originSelTables: '',
      originCheckboxes: {},
      setValueNullName: '',
      activeNames: 'env',
      userModelCategory: [],
      value: '',
      dbname: [],
      schemas: [],
      webLogicDBs: [],
      schemaSelected: [],
      dbConnected: false,
      lastLoadTimeStamp: 0,
      interval: {},
      loadingDS: false,
      tableHeight: undefined,
      dialogChangeidVisible: false,
      showOwnerDialog: false,
      newOwner: '',
      formKey: 0,
      lockBtn: false,
      categoryIdChanged: '',
      dataBaseNames: [],
      disableTest: false,
      inputDBname: this.$t('meta.dataSource.edit.dbs'),
      dbplaceHolder: this.$t('meta.dataSource.edit.fillOrSelDbs'),
      AuthenticationType: 0,
      rememberLoginMessage: false,
      testSuccessed: false, // 相当于 requiredTest
      ESwithSsl: false,
      authDisabled: false,
      disabledUsernamePw: false, // 编辑时,默认不需要填写数据库密码
      testPw: false,

      hostNameLabel: this.$t('meta.dataSource.hostName'),
      userLabel: this.$t('meta.dataSource.edit.username'),
      pwLabel: this.$t('meta.dataSource.edit.password'),

      schemaText: 'Schema',
      portText: this.$t('meta.dataSource.edit.port'),

      getView: true,
      getStoredProcedure: true,
      getDBFunction: true,
      Package: true,
      // RePK: true,
      ReFK: true,
      TableOnlyReColumns: true,
      moreSet: '',
      fileUploadList: [],
      krb5List: [],
      keytabList: [],

      /** form require */
      requireDbport: true,
      showDbport: true,
      requireDataZone: false,
      showAllDbname: true,
      uploadingData: false,
      typeSelectWraper: '',
      // 离线数据源
      useOfflineDs: false,
      isOfflineEx: false,
      OfflineDumpTargetSchemaName: '',
      OfflineDumpTargetDBName: '',
      OfflineProSchema: '',
      tableForOffline: '',
      offlineInstancesArr: [],
      offlineDriverTypeArr: [
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'Oracle', value: 'ORACLE' },
      ],

      // 自定义数据库类型
      useCustomedDbTye: false,
      targetType: 'database', // 'schemas'
      // service/models/upload
      offlineSchemasArr: [],
      // hostNameLabel: '服务器名称',
      // userLabel: '用户名',
      // pwLabel: '密码',

      // 非结构化数据
      uploadDriUrl: '',
      showSmbUserPw: false,
      backupDatasourceArr: [],
      backupDatasourceValue: '',
      dataConnectValue: 'SELF',
      backupDatasourceDisabled: true,
      dataSampling: true,
      dataSamplingDisabled: false,
      driverOptions: [],
      driverValue: '',
      driverState: false,
      customConnection: false,
      customConnectionState: false,

      dataSourceType: 'SQL',
      reportTestSucceeded: false,
      fileTestSucceeded: false,
      BlackListAppliedTypeIds: [],
      SelectedBlackList: null,
      uploadSuccess: false,

      originFormData: {},
      // ExcelAutoCollect: 'false',
      userPassword: false,
      InstanceName: '',
      testloading: false,
      paramFromNew: null,
    }
  },

  components: { chooseTag, UserSelect, editDs },

  computed: {
    canNext() {
      return this.dsform.definition
    },
    disabledSaveBtn() {
      let flag = false
      flag = this.requiredForm?.some(r => {
        return !this.dsform[r]
      })
      return flag
    },
    hasSchema() {
      return this.currentDataSource?.parameterMap?.SelectedSchemas
    },
    hasDatabaseName() {
      return this.currentDataSource?.parameterMap?.DatabaseName
    },
    schemaOrDatabase() {
      return this.currentDataSource?.parameterMap?.SelectedSchemas
        ? 'Schema'
        : this.currentDataSource?.parameterMap?.DatabaseName
        ? this.$t('meta.reManage.db')
        : ''
    },
    pathArr() {
      let arr = [this.$t('common.page.dataSource')]
      if (!this.dsEditing) {
        arr.push(this.$t('meta.dataSource.add'))
      } else {
        arr.push(this.editRowData.definition)
      }
      return arr
    },
    chooseSystem() {
      return !!this.dsform.categoryId
    },
    supportView() {
      const type = this.dsform.dbtype
      let result = true
      const arr = ['MONGODB'] // 不支持视图的数据库类型
      result = arr.some(item => {
        return item === type
      })
      if (this.useOfflineDs) {
        result = true
      }
      return !result
    },
    hasSp() {
      const type = this.dsform.dbtype
      let result = !this.isFileData
      const arr = ['OCEANBASE']
      const noSp = arr.some(item => {
        return item === type
      })
      if (noSp || this.useOfflineDs) {
        result = false
      }
      return result
    },
    hasFunction() {
      const type = this.currentDataSource.type
      let result = false
      const arr = [
        'DB2',
        'DB2I',
        'MYSQL',
        'OCEANBASE',
        'ORACLE',
        'INFORMIX',
        'POLAR_DB',
        'POSTGRESQL',
        'HOLOGRES',
        'GAUSSDB',
        'SQLSERVER',
        'TERADATA',
        'STARROCKS',
      ]
      result = arr.some(item => {
        return item === type
      })
      if (this.useOfflineDs) {
        result = false
      }
      return result
    },
    schemaOrDatabaseMultiple() {
      return !this.useOfflineDs
    },
  },
  beforeMount() {
    if (this.dsEditing) {
      // this.getDetails()
    }
  },
  created() {
    // 初始化采集类型
    this.$set(this.dsform, 'ExcelAutoCollect', 'false')
    this.getDatasourceData()
  },
  mounted() {
    var self = this
    this.dsform.TableOnlyReColumns = !this.TableOnlyReColumns
    this.dsform.ReFK = this.ReFK
    // this.getbackupDatasourceArr() // 获取备用数据源
    if (!this.dsEditing) {
      self.webLogicDBs = []
      self.dbConnected = false
    }
    this.$bus.$on('schemaChange', this.schemaChange)
    this.$bus.$on('editDsFail', this.editDsFail)
    if (this.dsEditing) {
      this.originFormData = _.cloneDeep(this.getOriData())
    }
  },
  beforeDestroy() {
    // $(window).unbind("resize", this.resizeTable);
    this.$bus.$off('editDsFail')
    this.$bus.$off('schemaChange')
    this.uploadingData = false
  },
  methods: {
    /**
     *
     * @param {ds 对象} ds
     * @param 是否测试连接
     * @param {参数对象} param1
     */
    formatDataSource(
      ds,
      isTest,
      {
        isFileData,
        isOracle,
        isEditing,
        schemaSelected,
        AuthenticationType,
        requireDbport,
        dbNameRequ,
        userPasswordRequ,
        ESwithSsl,
        requireDataZone,
        // hasFunction,
        testPw,
        // useOfflineDs,
        // OfflineDumpTargetSchemaName,
        // OfflineDumpTargetDBName,
        // OfflineProSchema,
        typeSelectWraper,
        ExcelAutoCollect,
        userPassword,
      }
    ) {
      /**
       * AuthenticationType: 连接方式
       * requireDbport: 是否需要填写端口
       * dbNameRequ: 是否需要填写数据库名称
       * userPasswordRequ: 是否需要用户名密码
       * requireDataZone: 是否需要填数据区域
       * useCusDb: 是否使用连接串
       */
      const useCusDb = ds.dbtype === 'CUSTOMIZED'
      let returnFalure = false
      if (userPasswordRequ !== false) {
        userPasswordRequ = true
      }
      AuthenticationType = parseInt(AuthenticationType)
      let json = {}
      /* if (isTest) {
        json.name = ds.name
      } */
      json.sourceName = ds.sourceName || ds.displayName
      json.id = ds.id
      json['@class'] = 'com.datablau.dam.data.dto.DatasourceProperties'
      json.type = ds.dbtype
      json.versioning = ds.versioning
      const currentdate = new Date()
      // json.createTime = moment(currentdate).format('YYYY-MM-DD HH:mm:ss')
      json.connectType = ds.connectType
      if (ds.dbtype === 'SMBSHAREFILE') {
        if (ds.connectType === 'JDBC') {
          json.connectType = 'SMB'
        } else {
          json.connectType = ds.connectType
        }
      }
      json.parameterMap = {}
      json.categoryId = ds.categoryId
      if (ds.dbtype === 'ES' && ESwithSsl) {
        json.parameterMap.KeyStorePath = ds.KeyStorePath
        json.parameterMap.KeyStorePass = ds.KeyStorePass
        json.parameterMap.HttpType = 'https'
      } else if (ds.dbtype === 'ES') {
        json.parameterMap.HttpType = 'http'
      }
      if (ds.dbtype === 'HBASE') {
        json.parameterMap.HBaseMasterPort = ds.HBaseMasterPort
        json.parameterMap.HBaseRegionserverPort = ds.HBaseRegionserverPort

        userPasswordRequ = false
        if (!ds.ServicePrincipal) {
          // AuthenticationType = 2
        }
      }
      // 选择表
      /* if (ds.SelectedTables) {
        json.parameterMap.SelectedTables = ds.SelectedTables
      } */
      json.credentialInfo = {}
      if (isFileData) {
      } else {
        if (ds.connectType == 'WebLogic') {
          json.parameterMap.JNDIName = ds.JNDIName
        } else {
          json.parameterMap.HostServer = ds.hostname
          json.parameterMap.PortNumber = ds.dbport
          json.parameterMap.AuthenticationType = AuthenticationType - 0
          if (isOracle) {
            json.parameterMap.DatabaseName = ds.extraDbPara + ':' + ds.dbname
            // json.parameterMap.PackageFiltered = ds.PackageFiltered
          } else {
            json.parameterMap.DatabaseName = ds.dbname
          }
        }
      }
      if (AuthenticationType === 0) {
        json.credentialInfo = {}
        json.credentialInfo.user = ds.username
        json.credentialInfo.password = this.$pwEncrypt(ds.password)
      } else {
        json.parameterMap.ServicePrincipal = ds.ServicePrincipal
        json.parameterMap.UserPrincipal = ds.UserPrincipal
        json.parameterMap.KeyTabPath = ds.KeyTabPath
        json.parameterMap.Krb5Path = ds.Krb5Path
      }
      // }

      const c = json.credentialInfo
      const p = json.parameterMap
      const showErrMsg = item => {
        // showFailure 需要在外面调用, 这里只需要在console输出哪些没有填
        // this.$message.error({
        //   title: "创建失败",
        //   message: "信息填写不完整",
        // });
        // json = null;
        returnFalure = true
      }
      if (!isFileData && isEditing && !isTest && !testPw) {
        json.credentialInfo = null
      }
      /* if (!isTest && useOfflineDs) {
        if (!OfflineDumpTargetDBName) {
          showErrMsg('实例名称')
        }
        if (
          (ds.dbtype === 'ORACLE' || ds.dbtype === 'OCEANBASE-ORACLE') &&
          !OfflineDumpTargetSchemaName
        ) {
          showErrMsg('schema')
        }
      } */
      /* // 必选项 数据区域
      if (requireDataZone && !json.parameterMap.TagIds) {
        showErrMsg('数据区域')
      } */
      // 必选项 名称,系统
      if (isEditing && !json.sourceName) {
        showErrMsg('名称')
      }
      if (!isFileData && ds.connectType !== 'WebLogic') {
        // 数据库名称
        if (dbNameRequ) {
          if (!p.DatabaseName) {
            showErrMsg('数据库名称')
          } else if (isOracle && !ds.dbname) {
            showErrMsg('数据库名称')
          }
        }

        // 服务器与端口
        if (!useCusDb && (!p.HostServer || (requireDbport && !p.PortNumber))) {
          showErrMsg('服务器与端口')
        }

        if (AuthenticationType == 1) {
          // kerberos
          if (!p.ServicePrincipal) {
            showErrMsg('kerberos')
          }
        } else if (
          AuthenticationType == 0 &&
          (!c.user || !c.password) &&
          userPasswordRequ
        ) {
          // 用户名密码
          showErrMsg('用户名密码')
        }
      }
      if (useCusDb) {
        json.driverClassname = ds.driverClassname
        json.connUrl = ds.connUrl
        json.jarName = ds.jarName
      }
      if (ds.dbtype === 'HBASE') {
        json.credentialInfo = null
      }
      return returnFalure ? null : json
    },
    // 获取数据源详情（暂时只用owner）
    getDetails() {
      this.$http
        .get(
          this.$meta_url + `/service/models/${this.editRowData.modelId}/plain`
        )
        .then(res => {
          if (res.data.owner) {
            this.$set(this.dsform, 'owner', res.data.owner)
            // this.$set(this.originFormData, 'owner', res.data.owner)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 编辑回显
    handleEditRow() {
      this.useOfflineDs =
        this.editRowData?.type === 'OFFLINEDUMP' ||
        this.editRowData?.type === 'OFFLINEDUMP_RAW'
      this.isOfflineEx = this.editRowData?.type === 'OFFLINEDUMP_RAW'
      this.$set(this.dsform, 'definition', this.editRowData.definition)
      this.$set(this.dsform, 'datasourceId', this.editRowData.datasourceId)
      this.$set(this.dsform, 'categoryId', this.editRowData.categoryId)
      this.$set(this.dsform, 'modelCategoryId', this.editRowData.categoryId)
      if (this.useOfflineDs) {
        this.OfflineProSchema =
          this.editRowData.reverseOptions.OFFLINE_DUMP_TARGET_SCHEMA_NAME?.split(
            ';'
          )
        this.OfflineDumpTargetDBName =
          this.editRowData.reverseOptions.OFFLINE_DUMP_TARGET_DB_NAME || ''
      }
    },
    formatParams(data) {
      if (data) {
        // this.dsform.definition = data.sourceName
        this.currentDataSource.connectType = data.connectType
        this.dsform.modelCategoryId = data.modelCategoryId || data.categoryId
        this.dsform.categoryId = data.modelCategoryId || data.categoryId
        this.dsform.datasourceId = data.id
        this.dsform.dbType = data.type
        this.schemaList = data.parameterMap.SelectedSchemas
          ? data.parameterMap.SelectedSchemas.split(';')
          : null
        this.databaseList = data.parameterMap.DatabaseName
          ? data.parameterMap.DatabaseName.split(';')
          : null
      }
      const obj = {
        definition: this.dsform.definition,
        connectType: this.currentDataSource.connectType,
        modelCategoryId: this.dsform.categoryId,
        datasourceId:
          this.dsform.datasourceId || this.currentDataSource.id || null,
        schemaList: this.schemaList,
        databaseList: this.databaseList,
        dbtype: this.currentDataSource.type || this.dsform.dbType,
        isOld: this.dsform.isOld,
      }
      if (!this.lastDataSourceId) {
        this.lastDataSourceId = _.cloneDeep(this.dsform.datasourceId)
      } else {
        if (
          this.lastDataSourceId !== this.dsform.datasourceId &&
          !this.testConnectSucceed
        ) {
          this.$datablauMessage.warning(this.$t('meta.reManage.dbChangeTip'))
          return
        }
      }
      this.$emit('changeStep', 2)
      this.$bus.$emit('sendStep1Data', obj)
    },
    testConnect() {
      this.testloading = true
      this.$http
        .post(
          this.$url +
            `/datasources/testConnection?dsId=${this.currentDataSource.id}`
        )
        .then(res => {
          this.testConnectSucceed = true
          this.$datablauMessage.success(
            this.$t('meta.dataSource.edit.datasourceTestSucceed')
          )
          this.$emit('testSucceed', true)
          this.testloading = false
        })
        .catch(e => {
          this.$emit('testSucceed', false, true)
          this.testloading = false
        })
    },
    getOffline(param, type) {
      this.$http
        .post(
          `${this.$url}/datasources/getOffline?dsId=${this.currentDataSource.id}`,
          param
        )
        .then(res => {
          if (!type) {
            this.offlineInstancesArr = res.data
          } else if (type === 2) {
            this.offlineSchemasArr = res.data
          }
        })
        .catch(e => {
          this.offlineInstancesArr = []
          this.$showFailure(e)
        })
    },
    // 新建-测试结果
    addTestSucceed(test) {
      this.$emit('addTestSucceed', true)
    },
    // 创建数据源成功，可执行采集创建
    createDsSucceed(data) {
      this.$bus.$emit('createModel', data)
    },
    // 数据源列表
    getDatasourceData(type) {
      let param = {
        keyword: '',
        categoryId: this.dsform.categoryId,
      }
      if (!this.dsform.categoryId) {
        return
      }
      DatasourceController.findDatasources({ requestBody: param })
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          // 编辑只能选择同类型数据源
          if (this.dsEditing) {
            this.dataSourceData = res.data.filter(r => {
              return r.type === this.editRowData.type
            })
          } else {
            this.dataSourceData = res.data
          }
          this.dataSourceDataBackup = this.dataSourceData
          if (this.dsEditing) {
            if (
              res.data.filter(r => {
                return r.id === this.dsform.datasourceId
              }).length
            ) {
            } else {
              this.delDsId = _.cloneDeep(this.dsform.datasourceId)
              this.dsform.datasourceId = ''
              this.dsDeleted = !type
              this.$refs.form.validateField('datasourceId')
            }
          }

          if (this.dsEditing) {
            this.changeDataSource(this.dsform.datasourceId)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeOldOrNew(val) {
      this.dsform.datasourceId = ''
      this.currentDataSource = {}
      this.jdbcDs = {}
      this.$emit('testSucceed', false)
    },
    // 切换数据源
    changeDataSource(val) {
      if (!val) return
      this.databaseList = null
      this.schemaList = null
      this.$set(this.dsform, 'schema', '')
      this.$set(this.dsform, 'databaseName', '')
      this.currentDataSource = this.dataSourceData.filter(data => {
        return data.id === val
      })[0]
      this.isJDBC = this.currentDataSource.jdbc
      this.jdbcDs = {}
      this.jdbcDs = _.cloneDeep(this.currentDataSource)
      this.useOfflineDs =
        this.currentDataSource?.type === 'OFFLINEDUMP' ||
        this.currentDataSource?.type === 'OFFLINEDUMP_RAW'
      this.isOfflineEx = this.currentDataSource?.type === 'OFFLINEDUMP_RAW'
      this.handleGetSchemaList()
      if (this.lastDataSourceId && val !== this.lastDataSourceId) {
        this.$emit('testSucceed', false)
        this.testConnectSucceed = false
        this.$bus.$emit('hasChangeDatasource')
      }
    },
    handleGetSchemaList() {
      let param = this.currentDataSource.parameterMap
      if (this.currentDataSource.type === 'OFFLINEDUMP') {
        this.schemaList = param.SelectedSchemas
          ? param.SelectedSchemas.split(';')
          : null
      } else if (param.SelectedSchemas) {
        this.schemaList = param.SelectedSchemas.split(';')
      } else {
        // this.schemaList = []
      }
      if (param.DatabaseName) {
        this.databaseList = param.DatabaseName.split(';')
      } else {
        // this.databaseList = []
      }
      if (this.dsEditing) {
        this.$set(
          this.dsform,
          'schema',
          this.editRowData.reverseOptions.SELECT_SCHEMA &&
            this.editRowData.reverseOptions.SELECT_SCHEMA.split(';')
        )
        this.$set(
          this.dsform,
          'databaseName',
          this.editRowData.reverseOptions.DATABASE_NAME &&
            this.editRowData.reverseOptions.DATABASE_NAME.split(';')
        )
      }
    },
    changeBackupDatasourceValue(value) {
      this.backupDatasourceValue = value
    },
    changeDataSamplingValue(value) {
      this.dataSampling = value
    },

    getbackupDatasourceArr() {
      this.$http
        .get(this.$meta_url + '/service/models/fromre/data')
        .then(res => {
          res.data.forEach(element => {
            this.backupDatasourceArr.push({
              value: element.modelId,
              label: element.definition,
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 根据文件ID获取文件信息
    // zl add
    getFileInfo() {
      let KeyTabPath = this.dsform.KeyTabPath
      let Krb5Path = this.dsform.Krb5Path
      // 获取keytab文件
      this.$http
        .get(this.$url + `/service/files/?fileIds=${KeyTabPath}`)
        .then(res => {
          let tempFileList = []
          res.data.forEach(item => {
            let obj = {
              name: item.fileOrginalName,
              ...item,
            }
            tempFileList.push(obj)
          })
          this.keytabList = tempFileList
        })
      // 获取krb5文件
      this.$http
        .get(this.$url + `/service/files/?fileIds=${Krb5Path}`)
        .then(res => {
          let tempFileList = []
          res.data.forEach(item => {
            let obj = {
              name: item.fileOrginalName,
              ...item,
            }
            tempFileList.push(obj)
          })
          this.krb5List = tempFileList
        })
    },
    testForSmb() {
      this.disableTest = true
    },
    changeConStyle(newVal) {
      this.inputDBname = newVal
      this.dbplaceHolder = this.$t('meta.dataSource.edit.fillNames', {
        name: newVal,
      })
    },
    changeOwner() {
      this.showOwnerDialog = true
    },
    handleOwnerNewName(user) {
      this.newOwner = user.name
    },
    changeCategory() {
      this.dialogChangeidVisible = true
      this.categoryIdChanged = this.dsform.categoryId
    },

    changeCategoryId() {
      this.dialogChangeidVisible = false
      this.$http
        .put(
          this.$meta_url +
            '/service/models/' +
            this.editRowData.modelId +
            '/categories/' +
            this.categoryIdChanged
        )
        .then(res => {
          this.$message.success({
            message: this.$t('meta.dataSource.edit.sysModified'),
          })
          this.dsform.categoryId = this.categoryIdChanged
          this.$bus.$emit('changeDs')
          this.categoryId = this.categoryIdChanged
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getFormatPara() {
      const formatPara = {
        testPw: this.testPw,
        dsEditing: this.dsEditing,
        schemaSelected: this.schemaSelected,
        isFileData: this.isFileData,
        isOracle: this.isOracle(),
        isEditing: this.dsEditing,
        AuthenticationType: this.AuthenticationType,
        requireDbport: this.requireDbport,
        dbNameRequ: this.dbNameRequ,
        userPasswordRequ: this.userPasswordRequ,
        ESwithSsl: this.ESwithSsl,
        requireDataZone: this.requireDataZone,
        hasFunction: this.hasFunction,
        useOfflineDs: this.useOfflineDs,
        OfflineDumpTargetSchemaName: this.OfflineDumpTargetSchemaName,
        OfflineDumpTargetDBName: this.OfflineDumpTargetDBName,
        OfflineProSchema: this.OfflineProSchema,
        typeSelectWraper: this.typeSelectWraper,
        ExcelAutoCollect: this.dsform.ExcelAutoCollect,
        userPassword: this.userPassword,
      }
      return formatPara
    },
    /* handleUseOfflineChange(value) {
      this.testSuccessed = false
      this.dbConnected = false
      if (value) {
        this.OfflineDumpTargetSchemaName = this.schemaSelected[0] || ''
        this.dsform.dbtype = 'ORACLE'
        // this.$nextTick(this.dbTypeSelected);
        if (this.typeSelectWraper === 'OFFLINEDUMP_RAW') {
          this.dsform.dbtype = 'MYSQL'
        }
        this.dbTypeSelected()
        this.dbConnected = true
      }
    }, */
    handleDreverTypeChange(value) {
      this.OfflineDumpTargetDBName = ''
      if (!value) return
      const self = this
      const ds = this.dsform
      const formatPara = this.getFormatPara()
      const json = this.formatDataSource(this.dsform, true, formatPara)
      const para = {
        requestBody: json,
      }
      HTTP.getOfflineProTables(para)
        .then(res => {
          this.offlineInstancesArr = res.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    offlineDbChange(value) {
      // 如果不是离线数据库，则不运行这个函数
      if (!this.useOfflineDs) {
        return
      }
      this.OfflineProSchema = []
      this.offlineSchemasArr = []
      if (!value) return
      const formatPara = this.getFormatPara()
      const para = this.formatDataSource(this.dsform, true, formatPara)
      let schemasPromise = null
      // if (this.dbTypeWrapSelected === 'OFFLINEDUMP') {
      schemasPromise = this.$http.put(
        `${this.$url}/service/models/re/tbs`,
        para
      )
      // } else {
      //   schemasPromise = HTTP.getOfflineProSchema({requestBody: para})
      // }
      schemasPromise
        .then(res => {
          const offlineInstancesArr = res.data.split(';').filter(item => !!item)
          this.offlineInstancesArr = offlineInstancesArr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    handleDbnameClick() {
      this.showAllDbname = true
    },

    handleClearDbname() {
      this.$refs.dbname.focus()
    },
    getCategoryName(val) {
      this.$modelCategories.forEach(item => {
        if (item.categoryId === val) {
          this.dsform.categoryName = item.categoryName
          this.dsform.categoryAbbreviation = item.categoryAbbreviation
        }
      })
      this.$set(this.dsform, 'categoryId', val)
      this.$set(this.dsform, 'modelCategoryId', val)
      this.$set(this.dsform, 'datasourceId', '')
      this.currentDataSource = {}
      this.getDatasourceData('changeSys')
    },
    removetab() {
      this.$emit('removeReTab')
    },
    nodeClick() {
      this.removetab()
    },
    backClick() {
      this.removetab()
    },
    handleSslChange(val) {
      this.dsform.KeyStorePath = ''
      this.dsform.KeyStorePass = ''
    },
    handleShowMoreSet() {},
    // 上传文件前
    handleBeforeUpload(file, type) {
      var self = this
      var ds = self.dsform
      var isCorrectFile = false
      if (
        (ds.dbtype == 'DATADICTIONARY' ||
          ds.dbtype == 'DATADICTIONARY_LOGICAL') &&
        (file.fileName.toLowerCase().indexOf('.xls') > -1 ||
          file.fileName.toLowerCase().indexOf('.xlsx') > -1)
      ) {
        isCorrectFile = true
      }
      if (
        ds.dbtype == 'TABLEAU' &&
        file.fileName.toLowerCase().indexOf('.twb') > -1
      ) {
        isCorrectFile = true
      }
      // zl add
      if (this.AuthenticationType === 1) {
        isCorrectFile = true
      }
      if (!isCorrectFile) {
        this.$message.error(
          this.$t('meta.dataSource.edit.fileTypeIncorrect') +
            (ds.dbtype == 'DATADICTIONARY' ||
            ds.dbtype == 'DATADICTIONARY_LOGICAL'
              ? '.xls, .xlsx'
              : type || ds.dbtype)
        )
      }
      return isCorrectFile
    },
    handleUploadSuccess(res, file, type) {
      const self = this
      const ds = self.dsform
      // zl add
      if (type && type === 'keytab') {
        ds.KeyTabPath = res.fileId
      } else if (type && type === 'krb5') {
        ds.Krb5Path = res.fileId
      } else {
        file.filepath = res.fileStorePath
        ds.fileName = res.fileOrginalName
        ds.filePath = res.fileStorePath
      }
      this.$http.put(this.$url + '/service/files/commit?fileIds=' + res.fileId)
      if (
        this.dataSourceType === 'file' &&
        (this.dsform.dbtype === 'DATADICTIONARY_LOGICAL' ||
          this.dsform.dbtype === 'DATADICTIONARY')
      ) {
        this.uploadSuccess = true
      }
    },
    handleFileRemoved(file, fileList, type) {
      var self = this
      var ds = self.dsform
      ds.files = ''
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i]
        ds.files += file.filepath
        ds.files += ';'
      }
      if (type && type === 'keytab') {
        this.keytabList = fileList
        if (fileList.length === 0) {
          ds.KeyTabPath = ''
        }
      } else if (type && type === 'krb5') {
        this.krb5List = fileList
        if (fileList.length === 0) {
          ds.Krb5Path = ''
        }
      } else {
        this.fileUploadList = fileList
      }
    },
    handleUploadChange(file, fileList, type) {
      if (type && type === 'keytab') {
        this.keytabList = fileList
      } else if (type && type === 'krb5') {
        this.krb5List = fileList
      } else {
        this.fileUploadList = fileList
      }
    },
    downloadSampleFile() {
      let url = ''
      if (this.dsform.dbtype == 'DATADICTIONARY_LOGICAL') {
        url = `${this.$url}/models/template?logical=true`
      } else {
        url = `${this.$url}/models/template`
      }
      this.$downloadFile(url)
    },

    // 获取信息
    getWebLogicDBs(json) {
      this.$http
        .put(this.$url + '/service/models/re/dbs', json)
        .then(res => {
          this.dbConnected = true
          this.webLogicDBs = res.data.split(';').filter(item => item.length > 0)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSchemas(json, successcallback, failureCallback) {
      if (this.customConnection === true) {
        json.connUrl = this.dsform.connUrl
        json.parameterMap.HostServer = ''
        json.parameterMap.PortNumber = ''
      }
      if (this.driverValue !== '') {
        json.driverId = this.driverValue
      }
      this.$http
        .put(this.$url + '/service/models/re/schemas', json)
        .then(res => {
          successcallback && successcallback()
          this.dbConnected = true
          if (res.data) {
            const schemas = res.data.split(';').filter(item => item.length > 0)
            schemas.sort()
            this.schemas = schemas
          }
          if (!this.dsEditing) {
            if (this.typeSelectWraper !== 'OFFLINEDUMP') {
              this.targetType = 'schema'
              this.getCurrentSchema(json)
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
        })
    },
    getCurrentSchema(json) {
      this.$http
        .put(this.$url + '/service/models/re/curschema', json)
        .then(res => {
          if (res.data && res.data.length > 0) {
            const curSce = this.schemaSelected
            if (!curSce || (Array.isArray(curSce) && curSce.length === 0)) {
              this.schemaSelected = res.data
                .split(';')
                .filter(item => item.length > 0)
              this.$nextTick(() => {
                this.testSuccessed = true
              })
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleAddTag() {
      this.$refs.chooseTag && this.$refs.chooseTag.showDialog()
    },
    choosedTagChanged(tagIds) {
      this.dsform.TagIds = tagIds
    },
    editDsFail(name) {
      if (name === this.dsform.displayName) {
        this.uploadingData = false
      }
    },
    uploadHandle() {},
    onRefDocSuce() {
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
    },
    onRefDocErr(e) {
      this.$showUploadFailure(e)
    },

    // 判断工具
    isOracle() {
      const ds = this.dsform
      // this.dsform.extraDbPara=""
      return ds.dbtype === 'ORACLE'
    },
    isDBServer() {
      var self = this
      return !self.isFileData && !this.isAgent
    },
    getDriverType(type) {
      if (!type) return
      this.$http
        .get(this.$url + `/service/driver/type?type=${type}`)
        .then(res => {
          if (res.data.length > 0) {
            this.driverState = true
          } else {
            if (this.customConnectionState === false) {
              this.driverState = false
            } else {
              this.$message.warning(
                this.$t('meta.dataSource.edit.noDriverPackage')
              )
              this.driverState = true
            }
          }
          res.data.forEach(element => {
            element.label = element.driverName
            element.value = element.id
          })
          res.data.forEach(element => {
            if (element.defaultDriver === true && this.driverValue === '') {
              this.driverValue = element.id
            }
          })
          this.driverOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = newVal
          this.dsform.isOld = true
          this.handleEditRow()
        }
      },
      immediate: true,
    },
    typeSelectWraper(newVal) {
      if (newVal !== 'AGENT') {
        this.getDriverType(newVal)
      }
    },
    getView(newVal) {
      this.dsform.ViewFiltered = !newVal
    },
    getStoredProcedure(newVal) {
      this.dsform.ProceduresFiltered = !newVal
    },
    getDBFunction(newVal) {
      this.dsform.FunctionFiltered = !newVal
    },
    Package(newVal) {
      this.dsform.PackageFiltered = !newVal
    },
    TableOnlyReColumns(newVal) {
      this.dsform.TableOnlyReColumns = !newVal
    },
    ReFK(newVal) {
      this.dsform.ReFK = newVal
    },
    testPw(newVal) {
      this.disabledUsernamePw = !newVal
      this.dsform.username = ''
      this.dsform.password = ''
    },
    BlackListAppliedTypeIds(newVal) {
      this.dsform.BlackListAppliedTypeIds = newVal.join(';')
    },
    SelectedBlackList(newVal) {
      this.dsform.SelectedBlackList = newVal
    },
  },
}
