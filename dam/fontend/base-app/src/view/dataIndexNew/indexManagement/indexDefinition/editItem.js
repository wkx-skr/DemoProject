import {
  IndexType,
  IndexTypeLabel,
  IndexTypeLabelEn,
  FormatMethod,
  FormatMethodLabel,
  DefaultGraph,
  DefaultGraphLabel,
  SafeLevel,
  SafeLevelLabel,
} from './class/Enum'
import RedAlert from './redAlert.vue'
import AnalyzeAndMonitor from './analyzeAndMonitor.vue'
import version from '@/view/dataIndexNew/damComponents/newDataStandard/version.vue'
import knowledgeGraph from '@/view/dataIndexNew/damComponents/knowledgeGraph.vue'
import HeaderInformation from './headerInformation.vue'
import HTTP from '@/http/main.js'
import _, { uniqBy } from 'lodash'

import ViewDetail from './viewDetail.vue'
import Mapping from './mapping.vue'
import DataProfiling from './dataProfiling.vue'
import AccessControl from './accessControl.vue'
// import consanguinityGraph from './consanguinityGraph'
import LineageGraphEntrance from './lineageGraphEntrance.vue'
import UserInformationService from '@service/UserInformationService'
import standardSelector from '@/view/dataIndexNew/damComponents/standardSelector.vue'
import FormValidator from '@/next/class/FormValidator'
import dimSelector from './dimSelector'
import ModifierSelector from '@/view/dataIndexNew/indexManagement/indexDefinition/component/ModifierSelector.vue'
import { ModifierCategory } from '@/view/dataIndexNew/modifier/entrance/Constant'
import {
  IndexPage,
  CategoryId,
} from '@/view/dataIndexNew/indexManagement/indexDefinition/entrance/Constant'
import relationDomainList from '@/view/dataIndexNew/damComponents/newDataStandard/relationDomainList.vue'
export default {
  components: {
    RedAlert,
    AnalyzeAndMonitor,
    knowledgeGraph,
    version,
    HeaderInformation,
    ViewDetail,
    Mapping,
    DataProfiling,
    AccessControl,
    // consanguinityGraph,
    LineageGraphEntrance,
    standardSelector,
    dimSelector,
    ModifierSelector,
    relationDomainList,
  },
  props: {
    indexPage: IndexPage,
    options: {}, // 目录选项
    currentItem: {},
    editMode: {
      type: Boolean,
      default: false,
    },
    udps: {},
    allDimsTree: {},
    allDims: {},
    indexType: IndexType,
    isAssets: {}
  },
  data() {
    const folderValidator = (rule, value, callback) => {
      value = _.trim(value)
      if (!value || parseInt(value) === parseInt(this.$parent.rootFolderId)) {
        callback(new Error(this.$t('indicator.demand.notNull')))
      } else {
        callback()
      }
    }
    const validRangeValidator = (rule, value, callback) => {
      if (
        !this.currentItem &&
        new Date().getTime() - this.dateRange[0] > 24 * 3600 * 1000
      ) {
        callback(new Error(this.$t('indicator.dimension.validTimeNotBefore')))
      } else {
        callback()
      }
    }
    const udpValidator = udpId => {
      return (rule, value, callback) => {
        if (this.additionalPropertiesObj[udpId]) {
          callback()
        } else {
          callback(new Error(this.$t('indicator.demand.notNull')))
        }
      }
    }
    const relationDomainValidator = (rule, value, callback) => {
      if (value.length > 0) {
        callback()
      } else {
        callback(new Error('原子/衍生指标是必选的'))
      }
    }
    const formRules = {
      folderId: [
        {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull'),
          validator: folderValidator,
        },
        {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
          validator: folderValidator,
        },
      ],
      /* metricType: {
        required: true,
      }, */
      domainCode: {
        required: true,
        trigger: 'change',
        message: this.$t('indicator.demand.notNull'),
      },
      chineseName: {
        required: true,
        trigger: 'change',
        message: this.$t('indicator.demand.notNull'),
      },
      measureUnit: {
        required: true,
        trigger: 'change',
        message: this.$t('indicator.demand.notNull'),
      },
      /* takeEffectDate: {
        required: true,
        trigger: 'blur',
        message: this.$t('indicator.demand.notNull'),
      },
      authCategoryId: {
        required: true,
        trigger: 'blur',
        message: this.$t('indicator.demand.notNull'),
      },
      businessOwner: {
        required: true,
        trigger: 'change',
        message: this.$t('indicator.demand.notNull'),
      },
      managementOwner: {
        required: true,
        trigger: 'change',
        message: this.$t('indicator.demand.notNull'),
      }, */
      validRange: {
        trigger: 'change',
        validator: validRangeValidator,
      },
      dataScale: {
        trigger: 'change',
        validator: FormValidator.dataScaleValidator,
      },
      dataPrecision: {
        trigger: 'change',
        validator: FormValidator.dataPrecisionValidator,
      },
      rangeType: {
        trigger: 'change',
        required: false,
        message: this.$t('indicator.demand.notNull'),
      },
      relationDomain: {
        trigger: 'change',
        required: true,
        validator: relationDomainValidator,
      },
      // descriptionDepartment: {
      //   trigger: 'change',
      //   required: true,
      //   message: this.$t('indicator.demand.notNull'),
      // },
    }
    this.udps.forEach(item => {
      if (item.required) {
        formRules['udp' + item.udpId] = {
          trigger: 'change',
          required: true,
          validator: udpValidator(item.udpId),
        }
      }
    })
    return {
      activeName: 'basic',
      relationDomainIndex: null,
      formData: {
        categoryId: CategoryId[this.indexPage], // 5表示原子/衍生指标, 6表示派生指标
        folderId: this.$parent.folderId, // 所属目录
        metricType: null,
        domainCode: '',
        chineseName: '',
        englishName: '',
        abbreviation: '',
        safeLevel: SafeLevel.Normal,
        measureUnit: '%',
        dataFormat: '',
        authCategoryId: '', // 主系统，原权威系统
        synonym: '',
        description: '',
        function: '',
        takeEffectDate: '',
        expireDate: '',
        techOwner: '',
        businessOwner: '',
        managementOwner: '',
        dataType: '', // 原型图和设计图上暂时没有
        rangeType: '',
        dataScale: '',
        dataPrecision: '',
        descriptionDepartment: '',
        relationDomain: [],
        relationDimensionValues: [],
        timeModifierRefIds: [],
        modifierRefIds: [],
      },
      timeModifierRef: {
        id: null,
        type: '',
        code: '',
        name: '',
      },
      modifierRefs: [],
      detailInitial: null,
      detail: null, // 为兼容原数据标准代码
      submitLoading: false,
      formRules: formRules,
      defaultProps2: {
        value: 'foldId',
        children: 'nodes',
        label: 'name',
      },
      dateRange: [],
      permission: null,
      requirementOption: null,
      userMap: {},
      additionalPropertiesObj: {},
      additionalPropertiesObjInitial: {},
      decodeReady: false,
      getDataTypeOptionsPromise: null,
      dataTypeFollowRangeType: [],
      typeDict: null,
      dataTypeList: [],
      getRangeTypeOptionsPro: null,
      rangeTypeOptions: [],
      desOrgOptions: [],
      ownerOrgOptions: [],
      relatedDomainsOptions: [],
      dimForm: [
        {
          description: '', // 修饰词
          dimensionValues: [],
        },
      ],
      dimFormIdx: 0,
      autoCodeDisabled: null,
      autoCode: false,
      useDam: true,
      techOwnerDisplay: '',
      businessOwnerDisplay: '',
      descriptionDepartment: '',
      ownerOrg: '',
    }
  },
  watch: {
    'formData.techOwner': {
      immediate: true,
      handler() {
        if (this.formData.techOwner) {
          this.techOwnerDisplay = this.userMap[this.formData.techOwner]
        }
      },
    },
    'formData.businessOwner': {
      immediate: true,
      handler() {
        if (this.formData.businessOwner) {
          this.businessOwnerDisplay = this.userMap[this.formData.businessOwner]
        }
      },
    },
    userMap: {
      deep: true,
      handler() {
        if (this.formData.techOwner) {
          this.techOwnerDisplay = this.userMap[this.formData.techOwner]
        }
        if (this.formData.businessOwner) {
          this.businessOwnerDisplay = this.userMap[this.formData.businessOwner]
        }
      },
    },
    techOwnerDisplay: {
      handler(val, oldVal) {
        if (!val && oldVal) {
          // this.formData.techOwner = undefined
        }
      },
    },
    businessOwnerDisplay: {
      handler(val, oldVal) {
        if (!val && oldVal) {
          // this.formData.businessOwner = undefined
        }
      },
    },
  },
  beforeMount() {
    this.getDataTypeOptionsPromise = HTTP.getSelectionOptions({
      requestBody: { category: 'DOMAIN', names: ['数据类型'] },
    })
    this.getSelectionOptions()
  },
  beforeCreate() {},
  mounted() {
    // this.getRequirementData()
    this.udps.forEach(e => {
      this.$set(this.additionalPropertiesObj, e.udpId, null)
      // this.$set(this.additionalPropertiesObjInitial, e.udpId, null)
    })
    if (this.currentItem) {
      this.getPermission()
      this.getDomain(() => {
        this.detailInitial = _.cloneDeep(this.formData)
        this.decodeData()
        this.getNameByUserName()
        if (this.currentItem.descriptionDepartment) {
          HTTP.getOrgDetailByBm(this.currentItem.descriptionDepartment).then(
            res => {
              this.descriptionDepartment = res.fullName
            }
          )
        }
        if (this.currentItem.ownerOrg) {
          HTTP.getOrgDetailByBm(this.currentItem.ownerOrg).then(res => {
            this.ownerOrg = res.fullName
          })
        }
      })
    } else {
      this.formData.metricType = IndexType[this.indexType]
      this.decodeData()
    }
    this.$bus.$on('domainSelected', this.handleStandardChoose)
    this.getFindState('NORM_SYS')
  },
  beforeDestroy() {
    this.$bus.$off('domainSelected', this.handleStandardChoose)
  },
  methods: {
    autoCodeChange(value) {
      if (value === true) {
        this.formData.domainCode = null
        this.$set(this.formRules, 'domainCode', [{ required: false }])
        this.$refs.form.validateField('domainCode')
      } else {
        this.$set(this.formRules, 'domainCode', [
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
      HTTP.getfindStateNew({ domainType: value })
        .then(res => {
          this.autoCodeDisabled = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDelDim(idx, i) {
      let tempArr = this.dimForm
      tempArr[idx].dimensionValues.splice(i, 1)
      this.dimForm = tempArr
    },
    changeSel(selData) {
      /* this.dimForm[this.dimFormIdx].dimensionValues.push(...selData)
      this.dimForm[this.dimFormIdx].dimensionValues = uniqBy(
        this.dimForm[this.dimFormIdx].dimensionValues,
        'codeId'
      ) */
      this.dimForm[this.dimFormIdx].dimensionValues = selData
    },
    // 添加修饰维度值
    addDim(idx) {
      this.dimFormIdx = idx
      this.$refs.dimSelRef.openDialog()
    },
    addDimLine() {
      this.dimForm.push({
        description: '', // 修饰词
        dimensionValues: [],
      })
    },
    handleStandardChoose(rawChoose) {
      const choose = rawChoose.filter(
        i => !this.formData.relationDomain.includes(i.domainCode)
      )
      // if (choose.length === 0) {
      //   this.$datablauMessage.warning('重复选择指标')
      //   return
      // }
      choose.forEach(item => {
        this.formData.relationDomain.push(item.domainCode)
      })
    },
    getSelectionOptions() {
      if (!this.getRangeTypeOptionsPro) {
        if (this.useDam) {
          this.getRangeTypeOptionsPro = HTTP.getSelectionOptions({
            requestBody: { category: 'DOMAIN', names: ['值域类型'] },
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
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectOrganization(event) {
      if (event.relatedTarget && this.detail.descriptionDepartment) {
        this.desOrgOptions = null
        this.formData.descriptionDepartment = ''
      } else {
        this.$utils.branchSelect.open(false).then(res => {
          this.$set(this.formData, 'descriptionDepartment', res.bm)
          this.descriptionDepartment = res.fullName
        })
      }
    },
    selectOrganization1(event) {
      if (event.relatedTarget && this.detail && this.detail.ownerOrg) {
        this.desOrgOptions = null
        this.formData.ownerOrg = ''
      } else {
        this.$utils.branchSelect.open(false).then(res => {
          this.$set(this.formData, 'ownerOrg', res.bm)
          this.ownerOrg = res.fullName
        })
      }
    },
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
          if (!this.formData.rangeType) return
          this.changeRangeType(this.formData.rangeType)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 切换信息类型
    changeRangeType(val) {
      if (val) {
        this.dataTypeFollowRangeType = this.typeDict[val]
      } else {
        this.dataTypeFollowRangeType = this.dataTypeGroups
      }
    },
    showStandardChoose() {
      if (this.$refs.relationChoose && this.$refs.relationChoose.blur) {
        this.$refs.relationChoose.blur()
      }
      this.$bus.$emit('callDomainSelector', { multiple: true })
    },
    getNameByUserName() {
      const users = [
        this.formData.techOwner,
        this.formData.businessOwner,
        this.formData.managementOwner,
      ]
      UserInformationService.getUsernames(users).then(map => {
        map.forEach((item, index) => {
          this.$set(this.userMap, index, item)
        })
      })
    },
    getPermission() {
      this.$http
        .post(
          `${this.$metric_url}metricManagement/metricAuth/getPermission?metricId=${this.currentItem.domainId}`
        )
        .then(res => {
          this.permission = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTabClick() {
      if (this.activeName === 'graph') {
        setTimeout(() => {
          this.$refs.knowledgeGraph.getSearchNodeRelation()
        })
      }
    },
    getDomain(callback) {
      this.$http
        .post(`/metric/domains/domain/getDomainById`, {
          domainId: this.currentItem.domainId,
        })
        .then(res => {
          this.formData = res.data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeEventStartTime(time) {
      this.dateRange = time
    },
    back() {
      if (this.$route.query.blank) {
        window.close()
      } else {
        this.$emit('back')
      }
    },
    updateList() {
      this.$emit('update-list')
    },
    onSubmit(closeAfterSuccess) {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('indicator.dimension.formWrong'))
          return false
        } else {
          const requestBody = this.encodeData()
          this.processSubmit(requestBody, closeAfterSuccess)
        }
      })
    },
    processSubmit(requestBody, closeAfterSuccess) {
      this.submitLoading = true
      requestBody.autoGenCode = this.autoCode
      if (this.viewMode && requestBody.state === 'A') {
        this.processUpdate(requestBody, closeAfterSuccess)
      } else {
        this.processCreate(requestBody, closeAfterSuccess)
      }
    },
    processCreate(requestBody, closeAfterSuccess) {
      this.$http
        .post(
          requestBody.state === 'D'
            ? `/metric/domains/domain/updateDomain`
            : '/metric/domains/domain/createDomain',
          requestBody
        )
        .then(res => {
          this.submitLoading = false
          if (closeAfterSuccess) {
            this.back()
            this.updateList()
          }
          let text = requestBody.state === 'D' ? '修改成功' : '创建成功'
          this.$datablauMessage.success(text)
        })
        .catch(e => {
          this.submitLoading = false
          this.$showFailure(e)
        })
    },
    processUpdate(requestBody, closeAfterSuccess) {
      this.$http
        .post(`/metric/flow/domain/applyUpdate`, requestBody)
        .then(res => {
          this.submitLoading = false
          this.$message.success(this.$t('assets.common.applySuccess'))
          if (closeAfterSuccess) {
            this.back()
            this.updateList()
          }
        })
        .catch(e => {
          this.submitLoading = false
          this.$showFailure(e)
        })
    },
    // processUpdate (closeAfterSuccess) {
    //   this.detail = _.cloneDeep(this.formData)
    //   const formDefs = []
    //   try {
    //     this.detail.authCategoryName = this.$modelCategories.find(
    //       e => e.categoryId === this.detail.authCategoryId
    //     ).categoryName
    //   } catch (e) {
    //     console.log(e)
    //   }
    //   try {
    //     this.detail.descriptionDepartmentName = this.$utils.getBranchNameByBm(
    //       this.detail.descriptionDepartment
    //     )
    //   } catch (e) {
    //     console.log(e)
    //   }
    //   try {
    //     this.detail.ownerOrgName = this.$utils.getBranchNameByBm(
    //       this.detail.ownerOrg
    //     )
    //   } catch (e) {
    //     console.log(e)
    //   }
    //   if (Array.isArray(this.detail.folderId)) {
    //     this.detail.folderId =
    //       this.formData.folderId[this.formData.folderId.length - 1]
    //   }
    //   Object.keys(this.detail).forEach(e => {
    //     if (e !== 'additionalProperties') {
    //       const oldValue =
    //         typeof this.detailInitial[e] === 'object' &&
    //         this.detailInitial[e] !== null
    //           ? JSON.stringify(this.detailInitial[e])
    //           : this.detailInitial[e]
    //       let newValue =
    //         typeof this.detail[e] === 'object' && this.detail[e] !== null
    //           ? JSON.stringify(this.detail[e])
    //           : this.detail[e]
    //       if (
    //         e === 'folderId' &&
    //         typeof newValue === 'string' &&
    //         newValue.startsWith('[')
    //       ) {
    //         newValue = newValue.slice(1, -1)
    //       }
    //       if (e === 'metricType') {
    //         newValue = IndexType[newValue]
    //       }
    //       formDefs.push({
    //         code: e,
    //         value: newValue || ''
    //       })

    //       if (newValue !== oldValue) {
    //         formDefs.push({
    //           code: e + '--change',
    //           value: oldValue || ''
    //         })
    //       }
    //     }
    //   })
    //   const udp = {}
    //   const udpInitial = {}
    //   Object.keys(this.additionalPropertiesObj).forEach(e => {
    //     if (this.additionalPropertiesObj[e]) {
    //       const newValue = this.additionalPropertiesObj[e]
    //       const oldValue = this.additionalPropertiesObjInitial[e]
    //       udp[e] = newValue
    //       if (newValue !== oldValue) {
    //         udpInitial[e] = oldValue
    //       }
    //     }
    //   })
    //   let dimLine = []
    //   this.dimForm.forEach(d => {
    //     let dimValue = d.dimensionValues.map(dim => {
    //       return {
    //         codeId: dim.codeId,
    //         dimensionId: dim.dimensionId,
    //         lvlId: dim.lvlId
    //       }
    //     })
    //     let obj = {
    //       description: d.description,
    //       dimensionValues: dimValue
    //     }
    //     dimLine.push(obj)
    //   })
    //   formDefs.push({
    //     code: 'relationDimensionValues',
    //     value: JSON.stringify(dimLine)
    //   })
    //   formDefs.push({
    //     code: 'additionalProperties',
    //     value: JSON.stringify(udp)
    //   })
    //   formDefs.push({
    //     code: 'additionalProperties--change',
    //     value: JSON.stringify(udpInitial)
    //   })
    //   const para = {
    //     requestBody: {
    //       processType: '指标标准_修改',
    //       formDefs: formDefs
    //     }
    //   }
    //   HTTP.publish(para)
    //     .then(res => {
    //       this.submitLoading = false
    //       this.$message.success(this.$t('assets.common.applySuccess'))
    //       if (closeAfterSuccess) {
    //         this.back()
    //         this.updateList()
    //       }
    //       // this.$emit('scanCurrent')
    //     })
    //     .catch(e => {
    //       this.submitLoading = false
    //       this.$showFailure(e)
    //     })
    // },
    decodeData() {
      if (
        this.formData.additionalProperties &&
        Array.isArray(this.formData.additionalProperties)
      ) {
        this.formData.additionalProperties.forEach(e => {
          this.additionalPropertiesObj[e[0]] = e[1]
        })
        this.additionalPropertiesObjInitial = _.cloneDeep(
          this.additionalPropertiesObj
        )
      }
      this.formData.metricType = IndexType[this.formData.metricType]
      if (this.formData.metricType === IndexType.DERIVE) {
        if (
          !this.formData.relationDomain ||
          this.formData.relationDomain.length === 0
        ) {
          this.formData.relationDomain = []
        }
      }
      if (this.formData.takeEffectDate && this.formData.expireDate) {
        this.dateRange = [
          this.formData.takeEffectDate,
          this.formData.expireDate,
        ]
      }
      if (
        this.formData.relationDimensionValues &&
        this.formData.relationDimensionValues.length
      ) {
        this.dimForm = this.formData.relationDimensionValues
      }
      if (this.formData.modifierRefs) {
        this.modifierRefs = this.formData.modifierRefs.map(i => {
          return {
            id: i.id,
            type: i.modifierType,
            code: i.code,
            name: i.name,
          }
        })
      }
      if (this.formData.timeModifierRefs) {
        if (this.formData.timeModifierRefs.length === 1) {
          const first = this.formData.timeModifierRefs[0]
          this.timeModifierRef = {
            id: first.id,
            type: first.modifierType,
            code: first.code,
            name: first.name,
          }
        }
      }
      this.decodeReady = true
    },
    encodeData() {
      const requestBody = {}
      Object.keys(this.formData).forEach(item => {
        requestBody[item] = this.formData[item]
      })
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
      /*
      因为cascader组件的怪异行为，即使设为emitPath="false"，当值改变时仍生成一个数组，因此保存前需要修改
       */
      if (
        Array.isArray(this.formData.folderId) &&
        this.formData.folderId.length >= 1
      ) {
        requestBody.folderId =
          this.formData.folderId[this.formData.folderId.length - 1]
      }
      const node = this.$refs.cascader.DATA.getCheckedNodes()
      if (
        this.detailInitial &&
        this.detailInitial.path &&
        this.detailInitial.path[0]
      ) {
        this.formData.path = [this.detailInitial.path[0]].concat(
          node[0].pathLabels
        )
      } else {
        this.formData.path = node[0].pathLabels
      }
      this.formData.pathStr = this.formData.path.join('/')
      requestBody.metricType = IndexType[this.formData.metricType]
      if (this.dateRange && this.dateRange.length === 2) {
        requestBody.takeEffectDate = this.dateRange[0]
        requestBody.expireDate = this.dateRange[1]
        this.formData.takeEffectDate = requestBody.takeEffectDate
        this.formData.expireDate = requestBody.expireDate
      } else {
        requestBody.takeEffectDate = null
        requestBody.expireDate = null
        this.formData.takeEffectDate = null
        this.formData.expireDate = null
      }
      let dimLine = []
      this.dimForm.forEach(d => {
        let dimValue = d.dimensionValues.map(dim => {
          return {
            codeId: dim.codeId,
            dimensionId: dim.dimensionId,
            lvlId: dim.lvlId,
          }
        })
        let obj = {
          description: d.description,
          dimensionValues: dimValue,
        }
        dimLine.push(obj)
      })
      requestBody.relationDimensionValues = dimLine
      if (requestBody.relationDomain) {
        requestBody.relationDomain = requestBody.relationDomain.filter(i => i)
      }
      delete requestBody.modifierRefs
      delete requestBody.timeModifierRefs
      return requestBody
    },
    preSetTechOwner(evt) {
      if (
        evt.target &&
        evt.target.classList &&
        evt.target.classList.contains('el-input__clear')
      ) {
        evt.stopPropagation()
      } else {
        this.setOwner('techOwner')
      }
    },
    preSetBusinessOwner(evt) {
      if (
        evt.target &&
        evt.target.classList &&
        evt.target.classList.contains('el-input__clear')
      ) {
        evt.stopPropagation()
      } else {
        this.setOwner('businessOwner')
      }
    },
    setOwner(property) {
      this.$utils.staffSelect.open([], true).then(res => {
        this.$set(this.formData, property, res[0].username)
        // this.formData[property] = res[0].username
        this.getNameByUserName()
      })
    },
    // 获取需求列表
    getRequirementData() {
      let url = `${this.$metric_url}requirementmanagement/getall`
      this.$http
        .post(url)
        .then(res => {
          let data = _.cloneDeep(res.data)
          data.map(item => {
            if (item.name.length > 21) {
              item.name = item.name.slice(0, 20) + '...'
            }
          })
          this.requirementOption = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addRelationDomainItem() {
      this.formData.relationDomain.push('')
    },
    removeRelationDomainItem(idx) {
      this.formData.relationDomain.splice(idx, 1)
    },
    selectTimeModifier() {
      this.$refs.modifierSelector.callSelector(ModifierCategory.TIME_PERIOD)
    },
    clearTimeModifier() {
      this.timeModifierRef.id = null
      this.timeModifierRef.type = null
      this.timeModifierRef.code = null
      this.timeModifierRef.name = null
      this.formData.timeModifierRefIds = []
    },
    selectModifier() {
      this.$refs.modifierSelector.callSelector(ModifierCategory.BASE)
    },
    handleModifierSelected({ type, values }) {
      if (ModifierCategory[type.category] === ModifierCategory.TIME_PERIOD) {
        this.timeModifierRef.id = values[0].id
        this.timeModifierRef.type = type.name
        this.timeModifierRef.code = values[0].code
        this.timeModifierRef.name = values[0].name
        this.formData.timeModifierRefIds = [this.timeModifierRef.id]
      } else {
        values.forEach(v => {
          if (!this.formData.modifierRefIds.includes(v.id)) {
            this.modifierRefs.push({
              id: v.id,
              type: type.name,
              code: v.code,
              name: v.name,
            })
          }
        })
        this.formData.modifierRefIds = this.modifierRefs.map(i => i.id)
      }
    },
    removeModifierValue(idx) {
      this.modifierRefs.splice(idx, 1)
      this.formData.modifierRefIds.splice(idx, 1)
    },
    handleClearRelationDomainValidator() {
      this.$refs.form.clearValidate()
    },
  },
  computed: {
    fieldState() {
      return this.formData && this.formData.refDomainId
    },
    editAndUpdateMode() {
      return !!(
        this.editMode &&
        this.currentItem &&
        this.currentItem.state === 'A'
      )
    },
    IndexType() {
      const obj = {}
      Object.values(IndexType)
        .filter(i => {
          return isNaN(i)
        })
        .forEach((item, index) => {
          obj[item] = index
        })
      return obj
    },
    IndexTypeLabel() {
      if (this.$i18n.locale === 'en') {
        return IndexTypeLabelEn
      } else {
        return IndexTypeLabel
      }
    },
    FormatMethod() {
      return Object.values(FormatMethod).filter(i => {
        return !isNaN(i)
      })
    },
    FormatMethodLabel() {
      return FormatMethodLabel
    },
    DefaultGraph() {
      return Object.values(DefaultGraph).filter(i => {
        return !isNaN(i)
      })
    },
    DefaultGraphLabel() {
      return DefaultGraphLabel
    },
    SafeLevel() {
      return Object.values(SafeLevel).filter(i => {
        return !isNaN(i)
      })
    },
    SafeLevelLabel() {
      return SafeLevelLabel
    },
    viewMode() {
      return !!this.currentItem
    },
    pageName() {
      if (this.indexPage === IndexPage.BasicAndDerive) {
        return this.$t('common.page.indexDefinition')
      } else {
        return this.$t('common.page.forkIndexDefinition')
      }
    },
    nodeData() {
      if (this.viewMode) {
        let nodes = [
          {
            name: this.pageName,
            couldClick: false,
          },
        ]
        if (this.currentItem && this.currentItem.chineseName) {
          nodes = nodes.concat(
            this.currentItem.path.slice(1).map(i => {
              return {
                name: i,
                couldClick: false,
              }
            })
          )
          nodes.push({
            name: this.currentItem.chineseName,
          })
        }
        return nodes
      } else {
        return [
          {
            name: this.pageName,
            couldClick: false,
          },
          {
            name: '新增' + this.IndexTypeLabel[this.indexType],
          },
        ]
      }
    },
  },
}
