import HTTP from '@/http/main'

import ScriptSelector from './scriptSelector.vue'
export default {
  props: {
    editRow: {
      type: Object,
      default() {
        return {}
      },
    },
    dsform: {
      type: Object,
      default() {
        return {}
      },
    },
    dsEditing: {
      type: Boolean,
      default: false,
    },
  },
  components: { ScriptSelector },
  data() {
    this.uploadaction = this.$url + '/files/upload'
    let checkFileId = (rule, value, callback) => {
      if (!this.importData.fileId) {
        return callback(
          new Error(this.$t('meta.dataSource.edit.pleaseUploadFile'))
        )
      }
      callback()
    }
    let oracleSchema = (rule, value, callback) => {
      if (!value) {
        return callback(
          new Error(
            this.$t('meta.dataSource.edit.fillNames', { name: this.schema })
          )
        )
      }
      callback()
    }
    return {
      editRowData: {},
      versionList: [9.5, 10.5],
      emptyData: {
        host: '',
        port: '',
        user: '',
        password: '',
        type: 'YONGHONG',
        GATEWAY_URL: '',
        CM_URL: '',
        NAMINGSPACE: '',
        displayName: '',
        modelId: null,
        dbtype: 'MYSQL',
        connectType: 'SID',
        reportBaseUrl: '',
        version: '',
        parameter: '',
      },
      rules: {},
      defaultRules: {
        displayName: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillDataSourceName'),
        },
        host: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillServer'),
        },
        port: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillPort'),
        },
        version: {
          required: this.importType === 'SMARTBI',
          trigger: 'blur',
          message: '请选择版本',
        },
        user: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillUsername'),
        },
        password: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillPassword'),
        },
        type: {
          required: true,
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.selImportType'),
        },
      },
      rulesForFineReport: {
        displayName: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillDataSourceName'),
        },
        host: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillServer'),
        },
        port: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillPort'),
        },
        user: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillUsername'),
        },
        password: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillPassword'),
        },
        dbtype: {
          required: true,
          trigger: 'change',
          message: this.$t('meta.report.selDbs'),
        },
        schema: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillDbs1'),
        },
        realSchema: {
          required: false,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillSchema'),
        },
        oracleSchema: {
          required: false,
          trigger: 'blur',
          validator: oracleSchema,
        },
        fileId: { required: true, trigger: 'change', validator: checkFileId },
        connectType: {
          required: false,
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.selConMode'),
        },
        reportBaseUrl: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillFineReport'),
        },
        type: {
          required: 'true',
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.selImportType'),
        },
      },
      rulesForYonghong: {
        displayName: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillDataSourceName'),
        },
        host: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillServer'),
        },
        port: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillPort'),
        },
        user: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillUsername'),
        },
        password: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillPassword'),
        },
        type: {
          required: 'true',
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.selImportType'),
        },
      },
      rulesForCognos: {
        displayName: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.dataSource.edit.fillDataSourceName'),
        },
        type: {
          required: 'true',
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.selImportType'),
        },
        GATEWAY_URL: {
          required: 'true',
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.fillGatewayURI'),
        },
        CM_URL: {
          required: 'true',
          trigger: 'change',
          message: this.$t('meta.dataSource.edit.fillDispatcherURI'),
        },
      },
      hostEditDisabld: false,
      importData: {
        type: 'YONGHONG',
        // additionalProp: {},
      },
      customCalleeModelName: false, // 数据库名称是否自定义
      resourceTypeArrSelected: [],
      importTypeArr: this.$globalData && this.$globalData.$importTypeArr,
      testSuccesd: false,
      hasRequired: false,
      dbTypeList: [
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'Oracle', value: 'ORACLE' },
      ],
      dbplaceHolder: this.$t('meta.dataSource.edit.fillDbs1'),
      fileList: [],
      acceptTypes: '.zip',
      // originFormData: {},
      showScriptDialog: false,
    }
  },

  computed: {
    btnDisable() {
      return !this.hasRequired
    },
    importType() {
      return this.importData && this.importData.type
    },
    schema() {
      return this.importType === 'FINE_REPORT' &&
        this.importData.dbtype === 'ORACLE' &&
        this.importData.connectType
        ? this.importData.connectType
        : 'SID'
    },
    isFineReport() {
      if (
        this.importType === 'FINE_REPORT' &&
        this.importData.dbtype === 'MYSQL'
      ) {
        return this.fileList.length > 0
      } else if (
        this.importType === 'FINE_REPORT' &&
        this.importData.dbtype === 'ORACLE'
      ) {
        // return this.fileList.length > 0 && this.importData.oracleSchema
        return this.fileList.length > 0
      } else {
        return true
      }
    },
  },
  created() {
    this.rules = this.defaultRules
    this.hasRequired = this.coverRequired()
  },
  mounted() {
    this.dataInit()
  },
  destroyed() {},
  watch: {
    importData: {
      deep: true,
      handler: function (newVal) {
        this.hasRequired = this.coverRequired()
      },
      immediate: true,
    },
    testSuccesd(newVal) {
      this.$emit('testSucceed', newVal)
    },
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = newVal
          this.handleEditRow()
        }
      },
      immediate: true,
    },
  },
  methods: {
    confirmScripts(scripts = []) {
      console.log(scripts)
      if (scripts[0]) {
        this.$set(this.importData, 'scriptName', scripts[0].name)
        this.$set(this.importData, 'scriptId', scripts[0].id)
      }
      this.showScriptDialog = false
    },
    toSelectScript() {
      this.$refs.scriptInput.blur()
      this.showScriptDialog = true
    },
    /* getReportOriData() {
      let obj = {
        type: this.importData.type, // 报表类型
        dbtype: this.importData.dbtype, // 数据库
        CM_URL: this.importData.CM_URL, // Dispatcher URI
        GATEWAY_URL: this.importData.GATEWAY_URL, // Gateway URI
        host: this.importData.host, // 服务器
        port: this.importData.port, // 端口
        // user: this.importData.user, // 用户名
        // password: this.importData.password, // 密码
        schema: this.importData.schema, // 数据库
        connectType: this.importData.connectType, // 连接模式
        oracleSchema: this.importData.oracleSchema, // SID || this.importData.connectType
        reportBaseUrl: this.importData.reportBaseUrl, // 帆软report地址
        NAMINGSPACE: this.importData.NAMINGSPACE, // 命名空间
      }
      return obj
    }, */
    getCategoryName(val) {
      this.$userModelCategoryDetail.forEach(item => {
        if (item.categoryId === val) {
          this.importData.categoryName = item.categoryName
          this.importData.categoryAbbreviation = item.categoryAbbreviation
        }
      })
      this.importData.categoryId = val
    },
    /** 响应事件 */
    dataInit() {
      // this.importData = _.cloneDeep(this.emptyData)
      /* if (this.dsform && this.dsform.original) {
        // 编辑
        let original = this.dsform.original
        let displayName = original.definition
        let modelId = original.modelId
        if (
          original.connectionInfo &&
          original.connectionInfo.parameterMap &&
          original.connectionInfo.parameterMap.biServerInfo
        ) {
          let biServerInfo = original.connectionInfo.parameterMap.biServerInfo
          let biType = original.connectionInfo.parameterMap.biType
          if (this.$utils.isJSON(biServerInfo)) {
            biServerInfo = JSON.parse(biServerInfo)
          } else {
            biServerInfo = {}
          }
          biServerInfo.additionalProp = biServerInfo.additionalProp || {}
          let importData = {
            displayName,
            modelId,
            host: biServerInfo.host,
            port: biServerInfo.port,
            type: biType,
            GATEWAY_URL: biServerInfo.additionalProp.GATEWAY_URL,
            CM_URL: biServerInfo.additionalProp.CM_URL,
            NAMINGSPACE: biServerInfo.additionalProp.NAMINGSPACE,
            // dbtype: this.dsform.dbtype, // zl
            dbtype: biServerInfo.additionalProp.type,
            fileId: biServerInfo.additionalProp.fileId,
            reportBaseUrl: biServerInfo.additionalProp.reportBaseUrl,
            schema: biServerInfo.additionalProp.schema,
          }
          Object.keys(importData).forEach(key => {
            importData[key] = importData[key] || ''
          })
          this.getFileInfo(importData.fileId)
          this.importData = importData
        }
        if (original.connectionInfo.parameterMap.biType === 'FINE_REPORT') {
          this.rules = this.rulesForFineReport
          this.$nextTick(function () {
            this.$refs.form.clearValidate()
          })
        }
        // this.originFormData = _.cloneDeep(this.getReportOriData())
      } */
    },
    handleEditRow() {
      let reverseOptions = this.editRowData.reverseOptions
      let biServerInfo = this.editRowData.reverseOptions.biServerInfo
      let biType = this.editRowData.reverseOptions.biType
      if (this.$utils.isJSON(biServerInfo)) {
        biServerInfo = JSON.parse(biServerInfo)
      } else {
        biServerInfo = {}
      }
      let importData = {
        displayName: this.editRowData.definition,
        // categoryId: this.editRowData.categoryId || 3, // todo --zl 所属系统
        modelId: this.editRowData.modelId,
        host: biServerInfo.host,
        port: biServerInfo.port,
        type: biType,
        GATEWAY_URL: biServerInfo.additionalProp.GATEWAY_URL,
        CM_URL: biServerInfo.additionalProp.CM_URL,
        NAMINGSPACE: biServerInfo.additionalProp.NAMINGSPACE,
        dbtype: biServerInfo.additionalProp.type,
        fileId: biServerInfo.additionalProp.fileId,
        reportBaseUrl: biServerInfo.additionalProp.reportBaseUrl,
        schema: biServerInfo.additionalProp.schema,
        oracleSchema: biServerInfo.additionalProp.database?.split(':')[1],
        realSchema: biServerInfo.additionalProp.schema,
        version: biServerInfo.additionalProp.version,
        connectType: biServerInfo.additionalProp.database?.includes('SID')
          ? 'SID'
          : 'Service Name',
        parameter: biServerInfo.additionalProp.parameter,
      }
      Object.keys(importData).forEach(key => {
        importData[key] = importData[key] || ''
      })
      if (importData.fileId) {
        this.getFileInfo(importData.fileId)
      }
      this.importData = importData
      if (this.importType !== 'SMARTBI') {
        this.$set(this.defaultRules.version, 'required', false)
      } else {
        this.$set(this.defaultRules.version, 'required', true)
      }
      if (this.importType === 'FINE_REPORT') {
        const { scriptId, runDefaultScript } = biServerInfo.additionalProp
        if (scriptId) {
          this.$http
            .post(
              `${this.$meta_url}/service/lineage/script/getScript?id=${scriptId}`
            )
            .then(res => {
              this.$set(
                this.importData,
                'runDefaultScript',
                runDefaultScript === 'true'
              )
              this.$set(this.importData, 'scriptId', scriptId)
              this.$set(this.importData, 'scriptName', res.data.name)
            })
        }
        if (biServerInfo.additionalProp.type === 'MYSQL') {
          this.rulesForFineReport.schema.required = true
          this.rulesForFineReport.oracleSchema.required = false
        } else if (biServerInfo.additionalProp.type === 'ORACLE') {
          this.rulesForFineReport.schema.required = false
          this.rulesForFineReport.oracleSchema.required = true
        }
      }
    },
    getFileInfo(fileId) {
      let KeyTabPath = this.dsform.KeyTabPath
      // 获取keytab文件
      this.$http
        // .get(this.$url + `/service/files/?fileIds=${fileId}`)
        .post(this.$url + `/files/getFilesInfo?fileIds=${fileId}`)
        .then(res => {
          let tempFileList = []
          res.data.forEach(item => {
            let obj = {
              name: item.fileName,
              ...item,
            }
            tempFileList.push(obj)
          })
          this.fileList = tempFileList
        })
    },
    confirmPost() {
      const validate = this.$refs.form.validate()
      validate
        .then(res => {
          if (res) {
            /*
            //  修改信息比对，本版暂时不对报表进行控制
            const lastData = this.getReportOriData()
            console.log(
              '1111',
              JSON.stringify(lastData) === JSON.stringify(this.originFormData)
            )
            if (
              JSON.stringify(lastData) !== JSON.stringify(this.originFormData)
            ) {
              this.$DatablauCofirm(
                '更改了数据库相关，还未进行测试，如需测试，请填写用户名密码进行测试，',
                this.$t('meta.dataSource.edit.tips'),
                'info',
                {
                  showCancelButton: true,
                  confirmButtonText: '保存',
                  cancelButtonText: '去测试',
                }
              )
                .then(() => {
                  this.addReportDs()
                })
                .catch(() => {})
            } else {
              this.addReportDs()
            } */
            this.addReportDs()
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    addReportDs() {
      const para = this.getParams()
      HTTP.addReportDs({
        definition:
          this.importData.displayName ||
          `报表${para.type}_${para.info.host}_${para.info.port}`,
        // '@class': 'com.datablau.dam.data.dto.DatasourceProperties',
        modelId: this.importData.modelId || null,
        jdbcModel: false,
        reverseOptions: {
          biServerInfo: JSON.stringify(para.info),
          biType: para.type,
        },
      })
        .then(res => {
          this.$message.success(
            this.$t('meta.dataSource.edit.taskCreatedLoading')
          )
          this.$emit('createdJob', res)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getParams() {
      const { JSEncrypt } = require('../../../../../static/js/jsencrypt2.min')
      const pubkey =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAn70F4s96vF0liGogI+cX63bqvYe0/V6gVgJ1Ftqpl1s5CaGhILY0As9vvZOeMq4jsl5tIhRF3poglmAm+waWKeAFk3ExZ5eJ7JMzM+daHIPDNWSAMONlEiX+DfhcoHruKlLlbcub1N8+6wiC+wVPPA8x1AkiC1t0kteQaGEP1Ek+Dd9oRd1YTSdmy7vIheOWM26DkgvLyQFdTCW4owkEhUREbrwvxYfTwEDoXy2Xdc3kfP6EKuo3whhnoOn4jGKAzb4reDZ0bXWGe2STSgF1WlGI+lrgDtZ7iNFuFqfzOD9kuyA2imLaFslO2Ky6OXqfq/KIu723c49pACxF2rMwIDAQAB'
      const crypt = new JSEncrypt({ default_key_size: 2048 })
      crypt.setPublicKey(pubkey)
      const password = crypt.encrypt(this.importData.password)
      // const password = this.$pwEncrypt(this.importData.password)
      const para = {
        type: this.importData.type,
        info: {
          host: this.importData.host,
          port: this.importData.port,
          auth: {
            user: this.importData.user,
            password: password,
          },
          additionalProp: {
            GATEWAY_URL: this.importData.GATEWAY_URL || '',
            CM_URL: this.importData.CM_URL || '',
            NAMINGSPACE: this.importData.NAMINGSPACE || '',
          },
        },
      }
      if (
        this.importType === 'FINE_REPORT' &&
        this.importData.dbtype === 'MYSQL'
      ) {
        para.info.additionalProp = {
          scriptId: String(this.importData.scriptId),
          runDefaultScript: String(this.importData.runDefaultScript),
          type: this.importData.dbtype,
          schema: this.importData.schema,
          parameter: this.importData.parameter || 'serverTimezone=CST',
          fileId: this.importData.fileId,
          reportBaseUrl: this.importData.reportBaseUrl,
        }
      } else if (
        this.importType === 'FINE_REPORT' &&
        this.importData.dbtype === 'ORACLE'
      ) {
        para.info.additionalProp = {
          scriptId: String(this.importData.scriptId),
          runDefaultScript: String(this.importData.runDefaultScript),
          type: this.importData.dbtype,
          database: this.schema + ':' + this.importData.oracleSchema,
          schema: this.importData.realSchema,
          fileId: this.importData.fileId,
          reportBaseUrl: this.importData.reportBaseUrl,
        }
      }
      if (this.importType === 'SMARTBI') {
        this.$set(para.info.additionalProp, 'version', this.importData.version)
      }
      return para
    },
    removetab() {
      this.$emit('removeReTab')
    },
    testConnect() {
      const url = `${this.$meta_url}/service/dataReport/importBI/test`
      const para = this.getParams()
      const validate = this.$refs.form.validate()
      validate
        .then(res => {
          if (res) {
            this.$http
              .post(url, para)
              .then(res => {
                this.testSuccesd = true
                this.$message.success(
                  this.$t('meta.dataSource.edit.testSucceed')
                )
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    handleTypeChange(type) {
      this.hostEditDisabld = false
      if (type === 'COGNOS') {
        this.rules = this.rulesForCognos
        this.hostEditDisabld = true
      } else if (type === 'YONGHONG') {
        this.rules = this.rulesForYonghong
      } else if (type === 'FINE_REPORT') {
        this.rules = this.rulesForFineReport
        this.$set(this.importData, 'runDefaultScript', false)
      } else {
        this.rules = this.defaultRules
      }
      if (this.importType !== 'SMARTBI') {
        this.$set(this.defaultRules.version, 'required', false)
      } else {
        this.$set(this.defaultRules.version, 'required', true)
      }
      if (this.$refs.form && this.$refs.form.clearValidate) {
        this.$nextTick(this.$refs.form.clearValidate)
      }
    },
    getHost(url) {
      let host = url.split('//')[1]
      if (host) {
        host = host.split('/')[0]
      }
      if (host) {
        host = host.split(':')[0]
      }
      return host || ''
    },
    getPort(url) {
      let port = ''
      let host = url.split('//')[1]
      if (host) {
        host = host.split('/')[0]
      }
      if (host) {
        port = host.split(':')[1]
      }
      return port || ''
    },
    handleCmchange(url) {
      this.importData.host = this.getHost(url)
      this.importData.port = this.getPort(url)
    },
    coverRequired() {
      let result = true
      for (const key in this.rules) {
        if (key === 'fileId') continue
        if (this.rules[key].required && !this.importData[key]) {
          result = false
          break
        }
      }
      return result
    },
    // 切换数据库类型
    changeDbType(type) {
      if (type === 'MYSQL') {
        this.rulesForFineReport.schema.required = true
        this.rulesForFineReport.oracleSchema.required = false
      } else if (type === 'ORACLE') {
        this.rulesForFineReport.schema.required = false
        this.rulesForFineReport.oracleSchema.required = true
      }
      this.$nextTick(this.$refs.form.clearValidate)
      this.importData.fileId = ''
      this.fileList = []
    },
    handleBeforeUpload(file) {
      var isCorrectFile = false
      if (file.name.toLowerCase().indexOf('.zip') > -1) {
        isCorrectFile = true
      }
      if (!isCorrectFile) {
        this.$message.error(
          this.$t('meta.dataSource.edit.fileTypeIncorrect') + '.zip'
        )
      }
      return isCorrectFile
    },
    handleUploadSuccess(res, file) {
      this.importData.fileId = res.fileId
      this.$refs.form.validateField('fileId')
      this.$http.post(this.$url + '/files/commitFile?fileIds=' + res.fileId)
    },
    handleFileRemoved(file, fileList) {
      this.importData.fileId = ''
      this.$refs.form.validateField('fileId')
      this.fileList = fileList
    },
    handleUploadChange(file, fileList) {
      this.fileList = fileList
    },
    // change连接模式
    changeConnectType() {
      this.$nextTick(() => {
        this.$set(this.importData, 'oracleSchema', '')
      })
    },
  },
}
