import Compare from './compare'
import sctw from './serverConfigToWeb'
import callModel from './callModel.vue'
export default {
  mixins: [Compare],
  props: ['isEdit', 'dataSourceType', 'jdbcDs', 'reType', 'isRe', 'sourceId'],
  data() {
    return {
      // 参数
      upload: this.$url + '/files/upload',
      disableTest: false, // 用于测试按钮loading
      currentServerConfig: {}, // 当前选中数据库的后端配置
      dbTypeArr: [], // 后端返回所有配置中提取的数据库列表
      jdbcDbArr: [], // 后端返回所有配置中提取的数据库列表
      noSqlArr: [], // 后端返回所有配置中提取的数据库列表
      metaTypeArr: [], // 元模型数据源类型下的数据库列表
      testCustomJson: false,
      testCustomJsoData: '', // model值
      oriJson: '', // 原始json，为offline_dump提供
      dsform: {
        parameterMap: {},
      }, // 模版表单项结构
      sourceName: '',
      categoryId: '',
      tempForm: {
        sourceName: '', // 数据源名称
        driverId: '', // 驱动
      }, // 页面绑定表单项
      parameterMap: {},
      credentialInfo: {},
      driverState: false,
      dbType: '', // 数据库类型
      dbsVersion: '', // 数据库推荐版本
      // customConnectionState: false, // 是否展示自定义连接串
      customConnection: false, // 自定义连接串
      dbLists: [], // 数据库列表
      webDbConfig: [], // 前端配置
      dbOptions: [], // 配置项
      // dataSourceType: 'SQL', // 数据源类型
      driverOptions: [],
      dataBaseNames: [], // 数据库选项
      schemas: [], // schema选项
      newFileList: [],
      krb5List: [],
      keytabList: [],
      testSucceed: false,
      onlySchema: false,
      targetType: 'database',
      categoryIdChanged: '',
      dialogChangeidVisible: false,
      // 离线数据源
      useOfflineDs: false,
      isOfflineEx: false,
      offlineDriverTypeArr: [
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'Oracle', value: 'ORACLE' },
      ],
      OfflineDumpTargetDBName: '', // 生产数据库
      offlineInstancesArr: [], // 生产数据库
      OfflineProSchema: '',
      offlineSchemasArr: [],

      backupDatasourceArr: [],
      backupDatasourceValue: '',
      dataConnectValue: 'SELF',
      backupDatasourceDisabled: true,
      dataSampling: 'true',
      dataSamplingDisabled: false,
      oriTempForm: {},
      ESwithSsl: false,
    }
  },
  components: { callModel },

  computed: {
    isSee() {
      return this.$store.state.dataSourceScan
    },
    pathArr() {
      let arr = [this.$t('common.page.dataSource')]
      if (!this.isEdit) {
        arr.push(this.$t('meta.dataSource.add'))
      } else {
        arr.push(this.dsform.displayName)
      }
      return arr
    },
    hasSchema() {
      let normalDb = this.currentServerConfig?.options?.some(o => {
        return o.code === 'SelectedSchemas'
      })
      return (
        normalDb ||
        (this.useOfflineDs &&
          this.tempForm.OfflineDumpSourceDriverType === 'ORACLE')
      )
    },
    showDbName() {
      return this.currentServerConfig?.options?.some(o => {
        return o.code === 'DatabaseName'
      })
    },
    hasPortNumber() {
      return this.currentServerConfig?.options?.filter(o => {
        return o.code === 'PortNumber'
      }).length
    },
    testBtnDisabled() {
      let bool = false
      return bool
    },
    // 是否为自定义类型库
    useCustomedDbTye() {
      return this.dbtype === 'CUSTOMIZED'
    },
  },
  beforeMount() {
    this.uploadDriUrl = `${this.$url}/service/models/upload`
    if (this.isEdit) {
      // this.getDetails()
    }
  },
  created() {
    this.getVersion()
    // this.dbType = 'MYSQL'
    // $(document).on('keydown', this.keyEvent)
  },
  mounted() {
    this.$bus.$emit('getAllPlugins', this.getAllPlugins)
  },
  beforeDestroy() {
    this.uploadingData = false
    // $(document).off('keydown', this.keyEvent)
  },
  methods: {
    handleDreverTypeChange() {},
    changeProDb() {
      let param = this.formatParams(true)
      param.parameterMap.OfflineDumpTargetDBName = this.OfflineDumpTargetDBName
      this.getDbName(param)
    },
    keyEvent(e) {
      if (e.keyCode === 46 && e.ctrlKey) {
        this.testCustomJson = !this.testCustomJson
      }
    },
    // 获取所有配置项
    getAllPlugins() {
      this.dbTypeArr = this.$allPlugins.map(db => {
        let imageSrc
        let name = ''
        // 缺少 GBASE, ODPS,TABLEAU,Hive
        switch (db.dbType.toLowerCase()) {
          case 'oceanbase-oracle':
            imageSrc = './static/images/database/oracle.png'
            break
          case 'polar-db':
            imageSrc = './static/images/database/postgresql.png'
            break
          case 'mysql':
          case 'oceanbase':
          case 'oracle':
          case 'db2':
          case 'postgresql':
          case 'sqlserver':
          case 'csv':
          case 'es':
          case 'excel':
          case 'greenplum':
          case 'hana':
          case 'hbase':
          case 'mongodb':
          case 'teradata':
          case 'hive':
          case 'impala':
          case 'maxcompute':
            imageSrc = `./static/images/database/${db.dbType.toLowerCase()}.png`
            break
          case 'db2i':
            name = 'db2'
            imageSrc = './static/images/database/db2.png'
            break
          case 'datadictionary':
          case 'datadictionary_logical':
            name = 'excel'
            imageSrc = `./static/images/database/${name}.png`
            break
          default:
            name = 'default'
            imageSrc = `./static/images/database/${name}.png`
            break
        }
        return {
          label: db.dbLabel,
          value: db.dbType,
          imageSrc: imageSrc,
          jdbc: !db.noJdbc,
          customize: db.customize,
        }
      })
      this.jdbcDbArr = this.dbTypeArr.filter(item => {
        return item.jdbc
      })
      this.noSqlArr = this.dbTypeArr.filter(item => {
        return !item.jdbc && !item.customize
      })
      this.metaTypeArr = this.dbTypeArr.filter(item => {
        return item.customize && !item.jdbc
      })
      console.log(this.noSqlArr, this.metaTypeArr)
    },
    // 处理必填
    itemRequired(item) {
      if (
        this.customConnection === true &&
        (item.code === 'DatabaseName' || item.code === 'connectMode')
      ) {
        return false
      }
      if (this.customConnection === true && item.code === 'connUrl') {
        return true
      } else if (this.testSucceed) {
        if (typeof item.required === 'boolean') {
          return `${item.requiredOnSave}` ? item.requiredOnSave : item.required
        } else {
          if (item.required.notRequiredDbs) {
            if (this.dataSourceType === 'MetaModelDemo') {
              return this.currentServerConfig.options.find(item => item.code === 'AuthenticationType').required
            } else {
              if (item.required.notRequiredDbs.includes(this.dbType)) {
                return false
              }
            }
          }
          if (item.required.edit || item.required.create) {
            return this.isEdit ? item.required.edit : item.required.create
          } else {
            return false
          }
        }
      } else {
        if (typeof item.required === 'boolean') {
          return item.required
        } else {
          if (item.required.notRequiredDbs) {
            if (this.dataSourceType === 'MetaModelDemo') {
              return this.currentServerConfig.options.find(item => item.code === 'AuthenticationType').required
            } else {
              if (item.required.notRequiredDbs.includes(this.dbType)) {
                return false
              }
            }
          }
          if (item.required.edit || item.required.create) {
            return this.isEdit ? item.required.edit : item.required.create
          } else {
            return false
          }
        }
      }
    },
    // 查询推荐数据库版本
    getVersion() {
      this.$http.post(this.$url + '/suggest/version/getList').then(res => {
        let str = this.$t('meta.dataSource.edit.dbsVersion')
        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach(r => {
            // str += r.displayName + '：' + r.versionSuggest + '\n'
            if (!r.includes('Elasticsearch') && !r.includes('MongoDB')) {
              str += r + '\n'
            }
          })
        } else {
          str = this.$t('meta.dataSource.edit.noVersion')
        }
        this.dbsVersion = str
      })
    },
    handleSslChange(val) {
      this.tempForm.KeyStorePath = ''
      this.tempForm.KeyStorePass = ''
    },
    // new start
    // 获取数据源详情
    /* getDetails() {
      this.$http
        .get(this.$meta_url + `/service/models/${this.dsform.id}/plain`)
        .then(res => {
          if (res.data.owner) {
            this.$set(this.tempForm, 'owner', res.data.owner)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, */
    getCategoryName(val) {
      this.$userModelCategoryDetail.forEach(item => {
        if (item.categoryId === val) {
          this.tempForm.categoryName = item.categoryName
          this.tempForm.categoryAbbreviation = item.categoryAbbreviation
        }
      })
      this.categoryId = val
      this.modelCategoryId = val
    },
    changeCategory() {
      this.dialogChangeidVisible = true
      this.categoryIdChanged = this.tempForm.categoryId
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
          this.tempForm.categoryId = this.categoryIdChanged
          this.categoryId = this.categoryIdChanged
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 根据文件ID获取文件信息
    getFileInfo(fileOption) {
      if (`${this.jdbcDs.parameterMap.AuthenticationType}` === '1') {
        let KeyTabPath = this.tempForm.KeyTabPath
        let Krb5Path = this.tempForm.Krb5Path
        // 获取keytab文件
        this.$http
          .post(this.$url + `/files/getFilesInfo?fileIds=${KeyTabPath}`)
          .then(res => {
            let tempFileList = []
            res.data.forEach(item => {
              let obj = {
                name: item.fileName,
                ...item,
              }
              tempFileList.push(obj)
            })
            this.keytabList = tempFileList
          })
        // 获取krb5文件
        this.$http
          .post(this.$url + `/files/getFilesInfo?fileIds=${Krb5Path}`)
          .then(res => {
            let tempFileList = []
            res.data.forEach(item => {
              let obj = {
                name: item.fileName,
                ...item,
              }
              tempFileList.push(obj)
            })
            this.krb5List = tempFileList
          })
      }
      if (fileOption) {
        // 获取其他文件
        this[fileOption.code + 'List'] = []
        if (!this.jdbcDs.parameterMap[fileOption.code]) return
        this.$http
          .post(
            this.$url +
              `/files/getFilesInfo?fileIds=${
                this.jdbcDs.parameterMap[fileOption.code]
              }`
          )
          .then(res => {
            let tempFileList = []
            res.data.forEach(item => {
              let obj = {
                name: item.fileName,
                ...item,
              }
              tempFileList.push(obj)
            })
            this[fileOption.code + 'List'] = tempFileList
          })
      }
    },
    judgeFileList(code) {
      if (!this[code + 'List']) {
        this[code + 'List'] = []
      }
      return this[code + 'List']
    },

    // 重置表单项
    resetForm(value) {
      this.testSucceed = false
    },
    // 初始化参数结构
    initDsform(options, curdb) {
      this.tempForm = {}
      let dbOptions = options || this.dbOptions
      if (!dbOptions?.length) return
      dbOptions.forEach(db => {
        this.$set(this.tempForm, db.code, '')
        if (this.isEdit) {
          if (Array.isArray(db.candidate) || db.multiple) {
            let setVal = db.multiple
              ? this.jdbcDs.parameterMap[db.code]?.split(';')
              : this.jdbcDs.parameterMap[db.code]
            this.jdbcDs.parameterMap[db.code]?.length &&
              this.$set(this.tempForm, db.code, setVal)
            if (!this.jdbcDs.parameterMap[db.code]) {
              this.$set(this.tempForm, db.code, db.defaultValue)
            }
          } else {
            this.$set(
              this.tempForm,
              db.code,
              this.jdbcDs[db.code] ||
                this.jdbcDs.parameterMap[db.code] ||
                db.defaultValue
            )
          }
        } else {
          if (JSON.stringify(db.defaultValue)) {
            this.$set(this.tempForm, db.code, db.defaultValue)
          }
        }
      })
      if (this.isEdit) {
        // this.$set(this.tempForm, 'sourceName', this.jdbcDs.sourceName)
        this.sourceName = this.jdbcDs.sourceName
        this.categoryId = this.jdbcDs.categoryId
        this.$set(this.tempForm, 'driverId', this.jdbcDs.driverId)
        this.$set(
          this.tempForm,
          'AuthenticationType',
          `${this.jdbcDs.parameterMap.AuthenticationType}`
        )
        // 处理 oracle
        if (this.jdbcDs.type === 'ORACLE') {
          this.$set(
            this.tempForm,
            'connectMode',
            this.jdbcDs.parameterMap.DatabaseName.split(':')[0]
          )
          this.$set(
            this.tempForm,
            'DatabaseName',
            this.jdbcDs.parameterMap.DatabaseName.split(':')[1]
          )
        }

        // 处理离线库
        if (this.jdbcDs.type === 'OFFLINEDUMP') {
          let curDb =
            curdb || this.jdbcDs.parameterMap.OfflineDumpSourceDriverType
          this.getDriverType(curDb)
          this.$set(this.tempForm, 'OfflineDumpSourceDriverType', curDb)
          if (curDb === 'ORACLE') {
            if (this.jdbcDs.parameterMap.DatabaseName.includes(':')) {
              this.$set(
                this.tempForm,
                'connectMode',
                this.jdbcDs.parameterMap.DatabaseName.split(':')[0]
              )
              this.$set(
                this.tempForm,
                'DatabaseName',
                this.jdbcDs.parameterMap.DatabaseName.split(':')[1]
              )
            }
          }
          this.OfflineDumpTargetDBName =
            this.jdbcDs.parameterMap.OfflineDumpTargetDBName
          this.OfflineProSchema =
            this.jdbcDs.parameterMap.SelectedSchemas.split(';')
        }
        if (this.dbType === 'CUSTOMIZED') {
          if (
            this.jdbcDs.parameterMap.DatabaseName &&
            this.jdbcDs.parameterMap.SelectedSchemas
          ) {
            this.$set(this.tempForm, 'useCustomedDbTyeTarget', 'database')
          } else if (this.jdbcDs.parameterMap.DatabaseName) {
            this.$set(this.tempForm, 'useCustomedDbTyeTarget', 'database')
          } else if (this.jdbcDs.parameterMap.SelectedSchemas) {
            this.$set(this.tempForm, 'useCustomedDbTyeTarget', 'schema')
          } else {
            this.$set(this.tempForm, 'useCustomedDbTyeTarget', 'database')
          }
        }
        this.oriTempForm = _.cloneDeep(this.tempForm)
        this.$set(this.oriTempForm, 'driverId', this.jdbcDs.driverId)
      } else {
        if (this.dbType === 'OFFLINEDUMP') {
          curdb && this.getDriverType(curdb)
          curdb &&
            this.$set(this.tempForm, 'OfflineDumpSourceDriverType', curdb)
        }
      }
    },
    changeOfflineDumpSourceType(value) {
      const tempJson = _.cloneDeep(
        this.$allPlugins.filter(r => {
          return r.dbType === 'OFFLINEDUMP'
        })[0]
      )
      tempJson.options.filter(r => {
        return r.code === 'OfflineDumpSourceDriverType'
      })[0].defaultValue = value
      tempJson.options.splice(1, 0, ...this['$offline_' + value].options)
      this.currentServerConfig = tempJson
      this.webDbConfig = sctw.convert(tempJson)
      this.dbOptions = this.webDbConfig.options
      this.initDsform(this.dbOptions, value)
    },

    // 自定义json ctrl + delete
    changeCustomJson(json) {
      const tempJson = typeof json === 'string' ? JSON.parse(json) : json
      this.oriJson = _.cloneDeep(tempJson)
      // !this.useOfflineDs && this.isJDBC(tempJson.dbType)
      this.dataSourceType === 'SQL' &&
        !this.useOfflineDs &&
        this.getDriverType(tempJson.dbType)

      this.dbType = tempJson.dbType
      if (tempJson.dbType === 'CUSTOMIZED') {
        this.customConnection = true
      }
      this.useOfflineDs =
        tempJson.dbType === 'OFFLINEDUMP' ||
        tempJson.dbType === 'OFFLINEDUMP_RAW'
      this.isOfflineEx = tempJson.dbType === 'OFFLINEDUMP_RAW'
      if (tempJson.dbType === 'OFFLINEDUMP_RAW') {
        // this.isJDBC(tempJson.dbType)
        this.getDriverType('MYSQL')
      }
      if (tempJson.dbType === 'OFFLINEDUMP') {
        let driverTypeJson = tempJson.options.filter(to => {
          return to.code === 'OfflineDumpSourceDriverType'
        })[0]
        // this.isJDBC(tempJson.dbType)
        this.getDriverType(driverTypeJson.defaultValue)
        driverTypeJson.candidate.forEach(sc => {
          if (driverTypeJson.defaultValue === sc.value) {
            tempJson.options.splice(1, 0, ...sc.options)
          }
        })
      }
      this.currentServerConfig = tempJson
      this.webDbConfig = sctw.convert(tempJson)
      this.dbOptions = this.webDbConfig.options
      this.initDsform(tempJson.options)
    },
    // 切换数据库
    dbTypeWrapSelected(value) {
      if (!value) {
        this.sourceName = ''
        this.categoryId = ''
        this.dbOptions = []
        return
      }
      // 获取当前数据库表单配置项
      this.useOfflineDs = value === 'OFFLINEDUMP' || value === 'OFFLINEDUMP_RAW'
      this.isOfflineEx = value === 'OFFLINEDUMP_RAW'
      this.webDbConfig = []
      if (value === 'CUSTOMIZED') {
        this.customConnection = true
      }
      this.$allPlugins.forEach(db => {
        if (db.dbType === value) {
          if (value === 'OFFLINEDUMP_RAW') {
            // this.isJDBC(value)
            this.getDriverType('MYSQL')
          }
          if (value === 'OFFLINEDUMP') {
            const tempJson = _.cloneDeep(db)
            this.oriJson = _.cloneDeep(tempJson)
            // this.isJDBC(value)
            let defaultVal = db.options[0].defaultValue
            if (this.isEdit) {
              defaultVal = this.jdbcDs.parameterMap.OfflineDumpSourceDriverType
              // tempJson.options[0].defaultValue = defaultVal
              tempJson.options.filter(r => {
                return r.code === 'OfflineDumpSourceDriverType'
              })[0].defaultValue = defaultVal
            }

            this.getDriverType(defaultVal)
            tempJson.options.splice(
              1,
              0,
              ...this['$offline_' + defaultVal].options
            )
            this.currentServerConfig = tempJson
            this.webDbConfig = sctw.convert(tempJson)
          } else {
            this.currentServerConfig = db
            this.webDbConfig = sctw.convert(db)
          }
          this.dataBaseNames = []
          this.dbOptions = this.webDbConfig.options
          if (this.isEdit) {
            this.customConnection = !!this.jdbcDs.connUrl
          }
          // 初始化参数结构
          this.initDsform()
          if (this.isEdit) {
            if (`${this.jdbcDs.parameterMap.AuthenticationType}` === '1') {
              this.getFileInfo()
            }
            this.currentServerConfig.options.forEach(o => {
              if (o.accept) {
                this.getFileInfo(o)
              }
            })
          }
          // 重置表单项
          this.resetForm(value)
          // 获取驱动列表
          !this.useOfflineDs &&
            (this.jdbcDs.jdbc === true || this.dataSourceType === 'SQL') &&
            this.getDriverType(value)
        }
      })
      // this.dbOptions = this.webDbConfig.options
    },
    // 自定义库--目标类型
    changeTargetVal(val) {},
    // 后端模板配置的必填项是否有空
    handleServerConfigHasEmpty(isTest) {
      const filterItem = ['AuthenticationType', 'HostServer', 'PortNumber']
      return this.currentServerConfig?.options?.some(option => {
        if (isTest) {
          const empty = this.judgeServerRequired(option)
          return !filterItem.includes(option.code) && option.required && empty
        } else {
          const empty = this.judgeServerRequired(option)
          return (
            !filterItem.includes(option.code) &&
            (`${option.requiredOnSave}`
              ? option.requiredOnSave
              : option.required) &&
            empty
          )
        }
      })
    },
    judgeServerRequired(option) {
      let empty = false
      if (option.if) {
        empty =
          this.tempForm[option.if.parentCode] === option.if.targetValue &&
          (!this.tempForm[option.code] ||
            (Array.isArray(this.tempForm[option.code]) &&
              !this.tempForm[option.code].length))
      } else {
        empty =
          !this.tempForm[option.code] ||
          (Array.isArray(this.tempForm[option.code]) &&
            !this.tempForm[option.code].length)
      }
      return empty
    },
    judgeWebRequired(code) {
      console.log(code)
      const codeItem = this.webDbConfig.options.filter(webCon => {
        return webCon.code === code
      })[0]
      if (codeItem && codeItem.required.notRequiredDbs) {
        if (this.dataSourceType === 'MetaModelDemo') {
          return this.currentServerConfig.options.find(item => item.code === 'AuthenticationType').required
        } else {
          if (
            codeItem.required.notRequiredDbs.includes(
              this.currentServerConfig.dbType
            )
          ) {
            return false
          } else {
            return codeItem.required
          }
        }
      }
      return codeItem?.required
    },
    handleWebConfigHasEmpty(isTest) {
      return !!(
        (`${this.tempForm.AuthenticationType}` === '1' &&
          ((this.judgeWebRequired('ServicePrincipal')
            ? !this.tempForm.ServicePrincipal
            : false) ||
            !this.tempForm.Krb5Path ||
            (this.currentServerConfig.dbType === 'IMPALA' &&
              !this.tempForm.KeyTabPath))) ||
        (`${this.tempForm.AuthenticationType}` === '0' &&
          (!this.isEdit || (this.isEdit && isTest)) &&
          (this.judgeWebRequired('password')
            ? !this.tempForm.user || !this.tempForm.password
            : false)) ||
        (this.customConnection === false &&
          ((!this.tempForm.HostServer && this.currentServerConfig.options.find(item => item.code === 'HostServer')?.required) ||
            (this.hasPortNumber && !this.tempForm.PortNumber && this.currentServerConfig.options.find(item => item.code === 'PortNumber')?.required))) ||
        (this.customConnection === true && !this.tempForm.connUrl) ||
        (this.currentServerConfig.dbType === 'ORACLE' &&
          !this.tempForm.DatabaseName)
      )
    },
    // 提示未填写项目
    unFillTips(isTest) {
      // web
      if (!isTest && !this.sourceName) {
        return this.$t('meta.dataSource.edit.fillDataSourceName')
      }
      if (!isTest && !this.categoryId) {
        return this.$t('quality.page.qualityExamineJob.selectSystem')
      }
      if (!isTest && !this.categoryId) {
        return '请选择所属系统'
      }
      if (this.dataSourceType === 'SQL' && !this.tempForm.driverId) {
        return this.$t('meta.dataSource.edit.selDriver')
      }
      if (`${this.tempForm.AuthenticationType}` === '1') {
        if (
          this.judgeWebRequired('ServicePrincipal') &&
          !this.tempForm.ServicePrincipal
        ) {
          return this.$t('meta.dataSource.edit.fillServerRule')
        }
        if (
          this.currentServerConfig.dbType === 'IMPALA' &&
          !this.tempForm.KeyTabPath
        ) {
          return this.$t('meta.dataSource.edit.uploadkeytab')
        }
        if (!this.tempForm.Krb5Path) {
          return this.$t('meta.dataSource.edit.uploadkrb5')
        }
      } else if (`${this.tempForm.AuthenticationType}` === '0') {
        if (!this.isEdit || (this.isEdit && isTest)) {
          if (this.judgeWebRequired('password') && !this.tempForm.user) {
            return this.$t('meta.dataSource.edit.fillUsername1')
          }
          if (this.judgeWebRequired('password') && !this.tempForm.password) {
            return this.$t('meta.dataSource.edit.fillPassword1')
          }
        }
      }
      if (this.customConnection === false) {
        if (!this.tempForm.HostServer && this.currentServerConfig.options.find(item => item.code === 'HostServer').required) {
          return this.$t('meta.dataSource.edit.fillServerName')
        } else if (this.hasPortNumber && !this.tempForm.PortNumber && this.currentServerConfig.options.find(item => item.code === 'PortNumber').required) {
          return this.$t('meta.dataSource.edit.fillPortNum')
        }
      } else if (this.customConnection === true) {
        if (!this.tempForm.connUrl) {
          return this.$t('meta.dataSource.fillConString')
        }
      }
      if (
        this.currentServerConfig.dbType === 'ORACLE' &&
        !this.tempForm.DatabaseName
      ) {
        return this.$t('meta.dataSource.edit.fillSIDOrServiceName')
      }
      // server
      let options = this.currentServerConfig.options.filter(item => {
        return (
          item.code !== 'HostServer' &&
          item.code !== 'PortNumber' &&
          item.code !== 'AuthenticationType'
        )
      })
      for (let i = 0; i < options.length; i++) {
        let msg = ''
        let oi = options[i]
        if (isTest) {
          if (oi.required && !this.tempForm[oi.code]) {
            msg =
              oi.code === 'DatabaseName'
                ? this.$t('meta.dataSource.edit.fillProDbtype')
                : oi.code === 'SelectedSchemas'
                ? this.$t('meta.dataSource.edit.fillProSchema')
                : oi.label
          }
          return msg
        } else {
          if (
            oi.requiredOnSave &&
            (!this.tempForm[oi.code] || !this.tempForm[oi.code].length)
          ) {
            msg =
              oi.code === 'DatabaseName'
                ? this.$t('meta.dataSource.edit.fillProDbtype')
                : oi.code === 'SelectedSchemas'
                ? this.$t('meta.dataSource.edit.fillProSchema')
                : this.$t('meta.dataSource.edit.pleaseFill') + oi.label
            return msg
          }
        }
      }
      return ''
    },
    // 测试及保存入参组合
    formatParams(isTest) {
      const ds = this.tempForm
      let obj = {
        driverId: ds.driverId || '',
        sourceName: this.sourceName,
        type: this.dbType,
        categoryId: this.categoryId,
        parameterMap: {},
      }
      // if (this.dataSourceType === 'MetaModelDemo')
      //   return { ...obj, customize: true, id: this.sourceId }
      this.currentServerConfig.options.forEach(o => {
        if (o.code !== 'HostServer' && o.code !== 'connectMode') {
          if (Array.isArray(ds[o.code])) {
            obj.parameterMap[o.code] = ds[o.code].join(';')
          } else {
            obj.parameterMap[o.code] = ds[o.code]
          }
        }
      })
      if (`${ds.AuthenticationType}` === '0') {
        if (ds.password) {
          const { JSEncrypt } = require('../../../static/js/jsencrypt2.min')
          const pubkey =
            'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAn70F4s96vF0liGogI+cX63bqvYe0/V6gVgJ1Ftqpl1s5CaGhILY0As9vvZOeMq4jsl5tIhRF3poglmAm+waWKeAFk3ExZ5eJ7JMzM+daHIPDNWSAMONlEiX+DfhcoHruKlLlbcub1N8+6wiC+wVPPA8x1AkiC1t0kteQaGEP1Ek+Dd9oRd1YTSdmy7vIheOWM26DkgvLyQFdTCW4owkEhUREbrwvxYfTwEDoXy2Xdc3kfP6EKuo3whhnoOn4jGKAzb4reDZ0bXWGe2STSgF1WlGI+lrgDtZ7iNFuFqfzOD9kuyA2imLaFslO2Ky6OXqfq/KIu723c49pACxF2rMwIDAQAB'
          const crypt = new JSEncrypt({ default_key_size: 2048 })
          crypt.setPublicKey(pubkey)
          const password = crypt.encrypt(ds.password)
          // const password = this.$pwEncrypt(ds.password)
          obj.credentialInfo = {
            password: password,
            user: ds.user,
          }
        } else {
          obj.credentialInfo = null
        }
      } else {
        obj.credentialInfo = null
        obj.parameterMap.ServicePrincipal = ds.ServicePrincipal
        obj.parameterMap.UserPrincipal = ds.UserPrincipal
        obj.parameterMap.KeyTabPath = ds.KeyTabPath
        obj.parameterMap.Krb5Path = ds.Krb5Path
      }
      if (this.customConnection) {
        obj.connUrl = ds.connUrl
        obj.parameterMap.HostServer = ''
        obj.parameterMap.PortNumber = ''
      } else {
        obj.parameterMap.HostServer = ds.HostServer
        obj.parameterMap.PortNumber = ds.PortNumber
      }
      // 处理oracle的 DatabaseName
      if (ds.connectMode) {
        if (ds.connectMode === 'SID' || ds.connectMode === 'Service Name') {
          obj.parameterMap.DatabaseName = ds.connectMode + ':' + ds.DatabaseName
        }
      }
      // 处理离线库参数
      if (!isTest && this.useOfflineDs) {
        obj.parameterMap.SelectedSchemas = this.OfflineProSchema.join(';')
      }
      if (this.dbType === 'OFFLINEDUMP_RAW') {
        obj.realType = 'MYSQL'
        obj.parameterMap.OfflineDumpSourceDriverType =
          this.tempForm.OfflineDumpSourceDriverType
      }
      if (this.isEdit && !isTest) {
        obj.id = this.jdbcDs.id
        if (!ds.password && !ds.user) {
          obj.credentialInfo = null
        }
      }
      if (this.isEdit && !this.judgeWebRequired('password') && !isTest) {
      }
      if (
        (!this.isEdit || (this.isEdit && isTest)) &&
        !this.judgeWebRequired('password')
      ) {
        const { JSEncrypt } = require('../../../static/js/jsencrypt2.min')
        const pubkey =
          'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAn70F4s96vF0liGogI+cX63bqvYe0/V6gVgJ1Ftqpl1s5CaGhILY0As9vvZOeMq4jsl5tIhRF3poglmAm+waWKeAFk3ExZ5eJ7JMzM+daHIPDNWSAMONlEiX+DfhcoHruKlLlbcub1N8+6wiC+wVPPA8x1AkiC1t0kteQaGEP1Ek+Dd9oRd1YTSdmy7vIheOWM26DkgvLyQFdTCW4owkEhUREbrwvxYfTwEDoXy2Xdc3kfP6EKuo3whhnoOn4jGKAzb4reDZ0bXWGe2STSgF1WlGI+lrgDtZ7iNFuFqfzOD9kuyA2imLaFslO2Ky6OXqfq/KIu723c49pACxF2rMwIDAQAB'
        const crypt = new JSEncrypt({ default_key_size: 2048 })
        crypt.setPublicKey(pubkey)
        const password = crypt.encrypt(ds.password)
        // const password = this.$pwEncrypt(ds.password)
        obj.credentialInfo = {
          password: password,
          user: ds.user,
        }
      }
      // 处理custom 自定义库参数
      if (this.dbType === 'CUSTOMIZED') {
        if (this.tempForm.useCustomedDbTyeTarget === 'database') {
          obj.parameterMap.SelectedSchemas = null
        } else {
          obj.parameterMap.DatabaseName = null
        }
      }
      return obj
    },
    // 判断必填项
    checkIsOk(isTest) {
      let hasEmpty = false
      if (
        this.handleServerConfigHasEmpty(isTest) ||
        this.handleWebConfigHasEmpty(isTest)
      ) {
        hasEmpty = true
      }
      let hasSystem = false
      if (isTest) {
        hasSystem = true
      } else {
        hasSystem = !!this.categoryId
      }
      return (
        hasSystem &&
        (this.dataSourceType === 'SQL' ? this.tempForm.driverId : true) &&
        (isTest ? !hasEmpty : !hasEmpty && this.sourceName)
      )
    },
    // test 测试数据源
    testDataSource({ hideMsg } = {}) {
      const isOk = this.checkIsOk(true)
      if (!isOk) {
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message:
            this.$t('meta.dataSource.edit.msgIncomplete') +
            '，' +
            this.unFillTips(true),
        })
        return
      }
      this.disableTest = true
      const param = this.formatParams(true)
      if (this.useOfflineDs) {
        this.OfflineDumpTargetDBName &&
          this.$set(
            param.parameterMap,
            'OfflineDumpTargetDBName',
            this.OfflineDumpTargetDBName
          )
      }
      if (!param) {
        this.disableTest = false
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        return
      }
      let url = this.$url + '/datasources/testConnectionInfo'
      this.$http
        .post(url, param)
        .then(res => {
          this.testSucceed = true
          this.disableTest = false
          // 调用查询dbs或者schema逻辑
          this.handleTestThen(param)
        })
        .catch(e => {
          this.testSucceed = false
          this.disableTest = false
          this.$showFailure(e)
        })
    },
    handleTestThen(param) {
      const self = this
      // test
      // get schema
      // get dbname

      // 逻辑: 需要 schema , 先 get schema, 然后get dbname
      //       没有 schema, 需要 dbname ,  get dbname ,
      //       其他, 仅测试
      const handleTestSuccess = () => {
        this.testSucceed = true
        self.showSuccess(this.$t('meta.dataSource.edit.datasourceTestSucceed'))
        this.disableTest = false
        /* if (this.useOfflineDs && this.typeSelectWraper === 'OFFLINEDUMP') {
          // 处理编辑情况，测试成功查询生产schema list
          if (this.OfflineDumpTargetDBName) {
            this.offlineDbChange2(this.OfflineDumpTargetDBName)
          }
        } */
      }
      const handleTestFailure = () => {
        this.testSucceed = false
        this.disableTest = false
      }
      if (this.hasSchema && !this.useCustomedDbTye) {
        self.getSchemas(
          param,
          () => {
            handleTestSuccess()
            if (this.showDbName) {
              this.getDbName(param)
            }
          },
          handleTestFailure
        )
        // } else if (this.showDbName && !this.useCustomedDbTye) {
      } else if (this.showDbName && !this.useCustomedDbTye) {
        this.getDbName(
          param,
          () => {
            handleTestSuccess()
          },
          handleTestFailure
        )
      } else {
        if (this.useCustomedDbTye) {
          this.getDbName(param)
          this.getSchemas(param)
        }
      }
    },
    // schema change
    offlineSchemaChange(value) {
      if (value) {
        const json = this.formatParams(this.tempForm, true)
        // this.getOfflineTable(json)
      }
    },
    // 查询离线生产库
    getOfflineTable(para) {
      this.$http
        .post(`${this.$url}/datasources/models/re/tbs`, para)
        .then(res => {
          const offlineInstancesArr = res.data.split(';').filter(item => !!item)
          this.offlineInstancesArr = offlineInstancesArr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setValueNull(val) {
      this.OfflineDumpTargetDBName = ''
      this.OfflineProSchema = []
      this.OfflineProSchema = []
      this.offlineSchemasArr = []
    },
    /* offlineDbChange(value) {
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
    // 生产schema 赋值
    offlineDbChange2(value) {
      this.OfflineProSchema = ''
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
          const offlineSchemasArr = res.data.split(';').filter(item => !!item)
          this.offlineSchemasArr = offlineSchemasArr
          this.OfflineProSchema = _.cloneDeep(this.schemaSelected)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, */
    getDbName(json, successcallback, failureCallback) {
      this.$http
        .post(this.$url + '/datasources/getDatabases', json)
        .then(res => {
          successcallback && successcallback()
          if (this.useOfflineDs) {
            if (
              this.tempForm.DatabaseName.length &&
              !this.OfflineDumpTargetDBName
            ) {
              this.offlineInstancesArr = res.data
            } else if (this.OfflineDumpTargetDBName) {
              this.offlineSchemasArr = res.data
            } else {
              this.dataBaseNames = res.data
            }
          } else {
            this.dataBaseNames = res.data
          }
          this.disableTest = false
          /* if (this.useOfflineDs) {
            this.offlineDbChange(this.dsform.dbname)
          } */
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
        })
    },
    reNextStepCheck() {
      const isOk = this.checkIsOk(false)
      if (!isOk) {
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message:
            this.$t('meta.dataSource.edit.msgIncomplete') +
            '，' +
            this.unFillTips(false),
        })
      }
      return isOk
    },
    addDataSource() {
      // 判断表单项是否填完整
      console.log('add data source')
      let isOk =
        this.currentServerConfig.customize ? this.checkIsOk(false) : this.checkIsOk(false)
      console.log(isOk)
      if (!isOk) {
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message:
            this.$t('meta.dataSource.edit.msgIncomplete') +
            '，' +
            this.unFillTips(false),
        })
        this.$emit('getSaveState', false)
        return
      }
      this.postAdd()
    },
    postAdd() {
      if (
        this.isEdit &&
        !this.currentServerConfig.customize &&
        !this.testSucceed &&
        JSON.stringify(this.tempForm) !== JSON.stringify(this.oriTempForm)
      ) {
        this.$datablauMessage({
          message: this.$t('meta.dataSource.edit.updateAboutDbsConfirm'),
          type: 'warning',
          duration: 5000,
        })
        return
      }
      let param = this.formatParams(false)
      if (this.currentServerConfig.customize) {
        param.customize = true
        param.isJdbc = false
      }
      if (this.useOfflineDs) {
        this.$set(
          param.parameterMap,
          'OfflineDumpTargetDBName',
          this.OfflineDumpTargetDBName || ''
        )
        this.$set(
          param.parameterMap,
          'SelectedSchemas',
          this.OfflineProSchema.join(';') || ''
        )
      }
      let url = this.isEdit
        ? param.customize
          // ? this.$url + `/datasources/updateSimpleDatasource` // 更新自定义（其他）类型的数据源
          ? this.$url + `/datasources/updateDatasource` // 更新自定义（其他）类型的数据源
          : this.$url + '/datasources/updateDatasource'
        : this.$url + '/datasources/createDatasource'
      this.$http
        .post(url, param)
        .then(res => {
          this.showSuccess(
            this.isEdit
              ? this.$t('meta.dataSource.modifySucceed')
              : this.$t('meta.dataSource.addedSucceed')
          )
          this.$emit('createdJob', res.data)
          this.$emit('getSaveState', false)
        })
        .catch(e => {
          this.$bus.$emit('changeSaveLoading', false)
          this.$emit('getSaveState', false)
          this.$showFailure(e)
        })
    },
    // 获取变更项
    difference(cur, ori) {
      return _.transform(cur, function (result, value, key) {
        if (!_.isEqual(value, ori[key])) {
          result[key] = value
        }
      })
    },
    // 上传文件前
    handleBeforeUpload(file, type, accept) {
      var self = this
      var ds = self.dsform
      var isCorrectFile = false
      if (`${this.tempForm.AuthenticationType}` === '1') {
        isCorrectFile = true
        if (type && accept) {
          if (accept.includes(file.name.split('.')[1])) {
            isCorrectFile = true
          } else {
            isCorrectFile = false
          }
          if (accept === 'all') {
            isCorrectFile = true
          }
        }
      } else if (type && accept) {
        if (accept.includes(file.name.split('.')[1]) || accept === 'all') {
          isCorrectFile = true
        }
      }
      if (!isCorrectFile) {
        this.$message.error(
          this.$t('meta.dataSource.edit.fileTypeIncorrect') +
            (ds.dbtype == 'DATADICTIONARY' ||
            ds.dbtype == 'DATADICTIONARY_LOGICAL'
              ? '.xls, .xlsx'
              : accept || type || ds.dbtype)
        )
      }
      return isCorrectFile
    },
    handleUploadSuccess(res, file, type) {
      const self = this
      if (type) {
        self.tempForm[type] = res.fileId
      } else {
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
      if (type && type === 'keytab') {
        this.keytabList = fileList
        if (fileList.length === 0) {
          // self.KeyTabPath = ''
          self.tempForm.KeyTabPath = ''
        }
      } else if (type && type === 'krb5') {
        this.krb5List = fileList
        if (fileList.length === 0) {
          // self.Krb5Path = ''
          self.tempForm.Krb5Path = ''
        }
      } else if (type) {
        self[type + 'List'] = fileList
        if (fileList.length === 0) {
          self.tempForm[type] = ''
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
    getSchemas(json, successcallback, failureCallback) {
      this.$http
        .post(this.$url + '/datasources/getSchemas', json)
        .then(res => {
          successcallback && successcallback()
          if (res.data) {
            const schemas = res.data
            schemas.sort()
            if (this.useOfflineDs) {
              if (
                this.tempForm.OfflineDumpTargetSchemaName?.length &&
                !this.OfflineDumpTargetSchemaName
              ) {
                this.offlineInstancesArr = res.data
              } else if (this.OfflineDumpTargetDBName) {
                this.offlineSchemasArr = res.data
              } else {
                this.schemas = res.data
              }
            } else {
              this.schemas = res.data
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
        })
    },
    choosedTagChanged(tagIds) {
      this.dsform.TagIds = tagIds
    },
    uploadHandle() {},
    // refreshTest () {
    //   this.testSucceed = false;
    // },

    // 判断工具
    getDriverType(type) {
      this.$set(this.tempForm, 'driverId', '')
      this.driverOptions = []
      this.driverState = false
      if (!type || type === 'OFFLINEDUMP' || type === 'OFFLINEDUMP_RAW') return
      this.$http
        .post(`${this.$url}/drivers/getDriverByType?type=${type}`)
        .then(res => {
          if (res.data.length > 0) {
            this.driverState = true
          } else {
            this.$message.warning(
              this.$t('meta.dataSource.edit.noDriverPackage')
            )
            this.driverState = true
          }
          res.data.forEach(element => {
            element.label = element.driverName
            element.value = element.id
          })
          this.$set(this.tempForm, 'driverId', '')
          if (this.isEdit && this.jdbcDs.driverId) {
            this.$set(this.tempForm, 'driverId', this.jdbcDs.driverId)
          }
          this.driverOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
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
      if (!this.isEdit) {
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
  },
  watch: {
    testSucceed(newVal) {
      this.$emit('testSucceed', newVal)
    },
    jdbcDs: {
      handler: function (newVal) {
        if (newVal) {
          this.dbType = this.jdbcDs.type
          this.dbTypeWrapSelected(this.jdbcDs.type)
        }
      },
      immediate: true,
      deep: true,
    },
    currentServerConfig: {
      handler: function (newVal) {
        if (newVal) {
          const fileTypeArr = this.currentServerConfig?.options?.filter(o => {
            return o.accept
          })
          if (fileTypeArr?.length) {
            // 如果有文件类型配置项，将文件列表初始化到data中
            fileTypeArr.forEach(f => {
              this[f.code + 'List'] = []
            })
          }
        }
      },
      immediate: true,
    },
    webDbConfig: {
      handler: function (newVal) {
        if (newVal && newVal.options) {
          const hasSchema = newVal.options.some(o => {
            return o.code === 'SelectedSchemas'
          })
          const hasDatabase = newVal.options.some(o => {
            return o.code === 'DatabaseName'
          })
          if (hasSchema && newVal.dbType !== 'ORACLE' && !hasDatabase) {
            this.onlySchema = true
          } else {
            this.onlySchema = false
          }
        }
      },
      immediate: true,
    },
    // CUSTOMIZED 测试按钮位置跟随
    'tempForm.useCustomedDbTyeTarget': {
      handler: function (newVal) {
        const TestBtn = _.cloneDeep(
          this.dbOptions.filter(d => d.code === 'TestBtn')[0]
        )
        const TestBtnI = this.dbOptions.findIndex(d => d.code === 'TestBtn')
        if (newVal) {
          if (newVal === 'database') {
            this.dbOptions.splice(TestBtnI, 1)
            this.dbOptions.splice(
              this.dbOptions.findIndex(d => d.code === 'DatabaseName') + 1,
              0,
              TestBtn
            )
          } else if (newVal === 'schema') {
            this.dbOptions.splice(TestBtnI, 1)
            this.dbOptions.splice(
              this.dbOptions.findIndex(d => d.code === 'SelectedSchemas') + 1,
              0,
              TestBtn
            )
          }
        }
      },
      immediate: true,
    },
  },
}
