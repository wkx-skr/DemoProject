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
      OfflineReason: '',
      offlineForm: {
        nameList: '',
        reason: '',
        assetAlong: false,
        applyToSub: false,
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
      algorithmsKeyMap: {
        DEPT: 'assets.summaryInfo.ownershipText',
        ASSETS_LIST: 'assets.summaryInfo.assetListTitle',
        DATA_BUTLER: 'assets.summaryInfo.stewardText',
        SECURITY_LEVEL: 'assets.summaryInfo.secLevelText',
        KEYWORDS: 'assets.commonHead.keyword',
        DESCRIPTION: 'assets.commonHead.descText',
        ENGLISH_ABBREVIATION: 'assets.commonHead.englishText',
      },
      subAssetsType: '',
      assetsListData: [], // 发布，下线（所选择的资产清单）
      isAssetsList: false, // 发布，下线（是否是资产清单
      isPublish: true,
      // 导入结果提示
      showTip: false,
      showList: {
        assetDuplicate: {}, // 重复资产
        assetNotExist: {}, // 资产不存在
        assetNotPublish: {}, // 资产未发布
        catalogError: {}, // 目录错误
        errorMsg: [], // 错误消息
        systemNameError: {}, // 系统名称错误
        connotAddAssetError: {}, // 目录类型不支持添加相关资产
        managerError: {}, // 权限错误
        failed: 0,
        success: 0,
      },
      showCatalogueTip: false,
      showCatalogueList: {
        containsSpecialCharacters: [], // 目录名称不能出现特殊字符：#  , / ,  \ ,  @,  $ ,< , >
        requiredUdpNotExist: [], // 目录必填的拓展属性未设置
        udpError: [], // 目录拓展属性枚举值错误
        approverNotExist: [], // 数据审批人不存在
        catalogNameDuplicate: [], // 目录名称重复
        deptNotExist: [], // 权属部门错误
        parentCatalogNameNotExist: [], // 父级目录为空
        parentCatalogTypeNotExist: [], // 父级目录类型不存在
        parentNotExist: [], // 父级目录不存在
        structureCannotCreateCatalog: [], // 当前目录类型不支持创建目录
        structureNotExist: [], // 目录空间名称不一致
        structureNotPublish: [], // 目录空间未发布
        noStructureAuth: [], // 无目录空间权限
        errorMsg: [], // 错误消息
        failed: 0,
        success: 0,
      },
      versionData: [],
      oldCatalogData: {},
      oldUdps: [],
      addedAssets: {},
      catalogHistory: [],
      dataCollectionAuth: [
        'EXPORT_METADATA',
        'UPDATA_METADATA',
        'METADATA_VIEW',
        'METADATA_EDIT',
        'METADATA_EDIT_CURRENT_SYSTEM',
        'EDIT_DATA_SOURCE',
      ],
      reportAuth: [
        'METADATA_TABALE_VIEW',
        'METADATA_REPORT_VIEW',
        'METADATA_REPORT_ADD',
        'METADATA_REPORT_MODIFY',
        'METADATA_REPORT_DELETE',
        'METADATA_REPORT_IMPORT',
        'METADATA_REPORT_EXPORT',
      ],
      basicStandardAuth: [
        'DATA_STANDARD_IMPORT_STANDARDS',
        'DATA_STANDARD_IMPORT_DIRECT',
        'DATA_STANDARD_EXPORT',
        'DATA_STANDARD_EXPORT_CHECKED',
        'DATA_STANDARD_ADD',
        'DATA_STANDARD_VIEW',
        'DATA_STANDARD_RELEASE',
        'DATA_STANDARD_UPDATA',
        'DATA_STANDARD_SCRAP',
        'DATA_STANDARD_EDIT',
      ],
      fileAuth: ['METADATA_FILE_VIEW'],
      standardCodeAuth: [
        'STANDARD_CODE_IMPORT_CODE',
        'STANDARD_CODE_IMPORT_DIRECT',
        'STANDARD_CODE_EXPORT',
        'STANDARD_CODE_ADD',
        'STANDARD_CODE_VIEW',
        'STANDARD_CODE_RELEASE',
        'STANDARD_CODE_UPDATA',
        'STANDARD_CODE_SCRAP',
        'STANDARD_CODE_EDIT',
        'STANDARD_CODE_EXPORT_SELECTED',
      ],
      indexAuth: [
        'DATA_STANDARD_DIM_IMPORT_STANDARDS',
        'DATA_STANDARD_DIM_IMPORT_DIRECT',
        'DATA_STANDARD_DIM_EXPORT',
        'DATA_STANDARD_DIM_EXPORT_CHECKED',
        'DATA_STANDARD_DIM_ADD',
        'DATA_STANDARD_DIM_VIEW',
        'DATA_STANDARD_DIM_RELEASE',
        'DATA_STANDARD_DIM_UPDATA',
        'DATA_STANDARD_DIM_SCRAP',
        'DATA_STANDARD_DIM_EDIT',
      ],
      serviceAuth: ['API_DEVELOP_ADMIN'],
      allCatalogs: {},
      structureList: [],
      assetsTypeMap: {},
      statusMap: {},
      approvalPage: 1,
      approvalTimeout: null,
      approvalKeyword: '',
      approvalMaxPage: 1,
      underBaseLineList: [],
      catalogBtnDisabled: false,
      approverLoading: false,
    }
  },
  computed: {
    underBaseLineTips() {
      if (
        this.OfflineTitle === this.$t('assets.commonHead.offlineAssetCatalog')
      )
        return '不影响无权限的子目录'
      if (this.underBaseLineList.length === 0) return '不影响无权限的子目录'
      return `当前目录下有不满足发布基线的子目录：${this.underBaseLineList
        .slice(0, 3)
        .join(',')}`
    },
  },
  mounted() {
    var nameValidatePass = async (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('assets.catalogue.nameRequired')))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(value)) {
          callback(new Error('目录名称不允许包含#/\\@$_%<>等特殊字符'))
        }
      }
    }
    this.rules = {
      name: [
        {
          required: true,
          // message: this.$t('assets.catalogue.nameRequired'),
          validator: nameValidatePass,
          trigger: 'blur',
        },
      ],
      catalogType: [
        {
          required: true,
          message: this.$t('assets.catalogue.selectRequired'),
          trigger: 'change',
        },
      ],
      approver: [
        {
          required: true,
          message: this.$t('assets.catalogue.selectRequired'),
          trigger: 'blur',
        },
      ],
      tagId: [
        {
          required: true,
          message: this.$t('assets.catalogue.selectRequired'),
          trigger: 'change',
        },
      ],
      bm: [
        {
          required: true,
          message: this.$t('assets.catalogue.inputRequired'),
          trigger: 'blur',
        },
      ],
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
    selectFocus(keywords) {
      this.approvalKeyword = keywords
      this.approvalPage = 1
      this.approvalMaxPage = 1
      this.getApproverList({ page: 1, keywords })
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
      api.getDirDetails(this.currentNode.id).then(res => {
        this.currentNode = {
          ...this.currentNode,
          ...res.data.data,
        }
      })
    },
    // 目录树中，判断是否可访问目录详情的方法
    authFunction(data) {
      return !(data.authType === 'MANAGER' || data.authType === 'EDIT')
    },
    // 目录树中，对没有管理权限节点的提示
    authTooltip(data) {
      return this.$t('assets.catalogue.noPermission', {
        // name: data.name,
        name: '该目录',
        type: this.$t('assets.catalogue.edit'),
      })
    },
    async initData() {
      this.loading = true
      await this.getStructureData()
      this.initResizeHorizontal()
      this.getOrgList()
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
          minWith: { leftMinWidth: 240 },
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
        if (!this.curStructureId) {
          this.curStructureId = strRes.data[0]?.id
          this.currentStructure = strRes.data[0]
          this.assetsStraightPublish =
            this.currentStructure.structureDto.assetsStraightPublish
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
        this.allCatalogs[structureId][d.id] = d
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
      api.getAttrInfo(this.currentNode.id).then(res => {
        if (res.data.status === 200) {
          handleAttrInfo(res.data.data, this)
        }
      })
    },

    // 根据资产目录id获取目录上下级数据及相关属性数据
    getDirInfo(data = this.currentNode) {
      // console.log(data)
      const { id, catalogTypeId } = data || this.currentNode
      if (id) {
        this.loading = true
        this.summaryInfo = {
          statisticsInfo: {},
          attrInfo: {},
        }
        Promise.all([
          api.getDirDetails(id),
          api.getStatisticsInfo(id),
          api.getCompleteness(catalogTypeId),
          api.getAttrInfo(id),
          api.getSubCatalogStatistics({
            catalogId: id,
            status: ['PUBLISHED', 'OFFLINE', 'UNDER_REVIEW', 'UNPUBLISHED'],
            pageNum: 1,
            pageSize: 20,
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

            const tree = this.$refs.manageTree.$refs.directoryTree.$refs.tree
            const node = tree.getNode({ id })
            const nodeData = node.data
            nodeData.name = this.baseInfo.name
            nodeData.englishName = this.baseInfo.englishName
            nodeData.comment = this.baseInfo.comment
            nodeData.allName =
              this.baseInfo.name +
              (this.baseInfo.englishName
                ? `(${this.baseInfo.englishName})`
                : ``)
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
      const currentStructure = this.structureList[structureIndex]
      this.currentStructure = {
        ...currentStructure,
        index: structureIndex,
      }
      this.assetsStraightPublish =
        currentStructure.structureDtoassetsStraightPublish
      this.curStructureId = currentStructure.id
      this.currentNode = {}
      this.catalogHistory = []
      this.baseInfo.maxLevel = currentStructure.structureDto.detailDtos.length
      const directoryTreeObj = this.$refs.manageTree.$refs.directoryTree
      directoryTreeObj && directoryTreeObj.$refs.tree.setCurrentKey(null)
      // this.allCatalogs[currentStructure.id] = {}
      this.updateAllCatalogs(
        currentStructure.dataAssetsCatalogVos,
        currentStructure.id
      )
      this.showNodeDetails = false
    },
    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.manageTree.$refs.directoryTree.$refs.tree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        const targetNode = this.allCatalogs[this.curStructureId][node]
        if (!targetNode) {
          console.log('请求子节点')
          const children = await this.getSubCatalog({ id: pathArr[i - 1] })
          tree.updateKeyChildren(pathArr[i - 1], children)
        }
      }
    },
    // 目录树 当前节点 发生变化 的回调
    async handleNodeClick(data) {
      if (data) {
        // console.log(data)
        if (this.authFunction(data)) {
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
          data.id = Number(data.id)
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
          const detailsRes = await api.getDirDetails(data.id)
          this.currentNode = {
            ...node,
            maxLevel: this.currentStructure.structureDto.detailDtos.length,
            structureIndex,
            structureId,
            ...detailsRes.data.data,
          }
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
    getAddedAssetsByType(assetType, id = '') {
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
      api
        .getAddedAssetsIds({
          catalogId: id || this.currentNode.id,
          typeList,
        })
        .then(res => {
          this.addedAssets[assetType] = res.data || []
        })
        .catch(error => this.$showFailure(error))
    },
    // 导出资产目录 和 导出数据资产
    asstesTemplate() {
      if (this.isCatalog) {
        let url =
          this.$url +
          `/service/ddc/catalog/export/template/${this.curStructureId}`
        this.$datablauDownload(
          url,
          {},
          this.$t('assets.upload.catalogTemplate')
        )
      } else {
        let url = this.$url + `/service/ddc/assets/export/template`
        this.$datablauDownload(url, {}, this.$t('assets.upload.assetsTemplate'))
      }
    },
    copyContent(data) {
      let str = ''
      Object.keys(data).map(key => {
        str += this.setName(key)
        str += '(' + data[key].length + '条)：'
        str += data[key].join('，') + ';'
      })
      return str
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
        if (u.type === 'NUM' && (u.value === null || u.value === 'null'))
          u.value = undefined
        if (u.required) {
          this.$set(this.rules, u.propName, [
            {
              required: true,
              validator: this.validateExtendProps,
              trigger: ['blur', 'change'],
            },
          ])
        }
      })
    },
    // 新增目录 - 打开新增目录模态框
    async openAddDialog(data) {
      // console.log(data)
      const structure = this.currentStructure
      const { id, structureDto } = structure
      const parentId = data ? data.id || 0 : 0
      // console.log(parentId)
      const level =
        parentId === 0
          ? 1
          : this.allCatalogs[this.curStructureId][parentId].level + 1
      this.catalogueForm.catalogTypeId =
        structureDto.detailDtos[level - 1].catalogTypeId
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
      this.catalogueTitle = this.$t('assets.commonHead.newAssetCatalog')
      this.loading = false
      this.$datablauLoading.close()
      this.showCatalogue = true
    },
    // 变更资产目录 - 打开变更模态框
    async openChangeDialog(data) {
      // 判断当前目录下是否有在审核中的资产
      const res = await api.hasUnderReviewAsset({
        catalogId: this.currentNode.id,
        structureId: this.currentNode.structureId,
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
      this.catalogueForm = { ...data, ...details.data.data }
      this.loading = false
      this.$datablauLoading.close()
      this.showCatalogue = true
    },
    // 编辑资产目录 - 打开编辑模态框
    async openEditDialog(data) {
      this.catalogueTitle = this.$t('assets.catalogue.editCatalogue')
      const details = await api.getDirDetails(data.id)
      await this.getExtendProps(data.id)
      this.loading = false
      const { bm } = details.data.data
      const department = this.allDepartmentList.filter(item => item.bm === bm)
      this.getApproverList({ page: 1, keywords: data.approver })
      this.departmentList = department
      this.catalogueForm = { ...data, ...details.data.data }
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
      // console.log(this.$auth)
      let nodeId = '' // 当前所要添加的目录id
      let structureId = '' // 所操作的数结构id
      if (option && option.path) {
        // 非当前目录，点击左侧树中，添加资产时的目录id
        this.addNodeparams = option
        nodeId = option.id
        structureId = option.structureId
      } else {
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
              this.$blauShowSuccess('资产清单同步成功')
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
          if (
            this.dataCollectionAuth.findIndex(item => this.$auth[item]) !== -1
          ) {
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
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.DATA_OBJECT:
          if (
            this.dataCollectionAuth.findIndex(item => this.$auth[item]) !== -1
          ) {
            this.assetDialogTitle = this.$t('assets.catalogue.registryObject')
            this.assetDialogVisible = true
          } else {
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.DOMAIN:
          if (
            this.basicStandardAuth.findIndex(item => this.$auth[item]) !== -1 ||
            this.standardCodeAuth.findIndex(item => this.$auth[item]) !== -1
          ) {
            this.addAssetType = 'dataStandard'
            this.assetDialogTitle = this.$t('assets.catalogue.registryStandrad')
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
            this.assetDialogVisible = true
          } else {
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.DATA_STANDARD:
          if (
            this.basicStandardAuth.findIndex(item => this.$auth[item]) !== -1
          ) {
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
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          if (
            this.standardCodeAuth.findIndex(item => this.$auth[item]) !== -1
          ) {
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
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.INDEX:
          if (this.indexAuth.findIndex(item => this.$auth[item]) !== -1) {
            this.addAssetType = 'dataIndex'
            this.assetDialogTitle = this.$t('assets.catalogue.registryIndex')
            this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
          } else {
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.REPORT:
          if (this.reportAuth.findIndex(item => this.$auth[item]) !== -1) {
            this.addAssetType = 'report'
            this.assetDialogTitle = this.$t('assets.catalogue.registryReport')
            this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'name',
            }
          } else {
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.FILE:
          if (this.fileAuth.findIndex(item => this.$auth[item]) !== -1) {
            this.addAssetType = 'file'
            this.assetDialogTitle = this.$t('assets.catalogue.registryFile')
            this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'nodeName',
            }
          } else {
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case AssetsTypeEnum.DATA_SERVICE:
          if (this.serviceAuth.findIndex(item => this.$auth[item]) !== -1) {
            this.addAssetType = 'service'
            this.assetDialogTitle = this.$t('assets.catalogue.registryService')
            this.assetDialogVisible = true
            this.defaultProps = {
              children: 'nodes',
              label: 'apiCatalog',
            }
          } else {
            this.$showFailure(this.$t('assets.catalogue.noModulePermission'))
          }
          break
        case 'offline':
          this.isPublish = false
          this.OfflineReason = this.$t('assets.catalogue.offlineReason')
          if (option && option.type && option.type === 'assetsData') {
            this.showOfflineCatalogue = true
            this.isAssetsList = true
            this.openOfflineDialog(option.id)
            this.OfflineTitle = this.$t('assets.commonHead.offlineAssetData')
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
          this.OfflineReason = this.$t('assets.catalogue.publishReason')
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
                    'assets.commonHead.publishAssetData'
                  )
                  this.assetsListData = option.data
                  // 获取父级目录审批人
                  this.openOfflineDialog(option.id)
                })
                .catch(e => {
                  console.log(e)
                })
            } else {
              this.OfflineTitle = this.$t('assets.commonHead.publishAssetData')
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
            this.action = `${this.$url}/service/ddc/catalog/upload?status=${this.isProcess ? 'UNPUBLISHED' : 'PUBLISHED'
              }&structureId=${this.curStructureId}`
            this.importTitle = this.$t('assets.commonHead.importCatalogue')
          } else {
            // 导入资产
            this.isCatalog = false
            this.actionName = 'file'
            this.structureId = structureId
            if (option.type === 'whole') {
              // 通过当前结构导入资产
              this.action = `${this.$url
                }/service/ddc/assets/import/structure/${structureId}?status=${this.isProcess ? 'UNPUBLISHED' : 'PUBLISHED'
                }`
            } else {
              this.action = `${this.$url
                }/service/ddc/assets/import/${structureId}?status=${this.isProcess ? 'UNPUBLISHED' : 'PUBLISHED'
                }`
            }
            this.importTitle = this.$t('assets.commonHead.importAssetCatalog')
          }
          break
        case 'export':
          let url = ''
          if (option.type === 'whole') {
            // 当前结构下的全部资产
            url =
              this.$url + `/service/ddc/assets/export/structure/${structureId}`
            api.exportAssetsByStructureId(structureId).then(res => {
              this.$bus.$emit('getTaskJobResult', res.data, 'export')
            })
          } else {
            api.exportAssetsByCatalogId(option).then(res => {
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
      this.addAssetType = name
      if (
        name === AssetsTypeEnum.DATA_COLLECTION ||
        name === AssetsTypeEnum.TABLE ||
        name === AssetsTypeEnum.VIEW ||
        name === AssetsTypeEnum.DATA_STANDARD ||
        name === AssetsTypeEnum.DATA_STANDARD_CODE ||
        name === 'DATA_OBJECT' ||
        name === 'INDEX' ||
        name === 'REPORT' ||
        name === 'FILE' ||
        name === 'DATA_SERVICE'
      ) {
        this.getAddedAssetsByType(name, nodeId)
      }
      if (name === AssetsTypeEnum.DOMAIN) {
        this.getAddedAssetsByType(AssetsTypeEnum.DATA_STANDARD, nodeId)
        this.getAddedAssetsByType(AssetsTypeEnum.DATA_STANDARD_CODE, nodeId)
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
          if (!bm) {
            this.$showFailure('请先完善目录数据权属')
            basicValid = false
          }
          if (!approver) {
            this.$showFailure('请先完善目录审批人')
            basicValid = false
          }
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
                      .catch(() => { })
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
            name: '',
            catalogType: '',
            englishName: '',
            approver: '',
            bm: '',
            tagId: '',
            keyword: '',
            comment: '',
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
          this.offlineForm.applyToSub = false
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
      let formDefs = []
      for (let i = 0; i < dataList.length; i++) {
        const nameList = dataList[i].catalogNamePath.split('/')
        const catalogName = dataList[i].name || nameList[nameList.length - 1]
        formDefs.push({
          // 资产id
          code: 'assetsId',
          value: dataList[i].assetsId,
        })
        formDefs.push({
          // 资产名字
          code: 'assetsName',
          value: dataList[i].assetsName,
        })
        formDefs.push({
          // 资产类型
          code: 'assetsType',
          value: dataList[i].subAssetsType,
        })
        formDefs.push({
          // 数据权属
          code: 'deptName',
          value: dataList[i].deptName,
        })
        formDefs.push({
          // 数据安全等级
          code: 'assetsSecurityLevel',
          value: dataList[i].assetsSecurityLevel,
        })
        formDefs.push({
          // 权威来源
          code: 'authoritativeSource',
          value: dataList[i].sourcePath,
        })
        formDefs.push({
          // 所在资产目录
          code: 'catalogName',
          value: catalogName,
        })
        formDefs.push({
          // 资产状态
          code: 'currentStatus',
          value: dataList[i].status,
        })
        formDefs.push({
          // 申请原因
          code: 'applyReason',
          value: this.offlineForm.reason,
        })
      }
      const catalogName = dataList[0].name || dataList[0].catalogName
      const params = {
        processType: this.isPublish ? '资产发布申请' : '资产下线申请', // 中文写死的，不要国际化
        formDefs: [
          {
            code: 'assetsData',
            value: JSON.stringify(formDefs),
          },
          {
            code: 'type',
            value: 'assets',
          },
          {
            code: 'structureId',
            value: this.currentNode.structureId,
          },
          {
            code: 'applyReason',
            value: this.offlineForm.reason,
          },
          {
            code: 'catalogName',
            value: catalogName,
          },
          {
            code: 'catalogId',
            value: this.currentNode.id,
          },
        ],
      }
      return params
    },
    // 审批发布，下线资产清单
    async sendApply(dataList) {
      let pList = []
      // 批量
      const params = this.getAssetsProcessParams(dataList)
      api
        .updateCatalogStatus(params)
        .then(res => {
          this.close('offlineForm')
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
        })
        .catch(e => {
          this.close('offlineForm')
          this.$refs.assetsList.getList()
          this.$showFailure(e)
        })
    },
    // 通过数据权属部门code获取数据权属名称
    getDeptNameByCode(code) {
      const department = this.allDepartmentList.find(item => item.bm === code)
      return department ? department.fullName : ''
    },
    /**
     *
     * @param {*} flag 0：发布 1：变更  2: 下线
     * @returns
     */
    async getCatalogProcessParams(flag) {
      // 获取目录路径
      const parents = findParents(this.allCatalogs, this.currentNode).map(
        item => item.name
      )
      const { id, name, keyword, englishName, comment, bm, approver } =
        flag !== 1 ? this.currentNode : this.catalogueForm
      // 获取审批人详情
      const approvalRes = await api.getAllUserPage({
        currentPage: 1,
        pageSize: 5,
        username: approver,
        fullUserName: '',
        enabled: true,
      })
      let currentApprover = approvalRes.data.content[0] || {}

      // 申请原因，如果是变更，申请原因在catalogueForm中，否则在offlineForm中
      const applyReason =
        flag === 1 ? this.catalogueForm.reason : this.offlineForm.reason
      const commonParams = {
        // deptId: this.allDepartmentList.find(item => item.code === bm).id,
        currentStatus: this.currentNode.status, // 目录状态
        catalogType: this.currentNode.catalogType, // 目录类型
        applyReason, // 申请原因
        catalogPath: parents.join('/'), // 目录路径
        catalogName: name, // 目录名称
        abbreviation: englishName, // 英文简称
        directoryStructure:
          this.structureList[this.currentNode.structureIndex].name, // 目录空间
        department: this.getDeptNameByCode(bm), // 数据权属（部门）
        catalogKeywords: keyword, // 目录关键字
        describe: comment, // 目录描述
        bm,
        catalogId: this.currentNode.id, // 目录id
        approver: null,
        approverId: null,
        approverName: null,
        dataSteward: this.summaryInfo.attrInfo.steward, // 数据管家
      }
      const paramsMap = { ...commonParams }
      paramsMap.approver = currentApprover.fullUserName // 审批人名称
      paramsMap.approverId = currentApprover.id // 审批人id
      paramsMap.approverName = `${currentApprover.fullUserName}(${currentApprover.username})` // 审批人全称（用户名和登陆名）
      paramsMap.isPubSub = flag === 0 ? this.offlineForm.applyToSub : undefined // 发布时，是否应用操作到子目录
      paramsMap.isOffSub = flag === 2 ? this.offlineForm.applyToSub : undefined // 下线时，是否应用操作到子目录
      let oldParams = { ...commonParams }
      if (flag === 1) {
        // 目录变更时，追增扩展属性的相关参数
        if (this.udps.length) {
          paramsMap.catalogExtensions = this.udps.map(udp => {
            return {
              proName: udp.propName,
              proValue: udp.value,
            }
          })
        }
        // 整理变更前的信息
        const { name, keyword, bm, englishName, approver, comment } =
          this.oldCatalogData
        const approvalRes = await api.getAllUserPage({
          currentPage: 1,
          pageSize: 5,
          username: approver,
          fullUserName: '',
          enabled: true,
        })
        let oldApprover = approvalRes.data.content[0] || {}
        oldParams.catalogName = name
        oldParams.abbreviation = englishName
        oldParams.department = this.getDeptNameByCode(bm)
        oldParams.catalogKeywords = keyword
        oldParams.describe = comment
        oldParams.approver = oldApprover.fullUserName
        oldParams.approverId = oldApprover.id
        oldParams.approverName = `${oldApprover.fullUserName}(${oldApprover.username})`

        if (this.oldUdps.length) {
          oldParams.catalogExtensions = this.oldUdps.map(udp => {
            return {
              proName: udp.propName,
              proValue: udp.value,
            }
          })
        }
      }
      const processType = ['发布目录申请', '变更目录申请', '下线目录申请'][flag]
      let params = {
        processType, // 发布，下线状态只有中文（不要国际化）
        reviewed: currentApprover.username,
        formDefs:
          flag === 1
            ? [
              {
                code: 'oldCatalogData',
                value: JSON.stringify(oldParams),
              },
              {
                code: 'newCatalogData',
                value: JSON.stringify(paramsMap),
              },
              {
                code: 'applyReason',
                value: applyReason,
              },
              {
                code: 'currentStatus',
                value: this.currentNode.status,
              },
            ]
            : Object.keys(paramsMap).map(key => {
              return {
                code: key,
                value: paramsMap[key],
              }
            }),
      }

      // 目录发布或下线时，如果选择同时发布资产清单，则需调接口查询未发布及已下线的资产，并将其整理成资产发布、下线时所需的参数
      if (flag !== 1 && this.offlineForm.assetAlong) {
        this.isPublish = flag === 0
        let assetsRes
        // 是否应用操作到子目录 如果是，需查询该目录下所有未发布或已下线的资产，如果不是，查询该目录下直接挂载的资产
        if (this.offlineForm.applyToSub) {
          assetsRes = await api.getAllAssetsByStatus({
            catalogId: this.currentNode.id,
            status: flag === 0 ? ['UNPUBLISHED', 'OFFLINE'] : ['PUBLISHED'],
            structureId: this.curStructureId,
          })
        } else {
          assetsRes = await api.getAssetsByStatus({
            catalogId: this.currentNode.id,
            status: flag === 0 ? ['UNPUBLISHED', 'OFFLINE'] : ['PUBLISHED'],
          })
        }
        const assets = assetsRes.data.data || []
        let parmasArr = [params]
        if (assets.length) {
          const assetsProcessParams = this.getAssetsProcessParams(
            assets.map(asset => {
              const {
                id,
                itemName,
                itemType,
                assetsId,
                assetsName,
                subAssetsType,
                deptCode,
                catalogNamePath,
                status,
                tagName,
                sourcePath,
              } = asset
              return {
                assetsId: assetsId || id,
                assetsName: assetsName || itemName,
                subAssetsType: subAssetsType || itemType,
                deptName: deptCode ? this.getDeptNameByCode(deptCode) : '',
                assetsSecurityLevel: tagName,
                status,
                catalogNamePath,
                sourcePath,
                catalogName: name,
              }
            })
          )
          // console.log(assetsProcessParams)
          parmasArr.push(assetsProcessParams)
        }
        return parmasArr
      }
      return params
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
      try {
        const res = await api.submitNewDir({
          ...this.catalogueForm,
          parentId: this.parentId,
          catalogPath,
          udpDtos: this.udps,
          order: maxOrder + 1,
        })

        if (res.data.status === 200) {
          // 新增保存成功
          this.$message({
            type: 'success',
            message: this.$t('assets.common.saveSuccess'),
          })
          const parentId = this.parentId
          this.close('catalogueForm')
          if (!parentId) {
            this.$refs.manageTree.refreshData()
          }
          const nodeDetailsRes = await api.getDirDetails(res.data.data.id)
          this.handleNodeClick({
            ...nodeDetailsRes.data.data,
            authType: 'MANAGER',
            structureId: this.curStructureId,
          })
        } else {
          this.$showFailure(res.errorMsg)
        }
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 变更时，提交内容
    changeCatalog() {
      // 需要判断变更后的目录属性是否符合完整度阈值
      api
        .getCompletenessByOptions({
          ...this.catalogueForm,
          udpDtos: this.udps,
        })
        .then(async res => {
          // console.log(res)
          if (res.data) {
            this.changeCatalogStatus(await this.getCatalogProcessParams(1))
          } else {
            this.$showFailure(this.$t('assets.catalogue.cannotAlter'))
          }
        })
    },
    // 编辑时，提交内容
    editCatalog() {
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
              message: this.$t('assets.common.saveSuccess'),
            })
            const { id, parentId } = this.catalogueForm
            const node = this.allCatalogs[this.curStructureId][id]
            // const parentNode = this.allCatalogs[this.curStructureId][parentId]
            // if (parentId) {
            //   this.$refs.manageTree.refreshData(parentNode)
            // } else {
            //   this.$refs.manageTree.refreshData()
            // }
            if (this.currentNode.id === id) {
              this.getDirInfo(node)
            } else {
              this.handleNodeClick(node)
            }
            this.catalogueTitle = this.$t('assets.commonHead.newAssetCatalog')
            this.close('catalogueForm')
          }
        })
        .catch(e => {
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
                // 资产目录 发布、变更、下线
                this.catalogBtnDisabled = true
                let params
                if (
                  this.OfflineTitle ===
                  this.$t('assets.commonHead.publishAssetCatalog')
                ) {
                  // 发布
                  params = await this.getCatalogProcessParams(0)
                } else if (
                  this.OfflineTitle ===
                  this.$t('assets.commonHead.offlineAssetCatalog')
                ) {
                  // 下线
                  params = await this.getCatalogProcessParams(2)
                }
                this.changeCatalogStatus(params)
              }
            } else {
              return false
            }
          })
          break
        case 'importForm':
          if (this.fileList.length > 0) {
            this.uploadLoading = true
            this.$refs.assetsUpload.$refs.upload.submit()
          } else {
            this.$message.warning(this.$t('assets.common.uploadTip'))
          }
          break
        default:
          break
      }
    },
    // 发布、变更、下线
    async changeCatalogStatus(params) {
      this.catalogBtnDisabled = true
      if (params) {
        let requestRes
        try {
          if (this.showOfflineCatalogue && this.offlineForm.assetAlong) {
            // 目录和资产同时发布或下线
            requestRes = await api.updateCatalogAndAssetStatus(params)
          } else {
            // 目录单独发布、变更、下线
            requestRes = await api.updateCatalogStatus(params)
          }
          // console.log(params)
          // console.log(requestRes)
          // return

          if (requestRes.status === 200) {
            const currentNode =
              this.$refs.manageTree.$refs.directoryTree.$refs.tree.getNode({
                id: this.currentNode.id,
              })
            // console.log(currentNode)
            const r = await api.getDirDetails(this.currentNode.id)
            let message = this.$t('assets.common.submitSuccess')
            if (r.data && r.data.data && r.data.data.status === 'PUBLISHED') {
              message =
                this.$t('assets.common.publish') +
                this.$t('assets.common.success')
            }
            if (r.data && r.data.data && r.data.data.status === 'OFFLINE') {
              message =
                this.$t('assets.common.offline') +
                this.$t('assets.common.success')
            }
            if (
              r.data &&
              r.data.data &&
              r.data.data.status === 'UNDER_REVIEW'
            ) {
              message = this.$t('assets.common.applySuccess')
            }
            const newStatus = r.data.data.status
            this.allCatalogs[this.currentStructure.id][
              this.currentNode.id
            ].status = newStatus
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
            this.getDirInfo(this.currentNode)
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
            this.$refs.manageTree.$refs.directoryTree.$refs.tree.remove({
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
              this.$refs.manageTree.$refs.directoryTree.$refs.tree.setCurrentKey(
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
    setName(type) {
      let result = ''
      switch (type) {
        case AssetsTypeEnum.DATA_COLLECTION:
        case AssetsTypeEnum.TABLE:
          result = this.$t('assets.assetList.dataSheet')
          break
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.assetList.view')
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.assetList.dataItem')
          break
        case AssetsTypeEnum.DATA_SERVICE:
          result = this.$t('assets.assetList.dataService')
          break
        case AssetsTypeEnum.DATA_STANDARD:
          result = this.$t('assets.assetList.dataStandard')
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = this.$t('assets.assetList.standardCode')
          break
        case AssetsTypeEnum.FILE:
          result = this.$t('assets.assetList.file')
          break
        case AssetsTypeEnum.INDEX:
          result = this.$t('assets.generalSettings.index')
          break
        case AssetsTypeEnum.REPORT:
          result = this.$t('assets.generalSettings.report')
          break
        default:
          break
      }
      return result
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
            // this.$showFailure(e)
          })
      }
      if (file.status === 'success') {
        this.uploadLoading = false
        this.fileList = []
        if (this.isCatalog) {
          // // 每次文件上传，清空提示信息
          // this.showCatalogueList = {
          //   containsSpecialCharacters: [], // 目录名称不能出现特殊字符：#  , / ,  \ ,  @,  $ ,< , >
          //   requiredUdpNotExist: [], // 目录必填的拓展属性未设置
          //   udpError: [], // 目录拓展属性枚举值错误
          //   approverNotExist: [], // 数据审批人不存在
          //   catalogNameDuplicate: [], // 目录名称重复
          //   deptNotExist: [], // 权属部门错误
          //   parentCatalogNameNotExist: [], // 父级目录为空
          //   parentCatalogTypeNotExist: [], // 父级目录类型不存在
          //   parentNotExist: [], // 父级目录不存在
          //   structureCannotCreateCatalog: [], // 当前目录类型不支持创建目录
          //   structureNotExist: [], // 目录空间名称不一致
          //   structureNotPublish: [], // 目录空间未发布
          //   noStructureAuth: [], // 无目录空间权限
          //   errorMsg: [], // 错误消息
          //   failed: 0,
          //   success: 0,
          // }
          // let newList = []
          // const fileCataloue = file.response
          // Object.keys(fileCataloue).map(key => {
          //   let newMap = {}
          //   // containsSpecialCharacters: [], // 目录名称不能出现特殊字符：#  , / ,  \ ,  @,  $ ,< , >
          //   switch (key) {
          //     case 'containsSpecialCharacters':
          //       newMap.title = this.$t(
          //         'assets.upload.containsSpecialCharacters'
          //       )
          //       newMap.type = 'error'
          //       break
          //     case 'requiredUdpNotExist':
          //       newMap.title = this.$t('assets.upload.requiredUdpNotExist')
          //       newMap.type = 'error'
          //       break
          //     case 'udpError':
          //       newMap.title = this.$t('assets.upload.udpError')
          //       newMap.type = 'error'
          //       break
          //     case 'approverNotExist':
          //       newMap.title = this.$t('assets.upload.noApprover')
          //       newMap.type = 'error'
          //       break
          //     case 'catalogNameDuplicate':
          //       newMap.title = this.$t('assets.upload.catalogNameRepeat')
          //       newMap.type = 'same'
          //       break
          //     case 'deptNotExist':
          //       newMap.title = this.$t('assets.upload.departmentError')
          //       newMap.type = 'error'
          //       break
          //     case 'parentCatalogNameNotExist':
          //       newMap.title = this.$t('assets.upload.nullParentCatalog')
          //       newMap.type = 'error'
          //       break
          //     case 'parentCatalogTypeNotExist':
          //       newMap.title = this.$t('assets.upload.noParentCatalogType')
          //       newMap.type = 'error'
          //       break
          //     case 'parentNotExist':
          //       newMap.title = this.$t('assets.upload.noParentCatalog')
          //       newMap.type = 'error'
          //       break
          //     case 'structureCannotCreateCatalog':
          //       newMap.title = this.$t('assets.upload.notSupportCatalog')
          //       newMap.type = 'error'
          //       break
          //     case 'structureNotExist':
          //       newMap.title = this.$t('assets.upload.noCatalogType')
          //       newMap.type = 'error'
          //       break
          //     case 'structureNotPublish':
          //       newMap.title = this.$t('assets.upload.structureNotOpen')
          //       newMap.type = 'same'
          //       break
          //     case 'noStructureAuth':
          //       newMap.title = this.$t('assets.upload.noStructureAuth')
          //       newMap.type = 'same'
          //       break
          //     case 'errorMsg':
          //       newMap.title = this.$t('assets.upload.errorMessage')
          //       newMap.type = 'error'
          //       break
          //     case 'failed':
          //       newMap.title = this.$t('assets.upload.errorMessage')
          //       newMap.type = 'error'
          //       break
          //     case 'success':
          //       newMap.title = this.$t('assets.upload.errorMessage')
          //       newMap.type = 'success'
          //       break
          //     default:
          //       break
          //   }
          //   if (key === 'failed' || key === 'success') {
          //     if (fileCataloue[key]) {
          //       newMap.data = fileCataloue[key]
          //       newMap.id = key
          //       newList.push(newMap)
          //     }
          //   } else {
          //     if (fileCataloue[key].length > 0) {
          //       newMap.data = fileCataloue[key]
          //       newMap.id = key
          //       newList.push(newMap)
          //     }
          //   }
          // })
          // this.showCatalogueList = newList
          // if (this.showCatalogueList.length > 0) {
          //   this.showCatalogueList.map(item => {
          //     if (
          //       item.id === 'success' &&
          //       this.showCatalogueList.length === 1
          //     ) {
          //       this.$blauShowSuccess(this.$t('assets.upload.success'))
          //     } else {
          //       this.showCatalogueTip = true
          //     }
          //   })
          // } else {
          //   this.$blauShowFailure(this.$t('assets.upload.fileEmpty'))
          // }
          // console.log(file.response)
          this.showImport = false
          this.$bus.$emit('getTaskJobResult', file.response, 'import')
          // this.initTree(true, this.currentStructureIndex)
        } else {
          this.showImport = false
          this.$bus.$emit('getTaskJobResult', file.response, 'import')
          // this.showList = {
          //   assetDuplicate: {},
          //   assetNotExist: {},
          //   assetNotPublish: {},
          //   catalogError: {},
          //   errorMsg: [],
          //   systemNameError: {},
          //   connotAddAssetError: {},
          //   managerError: {},
          //   failed: 0,
          //   success: 0,
          // }
          // this.showImport = false
          // const responseData = file.response.data
          // Object.keys(responseData.assetDuplicate).map(key => {
          //   if (responseData.assetDuplicate[key].length > 0) {
          //     this.showList.assetDuplicate[key] =
          //       responseData.assetDuplicate[key]
          //   }
          // })
          // Object.keys(responseData.assetNotExist).map(key => {
          //   if (responseData.assetNotExist[key].length > 0) {
          //     this.showList.assetNotExist[key] = responseData.assetNotExist[key]
          //   }
          // })
          // Object.keys(responseData.assetNotPublish).map(key => {
          //   if (responseData.assetNotPublish[key].length > 0) {
          //     this.showList.assetNotPublish[key] =
          //       responseData.assetNotPublish[key]
          //   }
          // })
          // Object.keys(responseData.catalogError).map(key => {
          //   if (responseData.catalogError[key].length > 0) {
          //     this.showList.catalogError[key] = responseData.catalogError[key]
          //   }
          // })
          // Object.keys(responseData.systemNameError).map(key => {
          //   if (responseData.systemNameError[key].length > 0) {
          //     this.showList.systemNameError[key] =
          //       responseData.systemNameError[key]
          //   }
          // })
          // Object.keys(responseData.connotAddAssetError).map(key => {
          //   if (responseData.connotAddAssetError[key].length > 0) {
          //     this.showList.connotAddAssetError[key] =
          //       responseData.connotAddAssetError[key]
          //   }
          // })
          // Object.keys(responseData.managerError).map(key => {
          //   if (responseData.managerError[key].length > 0) {
          //     this.showList.managerError[key] = responseData.managerError[key]
          //   }
          // })
          // this.showList.errorMsg = responseData.errorMsg
          // this.showList.success = responseData.success
          // this.showList.failed = responseData.failed
          // if (
          //   Object.keys(this.showList.assetDuplicate).length === 0 &&
          //   Object.keys(this.showList.assetNotExist).length === 0 &&
          //   Object.keys(this.showList.assetNotPublish).length === 0 &&
          //   Object.keys(this.showList.catalogError).length === 0 &&
          //   Object.keys(this.showList.systemNameError).length === 0 &&
          //   Object.keys(this.showList.connotAddAssetError).length === 0 &&
          //   Object.keys(this.showList.managerError).length === 0 &&
          //   this.showList.errorMsg.length === 0
          // ) {
          //   if (responseData.failed !== 0) {
          //     this.showTip = true
          //     // this.initTree(this.currentStructureIndex)
          //     // 当添加资产后，如果当前为资产清单tab页面时，需要刷新资产清单
          //     if (this.activeName === 'second') {
          //       this.$nextTick(() => {
          //         this.$refs.assetsList.getList()
          //       })
          //     }
          //     if (this.activeName === 'first') {
          //       this.$nextTick(() => {
          //         this.getDirInfo(this.currentNode)
          //       })
          //     }
          //   } else {
          //     this.showImport = false
          //     if (responseData.success === 0) {
          //       this.$blauShowFailure(this.$t('assets.upload.fileEmpty'))
          //     } else {
          //       this.$blauShowSuccess(this.$t('assets.upload.success'))
          //       // this.initTree(this.currentStructureIndex)
          //       // 当添加资产后，如果当前为资产清单tab页面时，需要刷新资产清单
          //       if (this.activeName === 'second') {
          //         this.$nextTick(() => {
          //           this.$refs.assetsList.getList()
          //         })
          //       }
          //       if (this.activeName === 'first') {
          //         this.$nextTick(() => {
          //           this.getDirInfo(this.currentNode)
          //         })
          //       }
          //     }
          //   }
          // } else {
          //   this.showTip = true
          //   // 当添加资产后，如果当前为资产清单tab页面时，需要刷新资产清单
          //   if (this.activeName === 'second') {
          //     this.$nextTick(() => {
          //       this.$refs.assetsList.getList()
          //     })
          //   }
          //   if (this.activeName === 'first') {
          //     this.$nextTick(() => {
          //       this.getDirInfo(this.currentNode)
          //     })
          //   }
          // }
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
      this.$utils.branchSelect.open().then(res => {
        this.departmentList = [res]
        this.catalogueForm.bm = res.bm
      })
    },
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
        this.action = `${this.$url}/service/ddc/catalog/upload?status=${this.isProcess ? 'UNPUBLISHED' : 'PUBLISHED'
          }&structureId=${this.curStructureId}`
      } else {
        if (this.structureId) {
          this.action = `${this.$url}/service/ddc/assets/import/${this.structureId
            }?status=${this.isProcess ? 'UNPUBLISHED' : 'PUBLISHED'}`
        }
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
}
