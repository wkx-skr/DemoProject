import Compare from './compare'
import sctw from './serverConfigToWeb'
export default {
  mixins: [Compare],
  props: ['isEdit', 'jdbcDs'],
  data() {
    return {
      // 参数111111
      upload: '/base/files/upload',
      disableTest: false, // 用于测试按钮loading
      currentServerConfig: {}, // 当前选中数据库的后端配置
      dbTypeArr: [], // 后端返回所有配置中提取的数据库列表
      testCustomJson: false,
      testCustomJsoData: '', // model值
      oriJson: '', // 原始json，为offline_dump提供
      dsform: {
        parameterMap: {},
      }, // 模版表单项结构
      tempForm: {
        sourceName: '', // 数据源名称
        driverId: '', // 驱动
      }, // 页面绑定表单项
      parameterMap: {},
      credentialInfo: {},
      driverState: false,
      dbType: '', // 数据库类型
      dbsVersion: '', // 数据库推荐版本
      customConnectionState: false, // 是否展示自定义连接串
      customConnection: false, // 自定义连接串
      dbLists: [], // 数据库列表
      webDbConfig: [], // 前端配置
      dbOptions: [], // 配置项
      dataSourceType: 'SQL', // 数据源类型 todo 最终以什么形式展示或者不展示
      driverOptions: [],
      dataBaseNames: [], // 数据库选项
      schemas: [], // schema选项
      newFileList: [],
      krb5List: [],
      keytabList: [],
      testSucceed: false,
      // 离线数据源
      useOfflineDs: false,
      offlineDriverTypeArr: [
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'Oracle', value: 'ORACLE' },
      ],
      // OfflineDumpTargetDBName: '', // 生产数据库
      // offlineInstancesArr: [], // 生产数据库
      // OfflineProSchema: '',
      // offlineSchemasArr: [],
    }
  },
  components: {},

  computed: {
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
    disableCommitButton() {
      const dbtype = this.dbtype
      let bool = true
      if (this.isEdit) {
        bool = false
      }
      if (this.testSucceed) {
        bool = false
      }
      if (this.uploadingData) {
        bool = true
      }
      return bool && dbtype !== 'OCEANBASE-ORACLE'
    },
    testBtnDisabled() {
      let bool = false
      return bool
    },
  },
  beforeMount() {
    this.uploadDriUrl = `${this.$url}/service/models/upload`
    if (this.isEdit) {
      // this.getDetails()
    }
  },
  created() {
    this.getAllPlugins()
    this.getVersion()
    // this.dbType = 'MYSQL'
    $(document).on('keydown', this.keyEvent)
  },
  mounted() {
    console.log('jdbcDs', this.jdbcDs)
  },
  beforeDestroy() {
    this.uploadingData = false
    $(document).off('keydown', this.keyEvent)
  },
  methods: {
    keyEvent(e) {
      if (e.keyCode === 46 && e.ctrlKey) {
        this.testCustomJson = !this.testCustomJson
      }
    },
    // 获取所有配置项
    getAllPlugins() {
      this.dbTypeArr = this.$allPlugins.map(db => {
        return {
          label: db.dbLabel,
          value: db.dbType,
        }
      })
    },

    // 处理必填
    itemRequired(item) {
      if (typeof item.required === 'boolean') {
        return item.required
      } else {
        if (item.required.edit || item.required.create) {
          return this.isEdit ? item.required.edit : item.required.create
        } else {
          return false
        }
      }
    },
    // 查询推荐数据库版本
    getVersion() {
      this.$http.get(this.$url + '/service/suggest/versions').then(res => {
        let str = this.$t('meta.dataSource.edit.dbsVersion')
        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach(r => {
            str += r.displayName + '：' + r.versionSuggest + '\n'
          })
        } else {
          str = this.$t('meta.dataSource.edit.noVersion')
        }
        this.dbsVersion = str
      })
    },
    changeReType(val) {},
    // new start
    // 获取数据源详情
    getDetails() {
      this.$http
        .get(this.$url + `/service/models/${this.dsform.id}/plain`)
        .then(res => {
          if (res.data.owner) {
            this.$set(this.tempForm, 'owner', res.data.owner)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /* selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        if (res && Array.isArray(res) && res.length === 1) {
          this.newOwner = res[0].username
          this.afterChangeOwner()
        }
      })
    }, */
    // 根据文件ID获取文件信息
    // zl add
    getFileInfo() {
      let KeyTabPath = this.tempForm.KeyTabPath
      let Krb5Path = this.tempForm.Krb5Path
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
    /* changeOwner() {
      this.showOwnerDialog = true
    },
    handleOwnerNewName(user) {
      this.newOwner = user.name
    }, */
    /* afterChangeOwner() {
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
    }, */
    // 重置表单项
    resetForm(value) {
      this.testSucceed = false
    },
    // 初始化参数结构
    initDsform(options) {
      this.tempForm = {}
      let dbOptions = options || this.dbOptions
      if (!dbOptions?.length) return
      dbOptions.forEach(db => {
        this.$set(this.tempForm, db.code, '')

        if (this.isEdit) {
          if (Array.isArray(db.candidate)) {
            this.jdbcDs.parameterMap[db.code]?.length &&
              this.$set(
                this.tempForm,
                db.code,
                this.jdbcDs.parameterMap[db.code].split(';')
              )
          } else {
            this.$set(
              this.tempForm,
              db.code,
              this.jdbcDs[db.code] || this.jdbcDs.parameterMap[db.code]
            )
          }
          this.$set(this.tempForm, 'sourceName', this.jdbcDs.sourceName)
          this.$set(this.tempForm, 'driverId', this.jdbcDs.driverId)
          this.$set(
            this.tempForm,
            'AuthenticationType',
            this.jdbcDs.parameterMap.AuthenticationType
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
            this.getDriverType(
              this.jdbcDs.parameterMap.OfflineDumpSourceDriverType
            )
            this.$set(
              this.tempForm,
              'OfflineDumpSourceDriverType',
              this.jdbcDs.parameterMap.OfflineDumpSourceDriverType
            )
          }
          console.log('this.tempForm', this.tempForm)
        } else {
          if (JSON.stringify(db.defaultValue)) {
            this.$set(this.tempForm, db.code, db.defaultValue)
          }
        }
      })
    },
    changeOfflineDumpSourceType(value) {
      console.log(333, value)
      const tempJson = _.cloneDeep(this.oriJson)
      let driverTypeJson = tempJson.options.filter(to => {
        return to.code === 'OfflineDumpSourceDriverType'
      })[0]
      driverTypeJson.defaultValue = value
      this.getDriverType(driverTypeJson.defaultValue)
      driverTypeJson.candidate.forEach(sc => {
        if (value === sc.value) {
          tempJson.options.splice(1, 0, ...sc.options)
          this.currentServerConfig = tempJson
          this.webDbConfig = sctw.convert(tempJson)
          this.dbOptions = this.webDbConfig.options
          this.initDsform(tempJson.options)
        }
      })
    },

    // 离线库后端配置处理
    handleOfflineDumpServerConfig() {},
    // 自定义json ctrl + delete
    changeCustomJson(json) {
      const tempJson = typeof json === 'string' ? JSON.parse(json) : json
      this.oriJson = _.cloneDeep(tempJson)
      !this.useOfflineDs && this.getDriverType(tempJson.dbType)
      this.dbType = tempJson.dbType
      if (tempJson.dbType === 'CUSTOMIZED') {
        this.customConnection = true
      }
      this.useOfflineDs =
        tempJson.dbType === 'OFFLINEDUMP' ||
        tempJson.dbType === 'OFFLINEDUMP_RAW'
      if (tempJson.dbType === 'OFFLINEDUMP_RAW') {
        this.isJDBC(tempJson.dbType)
        this.getDriverType('MYSQL')
      }
      if (tempJson.dbType === 'OFFLINEDUMP') {
        let driverTypeJson = tempJson.options.filter(to => {
          return to.code === 'OfflineDumpSourceDriverType'
        })[0]
        this.isJDBC(tempJson.dbType)
        this.getDriverType(driverTypeJson.defaultValue)
        driverTypeJson.candidate.forEach(sc => {
          if (driverTypeJson.defaultValue === sc.value) {
            tempJson.options.splice(1, 0, ...sc.options)
          }
        })
      }
      this.isJDBC(tempJson.dbType)
      this.getDriverType(tempJson.dbType)
      this.currentServerConfig = tempJson
      this.webDbConfig = sctw.convert(tempJson)
      this.dbOptions = this.webDbConfig.options
      this.initDsform(tempJson.options)
    },
    // 切换数据库
    dbTypeWrapSelected(value) {
      console.log('value', value, this.$allPlugins)
      // 获取当前数据库表单配置项
      this.useOfflineDs = value === 'OFFLINEDUMP' || value === 'OFFLINEDUMP_RAW'
      this.webDbConfig = []
      if (value === 'CUSTOMIZED') {
        this.customConnection = true
      }
      this.$allPlugins.forEach(db => {
        if (db.dbType === value) {
          if (value === 'OFFLINEDUMP_RAW') {
            this.isJDBC(value)
            this.getDriverType('MYSQL')
          }
          if (value === 'OFFLINEDUMP') {
            const tempJson = _.cloneDeep(db)
            this.oriJson = _.cloneDeep(tempJson)
            let driverTypeJson = db.options.filter(to => {
              return to.code === 'OfflineDumpSourceDriverType'
            })[0]
            this.isJDBC(value)
            if (this.isEdit) {
              driverTypeJson.defaultValue =
                this.jdbcDs.parameterMap.OfflineDumpSourceDriverType
            }
            console.log('driverTypeJson', driverTypeJson)

            this.getDriverType(driverTypeJson.defaultValue)
            driverTypeJson.candidate.forEach(sc => {
              if (driverTypeJson.defaultValue === sc.value) {
                tempJson.options.splice(1, 0, ...sc.options)
              }
            })
            this.currentServerConfig = tempJson
            this.webDbConfig = sctw.convert(tempJson)
          } else {
            this.currentServerConfig = db
            this.webDbConfig = sctw.convert(db)
          }
          this.dataBaseNames = []
          this.dbOptions = this.webDbConfig.options
          console.log('this.dbOptions', this.dbOptions)
          if (this.isEdit) {
            this.customConnection = !!this.jdbcDs.connUrl
          }
          // 初始化参数结构
          this.initDsform()
          if (this.isEdit) {
            // 处理文件
            if (`${this.jdbcDs.parameterMap.AuthenticationType}` === '1') {
              this.getFileInfo()
            }
          }
          // 重置表单项
          this.resetForm(value)
          // 自定义连接串是否可用
          !this.useOfflineDs && this.isJDBC(value)
          // 获取驱动列表
          !this.useOfflineDs && this.getDriverType(value)
        }
      })
      this.dbOptions = this.webDbConfig.options
    },
    // 自定义连接串是否可用
    isJDBC(value) {
      this.$http
        .get(this.$url + `/service/driver/isJdbc?type=${value}`)
        .then(res => {
          this.customConnectionState = res.data
          if (!this.customConnectionState) {
            this.driverState = false
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 后端模板配置的必填项是否有空
    handleServerConfigHasEmpty() {
      console.log('必填', this.currentServerConfig)
      return this.currentServerConfig?.options?.some(option => {
        return (
          option.code !== 'AuthenticationType' &&
          option.code !== 'HostServer' &&
          option.code !== 'PortNumber' &&
          option.required &&
          !this.tempForm[option.code]
        )
      })
    },
    handleWebConfigHasEmpty(isTest) {
      // 授权方式关联 + 自定义连接串关联
      console.log('hasPortNumber', this.hasPortNumber)
      return !!(
        (`${this.tempForm.AuthenticationType}` === '1' &&
          (!this.tempForm.ServicePrincipal || !this.tempForm.Krb5Path)) ||
        (`${this.tempForm.AuthenticationType}` === '0' &&
          (!this.isEdit || (this.isEdit && isTest)) &&
          (!this.tempForm.user || !this.tempForm.password)) ||
        (this.customConnection === false &&
          (!this.tempForm.HostServer ||
            (this.hasPortNumber && !this.tempForm.PortNumber))) ||
        (this.customConnection === true && !this.tempForm.connUrl) ||
        (this.currentServerConfig.dbType === 'ORACLE' &&
          !this.tempForm.DatabaseName)
      )
    },
    formatParams(isTest) {
      const ds = this.tempForm
      console.log('1111', ds, isTest)
      let obj = {
        // connectType: 'JDBC',
        driverId: ds.driverId || '',
        sourceName: ds.sourceName,
        type: this.dbType,
        parameterMap: {},
      }
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
        obj.credentialInfo = {
          password: ds.password,
          user: ds.user,
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
        if (ds.connectMode === 'SID') {
          obj.parameterMap.DatabaseName = 'SID:' + ds.DatabaseName
        } else if (ds.connectMode === 'Service Name') {
          obj.parameterMap.DatabaseName = 'Service Name:' + ds.DatabaseName
        }
      }
      // 处理离线库参数
      if (!isTest && this.useOfflineDs) {
        obj.parameterMap.OfflineDumpTargetSchemaName =
          this.OfflineDumpTargetSchemaName
      }
      if (this.dbType === 'OFFLINEDUMP_RAW') {
        obj.realType = 'MYSQL'
        obj.parameterMap.OfflineDumpSourceDriverType = 'MYSQL'
      }
      if (this.isEdit) {
        obj.id = this.jdbcDs.id
      }
      return obj
    },
    // 判断必填项
    checkIsOk(isTest) {
      let hasEmpty = false
      if (
        this.handleServerConfigHasEmpty() ||
        this.handleWebConfigHasEmpty(isTest)
      ) {
        hasEmpty = true
      }
      console.log(
        'test',
        this.handleServerConfigHasEmpty(),
        this.handleWebConfigHasEmpty(),
        this.tempForm,
        this.customConnection
      )
      return (
        this.tempForm.driverId &&
        (isTest ? !hasEmpty : !hasEmpty && this.tempForm.sourceName)
      )
    },
    // test 测试数据源
    testDataSource({ hideMsg } = {}) {
      const isOk = this.checkIsOk(true)
      if (!isOk) {
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        return
      }
      this.disableTest = true
      const param = this.formatParams(true)
      if (!param) {
        this.disableTest = false
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        return
      }
      let url = '/base/datasources/testConnectionInfo'
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
      // if (this.hasSchema && !this.useCustomedDbTye) {
      if (this.hasSchema) {
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
      } else if (this.showDbName) {
        this.getDbName(
          param,
          () => {
            handleTestSuccess()
          },
          handleTestFailure
        )
      } else {
        console.log('类型为：CUSTOMIZED')
        if (this.dsform.dbtype === 'CUSTOMIZED') {
          param.driverId = this.dsform.driverId
        }
        self.$http
          .post(url, param)
          .then(res => {
            handleTestSuccess()
            if (this.useCustomedDbTye) {
              this.getDbName(param)
              this.getSchemas(param)
            }
          })
          .catch(e => {
            this.$showFailure(e)
            handleTestFailure()
          })
      }
    },
    /* getFormatPara() {
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
    }, */
    // schema change
    offlineSchemaChange(value) {
      if (value) {
        const json = this.formatParams(this.tempForm, true)
        this.getOfflineTable(json)
      }
    },
    // 查询离线生产库
    getOfflineTable(para) {
      this.$http
        .post(`/base/datasources/models/re/tbs`, para)
        .then(res => {
          const offlineInstancesArr = res.data.split(';').filter(item => !!item)
          this.offlineInstancesArr = offlineInstancesArr
          // console.log(this.offlineInstancesArr, 'offlineInstancesArr')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /*
    setValueNull(val) {
      this.offlineDbChange(this.setValueNullName)
    }, */
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
        .post('/base/datasources/getDatabases', json)
        .then(res => {
          console.log('getDatabases', res.data)
          successcallback && successcallback()
          this.dataBaseNames = res.data
          this.disableTest = false
          /* if (this.useOfflineDs) {
            this.offlineDbChange(this.dsform.dbname)
          } */

          // todo 是否需要
          /* if (!this.dsEditing && !this.dsform.dbname) {
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
          } */
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
        })
    },
    addDataSource() {
      // 判断表单项是否填完整
      const isOk = this.checkIsOk(false)
      if (!isOk) {
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        return
      }
      let param = this.formatParams(false)
      let url = this.isEdit
        ? '/base/datasources/updateDatasource'
        : '/base/datasources/createDatasource'
      this.$http
        .post(url, param)
        .then(() => {
          this.showSuccess(
            this.isEdit
              ? this.$t('meta.dataSource.modifySucceed')
              : this.$t('meta.dataSource.addedSucceed')
          )
          this.$emit('createdJob')
        })
        .catch(e => {
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
      console.log('file', file, type)
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
        }
      } else if (type && accept) {
        if (accept.includes(file.name.split('.')[1])) {
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
      console.log('res', res, file, type)
      const self = this
      const ds = self.dsform
      // zl add
      if (type && type === 'keytab') {
        // ds.KeyTabPath = res.fileId
        self.tempForm.KeyTabPath = res.fileId
      } else if (type && type === 'krb5') {
        // ds.Krb5Path = res.fileId
        self.tempForm.Krb5Path = res.fileId
      } else if (type) {
        self.tempForm[type] = res.fileId
      } else {
        file.filepath = res.fileStorePath
        // ds.fileName = res.fileOrginalName
        // ds.filePath = res.fileStorePath
        self.tempForm.fileName = res.fileOrginalName
        self.tempForm.filePath = res.fileStorePath
      }
      // todo --掉换接口
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
        console.log('fileList', fileList)
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
      /* if (this.customConnection === true) {
      // todo 是否需要特殊处理
        json.connUrl = this.dsform.connUrl
        json.parameterMap.HostServer = ''
        json.parameterMap.PortNumber = ''
      }
      if (this.driverId !== '') {
        json.driverId = this.dsform.driverId
      } */
      console.log('json', json)
      this.$http
        .post('/base/datasources/getSchemas', json)
        .then(res => {
          successcallback && successcallback()
          if (res.data) {
            const schemas = res.data
            schemas.sort()
            this.schemas = schemas
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
      console.log('type', type, this.customConnectionState)
      this.tempForm.driverId = ''
      this.driverOptions = []
      this.driverState = false
      if (!type || type === 'OFFLINEDUMP' || type === 'OFFLINEDUMP_RAW') return
      this.$http
        .post(`/base/drivers/getDriverByType?type=${type}`) // new
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
          if (this.isEdit && this.jdbcDs.driverId) {
            this.$set(this.tempForm, 'driverId', this.jdbcDs.driverId)
          } else {
            res.data.forEach(element => {
              if (element.defaultDriver === true) {
                this.$set(this.tempForm, 'driverId', element.id)
              }
            })
          }
          this.driverOptions = res.data
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
          console.log('newjdbc编辑', newVal)
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
    typeSelectWraper(newVal) {
      if (newVal !== 'AGENT') {
        this.getDriverType(newVal)
      }
    },
    testPw(newVal) {
      this.disabledUsernamePw = !newVal
      this.dsform.username = ''
      this.dsform.password = ''
    },
  },
}
