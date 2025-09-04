import HTTP from '@/resource/http'
import $ from 'jquery'
import relationDomainList from './relationDomainList.vue'
import $version from '@/resource/version.json'
import viewCode from './viewCode.vue'
export default {
  props: {
    data: {},
    domainHasComment: {},
    containID: {},
    categoryTypeId: {
      default: 1,
    },
    labelText: {
      default() {
        return {
          domainCode: '标准编码',
        }
      },
    },
    typeIds: Number,
    domainId: {
      type: [Number, String],
      default: '',
    },
    processInstanceId: {
      type: [Number, String],
      default: '',
    },
    baseDom: {},
  },
  components: {relationDomainList, viewCode},
  data() {
    return {
      udps: [],
      act: 3,
      hasAccess: this.$auth.ROLE_DOMAIN_ADMIN,
      details: {},
      code: '',
      codeDialogVisible: false,

      isEditing: false,
      currentEditKey: null,
      currentEditValue: '',
      mapVisible: false,
      scrolled: false,
      parentDomain: {},
      dimCodeStr: '',
      additionalProperties: [],
      $version,
    }
  },
  mounted() {
    if (this.$route.query.domain || this.$route.query.domainId) {
      this.innerLoadStandardDetails(
        this.$route.query.domain || this.$route.query.domainId
      )
      return
    }
    if (this.domainId) {
      this.innerLoadStandardDetails(this.domainId)
      return
    }
    if (this.data) {
      this.innerLoadStandardDetails()
    }
  },
  beforeDestroy() {
    $(this.$el).off('mousein')
    $(this.$el).off('scroll')
  },
  methods: {
    getUdpCurrent() {
      const propertiesObj = this.details.additionalProperties || []
      const finalPropertiesObj = []
      this.additionalProperties = []

      const additionPropertiesMap = new Map()
      propertiesObj.forEach(item => {
        additionPropertiesMap.set(item[0], item)
      })
      this.udps.length &&
      this.udps.forEach(item => {
        if (additionPropertiesMap.has(item.udpId)) {
          finalPropertiesObj.push(additionPropertiesMap.get(item.udpId))
        } else {
          finalPropertiesObj.push([item.udpId, ''])
        }
      })

      finalPropertiesObj.forEach(e => {
        if (this.udps.filter(item => item.udpId === parseInt(e[0])).length) {
          const obj = {
            name: this.udps.filter(item => item.udpId === parseInt(e[0]))[0]
              .name,
            value: e[1],
            catalog: this.udps.filter(item => item.udpId === parseInt(e[0]))[0]
              .catalog,
          }
          this.additionalProperties.push(obj)
        }
      })
    },
    openMap() {
      this.mapVisible = true
    },
    handleEdit() {
      this.$emit('editCurrent', this.data)
    },
    handleDerive() {
      this.$emit('handleDerive', _.cloneDeep(this.data))
    },
    handleUpdate() {
      const url =
        this.$url +
        '/service/domains/' +
        this.details.domainId +
        '/newVersion?forceCreate=false'
      this.$http
        .post(url)
        .then(res => {
          this.$emit('goToUpdate', res.data)
        })
        .catch(e => {
          this.$DatablauCofirm(
            e.response.data.errorMessage +
            ', ' +
            this.$version.domain.status.forceUpdateMessage,
            '',
            {
              type: 'warning',
            }
          )
            .then(() => {
              this.handleForceUpdate()
            })
            .catch(() => {
            })
        })
        .then(res => {
        })
    },
    handleForceUpdate() {
      const url =
        this.$url +
        '/service/domains/' +
        this.details.domainId +
        '/newVersion?forceCreate=true'
      this.$http
        .post(url)
        .then(res => {
          this.$emit('goToUpdate', res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(res => {
        })
    },
    handleSave() {
    },
    goBack() {
      this.$emit('back')
    },
    initEditEventListener() {
      return
      const self = this
      const createPen = parent => {
        parent.append(
          '<el-button class="el-button el-button--mini el-button--text edit-item el-icon-edit" style="position:relative;top:-6px;padding-bottom:0;">edit</el-button>'
        )
      }
      $(this.$el).on('mouseenter', '.detail[data-id]', function () {
        if (self.writable && !self.isEditing) {
          createPen($(this))
          self.currentEditKey = $(this).attr('data-id')
        }
      })
      $(this.$el).on('mouseleave', '.detail', function () {
        $(self.$el).find('.edit-item').remove()
      })
      $(this.$el).on('click', '.edit-item', function () {
        self.isEditing = true
        const box = $('#current-editing-box')

        const valueBox = $(this).parent().find('.value')

        box.css('left', valueBox[0].offsetLeft)
        box.css('top', valueBox[0].offsetTop)
        box.show()
        setTimeout(() => {
          const input = $('.editing-inputer input')
          self.currentEditValue = self.details[self.currentEditKey]
          input.val(self.currentEditValue)
          input.focus()
        }, 0)
        //        $(this).parent().find('.value').html(box.html());

        $(self.$el).find('.edit-item').remove()
      })
    },
    async innerLoadStandardDetails(domainId) {
      if (domainId) {
        let url = ''
        let res = null
        if (this.processInstanceId) {
          url = `/domain/flow/domain/getProcessDetail?processInstanceId=${this.processInstanceId}`
          res = await this.$http.post(url)
        } else if (this.domainId) {
          res = await this.$http.post('/domain/domains/domain/getDomainById', {
            domainId: domainId,
          })
        }
        // this.setHighlightColor()
        /* if (res.data.updatingDomainId) {
          this.$emit('base-dom', this.$el)
          this.$emit('updating-domain-id', res.data.updatingDomainId)
        } */
        this.getDomainCodesData(res.data.dimCodes)
        this.details = res.data
        this.getParentDomain()
        /* await this.$http
          // .get(this.$url + '/service/domains/details/' + domainId)
          .post('/domain/domains/domain/getDomainById', { domainId: domainId })
          .then(res => {
            this.setHighlightColor()
            /!* if (res.data.updatingDomainId) {
              this.$emit('base-dom', this.$el)
              this.$emit('updating-domain-id', res.data.updatingDomainId)
            } *!/
            this.getDomainCodesData(res.data.dimCodes)
            this.details = res.data
            this.getParentDomain()
          })
          .catch(e => {
            this.$showFailure(e)
          }) */
      } else {
        const oldData = _.cloneDeep(this.data)
        this.getDomainCodesData(oldData.dimCodes)
        this.details = oldData
        this.getParentDomain()
      }
      const getUdps = categoryId => {
        this.$http
          .post(`/domain/domains/udp/getUdps`, {categoryId})
          .then(res => {
            if (Array.isArray(res.data)) {
              this.udps = res.data
              this.getUdpCurrent()
            }
          })
      }
      getUdps(this.details.categoryId)
      this.$nextTick(() => {
        $(this.$el).one('scroll', () => {
          this.scrolled = true
        })
      })
      if (this.data) {
        this.state = this.data.state
      }
      switch (this.state) {
        case 'A':
          this.act = 3
          break
        case 'C':
          this.act = 2
          break
        case 'X':
          this.act = 4
          break
        case 'D':
          this.act = 1
          break
        default:
          break
      }
      setTimeout(() => {
        this.initEditEventListener()
      })
    },
    getDomainCodesData(dimCodes) {
      if (this.categoryTypeId !== 2) {
        return
      }
      HTTP.getDimDetailByCode({dimCodes: _.cloneDeep(dimCodes)})
        .then(res => {
          const data = res.data
          const dimCodeStr = []
          const catalogMap = {}
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              if (!catalogMap[item.catalog.catalog]) {
                catalogMap[item.catalog.catalog] = []
              }
              catalogMap[item.catalog.catalog].push(item.value)
            })
          }
          Object.keys(catalogMap).forEach(key => {
            dimCodeStr.push(
              `<strong>${key}</strong>: ${catalogMap[key].join('，')}`
            )
          })

          this.dimCodeStr = dimCodeStr.join('<br/>')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setHighlightColor() {
      const base = this.baseDom
      const current = this.$el
      if (base && current) {
        setTimeout(() => {
          const baseValues = $(base).find('.value')
          const values = $(current).find('.value')
          for (let i = 0; i < values.length; i++) {
            const item = values[i]
            if ($(item).text() !== $(baseValues[i]).text()) {
              if ($(item).parent().hasClass('detail')) {
                $(item).parent().css('background-color', '#f0f9eb')
                $(baseValues[i]).parent().css('background-color', '#fef0f0')
              } else {
                $(item).parent().parent().css('background-color', '#f0f9eb')
                $(baseValues[i])
                  .parent()
                  .parent()
                  .css('background-color', '#fef0f0')
              }
            }
          }
        })
      }
    },
    getParentDomain() {
      if (this.details.parentCode) {
        HTTP.getDomainDetailByCode([this.details.parentCode])
          .then(res => {
            const data = res.data
            if (data && Array.isArray(data) && data.length === 1) {
              this.parentDomain = res.data[0]
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    viewCode(code) {
      this.code = code
      this.codeDialogVisible = true
    },
    changeState() {
      this.$DatablauCofirm(this.$version.domain.status.abandonMessage, {
        type: 'warning',
      })
        .then(() => {
          const targetState = 'X'
          const url = `/service/domains/${this.details.domainId}/states/${targetState}`
          this.$http
            .put(this.$url + url)
            .then(res => {
              this.state = targetState
              this.$bus.$emit('reloadStandard')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$version.common.operationCancelled)
        })
    },
    /*
    @deprecated
    */
    handleStateChange(state) {
      const domainId = this.data.id
      this.$http
        .put(
          this.$url +
          `/service/domains/${domainId}/states/${this.details.state}`
        )
        .then(res => {
          this.$message.success('')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  }, // End of methods,
  watch: {
    processInstanceId: {
      handler(value) {
        if (value) {
          this.innerLoadStandardDetails(value)
          // console.log('value', value)
        }
      },
      immediate: true,
    },
  },
  computed: {
    detailStateFirst() {
      const state = this.details.state
      return state === 'A' || state === 'V'
    },
    detailStateLast() {
      const state = this.details.state
      return state === 'D'
    },
    writable() {
      return this.detailStateLast
    },
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
  },
}
