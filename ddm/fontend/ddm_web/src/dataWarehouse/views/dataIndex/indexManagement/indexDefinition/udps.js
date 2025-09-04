// import HTTP from '@/http/main.js'
import HTTP from '@/dataWarehouse/resource/http.js'
import $version from '@/resource/version.json'
export default {
  data () {
    return {
      formContent: {
        standard: [
          {
            name: '',
            catalog: this.$t('domain.domain.standardProp'),
            dataType: 'String',
            candidates: null
          }
        ]
      },
      mode: 'append',
      checkIsOk: true,
      checkProps: [
        $version.domain.property.selectTheme,
        this.$t('domain.common.domainPropCode'),
        $version.domain.property.domainChName,
        $version.domain.property.domainEnName,
        $version.domain.property.domainAbbr,
        $version.domain.property.description,
        $version.domain.property.businessRule,
        $version.domain.property.source,
        $version.domain.property.synonym,
        this.$t('domain.domain.referenceDomain'),
        $version.domain.property.authCategoryId,
        $version.domain.property.relationDocuments,
        $version.domain.property.descriptionDepartment,
        $version.domain.property.ownerOrg,
        $version.domain.property.rangeType,
        $version.domain.property.dataType,
        $version.domain.property.dataScale,
        $version.domain.property.dataPrecision,
        $version.domain.property.dataFormat,
        $version.domain.property.notNull
      ],
      contentTooltip: '',
      showUpload: true,
      fileUdp: ''
    }
  },
  props: {
    categoryTypeId: {
      default: 1
    },
    standardCode: {
      default: false
    }
  },
  mounted () {
    // deduplication
    if (this.categoryTypeId === 1) {
      this.checkProps.push(
        ...[
          $version.domain.property.referenceCode,
          this.$t('domain.domain.weatherDomainStandard'),
          this.$t('domain.domain.domainStandardType')
        ]
      )
    } else if ([2, 5, 6].includes(this.categoryTypeId)) {
      this.checkProps.push(
        ...[
          $version.domain.property.function,
          $version.domain.property.measureUnit,
          $version.domain.property.monitorObjects,
          $version.domain.property.dim
        ]
      )
    }
    if (this.categoryTypeId === 1) {
      if (this.standardCode === false) {
        this.contentTooltip = this.$t('domain.domain.udpTooltip')
      } else {
        this.contentTooltip = this.$t('domain.domain.udpTooltipCode')
      }
    } else {
      if (this.standardCode === false) {
        this.contentTooltip = this.$t('domain.domain.udpTooltipField')
      } else {
        this.contentTooltip = this.$t('domain.domain.udpTooltipFieldCode')
      }
    }
    this.get()
    document.getElementById('vdp-container').addEventListener(
      'scroll',
      () => {
        this.$refs.thisSelect.forEach(e => {
          e.blur()
        })
      },
      false
    )
  },
  methods: {
    exporttUdp () {
      if (this.standardCode === false) {
        const url = `${this.$domains}domains/exportDomainUdp?categoryId=${this.categoryTypeId}&type=1`
        this.$downloadFilePost(url)
      } else {
        const url = `${this.$domains}domains/exportDomainUdp?categoryId=${this.categoryTypeId}&type=2`
        this.$downloadFilePost(url)
      }
    },
    exportTemplate () {
      if (this.standardCode === false) {
        const url = `${this.$domains}domains/downloadDomainUdpTemplate?categoryId=${this.categoryTypeId}&type=1`
        this.$downloadFilePost(url)
      } else {
        const url = `${this.$domains}domains/downloadDomainUdpTemplate?categoryId=${this.categoryTypeId}&type=2`
        this.$downloadFilePost(url)
      }
    },
    importUdp () {
      const ref = this.$refs.importUdp
      ref.$el.click()
    },
    showBegain () {
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('domain.domain.importUdp'),
        time: 10
      })
    },
    handleUpdateMetadataSuccess (e) {
      this.$bus.$emit('changeUploadProgress', true)
      this.get()
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    handleUpdateMetadataError (err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    downloadDomains () {
      this.$emit('downloadDomains')
    },
    add (index) {
      this.formContent.standard.splice(index + 1, 0, {
        bindFolderId: 1,
        name: '',
        // category: this.formContent.standard[index].category,
        catalog: this.$t('domain.domain.standardProp'),
        dataType: 'String',
        candidates: null,
        required: false
      })
      if (index === this.formContent.standard.length - 2) {
        $('#vdp-container').animate({ scrollTop: 2000 }, 1000)
      }
    },
    remove (index) {
      if (this.formContent.standard.length === 1) {
        //      this.formContent.standard[0].name = '';
        //      return;
      }
      this.formContent.standard.splice(index, 1)
    },
    get ({ refreshDetails = false } = {}) {
      HTTP.getUpds({
        categoryId: this.categoryTypeId,
        standardCode: this.standardCode
      }).then(res => {
        let data = res
        if (data && Array.isArray(data)) {
          data = data.filter(
            item => item.bindFolderId - 0 === this.categoryTypeId - 0
          )
        } else {
          data = []
        }
        res.data = data
        if (res.data.length > 0) {
          this.formContent.standard = _.cloneDeep(res.data)
          this.formContent.standard.forEach(e => {
            {
              // 用于兼容旧数据，可以择机删除
              const map = {
                Basic: '标准属性',
                Business: '业务属性',
                Management: '管理属性',
                Technical: '技术属性'
              }
              if (Object.keys(map).includes(e.catalog)) {
                e.catalog = map[e.catalog]
              }
            }

            let candidates = e.candidates
              ? e.candidates.toString()
              : e.candidates
            this.$set(e, 'candidates', candidates)
          })
        }
        if (refreshDetails) {
          this.$refs.standardDetail.innerLoadStandardDetails()
        }
      })
    },
    dangerSubmit () {
      this.$DatablauCofirm(
        this.$t('domain.domain.submitConfirm'),
        this.$t('domain.common.warning'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          this.submit()
        })
        .catch(() => {
          this.$message.info(this.$t('domain.domain.uncommitted'))
        })
    },
    beforeSubmit () {
      if (this.checkIsOk) {
        this.submit()
      }
    },
    submit () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const requestBody = []
          const allData = _.cloneDeep(this.formContent.standard)
          allData.forEach((item, index) => {
            item.order = index
            requestBody.push(item)
          })
          requestBody.forEach(e => {
            if (
              typeof e.candidates === 'string' &&
              e.candidates.includes(',')
            ) {
              e.candidates = e.candidates.split(',')
            } else if (
              typeof e.candidates === 'string' &&
              e.candidates.includes('，')
            ) {
              e.candidates = e.candidates.split('，')
            } else if (typeof e.candidates === 'string') {
              e.candidates = e.candidates.split(',')
            }
          })
          // let requestUrl = this.$damUrl + '/service/domains/udps'
          // requestUrl += `?clear=true&categoryId=${this.categoryTypeId}`
          // this.$http
          //   .post(requestUrl, requestBody)
          HTTP.setDomainUdpsService({
            categoryTypeId: this.categoryTypeId,
            requestBody,
            standardCode: this.standardCode
          })
            .then(res => {
              this.$message.success(
                this.$t('domain.domain.updatedSuccessfully')
              )
              this.closeDialog()
              this.$emit('getUdps')
              if (this.categoryTypeId === 1 || this.categoryTypeId > 4) {
                this.$bus.$emit('getUdpsKey')
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    closeDialog () {
      // this.$parent.$parent.showUdps = false
      this.$emit('closeUdpDialog')
    },
    checkName (row, index) {
      if (
        this.formContent.standard.filter(e => e.name === row.name).length > 1 ||
        (!this.standardCode &&
          this.checkProps.filter(c => c === row.name).length > 0)
      ) {
        this.checkIsOk = false
        this.$message.error(
          this.$t('domain.domain.duplicateUdpName', { name: row.name })
        )
        setTimeout(() => {
          row.name = ''
          this.$refs.ruleForm.validateField('name' + index)
        }, 1000)
      } else {
        this.checkIsOk = true
      }
    },
    validator (rule, value, callback) {
      if (rule.field && rule.field.indexOf('name') === 0) {
        let updIndex = rule.field.replace('name', '')
        let standard = this.formContent.standard[updIndex]
        if (standard.name) {
          callback()
        } else {
          callback(new Error(rule.message))
        }
      }
      if (rule.field && rule.field.indexOf('candidates') === 0) {
        let updIndex = rule.field.replace('candidates', '')
        let standard = this.formContent.standard[updIndex]
        if (standard.dataType !== 'List' || standard.candidates) {
          callback()
        } else {
          callback(new Error(rule.message))
        }
      }
    }
  },
  computed: {
    action () {
      if (this.standardCode === false) {
        let url = `${HTTP.domainUdpUploadUrl()}?categoryId=${
          this.categoryTypeId
        }&type=1`
        return url
      } else {
        let url = `${HTTP.domainUdpUploadUrl()}?categoryId=${
          this.categoryTypeId
        }&type=2`
        return url
      }
    },
    isIndex () {
      return this.categoryTypeId === 2
    },
    rules () {
      let obj = {
        name: [
          {
            required: true,
            message: this.$t('domain.domain.noUdpNameEmpty'),
            trigger: 'blur',
            validator: this.validator
          }
        ],
        candidates: [
          {
            required: true,
            message: this.$t('domain.domain.noUdpEnumEmpty'),
            trigger: 'blur',
            validator: this.validator
          }
        ]
      }
      let newObj = {}
      this.formContent.standard.forEach((item, index) => {
        newObj['name' + index] = obj.name
        newObj['candidates' + index] = obj.candidates
      })
      return newObj
    },
    titleTooltip () {
      if ([5, 6].includes(this.categoryTypeId)) {
        return this.$t('domain.domain.udpTooltip').replace(
          '数据标准',
          '数据指标'
        )
      } else {
        return this.contentTooltip
      }
    }
  }
}
