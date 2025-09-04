import LDMTypes from '@constant/LDMTypes'

export default {
  name: 'rulePackage',
  data () {
    return {
      LDMTypes,
      subObjectRuleArr: [],
      ruleConditionArr: [], // 属性规则 数组 列表
      saveDisabled: true,
      addRulesId: 0,
      addSubObjectId: 0,
      ruleAttrOptions: [
        {
          name: 'FIELD_NAME',
          label: this.$v.RuleChecking.name // 名称
        },
        {
          name: 'FIELD_ALIAS',
          label: this.$v.RuleChecking.cnName // 中文名
        },
        {
          name: 'FIELD_DESC',
          label: this.$v.RuleChecking.describe // 描述
        },
        {
          name: 'UDP_ATTR',
          label: 'UDP'
        },
        {
          name: 'VIEW_SQL',
          label: 'SQL'
        },
        {
          name: 'FIELD_DATATYPE',
          label: this.$v.RuleChecking.dataType // 数据类型
        }
      ],
      modelRules: {
        subobjectValue: ''
      },
      conditionArr: [
        {
          name: 'And',
          label: this.$v.RuleChecking.also // '并且'
        },
        {
          name: 'Or',
          label: this.$v.RuleChecking.or // '或者'
        },
        {
          name: 'IfElse',
          label: 'If/Else'
        }
      ],
      // 索引类型 操作符 分类
      attributeArrKeyIndex: [
        {
          // name: 'FIELD_INDEXED_NAME',
          name: String(LDMTypes.Name), // 名称
          label: '名称' // 字段数
        },
        {
          // name: 'FIELD_INDEXED_FIELD_COUNT',
          name: String(LDMTypes.KeyGroupMemberRefs), // 成员数量
          label: '成员数量' // 成员数量
        }
      ],
      // 索引类型 操作符 做 特殊处理, 与 普通数字类型 操作符 一一对应
      indexCountOperatorMap: {
        INDEX_LEN_EQ: 'EQUAL_TO', // 索引字段数等于
        INDEX_LEN_NEQ: 'NOT_EQUAL_TO', // 索引字段数不等于
        INDEX_LEN_MAX: 'LESS_THAN_OR_EQL', // 索引字段数小于等于
        INDEX_LEN_MIN: 'GREATER_THAN_OR_EQL', // 索引字段数大于等于
        INDEX_LEN_THAN: 'GREATER_THAN', // 索引字段数大于
        INDEX_LEN_LESS: 'LESS_THAN' // 索引字段数小于
      },
      indexCountOperatorMap2: {
        EQUAL_TO: 'INDEX_LEN_EQ',
        NOT_EQUAL_TO: 'INDEX_LEN_NEQ',
        LESS_THAN_OR_EQL: 'INDEX_LEN_MAX',
        GREATER_THAN_OR_EQL: 'INDEX_LEN_MIN',
        GREATER_THAN: 'INDEX_LEN_THAN',
        LESS_THAN: 'INDEX_LEN_LESS'
      },
      // keyRange: [{
      //   name: 'maxCount',
      //   label: this.$v.RuleChecking.most // 最多
      // }, {
      //   name: 'minCount',
      //   label: this.$v.RuleChecking.least // 最少
      // }, {
      //   name: 'LEN_EQ',
      //   label: this.$v.RuleChecking.lengthEquals // 长度等于
      // }],
      // 子对象类型
      subobject: [
        {
          name: 'FIELD_INDEXED',
          label: '索引' // 索引
        },
        {
          // name: 'FIELD_PRIMARY',
          name: 'PrimaryKey',
          label: this.$v.RuleChecking.primaryKey // 主键
        },
        {
          name: 'UniqueKey',
          label: '唯一键'
        },
        {
          name: 'NonUniqueKey',
          label: '非唯一键'
        },
        {
          name: 'VirtualKey',
          label: '虚拟键'
        },
        {
          name: 'ForeignKey',
          label: '外键'
        }
      ],
      matchTypeArr: [
        {
          name: 'ONE',
          label: '任意单个匹配'
        },
        {
          name: 'ALL',
          label: '所有索引匹配'
        }
      ],
      // 主键操作符 过滤类型
      attributeArrKey: [
        {
          name: String(LDMTypes.Name), // 名称
          label: '名称' // 名称
        },
        {
          name: String(LDMTypes.KeyGroupMemberRefs), // 成员数量
          label: '成员数量' // 数量
        }
      ],
      indexTypeList: [
        // PrimaryKey,UniqueKey,NonUniqueKey,VirtualKey
        {
          name: 'PrimaryKey',
          label: '主键'
        },
        {
          name: 'UniqueKey',
          label: '唯一键'
        },
        {
          name: 'NonUniqueKey',
          label: '非唯一键'
        },
        {
          name: 'VirtualKey',
          label: '虚拟键'
        }
      ]
    }
  },
  props: {
    // ruleAttrOptions: {},
    operatorSQL: {},
    operatorNormalString: {},
    operatorDatatype: {},
    operatorNumber: {},
    stateDisabled: {
      type: Boolean,
      default: false
    },
    oldRuleData: {}
  },
  components: {},
  computed: {
    // 判断是否填写完整
    isComplete () {
      let result = false
      if (!this.modelRules.ruleType) {
        result = true
      }
      if (this.ruleConditionArr.length === 0 && this.subObjectRuleArr.length === 0) {
        result = true
      }
      // 判断规则属性是否填写完整
      this.ruleConditionArr.forEach(condition => {
        if (!condition.attributeValue) {
          result = true
        }
        if (condition.attributeValue === String(LDMTypes.IsUDP)) {
          if (!condition.udpNameValue) {
            result = true
          }
        }
        if (!condition.operatorValue) {
          result = true
        }
        if (!_.trim(condition.compareValue) && condition.compareValue !== 0) {
          // 比较值 是 空的 操作符, 非空时, 不需要比较值
          const emptyTypeSet = new Set(['MUST_HAVE', 'DATA_IS_NULL'])
          if (!emptyTypeSet.has(condition.operatorValue)) {
            result = true
          }
        }
      })

      this.subObjectRuleArr.forEach(sub => {
        // if (!sub.subobjectValue) {
        //   result = true
        // }
        if (!this.modelRules.subobjectValue) {
          result = true
        }
        if (!sub.attributeArrKeyValue) {
          result = true
        }
        if (!sub.operatorValue) {
          result = true
        }
        if (!_.trim(sub.compareValue) && sub.compareValue !== 0) {
          result = true
        }
      })

      return result
    }
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.modelRules = _.cloneDeep(this.oldRuleData)
      this.$set(this.modelRules, 'subobjectValue', 'FIELD_INDEXED')
      this.$set(this.modelRules, 'matchType', 'ONE')
      if (this.modelRules.ruleType !== 'ifElse') {
        // 非ifElse, 废弃
      } else {
        // this.modelRules.logicalType = this.modelRules.ruleType
        this.$set(this.modelRules, 'logicalType', 'IfElse')
        this.modelRules.ruleInfos.forEach((element, index) => {
          // element.fieldTypeVal = String(element.fieldTypeVal)
          // element.ruleInfos.forEach((ele, index) => {
          let ele = element
          let condition = {
            attributeValue: ele.fieldType,
            operatorValue: ele.operatorType,
            compareValue: ele.compareValue,
            ruleAttrOptions: this.ruleAttrOptions,
            udpNameValue: ele.udpName || '',
            condition: index === 0 ? 'if' : (index === 1 ? 'then' : 'else'),
            id: index
          }
          // 对索引数量的操作符进行特殊处理, 替换成对应的操作符
          if (condition.attributeValue === String(LDMTypes.ColumnOrderArray)) {
            // 将索引数量的操作符替换成 普通数字的操作符
            condition.operatorValue = this.indexCountOperatorMap[condition.operatorValue]
          }
          condition.operatorList = this.getOptionList(condition)
          this.ruleConditionArr.push(condition)
          // })
        })
      }

      // 如果数据是空的, 默认增加一条
      if (this.modelRules.ruleInfos.length === 0) {
        if (this.modelRules.type === 'normal') {
          this.addRules()
        } else {
          this.addSubObjectRule() // 子对象规则
        }
      }
      // if (this.typeState === 'see') {
      //   this.stateDisabled = true
      // } else {
      //   this.stateDisabled = false
      // }
    },

    // 修改逻辑关系, 重置规则
    changeConditionValue (value) {
      this.ruleConditionArr = []
      this.subObjectRuleArr = []
    },

    // 根据 对象类型 与 规则属性 生成 操作符 列表
    getOptionList (condition) {
      // 6.5.3 以及之后, 这里的操作符不能编辑, 只负责回显, 全量都加到数组上就行
      let result = _.cloneDeep(this.operatorNormalString).concat(this.operatorSQL).concat(this.operatorDatatype).concat(this.operatorNumber)
      // 去重
      let resultSet = []
      let dupMap = {}
      result.forEach((item) => {
        if (!dupMap[item.name]) {
          resultSet.push(item)
        }
        dupMap[item.name] = true
      })
      return resultSet
    },
    getStringPlaceholder (operator) {
      let result = '请输入'
      const emOperator = ['DATA_NOT_INCLUDE', 'DATA_IS_INCLUDE', 'OPTIONAL_VALUE']
      if (emOperator.includes(operator)) {
        result = '多个值用逗号分隔'
      }
      return result
    },
    // 根据 操作符 返回 比较值 的数据类型
    getCompareValueType (condition) {
      let operator = condition.operatorValue
      let type = 'String'
      // 比较值 是 数字的 操作符
      const numberTypeSet = new Set(['LEN_GREATER_THAN', 'LEN_LESS_THAN', 'LEN_EQ', 'LEN_EQ', 'LEN_NO_EQ', 'maxCount', 'minCount', 'FIELD_INDEXED_FIELD_COUNT', 'DATA_SCALE', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQL', 'LESS_THAN_OR_EQL', 'EQUAL_TO', 'NOT_EQUAL_TO', 'LEN_GREATER_THAN_OR_EQL', 'LEN_LESS_THEN_OR_EQL'])
      if (numberTypeSet.has(operator)) {
        type = 'Number'
      }
      // 比较值 是 布尔值的 操作符
      const booleanTypeSet = new Set(['DATA_IS_NULL', 'IsNotNull'])
      if (booleanTypeSet.has(operator)) {
        type = 'Boolean'
      }
      // if (operator === 'INDEX_TYPE') {
      //   // 索引类型
      //   type = 'INDEX_TYPE'
      // }

      // 比较值 是 空的 操作符
      const emptyTypeSet = new Set(['MUST_HAVE', 'DATA_IS_NULL'])
      if (emptyTypeSet.has(operator)) {
        type = null
      }
      if ([String(LDMTypes.IsNotNull), String(LDMTypes.IsAutoIncrement)].includes(condition.attributeValue)) {
        // 非空
        type = 'Boolean'
      }
      return type
    },
    // 非 ifElse 时添加 属性规则
    addRules () {
      this.addRulesId++
      this.ruleConditionArr.push({
        id: this.addRulesId,
        attributeValue: '', // 选择的属性
        udpNameValue: '', // udp 时使用
        operatorList: [], // 备选的操作符, 当选择的属性改变时, 同步改变操作符列表
        operatorValue: '', //  操作符 选中值
        compareValue: '', // 比较值
        condition: ''// 'if' 'else' 'then' 判断是否 ifElse
      })
    },
    // ifElse 时添加 属性规则
    addRulesCondition () {
      let arr = [{
        id: 1,
        attributeValue: '', // 选择的属性
        udpNameValue: '', // udp 时使用
        operatorList: [], // 备选的操作符, 当选择的属性改变时, 同步改变操作符列表
        operatorValue: '', //  操作符 选中值
        compareValue: '', // 比较值
        condition: 'if'// 'if' 'else' 'then' 判断是否 ifElse
      }, {
        id: 2,
        attributeValue: '', // 选择的属性
        udpNameValue: '', // udp 时使用
        operatorList: [], // 备选的操作符, 当选择的属性改变时, 同步改变操作符列表
        operatorValue: '', //  操作符 选中值
        compareValue: '', // 比较值
        condition: 'then'// 'if' 'else' 'then' 判断是否 ifElse
      }, {
        id: 3,
        attributeValue: '', // 选择的属性
        udpNameValue: '', // udp 时使用
        operatorList: [], // 备选的操作符, 当选择的属性改变时, 同步改变操作符列表
        operatorValue: '', //  操作符 选中值
        compareValue: '', // 比较值
        condition: 'else'// 'if' 'else' 'then' 判断是否 ifElse
      }]
      this.ruleConditionArr.push(...arr)
    },
    deleteRules (data) {
      this.ruleConditionArr = this.ruleConditionArr.filter(item => item.id !== data.id)
    },
    deleteSubObject (data, idx) {
      this.subObjectRuleArr.splice(idx, 1)
    },
    // 修改对象 的属性, 需要清空 规则的 udp name, 操作符, 比较值
    ruleAttributeValueChange (condition) {
      condition.udpNameValue = ''
      condition.operatorValue = ''
      condition.compareValue = ''

      condition.operatorList = this.getOptionList(condition)

      if ([String(LDMTypes.IsNotNull), String(LDMTypes.IsAutoIncrement)].includes(condition.attributeValue)) {
        // 非空, 自增 时, 操作符是 等于
        condition.operatorValue = 'VALUE_EQUAL'
        condition.compareValue = 'True'
      }
    },
    // 修改操作符, 需要清空 比较值
    ruleOperatorChange (condition) {
      condition.compareValue = ''
    },
    // 添加子对象规则
    addSubObjectRule () {
      this.addSubObjectId++
      this.subObjectRuleArr.push({
        id: this.addSubObjectId,
        subobjectValue: 'FIELD_INDEXED',
        attributeArrKeyValue: '', // 作为 操作符的分类
        operatorValue: '',
        compareValue: '',
        operatorTypeArr: this.attributeArrKey, // 操作符分类, 根据选择的属性自动生成, 作为操作符的分类的备选项
        operatorList: [] // 操作符列表, 根据选择的属性和操作符分类自动生成, 作为操作符的备选项
      })
    },

    // 子对象 属性修改
    subObjectValueChange (condition) {
      this.modelRules.matchType = 'ONE'
    },
    // 子对象 操作符分类修改, 需要清空 操作符, 比较值, 获取操作符列表
    subObjectOperatorTypeChange (condition) {
      condition.attributeValue = condition.attributeArrKeyValue
      condition.operatorList = this.getOptionList(condition)
      condition.operatorValue = ''

      // condition.attributeArrKeyIndexValue = ''
      // condition.keyRangeValue = ''
    },
    // 子对象 操作符修改, 需要清空 比较值
    subObjectOperatorChange (condition) {
      condition.compareValue = ''
    },
    removeRulePackage () {
      this.$emit('removeRulePackage', this.modelRules.id)
    },

    // 获取规则结果
    getRuleResult () {
      // 生成 向后台传入 的规则
      const getRuleItem = (element) => {
        let obj = {
          ruleType: 'normal',
          // matchType: 'ALL',
          fieldTypeVal: isNaN(Number(element.attributeValue)) ? element.attributeValue : Number(element.attributeValue),
          operatorType: element.operatorValue,
          compareValue: element.compareValue + ''
        }
        if (element.attributeValue === String(LDMTypes.IsUDP)) {
          // UDP_ATTR
          obj.ruleType = 'udp'
          obj.udpName = element.udpNameValue
        }
        if (element.attributeValue === String(LDMTypes.KeyGroup)) {
          // 索引数量
          obj.ruleType = 'index'
        }

        if (obj.fieldTypeVal === LDMTypes.ColumnOrderArray) {
          // 对表的 字段数量的操作符进行特殊处理, 替换成对应的操作符
          obj.operatorType = this.indexCountOperatorMap2[obj.operatorType]
        }

        return obj
      }
      // 生成最终 规则数组
      let ruleInfoArr = []
      if (this.modelRules.conditionValue === 'IfElse') {
        let ruleInfosArr = []
        // IfElse 时规则
        this.ruleConditionArr(element => {
          ruleInfosArr.push(getRuleItem(element))
        })
        ruleInfoArr.push({
          ruleType: 'ifElse',
          ruleInfos: ruleInfosArr
        })
      } else {
        // 非 IfElse 时的规则
        this.ruleConditionArr.forEach(element => {
          ruleInfoArr.push(getRuleItem(element))
        })
        // 表时, 有子对象规则
        if (this.subObjectRuleArr.length > 0) {
          let obj = {
            ruleType: 'subChildRule',
            matchType: this.modelRules.matchType, // 判断是对 所有索引都符合, 还是 只要有一个索引符合
            fieldTypeVal: '80000093', // 写死, 索引
            childInfo: []
          }
          // 子对象类型不是索引时, 添加一个过滤, 过滤索引类型
          if (this.modelRules.subobjectValue !== 'FIELD_INDEXED') {
            obj.childInfo.push({
              ruleType: 'normal',
              fieldTypeVal: 80000097, // 索引类型
              operatorType: 'VALUE_EQUAL',
              compareValue: this.modelRules.subobjectValue
            })
          }
          this.subObjectRuleArr.forEach(element => {
            let childInfo = [
              {
                'ruleType': 'normal',
                // 类型, 名称或者成员数量, condition.attributeArrKeyValue
                'fieldTypeVal': isNaN(Number(element.attributeArrKeyValue)) ? element.attributeArrKeyValue : Number(element.attributeArrKeyValue),
                'operatorType': element.operatorValue,
                'compareValue': element.compareValue + ''
              }
            ]
            if (childInfo[0].fieldTypeVal === LDMTypes.KeyGroupMemberRefs) {
              // 对索引成员数量的操作符进行特殊处理, 替换成对应的操作符
              childInfo[0].operatorType = this.indexCountOperatorMap2[childInfo[0].operatorType]
            }
            // // 索引时, 移除 childInfo 中的 第一项
            // if (element.subobjectValue === 'FIELD_INDEXED') {
            //   childInfo.shift()
            // }
            obj.childInfo.push(...childInfo)
            // ruleInfoArr.push(obj)
          })
          ruleInfoArr.push(obj)
        }
      }

      this.modelRules.ruleInfos = ruleInfoArr
      let result = _.cloneDeep(this.modelRules)
      delete result.id
      delete result.fieldTypeVal // 传给后台的时候, 不需要传入 fieldTypeVal
      return result
    },
    getTestButtonDisabled () {
      return this.isComplete
    }
  },
  watch: {
    isComplete () {
      this.$emit('stateChange', this.getRuleResult())
    },
    modelRules: {
      deep: true,
      handler () {
        this.$emit('refreshSaveDisabled')
      }
    },
    ruleConditionArr: {
      deep: true,
      handler () {
        this.$emit('refreshSaveDisabled')
      }
    },
    subObjectRuleArr: {
      deep: true,
      handler () {
        this.$emit('refreshSaveDisabled')
      }
    }
  }
}
