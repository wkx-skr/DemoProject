<template>
    <div class="database-add">
      <datablau-form-submit>
        <div class="database-contDeatil">
          <datablau-form
              label-position="right"
              ref="form"
              :model="form"
              :rules="rules"
              size="mini"
              >
              <el-form-item label="数据源" prop="dataBaseValue">
                  <datablau-select
                      v-model="form.dataBaseValue"
                      clearable
                      filterable
                      @change="dataBaseValueChange"
                      :disabled="this.editDetail ? true :false"
                  >
                      <el-option
                      v-for="item in form.dataBase"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      ></el-option>
                  </datablau-select>
              </el-form-item>
              <el-form-item label="驱动" prop="dataBaseValue" v-if="form.dataBaseValue">
                  <datablau-select
                      v-model="form.driverId"
                      filterable
                      @change="driverIdChange"
                  >
                      <el-option
                      v-for="item in form.driverIdOption"
                      :key="item.id"
                      :label="item.driverName"
                      :value="item.id"
                      ></el-option>
                  </datablau-select>
              </el-form-item>
              <el-form-item label="数据源名称" prop="datasourceName">
                  <datablau-input v-model="form.datasourceName" placeholder="请输入数据源名称" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="所属系统" prop="modelCategories">
                  <datablau-select
                      v-model="form.modelCategories"
                      clearable
                      filterable
                      placeholder="请选择"
                      :no-data-text="'当前用户没有所属系统，请联系管理员'"
                      style="display: inline-block;"
                  >
                      <el-option
                      v-for="item in modelCategoriesListIsSelf"
                      :key="item.categoryId"
                      :label="item.categoryName"
                      :value="item.categoryId"
                      ></el-option>
                  </datablau-select>
                  <!-- <datablau-button
                    @click="changeCategory"
                    v-if="editDetail"
                    style="display: inline-block;margin-left: 10px;"
                  >
                    {{ $t('common.button.modify') }}
                  </datablau-button> -->
              </el-form-item>
              <!-- <el-form-item
                  label="标签"
                  size="mini"
                >
                  <el-select
                    test-name="add_datasource_tag_sel"
                    class="page-form-select"
                    v-model="form.tagIds"
                    multiple
                    filterable
                    @focus="openChooseTag"
                    ref="tagSelect"
                    style="display: inline-block;"
                  >
                    <el-option
                      v-for="item in tagMap"
                      style="max-width: 460px"
                      :label="item.name"
                      :value="item.tagId"
                      :key="item.tagId"
                    ></el-option>
                  </el-select>
                  <datablau-button
                    test-name="add_datasource_tag_btn"
                    @click="handleAddTag"
                    size="small"
                    type="secondary"
                    style="margin-left: 10px;display: inline-block;"
                  >
                    选择
                  </datablau-button>
                </el-form-item> -->
              <!-- <el-form-item label="描述" prop="description">
                  <datablau-input
                  style="width: 500px"
                  v-model="form.description"
                  placeholder="请输入描述"
                  type="textarea"
                  ></datablau-input>
              </el-form-item> -->
              <el-form-item v-if="form.dataBaseValue !== 'ATHENA'" label="IP主机名" prop="ip">
                  <datablau-input v-model="form.ip" placeholder="请输入IP主机名" clearable></datablau-input>
              </el-form-item>
              <el-form-item v-if="form.dataBaseValue !== 'ATHENA'"  label="端口" prop="port">
                  <datablau-input v-model="form.port" placeholder="请输入端口" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="用户名" prop="username">
                  <datablau-input v-model="form.username" placeholder="请输入用户名" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="密码" prop="userpassword">
                  <datablau-input v-model="form.userpassword" type="password" autocomplete="off" placeholder="请输入密码" clearable></datablau-input>
              </el-form-item>
              <el-form-item v-if="form.dataBaseValue === 'ATHENA'" label="AwsRegion" prop="awsRegion">
                  <datablau-input v-model="form.awsRegion" placeholder="请输入AwsRegion" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="数据库名" prop="databaseName" :rules="[{ required: isShow, message: '请输入数据库名', trigger: 'blur' }]">
                  <datablau-input v-model="form.databaseName" placeholder="请输入数据库名" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="Schema" prop="schema" v-if="this.form.dataBaseValue === 'SQLSERVER' || this.form.dataBaseValue === 'POSTGRESQL' || this.form.dataBaseValue === 'DB2' || this.form.dataBaseValue === 'ORACLE' || this.form.dataBaseValue === 'GAUSSDB'">
                <datablau-select
                  size="mini"
                  v-model="form.schema"
                  placeholder="请选择Schema"
                  multiple
                  filterable
                  allow-create
                  :disabled="testDisabled"
                >
                  <el-option
                    v-for="(val,index) in offlineSchemasArr"
                    :label="val.label"
                    :key="index"
                    :value="val.value"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item v-if="form.dataBaseValue === 'ORACLE'" label="服务名或SID" prop="oracleConnectType">
                  <datablau-radio
                  v-model="form.oracleConnectType"
                  @change="oracleConnectTypeChange"
                  >
                  <el-radio label="ORACLE_SERVICE_NAME">服务名</el-radio>
                  <el-radio label="ORACLE_SID">SID</el-radio>
                  </datablau-radio>
              </el-form-item>
              <el-form-item label="VC名称"  :rules="gbaseVcChecked ? [{required: true, message: '请输入VC名称', trigger: 'blur'}] : [{required: false}]" v-if="form.dataBaseValue === 'GBASE'">
                <datablau-checkbox @change="gbaseVcCheckedChange" :checkboxType="'single'" v-model="gbaseVcChecked">
                  指定VC登录
                </datablau-checkbox>
                  <datablau-input
                  style="width: 500px"
                  v-model="gbaseVc"
                  clearable
                  placeholder="请输入VC名称"
                  :disabled="!gbaseVcChecked"
                  ></datablau-input>
              </el-form-item>
              <el-form-item label="jdbc连接数" prop="jdbcformat">
                  <datablau-input
                  style="width: 500px"
                  v-model="form.jdbcformat"
                  :placeholder="jdbcformatPlaceholder"
                  type="textarea"
                  ></datablau-input>
              </el-form-item>

          </datablau-form>
        </div>
      <template slot="buttons">
        <datablau-button @click="close"> {{ $t('common.button.cancel') }} </datablau-button>
        <datablau-button type="important" @click="addTest">测试连接</datablau-button>
        <!-- <datablau-button type="important" :disabled="testDisabled" @click="addSave('runImmediately')">立即运行</datablau-button> -->
        <datablau-button type="important" @click="addSave" :disabled="testDisabled">{{ $t('common.button.ok') }}</datablau-button>
      </template>
      </datablau-form-submit>
      <choose-tag
        :tagTree="tagTree"
        :tagMap="tagMap"
        ref="chooseTag"
        :oldChoosedIds="form.TagIds"
        @choosedTagChanged="choosedTagChanged"
      ></choose-tag>
      <datablau-dialog
        :title="$t('meta.dataSource.edit.modifySystem')"
        :visible.sync="dialogChangeidVisible"
        width="400px"
        append-to-body
        class="few-content"
      >
        <el-select
          v-model="categoryIdChanged"
          filterable
          clearable
          size="small"
          style="width: 100%"
        >
          <el-option
            v-for="c in modelCategoriesListIsSelf"
            :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
            :value="c.categoryId"
            :key="c.categoryId"
            :disabled="!c.isSelf"
          ></el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
          <datablau-button @click="dialogChangeidVisible = false" size="mini">
            {{ $t('common.button.close') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="changeCategoryId"
            size="mini"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </span>
      </datablau-dialog>
    </div>
  </template>

<script>
import HTTP from '@/resource/http.js'
import chooseTag from './chooseTag.vue'

export default {
  components: {
    chooseTag
  },
  beforeCreate () {
  },
  mounted () {
    this.getModelCategories()
    if (this.editDetail && this.editDetail.id) {
      this.$http
        .get(`${HTTP.$dddServerUrl}dataSourceSync/${this.editDetail.id}?env=test`)
        .then(res => {
          this.getDriverIdOption(res.data.data.type)
          let detail = res.data.data
          this.dsId = res.data.data.id
          this.form = {
            dataBaseValue: detail.type,
            datasourceName: detail.name,
            ip: detail.host,
            port: detail.port,
            username: detail.userName,
            userpassword: detail.password,
            databaseName: detail.database,
            jdbcformat: detail.other ? JSON.stringify(detail.other) : '',
            oracleConnectType: detail.connectType,
            modelCategories: this.editDetail.categoryId,
            driverId: this.editDetail.driverId,
            modelId: this.editDetail.modelId
          }
          if (detail.type === 'POSTGRESQL' || detail.typeue === 'ATHENA') {
            this.isShow = false
            this.$refs['form'].clearValidate('databaseName')
          } else {
            this.isShow = true
          }
          if ((detail.type === 'SQLSERVER' || detail.type === 'POSTGRESQL' || detail.type === 'DB2' || detail.type === 'ORACLE' || detail.type === 'GAUSSDB') && this.editDetail.parameterMap.SelectedSchemas) {
            this.$set(this.form, 'schema', this.editDetail.parameterMap.SelectedSchemas.split(';'))
          }
          if (detail.type === 'GBASE' && this.editDetail.parameterMap.GBaseMppVcName) {
            this.gbaseVc = this.editDetail.parameterMap.GBaseMppVcName
            this.gbaseVcChecked = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    } else {
      this.getDriverIdOption('MYSQL')
    }
    // this.getTags()
  },
  beforeDestroy () {
  },
  props: {
    edit: {
      type: Boolean,
      default: false
    },
    editDetail: {
      type: Object
    }
  },
  data () {
    return {
      form: {
        dataBase: [{
          value: 'MYSQL',
          label: 'MYSQL',
          defaultPort: 3306
        }, {
          value: 'POSTGRESQL',
          label: 'POSTGRESQL',
          defaultPort: 5432
        },
        {
          value: 'HIVE',
          label: 'HIVE/IMPALA',
          defaultPort: 10000
        },
        // {
        //   value: 'SPARK',
        //   label: 'SPARK',
        //   defaultPort: 10015
        // },
        {
          value: 'CLICKHOUSE',
          label: 'CLICKHOUSE',
          defaultPort: 8123
        }, {
          value: 'ORACLE',
          label: 'ORACLE',
          defaultPort: 1521
        }, {
          value: 'SQLSERVER',
          label: 'SQLSERVER',
          defaultPort: 1433
        }, {
          value: 'DB2',
          label: 'DB2',
          defaultPort: 50000
        },
        // {
        //   value: 'PRESTO',
        //   label: 'PRESTO',
        //   defaultPort: 8080
        // }, {
        //   value: 'REDSHIFT',
        //   label: 'REDSHIFT',
        //   defaultPort: 5439
        // }, {
        //   value: 'ATHENA',
        //   label: 'ATHENA',
        //   defaultPort: 0
        // },
        {
          value: 'GBASE',
          label: 'GBASE',
          defaultPort: 5258
        },
        { label: 'OceanBase',
          value: 'OCEANBASE',
          defaultPort: 3306
        },
        { label: 'OceanBase-Oracle',
          value: 'OCEANBASEO',
          defaultPort: 1521
        },
        { label: 'STARROCKS',
          value: 'STARROCKS',
          defaultPort: 9030
        },
        { label: 'GAUSSDB',
          value: 'GAUSSDB',
          defaultPort: 5432
        },
        { label: 'INCEPTOR',
          value: 'INCEPTOR',
          defaultPort: 10000
        }],
        dataBaseValue: 'MYSQL',
        datasourceName: '',
        description: '',
        ip: '',
        port: '3306',
        username: '',
        userpassword: '',
        databaseName: '',
        jdbcformat: '',
        awsRegion: '',
        oracleConnectType: 'ORACLE_SERVICE_NAME',
        modelCategories: '',
        tagIds: null,
        driverIdOption: null,
        driverId: null,
        schema: []
      },
      jdbcformatPlaceholder: `请输入格式为 {"key1":"value1","key2":"value2"...} 连接参数`,
      rules: {
        dataBaseValue: [
          { required: true, message: '请选择数据源', trigger: 'change' }
        ],
        modelCategories: [
          { required: true, message: '请选择所属系统', trigger: 'change' }
        ],
        datasourceName: [
          { required: true, message: '请输入数据源名称', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入IP主机名', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        // userpassword: [
        //   { required: true, message: '请输入密码', trigger: 'blur' }
        // ],
        oracleConnectType: [
          { required: true, message: '请选择活动资源', trigger: 'change' }
        ],
        awsRegion: [
          { required: true, message: '请输入AwsRegion', trigger: 'blur' }
        ]
        // databaseName: [
        //   { required: isShow, message: '请输入数据库名', trigger: 'blur' }
        // ]
        // schema: [
        //   { required: true, message: '请选择Schema', trigger: 'blur' }
        // ]
      },
      modelCategoriesList: [],
      testDisabled: true,
      tagTree: [],
      tagMap: {},
      dsId: null,
      isShow: true,
      modelCategoriesListIsSelf: [],
      offlineSchemasArr: [],
      categoryIdChanged: '',
      dialogChangeidVisible: false,
      gbaseVc: '',
      gbaseVcChecked: false

    }
  },
  methods: {
    gbaseVcCheckedChange (val) {
      if (val === false) {
        this.gbaseVc = ''
      }
    },
    changeCategoryId () {
      const self = this
      this.dialogChangeidVisible = false
      self.$http
        .put(
          `${HTTP.$damServerUrl}` +
            'models/' +
            this.form.modelId +
            '/categories/' +
            this.categoryIdChanged
        )
        .then(res => {
          this.$message.success({
            message: this.$t('meta.dataSource.edit.sysModified')
          })
          this.form.modelCategories = this.categoryIdChanged
          this.$bus.$emit('changeDs')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeCategory () {
      this.dialogChangeidVisible = true
      this.categoryIdChanged = this.form.modelCategories
    },
    openChooseTag () {
      this.$refs.tagSelect.blur()
      this.handleAddTag()
    },
    handleAddTag () {
      this.$refs.chooseTag && this.$refs.chooseTag.showDialog()
    },
    // 关于 tag
    getTags (callback) {
      this.$http
        .get(`${HTTP.$damServerUrl}` + 'tags/')
        .then(res => {
          const tagTree = []
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                tagTree.push(item)
              }
            })
            this.tagMap = map
            this.tagTree = tagTree
            if (this.editDetail) {
              this.form.tagIds = this.editDetail.connectionInfo.parameterMap.TagIds ? this.editDetail.connectionInfo.parameterMap.TagIds.split(',').map(Number) : []
            }
          }
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback()
        })
    },
    choosedTagChanged (tagIds) {
      this.form.tagIds = tagIds
    },
    dataBaseValueChange (value) {
      this.form.dataBase.forEach(element => {
        if (element.value === value) {
          this.form.port = element.defaultPort
        }
      })
      this.getDriverIdOption(value)
      if (value === 'POSTGRESQL' || value === 'ATHENA') {
        this.isShow = false
        this.$refs['form'].clearValidate('databaseName')
      } else {
        this.isShow = true
      }
    },
    driverIdChange () {

    },
    getDriverIdOption (type) {
      this.$http
        .post(`${this.$baseUrl}/drivers/getDriverByType?type=${type}`)
        .then(res => {
          this.$set(this.form, 'driverIdOption', res.data)
          if (!this.editDetail) {
            res.data.forEach(element => {
              if (element.defaultDriver === true) {
                this.$set(this.form, 'driverId', element.id)
              }
            })
          }
          if (res.data.length === 0) {
            this.$set(this.form, 'driverId', null)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    oracleConnectTypeChange () {

    },
    addTest () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          let obj = {
            type: this.form.dataBaseValue,
            name: this.form.datasourceName,
            host: this.form.ip,
            port: this.form.port,
            userName: this.form.username,
            password: this.form.userpassword ? this.$pwEncrypt(this.form.userpassword) : '',
            database: this.form.databaseName,
            other: this.form.jdbcformat === '' ? null : JSON.parse(this.form.jdbcformat),
            env: 'test',
            modelCategoryId: this.form.modelCategories,
            driverId: this.form.driverId
          }
          if (this.form.tagIds) {
            obj.tagIds = this.form.tagIds.toString()
          }
          if (this.form.dataBaseValue === 'SQLSERVER' || this.form.dataBaseValue === 'POSTGRESQL' || this.form.dataBaseValue === 'DB2' || this.form.dataBaseValue === 'ORACLE' || this.form.dataBaseValue === 'GAUSSDB') {
            obj.isSchema = '1'
          }
          if (this.form.dataBaseValue === 'ORACLE') {
            obj.connectType = this.form.oracleConnectType
          }
          if (this.form.dataBaseValue === 'GBASE' && this.gbaseVcChecked === true) {
            obj.gbaseVc = this.gbaseVc
          }
          this.offlineSchemasArr = []
          this.$http
            .post(`${HTTP.$dddServerUrl}dataSourceSync/verify`, obj)
            .then(res => {
              if (res.data.status === 200) {
                if (this.form.dataBaseValue === 'SQLSERVER' || this.form.dataBaseValue === 'POSTGRESQL' || this.form.dataBaseValue === 'DB2' || this.form.dataBaseValue === 'ORACLE' || this.form.dataBaseValue === 'GAUSSDB') {
                  const offlineSchemasArr = res.data.data.dam
                  offlineSchemasArr.forEach(element => {
                    this.offlineSchemasArr.push({
                      label: element,
                      value: element
                    })
                  })
                  if (this.form.schema.length === 0) {
                    this.form.schema.push(this.offlineSchemasArr[0].value)
                  }
                }
                this.$message.success('连接成功')
                this.$nextTick(() => {
                  this.testDisabled = false
                })
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    addSave (runImmediately) {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          let obj = {
            type: this.form.dataBaseValue,
            name: this.form.datasourceName,
            host: this.form.ip,
            port: this.form.port,
            userName: this.form.username,
            password: this.form.userpassword ? this.$pwEncrypt(this.form.userpassword) : '',
            database: this.form.databaseName,
            other: this.form.jdbcformat === '' ? null : JSON.parse(this.form.jdbcformat),
            env: 'test',
            modelCategoryId: this.form.modelCategories,
            driverId: this.form.driverId
          }
          if (this.form.dataBaseValue === 'GBASE' && this.gbaseVcChecked === true) {
            obj.gbaseVc = this.gbaseVc
          }
          if (this.form.tagIds) {
            obj.tagIds = this.form.tagIds.toString()
          }
          if (this.form.dataBaseValue === 'SQLSERVER' || this.form.dataBaseValue === 'POSTGRESQL' || this.form.dataBaseValue === 'DB2' || this.form.dataBaseValue === 'ORACLE' || this.form.dataBaseValue === 'GAUSSDB') {
            obj.schema = this.form.schema.join(';')
          }
          if (this.form.dataBaseValue === 'ORACLE') {
            obj.connectType = this.form.oracleConnectType
          }
          if (this.dsId) {
            obj.id = this.dsId
            this.$http
              .put(`${HTTP.$dddServerUrl}dataSourceSync`, obj)
              .then(res => {
                this.$message.success('修改成功')
                if (runImmediately === 'runImmediately') {
                  this.$http
                    .get(`${HTTP.$damServerUrl}datablau_jobs/resources/${this.editDetail.modelId}/types/1/detail?types=MetadataSyncJobDescriptor`)
                    .then(response => {
                      const self = this
                      let jobId = response.data[0].jobId
                      let enableJob = {
                        jobId: jobId,
                        damDatasourceId: this.editDetail.modelId
                      }
                      this.$emit('setJobStatus', this.editDetail.modelId)
                      this.$emit('enableJob', JSON.stringify(enableJob))
                      this.close()
                    })
                    .catch(e => {
                      this.$showFailure(e)
                    })
                } else {
                  this.close()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            this.$http
              .post(`${HTTP.$dddServerUrl}dataSourceSync`, obj)
              .then(res => {
                this.$message.success('创建成功')
                if (runImmediately === 'runImmediately') {
                  this.$http
                    .get(`${HTTP.$damServerUrl}datablau_jobs/resources/${res.data.data.damDatasourceId}/types/1/detail?types=MetadataSyncJobDescriptor`)
                    .then(response => {
                      const self = this
                      let jobId = response.data[0].jobId
                      let enableJob = {
                        jobId: jobId,
                        damDatasourceId: res.data.data.damDatasourceId
                      }
                      this.$emit('setJobStatus', res.data.data.damDatasourceId)
                      this.$emit('enableJob', JSON.stringify(enableJob))
                      this.close()
                    })
                    .catch(e => {
                      this.$showFailure(e)
                    })
                } else {
                  this.close()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    getModelCategoriesUsers () {
      this.modelCategoriesListIsSelf = []
      this.$http.post(`${HTTP.$damBase}modelCategory/getModelCategoryIdByUsername?username=${this.$store.state.user.name}&appName=DAM `)
        .then(res => {
          this.modelCategoriesList.forEach(item => {
            if (res.data.indexOf(item.categoryId) > -1) {
              item.isSelf = true
              this.modelCategoriesListIsSelf.push(item)
            }
          })
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getModelCategories () {
      this.$http.post(`${HTTP.$damBase}modelCategory/getModelCategories`)
        .then(res => {
          this.modelCategoriesList = res.data
          this.getModelCategoriesUsers()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    close () {
      this.$emit('closeDetail')
    }
  },
  watch: {
    form: {
      immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        this.testDisabled = true
      }
    },
    gbaseVc: {
      immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        this.testDisabled = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.database-add{
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0;
    top: 40px;
    background: #fff;
    z-index: 10;
    .database-contDeatil{
      // padding-top: 40px;
    }
}
</style>
<style lang="scss">
.page-form-select{
  width: 500px;
  .el-input--mini .el-input__inner{
    height: 34px !important;
    line-height: 34px;
    border-radius: 2px;
  }
}
.datablau-messagetip {
  height: auto !important;
}
</style>
