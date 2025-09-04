import viewCode from '../newDataStandard/viewCode.vue'
import codeSelect from '../newDataStandard/codeSelect.vue'
import HTTP from '@/http/main.js'
import standardSelector from '@/view/dataProperty/meta/standardSelector.vue'
import relationDoc from '../newDataStandard/relationDoc.vue'
import _ from 'lodash'
export default {
  components: {
    viewCode,
    codeSelect,
    standardSelector,
    relationDoc,
  },
  props: {
    domainId: {},
    parentDomainId: {},
    udps: {},
    options: {},
    domainCodes: {},
    defaultPublic: {},
    data: {},
    currentPathIds: {},
    allOrganizations: {},
    categoryTypeId: {
      default: 4,
    },
    contentStatus: {},
    typeIds: {},
    isDerive: {
      type: Boolean,
      default: false,
    },
    dims: {
      default() {
        return []
      },
    },
    labelText: {
      default() {
        return {}
      },
    },
    getDataTypeOptionsPromise: {
      required: true,
    },
    columnTabArr: {
      type: Array,
      // required: true,
    },
    useWorkflow: {
      type: Boolean,
      default: true,
    },
    useDam: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const testNumber = (rule, value, callback) => {
      if (value == value - 0) {
        callback()
      } else if (!value) {
        callback()
      } else {
        callback(new Error(this.$t('domain.common.numberRequired')))
      }
    }
    const self = this
    const testPath = (rule, value, callback) => {
      if (!self.selectedOptions2 || self.selectedOptions2.length === 0) {
        callback(
          new Error(
            this.$t('domain.common.itemRequiredChoose', {
              name: this.$t('domain.common.dir'),
            })
          )
        )
      } else if (self.selectedOptions2.length === 1) {
        callback(new Error(this.$t('domain.domain.rootNoDomain')))
      } else {
        callback()
      }
    }
    return {
      codeDialogVisible: false,
      code: '',
      activeCollapse: ['0', '1', '2', '3'],
      writable: false,
      //      partWritable:[false,false,false,false],
      partWritable: [true, true, true, true],
      collaseKey: 0,
      detailInitial: {},
      detail: {
        domainCode: null,
        chineseName: null,
        englishName: null,
        abbreviation: null,
        referenceCode: null,
        description: '',
        dataType: null,
        dataScale: null,
        notNull: false,
        businessRule: '',
        source: '',
        synonym: '',
        relationDomain: [],
        authCategoryId: '',
        rangeType: '',
        dataFormat: '',
        // ownerOrg: [],
        ownerOrg: '',
        descriptionDepartment: '',
        dataPrecision: null,
        function: '',
        measureUnit: '',
        monitorObjects: '',
        parentCode: '',
        dimCodes: [],
        documentIds: [],
        parentDomainId: null,
      },
      selectedDims: {},
      formKey: 1,
      ownerOrgOptions: [],
      desOrgOptions: [],
      relatedDomainsOptions: [],
      additionalProperties: [],
      additionalPropertiesInitial: [],
      state: null,
      rules: {
        domainCode: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.domainPropCode'),
            }),
          },
        ],
        chineseName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.cName'),
            }),
          },
        ],
        englishName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.enName'),
            }),
          },
        ],
        abbreviation: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.enAbbreviation'),
            }),
          },
        ],
        dataType: [
          {
            required: true,
            trigger: 'change',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.common.dataType'),
            }),
          },
        ],
        description: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.dataFind.businessDefinition'),
            }),
          },
        ],
        busRule: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.dataQualityRules'),
            }),
          },
        ],
        descriptionDepartment: [
          {
            required: true,
            trigger: 'change',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.busDefinitionDep'),
            }),
          },
        ],
        dataScale: [
          {
            validator: testNumber,
            trigger: 'blur',
          },
        ],
        dataPrecision: [
          {
            validator: testNumber,
            trigger: 'blur',
          },
        ],
        selectedOptions2: [
          {
            required: true,
            trigger: 'change',
            validator: testPath,
          },
        ],
      },
      defaultProps2: {
        children: 'children',
        label: 'chineseName',
      },
      defaultProps3: {
        value: 'foldId',
        children: 'nodes',
        label: 'name',
      },
      selectedOptions2: [],
      initial: {},
      initialSet: {},
      chooseUrl: true,
      defaultValue: {},
      submitLoading: false,
      additionalPropertiesObj: {},
      additionalPropertiesObjInitial: null,
      oldDomainCode: '',
      pathNameArr: [],
      pathNameArrInitial: [],
      dataTypeList: [],
      getRangeTypeOptionsPro: null,
      rangeTypeOptions: [],
      showChooseDims: false,
      allDims: {},
      restDims: {},
      dimsKeyword: '',
      allDimsShow: [],
      dimsDisplay: {},
      dimKeyValueMap: {},
      dataTypeGroups: [],
      showOperation: true,
      defaultExpandList: [],
      treeData: {
        parentDomainId: '',
        chineseName: '',
      },
      domainInheritTree: [],
      filterText: '',
      dataTypeFollowRangeType: [],
      typeDict: null, //
      autoCodeDisabled: null,
      autoCode: false,
    }
  },
  mounted() {
    this.dataInit()
    this.getSelectionOptions()
    this.getDomainInheritTree()
    this.getFindState()
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
    // this.getDataTypeList()
    if (this.domainId) {
      this.writable = true
      this.partWritable = [true, true, true, true]
      setTimeout(() => {
        this.resetFields()
      })
      this.updateScrollBar()
      this.innerLoadStandardDetails()
    } else {
      this.selectedOptions2 =
        this.currentPathIds && this.currentPathIds.length
          ? this.currentPathIds
          : [this.options[0].foldId]
      this.writable = true
      this.partWritable = [true, true, true, true]
      this.activeCollapse = ['0', '1', '2', '3']
      setTimeout(() => {
        this.resetFields()
        this.useDefault(this.defaultValue)
      })
      if (this.categoryTypeId === 2) {
        this.mapDims()
      }
    }

    // if (this.parentDomainId) {
    //   this.innerLoadStandardDetails()
    // } else {
    //   this.selectedOptions2 =
    //     this.currentPathIds && this.currentPathIds.length
    //       ? this.currentPathIds
    //       : [this.options[0].foldId]
    //   this.writable = true
    //   this.partWritable = [true, true, true, true]
    //   this.activeCollapse = ['0', '1', '2', '3']
    //   setTimeout(() => {
    //     this.resetFields()
    //     this.useDefault(this.defaultValue)
    //   })
    //   if (this.categoryTypeId === 2) {
    //     this.mapDims()
    //   }
    // }
    this.$bus.$on('domainCodeSelected', row => {
      this.handleDomainCodeSelected(row)
    })
    this.options[0].disabled = true
    this.$bus.$on('domainSelected', this.handleStandardChoose)
  },
  beforeDestroy() {
    this.$bus.$off('domainCodeSelected')
    this.$bus.$off('domainSelected', this.handleStandardChoose)
  },
  methods: {
    autoCodeChange(value) {
      if (value === true) {
        this.detail.domainCode = null
        this.$set(this.rules, 'domainCode', [{ required: false }])
        this.$refs.form0.validateField('domainCode')
      } else {
        this.$set(this.rules, 'domainCode', [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.domain.domainPropCode'),
            }),
          },
        ])
      }
    },
    getFindState() {
      HTTP.getfindState({ domainType: 'DOMAIN_STANDARD' })
        .then(res => {
          this.autoCodeDisabled = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeRangeType(val) {
      if (val) {
        this.dataTypeFollowRangeType = this.typeDict[val]
      } else {
        this.dataTypeFollowRangeType = this.dataTypeGroups
      }
    },
    remoteMethod(query) {
      setTimeout(() => {
        this.filterText = query
      }, 100)
    },
    getDomainInheritTree() {
      return new Promise(resolve => {
        HTTP.getDomainInheritTree()
          .then(res => {
            if (res.data.children) {
              this.domainInheritTree = res.data.children
              this.defaultExpandList = res.data.children.map(e => e.chineseName)
            } else {
              this.domainInheritTree = []
            }
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    dataIconFunction2(data, node) {
      let className = ''
      // console.log(data, 'data')

      if (data.domainId === '_root') {
        if (node.expanded) {
          className = 'iconfont icon-openfile'
        } else {
          className = 'iconfont icon-file'
        }
      } else {
        className = 'iconfont iconfontdomain icon-biaozhun'
      }
      return className
    },
    nodeClick(data) {
      this.selection = data
      if (data.domainId !== '_root') {
        this.treeData.parentDomainId = data.domainId
        this.treeData.chineseName = data.chineseName
        this.$refs.selectTree.$refs.dataSelect.blur()
        this.$http
          .post(`/domain/domains/domain/getDomainById`, {
            domainId: data.domainId,
          })
          .then(res => {
            this.detail = _.cloneDeep(res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      //  this.form.name = data.name
      //  this.form.code = data.code
    },
    filterNode2(value, data, node) {
      if (!value) return true
      return data[this.defaultProps2.label].indexOf(value) !== -1
    },
    cloneDeep(propertyName) {
      if (!this.initialSet[propertyName]) {
        this.initial[propertyName] = _.cloneDeep(this[propertyName])
        this.initialSet[propertyName] = true
      }
    },
    dataInit() {
      if (this.detail) {
        if (this.categoryTypeId === 2) {
          const allDims = {}
          const dimKeyValueMap = {}
          for (const i in this.dims) {
            const v = this.dims[i]
            if (v.dimensionType === 'NORMAL') {
              allDims[i] = v
              const vVal = v.values
              if (vVal && Array.isArray(vVal)) {
                vVal.forEach(item => {
                  dimKeyValueMap[`${item.catalog.catalogId}/${item.dimCode}`] =
                    item
                })
              }
            }
          }
          this.allDims = allDims
          this.dimKeyValueMap = dimKeyValueMap
        }
      }
    },
    updateScrollBar() {},
    resetFields() {
      this.$refs.form0.resetFields()
      this.$refs.form1.resetFields()
      // this.$refs.form2.resetFields()
      this.$refs.form3.resetFields()
      this.refreshAdditionalProperties()
      this.collaseKey++
    },
    innerLoadStandardDetails() {
      const oldData = this.data
      this.treeData.parentDomainId = oldData.domainId
      if (this.isDerive) {
        oldData.state = 'D'
        oldData.domainId = ''
      }
      this.detailInitial = _.cloneDeep(oldData)
      if (this.isDerive) {
        this.detailInitial.parentCode = this.detailInitial.domainCode
      }

      const dimCodes = oldData.dimCodes || []
      const dimCodesObj = []
      dimCodes.forEach(item => {
        if (this.dimKeyValueMap[item]) {
          item = this.dimKeyValueMap[item]
          if (item.catalog.dimensionType === 'NORMAL') {
            dimCodesObj.push(item)
          }
        }
      })
      this.detailInitial.dimCodes = dimCodesObj
      this.detailInitial.referenceCode = this.detailInitial.referenceCode || ''
      this.convertPath(this.options, oldData.path, [])
      if (oldData.additionalProperties && oldData.additionalProperties.length) {
        oldData.additionalProperties.forEach(e => {
          this.additionalPropertiesObj[e[0]] = e[1]
        })
      }
      this.additionalPropertiesObjInitial = _.cloneDeep(
        this.additionalPropertiesObj
      )
      this.state = oldData.state
      this.oldDomainCode = oldData.domainCode
      this.writable =
        oldData.state === 'D' ||
        oldData.state === 'X' ||
        (oldData.state === 'A' && (oldData.isUpdate || this.isDerive)) ||
        !this.domainId

      if (!this.useWorkflow) {
        this.writable = true
        this.partWritable = [true, true, true, true]
      }
      setTimeout(() => {
        this.cancel()
      })
    },
    convertPath(list, path, result) {
      if (!path) return
      list.forEach(e => {
        if (e.name && e.name === path[result.length]) {
          result.push(e.foldId)
          if (result.length === path.length) {
            this.selectedOptions2 = result
            this.cloneDeep('selectedOptions2')
            return
          }
        }
        if (e.nodes && e.nodes.length) {
          this.convertPath(e.nodes, path, result)
        }
      })
    },
    convertPathByFoldId(list, foldId, pathNameArr) {
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
      this.partWritable[index] = true
      this.collaseKey++
      e.stopPropagation()
      if (this.activeCollapse.includes(index.toString())) {
        this.activeCollapse.push(index.toString())
      }
    },
    cancel() {
      if (this.domainId) {
        this.detail = _.cloneDeep(this.detailInitial)
        this.additionalProperties = _.cloneDeep(
          this.additionalPropertiesInitial
        )
        if (this.contentStatus === 'write' && this.detail.parentDomainId) {
          this.$http
            .post(`/domain/domains/domain/getDomainById`, {
              domainId: this.detail.parentDomainId,
            })
            .then(res => {
              this.treeData.parentDomainId = res.data.domainId
              this.treeData.chineseName = res.data.chineseName
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      } else {
        this.resetFields()
      }
      if (this.categoryTypeId === 2) {
        this.mapDims()
      }
    },
    exit(isAdd) {
      if (isAdd) {
        this.$emit('back')
        // this.$bus.$emit('getremoveTab', 'createDomain' + this.columnTabArr.id)
      } else {
        if (this.contentStatus === 'addField') {
          this.$emit('goSelect')
        } else {
          this.$emit('scanCurrent')
        }
      }
    },
    beforeSave(isUpdate) {
      if (this.$refs.relationDoc && this.$refs.relationDoc.getFileIds) {
        this.detail.documentIds = this.$refs.relationDoc.getFileIds()
      }
      const dimCodes = []
      for (const key in this.selectedDims) {
        const values = this.allDims[key].values || []
        const selectedValues = this.selectedDims[key]
        if (selectedValues && Array.isArray(selectedValues)) {
          selectedValues.forEach(item => {
            let obj = values.filter(v => v.dimId === item)
            if (obj.length === 1) {
              obj = obj[0]
              const str = `${obj.catalog.catalogId}/${obj.dimCode}`
              dimCodes.push(str)
            }
          })
        }
      }
      this.detail.dimCodes = dimCodes

      let isComplete = true
      const formArr = {
        form0: 'form0',
        form1: 'form1',
        // form2: 'form2',
        form3: 'form3',
      }
      for (const item in formArr) {
        this.$refs[item].validate(valid => {
          if (!valid) {
            isComplete = false
            // return false;
          } else {
          }
        })
      }
      if (isComplete) {
        if (isUpdate && !this.isDerive) {
          this.updateApply()
          return
        }
        this.save()
      }
    },

    updateDomain() {
      // deprecated
      const requestBody = _.cloneDeep(this.detail)
      requestBody.additionalProperties = [...this.additionalProperties]
      if (this.domainId) {
        HTTP.updateDomainVersion({
          domainId: this.domainId,
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
      requestBody.categoryId = 4
      this.submitLoading = true
      if (
        this.domainId &&
        !this.isDerive &&
        !(this.contentStatus === 'addField')
      ) {
        // update
        let updatePro = null
        if (this.useWorkflow) {
          updatePro = HTTP.updateDomains(requestBody)
        } else {
          requestBody.state = 'A'
          updatePro = HTTP.updateDomainService(requestBody)
        }
        updatePro
          .then(() => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.modifySuccessfully'))
            this.$emit('scanCurrent')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      } else {
        requestBody.domainId = ''
        requestBody.autoGenCode = this.autoCode
        if (this.treeData.parentDomainId === '') {
          requestBody.parentDomainId = null
        } else {
          requestBody.parentDomainId = this.treeData.parentDomainId
        }
        // create
        let createPro = null
        if (this.useWorkflow) {
          createPro = HTTP.createDomainService(requestBody, this.defaultPublic)
        } else {
          createPro = HTTP.createDomainService(requestBody, true)
        }
        createPro
          .then(res => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.createSucceed'))
            this.resetFields()
            this.$emit('scanCurrent')
            this.$emit('domainCreated', res.data)
            this.$emit('back')
            console.log(111)
            this.$emit('getDomainInheritTree')
            if (this.contentStatus === 'addField') {
              this.$emit('goSelect')
            }
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      }
    },
    updateApply() {
      // this.submitLoading = true
      const formDefs = []
      this.detail.folderId =
        this.selectedOptions2[this.selectedOptions2.length - 1]
      this.pathNameArr = []
      this.pathNameArrInitial = []
      this.selectedOptions2.forEach(e => {
        this.convertPathByFoldId(this.options, e, this.pathNameArr)
      })

      const pathNameArrJson = JSON.stringify(this.pathNameArr)
      this.detail.path = pathNameArrJson
      this.detail.pathStr = this.pathNameArr.join('/')

      try {
        this.detail.authCategoryName = this.$modelCategories.find(
          e => e.categoryId === this.detail.authCategoryId
        ).categoryName
      } catch (e) {
        console.log(e)
      }
      try {
        this.detail.descriptionDepartmentName = this.$utils.getBranchNameByBm(
          this.detail.descriptionDepartment
        )
      } catch (e) {
        console.log(e)
      }
      try {
        this.detail.ownerOrgName = this.$utils.getBranchNameByBm(
          this.detail.ownerOrg
        )
      } catch (e) {
        console.log(e)
      }
      Object.keys(this.detail).forEach(e => {
        if (e !== 'additionalProperties') {
          const oldValue =
            typeof this.detailInitial[e] === 'object'
              ? JSON.stringify(this.detailInitial[e])
              : this.detailInitial[e]
          const newValue =
            typeof this.detail[e] === 'object'
              ? JSON.stringify(this.detail[e])
              : this.detail[e]
          formDefs.push({
            code: e,
            value: newValue,
          })
          if (newValue !== oldValue) {
            formDefs.push({
              code: e + '--change',
              value: oldValue,
            })
          }
        }
      })
      const udp = {}
      const udpInitial = {}
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        if (this.additionalPropertiesObj[e]) {
          const newValue = this.additionalPropertiesObj[e]
          const oldValue = this.additionalPropertiesObjInitial[e]
          udp[e] = newValue
          if (newValue !== oldValue) {
            udpInitial[e] = oldValue
          }
        }
      })
      formDefs.push({
        code: 'additionalProperties',
        value: JSON.stringify(udp),
      })
      formDefs.push({
        code: 'additionalProperties--change',
        value: JSON.stringify(udpInitial),
      })
      const para = {
        requestBody: {
          processType: '数据标准_修改',
          formDefs: formDefs,
        },
      }
      if (this.useWorkflow) {
        HTTP.publish(para)
          .then(res => {
            this.submitLoading = false
            this.$message.success($t('domain.common.applicationSubmitted'))
            this.$emit('scanCurrent')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      } else {
        HTTP.createDomainService(para, true)
          .then(res => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.saveSucceed'))
            this.$emit('scanCurrent')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      }
    },
    removeCurrentOption(index) {
      this.selectedOptions2.splice(index, 1)
    },
    addOption() {
      this.selectedOptions2.push('')
    },
    viewCode(code) {
      this.code = code
      this.codeDialogVisible = true
    },
    useDefault(defaultValue) {
      if (!defaultValue) return
      const defaultAttr = [
        'domainCode',
        'chineseName',
        'englishName',
        'abbreviation',
        'dataType',
        'dataScale',
        'dataPrecision',
        'description',
      ]
      defaultAttr.forEach(item => {
        this.$set(this.detail, item, defaultValue[item] || '')
      })
    },
    setDefault(defaultValue) {
      if (!defaultValue) return
      this.defaultValue = defaultValue
      this.defaultValue.chineseName = this.defaultValue.domainChName
      this.defaultValue.englishName = this.defaultValue.domainEnName
      this.defaultValue.abbreviation = this.defaultValue.domainAbbr
      this.useDefault(this.defaultValue)
    },
    busInfoBlur(name, val) {
      if (name === this.$t('domain.domain.dataQualityRules') && val) {
        setTimeout(() => {
          // this.$refs.form2.clearValidate('busRule')
        })
      }
    },
    checkDomainCodeIsExist() {
      if (
        !this.detail.domainCode ||
        this.detail.domainCode === this.oldDomainCode
      )
        return
    },
    openCodeSelect() {
      this.$bus.$emit('callDomainCodeSelector')
    },
    handleDomainCodeSelected(row) {
      this.detail.referenceCode = row.code
    },
    getDataTypeList() {
      this.getDataTypeOptionsPromise
        .then(res => {
          // console.log(res.data, 2345)
          this.dataTypeList = res.data
          const data = res.data
          const groups = {}
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              if (!item.parentOptionValue) return
              if (!groups[item.parentOptionValue]) {
                groups[item.parentOptionValue] = {
                  label: item.parentOptionValue,
                  options: [],
                }
              }
              groups[item.parentOptionValue].options.push(item)
            })
          }
          this.dataTypeGroups = Object.keys(groups).map(key => groups[key])
          this.dataTypeFollowRangeType = JSON.parse(
            JSON.stringify(this.dataTypeGroups)
          )
          let dict = {}
          this.rangeTypeOptions.forEach(r => {
            dict[r.optionValue] = []
          })
          this.dataTypeGroups.forEach(d => {
            switch (d.label) {
              case '整型':
              case '实数':
              case '二进制':
                dict['数值'].push(d)
                dict['代码'].push(d)
                dict['编码'].push(d)
                break
              case '时间':
                dict['时间'].push(d)
                dict['日期'].push(d)
                break
              case '字符串':
                dict['文本'].push(d)
                dict['代码'].push(d)
                dict['编码'].push(d)
                break
            }
          })
          this.typeDict = dict
          if (!this.detail.rangeType) return
          this.changeRangeType(this.detail.rangeType)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    querySearch(queryString, cb) {
      // var restaurants = this.themeCategoryArr;
      const restaurants = this.dataTypeList
      const results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    getRangeTypeOptions(queryString, cb) {
      const restaurants = this.rangeTypeOptions
      const results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    showStandardChoose() {
      if (this.$refs.relationChoose && this.$refs.relationChoose.blur) {
        this.$refs.relationChoose.blur()
      }
      this.$bus.$emit('callDomainSelector', { multiple: true })
    },
    handleStandardChoose(choose) {
      // console.log(choose, 'choose')
      this.relatedDomainsOptions = choose
      this.detail.relationDomain = choose.map(item => item.domainCode)
    },
    getSelectionOptions() {
      // console.log('getSelectionOptions')
      this.ownerOrgOptions = this.allOrganizations || []
      this.desOrgOptions = this.allOrganizations || []
      // console.log(this.useDam, 'this.useDam')
      if (!this.getRangeTypeOptionsPro) {
        if (this.useDam) {
          this.getRangeTypeOptionsPro = HTTP.getSelectionOptions({
            requestBody: {
              category: 'DOMAIN',
              names: ['值域类型'],
            },
          })
        } else {
          this.getRangeTypeOptionsPro = HTTP.getDataTypeListService()
        }
      }
      this.getRangeTypeOptionsPro
        .then(res => {
          let data = res.data
          if (!data || !Array.isArray(data)) {
            data = []
          }
          this.rangeTypeOptions = data
          this.getDataTypeList()
          // console.log(this.rangeTypeOptions, 'this.rangeTypeOptions ')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectOrganization(event) {
      if (event.relatedTarget && this.detail.descriptionDepartment) {
        this.desOrgOptions = null
        this.detail.descriptionDepartment = ''
      } else {
        this.$utils.branchSelect.open(false).then(res => {
          this.desOrgOptions = [res]
          // this.detail.descriptionDepartment = res.bm
          this.$set(this.detail, 'descriptionDepartment', res.bm)
        })
      }
      if (this.$refs.desOrgChoose && this.$refs.desOrgChoose.blur) {
        this.$refs.desOrgChoose.blur()
      }
    },
    selectOwnerOrg(event) {
      if (event.relatedTarget && this.detail.ownerOrg) {
        this.detail.ownerOrg = ''
        this.ownerOrgOptions = null
      } else {
        this.$utils.branchSelect.open(false).then(res => {
          this.ownerOrgOptions = [res]
          // this.detail.ownerOrg = res.bm
          this.$set(this.detail, 'ownerOrg', res.bm)
        })
      }
      if (this.$refs.ownerChooseSelect && this.$refs.ownerChooseSelect.blur) {
        this.$refs.ownerChooseSelect.blur()
      }
    },
    mapDims() {
      this.restDims = _.cloneDeep(this.allDims)
      if (this.detail && Array.isArray(this.detail.dimCodes)) {
        const catalogs = []
        this.detail.dimCodes.forEach(item => {
          // console.log(item, 'dimCodes item')
          if (catalogs.indexOf(item.catalog.catalogId) === -1) {
            catalogs.push(item.catalog.catalogId)
            delete this.restDims[item.catalog.catalogId]
          }
        })
        // console.log(catalogs, 'catalogs')
        for (const i in this.allDims) {
          const dim = this.allDims[i]
          if (catalogs.indexOf(i) !== -1) {
            this.$set(this.dimsDisplay, i, dim)
          }
        }
      } else {
        this.dimsDisplay = {}
      }

      this.selectedDims = {}
      Array.isArray(this.detail.dimCodes) &&
        this.detail.dimCodes.forEach(dim => {
          if (dim.catalog.dimensionType === 'NORMAL') {
            const item = dim
            const catalogId = item.catalog.catalogId
            if (!this.selectedDims[catalogId]) {
              this.$set(this.selectedDims, catalogId, [])
            }
            this.selectedDims[catalogId].push(item.dimId)
          }
        })
    },
    deleteDimItem(dimCatalog) {
      this.$delete(this.selectedDims, dimCatalog.catalogId)
      this.$delete(this.dimsDisplay, dimCatalog.catalogId)
      this.$set(this.restDims, dimCatalog.catalogId, dimCatalog)
      this.$nextTick(this.resetChoDimsDiaShow)
    },
    handleAddDim(dim) {
      this.handleCommand(dim.id)
    },
    handleCommand(command) {
      this.restDims[command] = null
      this.$set(this.dimsDisplay, command, this.allDims[command])
      // this.dimsDisplay[command] = this.allDims[command]
      this.resetChoDimsDiaShow()
      this.refreshForm()
    },
    resetChoDimsDiaShow() {
      this.allDimsArr = []
      const arr = Object.keys(this.restDims)
      arr.forEach(item => {
        if (this.restDims[item]) {
          this.allDimsArr.push({
            name: this.restDims[item].catalog,
            id: this.restDims[item].catalogId,
          })
        }
      })
      this.chooseDimsFilter(this.dimsKeyword)
    },
    refreshForm() {
      this.formKey++
    },
    chooseDimsFilter(keyword) {
      if (!keyword || keyword === 0) {
        keyword = ''
      }
      this.allDimsShow = []
      this.allDimsArr.forEach(item => {
        if (item.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
          this.allDimsShow.push(item)
        }
      })
      this.$utils.sort.sortConsiderChineseNumber(this.allDimsShow, 'name')
    },
    addDims() {
      this.resetChoDimsDiaShow()
      this.showChooseDims = true
    },

    handleUploadFile() {
      if (this.$refs.relationDoc && this.$refs.relationDoc.triggerUpload) {
        this.$refs.relationDoc.triggerUpload()
      }
    },
    handleSelectChange() {
      this.refreshForm()
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.optionValue
            .toLowerCase()
            .indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    getPath() {
      // console.log('getPath')
      // setTimeout(() => {
      //   if (
      //     this.$refs.pathSelector &&
      //     this.$refs.pathSelector.getCheckedNodes
      //   ) {
      //     let nodeData = []
      //     let node = this.$refs.pathSelector.getCheckedNodes()
      //     if (node[0]) {
      //       node = node[0]
      //     }
      //     console.log(node, 'node')
      //     let obj = {
      //       name: node.label,
      //       couldClick: false,
      //       level: node.level,
      //     }
      //     nodeData.unshift(obj)
      //     while (node.parent) {
      //       node = node.parent
      //       let obj = {
      //         name: node.label,
      //         couldClick: false,
      //         level: node.level,
      //       }
      //       nodeData.unshift(obj)
      //     }
      //     console.log(nodeData, 'nodeData')
      //
      //     this.$emit('setPath', nodeData)
      //   }
      // }, 100)
      if (this.contentStatus === 'addField') {
        let arr = [
          {
            name: this.$t('domain.domainStandard.addDomainStandard'),
            couldClick: false,
          },
        ]
        this.$emit('setPath', arr)
      } else {
        let arr = [
          {
            name: this.$t('domain.domainStandard.allDomainStandard'),
            couldClick: false,
          },
          {
            name: this.domainId
              ? this.$t('domain.domainStandard.editDomainStandard')
              : this.$t('domain.domainStandard.addDomainStandard'),
            couldClick: false,
          },
        ]
        this.$emit('setPath', arr)
      }
    },
  },
  watch: {
    filterText(val) {
      this.$refs.branchTree.filter(val)
    },
    data(newvalue, oldvalue) {
      this.innerLoadStandardDetails()
      // this.detailInitial = _.cloneDeep(newvalue)
    },
    chooseUrl(newVal) {
      if (!newVal) {
        if (this.selectedOptions2.length === 0) {
          this.selectedOptions2.push('')
        }
      }
    },
    dimsKeyword(newVal, oldVal) {
      this.chooseDimsFilter(newVal)
    },
    dims(newVal) {
      this.mapDims()
    },
    domainId: {
      immediate: true,
      handler: function () {
        this.getPath()
      },
    },
  },
  computed: {
    defaultExpandAll() {
      return false
    },
    detailStateFirst() {
      const state = this.detail.state
      return state === 'A' || state === 'V'
    },
    detailStateLast() {
      const state = this.detail.state
      return state === 'D' || state === 'X'
    },
  },
}
