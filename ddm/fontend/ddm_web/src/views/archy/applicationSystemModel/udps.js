import HTTP from '@/resource/http.js'

export default {
  data () {
    return {
      formContent: {
        standard: [
          {
            name: '',
            catalog: '基本信息',
            dataType: 'String',
            candidates: null
          }
        ]
      },
      mode: 'append',
      checkIsOk: true,
      checkProps: [
        this.$version.domain.property.selectTheme,
        this.$t('domain.common.domainPropCode'),
        this.$version.domain.property.domainChName,
        this.$version.domain.property.domainEnName,
        this.$version.domain.property.domainAbbr,
        this.$version.domain.property.description,
        this.$version.domain.property.businessRule,
        this.$version.domain.property.source,
        this.$version.domain.property.synonym,
        this.$t('domain.domain.referenceDomain'),
        this.$version.domain.property.authCategoryId,
        this.$version.domain.property.relationDocuments,
        this.$version.domain.property.descriptionDepartment,
        this.$version.domain.property.ownerOrg,
        this.$version.domain.property.rangeType,
        this.$version.domain.property.dataType,
        this.$version.domain.property.dataScale,
        this.$version.domain.property.dataPrecision,
        this.$version.domain.property.dataFormat,
        this.$version.domain.property.notNull
      ],
      buildInAttrs: [
        '系统名称', '简称', '描述', '业务域', '技术部门', '业务部门', '负责人'
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
    this.checkProps.push(
      ...[
        this.$version.domain.property.referenceCode,
        this.$t('domain.domain.weatherDomainStandard'),
        this.$t('domain.domain.domainStandardType')
      ]
    )
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
        const url = `/domain/domains/exportDomainUdp?categoryId=${this.categoryTypeId}&type=1`
        this.$downloadFilePost(url)
      } else {
        const url = `/domain/domains/exportDomainUdp?categoryId=${this.categoryTypeId}&type=2`
        this.$downloadFilePost(url)
      }
    },
    exportTemplate () {
      if (this.standardCode === false) {
        const url = `/domain/domains/downloadDomainUdpTemplate?categoryId=${this.categoryTypeId}&type=1`
        this.$downloadFilePost(url)
      } else {
        const url = `/domain/domains/downloadDomainUdpTemplate?categoryId=${this.categoryTypeId}&type=2`
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
        catalog: '基本信息',
        dataType: 'String',
        candidates: null,
        required: false
      })
      if (index === this.formContent.standard.length - 2) {
        $('#vdp-container').animate({ scrollTop: 2000 }, 1000)
      }
    },
    remove (index) {
      // if (this.formContent.standard.length == 1) {
      //   //      this.formContent.standard[0].name = '';
      //   //      return;
      // }
      this.formContent.standard.splice(index, 1)
    },
    get ({ refreshDetails = false } = {}) {
      this.$http.get(`${HTTP.$archyServerUrl}system/category/udps`)
        .then(data => {
          let res = data
          if (res.data.length > 0) {
            this.formContent.standard = _.cloneDeep(res.data)
            this.formContent.standard.forEach(e => {
              {
                // 用于兼容旧数据，可以择机删除
                const map = {
                  Basic: '基本属性',
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
        .catch(e => {
          this.$showFailure(e)
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
          this.$http.post(`${HTTP.$archyServerUrl}system/category/udp?forceClear=true`, requestBody)
            .then(res => {
              this.$message.success(
                this.$t('domain.domain.updatedSuccessfully')
              )
              this.closeDialog()
              this.$emit('getUdps')
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
          // name 不能与内置属性重复
          if (this.buildInAttrs.indexOf(standard.name) > -1) {
            callback(new Error(`属性名不能与内置属性重复`))
          } else {
            callback()
          }
        } else {
          callback(new Error(this.$t('domain.domain.noUdpNameEmpty')))
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
    // action () {
    //   if (this.standardCode === false) {
    //     let url = `${HTTP.domainUdpUploadUrl()}?categoryId=${
    //       this.categoryTypeId
    //     }&type=1`
    //     return url
    //   } else {
    //     let url = `${HTTP.domainUdpUploadUrl()}?categoryId=${
    //       this.categoryTypeId
    //     }&type=2`
    //     return url
    //   }
    // },
    // isIndex () {
    //   return this.categoryTypeId === 2
    // },
    rules () {
      let obj = {
        name: [
          {
            required: true,
            // message: this.$t('domain.domain.noUdpNameEmpty'),
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
