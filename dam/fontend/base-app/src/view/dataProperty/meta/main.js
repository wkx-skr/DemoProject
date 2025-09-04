import list from './list.vue'
import items from './items.vue'
import tableDetails from './tableDetails.vue'
import metaModelDetails from './metaModelDetails.vue'
import downloadTab from '../../../components/dataSource/downloadTab.vue'
import ResizeHorizontal from '../../../components/common/ResizeHorizontal'
import standardSelector from './standardSelector.vue'
import indexSelector from './indexSelector.vue'
import differenceReport from './differenceReport.vue'
import differenceReportSelf from './differenceReportSelf.vue'
import differenceReportSelfDetail from './differenceReportSelfDetail.vue'
import modelCompare from './modelCompare.vue'
import categoryDetail from './categoryDetail.vue'
import allSouce from './allSouce.vue'
import codeSelect from './codeSelect.vue'
import HistoryManager from '@service/router/HistoryManager'
import HTTP from '@/http/main'
export default {
  components: {
    list,
    items,
    tableDetails,
    metaModelDetails,
    downloadTab,
    standardSelector,
    indexSelector,
    differenceReport,
    differenceReportSelf,
    differenceReportSelfDetail,
    categoryDetail,
    modelCompare,
    allSouce,
    codeSelect,
  },
  created() {
    this.historyManager = new HistoryManager(
      this,
      'objectId',
      ['goDetail'],
      'historyGoBack',
      false
    )
  },
  mounted() {
    this.initResizeHorizontal()
    this.loadTags()
    this.$bus.$on('jumpToObject', ({ type, object }) => {
      object.type = type
      this.handleItemClickFromDetail(object)
      // $('.box-inner.selected').removeClass('selected');
    })
    this.$bus.$on('cannotJumpToObject', str => {
      this.$message.closeAll()
      this.$message.warning(str)
    })
    this.handleQuery()
    this.treeListDragCallback()
    $(window).resize(this.treeListDragCallback)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.treeListDragCallback)
    this.$bus.$off('jumpToObject')
    this.historyManager.destroy()
    this.historyManager = null
  },
  data() {
    return {
      blank: '', // 数据资产过来的，有值时为已认证，无值为未认证
      hideListFilter: false, // 隐藏列表中的更多过滤
      hideListCheckbox: false, // 隐藏列表中的chckbox
      showAllSouce: false,
      modelId: null,
      schemas: [],
      currentModel: null,

      currentObjectId: null,
      currentObject: null,
      currentObjectType: null,
      currentObjectKey: 0,

      loadedTags: [],

      showDetailStatus: 'showMetaList',
      showModelCompareBox: false,
      showModelCompare: false,
      differenceReportKey: 0,

      history: [],
      current: null,
      future: [],
      queryBlur: false,
      sourceData: null,
      sourceDataArr: null,
      modelTree: null,
      smbDataSourcMap: {},
      historyManager: null,
      backInterval: null,
      appName: HTTP.$appName,
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: function (newVal) {
        if (newVal.query.metaModelId) {
          this.modelId = newVal.query.metaModelId
          this.$nextTick(() => {
            this.$refs['meta-list'].$refs.tree2.setCurrentKey(
              newVal.query.metaModelId
            )
          })
        }
      },
    },
  },
  methods: {
    historyGoBack() {
      this.currentObject = null
      this.currentObjectId = null
      this.showAllSouce = false
      this.showDetailStatus = 'showMetaList'
    },
    goDetail() {
      let type = 'unknown'
      if (this.$route.query.type === 'FILE') {
        type = 'FILE'
      }
      if (this.$route.query.type === 'PACKAGE') {
        type = 'PACKAGE'
      }
      if (this.$route.query.type === 'META_MODEL') {
        type = 'META_MODEL'
      }
      this.handleItemClick({
        objectId: this.$route.query.objectId,
        type: type,
        blank: this.$route.query.blank,
      })
    },
    treeListDragCallback() {
      if ($('.row-filter')[0] && $('.model-btn')[0]) {
        let rightWidth = $('.row-filter')[0].clientWidth
        let rightBtnWidth = $('.model-btn')[0].clientWidth
        let finnalWidth = rightWidth - rightBtnWidth
        const hideListFilter = this.$i18n.locale === 'zh' ? 872 : 914
        const hideListCheckbox = this.$i18n.locale === 'zh' ? 795 : 827
        if (finnalWidth <= hideListFilter) {
          this.hideListFilter = true
        } else {
          this.hideListFilter = false
        }
        if (finnalWidth <= hideListCheckbox) {
          this.hideListCheckbox = true
        } else {
          this.hideListCheckbox = false
        }
      } else {
        this.hideListFilter = false
        this.hideListCheckbox = false
      }
    },
    handleTreeReady(modelTree) {
      this.modelTree = modelTree
    },
    handleQuery() {
      if (Object.keys(this.$route.query).length > 0) {
        const query = this.$route.query
        let objectId = null
        this.blank = query.blank ? query.blank : ''
        if (query.objectId) {
          objectId = query.objectId
        } else if (query.column) {
          objectId = query.column
        } else if (query.table) {
          objectId = query.table
        }
        if (objectId) {
          let type = 'unknown'
          if (query.type === 'FILE') {
            type = 'FILE'
          }
          if (query.type === 'PACKAGE') {
            type = 'PACKAGE'
          }
          if (query.type === 'META_MODEL') {
            type = 'META_MODEL'
            this.currentObjectType = 'META_MODEL'
          }
          if (this.$route.query.blank) {
            $('#main-content').css({
              left: 0,
              top: 0,
            })
            $('#page-heading').remove()
            $('#top-menu').remove()
          }
          this.handleItemClick({
            objectId: objectId,
            type: type,
            blank: this.$route.query.blank,
          })
        }

        if (!objectId) {
          if (query.damModelId) {
            const damModelId = query.damModelId
            const list = this.$refs['meta-list']
            list.showModelCompareJob && list.showModelCompareJob(damModelId)
          }
        }
      }
    },
    handleModelClick(data, map, name = null) {
      sessionStorage.removeItem('metaModelPageHistory')
      this.showAllSouce = false
      this.smbDataSourcMap = map
      this.showModelCompareBox = false
      this.showDifferenceReport = false
      if (name) {
        this.showDetailStatus = name
      }
      if (data && typeof data === 'object') {
        if (data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA') {
          // this.modelId = Number.parseInt(data.id)
          this.modelId =
            data.type === 'MODEL_SCHEMA'
              ? data.modelIds
              : [Number.parseInt(data.id)]
          this.currentModel = {
            id: this.modelId,
            name: data.joinId.split('_')[1] + ' / ' + data.name,
            schema: data.name,
            type: data.type,
            isLdmType: data.isLdmType,
          }
        } else {
          // this.modelId = data.id
          this.modelId = data.modelIds
          this.currentModel = data
        }
        this.showDetailStatus = 'showMetaList'
      } else if (data && data !== 'allSouce') {
        this.modelId = data
        this.currentModel = data
      } else if (data && data === 'allSouce') {
        this.showAllSouce = true
        this.showDetailStatus = 'showMetaList'
      } else {
        this.modelId = null
        this.currentModel = null
      }
      if (data && data.isLdmType) {
        this.$nextTick(() => {
          this.treeListDragCallback()
        })
      }
    },
    quitJob() {
      if (this.showDetailStatus === 'categoryDetail') {
        this.showModelCompareBox = false
      } else {
        $('.el-tree-node.is-current').click()
      }
    },
    skip2Job() {
      let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('metaDatasourceJob', {
        resourceId: this.sourceData.id,
        jobType: '元数据-数据源与模型差异比较与同步任务',
        blank: true,
      })
      window.open(pageUrl)
    },
    loadTags() {
      var self = this
      self.$http
        .post(self.$url + '/tags/getAllTags')
        .then(res => {
          if (res.data && res.data.length) {
            var map = {}
            res.data.forEach(item => {
              map[item.tagId] = item
            })
            var treeData = []
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                treeData.push(item)
              }
            })
            self.loadedTags = treeData
            self.tagMap = map
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {})
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.list-box'),
          middleDom: $('.meta-resize-column-middle'),
          outerDom:
            HTTP.$appName === 'DDD'
              ? $('#ddm-main-content')
              : $('#main-content'),
          rightDom: $('.meta-right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
          callback: this.treeListDragCallback,
        })
      }, 1000)
    },
    /* goBack(){
      let pop = this.history[this.history.length-1];
      while(pop.objectId === this.currentObjectId){
        pop = this.history.pop();
      }
      this.handleItemClick(pop,(cur)=>{
      });
    }, */
    goBack() {
      if (this.$refs['meta-list'].isAllSouceActive) {
        this.showAllSouce = true
      } else {
        this.showAllSouce = false
      }
      if (this.$route.query.blank && this.$route.query.blank !== 'false') {
        window.close()
      } else {
        this.currentObject = null
        this.currentObjectId = null
        if (this.currentObjectType === 'META_MODEL') {
          // 移除 query type=META_MODEL&blank=false
          let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {})
          // window.location.href = pageUrl
          this.currentObjectType = null
        }
      }
      if (this.$refs.items) {
        this.$refs.items.getData()
      }
      this.historyManager.updateRoute(null)
    },
    goNext() {
      const pop = this.future.shift()
      this.handleItemClick(pop, cur => {
        this.history.push(_.clone(this.current))
        this.current = pop
      })
    },
    handleItemClickFromDetail({ objectId, type }) {
      if (type === 'REPORT') {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl(
          'reportFormManage',
          {
            objectId: objectId,
            blank: true,
          }
        )
        window.open(pageUrl)
      } else {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
          objectId: objectId,
          blank: true,
        })
        window.open(pageUrl)
      }
    },
    handleItemClick(basicInfo, callback) {
      // console.log(basicInfo, 'basicInfo')
      if (
        (basicInfo.path && basicInfo.sharePath) ||
        basicInfo.type === 'SHARE_FILE'
      ) {
        // 文件类资产
        basicInfo = _.cloneDeep(basicInfo)
        basicInfo.fileType = basicInfo.type
        basicInfo.objectId = basicInfo.id
        basicInfo.type = 'FILE'
      }
      if (basicInfo.type === 'META_MODEL') {
        this.$router.replace({
          query: { ...this.$route.query, type: 'META_MODEL' },
        })
        this.currentObjectType = 'META_MODEL'
      }
      // console.log(basicInfo.objectId)
      let objectId = Number.parseInt(basicInfo.objectId)
      if (!basicInfo.objectId) {
        objectId = basicInfo.tableId
        basicInfo.object = objectId
      }
      this.currentObjectId = objectId
      /* if (basicInfo.type === 'FILE') {
        this.$router.push({
          query: {
            objectId: objectId,
            type: 'FILE',
            isAssets: this.$route.query.isAssets,
          },
        })
      } else {
        this.$router.push({
          query: {
            objectId: objectId,
            blank: basicInfo.blank || this.blank,
            isAssets: this.$route.query.isAssets,
          },
        })
      } */

      if (!callback) {
        // 用户正常点击页面导致的跳转，而非导航导致
        if (this.currentObject) {
          if (
            this.history.length === 0 ||
            this.currentObject.objectId !==
              this.history[this.history.length - 1].objectId
          ) {
            this.history.push(this.currentObject)
          }
        }
      } else {
        callback(basicInfo)
      }
      this.currentObject = basicInfo
      this.currentObjectType = basicInfo.type
      this.currentObjectKey++
      clearInterval(this.backInterval)
      this.backInterval = setInterval(() => {
        if (this.historyManager) {
          clearInterval(this.backInterval)
          this.historyManager.updateRoute(objectId)
        }
      }, 100)
    },
    showUpdate(data) {
      if (this.$refs['meta-list'].update) {
        this.$refs['meta-list'].update(data)
      }
    },
    showModelCompareJob(data) {
      this.showAllSouce = false
      this.sourceData = data
      this.showDetailStatus = 'difference'
      this.showModelCompareBox = true
      this.differenceReportKey++
    },
    showProductionModelCompare(data) {
      if (Array.isArray(data)) {
        this.sourceDataArr = data
        this.sourceData = null
      } else {
        this.sourceData = data
      }
      this.showAllSouce = false
      this.showDetailStatus = 'productionModelDifference'
      this.showModelCompareBox = true
    },
    showModelHistory(data) {
      this.showAllSouce = false
      this.sourceData = data
      this.showDetailStatus = 'compare'
      this.showModelCompareBox = true
      this.differenceReportKey++
    },
    showCategoryDetail(data) {
      this.showAllSouce = false
      this.sourceData = data
      this.showDetailStatus = 'categoryDetail'
      this.showModelCompareBox = true
      this.differenceReportKey++
    },
    close() {
      if (this.$refs['meta-list'].isAllSouceActive) {
        this.showAllSouce = true
      } else {
        this.showAllSouce = false
      }
      this.showDetailStatus = 'showMetaList'
      this.showModelCompareBox = false
      setTimeout(() => {
        this.treeListDragCallback()
      }, 0)
    },
    showModelExport(modelId, schemas) {
      this.showAllSouce = false
      this.modelId = modelId
      if (schemas) {
        this.schemas = schemas.map(e => e.name)
      } else {
        this.schemas = []
      }
      this.showModelCompareBox = false
      this.$nextTick(() => {
        this.showDetailStatus = 'modelExport'
      })
    },
    showModel(modelId) {
      if (this.$refs['meta-list'].isAllSouceActive) {
        this.showAllSouce = true
      } else {
        this.showAllSouce = false
      }
      this.modelId = modelId
      this.showDetailStatus = 'showMetaList'
      setTimeout(() => {
        this.treeListDragCallback()
      }, 0)
    },
  },
}
