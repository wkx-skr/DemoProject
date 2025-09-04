import HTTP from '@/http/main'
import _ from 'lodash'
import ddsHTTP from '../ddsHTTP.js'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import chooseTable from './chooseTable.vue'
import chooseColumn from './chooseColumn.vue'
import paramsList from './paramsList.vue'
import proxyParamsList from './proxyParamsList.vue'
import returnColsCom from './returnColsList.vue'
import FunctionGraph from './functionGraph.vue'
import { validateApiURL, validateURL } from '../validator.js'

export default {
  name: 'editApiTab',
  data() {
    return {
      hasAccess: true,
      loadingData: true,
      apiEditData: {
        id: '',
        api: '',
        name: '',
        version: '',
        apiCatalog: '',
        apiCatalogId: '',
        createTime: '',
        creator: '',
        modifyTime: '',
        effectiveTime: '', // 下线时间
        flowLimit: '',
        overtimeLimit: '',
        method: 'GET',
        apiProtocol: 'http',
        updateFrequency: '',
        resultType: 'JSON',
        description: '',
        modelId: '',
        modelName: '',
        schemaId: '',
        schemaName: '',
        tableObjectId: '',
        tableName: '',
        // sqlContent: 'SELECT dam_busi_obj.busi_code AS busi, dam_busi_obj.busi_name AS name_001, dam_busi_obj.busi_obj_id AS id from dam_busi_obj WHERE id > {{param1}} OR id < {{param2}}',
        sqlContent: '',
        sqlContentWithDefault: '',
        dataAccessLevel: '',
        apiParamDef: '',
        apiResultDef: '',
        apiResultExample: '',
        apiStatus: 'OFFLINE', // OFFLINE, RELEASE
        apiTestStatus: 'FAIL', // SUCCESS, FAIL
        apiAccessMethod: 'WHOLE_TABLE_DATA', // 代理api 接入方式
        proxyUrl: '', // 代理 api 代理url
        // 需要移除字段
        autoOffline: false, // 是否自动下线
        // selectedColumns: [], // 选定的字段
        // selectedColumnsName: []
      },
      apiCatalogArr: [],
      // isEdit: true,
      rules: {
        sqlContent: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入 SQL 语句',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              setTimeout(() => {
                if (this.paramsRepeat) {
                  callback(new Error('参数名称有重复'))
                } else if (this.returnColRepeat) {
                  callback(new Error('返回值名称有重复'))
                } else {
                  callback()
                }
              }, 300)
            },
          },
        ],
        name: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入 API 名称',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(100),
          },
        ],
        modelId: [
          {
            trigger: 'change',
            required: true,
            message: '请选择数据源',
            validator: this.$utils.validator.notEmptyRequired,
          },
        ],
        schemaId: [
          {
            trigger: 'change',
            required: true,
            message: '请选择 schema',
            validator: this.$utils.validator.notEmptyRequired,
          },
        ],
        tableObjectId: [
          {
            trigger: 'change',
            required: true,
            message: '请选择表',
            validator: this.$utils.validator.notEmptyRequired,
          },
        ],
        version: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入版本号',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(50),
          },
        ],
        apiCatalog: [
          {
            trigger: 'change',
            required: true,
            message: '请选择分类',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'change',
            validator: this.$utils.validator.maxLengthCustom(20),
          },
        ],
        apiAccessMethod: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入调用方式',
            validator: this.$utils.validator.notEmptyRequired,
          },
        ],
        proxyUrl: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入代理 URL',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            required: true,
            message: '请输入正确的 URL',
            validator: (rule, value, callback) => {
              value = _.trim(value)
              const reg = /[^a-zA-Z0-9;\/?:@&=+$,\-_.!~*'()#%\[\]]/
              const errStr = value.match(reg)
              if (!errStr) {
                callback()
              } else {
                callback(new Error(`地址中不能包含字符 '${errStr}'`))
              }
            },
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(200),
          },
        ],
        api: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入访问地址',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            validator: validateApiURL,
            trigger: 'blur',
            message: "请以'/'开头",
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              value = _.trim(value)
              const reg = /[^a-zA-Z0-9;\/?:@&=+$,\-_.!~*'()#%\[\]]/
              const errStr = value.match(reg)
              if (!errStr) {
                callback()
              } else {
                callback(new Error(`地址中不能包含字符 '${errStr}'`))
              }
            },
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(200),
          },
        ],
        flowLimit: [
          { trigger: 'blur', validator: this.$utils.validator.numberRequired },
        ],
        overtimeLimit: [
          { trigger: 'blur', validator: this.$utils.validator.numberRequired },
        ],
        description: [
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(200),
          },
        ],
        // apiResultExample: [
        //   {
        //     trigger: 'blur',
        //     validator: (rule, value, callback) => {
        //       setTimeout(() => {
        //         if (!value || this.$utils.isJSON(value)) {
        //           callback()
        //         } else {
        //           callback(new Error('返回值示例不是标准的 JSON 数据'))
        //         }
        //       }, 50)
        //     }
        //   }
        // ]
      },
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      },
      methodArr: [
        'GET',
        // 'PUT',
        'POST',
        // 'DELETE'
      ],
      updateFrequencyArr: ['每周', '每月', '每年'],
      resultTypeArr: ['JSON'],
      safeLevels: ['公开数据', '普通数据', '敏感数据', '机密数据'],
      apiAccessMethodMap: [
        { value: 'WHOLE_TABLE_DATA', label: '整表数据', index: '1' },
        { value: 'CUSTOM_SQL', label: '自定义SQL', index: '2' },
        { value: 'PROXY_API', label: '代理 API', index: '3' },
      ],
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() < Date.now()
        },
      },
      modelList: [],
      tableList: [],
      columnList: [],
      columnMap: {},
      chooseTreeData: [],
      showChooseTable: false,
      chooseReturnCols: false,
      currentSqlConditionCol: null,
      selectColType: 'single', // 选择单行 还是 多行, 单行是 SQL 条件, 多行是 返回值
      modelMap: {},
      dsCascaderProps: {
        value: 'nodeId',
        emitPath: false,
        label: 'name',
        expandTrigger: 'click',
        checkStrictly: true,
      },
      schemaList: [],
      dsCascaderTreeMap: {},
      choseCols: [],
      couldEditSql: true,
      generateSQLVisible: false,
      generateSqlData: {
        chooseCols: [],
        groupByCols: [],
        orderByCols: [
          {
            column: '',
            orderType: '',
          },
        ],
      },
      sqlConditionData: {
        logicalOperator: 'AND',
        query: [],
      },
      metricoption: [],
      columnKey: '',
      disableMessage: '确定',
      currentSqlOrderCol: null,
      conditionListKey: 1,
      orderListKey: 1000,
      operatorMap: {
        大于: '>',
        小于: '<',
        等于: '=',
      },
      paramsList: [],
      proxyParamsList: [],
      name2Id: {}, // 代理参数 与 参数 关联
      // TODO 重复值 校验
      paramsRepeat: false,
      returnColsList: [],
      returnColRepeat: false,
      paramTypes: {
        STRING: 1,
        INT: 2,
        LONG: 3,
        FLOAT: 4,
        DOUBLE: 5,
        BOOLEAN: 6,
        ARRAY: 7,
      },
      paramLocations: [
        {
          label: 'Head',
          value: 'HEAD',
          key: 2,
        },
        {
          label: 'Query',
          value: 'QUERY',
          key: 3,
        },
      ],
      chooseLimit: [],
      columnListLimit: [],
      // couldSaveParamEdit: false,
      showJsonContent: true,
    }
  },
  props: {
    apiData: {
      type: Object,
      default() {
        return {}
      },
    },
    getModelTreePro: {
      type: Promise,
      required: true,
    },
    // apiCatalogArr: {
    //   type: Array,
    //   default() {
    //     return []
    //   }
    // },
    isAdd: {
      type: Boolean,
      default: true,
    },
    couldEdit: {
      type: Boolean,
      default: false,
    },
    ApiBaseurl: {
      default: '',
    },
    defaultTableId: {
      default: '',
    },
  },
  components: {
    chooseTable,
    chooseColumn,
    paramsList,
    proxyParamsList,
    returnColsCom,
    FunctionGraph,
  },
  computed: {
    isEdit() {
      return this.couldEdit
    },
    disableCommitButton() {
      let bool = false
      const requiredProps = ['name', 'version', 'apiCatalog', 'api']
      // 'sqlContent',
      if (this.apiEditData.apiAccessMethod === 'PROXY_API') {
        requiredProps.push('apiAccessMethod', 'proxyUrl')
      } else {
        requiredProps.push('sqlContent')
      }
      if (this.apiEditData) {
        requiredProps.forEach(key => {
          if (!this.apiEditData[key]) {
            bool = true
          }
        })

        // if (this.apiEditData.apiResultExample && !this.$utils.isJSON(this.apiEditData.apiResultExample)) {
        //   bool = true
        // }
        const url = this.apiEditData.api.slice(0, 1)
        if (url !== '/') {
          bool = true
        }
      }

      if (this.paramsRepeat || this.returnColRepeat) {
        bool = true
      }
      return bool
    },
    modelListShow() {
      const result = []
      this.modelList.forEach(model => {})
      return result
    },
    couldGenerateSql() {
      let disableMessage = '确定'
      let bool = true
      // console.log(this.generateSqlData)
      if (
        !this.generateSqlData.chooseCols ||
        !this.generateSqlData.chooseCols.length
      ) {
        disableMessage = '请选择字段'
        bool = false
      } else if (!Array.isArray(this.generateSqlData.chooseCols)) {
        disableMessage = '请选择字段'
        bool = false
      }
      if (!this.sqlConditionData.query) {
        disableMessage = '过滤条件填写不正确'
        bool = false
      } else if (!Array.isArray(this.sqlConditionData.query)) {
        disableMessage = '过滤条件填写不正确'
        bool = false
      } else {
        const requiredProps = [
          'column',
          'operator',
          'variableName',
          'variableValue',
        ]
        this.sqlConditionData.query.forEach(item => {
          // console.log(item)
          item.query.forEach(i => {
            // const i = item.query[0]
            // console.log(item, i)
            requiredProps.forEach(prop => {
              // console.log(i[prop])
              if (!i[prop] && i[prop] !== 0) {
                bool = false
                disableMessage = '过滤条件填写不完整'
              }
            })
            if (!isNaN(i.variableName - 0)) {
              disableMessage = '请填写正确的参数名称'
              bool = false
              i.variableName = ''
            } else if (
              i.variableName.match &&
              !i.variableName.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
            ) {
              // 参数名称不符合条件
              disableMessage = '请填写正确的参数名称'
              bool = false
            }
          })
        })
      }
      this.disableMessage = disableMessage
      return bool
    },
  },
  beforeMount() {
    if (this.apiData && this.apiData.id && this.apiData.id !== 'add') {
      this.apiEditData.id = this.apiData.id
    }

    if (this.couldEdit) {
      this.getCatalogList()
      // this.getDbData()
    }
    this.getModelList()
  },
  mounted() {
    if (this.couldEdit) {
      // console.log(this.generateSqlData)
      this.getDbData()
        .then(res => {
          this.dataInit()
        })
        .catch(e => {
          console.log(e)
        })
    } else {
      this.dataInit()
    }
  },
  methods: {
    handleVisibleChange() {
      let option = $('.datablau-option')
      let optionMulti = $('.datablau-option-multi')
      this.$nextTick(() => {
        option.css('display', 'none')
        optionMulti.css('display', 'none')
        $('.datablau-select-dropdown').css('display', 'none')
      })
    },
    async dataInit() {
      this.loadingData = true
      if (!this.isAdd) {
        // this.apiEditData = _.cloneDeep(this.apiData)
        try {
          const apiDetail = await ddsHTTP.getApiDetail({ id: this.apiData.id })
          const data = apiDetail.data

          Object.assign(this.apiEditData, data.api)
          const paramsList = []
          const proxyParamsList = []
          const arr = _.cloneDeep(data.parameters)
          if (arr && Array.isArray(arr)) {
            arr.forEach(item => {
              if (item.parType === 1) {
                proxyParamsList.push(item)
              } else {
                paramsList.push(item)
              }
            })
          }
          this.paramsList = paramsList
          this.proxyParamsList = proxyParamsList

          this.returnColsList = _.cloneDeep(data.responses)

          this.$emit('apiDataRefresh', this.apiEditData)

          this.getTableList(this.apiEditData.modelId)
          this.refreshEditData()

          if (this.couldEdit) {
            setTimeout(() => {
              if (this.$refs.apiEditForm && this.$refs.apiEditForm.validate) {
                this.$refs.apiEditForm
                  .validate()
                  .then(res => {
                    this.$refs.apiEditForm.clearValidate()
                  })
                  .catch(e => {
                    console.log(e)
                  })

                setTimeout(() => {
                  this.getSchemaList()
                }, 500)
              }
            }, 500)
          }
        } catch (e) {
          this.$showFailure(e)
        }
      } else {
        // 如果有默认table, 将默认table值插入
        if (this.defaultTableId) {
          // console.log(this.defaultTableId, 'this.defaultTableId')
          try {
            let tableData = await HTTP.getTableSummaryPro({
              objectId: this.defaultTableId,
            })
            // console.log(tableData, 'tableData')
            tableData = tableData.data

            this.apiEditData.modelId = tableData.modelId
            this.apiEditData.schemaId = tableData.modelId
            this.apiEditData.schemaName = tableData.schemaName
            this.apiEditData.tableObjectId = tableData.objectId
            this.apiEditData.tableName = tableData.physicalName

            const keyword = this.apiEditData.tableName
              ? this.apiEditData.tableName
              : this.apiEditData.modelId

            await this.getTableList(keyword)
          } catch (e) {
            this.$showFailure(e)
          }
        }
        // 设置默认参数
        setTimeout(this.sqlChange, 300)
      }

      this.loadingData = false
    },
    /**
     * 展示数据刷新
     */
    refreshEditData() {
      this.$nextTick(this.getTableName)
      this.refreshJson()
      if (this.apiEditData.effectiveTime) {
        this.apiEditData.autoOffline = true
      }

      if (this.$refs.paramsList && this.$refs.paramsList.refreshEditData) {
        this.$refs.paramsList.refreshEditData()
      }

      if (
        this.$refs.returnColsCom &&
        this.$refs.returnColsCom.refreshEditData
      ) {
        this.$refs.returnColsCom.refreshEditData()
      }
    },
    saveEdit(...arr) {
      let dupName = ''
      if (this.$refs.paramsList && this.$refs.paramsList.duplicateTest) {
        dupName = this.$refs.paramsList.duplicateTest()
        if (dupName) {
          this.$showFailure(`名称为 ${dupName} 的参数重复`)
          return
        }
      }
      if (this.$refs.returnColsCom && this.$refs.returnColsCom.duplicateTest) {
        dupName = this.$refs.returnColsCom.duplicateTest()
        if (dupName) {
          this.$showFailure(`名称为 ${dupName} 的返回值重复`)
          return
        }
      }
      if (
        this.$refs.proxyParamsList &&
        this.$refs.proxyParamsList.duplicateTest
      ) {
        dupName = this.$refs.proxyParamsList.duplicateTest()
        if (dupName) {
          this.$showFailure(`名称为 ${dupName} 的代理参数重复`)
          return
        }
      }
      if (this.$refs.apiEditForm && this.$refs.apiEditForm.validate) {
        this.$refs.apiEditForm
          .validate()
          .then(res => {
            this.saveApi(...arr)
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    saveApi() {
      const para = _.cloneDeep(this.apiEditData)
      if (!para.autoOffline) {
        para.effectiveTime = null
      }

      para.name = _.trim(para.name)
      para.api = _.trim(para.api)
      Object.keys(para).forEach(key => {
        if (typeof para[key] === 'string') {
          para[key] = _.trim(para[key])
        }
      })

      const catalog =
        this.apiCatalogArr.find(
          item => this.apiEditData.apiCatalog === item.apiCatalog
        ) || []
      let apiCatalogId = ''
      if (catalog) {
        apiCatalogId = catalog.id
      }
      para.apiCatalogId = apiCatalogId

      let responses = []
      if (
        this.$refs.returnColsCom &&
        this.$refs.returnColsCom.getReturnColsList
      ) {
        responses = this.$refs.returnColsCom.getReturnColsList()
      }

      let parameters = []
      if (this.$refs.paramsList && this.$refs.paramsList.getParamsList) {
        parameters = this.$refs.paramsList.getParamsList()
      }
      if (
        this.$refs.proxyParamsList &&
        this.$refs.proxyParamsList.getParamsList
      ) {
        const proxyParameters = this.$refs.proxyParamsList.getParamsList()
        parameters = parameters.concat(proxyParameters)
      }

      delete para.autoOffline
      delete para.selectedColumns
      delete para.selectedColumnsName

      // 判断 参数与返回值 必填项是否为空
      let errorMessage = ''
      const parametersRequired = {
        name: '参数名称',
        location: '参数位置',
        type: '参数类型',
        defaults: '默认值',
      }
      // let returnColsRequired = ['name']
      parameters.forEach(item => {
        if (!errorMessage) {
          // 不需要用户传入的参数, name 为空
          if (item.parSynchronize !== 0 && !_.trim(item.name)) {
            errorMessage = '参数列表中有数据的参数名称为空'
          } else {
            Object.keys(parametersRequired).forEach(prop => {
              if (
                (item.name === 'appKey' || item.name === 'appSecret') &&
                prop === 'defaults'
              ) {
                // appKey 与 appSecret 没有默认值
              } else if (!_.trim(item[prop]) && prop !== 'name') {
                errorMessage = `参数列表中 [${item.name}] 的 [${parametersRequired[prop]}] 为空`
              }
            })
          }
        }
      })

      responses.forEach(item => {
        if (!errorMessage && !_.trim(item.name)) {
          errorMessage = '返回值列表中有数据的返回值名称为空'
        }
      })

      if (errorMessage) {
        this.$message.info(errorMessage)
        return
      }

      const obj = {
        api: para,
        parameters: parameters,
        responses: responses,
      }

      let savePromise = null
      if (this.isAdd) {
        savePromise = ddsHTTP.createApi(obj)
      } else {
        savePromise = ddsHTTP.updateApi(obj)
      }
      this.loadingData = true
      savePromise
        .then(res => {
          const data = res.data

          Object.keys(this.apiEditData).forEach(key => {
            this.apiEditData[key] = data.api[key]
          })
          // this.paramsList = _.cloneDeep(data.parameters)
          const paramsList = []
          const proxyParamsList = []
          const arr = _.cloneDeep(data.parameters)
          if (arr && Array.isArray(arr)) {
            arr.forEach(item => {
              if (item.parType === 1) {
                proxyParamsList.push(item)
              } else {
                paramsList.push(item)
              }
            })
          }
          this.paramsList = paramsList
          this.proxyParamsList = proxyParamsList

          this.returnColsList = _.cloneDeep(data.responses)

          this.refreshEditData()
          this.$message.success('保存成功!')
          this.$emit('saveSuccess', this.apiEditData)
          this.loadingData = false
        })
        .catch(e => {
          this.loadingData = false
          this.$showFailure(e)
        })
    },
    reloadApiData() {
      this.dataInit()
    },
    autoOfflineChange(newVal) {
      if (newVal) {
        const today = new Date()
        today.setDate(today.getDate() + 1)
        today.setHours(0, 0, 0, 0)
        this.apiEditData.effectiveTime = today.getTime()
      } else {
        this.apiEditData.effectiveTime = ''
      }
    },
    getCatalogList() {
      ddsHTTP
        .getCatalogList()
        .then(res => {
          const data = res.data || []
          this.apiCatalogArr = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSchemaName() {
      if (!this.apiEditData.schemaName) {
        this.apiEditData.schemaId = ''
      } else {
        this.apiEditData.schemaId = this.apiEditData.modelId
      }

      // 清空旧值
      this.apiEditData.tableObjectId = null
      this.apiEditData.tableName = null
      // this.getTableList('', this.apiEditData.schemaId)
    },
    getDbData() {
      /** 获取关联库表选项 tree 信息 */

      const sortByName = node => {
        const departments = node.subNodes
        this.$utils.sort.sortConsiderChineseNumber(departments)
      }
      return new Promise((resolve, reject) => {
        this.getModelTreePro
          .then(res => {
            const t = res.data.subNodes
            if (t != null) {
              sortByName(res.data)
              t.forEach(item => {
                sortByName(item)
              })
              this.chooseTreeData = this.data2Casopts(t)
            }

            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    data2Casopts(arr) {
      const dsCascaderTreeMap = {}
      const dbid2Optionid = {}
      let idCount = 1
      const arr2 = []
      const dealwithNode = (node, parentId) => {
        const nodeId = idCount++
        const newNode = {
          id: node.id,
          type: node.type,
          name: node.name,
          disabled: !(node.type === 'MODEL' || node.type === 'SCHEMA'),
          // children: children.length > 0 ? children : null,
          nodeId,
          parentId: parentId,
        }
        if (newNode.type === 'MODEL') {
          // dbid2Optionid[newNode.id] = newNode.nodeId
          this.modelMap[node.id] = newNode
        }
        const children = []
        node.subNodes &&
          node.subNodes.forEach(subnode => {
            const newSub = dealwithNode(subnode, nodeId)
            children.push(newSub)
          })
        newNode.children = children && children.length > 0 ? children : null
        dsCascaderTreeMap[newNode.nodeId] = newNode
        this.dbid2Optionid = dbid2Optionid
        return newNode
      }
      arr.forEach(item => {
        const newNode = dealwithNode(item, 'root')
        arr2.push(newNode)
      })
      this.dsCascaderTreeMap = dsCascaderTreeMap
      return arr2
    },
    dbChange(id) {
      this.apiEditData.modelName = null
      this.apiEditData.schemaId = null
      this.apiEditData.schemaName = null
      this.apiEditData.tableObjectId = null
      this.apiEditData.tableName = null

      let node = this.dsCascaderTreeMap[id]
      if (!node || !node.id) {
        return
      }
      if (node.type === 'SCHEMA') {
        this.apiEditData.schemaId = node.id || ''
        this.apiEditData.schemaName = node.name || ''

        node = this.dsCascaderTreeMap[node.parentId] || {}
      }
    },
    // 选择表和字段 相关函数
    initTableAndColumn() {
      this.schemaList = []
      this.apiEditData.schemaId = null
      this.apiEditData.schemaName = null
      this.apiEditData.tableObjectId = null
      this.apiEditData.tableName = null
      this.apiEditData.type = this.modelList.filter(
        item => item.modelId === this.apiEditData.modelId
      )[0].type
      // let model = this.modelList.find(item => item.modelId === this.apiEditData.modelId)
      // if (model) {
      //   this.apiEditData.modelName = model.definition
      //
      //   let children = (this.modelMap[this.apiEditData.modelId] || {}).children
      //   if (children && children.length > 0) {
      //     this.schemaList = children
      //   }
      // }
      this.getSchemaList()
      this.getTableList(this.apiEditData.modelId)
    },
    getSchemaList() {
      this.schemaList = []
      const model = this.modelList.find(
        item => item.modelId === this.apiEditData.modelId
      )
      if (model) {
        this.apiEditData.modelName = model.definition

        // const children = (this.modelMap[this.apiEditData.modelId] || {})
        //   .children
        // if (children && children.length > 0) {
        //   this.schemaList = children
        // }
        let modelSchemas = []
        if (model.schema) {
          modelSchemas = model.schema.split(';')
        } else {
          modelSchemas = model.database.split(';')
        }
        modelSchemas.forEach(element => {
          this.schemaList.push({
            name: element,
          })
        })
      }
    },
    chooseTable() {
      if (this.$refs.tableSelect && this.$refs.tableSelect.blur) {
        this.$refs.tableSelect.blur()
      }
      if (!this.apiEditData.schemaId) {
        this.$message.info('请选择 schema')
      } else {
        this.showChooseTable = true
      }
    },
    getTableList(tableName, modelId) {
      this.tableList = []
      const obj = {
        objectId: this.apiEditData.tableObjectId - 0,
        name: this.apiEditData.tableName,
        physicalName: this.apiEditData.tableName,
      }
      this.tableList.push(obj)
      return
      if (!this.apiEditData.modelId) {
        this.tableList = []
        return
      }
      return new Promise(resolve => {
        const obj = {
          currentPage: 1,
          keyword: tableName === this.apiEditData.modelId ? '' : tableName,
          modelId: modelId || this.apiEditData.modelId,
          pageSize: 50,
          tagIds: null,
          types: ['TABLE'],
        }
        this.$http
          .post(`${this.$meta_url}/service/entities/searchMetadata`, obj)
          .then(res => {
            this.tableList = res.data.content
            if (
              this.apiEditData.tableObjectId &&
              !this.tableList.find(
                item => item.objectId === this.apiEditData.tableObjectId
              )
            ) {
              const obj = {
                objectId: this.apiEditData.tableObjectId - 0,
                name: this.apiEditData.tableName,
                physicalName: this.apiEditData.tableName,
              }
              this.tableList.push(obj)
            }
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getModelList() {
      this.$http
        .get('/metadata/models/fromre/?includeLogicalEntity=false')
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.modelList = res.data
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
    getTableName() {
      const id = this.apiEditData.tableObjectId
      if (!id) {
        return
      }
      const table = this.tableList.filter(e => e.objectId === id)[0] || {}
      this.apiEditData.tableName = table.physicalName
    },
    confirmChoose(table) {
      this.tableList = [table]
      this.apiEditData.tableObjectId = table.objectId
      this.apiEditData.tableName = table.physicalName

      this.showChooseTable = false

      // 清空 SQL 生成器数据
      this.generateSqlData = {
        chooseCols: [],
        groupByCols: [],
        conditionList: [
          {
            column: '',
            rangeType: '',
            rangeValue: '',
            generateSqlData: '',
            rangeValueDefault: '',
            logicalRelation: '',
          },
        ],
        orderByCols: [
          {
            column: '',
            orderType: '',
          },
        ],
      }
    },
    selectReturnCols(event) {
      // console.log(event)
      this.choseCols = _.cloneDeep(this.generateSqlData.chooseCols || [])
      if (
        this.$refs.returnColSelector &&
        this.$refs.returnColSelector.$refs.dataSelect &&
        this.$refs.returnColSelector.$refs.dataSelect.blur
      ) {
        this.$refs.returnColSelector.$refs.dataSelect.blur()
      }
      // if (event.relatedTarget && this.chooseLimit) {
      //   this.chooseLimit = []
      // } else {
      //   this.columnKey = 'chooseCols'
      //   this.selectColType = 'multiple'
      //   this.chooseReturnCols = true
      // }
      this.columnKey = 'chooseCols'
      this.selectColType = 'multiple'
      this.chooseReturnCols = true
    },

    clearReturnCols() {
      this.chooseLimit = []
    },

    // 更新过滤条件
    updateFunction(rawData) {
      this.sqlConditionData = rawData
    },
    // 新增条件组
    addQuery() {
      console.log('新增条件组')
      this.sqlConditionData.query.push({
        logicalOperator: 'AND',
        query: [
          {
            column: '',
            operator: '',
            variableName: '',
            variableValue: '',
          },
        ],
      })
    },

    selectConditionCols(index, subIndex, event) {
      // console.log(index, subIndex, event)
      // if (
      //   this.$refs.returnColSelector &&
      //   this.$refs.conditionList[index].$refs.dataSelect &&
      //   this.$refs.conditionList[index].$refs.dataSelect.blur
      // ) {
      //   this.$refs.conditionList[index].$refs.dataSelect.blur()
      // }
      // console.log(this.sqlConditionData.query)
      this.currentSqlConditionCol =
        this.sqlConditionData.query[index].query[subIndex]
      this.choseCols = [this.currentSqlConditionCol.column || '']
      // 点击下拉框的 ▽ 展开符 或 X 清除符，如果当前选择框有值，则将当前值清空，如果当前选择框没有值，打开选择对话框
      if (event.relatedTarget && this.currentSqlConditionCol.column) {
        this.currentSqlConditionCol.column = ''
      } else {
        this.selectColType = 'single'
        this.chooseReturnCols = true
      }
      return false
    },
    confirmChooseColumn(column) {
      // 单选, SQL 条件
      if (this.selectColType === 'single') {
        this.currentSqlConditionCol.column = column.objectId
        column = [column]
      } else {
        // 多选, 返回值字段
        this.generateSqlData[this.columnKey || 'chooseCols'] = column.map(
          item => item.objectId
        )
      }

      column.forEach(item => {
        if (!this.columnMap[item.objectId]) {
          this.columnMap[item.objectId] = item
          this.columnList.push(item)
        }
      })

      this.chooseReturnCols = false
    },
    getColumnList() {
      if (!this.apiEditData.tableObjectId) {
        this.columnList = []
        return
      }
      return new Promise((resolve, reject) => {
        HTTP.getCatalogColumns({
          succesedCallback: data => {
            resolve(data)
          },
          failureCallback: e => {
            reject(e)
          },
          para: {
            objectId: this.apiEditData.tableObjectId,
          },
        })
      })
    },
    getColumnName(ids) {
      // this.columnList.forEach(e => {
      //   if (e.objectId === id) {
      //     this.apiEditData.columnName = e.physicalName
      //   }
      // })
      if (!ids) {
        return
      }
      this.apiEditData.selectedColumnsName = ids.map(item => item)
      // this.columnList.filter(e => e.objectId === id)[0].physicalName
    },
    initColumn(tableName) {
      if (typeof tableName === 'string') {
        this.apiEditData.tableName = tableName
      }
      // this.apiEditData.columnId = null
      // this.apiEditData.columnName = null
      // this.apiEditData.resultTablePks = []
      this.showTableList = false
    },
    generateSql() {
      if (!this.apiEditData.modelId) {
        this.$message.info('请选择数据源')
      } else if (!this.apiEditData.tableObjectId) {
        this.$message.info('请选择数据表')
      } else {
        this.generateSQLVisible = true
      }
    },
    selectGroupCols(event) {
      console.log(event)
      this.choseCols = _.cloneDeep(this.generateSqlData.groupByCols || [])
      if (
        this.$refs.groupByCols &&
        this.$refs.groupByCols.$refs.dataSelect &&
        this.$refs.groupByCols.$refs.dataSelect.blur
      ) {
        this.$refs.groupByCols.$refs.dataSelect.blur()
      }
      this.columnKey = 'groupByCols'
      this.selectColType = 'multiple'
      this.chooseReturnCols = true
    },
    clearGroupCols() {
      // console.log('clear groups')
      this.generateSqlData.groupByCols = []
    },
    selectOrderCols(index, event) {
      this.$refs.returnColSelector &&
        this.$refs.orderByCols[index] &&
        this.$refs.orderByCols[index].$refs.dataSelect &&
        this.$refs.orderByCols[index].$refs.dataSelect.blur &&
        this.$refs.orderByCols[index].$refs.dataSelect.blur()
      this.currentSqlConditionCol = this.generateSqlData.orderByCols[index]
      this.choseCols = [this.currentSqlConditionCol.column || '']
      if (
        event.relatedTarget &&
        this.generateSqlData.orderByCols[index].column
      ) {
        this.currentSqlConditionCol.column = ''
      } else {
        if (
          this.$refs.returnColSelector &&
          this.$refs.orderByCols[index] &&
          this.$refs.orderByCols[index].blur
        ) {
          this.$refs.orderByCols[index].blur()
        }
        this.selectColType = 'single'
        this.chooseReturnCols = true
      }
    },
    addOrderCol() {
      this.generateSqlData.orderByCols.push({
        column: '',
        orderType: '',
      })
    },
    removeOrderCol(index) {
      this.generateSqlData.orderByCols.splice(index, 1)
      this.orderListKey++
    },
    handleGenerateSql() {
      const tableName = this.apiEditData.tableName
      // columns
      const colNameMap = {}
      const columns = (this.generateSqlData.chooseCols || [])
        .map(item => {
          const colName = this.columnMap[item].physicalName || ''
          const alias = this.$utils.string.underLine2Hump(colName)
          let aliasCount = 0
          if (colNameMap[alias]) {
            aliasCount = colNameMap[alias] + 1
          }
          colNameMap[alias] = aliasCount
          return colName
        })
        .join(',')

      // 处理过滤条件
      const condition = []
      const conditionWithDefault = []
      const { query, logicalOperator } = this.sqlConditionData
      query.forEach(item => {
        const conditionItem = []
        const conditionWithDefaultItem = []
        const { query, logicalOperator } = item
        query.forEach(c => {
          const { column, operator, variableName, variableValue } = c
          const physicalName = this.columnMap[column].physicalName
          if (this.apiEditData.type === 'POSTGRESQL') {
            conditionItem.push(
              `${physicalName} ${operator} ${
                operator === 'like' ? `'%'` : ''
              }{{${variableName}}}${operator === 'like' ? `'%'` : ''}`
            )
          } else {
            conditionItem.push(
              `${physicalName} ${operator} ${
                operator === 'like' ? '"%"' : ''
              }{{${variableName}}}${operator === 'like' ? '"%"' : ''}`
            )
          }
          conditionWithDefaultItem.push(
            `${physicalName} ${operator} ${
              operator === 'like' ? '"%"' : ''
            }{{${variableName}-${variableValue}}}${
              operator === 'like' ? '"%"' : ''
            }`
          )
        })
        condition.push(
          `${query.length > 1 ? '(' : ''}${conditionItem.join(
            ` ${logicalOperator} `
          )}${query.length > 1 ? ')' : ''}`
        )
        conditionWithDefault.push(
          `${query.length > 1 ? '(' : ''}${conditionWithDefaultItem.join(
            ` ${logicalOperator} `
          )}${query.length > 1 ? ')' : ''}`
        )
      })
      const conditionStr = condition.join(` ${logicalOperator} `)
      const conditionWithDefaultStr = conditionWithDefault.join(
        ` ${logicalOperator} `
      )

      // group by
      const groupBy = this.generateSqlData.groupByCols
        .map(item => this.columnMap[item].physicalName)
        .join(',')
      // order by
      let orderBy =
        this.generateSqlData.orderByCols[0].column &&
        this.generateSqlData.orderByCols.map(item => {
          const colName = this.columnMap[item.column].physicalName || ''
          return item.orderType ? `${colName} ${item.orderType}` : colName
        })
      // 将 columns condition group order 整合成sql
      let sql = ''
      if (this.apiEditData.type === 'POSTGRESQL') {
        sql = `SELECT ${columns} FROM "${this.apiEditData.schemaName}".${
          this.apiEditData.tableName
        }${conditionStr ? ' WHERE ' + conditionStr : ''}${
          groupBy ? ' GROUP BY ' + groupBy : ''
        } ${orderBy ? ' ORDER BY ' + orderBy : ''};`
      } else {
        sql = `SELECT ${columns} FROM ${this.apiEditData.schemaName}.${
          this.apiEditData.tableName
        }${conditionStr ? ' WHERE ' + conditionStr : ''}${
          groupBy ? ' GROUP BY ' + groupBy : ''
        } ${orderBy ? ' ORDER BY ' + orderBy : ''};`
      }
      const sqlWithDefault = `SELECT ${columns} FROM ${
        this.apiEditData.schemaName
      }.${this.apiEditData.tableName}${
        conditionWithDefaultStr ? ' WHERE ' + conditionWithDefaultStr : ''
      }${groupBy ? ' GROUP BY ' + groupBy : ''} ${
        orderBy ? ' ORDER BY ' + orderBy : ''
      };`
      this.apiEditData.sqlContent = sql
      this.apiEditData.sqlContentWithDefault = sqlWithDefault
      this.generateSQLVisible = false

      this.sqlChange()
    },
    testSql() {
      let dupName = ''
      if (this.$refs.paramsList && this.$refs.paramsList.duplicateTest) {
        dupName = this.$refs.paramsList.duplicateTest()
        if (dupName) {
          this.$showFailure(`名称为 ${dupName} 的参数重复`)
          return
        }
      }
      if (this.$refs.returnColsCom && this.$refs.returnColsCom.duplicateTest) {
        dupName = this.$refs.returnColsCom.duplicateTest()
        if (dupName) {
          this.$showFailure(`名称为 ${dupName} 的返回值重复`)
          return
        }
      }
      if (
        this.$refs.proxyParamsList &&
        this.$refs.proxyParamsList.duplicateTest
      ) {
        dupName = this.$refs.proxyParamsList.duplicateTest()
        if (dupName) {
          this.$showFailure(`名称为 ${dupName} 的代理参数重复`)
          return
        }
      }
      const parameters = this.$refs.paramsList.getParamsList()
      const responses = this.$refs.returnColsCom.getReturnColsList()

      // 判断 参数与返回值 必填项是否为空
      let errorMessage = ''
      const parametersRequired = {
        name: '参数名称',
        location: '参数位置',
        type: '参数类型',
        defaults: '默认值',
      }
      // let returnColsRequired = ['name']
      parameters.forEach(item => {
        if (!errorMessage) {
          // 不需要用户传入的参数, name 为空
          if (item.parSynchronize !== 0 && !_.trim(item.name)) {
            errorMessage = '参数列表中有数据的参数名称为空'
          } else {
            Object.keys(parametersRequired).forEach(prop => {
              if (
                (item.name === 'appKey' || item.name === 'appSecret') &&
                prop === 'defaults'
              ) {
                // appKey 与 appSecret 没有默认值
              } else if (!_.trim(item[prop]) && prop !== 'name') {
                errorMessage = `参数列表中 [${item.name}] 的 [${parametersRequired[prop]}] 为空`
              }
            })
          }
        }
      })

      responses.forEach(item => {
        if (!errorMessage && !_.trim(item.name)) {
          errorMessage = '返回值列表中有数据的返回值名称为空'
        }
      })

      if (errorMessage) {
        this.$message.info(errorMessage)
        return
      }

      // console.log(this.sqlConditionData, parameters, this.$refs.returnColsCom.returnColsList)
      HTTP.testSql({
        api: {
          sqlContent: this.apiEditData.sqlContent,
          modelId: this.apiEditData.modelId,
        },
        parameters,
        responses,
        // responses: this.$refs.returnColsCom.returnColsList
      })
        .then(res => {
          if (res.data.code === 200) {
            this.$message.success('测试成功')
          } else {
            this.$message.error(res.data.msg)
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.loadingData = false
        })
    },
    blurSql() {
      // TODO
      // 直接编辑输入框的 SQL, sqlContentWithDefault 未修改
      // this.apiEditData.sqlContentWithDefault = this.apiEditData.sqlContent
      this.apiEditData.sqlContentWithDefault = this.apiEditData.sqlContent
      this.sqlChange()
    },
    sqlChange() {
      const sql = this.apiEditData.sqlContentWithDefault
      this.getParams(sql)
      this.getReturnCols(sql)
    },
    changeApiType() {
      this.apiEditData.sqlContentWithDefault = ''
      this.apiEditData.sqlContent = ''
      this.sqlChange()
    },
    getParams(sql = '') {
      if (this.$refs.paramsList && this.$refs.paramsList.getParams) {
        this.$refs.paramsList.getParams(sql)
      }
    },
    getReturnCols(sql = '') {
      if (this.$refs.returnColsCom && this.$refs.returnColsCom.getReturnCols) {
        this.$refs.returnColsCom.getReturnCols(sql)
      }
    },
    sqlColsDuplicateTest(bool) {
      this.paramsRepeat = !!bool
      // sql 为空时不用检查重复
      if (
        this.apiEditData.apiAccessMethod !== 'PROXY_API' &&
        !this.apiEditData.sqlContent
      )
        return
      if (this.$refs.apiEditForm && this.$refs.apiEditForm.validateField) {
        this.$refs.apiEditForm.validateField('sqlContent')
      }
    },
    addProxyParam() {
      if (this.$refs.proxyParamsList && this.$refs.proxyParamsList.addParam) {
        this.$refs.proxyParamsList.addParam()
      }
    },
    addParam() {
      if (this.$refs.paramsList && this.$refs.paramsList.addParam) {
        this.$refs.paramsList.addParam()
      }
    },
    addReturnCol() {
      if (this.$refs.returnColsCom && this.$refs.returnColsCom.addReturnCol) {
        this.$refs.returnColsCom.addReturnCol()
      }
    },
    updateParameter(param) {
      if (this.$refs.paramsList && this.$refs.paramsList.updateParameter) {
        this.$refs.paramsList.updateParameter(param)
      }
    },
    updateProxyId(name2Id) {
      this.name2Id = name2Id
    },

    testApi() {
      let hasDefaults = false
      if (this.$refs.paramsList && this.$refs.paramsList.hasDefaults) {
        hasDefaults = this.$refs.paramsList.hasDefaults()
      }
      if (!hasDefaults) {
        this.$message.info('请设置参数默认值')
        return
      }
      return new Promise(resolve => {
        ddsHTTP
          .testApi({ id: this.apiEditData.id })
          .then(res => {
            this.$message.success('测试成功')
            this.$emit('apiDataUpdate')
            this.reloadApiData()
            resolve()
          })
          .catch(e => {
            this.$emit('apiDataUpdate')
            this.loadingData = false
            this.$emit('apiLoadingUpdate')
            this.$showFailure(e)
          })
      })
    },
    publishApi() {
      return new Promise(resolve => {
        ddsHTTP
          .changeApiOnline({
            id: this.apiEditData.id,
            requestBody: 0,
          })
          .then(res => {
            this.$message.success('发布成功')
            this.$emit('apiDataUpdate')
            this.reloadApiData()
            resolve()
          })
          .catch(e => {
            this.$emit('apiDataUpdate')
            this.loadingData = false
            this.$emit('apiLoadingUpdate')
            this.$showFailure(e)
            resolve()
          })
      })
    },
    offlineApi() {
      return new Promise(resolve => {
        ddsHTTP
          .changeApiOnline({
            id: this.apiEditData.id,
            requestBody: 1,
          })
          .then(res => {
            this.$message.success('下线成功')
            this.$emit('apiDataUpdate')
            this.reloadApiData()
            resolve()
          })
          .catch(e => {
            this.$emit('apiDataUpdate')
            this.$emit('apiLoadingUpdate')
            this.loadingData = false
            this.$showFailure(e)
            resolve()
          })
      })
    },
    copyToClipboard() {
      const url = `${this.ApiBaseurl}${this.apiEditData.api}`
      if (this.apiEditData.api) {
        this.$utils.string.setClipBoard(url)
        this.$message.success(
          '访问地址已经复制到剪贴板，请在目的位置使用 Ctrl + V 进行粘贴'
        )
      } else {
        this.$message.info('没有访问地址可以复制')
      }
    },
    jsonFormatter(str) {
      if (this.$utils.isJSON(str)) {
        str = JSON.parse(str)
        str = JSON.stringify(str, null, '\t')
      }
      return str
    },
    formatJSON() {
      this.$refs.apiEditForm.validateField('apiResultExample')
      this.apiEditData.apiResultExample = this.jsonFormatter(
        this.apiEditData.apiResultExample
      )
    },
    refreshJson() {
      this.showJsonContent = false
      this.$nextTick(() => {
        this.showJsonContent = true
        setTimeout(() => {
          Prism.highlightAll()
        })
      })
    },
    getParamsListOrg() {
      let parameters = []
      if (this.$refs.paramsList && this.$refs.paramsList.getParamsListOrg) {
        parameters = this.$refs.paramsList.getParamsListOrg()
      }
      return parameters
    },
    showEditTab() {
      if (this.$refs.paramsList && this.$refs.paramsList.resizeTable) {
        this.$refs.paramsList.resizeTable()
      }
      if (this.$refs.returnColsCom && this.$refs.returnColsCom.resizeTable) {
        this.$refs.returnColsCom.resizeTable()
      }
      if (
        this.$refs.proxyParamsList &&
        this.$refs.proxyParamsList.resizeTable
      ) {
        this.$refs.proxyParamsList.resizeTable()
      }
    },
  },
  watch: {
    'generateSqlData.chooseCols': {
      deep: true,
      handler: function (newVal) {
        this.columnListLimit = this.columnList
        this.chooseLimit = []
        if (newVal && newVal.length > 20 && false) {
          const obj = {
            physicalName: `共选中 ${newVal.length} 项`,
            objectId: 'count',
          }
          this.chooseLimit = newVal.slice(0, 20)
          this.chooseLimit.push(obj.objectId)
          this.columnListLimit.push(obj)
        }
      },
    },
  },
}
