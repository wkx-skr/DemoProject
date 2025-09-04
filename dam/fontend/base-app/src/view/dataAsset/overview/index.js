import DirectoryTree from '../components/directoryTree.vue'
import topBaseInfo from '../components/topBaseInfo.vue'
import assetsListView from '../components/assetsListView.vue'
import api from '../utils/api'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import SummaryInfo from '../components/summaryInfo.vue'
import comment from '../components/catalogComments.vue'
import knowledgeGraphBox from '../components/knowledgeGraphBox'
import logManage from '../logsRecord/index.vue'
import VersionRecord from '../components/versionRecord.vue'
import assetsList from '../components/assetsList.vue'
import applyPower from '../components/applyPower.vue'
import {
  findParents,
  formatTreeData,
  handleAttrInfo,
  handleBaseInfo,
  handleStatisticsInfo,
} from '../utils/methods'
export default {
  name: 'assetOverview',
  components: {
    DirectoryTree,
    topBaseInfo,
    assetsListView,
    SummaryInfo,
    comment,
    knowledgeGraphBox,
    logManage,
    VersionRecord,
    assetsList,
    applyPower,
  },
  data() {
    return {
      curManage: '',
      listLoading: false,
      managerMap: {},
      flag: true,
      selectedAttr: [],
      showApply: false,
      applyInfo: {},
      loading: false, // 仅用于template中判断数据是否加赞完成
      subAssetsType: '', // 当前资产清单类型
      isShowDetail: false,
      activeName: '',
      topH: 0,
      breadcrumbH: 10,
      structureName: '资产目录管理',
      breadcrumbNodes: [],
      // 问答组件
      commentForm: {
        catalogId: 5102,
      },
      treeData: null,
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
      type: 'StructureDir', // 目录空间=>StructureDir;一级目录=>firstCatalogue;其他目录=>catalogue,
      currentCatalogs: [], // 当前目录下的所有子目录（仅下级子目录）
      versionData: [],
      catalogHistory: [],
      originTreeData: [],
      allTreeList: [],
      onlyDetail: false,
      isNull: false,
      nowBase: {
        structureId: '',
        id: 0,
        isUpdata: false,
      },
      curStructureId: '',
      curStructureIndex: 0,
      structureList: [],
      allCatalogs: {},
      currentStructure: null,
    }
  },
  beforeMount() {
    // this.$store.state.isMainFull = true
  },
  mounted() {
    this.initData()
    const query = this.$route.query
    this.$bus.$on('changeStructure', this.handleStructureChange)
    if (query && query.type && query.type === 'catalogue') {
    } else {
      this.$bus.$on('changeTreeNode', this.handleNodeClick)
    }
    // 摘要信息页面点击进入资产清单，携带资产类型
    this.$bus.$on('changeCatalogTab', this.handleTabChange)
  },
  methods: {
    async initData() {
      this.loading = true
      this.initResizeHorizontal()
      const query = this.$route.query
      await this.getStructureData()
      await this.getOrgList()
      // 如果不展示目录树，走if的逻辑，如果展示目录树，走else的逻辑
      if (query && query.type && query.type === 'catalogue') {
        this.onlyDetail = true
        this.isShowDetail = true
        this.activeName = 'first'
        this.type = 'firstCatalogue'
        // 个人工作台收藏页面进入的
        api.getDirDetails(query.id).then(res => {
          this.currentNode = res.data.data
          this.breadcrumbNodes = [res.data.data]
        })
      } else {
        await this.getTreeData()
        this.structureList.forEach(structure => {
          this.allCatalogs[structure.id] = {}
          this.updateAllCatalogs(structure.dataAssetsCatalogVos, structure.id)
        })
        this.onlyDetail = false
        this.$nextTick(() => {
          let currentStructureIndex = 0
          let currentStructure
          const { structureId, catalogId } = this.$route.query
          let params
          let params1
          if (structureId) {
            let currentNode = {}
            currentStructure = this.structureList.find((item, index) => {
              if (item.id == structureId) {
                currentStructureIndex = index
                params = {
                  name: item.name,
                  index,
                  id: item.id,
                }
                return true
              } else {
                return false
              }
            })
            if (currentStructure) {
              if (catalogId) {
                const targetNode = currentStructure.dataAssetsCatalogVos.find(
                  item => item.id == catalogId
                )
                if (targetNode) currentNode = { ...targetNode }
                this.currentNode = {
                  ...currentNode,
                  structureIndex: currentStructureIndex,
                }
                this.handleNodeClick(this.currentNode)
              } else {
                this.structureClick(params)
              }
            }
          } else {
            // 首次进入资产浏览页面
            if (this.structureList.length > 0) {
              setTimeout(() => {
                const name = this.structureList[0].name
                // 默认展示 评论 tab页
                if (this.$route.query && this.$route.query.nav) {
                  this.isShowDetail = true
                  this.type = 'catalogue'
                  if (this.$route.query.nav === 'comment')
                    this.activeName = 'sixth'
                }
                this.curStructureId = this.structureList[0].id
                this.curStructureIndex = 0
                this.currentStructure = this.structureList[0]
                this.structureClick({
                  id: this.curStructureId,
                  name: name,
                  index: currentStructureIndex,
                })
                this.type = 'StructureDir'
                this.nowBase = {
                  structureId: this.curStructureId,
                  id: 0,
                  isUpdata: false,
                }
              }, 0)
            } else {
              this.isNull = true
            }
          }
          this.loading = false
        })
      }
    },

    // 目录树中，判断是否可访问目录详情的方法
    authFunction(data) {
      return data.authType === 'NONE'
    },
    // 目录树中，对没有管理权限节点的提示
    authTooltip(data) {
      return `您对"${data.name}"没有访问权限`
    },
    getOrgList() {
      api
        .getOrganizationList()
        .then(res => {
          this.allDepartmentList = this.flatten([res.data])
        })
        .catch(error => {
          this.$showFailure(error)
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
    navClick(name) {
      if (name === 'overview') {
        this.initData()
      } else {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + 'main/dataAsset/' + name, '_blank')
      }
    },
    // 通过树结构id获取树的部分信息
    getTreeInfo() {
      let params = {}
      this.structureList.map((item, index) => {
        if (item.id === this.curStructureId) {
          params.id = item.id
          params.name = item.name
          params.index = index
        }
      })
      return params
    },
    // 面包屑-返回
    async goBack(e) {
      if (this.onlyDetail) {
        window.close()
      } else {
        if (!this.isShowDetail) {
          if (this.catalogHistory.length > 0) {
            this.catalogHistory.pop()
            const len = this.catalogHistory.length
            if (len > 0) {
              this.handleNodeClick(this.catalogHistory[len - 1])
            } else {
              const params = await this.getTreeInfo()
              this.structureClick(params)
            }
          }
        } else {
          this.selectedAttr = this.$refs.assetsListView.selectedDataTypes
          const len = this.catalogHistory.length
          this.isShowDetail = false
          this.handleNodeClick(this.catalogHistory[len - 1], false, true, true)
        }
      }
    },
    handleTabChange({ name, data }) {
      this.subAssetsType = data.type
      this.activeName = name
    },
    handleClick(node) {
      // 切换tab时，清除资产类型
      if (node.name === 'first') {
        this.getDirInfo(this.currentNode)
      }
      // 切换tab时，清除资产类型
      this.subAssetsType = ''
    },
    // 各种模态框的处理逻辑
    async clickNode(name, option) {
      switch (name) {
        case 'loading':
          this.listLoading = option.listLoading || false
          break
        case 'manager':
          this.managerMap = option || {}
          break
        case 'topH':
          this.topH = option.height
          break
        case 'catalogueAttr':
          this.selectedAttr = this.$refs.assetsListView.selectedDataTypes
          this.handleNodeClick(option, true)
          break
        case 'applyPower':
          // 资产目录申请权限
          this.applyInfo = option
          this.applyInfo.username = this.$user.username
          this.showApply = true
          break
        case 'jumpTree':
          this.handleNodeClick(option)
          break
        default:
          break
      }
    },
    async closeModal(e) {
      this.showApply = false
      if (e === 'success') {
        const params = await this.getTreeInfo()
        console.log(params)
        this.nowBase = {
          structureId: params.id,
          id: this.currentNode.id,
          isUpdata: false,
        }
        // this.structureClick(params, false)
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
    // 生成 目录树 的嵌套数据结构
    findChildren(treeData, data, level) {
      treeData.forEach(item => {
        item.children = data
          .filter(d => d.parentId === item.id)
          .map(item => {
            return {
              ...item,
              catalogName: item.name,
              catalogLevel: level,
              children: [],
              disabled: item.manager,
            }
          })
        this.findChildren(item.children, data, level + 1)
      })
      return treeData
    },
    // 获取 目录空间列表
    async getStructureData() {
      try {
        const strRes = await api.getStructureList('BROWSE')
        this.structureList = strRes.data
        if (!this.curStructureId) {
          this.curStructureId = strRes.data[0]?.id
          this.currentStructure = strRes.data[0]
          this.curStructureIndex = 0
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 获取 目录树 数据
    async getTreeData() {
      if (this.curStructureId) {
        try {
          const res = await api.getCatalogList(1, this.curStructureId)
          // this.structureList = res.data
          if (res.data.length > 0) {
            res.data.forEach(() => {
              this.allCatalogs[this.curStructureId] = {}
              this.updateAllCatalogs(res.data, this.curStructureId)
            })
            if (this.$refs.overviewTree)
              this.$refs.overviewTree.showUnFold = true
          }
        } catch (error) {
          this.$showFailure(error)
          this.$datablauLoading.close()
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
          1,
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
    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.overviewTree.$refs.directoryTree.$refs.tree
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
    async handleNodeClick(
      data,
      isDetail = false,
      isUpdata = false,
      hasAttr = false
    ) {
      // 结构id清空
      if (isDetail) {
        this.activeName = 'first'
        this.isShowDetail = true
      } else {
        if (!hasAttr) {
          this.selectedAttr = []
        }
        this.isShowDetail = false
        this.activeName = ''
      }
      if (data) {
        data.id = Number(data.id || data.catalogId)
        const structureId = data.structureId || this.currentStructure.id
        const structureIndex = this.structureList.findIndex(
          item => item.id === structureId
        )
        await this.getAllSubCatalog(
          data.catalogPath
            ? `${data.catalogPath}/${data.id}`
            : `${this.currentNode.catalogPath}/${this.currentNode.id}/${data.id}`
        )
        const node = this.allCatalogs[structureId][data.id]
        this.currentNode = {
          ...node,
          structureIndex,
        }
        if (isDetail) {
          this.getDirInfo(this.currentNode)
        }
        this.flag = true
        this.nowBase = {
          structureId: this.currentNode.structureId,
          id: this.currentNode.id,
          isUpdata: isUpdata,
        }
        this.curStructureId = this.currentNode.structureId
        this.curStructureIndex = this.currentNode.structureIndex
        if (data.catalogLevel === 1 || data.level === 1) {
          this.type = 'firstCatalogue'
          this.breadcrumbH = 10
        } else {
          this.type = 'catalogue'
          this.breadcrumbH = 54
        }
      }
    },
    handleStructureChange(index) {
      const params = {
        name: this.structureList[index].name,
        index,
        id: this.structureList[index].id,
      }
      this.structureClick(params)
    },
    structureClick(params, isRoot = true) {
      this.flag = true
      // isRoot 申请权限时，依然停留在当前节点
      this.type = 'StructureDir'
      this.breadcrumbH = 10
      this.topH = 0
      this.isShowDetail = false
      this.activeName = ''
      this.structureName = params.name
      this.curStructureId = params.id
      this.curStructureIndex = params.index
      this.nowBase = {
        structureId: params.id,
        id: 0,
        isUpdata: false,
      }
      this.currentStructure = {
        ...this.structureList[params.index],
        index: params.index,
      }
      if (isRoot) {
        // 当点击树结构时，currentNode设置为{}
        this.currentNode = {}
      }
      this.$nextTick(() => {
        // console.log(this.$refs.overviewTree.$refs.directoryTree)
        if (isRoot) {
          this.$refs.overviewTree.$refs.directoryTree &&
            this.$refs.overviewTree.$refs.directoryTree.$refs.tree.setCurrentKey(
              null
            )
        } else {
          this.$refs.overviewTree.$refs.directoryTree &&
            this.$refs.overviewTree.$refs.directoryTree.$refs.tree.setCurrentKey(
              this.currentNode.id
            )
        }
        this.catalogHistory = []
      })
    },
    // 根据资产目录id获取目录上下级数据及相关属性数据
    getDirInfo(data) {
      const { id, catalogTypeId } = data
      this.loading = true
      Promise.all([
        api.getDirDetails(id),
        api.getStatisticsInfo(id, true),
        api.getCompleteness(catalogTypeId),
        api.getAttrInfo(id),
        api.getSubCatalogStatistics({
          catalogId: id,
          pageSize: 20,
          pageNum: 1,
          status: ['PUBLISHED'],
        }),
      ])
        .then(res => {
          // topBaseInfo 基础信息
          handleBaseInfo(res[0].data.data, res[2].data, this)
          this.loading = false
          // 属性信息
          handleAttrInfo(res[3].data.data, this, true)
          // 摘要信息（上下级）处理
          handleStatisticsInfo(res[1].data.data, res[4].data.data, this)
          this.$datablauLoading.close()
        })
        .catch(error => {
          this.baseInfo = {}
          this.summaryInfo = {
            statisticsInfo: {},
            attrInfo: {},
          }
          this.$datablauLoading.close()
          this.loading = false
          this.$showFailure(error)
        })
    },
    handleRateSubmit() {
      this.getTableRate()
    },
    getTableRate() {
      const para = {
        objId: this.commentForm.objectId,
        typeId: this.commentForm.typeId,
      }
      HTTP.getAverageRate({
        succesedCallback: res => {
          // this.tableRate = parseFloat(res)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
  },
  watch: {
    managerMap: {
      // 监听权限变化，刷新topBaseInfo
      handler(val) {
        this.curManage = val[this.currentNode.id]
      },
      immediate: true,
      deep: true,
    },
    currentNode: {
      handler(node, old) {
        this.$nextTick(async () => {
          if (node.id && node.id !== old.id && this.flag) {
            this.flag = false
            if (!this.onlyDetail) {
              if (node.id) {
                this.$refs.overviewTree.$refs.directoryTree.$refs.tree.setCurrentKey(
                  node.id
                )

                if (this.structureList.length > 0) {
                  this.loading = true
                  if (!node.parentId) {
                    node.parentId =
                      this.allCatalogs[this.curStructureId][node.id].parentId
                  }
                  const breadcrumbNodes = findParents(this.allCatalogs, node)
                  breadcrumbNodes.map(item => {
                    if (item.authType === 'NONE') {
                      item.couldClick = false
                    } else {
                      item.couldClick = true
                    }
                  })
                  this.breadcrumbNodes = breadcrumbNodes
                  try {
                    api.visitDatalog({
                      structureId:
                        this.structureList[this.curStructureIndex].id,
                      catalogId: node.id,
                    })
                  } catch (e) {
                    this.$showFailure(e)
                  }
                  this.catalogHistory.push({ ...node })
                  // this.getDirInfo(node)
                  let attrInfo
                  try {
                    const baseAttr = await api.getAttrInfo(node.id)
                    attrInfo = baseAttr.data.data.catalogStatisticsDto
                  } catch (e) {
                    console.log(e)
                  }
                  api.getDirDetails(node.id).then(res => {
                    this.loading = false
                    const item = res.data.data
                    if (item && item.assetsType) {
                      item.assetsType = item.assetsType
                        ? item.assetsType
                            .split(',')
                            .filter(item => item !== 'CATALOG')
                        : []
                      if (attrInfo) {
                        this.baseInfo = {
                          ...item,
                          percent: attrInfo.progress || 0,
                          vote: attrInfo.score || 0,
                          quality: attrInfo.publishQpCount || 0,
                          visit: attrInfo.pv || 0,
                          hasCollected: attrInfo.collected,
                          favoriteCount: attrInfo.collectedCount || 0,
                          quote: attrInfo.citations || 0,
                        }
                      } else {
                        this.baseInfo = item
                      }
                    }
                  })
                }
              }
            } else {
              this.getDirInfo(node)
            }
          }
        })
      },
      immediate: true,
      deep: true,
    },
  },
  beforeDestroyed() {
    this.$bus.$off('changeTreeNode')
    this.$bus.$off('changeCatalogTab')
    this.$bus.$off('changeStructure')
  },
}
