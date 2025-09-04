import HTTP from '@/http/main.js'
import createSql from './createSQL.vue'

export default {
  data() {
    const expireDate = new Date().getTime() - 0 + 1000 * 3600 * 24 * 30
    return {
      user: '', // TODO 将要替换为全局的 $user

      // viewContent: {
      //   name: '',
      //   description: '',
      //   sql: '',
      //   columns: [],
      //   dependsOn: '',
      //   expire: '',
      // },

      messageId: '',
      tablePath: '',
      bindTableVds: '',
      formContent: {
        name: '',
        description: '',
        expire: expireDate,
        virds: [],
        bindTableObjectId: '',
      },
      sqlContent: '',
      choosedModelId: '', // 所属实际数据源
      columnsArr: [],
      virdsArr: [], // 虚拟数据源
      modelName: '',
      tableId: '', // 数据库表
      tablesArr: [],
      formRuls: {
        name: [
          {
            required: true,
            validator: this.viewNameVali,
            trigger: 'change',
          },
        ],
      },

      choosedTableName: '',

      operaterArr: [
        { label: '>', value: '>' },
        { label: '>=', value: '>=' },
        { label: '<', value: '<' },
        { label: '<=', value: '<=' },
        { label: '<>', value: '<>' },
      ],
      viewColumns: [],
      exampData: [],

      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        },
        shortcuts: [
          {
            text: '三天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 3)
              picker.$emit('pick', date)
            },
          },
          {
            text: '一周',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            },
          },
          {
            text: '一月',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 30)
              picker.$emit('pick', date)
            },
          },
        ],
      },
      // vdsMap: {}, // 虚拟数据源, name -> item

      showCreateSql: false,
      testOk: false,
      schemaName: '',
      showTestResult: false,
      testState: 'notStart',
      shareable: false,
    }
  },
  components: {
    createSql,
  },
  props: ['choosedObjectId'],
  computed: {
    tableChangeDisabled() {
      return !!(this.choosedObjectId || this.choosedObjectId === 0)
    },
    createViewable() {
      return (
        this.formContent.name &&
        this.sqlContent &&
        this.formContent.virds &&
        this.testOk
      )
    },
  },
  mounted() {
    this.getQuery()
    this.dataInit(this.tableId)
  },
  methods: {
    viewNameVali(rule, value, callback) {
      if (!value) {
        callback(new Error('视图名称必须填写'))
      } else if (/^[a-zA-Z0-9_]*$/.test(value)) {
        callback()
      } else {
        callback(new Error('视图名称只能包含字母、数字与下划线"_"'))
      }
    },
    getTables(modelId, tableId) {
      HTTP.getAllTablesFromDam({
        succesedCallback: data => {
          const arr = data.content
          if (arr && Array.isArray(arr)) {
            this.tablesArr = arr
          }
          if (tableId) {
            this.formContent.bindTableObjectId = tableId - 0
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: {
          modelId: modelId,
        },
      })
    },
    dataInit(tableId) {
      tableId = tableId || this.choosedObjectId
      this.getTableData()
        .then(res => {
          const data = res.data
          this.schemaName = data.schemaName
          this.modelName = data.modelName
          this.choosedTableName = data.physicalName || ''
          this.choosedModelId = data.modelId
          this.getTables(data.modelId, tableId)
          // let num = parseInt(Math.random() * 1000) + '';
          const da = new Date()
          const num = '' + da.getFullYear() + (da.getMonth() + 1) + da.getDate()
          this.formContent.name = data.physicalName + '_' + num
          // this.sqlContent = 'SELECT * FROM ' + this.modelName + '.' + data.physicalName;
          if (data.schemaName) {
            this.sqlContent =
              'SELECT * FROM ' + this.schemaName + '.' + data.physicalName
          } else {
            this.sqlContent = 'SELECT * FROM ' + data.physicalName
          }
          // if (data.schemaName) {
          //   this.sqlContent = 'SELECT * FROM ' + this.modelName + '.' + data.schemaName + '.' + data.physicalName;
          // }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableData(tableId) {
      tableId = tableId || this.choosedObjectId
      return this.$http.get(
        `${this.$url}/service/entities/${this.tableId}/summary`
      )
    },
    handleCreateViews() {
      // 创建视图 参数
      // String name  (视图名称，全局唯一)
      // String description
      // String sql   (创建view的sql语句)
      // List<VColumn> columns  (view对应的列)
      // Set<String> dependsOn  (这里是上面虚拟数据源的名称)
      // Date expire (过期时间)
      // bindObjectId 绑定表
      const obj = {
        name: this.formContent.name,
        description: this.formContent.description,
        sql: this.sqlContent,
        dependsOn: [],
        expire: this.formContent.expire,
        columns: this.viewColumns,
        modelId: this.choosedModelId,
        shareable: this.shareable,
      }
      if (this.formContent.bindTableObjectId) {
        obj.bindObjectId = this.formContent.bindTableObjectId
      }
      HTTP.createView({
        succesedCallback: data => {
          this.$showSuccess('创建视图成功')
          this.skip2Tablepage('003')
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        postBody: obj,
      })
    },
    handletestCreateViews() {
      // 创建视图 参数
      // String name  (视图名称，全局唯一)
      // String description
      // String sql   (创建view的sql语句)
      // List<VColumn> columns  (view对应的列)
      // Set<String> dependsOn  (这里是上面虚拟数据源的名称)
      // Date expire (过期时间)
      const obj = {
        dependsOn: this.formContent.virds,
        sql: this.sqlContent,
        modelId: this.choosedModelId,
      }
      HTTP.testCreateView({
        succesedCallback: data => {
          this.viewColumns = data.columns
          this.testState = 'success'
          // this.$showSuccess('测试成功');
          this.testOk = true
          // this.exampData = data.data;
          const arr = data.data
          const result = []
          if (arr && Array.isArray(arr)) {
            arr.forEach(item => {
              const obj = {}
              if (item && Array.isArray(item)) {
                item.forEach((item2, index) => {
                  const attr = this.viewColumns[index].name
                  obj[attr] = item2
                })
              }
              result.push(obj)
            })
            this.exampData = result
            this.showTestResult = true
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
          this.testState = 'fail'
        },
        postBody: obj,
      })
    },
    handleCancle() {
      window.history.back()
      // this.skip2Tablepage();
    },

    handleTestModel1() {
      this.testState = 'start'
      this.handletestCreateViews()
    },
    handleTestModel2() {
      this.handletestCreateViews()
    },
    handleCreateSQL() {
      this.showCreateSql = true
      if (this.$refs.createSql && this.$refs.createSql.dataInit) {
        this.$refs.createSql.dataInit()
      }
    },
    setSql(sql) {
      this.sqlContent = sql
      this.showCreateSql = false
    },
    getQuery() {
      const query = this.$route.query
      if (query.objectId || query.objectId === 0) {
        this.tableId = query.objectId - 0
      }
      if (query.messageId || query.messageId === 0) {
        this.messageId = query.messageId
      }
      if (query.tablePath) {
        this.tablePath = query.tablePath
      }
    },
    skip2Tablepage() {
      const query = {}
      if (this.tablePath === 'metadata') {
        query.objectId = this.tableId
        this.$router.push({
          path: '/main/meta',
          query: query,
        })
      } else if (this.tablePath === 'myItem') {
        query.catalogPath = this.tablePath
        query.objectId = this.tableId
        query.keyword = ''
        query.type = 'TABLE'
        this.$router.push({
          name: 'myItem',
          query: query,
        })
      } else {
        this.$router.push('/userModalForDdc?currentNav=myTodo')
      }
    },
  },
  watch: {
    sqlContent() {
      this.testOk = false
    },
  },
}
