import _ from 'lodash'
export default {
  props: {
    preData: {},
    fromRule: {
      type: Boolean,
      default: false,
    },
    fromJob: {
      type: Boolean,
      default: false,
    },
    itemId: {},
    seeDetail: {
      type: Boolean,
      default: false,
    },
  },
  beforeMount() {},
  data() {
    const validateName = (rule, value, callback) => {
      const pPattern = /[\s,\w,\u4e00-\u9fa5]+/
      if (pPattern.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
    }
    return {
      rules: {
        name: [
          {
            message: this.$t('quality.page.settingList.rules.name'),
            trigger: 'blur',
            required: true,
          },
          {
            message: this.$t('quality.page.settingList.rules.name1'),
            trigger: 'blur',
            validator: validateName,
          },
        ],
        expression: [
          {
            message: this.$t('quality.page.settingList.rules.expression'),
            trigger: 'blur',
            required: true,
          },
        ],
        description: [
          {
            message: this.$t('quality.page.settingList.rules.description'),
            trigger: 'blur',
            required: true,
          },
        ],
      },
      content: {
        name: '', //
        description: '',
        scope: 'PUBLIC',
        valueType: 'STRING',
        valueGenerator: 'PLAIN',
        builtIn: false,
        level: 'GLOBAL_LEVEL',
      },
      value: {
        expression: '',
        owner: this.$user.username,
        paramId: '',
        datasource: null,
      },
      restaurants: [],
      scopeArr: {
        INDIVIDUAL: '私有',
        PUBLIC: '公共',
      },
    }
  },
  mounted() {
    if (this.preData) {
      this.content = _.clone(this.preData)
      this.getValue()
      this.value.paramId = this.preData.paramId
    }
    this.getModels()
  },
  methods: {
    handleClose() {
      this.$emit('handleClose')
    },
    getModels() {
      this.$http
        .get(this.$meta_url + '/service/models/fromre/')
        .then(res => {
          this.restaurants = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getValue() {
      this.$http
        .get(
          this.$quality_url + '/parameters/' + this.preData.paramId + '/value'
        )
        .then(res => {
          this.value = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    confirm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          this.$refs.valueForm.validate(valid => {
            if (!valid) {
              return false
            } else {
              const updateParameter = () => {
                const request = this.content
                this.$http
                  .put(
                    this.$quality_url + '/parameters/' + this.preData.paramId,
                    request
                  )
                  .then(res => {
                    delete this.value.valueId
                    this.$http
                      .post(
                        this.$quality_url +
                          '/parameters/' +
                          this.preData.paramId +
                          '/value',
                        this.value
                      )
                      .then(res => {
                        this.$message.success(
                          this.content.name +
                            this.$t(
                              'quality.page.settingList.successfullyModified'
                            )
                        )
                        this.updateData()
                        this.remove()
                      })
                      .catch(e => {
                        this.$showFailure(e)
                      })
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              }
              const addParameter = () => {
                const request = this.content
                request.builtIn = false
                this.$http
                  .post(this.$quality_url + '/parameters/', request)
                  .then(res => {
                    this.value.paramId = res.data.paramId
                    this.$http
                      .post(
                        this.$quality_url +
                          '/parameters/' +
                          res.data.paramId +
                          '/value',
                        this.value
                      )
                      .then(res => {
                        this.$message.success(
                          this.content.name +
                            this.$t(
                              'quality.page.settingList.successfullyAdded'
                            )
                        )
                        this.updateData()
                        this.remove()
                      })
                      .catch(e => {
                        this.$showFailure(e)
                        this.remove()
                      })
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              }
              if (this.fromRule) {
                if (this.preData.level === 'GLOBAL_LEVEL') {
                  this.content.itemId = this.itemId
                  this.content.level = 'RULE_LEVEL'
                  delete this.content.paramId
                  addParameter()
                } else if (this.preData.level === 'RULE_LEVEL') {
                  updateParameter()
                }
              } else if (this.fromJob) {
                if (
                  this.preData.level === 'GLOBAL_LEVEL' ||
                  this.preData.level === 'RULE_LEVEL'
                ) {
                  this.content.itemId = this.itemId
                  this.content.level = 'TASK_LEVEL'
                  delete this.content.paramId
                  addParameter()
                } else if (this.preData.level === 'TASK_LEVEL') {
                  updateParameter()
                }
              } else if (this.preData) {
                // update
                updateParameter()
              } else {
                // add
                addParameter()
              }
            }
          })
        }
      })
    },
    remove() {
      if (this.preData) {
        this.$bus.$emit('removeTab', this.preData.name)
      } else {
        this.$bus.$emit('removeTab')
      }
      this.$emit('close')
    },
    updateData() {
      this.$emit('update')
    },
    test() {
      this.$http
        .get(
          this.$quality_url +
            '/parameters/' +
            this.preData.paramId +
            '/value/test'
        )
        .then(res => {
          this.$alert(
            this.preData.name + ' : ' + res.data,
            this.$t('quality.page.settingList.testResult'),
            {
              confirmButtonText: this.$t('common.button.ok'),
              callback: action => {},
            }
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  computed: {
    readOnly() {
      // if (this.fromRule || this.fromJob) {
      //   return false
      // } else if (this.preData && this.preData.owner !== this.$user.username) {
      //   return true
      // }
      return false
    },
    scopeDisabled() {
      if (this.fromRule) {
        if (!this.preData) {
          return false
        } else {
          return true
          // return this.preData.scope === 'INDIVIDUAL'
        }
      } else {
        return Boolean(this.preData)
      }
    },
  },
}
