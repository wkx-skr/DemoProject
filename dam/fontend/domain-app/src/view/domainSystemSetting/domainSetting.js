import HTTP from '@/http/main'
export default {
  props: {},
  beforeMount() {},
  mounted() {
    this.getList()
  },
  beforeDestroy() {},
  data() {
    return {
      activeName: 'autocode',
      formDataStandard: {},
      formDatacode: {},
      formDomainStandard: {},
      formIndex: {},
      rulesDataStandard: {
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputStart'),
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputAutoIncrement'),
            trigger: 'blur',
          },
        ],
      },
      rulesDatacode: {
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputStart'),
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputAutoIncrement'),
            trigger: 'blur',
          },
        ],
      },
      rulesDomainStandard: {
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputStart'),
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputAutoIncrement'),
            trigger: 'blur',
          },
        ],
      },
      rulesIndex: {
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputStart'),
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: this.$t('domain.codeAutoCreate.inputAutoIncrement'),
            trigger: 'blur',
          },
        ],
      },
      disabledDataStandard: true,
      disabledDatacode: true,
      disabledDomainStandard: true,
      disabledIndex: true,
    }
  },
  computed: {},
  methods: {
    fillZero(number, digits) {
      number = String(number)
      let length = number.length
      if (number.length < digits) {
        for (let i = 0; i < digits - length; i++) {
          number = '0' + number
        }
      }
      return number
    },
    handleEdit(e, type) {
      if (type === 'digitPartStandard') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formDataStandard.digitPart = value
      } else if (type === 'startValStandard') {
        // only number
        let value = e.replace(/[^\d]/g, '')
        // filter 0 at start
        value = value.replace(/^0+(\d)/, '$1')
        this.formDataStandard.startVal = value
      } else if (type === 'incStepSizeStandard') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formDataStandard.incStepSize = value
      } else if (type === 'digitPartCode') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formDatacode.digitPart = value
      } else if (type === 'startValCode') {
        // only number
        let value = e.replace(/[^\d]/g, '')
        // filter 0 at start
        value = value.replace(/^0+(\d)/, '$1')
        this.formDatacode.startVal = value
      } else if (type === 'incStepSizeCode') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formDatacode.incStepSize = value
      } else if (type === 'digitPartDomain') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formDomainStandard.digitPart = value
      } else if (type === 'startValDomain') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.formDomainStandard.startVal = value
      } else if (type === 'incStepSizeDomain') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formDomainStandard.incStepSize = value
      } else if (type === 'digitPartIndex') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formIndex.digitPart = value
      } else if (type === 'startValIndex') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.formIndex.startVal = value
      } else if (type === 'incStepSizeIndex') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formIndex.incStepSize = value
      }
    },
    handleClick() {},
    getList() {
      HTTP.getfindList()
        .then(res => {
          res.data.forEach(element => {
            if (element.domainType === 'BASIC_CODE') {
              this.formDataStandard = element
            } else if (element.domainType === 'STANDARD_CODE') {
              this.formDatacode = element
            } else if (element.domainType === 'DOMAIN_STANDARD') {
              this.formDomainStandard = element
            } else if (element.domainType === 'NORM_SYS') {
              this.formIndex = element
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveFormDataStandard() {
      this.$refs.formDataStandard.validate(valid => {
        if (valid) {
          HTTP.updateGenerate(this.formDataStandard)
            .then(res => {
              this.$message.success(this.$t('domain.common.saveSucceed'))
              this.getList()
              this.disabledDataStandard = true
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    saveFormDatacode() {
      this.$refs.formDatacode.validate(valid => {
        if (valid) {
          HTTP.updateGenerate(this.formDatacode)
            .then(res => {
              this.$message.success(this.$t('domain.common.saveSucceed'))
              this.getList()
              this.disabledDatacode = true
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    saveFormDomainStandard() {
      this.$refs.formDomainStandard.validate(valid => {
        if (valid) {
          HTTP.updateGenerate(this.formDomainStandard)
            .then(res => {
              this.$message.success(this.$t('domain.common.saveSucceed'))
              this.getList()
              this.disabledDomainStandard = true
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    saveFormIndex() {
      this.$refs.formIndex.validate(valid => {
        if (valid) {
          HTTP.updateGenerate(this.formIndex)
            .then(res => {
              this.$message.success(this.$t('domain.common.saveSucceed'))
              this.getList()
              this.disabledIndex = true
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    edit(type) {
      this.$DatablauCofirm(
        this.$t('domain.codeAutoCreate.editCodeTemplateConfirm'),
        this.$t('domain.common.tip'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          if (type === 'DataStandard') {
            this.disabledDataStandard = false
          } else if (type === 'Datacode') {
            this.disabledDatacode = false
          } else if (type === 'DomainStandard') {
            this.disabledDomainStandard = false
          } else if (type === 'Index') {
            this.disabledIndex = false
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    closeSave(type) {
      if (type === 'DataStandard') {
        this.disabledDataStandard = true
        this.$refs.formDataStandard.resetFields()
      } else if (type === 'Datacode') {
        this.disabledDatacode = true
        this.$refs.formDatacode.resetFields()
      } else if (type === 'DomainStandard') {
        this.disabledDomainStandard = true
        this.$refs.formDomainStandard.resetFields()
      } else if (type === 'Index') {
        this.disabledIndex = true
        this.$refs.formIndex.resetFields()
      }
      this.getList()
    },
  },
  watch: {},
}
