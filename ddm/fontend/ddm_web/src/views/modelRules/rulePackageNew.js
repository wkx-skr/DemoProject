import LDMTypes from '@constant/LDMTypes'

export default {
  name: 'rulePackageNew',
  data () {
    return {
      LDMTypes,
      subObjectRuleArr: [],
      ruleConditionArr: [], // 属性规则 数组 列表
      saveDisabled: true,
      addRulesId: 0,
      addSubObjectId: 0,
      subObjectRuleMatch: 'ONE',
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
        },
        {
          name: 'FIELD_ATTR',
          label: '字段'
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
      attributeArrColumn: [
        {
          name: String(LDMTypes.Name), // 名称
          label: '名称' // 名称
        },
        {
          name: String(LDMTypes.LogicalName), // 中文名
          label: '中文名' // 中文名
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
      ],
      rules: {
        compareValue: [
          {
            required: true,
            validator: (rule, value, callback) => {
              // console.log(rule, value, 'rule, value')
              if (!value && value !== 0) {
                callback(new Error('请输入值'))
              } else if (!isNaN(value - 0) && value >= 0) {
                callback()
              } else {
                callback(new Error('请填入大于等于0的数字'))
              }
            },
            trigger: 'blur'
          }

        ],
        // udp 时, 不需要大于0
        compareValue2: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                callback(new Error('请输入值'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }

        ]
      }
    }
  },
  props: {
    ruleAttrOptions: {},
    operatorSQL: {},
    operatorNormalString: {},
    operatorDatatype: {},
    operatorNumber: {},
    stateDisabled: {
      type: Boolean,
      default: false
    },
    oldRuleData: {},
    // 最后一个规则组不能删除
    isLast: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  computed: {
    currentSubObjectType () {
      let obj = this.subobject.find(item => item.name === this.modelRules.subobjectValue) || {}
      // return this.modelRules.subobjectValue
      return obj.label || ''
    },
    // 判断是否填写完整
    isComplete () {
      let result = false
      if (!this.modelRules.logicalType) {
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

        // 长度, 数量之类的数字, 需要大于0, 只有 udp 比较大小时, 不需要大于0
        if (this.getCompareValueType(condition) === 'Number' && this.gtZero(condition)) {
          if (condition.compareValue < 0) {
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
          // 比较值 是 空的 操作符, 非空时, 不需要比较值
          const emptyTypeSet = new Set(['MUST_HAVE', 'DATA_IS_NULL'])
          if (!emptyTypeSet.has(sub.operatorValue)) {
            result = true
          }
        }
        // 长度, 数量之类的数字, 需要大于0
        if (this.getCompareValueType(sub) === 'Number' && sub.compareValue < 0) {
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
      if (this.modelRules.logicalType !== 'IfElse') {
        this.modelRules.ruleInfos.forEach(element => {
          this.addRulesId++
          // this.addSubObjectId++
          element.fieldTypeVal = String(element.fieldTypeVal)

          if (element.ruleType !== 'subChildRule') {
            let condition = {
              attributeValue: element.fieldTypeVal,
              operatorValue: element.operatorType,
              compareValue: element.compareValue,
              ruleAttrOptions: this.ruleAttrOptions,
              udpNameValue: element.udpName || ''
            }

            if (condition.attributeValue === String(LDMTypes.ColumnOrderArray)) {
              // 对表的 字段数量的操作符进行特殊处理, 替换成对应的操作符
              condition.operatorValue = this.indexCountOperatorMap[condition.operatorValue]
            }

            condition.operatorList = this.getOptionList(condition)
            this.ruleConditionArr.push(condition)
          } else {
            // 子对象,  element.ruleType === 'subChildRule'
            let childInfo = element.childInfo
            this.modelRules.matchType = element.matchType
            this.subObjectRuleMatch = this.modelRules.matchType
            let conditionDetail = null
            let operatorTypeArr = null
            if (String(element.fieldTypeVal) === String(LDMTypes.Attribute)) {
              // 子对象为 字段
              this.modelRules.subobjectValue = 'FIELD_ATTR'
              operatorTypeArr = this.attributeArrColumn
            } else if (String(childInfo[0]?.fieldTypeVal) === '80000097') {
              // 如果第一条规则, 是判断索引类型, 则有索引类型, 否则, 子对象类型为索引
              // 索引类型
              this.modelRules.subobjectValue = childInfo[0].compareValue
              operatorTypeArr = this.attributeArrKey
              // 移除第一条条件
              childInfo.shift()
            } else {
              // 索引
              // this.$set(this.modelRules, 'subobjectValue', 'FIELD_INDEXED')
              this.modelRules.subobjectValue = 'FIELD_INDEXED'
              operatorTypeArr = this.attributeArrKeyIndex
            }
            // 遍历条件
            childInfo.forEach(sub => {
              this.addSubObjectId++
              sub.fieldTypeVal = String(sub.fieldTypeVal)
              let condition = {
                // subobjectValue: this.modelRules.subobjectValue,
                attributeArrKeyValue: String(sub.fieldTypeVal),
                operatorValue: sub.operatorType,
                compareValue: sub.compareValue,
                ruleAttrOptions: this.ruleAttrOptions,
                operatorTypeArr: operatorTypeArr
              }
              condition.operatorList = this.getOptionList(condition)
              // 对索引成员数量的操作符进行特殊处理, 替换成对应的操作符
              if (condition.attributeArrKeyValue === String(LDMTypes.KeyGroupMemberRefs)) {
                // 将索引数量的操作符替换成 普通数字的操作符
                condition.operatorValue = this.indexCountOperatorMap[condition.operatorValue]
              }
              condition.attributeValue = condition.attributeArrKeyValue
              condition.operatorList = this.getOptionList(condition)
              this.subObjectRuleArr.push(condition)
            })
          }
        })
        this.ruleConditionArr.forEach((v, i) => {
          v.id = i
        })
      } else {
        this.modelRules.ruleInfos.forEach((element, index) => {
          element.fieldTypeVal = String(element.fieldTypeVal)
          // element.ruleInfos.forEach((ele, index) => {
          let ele = element
          let condition = {
            attributeValue: ele.fieldTypeVal,
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
    },

    // 修改逻辑关系, 重置规则
    changeConditionValue (value) {
      // this.ruleConditionArr = []
      // this.subObjectRuleArr = []
    },

    // 根据 对象类型 与 规则属性 生成 操作符 列表
    getOptionList (condition) {
      // 默认使用 字符串操作符, 特殊情况进入 if else 判断
      let result = this.operatorNormalString
      let attributeValue = condition.attributeValue
      // KeyGroup 索引数量, 成员数量, 字段数量 数字类型
      if ([String(LDMTypes.KeyGroup), String(LDMTypes.KeyGroupMemberRefs), String(LDMTypes.ColumnOrderArray)].includes(attributeValue)) {
        result = this.operatorNumber
      } else if (attributeValue === String(LDMTypes.DataType)) {
        // attributeValue "FIELD_DATATYPE" 数据类型
        // 字段 数据类型 属性的操作符 特殊处理, 其他为 普通字符串 操作符
        result = this.operatorDatatype.concat(this.operatorNormalString)
        _.remove(result, function (item) {
          return ['OPTIONAL_VALUE'].includes(item.name)
        })
      } else if (attributeValue === String(LDMTypes.SQL)) {
        // 当选中的属性是 view sql 时, 操作符是 SQL
        result = this.operatorSQL
      } else if ([String(LDMTypes.IsNotNull), String(LDMTypes.IsAutoIncrement)].includes(attributeValue)) {
        // 非空, 自增时, 操作符是 等于
        result = [{
          label: '等于',
          value: 'VALUE_EQUAL'
        }]
      } else if (attributeValue === String(LDMTypes.IsUDP)) {
        // udp 时, 操作符是 数字 和文本
        result = this.operatorNumber.concat(this.operatorNormalString)
      } else if (attributeValue === 'SUBOBJECT') {
        // 当选中的属性是 schema 时, 操作符是 数量 和文本
      }
      return result
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
      // 如果删除的是最后一个, 则删除规则组
      if (this.ruleConditionArr.length === 0) {
        this.removeRulePackage()
      }
    },
    deleteSubObject (data, idx) {
      this.subObjectRuleArr.splice(idx, 1)
      // 如果删除的是最后一个, 则删除规则组
      if (this.subObjectRuleArr.length === 0) {
        this.removeRulePackage()
      }
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
        subobjectValue: this.modelRules.subobjectValue,
        attributeArrKeyValue: '', // 作为 操作符的分类
        operatorValue: '',
        compareValue: '',
        // 操作符分类, 根据选择的属性自动生成,
        // 作为操作符的分类的备选项, 页面上的 需要匹配的字段
        operatorTypeArr: this.modelRules.subobjectValue === 'FIELD_ATTR' ? this.attributeArrColumn : this.attributeArrKey,
        operatorList: [] // 操作符列表, 根据选择的属性和操作符分类自动生成, 作为操作符的备选项
      })
    },

    // 子对象 操作符分类修改, 需要清空 操作符, 比较值, 获取操作符列表
    subObjectOperatorTypeChange (condition) {
      condition.attributeValue = condition.attributeArrKeyValue
      condition.operatorList = this.getOptionList(condition)
      condition.operatorValue = ''
      condition.compareValue = ''

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
            // 判断是对 一个子对象 还是 全部子对象 生效
            matchType: this.modelRules.matchType,
            // 子对象类型, 字段 还是 索引
            fieldTypeVal: this.modelRules.subobjectValue === 'FIELD_ATTR' ? '80000005' : '80000093',
            childInfo: []
          }
          // 子对象类型 是 索引/字段 外的其他值时, 添加一个过滤, 过滤索引类型
          if (this.modelRules.subobjectValue !== 'FIELD_INDEXED' && this.modelRules.subobjectValue !== 'FIELD_ATTR') {
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

          // // 特殊处理: 字段时, 且仅有 值不等于 时, 条件对所有字段生效
          // if (obj.fieldTypeVal === String(LDMTypes.Attribute) && obj.childInfo?.length === 1) {
          //   let sub = obj.childInfo[0]
          //   if (sub.operatorType === 'VALUE_NO_EQUAL') {
          //     obj.matchType = 'ALL'
          //   }
          // }
          obj.matchType = this.subObjectRuleMatch
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
    },
    changeSubObjectType (type) {
      if (type !== 'FIELD_ATTR ') {
        this.subObjectRuleMatch = 'ONE'
      }
      this.subObjectRuleArr = []
      this.modelRules.subobjectValue = type
      this.addSubObjectRule()
    },
    toggleLogicalType () {
      // 非编辑状态, 不能切换逻辑关系
      if (this.stateDisabled) {
        return
      }
      // 子对象不能切换逻辑关系
      if (this.modelRules.type !== 'normal') {
        return
      }
      if (this.modelRules.logicalType === 'And') {
        this.modelRules.logicalType = 'Or'
      } else {
        this.modelRules.logicalType = 'And'
      }
    },
    // 判断数字类型是否需要大于0
    gtZero (condition) {
      // 如果是 udp 且 操作符是 数字的操作符, 则不需要 大于0
      if (condition.attributeValue === String(LDMTypes.IsUDP) && this.operatorNumber.find(item => item.name === condition.operatorValue)) {
        return false
      } else {
        return true
      }
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
