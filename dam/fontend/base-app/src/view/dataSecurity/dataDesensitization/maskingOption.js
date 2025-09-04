import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      text: '',
      currentRules: [],
      opt: [
        {
          label: '个人隐私',
          value: '1',
        },
        {
          label: '个人隐私1',
          value: '2',
        },
        {
          label: '个人隐私2',
          value: '3',
        },
      ],
      val: '1',
      form: {
        columnObjectId: '',
        columnRuleDtos: [],
        staticColumnRuleDto: [],
      },
      loading: false,
      rules: {
        name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
      },
      nodeData: [],
    }
  },
  props: {
    currentCol: {
      type: Object,
      default() {
        return {}
      },
    },
    isTable: {
      type: Boolean,
      default: false,
    },
    isAnquan: {
      // 数据安全-数据分类进入
      type: Boolean,
      default: false,
    },
  },

  created() {},
  mounted() {
    this.getDataMaskingRules()
    this.form.columnObjectId =
      this.currentCol.objectId || this.currentCol.columnObjectId
    this.getNode()
  },
  methods: {
    getNode() {
      if (this.isTable) {
        this.nodeData = [
          {
            name: '数据分类',
            level: 1,
          },
          {
            name: this.currentCol.path.physicalName,
            level: 2,
          },
          {
            name: this.currentCol.physicalName + '的数据安全分级和分类',
            level: 3,
            couldClick: false,
          },
        ]
      } else {
        this.nodeData = [
          {
            name: '数据脱敏配置',
            level: 1,
            couldClick: false,
          },
          {
            name: '数据安全分级和处理',
            level: 2,
            couldClick: false,
          },
        ]
      }
    },
    nodeClick(node) {
      if (node.level == 2) {
        this.$emit('close')
      }
      if (node.level == 1) {
        this.$emit('closeDetail')
      }
    },
    getDataMaskingRules() {
      HTTP.getDataMaskingRules()
        .then(res => {
          const data = res.data
          const newArr = []
          data.forEach(v => {
            const id = parseInt(v.id.split('-')[0])
            // 只要自定义规则
            if (id !== 0) {
              v.id = id
              newArr.push(v)
            }
          })
          this.currentRules = newArr
          this.getMaskingOption()
        })
        .catch(err => {
          console.error(err)
        })
    },
    getMaskingOption() {
      const id = this.currentCol.objectId || this.currentCol.columnObjectId
      HTTP.getMaskingOption(id)
        .then(res => {
          const columnRuleDtos = res.data.columnRuleDtos
          // 按等级顺序排序
          columnRuleDtos.sort(
            (a, b) =>
              this.getNum(a.tagBuildInCode) - this.getNum(b.tagBuildInCode)
          )
          // debugger
          columnRuleDtos.forEach(v => {
            if (!v.ruleMap) {
              v.ruleMap = {}
            }
            if (v.ruleId) {
              v.ruleId = v.ruleId === '0' ? '' : parseInt(v.ruleId)
              v.currentRuleId = v.ruleId
            }
            this.renderMaskingItem(v.ruleId, v)
          })
          this.form.columnRuleDtos = _.cloneDeep(columnRuleDtos)
          let staticColumnRuleDto = []
          if (res.data.staticColumnRuleDto instanceof Array) {
            staticColumnRuleDto = res.data.staticColumnRuleDto
          } else {
            staticColumnRuleDto = staticColumnRuleDto.concat(
              res.data.staticColumnRuleDto
            )
          }
          staticColumnRuleDto.sort(
            (a, b) =>
              this.getNum(a.tagBuildInCode) - this.getNum(b.tagBuildInCode)
          )
          staticColumnRuleDto.forEach(v => {
            if (!v.ruleMap) {
              v.ruleMap = {}
            }
            if (v.ruleId) {
              v.ruleId = v.ruleId === '0' ? '' : parseInt(v.ruleId)
              v.currentRuleId = v.ruleId
            }
            this.renderMaskingItem(v.ruleId, v)
          })
          this.form.staticColumnRuleDto = _.cloneDeep(staticColumnRuleDto)
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    updateMaskingOption() {
      this.dataMaking(this.form)
      delete this.form.columnObjectId
      let staticColumnRuleDto = this.form.staticColumnRuleDto[0]
        ? this.form.staticColumnRuleDto[0]
        : {}
      const id = this.currentCol.objectId || this.currentCol.columnObjectId
      const params = {
        columnRuleDtos: this.form.columnRuleDtos,
        staticColumnRuleDto: staticColumnRuleDto,
        columnObjectId: id,
      }
      HTTP.updateMaskingOption(params, id).then(res => {
        this.$message.success('修改成功')
        this.close()
      })
    },
    // 处理form中的数据
    dataMaking(obj) {
      for (let i in obj) {
        if (obj[i] instanceof Array) {
          obj[i].forEach(v => {
            v.ruleId = v.currentRuleId ? v.currentRuleId : null
            delete v.currentRuleId
            v.ruleMap = this.formateRule(v)
          })
        }
      }
    },
    beforeSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.updateMaskingOption()
        } else {
          return false
        }
      })
    },
    close() {
      this.$emit('close')
    },
    checkDefaultRule(obj) {
      if (obj.ruleObject) {
        // 默认策略是0- 开头的
        return obj.ruleObject.id.split('-')[0] === '0'
      }
    },
    renderMaskingItem(id, item, index) {
      let parameters = []
      if (id === '') {
        this.$set(item, 'details', '')
      }
      this.currentRules.forEach(v => {
        if (v.id === id) {
          parameters = _.cloneDeep(v.parameters)
          // // 填充设定的值
          parameters.forEach(v2 => {
            // 已经有设定值则替换
            if (
              item.ruleMap[v2.parameter] !== undefined &&
              id === item.ruleId
            ) {
              v2.value = item.ruleMap[v2.parameter]
            }
          })

          this.$set(item, 'parameters', parameters)
          this.$set(item, 'details', v.details)
          item.className = v.className
        }
      })
    },
    formateRule(ruleContent) {
      const obj = {}
      obj.methodName = ruleContent.methodName
      obj.className = ruleContent.className
      if (ruleContent.parameters) {
        ruleContent.parameters.forEach(v => {
          obj[v.parameter] = v.value
        })
      }
      return obj
    },
    getNum(str) {
      // 获取字符串中第一个出现的数值
      if (str) {
        const arr = str.match(/\d+(.\d+)?/g)
        return parseInt(arr[0])
      } else {
        return 0
      }
    },
    isShowInput(string) {
      const type = string.toLowerCase()
      if (
        type.indexOf('string') > -1 ||
        type === 'date' ||
        type === 'calendar'
      ) {
        return true
      }
      return false
    },
    inputs(ruleContent) {
      if (!ruleContent.parameters) {
        return []
      }
      return ruleContent.parameters.filter(v => {
        return this.isShowInput(v.type)
      })
    },
    numbers(ruleContent) {
      if (!ruleContent.parameters) {
        return []
      }
      return ruleContent.parameters.filter(v => {
        return !this.isShowInput(v.type)
      })
    },
  },
  computed: {},
  watch: {},
}
