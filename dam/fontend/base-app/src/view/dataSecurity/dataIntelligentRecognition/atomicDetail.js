export default {
  props: {
    ruleId: {
      type: [String, Number],
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    treeData: {
      type: Array,
      default: [],
    },
    ruleInfoCatalog: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isRequire: false,
      loading: false,
      nodeData: [],
      form: {
        ruleName: '',
        disc: '',
        ruleContent: {
          parameters: [],
        },
        categoryId: '', // 原子规则目录id
      },
      functionName: '',
      rules: {
        ruleName: [
          { required: true, message: '请输入规则名称', trigger: 'change' },
        ],
        categoryId: [
          {
            required: true,
            message: '请选择目录',
            trigger: 'change',
          },
        ],
        'ruleContent.methodName': [
          { required: true, message: '请选择识别函数', trigger: 'change' },
        ],
      },
      discrenRules: [],
      currentTips: '',
      testContent: '',
      showResult: false,
      testResult: '',
      isError: false,
    }
  },
  computed: {
    disableTest() {
      if (
        this.form.ruleContent.methodName === '' ||
        !this.form.ruleContent.methodName
      ) {
        return true
      }
      if (this.testContent === '') {
        return true
      }
    },
    inputs() {
      return this.form.ruleContent.parameters.filter(v => {
        return this.isShowInput(v.type)
      })
    },
    numbers() {
      return this.form.ruleContent.parameters.filter(v => {
        return !this.isShowInput(v.type)
      })
    },
  },
  mounted() {
    this.getNode()
    this.getIRrules()
    if (this.isEdit) {
      this.getDetail()
    } else {
      // 点击tree目录的新建,将目录带过去
      if (this.ruleInfoCatalog) {
        this.treeData.map(item => {
          if (this.ruleInfoCatalog === item.name) {
            this.form.categoryId = item.id
          }
        })
      }
    }
  },
  methods: {
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
    getDetail() {
      this.$http
        .get(this.$url + '/service/discern/atom/' + this.ruleId)
        .then(data => {
          this.form = {
            ruleName: data.data.ruleName,
            disc: data.data.ruleDescription,
            ruleContent: data.data.ruleContent,
            categoryId: data.data.categoryId || '',
          }
          this.functionName = data.data.functionName
          this.renderMaskingItem(this.form.ruleContent.methodName)
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    closeEdit() {
      this.$emit('close')
    },
    getNode() {
      this.nodeData = [
        {
          name: '原子识别规则',
          level: 1,
        },
        {
          name: this.isEdit ? '编辑' : '新建',
          level: 2,
        },
      ]
    },
    getIRrules() {
      this.$http(this.$url + '/service/discern/rule/profiles')
        .then(res => {
          if (res.data && res.data.length > 0) {
            res.data.map(item => {
              if (item.parameters.length > 0) {
                item.parameters.map(v => {
                  v.status = true
                })
              }
            })
          }
          this.discrenRules = res.data || []
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    renderMaskingItem(methodName) {
      let parameters = []
      this.showResult = ''
      this.testContent = ''
      if (methodName === '') {
        this.currentTips = ''
      }
      this.discrenRules.forEach(v => {
        if (v.methodName === methodName) {
          this.functionName = v.name
          this.currentTips = v.details
          parameters = _.cloneDeep(v.parameters)
          // 填充设定的值
          parameters.forEach(v => {
            // 预设值存在时，填充
            if (this.form.ruleContent[v.parameter] !== undefined) {
              this.$set(v, 'value', this.form.ruleContent[v.parameter])
              // v.value = this.form.ruleContent[v.parameter]
            } else {
              this.$set(v, 'value', '')
              v.value = ''
            }
          })
        }
      })
      this.$set(this.form.ruleContent, 'parameters', parameters)
    },
    formateRule(ruleContent) {
      const obj = { className: 'DiscernRuleString' }
      obj.methodName = ruleContent.methodName
      ruleContent.parameters.forEach(v => {
        obj[v.parameter] = v.value
      })
      return obj
    },
    testRule() {
      this.loading = true
      this.showResult = false
      const form = this.form
      const rule = _.cloneDeep(form.ruleContent)
      const obj = {
        rule: this.formateRule(rule),
      }
      obj.rule.contents = this.testContent
      this.$http
        .put(this.$url + '/service/discern/rule/verify', obj.rule)
        .then(res => {
          this.showResult = true
          this.loading = false
          this.isError = !(res.data.length > 0)
          let str =
            res.data.length > 0
              ? `识别到“${res.data.join(',')}”符合规则`
              : '未识别到符合规则的内容'
          this.testResult = str
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    beforeSave() {
      if (this.form.ruleContent.methodName) {
        this.$refs.form.validate() // 先验证必填项
        let reslut
        if (this.form.ruleContent.parameters.length > 0) {
          this.form.ruleContent.parameters.map(item => {
            if (!item.value && item.value !== 0) {
              item.status = false
            } else {
              item.status = true
            }
          })

          reslut = this.form.ruleContent.parameters.every(item => {
            return item.status
          })
          if (!reslut) {
            return false
          }
        }
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saveRules()
        } else {
          return false
        }
      })
    },
    saveRules() {
      this.loading = true
      const rule = _.cloneDeep(this.form.ruleContent)
      let ruleInfoCatalog = ''
      this.treeData.map(item => {
        if (item.id === this.form.categoryId) {
          ruleInfoCatalog = item.name
        }
      })
      let params = {
        functionName: this.functionName,
        ruleContent: this.formateRule(rule),
        ruleDescription: this.form.disc,
        ruleName: this.form.ruleName,
        categoryId: this.form.categoryId,
        ruleInfoCatalog, // 目录名字
      }
      if (this.isEdit) {
        params.ruleId = this.ruleId
        this.$http
          .put(this.$url + '/service/discern/atom/modify', params)
          .then(data => {
            this.$message.success('规则修改成功')
            this.closeEdit()
          })
          .catch(err => {
            this.loading = false
            this.$showFailure(err)
          })
      } else {
        this.$http
          .put(this.$url + '/service/discern/atom/create', params)
          .then(data => {
            this.$message.success('规则创建成功')
            this.closeEdit()
          })
          .catch(err => {
            this.loading = false
            this.$showFailure(err)
          })
      }
    },
  },
}
