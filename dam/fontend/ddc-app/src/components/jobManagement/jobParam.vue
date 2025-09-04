<template>
  <div class="job-para-container" v-loading="loadingDS">
    <datablau-form
      class="page-form"
      label-position="right"
      label-width="130px"
      :model="colType"
      ref="form"
      :rules="ruleMap"
    >
      <el-form-item label="数据源类型">
        <datablau-select
          v-model="dsform.dbtype"
          placeholder="请选择数据源类型"
          @change="dbTypeSelected"
        >
          <el-option-group label="关系数据库">
            <el-option label="Oracle" value="ORACLE"></el-option>
            <el-option label="SQL Server" value="SQLSERVER"></el-option>
            <el-option label="MySQL" value="MYSQL"></el-option>
          </el-option-group>
        </datablau-select>
      </el-form-item>

      <el-form-item label="服务器名称" :rules="{ required: true }">
        <datablau-input v-model="dsform.hostname"></datablau-input>
        <el-tooltip
          v-if="dsform.dbtype === 'HBASE'"
          content="可以填多个服务器，以英文逗号分隔"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item
        :label="portText"
        v-show="showDbport"
        :rules="{ required: requireDbport }"
      >
        <datablau-input v-model="dsform.dbport"></datablau-input>
      </el-form-item>
      <el-form-item label="授权方式" v-if="false">
        <datablau-select
          placeholder="请选择授权方式"
          v-model="AuthenticationType"
          :disabled="authDisabled"
        >
          <el-option label="用户名/密码" :value="0" selected></el-option>
          <el-option label="Kerberos" :value="1"></el-option>
        </datablau-select>
        <el-tooltip
          v-if="dsform.dbtype === 'ES'"
          content="当前只支持http basic的验证，其它验证类型暂不支持"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item
        label="用户名"
        v-if="AuthenticationType == 0"
        :rules="{ required: userPasswordRequ }"
      >
        <datablau-input v-model="dsform.username" clearable></datablau-input>
      </el-form-item>
      <el-form-item
        label="密码"
        v-if="AuthenticationType == 0"
        :rules="{ required: userPasswordRequ }"
      >
        <datablau-input
          type="password"
          v-model="dsform.password"
          clearable
        ></datablau-input>
      </el-form-item>

      <el-form-item
        label="连接模式"
        v-if="isOracle() && dsform.connectType == 'JDBC'"
        :rules="{ required: true }"
      >
        <datablau-select v-model="dsform.extraDbPara" @change="changeConStyle">
          <el-option label="SID" value="SID"></el-option>
          <el-option label="Service Name" value="Service Name"></el-option>
        </datablau-select>
      </el-form-item>

      <!-- 数据库 -->
      <el-form-item
        :label="inputDBname"
        v-show="showDbName"
        :rules="{ required: dbNameRequ }"
      >
        <el-autocomplete
          ref="dbname"
          size="mini"
          v-model="dsform.dbname"
          clearable
          :placeholder="dbplaceHolder"
          v-if="dsform.dbtype !== 'ORACLE' && dsform.dbtype !== 'DB2'"
          :fetch-suggestions="
            (queryString, cb) => {
              cb(
                $getSuggettionInputValue(queryString, cb, dataBaseNames, null, {
                  showAllOptions: showAllDbname,
                })
              )
            }
          "
          @change="handleDbnameChange"
          @input="handleDbnameChange"
          @clear="handleClearDbname"
          @click.native="handleDbnameClick"
        ></el-autocomplete>
        <datablau-input
          size="mini"
          v-model="dsform.dbname"
          :placeholder="dbplaceHolder"
          clearable
          v-else
          style="display: inline-block"
        ></datablau-input>
        <datablau-button
          size="small"
          type="secondary"
          :disabled="disableTest"
          @click="testDataSource"
          style="display: inline-block; margin-left: 10px"
        >
          {{ disableTest ? '测试中' : '测试' }}
          <i class="el-icon-loading" v-if="disableTest"></i>
        </datablau-button>
      </el-form-item>

      <el-form-item :label="schemaText" v-if="hasSchema && false">
        <datablau-select
          v-model="schemaSelected"
          :placeholder="'请选择' + schemaText"
          :disabled="!dbConnected"
          multiple
          clearable
          allow-create
          filterable
        >
          <el-option
            v-for="val in schemas"
            :label="val"
            :key="val"
            :value="val"
          ></el-option>
        </datablau-select>
        <datablau-button
          size="small"
          type="white-btn"
          :disabled="disableTest"
          @click="testDataSource"
          v-if="!showDbName"
        >
          {{ disableTest ? '测试中' : '测试' }}
          <i class="el-icon-loading" v-if="disableTest"></i>
        </datablau-button>
      </el-form-item>

      <!-- sql -->
      <el-form-item label="SQL语句" :rules="{ required: true }">
        <datablau-input
          class="sql-content"
          v-model="sqlContent"
          placeholder="请输入SQL语句"
          clearable
          type="textarea"
          row="3"
        ></datablau-input>
      </el-form-item>
      <!-- code -->
      <el-form-item label="代码编号字段" prop="CODE">
        <datablau-input
          v-model="colType.CODE"
          placeholder='SQL语句提取的数据中 "代码编号" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="中文名称字段" prop="CH_NAME">
        <datablau-input
          v-model="colType.CH_NAME"
          placeholder='SQL语句提取的数据中 "中文名称" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="英文名称字段" prop="EN_NAME">
        <datablau-input
          size="mini"
          v-model="colType.EN_NAME"
          placeholder='SQL语句提取的数据中 "英文名称" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="标准主题字段" prop="DATASET">
        <datablau-input
          size="mini"
          v-model="colType.DATASET"
          placeholder='SQL语句提取的数据中 "标准主题" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="编码取值字段" prop="VALUE">
        <datablau-input
          size="mini"
          v-model="colType.VALUE"
          placeholder='SQL语句提取的数据中 "编码取值" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="值的中文名称字段" prop="VALUE_CH_NAME">
        <datablau-input
          size="mini"
          v-model="colType.VALUE_CH_NAME"
          placeholder='SQL语句提取的数据中 "值的中文名称" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="值的英文名称字段" prop="VALUE_EN_NAME">
        <datablau-input
          size="mini"
          v-model="colType.VALUE_EN_NAME"
          placeholder='SQL语句提取的数据中 "值的英文名称" 对应的字段'
          clearable
        ></datablau-input>
      </el-form-item>
    </datablau-form>
    <div class="confirm-box" v-if="false">
      <el-tooltip
        effect="light"
        content="请先点击测试，确保数据库连接成功"
        placement="top"
        v-if="disableCommitButton"
        class="contooltip"
      >
        <div class="fakebutton">
          <el-button
            size="small"
            type="primary"
            @click="addDataSource"
            v-if="disableCommitButton"
            :disabled="disableCommitButton"
          >
            确 定
          </el-button>
        </div>
      </el-tooltip>
      <el-button
        size="small"
        type="primary"
        v-else
        @click="addDataSource"
        :disabled="disableCommitButton"
      >
        确 定
      </el-button>
    </div>
  </div>
