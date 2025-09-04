import chooseTag from '@/components/dataSource/chooseTag.vue'
import UserSelect from '@/components/common/UserSelect.vue'
import editDs from '@/components/dataSource/editDs.vue'
import Agent from '@/components/dataSource/agent'
import Compare from '@/components/dataSource/compare'
import DatasourceController from '../../../../../../base-components/http/baseController/DatasourceController'
import _ from 'lodash'

export default {
  mixins: [Agent, Compare],
  props: ['dsEditing', 'editRow'],
  data() {
    const dsTypeArr = [
      { type: 'SQL', name: this.$t('meta.dataSource.edit.relDbs1') },
      { type: 'NoSQL', name: this.$t('meta.dataSource.edit.NoSQLDbs') },
      { type: 'file', name: this.$t('meta.dataSource.edit.file') },
      { type: 'report', name: this.$t('meta.dataSource.edit.report') },
    ]
    if (this.$settingIni?.agentRe && this.$settingIni?.agentRe?.enable) {
      dsTypeArr.push({
        type: 'Agent',
        name: 'Agent',
      })
    }
    return {
      // 元数据start
      hasSave: false,
      hasSaveModelId: '',
      saveLoading: false,
      step1Data: {},
      jdbcDs: {},
      isJDBC: true,
      dsform: {
        definition: '',
        CommentToLogicalName: true,
        TagIds: [],
        datasourceId: '',
        categoryId: '',
        modelCategoryId: '',
        isOld: true,
      },
      databaseList: [],
      schemaList: [],

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

      sqlDBTypesArr: [
        { label: 'Oracle', value: 'ORACLE' },
        { label: 'SQL Server', value: 'SQLSERVER' },
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'OceanBase', value: 'OCEANBASE' },
        { label: 'OceanBase-Oracle', value: 'OCEANBASEO' },
        { label: 'PostgreSQL', value: 'POSTGRESQL' },
        { label: 'Hologres', value: 'HOLOGRES' },
        { label: 'Polar-DB', value: 'POLARDB' },
        { label: 'GaussDB', value: 'GAUSSDB' },
        { label: 'Greenplum', value: 'GREENPLUM' },
        { label: 'DB2', value: 'DB2' },
        { label: 'DB2 for iSeries', value: 'DB2I' },
        { label: 'GBase', value: 'GBASE' },
        { label: 'Hana', value: 'HANA' },
        // {label: 'ODPS', value:  'ODPS'},
        // { label: 'MaxCompute', value: 'MAXCOMPUTE' },
        { label: 'Teradata', value: 'TERADATA' },
        { label: 'ClickHouse', value: 'CLICKHOUSE' },
        { label: 'Vertica', value: 'VERTICA' },
        { label: 'Custom Driver', value: 'CUSTOMIZED' },
        { label: 'Informix', value: 'INFORMIX' },
        { label: 'StarRocks', value: 'STARROCKS' },
      ],
      noSqlDbTypeArr: [
        { label: 'HBASE', value: 'HBASE' },
        { label: 'Hive', value: 'HIVE' },
        { label: 'Transwarp-Inceptor', value: 'INCEPTOR' },
        { label: 'FusionInsight', value: 'FUSIONINSIGHT' },
        { label: 'Impala', value: 'IMPALA' },
        { label: 'MongoDB', value: 'MONGODB' },
        { label: 'Elasticsearch', value: 'ES' },
        { label: 'MaxCompute', value: 'MAXCOMPUTE' },
      ],

      typeSelectWraper: '',

      // 离线数据源
      useOfflineDs: false,
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
      dsTypeArr: dsTypeArr,
      reportTestSucceeded: false,
      fileTestSucceeded: false,
      BlackListAppliedTypeIds: [],
      SelectedBlackList: null,
      uploadSuccess: false,

      originFormData: {},
      // ExcelAutoCollect: 'false',
      userPassword: false,
      InstanceName: '',
    }
  },

  components: { chooseTag, UserSelect, editDs },

  computed: {
    fileDbTypeArr() {
      let arr = [
        // { label: 'Excel', value: 'EXCEL' },
        // { label: 'CSV', value: 'CSV' },
        { label: 'Tableau（Offline Dump）', value: 'TABLEAU' },
        {
          label: 'File Storage Server', // 文件类资产
          value: 'SMBSHAREFILE',
        },
      ]
      if (this.$showOurLogo) {
        arr.splice(0, 0, {
          label: 'Data Dictionary(Physical)',
          value: 'DATADICTIONARY',
        })
        arr.splice(1, 0, {
          label: 'Data Dictionary(Logical)',
          value: 'DATADICTIONARY_LOGICAL',
        })
      }
      return arr
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
      const type = this.step1Data?.dbtype
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
      // return !this.useOfflineDs
      return true
    },
  },
  beforeMount() {
    if (this.dsEditing) {
      this.getDetails()
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
    this.$bus.$on('editDsFail', this.editDsFail)
    this.$bus.$on('sendStep1Data', this.handleStep1Data)
    this.$bus.$on('hasChangeDatasource', this.handleClearReDb)
    this.$bus.$on('createModel', this.preCreateModel)
    this.$bus.$on('changeSaveLoading', this.changeSaveLoading)
    if (this.dsEditing) {
      this.originFormData = _.cloneDeep(this.getOriData())
    }
  },
  beforeDestroy() {
    // $(window).unbind("resize", this.resizeTable);
    this.$bus.$off('editDsFail')
    this.$bus.$off('sendStep1Data')
    this.$bus.$off('hasChangeDatasource')
    this.$bus.$off('createModel')
    this.uploadingData = false
  },
  methods: {
    changeSaveLoading(value) {
      this.saveLoading = value
    },
    // 获取数据源详情（暂时只用owner）
    getDetails() {
      this.$http
        .get(this.$meta_url + `/models/${this.editRowData.modelId}/plain`)
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
      this.dataConnectValue = this.editRowData.dataConnect || 'SELF'
      this.backupDatasourceValue = this.editRowData.backupDatasourceId
      if (this.dataConnectValue === 'DISABLED') {
        this.dataSamplingDisabled = true
        this.dataSampling = false
      } else {
        this.dataSamplingDisabled = false
        this.dataSampling = this.editRowData.dataSample
      }
      if (this.editRowData?.dataConnect === 'BACKUP') {
        this.backupDatasourceDisabled = false
      }
      if (this.editRowData.type === 'HBASE') {
        this.$set(
          this.dsform,
          'ScanSize',
          this.editRowData.reverseOptions.SCAN_SIZE
        )
        this.$set(
          this.dsform,
          'Encoding',
          this.editRowData.reverseOptions.ENCODING
        )
      }
      if (this.useOfflineDs) {
        this.OfflineProSchema =
          this.editRowData.reverseOptions.OFFLINE_DUMP_TARGET_SCHEMA_NAME?.split(
            ';'
          )
        this.OfflineDumpTargetDBName =
          this.editRowData.reverseOptions.OFFLINE_DUMP_TARGET_DB_NAME || ''
      }
      this.$set(
        this.dsform,
        'CommentToLogicalName',
        this.editRowData.reverseOptions.COMMENT_TO_LOGICAL_NAME
      )
      this.getView = !this.editRowData.reverseOptions.VIEW_FILTERED
      this.getStoredProcedure =
        !this.editRowData.reverseOptions.PROCEDURES_FILTERED
      this.getDBFunction = !this.editRowData.reverseOptions.FUNCTION_FILTERED
      this.Package = !this.editRowData.reverseOptions.PACKAGE_FILTERED
      this.ReFK = this.editRowData.reverseOptions.RE_FK
      this.TableOnlyReColumns =
        !this.editRowData.reverseOptions.TABLE_ONLY_RE_COLUMNS
      this.$set(
        this.dsform,
        'SelectedTables',
        this.editRowData.reverseOptions.SELECTED_NAMES
      )
      this.originSelTables = _.cloneDeep(
        this.editRowData.reverseOptions.SELECTED_NAMES
      )
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
      this.originCheckboxes = {
        ViewFiltered: this.getView,
        ProceduresFiltered: this.getStoredProcedure,
        FunctionFiltered: this.getDBFunction,
        PackageFiltered: this.Package,
        ReFK: this.ReFK,
        CommentToLogicalName: _.cloneDeep(this.dsform.CommentToLogicalName),
        schema: _.cloneDeep(this.dsform.schema || ''),
        databaseName: _.cloneDeep(this.dsform.databaseName || ''),
      }
      this.BlackListAppliedTypeIds =
        this.editRowData.reverseOptions.BLACK_LIST_APPLIED_TYPE_IDS?.split(
          ';'
        ) || []
      this.SelectedBlackList =
        this.editRowData.reverseOptions.SELECTED_BLACK_LIST
    },
    handleStep1Data(data) {
      this.step1Data = data
      if (!this.step1Data.databaseList && !this.step1Data.schemaList) {
        this.step1Data.databaseList = []
      }
      if (this.dsEditing) {
        if (
          this.step1Data.databaseList?.length &&
          !this.step1Data.databaseList.includes(
            this.editRowData?.reverseOptions?.DATABASE_NAME?.split(';')[0]
          )
        ) {
          this.$set(this.dsform, 'databaseName', '')
        }
        if (
          this.step1Data.schemaList?.length &&
          !this.step1Data.schemaList.includes(
            this.editRowData?.reverseOptions?.SELECT_SCHEMA?.split(';')[0]
          )
        ) {
          this.$set(this.dsform, 'schema', '')
        }
      }
    },
    handleClearReDb() {
      this.$set(this.dsform, 'databaseName', '')
      this.$set(this.dsform, 'schema', '')
    },
    formatParams(data) {
      let obj = {
        definition: this.step1Data.definition,
        connectType: this.step1Data.connectType,
        modelCategoryId: this.step1Data.modelCategoryId,
        datasourceId: this.step1Data.datasourceId,
        // tagIds: this.dsform.TagIds,
        dataSample: this.dataSampling,
        dataConnect: this.dataConnectValue,
        backupDatasourceId: this.backupDatasourceValue,
        reverseOptions: {
          SELECTED_NAMES: this.dsform.SelectedTables,
          SELECTED_VIEWS: this.dsform.SelectedTables,
          SELECTED_BLACK_LIST: this.SelectedBlackList,
          BLACK_LIST_APPLIED_TYPE_IDS: this.BlackListAppliedTypeIds.join(';'),
          COMMENT_TO_LOGICAL_NAME: this.dsform.CommentToLogicalName,
          RE_FK: this.dsform.ReFK,
          COVERAGE_THRESHOLD: '',
          TABLE_ONLY_RE_COLUMNS: this.dsform.TableOnlyReColumns,
          PROCEDURES_FILTERED: !this.getStoredProcedure,
          FUNCTION_FILTERED: !this.getDBFunction,
          VIEW_FILTERED: !this.getView,
          PACKAGE_FILTERED: !this.Package,
          SELECT_SCHEMA: Array.isArray(this.dsform.schema)
            ? this.dsform.schema.join(';')
            : this.dsform.schema,
          DATABASE_NAME: Array.isArray(this.dsform.databaseName)
            ? this.dsform.databaseName.join(';')
            : this.dsform.databaseName,
        },
      }
      if (this.step1Data.isOld) {
      } else {
        obj.datasourceId = data.id
        // obj.definition = data.sourceName
      }

      if (this.dsEditing) {
        obj.modelId = this.editRowData.modelId
      }
      if (this.hasSave) {
        obj.modelId = this.hasSaveModelId
      }
      let type = ''
      if (this.dsEditing) {
        type = this.editRowData.type
      } else {
        type = this.currentDataSource.type
      }
      if (type === 'HBASE') {
        this.$set(obj.reverseOptions, 'SCAN_SIZE', this.dsform.ScanSize || 1000)
        this.$set(
          obj.reverseOptions,
          'ENCODING',
          this.dsform.Encoding || 'UTF-8'
        )
      }
      if (this.useOfflineDs) {
        if (Array.isArray(this.OfflineProSchema)) {
          this.$set(
            obj.reverseOptions,
            'OFFLINE_DUMP_TARGET_SCHEMA_NAME',
            this.OfflineProSchema.join(';')
          )
        }
        this.$set(
          obj.reverseOptions,
          'OFFLINE_DUMP_TARGET_DB_NAME',
          this.OfflineDumpTargetDBName
        )
      }
      for (let key in obj.reverseOptions) {
        if (obj.reverseOptions[key] === undefined) {
          delete obj.reverseOptions[key]
        }
      }
      return obj
    },
    // 保存
    save() {
      if (this.step1Data.isOld) {
        // 创建模型
        this.preCreateModel()
      } else {
        // 创建数据源
        this.saveLoading = true
        this.$bus.$emit('addDataSource')
      }
    },
    preCreateModel(data) {
      let obj = this.formatParams(data)
      this.createModel(obj)
    },
    createModel(obj) {
      this.saveLoading = true
      this.$http
        .post(this.$meta_url + '/models/createModel', obj)
        .then(res => {
          this.saveLoading = false
          this.$datablauMessage.success(this.$t('meta.reManage.saveSucceed'))
          this.hasSave = true
          this.hasSaveModelId = res.data[0].parentId || res.data.modelId
          this.$emit('changeStep', 3)
          this.$bus.$emit('sendModuleData', res.data)
          // this.getModelByModelId(obj.modelId)
        })
        .catch(e => {
          this.hasSave = false
          this.saveLoading = false
          this.$showFailure(e)
        })
    },
    getModelByModelId(modelId) {
      this.$http
        .post(`${this.$meta_url}/models/getModelByModelId`, {
          modelId: modelId,
        })
        .then(res => {
          this.$emit('changeStep', 3)
          this.$bus.$emit('sendModuleData', res.data)
        })
    },
    // 数据源列表
    getDatasourceData() {
      let param = {
        keyword: '',
      }
      DatasourceController.findDatasources({ requestBody: param })
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          /* this.$utils.sort.sortConsiderChineseNumber(
            res.data,
            'creationTime',
            'descending'
          ) */
          this.dataSourceData = res.data
          this.dataSourceDataBackup = this.dataSourceData
          if (this.dsEditing) {
            this.changeDataSource(this.editRowData.datasourceId)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 切换数据源
    changeDataSource(val) {
      this.databaseList = []
      this.schemaList = []
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
      this.handleGetSchemaList()
    },
    handleGetSchemaList() {
      let param = this.currentDataSource.parameterMap
      if (this.currentDataSource.type === 'OFFLINEDUMP') {
        this.schemaList = param.OfflineDumpTargetSchemaName?.split(';') || []
      } else if (param.SelectedSchemas) {
        this.schemaList = param.SelectedSchemas.split(';')
      } else {
        this.schemaList = []
      }
      if (param.DatabaseName) {
        this.databaseList = param.DatabaseName.split(';')
      } else {
        this.databaseList = []
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
    changeSchema(val) {},
    changeDatabase(val) {},
    changeProDb() {
      this.$http
        .post(
          `${this.$meta_url}/models/getOfflineSchema?datasourceId=${this.dsform.datasourceId}&database=${this.OfflineDumpTargetDBName}`
        )
        .then(res => {
          this.OfflineProSchema = ''
          this.offlineSchemasArr = []
          this.offlineSchemasArr = res.data
        })
        .catch(e => {
          this.offlineSchemasArr = []
          this.$showFailure(e)
        })
    },

    getOfflineTable() {
      this.$http
        .post(
          `${this.$meta_url}/models/getOfflineDatabase?datasourceId=${this.dsform.datasourceId}`
        )
        .then(res => {
          this.offlineInstancesArr = res.data
        })
        .catch(e => {
          this.offlineInstancesArr = []
          this.$showFailure(e)
        })
    },
    openChooseTag() {
      this.$refs.tagSelect.blur()
      this.handleAddTag()
    },
    selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        if (res && Array.isArray(res) && res.length === 1) {
          this.newOwner = res[0].username
          this.afterChangeOwner()
        }
      })
    },
    changeBackupDatasourceValue(value) {
      this.backupDatasourceValue = value
    },
    changeDataSamplingValue(value) {
      this.dataSampling = value
    },
    changeDataConnectValue(value) {
      this.dataConnectValue = value
      if (!this.dsEditing) {
        if (value === 'BACKUP') {
          this.backupDatasourceDisabled = false
        } else {
          this.backupDatasourceDisabled = true
          this.backupDatasourceValue = ''
        }
      } else {
        if (value === 'BACKUP') {
          this.backupDatasourceDisabled = false
          this.backupDatasourceValue = this.editRowData.backupDatasourceId
        } else {
          this.backupDatasourceDisabled = true
          this.backupDatasourceValue = ''
        }
      }
      if (value === 'DISABLED') {
        this.dataSampling = false
        this.dataSamplingDisabled = true
      } else {
        this.dataSamplingDisabled = false
      }
    },
    getbackupDatasourceArr() {
      this.$http
        .get(this.$meta_url + '/models/fromre/data')
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
    afterChangeOwner() {
      this.$set(this.dsform, 'owner', this.newOwner)
      this.formKey++
      this.$http
        .put(
          this.$meta_url +
            `/models/${this.editRowData.modelId}/owner?owner=${this.newOwner}`
        )
        .then(res => {
          this.$message.success(this.$t('meta.dataSource.edit.ownerChanged'))
        })
        .catch(e => {
          this.$showFailure(e)
        })
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
            '/models/' +
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
      this.dsform.categoryId = val
      this.dsform.modelCategoryId = val
      // todo --zl 获取数据源
    },
    // 获取变更项
    difference(cur, ori) {
      return _.transform(cur, function (result, value, key) {
        if (!_.isEqual(value, ori[key])) {
          result[key] = value
        }
      })
    },
    preSave() {
      let flag = false
      if (this.schemaOrDatabaseMultiple) {
        if (!this.dsform.schema?.length && !this.dsform.databaseName?.length) {
          flag = true
        }
      } else {
        flag = !this.dsform.schema && !this.dsform.databaseName
      }
      if (flag) {
        this.$message.warning(this.$t('meta.reManage.selDbsTip'))
        return
      }
      // 判断采集设置及选择表有没有变更
      let currentCheckboxes = {
        ViewFiltered: this.getView,
        ProceduresFiltered: this.getStoredProcedure,
        FunctionFiltered: this.getDBFunction,
        PackageFiltered: this.Package,
        ReFK: this.ReFK,
        CommentToLogicalName: this.dsform.CommentToLogicalName,
        schema: this.dsform.schema,
        databaseName: this.dsform.databaseName,
      }
      let changeItem = this.difference(currentCheckboxes, this.originCheckboxes)
      if (
        this.dsEditing &&
        (JSON.stringify(changeItem) !== '{}' ||
          ((this.originSelTables || this.dsform.SelectedTables) &&
            this.originSelTables != this.dsform.SelectedTables))
      ) {
        this.$DatablauCofirm(
          this.$t('meta.dataSource.edit.updateCollectConfirm'),
          this.$t('meta.dataSource.edit.tips'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        ).then(() => {
          this.originCheckboxes = {
            ViewFiltered: this.getView,
            ProceduresFiltered: this.getStoredProcedure,
            FunctionFiltered: this.getDBFunction,
            PackageFiltered: this.Package,
            ReFK: this.ReFK,
            CommentToLogicalName: _.cloneDeep(this.dsform.CommentToLogicalName),
            schema: _.cloneDeep(this.dsform.schema),
            databaseName: _.cloneDeep(this.dsform.databaseName),
          }
          this.save()
        })
      } else {
        this.save()
      }
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
    saveLoading: {
      handler: function (newVal) {
        this.$emit('changeSaveLoading', newVal)
      },
      immediate: true,
    },
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = _.cloneDeep(newVal)
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
