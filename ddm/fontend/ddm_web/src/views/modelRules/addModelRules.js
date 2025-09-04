import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import LDMTypes from '@constant/LDMTypes'
import chooseModel from '../../views/modelRules/chooseModel.vue'
import rulePackage from './rulePackage.vue'
import rulePackageNew from './rulePackageNew.vue'

export default {
  components: {
    chooseModel,
    rulePackage,
    rulePackageNew // 新样式, 不处理 ifElse
  },
  data () {
    return {
      isEN: window.lang === 'English',
      hasIfElseCondition: false, // 兼容旧数据, 处理旧数据中的 ifElse, 此时, 展示旧样式
      ruleRunResultVisible: false,
      keyword: '',
      LDMTypes,
      modelRules: {
        code: '',
        description: '',
        severityValue: '',
        // dataBaseValue: '',
        stateValue: true,
        typeIdValue: '',
        severityArr: [{
          name: 'INFO',
          label: 'INFO'
        }, {
          name: 'WARN',
          label: 'WARN'
        }, {
          name: 'ERROR',
          label: 'ERROR'
        }],
        stateArr: [{
          name: true,
          label: this.$v.RuleChecking.Enable // '启用'
        }, {
          name: false,
          label: this.$v.RuleChecking.Disable // '禁用'
        }],
        typeIdArr: [],
        conditionArr: [
          {
            name: 'And',
            label: this.$v.RuleChecking.also // '并且'
          },
          {
            name: 'Or',
            label: this.$v.RuleChecking.or // '或者'
          }
          // {
          //   name: 'IfElse',
          //   label: 'If/Else'
          // }
        ],
        conditionValue: 'And',
        databaseTypeArr: [],
        databaseTypeValue: []
      },
      rules: {
        code: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseFillInTheNumber // '请填写编号'
        },
        description: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseFillInTheDescription // '请填写描述'
        },
        severityValue: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseSeverity // '请填写严重程度'
        },
        databaseTypeValue: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseFillDatabaseType // '请填写数据库类型'
        },
        typeIdValue: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseFillObjectType // '请填写对象类型'
        },
        stateValue: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.leaseFillStatus // '请填写状态'
        },
        conditionValue: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseFillLogicalRelationship // '请填写逻辑关系'
        }
      },
      // 不同模型类型 对应的 对象类型, 切换模型类型时自动生成对象属性
      objectTypeMap: {
        // 概念模型: 模型, 主题域, 业务对象
        CONCEPTUAL: [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.BusinessObject],
        // 业务领域概念模型: 模型, 业务对象
        CONCEPTUALBUSINESSDOMAIN: [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.BusinessObject],
        // 逻辑模型: 模型, 实体, 业务对象, 属性
        LOGICAL: [LDMTypes.ModelSource, LDMTypes.Entity, LDMTypes.Diagram, LDMTypes.BusinessObject, LDMTypes.Attribute],
        // 业务领域逻辑模型: 模型, 实体, 业务对象, 属性
        LOGICALBUSINESSDOMAIN: [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.Entity, LDMTypes.BusinessObject, LDMTypes.Attribute],
        // 业务对象逻辑模型: 模型, 实体, 业务对象, 属性
        LOGICALBUSINESSOBJECT: [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.Entity, LDMTypes.BusinessObject, LDMTypes.Attribute],
        // 应用逻辑模型: 模型, 实体, 属性
        LOGICALAPP: [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.BusinessObject, LDMTypes.Entity, LDMTypes.Attribute],
        // 物理模型 即 数据库: 模型, 表, 字段, 视图
        OTHRE: [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.Entity, LDMTypes.Attribute, LDMTypes.View]
      },
      // 属性规则 中 属性的 备选值
      ruleAttrOptions: [],
      ruleTypeMap: {
        ifElse: 'ifElse',
        normal: 'normal', // 普通检查规则信息
        udp: 'udp',
        subCountRule: 'subCountRule', // 子模型检查规则数量信息
        subChildRule: 'subChildRule' // 子模型检查规则信息
      },
      // 数据类型 校验规则 操作符
      operatorDatatype: [
        {
          name: 'DATA_EQL',
          label: '类型等于' // 等于
        },
        {
          name: 'DATA_NO_EQL',
          label: '类型不等于' // 不等于
        },
        {
          name: 'DATA_SCALE',
          label: this.$v.RuleChecking.typeLengthPrecisionMatch // 类型长度精度匹配
        },
        {
          name: 'DATA_IS_INCLUDE',
          label: '值属于' // 值属于
        },
        {
          name: 'DATA_NOT_INCLUDE',
          label: '值不属于' // 值不属于
        }
      ],
      // SQL 类型数据 校验规则操作符
      operatorSQL: [{
        name: 'MATCH_REGEX',
        label: this.$v.RuleChecking.matchRegularExpression // 匹配正则表达式
      }, {
        name: 'INCLUDE_REGEX',
        label: this.$v.RuleChecking.includeRegularExpressions // 包含正则表达式
      }],
      // 普通数据 校验规则 操作符
      operatorNormalString: [
        {
          name: 'LEN_GREATER_THAN',
          label: this.$v.RuleChecking.lengthGreaterThan // 长度大于
        },
        {
          name: 'LEN_GREATER_THAN_OR_EQL',
          label: '长度大于或者等于' // 长度大于或者等于
        },
        {
          name: 'LEN_LESS_THAN',
          label: this.$v.RuleChecking.lengthLessThan // 长度小于
        },
        {
          name: 'LEN_LESS_THEN_OR_EQL',
          label: '长度小于或者等于' // 长度小于或者等于
        },
        {
          name: 'LEN_EQ',
          label: '长度等于' // 长度等于
        },
        {
          name: 'LEN_NO_EQ',
          label: '长度不等于' // 长度不等于
        },
        {
          name: 'START_WITH',
          label: this.$v.RuleChecking.startWith // 以开头
        },
        {
          name: 'START_NOT_WITH',
          label: '不以开头' // 不以开头
        },
        {
          name: 'END_WITH',
          label: this.$v.RuleChecking.endWith // 以结尾
        },
        {
          name: 'END_NOT_WITH',
          label: '不以结尾' // 不以结尾
        },
        {
          name: 'INCLUDE_VALUE',
          label: this.$v.RuleChecking.contain // 包含
        },
        {
          name: 'UNINCLUDE_VALUE',
          label: '不包含' // 不包含
        },
        {
          name: 'VALUE_EQUAL',
          label: '值等于' // 值等于
        },
        {
          name: 'VALUE_NO_EQUAL',
          label: '值不等于' // 值不等于
        },
        {
          name: 'DATA_IS_NULL',
          label: '空值' // 空值
        },
        {
          name: 'MUST_HAVE',
          label: '非空值' // 必须有值
        },
        {
          name: 'OPTIONAL_VALUE',
          label: this.$v.RuleChecking.optionalValue // 可选值
        }, {
          name: 'MATCH_REGEX',
          label: this.$v.RuleChecking.matchRegularExpression // 匹配正则表达式
        }, {
          name: 'INCLUDE_REGEX',
          label: this.$v.RuleChecking.includeRegularExpressions // 包含正则表达式
        }
      ],
      // 数字类型 校验规则 操作符
      operatorNumber: [
        {
          name: 'GREATER_THAN',
          label: '大于' // GREATER_THAN
        },
        {
          // GREATER_THAN_OR_EQL
          name: 'GREATER_THAN_OR_EQL',
          label: '大于等于' // GREATER_THAN_OR_EQL
        },
        {
          name: 'LESS_THAN',
          label: '小于' // LESS_THAN
        },
        {
          // LESS_THAN_OR_EQL
          name: 'LESS_THAN_OR_EQL',
          label: '小于等于' // LESS_THAN_OR_EQL
        },
        {
          name: 'EQUAL_TO',
          label: '等于' // EQUAL
        },
        {
          name: 'NOT_EQUAL_TO',
          label: '不等于' // NOT_EQUAL
        }
      ],

      addPackageId: 1,

      saveDisabled: true,
      // addRulesId: 0,
      // addSubObjectId: 0,
      saveRulesList: [],
      packageList: [],
      stateDisabled: false,
      dialogVisible: false,
      modelID: '',
      ruleResult: '',
      modelName: '',
      // ruleValueSurfaceName: false
      testButtonDisabled: false
    }
  },
  props: {
    typeState: String,
    rulesData: Object,
    databaseTypeListPromise: {
      type: Promise
    },
    databaseTypeMap: {
      type: Object
    }
  },
  created () {
  },
  mounted () {
    this.getDbTypes()
    this.dataInit()

    this.$bus.$on('removeModelSelectDialog', () => {
      this.dialogVisible = false
    })
    this.$bus.$on('modelSelected', model => {
      // this.bind2(model)
      this.modelID = model.id
      this.modelName = model.name
      this.testRules()
    })
  },
  beforeDestroy () {
    this.$bus.$off('removeModelSelectDialog')
    this.$bus.$off('modelSelected')
  },
  methods: {
    // 编辑, 查看时 回显数据
    dataInit () {
      let hasIfElseCondition = false
      if (this.typeState === 'see' || this.typeState === 'edit') {
        this.modelRules.code = this.rulesData.code
        this.modelRules.description = this.rulesData.message
        this.modelRules.severityValue = this.rulesData.severity
        this.modelRules.databaseTypeValue = this.rulesData.dbTypes
        this.modelRules.typeIdValue = this.rulesData.typeId.toString()
        this.modelRules.stateValue = this.rulesData.enable
        this.modelRules.conditionValue = this.rulesData.logicalType
        this.rulesData.ruleInfo = this.rulesData.ruleInfo || []

        this.rulesData.ruleInfo.forEach(v => {
          v.fieldTypeVal = this.modelRules.typeIdValue
          v.id = this.addPackageId++

          // 如果旧数据有 ifElseCondition 则为 true
          if (v.ruleType === 'ifElse') {
            hasIfElseCondition = true
          }

          if (v?.ruleInfos && v.ruleInfos[0]?.ruleType === 'subChildRule') {
            v.type = 'sub'
          } else {
            v.type = 'normal'
          }
        })
        this.hasIfElseCondition = hasIfElseCondition
        this.packageList = this.rulesData.ruleInfo

        this.changeModelType()

        this.getRuleAttrOptions()

        if (this.typeState === 'see') {
          this.stateDisabled = true
        } else {
          this.stateDisabled = false
        }
      } else {
        this.changeModelType()
        // this.addRulePackage('normal')
      }
    },
    // 获取数据库类型
    getDbTypes () {
      this.databaseTypeListPromise && this.databaseTypeListPromise.then(res => {
        this.modelRules.databaseTypeArr = res.data.subTree
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    // 切换数据库类型, 根据数据库类型, 生成 对象类型 备选项
    changeModelType () {
      const objMap = {
        // 模型
        [LDMTypes.ModelSource]: {
          name: String(LDMTypes.ModelSource),
          label: '模型'
        },
        // 主题域
        [LDMTypes.Diagram]: {
          name: String(LDMTypes.Diagram),
          label: '主题域'
        },
        // 业务对象
        [LDMTypes.BusinessObject]: {
          name: String(LDMTypes.BusinessObject),
          label: '业务对象'
        },
        // 表/实体
        [LDMTypes.Entity]: {
          name: String(LDMTypes.Entity),
          label: '表/实体'
        },
        // 属性/字段
        [LDMTypes.Attribute]: {
          name: String(LDMTypes.Attribute),
          label: '属性/字段'
        },
        // 视图
        [LDMTypes.View]: {
          name: String(LDMTypes.View),
          label: this.$v.RuleChecking.view
        }
      }
      let dbTypes = this.modelRules.databaseTypeValue || []
      let objectTypeSet = null

      // 两个集合取交集
      function intersection (set1, set2) {
        const result = new Set()
        for (const elem of set1) {
          if (set2.has(elem)) {
            result.add(elem)
          }
        }
        return result
      }

      dbTypes.forEach(item => {
        let newSet = new Set()

        // 如果 objectTypeSet 为空, 则直接赋值
        if (!objectTypeSet) {
          objectTypeSet = newSet
        }
        // 根据模型类型判断 对象类型, 如果模型类型没有匹配, 则按 物理模型 即 数据库处理
        let t = this.objectTypeMap[item] || this.objectTypeMap.OTHRE
        t.forEach(o => {
          newSet.add(objMap[o])
        })

        objectTypeSet = intersection(objectTypeSet, newSet)
      })
      if (!objectTypeSet) {
        objectTypeSet = new Set()
      }
      // 排序
      let allTypes = [LDMTypes.ModelSource, LDMTypes.Diagram, LDMTypes.BusinessObject, LDMTypes.Entity, LDMTypes.View, LDMTypes.Attribute]
      let typeIdArr = []
      allTypes.forEach(key => {
        key = String(key)
        if (objectTypeSet.has(objMap[key])) {
          typeIdArr.push(objMap[key])
        }
      })

      this.modelRules.typeIdArr = typeIdArr

      // 切换 数据库类型, 设置默认选中的 对象类型
      // 如果对象类型列表中没有 当前选中的类型, 清空对象类型, 如果有, 不改变已经选中的
      if (this.modelRules.typeIdArr.filter(item => item.name === this.modelRules.typeIdValue).length === 0) {
        this.modelRules.typeIdValue = ''
        this.changeTypeIdValue()
      }
      // this.modelRules.typeIdValue = ''
    },
    // 根据对象类型, 生成 属性规则 中 属性的 备选值
    getRuleAttrOptions () {
      const optionsMap = {
        // 模型: 名称, 所属系统, udp, schema, 字符集, 校对集
        [LDMTypes.ModelSource]: [
          {
            name: String(LDMTypes.Name), // 名称
            label: this.$v.RuleChecking.name // '名称'
          },
          // {
          //   name: 'MODEL_SYSTEM',
          //   label: '所属系统'
          // },
          // {
          //   name: 'SCHEMA',
          //   label: 'schema'
          // },
          {
            name: String(LDMTypes.IsUDP), // UDP_ATTR
            label: 'UDP'
          },
          {
            name: String(LDMTypes.CharacterSet), // 字符集
            label: '字符集' // '字符集'
          },
          {
            name: String(LDMTypes.Collation), // 校对集
            label: '校对集' // '校对集'
          }
        ],
        // 主题域: 名称, 定义, 范围, 包括, 不包括, 中文名, 英文名
        [LDMTypes.Diagram]: [
          {
            name: String(LDMTypes.Name), // 名称
            label: this.$v.RuleChecking.name // '名称'
          },
          {
            name: String(LDMTypes.Definition), // 定义
            label: '定义' // '定义'
          },
          {
            name: String(LDMTypes.IsUDP), // UDP_ATTR
            label: 'UDP'
          }
        ],
        // 业务对象: 目的, 定义, 范围, 包括, 不包括, 中文名, 英文名
        [LDMTypes.BusinessObject]: [
          // {
          //   name: 'OBJ_TARGET',
          //   label: '目的' // '目的'
          // },
          // {
          //   name: 'OBJ_RANGE',
          //   label: '范围' // '范围'
          // },
          // {
          //   name: 'OBJ_INCLUDE',
          //   label: '包括' // '包括'
          // },
          // {
          //   name: 'OBJ_EXCLUSION',
          //   label: '不包括' // '不包括'
          // },
          {
            name: String(LDMTypes.Name), // FIELD_NAME
            label: '业务对象名' // 业务对象名
          },
          {
            name: String(LDMTypes.LogicalName), // FIELD_ALIAS // 中文名
            label: this.$v.RuleChecking.cnName // 中文名
          },
          {
            name: String(LDMTypes.Definition), // 定义
            label: '定义' // '定义'
          }
        ],
        // 表/实体: 中文名, 英文名, 定义, udp, 属性数
        [LDMTypes.Entity]: [
          {
            name: String(LDMTypes.Name), // FIELD_NAME
            label: this.$v.RuleChecking.name // '名称'
          },
          {
            name: String(LDMTypes.LogicalName), // FIELD_ALIAS // 中文名
            label: this.$v.RuleChecking.cnName // 中文名
          },
          {
            name: String(LDMTypes.Definition), // FIELD_DESC
            label: '定义' // 定义
          },
          {
            name: String(LDMTypes.IsUDP), // UDP_ATTR
            label: 'UDP'
          },
          {
            name: String(LDMTypes.ColumnOrderArray), // 索引数量
            label: '字段数量'
          },
          {
            name: String(LDMTypes.KeyGroup), // 索引数量
            label: '索引数量'
          }
        ],
        // 属性/字段: 中文名, 英文名, 数据类型, 默认值, 定义, udp, 业务规则, 数据格式
        [LDMTypes.Attribute]: [
          {
            name: String(LDMTypes.Name), // FIELD_NAME
            label: this.$v.RuleChecking.name // '名称'
          },
          {
            name: String(LDMTypes.LogicalName), // FIELD_ALIAS
            label: this.$v.RuleChecking.cnName // 中文名
          },
          {
            name: String(LDMTypes.Definition), // FIELD_DESC
            label: '定义' // 定义
          },
          {
            name: String(LDMTypes.DataType), // FIELD_DATATYPE
            label: this.$v.RuleChecking.dataType // 数据类型
          },
          {
            name: String(LDMTypes.IsNotNull), // 非空
            label: '非空' // 非空
          },
          {
            name: String(LDMTypes.IsAutoIncrement), // 非空
            label: '自增' // 自增
          },
          {
            name: String(LDMTypes.DefaultValue), // 默认值
            label: '默认值' // 默认值
          },
          {
            name: String(LDMTypes.IsUDP), // UDP_ATTR
            label: 'UDP'
          }
        ],
        // 视图: 名称, 中文名, 定义, SQL
        [LDMTypes.View]: [
          {
            name: String(LDMTypes.Name), // FIELD_NAME
            label: this.$v.RuleChecking.name // '名称'
          },
          {
            name: String(LDMTypes.LogicalName), // FIELD_ALIAS
            label: this.$v.RuleChecking.cnName // 中文名
          },
          {
            name: String(LDMTypes.Definition), // FIELD_DESC
            label: '定义' // 定义
          },
          {
            name: String(LDMTypes.IsUDP), // UDP_ATTR
            label: 'UDP'
          },
          {
            name: String(LDMTypes.ColumnOrderArray), // 索引数量
            label: '字段数量'
          },
          {
            name: String(LDMTypes.SQL), // VIEW_SQL
            label: 'SQL'
          }
        ]
      }
      this.ruleAttrOptions = optionsMap[this.modelRules.typeIdValue] || []
    },
    removeModelSelectDialog () {
      this.dialogVisible = false
    },
    // 修改逻辑关系
    changeConditionValue (value) {

    },
    // 修改对象类型
    changeTypeIdValue (value) {
      this.ruleAttrOptions = []
      this.packageList = []
      this.addRulePackage('normal')
    },
    modelChoice () {
      this.dialogVisible = true
    },
    // 获取模型保存需要的数据
    getSaveModelData () {
      let response = {
        code: this.modelRules.code,
        typeId: this.modelRules.typeIdValue,
        severity: this.modelRules.severityValue,
        message: this.modelRules.description,
        dbTypes: this.modelRules.databaseTypeValue,
        logicalType: this.modelRules.conditionValue
      }
      let rulePackageRefs = this.$refs.rulePackage
      let ruleInfoArr = []
      if (rulePackageRefs) {
        rulePackageRefs.forEach(element => {
          ruleInfoArr.push(element.getRuleResult())
        })
      }
      response.ruleInfo = ruleInfoArr

      if (this.typeState === 'edit') {
        this.saveRulesList = this.rulesData
        this.saveRulesList.code = this.modelRules.code
        this.saveRulesList.typeId = this.modelRules.typeIdValue
        this.saveRulesList.severity = this.modelRules.severityValue
        this.saveRulesList.message = this.modelRules.description
        this.saveRulesList.dbTypes = this.modelRules.databaseTypeValue
        this.saveRulesList.logicalType = this.modelRules.conditionValue
        this.saveRulesList.ruleInfo = ruleInfoArr
      } else {
        this.saveRulesList = response
      }

      return response
    },
    testRules () {
      let response = this.getSaveModelData()

      HTTP.testRules({
        // modelId: this.modelID,
        modelId: this.modelID,
        requestBody: response
      })
        .then((data) => {
          data = (data || '').replace(/<br>/ig, '; ')
          this.ruleResult = `${data}`
          this.saveDisabled = false

          // 测试完成, 显示结果弹框
          this.ruleRunResultVisible = true

          setTimeout(() => {
            this.$message({
              message: this.$v.RuleChecking.testPassed, // '测试通过',
              type: 'success'
            })
          }, 100)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 隐藏测试结果弹框
    hideRuleRunResultVisible () {
      this.ruleRunResultVisible = false
      this.dialogVisible = false
    },
    refreshSaveDisabled () {
      this.saveDisabled = true
    },
    saveRules () {
      this.getSaveModelData()
      this.saveRulesList.enable = this.modelRules.stateValue
      HTTP.addRules({
        requestBody: this.saveRulesList,
        successCallback: (data) => {
          this.$emit('editSuccesed')
          this.$datablauMessage.success('保存成功')
        },
        finallyCallback: () => {
        }
      })
    },
    closeTab () {
      this.$emit('editSuccesed')
    },
    // 添加规则组
    addRulePackage (type = 'normal') {
      this.addPackageId++
      let obj = {
        ruleType: 'mixed',
        logicalType: 'And',
        ruleInfos: [],
        id: this.addPackageId,
        fieldTypeVal: this.modelRules.typeIdValue,
        type: type
      }

      this.packageList.push(obj)

      this.$nextTick(this.getTestButtonDisabled)
    },
    // 删除规则组
    removeRulePackage (id) {
      let index = this.packageList.findIndex(item => item.id === id)
      this.packageList.splice(index, 1)

      this.$nextTick(this.getTestButtonDisabled)
    },
    // 根据条件组, 获取测试按钮是否可用
    getTestButtonDisabled () {
      let result = false
      if (this.testRulesDisabled) {
        result = true
      }
      let rulePackageRefs = this.$refs.rulePackage
      if (rulePackageRefs) {
        rulePackageRefs.forEach(element => {
          if (element.getTestButtonDisabled()) {
            result = true
          }
        })
      }
      this.testButtonDisabled = result
    },
    packageComplete () {
      this.$nextTick(this.getTestButtonDisabled)
    },
    // 切换逻辑关系
    toggleLogicalType () {
      // 非编辑状态, 不能切换逻辑关系
      if (this.typeState === 'see') {
        return
      }

      // 未选择对象类型, 不能切换逻辑关系
      if (!this.modelRules.typeIdValue) {
        return
      }

      if (this.modelRules.conditionValue === 'And') {
        this.modelRules.conditionValue = 'Or'
      } else {
        this.modelRules.conditionValue = 'And'
      }
    }
  },
  watch: {
    modelRules: {
      handler: function (newVal, oldVal) {
        this.refreshSaveDisabled()
      },
      deep: true
    },
    'modelRules.typeIdValue' () {
      this.getRuleAttrOptions()
    },
    testRulesDisabled () {
      // 当规则数据改变, 触发获取规则组内的测试条件是否可用
      this.getTestButtonDisabled()
    }
  },
  computed: {
    // switch 开关的 label
    stateValueActiveText () {
      return this.modelRules.stateValue ? '启用' : '禁用'
    },
    // 根据规则全局属性, 判断 是否可以 选择模型 测试规则
    testRulesDisabled () {
      let result = false
      if (!this.packageList || this.packageList.length < 1) {
        result = true
      }
      let keyArr = ['code', 'description', 'severityValue', 'databaseTypeValue', 'typeIdValue', 'conditionValue']
      if (!result) {
        keyArr.forEach(key => {
          if (!_.trim(this.modelRules[key] || '')) {
            result = true
          }
        })
      }
      return result
    },
    selectedModel () {
      return this.modelRules.databaseTypeValue && this.modelRules.databaseTypeValue.length > 0
    }
  }
}