</template>

<script>
import js from '../dataSource/ediDataSource.vue'
var moment = require('moment')
export default {
  // props: ['dsform', 'para', 'formatDataSource',],
  props: {
    jobContent: {
      type: Object,
      default() {
        return {
          b: 2,
        }
      },
    },
  },
  data() {
    this.BASE_URL = this.$url + '/service/'
    return {
      // 数据库
      dsform: {
        versioning: true,
        ServicePrincipal: '',
        UserPrincipal: '',
        KeyTabPath: '',
        dbtype: '',
        hostname: 'localhost',
        username: '',
        dbname: '',
        dbport: '',
        password: '',

        CommentToLogicalName: true,
        DBVersion: '',
        Deploy: '',
        Description: '',
        FunctionFiltered: '',
        IsFirstRowColumnName: '',
        ProceduresFiltered: '',
        State: '',
        TagIds: [],
        ViewFiltered: '',
        Zone: '',
        categoryId: '',
        categoryName: '',
        connectType: 'JDBC',
        // delimiter: '',
        displayName: '',
        extraDbPara: '',
        modelCategoryId: '',
      },
      resultObj: {},
      loadingDS: false,
      inputDBname: '数据库',
      dbplaceHolder: '请选择数据库或输入数据库名称',
      schemaText: 'Schema',
      portText: '端口号',
      AuthenticationType: 0,
      hasFunction: false,
      // 其他
      sqlContent: '',
      colType: {
        CODE: '',
        CH_NAME: '',
        EN_NAME: '',
        DATASET: '',
        VALUE: '',
        VALUE_CH_NAME: '',
        VALUE_EN_NAME: '',
      },
      connectionInfo: {},
      ruleMap: {
        CODE: {
          validator: this.colDupTest,
          required: true,
          trigger: 'change',
        },
        CH_NAME: {
          validator: this.colDupTest,
          required: true,
          trigger: 'change',
        },
        EN_NAME: {
          validator: this.colDupTest,
          trigger: 'change',
        },
        DATASET: {
          validator: this.colDupTest,
          trigger: 'change',
        },
        VALUE: {
          validator: this.colDupTest,
          required: true,
          trigger: 'change',
        },
        VALUE_CH_NAME: {
          validator: this.colDupTest,
          required: true,
          trigger: 'change',
        },
        VALUE_EN_NAME: {
          validator: this.colDupTest,
          trigger: 'change',
        },
      },
      hasDup: false,

      // old
      value: '',
      dbname: [],
      schemas: [],
      webLogicDBs: [],
      schemaSelected: [],
      dbConnected: false,
      lastLoadTimeStamp: 0,
      interval: {},
      categoryIdChanged: '',
      dataBaseNames: [],
      disableTest: false,
      testSuccessed: false, // 相当于 requiredTest
      ESwithSsl: false,
      authDisabled: false,

      /** form require */
      requireDbport: true,
      showDbport: true,
      requireDataZone: false,
      showAllDbname: true,
      uploadingData: false,
    }
  },

  components: {},

  computed: {
    hasSchema() {
      var ds = this.dsform
      const noSchemaDbs = [
        'MYSQL',
        'MONGODB',
        'GBASE',
        'HANA',
        'TERADATA',
        'HIVE',
      ]
      let bool = true
      const isNoSType = noSchemaDbs.some(dbType => {
        return dbType === ds.dbtype
      })
      if (isNoSType) {
        bool = false
      }
      return bool
    },
    disableCommitButton() {
      let bool = true
      if (this.testSuccessed) {
        bool = false
      }
      if (this.uploadingData) {
        bool = true
      }
      return bool
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
        const arr = ['MYSQL', 'HIVE', 'SQLSERVER', 'TERADATA']
        if (arr.indexOf(this.dsform.dbtype) !== -1) {
          bool = false
        }
      }
      return bool
    },
    userPasswordRequ() {
      let bool = false
      const ds = this.dsform
      if (this.AuthenticationType == 0) {
        bool = true
      }
      if (ds.dbtype === 'HIVE') {
        bool = false
      }
      if (ds.dbtype === 'ES') {
        bool = false
      }
      return bool
    },
    showDbName() {
      let bool = true
      const dbArr = ['ES', 'HBASE', 'DB2I']
      const isNotType = dbArr.some(dbTye => {
        return dbTye === this.dsform.dbtype
      })
      if (isNotType) {
        bool = false
      }
      return bool
    },
    // 是否填写完成, 可以保存任务
    couldConfirm() {
      let colTypeNotEmpty = false
      const colType = this.colType
      const testProps = []
      for (const key in this.ruleMap) {
        if (this.ruleMap[key] && this.ruleMap[key].required) {
          testProps.push(key)
        }
      }
      testProps.forEach(prop => {
        if (!colType[prop]) {
          colTypeNotEmpty = true
        }
      })
      return !!this.testSuccessed && !colTypeNotEmpty && !this.hasDup
    },
  },
  beforeMount() {
    this.dataInit()
  },
  mounted() {},
  beforeDestroy() {
    this.uploadingData = false
  },
  methods: {
    dataInit(jobContent) {
      jobContent = jobContent || this.jobContent || {}
      const oldData =
        jobContent.connectionInfo || this.jobContent.connectionInfo
      if (!oldData || Object.keys(oldData).length === 0) {
        this.dsform.dbtype = 'ORACLE'
        // this.dsform.dbtype = 'MYSQL';
        this.dbTypeSelected()
      } else {
        const self = this
        let parameterMap = {}
        this.dsform.dbtype = oldData.type
        this.dbTypeSelected()
        this.initDs(oldData)
        this.$set(this.dsform, 'username', oldData.credentialInfo.user)
        if (oldData.parameterMap) {
          parameterMap = oldData.parameterMap
          // this.dsform.dbname = parameterMap.DatabaseName;
          // this.dsform.hostname = parameterMap.HostServer;
          // this.dsform.dbport = parameterMap.PortNumber;
          this.AuthenticationType = parameterMap.AuthenticationType - 0
          const str = parameterMap.SelectedSchemas || ''
          this.schemaSelected = str.split(';').filter(item => item.length > 0)
          if (this.AuthenticationType == 1) {
            this.dsform.ServicePrincipal = parameterMap.ServicePrincipal
            this.dsform.UserPrincipal = parameterMap.UserPrincipal
            this.dsform.KeyTabPath = parameterMap.KeyTabPath
          }
        }
      }
      this.sqlContent = jobContent.sql

      const colMap = jobContent.colMap
      if (colMap) {
        for (const key in this.colType) {
          this.colType[key] = colMap[key]
        }
      }
    },
    changeConStyle(newVal) {
      this.inputDBname = newVal
      this.dbplaceHolder = '请输入' + newVal + '名称'
    },
    dbTypeSelected() {
      this.testSuccessed = false
      const self = this
      const ds = self.dsform

      this.portText = '端口号'
      this.dsform.dbname = ''

      /** default value */
      this.AuthenticationType = 0
      this.requireDbport = true
      this.showDbport = true
      this.testSuccessed = false
      this.schemaText = 'Schema'
      this.authDisabled = false
      ds.versioning = true

      this.inputDBname = '数据库'
      this.dbplaceHolder = '请选择数据库或输入数据库名称'
      ds.extraDbPara = ''

      if (ds.dbtype == 'MYSQL') {
        ds.dbport = '3306'
      } else if (ds.dbtype == 'POSTGRESQL') {
        ds.dbport = '5432'
      } else if (ds.dbtype == 'GREENPLUM') {
        ds.dbport = '5432'
      } else if (ds.dbtype == 'SQLSERVER') {
        ds.dbport = '1433'
      } else if (ds.dbtype == 'ORACLE') {
        ds.dbport = '1521'

        ds.extraDbPara = 'SID'
        this.inputDBname = 'SID'
        this.dbplaceHolder = '请输入SID名称'
      } else if (ds.dbtype == 'HIVE') {
        ds.dbport = '10000'
      } else if (ds.dbtype == 'MONGODB') {
        ds.dbport = '1433'
      } else if (ds.dbtype == 'GBASE') {
        ds.dbport = '5258'
      } else if (ds.dbtype == 'HANA') {
        ds.dbport = '30015'
      } else if (ds.dbtype == 'ODPS') {
        ds.dbport = ''

        this.requireDbport = false
        this.showDbport = false
        // } else if (ds.dbtype == 'EXCEL') {
        // } else if (ds.dbtype == 'CSV') {
      } else if (ds.dbtype == 'DATADICTIONARY') {
      } else if (ds.dbtype == 'DATADICTIONARY_LOGICAL') {
      } else if (ds.dbtype == 'TABLEAU') {
      } else if (ds.dbtype == 'DB2') {
        ds.dbport = '50000'

        this.inputDBname = '数据库'
        this.dbplaceHolder = '请输入数据库名称,再点击测试'
      } else if (ds.dbtype === 'DB2I') {
        this.showDbport = false
        this.requireDbport = false
        ds.dbport = ''
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

        this.portText = 'Zookeeper端口'
      } else if (ds.dbtype === 'TERADATA') {
        ds.dbport = '1025'
      }

      if (ds.connectType == 'WebLogic') {
        ds.dbport = '7001'
        this.testSuccessed = true
      }

      if (this.isFileData) {
        this.testSuccessed = true
        this.requireDbport = false
        this.showDbport = false
        ds.versioning = false
        ds.dbport = ''
      }
    },
    colDupTest(rule, value, callback) {
      let ifDup = false
      for (const key in this.colType) {
        if (value && key !== rule.field && value === this.colType[key]) {
          ifDup = true
        }
      }
      this.hasDup = ifDup
      if (rule.required && !value) {
        callback(new Error('该项为必填项'))
      } else if (ifDup) {
        callback(new Error('字段名称不能重复使用'))
      } else {
        callback()
      }
    },
    getColumnValue() {
      const result = {}
      for (const key in this.colType) {
        result[this.colType[key]] = true
      }
      return result
    },
    // test 测试数据源
    testDataSource() {
      this.disableTest = true
      const self = this
      const ds = this.dsform
      const formatPara = {
        isOracle: this.isOracle(),
        AuthenticationType: this.AuthenticationType,
        requireDbport: this.requireDbport,
        dbNameRequ: this.dbNameRequ,
        userPasswordRequ: this.userPasswordRequ,
        requireDataZone: this.requireDataZone,
        ESwithSsl: this.ESwithSsl,
        hasFunction: this.hasFunction,
        isFileData: false,
        isEditing: false,
      }
      const json = this.formatDataSource(
        _.cloneDeep(this.dsform),
        true,
        formatPara
      )
      if (!json) {
        this.disableTest = false
        this.$message.error({
          title: '创建失败',
          message: '信息填写不完整',
        })
        return
      }
      let url = self.BASE_URL + 'models/connection/test'
      if (ds.dbtype === 'HBASE') {
        const paraObj = {
          ScanSize: ds.ScanSize || 1000,
          Encoding: ds.Encoding || 'UTF-8',
        }
        url += '?options=' + encodeURIComponent(JSON.stringify(paraObj))
      }
      // test
      const handleTestSuccess = () => {
        this.testSuccessed = true
        self.showSuccess(this.$t('system.job.datasourceTestSucceed'))
        this.disableTest = false
      }
      const handleTestFailure = () => {
        this.testSuccessed = false
        this.disableTest = false
      }
      if (this.hasSchema) {
        self.getSchemas(
          json,
          () => {
            handleTestSuccess()
            if (this.showDbName) {
              this.getDbName(json)
            }
          },
          handleTestFailure
        )
      } else if (this.showDbName) {
        this.getDbName(
          json,
          () => {
            handleTestSuccess()
          },
          handleTestFailure
        )
      } else {
        self.$http
          .post(url, json)
          .then(res => {
            handleTestSuccess()
          })
          .catch(e => {
            this.$showFailure(e)
            handleTestFailure()
          })
      }
    },
    getDbName(json, successcallback, failureCallback) {
      this.$http
        .put(this.$url + '/service/models/re/dbs', json)
        .then(res => {
          successcallback && successcallback()
          this.dataBaseNames = res.data
            .split(';')
            .filter(item => item.length > 0)
          this.disableTest = false
          if (!this.dsEditing && !this.dsform.dbname) {
            if (json.type !== 'TERADATA') {
              this.dsform.dbname = this.dataBaseNames[0]
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
    // 判断工具
    isOracle() {
      var self = this
      var ds = self.dsform
      return ds.dbtype == 'ORACLE'
    },
    formatDataSource(
      ds,
      isTest,
      {
        isFileData,
        isOracle,
        isEditing,
        AuthenticationType,
        requireDbport,
        dbNameRequ,
        userPasswordRequ,
        ESwithSsl,
        requireDataZone,
        hasFunction,
      }
    ) {
      /**
       * AuthenticationType: 连接方式
       * requireDbport: 是否需要填写端口
       * dbNameRequ: 是否需要填写数据库名称
       * userPasswordRequ: 是否需要用户名密码
       * requireDataZone: 是否需要填数据区域
       */
      if (userPasswordRequ !== false) {
        userPasswordRequ = true
      }
      AuthenticationType = parseInt(AuthenticationType)
      let json = {}
      if (isTest) {
        json.name = ds.name
      }
      json.sourceName = ds.displayName

      json['@class'] = 'com.datablau.dam.data.dto.DatasourceProperties'
      json.type = ds.dbtype
      json.versioning = ds.versioning
      const currentdate = new Date()
      json.createTime = moment(currentdate).format('YYYY-MM-DD HH:mm:ss')
      json.connectType = ds.connectType
      json.parameterMap = {}
      if (ds.TagIds || (Array.isArray(ds.TagIds) && ds.TagIds.length === 0)) {
        json.parameterMap.TagIds = ds.TagIds.join(',')
      }
      json.categoryId = ds.categoryId
      json.categoryName = ds.categoryName
      json.modelCategoryId = ds.modelCategoryId
      json.latestVersion = 'version_1'
      json.parameterMap.CommentToLogicalName = ds.CommentToLogicalName
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

        // json.parameterMap.ScanSize = ds.ScanSize + '';
        // json.parameterMap.Encoding = ds.Encoding;
        userPasswordRequ = false
        if (!ds.ServicePrincipal) {
          AuthenticationType = 2
        }
      }
      if (isFileData) {
        json.parameterMap.FileNames = ds.fileName
        json.parameterMap.FilePath = ds.filePath
        // json.parameterMap.Delimiter = ",";
        // if(ds.delimiter){
        //   json.parameterMap.Delimiter = ds.delimiter;
        // }
        if (ds.IsFirstRowColumnName) {
          json.parameterMap.IsFirstRowColumnName =
            ds.IsFirstRowColumnName === 't'
        }
      } else {
        if (ds.connectType == 'WebLogic') {
          json.parameterMap.JNDIName = ds.JNDIName
        } else {
          json.parameterMap.HostServer = ds.hostname
          json.parameterMap.PortNumber = ds.dbport
          json.parameterMap.AuthenticationType = AuthenticationType - 0
          if (AuthenticationType === 2) {
            delete json.parameterMap.AuthenticationType
          }
          if (isOracle) {
            json.parameterMap.DatabaseName = ds.extraDbPara + ':' + ds.dbname
          } else {
            json.parameterMap.DatabaseName = ds.dbname
          }
        }

        json.parameterMap.ViewFiltered = ds.ViewFiltered
        json.parameterMap.ProceduresFiltered = ds.ProceduresFiltered
        if (hasFunction) {
          json.parameterMap.FunctionFiltered = ds.FunctionFiltered
        }
      }
      json.credentialInfo = {}
      if (AuthenticationType === 0) {
        json.credentialInfo.user = ds.username
        json.credentialInfo.password = ds.password
      } else {
        json.parameterMap.ServicePrincipal = ds.ServicePrincipal
        json.parameterMap.UserPrincipal = ds.UserPrincipal
        json.parameterMap.KeyTabPath = ds.KeyTabPath
      }

      const c = json.credentialInfo
      const p = json.parameterMap
      const showErrMsg = item => {
        // this.$message.error({
        //   title: "创建失败",
        //   message: "信息填写不完整",
        // });
        json = null
        console.error(item + '不能为空')
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
        if (!p.HostServer || (requireDbport && !p.PortNumber)) {
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
      return json
    },
    getConnectionInfo() {
      const self = this
      const ds = this.dsform
      const formatPara = {
        isOracle: this.isOracle(),
        AuthenticationType: this.AuthenticationType,
        requireDbport: this.requireDbport,
        dbNameRequ: this.dbNameRequ,
        userPasswordRequ: this.userPasswordRequ,
        requireDataZone: this.requireDataZone,
        ESwithSsl: this.ESwithSsl,
        hasFunction: this.hasFunction,
        isFileData: false,
        isEditing: false,
      }
      const json = this.formatDataSource(
        _.cloneDeep(this.dsform),
        false,
        formatPara
      )
      return json
    },
    getResult() {
      this.connectionInfo = this.getConnectionInfo()
      const result = {
        colMap: this.colType,
        sql: this.sqlContent,
        connectionInfo: this.connectionInfo,
      }
      return result
    },

    // old
    handleDbnameClick() {
      this.showAllDbname = true
    },
    handleDbnameChange() {
      this.showAllDbname = false
    },
    handleClearDbname() {
      this.$refs.dbname.focus()
    },
    addDataSource() {
      this.uploadingData = true
      if (this.dbNameRequ && !this.dsform.dbname) {
        this.$message.error({
          title: '创建失败',
          message: '信息填写不完整',
        })
        this.uploadingData = false
        return
      }
      const para = {
        schemaSelected: this.schemaSelected,
        AuthenticationType: this.AuthenticationType,
        requireDbport: this.requireDbport,
        dbNameRequ: this.dbNameRequ,
        userPasswordRequ: this.userPasswordRequ,
        ESwithSsl: this.ESwithSsl,
        requireDataZone: this.requireDataZone,
        dsEditing: this.dsEditing,
        hasFunction: this.hasFunction,
      }

      // this.$bus.$emit("changeDs", this.dsform, para);
    },
    // 获取信息
    getSchemas(json, successcallback, failureCallback) {
      this.$http
        .put(this.$url + '/service/models/re/schemas', json)
        .then(res => {
          successcallback && successcallback()
          this.dbConnected = true
          if (res.data) {
            this.schemas = res.data.split(';').filter(item => item.length > 0)
          }
          if (!this.dsEditing) {
            this.getCurrentSchema(json)
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
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initDs(connectionInfo) {
      var self = this
      self.isEditing = true
      const ds = {}
      ds.dbtype = connectionInfo.type
      ds.connectType = connectionInfo.connectType
      ds.hostname = connectionInfo.parameterMap.HostServer
      ds.dbport = connectionInfo.parameterMap.PortNumber
      ds.dbname = connectionInfo.parameterMap.DatabaseName
      if (
        connectionInfo.parameterMap.CommentToLogicalName &&
        connectionInfo.parameterMap.CommentToLogicalName == 'true'
      ) {
        ds.CommentToLogicalName = true
      } else {
        ds.CommentToLogicalName = false
      }

      ds.versioning = connectionInfo.versioning
      if (ds.connectType == 'WebLogic') {
        ds.JNDIName = connectionInfo.parameterMap.JNDIName
        ds.dbname = [connectionInfo.parameterMap.DatabaseName]
      }
      if (ds.dbtype == 'ORACLE') {
        if (ds.dbname.indexOf(':') > 0) {
          var part = ds.dbname.split(':')
          ds.extraDbPara = part[0]
          ds.dbname = part[1]
        }
      }
      this.dsform = ds
    },
  },
  watch: {
    jobContent: {
      deep: true,
      handler: function (newVal) {
        this.dataInit(newVal)
      },
    },
    couldConfirm: {
      immediate: true,
      handler: function (newVal) {
        this.$emit('testResultChange', !!newVal)
      },
    },
  },
}
</script>

<style lang="scss">
.job-para-container {
  .sql-content {
    max-width: 600px;

    textarea {
      width: 100%;
    }
  }
}
</style>
