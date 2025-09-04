import HTTP from '@/http/main.js'
import _ from 'lodash'
export default {
  props: {
    itemId: {},
    udps: {},
    options: {},
    editable: Boolean,
  },
  data() {
    return {
      itemRules: {
        stdCode: [
          {
            required: true,
            trigger: 'blur',
            message: '请输入信息项编码',
          },
        ],
        name: [
          {
            required: true,
            trigger: 'blur',
            message: '请输入信息项名称',
            trigger: ['blur', 'change'],
          },
        ],
        catalog: [
          {
            required: true,
            trigger: 'blur',
            message: '请选择目录',
            trigger: ['blur', 'change'],
          },
        ],
      },
      itemDetails: {
        stdCode: null,
        name: null,
        englishName: null,
        catalog: '',
        businessDepartment: '',
      },
      itemPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      catalogOptions: [],
      submitLoading: false,
      autoCode: false,
      autoCodeSelect: false,
    }
  },
  mounted() {
    // this.getFindState()
    this.udps.forEach(e => {
      this.$set(this.additionalPropertiesObj, e.udpId, null)
      if (e.required) {
        let validator = (rule, value, callback) => {
          if (!this.additionalPropertiesObj[e.udpId]) {
            callback(
              new Error(
                this.$t('domain.common.itemRequiredInput', { name: e.name })
              )
            )
          } else {
            callback()
          }
        }
        this.$set(this.rules, e.udpId, {
          required: true,
          trigger: 'blur',
          message: this.$t('domain.common.itemRequiredInput', { name: e.name }),
          validator,
        })
      }
    })
    if (this.itemId) this.detail = { ...this.data }
    if (this.editable) this.resetFields()
  },
  methods: {
    // 获取编码配置---是否可以自动生成编码
    getFindState(value) {
      HTTP.getfindState({ domainType: value })
        .then(res => {
          this.autoCode = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    resetFields() {
      this.$refs.itemForm.resetFields()
      this.refreshAdditionalProperties()
    },

    convertPath(list, path, result) {
      // name transform  foldId
      if (!path) return
      list.forEach(e => {
        if (e.name && e.name === path[result.length]) {
          result.push(e.foldId)
          if (result.length === path.length) {
            this.selectedOptions2 = result
            return
          }
        }
        if (e.nodes && e.nodes.length) {
          this.convertPath(e.nodes, path, result)
        }
      })
    },
    convertPathByFoldId(list, foldId, pathNameArr) {
      // name transform  foldId
      if (!foldId) return
      list.forEach(e => {
        if (e.foldId && e.foldId === foldId) {
          pathNameArr.push(e.name)
        } else {
          if (e.nodes && e.nodes.length) {
            this.convertPathByFoldId(e.nodes, foldId, pathNameArr)
          }
        }
      })
    },

    refreshAdditionalProperties() {
      const length = this.udps.length
      this.additionalProperties = []
      for (let i = 0; i < length; i++) {
        this.additionalProperties.push('')
      }
    },
    enableEdit(index, e) {
      e.stopPropagation()
      if (this.activeCollapse.includes(index.toString())) {
        this.activeCollapse.push(index.toString())
      }
    },
    exit() {
      this.$emit('back')
    },
    beforeSave() {
      this.$refs.itemForm.validate(valid => {
        if (valid) {
          if (this.itemId) {
            this.updateItem()
          } else {
            this.save()
          }
        }
      })
    },

    updateItem() {
      // deprecated
      const requestBody = _.cloneDeep(this.detail)
      requestBody.additionalProperties = [...this.additionalProperties]
      if (this.itemId) {
        HTTP.updateDomainVersion({
          itemId: this.itemId,
          requestBody: requestBody,
        })
          .then(() => {
            this.$message.success(this.$t('domain.domain.updateMessage'))
            this.$emit('scanCurrent')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    save() {
      const requestBody = _.cloneDeep(this.detail)
      requestBody.additionalProperties = []
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        if (this.additionalPropertiesObj[e]) {
          requestBody.additionalProperties.push([
            e,
            this.additionalPropertiesObj[e],
          ])
        } else {
          requestBody.additionalProperties.push([e, ''])
        }
      })
      const arr = this.selectedOptions2
      if (arr.length === 0 || arr.indexOf('') !== -1) {
        this.$message.error(this.$t('domain.domain.needPath'))
        return
      }
      requestBody.folderId =
        this.selectedOptions2[this.selectedOptions2.length - 1]
      for (const key in requestBody) {
        const value = requestBody[key]
        if (value && typeof value === 'string') {
          requestBody[key] = _.trim(value)
        }
      }
      requestBody.categoryId = this.categoryTypeId || 1
      this.submitLoading = true
      requestBody.domainId = ''
      requestBody.autoGenCode = this.autoCodeSelect
      this.$http
        .post('/domain/datasecurity/item/createItem', requestBody)
        .then(res => {
          this.submitLoading = false
          this.$message.success(this.$t('domain.common.createSucceed'))
          this.resetFields()
          this.$emit('scanCurrent')
          this.$emit('domainCreated', res.data)
          this.$emit('back')
        })
        .catch(e => {
          this.submitLoading = false
          this.$showFailure(e)
        })
    },
    removeCurrentOption(index) {
      this.selectedOptions2.splice(index, 1)
    },

    checkItemCodeIsExist() {
      if (!this.detail.itemCode || this.detail.itemCode === this.oldItemCode)
        return
    },
    getPath() {
      let arr = [
        {
          name: '所有信息项',
          couldClick: false,
        },
        {
          name: this.editable
            ? this.itemId
              ? '编辑信息项'
              : '新建信息项'
            : '查看信息项',
          couldClick: false,
        },
      ]
      this.$emit('setPath', arr)
    },
  },
  watch: {
    itemId: {
      immediate: true,
      handler: function () {
        this.getPath()
      },
    },
  },
}
