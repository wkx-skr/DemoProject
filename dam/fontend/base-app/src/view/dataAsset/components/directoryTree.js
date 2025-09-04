import mockData from '../data.js'
import api from '../utils/api.js'
import AddAssetsDialog from './addAssetsDialog.vue'
import { findParents, formatTreeData } from '../utils/methods'
import folder from '../../../assets/images/search/folder.svg'
export default {
  name: 'directoryTree',
  props: {
    getSubCatalog: Function,
    editable: {
      type: Boolean,
      default: true,
    },
    structureList: Array,
    allCatalogs: {
      type: Object,
      default() {
        return {}
      },
    },
    currentNode: Object,
    clickNode: {
      type: Function,
    },
    isOverview: {
      type: Boolean,
      default: false,
    },
    curStructureId: {
      type: [String, Number],
      default: '',
    },
    authFunction: {
      type: Function,
    },
    pageId: Number,
    directoryTreeKey: Number,
  },
  components: { AddAssetsDialog },
  data() {
    return {
      showUnFold: true,
      dirId: 1,
      operateNode: {},
      childrenVisible: false,
      treeLoading: false,
      loading: false,
      dirKeyword: '',
      dropdownVisible: false,
      defaultProps: {
        children: 'children',
        label: 'allName',
        isLeaf: 'isLeaf',
      },
      handleNodeClickData: {},
      ruleForm: {
        parentId: [],
        name: '',
        englishName: '',
        comment: '',
      },
      currentId: '',
      parentId: '',
      currentDepth: '',
      currentParentId: '',
      expandedKeys: [],
      // 新增业务域或主题
      dirDialogTitle: '',
      dirDialogVisible: false,
      dirData: {
        extendProp: {},
      },
      formLabelWidth: '80px',
      dirRules: {
        name: [
          {
            required: true,
            message: this.$t('assets.catalogue.dirNameRequired'),
            trigger: 'blur',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('assets.catalogue.dirTypeRequired'),
            trigger: 'blur',
          },
        ],
      },
      dirTypeList: mockData.dirTypeList,
      approverList: mockData.approverList,
      securityLevelList: mockData.securityLevelList,
      departmentList: [],
      deleteDialogVisible: false,
      addAssetType: '',
      assetDialogTitle: '',
      moveDialogVisible: false,
      dataAssetTypeMap: {
        DATA_OBJECT: this.$t('assets.summaryInfo.object'),
        DATA_COLLECTION: this.$t('assets.summaryInfo.table'),
        TABLE: this.$t('assets.summaryInfo.table'),
        VIEW: this.$t('assets.summaryInfo.view'),
        DOMAIN: this.$t('assets.summaryInfo.standard'),
        DATA_STANDARD: this.$t('assets.summaryInfo.basicStandard'),
        DATA_STANDARD_CODE: this.$t('assets.summaryInfo.standardCode'),
        INDEX: this.$t('assets.summaryInfo.index'),
        REPORT: this.$t('assets.summaryInfo.report'),
        FILE: this.$t('assets.summaryInfo.file'),
        DATA_SERVICE: this.$t('assets.summaryInfo.service'),
      },
      currentMoveData: [],
      structureOptions: [],
      currentStructureIndex: null,
      publicShow: true,
      isStructureManager: false,
      searchTimer: null,
      searchResult: [],
      chooseResult: '',
      searchLoading: false,
      noDataText: '',
      resolve: null,
      rootNode: null,
      showClose: false,
    }
  },
  computed: {
    currentTreeData() {
      return this.structureList[this.currentStructureIndex]
        ? Array.from(
            this.structureList[this.currentStructureIndex].dataAssetsCatalogVos
          ).map(item => ({
            ...item,
            isLeaf: !item.hasChild,
          }))
        : []
    },
    currentStructureName() {
      return this.structureList[this.currentStructureIndex]
        ? this.structureList[this.currentStructureIndex].name
        : ''
    },
  },
  watch: {
    structureList: {
      handler(val) {
        if (val && val.length) {
          const index = this.currentStructureIndex
          this.structureOptions = val.map(tree => ({
            name: tree.name,
            hasPermission: tree.structureManager,
          }))
        }
      },
      immediate: true,
      deep: true,
    },
    curStructureId: {
      handler(val) {
        if (val) {
          const index =
            this.structureList.findIndex(item => item.id === val) > -1
              ? this.structureList.findIndex(item => item.id === val)
              : 0
          this.isStructureManager = this.structureList[index].structureManager
          this.currentStructureIndex = index
          this.maxLevel =
            this.structureList[index].structureDto.detailDtos.length
          this.publicShow = this.structureList[index].structureDto.publicShow
          this.clickNode('structureIndex', {
            type: 'structure',
            data: {
              structureIndex: this.currentStructureIndex,
            },
          })
        }
      },
      immediate: true,
    },
    currentNode: {
      handler(node, old) {
        if (node && node.id) {
          this.expandParents(node)
          this.currentId = node.id
        }
      },
      deep: true,
      immediate: true,
    },
    operateNode: {
      handler(node, old) {
        // console.log(node)
        if (node.id) {
          this.expandParents(node, false)
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    handleChooseSelectFocus() {
      if (!this.chooseResult && !this.showClose) {
        this.searchResult = []
      }
    },
    // 获取搜索结果
    async searchCatalog(keyword) {
      if (keyword) {
        this.showClose = true
      }
      if (this.curStructureId) {
        this.searchResult = []
        keyword.trim().length > 1
          ? (this.noDataText = '无数据')
          : (this.noDataText = '请输入至少两个字符进行搜索')
        if (keyword.trim().length > 1) {
          this.searchLoading = true
          try {
            const searchRes = await api.getCatalogsByKeyword(
              this.pageId,
              this.curStructureId,
              keyword.trim()
            )
            const result = searchRes.data || []
            result.forEach(item => {
              item.catalogNamePath = item.catalogNamePath + item.name
            })
            this.searchResult = result
            this.searchLoading = false
          } catch (error) {
            this.searchLoading = false
            this.$showFailure(error)
          }
        }
      }
    },
    // 选择搜索结果
    handleChooseChange(target) {
      if (target) {
        this.showClose = false
        // this.$datablauLoading.loading()
        const targetNode = this.searchResult.find(item => item.id === target)
        this.$emit('node-click', {
          ...targetNode,
          structureIndex: this.currentStructureIndex,
        })
        this.chooseResult = ''
        this.searchResult = []
      } else {
        this.searchResult = []
      }
    },
    // 树懒加载
    async loadCallback(node = {}, resolve) {
      if (node.level === 0) {
        this.resolve = resolve
        this.rootNode = node
      }
      node.childNodes = []
      const nodes = await this.getSubCatalog(node.data)
      // console.log(nodes)
      resolve(
        nodes.map(item => ({
          ...item,
          isLeaf: !item.hasChild,
        }))
      )
    },
    async refreshData(data) {
      if (data) {
        const node = this.$refs.directoryTree.$refs.tree.getNode({
          id: data.id,
        })
        const treeRes = await this.getSubCatalog(node.data)
        if (this.$refs.directoryTree) {
          const tree = this.$refs.directoryTree.$refs.tree
          tree.updateKeyChildren(
            node.data.id,
            Array.from(treeRes).map(item => ({
              ...item,
              isLeaf: !item.hasChild,
            }))
          )
          tree.setCurrentKey(this.currentNode.id)
        }
      } else {
        this.loadCallback(this.rootNode, this.resolve)
      }
    },
    // 将当前节点的所有父级节点展开
    expandParents(node, setKey = true) {
      const structureNodes = this.allCatalogs[node.structureId]
      if (structureNodes) {
        let parentNode = structureNodes[node.parentId]
        const directoryTree = this.$refs.directoryTree
        if (directoryTree) {
          const tree = directoryTree.$refs.tree
          while (parentNode) {
            const treeNode = tree.getNode(parentNode.id)
            // console.log(treeNode)
            if (treeNode) {
              treeNode.isLeaf = false
              treeNode.expanded = true
            }
            parentNode = structureNodes[parentNode.parentId]
          }
          setKey && tree.setCurrentKey(node.id)
        }
      }
    },
    changeDropdownVisible(visible) {
      this.dropdownVisible = visible
    },
    changeStructure(index) {
      // 切换目录后，树默认展开，目录树搜索关键词清空
      this.showUnFold = true
      this.dirKeyword = ''
      this.chooseResult = ''
      this.searchResult = []
      this.$bus.$emit('changeStructure', index)
    },
    clickRoot() {
      this.$bus.$emit('changeStructure', this.currentStructureIndex)
    },
    // 目录树 查找 逻辑
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.nodeName)
      return false
    },
    // 展开收起树
    expandOrCollapse() {
      const tree = this.$refs.directoryTree.$refs.tree
      if (this.showUnFold) {
        Object.keys(this.allCatalogs[this.curStructureId]).forEach(key => {
          const targetNode = tree.getNode({ id: key })
          if (targetNode) {
            targetNode.expanded = false
          }
        })
      } else {
        Object.keys(this.allCatalogs[this.curStructureId]).forEach(key => {
          const targetNode = tree.getNode({ id: key })
          if (targetNode) {
            targetNode.expanded = true
          }
        })
      }
      this.showUnFold = !this.showUnFold
    },
    callbottomContent(evt) {
      const index = this.currentStructureIndex
      const row = this.structureList[index]
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      options.push(
        {
          icon: 'iconfont icon-tianjia',
          label: this.$t('assets.commonHead.newAssetCatalog'),
          callback: data => {
            this.clickNode('catalogue', {
              type: 'add',
              data: {
                structureIndex: index,
              },
            })
          },
        },
        {
          icon: 'iconfont icon-export',
          label: this.$t('assets.catalogue.exportCatalog'),
          callback: () => {
            this.exportDirectory(row)
          },
        },
        {
          icon: 'iconfont icon-import',
          label: this.$t('assets.catalogue.importCatalog'),
          callback: () => {
            this.importDirectory(row)
          },
        }
      )
      if (this.$auth.DATA_ASSET_MANAGE_EXPORT) {
        options.push({
          icon: 'iconfont icon-export',
          label: this.$t('assets.commonHead.exportDataAssets'),
          callback: () => {
            this.clickNode('export', {
              type: 'whole',
            })
          },
        })
      }
      if (this.$auth.DATA_ASSET_MANAGE_IMPORT) {
        options.push({
          icon: 'iconfont icon-import',
          label: this.$t('assets.commonHead.importAssetCatalog'),
          callback: () => {
            this.clickNode('import', {
              type: 'whole',
            })
          },
        })
      }
      options.push({
        icon: 'iconfont icon-shezhi',
        label: this.$t('assets.catalogue.structureDetails'),
        callback: () => {
          this.dirKeyword = ''
          this.$bus.$emit('changeStructure', index)
        },
      })
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
        })
      }
    },
    // 目录树节点是否具有访问权限
    dataLockedFunction(data) {
      return this.authFunction && this.authFunction(data)
    },
    // 目录树没有权限时的提示
    dataLockedTip(data) {
      const permissionType = ['编辑', '访问', '管理']
      return new Promise((resolve, reject) => {
        return resolve(data =>
          api
            .getPermission({
              id: data.id,
              type: 'PERSON',
            })
            .then(res => {
              return Promise.resolve(
                this.$t('assets.catalogue.noPermission', {
                  // name: data.name,
                  name: '该目录',
                  type: permissionType[this.pageId],
                }) +
                  `，管理员：${res.data.userAuthDtos
                    .filter(user => user.authType === 'MANAGER')
                    .map(item => item.fullUserName)
                    .join(',')}`
              )
            })
        )
      })
    },
    // 目录树操作菜单
    dataOptionsFunction(data) {
      data = {
        ...data,
        ...this.allCatalogs[this.curStructureId][data.id],
      }
      // console.log('operateNode============', data)
      // this.operateNode = data
      const allAssetsList = data.assetsType?.split(',') || []
      let assetsTypeList = []
      if (allAssetsList.length > 0 && this.$featureMap.FE_META) {
        if (
          allAssetsList.includes('DATA_COLLECTION') ||
          allAssetsList.includes('TABLE')
        ) {
          assetsTypeList = assetsTypeList.concat(['TABLE'])
        }
        const feMeatList = allAssetsList.filter(
          item =>
            item === 'VIEW' ||
            item === 'DATA_OBJECT' ||
            item === 'REPORT' ||
            item === 'FILE'
        )

        assetsTypeList = assetsTypeList.concat(feMeatList)
      }
      if (this.$featureMap.FE_MEASURE && allAssetsList.length > 0) {
        const feMeasureList = allAssetsList.filter(item => item === 'INDEX')
        assetsTypeList = assetsTypeList.concat(feMeasureList)
      }
      if (this.$featureMap.FE_DOMAIN && allAssetsList.length > 0) {
        const feDomainList = allAssetsList.filter(
          item =>
            item === 'DOMAIN' ||
            item === 'DATA_STANDARD' ||
            item === 'DATA_STANDARD_CODE'
        )
        assetsTypeList = assetsTypeList.concat(feDomainList)
      }
      if (this.$featureMap.FE_SERVICE && allAssetsList.length > 0) {
        const feServiceList = allAssetsList.filter(
          item => item === 'DATA_SERVICE'
        )
        assetsTypeList = assetsTypeList.concat(feServiceList)
      }
      const types = assetsTypeList
      // 通过allCatalogs获取节点的最新状态（针对目录直接发布，未更新树节点状态的情况）
      const node = this.allCatalogs[this.curStructureId][data.id]
      const { parentId, level, status } = node
      const params = {
        id: data.id, // 点击当前树节点的id
        path: data.catalogPath,
        structureId: data.structureId, // 树结构id
        index: this.structureIndex,
      }
      return [
        level < this.maxLevel &&
        data.assetsType &&
        data.assetsType.indexOf('CATALOG') !== -1
          ? {
              icon: 'iconfont icon-tianjia',
              label: this.$t('assets.common.newSubdirectory'),
              callback: () => {
                this.operateNode = data
                this.clickNode('catalogue', {
                  type: 'add',
                  parentId: data.id,
                  data,
                })
              },
            }
          : '',
        ...types.map(item => {
          return {
            label: this.$t('assets.common.add') + this.dataAssetTypeMap[item],
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.operateNode = data
              // 增加数据资产
              this.clickNode(item, params)
            },
          }
        }),
        types.length
          ? {
              icon: 'iconfont icon-import',
              label: this.$t('assets.commonHead.importAssetCatalog'),
              callback: () => {
                this.operateNode = data
                this.clickNode('import', params)
              },
            }
          : '',
        types.length
          ? {
              icon: 'iconfont icon-export',
              label: this.$t('assets.commonHead.exportDataAssets'),
              callback: () => {
                this.operateNode = data
                this.clickNode('export', data)
              },
            }
          : '',
        parentId !== 0
          ? {
              icon: 'iconfont icon-Moveto',
              label: this.$t('assets.common.moveTip'),
              disabled: status === 'PUBLISHED' || status === 'UNDER_REVIEW',
              callback: () => {
                this.operateNode = data
                this.showMoveDialog()
              },
            }
          : '',
        {
          icon: 'iconfont icon-revise',
          label: this.$t('assets.common.modify'),
          disabled: status === 'PUBLISHED' || status === 'UNDER_REVIEW',
          callback: () => {
            this.operateNode = data
            this.editDir(data)
          },
        },
        {
          icon: 'iconfont icon-delete',
          label: this.$t('assets.common.delete'),
          disabled: status === 'PUBLISHED' || status === 'UNDER_REVIEW',
          callback: () => {
            this.operateNode = data
            this.deleteDialogVisible = true
          },
        },
      ].filter(item => item !== '')
    },
    // 目录树节点图标
    dataImgFunction(data, node) {
      const targetStructure = this.structureList.find(
        tree => tree.id === data.structureId
      )
      const icon = targetStructure.structureDto.detailDtos[data.level - 1].icon
      return icon
        ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
            targetStructure.structureDto.detailDtos[data.level - 1].icon
        : folder
    },
    // 点击目录树节点
    handleNodeClick(data, node) {
      this.handleNodeClickData = data
      this.ruleForm.parentId = []
      this.currentId = data.id
      this.parentId = data.parentId
      this.currentDepth = node.level
      // 点击当前节点不做处理
      if (node) {
        this.currentParentId = data.id
        if (data.id === this.currentNode.id && this.isOverview) {
          this.$emit('node-click', {
            ...data,
          })
        } else {
          this.$emit('node-click', {
            ...data,
            structureIndex: this.currentStructureIndex,
          })
        }
      }
    },

    // 点击树结构
    // handleStructure(index, name) {
    //   if (this.isOverview) {
    //     const structureId = this.structureList[index].id
    //     const params = {
    //       id: structureId,
    //       index,
    //       name: name,
    //     }
    //     this.$nextTick(() => {
    //       this.$refs.directoryTree &&
    //         this.$refs.directoryTree.$refs.tree.setCurrentKey('')
    //       this.$emit('structureClick', { ...params })
    //     })
    //   }
    // },
    // 显示移动目录对话框
    showMoveDialog() {
      const sameLevelData = []
      const structureNodes = this.allCatalogs[this.operateNode.structureId]
      Object.keys(structureNodes).forEach(key => {
        const nodeItem = structureNodes[key]
        if (nodeItem.level === this.operateNode.level - 1) {
          sameLevelData.push(structureNodes[key])
        }
      })
      if (sameLevelData.length) {
        let catalogData = [...sameLevelData]
        sameLevelData.forEach(item => {
          const parents = findParents(this.allCatalogs, {
            ...item,
            structureIndex: this.operateNode.structureIndex,
          }).map(item => ({
            ...item,
            isLeaf: !item.hasChild,
          }))
          parents.forEach(p => {
            if (!catalogData.find(data => data.id === p.id)) catalogData.push(p)
          })
        })
        catalogData.forEach(data => {
          if (
            data.level !== this.operateNode.level - 1 ||
            data.id === this.operateNode.parentId
          ) {
            data.disabled = true
          } else {
            data.disabled = false
          }
        })
        // const treeData = formatTreeData(catalogData)
        this.currentMoveData = formatTreeData(catalogData)
        // this.currentMoveData = []
        this.moveDialogVisible = true
      } else {
        this.$showFailure(this.$t('assets.catalogue.noMove'))
      }
    },
    // 根据关键字模糊查询部门（数据权属）
    getDepartmentByKeyword(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.departmentList = mockData.ownerList.filter(item => {
            return item.fullName.indexOf(query) > -1
          })
        }, 200)
      } else {
        this.departmentList = []
      }
    },
    // 移动目录时选择目标目录时的回调
    selectTargetDir(data) {
      // console.log(data, this.operateNode)
      if (data.level !== this.operateNode.level - 1) {
        this.$showFailure(this.$t('assets.catalogue.sameLevel'))
        this.$refs.moveTree.$refs.tree.setCurrentKey(this.selectedTargetDir)
      } else if (data.id === this.operateNode.parentId) {
        this.$showFailure(this.$t('assets.catalogue.cannotMove'))
        this.$refs.moveTree.$refs.tree.setCurrentKey(this.selectedTargetDir)
      } else {
        this.$refs.moveTree.$refs.tree.setCheckedNodes([data])
        this.selectedTargetDir = data
      }
    },
    // 移动目录(跨级移动) - 确定
    moveDir() {
      if (this.operateNode.status === 'PUBLISHED') {
        this.$message({
          type: 'warning',
          message: this.$t('assets.common.canNotMove'),
        })
      } else {
        this.$datablauLoading.loading()
        const id = this.operateNode.id
        const node = this.$refs.directoryTree.$refs.tree.getNode({
          id,
        })
        api
          .changeDirPath({
            id,
            parentId: this.selectedTargetDir.id,
          })
          .then(async res => {
            if (res.status === 200) {
              this.moveDialogVisible = false
              await this.$parent.getTreeData()
              const nodeDetailsRes = await api.getDirDetails(id)
              node.data = {
                ...node.data,
                ...nodeDetailsRes.data.data,
              }
              this.handleNodeClick(node.data, node)
              this.$message({
                type: 'success',
                message: this.$t('assets.common.moveSuccessful'),
              })
              this.$datablauLoading.close()
            } else {
              this.$datablauLoading.close()
              this.$showFailure('移动失败')
            }
          })
          .catch(res => {
            this.$datablauLoading.close()
            this.$showFailure(res)
          })
      }
    },
    allowNodeDrop(draggingNode, dropNode, type) {
      // console.log(draggingNode, dropNode, type)
      if (
        type !== 'inner' &&
        draggingNode.data.parentId === dropNode.data.parentId
      ) {
        if (draggingNode.data.id !== dropNode.data.id) {
          if (!dropNode.parent || !draggingNode.parent) {
            let temp = []
            dropNode.parent.childNodes.forEach(item => {
              temp.push(item.data)
            }) // 手动为跟节点添加上data属性
            dropNode.parent.data = temp
          }
          return true
        }
        // return true
      } else {
        return false
      }
    },
    // 同级目录移动
    async moveSameLevelNode(draggingNode, dropNode, dropType, event) {
      // console.log(draggingNode, dropNode, dropType)
      if (dropType === 'inner') return
      if (draggingNode.data.parentId !== dropNode.data.parentId) return
      if (draggingNode.data.id === dropNode.data.id) return

      const params = dropNode.parent.childNodes.map((item, index) => ({
        catalogId: item.data.id,
        order: index + 1,
      }))

      await api.changeCatalogOrder(params)
      this.refreshData({ id: dropNode.data.parentId })
    },
    // 修改资产目录
    editDir(data) {
      this.clickNode('catalogue', {
        type: 'edit',
        data,
      })
    },
    // 下载资产目录模板
    downloadDirectory() {
      let url = this.$url + `/service/ddc/catalog/export/template`
      this.$datablauDownload(url, {}, this.$t('assets.upload.catalogTemplate'))
    },
    // 导出资产目录
    exportDirectory(row) {
      // console.log(row)
      // let url = this.$url + `/service/ddc/catalog/export/` + row.id
      // this.$datablauDownload(url, {}, this.$t('assets.logs.assetCatalog'))
      this.$datablauLoading.loading()
      api
        .exportCatalog(row.id)
        .then(res => {
          this.$datablauLoading.close()
          if (res.status === 200) {
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          } else {
            this.$blauShowFailure(res)
          }
        })
        .catach(error => {
          this.$blauShowFailure(error)
        })
    },
    // 导入资产目录
    importDirectory(row) {
      this.clickNode('import', {
        type: 'catalogue',
        structureId: row.id, // 下载模板时需要结构树id
      })
    },
    // 删除资产目录
    deleteDir() {
      // console.log(this.operateNode)
      this.$emit('delete', this.operateNode.id)
      this.deleteDialogVisible = false
    },
    // 新增一级目录
    addFirstLevel(index) {
      this.clickNode('catalogue', {
        type: 'add',
        data: {
          structureIndex: index,
        },
      })
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
}
