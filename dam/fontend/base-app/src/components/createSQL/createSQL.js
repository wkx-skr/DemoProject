import chooseModel from '@/view/dataQuality/techRules/chooseModel.vue'
export default {
  props: {
    modelFromDam: {
      type: Boolean,
      default: true /** 使用 dam/ddm 的模型 */,
    },
    choosedCategory: {
      type: [String, Number],
      default: '',
    },
    choosedModelId: {
      type: [String, Number],
      default: '',
    },
    choosedTableId: {
      type: [String, Number],
      default: '',
    },
    choosedColumnId: {
      type: [String, Number],
      default: '',
    },
    createReg: {
      type: Boolean,
      default: false,
    },
    choosedDBType: {
      type: String,
      default: '',
    },
  },
  data() {
    const contentValidate = (rule, value, callback) => {
      if (this.contentErrMsg) {
        callback(new Error(this.contentErrMsg))
      } else {
        callback()
      }
    }
    return {
      dialogVisible: false,
      dialog2Visible: false,
      modelComplete: true, // 所属模型加载完数据
      columnsComplete: true, // 所属列加载完数据
      rules: {
        SQLContent: [
          {
            validator: contentValidate,
          },
        ],
      },
      allCategories: this.$modelCategories,
      modelCategoryId: '' /** 所属系统 */,
      modelsArr: [],
      modelId: '',
      tablesArr: [],
      tableMap: {},
      tableName: '',
      tableId: '',
      columnsArr: [],
      columnMap: {},
      columnId: '',
      columnName: '',
      requiredMap: {},
      contentErrMsg: '', // 错误信息提示
      SQLContent: '', // SQL 语句
      SQLmodelType: '',

      /** 数值值域检查 */
      showValueRange: false /** 显示 填写取值范围 */,
      rangeType: '',
      rangeValue: '',
      rangeValueMax: '',

      /** 字段长度检查 */
      showLengthRange: false,
      lengthValue: '',

      /** 字符值域检查 */
      showCharRange: false,
      choosedCode: [],
      codeDataTree: [],
      charRang: [],

      /** 主外键检查 */
      showPriKey: false,
      tableId2: '',
      tableName2: '',
      columnId2: '',
      columnsArr2: [],
      columnMap2: {},

      DBtype: '', // 数据库类型

      /** 生成正则表达式 */
      dateType: '',
      dateTypeArr: [
        { label: 'YYYYMMDD', value: 1 },
        { label: 'yyyy-mm-dd', value: 2 },
        { label: 'yyyy-mm-dd hh:mm:ss', value: 3 },
      ],

      // model from ddm
      modelFromDDMMap: {},

      dbTypeLengthMap: {
        ORACLE: 'LENGTH',
        SQLSERVER: 'LEN',
        MySQL: 'LENGTH',
        POSTGRESQL: 'LENGTH',
        DB2: 'LENGTH',
        GBASE: 'LENGTH',
        Hana: 'LENGTH',
        HIVEl: 'LENGTH',
        ODPS: 'LENGTH',
      },
      /** ********************** */
      modelName: '',
      showTableSelector: true,
      showColumnSelector: true,
    }
  },
  components: {
    chooseModel,
  },
  computed: {
    hasModel() {
      return this.modelId || this.modelId === 0
    },
    itemForSQL() {
      return !this.createReg
    },
    canCreate() {
      let result = true
      if (!this.createReg) {
        const obj = this.requiredMap

        if (!this.SQLmodelType) {
          result = false
        }

        if (obj.table) {
          if (!this.tableId && !this.tableName) {
            result = false
          }
        }
        if (obj.column) {
          if (!this.columnId && !this.columnName) {
            result = false
          }
        }
        if (obj.valueNumber) {
          if (this.rangeType) {
            if (!this.rangeValue && this.rangeValue !== 0) {
              result = false
            }
            if (this.rangeType === '区间') {
              if (!(this.rangeValueMax || this.rangeValueMax === 0)) {
                result = false
              }
            }
          } else {
            result = false
          }
        }
        if (obj.lengthValue) {
          if (!this.lengthValue) {
            result = false
          }
        }
        if (obj.charRange) {
          if (!this.choosedCode || this.choosedCode.length === 0) {
            result = false
          }
        }
        if (obj.table2) {
          if (!this.tableId2 && !this.tableName2) {
            result = false
          }
        }
        if (obj.column2) {
          if (!this.columnId2 && !this.columnName2) {
            result = false
          }
        }
        if (obj.dbType) {
          if (!this.DBtype) {
            result = false
          }
        }
      } else {
        if (!this.dateType) {
          result = false
        }
      }

      return result
    },
    confirmDisabled() {
      return !this.SQLContent
    },
  },
  mounted() {},
  methods: {
    handleShowDialog() {
      this.dialogVisible = true
      this.dataInit()
    },
    handleCategoryChange(categoryId) {
      this.modelId = ''
      this.handleModelChange()
      if (categoryId || categoryId === 0) {
        const callback = data => {
          const arr = []
          data.forEach(item => {
            if (item.categoryId === categoryId) {
              arr.push(item)
            }
          })
          this.modelsArr = arr
        }
        this.loadModels(callback)
      } else {
        this.modelsArr = []
      }
    },
    loadModels(callback) {
      // callback 已返回的 models 数组作为参数
      this.$http
        .get(this.$meta_url + '/service/models/fromre/')
        .then(res => {
          const data = res.data
          if (data && Array.isArray(data)) {
            callback && callback(data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleModelChange(modelId) {
      this.modelId = modelId
      this.handleTableChange()
      let arr = []
      if (modelId || modelId === 0) {
        const callback = data => {
          arr = data.content
          this.tablesArr = arr
        }
        this.loadTables(callback)
      } else {
        this.tablesArr = []
      }
    },
    loadTables(callback) {
      if (this.modelFromDam) {
        const pageSize = 1000
        const json = {
          currentPage: 1,
          keyword: null,
          modelId: this.modelId,
          pageSize: pageSize,
          types: ['TABLE'],
        }
        this.$http
          .post(this.$meta_url + '/service/entities/searchMetadata', json)
          .then(res => {
            this.modelComplete = false
            if (
              res.data &&
              (res.data.totalItems || res.data.totalItems === 0)
            ) {
              if (res.data.totalItems <= pageSize) {
                this.tableMap = {}
                const data = res.data
                const arr = data.content
                arr.forEach(item => {
                  this.tableMap[item.objectId] = item
                })
                callback && callback(res.data)
              } else {
                json.pageSize = res.data.totalItems
                this.$http
                  .post(
                    this.$meta_url + '/service/entities/searchMetadata',
                    json
                  )
                  .then(res => {
                    if (res.data) {
                      this.tableMap = {}
                      const data = res.data
                      const arr = data.content
                      arr.forEach(item => {
                        this.tableMap[item.objectId] = item
                      })
                      callback && callback(res.data)
                    }
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleTableChange(tableId) {
      this.columnsArr = []
      this.tableId = tableId
      this.tableName = ''
      this.columnId = ''
      this.columnName = ''
      if (tableId || tableId === 0) {
        this.tableName = this.tableMap[tableId]
          ? this.tableMap[tableId].physicalName
          : ''
        if (this.modelFromDam) {
          const callback = data => {
            this.columnsArr = data
          }
          this.loadColumn(callback)
        } else {
          const callback = data => {
            if (Array.isArray(data)) {
              const map = {}
              data.forEach(item => {
                map[item.columnId] = item
              })
              this.columnMap = map
            }
            this.columnsArr = data
          }
          this.loadColumnFromDDM(callback, tableId)
        }
      }
    },
    handleTableChange2(tableId) {
      this.columnsArr2 = []
      this.tableId2 = tableId
      this.tableName2 = ''
      this.columnId2 = ''
      this.columnName2 = ''
      if (tableId || tableId === 0) {
        this.tableName2 = this.tableMap[tableId]
          ? this.tableMap[tableId].physicalName
          : ''
        if (this.modelFromDam) {
          const callback = data => {
            this.columnsArr2 = data
            this.columnMap2 = {}
            data.forEach(item => {
              this.columnMap2[item.objectId] = item
            })
          }
          this.loadColumn2(callback, tableId)
        } else {
          const callback = data => {
            if (Array.isArray(data)) {
              const map = {}
              data.forEach(item => {
                map[item.columnId] = item
              })
              this.columnMap2 = map
            }
            this.columnsArr2 = data
          }
          this.loadColumnFromDDM(callback, tableId)
        }
      }
    },
    loadColumn(callback) {
      this.$http
        .get(this.$url + '/service/entities/' + this.tableId + '/columns')
        .then(res => {
          this.columnsComplete = false
          if (res.data && Array.isArray(res.data)) {
            this.columnMap = {}
            res.data.forEach(item => {
              this.columnMap[item.objectId] = item
            })
            callback && callback(res.data)
          }
        })
        .catch(e => this.$showFailure(e))
    },
    loadColumnFromDDM(callabck, tableId) {
      this.$http
        .get(
          this.$meta_url +
            '/models/ddm/models/' +
            this.modelId +
            '/table/' +
            tableId
        )
        .then(res => {
          callabck && callabck(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    loadColumn2(callback, tableId) {
      this.$http
        .get(this.$url + '/service/entities/' + tableId + '/columns')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            callback && callback(res.data)
          }
        })
        .catch(e => this.$showFailure(e))
    },
    handleColumnChange(columnId) {
      this.columnId = columnId
      this.columnName = this.columnMap[columnId]
        ? this.columnMap[columnId].physicalName
        : ''
    },
    handleColumnChange2(columnId) {
      this.columnId2 = columnId
      this.columnName2 = this.columnMap2[columnId]
        ? this.columnMap2[columnId].physicalName
        : ''
    },
    handleSQLModelChange(type) {
      this.SQLmodelType = type
      this.requiredMap = {}

      this.showValueRange = false
      this.showLengthRange = false
      this.showCharRange = false
      this.showPriKey = false

      /**
       * 可能需要的数据
       * 'table',
       * 'column', '
       * valueNumber(取值范围)',
       * 'lengthValue(字段长度)',
       * charRange(字符值域),
       * dbType: 数据库类型
       * table2: 外键关联表
       * column2
       *
       *  */
      let requiredArr = []
      switch (type) {
        case '1':
          // 数值值域检查
          // valueNumber: 取值范围为必填
          this.showValueRange = true
          this.rangeType = ''
          this.rangeValue = ''
          this.rangeValueMax = ''
          requiredArr = ['table', 'column', 'valueNumber']
          break
        case '2':
          // 唯一性
          requiredArr = ['table', 'column']
          break
        case '3':
          // 空值检查
          requiredArr = ['table']
          break
        case '5':
          // 主外键检查
          this.showPriKey = true
          requiredArr = ['table', 'column', 'table2', 'column2']
          this.tableId2 = ''
          this.tableName2 = ''
          this.columnId2 = ''
          this.columnName2 = ''
          this.columnsArr2 = []
          break
        case '6':
          // 字段长度检查
          // lengthValue: 长度范围为必填
          requiredArr = ['table', 'column', 'lengthValue', 'dbType']
          this.showLengthRange = true
          this.lengthValue = ''
          break
        case '8':
          // 字符值域检查
          requiredArr = ['table', 'column', 'charRange']
          this.showCharRange = true
          this.choosedCode = []
          this.getCodeData()
          break
      }

      requiredArr.forEach(item => {
        this.$set(this.requiredMap, item, true)
      })
    },
    handleCodeChange(newVal) {
      // this.$http.get()
      const url = `${this.$url}/service/domains/codes/content?codeNumber=${newVal[1]}`
      newVal[1] &&
        this.$http
          .get(url)
          .then(res => {
            if (res.data) {
              const arr = res.data.values
              if (arr && Array.isArray(arr)) {
                this.charRang = arr
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
    },
    dataInit() {
      /** 将传入的数据初始化 */
      if (this.modelFromDam) {
        /** 使用dam模型 */
        // 没有 系统,就没有 模型
        this.modelCategoryId = this.choosedCategory
        if (this.modelCategoryId || this.modelCategoryId === 0) {
          const callback = data => {
            this.modelsArr = data
          }
          this.loadModels(callback)
        }
        this.modelId = this.choosedModelId
        if (this.modelId || this.modelId === 0) {
          const callback = data => {
            this.tablesArr = data.content
            const id2objectIdMap = {}
            this.tablesArr.forEach(item => {
              id2objectIdMap[item.id] = item.objectId
            })
            this.tableId = id2objectIdMap[this.choosedTableId]
            this.tableName = this.tableMap[this.tableId]
              ? this.tableMap[this.tableId].physicalName
              : ''
            if (this.tableId || this.tableId === 0) {
              const callback = data => {
                this.columnsArr = data
                const id2objectIdMap = {}
                data.forEach(item => {
                  id2objectIdMap[item.id] = item.objectId
                })
                this.columnId = id2objectIdMap[this.choosedColumnId]
                this.columnName = this.columnMap[this.columnId]
                  ? this.columnMap[this.columnId].physicalName
                  : ''
              }
              this.loadColumn(callback)
            }
          }
          this.loadTables(callback)
        } else {
          this.tableName = this.choosedTableId
          this.columnName = this.choosedColumnId
        }
      } else {
        /** 使用 ddm 模型 */
        //
        this.modelId = this.choosedModelId
        if (this.modelId || this.modelId === 0) {
          const callback = data => {
            this.modelSelected(this.modelFromDDMMap[this.modelId])
          }
          this.loadModelsFromDDM(callback)
        }
      }

      /** 将规则类型初始化 */
      this.handleSQLModelChange()
      this.SQLContent = ''
      this.DBtype = this.choosedDBType
    },
    handleCreateSQL() {
      const isNum = val => {
        // 是否是数字型的值
        if (val === 0) {
          return true
        }
        val -= 0
        let bool = true // is val a number
        if (typeof val !== 'number') {
          bool = false
        } else if (!isNaN(val)) {
          bool = true
        } else {
          bool = false
        }
        return bool
      }
      this.contentErrMsg = ''
      let errMes = ''
      let result = ''

      if (!this.createReg) {
        let tableName = this.tableName
        let columnName = this.columnName
        tableName = tableName || ''
        columnName = columnName || ''

        /** 检测必填项是否完整 */
        if (!tableName && tableName !== 0) {
          // 表名总是必填
          errMes = '表名不能为空'
        }
        if (this.requiredMap.column && !columnName && columnName !== 0) {
          errMes = '列名不能为空'
        }
        if (this.requiredMap.lengthValue && !this.lengthValue) {
          errMes = '请输入字段长度'
        }

        let columnNameStr = ''
        this.columnsArr.forEach(item => {
          columnNameStr += item.physicalName + ', '
        })
        columnNameStr = columnNameStr.slice(0, -2)
        result = 'SELECT ' + columnNameStr + ' FROM ' + tableName
        if (this.SQLmodelType === '1') {
          // 数值值域检查
          result = result + ' WHERE '
          let operate = ''
          switch (this.rangeType) {
            case '大于':
              operate = '>'
              break
            case '等于':
              operate = '='
              break
            case '小于':
              operate = '<'
              break
            case '大于等于':
              operate = '>='
              break
            case '小于等于':
              operate = '<='
              break
            case '区间':
              const arr = [this.rangeValue, this.rangeValueMax]
              if (isNum(arr[0]) && isNum(arr[1]) && arr[0] <= arr[1]) {
                result =
                  result +
                  ' ( ' +
                  tableName +
                  '.' +
                  columnName +
                  ' >= ' +
                  (arr[0] - 0) +
                  ' AND ' +
                  tableName +
                  '.' +
                  columnName +
                  ' <= ' +
                  (arr[1] - 0) +
                  ' )'
              } else {
                errMes = '请输入正确的范围'
              }
              break
          }
          if (this.rangeType !== '区间') {
            const bool = isNum(this.rangeValue)
            if (!bool) {
              errMes = '请在值域内输入数字'
            }
            result =
              result +
              tableName +
              '.' +
              columnName +
              ' ' +
              operate +
              ' ' +
              (this.rangeValue - 0)
          }
          if (!this.rangeType || !this.rangeValue) {
            errMes = '值域不能为空'
          }
        } else if (this.SQLmodelType === '2') {
          // 唯一性
          result +=
            ' WHERE ' +
            columnName +
            ' IN ( SELECT ' +
            columnName +
            ' FROM ' +
            tableName +
            ' GROUP BY ' +
            columnName +
            ' HAVING COUNT( ' +
            columnName +
            ' ) > 1 ) ORDER BY ' +
            columnName
        } else if (this.SQLmodelType === '3') {
          // 空值检查
          if (!columnName) {
            if (this.columnsArr && this.columnsArr.length > 0) {
              let str = ''
              this.columnsArr.forEach(item => {
                str +=
                  '(' +
                  item.physicalName +
                  ' IS NULL) OR ( ' +
                  item.physicalName +
                  " = '') OR "
              })
              str = str.slice(0, -4)
              result += ' WHERE (' + str + ')'
            } else {
              errMes = '列名不能为空，请输入列明或选择模型上的表'
            }
          } else {
            result =
              result +
              ' WHERE ( (' +
              tableName +
              '.' +
              columnName +
              ' IS NULL ) OR ( ' +
              tableName +
              '.' +
              columnName +
              " =  '' )" +
              ')'
          }
        } else if (this.SQLmodelType === '5') {
          const tableName2 = this.tableName2 ? this.tableName2 : ''
          const columnName2 = this.columnName2 ? this.columnName2 : ''
          // 主外键检查
          if (!tableName2) {
            errMes = '请选择外键关联表'
          }
          if (!columnName2) {
            errMes = '请选择外键关联列'
          }
          result +=
            ' WHERE ' +
            tableName +
            '.' +
            columnName +
            ' NOT IN ( SELECT ' +
            columnName2 +
            ' FROM ' +
            tableName2 +
            ' )'
        } else if (this.SQLmodelType === '6') {
          // 字段长度检查
          if (!this.DBtype) {
            errMes = '请选择数据库类型'
          }
          const funName = this.dbTypeLengthMap[this.DBtype] || 'LENGTH'
          result +=
            ' WHERE ' + funName + '( ' + columnName + ' ) > ' + this.lengthValue
        } else if (this.SQLmodelType === '8') {
          // 字符值域检查
          // let str = this.charRang.join(',');
          let str = ''
          this.charRang.forEach(item => {
            str += "'" + item.value + "', "
          })
          str = str.slice(0, -2)
          result +=
            ' WHERE ' +
            tableName +
            '.' +
            columnName +
            ' NOT IN ' +
            '(' +
            str +
            ')'
        }
      } else {
        if (this.dateType === 1) {
          result = '[0-9]{4}[01][0-9][0-3][0-9]'
        } else if (this.dateType === 2) {
          result = '[0-9]{4}-[01][0-9]-[0-3][0-9]'
        } else if (this.dateType === 3) {
          result =
            '[0-9]{4}-[01][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5]{1}[0-9]{1}'
        }
      }

      if (errMes.length > 0) {
        this.contentErrMsg = errMes
        this.$refs.createSQLForm.validateField('SQLContent')
      } else {
        this.SQLContent = result
      }
    },
    handleReturnSQL() {
      this.$emit('createSQL', this.SQLContent)
      this.dialogVisible = false
    },
    getCodeData() {
      this.$http
        .get(this.$url + '/service/domains/codes')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            this.codeDataTree = this.dealData(res.data, 'datasetName')
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 处理code, list to obj
    dealData(data, attr) {
      const result = []
      const parMap = {}
      data.forEach(item => {
        if (!item[attr]) {
          return
        }
        const name = item[attr]
        if (!parMap[name]) {
          const obj = {
            name: name,
            children: [],
            code: name,
          }
          parMap[name] = obj
          result.push(obj)
        }
        const par = parMap[name]
        par.children.push(item)
      })
      return result
    },
    loadModelsFromDDM(callback) {
      this.$http
        .get(this.$meta_url + '/models/ddm/models')
        .then(res => {
          const map = {}
          const addMapItem = data => {
            if (data.id || data.id === 0) {
              if (
                data.models &&
                Array.isArray(data.models) &&
                data.models.length > 0
              ) {
                data.models.forEach(item => {
                  map[item.id + ''] = item
                })
              }
            }
            const arr = data.children
            if (arr && Array.isArray(arr) && arr.length > 0) {
              arr.forEach(item => {
                addMapItem(item)
              })
            }
          }
          addMapItem(res.data)

          this.modelFromDDMMap = map
          callback && callback(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    loadTablesFromDDM(callabck, modleId) {
      this.$http
        .get(this.$meta_url + '/models/ddm/models/' + modleId + '/tables')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            callabck && callabck(res.data)
          }
        })
        .catch(e => this.$showFailure(e))
    },
    handleSelectModel() {
      this.dialog2Visible = true
    },
    modelSelected(model) {
      // 选择 model
      this.dialog2Visible = false
      this.modelId = model.id

      this.modelName = model ? model.name : ''
      const callback = data => {
        const map = {}
        data.forEach(item => {
          map[item.tableId] = item
        })
        this.tableMap = map
        this.tablesArr = data
      }
      this.loadTablesFromDDM(callback, model.id)
    },
    /** ******************************** */
    handleModelNameClear() {},
  },
  watch: {},
}
