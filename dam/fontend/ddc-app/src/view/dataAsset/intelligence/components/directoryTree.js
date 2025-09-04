import api from '../../utils/api.js'
import folder from '../../../../assets/images/search/folder.svg'
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import {
  hasDataSetAuth,
  hasReportAuth,
  hasFileAuth,
} from '@/view/dataAsset/utils/methods'
export default {
  name: 'directoryTree',
  props: {
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
    pageId: {type: Number,default: 0},
    directoryTreeKey: Number,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    canCheckType: {
      type: String,
      default: '',
    },
    checkedNode: {
      default: null,
    },
    selectList: {
      type: Array
    },
    cloumnType: {
      type: Array,
      default: () => []
    },
    typeTree: {
      type: String,
      default: '',
    }
  },
  components: { IsShowTooltip },
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
      addAssetType: '',
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
      },
      structureList: [],
      currentStructure: {},
      publicShow: true,
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
      allCatalogs: {},
      currentKey: '',
      // checkedKeys: []
    }
  },
  computed: {
    checkedKeys () {
      // return this.selectList.map(v => v.id)
    }
  },
  watch: {},
  mounted() {
    api.getStructureList('MANAGE').then(res => {
      const structureList = res.data || []
      this.structureList = structureList
      this.currentStructure = structureList[0] || {}
    })
  },
  methods: {
    // 更新全部树节点
    updateAllCatalogs(data, structureId = this.curStructureId) {
      structureId = structureId || this.currentStructure.id
      if (!Array.isArray(data)) data = [data]
      data.forEach(d => {
        if (!this.allCatalogs[structureId]) this.allCatalogs[structureId] = {}
        if (d && d.id) {
          this.allCatalogs[structureId][d.id] = d
          let catalogIds = d.catalogPath.split('/').filter(v => v)
          d.catalogPathName = ''
          catalogIds.forEach(v => {
            v!=='0' && (d.catalogPathName += this.allCatalogs[structureId][v].name + '/')
          })
          d.catalogPathName += d.name
        }
      })
    },
    // 获取目录树子节点
    async getSubCatalog(data = {}, type) {
      if (this.currentStructure && this.currentStructure.id) {
        const subCatalogRes = await api.getCatalogList(
          0,
          this.currentStructure.id,
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
          if (item.authType !== 'MANAGER' && item.authType !== 'EDIT') {
            item.disabled = true
          }
          if (this.canCheckType && !item.disabled) {
            let type = this.canCheckType
            switch (type) {
              case 'COLUMN':
                if (!item.assetsType.includes('DATA_OBJECT')) {
                  item.disabled = true
                }
                break
              case 'TABLE_VIEW':
                if (
                  !item.assetsType.includes('TABLE') &&
                  !item.assetsType.includes('VIEW')
                ) {
                  item.disabled = true
                }
                break
              default:
                if (!item.assetsType.includes(type)) {
                  item.disabled = true
                }
                break
            }
          }
          if (this.cloumnType.length && !item.disabled) {
            let flag = false
            this.cloumnType.forEach(v => {
              !item.assetsType.includes(v) && (flag = true)
            })
            item.disabled = flag
          }
          this.expandedKeys.indexOf(item.parentId) === -1 && this.expandedKeys.push(item.parentId)
        })
         setTimeout(() => {
           this.$refs.directoryTree.setCurrentKey(this.currentKey)
         }, 0)
        this.updateAllCatalogs(dataAssetsCatalogVos)
        return dataAssetsCatalogVos
      } else {
        return []
      }
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
      if (this.curStructureId || this.currentStructure.id) {
        this.searchResult = []
        keyword.trim().length > 1
          ? (this.noDataText = this.$t('assets.directoryTree.noResult'))
          : (this.noDataText = this.$t('assets.directoryTree.characterLimit'))
        if (keyword.trim().length > 1) {
          this.searchLoading = true
          try {
            const searchRes = await api.getCatalogsByKeyword(
              this.pageId,
              (this.curStructureId || this.currentStructure.id),
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
        /*const targetNode = this.searchResult.find(item => item.id === target)
        this.$emit('node-click', {
          ...targetNode,
          structureIndex: this.currentStructureIndex,
          isSearch: true,
        })*/
        this.chooseResult = ''
        this.searchResult = []
        let targets = target.split('-')
        let ids = targets[1].split('/').filter(v => v)
        ids.forEach(v => {
          this.getSubCatalog({id: v}, 'set')
        })
        this.currentKey = targets[0]

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
      resolve(
        nodes.map(item => ({
          ...item,
          isLeaf: !item.hasChild,
        }))
      )
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
      this.currentStructure = this.structureList[index]
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
      if (this.$auth.DATA_ASSET_MANAGE_CATALOG_IMPORT) {
        options.push({
          icon: 'iconfont icon-import',
          label: this.$t('assets.directoryTree.importCatalog'),
          callback: () => {
            this.importDirectory(row)
          },
        })
      }
      if (this.$auth.DATA_ASSET_MANAGE_EXPORT) {
        options.push({
          icon: 'iconfont icon-export',
          label: this.$t('assets.directoryTree.exportDataAssets'),
          callback: () => {
            this.clickNode('export', {
              type: 'whole',
              data: {
                name: row.name,
                structureId: row.id,
              },
            })
          },
        })
      }
      if (this.$auth.DATA_ASSET_MANAGE_IMPORT) {
        options.push({
          icon: 'iconfont icon-import',
          label: this.$t('assets.directoryTree.importAssetCatalog'),
          callback: () => {
            this.clickNode('import', {
              type: 'whole',
              data: {
                name: row.name,
                structureId: row.id,
              },
            })
          },
        })
      }
      options.push({
        icon: 'iconfont icon-shezhi',
        label: this.$t('assets.directoryTree.structureDetails'),
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
        if (this.$versionFeature.metadata_File) {
          assetsTypeList = assetsTypeList.concat(
            allAssetsList.filter(item => item === 'FILE')
          )
        }
        if (this.$versionFeature.metadata_Report) {
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
      const types = assetsTypeList
      // 通过allCatalogs获取节点的最新状态（针对目录直接发布，未更新树节点状态的情况）
      const node = this.allCatalogs[this.curStructureId][data.id]
      if (node) {
        const { parentId, level, status } = node
        let params = {
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
                label: this.$t('assets.directoryTree.new'),
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
              label:
                this.$t('assets.directoryTree.registry') +
                this.dataAssetTypeMap[item],
              icon: 'iconfont icon-tianjia',
              callback: () => {
                let result = false
                switch (item) {
                  case 'TABLE':
                  case 'VIEW':
                  case 'DATA_OBJECT':
                    result = hasDataSetAuth(this)
                    break
                  case 'REPORT':
                    result = hasReportAuth(this)
                    break
                  case 'FILE':
                    result = hasFileAuth(this)
                    break
                  default:
                    break
                }
                if (!result) {
                  this.$blauShowSuccess(
                    this.$t('assets.directoryTree.noModulePermission'),
                    'warning'
                  )
                  return
                }
                this.operateNode = data
                // 增加数据资产
                this.clickNode(item, params)
              },
            }
          }),
          types.length
            ? {
                icon: 'iconfont icon-import',
                label: this.$t('assets.directoryTree.import'),
                callback: () => {
                  this.operateNode = data
                  params.catalogName = data.name
                  this.clickNode('import', params)
                },
              }
            : '',
          types.length
            ? {
                icon: 'iconfont icon-export',
                label: this.$t('assets.directoryTree.export'),
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
                disabled: status === 'PUBLISHED' || status === 'UNDER_REVIEW',
                callback: () => {
                  this.operateNode = data
                  this.showMoveDialog()
                },
              }
            : '',
          {
            icon: 'iconfont icon-revise',
            label: this.$t('assets.directoryTree.edit'),
            disabled: status === 'PUBLISHED' || status === 'UNDER_REVIEW',
            callback: () => {
              this.operateNode = data
              this.editDir(data)
            },
          },
          {
            icon: 'iconfont icon-delete',
            label: this.$t('assets.directoryTree.delete'),
            disabled: status === 'PUBLISHED' || status === 'UNDER_REVIEW',
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
          },
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
        if (data.id === this?.currentNode?.id && this.isOverview) {
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
    handleCheck(data, checked) {
      const { checkedNodes } = checked
      this.selectedCatalogs = checkedNodes
      this.$emit('update', { data: this.selectedCatalogs })
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
}
