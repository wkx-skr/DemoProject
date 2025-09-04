export default {
  props: {
    registered: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.$bus.$on('edit-function', func => {
      if (func) {
        this.editMode = true
        this.functionModel = func.funcBody.funcTypeId
        this.currentFunction = func
      } else {
        this.editMode = false
        this.currentFunction = {
          enabled: true,
          funcBody: {},
          funcName: '',
          funcId: null,
          funcReturnType: null,
        }
      }
      this.dialogVisible = true
      this.decodeParams()
      this.getParameters()
    })
  },
  beforeDestroy() {
    this.$bus.$off('edit-function')
  },
  data() {
    const VALUE_TYPE = {
      value: '常量',
      expression: '参数',
    }
    return {
      dialogVisible: false,
      VALUE_TYPE: VALUE_TYPE,
      currentFunction: null,
      expression: '',
      editMode: false,
      functionModel: null,
      params: [],
      allParameters: [],
    }
  },
  methods: {
    getParameters() {
      this.$http
        .get(this.$quality_url + '/parameters/')
        .then(res => {
          this.allParameters = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    parameterOptions(row) {
      const typeEqual = (leftVal, rightVal) => {
        return leftVal === rightVal
        // if (leftVal === 'STRING' && ['STRING'].includes(rightVal)) {
        //   return true
        // } else if (leftVal === 'LONG' && [''].includes(rightVal)) {
        //   return true
        // } else if (leftVal === 'DOUBLE' && [''].includes(rightVal)) {
        //   return true
        // } else {
        //   return false
        // }
      }
      const globalParameters = this.allParameters.filter(item => {
        return item.level === 'GLOBAL_LEVEL'
      })
      const filtered = globalParameters.filter(item => {
        return typeEqual(item.valueType, row.type)
      })
      return filtered
    },
    handleFunctionModelChange(val) {
      const model = this.registered[val]
      this.currentFunction.funcReturnType = model.returnType
      this.decodeParams()
    },
    decodeParams() {
      const model = this.registered[this.functionModel]
      if (model) {
        const params = []
        Object.values(model.params).forEach(item => {
          const param = {
            bindName: item.bindName,
            description: item.description,
            name: item.name,
            required: item.required,
            type: item.type,
            valueType: 'value',
            value: '',
          }
          if (this.editMode) {
            const parameter =
              this.currentFunction.funcBody.parameters[item.bindName]
            if (parameter != null) {
              if (parameter.expression) {
                param.valueType = 'expression'
                param.value = parameter.expression
              } else if (parameter.value) {
                param.valueType = 'value'
                param.value = parameter.value
              }
            }
          }
          params.push(param)
        })
        this.params = params
      } else {
        this.params = []
      }
    },
    encodeParams() {
      const parameters = {}
      this.params.forEach(item => {
        const o = {
          name: item.bindName,
        }
        if (item.valueType === 'expression') {
          o.expression = item.value
        } else if (item.valueType === 'value') {
          o.value = item.value
        }
        parameters[item.bindName] = o
      })
      return parameters
    },
    save() {
      // const requestBodyDemo = {
      //   'funcTypeId': '62612d2e-a7fb-a394-91ca-eeaab11fdb9a',
      //   'funcInstanceName': '比较数值大于20',
      //   'parameters': {
      //     'min': {
      //       'name': 'min',
      //       'value': 20
      //     }
      //   }
      // }
      const parameters = this.encodeParams()
      const requestBody = {
        funcTypeId: this.functionModel,
        funcInstanceName: this.currentFunction.funcName,
        parameters: parameters,
      }
      if (this.editMode) {
        const funcId = this.currentFunction.funcId
        this.$http
          .post(this.$quality_url + `/funcs/${funcId}/update`, requestBody)
          .then(res => {
            this.$emit('update')
            this.closeDialog()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(this.$quality_url + '/funcs/new', requestBody)
          .then(res => {
            this.$emit('update')
            this.closeDialog()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    closeDialog() {
      this.dialogVisible = false
    },
  },
}
