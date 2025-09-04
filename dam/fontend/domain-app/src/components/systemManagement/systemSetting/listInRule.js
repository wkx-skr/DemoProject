import ourDetail from './detail.vue'
import _ from 'lodash'
export default {
  props: {
    itemId: {
      default: -1,
    },
    fromRule: {
      type: Boolean,
      default: false,
    },
    fromJob: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ourDetail,
  },
  mounted() {},
  data() {
    return {
      levelLabel: {
        GLOBAL_LEVEL: '全局',
        RULE_LEVEL: '规则级别',
        TASK_LEVEL: '任务级别',
      },
      tableData: [],
      sql: {
        formattedContent: '',
      },
      editDialogVisible: false,
      preData: null,
      resultCache: null,
      getParameterTimeout: null,
      rules: null,
      ParameterNamesDirectly: [],
      parameterInit: false,
      dialogVisible: false,
    }
  },
  methods: {
    selectable(row) {
      return !row.builtIn
    },
    handleClose() {
      this.dialogVisible = false
    },
    setRules(rules) {
      this.rules = rules
    },
    setSqls(sql) {
      this.sql = sql
      const result = this.setParameterNames()
      this.resultCache = result
      this.getParameter(result)
    },
    setSql(sql, type) {
      this.sql[type] = sql
      const result = this.setParameterNames()
      this.resultCache = result
      if (this.getParameterTimeout) {
        clearTimeout(this.getParameterTimeout)
        this.getParameterTimeout = null
      }
      this.getParameterTimeout = setTimeout(() => {
        this.getParameter(result)
        this.getParameterTimeout = null
      }, 500)
    },
    setParameterNamesDirectly(names) {
      this.ParameterNamesDirectly = names
      const result = this.setParameterNames()
      this.getParameter(result)
    },
    getFunctions(id, resolve, functionParameters, index) {
      this.$http.get(this.$url + `/service/funcs/${id}`).then(res => {
        if (res.data.funcId === id) {
          Object.values(res.data.funcBody.parameters).forEach(item => {
            if (item.expression) {
              if (!functionParameters[index]) {
                functionParameters[index] = []
              }
              functionParameters[index].push(item.expression)
            }
          })
          resolve(res.data)
        }
      })
    },
    getParameter(names) {
      let level = ''
      if (this.fromRule) {
        level = 'RULE_LEVEL'
      }
      if (this.fromJob) {
        level = 'TASK_LEVEL'
      }
      const itemId = this.itemId

      const promises = []
      const functionParameters = []
      if (!this.parameterInit) {
        this.rules.forEach((rule, index) => {
          try {
            const functionId = JSON.parse(rule.content).funcId
            if (functionId) {
              promises.push(
                new Promise(resolve => {
                  this.getFunctions(
                    functionId,
                    resolve,
                    functionParameters,
                    index
                  )
                })
              )
            }
          } catch (e) {}
        })
        if (this.rules && this.rules.length > 0) {
          this.parameterInit = true
        }
      }
      const afterFunctionParameterReady = () => {
        if (
          (names && names.length > 0) ||
          this.ParameterNamesDirectly.length > 0 ||
          _.flattenDeep(functionParameters).length > 0
        ) {
          let rules = []
          if (this.rules) {
            rules = _.cloneDeep(this.rules)
          }
          if (this.fromRule) {
            rules[0].parameterNames = _.union(
              this.ParameterNamesDirectly,
              names
            )
          }
          rules.forEach((item, index, array) => {
            array[index].parameterNames = _.union(
              array[index].parameterNames,
              functionParameters[index]
            )
          })
          this.$http
            .post(this.$url + `/service/parameters/${level}/${itemId}`, rules)
            .then(res => {
              res.data.sort((a, b) => {
                return a.name.localeCompare(b.name)
              })
              this.tableData = res.data
              this.$emit(
                'update-parameterIds',
                this.tableData.filter(i => i.itemId === -1).map(i => i.paramId)
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          // this.tableData = []
          this.$emit('update-parameterIds', null)
        }
      }
      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          afterFunctionParameterReady()
        })
      } else {
        afterFunctionParameterReady()
      }
    },
    setParameterNames() {
      let str = ''
      Object.keys(this.sql).forEach(item => {
        str += this.sql[item]
      })
      const result = []
      const isP = str => {
        return str.includes('[[') && str.includes(']]')
      }
      if (isP(str)) {
        const arr = str.split(']]')
        arr.pop()
        arr.forEach((item, index) => {
          arr[index] += ']]'
        })
        arr.forEach(item => {
          if (isP(item)) {
            const idx = item.indexOf('[[')
            const val = item.slice(idx + 2, -2)
            if (!result.includes(val)) {
              result.push(val)
            }
          }
        })
      }
      return result
    },
    scopeFormatter(row, column) {
      const value = row[column.property]
      if (value === 'PUBLIC') {
        return '公共'
      } else {
        return '私有'
      }
    },
    levelFormatter(row, column) {
      const value = row[column.property]
      return this.levelLabel[value]
    },
    handleEdit(parameter, type) {
      this.preData = _.cloneDeep(parameter)
      if (type === 'see') {
        this.dialogVisible = true
      } else {
        this.editDialogVisible = true
      }
    },
    closeEditDialog() {
      this.editDialogVisible = false
    },
    updateData() {
      this.getParameter(this.resultCache)
    },
  },
}
