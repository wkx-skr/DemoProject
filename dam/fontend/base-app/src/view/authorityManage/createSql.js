import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      modelName: '',
      tablesArr: [],
      tableMap: {},
      currentTableId: '',
      currentTableName: '',
      contentMessage: '',
      showNoVdsTooltip: false,
      columnsArr: [],

      conditionArr: [
        {
          columnName: '',
          operater: '',
          range: '',
        },
      ],
      operaterArr: [
        { label: '>', value: '>' },
        { label: '>=', value: '>=' },
        { label: '<', value: '<' },
        { label: '<=', value: '<=' },
        { label: '<>', value: '<>' },
      ],

      groupByColunm: [],
      orderByColunm: '',
      orderDesc: false,
      selection: [],
      sqlContent: '',
    }
  },
  props: {
    tableObjectId: {
      type: [Number, String],
      required: true,
    },
    schemaName: {
      type: String,
      default: '',
    },
    getTableData: {
      type: Function,
      default(id) {
        id = id || this.tableObjectId
        return this.$http.get(`${this.$url}/service/entities/${id}/summary`)
      },
    },
    defaultSqlContent: {
      type: String,
      default: '',
    },
  },
  components: {},
  computed: {
    canCreateSql() {
      return this.selection && this.selection.length > 0
    },
    canSubmitSql() {
      return !!this.sqlContent
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      const objectId = this.tableObjectId
      this.conditionArr = [
        {
          columnName: '',
          operater: '',
          range: '',
        },
      ]
      this.groupByColunm = []
      this.orderByColunm = ''
      this.sqlContent = ''
      if (!objectId) {
        return
      }
      this.getTableData(objectId)
        .then(res => {
          const data = res.data
          this.modelName = data.modelName
          this.currentTableName = data.physicalName || ''
          this.currentTableId = data.objectId
          this.getTables(data.modelId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.getColumns(objectId)
      if (this.defaultSqlContent) {
        this.sqlContent = this.defaultSqlContent
      }
    },

    handleTableChange(val) {
      this.getColumns(val)
    },
    handleSelectionChange(val) {
      this.selection = val
    },
    handleAddSQLCondi() {
      const obj = {
        columnName: '',
        operater: '',
        value: '',
      }
      this.conditionArr.push(obj)
    },
    handleRemoveSQLCondi(index) {
      this.conditionArr.splice(index, 1)
    },
    handleCreateSql() {
      if (!this.selection || this.selection.length <= 0) {
        return
      }
      let result = 'SELECT '
      // const tableAlias = 'table1';
      const tableAlias = this.currentTableName
      this.selection.forEach(item => {
        result += tableAlias + '.' + item.physicalName + ', '
      })
      result = result.slice(0, -2)

      if (!this.schemaName) {
        // result += ' FROM ' + this.currentTableName + ' AS ' + tableAlias;
        result += ' FROM ' + this.currentTableName
      } else {
        // result += ' FROM ' + this.schemaName + '.' + this.currentTableName + ' AS ' + tableAlias;
        result += ' FROM ' + this.schemaName + '.' + this.currentTableName
      }

      if (this.conditionArr && this.conditionArr.length > 0) {
        let whereCount = 1
        this.conditionArr.forEach(item => {
          if (item.columnName && item.operater && item.range) {
            if (whereCount === 1) {
              result += ' WHERE '
              whereCount--
            }
            result +=
              tableAlias +
              '.' +
              item.columnName +
              item.operater +
              item.range +
              ' AND '
          }
        })
        if (whereCount === 0) {
          result = result.slice(0, -5)
        }
      }

      if (
        this.groupByColunm &&
        Array.isArray(this.groupByColunm) &&
        this.groupByColunm.length > 0
      ) {
        result += ' GROUP BY ' + this.groupByColunm.join(',')
      }

      // if (this.orderByColunm && Array.isArray(this.orderByColunm) && this.orderByColunm.length > 0) {
      //   result += ' ORDER BY ' + this.orderByColunm.join(',');
      //   if (this.orderDesc) {
      //     result += 'DESC';
      //   }
      // }

      if (this.orderByColunm) {
        result += ' ORDER BY ' + this.orderByColunm
        if (this.orderDesc) {
          result += ' DESC'
        }
      }

      this.sqlContent = result
    },
    handleSubmitSql() {
      this.$emit('submitSql', this.sqlContent)
    },
    getTables(modelId) {
      HTTP.getAllTablesFromDam({
        succesedCallback: data => {
          const arr = data.content
          if (arr && Array.isArray(arr)) {
            this.tablesArr = arr
            const map = {}
            arr.forEach(item => {
              map[item.objectId] = item
            })
            this.tableMap = map
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
    getColumns(objectId) {
      if (!objectId) {
        this.columnsArr = []
        return
      }
      const obj = {
        objectId: objectId,
      }
      HTTP.getCatalogColumns({
        succesedCallback: data => {
          if (data && Array.isArray(data)) {
            const arr = []
            data.forEach(item => {
              const obj = {
                physicalName: item.physicalName,
                objectId: item.objectId,
                logicalName: item.logicalName,
                type: item.type,
              }
              arr.push(obj)
            })
            this.columnsArr = arr
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
          this.columnsArr = []
        },
        para: obj,
      })
    },
  },
  watch: {},
}
