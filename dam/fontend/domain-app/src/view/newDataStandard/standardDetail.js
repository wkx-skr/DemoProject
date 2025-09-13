import viewCode from './viewCode.vue'
import codeSelect from './codeSelect.vue'
import HTTP from '@/http/main.js'
import standardSelector from '@/view/dataProperty/meta/standardSelector.vue'
import udpFormLabel from '@/view/newDataStandard/udpFormLabel.vue'
import relationDoc from './relationDoc.vue'
import _ from 'lodash'
import Validator from './validator/standard'
import axios from 'axios'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import DatablauInput from '@/next/components/basic/input/DatablauInput.vue'
import GlossaryList from '@/view/dataStandardGlossary/glossaryList.vue'

export default {
  components: {
    GlossaryList,
    DatablauInput,
    viewCode,
    codeSelect,
    standardSelector,
    relationDoc,
    udpFormLabel,
  },
  props: {
    domainId: {},
    udps: {},
    options: {},
    domainCodes: {},
    defaultPublic: {},
    data: {},
    currentPathIds: {},
    allOrganizations: {},
    categoryTypeId: {
      default: 1,
    },
    typeIds: {},
    isDerive: {
      // 是否派生
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
        if (value - 0 < 0) {
          callback(new Error(this.$t('domain.common.numberBigThan0')))
        } else {
          callback()
        }
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
      } /* else if (self.selectedOptions2.length === 1) {
        callback(new Error(this.$t('domain.domain.rootNoDomain')))
      } */ else {
        callback()
      }
    }
    const allDims = _.cloneDeep(this.dims)
    Object.values(allDims).forEach(item => {
      item.selected = []
    })
    const autoCode = true
    const formRule = {
      domainCode: autoCode
        ? [{ required: false }]
        : Validator.domainCode({
            categoryId: this.categoryTypeId,
            elThis: this,
          }),
      chineseName: Validator.chineseName({
        categoryId: this.categoryTypeId,
        elThis: this,
      }),
      englishName: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback, source) => {
            if (!value) {
              callback(new Error('请输入英文名称'))
            } else if (value.length > 50) {
              callback(new Error('英文名称长度不能超过50个字符'))
            } else if (!/^(?:[A-Z][a-zA-Z]*)(?: [A-Z][a-zA-Z]*)*$/.test(value)) {
              callback(new Error('英文名称只能包含字母和空格，且首字母需大写'))
            } else {
              callback()
            }
          },
          /*message: this.$t('domain.common.itemRequiredInput', {
            name: this.$t('domain.domain.enName'),
          }),*/
        },
      ],
      abbreviation: [
        /* {
          required: true,
          trigger: 'blur',
          message: this.$t('domain.common.itemRequiredInput', {
            name: this.$t('domain.domain.enAbbreviation'),
          }),
        }, */
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
          // message: this.$t('domain.common.itemRequiredInput', {
          //   name: this.$t('domain.dataFind.businessDefinition'),
          // }),
          validator: (rule, value, callback) => {
            // 业务定义不能与中文名称或业务规则相同
            const { chineseName, businessRule } = this.detail
            if (!value) {
              callback(new Error('请输入业务定义'))
            } else if (value === chineseName || value === businessRule) {
              callback(new Error('业务定义不能与中文名称或业务规则相同'))
            }
          },
        },
      ],
      businessRule: [
        {
          validator: (rule, value, callback) => {
            //业务规则不能与中文名称或业务定义相同
            const { chineseName, description } = this.detail
            if (value) {
              if (value === chineseName || value === description) {
                callback(new Error('业务规则不能与中文名称或业务定义相同'))
              }
            }
          },
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
      unit: [
        {
          required: true,
          message: '请输入数据单位',
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
    }
    return {
      formRule,
      allDims: allDims,
      dimsDisplay: new Set(),
      allDimsShow: [],
      codeDialogVisible: false,
      code: '',
      activeCollapse: ['0', '1', '2', '3', '4', '5'],
      writable: false,
      //      partWritable:[false,false,false,false],
      partWritable: [true, true, true, true, true, true],
      collaseKey: 0,
      detailInitial: {},
      relationDomainString: '',
      detail: {
        domainCode: null,
        chineseName: null,
        englishName: null,
        abbreviation: null,
        referenceCode: null,
        description: '',
        dataType: null,
        dataScale: null,
        unit: '',
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
      },
      formKey: 1,
      ownerOrgOptions: [],
      desOrgOptions: [],
      relatedDomainsOptions: [],
      additionalProperties: [],
      additionalPropertiesInitial: [],
      state: null,
      defaultProps2: {
        value: 'foldId',
        children: 'nodes',
        label: 'name',
      },
      defaultProps3: {
        children: 'children',
        label: 'chineseName',
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
      dataFormatOptions: [
        { optionValue: '身份证号' },
        { optionValue: '手机号' },
        { optionValue: '邮箱' },
      ],
      showChooseDims: false,
      dimsKeyword: '',
      dataTypeGroups: [],
      showOperation: true,
      treeData: {
        domainId: '',
        chineseName: '',
      },
      defaultExpandList: [],
      domainInheritTree: [],
      fieldState: false,
      filterText: '',
      dataTypeFollowRangeType: [],
      typeDict: null, //
      autoCodeDisabled: null,
      autoCode,
      aiDisabled: false,
      showAI: Boolean(window.setting.domainAI),
      showChooseTermDialogVis: false,
      chooseTerms: [],
    }
  },
  mounted() {
    this.getSelectionOptions()
    if (this.typeIds === 1) {
      this.getFindState('BASIC_CODE')
    } else if (this.typeIds === 2) {
      this.getFindState('NORM_SYS')
    }
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
    /*this.selectedOptions2 =
      this.currentPathIds && this.currentPathIds.length
        ? this.currentPathIds
        : [this.options[0].nodes[0].foldId]*/
    if (this.domainId) {
      this.writable = true
      this.partWritable = [true, true, true, true, true, true]
      setTimeout(() => {
        this.resetFields()
      })
      this.updateScrollBar()
      this.innerLoadStandardDetails()
    } else {
      this.selectedOptions2 =
        this.currentPathIds && this.currentPathIds.length
          ? this.currentPathIds
          : [this.options[0].nodes[0].foldId]
      this.writable = true
      this.partWritable = [true, true, true, true, true, true]
      this.activeCollapse = ['0', '1', '2', '3', '4', '5']
      setTimeout(() => {
        this.resetFields()
        this.useDefault(this.defaultValue)
      })
      if (this.categoryTypeId === 2) {
      }
    }

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
    async toGenerateAI() {
      const _this = this
      if (!this.detail.chineseName) {
        this.$blauShowFailure('请完善中文名称')
        return
      }
      const sentence = window.setting.domainAI
      const variableRegex = /\$\{([^}]+)\}/g
      const variables = []
      let match
      while ((match = variableRegex.exec(sentence)) != null) {
        variables.push(match[1])
      }
      const values = []
      variables.forEach((v, idx) => {
        if (v === 'domainTheme') {
          let options = this.options
          let themeArr = []
          this.selectedOptions2.forEach(s => {
            const target = options.find(o => o.foldId === s)
            if (target) {
              themeArr.push(target.name)
              options = target.nodes || []
            }
          })
          values[idx] = themeArr.join(',')
        } else {
          values[idx] = this.detail[v]
        }
      })
      let newSentence = sentence
      variables.forEach((variable, index) => {
        newSentence = newSentence.replace(`\${${variable}}`, values[index])
      })

      this.aiDisabled = true
      this.detail.description = ''
      this.$ESHTTP('/aic/api/v1/chat/completions', newSentence, answer => {
        if (answer) {
          if (answer.choices && answer.choices.length) {
            answer.choices.forEach(an => {
              if (an.delta.content) {
                _this.detail.description += an.delta.content
              }
            })
          }
        } else {
          _this.aiDisabled = false
        }
      })
    },
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
    getFindState(value) {
      HTTP.getfindState({ domainType: value })
        .then(res => {
          this.autoCodeDisabled = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeFieldStateValue(value) {
      if (value === true) {
        this.getDomainInheritTree()
      } else {
        this.detail.refDomainId = null
        this.detail.refDomainCode = null
        this.detail.refDomainVer = null
      }
    },
    selectdDmainInherit() {},
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
    remoteMethod(query) {
      setTimeout(() => {
        this.filterText = query
      }, 100)
    },
    filterNode2(value, data, node) {
      if (!value) return true
      return data[this.defaultProps3.label].indexOf(value) !== -1
    },
    nodeClick(data) {
      this.selection = data

      if (data.domainId !== '_root') {
        this.treeData.domainId = data.domainId
        this.treeData.chineseName = data.chineseName
        // blur el-select, close options
        this.$refs.selectTree.$refs.dataSelect.blur()
        this.$http
          .post(`${this.$domain_url}/domains/domain/getDomainById`, {
            domainId: data.domainId,
          })
          .then(res => {
            this.detail.refDomainId = res.data.domainId
            this.detail.refDomainCode = res.data.domainCode
            this.detail.refDomainVer = res.data.version
            this.detail.rangeType = res.data.rangeType
            this.detail.dataType = res.data.dataType
            this.detail.dataScale = res.data.dataScale
            this.detail.dataPrecision = res.data.dataPrecision
            this.detail.dataFormat = res.data.dataFormat
            this.detail.notNull = res.data.notNull
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      //  this.form.name = data.name
      //  this.form.code = data.code
    },
    dataIconFunction2(data, node) {
      let className = ''
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
    cloneDeep(propertyName) {
      if (!this.initialSet[propertyName]) {
        this.initial[propertyName] = _.cloneDeep(this[propertyName])
        this.initialSet[propertyName] = true
      }
    },
    updateScrollBar() {},
    resetFields() {
      this.$refs.form0.resetFields()
      this.$refs.form1.resetFields()
      this.$refs.form2.resetFields()
      this.$refs.form3.resetFields()
      this.refreshAdditionalProperties()
      this.collaseKey++
    },
    async innerLoadStandardDetails() {
      await HTTP.getDomainItemDetail(this.data.domainId)
        .then(res => {
          this.detailInitial = res.data
          if (this.isDerive) {
            this.data.state = 'D'
            this.data.domainId = ''
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // 导入的指标, 返回值中 没有 relationDomain 属性
      if (!this.detailInitial.relationDomain) {
        this.$set(this.detailInitial, 'relationDomain', [])
      }
      if (this.isDerive) {
        // isDerive 派生,
        // set domainId 'parentCode', remove 'domainId'
        this.detailInitial.parentCode = this.detailInitial.domainCode
      }
      /**
       * handle dims
       */
      {
        if (this.detailInitial.dimCodes) {
          const total = this.detailInitial.dimCodes.filter(i => i).length
          let cnt = 0
          this.detailInitial.dimCodes
            .filter(i => i)
            .forEach(item => {
              let catalogId = item.split('/')[0]
              let dimValue = item.split('/')[1]
              this.getDims(catalogId, _ => {
                if (_ !== false) {
                  this.dimsDisplay.add(catalogId)
                  this.allDims[catalogId].gotten = true
                  this.allDims[catalogId].values.forEach(value => {
                    if (value.dimCode === dimValue) {
                      this.allDims[catalogId].selected.push(value.dimId)
                    }
                  })
                }
                cnt++
                if (cnt === total) {
                  this.setAllDimsShow()
                  this.$forceUpdate()
                }
              })
            })
        }
      }

      this.detailInitial.referenceCode = this.detailInitial.referenceCode || ''
      // 删除第一个元素
      this.detailInitial.path.splice(0, 1)
      this.convertPath(this.options, this.detailInitial.path, [])
      if (
        this.detailInitial.additionalProperties &&
        this.detailInitial.additionalProperties.length
      ) {
        this.detailInitial.additionalProperties.forEach(e => {
          this.additionalPropertiesObj[e[0]] = e[1]
        })
      }
      this.additionalPropertiesObjInitial = _.cloneDeep(
        this.additionalPropertiesObj
      )
      this.state = this.detailInitial.state
      this.oldDomainCode = this.detailInitial.domainCode
      this.writable =
        this.detailInitial.state === 'D' ||
        this.detailInitial.state === 'X' ||
        (this.detailInitial.state === 'A' &&
          (this.data.isUpdate || this.isDerive)) ||
        !this.domainId
      // auto publish when workflow disabled
      if (!this.useWorkflow) {
        this.writable = true
        this.partWritable = [true, true, true, true, true, true]
      }
      setTimeout(() => {
        this.cancel()
      })
      if (this.detailInitial.refDomainId) {
        this.fieldState = true
        this.getDomainInheritTree()
        this.getrefDomain(this.detailInitial.refDomainId)
      }
    },
    getrefDomain(domainId) {
      this.$http
        .post(`${this.$domain_url}/domains/domain/getDomainById`, {
          domainId: domainId,
        })
        .then(res => {
          this.treeData.domainId = res.data.domainId
          this.treeData.chineseName = res.data.chineseName
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    convertPath(list = [], path, result) {
      // name transform  foldId
      if (!path) return
      /*list.forEach(e => {
        if (e.name && e.name === path[result.length]) {
          result.push(e.foldId)
          if (result.length === path.length) {
            result.splice(0, 1)
            this.selectedOptions2 = result
            this.cloneDeep('selectedOptions2')
            return
          }
        }
        if (e.nodes && e.nodes.length) {
          this.convertPath(e.nodes, path, result)
        }
      })*/
      let arr = [];
      let optionArr = [];
      list[0] &&
        list[0].nodes.forEach(t => {
          if (t.name === path[0]) {
            arr.push(t.foldId)
            optionArr.push(t)
          }
        });
      if (path.length > 1) {
        const Fn = nodeArr => {
          nodeArr.nodes.forEach(t => {
            if (path.includes(t.name)) {
              arr.push(t.foldId)
            } else {
              if (t.nodes && t.nodes.length) {
                Fn(t)
              }
            }
          })
        }
        Fn(optionArr[0])
      }

      this.selectedOptions2 = arr;
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
      } else {
        this.resetFields()
      }
      if (this.categoryTypeId === 2) {
      }
    },
    exit(isAdd) {
      if (isAdd) {
        this.$emit('back')
        // this.$bus.$emit('getremoveTab', 'createDomain' + this.columnTabArr.id)
      } else {
        this.$emit('scanCurrent')
      }
    },
    beforeSave(isUpdate) {
      if (this.$refs.relationDoc && this.$refs.relationDoc.getFileIds) {
        this.detail.documentIds = this.$refs.relationDoc.getFileIds()
      }
      /**
       * encode dims
       */
      {
        const dimCodes = []
        this.dimsDisplay.forEach(catalogId => {
          this.allDims[catalogId].selected.forEach(dimId => {
            this.allDims[catalogId].values.forEach(dim => {
              if (dimId === dim.dimId) {
                dimCodes.push(`${catalogId}/${dim.dimCode}`)
              }
            })
          })
        })
        this.detail.dimCodes = dimCodes
      }

      /* let isComplete = true
      const formArr = {
        form0: 'form0',
        form1: 'form1',
        form2: 'form2',
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
      } */
      const promises = ['form0', 'form1', 'form2', 'form3'].map(item => {
        return new Promise((resolve, reject) => {
          this.$refs[item].validate(valid => {
            if (valid) {
              resolve(true)
            } else {
              resolve(false)
            }
          })
        })
      })
      // Promise.all(promises).then(res => {
      //   if (res.filter(r => !r).length === 0) {
      if (isUpdate && !this.isDerive) {
        this.updateApply()
        return
      }
      this.save()
      // } else {
      //   console.error('表单校验不通过')
      // }
      // })
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
      let requestBody = this.handleChangeParam()
      this.submitLoading = true
      if (this.domainId && !this.isDerive) {
        // update
        let updatePro = null
        // if (this.useWorkflow) {
        updatePro = HTTP.updateDomainService(requestBody)
        // } else {
        // requestBody.state = 'A'
        // updatePro = HTTP.updateDomainService(requestBody)
        // }
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
        // create
        let createPro = null
        createPro = HTTP.createDomainService(requestBody, this.defaultPublic)
        createPro
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
      }
    },
    handleChangeParam() {
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
      return requestBody
    },
    updateApply() {
      let param = this.handleChangeParam()
      HTTP.applyChange(param)
        .then(res => {
          this.submitLoading = false
          this.$message.success(this.$t('domain.common.applicationSubmitted'))
          this.$emit('scanCurrent')
        })
        .catch(e => {
          this.submitLoading = false
          this.$showFailure(e)
        })
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
    // setDefault 用于数据分类设置默认值
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
      if (this.$refs.referenceCode && this.$refs.referenceCode.blur) {
        this.$refs.referenceCode.blur()
      }
      this.$bus.$emit('callDomainCodeSelector', this.typeIds, 'cksj')
    },
    handleDomainCodeSelected(row) {
      this.detail.referenceCode = row.code
    },
    // 切换信息类型
    changeRangeType(val) {
      if (val) {
        this.dataTypeFollowRangeType = this.typeDict[val]
      } else {
        this.dataTypeFollowRangeType = this.dataTypeGroups
      }
    },
    // 数据类型
    getDataTypeList() {
      this.getDataTypeOptionsPromise
        .then(res => {
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
          // 创建信息类型和数据类型关系字典
          let dict = {}
          this.rangeTypeOptions.forEach(r => {
            dict[r.optionValue] = []
          })
          this.dataTypeGroups.forEach(d => {
            // TODO i18n 后续处理
            switch (d.label) {
              case '整型':
              case '实数':
              case '二进制':
                dict['数值'].push(d)
                dict['代码']?.push(d)
                dict['编码']?.push(d)
                break
              case '时间':
                dict['时间'].push(d)
                dict['日期'].push(d)
                break
              case '字符串':
                dict['文本']?.push(d)
                dict['字符']?.push(d)
                dict['代码']?.push(d)
                dict['编码']?.push(d)
                break
            }
          })
          this.typeDict = dict
          /* console.log(this.rangeTypeOptions)
          console.log(this.dataTypeList)
          console.log(this.dataTypeGroups)
          console.log(this.typeDict) */
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
    showBusinessTermChoose() {
      if (
        this.$refs.referenceTermInputDom &&
        this.$refs.referenceTermInputDom.blur
      ) {
        this.$refs.referenceTermInputDom.blur()
      }
      // this.chooseTerms = this.detail.referenceTerm?.split(',') || []
      this.showChooseTermDialogVis = true
    },
    clearRelationBusinessTerm() {
      this.detail.referenceTerm = ''
    },
    closeChooseTermDialog(isOk) {
      if (isOk) {
        this.detail.referenceTerm = this.chooseTerms.join(',')
      }
      this.showChooseTermDialogVis = false
    },
    showStandardChoose() {
      if (this.$refs.relationChoose && this.$refs.relationChoose.blur) {
        this.$refs.relationChoose.blur()
      }
      this.$bus.$emit('callDomainSelector', { multiple: true, state: 'X' })
    },
    clearRelationDomain() {
      this.detail.relationDomain = []
    },
    handleStandardChoose(choose) {
      this.relatedDomainsOptions = choose
      this.detail.relationDomain = choose.map(item => item.domainCode)
    },
    getSelectionOptions() {
      this.ownerOrgOptions = this.allOrganizations || []
      this.desOrgOptions = this.allOrganizations || []
      if (!this.getRangeTypeOptionsPro) {
        this.getRangeTypeOptionsPro = Promise.resolve({
          data: [
            {
              optionValue: '字符型',
              optionLabel: '字符型',
            },
            {
              optionValue: '数值型',
              optionLabel: '数值型',
            },
            {
              optionValue: '年',
              optionLabel: '年',
            },
            {
              optionValue: '年月',
              optionLabel: '年月',
            },
            {
              optionValue: '日期型',
              optionLabel: '日期型',
            },
            {
              optionValue: '日期时间型',
              optionLabel: '日期时间型',
            },
            {
              optionValue: '时间型（time）',
              optionLabel: '时间型（time）',
            },
            {
              optionValue: '时间间隔型',
              optionLabel: '时间间隔型',
            },
            {
              optionValue: '布尔型',
              optionLabel: '布尔型',
            },
            {
              optionValue: '二进制型',
              optionLabel: '二进制型',
            },
          ],
        })
        /* if (this.useDam) {
          this.getRangeTypeOptionsPro = HTTP.getSelectionOptions({
            requestBody: {
              category: 'DOMAIN',
              names: ['值域类型'],
            },
          })
        } else {
          this.getRangeTypeOptionsPro = HTTP.getDataTypeListService()
        } */
      }
      this.getRangeTypeOptionsPro
        .then(res => {
          let data = res.data
          if (!data || !Array.isArray(data)) {
            data = []
          }
          this.rangeTypeOptions = data
          this.getDataTypeList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showSelectOrganization(show) {
      show && this.selectOrganization({})
    },
    selectOrganization(event) {
      if (event.relatedTarget && this.detail.descriptionDepartment) {
        this.desOrgOptions = null
        this.detail.descriptionDepartment = ''
      } else {
        this.$utils.branchSelect.open().then(res => {
          // this.desOrgOptions = [res]
          // this.detail.descriptionDepartment = res.bm
          this.$set(this.detail, 'descriptionDepartment', res.bm)
        })
      }
      if (this.$refs.desOrgChoose && this.$refs.desOrgChoose.blur) {
        this.$refs.desOrgChoose.blur()
      }
    },
    showSelectOwnerOrg(show) {
      show && this.selectOrganization({})
    },
    selectOwnerOrg(event) {
      if (event.relatedTarget && this.detail.ownerOrg) {
        this.detail.ownerOrg = ''
        this.ownerOrgOptions = null
      } else {
        this.$utils.branchSelect.open(false).then(res => {
          // this.ownerOrgOptions = [res]
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
          if (catalogs.indexOf(item.catalog.catalogId) === -1) {
            catalogs.push(item.catalog.catalogId)
            delete this.restDims[item.catalog.catalogId]
          }
        })
        for (const i in this.allDims) {
          const dim = this.allDims[i]
          if (catalogs.indexOf(i) !== -1) {
            this.$set(this.dimsDisplay, i, dim)
          }
        }
      }
    },
    deleteDimItem(catalogId) {
      this.dimsDisplay.delete(catalogId)
      this.setAllDimsShow()
      this.$forceUpdate()
    },
    handleAddDim(catalogId) {
      this.dimsDisplay.add(catalogId)
      this.setAllDimsShow()
      this.$forceUpdate()
      if (!this.allDims[catalogId].gotten) {
        this.getDims(catalogId)
        this.allDims[catalogId].gotten = true
      }
    },
    getDims(catalogId, callback) {
      if (this.allDims[catalogId] && this.allDims[catalogId].gotten) {
        callback()
      } else {
        this.$http
          .get('/domain/me/dims/catalogs/' + catalogId + '/dims')
          .then(res => {
            if (res.data) {
              this.allDims[catalogId].values = res.data
              if (callback) {
                callback()
              }
            } else {
              callback(false)
            }
          })
      }
    },
    refreshForm() {
      this.formKey++
    },
    addDims() {
      this.showChooseDims = true
    },
    handleUploadFile() {
      if (this.$refs.relationDoc && this.$refs.relationDoc.triggerUpload) {
        this.$refs.relationDoc.triggerUpload()
      }
    },
    handleSelectChange(val) {
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
      let arr = [
        {
          name: this.$t('domain.domain.allDomain'),
          couldClick: false,
        },
        {
          name: this.domainId
            ? this.$t('domain.domain.editDomain')
            : this.$t('domain.domain.createDomain'),
          couldClick: false,
        },
      ]
      this.$emit('setPath', arr)
    },
    setAllDimsShow() {
      const result = Object.values(this.allDims).filter(catalog => {
        return (
          !this.dimsDisplay.has(catalog.catalogId) &&
          _.toString(catalog.catalog).includes(_.toString(this.dimsKeyword))
        )
      })
      this.$utils.sort.sortConsiderChineseNumber(result, 'name')
      this.allDimsShow = result
    },
  },
  watch: {
    'detail.relationDomain': {
      handler: function (newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.relationDomainString = newVal.join(',')
        }
      },
    },
    filterText(val) {
      this.$refs.branchTree.filter(val)
    },
    chooseUrl(newVal) {
      if (!newVal) {
        if (this.selectedOptions2.length === 0) {
          this.selectedOptions2.push('')
        }
      }
    },
    dimsKeyword: {
      immediate: true,
      handler: function () {
        this.setAllDimsShow()
      },
    },
    domainId: {
      immediate: true,
      handler: function () {
        this.getPath()
      },
    },
  },
  computed: {
    rules() {
      return {
        ...this.formRule,
        dataScale: ['数值', '字符'].includes(this.detail.dataType)
          ? [
              {
                required: true,
                message: '请输入数据长度',
              },
            ]
          : [],
      }
    },
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
