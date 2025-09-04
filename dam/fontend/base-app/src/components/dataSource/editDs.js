import UserSelect from '../common/UserSelect.vue'
import constrDs from './editJdbcDs.vue'

import HTTP from '@/http/main.js'
import Agent from './agent'
import Compare from './compare'
import callModel from './callModel.vue'

export default {
  mixins: [Agent, Compare],
  props: [
    'dsEditing',
    'dsform',
    'formatDataSource',
    'dataZoneTags',
    'jdbcDs',
    'isJDBC',
    'reType',
    'isRe',
  ],
  data() {
    this.uploadHost = this.$url + 'files/upload/driver'
    this.uploadKerberos = this.$url + 'files/upload'
    const dsTypeArr = [
      { type: 'SQL', name: this.$t('meta.dataSource.edit.relDbs1') },
      { type: 'NoSQL', name: this.$t('meta.dataSource.edit.NoSQLDbs') },
      { type: 'MetaModelDemo', name: '自定义' },
    ]
    /* if (this.$settingIni.agentRe && this.$settingIni.agentRe.enable) {
      dsTypeArr.push({
        type: 'Agent',
        name: 'Agent',
      })
    } */
    return {
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
      categoryId: '',
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
      noSqlDbTypeArr: [
        // { label: 'HBASE', value: 'HBASE' },
        { label: 'Transwarp-Inceptor', value: 'INCEPTOR' },
        // { label: 'MongoDB', value: 'MONGODB' },
        // { label: 'Elasticsearch', value: 'ES' },
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
      showSmbUserPw: false,
      backupDatasourceArr: [],
      backupDatasourceValue: '',
      dataConnectValue: 'SELF',
      backupDatasourceDisabled: true,
      dataSampling: 'true',
      dataSamplingDisabled: false,
      driverOptions: [],
      driverValue: '',
      driverState: false,
      customConnection: false,
      customConnectionState: false,

      dataSourceType: '',
      dsTypeArr: dsTypeArr,
      BlackListAppliedTypeIds: [],
      SelectedBlackList: null,
      uploadSuccess: false,

      originFormData: {},
      // ExcelAutoCollect: 'false',
      userPassword: false,
      InstanceName: '',
      sqlTestSucceeded: false,
      saving: false,
    }
  },

  components: { UserSelect, constrDs, callModel },

  computed: {
    isSee() {
      return this.$store.state.dataSourceScan
    },
    pathArr() {
      let arr = [this.$t('common.page.dataSourceConnect')]
      if (!this.dsEditing) {
        arr.push(this.$t('meta.dataSource.add'))
      } else {
        let name = this.dsform.sourceName || this.dsform.displayName
        arr.push(name)
      }
      return arr
    },
    acceptTypes() {
      switch (this.dsform.dbtype) {
        // case 'EXCEL':
        case 'DATADICTIONARY':
        case 'DATADICTIONARY_LOGICAL':
          return '.xls,.xlsx'
        // case 'CSV':
        //   return '.csv'
        case 'TABLEAU':
          return '.twb'
        default:
          break
      }
    },
    chooseSystem() {
      return !!this.dsform.categoryId
    },
    isFileData() {
      var self = this
      var ds = self.dsform
      return (
        // ds.dbtype == 'CSV' ||
        // ds.dbtype == 'EXCEL' ||
        ds.dbtype == 'DATADICTIONARY' ||
        ds.dbtype == 'DATADICTIONARY_LOGICAL' ||
        ds.dbtype == 'TABLEAU' ||
        ds.dbtype === 'SMBSHAREFILE'
      )
    },
    isDB2() {
      const ds = this.dsform
      return ds.dbtype === 'DB2'
    },
    onlyDatabase() {
      const onlyDbs = [
        'MYSQL',
        // 'MONGODB',
        'GBASE',
        'TERADATA',
        'HIVE',
        'IMPALA',
        // 'MAXCOMPUTE',
        'OCEANBASE',
        'CLICKHOUSE',
        'VERTICA',
        'STARROCKS',
      ]
      let bool = false
      const dbsMutiple = onlyDbs.some(dbType => {
        return dbType === this.dsform.dbtype
      })
      if (dbsMutiple) {
        bool = true
      }
      if (this.useCustomedDbTye) {
        bool = this.targetType === 'database'
      }
      return bool
    },
    hasSchema() {
      var ds = this.dsform
      const noSchemaDbs = [
        'MYSQL',
        'MONGODB',
        'GBASE',
        // 'HANA',
        'TERADATA',
        'HIVE',
        'IMPALA',
        'MAXCOMPUTE',
        'OCEANBASE',
        'CLICKHOUSE',
        // 'VERTICA',
        'STARROCKS',
      ]
      let bool = true
      const isNoSType = noSchemaDbs.some(dbType => {
        return dbType === ds.dbtype
      })
      if (!this.isDBServer() || isNoSType) {
        bool = false
      }

      if (this.useCustomedDbTye) {
        bool = this.targetType === 'schema'
      }
      return bool
    },
    disableCommitButton() {
      return !this.dsEditing && !this.sqlTestSucceeded
    },
    dbNameRequ() {
      // 所以有 数据库 选项框的,在 提交 时都按必填处理
      let bool = true
      if (!this.showDbName) {
        bool = false
      } else if (this.dsform.connectType === 'WebLogic') {
        bool = false
      } else if (this.dsform.dbtype === 'ORACLE') {
        bool = true
      } else if (!this.testSuccessed) {
        // 没有测试成功(即需要点击测试), 测试时不需要 数据库名称
        const arr = [
          'MYSQL',
          'HIVE',
          // 'HANA',
          'IMPALA',
          'INCEPTOR',
          'SQLSERVER',
          'TERADATA',
          'OCEANBASE',
          'CLICKHOUSE',
          'VERTICA',
          // 'MONGODB',
          'POSTGRESQL',
          'HOLOGRES',
          'GBASE',
          'STARROCKS',
        ]
        if (arr.indexOf(this.dsform.dbtype) !== -1) {
          bool = false
        }
      } else {
        // HANA可以在确定时不填数据库
        if (this.dsform.dbtype === 'HANA' || this.dsform.dbtype === 'MYSQL') {
          bool = false
        }
      }
      if (this.useCustomedDbTye) {
        bool = false
      }
      return bool
    },
    userPasswordRequ() {
      let bool = false
      const ds = this.dsform
      if (
        ds.connectType == 'JDBC' &&
        this.isDBServer() &&
        this.AuthenticationType == 0
      ) {
        bool = true
      }
      if (
        ds.dbtype === 'HIVE' ||
        ds.dbtype === 'IMPALA' ||
        ds.dbtype === 'HBASE' ||
        ds.dbtype === 'ES' ||
        ds.dbtype === 'CLICKHOUSE' ||
        ds.dbtype === 'MONGODB'
      ) {
        bool = false
      }
      if (this.dsEditing) {
        bool = false
      }
      return bool
    },
    showDbName() {
      let bool = true
      const dbArr = ['ES', 'HBASE', 'DB2I', 'HANA']
      if (!this.isDBServer()) {
        bool = false
      }
      const isNotType = dbArr.some(dbTye => {
        return dbTye === this.dsform.dbtype
      })
      if (isNotType) {
        bool = false
      }
      if (this.useOfflineDs) {
        bool = true
      }

      if (this.useCustomedDbTye) {
        bool = this.targetType === 'database'
      }
      return bool && this.dsform.dbtype !== 'OCEANBASE-ORACLE'
    },
    testBtnDisabled() {
      let bool = false
      if (
        this.disableTest ||
        (this.isDB2 && !this.dsform.dbname) ||
        (this.showUsernamePw &&
          this.disabledUsernamePw &&
          this.dsform.dbtype !== 'HBASE')
      ) {
        bool = true
      }
      if (this.dsform.dbtype === 'SMBSHAREFILE') {
        if (!this.dsform.sharePath) {
          bool = true
        }
        // if (this.showSmbUserPw) {}
      }
      return bool
    },
    showUsernamePw() {
      return this.isDBServer() && this.AuthenticationType == 0
    },
    sqlDbTypesWithOffline() {
      const result = _.cloneDeep(this.sqlDBTypesArr)
      result.push({
        label: this.$t('meta.dataSource.offLineDump'),
        value: 'OFFLINEDUMP',
      })
      result.push({
        label: this.$t('meta.dataSource.offLineDumpRaw'),
        value: 'OFFLINEDUMP_RAW',
      })
      return result
    },
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
    // 是否输入服务器名称
    showServerName() {
      return (
        this.isDBServer() && !this.useCustomedDbTye && !this.customConnection
      )
    },
    showInputDbPort() {
      return this.isDBServer() && this.showDbport && !this.customConnection
    },
  },
  beforeMount() {
    console.log(this.dsform)
    if (this.dsEditing) {
      // this.getDetails()
    }
  },
  created() {
    // 初始化采集类型
    this.$set(this.dsform, 'ExcelAutoCollect', 'false')
    let tempArr = [
      { label: 'HBASE', value: 'HBASE' },
      { label: 'MongoDB', value: 'MONGODB' },
      { label: 'Elasticsearch', value: 'ES' },
    ]
    tempArr.forEach(t => {
      if (
        this.$allPlugins.some(p => {
          return t.value === p.dbType
        })
      ) {
        this.noSqlDbTypeArr.push(t)
      }
    })
  },
  mounted() {
    this.$bus.$on('forReParam', this.handleParamForRe)
    this.$bus.$on('addDataSource', this.addDataSource)
    // add custom props
    const defaultProp = [
      { key: 'username', value: '' },
      { key: 'password', value: '' },
      // for smb
      { key: 'sharePath', value: '' },
      { key: 'description', value: '' },
    ]
    defaultProp.forEach(item => {
      this.$set(this.dsform, item.key, item.value)
    })
    this.dsform.versioning = true
    this.getUserModelCategory()
    var self = this
    // todo --zl 查询备用数据源
    // this.getbackupDatasourceArr()

    if (!this.dsEditing) {
      self.schemaSelected = []
      self.schemas = []
      self.webLogicDBs = []
      self.dbConnected = false
    } else {
    }
    // this.tableHeight = $(".table-row")[0].offsetHeight;
    // $(window).resize(this.resizeTable);
    this.$bus.$on('editDsFail', this.editDsFail)
    if (this.dsEditing) {
      this.originFormData = _.cloneDeep(this.getOriData())
      this.getDataSourceType()
    } else {
      this.dataSourceType = 'SQL'
    }
    // 查询推荐数据库版本
    this.getVersion()
  },
  beforeDestroy() {
    // $(window).unbind("resize", this.resizeTable);
    this.$bus.$off('editDsFail')
    this.$bus.$off('addDataSource')
    this.$bus.$off('forReParam')
    this.uploadingData = false
    this.saving = false
  },
  methods: {
    handleParamForRe(data) {},
    // 初始化编辑信息
    initEditInfo() {
      let parameterMap = {}
      this.dbTypeSelected()
      if (this.dsform.dbtype === 'HBASE') {
        this.authDisabled = true
        this.AuthenticationType = 1
        this.portText = this.$t('meta.dataSource.edit.zookeeperPort')

        this.$set(this.dsform, 'HBaseMasterPort', parameterMap.HBaseMasterPort)
        this.$set(
          this.dsform,
          'HBaseRegionserverPort',
          parameterMap.HBaseRegionserverPort
        )
        this.$set(this.dsform, 'ScanSize', '')
        this.$set(this.dsform, 'Encoding', '')
      } else if (this.dsform.dbtype === 'DB2') {
        this.inputDBname = this.$t('meta.dataSource.edit.dbs')
        this.dbplaceHolder = this.$t('meta.dataSource.edit.fillDbs')
      } else if (this.dsform.dbtype === 'ES') {
        this.ESwithSsl = false
        this.schemaText = 'Indices'

        this.$set(this.dsform, 'KeyStorePath', '')
        this.$set(this.dsform, 'KeyStorePass', '')
        this.$set(this.dsform, 'HttpType', 'https')
      }
      if (
        this.dsform.original &&
        this.dsform.original.connectionInfo &&
        this.dsform.original.connectionInfo.parameterMap
      ) {
        const connectionInfo = this.dsform.original.connectionInfo
        parameterMap = this.dsform.original.connectionInfo.parameterMap
        this.AuthenticationType =
          this.dsform.original.connectionInfo.parameterMap.AuthenticationType -
          0
        const str =
          this.dsform.original.connectionInfo.parameterMap.SelectedSchemas || ''
        this.schemaSelected = str.split(';').filter(item => item.length > 0)
        if (this.AuthenticationType == 1) {
          this.dsform.ServicePrincipal =
            this.dsform.original.connectionInfo.parameterMap.ServicePrincipal
          this.dsform.UserPrincipal =
            this.dsform.original.connectionInfo.parameterMap.UserPrincipal
          this.dsform.KeyTabPath =
            this.dsform.original.connectionInfo.parameterMap.KeyTabPath
          this.dsform.Krb5Path =
            this.dsform.original.connectionInfo.parameterMap.Krb5Path
          this.getFileInfo()
        }
        if (parameterMap.SelectedTables) {
          this.originSelTables = _.cloneDeep(parameterMap.SelectedTables)
          this.$set(this.dsform, 'SelectedTables', parameterMap.SelectedTables)
        }
        this.$set(this.dsform, 'dbport', parameterMap.PortNumber)
        if (this.dsform.dbtype === 'SMBSHAREFILE') {
          this.$set(this.dsform, 'sharePath', parameterMap.sharePath)
          this.$set(this.dsform, 'description', parameterMap.description)
        }
      }
      // 初始化 dsform 属性
      let TagIdsSave = []
      if (parameterMap.RegionTagId && !parameterMap.TagIds) {
        TagIdsSave = [parameterMap.RegionTagId - 0]
      }
      if (!parameterMap.TagIds && parameterMap.TagIds !== 0) {
        TagIdsSave = TagIdsSave.length > 0 ? TagIdsSave : []
      } else {
        const arr = parameterMap.TagIds.split(',')
        arr.forEach(item => {
          if ((item || item === 0) && !isNaN(item - 0)) {
            TagIdsSave.push(item - 0)
          }
        })
      }
      if (this.dsform.connUrl) {
        this.customConnection = true
        this.$set(this.dsform, 'connUrl', this.dsform.connUrl)
        this.dbTypeSelected()
      }
      this.driverValue = this.dsform.driverId
      this.$set(this.dsform, 'TagIds', TagIdsSave)

      const moreapp = ['ViewFiltered', 'ProceduresFiltered', 'FunctionFiltered']

      moreapp.forEach(item => {
        if (parameterMap[item] === 'false') {
          parameterMap[item] = false
        } else if (parameterMap[item] === 'true') {
          parameterMap[item] = true
        } else {
          parameterMap[item] = !!parameterMap[item]
        }
        this.$set(this.dsform, item, !!parameterMap[item])
      })
      /* this.getView = !parameterMap.ViewFiltered
      this.getStoredProcedure = !parameterMap.ProceduresFiltered
      this.getDBFunction = !parameterMap.FunctionFiltered
      if (this.dsform.dbtype === 'ORACLE') {
        this.Package = `${parameterMap.PackageFiltered}` === 'false'
      }
      this.ReFK = `${parameterMap.ReFK}` === 'true' */
      // 数据库多选
      if (this.onlyDatabase && this.dsEditing) {
        // this.preDbnames = this.dsform.dbname.split(';')
        this.preDbnames = this.dsform.database.split(';')
      }
      /* this.dsform.ReFK = this.ReFK
      this.originCheckboxes = {
        ViewFiltered: this.getView,
        ProceduresFiltered: this.getStoredProcedure,
        FunctionFiltered: this.getDBFunction,
        PackageFiltered: this.Package,
        ReFK: this.ReFK,
        CommentToLogicalName: _.cloneDeep(this.dsform.CommentToLogicalName),
      } */
      this.authDisabled = true
      this.initAgentMessage(parameterMap)
    },
    // 查询推荐数据库版本
    getVersion() {
      this.$http.post(this.$url + '/suggest/version/getList').then(res => {
        let str = this.$t('meta.dataSource.edit.dbsVersion')
        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach(r => {
            // str += r.displayName + '：' + r.versionSuggest + '\n'
            str += r + '\n'
          })
        } else {
          str = this.$t('meta.dataSource.edit.noVersion')
        }
        this.dbsVersion = str
      })
    },
    changeReType(val) {},
    // 获取数据源详情（暂时只用owner）
    getDetails() {
      this.$http
        .get(this.$meta_url + `/service/models/${this.dsform.id}/plain`)
        .then(res => {
          if (res.data.owner) {
            this.$set(this.dsform, 'owner', res.data.owner)
            this.$set(this.originFormData, 'owner', res.data.owner)
          }
        })
        .catch(e => {
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
          this.backupDatasourceValue = this.dsform.original.backupDatasourceId
        } else {
          this.backupDatasourceDisabled = true
          this.backupDatasourceValue = ''
        }
      }
      if (value === 'DISABLED') {
        this.dataSampling = 'false'
        this.dataSamplingDisabled = true
      } else {
        this.dataSamplingDisabled = false
      }
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
    getMemory() {
      const data = JSON.parse(localStorage.getItem('dataSourceLoginMessage'))
      if (data) {
        if (data.hasOwnProperty(this.dsform.displayName)) {
          data[this.dsform.id] = data[this.dsform.displayName]
          delete data[this.dsform.displayName]
        }
        const current = data.hasOwnProperty(this.dsform.id)
          ? data[this.dsform.id]
          : data[this.dsform.displayName]
        if (current) {
          this.dsform.username = current[0]
          this.dsform.password = current[1]
          this.rememberLoginMessage = true
        }
      }
    },
    setMemory() {
      const ds = this.dsform
      const data = [ds.username, ds.password]
      if (!localStorage.getItem('dataSourceLoginMessage')) {
        localStorage.setItem(
          'dataSourceLoginMessage',
          JSON.stringify({ base: true })
        )
      }
      const body = JSON.parse(localStorage.getItem('dataSourceLoginMessage'))
      if (this.dsEditing) {
        body[ds.id] = data
      } else {
        body[ds.displayName] = data
      }
      localStorage.setItem('dataSourceLoginMessage', JSON.stringify(body))
    },
    clearMemory() {
      const ds = this.dsform
      if (!localStorage.getItem('dataSourceLoginMessage')) {
        localStorage.setItem(
          'dataSourceLoginMessage',
          JSON.stringify({ base: true })
        )
      }
      const body = JSON.parse(localStorage.getItem('dataSourceLoginMessage'))
      if (this.dsEditing) {
        delete body[ds.id]
        delete body[ds.displayName]
      } else {
      }
      localStorage.setItem('dataSourceLoginMessage', JSON.stringify(body))
    },
    handleUsePwChange() {
      // this.showSmbUserPw = !this.showSmbUserPw;
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
    getUserModelCategory() {
      this.$modelCategories.forEach(item => {
        if (item.isSelf) {
          this.userModelCategory.push(item)
        }
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
          this.$url +
            `/service/models/${this.dsform.id}/owner?owner=${this.newOwner}`
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
    dbTypeWrapSelected(value) {
      this.customConnection = false
      this.driverValue = ''
      this.hostNameLabel = this.$t('meta.dataSource.edit.serverName')
      this.userLabel = this.$t('meta.dataSource.edit.username')
      this.pwLabel = this.$t('meta.dataSource.edit.password')
      this.$set(this.dsform, 'connUrl', '')
      this.typeSelectWraper = value
      if (!this.useOfflineDs) {
        this.dsform.dbtype = value
        this.dbTypeSelected()
        this.$nextTick(() => {})
      }
    },
    changeCategoryId() {
      const self = this
      const ds = this.dsform
      this.dialogChangeidVisible = false
      self.$http
        .put(
          self.$meta_url +
            '/models/' +
            ds.id +
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
    // resizeTable() {
    //   this.$nextTick(() => {
    //     this.tableHeight = $(".table-row")[0].offsetHeight;
    //   });
    // },

    // 切换数据库
    dbTypeSelected(type) {
      const self = this
      const ds = self.dsform
      this.portText = this.$t('meta.dataSource.edit.port')

      /** default value */
      this.AuthenticationType = 0
      this.requireDbport = true
      this.showDbport = true
      this.testSuccessed = false
      this.schemaText = 'Schema'
      this.authDisabled = false
      ds.versioning = true
      this.useCustomedDbTye = false
      this.showDbport = true
      this.$set(ds, 'hostname', ds.hostname || 'localhost')
      this.inputDBname = this.$t('meta.dataSource.edit.dbs')
      this.dbplaceHolder = this.$t('meta.dataSource.edit.fillOrSelDbs')
      ds.extraDbPara = ''
      this.hostNameLabel = this.$t('meta.dataSource.hostName')
      this.userLabel = this.$t('meta.dataSource.edit.username')
      this.pwLabel = this.$t('meta.dataSource.edit.password')

      if (ds.dbtype === 'MYSQL' || ds.dbtype === 'OCEANBASE') {
        ds.dbport = '3306'
      } else if (ds.dbtype === 'POSTGRESQL' || ds.dbtype === 'POLAR-DB') {
        ds.dbport = '5432'
      } else if (ds.dbtype === 'HOLOGRES') {
        ds.dbport = '80'
      } else if (ds.dbtype == 'GAUSSDB') {
        ds.dbport = '25308'
      } else if (ds.dbtype == 'GREENPLUM') {
        ds.dbport = '5432'
      } else if (ds.dbtype == 'STARROCKS') {
        ds.dbport = '9030'
      } else if (ds.dbtype == 'SQLSERVER') {
        ds.dbport = '1433'
      } else if (ds.dbtype === 'ORACLE') {
        ds.dbport = '1521'
        if (this.dsform.original) {
          ds.extraDbPara =
            this.dsform.original.connectionInfo.parameterMap.DatabaseName.split(
              ':'
            )[0]
        } else {
          ds.extraDbPara = 'SID'
          this.inputDBname = 'SID'
          this.dbplaceHolder = this.$t('meta.dataSource.edit.fillSID')
        }
      } else if (ds.dbtype === 'INFORMIX') {
        ds.dbport = '9092'
        this.inputDBname = 'database'
        this.dbplaceHolder = '请输入database名称'
      } else if (ds.dbtype == 'HIVE') {
        ds.dbport = '10000'
      } else if (ds.dbtype == 'IMPALA') {
        ds.dbport = '21050'
      } else if (ds.dbtype == 'MONGODB') {
        ds.dbport = '27017'
      } else if (ds.dbtype == 'GBASE') {
        ds.dbport = '5258'
      } else if (ds.dbtype == 'HANA') {
        ds.dbport = '30015'
      } else if (ds.dbtype == 'ODPS') {
      } else if (ds.dbtype == 'MAXCOMPUTE') {
        this.$set(ds, 'dbport', '')
        this.requireDbport = false
        this.showDbport = false

        this.hostNameLabel = 'EndPoint'
        this.userLabel = 'AK ID'
        this.pwLabel = 'AK Secret'
        // } else if (ds.dbtype == 'EXCEL') {
        // } else if (ds.dbtype == 'CSV') {
      } else if (ds.dbtype == 'DATADICTIONARY') {
      } else if (ds.dbtype == 'DATADICTIONARY_LOGICAL') {
      } else if (ds.dbtype == 'TABLEAU') {
      } else if (ds.dbtype == 'DB2') {
        ds.dbport = '50000'

        this.inputDBname = this.$t('meta.dataSource.edit.dbs')
        this.dbplaceHolder = this.$t('meta.dataSource.edit.fillDbs')
      } else if (ds.dbtype === 'DB2I') {
        this.showDbport = false
        this.requireDbport = false
        this.$set(ds, 'dbport', '')
      } else if (ds.dbtype === 'ES') {
        ds.dbport = '9200'

        this.$set(this.dsform, 'KeyStorePath', '')
        this.$set(this.dsform, 'KeyStorePass', '')
        this.$set(this.dsform, 'HttpType', 'https')
        this.ESwithSsl = false
        this.schemaText = 'Indices'
      } else if (ds.dbtype === 'HBASE') {
        ds.dbport = '2181'
        this.authDisabled = true
        this.AuthenticationType = 1

        this.$set(this.dsform, 'HBaseMasterPort', '16000')
        this.$set(this.dsform, 'HBaseRegionserverPort', '16020')
        this.$set(this.dsform, 'ScanSize', '10000')
        this.$set(this.dsform, 'Encoding', 'UTF-8')

        this.portText = this.$t('meta.dataSource.edit.zookeeperPort')
      } else if (ds.dbtype === 'TERADATA') {
        ds.dbport = '1025'
      } else if (ds.dbtype === 'CUSTOMIZED') {
        this.useCustomedDbTye = true
        this.showDbport = false
        this.$set(ds, 'hostname', '')
        this.$set(ds, 'dbport', '')
      } else if (ds.dbtype === 'SMBSHAREFILE') {
        this.dsform.username = ''
        this.dsform.password = ''
      }

      if (ds.connectType == 'WebLogic') {
        ds.dbport = '7001'
        this.testSuccessed = true
      }
      // 后加重置表单项
      if (!this.dsEditing) {
        this.$set(this.dsform, 'displayName', '')
        this.$set(this.dsform, 'hostname', 'localhost')
        this.$set(this.dsform, 'dbname', '')
        this.$set(this.dsform, 'username', '')
        this.$set(this.dsform, 'password', '')
        this.categoryId = ''
      }
    },
    // test 测试数据源
    testDataSource({ hideMsg } = {}) {
      this.disableTest = true
      const self = this
      const ds = this.dsform
      const formatPara = this.getFormatPara()
      if (this.rememberLoginMessage) {
        this.setMemory()
      } else {
        this.clearMemory()
      }
      const json = this.formatDataSource(this.dsform, true, formatPara)

      if (!json) {
        this.disableTest = false
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        return
      }
      if (this.driverValue === '' && this.customConnectionState) {
        this.disableTest = false
        this.$message.warning(this.$t('meta.dataSource.edit.noDriverPackage'))
        return
      }
      let url = this.$url + '/datasources/testConnectionInfo'
      if (ds.dbtype === 'HBASE') {
        const paraObj = {
          ScanSize: ds.ScanSize || 1000,
          Encoding: ds.Encoding || 'UTF-8',
        }
        url += '?options=' + encodeURIComponent(JSON.stringify(paraObj))
      }
      // test
      // get schema
      // get dbname

      // 逻辑: 需要 schema , 先 get schema, 然后get dbname
      //       没有 schema, 需要 dbname ,  get dbname ,
      //       其他, 仅测试
      const handleTestSuccess = () => {
        this.testSuccessed = true
        !hideMsg &&
          self.showSuccess(
            this.$t('meta.dataSource.edit.datasourceTestSucceed')
          )
        this.disableTest = false
      }
      const handleTestFailure = () => {
        this.testSuccessed = false
        this.disableTest = false
      }
      if (this.dsform.dbtype === 'SMBSHAREFILE') {
        const url = `${this.$url}/service/models/re/shareFile`
        this.$http
          .put(url, json)
          .then(res => {
            handleTestSuccess()
          })
          .catch(e => {
            this.$showFailure(e)
            handleTestFailure()
          })
      } else if (this.hasSchema && !this.useCustomedDbTye) {
        self.getSchemas(
          json,
          () => {
            handleTestSuccess()
            if (this.showDbName) {
              const para = _.cloneDeep(json)
              self.dsform.useOfflineDs = false
              if (this.typeSelectWraper !== 'OFFLINEDUMP') {
                this.getDbName(json)
              }
            }
          },
          handleTestFailure
        )
      } else if (this.showDbName && !this.useCustomedDbTye) {
        this.getDbName(
          json,
          () => {
            handleTestSuccess()
          },
          handleTestFailure
        )
      } else {
        if (this.dsform.dbtype === 'CUSTOMIZED') {
          json.driverId = this.driverValue
        }
        self.$http
          .post(url, json)
          .then(res => {
            handleTestSuccess()
            if (this.useCustomedDbTye) {
              this.getDbName(json)
              this.getSchemas(json)
            }
          })
          .catch(e => {
            this.$showFailure(e)
            handleTestFailure()
          })
      }
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
        typeSelectWraper: this.typeSelectWraper,
        ExcelAutoCollect: this.dsform.ExcelAutoCollect,
        userPassword: this.userPassword,
      }
      return formatPara
    },
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
    offlineSchemaChange(value) {
      // value && this.testDataSource({hideMsg: true});
      if (value) {
        const formatPara = this.getFormatPara()
        const json = this.formatDataSource(this.dsform, true, formatPara)
        this.getOfflineTable(json)
      }
    },
    getOfflineTable(para) {
      this.$http
        .put(`${this.$url}/service/models/re/tbs`, para)
        .then(res => {
          const offlineInstancesArr = res.data.split(';').filter(item => !!item)
          this.offlineInstancesArr = offlineInstancesArr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setValueNull(val) {
      this.offlineDbChange(this.setValueNullName)
    },
    getDbName(json, successcallback, failureCallback) {
      this.$http
        .post(this.$url + '/datasources/getDatabases', json)
        .then(res => {
          successcallback && successcallback()
          this.dataBaseNames =
            res.data.length &&
            res.data.split(';').filter(item => item.length > 0)
          this.disableTest = false
          if (!this.dsEditing && !this.dsform.dbname) {
            if (json.type !== 'TERADATA') {
              this.dsform.dbname = this.dataBaseNames[0]
              if (this.onlyDatabase) {
                this.preDbnames = [this.dataBaseNames[0]]
              }
            } else {
              let username = ''
              if (json.credentialInfo) {
                username = json.credentialInfo.user || ''
              }
              this.dsform.dbname = username
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
        })
    },
    handleDbnameClick() {
      this.showAllDbname = true
    },
    handleDbnameChange(value) {
      this.showAllDbname = false
      if (this.onlyDatabase) {
        this.dsform.dbname = this.preDbnames.join(';')
      }
      this.setValueNullName = value
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
    },
    addDataSource() {
      if (this.saving) {
        return
      }
      if (this.dsform.dbtype === 'INFORMIX' && !this.schemaSelected.length) {
        return this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
      }
      if (!this.isAgent) {
        this.$bus.$emit('agent-message', null)
      }
      if (
        !this.dsEditing &&
        !this.sqlTestSucceeded &&
        this.dataSourceType !== 'MetaModelDemo'
      ) {
        this.$datablauMessage.warning(this.$t('meta.dataSource.edit.testError'))
        return
      }
      this.saving = true
      this.$refs.jdbcDS.addDataSource()
    },
    // 获取变更项
    difference(cur, ori) {
      return _.transform(cur, function (result, value, key) {
        if (!_.isEqual(value, ori[key])) {
          result[key] = value
        }
      })
    },
    // 获取参数 for采集管理step1
    getReParam() {
      let param = null
      param = this.$refs.jdbcDS.formatParams()
      return param
    },
    emitData(type) {
      const para = this.getFormatPara()
      if (this.dsform.dbtype === 'OCEANBASEO') {
        if (!this.schemaSelected[0]) {
          this.$message.error('请选择schema')
          return
        }
        this.dsform.dbname = this.schemaSelected[0]
      }
      this.dsform.driverId = this.driverValue
      if (this.dsform.dbtype === 'INFORMIX') {
        this.dsform.InstanceName = this.InstanceName
      }
      let obj = {
        dsform: this.dsform,
        para: para,
      }
      this.$bus.$emit('changeDs', obj, type)
    },
    addOldDataSource() {
      this.uploadingData = true
      if (this.dbNameRequ && (!this.dsform || !this.dsform.dbname)) {
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        this.uploadingData = false
        return
      }
      let lastData = this.getOriData()
      if (
        this.dsEditing &&
        !this.testSuccessed &&
        JSON.stringify(lastData) !== JSON.stringify(this.originFormData)
      ) {
        this.$datablauMessage({
          message: this.$t('meta.dataSource.edit.updateAboutDbsConfirm'),
          type: 'warning',
          duration: 5000,
        })
        this.uploadingData = false
      } else {
        this.emitData()
      }
    },
    removetab() {
      this.$emit('removeEdiTab')
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
        (file.name.toLowerCase().indexOf('.xls') > -1 ||
          file.name.toLowerCase().indexOf('.xlsx') > -1)
      ) {
        isCorrectFile = true
      }
      if (
        ds.dbtype == 'TABLEAU' &&
        file.name.toLowerCase().indexOf('.twb') > -1
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
      if (type && type === 'keytab') {
        ds.KeyTabPath = res.fileId
      } else if (type && type === 'krb5') {
        ds.Krb5Path = res.fileId
      } else {
        file.filepath = res.fileStorePath
        ds.fileName = res.fileOrginalName
        ds.filePath = res.fileStorePath
      }
      this.$http.post(this.$url + '/files/commitFile?fileIds=' + res.fileId)
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
        url = `${this.$url}/service/models/template?logical=true`
      } else {
        url = `${this.$url}/service/models/template`
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
        .post('/base/datasources/getSchemas', json)
        .then(res => {
          successcallback && successcallback()
          this.dbConnected = true
          if (res.data) {
            const schemas = res.data
            schemas.sort()
            this.schemas = schemas
          }
          if (!this.dsEditing) {
            if (this.typeSelectWraper !== 'OFFLINEDUMP') {
              this.targetType = 'schema'
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
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
        .post(`/base/drivers/getDriverByType?type=${type}`) // new
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
    sqlTest(sqlTest, data) {
      this.sqlTestSucceeded = sqlTest
      if (this.reType === 'add') {
        this.$emit('addTestSucceed', sqlTest)
      }
    },
    getSaveState(state) {
      this.saving = state
    },
    createdJob(data) {
      if (this.reType && this.reType === 'add') {
        // 采集
        this.$emit('createDsSucceed', data)
      } else {
        this.$emit('reportDsCreated')
        this.removetab()
      }
    },
    getDataSourceType() {
      console.log(this.dsform, this.isJDBC)
      if (!this.isJDBC && this.dsform.customize) {
        this.dataSourceType = 'MetaModelDemo'
      } else if (this.typeSelectWraper === 'AGENT') {
        this.dataSourceType = 'Agent'
      } else if (this.isJDBC) {
        this.dataSourceType = 'SQL'
      } else if (!this.isJDBC) {
        this.dataSourceType = 'NoSQL'
      }
    },
    handleDataSourceTypeChange(newVal) {
      this.$refs.jdbcDS.dbType = ''
      this.$refs.jdbcDS.tempForm = {
        sourceName: '',
        driverId: '',
      }
    },
  },
  watch: {
    typeSelectWraper(newVal) {
      if (newVal !== 'AGENT') {
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
