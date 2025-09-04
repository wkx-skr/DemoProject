import mockData from '../data.js'
import api from '../utils/api.js'
import AddAssetsDialog from './addAssetsDialog.vue'
import folder from '../../../assets/images/search/folder.svg'
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import {
  hasDataSetAuth,
  hasReportAuth,
  hasFileAuth,
  hasIndexAuth,
  hasStandardAuth,
  hasCodeAuth,
  hasServiceAuth,
} from '@/view/dataAsset/utils/methods'

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
  components: { AddAssetsDialog, IsShowTooltip },
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
      moveTreeProps: {
        children: 'children',
        label: 'name',
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
            message: this.$t('assets.directoryTree.dirNameRequired'),
            trigger: 'blur',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('assets.directoryTree.dirTypeRequired'),
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
        DATA_OBJECT: this.$t('assets.generalSettings.object'),
        DATA_COLLECTION: this.$t('assets.generalSettings.table'),
        TABLE: this.$t('assets.generalSettings.table'),
        VIEW: this.$t('assets.generalSettings.view'),
        DOMAIN: this.$t('assets.generalSettings.standard'),
        DATA_STANDARD: this.$t('assets.generalSettings.basicStandard'),
        DATA_STANDARD_CODE: this.$t('assets.generalSettings.standardCode'),
        INDEX: this.$t('assets.generalSettings.index'),
        REPORT: this.$t('assets.generalSettings.report'),
        FILE: this.$t('assets.generalSettings.file'),
        META_MODEL: '自定义对象',
        METAMODEL_OBJECT: '自定义对象',
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
      moveResolve: null,
      moveRootNode: null,
      showClose: false,
      moveBtnDisabled: false,
      selectedTargetDir: null,
      treeKey: 0,
      defaultExpandedKeys: new Set(),
      metaModelTypes: {},
    }
  },
  computed: {
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
            hasPermission: tree.isStructureManager,
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
          this.isStructureManager = this.structureList[index].isStructureManager
          this.currentStructureIndex = index
          this.maxLevel = this.structureList[index].detailDtos.length
          this.publicShow = this.structureList[index].publicShow
          this.clickNode('structureIndex', {
            type: 'structure',
            data: {
              structureIndex: this.currentStructureIndex,
            },
          })
        }
        this.treeKey++
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
  mounted() {
    this.getMetaModelTypes()
  },
  methods: {
    getMetaModelTypes() {
      api
        .getMetaModelTypes()
        .then(res => {
          let metaModelTypes = {}
          let data = res.data || []
          data.forEach(item => {
            metaModelTypes[item.assetKey] = item.name
          })
          this.metaModelTypes = metaModelTypes
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleNodeExpand(data) {
      this.defaultExpandedKeys.add(data.id)
    },
    handleNodeCollapse(data) {
      this.defaultExpandedKeys.delete(data.id)
    },
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
          ? (this.noDataText = this.$t('assets.directoryTree.noResult'))
          : (this.noDataText = this.$t('assets.directoryTree.characterLimit'))
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
          isSearch: true,
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
    // 树懒加载
    async loadMoveTreeCallback(node = {}, resolve) {
      // console.log(node)
      if (node && node.level === 0) {
        this.moveResolve = resolve
        this.moveRootNode = node
      }
      node.childNodes = []
      const nodes = await this.getSubCatalog(node.data)
      // console.log(nodes)
      resolve(
        nodes.map(item => ({
          ...item,
          isLeaf: !item.hasChild,
          disabled:
            item.level !== this.operateNode.level - 1 ||
            item.id === this.operateNode.parentId,
        }))
      )
    },
    async refreshData(data) {
      if (data) {
        const node = this.$refs.directoryTree.getNode({
          id: data.id,
        })
        const treeRes = await this.getSubCatalog(node ? node.data : {})
        if (this.$refs.directoryTree) {
          const tree = this.$refs.directoryTree
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
          const tree = directoryTree
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
      const tree = this.$refs.directoryTree
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
      options.push({
        icon: 'iconfont icon-tianjia',
        label: this.$t('assets.directoryTree.newAssetCatalog'),
        callback: data => {
          this.clickNode('catalogue', {
            type: 'add',
            data: {
              structureIndex: index,
            },
          })
        },
      })
      if (this.$auth.DATA_ASSET_MANAGE_CATALOG_EXPORT) {
        options.push({
          icon: 'iconfont icon-export',
          label: this.$t('assets.directoryTree.exportCatalog'),
          callback: () => {
            this.exportDirectory(row)
          },
        })
      }
      if (this.$auth.DATA_ASSET_MANAGE_CATALOG_IMPORT && this.$auth.DATA_CATALOG_IMPORT) {
        options.push({
          icon: 'iconfont icon-import',
          label: this.$t('assets.directoryTree.importCatalog'),
          callback: () => {
            this.importDirectory(row)
          },
        })
      }
      // if (this.$auth.DATA_ASSET_MANAGE_EXPORT) {
      //   options.push({
      //     icon: 'iconfont icon-export',
      //     label: this.$t('assets.directoryTree.exportDataAssets'),
      //     callback: () => {
      //       this.clickNode('export', {
      //         type: 'whole',
      //         data: {
      //           name: row.name,
      //           structureId: row.id,
      //         },
      //       })
      //     },
      //   })
      // }
      // if (this.$auth.DATA_ASSET_MANAGE_IMPORT) {
      //   options.push({
      //     icon: 'iconfont icon-import',
      //     label: this.$t('assets.directoryTree.importAssetCatalog'),
      //     callback: () => {
      //       this.clickNode('import', {
      //         type: 'whole',
      //         data: {
      //           name: row.name,
      //           structureId: row.id,
      //         },
      //       })
      //     },
      //   })
      // }
      options.push({
        icon: 'iconfont icon-shezhi',
        label: this.$t('assets.directoryTree.structureDetails'),
        callback: () => {
          this.dirKeyword = ''
          this.$bus.$emit('changeStructure')
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
      return this.authFunction && this.authFunction(data) && this.$auth.DATA_CATALOG_SELECT
    },
    // 目录树没有权限时的提示
    dataLockedTip(data) {
      const permissionType = [
        this.$t('assets.directoryTree.editPermissions'),
        this.$t('assets.directoryTree.visitPermissions'),
        this.$t('assets.directoryTree.managePermissions'),
      ]
      return new Promise((resolve, reject) => {
        return resolve(data =>
          api
            .getPermission({
              id: data.id,
              type: 'PERSON',
            })
            .then(res => {
              return res.data.userAuthDtos
                ? Promise.resolve(
                    this.$t('assets.directoryTree.noPermission', {
                      type: permissionType[this.pageId],
                    }) +
                      '，' +
                      this.$t('assets.directoryTree.manageTips', {
                        names: res.data.userAuthDtos
                          .filter(user => user.authType === 'MANAGER')
                          .map(item => `${item.fullUserName}(${item.username})`)
                          .join(','),
                      })
                  )
                : Promise.resolve(this.$t('assets.directoryTree.noManager'))
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
          item => item === 'VIEW' || item === 'DATA_OBJECT'
        )

        assetsTypeList = assetsTypeList.concat(feMeatList)
        if (this.$versionFeature.dataasset_CatalogType) {
          assetsTypeList = assetsTypeList.concat(
            allAssetsList.filter(item => item === 'FILE')
          )
        }
        if (this.$versionFeature.dataasset_CatalogType) {
          assetsTypeList = assetsTypeList.concat(
            allAssetsList.filter(item => item === 'REPORT')
          )
        }
      }
      if (this.$featureMap.FE_DOMAIN && allAssetsList.length > 0) {
        const feDomainList = allAssetsList.filter(
          item =>
            item === 'DOMAIN' ||
            item === 'DATA_STANDARD' ||
            item === 'DATA_STANDARD_CODE' ||
            item === 'INDEX'
        )
        assetsTypeList = assetsTypeList.concat(feDomainList)
      }
      let hasMetaModel = false
      let metaModelTypes = []
      allAssetsList.forEach(item => {
        if (this.metaModelTypes[item]) {
          hasMetaModel = true
          metaModelTypes.push(item)
        }
      })
      if (hasMetaModel) {
        // assetsTypeList = assetsTypeList.concat('META_MODEL')
        assetsTypeList = assetsTypeList.concat('METAMODEL_OBJECT')
      } else {
        metaModelTypes = null
      }
      const types = assetsTypeList
      // 通过allCatalogs获取节点的最新状态（针对目录直接发布，未更新树节点状态的情况）
      const node = this.allCatalogs[this.curStructureId][data.id]
      if (node) {
        const { parentId, level, status, authType } = node
        let params = {
          id: data.id, // 点击当前树节点的id
          path: data.catalogPath,
          structureId: data.structureId, // 树结构id
          index: this.structureIndex,
          metaModelTypes: metaModelTypes,
        }
        return [
          level < this.maxLevel &&
          data.assetsType &&
          data.assetsType.indexOf('CATALOG') !== -1 &&
          level !== 3 &&
          level !== 4 &&
          level !== 5
            ? {
                icon: 'iconfont icon-tianjia',
                label: this.$t('assets.directoryTree.new'),
                disabled: authType !== 'MANAGER' && authType !== 'EDIT',
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
          types.length && level !== 4 && level !== 5
            ? {
                icon: 'iconfont icon-import',
                label: this.$t('assets.directoryTree.import'),
                disabled: authType !== 'MANAGER' && authType !== 'EDIT',
                callback: () => {
                  this.operateNode = data
                  params.catalogName = data.name
                  this.clickNode('import', params)
                },
              }
            : '',
          types.length && level !== 4 && level !== 5
            ? {
                icon: 'iconfont icon-export',
                label: this.$t('assets.directoryTree.export'),
                disabled: authType !== 'MANAGER' && authType !== 'EDIT',
                callback: () => {
                  this.operateNode = data
                  this.clickNode('export', data)
                },
              }
            : '',
          parentId !== 0
            ? {
                icon: 'iconfont icon-Moveto',
                label: this.$t('assets.directoryTree.moveTip'),
                disabled: (status === 'PUBLISHED' || status === 'UNDER_REVIEW') || (authType !== 'MANAGER' && authType !== 'EDIT'),
                callback: () => {
                  this.operateNode = data
                  this.showMoveDialog()
                },
              }
            : '',
          level !== 4 && level !== 5
            ? {
                icon: 'iconfont icon-revise',
                label: this.$t('assets.directoryTree.edit'),
                disabled: status !== 'UNPUBLISHED' || (authType !== 'MANAGER' && authType !== 'EDIT'),
                callback: () => {
                  this.operateNode = data
                  this.editDir(data)
                },
              }
            : '',
          level !== 4 && level !== 5
            ? {
                icon: 'iconfont icon-delete',
                label: this.$t('assets.directoryTree.delete'),
                disabled: (status === 'PUBLISHED' || status === 'UNDER_REVIEW') || (authType !== 'MANAGER' && authType !== 'EDIT'),
                callback: () => {
                  this.operateNode = data
                  api.isCatalogInUse(data.id).then(res => {
                    let tips = ''
                    if (res.data && res.data.data) {
                      tips = this.$t('assets.directoryTree.deleteTip2', {
                        name: this.operateNode.name,
                      })
                    } else {
                      tips = this.$t('assets.directoryTree.deleteTip', {
                        name: this.operateNode.name,
                      })
                    }
                    this.$DatablauCofirm(
                      tips,
                      this.$t('assets.directoryTree.deleteCatalogTip'),
                      {
                        type: 'warning',
                      }
                    ).then(() => {
                      this.$emit('delete', this.operateNode.id)
                    })
                  })
                },
              }
            : '',
        ].filter(item => item !== '')
      }
    },
    // 目录树节点图标
    dataImgFunction(data, node) {
      const targetStructure = this.structureList.find(
        tree => tree.id === data.structureId
      )
      const icon = targetStructure.detailDtos[data.level - 1].icon
      return icon
        ? window.setting.products.dam.assetsUrl +
            '/config/icon/' +
            targetStructure.detailDtos[data.level - 1].icon
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
        this.loadMoveTreeCallback(this.moveRootNode, this.moveResolve)
        this.moveDialogVisible = true
      } else {
        this.$showFailure(this.$t('assets.directoryTree.noMove'))
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
      if (data.level !== this.operateNode.level - 1) {
        this.$showFailure(this.$t('assets.directoryTree.sameLevel'))
        this.$refs.moveTree.setCurrentKey(this.selectedTargetDir)
      } else if (data.id === this.operateNode.parentId) {
        this.$showFailure(this.$t('assets.directoryTree.cannotMove'))
        this.$refs.moveTree.setCurrentKey(this.selectedTargetDir)
      } else {
        if (this.selectedTargetDir && this.selectedTargetDir.id == data.id) {
          this.selectedTargetDir = []
          this.moveBtnDisabled = false
          this.$nextTick(() => {
            this.$refs.moveTree.setCheckedKeys([])
          })
        } else {
          this.selectedTargetDir = data
          this.moveBtnDisabled = true
          this.$nextTick(() => {
            this.$refs.moveTree.setCheckedKeys([data.id])
          })
        }
      }
    },
    // 移动目录(跨级移动) - 确定
    moveDir() {
      if (this.operateNode.status === 'PUBLISHED') {
        this.$message({
          type: 'warning',
          message: this.$t('assets.directoryTree.canNotMove'),
        })
      } else {
        const id = this.operateNode.id
        const oldParentId = this.operateNode.parentId
        const newParentId = this.selectedTargetDir.id
        const node = this.$refs.directoryTree.getNode({
          id,
        })
        this.moveBtnDisabled = true
        api
          .changeDirPath({
            id,
            parentId: newParentId,
          })
          .then(async res => {
            if (res.status === 200) {
              this.$refs.directoryTree.remove({
                id,
              })
              const parentNode = this.$refs.directoryTree.getNode({
                id: newParentId,
              })
              if (parentNode) {
                parentNode.expanded = false
                parentNode.isLeaf = false
                await this.refreshData({ id: newParentId })
              } else {
                await this.$parent.getAllSubCatalog(
                  `${this.selectedTargetDir.catalogPath}${this.selectedTargetDir.id}/${id}`
                )
              }
              await this.refreshData({ id: oldParentId })
              this.selectedTargetDir = null
              this.$refs.moveTree.setCheckedNodes([])
              this.moveDialogVisible = false
              this.$message({
                type: 'success',
                message: this.$t('assets.directoryTree.moveSuccessful'),
              })
              if (this.currentNode.id === id) {
                if (this.$parent.activeName == 'second') {
                  this.$parent.$refs.assetsList.getList()
                }
                this.$parent.getDirInfo({ ...node.data, parentId: newParentId })
              } else {
                this.handleNodeClick(node.data, node)
              }
              this.moveBtnDisabled = false
            } else {
              this.moveBtnDisabled = false
              this.$showFailure(this.$t('assets.directoryTree.moveFailure'))
            }
          })
          .catch(res => {
            // this.$datablauLoading.close()
            this.moveBtnDisabled = false
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
      let parentNode
      if (draggingNode.data.parentId) {
        parentNode = this.$refs.directoryTree.getNode({
          id: draggingNode.data.parentId,
        })
        parentNode.expanded = false
        parentNode.loaded = false
      }
      const params = dropNode.parent.childNodes.map((item, index) => ({
        catalogId: item.data.id,
        order: index + 1,
      }))
      const orderRes = await api.changeCatalogOrder(params)
      if (orderRes.status === 200) {
        this.$blauShowSuccess(this.$t('assets.directoryTree.sortSuccess'))
      } else {
        this.$blauShowFailure(orderRes)
      }
      if (parentNode) {
        parentNode.expand()
      } else {
        await this.refreshData()
      }
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
      let url = this.$asstes_url + `/catalog/export/template`
      this.$datablauDownload(
        url,
        {},
        this.$t('assets.directoryTree.catalogTemplate')
      )
    },
    // 导出资产目录
    exportDirectory(row) {
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
