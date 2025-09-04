import DirectoryTree from '../components/directoryTree.vue'
import topBaseInfo from '../components/topBaseInfo'
import assetsList from '../components/assetsList.vue'
import PermissionSettings from '../components/permissionSettings'
import knowledgeGraphBox from '../components/knowledgeGraphBox'
import AddAssetsDialog from '../components/addAssetsDialog.vue'
import processDetail from '@/components/processDetail/processDetail'
import logManage from '../logsRecord/index.vue'
import SummaryInfo from '../components/summaryInfo.vue'
import api from '../utils/api'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import VersionRecord from '../components/versionRecord.vue'
import StructureDetails from '../components/structureDetails.vue'
import {
  findParents,
  handleAttrInfo,
  handleBaseInfo,
  handleStatisticsInfo,
  getAssetTypeMap,
  getStatusMap,
  hasDataSetAuth,
  hasReportAuth,
  hasFileAuth,
  hasIndexAuth,
  hasStandardAuth,
  hasCodeAuth,
  hasServiceAuth,
} from '../utils/methods'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
export default {
  name: 'assetManage',
  components: {
    DirectoryTree,
    topBaseInfo,
    assetsList,
    AddAssetsDialog,
    PermissionSettings,
    knowledgeGraphBox,
    processDetail,
    logManage,
    SummaryInfo,
    VersionRecord,
    StructureDetails,
  },
  data() {
    return {
      bindFailList: [], // 绑定失败的资产
      uploadData: {},
      importCatalogId: '', // 资产导入是的目录id
      assetsStraightPublish: true,
      hasAttrRequire: false, // 扩展属性必填是否有没填写的
      structureId: '',
      currentStructureIndex: 0,
      isProcess: true,
      uploadLoading: false,
      AssetsTypeEnum: AssetsTypeEnum,
      loading: false, // 判断数据是否加载完成
      isCatalog: false, // 判断导入资产类型  true=>目录  false=> 资产
      curStructureId: '',
      topH: 88,
      curtreeData: {},
      addNodeparams: {},
      activeName: 'first',
      breadcrumbNodes: [],
      currentStructure: {},
      currentNode: {},
      showNodeDetails: false,
      // 新建资产目录相关属性
      showCatalogue: false,
      catalogueTitle: '',
      catalogueForm: {
        name: '',
        butler: '',
        catalogTypeId: '',
        englishName: '',
        approver: '',
        bm: '',
        keyword: '',
        comment: '',
        structureId: '',
      },
      rules: {},
      approvalList: [],
      butlerList: [],
      // accessList: [],
      // 新建资产
      assetDialogVisible: false,
      assetDialogTitle: '',
      defaultProps: {
        children: 'children',
        label: 'catalogName',
      },
      // 下线资产目录属性
      showOfflineCatalogue: false,
      OfflineTitle: '',
      OfflineReason: this.$t('assets.catalogue.applyReason'),
      offlineForm: {
        nameList: '',
        reason: '',
        assetAlong: false,
        applyToSub: true,
      },
      // 扩展属性
      showExtend: false,
      showProcess: false,
      showImport: false,
      action: '', // 文件上传地址
      actionName: 'file',
      fileList: [],
      udps: [],
      departmentList: [],
      parentId: 0,
      allDepartmentList: [],
      baseInfo: {},
      summaryInfo: {
        statisticsInfo: {},
        attrInfo: {},
      },
      subAssetsType: '',
      assetsListData: [], // 发布，下线（所选择的资产清单）
      isAssetsList: false, // 发布，下线（是否是资产清单
      isPublish: true,
      // 资产绑定结果提示
      showBind: false,
      versionData: [],
      oldCatalogData: {},
      oldUdps: [],
      addedAssets: {},
      catalogHistory: [],
      allCatalogs: {},
      structureList: [],
      assetsTypeMap: {},
      statusMap: {},
      approvalPage: 1,
      approvalTimeout: null,
      approvalKeyword: '',
      approvalMaxPage: 1,
      butlerPage: 1,
      butlerTimeout: null,
      butlerKeyword: '',
      butlerMaxPage: 1,
      underBaseLineList: [],
      catalogBtnDisabled: false,
      approverLoading: false,
      butlerLoading: false,
      addAssetType: '',
      commentMap: {
        1: '业务域定义',
        2: '主题域定义',
        3: '业务对象定义',
        4: '逻辑实体定义',
        5: '属性定义',
      },
      nameMap: {
        1: '业务域（中文名）',
        2: '主题域（中文名）',
        3: '业务对象（中文名）',
        4: '逻辑实体（中文名）',
        5: '属性（中文名）',
      },
      englishMap: {
        1: '业务域（英文名）',
        2: '主题域（英文名）',
        3: '业务对象（英文名）',
        4: '逻辑实体（英文名）',
        5: '属性（英文名）',
      }

    }
  },
  computed: {
    underBaseLineTips() {
      if (
        this.OfflineTitle === this.$t('assets.commonHead.offlineAssetCatalog')
      )
        return this.$t('assets.catalogue.notAffectedText')
      if (this.underBaseLineList.length === 0)
        return this.$t('assets.catalogue.notAffectedText')
      return this.$t('assets.catalogue.notMeetingBaseline', {
        catalogNames: this.underBaseLineList.slice(0, 3).join(','),
      })
    },
  },
  mounted() {
    var nameValidatePass = async (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('assets.catalogue.inputRequired')))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(value)) {
          callback(new Error(this.$t('assets.catalogue.specialErrorMessage')))
        }
      }
    }
    this.rules = {
      name: [
        {
          required: true,
          validator: nameValidatePass,
          trigger: 'blur',
        },
      ],
      englishName: [
        {
          required: true,
          message: this.$t('assets.catalogue.inputRequired'),
          trigger: 'blur',
        },
      ],
      code: [
        {
          required: true,
          message: this.$t('assets.catalogue.inputRequired'),
          trigger: 'blur',
        },
      ],
      comment: [
        {
          required: true,
          message: this.$t('assets.catalogue.inputRequired'),
          trigger: 'blur',
        },
      ],
      // catalogType: [
      //   {
      //     required: true,
      //     message: this.$t('assets.catalogue.selectRequired'),
      //     trigger: 'change',
      //   },
      // ],
      approver: [
        {
          required: true,
          message: this.$t('assets.catalogue.selectRequired'),
          trigger: 'change',
        },
      ],
      // tagId: [
      //   {
      //     required: true,
      //     message: this.$t('assets.catalogue.selectRequired'),
      //     trigger: 'change',
      //   },
      // ],
      // bm: [
      //   {
      //     required: true,
      //     message: this.$t('assets.catalogue.inputRequired'),
      //     trigger: 'change',
      //   },
      // ],
    }
    this.assetsTypeMap = getAssetTypeMap(this)
    this.statusMap = getStatusMap(this)
    this.$bus.$on('changeTreeNode', this.handleNodeClick)
    this.$bus.$on('changeStructure', this.handleStructureChange)
    this.$bus.$on('changeCatalogTab', this.handleTabChange)
    this.$bus.$on('refreshCurrentNode', this.refreshCurrentNode)
    this.initData()
  },
  methods: {
    // 审批人分页懒加载
    remoteMethod(val) {
      if (!this.approvalTimeout) {
        clearTimeout(this.approvalTimeout)
        this.approvalTimeout = setTimeout(() => {
          this.approvalKeyword = val
          this.approvalPage = 1
          this.approvalMaxPage = 1
          this.approvalTimeout = null
          this.getApproverList({ page: 1, keywords: val })
        }, 1000)
      }
    },
    butlerRemoteMethod(val) {
      if (!this.butlerTimeout) {
        clearTimeout(this.butlerTimeout)
        this.butlerimeout = setTimeout(() => {
          this.butlerKeyword = val
          this.butlerPage = 1
          this.butlerMaxPage = 1
          this.butlerTimeout = null
          this.getButlerList({ page: 1, keywords: val })
        }, 1000)
      }
    },

    selectFocus(keywords) {
      this.approvalKeyword = keywords
      this.approvalPage = 1
      this.approvalMaxPage = 1
      this.getApproverList({ page: 1, keywords })
    },
    selectButlerFocus(keywords) {
      this.butlerKeyword = keywords
      this.butlerPage = 1
      this.butlerMaxPage = 1
      this.getButlerList({ page: 1, keywords })
    },

    lazyloading() {
      if (!this.approverLoading) {
        this.approvalPage++
        this.getApproverList({
          page: this.approvalPage,
          keywords: this.approvalKeyword,
        })
      }
    },
    butlerLazyloading() {
      if (!this.butlerLoading) {
        this.butlerPage++
        this.getButlerList({
          page: this.butlerPage,
          keywords: this.butlerKeyword,
        })
      }
    },
    getButlerList(obj) {
      if (obj.page === 1) this.butlerList = []
      let requestBody = {
        currentPage: obj.page,
        pageSize: 8,
        username: obj.keywords,
        fullUserName: obj.keywords,
        enabled: true,
      }
      // console.log(obj.page, this.approvalMaxPage)
      if (!(obj.page > this.butlerMaxPage)) {
        this.butlerLoading = true
        api
          .getAllUserPage(requestBody)
          .then(res => {
            const { pageSize, totalItems, content: data } = res.data
            this.butlerMaxPage = Math.ceil(totalItems / pageSize)
            obj.page === 1
              ? (this.butlerList = data)
              : this.butlerList.push(...data)
            this.butlerLoading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.butlerLoading = false
          })
      }
    },

    getApproverList(obj) {
      if (obj.page === 1) this.approvalList = []
      let requestBody = {
        currentPage: obj.page,
        pageSize: 8,
        username: obj.keywords,
        fullUserName: obj.keywords,
        enabled: true,
      }
      // console.log(obj.page, this.approvalMaxPage)
      if (!(obj.page > this.approvalMaxPage)) {
        this.approverLoading = true
        api
          .getAllUserPage(requestBody)
          .then(res => {
            const { pageSize, totalItems, content: data } = res.data
            this.approvalMaxPage = Math.ceil(totalItems / pageSize)
            obj.page === 1
              ? (this.approvalList = data)
              : this.approvalList.push(...data)
            this.approverLoading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.approverLoading = false
          })
      }
    },
    // 审批人分页懒加载

    // 更新当前节点的数据
    refreshCurrentNode() {
      this.updateDirBaseInfo()
      this.updateDirAttr()
    },
    // 目录树中，判断是否可访问目录详情的方法
    authFunction(data) {
      return !(data.authType === 'MANAGER' || data.authType === 'EDIT' || data.authType === 'READ')
    },
    // 目录树中，对没有管理权限节点的提示
    authTooltip(data) {
      return this.$t('assets.catalogue.noPermission', {
        type: this.$t('assets.catalogue.edit'),
      })
    },
    async initData() {
      this.loading = true
      await this.getStructureData()
      this.initResizeHorizontal()
      this.getOrgList()
      if(this.$route.query.catalogId) return
      this.initTree()
    },
    async initTree(bool = false, index) {
      if (this.structureList && this.structureList.length) {
        if (bool) {
          this.$refs.manageTree.refreshData()
        } else {
          this.currentStructure = { ...this.structureList[0], index: 0 }
          this.currentNode = {}
          this.curStructureId = this.structureList[0].id
        }
      }
      this.loading = false
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.directory-tree'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.directory-content'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
          callback: () => {
            this.$refs.structureDetails &&
              this.$refs.structureDetails.toggleEllipsis()
          },
        })
      }, 1000)
    },
    handleTabChange({ name, data }) {
      this.subAssetsType = data.type
      this.activeName = name
    },
    handleClick(node) {
      // 切换tab时，清除资产类型
      if (node.name === 'first') {
        this.getDirInfo()
      }
      this.subAssetsType = ''
    },
    // 获取所有的机构，并将返回的树形数据 转换成 数组
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
    // 将嵌套数据 拍平成 数组
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
    bindTip(list) {
      this.showBind = true
      this.bindFailList = list
    },
    addAsset(params) {
      this.getAddedAssetsByType(params.type, params.id)
      if (this.activeName === 'second') {
        // 当添加资产后，如果当前为资产清单tab页面时，需要刷新资产清单
        this.$nextTick(() => {
          this.$refs.assetsList.getList()
        })
      }
      this.getDirInfo(this.currentNode)
    },
    // 面包屑-返回
    goBack(e) {
      // console.log(e)
      this.catalogHistory.splice(-1, 1)
      this.handleNodeClick(this.catalogHistory.splice(-1, 1)[0])
    },
    // 获取 目录空间列表
    async getStructureData() {
      try {
        const strRes = await api.getStructureList('MANAGE')
        this.structureList = strRes.data
        // 通过全局搜索进入，使用路径参数
        if(this.$route.query.catalogId){
          this.handleRouterEnter()
        }else if(!this.curStructureId) {
          this.curStructureId = strRes.data[0]?.id
          this.currentStructure = strRes.data[0]
          this.assetsStraightPublish =
            this.currentStructure.assetsStraightPublish
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 获取 目录树 数据
    async getTreeData() {
      if (this.curStructureId) {
        try {
          const res = await api.getCatalogList(0, this.curStructureId)
          // this.structureList = res.data
          if (res.data.length > 0) {
            res.data.forEach(structure => {
              this.allCatalogs[this.curStructureId] = {}
              this.updateAllCatalogs(res.data, this.curStructureId)
            })
            if (this.$refs.manageTree) this.$refs.manageTree.showUnFold = true
          } else {
            this.allCatalogs[this.curStructureId] = {}
          }
        } catch (error) {
          this.$showFailure(error)
          this.loading = false
        }
      }
    },
    // 更新全部树节点
    updateAllCatalogs(data, structureId = this.curStructureId) {
      if (!Array.isArray(data)) data = [data]
      data.forEach(d => {
        if (!this.allCatalogs[structureId]) this.allCatalogs[structureId] = {}
        if (d && d.id) {
          this.allCatalogs[structureId][d.id] = d
        }
      })
    },
    // 获取目录树子节点
    async getSubCatalog(data = {}) {
      if (this.curStructureId) {
        const subCatalogRes = await api.getCatalogList(
          0,
          this.curStructureId,
          data.id || 0
        )
        const dataAssetsCatalogVos = subCatalogRes.data || []
        const structureLevels = this.currentStructure.detailDtos
        dataAssetsCatalogVos.forEach(item => {
          item.isLeaf = !item.hasChild
          item.allName =
            item.name + (item.englishName ? ' (' + item.englishName + ')' : '')
          const currentLevel = structureLevels.find(i => i.level === item.level)
          if (currentLevel) {
            item.levelDetails = currentLevel
          }
        })
        this.updateAllCatalogs(dataAssetsCatalogVos)
        return dataAssetsCatalogVos
      } else {
        return []
      }
    },
    // 清空目录信息，包括头部属性、上下级关系、摘要属性等
    resetCatalogInfo() {
      this.baseInfo = {}
      this.summaryInfo = {
        statisticsInfo: {},
        attrInfo: {},
      }
    },

    // 更新目录属性（包括完成度）
    updateDirAttr() {
      if (this.currentNode.id) {
        api.getAttrInfo(this.currentNode.id).then(res => {
          if (res.data.status === 200) {
            handleAttrInfo(res.data.data, this)
          }
        })
      }
    },

    // 更新目录详情
    updateDirBaseInfo() {
      api.getDirDetails(this.currentNode.id).then(res => {
        const resData = res.data.data
        this.allCatalogs[this.curStructureId][this.currentNode.id] = {
          ...(this.allCatalogs[this.curStructureId][this.currentNode.id] || {}),
          ...resData,
        }
        this.baseInfo = {
          ...this.baseInfo,
          ...resData,
        }
        this.currentNode = {
          ...this.currentNode,
          ...res.data.data,
        }
        this.summaryInfo.statisticsInfo.catalogCode = resData.code
        this.summaryInfo.statisticsInfo.autoCode =
          !!resData.codeGenerate?.autoIncState
      })
    },

    // 根据资产目录id获取目录上下级数据及相关属性数据
    getDirInfo(data = this.currentNode, withLog = false) {
      // console.log(data)
      const { id, catalogTypeId } = data || this.currentNode
      if (id) {
        this.loading = true
        this.summaryInfo = {
          statisticsInfo: {},
          attrInfo: {},
        }
        Promise.all([
          withLog ? api.getDirDetailsWithLog(id) : api.getDirDetails(id),
          api.getStatisticsInfo(id),
          api.getCompleteness(catalogTypeId),
          api.getAttrInfo(id),
          api.getSubCatalogStatistics({
            isManagement: true, // 是否是管理页面
            catalogId: id,
            status: ['PUBLISHED', 'OFFLINE', 'UNDER_REVIEW', 'UNPUBLISHED'],
            // pageNum: 1,
            // pageSize: 20,
          }),
        ])
          .then(res => {
            if (id === this.currentNode.id) {
              this.loading = false
              // topBaseInfo 基础信息
              handleBaseInfo(res[0].data.data, res[2].data, this)
              // 属性信息
              handleAttrInfo(res[3].data.data, this)
              // 摘要信息（上下级）处理
              handleStatisticsInfo(res[1].data.data, res[4].data.data, this)
              // 编辑目录节点后，更新目录节点信息
              const tree = this.$refs.manageTree.$refs.directoryTree
              const node = tree.getNode({ id })
              if (node) {
                const nodeData = node.data
                nodeData.name = this.baseInfo.name
                nodeData.englishName = this.baseInfo.englishName
                nodeData.comment = this.baseInfo.comment
                nodeData.allName =
                  this.baseInfo.name +
                  (this.baseInfo.englishName
                    ? `(${this.baseInfo.englishName})`
                    : ``)
              }
              this.breadcrumbNodes = findParents(this.allCatalogs, data)
            }
          })
          .catch(error => {
            this.resetCatalogInfo()
            this.loading = false
            this.$showFailure(error)
          })
      }
    },
    // 更换目录空间
    handleStructureChange(structureIndex) {
      if (structureIndex || structureIndex === 0) {
        const currentStructure = this.structureList[structureIndex]
        this.currentStructure = {
          ...currentStructure,
          index: structureIndex,
        }
        this.assetsStraightPublish = currentStructure.assetsStraightPublish
        const directoryTreeObj = this.$refs.manageTree.$refs.directoryTree
        if (this.curStructureId == currentStructure.id) {
          function setExpandedToFalse(arr) {
            arr.forEach(item => {
              if (Array.isArray(item.childNodes) && item.childNodes.length) {
                setExpandedToFalse(item.childNodes)
              }
              item.loaded = false
              item.expanded = false
            })
          }
          setExpandedToFalse(directoryTreeObj.store.root.childNodes)
          this.getAllSubCatalog('0/')
        } else {
          this.currentNode = {}
          this.catalogHistory = []
          this.curStructureId = currentStructure.id
        }
        this.baseInfo.maxLevel = currentStructure.detailDtos.length
        directoryTreeObj && directoryTreeObj.setCurrentKey(null)
        // this.allCatalogs[currentStructure.id] = {}
        this.updateAllCatalogs(
          currentStructure.dataAssetsCatalogVos,
          currentStructure.id
        )
        this.showNodeDetails = false
      } else {
        this.currentNode = {}
      }
    },
    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.manageTree.$refs.directoryTree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        // 不仅要判断本地是否缓存了节点，还要判断目录树上是否存在该节点，因为会有【本地缓存了节点，但是目录树上并没有渲染该节点】的情况
        const targetNode =
          this.allCatalogs[this.curStructureId] &&
          this.allCatalogs[this.curStructureId][node] &&
          tree.getNode({ id: node })
        if (!targetNode) {
          // console.log('请求子节点')
          const children = await this.getSubCatalog({ id: pathArr[i - 1] })
          const parentNode = tree.getNode({ id: pathArr[i - 1] })
          if (parentNode) {
            parentNode.childNodes = (children || []).map(data => ({ data }))
          }
          tree.updateKeyChildren(pathArr[i - 1], children)
        }
      }
    },
    // 目录树 当前节点 发生变化 的回调
    async handleNodeClick(data) {
      if (data) {
        let noPermission = true
        if (!data.authType) {
          const authRes = await api.getDirDetails(data.id)
          const res = authRes.data.data
          noPermission = !(
            res.authType === 'MANAGER' || res.authType === 'EDIT'
          )
          data = { ...res }
        } else {
          noPermission = this.authFunction(data)
        }
        if (noPermission) {
          this.$datablauMessage({
            dangerouslyUseHTMLString: true,
            message: this.$t('assets.catalogue.noPermission', {
              name: `[${data.name}]`,
              type: this.$t('assets.catalogue.edit'),
            }),
            type: 'warning',
            showClose: true,
          })
        } else {
          this.loading = true
          data.id = Number(data.id)
          if (this.currentNode.id === data.id) {
            this.refreshCurrentNode()
          } else {
            const structureIndex = this.structureList.findIndex(
              str => str.id === this.curStructureId
            )
            const structureId = this.curStructureId
            await this.getAllSubCatalog(
              data.catalogPath
                ? `${data.catalogPath}${data.id}`
                : `${this.currentNode.catalogPath}${this.currentNode.id}/${data.id}`
            )
            const node = this.allCatalogs[structureId][data.id]
            // console.log(node)
            // 当前点击目录空间树
            this.curtreeData = this.currentStructure
            this.currentNode = {
              ...node,
              maxLevel: this.currentStructure.detailDtos.length,
              structureIndex,
              structureId,
              ...this.allCatalogs[this.curStructureId][data.id],
            }
          }
          this.loading = false
        }
      }
    },
    // 获取审批人
    async getApprover(node) {
      let parentNode
      let approver
      let nowId
      if (node) {
        // 资产的批量操作
        nowId = parseInt(node)
      } else {
        nowId = this.currentNode.parentId
      }

      parentNode = this.allCatalogs[this.curStructureId][nowId]
      if (parentNode) {
        approver = parentNode.approver
      } else {
        try {
          const res = await api.getStructureById(this.currentNode.structureId)
          approver = res.data.approver
        } catch (error) {
          this.$showFailure(error)
        }
      }
      return approver
    },

    /// ///////////////////// 以上为 资产目录管理页、我的资产页、资产浏览页目录树相关的共同代码 ///////////////////////////

    // 根据catalogId和assetsType获取已添加的资产id;id有值时，表示从左侧树添加的资产

    async getAddedAssetsByType(assetType, id = '') {
      let typeList = []
      switch (assetType) {
        case AssetsTypeEnum.DATA_COLLECTION:
          typeList.push(AssetsTypeEnum.TABLE)
          typeList.push(AssetsTypeEnum.VIEW)
          break
        case AssetsTypeEnum.TABLE:
          typeList.push(AssetsTypeEnum.TABLE)
          break
        case AssetsTypeEnum.VIEW:
          typeList.push(AssetsTypeEnum.VIEW)
          break
        case AssetsTypeEnum.DOMAIN:
          typeList.push(AssetsTypeEnum.DATA_STANDARD)
          typeList.push(AssetsTypeEnum.DATA_STANDARD_CODE)
          break
        case AssetsTypeEnum.DATA_STANDARD:
          typeList.push(AssetsTypeEnum.DATA_STANDARD)
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          typeList.push(AssetsTypeEnum.DATA_STANDARD_CODE)
          break
        default:
          typeList.push(assetType)
          break
      }
      try {
        const res = await api.getAddedAssetsIds({
          catalogId: id || this.currentNode.id,
          typeList,
        })
        this.addedAssets[assetType] = res.data || []
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 导出资产目录 和 导出数据资产
    asstesTemplate() {
      if (this.isCatalog) {
        let url =
          this.$asstes_url + `/catalog/export/template/${this.curStructureId}`
        this.$datablauDownload(
          url,
          {},
          this.$t('assets.upload.catalogTemplate')
        )
      } else {
        let url = this.$asstes_url + `/assets/export/template`
        this.$datablauDownload(url, {}, this.$t('assets.upload.assetsTemplate'))
      }
    },
    // 打开发布或下线对话框
    async openOfflineDialog(node = '') {
      this.offlineForm.nameList = await this.getApprover(node)
      if (
        this.OfflineTitle === this.$t('assets.commonHead.publishAssetCatalog')
      ) {
        // 判断当前目录下的子目录是否有不满足发布基线的目录，如果有，不允许选择‘应用当前操作到子目录’
        const catalogRes = await api.getUnderThresholdCatalog({
          structureId: this.currentNode.structureId,
          catalogPath: this.currentNode.catalogPath + this.currentNode.id + '/',
        })
        this.underBaseLineList = catalogRes.data.data || []
      }
      this.showOfflineCatalogue = true
    },
    // 判断扩展属性是否有效
    validateExtendProps(rule, value, callback) {
      const udp = this.udps.find(u => u.propName === rule.field)
      let valid = true
      if (udp && udp.type === 'STRING')
        valid = !!udp.value && !!udp.value.trim().length
      if (udp && udp.type === 'NUM') valid = udp.value === 0 || udp.value
      if (udp && udp.type === 'ENUM') valid = !!udp.value
      if (valid) {
        callback()
      } else {
        callback(new Error(this.$t('assets.catalogue.completeExtendProps')))
      }
    },
    async getExtendProps(params, type) {
      const res =
        type === 'add'
          ? await api.getUDPsByLevel(params)
          : await api.getCatalogUDPs(params)
      const udps =
        type === 'add'
          ? res.data
          : // 接口返回的key为'扩展属性', 所以这里的'扩展属性'不需要国际化
            (res.data.data['扩展属性'] || []).map(item => {
              return {
                ...item.value,
                propName: item.value.name,
              }
            })
      this.udps = udps
      this.oldUdps = _.cloneDeep(udps)
      // 如果扩展属性是必填，往rules中添加规则
      udps.forEach(u => {
        // 如果扩展属性值为null，前端展示为空，而不是0
        if (
          u.type === 'NUM' &&
          (u.value === null || u.value === 'null' || u.value === '')
        )
          u.value = undefined
        if (u.required) {
          // console.log(u)
          this.$set(this.rules, u.propName, [
            {
              required: true,
              validator: this.validateExtendProps,
              trigger: ['blur'],
            },
          ])
        }
      })
    },
    // 数值变化，手动触发校验
    handleNumChange(proName) {
      this.$refs.catalogueForm.validateField(proName)
    },
    // 新增目录 - 打开新增目录模态框
    async openAddDialog(data) {
      // console.log(data)
      const structure = this.currentStructure
      const { id, detailDtos } = structure
      const parentId = data ? data.id || 0 : 0
      // console.log(parentId)
      const level =
        parentId === 0
          ? 1
          : this.allCatalogs[this.curStructureId][parentId].level + 1
      const catalogType = detailDtos[level - 1]
      this.catalogueForm.catalogTypeId = catalogType.catalogTypeId
      this.catalogueForm.level = level
      this.catalogueForm.structureId = id
      // 通过目录空间id和目录层级，获取当前新增目录的扩展属性
      await this.getExtendProps(
        {
          structureId: id,
          level,
        },
        'add'
      )
      this.parentId = parentId
      this.catalogueForm.parentId = parentId
      this.catalogueForm.structureId = id
      this.catalogueForm.structureIndex = data.structureIndex
      this.catalogueTitle = this.$t('assets.common.new', {
        name: catalogType.catalogTypeName,
      })
      this.loading = false
      this.$datablauLoading.close()
      this.showCatalogue = true
    },
    // 变更资产目录 - 打开变更模态框
    async openChangeDialog(data) {
      // 判断当前目录下是否有在审核中的资产
      const res = await api.hasUnderReviewAsset({
        catalogId: this.currentNode.id,
        // structureId: this.currentNode.structureId,
      })
      this.$datablauLoading.close()
      if (!res.data.data) {
        this.oldCatalogData = { ...data }
        this.catalogueTitle = this.$t('assets.catalogue.changeCatalog')
        // 变更原因为必填项，需设置校验规则
        this.$set(this.catalogueForm, 'reason', '')
        this.rules.reason = [
          {
            required: true,
            message: this.$t('assets.catalogue.reasonRequired'),
            trigger: 'blur',
          },
        ]
      } else {
        this.$showFailure(this.$t('assets.catalogue.cannotChange'))
        this.loading = false
        return
      }
      const details = await api.getDirDetails(data.id)

      const { bm } = details.data.data
      const department = this.allDepartmentList.filter(item => item.bm === bm)
      await this.getExtendProps(data.id)
      this.departmentList = department
      const newData = { ...data, ...details.data.data }
      this.catalogueForm = {
        id: newData.id,
        name: newData.name,
        catalogTypeId: newData.catalogTypeId,
        englishName: newData.englishName,
        approver: newData.approver,
        bm: newData.bm,
        keyword: newData.keyword,
        comment: newData.comment,
        structureId: newData.structureId,
        parentId: newData.parentId,
        status: newData.status,
        butler: newData.butler,
        level: newData.level,
        code: newData.code,
      }
      delete this.catalogueForm.udps
      this.remoteMethod(newData.approver)
      if (newData.butler) {
        this.butlerRemoteMethod(newData.butler)
      }
      this.loading = false
      this.$datablauLoading.close()
      this.showCatalogue = true
    },
    // 编辑资产目录 - 打开编辑模态框
    async openEditDialog(data) {
      const details = await api.getDirDetails(data.id)
      this.catalogueTitle =
        this.$t('assets.common.edit') + details.data.data.catalogType
      await this.getExtendProps(data.id)
      this.loading = false
      const { bm } = details.data.data
      const department = this.allDepartmentList.filter(item => item.bm === bm)
      this.departmentList = department
      const newData = { ...data, ...details.data.data }
      if (newData.butler) {
        this.butlerRemoteMethod(newData.butler)
      }
      if (newData.approver) {
        this.getApproverList({ page: 1, keywords: newData.approver })
      }
      this.catalogueForm = {
        id: newData.id,
        name: newData.name,
        catalogTypeId: newData.catalogTypeId,
        englishName: newData.englishName,
        approver: newData.approver,
        bm: newData.bm,
        keyword: newData.keyword,
        comment: newData.comment,
        structureId: newData.structureId,
        parentId: newData.parentId,
        status: newData.status,
        butler: newData.butler,
        level: newData.level,
        code: newData.code,
      }
      delete this.catalogueForm.udps
      this.$datablauLoading.close()
      this.showCatalogue = true
    },
    // 获取资产所在目录的发布状态
    getCatalogStatus(id) {
      return new Promise(resolve => {
        api
          .getDirDetails(id)
          .then(res => {
            resolve(res.data.data.status)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    // 各种模态框的处理逻辑
    async clickNode(name, option) {
      let nodeId = '' // 当前所要添加的目录id
      let catalogId = '' // 当前所要添加的目录id
      let structureId = '' // 所操作的数结构id
      if (option && option.path) {
        // 非当前目录，点击左侧树中，添加资产时的目录id
        this.addNodeparams = option
        nodeId = option.id
        this.importCatalogId = option.id
        structureId = option.structureId
      } else {
        this.importCatalogId = this.currentNode.id
        structureId = this.currentNode.structureId
          ? this.currentNode.structureId
          : this.currentStructure.id
      }
      switch (name) {
        case 'assets':
          // 手动更新资产清单（暂时先用）
          const obj = {
            structureId,
            catalogId: this.currentNode.id,
          }
          api
            .syncData(obj)
            .then(res => {
              this.$blauShowSuccess(
                this.$t('assets.catalogue.syncSuccessMessage')
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
          break
        case 'topH':
          this.topH = option.height
          break
        case 'initData':
          // 重新刷新页面
          this.initData()
          break
        case 'catalogue':
          if (option) {
            this.$datablauLoading.message()
            // type: 打开catalog弹窗时是新增还是编辑  parentId: 父级目录id  data:编辑目录时需回显的数据  index: 目录空间索引
            const { type, data = this.currentNode } = option
            // console.log(type, data)
            if (type === 'add') {
              // 新增资产目录
              this.openAddDialog(data)
            } else {
              if (type === 'change') {
                // 变更资产目录
                this.openChangeDialog(data)
              } else {
                // 修改资产目录
                this.openEditDialog(data)
              }
            }
          }
          break
        case AssetsTypeEnum.DATA_COLLECTION: // 包含数据表，视图
        case AssetsTypeEnum.TABLE:
        case AssetsTypeEnum.VIEW:
          if (hasDataSetAuth(this)) {
            this.assetDialogTitle = this.$t('assets.catalogue.registryTable')
            if (name === AssetsTypeEnum.VIEW) {
              this.assetDialogTitle = this.$t('assets.catalogue.registryView')
            }
            this.defaultProps = {
              children: 'subNodes',
              label: 'name',
            }
            this.assetDialogVisible = true
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.META_MODEL:
          this.addAssetType = AssetsTypeEnum.META_MODEL
          this.assetDialogTitle = this.$t('assets.catalogue.registryMetaModel')
          this.defaultProps = {
            children: 'subNodes',
            label: 'name',
          }
          this.assetDialogVisible = true
          break
        case AssetsTypeEnum.DATA_OBJECT:
          if (hasDataSetAuth(this)) {
            this.assetDialogTitle = this.$t('assets.catalogue.registryObject')
            this.assetDialogVisible = true
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.DOMAIN:
          if (hasStandardAuth(this) || hasCodeAuth(this)) {
            this.addAssetType = 'dataStandard'
            this.assetDialogTitle = this.$t('assets.catalogue.registryStandrad')
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
            this.assetDialogVisible = true
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.DATA_STANDARD:
          if (hasStandardAuth(this)) {
            this.addAssetType = 'DATA_STANDARD'
            this.assetDialogTitle = this.$t(
              'assets.catalogue.registryBasicStandrad'
            )
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
            this.assetDialogVisible = true
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          if (hasCodeAuth(this)) {
            this.addAssetType = 'DATA_STANDARD_CODE'
            this.assetDialogTitle = this.$t(
              'assets.catalogue.registryStandradCode'
            )
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
            this.assetDialogVisible = true
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.INDEX:
          if (hasIndexAuth(this)) {
            this.addAssetType = 'dataIndex'
            this.assetDialogTitle = this.$t('assets.catalogue.registryIndex')
            // this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.REPORT:
          if (hasReportAuth(this)) {
            this.addAssetType = 'report'
            this.assetDialogTitle = this.$t('assets.catalogue.registryReport')
            // this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case AssetsTypeEnum.FILE:
          if (hasFileAuth(this)) {
            this.addAssetType = 'file'
            this.assetDialogTitle = this.$t('assets.catalogue.registryFile')
            // this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'nodeName',
            }
          } else {
            this.$datablauMessage.warning(
              this.$t('assets.catalogue.noModulePermission')
            )
            return
          }
          break
        case 'offline':
          this.isPublish = false
          // this.OfflineReason = this.$t('assets.catalogue.offlineReason')
          if (option && option.type && option.type === 'assetsData') {
            this.showOfflineCatalogue = true
            this.isAssetsList = true
            this.openOfflineDialog(option.id)
            this.OfflineTitle = this.$t('assets.catalogue.offlineAssetData')
            this.assetsListData = option.data
          } else {
            // console.log('下线资产目录', this.currentNode)
            // 目录
            this.isAssetsList = false
            /**
             * 1. 判断当前目录是否有子目录
             * 2. 如果没有子目录, 提示‘确定下线该目录吗？此动作不可逆’, 打开下线对话框
             * 3. 如果有子目录，提示‘确定下线该目录吗？下线之后，该子目录也会被同时下线，此动作不可逆’，再打开下线对话框
             */
            // let confirmMessage = this.$t('assets.catalogue.confirmOffline')
            // this.$DatablauCofirm(confirmMessage, this.$t('assets.common.tip'), {
            //   confirmButtonText: this.$t('common.button.ok'),
            //   cancelButtonText: this.$t('common.button.cancel'),
            // })
            //   .then(() => {})
            //   .catch(() => {})
            this.OfflineTitle = this.$t('assets.commonHead.offlineAssetCatalog')
            this.openOfflineDialog()
          }
          break
        case 'publish':
          this.isPublish = true
          // this.OfflineReason = this.$t('assets.catalogue.publishReason')
          if (option && option.type && option.type === 'assetsData') {
            // 数据资产
            this.isAssetsList = true
            // const treeIndex = this.currentNode.structureIndex
            // const parent = this.allCatalogs[this.curStructureId][option.id]
            const status = await this.getCatalogStatus(option.id)
            if (status !== 'PUBLISHED') {
              this.$DatablauCofirm(
                this.$t('assets.catalogue.confirmAssetsPublish'),
                this.$t('assets.common.tip'),
                {
                  confirmButtonText: this.$t('common.button.ok'),
                  cancelButtonText: this.$t('common.button.cancel'),
                }
              )
                .then(() => {
                  this.OfflineTitle = this.$t(
                    'assets.catalogue.publishAssetData'
                  )
                  this.assetsListData = option.data
                  // 获取父级目录审批人
                  this.openOfflineDialog(option.id)
                })
                .catch(e => {
                  console.log(e)
                })
            } else {
              this.OfflineTitle = this.$t('assets.catalogue.publishAssetData')
              this.assetsListData = option.data
              this.openOfflineDialog(option.id)
            }
          } else {
            this.publishCatalog()
          }
          break
        case 'extend':
          this.showExtend = true
          break
        case 'process':
          this.showProcess = true
          // 获取流程id
          api.getProcessIdByCatalogId(this.currentNode.id).then(res => {
            const data = {
              // 接口所需固定参数，不可国际化
              taskName: '一级发布',
              processInstanceId: res.data.data.processInstanceId,
            }
            setTimeout(() => {
              this.$refs.processDetail.initData(data)
            })
          })
          break
        case 'import':
          this.showImport = true
          if (option && option.type === 'catalogue') {
            this.curStructureId = option.structureId // 点击左侧树，导入资产目录时，重新赋值结构树id
            // 导入资产目录
            this.isCatalog = true
            this.actionName = 'multipartFile'
            this.action = `${this.$asstes_url}/catalog/upload?status=${
              'UNPUBLISHED'
            }&structureId=${this.curStructureId}`
            this.importTitle = this.$t('assets.commonHead.importCatalogue')
          } else {
            // 导入资产
            this.isCatalog = false
            this.actionName = 'file'
            this.structureId = structureId
            if (option.type === 'whole') {
              // 通过当前结构导入资产
              this.action = `${this.$asstes_url}/assets/import/structure/${structureId}`
              this.uploadData = {
                structureName: option.data.name,
              }
            } else {
              this.action = `${this.$asstes_url}/assets/import/${structureId}/${this.importCatalogId}`
              this.uploadData = {
                catalogName: option.catalogName,
              }
            }
            this.importTitle = this.$t('assets.commonHead.importAssetCatalog')
          }
          break
        case 'export':
          let url = ''
          if (option.type === 'whole') {
            // 当前结构下的全部资产
            let form = new FormData()
            form.append('structureName', option.data.name)
            api.exportAssetsByStructureId(structureId, form).then(res => {
              this.$bus.$emit('getTaskJobResult', res.data, 'export')
            })
          } else {
            let form = new FormData()
            form.append('catalogId', option.id)
            form.append('catalogName', option.name)
            form.append('structureId', option.structureId)
            form.append('parentId', option.parentId)
            api.exportAssetsByCatalogId(form).then(res => {
              this.$bus.$emit('getTaskJobResult', res.data, 'export')
            })
          }
          break
        case 'structureIndex':
          this.currentStructureIndex = option.data.structureIndex
          break
        default:
          break
      }
      if (
        name === AssetsTypeEnum.DATA_COLLECTION ||
        name === AssetsTypeEnum.TABLE ||
        name === AssetsTypeEnum.VIEW ||
        name === AssetsTypeEnum.DATA_STANDARD ||
        name === AssetsTypeEnum.DATA_STANDARD_CODE ||
        name === 'DATA_OBJECT' ||
        name === 'INDEX' ||
        name === 'REPORT' ||
        name === 'FILE'
      ) {
        await this.getAddedAssetsByType(name, nodeId)
        this.addAssetType = name
        this.assetDialogVisible = true
      }
      if (name === AssetsTypeEnum.DOMAIN) {
        await this.getAddedAssetsByType(AssetsTypeEnum.DATA_STANDARD, nodeId)
        await this.getAddedAssetsByType(
          AssetsTypeEnum.DATA_STANDARD_CODE,
          nodeId
        )
        this.assetDialogVisible = true
      }
    },
    // 下线时查找当前节点的子节点有没有  发布  审核 状态
    findCurrentNodeChildren(ary) {
      let allow = true
      ary.forEach(item => {
        if (item.status === 'PUBLISHED' || item.status === 'UNDER_REVIEW') {
          allow = false
        }
      })
      return allow
    },
    // 点击'发布资产目录'菜单
    publishCatalog() {
      // 目录
      this.isAssetsList = false
      this.OfflineTitle = this.$t('assets.commonHead.publishAssetCatalog')
      /**
       * 1. 判断当前目录属性是否有未完成的必填项（针对扩展属性由非必填改为必填的情况）
       * 2. 判断当前完成度是否合格
       * 3. 判断是否是一级目录
       * 4. 如果是一级目录，继续6
       * 5. 如果不是一级目录，判断父级目录是否未发布，如果是未发布状态，给以告警提示，继续6
       * 6. 填写发布理由，提交发布申请单
       */

      // 无父级目录或父级目录已发布才能发布
      const treeIndex = this.currentNode.structureIndex || 0
      const parent =
        this.allCatalogs[this.curStructureId][this.currentNode.parentId]
      api.getAttrInfo(this.currentNode.id).then(res => {
        handleAttrInfo(res.data.data, this)
        const udps = (
          (res.data.data.extendsProperties || {})['扩展属性'] || []
        ).map(item => item.value)
        let udpsValid = true
        let basicValid = true
        for (let i = 0; i < udps.length; i++) {
          const udp = udps[i]
          // 判断扩展属性必填项的值是否有效（注意扩展属性值为0的情况）
          if (
            udp.required &&
            (udp.value === null || String(udp.value).length === 0)
          ) {
            udpsValid = false
            this.$showFailure(
              this.$t('assets.catalogue.udpNoValue', {
                name: udp.name,
              })
            )
          }
        }
        api.getDirDetails(this.currentNode.id).then(details => {
          const { bm, approver } = details.data.data
          this.currentNode.bm = bm
          this.currentNode.approver = approver
          // 目录发布时，判断数据权属和审批人的有效性
          // if (!bm) {
          //   this.$showFailure(this.$t('assets.catalogue.noOwner'))
          //   basicValid = false
          // }
          // if (!approver) {
          //   this.$showFailure(this.$t('assets.catalogue.noApproverMessage'))
          //   basicValid = false
          // }
          if (udpsValid && basicValid) {
            // 判断当前目录完成度是否合格
            api
              .getCompletionThresholdByCatalogType(
                this.currentNode.catalogTypeId
              )
              .then(res => {
                if (this.baseInfo.percent >= res.data.publishPercent) {
                  if (parent && parent.status !== 'PUBLISHED') {
                    this.$DatablauCofirm(
                      this.$t('assets.catalogue.confirmCatalogPublish'),
                      this.$t('assets.common.tip'),
                      {
                        confirmButtonText: this.$t('common.button.ok'),
                        cancelButtonText: this.$t('common.button.cancel'),
                      }
                    )
                      .then(() => {
                        this.openOfflineDialog()
                      })
                      .catch(() => {})
                  } else {
                    this.openOfflineDialog()
                  }
                } else {
                  this.$showFailure(this.$t('assets.catalogue.cannotPublish'))
                }
              })
              .catch(error => {
                this.$showFailure(error)
              })
          }
        })
      })
    },
    // 关闭各种模态框的逻辑
    close(name) {
      switch (name) {
        case 'catalogueForm':
          this.hasAttrRequire = false
          this.departmentList = []
          this.catalogueTitle = ''
          this.catalogueForm = {
            reason: '',
            name: '',
            catalogType: '',
            butler: '',
            englishName: '',
            approver: '',
            bm: '',
            tagId: '',
            keyword: '',
            comment: '',
            level: null,
            code: ''
          }
          delete this.rules.reason
          this.showCatalogue = false
          this.parentId = null
          this.catalogBtnDisabled = false
          break
        case 'offlineForm':
          this.OfflineTitle = ''
          this.offlineForm.reason = ''
          this.offlineForm.assetAlong = false
          this.offlineForm.applyToSub = true
          this.underBaseLineList = []
          this.showOfflineCatalogue = false
          this.catalogBtnDisabled = false
          break
        case 'extend':
          this.showExtend = false
          break
        case 'extendForm':
          this.showExtend = false
          break
        case 'process':
          this.showProcess = false
          break
        case 'importForm':
          this.showImport = false
          break
        default:
          break
      }
    },
    // 数据资产发布、下线时的参数
    getAssetsProcessParams(dataList) {
      // console.log(dataList)
      const params = {
        catalogId: this.currentNode.id,
        reason: this.offlineForm.reason,
        assetsProcessType: this.isPublish
          ? 'ASSET_PUBLISH_APPLY'
          : 'ASSET_OFFLINE_APPLY',
        assetsId: dataList.map(item => item.assetsId),
      }
      return params
    },
    // 审批发布，下线资产清单
    /**
     *
     * @param {*} dataList
     */
    async sendApply(dataList) {
      let pList = []
      // 批量
      const params = this.getAssetsProcessParams(dataList)
      this.catalogBtnDisabled = true
      api
        .publishOrOfflineAssets(params)
        .then(res => {
          this.close('offlineForm')
          this.catalogBtnDisabled = false
          if (this.assetsStraightPublish) {
            // 走审批流程
            this.$message({
              type: 'success',
              message: this.isPublish
                ? this.$t('assets.common.publishProcessSuccess')
                : this.$t('assets.common.offlineProcessSuccess'),
            })
          } else {
            this.$message({
              type: 'success',
              message: this.isPublish
                ? this.$t('assets.common.publishSuccess')
                : this.$t('assets.common.offlineSuccess'),
            })
          }
          this.$refs.assetsList.getList()
          this.$refs.assetsList.clearSelections()
        })
        .catch(e => {
          this.close('offlineForm')
          this.catalogBtnDisabled = false
          this.$refs.assetsList.getList()
          this.$showFailure(e)
        })
    },
    // 通过数据权属部门code获取数据权属名称
    getDeptNameByCode(code) {
      const department = this.allDepartmentList.find(item => item.bm === code)
      return department ? department.fullName : ''
    },

    async getCatalogChangeParams() {
      // 获取目录路径
      const parents = findParents(this.allCatalogs, {
        ...this.currentNode,
        ...this.catalogueForm,
      }).map(item => item.name)
      const { name, keyword, englishName, comment, bm, approver, butler } =
        this.catalogueForm
      // 获取审批人详情
      const approvalRes = await api.getAllUserPage({
        currentPage: 1,
        pageSize: 5,
        username: approver,
        fullUserName: '',
        enabled: true,
      })
      let currentApprover = approvalRes.data.content.find(
        person => person.username === approver
      )
      let currentButler = ''
      if (butler) {
        const butlerRes = await api.getAllUserPage({
          currentPage: 1,
          pageSize: 5,
          username: butler,
          fullUserName: '',
          enabled: true,
        })
        currentButler = butlerRes.data.content.find(
          person => person.username === butler
        )
      }

      console.log(currentApprover)

      // 变更原因
      const reason = this.catalogueForm.reason
      const commonParams = {
        catalogId: this.currentNode.id, // 目录id
        catalogName: name, // 目录名称
        abbreviation: englishName, // 英文简称
        approver: currentApprover.fullUserName, // 审批人名称,
        approverId: currentApprover.id,
        approverName: `${currentApprover.fullUserName}(${currentApprover.username})`,
        department: this.getDeptNameByCode(bm), // 数据权属（部门）
        // dataSteward: this.summaryInfo.attrInfo.steward, // 数据管家
        butler: butler,
        dataSteward: currentButler
          ? `${currentButler.fullUserName}(${currentButler.username})`
          : '',
        bm,
        catalogPath: parents.join('/'), // 目录路径
        directoryStructure:
          this.structureList[this.currentNode.structureIndex].name, // 目录空间
        catalogType: this.currentNode.catalogType, // 目录类型
        catalogKeywords: keyword, // 目录关键字
        describe: comment, // 目录描述
        catalogCode: this.currentNode.code, // 资产目录编号
        currentStatus: this.currentNode.status, // 目录状态
        reason, // 申请原因
        applyType: this.$t('assets.catalogue.manual'),
        catalogExtensions: this.udps
          ? this.udps.map(udp => {
              return {
                proName: udp.propName,
                proValue: udp.value,
              }
            })
          : [],
      }
      const newParams = { ...commonParams }
      let oldParams = { ...commonParams }

      // 整理变更前的信息
      const {
        name: oldName,
        keyword: oldKeyword,
        bm: oldBM,
        englishName: oldEnglishName,
        approver: oldApprover,
        comment: oldComment,
        butler: oldButler,
      } = this.oldCatalogData
      const oldApprovalRes = await api.getAllUserPage({
        currentPage: 1,
        pageSize: 5,
        username: oldApprover,
        fullUserName: '',
        enabled: true,
      })
      const oldParents = findParents(this.allCatalogs, this.currentNode).map(
        item => item.name
      )
      let oldApproverVo = oldApprovalRes.data.content.find(
        person => person.username === oldApprover
      )
      let oldButlerVo
      if (oldButler) {
        const oldButlerRes = await api.getAllUserPage({
          currentPage: 1,
          pageSize: 5,
          username: oldButler,
          fullUserName: '',
          enabled: true,
        })
        oldButlerVo = oldButlerRes.data.content[0] || {}
      }

      console.log(oldApproverVo)
      oldParams.catalogName = oldName
      oldParams.catalogPath = oldParents.join('/')
      oldParams.abbreviation = oldEnglishName
      oldParams.department = this.getDeptNameByCode(oldBM)
      oldParams.catalogKeywords = oldKeyword
      oldParams.describe = oldComment
      oldParams.approver = oldApproverVo.fullUserName
      oldParams.approverId = oldApproverVo.id
      oldParams.approverName = `${oldApproverVo.fullUserName}(${oldApproverVo.username})`
      oldParams.butler = oldButler
      oldParams.dataSteward = oldButlerVo
        ? `${oldButlerVo.fullUserName}(${oldButlerVo.username})`
        : ''

      if (this.oldUdps.length) {
        oldParams.catalogExtensions = this.oldUdps.map(udp => {
          return {
            proName: udp.propName,
            proValue: udp.value,
          }
        })
      }
      return {
        oldCatalogData: oldParams,
        newCatalogData: newParams,
        reason,
      }
    },
    // 提交新建的目录内容
    async addNewCatalog() {
      let catalogPath = '0/'
      let brothers = Object.values(
        this.allCatalogs[this.catalogueForm.structureId] || {}
      ).filter(item => item.parentId === this.catalogueForm.parentId)
      // console.log(brothers)
      let maxOrder = brothers.length
        ? Math.max.apply(
            null,
            brothers.map(item => item.order)
          )
        : 0
      if (this.catalogueForm.parentId) {
        const parentNode =
          this.allCatalogs[this.catalogueForm.structureId][this.parentId]
        catalogPath = `${parentNode.catalogPath}${parentNode.id}/`
      }
      this.catalogBtnDisabled = true
      try {
        const res = await api.submitNewDir({
          ...this.catalogueForm,
          parentId: this.parentId,
          catalogPath,
          udpDtos: this.udps,
          order: maxOrder + 1,
        })

        if (res.data.status === 200) {
          // 新建保存成功
          this.$message({
            type: 'success',
            message: this.$t('assets.common.newSuccess'),
          })
          const parentId = this.parentId
          this.close('catalogueForm')
          if (!parentId) {
            this.$refs.manageTree.refreshData()
          }
          this.handleNodeClick({
            id: res.data.data.id,
            authType: 'MANAGER',
            catalogPath,
            structureId: this.curStructureId,
          })
        } else {
          this.$showFailure(res.errorMsg)
        }
        this.catalogBtnDisabled = false
      } catch (error) {
        this.catalogBtnDisabled = false
        this.$showFailure(error)
      }
    },
    // 变更时，提交内容
    changeCatalog() {
      this.catalogBtnDisabled = true
      // 需要判断变更后的目录属性是否符合完整度阈值
      api
        .getCompletenessByOptions({
          ...this.catalogueForm,
          udpDtos: this.udps,
        })
        .then(async res => {
          // console.log(res)
          if (res.data) {
            this.changeCatalogStatus(await this.getCatalogChangeParams())
          } else {
            this.$showFailure(this.$t('assets.catalogue.cannotAlter'))
            this.catalogBtnDisabled = false
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
          this.catalogBtnDisabled = false
        })
    },
    // 编辑时，提交内容
    editCatalog() {
      this.catalogBtnDisabled = true
      api
        .updateCatalog({
          ...this.catalogueForm,
          udpDtos: this.udps,
        })
        .then(async res => {
          if (res.status === 200) {
            // 修改保存成功
            this.$message({
              type: 'success',
              message: this.$t('assets.common.editSuccess'),
            })
            const { id, parentId, name } = this.catalogueForm
            const node = this.allCatalogs[this.curStructureId][id]
            if (this.currentNode.id === id) {
              this.getDirInfo(node)
              if (this.breadcrumbNodes.length > 0) {
                this.breadcrumbNodes[this.breadcrumbNodes.length - 1].name =
                  name
              }
            } else {
              this.handleNodeClick(node)
            }
            this.catalogueTitle = this.$t('assets.commonHead.newAssetCatalog')
            this.close('catalogueForm')
            this.catalogBtnDisabled = false
          }
        })
        .catch(e => {
          this.catalogBtnDisabled = false
          this.$showFailure(e)
        })
    },
    // 确定新建或修改目录/发布或下线目录、资产
    async sure(name) {
      switch (name) {
        case 'catalogueForm':
          this.$refs[name].validate(async valid => {
            if (valid) {
              // 如果catalogueForm中已有目录id，为变更或编辑
              if (this.catalogueForm.id) {
                // 如果当前目录是已发布状态，为变更操作
                if (this.catalogueForm.status === 'PUBLISHED') {
                  this.changeCatalog()
                } else {
                  // 编辑  保存编辑内容
                  this.editCatalog()
                }
              } else {
                // 新增目录
                this.addNewCatalog()
              }
            } else {
              this.hasAttrRequire = this.udps.some(
                item => item.required && !item.value
              )
            }
          })
          break
        case 'offlineForm':
          this.$refs[name].validate(async valid => {
            if (valid) {
              if (this.isAssetsList) {
                // 数据资产 发布、下线
                this.sendApply(this.assetsListData)
                return
              } else {
                // 资产目录 发布、下线
                this.catalogBtnDisabled = true
                let params = {
                  catalogId: this.currentNode.id,
                  catalogProcessType:
                    this.OfflineTitle ===
                    this.$t('assets.commonHead.publishAssetCatalog')
                      ? 'CATALOG_PUBLISH_APPLY'
                      : 'CATALOG_OFFLINE_APPLY',
                  assetsProcessType:
                    this.OfflineTitle ===
                    this.$t('assets.commonHead.publishAssetCatalog')
                      ? 'ASSET_PUBLISH_APPLY'
                      : 'ASSET_OFFLINE_APPLY',
                  reason: this.offlineForm.reason,
                  flowSub: this.offlineForm.applyToSub,
                  flowAssets: this.offlineForm.assetAlong,
                }
                api
                  .publishOrOfflineCatalog(params)
                  .then(async res => {
                    if (res.status === 200) {
                      this.handleChangeCatalogStatusSuccess()
                    } else {
                      this.$showFailure(res)
                    }
                  })
                  .catch(error => {
                    this.$showFailure(error)
                  })
              }
            } else {
              return false
            }
          })
          break
        case 'importForm':
          if (this.fileList.length > 0) {
            this.uploadLoading = true
            if (!this.isCatalog) {
              this.uploadData.status = this.isProcess
                ? 'UNPUBLISHED'
                : 'PUBLISHED'
            }
           await this.$refs.assetsUpload.$refs.upload.submit()

            window.location.reload();
          } else {
            this.$message.warning(this.$t('assets.common.uploadTip'))
          }
          break
        default:
          break
      }
    },
    handleChangeCatalogStatusSuccess() {
      const currentNode = this.$refs.manageTree.$refs.directoryTree.getNode({
        id: this.currentNode.id,
      })
      // console.log(currentNode)
      // const r = await api.getDirDetails(this.currentNode.id)
      // 由于发布、变更、下线的接口是异步的，所以，接口返回200后，通过节点详情接口返回的节点状态可能还是原状态，所以，前端自己处理提示信息：发布成功/下线成功/提交成功，等待审核、
      // 如果勾选了“同时发布资产”，不考虑资产的状态，提示语依当前目录节点而定
      const useWorkflow = this.currentStructure.catalogStraightPublish
      let message = ''
      let newStatus = ''
      if (useWorkflow) {
        message = this.$t('assets.common.applySuccess')
        newStatus = 'UNDER_REVIEW'
      } else {
        if (this.showOfflineCatalogue) {
          // 发布/下线
          if (this.currentNode.status === 'PUBLISHED') {
            message = this.$t('assets.common.offlineSuccess')
            newStatus = 'OFFLINE'
          }
          if (
            this.currentNode.status === 'OFFLINE' ||
            this.currentNode.status === 'UNPUBLISHED'
          ) {
            message = this.$t('assets.common.publishSuccess')
            newStatus = 'PUBLISHED'
          }
        } else {
          // 变更
          message = this.$t('assets.common.publishSuccess')
        }
      }
      this.allCatalogs[this.currentStructure.id][this.currentNode.id].status =
        newStatus
      this.currentNode.status = newStatus
      this.baseInfo.status = newStatus
      if (this.offlineForm.applyToSub && currentNode.expanded) {
        // 如果应用到子目录且当前的展开状态为是，则更新所有已展开子目录的状态
        let allChildren = []
        const curStructureNode = Object.values(
          this.allCatalogs[this.curStructureId]
        )
        let children = curStructureNode.filter(
          node => node.parentId === this.currentNode.id
        )
        // 递归获取所有已展开的子节点
        while (children.length) {
          allChildren = allChildren.concat(children)
          let newChildren = []
          children.forEach(c => {
            newChildren = newChildren.concat(
              curStructureNode.filter(node => node.parentId === c.id)
            )
          })
          children = newChildren
        }
        allChildren.forEach(c => {
          // 如果之前子目录的状态不是‘审核中’，则将子目录的状态置为最新状态，因为“应用到子目录”的操作不会改变“审核中”节点的状态
          if (c.status !== 'UNDER_REVIEW') {
            c.status = newStatus
          }
        })
      }
      this.$message({
        type: 'success',
        message,
      })
      this.close('offlineForm')
      this.close('catalogueForm')
      this.activeName = 'first'
      this.getDirInfo()
    },
    // 变更
    async changeCatalogStatus(params) {
      this.catalogBtnDisabled = true
      if (params) {
        let requestRes
        try {
          // 目录变更
          requestRes = await api.changeCatalog(params)
          if (requestRes.status === 200) {
            this.handleChangeCatalogStatusSuccess()
          } else {
            this.catalogBtnDisabled = false
            this.$showFailure(requestRes.errorMessage)
          }
        } catch (error) {
          this.catalogBtnDisabled = false
          this.$showFailure(error)
        }
      }
    },
    // 删除资产目录
    deleteDir(catalogId) {
      api
        .deleteCatalog(catalogId)
        .then(res => {
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: this.$t('assets.common.deleteSuccess'),
            })
            this.$refs.manageTree.$refs.directoryTree.remove({
              id: catalogId,
            })
            // 如果所删除节点为当前节点，将currentNode设置为所删除节点的父节点
            if (this.currentNode.id === catalogId) {
              if (this.currentNode.parentId) {
                this.currentNode =
                  this.allCatalogs[this.currentStructure.id][
                    this.currentNode.parentId
                  ]
              } else {
                const rootNodes = this.$refs.manageTree.rootNode.childNodes
                this.currentNode = rootNodes.length ? rootNodes[0].data : {}
              }
            } else {
              this.$refs.manageTree.$refs.directoryTree.setCurrentKey(
                this.currentNode.id
              )
            }
          }
        })
        .catch(error => {
          this.$showFailure(error)
        })
      this.deleteDialotVisible = false
    },

    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$blauShowFailure(this.$t('assets.catalogue.importLimit'))
        return false
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    radioClick(bool) {
      this.isProcess = bool
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$blauShowFailure(this.$t('assets.catalogue.importLimit'))
          this.fileList = []
          this.$refs.assetsUpload.showList = []
          this.$refs.assetsUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm(
          this.$t('assets.catalogue.onlyOneFile'),
          this.$t('assets.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            fileList.shift()
            this.fileList = fileList
          })
          .catch(e => {
            fileList.pop()
            this.fileList = fileList
          })
      }
      if (file.status === 'success') {
        this.uploadLoading = false
        this.fileList = []
        if (this.isCatalog) {
          this.showImport = false
          this.$bus.$emit('getTaskJobResult', file.response, 'import')
        } else {
          this.showImport = false
          this.$bus.$emit('getTaskJobResult', file.response, 'import')
        }
      } else {
        this.uploadLoading = false
      }
    },
    handleUploadError(e) {
      this.uploadLoading = false
      this.$showUploadFailure(e)
    },
    getDepartmentByKeyword(key) {
      if (key) {
        key = key.toLowerCase()
        this.departmentList = this.allDepartmentList.filter(
          item =>
            (item.fullName + item.simpleName).toLowerCase().indexOf(key) > -1
        )
      }
    },
    // 新建或修改目录 选择数据权属时的处理逻辑
    toSelectDepartment() {
      this.departmentList = []
      this.$utils.branchSelect
        .open(false, window.setting.tooManyDepartments)
        .then(res => {
          this.departmentList = [res]
          this.catalogueForm.bm = res.bm
        })
    },
    handleRouterEnter(){
      const {path,catalogId,code} = this.$route.query
      if(!code || !catalogId) return
           const structureIndex = this.structureList.findIndex(
              str => str.id == code
            )
          let info = {
            catalogPath:path,
            id:catalogId,
            structureId:code,
          }
          this.handleStructureChange(structureIndex)
          this.handleNodeClick(info)
    }
  },
  beforeDestroy() {
    this.$bus.$off('changeTreeNode')
    this.$bus.$off('changeCatalogTab')
    this.$bus.$off('changeStructure')
    this.$bus.$off('refreshCurrentNode')
  },
  watch: {
    isProcess(val) {
      if (this.isCatalog) {
        this.action = `${this.$asstes_url}/catalog/upload?status=${
          'UNPUBLISHED'
        }&structureId=${this.curStructureId}`
      }
    },
    currentNode: {
      handler(node, old) {
        this.$nextTick(() => {
          if (node && node.id && node.id !== old.id) {
            if (this.structureList.length > 0) {
              if (!node.parentId) {
                node.parentId =
                  this.allCatalogs[node.structureId][node.id]?.parentId
              }
              this.allCatalogs[node.structureId][node.id] = { ...node }
              // const breadcrumbNodes = findParents(this.allCatalogs, node)
              // this.breadcrumbNodes = breadcrumbNodes
              this.activeName = 'first'
              if (node.id !== old.id) {
                api.visitDatalog({
                  structureId: this.currentStructure.id,
                  catalogId: node.id,
                })
                this.catalogHistory.push({ ...node })
              }
              this.getDirInfo(node, true)
            }
          }
        })
      },
    },
  },
}
