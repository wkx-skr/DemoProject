import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import DataScope from './dataScope.vue'
import BatchScope from './batchScope.vue'
import api from '../../utils/api'
export default {
  name: 'AssetCart',
  components: { IsShowTooltip, DataScope, BatchScope },
  data() {
    return {
      loading: true,
      list: [],
      selections: [],
      showApply: false,
      applyFormData: {
        name: '',
        dept: '',
        description: '',
        reason: '',
        isUrgent: 0,
        deptName: '',
        acquisition: '',
        purpose: '',
        validity: this.$t('assets.marketplace.30days'),
        customDate: '',
        remark: '',
        appendix: '',
      },
      fileList: [],
      applyFormRules: {
        purpose: [
          {
            required: true,
            message: this.$t('assets.marketplace.purposeError'),
            trigger: 'change',
          },
        ],
        acquisition: [
          {
            required: true,
            message: this.$t('assets.marketplace.acquisitionError'),
            trigger: 'change',
          },
        ],
        validity: [
          {
            required: true,
            message: this.$t('assets.marketplace.validError'),
            trigger: 'blur',
          },
        ],
      },
      departmentList: [],
      showScopeDialog: false,
      showBatchScopeDialog: false,
      currentAsset: null,
      pageLoading: false,
      newApply: false,
      checkAll: false,
      isIndeterminate: false,
    }
  },
  mounted() {
    this.loading = false
  },
  methods: {
    hexTorgb(hex) {
      let rgb = ''
      hex = hex.replace('#', '')
      for (let i = 0; i < hex.length; i += 2) {
        rgb += parseInt(hex.slice(i, i + 2), 16) + (i < 4 ? ',' : '')
      }
      // console.log(rgb)
      return rgb
    },
    // 获取购物车的数据资产
    async getAssets() {
      try {
        this.pageLoading = true
        const res = await api.getShoppingList()
        let logicalInfoArr = []
        res.data.data.forEach(item => {
          if (item.assetType === 'TABLE') {
            logicalInfoArr.push(item.objectId)
          }
        })
        this.getLogicalInfo(logicalInfoArr)
        this.list = (res.data.data || []).map(asset => {
          let tagColor = ''
          if (asset.tagColor) {
            tagColor = this.hexTorgb(asset.tagColor)
          }
          let sensitiveColor = ''
          if (asset.sensitiveColor) {
            sensitiveColor = this.hexTorgb(asset.sensitiveColor)
          }

          return {
            ...asset,
            id: asset.id,
            securityLevel: asset.securityLevel,
            remark: asset.remark,
            sensitive: asset.sensitive,
            checked: this.selections.findIndex(s => s.id === asset.id) !== -1,
            assetsId: asset.assetId,
            assetsName: asset.name,
            dept: asset.deptName,
            system: asset.category,
            desc: asset.description,
            scope: [],
            showTooltip: false,
            showApplyTooltip: false,
            tagColor: tagColor,
            sensitiveColor,
          }
        })
        this.pageLoading = false
        this.$nextTick(() => {
          this.toggleShowScopeLength()
        })
      } catch (error) {
        this.pageLoading = false
        this.$blauShowFailure(error)
      }
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post('/metadata/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.list.forEach(element => {
            this.$set(element, 'isLogical', res.data[Number(element.objectId)])
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    toggleShowScopeLength() {
      this.$nextTick(() => {
        this.list.forEach(element => {
          const targetDom = this.$refs['scope' + element.objectId]
            ? this.$refs['scope' + element.objectId][0]
              ? this.$refs['scope' + element.objectId][0].$refs[
                  'scope' + element.objectId + 'text'
                ]
              : null
            : null
          if (targetDom) {
            element.showTooltip =
              targetDom.parentNode &&
              targetDom.parentNode.offsetWidth < targetDom.offsetWidth
          }
        })
      })
    },
    toggleShowApplyScopeLength() {
      this.$nextTick(() => {
        this.list.forEach(element => {
          if (
            this.$refs['apply-scope' + element.objectId] &&
            this.$refs['apply-scope' + element.objectId].length
          ) {
            const targetDom =
              this.$refs['apply-scope' + element.objectId][0].$refs[
                'apply-scope' + element.objectId + 'text'
              ]
            element.showApplyTooltip =
              targetDom.parentNode &&
              targetDom.parentNode.offsetWidth < targetDom.offsetWidth
          }
        })
      })
    },

    // 批量删除购物车资产
    deleteAssets() {
      api
        .deleteCartAsset(this.selections.map(i => i.id))
        .then(res => {
          if (res.status === 200) {
            this.$blauShowSuccess(this.$t('assets.marketplace.deleteSuccess'))
            this.selections = []
            this.isIndeterminate = false
            this.checkAll = false
            this.getAssets()
          } else {
            this.$blauShowFailure(this.$t('assets.marketplace.deleteFailed'))
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    // 单条删除购物车资产
    deleteAsset(asset) {
      // console.log(asset)
      api
        .deleteCartAsset([asset.id])
        .then(res => {
          if (res.status === 200) {
            const selectedIndex = this.selections.findIndex(
              s => s.id === asset.id
            )
            if (selectedIndex !== -1) {
              this.selections.splice(selectedIndex, 1)
            }
            this.$blauShowSuccess(this.$t('assets.marketplace.deleteSuccess'))
            this.getAssets()
          } else {
            this.$blauShowFailure(this.$t('assets.marketplace.deleteFailed'))
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    // 编辑单条资产
    editAsset(asset) {
      this.currentAsset = asset
      this.showScopeDialog = true
    },
    confirmDataScope() {
      this.closeDataScope()
      this.checkAll = false
      this.selections = []
      this.isIndeterminate = false
      this.getAssets()
    },
    // 关闭单条资产编辑弹窗
    closeDataScope() {
      this.currentAsset = {}
      this.showScopeDialog = false
    },
    // 批量编辑资产
    editAssets() {
      this.showBatchScopeDialog = true
    },
    // 关闭资产批量编辑弹窗
    closeBatchScope() {
      this.showBatchScopeDialog = false
    },
    confirmBatchScope() {
      this.closeBatchScope()
      this.checkAll = false
      this.selections = []
      this.isIndeterminate = false
      this.getAssets()
    },

    handleCheckAllChange(val) {
      // console.log(val)
      this.selections = val ? _.cloneDeep(this.list) : []
      this.list.forEach(i => {
        i.checked = val
      })
      this.isIndeterminate = false
    },
    // 已选中
    handleSelectionChange(asset) {
      const targetIndex = this.selections.findIndex(
        item => item.assetsId === asset.assetsId
      )
      // console.log(targetIndex)
      if (targetIndex === -1) {
        asset.checked = true
        this.selections.push(asset)
      } else {
        asset.checked = false
        this.selections.splice(targetIndex, 1)
      }
      // console.log(this.selections)
      this.checkAll = this.selections.length === this.list.length
      this.isIndeterminate =
        this.selections.length > 0 && this.selections.length < this.list.length
    },
    // 提交资产 - 申请单
    submitAssets() {
      // console.log(this.selections, this.$user)
      this.applyFormData.deptName = this.$user.orgName
      this.applyFormData.dept = this.$user.orgId
      this.applyFormData.name =
        `${this.$timeFormatter(new Date().getTime(), 'YYYYMMDDhhmmss')}- ` +
        this.$t('assets.marketplace.dataAssetApplyForm')
      this.showApply = true
      this.$nextTick(() => {
        this.toggleShowApplyScopeLength()
      })
    },
    // 上传文件
    upchange(file, fileList) {
      // console.log(file)
      if (file.status === 'success') {
        const res = file.response.data
        this.applyFormData.appendix = res.fileId
      } else {
        const MAX_SIZE = 20 * 1024 * 1024
        if (file.size > MAX_SIZE) {
          this.handleRemove()
          this.$blauShowFailure(this.$t('assets.marketplace.fileSizeError'))
          return
        }
        this.formLoading = true
        this.applyFormData.fileName = file.name
        this.fileList = fileList
        this.$refs.attachment.$refs.upload.submit()
      }
    },
    handleExceed() {
      this.$blauShowFailure(this.$t('assets.marketplace.fileExceedError'))
    },
    handleRemove(file) {
      this.fileList = []
    },
    handleClose() {
      this.fileList = []
    },
    // 选择部门
    toSelectDept() {
      this.departmentList = []
      this.$utils.branchSelect.open().then(res => {
        // console.log(res)
        this.departmentList = [res]
        this.applyFormData.dept = res.bm
        this.applyFormData.deptName = res.fullName
      })
    },
    // 提交申请单
    submitApply() {
      // console.log(this.applyFormData)
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          if (
            this.applyFormData.validity ===
              this.$t('assets.marketplace.customDate') &&
            !this.applyFormData.customDate
          ) {
            this.$blauShowFailure(
              this.$t('assets.marketplace.dataValidityError')
            )
            return
          }
          const params = {
            processTitle: this.applyFormData.name,
            timestamp: this.applyFormData.name.split('-')[0],
            bm: this.applyFormData.dept,
            getWay: this.applyFormData.acquisition,
            timeless:
              this.applyFormData.validity !==
                this.$t('assets.marketplace.long') &&
              this.applyFormData.validity !==
                this.$t('assets.marketplace.customDate')
                ? this.getTime()
                : '',
            purpose: this.applyFormData.purpose,
            remark: this.applyFormData.description,
            attachmentId: this.applyFormData.appendix,
            attachmentName: this.applyFormData.fileName,
            expirationTime:
              this.applyFormData.validity ===
                this.$t('assets.marketplace.long') ||
              this.applyFormData.validity ===
                this.$t('assets.marketplace.customDate')
                ? this.getTime()
                : '',
            reason: this.applyFormData.reason,
            urgency: Boolean(this.applyFormData.isUrgent),
            assetsCommits: this.newApply
              ? []
              : this.selections.map(asset => ({
                  cartId: asset.id,
                  remark: asset.remark,
                })),
          }
          // console.log(params)
          this.pageLoading = true
          api
            .submitShoppingList(params)
            .then(res => {
              if (res.status === 200) {
                this.$blauShowSuccess(
                  this.$t('assets.marketplace.submitSuccess')
                )
                if (
                  this.$route.query.sub &&
                  this.$route.query.sub === 'newApply'
                ) {
                  this.$router.push({
                    name: 'assetSupermarket',
                  })
                } else {
                  this.applyFormData = {
                    name: '',
                    dept: '',
                    description: '',
                    reason: '',
                    isUrgent: 0,
                    deptName: '',
                    acquisition: '',
                    purpose: '',
                    validity: this.$t('assets.marketplace.30days'),
                    customDate: '',
                    remark: '',
                    appendix: '',
                  }
                  this.fileList = []
                  this.showApply = false
                  this.selections = []
                  this.isIndeterminate = false
                  this.getAssets()
                }
              } else {
                this.$blauShowFailure(res)
              }
              this.pageLoading = false
            })
            .catch(error => {
              this.pageLoading = false
              this.$blauShowFailure(error)
            })
        }
      })
    },
    getTime() {
      let effectiveTime = null
      if (this.applyFormData.validity === this.$t('assets.marketplace.long')) {
        effectiveTime = '2099-01-01' + ' ' + '23:59:59'
      } else if (
        this.applyFormData.validity === this.$t('assets.marketplace.30days')
      ) {
        effectiveTime = 30 * 24 * 3600 * 1000
      } else if (
        this.applyFormData.validity === this.$t('assets.marketplace.60days')
      ) {
        effectiveTime = 60 * 24 * 3600 * 1000
      } else if (
        this.applyFormData.validity === this.$t('assets.marketplace.90days')
      ) {
        effectiveTime = 90 * 24 * 3600 * 1000
      } else if (
        this.applyFormData.validity ===
          this.$t('assets.marketplace.customDate') ||
        this.applyFormData.validity === 'custom'
      ) {
        effectiveTime =
          this.$timeFormatter(
            this.applyFormData.customDate.getTime(),
            'YYYY-MM-DD'
          ) +
          ' ' +
          '23:59:59'
      }
      return effectiveTime
    },

    cancelApply() {
      this.pageLoading = true
      if (this.$route.query.sub && this.$route.query.sub === 'newApply') {
        this.$router.push({
          name: 'assetSupermarket',
        })
      } else {
        this.showApply = false
        this.fileList = []
        this.applyFormData = {
          name: '',
          dept: '',
          description: '',
          reason: '',
          isUrgent: 0,
          deptName: '',
          acquisition: '',
          purpose: '',
          validity: this.$t('assets.marketplace.30days'),
          customDate: '',
          remark: '',
          appendix: '',
        }
      }
      this.pageLoading = false
    },
    // 购物车列表页的资产，跳转资产详情页
    toAssetDetails(asset) {
      if (asset.assetType === 'METAMODEL_OBJECT') {
        const url = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
          objectId: asset.objectId,
          catalogId: asset.catalogId,
          id: asset.assetsId || asset.assetId,
          type: 'META_MODEL',
          blank: true,
          from: 'market',
        })
        window.open(url)
        return
      }
      const url = this.BaseUtils.RouterUtils.getFullUrl(
        asset.assetType == 'VIEW' ? 'viewDetails' : 'tableDetails',
        {
          objectId: asset.objectId,
          catalogId: asset.catalogId,
          id: asset.assetsId || asset.assetId,
          type: asset.assetType == 'VIEW' ? 'view' : 'table',
          blank: true,
          from: 'market',
        }
      )
      window.open(url)
    },
  },
  computed: {
    couldEditData() {
      // 购物车中有元模型数据，则不能编辑
      let selections = this.selections || []
      let bool = true
      selections.forEach(item => {
        if (item.assetType === 'METAMODEL_OBJECT') {
          bool = false
        }
      })
      return bool
    },
  },
  watch: {
    $route: {
      handler() {
        this.applyFormData = {
          name: '',
          dept: '',
          description: '',
          reason: '',
          isUrgent: 0,
          deptName: '',
          acquisition: '',
          purpose: '',
          validity: this.$t('assets.marketplace.30days'),
          customDate: '',
          remark: '',
          appendix: '',
        }

        if (this.$route.query.sub === 'newApply') {
          this.newApply = true
          this.applyFormData.name = `${this.$timeFormatter(
            new Date().getTime(),
            'YYYYMMDDhhmmss'
          )}-${this.$t('assets.marketplace.dataAssetApplyForm')}`
          this.showApply = true
        } else {
          this.newApply = false
          this.checkAll = false
          this.selections = []
          this.isIndeterminate = false
          this.showApply = false
          this.getAssets()
        }
        this.$nextTick(() => {
          this.$refs.applyForm && this.$refs.applyForm.clearValidate()
        })
      },
      immediate: true,
    },
  },
}
