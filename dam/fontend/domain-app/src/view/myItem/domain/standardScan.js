import viewCode from './viewCode.vue'
import quoto from './quoto.vue'
import version from './version.vue'
import standardStatus from './standardStatus.vue'
import HTTP from '@/http/main'

export default {
  props: ['dataSummary'],
  components: { viewCode, quoto, version, standardStatus },
  data() {
    return {
      hasAccess: this.$auth.ROLE_DOMAIN_ADMIN,
      details: null,
      code: '',
      codeDialogVisible: false,
      isEditing: false,
      currentEditKey: null,
      currentEditValue: '',
      mapVisible: false,
      scrolled: false,
      udps: [],
    }
  },
  mounted() {
    if (this.dataSummary) {
      this.getUdps(() => {
        this.$nextTick(() => {
          this.details = this.dataSummary
        })
      })
      this.$nextTick(() => {
        $(this.$el).one('scroll', () => {
          this.scrolled = true
        })
      })
      this.state = this.dataSummary.state
      setTimeout(() => {
        this.initEditEventListener()
      })
    }
  },
  beforeDestroy() {
    $(this.$el).off('mousein')
    $(this.$el).off('scroll')
  },
  methods: {
    getUdps(callback) {
      this.$http
        .get(this.$url + '/service/domains/udps')
        .then(res => {
          this.udps = res.data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    openMap() {
      this.mapVisible = true
    },
    handleEdit() {
      this.$emit('editCurrent')
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
          this.$confirm(
            e.response.data.errorMessage + ', 是否强制更新该数据标准',
            '提示',
            {
              type: 'warning',
              cancelButtonText: this.$t('common.button.cancel'),
              confirmButtonText: this.$t('common.button.ok'),
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
    initEditEventListener() {
      return
      const self = this
      const createPen = parent => {
        parent.append(
          `<el-button class="el-button el-button--mini el-button--text edit-item el-icon-edit" style="position:relative;top:-6px;padding-bottom:0;">{{ $t('common.button.edit') }}</el-button>`
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
    innerLoadStandardDetails() {
      const domainId = this.data.domainId
      // this.$http
      //   .get(this.$url + '/service/domains/details/' + domainId)
      HTTP.getDomainDetailByIdService({ domainId })
        .then(res => {
          this.details = res.data
          this.$nextTick(() => {
            $(this.$el).one('scroll', () => {
              this.scrolled = true
            })
          })
          this.state = res.data.state
          setTimeout(() => {
            this.initEditEventListener()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    viewCode(code) {
      this.code = code
      this.codeDialogVisible = true
    },
    handleStateChange(state) {
      const domainId = this.data.id
      this.$http
        .put(
          this.$url +
            `/service/domains/${domainId}/states/${this.details.state}`
        )
        .then(res => {
          this.$message.success('状态切换成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  }, // End of methods,
  computed: {
    detailStateFirst() {
      const state = this.details.state
      return state === 'A' || state === 'V'
    },
    detailStateLast() {
      // 开发、废弃
      const state = this.details.state
      return state === 'D' || state === 'X'
    },
    writable() {
      return this.detailStateLast && this.hasAccess
    },
  },
}
