import DirectoryTree from '../components/directoryTree.vue'
import knowledgeGraphBox from '../components/knowledgeGraphBox'
import logManage from '../logsRecord/index'
import topBaseInfo from '../components/topBaseInfo'
import comment from '../components/catalogComments.vue'
import SummaryInfo from '../components/summaryInfo.vue'
import api from '../utils/api'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import VersionRecord from '../components/versionRecord.vue'
import assetsList from '../components/assetsList.vue'
import StructureDetails from '../components/structureDetails.vue'
import {
  findParents,
  formatTreeData,
  handleAttrInfo,
  handleBaseInfo,
  handleStatisticsInfo,
} from '../utils/methods'
export default {
  name: 'myAssets',
  components: {
    DirectoryTree,
    topBaseInfo,
    assetsList,
    knowledgeGraphBox,
    comment,
    SummaryInfo,
    logManage,
    VersionRecord,
    StructureDetails,
  },
  data() {
    return {
      curtreeData: {},
      assetsType: '', // 当前资产清单类型
      topH: 0,
      loading: false,
      activeName: 'first',
      breadcrumbNodes: [],
      // 问答组件
      commentForm: {
        catalogId: 5102,
      },
      treeData: null,
      originTreeData: [],
      currentStructure: {},
      currentNode: {},
      baseInfo: {},
      summaryInfo: {
        statisticsInfo: {},
        attrInfo: {},
      },
      algorithmsKeyMap: {
        DEPT: 'assets.summaryInfo.ownershipText',
        ASSETS_LIST: 'assets.summaryInfo.assetListTitle',
        DATA_BUTLER: 'assets.summaryInfo.stewardText',
        SECURITY_LEVEL: 'assets.summaryInfo.secLevelText',
        KEYWORDS: 'assets.commonHead.keyword',
        DESCRIPTION: 'assets.commonHead.descText',
        ENGLISH_ABBREVIATION: 'assets.commonHead.englishText',
      },
      comments: [],
      versionData: [],
      catalogHistory: [],
      curStructureId: null,
      allCatalogs: {},
      structureList: [],
    }
  },
  async mounted() {
    // 摘要信息页面点击进入资产清单，携带资产类型
    this.$bus.$on('changeCatalogTab', this.handleTabChange)
    this.$bus.$on('changeTreeNode', this.handleNodeClick)
    this.$bus.$on('changeStructure', this.handleStructureChange)
    this.loading = true
    this.initResizeHorizontal()
    await this.getStructureData()
    await this.getTreeData()
    await this.getOrgList()
    this.$nextTick(() => {
      /**
       * 设置currentNode
       * 1. 如果地址栏中有structureIndex 和 catalogId，根据structureIndex 和 catalogId 查找当前节点
       */
      //
      if (this.structureList.length) {
        let currentStructureIndex = 0
        let currentStructure = this.structureList[currentStructureIndex]
        let currentNode = {}
        const { structureId, catalogId } = this.$route.query
        if (structureId) {
          currentStructure = this.structureList.find((item, index) => {
            if (item.id == structureId) {
              currentStructureIndex = index
              return true
            } else {
              return false
            }
          })
          if (currentStructure) {
            currentNode = {}
            if (catalogId) {
              const targetNode = this.allCatalogs[structureId][catalogId]
              if (targetNode) currentNode = { ...targetNode }
            }
          }
        }
        this.currentNode = {
          ...currentNode,
          structureIndex: currentStructureIndex,
        }
        // 我的资产，首次进入页面，默认读取第一个树结构下的一级目录的内容
        this.curtreeData = this.currentStructure
        this.currentStructure = {
          ...currentStructure,
          index: currentStructureIndex,
        }
        this.curStructureId = currentStructure.id
      }
      // 根据地址栏中的查询参数，设置当前tab页
      setTimeout(() => {
        if (this.$route.query && this.$route.query.nav) {
          if (this.$route.query.nav === 'comment') this.activeName = 'sixth'
        }
        this.loading = false
      }, 0)
    })
  },
  methods: {
    // 目录树中，判断是否可访问目录详情的方法
    authFunction(data) {
      return !(data.authType === 'MANAGER')
    },
    // 目录树中，对没有管理权限节点的提示
    authTooltip(data) {
      return this.$t('assets.catalogue.noPermission', {
        name: '该目录',
        type: this.$t('assets.catalogue.manage'),
      })
    },
    getOrgList() {
      api
        .getOrganizationList()
        .then(res => {
          this.allDepartmentList = this.flatten([res.data])
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    flatten(sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (Array.isArray(element.children) && element.children.length > 0) {
          flattenedArray.push({
            ...element,
            children: [],
          })
          this.flatten(element.children, flattenedArray)
        } else {
          flattenedArray.push(element)
        }
      }
      return flattenedArray
    },
    handleTabChange({ name, data }) {
      this.assetsType = data.type
      this.activeName = name
    },
    handleClick() {
      // 切换tab时，清除资产类型
      this.assetsType = ''
    },
    // 面包屑-返回
    goBack(e) {
      this.catalogHistory.splice(-1, 1)
      this.handleNodeClick(this.catalogHistory.splice(-1, 1)[0])
    },
    // 各种模态框的处理逻辑
    async clickNode(name, option) {
      switch (name) {
        case 'topH':
          this.topH = option.height
          break
        default:
          break
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.directory-tree'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.directory-content'),
          noCrack: true,
          minWith: { leftMinWidth: 240 },
        })
      }, 1000)
    },
    // 获取 目录空间列表
    async getStructureData() {
      try {
        const strRes = await api.getStructureList('MINE')
        if (strRes.data.length) {
          this.structureList = strRes.data
          if (!this.curStructureId) {
            this.curStructureId = strRes.data[0]?.id
            this.currentStructure = strRes.data[0]
          }
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },

    // 获取 目录树 数据
    async getTreeData() {
      if (this.curStructureId) {
        try {
          const res = await api.getCatalogList(2, this.curStructureId)
          // this.structureList = res.data
          if (res.data.length > 0) {
            res.data.forEach(() => {
              this.allCatalogs[this.curStructureId] = {}
              this.updateAllCatalogs(res.data, this.curStructureId)
            })
            if (this.$refs.myTree) this.$refs.myTree.showUnFold = true
          }
        } catch (error) {
          this.$blauShowFailure(error)
          this.loading = false
        }
      }
    },
    // 更新全部树节点
    updateAllCatalogs(data, structureId = this.curStructureId) {
      if (!Array.isArray(data)) data = [data]
      data.forEach(d => {
        if (!this.allCatalogs[structureId]) this.allCatalogs[structureId] = {}
        this.allCatalogs[structureId][d.id] = d
      })
    },
    // 获取目录树子节点
    async getSubCatalog(data = {}) {
      if (this.curStructureId) {
        const subCatalogRes = await api.getCatalogList(
          2,
          this.curStructureId,
          data.id || 0
        )
        const dataAssetsCatalogVos = subCatalogRes.data || []
        dataAssetsCatalogVos.forEach(item => {
          item.isLeaf = !item.hasChild
          item.allName =
            item.name + (item.englishName ? ' (' + item.englishName + ')' : '')
        })
        this.updateAllCatalogs(dataAssetsCatalogVos)
        return dataAssetsCatalogVos
      } else {
        return []
      }
    },
    // 搜索目录树
    async filterDir(keyword) {
      const res = await api.getCatalogsByKeyword(
        2,
        this.currentStructure.id,
        keyword
      )
      this.currentStructure.dataAssetsCatalogVos = res.data.dataAssetsCatalogVos
      this.structureList.find(
        str => str.id === this.currentStructure.id
      ).dataAssetsCatalogVos = res.data.dataAssetsCatalogVos
    },
    handleStructureChange(structureIndex, options = {}) {
      // 如果当前页面有目录树关键字，那么走搜索接口，如果没有目录树关键字，那么走初始化接口
      const { keyword } = options
      if (keyword) {
        this.filterDir(keyword)
      } else {
        this.getTreeData()
      }
      this.currentStructure = {
        ...this.structureList[structureIndex],
        index: structureIndex,
      }
      this.curStructureId = this.structureList[structureIndex].id
      this.currentNode = {}
      this.catalogHistory = []
      if (this.$refs.myTree) {
        const directoryTreeObj = this.$refs.myTree.$refs.directoryTree
        directoryTreeObj && directoryTreeObj.$refs.tree.setCurrentKey(null)
      }
      this.showNodeDetails = false
    },
    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.myTree.$refs.directoryTree.$refs.tree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        const targetNode = this.allCatalogs[this.currentStructure.id][node]
        if (!targetNode) {
          console.log('请求子节点')
          const children = await this.getSubCatalog({ id: pathArr[i - 1] })
          tree.updateKeyChildren(pathArr[i - 1], children)
        }
      }
    },
    // 目录树 当前节点 发生变化 的回调
    async handleNodeClick(data) {
      // console.log(data)
      if (data) {
        if (this.authFunction(data)) {
          this.$datablauMessage({
            dangerouslyUseHTMLString: true,
            message: this.$t('assets.catalogue.noPermission', {
              name: `[${data.name}]`,
              type: this.$t('assets.catalogue.manage'),
            }),
            type: 'warning',
            showClose: true,
          })
        } else {
          data.id = Number(data.id)
          const structureIndex = this.structureList.findIndex(
            str => str.id === this.currentStructure.id
          )
          const structureId = this.currentStructure.id
          await this.getAllSubCatalog(
            data.catalogPath
              ? `${data.catalogPath}/${data.id}`
              : `${this.currentNode.catalogPath}/${this.currentNode.id}/${data.id}`
          )

          const node = this.allCatalogs[structureId][data.id]
          // console.log(node)
          // 当前点击目录空间树
          this.curtreeData = this.currentStructure
          this.currentNode = {
            ...node,
            maxLevel: this.currentStructure.structureDto.detailDtos.length,
            structureIndex,
          }
        }
      }
    },
    // 根据资产目录id获取目录上下级数据及相关属性数据
    getDirInfo(data) {
      const { id, catalogTypeId } = data
      this.loading = true
      Promise.all([
        api.getDirDetails(id),
        api.getStatisticsInfo(id),
        api.getCompleteness(catalogTypeId),
        api.getAttrInfo(id),
        api.getSubCatalogStatistics({
          catalogId: id,
          pageSize: 20,
          pageNum: 1,
          status: ['PUBLISHED', 'OFFLINE', 'UNDER_REVIEW', 'UNPUBLISHED'],
        }),
      ])
        .then(res => {
          this.loading = false
          // topBaseInfo 基础信息
          handleBaseInfo(res[0].data.data, res[2].data, this)
          // 属性信息
          handleAttrInfo(res[3].data.data, this)
          // 摘要信息（上下级）处理
          handleStatisticsInfo(res[1].data.data, res[4].data.data, this)
          this.loading = false
        })
        .catch(error => {
          this.baseInfo = {}
          this.summaryInfo = {
            statisticsInfo: {},
            attrInfo: {},
          }
          this.loading = false
          this.$blauShowFailure(error)
        })
    },
  },
  watch: {
    currentNode: {
      handler(node, old) {
        this.$nextTick(() => {
          if (node.id && node.id !== old.id) {
            if (this.structureList.length > 0) {
              if (!node.parentId) {
                node.parentId =
                  this.allCatalogs[node.structureId][node.id].parentId
              }
              const breadcrumbNodes = findParents(this.allCatalogs, node)
              this.breadcrumbNodes = breadcrumbNodes
              this.activeName = 'first'
              if (node.id !== old.id) {
                api.visitDatalog({
                  structureId: this.currentStructure.id,
                  catalogId: node.id,
                })
                this.catalogHistory.push({ ...node })
              }
              this.getDirInfo(node)
            }
          }
        })
      },
    },
  },
  beforeDestory() {
    this.$bus.$off('changeCatalogTab')
    this.$bus.$off('changeTreeNode')
    this.$bus.$off('changeStructure')
  },
}
