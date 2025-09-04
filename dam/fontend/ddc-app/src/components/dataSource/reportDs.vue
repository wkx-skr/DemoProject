<template>
  <div class="report-ds">
    <el-form
      class="page-form"
      label-position="right"
      label-width="130px"
      size="small"
      ref="form"
      :rules="rules"
      :model="importData"
    >
      <el-form-item :label="$t('meta.dataSource.edit.dataSourceName')">
        <datablau-input
          size="mini"
          v-model="importData.displayName"
          maxlength="50"
          :placeholder="$t('meta.dataSource.edit.fillDataSourceName')"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="$t('meta.dataSource.edit.reportType')" prop="type">
        <el-select
          v-model="importData.type"
          :placeholder="$t('meta.dataSource.edit.selBIType')"
          clearable
          filterable
          @change="handleTypeChange"
        >
          <el-option
            v-for="item in importTypeArr"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.dbs')"
        v-if="importType === 'FINE_REPORT'"
        prop="dbtype"
      >
        <el-select
          size="mini"
          v-model="importData.dbtype"
          :placeholder="$t('meta.report.selDbs')"
          @change="changeDbType"
          filterable
        >
          <el-option-group>
            <el-option
              v-for="item in dbTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item
        label="Dispatcher URI"
        prop="CM_URL"
        v-if="importType === 'COGNOS'"
      >
        <el-input
          v-model="importData.CM_URL"
          :placeholder="$t('meta.dataSource.edit.fillDispatcherURI')"
          clearable
          @change="handleCmchange"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Gateway URI"
        prop="GATEWAY_URL"
        v-if="importType === 'COGNOS'"
      >
        <el-input
          v-model="importData.GATEWAY_URL"
          :placeholder="$t('meta.dataSource.edit.fillGatewayURI')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('meta.dataSource.edit.server')" prop="host">
        <el-input
          v-model="importData.host"
          :placeholder="$t('meta.dataSource.edit.fillServer')"
          clearable
          auto-complete="off"
          :disabled="hostEditDisabld"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('meta.dataSource.edit.port')" prop="port">
        <el-input
          v-model="importData.port"
          :placeholder="$t('meta.dataSource.edit.fillPort')"
          clearable
          auto-complete="off"
          :disabled="hostEditDisabld"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('meta.dataSource.edit.username')" prop="user">
        <el-input
          v-model="importData.user"
          :placeholder="$t('meta.dataSource.edit.fillUsername')"
          clearable
          auto-complete="new-password"
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.password')"
        prop="password"
      >
        <el-input
          v-model="importData.password"
          :placeholder="$t('meta.dataSource.edit.fillPassword')"
          clearable
          auto-complete="new-password"
          type="password"
        ></el-input>
        <datablau-button
          size="small"
          type="white-btn"
          class="test-btn"
          @click="testConnect"
          :disabled="btnDisable"
          v-if="importType !== 'COGNOS' && importType !== 'FINE_REPORT'"
        >
          {{ $t('meta.dataSource.edit.test') }}
        </datablau-button>
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.dbs')"
        prop="schema"
        v-if="importType === 'FINE_REPORT' && importData.dbtype === 'MYSQL'"
      >
        <el-input
          v-model="importData.schema"
          :placeholder="dbplaceHolder"
          clearable
        ></el-input>
        <datablau-button
          size="small"
          type="white-btn"
          class="test-btn"
          @click="testConnect"
          :disabled="btnDisable || !isFineReport"
        >
          {{ $t('meta.dataSource.edit.test') }}
        </datablau-button>
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.collectMode')"
        v-if="importType === 'FINE_REPORT' && importData.dbtype === 'ORACLE'"
        prop="connectType"
      >
        <el-select
          size="mini"
          v-model="importData.connectType"
          @change="changeConnectType"
        >
          <el-option label="SID" value="SID"></el-option>
          <el-option label="Service Name" value="Service Name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="schema"
        v-if="importType === 'FINE_REPORT' && importData.dbtype === 'ORACLE'"
        prop="oracleSchema"
      >
        <el-input
          v-model="importData.oracleSchema"
          :placeholder="$t('meta.dataSource.edit.fillNames', { name: schema })"
          clearable
        ></el-input>
        <datablau-button
          size="small"
          type="white-btn"
          class="test-btn"
          @click="testConnect"
          :disabled="btnDisable || !isFineReport"
        >
          <!--          测试2&#45;&#45;{{ btnDisable }}&#45;&#45;{{ !isFineReport }}-->
          {{ $t('meta.dataSource.edit.test') }}
        </datablau-button>
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.fineReportUrl')"
        prop="reportBaseUrl"
        v-if="importType === 'FINE_REPORT'"
      >
        <el-input
          v-model="importData.reportBaseUrl"
          placeholder="例：http://localhost:8075"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.file')"
        v-if="importType === 'FINE_REPORT'"
        prop="fileId"
        style="padding-bottom: 20px"
      >
        <!-- <el-form-item label="文件" v-if="importType === 'FINE_REPORT'">-->
        <el-upload
          v-if="!$isIE"
          class="upload-demo"
          style="width: 368px"
          drag
          :accept="acceptTypes"
          :action="uploadaction"
          :file-list="fileList"
          :limit="1"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-remove="handleFileRemoved"
          :headers="$headers"
          :on-change="handleUploadChange"
          :on-exceed="
            () => {
              $message.info(this.$t('meta.dataSource.edit.oneFile'))
            }
          "
          :on-error="$showUploadFailure"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            {{ $t('meta.driveManage.dragOr') }}
            <em>{{ $t('meta.driveManage.click') }}</em>
          </div>
        </el-upload>
        <!--        <form
          :action="uploadaction"
          v-else
          method="post"
          class="IE-upload"
          enctype="multipart/form-data"
          target="nm_iframe1"
        >
          <input type="file" name="file" value="选择文件" />
          <datablau-button size="mini">
            <input
              id="id_submit1"
              name="nm_submit1"
              type="submit"
              @click="handleIEUpload"
              value="添加"
            />
          </datablau-button>
        </form>-->
      </el-form-item>
      <el-form-item
        :label="$t('meta.dataSource.edit.nameSpace')"
        prop="NAMINGSPACE"
        v-if="importType === 'COGNOS'"
      >
        <el-input
          v-model="importData.NAMINGSPACE"
          :placeholder="$t('meta.dataSource.edit.fillNameSpace')"
          clearable
        ></el-input>
        <datablau-button
          type="white-btn"
          class="test-btn"
          @click="testConnect"
          :disabled="btnDisable"
        >
          {{ $t('meta.dataSource.edit.test') }}
        </datablau-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  props: {
    dsform: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    this.uploadaction = this.$url + '/service/files/upload'
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
      },
      rules: {},
      defaultRules: {
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
      rulesForFineReport: {
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
        type: 'FINE_REPORT',
        additionalProp: {},
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
    }
  },

  components: {},
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
  beforeMount() {
    this.rules = this.defaultRules
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
  },
  methods: {
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
    /** 响应事件 */
    dataInit() {
      this.importData = _.cloneDeep(this.emptyData)
      if (this.dsform && this.dsform.original) {
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
      }
    },
    getFileInfo(fileId) {
      let KeyTabPath = this.dsform.KeyTabPath
      // 获取keytab文件
      this.$http
        .get(this.$url + `/service/files/?fileIds=${fileId}`)
        .then(res => {
          let tempFileList = []
          res.data.forEach(item => {
            let obj = {
              name: item.fileOrginalName,
              ...item,
            }
            tempFileList.push(obj)
          })
          this.fileList = tempFileList
        })
    },
    getParams() {
      const password = this.$pwEncrypt(this.importData.password)
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
          type: this.importData.dbtype,
          schema: this.importData.schema,
          parameter: 'serverTimezone=CST',
          fileId: this.importData.fileId,
          reportBaseUrl: this.importData.reportBaseUrl,
        }
      } else if (
        this.importType === 'FINE_REPORT' &&
        this.importData.dbtype === 'ORACLE'
      ) {
        para.info.additionalProp = {
          type: this.importData.dbtype,
          schema: this.schema + ':' + this.importData.oracleSchema,
          fileId: this.importData.fileId,
          reportBaseUrl: this.importData.reportBaseUrl,
        }
      }
      return para
    },
    removetab() {
      this.$emit('closeEditTab')
    },
    testConnect() {
      const url = `${this.$url}/service/dataReport/importBI/test`
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
      } else {
        this.rules = this.defaultRules
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
      // this.rules
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
        // this.rulesForFineReport.connectType.required = false
        this.rulesForFineReport.oracleSchema.required = false
      } else if (type === 'ORACLE') {
        this.rulesForFineReport.schema.required = false
        // this.rulesForFineReport.connectType.required = true
        this.rulesForFineReport.oracleSchema.required = true
      }
      this.$nextTick(this.$refs.form.clearValidate)
      this.importData.fileId = ''
      this.fileList = []
    },
    handleBeforeUpload(file) {
      var self = this
      var ds = self.dsform
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
      file.filepath = res.fileStorePath
      this.importData.fileId = res.fileId
      this.$refs.form.validateField('fileId')
      this.$http.put(this.$url + '/service/files/commit?fileIds=' + res.fileId)
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
</script>
<style lang="scss" scoped>
.report-ds {
  .test-btn {
    margin-left: 20px;
  }
}
</style>
