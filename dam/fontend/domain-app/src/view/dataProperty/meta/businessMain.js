import businessList from './businessList.vue'
import items from './businessItems.vue'
import tableDetails from './tableDetails.vue'
import ResizeHorizontal from '../../../components/common/ResizeHorizontal'
import standardSelector from './standardSelector.vue'
import indexSelector from './indexSelector.vue'
import scan from '../../../view/newDataStandard/standardScan.vue'
import accessControl from './accessControl.vue'
import HTTP from '@/http/main.js'
export default {
  components: {
    businessList,
    items,
    tableDetails,
    standardSelector,
    indexSelector,
    scan,
    accessControl,
  },
  props: {
    typeIds: {
      default: 1,
    },
  },
  computed: {
    labelText() {
      let obj = {}
      if (this.typeIds === 3) {
        obj = {
          typeName: '数据字典',
          standard: '字典信息',
          domainCode: '字典编码',
          status: '字典状态',
          name: '字典名称',
          nameAbbr: '字典',
        }
      } else if (this.typeIds === 2) {
        obj = {
          typeName: '指标',
          standard: '指标信息',
          domainCode: '指标编码',
          status: '指标状态',
          name: '指标名称',
          nameAbbr: '指标',
        }
      } else {
        obj = {
          typeName: '数据标准',
          standard: this.$version.domain.propertyType.standard,
          domainCode: this.$version.domain.property.domainCode,
          status: '标准状态',
          name: '标准名称',
          nameAbbr: '标准',
        }
      }

      return obj
    },
  },
  mounted() {
    this.getAllOrgs()
    this.initResizeHorizontal()
    this.loadTags()
    this.$bus.$on('jumpToObject', ({ type, object }) => {
      object.type = type
      this.handleItemClick(object)
      $('.box-inner.selected').removeClass('selected')
    })
    this.$bus.$on('gotDims', data => {
      this.dims = data
    })
  },
  beforeDestroy() {
    this.$bus.$off('jumpToObject')
    this.$bus.$off('gotDims')
  },
  data() {
    return {
      displayPath: ['所有目录'],
      writable: this.$auth.ROLE_DATA_CATALOG_ADMIN,
      modelId: null,

      currentObjectId: null,
      currentObject: null,
      currentObjectType: null,
      currentObjectKey: 0,

      loadedTags: [],

      expandStatus: 'tables',

      history: [],
      current: null,
      future: [],
      domainUdps: [],
      summary: null,
      itemId: null,
      itemType: null,
      udps: [],
      allOrganizations: [],
      dims: [],
      domainHasComment: new Map(),
    }
  },
  watch: {
    expandStatus(status) {
      this.handleExpandStatus()
    },
  },
  methods: {
    nodeClick(data) {
      let node
      if (this.$refs.metaList) {
        node =
          this.$refs.metaList && this.$refs.metaList.$refs.tree2
            ? this.$refs.metaList.$refs.tree2.getNode(data.id)
            : null
      }
      if (node && node.data) {
        this.$refs.metaList.handleNodeClick(node.data, node)
        this.$refs.metaList.$refs.tree2.setCurrentKey(node.data.id)
      }
    },
    handleUpdatePath(path) {
      this.displayPath = [...path]
    },
    calculateWholeName() {
      this.summary.wholeName = this.summary.domainChName
    },
    getSummary(domainId) {
      const objectId = domainId
      if (objectId) {
        HTTP.getDomainDetail({
          domainId: objectId,
          successCallback: data => {
            this.summary = data
            this.typeIds = data.categoryId
            this.getUdps()
            this.calculateWholeName()
            // 获取数据后再显示详情页
            // this.currentObjectType = 'DOMAIN'
          },
          failureCallback: e => {
            this.$showFailure(e)
          },
          finallyCallback: () => {},
        })
      }
    },
    getAllOrgs() {
      HTTP.getOrgTree()
        .then(res => {
          const data = res.data
          const arr = [data]
          const getChildren = (obj, arr) => {
            if (obj.children && Array.isArray(obj.children)) {
              obj.children.forEach(item => {
                arr.push(item)
                getChildren(item, arr)
              })
            }
          }
          getChildren(data, arr)
          this.allOrganizations = arr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUdps() {
      HTTP.getUpds({ categoryId: this.typeIds })
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
    getDomainUdps() {
      this.$http
        .get(this.$url + '/service/domains/udps')
        .then(res => {
          this.domainUdps = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleExpandStatus() {
      const status = this.expandStatus
      const items = $('.items')
      const colShadow = $('.col-shadow')
      const condense = $('.condense')
      const details = $('.details')
      if (status === 'all') {
        $('.right-box').css('left', '280px')
        items.show()
        items.css('right', null)
        // items.css('width','420px');
        // details.css('left','420px');
        details.show()
        colShadow.show()
        condense.show()
        condense.removeClass('left').addClass('right')
      } else if (status === 'tables') {
        items.css('width', '100%')
        items.css('right', 0)
        details.hide()
        colShadow.hide()
        condense.removeClass('right').addClass('left')
      } else if (status === 'item') {
        $('.right-box').css('left', 0)
        details.css('left', 0)
        colShadow.hide()
        condense.hide()
        items.hide()
      }
    },
    handleModelClick(id) {
      this.modelId = null
      setTimeout(() => {
        this.modelId = id
      })
      this.itemType = 80010076
      this.showAccessControl = false
      this.currentObjectId = null
      this.expandStatus = 'tables'
    },
    expandOrContract() {
      if (this.expandStatus === 'tables') {
        this.expandStatus = 'all'
      } else {
        this.expandStatus = 'tables'
      }
    },
    expandOrContractItem() {
      if (this.expandStatus === 'all') {
        this.expandStatus = 'item'
      } else if (this.expandStatus === 'item') {
        this.expandStatus = 'all'
      }
    },
    loadTags() {
      var self = this
      self.$http
        .get(self.$url + '/service/tags/')
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
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    handleDetailClose() {
      this.currentObjectType = null
    },
    handleItemClick(basicInfo, callback) {
      if (basicInfo.path && basicInfo.sharePath) {
        // 文件类资产
        basicInfo = _.cloneDeep(basicInfo)
        basicInfo.fileType = basicInfo.type
        basicInfo.objectId = basicInfo.id
        basicInfo.type = 'SHARE_FILE'
      }
      let objectId = Number.parseInt(basicInfo.objectId)
      if (!basicInfo.objectId) {
        objectId = basicInfo.tableId
        basicInfo.object = objectId
      }
      if (objectId) {
        this.currentObjectId = objectId
        this.$router.push({ query: { objectId: objectId } })
      }
      this.currentObject = basicInfo
      if (!callback) {
        // 用户正常点击页面导致的跳转，而非导航导致
        if (
          this.current &&
          (this.history.length === 0 ||
            this.history[this.history.length - 1].objectId !==
              this.current.objectId)
        ) {
          this.history.push(_.clone(this.current))
        } else {
        }
        this.current = basicInfo
        this.future = []
      } else {
        callback(basicInfo)
      }
      if (this.expandStatus === 'tables') {
        this.expandStatus = 'all'
      } else if (this.expandStatus === 'item') {
        setTimeout(() => {
          this.handleExpandStatus()
        })
      }
      switch (basicInfo.type) {
        case 'unknown':
          this.currentObjectType = 'unknown'
          this.currentObjectKey++
          break
        case 'TABLE':
          this.currentObjectType = 'TABLE'
          this.currentObjectKey++
          break
        case 'VIEW':
          this.currentObjectType = 'VIEW'
          this.currentObjectKey++
          break
        case 'STORED_PROCEDURE':
          this.currentObjectType = 'STORED_PROCEDURE'
          this.currentObjectKey++
          break
        case 'COLUMN':
          this.currentObjectType = 'COLUMN'
          this.currentObjectKey++
          break
        case 'FUNCTION':
          this.currentObjectType = 'FUNCTION'
          this.currentObjectKey++
          break
        case 'REPORT':
          this.currentObjectType = 'REPORT'
          this.currentObjectKey++
          break
        case 'SHARE_FILE':
          this.currentObjectType = 'FILE'
          this.currentObjectKey++
          break
        case 'PACKAGE':
          this.currentObjectType = 'PACKAGE'
          this.currentObjectKey++
          break
        case 'DOMAIN':
          // const pos = location.href.indexOf('#/');
          // const baseUrl = location.href.slice(0, pos + 2);
          // window.open(baseUrl + `domain?domainId=${basicInfo.domainId}`);
          this.currentObjectType = 'DOMAIN'
          this.currentObjectKey++
          this.getSummary(this.currentObject.domainId)
          break
        case 'DOMAIN_CODE':
          this.currentObjectType = 'DOMAIN'
          this.currentObjectKey++
          this.getSummary(this.currentObject.domainId)
          break
        default:
          break
      }
      // this.currentObjectType = basicInfo.type;
      // this.currentObjectKey++;
      if (this.currentObjectType === 'REPORT') {
        this.currentObjectId = basicInfo.id
        this.$router.push({ query: { objectId: basicInfo.id } })
      }
    },
  },
}
