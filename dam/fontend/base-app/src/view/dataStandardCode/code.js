import editCodeDetail from './editCodeDetailSummary.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import codeHistory from './codeHistory.vue'
import domainReference from './domainReference.vue'
import treeCatalogue from './tree.vue'
import referCol from './referCol.vue'
import codeDetailTab from './codeDetailTab.vue'
import metaQuote from './metaQuote.vue'
import codeList from './list.vue'
import udps from '../newDataStandard/udps.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal.js'
import HTTP from '@/http/main'

export default {
  components: {
    spanWithTooltip,
    editCodeDetail,
    codeHistory,
    domainReference,
    treeCatalogue,
    referCol,
    codeDetailTab,
    codeList,
    udps,
    metaQuote,
  },
  data() {
    return {
      udps: [],
      showUdps: false,
      hasAccess: this.$auth.ROLE_DOMAIN_ADMIN,
      uploadHost: '',
      codeClass: 'com.datablau.service.dto.CodeDto',
      hasData: false,
      datasetNameArr: [],
      currentCodeData: {},
      allNodesArr: [],
      /* left tree */
      codeMap: {},
      catalogmap: {},
      treeData: {},

      /* right part (details) */
      currentTab: 'list',
      catalogContentList: [],
      editTabArr: [],
      details: {
        code: '',
        name: '',
      },
      timer: null,
      datasetName: '',
      emptyCode: {
        definition: '',
        definition2: '',
        definition3: '',
        enName: '',
        name: '',
        order: 0,
        parentValue: '',
        value: '',
      },
      uploading: false,
      /* drag */
      drag: {
        start: 0,
        startTime: 0,
        startWidth: 0,
        mousedown: false,
        end: 0,
        offset: 0,
        windowOffset: 0,
      },
      dialogIEUploadVisible: false,
      childrenMap: {},
      currentCatalog: '',
      currentCodeName: '',
      nodeData: [],
      currentData: {},

      // detail tab
      detailData: {},
      currentDetailTab: 'codeData',
      refDomainCount: 0,
      refColCount: 0,
      isUploadPublishedStandard: false,
      uploadDialogVisible: false,
      autoCode: false,
      accept: '.xlsx',
      autoCodeDisabled: null,
      formFile: [],
      blank: '', // 是否从新的数据资产页面点进来详情的；认证状态判断的不一样
    }
  },
  inject: ['headerProduction'],

  computed: {
    treeDelBatch() {
      return !this.rightTreeSelected || this.rightTreeSelected.length === 0
    },
    gszcCustomer() {
      return this.$customerId === 'gszc'
    },
    useWorkflow() {
      return (
        this.$workflowStatus &&
        this.$workflowStatus.workflow_enable &&
        this.$workflowStatus.workflow_domain_enable &&
        this.typeIds < 4
      )
    },
    useDam() {
      return this.headerProduction && this.headerProduction === 'dam'
    },
    useDdm() {
      return this.headerProduction && this.headerProduction === 'ddm'
    },
    standardUploadUrl() {
      let url = `${HTTP.codeUploadUrl()}?categoryId=${
        this.typeIds
      }&autoGenCode=${this.autoCode}`
      if (this.isUploadPublishedStandard) {
        url += '&published=true'
      }
      return url
    },
  },
  props: {
    typeIds: {
      type: [Number, String],
      default: 1,
    },
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
  },
  created() {
    if (this.typeIds !== 1) {
      this.uploadHost = `${HTTP.codeUploadUrl()}?categoryId=${this.typeIds}`
    }
    this.getUdps()
  },
  mounted() {
    const query = this.$route.query
    this.blank = query.blank ? query.blank : ''
    if (this.blank) {
      $('#main-content').css('left', 0)
    }
    this.initResizeHorizontal()

    // console.log(this.useWorkflow, 'useWorkflow')
  },
  beforeDestroy() {
    // $(document).unbind('mouseup', this.handleDragEnd)
  },
  methods: {
    getUdps() {
      HTTP.getUpds({ categoryId: this.typeIds, standardCode: true })
        .then(res => {
          let data = res.data
          if (data && Array.isArray(data)) {
            data = data.filter(
              item => item.bindFolderId - 0 === this.typeIds - 0
            )
          } else {
            data = []
          }
          this.udps = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    onChange(e) {
      this.formFile.push(e)
    },
    beforeRemove(e) {
      this.formFile = []
    },
    handleShowHistory(details) {
      const tab = {
        name: 'history',
        label: this.$t('domain.code.historyTab'),
        type: 'history',
        data: details,
      }
      this.addTab(tab)
    },
    handleShowColRef(details) {
      const tab = {
        name: 'referCol',
        label: this.$t('domain.code.fieldReferenceCode', {
          name: details.name,
        }),
        type: 'referCol',
        data: details,
      }
      this.addTab(tab)
    },
    handleShowDomRef(details) {
      const tab = {
        name: 'domainReference',
        label: this.$t('domain.code.domainReferenceCode', {
          name: details.name,
        }),
        type: 'domainReference',
        data: details,
      }
      this.addTab(tab)
    },
    handleShowMetaQuote() {
      const tab = {
        name: 'metaQuote',
        label: this.$t('domain.code.historyTab'),
        type: 'MetaQuote',
        data: details,
      }
      this.addTab(tab)
    },
    addTab(tab) {
      const index = this.editTabArr.findIndex(item => {
        return item.name === tab.name
      })
      if (index === -1) {
        this.editTabArr.push(tab)
      }
      this.currentTab = tab.name
    },
    // handleResize() {
    //   this.callDetailComMethod('handleResize')
    // },
    handleTabRemove(tabName) {
      this.currentTab = 'list'
      this.$router
        .replace({ query: { code: '', isAssets: this.$route.query.isAssets } })
        .catch(err => {
          console.error(err)
        })
    },
    handleNodeClick(data) {
      if (data.type) {
        if (this.$route.query.code && data.type === 'root') {
        } else {
          this.$router.push({
            path: this.$route.path,
          })
        }
        this.currentCatalog = data.name
        this.currentTab = 'list'
        setTimeout(() => {
          this.$refs.codeList.resetData()
        })
      } else {
        this.$router.push({
          path: this.$route.path,
          query: {
            code: data.realCode,
            blank: this.blank,
            isAssets: this.$route.query.isAssets,
          },
        })
        this.currentTab = 'details'
        this.currentCodeName = data.name
        this.detailData = data
        setTimeout(() => {
          this.$refs.codeDetailTab.getCodeDetail()
        })
      }
    },
    // callDetailComMethod(methodName) {
    //   if (this.$refs.codeDetailTab && this.$refs.codeDetailTab[methodName]) {
    //     this.$refs.codeDetailTab[methodName]()
    //   }
    // },
    // TODO:
    standardImportAction() {
      this.uploadDialogVisible = false
      // if (this.typeIds === 1) {
      this.$refs.standardCodeImport.$refs.upload.submit()
      this.autoCode = false
      // } else {
      //   if (
      //     this.$refs.standardCodeImport &&
      //     this.$refs.standardCodeImport.$slots.default &&
      //     this.$refs.standardCodeImport.$slots.default[0] &&
      //     this.$refs.standardCodeImport.$slots.default[0].elm
      //   ) {
      //     if (!this.uploading) {
      //       this.$refs.standardCodeImport.$slots.default[0].elm.click()
      //     } else {
      //       this.$message.warning('正在导入中，请稍候')
      //     }
      //   }
      // }
    },
    elRadioSelect(state, auth) {
      // if (this.typeIds === 1) {
      if (this.$auth.STANDARD_CODE_IMPORT_DIRECT) {
        this.isUploadPublishedStandard = state
      }
      // }
    },
    uploadCodeFile() {
      // if (this.typeIds === 1) {
      this.formFile = []
      this.uploadDialogVisible = true
      // } else {
      //   if (
      //     this.$refs.standardCodeImport &&
      //     this.$refs.standardCodeImport.$slots.default &&
      //     this.$refs.standardCodeImport.$slots.default[0] &&
      //     this.$refs.standardCodeImport.$slots.default[0].elm
      //   ) {
      //     if (!this.uploading) {
      //       this.$refs.standardCodeImport.$slots.default[0].elm.click()
      //     } else {
      //       this.$message.warning('正在导入中，请稍候')
      //     }
      //   }
      // }
    },
    freshCode() {
      this.handleTabRemove('details')
      this.getCodes()
    },
    setPath(path) {
      this.nodeData = path
    },
    handleEditNode(type, row) {
      let nodeData = []
      if (row && row.datasetName) {
        nodeData.push(row.datasetName)
      }
      if (row && row.code) {
        nodeData.push(row.code)
      }
      if (type === 'add') {
        const obj = {
          type: 'code',
          label: this.$t('domain.code.addCode'),
          name: 'addCode',
        }
        this.currentData = obj
        this.currentTab = 'editCode'
        nodeData.push(this.$t('domain.code.addCode'))
      } else if (type === 'edit') {
        const obj = {
          oldData: row,
          name: row.code,
          label: row.name,
          type: 'code',
        }
        this.currentData = obj
        this.currentTab = 'editCode'
      }
      this.nodeData = nodeData
    },
    // edit table data
    addCode() {
      const index = this.editTabArr.findIndex(item => {
        return item.name === 'add'
      })
      if (index === -1) {
        const obj = {
          name: 'add',
          label: this.$t('domain.code.addValue'),
          type: 'value',
        }
        this.editTabArr.push(obj)
      }
      this.currentTab = 'add'
    },

    editSucess(data) {
      this.$refs.treeCatalog && this.$refs.treeCatalog.keywordChange()
    },
    handleUploadSuccess() {
      this.uploading = false
      this.$message.closeAll()
      this.$message({
        title: this.$t('domain.code.success'),
        message: this.$t('domain.code.importSuccessful'),
        type: 'success',
        showClose: true,
      })
      this.$bus.$emit('changeUploadProgress', true)
      this.getCodes()
    },
    handleUploadError(e) {
      this.uploading = false
      this.$message.closeAll()
      this.$showUploadFailure(e)
      this.$bus.$emit('changeUploadProgress', false)
    },

    showBegain() {
      this.uploading = true
      this.$message.info({
        message: this.$t('domain.code.uploading'),
        duration: 0,
        showClose: true,
      })
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('domain.code.importCode'),
        time: 10,
      })
    },
    codeownload() {
      const url = HTTP.codeTemplateDownloadUrl(this.typeIds)
      this.$downloadFilePost(url)
    },
    codeFildDownload() {
      // const url = this.$url + '/service/domains/code/export'
      const url = HTTP.codeExportUrl(this.typeIds)
      this.$downloadFilePost(url)
    },
    openUdp() {
      this.showUdps = true
    },

    handleIEUpload() {
      this.dialogIEUploadVisible = false
      setTimeout(() => {
        this.handleUploadSuccess()
      }, 3000)
    },

    getCodes() {
      // refreshData
      setTimeout(() => {
        this.$refs.treeCatalog && this.$refs.treeCatalog.keywordChange()
      })
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal(
          $('.tree-area'),
          $('.content-area'),
          $('.tree-area-margin-right'),
          $('.standard-code-page'),
          0,
          this.treeListDragCallback,
          { leftMinWidth: 240 },
          true
        )
      }, 1000)
    },
    treeListDragCallback() {},
    backToFolder() {
      if (this.blank) {
        window.close()
      } else {
        this.currentTab = 'list'
      }
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.backToFolder()
      }
    },
    handleEdit(notUpdated) {
      if (!notUpdated) {
        this.detailData.isUpdate = true
      }
      this.handleEditNode('edit', this.detailData)
    },
    handlePublish(typeName) {
      if (this.$refs.codeDetailTab && this.$refs.codeDetailTab.toPublish) {
        this.$refs.codeDetailTab.toPublish(typeName)
      }
    },
    handleAbandon(typeName) {
      if (this.$refs.codeDetailTab && this.$refs.codeDetailTab.toAbandon) {
        this.$refs.codeDetailTab.toAbandon(typeName)
      }
    },
    handleDelete() {
      if (
        this.$refs.codeDetailTab &&
        this.$refs.codeDetailTab.handleDeleteCode
      ) {
        this.$refs.codeDetailTab.handleDeleteCode()
      }
    },
    getDomainCount(count) {
      this.refDomainCount = count
    },
    getColCount(count) {
      this.refColCount = count
    },
    getDetailData(data) {
      this.detailData = data
    },
    handleAddCode() {
      if (this.$refs.treeCatalog && this.$refs.treeCatalog.add) {
        this.$refs.treeCatalog.add()
      }
    },
    getFindState() {
      HTTP.getfindState({ domainType: 'STANDARD_CODE' })
        .then(res => {
          this.autoCodeDisabled = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    uploadDialogVisible(value) {
      // if (this.typeIds === 1) {
      if (value === true) {
        this.getFindState()
      }
      if (value === true && this.$refs.standardCodeImport) {
        this.isUploadPublishedStandard = false
        this.$refs.standardCodeImport.$refs.upload.clearFiles()
      }
      // }
    },
    currentTab(newVal) {
      const type = this.$route.query.type
      if (
        (!this.editTabArr || this.editTabArr.length === 0) &&
        type !== 'code'
      ) {
      }
      if (newVal === 'list') {
        this.$router.replace({ query: {} }).catch(err => {
          console.error(err)
        })
        this.$refs.treeCatalog.changeCurrentDatasetName('')
      }
    },
  },
  provide() {
    return {
      // categoryId: Vue.computed(() => this.typeIds),
      categoryId: this.typeIds,
    }
  },
  filters: {},
}
