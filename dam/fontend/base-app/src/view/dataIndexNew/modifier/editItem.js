import _ from 'lodash'
import HTTP from '@/http/main.js'
import ModifierValue from './modifierValue.vue'
import standardSelector from '@/view/dataIndexNew/damComponents/standardSelector.vue'
import { ModifierCategory, Label } from './entrance/Constant'
const URL_BASE = `${HTTP.$metric_url}modifier/`
export default {
  components: {
    ModifierValue,
    standardSelector,
  },
  props: {
    options: {}, // 目录的选项
    currentItem: {},
    editMode: Boolean,
    modifierCategory: ModifierCategory,
    udps: Array,
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
    let formData
    if (this.currentItem) {
      formData = _.cloneDeep(this.currentItem)
      if (!formData.udps) {
        formData.udps = {}
      }
    } else {
      formData = {
        catalogId: this.$parent.folderId, // required
        name: '', // required
        code: '', // required
        category: ModifierCategory[this.modifierCategory], // required
        englishName: '',
        abbrName: '',
        businessDefinition: '',
        sourceDomainId: null,
        modifierValues: [],
        udps: {},
      }
    }
    return {
      ModifierCategory: ModifierCategory,
      formData: formData,
      udpLoadedReady: false,
      sourceDomainName: '',
      formRules: {
        catalogId: [
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
        name: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        code: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
      },
      defaultProps2: {
        value: 'id',
        children: 'subNodes',
        label: 'name',
      },
      submitLoading: false,
      modifierValuesReady: true,
    }
  },
  beforeMount() {
    if (this.currentItem) {
      this.currentItem.modifierValues = []
      this.getModifierValue()
      if (this.formData.sourceDomainId) {
        this.getDomainDetailByIdService(this.formData.sourceDomainId)
      }
    }
  },
  mounted() {
    this.initEventListenerAboutDomain()
    this.initUdpValues()
  },
  beforeDestroy() {
    this.destroyEventListenerAboutDomain()
  },
  methods: {
    initUdpValues() {
      if (this.currentItem) {
        this.udps.forEach(e => {
          if (!this.formData.udps[e.id]) {
            this.$set(this.formData.udps, e.id, null)
          }
        })
      } else {
        this.udps.forEach(e => {
          this.$set(this.formData.udps, e.id, null)
        })
      }
      this.udpLoadedReady = true
    },
    getModifierValue() {
      this.$bus.$emit('modifier-value-loading', true)
      this.modifierValuesReady = false
      this.$http
        .post(URL_BASE + `getType?id=${this.currentItem.id}`)
        .then(res => {
          this.formData.modifierValues = res.data.modifierValues
          this.modifierValuesReady = true
          this.$bus.$emit('modifier-value-loading', false)
        })
    },
    back() {
      this.$emit('back')
    },
    updateList() {
      this.$emit('update-list')
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('indicator.dimension.formWrong'))
          return false
        } else {
          const requestBody = this.encodeData()
          this.processSubmit(requestBody)
        }
      })
    },
    encodeData() {
      const requestBody = {}
      Object.keys(this.formData).forEach(item => {
        requestBody[item] = this.formData[item]
      })
      if (
        Array.isArray(this.formData.catalogId) &&
        this.formData.catalogId.length >= 1
      ) {
        requestBody.catalogId =
          this.formData.catalogId[this.formData.catalogId.length - 1]
      }
      return requestBody
    },
    processSubmit(requestBody) {
      this.$http
        .post(
          URL_BASE +
            (this.viewMode ? 'updateModifierType' : 'createModifierType'),
          requestBody
        )
        .then(res => {
          this.back()
          this.updateList()
          let text = this.viewMode ? '修改成功' : '创建成功'
          this.$datablauMessage.success(text)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.submitLoading = false
        })
    },
    /*
    关于数据标准 START
     */
    selectDomain() {
      this.$bus.$emit('callDomainSelector')
    },
    initEventListenerAboutDomain() {
      this.$bus.$on('domainSelected', domain => {
        this.formData.sourceDomainId = domain.domainId
        this.sourceDomainName = domain.chineseName
        this.fillFormFromDomain(domain)
      })
    },
    fillFormFromDomain(domain) {
      /* 修饰类型 <- 中文名称
       * 英文名称 <- 英文名称
       * 英文简写 <- 英文简称
       * 业务定义 <- 业务定义 */
      this.formData.name = domain.chineseName
      this.formData.englishName = domain.englishName
      this.formData.abbrName = domain.abbreviation
      this.formData.businessDefinition = domain.description

      HTTP.getDomainDetailByIdService({ domainId: domain.domainId }).then(
        res => {
          domain.referenceCode = res.data.referenceCode
          /* 修饰词代码 <- 编码取值
           * 修饰词 <- 编码中文名称 */
          if (domain.referenceCode) {
            this.$bus.$emit('modifier-value-loading', true)
            // HTTP.getCodeContentService({
            this.$http
              .post(`${this.$domain}domains/code/getCode`, {
                categoryId: null,
                code: domain.referenceCode,
              })
              .then(res => {
                if (Array.isArray(res.data.values)) {
                  this.formData.modifierValues.length = 0
                  res.data.values.forEach(item => {
                    this.formData.modifierValues.push({
                      code: item.value,
                      name: item.name,
                      description: '',
                      modifierTypeId: this.currentItem
                        ? this.currentItem.id
                        : null,
                    })
                  })
                }
                setTimeout(() => {
                  this.$bus.$emit('modifier-value-loading', false)
                }, 1000)
              })
          }
        }
      )
    },
    destroyEventListenerAboutDomain() {
      this.$bus.$off('domainSelected')
    },
    getDomainDetailByIdService(domainId) {
      HTTP.getDomainDetailByIdService({ domainId })
        .then(res => {
          this.sourceDomainName = res.data.chineseName
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /*
    关于数据标准 END
     */
  },
  computed: {
    viewMode() {
      return !!this.currentItem
    },
    nodeData() {
      if (this.viewMode) {
        return [
          {
            name: `${this.Label.name}管理`,
            couldClick: false,
          },
          {
            name: this.currentItem.name
              ? this.currentItem.name
              : `编辑${this.Label.name}`,
          },
        ]
      } else {
        return [
          {
            name: `${this.Label.name}管理`,
            couldClick: false,
          },
          {
            name: `${this.Label.new}`,
          },
        ]
      }
    },
    Label() {
      return Label[this.modifierCategory]
    },
  },
}
