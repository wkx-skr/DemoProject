import HTTP from '@/http/main.js'
import viewCode from './viewCode.vue'
import quoto from './quoto.vue'
import version from './version.vue'
import standardStatus from './standardStatus.vue'
import relationDomainList from './relationDomainList.vue'
import relationDoc from './relationDoc.vue'
import UserTop from '@/components/userTop/userTop.vue'
import knowledgeGraph from '../dataProperty/meta/knowledgeGraph.vue'
import comment from '@/components/commentComponents/comment.vue'
import whiteList from '../dataProperty/meta/whiteList'
import LabelTooltipService from '@service/LabelTooltipService'

export default {
  props: {
    data: {},
    udps: {},
    domainHasComment: {},
    containID: {},
    categoryTypeId: {
      default: 1,
    },
    labelText: {
      default() {
        return {}
      },
    },
    typeIds: Number,
    domainId: {},
    hideHeader: {
      type: Boolean,
      default: false,
    },
    dataSecurity: {
      type: Boolean,
      default: false,
    },
    useWorkflow: {
      type: Boolean,
      default: true,
    },
    useDam: {
      type: Boolean,
      default: true,
    },
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
    hideDerive: {
      type: Boolean,
      default: false,
    },
    isAnquan: {
      type: Boolean,
      default: false,
    },
    isZichan: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    viewCode,
    quoto,
    version,
    standardStatus,
    relationDomainList,
    relationDoc,
    knowledgeGraph,
    comment,
    UserTop,
    whiteList,
  },
  data() {
    return {
      nodeData: [],
      act: 0,
      hasAccess: this.$auth.ROLE_DOMAIN_ADMIN,
      details: {},
      detailsLoaded: false,
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
      activeName: this.dataSecurity ? 'whitelist' : 'first',
      summary: {},
      summaryLoaded: false,
      visit: 0,
      propArr: [],
      vote: 0,
      parentDomainObj: {},
      blank: '',
      tagsTreeArr: [],
    }
  },
  beforeDestroy() {
    $(this.$el).off('mousein')
    $(this.$el).off('scroll')
    const query = this.$route.query
    if (query.domain) {
      const newQuery = _.omit(query, 'domain')
      this.$router.replace({ query: newQuery })
    }
  },
  inject: ['headerProduction'],
  mounted() {
    const query = this.$route.query
    this.blank = query.blank ? query.blank : ''
    if (this.headerProduction.toUpperCase() === 'DAM') {
      this.getTags()
    }
  },
  methods: {
    handleClose(tag) {
      // let obj = {
      //   id: this.details.domainId,
      //   typeId: 80010066,
      //   tagIds: [tag.tagId.toString()],
      // }
      this.$http
        .post(
          this.$url +
            `/service/entities/${this.details.domainId}/tags/delete?typeId=80010066`,
          [
            {
              name: tag.name,
            },
          ]
        )
        .then(res => {
          this.$message.success('删除成功')
          this.getTags()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTags() {
      this.currentTag = []
      this.$http
        .post(
          this.$domain_url + `/tag/tags/get?itemId=${this.details.domainId}`
        )
        .then(res => {
          this.tagsTreeArr = res.data
          res.data.forEach(element => {
            this.currentTag.push(element.tagId.toString())
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    beforeAddTag() {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.selectTag(keys)
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag,
        single: true,
        security: false,
      })
    },
    selectTag(list) {
      let obj = {
        id: this.details.domainId,
        typeId: 80010066,
        tagIds: list,
      }
      this.$http
        .post(this.$url + `/service/entities/tags/select`, obj)
        .then(res => {
          this.$message.success('添加成功')
          this.getTags()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    goParentDomain() {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl + `main/domainStandard?field=${this.parentDomainObj.domainId}`
      )
    },
    getParentDomainName(domainId) {
      this.$http
        .post(`/domain/domains/domain/getDomainById`, {
          domainId: domainId,
        })
        .then(res => {
          this.parentDomainObj = res.data
          return (this.details.parentDomainName = res.data.chineseName)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initData() {
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
      if (this.data && !this.detailsLoaded) {
        this.detailsLoaded = true
        this.innerLoadStandardDetails(this.data.domainId)
      }
    },
    getNode() {
      this.nodeData = []
      if (this.isAnquan) {
        this.nodeData.push(
          {
            name: this.$t('domain.domain.dataClassification'),
            couldClick: false,
          },
          {
            name: this.details.chineseName,
            couldClick: false,
          }
        )
      } else if (this.isZichan) {
        this.nodeData.push(
          {
            name: this.$t('common.page.businessCatalog'),
            couldClick: false,
          },
          {
            name: this.details.chineseName,
            couldClick: false,
          }
        )
      } else {
        this.data.path &&
          this.data.path.map((item, index) => {
            const obj = {
              name: item,
              level: index + 1,
              couldClick: false,
            }
            this.nodeData.push(obj)
          })
      }
      this.$emit('setPath', this.nodeData)
    },
    updateRate() {
      this.getDomainVote(this.details.domainId)
    },
    handleClick(value) {
      if (value.name === 'third') {
        this.$refs.knowledgeGraph.getSearchNodeRelation()
      }
    },
    getDomainVote(id) {
      if (!this.useDam) return
      HTTP.getDomainVote(id)
        .then(res => {
          this.vote = res.data
        })
        .catch(err => {
          console.error(err)
        })
    },
    getProp() {
      this.$http
        .get(
          this.$url + `/service/entities/${this.details.domainId}/summary/prop`
        )
        .then(res => {
          this.propArr = res.data
        })
        .catch(e => {
          console.error(e)
          this.$showFailure(e)
        })
    },
    getVisit() {
      if (!this.useDam) return
      this.$http
        .get(
          `${this.$url}/service/browse/click/count/${this.details.domainId}/80010066`
        )
        .then(res => {
          this.visit = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUdpCurrent() {
      const propertiesObj = this.details.additionalProperties || []
      this.additionalProperties = []
      propertiesObj.forEach(e => {
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
            .catch(() => {})
        })
        .then(res => {})
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
        .then(res => {})
    },
    handleSave() {},
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
    replaceLongLabel() {
      LabelTooltipService.basicTitle(this.$el, 'label')
    },
    async innerLoadStandardDetails(domainId) {
      if (domainId) {
        const callback = data => {
          if (data.dimCodes) {
            this.getDomainCodesData(data.dimCodes)
          }
          !this.nodeData.length &&
            data.path &&
            data.path.map((item, index) => {
              const obj = {
                name: item,
                level: index + 1,
                couldClick: false,
              }
              this.nodeData.push(obj)
              this.$emit('setPath', this.nodeData)
            })
          this.details = data
          this.replaceLongLabel()
          this.getParentDomain()
          this.getVisit()
          this.getDomainVote(domainId)
          if (this.details.refDomainId) {
            this.getParentDomainName(this.details.refDomainId)
          }
          this.getUdpCurrent()
          if (data && data.folderId) {
            this.$emit('setFolderId', data.folderId)
          }
          if (domainId) {
            this.state = this.details.state
          } else {
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
              this.act = 0
              break
          }
        }
        HTTP.getDomainItemDetail(domainId)
          .then(res => {
            callback(res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      this.$nextTick(() => {
        $(this.$el).one('scroll', () => {
          this.scrolled = true
        })
      })
      setTimeout(() => {
        this.initEditEventListener()
      })
    },
    getDomainCodesData(dimCodes) {
      if (this.categoryTypeId !== 2) {
        return
      }
      HTTP.getDimDetailByCode({ dimCodes: _.cloneDeep(dimCodes) })
        .then(res => {
          // console.log(res.data)
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
  computed: {
    getData() {
      // can't get data when network bad
      if (this.data) {
        this.initData()
        // this.getNode()
        return true
      } else {
        return false
      }
    },
    getStatusColor() {
      const act = this.act
      if (act === 0) {
        return '#AFB4BF'
      }
      if (act === 1) {
        return '#F79B3F'
      }
      if (act === 2) {
        return '#4386F5'
      }
      if (act === 3) {
        return '#5CB793'
      }
      if (act === 4) {
        return '#AFB4BF'
      }
    },
    getStatusText() {
      const act = this.act
      if (act === 0) {
        return this.$t('domain.domain.getData')
      }
      if (act === 1) {
        return this.$t('domain.common.pendingReview')
      }
      if (act === 2) {
        return this.$t('domain.common.underReview')
      }
      if (act === 3) {
        return this.$t('domain.common.published')
      }
      if (act === 4) {
        return this.$t('domain.common.obsolete')
      }
    },
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
