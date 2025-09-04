import udps from './components/udps/index.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal.js'
import api from '../util/api'
import itemsTree from '@/view/dataSecurity/components/itemsTree.vue'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'

export default {
  components: {
    udps,
    itemsTree,
  },
  props: {
    typeIds: {
      default: 5,
    },
  },
  data() {
    var nameValidatePass = async (rule, value, callback) => {
      if (this.catalogDetails.name === '') {
        callback(new Error(this.$t('securityModule.input')))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(this.catalogDetails.name)) {
          callback(new Error(this.$t('securityModule.inputTip')))
        } else {
          // 判断分类名称是否已存在
          const existRes = await api.isExistCatalogName({
            parentId: this.catalogDetails.parentId,
            name: this.catalogDetails.name,
            id: this.catalogDetails.id,
          })
          if (existRes.data) {
            callback(new Error(this.$t('securityModule.reName')))
          } else {
            callback()
          }
        }
      }
    }
    return {
      treeShow: true,
      listShow: true,
      udps: [],
      showUdps: false,
      hasAccess: false,
      /* TREE */
      chooseResult: null,
      searchLoading: false,
      searchResult: [],
      keywordSetTimeout: null,
      defaultProps: {
        children: 'nodes',
        label: 'name',
        isLeaf: 'leaf',
      },
      /* END OF TREE */
      nowFolder: {}, // 当前目录树节点
      uploading: false,
      // parentPath: '',
      uploadDialogVisible: false,
      showUploadRes: false,
      uploadResList: {},
      uploadSuccessNum: 0,
      uploadResMap: {},
      rulePram: {
        name: {
          required: true,
          validator: nameValidatePass,
          trigger: 'blur',
        },
      },
      accept: '.xlsx',
      autoCodeDisabled: null,
      formFile: [],
      itemEditable: false,
      treeStructure: {},
      itemList: [],
      tableSelection: [],
      searchFormData: {
        itemName: '',
        orderBy: '',
        seq: '',
      },
      allCatalogs: {},
      catalogDialogTitle: '',
      catalogDialogVisible: false,
      catalogEditable: false,
      catalogDetails: {},
      breadNodeData: [],
      itemRules: {},
      itemDetails: {
        stdCode: null,
        name: null,
        englishName: null,
        catalog: '',
        catalogPathName: '',
        businessDepartment: '',
      },
      itemPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      showDetails: false,
      tableLoading: false,
      pageLoading: false,
      itemCatalogOptions: [],
      autoCode: false,
      autoCodeSelect: false,
      itemCatalogDialogVisible: false,
      targetItemCatalog: null,
      rootNode: null,
      resolve: null,
      blank: null,
      deleteTipList: [],
      showDeleteTips: false,
      successNum: 0,
      showClose: false,
      title: '',
      treeLoading: false,
      curName: '',
    }
  },
  beforeMount() {
    if (this.$route.query.blank) {
      this.blank = true
      // $('#main-content').css({
      $('#db-main').css({
        left: 0,
        // top: 0,
      })
      $('#page-heading').remove()
      $('#top-menu').remove()
    }
  },
  mounted() {
    this.title = this.$t('informationItems.infoName1')
    this.pageLoading = true
    const id = this.$route.query.id
    // 从其他页面跳转过来，查看信息项(数据分类里面的信息项)
    if (id) {
      api.getItemAttrs(id).then(res => {
        this.checkItem({
          ...res.data.base,
          catalogPathName: res.data.base.sensitiveCatalogName,
        })
        this.pageLoading = false
      })
    } else {
      this.hasAccess = this.$auth.ROLE_DOMAIN_ADMIN
      this.initResizeHorizontal()
      this.itemRules = {
        stdCode: [
          {
            required: true,
            trigger: 'blur',
            validator: this.checkItemCodeIsValid,
          },
        ],
        name: [
          {
            required: true,
            trigger: 'blur',
            validator: this.checkItemNameIsValid,
          },
        ],
        catalogPathName: [
          {
            required: true,
            trigger: ['change', 'blur'],
            message: this.$t('securityModule.placeSelect'),
          },
        ],
        englishName: [
          {
            trigger: 'blur',
            validator: this.checkEnglishName,
          },
        ],
      }
      this.getItemTableData()
    }
  },
  beforeDestroy() {
    this.$bus.$off('userNameChange')
    this.$bus.$off('reloadStandard')
    this.$bus.$off('goToDomain')
    this.$message.closeAll()
  },
  methods: {
    handleAllTree() {
      this.nowFolder = {}
      this.$refs.mainTree.$refs.tree.setCurrentKey(null)
      this.itemPagination.currentPage = 1
      this.getItemTableData()
    },
    geItemRowKeys(row) {
      return row.itemId
    },
    async searchCatalog(value) {
      this.searchLoading = true
      if (value) {
        this.showClose = true
      }
      try {
        const searchRes = await api.searchItemCatalog(value)
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
    },
    handleChooseSelectFocus() {
      if (!this.chooseResult && !this.showClose) {
        this.searchResult = []
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
    handleChooseChange(target) {
      if (target) {
        this.showClose = false
        this.$datablauLoading.loading()
        const targetNode = this.searchResult.find(item => item.id === target)
        this.nowFolder = { ...targetNode }
        this.tableSelection = []
        this.chooseResult = ''
        this.searchResult = []
        this.$refs.itemTable.clearSelection()
      } else {
        this.searchResult = []
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.tree-area-margin-right'),
          rightDom: $('.content-area'),
          outerDom: $('.domain-component-outer'),
          leftPaddingCor: 0,
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
          callback: this.treeListDragCallback,
        })
      }, 1000)
    },
    async getSubCatalog(parentId) {
      // console.log(parentId)
      try {
        const treeRes = await api.getItemCatalog(parentId)
        const { catalogVos } = treeRes.data
        if (parentId === 0) {
          this.allCatalogs = {}
          this.treeStructure = treeRes.data
        }
        this.updateAllCatalogs(catalogVos)
        if (this.$refs.mainTree) {
          const tree = this.$refs.mainTree.$refs.tree
          tree.updateKeyChildren(parentId, Array.from(catalogVos))
        }
        this.treeShow = true
        return treeRes
      } catch (e) {
        this.treeLoading = false
        this.treeShow = false
        this.$showFailure(e)
      }
    },

    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.mainTree.$refs.tree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        const targetNode = this.allCatalogs[node]
        if (!targetNode) {
          const childrenRes = await this.getSubCatalog(pathArr[i - 1])
          tree.updateKeyChildren(pathArr[i - 1], childrenRes.data.catalogVos)
        }
      }
    },

    // 更新全部树节点
    updateAllCatalogs(data) {
      if (!Array.isArray(data)) data = [data]
      data.forEach(d => {
        if (!this.allCatalogs) this.allCatalogs = {}
        this.allCatalogs[d.id] = d
      })
    },

    async loadTreeData(node, resolve) {
      if (node.level === 0) {
        this.resolve = resolve
        this.treeLoading = true
        this.rootNode = node
      }
      const parentId = node.level === 0 ? 0 : node.data.id
      const treeRes = await this.getSubCatalog(parentId)
      if (this.$refs.mainTree) {
        const tree = this.$refs.mainTree.$refs.tree
        tree.updateKeyChildren(parentId, Array.from(treeRes.data.catalogVos))
        if (!(this.nowFolder && this.nowFolder.id)) {
        } else {
          this.nowFolder = _.cloneDeep(this.nowFolder)
        }
      }
      this.pageLoading = false
      this.$utils.sort.sortConsiderChineseNumber(
        treeRes.data.catalogVos,
        'name'
      )
      this.treeLoading = false
      resolve(treeRes.data.catalogVos)
    },

    async refreshTreeData(data, name = '') {
      if (data) {
        const node = this.$refs.mainTree.$refs.tree.getNode({
          id: data.id,
        })
        if (node) {
          const treeRes = await this.getSubCatalog(node.data.id)
          await this.$utils.sort.sortConsiderChineseNumber(
            treeRes.data.catalogVos,
            'name'
          )
          if (this.$refs.mainTree) {
            const tree = this.$refs.mainTree.$refs.tree
            tree.updateKeyChildren(
              node.data.id,
              Array.from(treeRes.data.catalogVos)
            )
          }
          if (name) {
            this.nowFolder = treeRes.data.catalogVos.find(c => c.name === name)
          }
        }
      } else {
        this.rootNode.childNodes = []
        await this.loadTreeData(this.rootNode, this.resolve)
        this.handleAllTree()
      }
    },

    // 将当前节点的所有父级节点展开
    async expandParents(node) {
      const allNodes = _.cloneDeep(this.allCatalogs)
      let parentNode = allNodes[node.parentId]
      const tree = this.$refs.mainTree.$refs.tree
      while (parentNode) {
        const treeNode = tree.getNode(parentNode.id)
        if (treeNode) {
          treeNode.isLeaf = false
          treeNode.expanded = true
        }
        parentNode = allNodes[parentNode.parentId]
      }
    },

    dataIconFunction(data, node) {
      let className = ''
      if (data.code) {
        className = 'tree-icon domain'
        if (data.udpatingId) {
          className += ' is-udpating'
        }
      } else {
        if (node.expanded) {
          className = 'iconfont icon-openfile'
        } else {
          className = 'iconfont icon-file'
        }
      }
      return className
    },
    dataOptionsFunction(data) {
      const options = []
      if (!data.code) {
        if (this.$auth.DATA_SECURITY_AUTH_STANDARD_CATALOG_MANAGE) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: this.$t('securityModule.new'),
            callback: () => {
              this.commandHandle('addNext', data)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-revise',
            label: this.$t('securityModule.edit'),
            callback: () => {
              this.commandHandle('change', data)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-delete',
            label: this.$t('securityModule.delete'),
            callback: () => {
              this.commandHandle('delete', data)
            },
            args: 'folder',
          })
        }
        if (this.$auth.DATA_SECURITY_AUTH_STANDARD_CATALOG) {
          options.push({
            icon: 'iconfont icon-see',
            label: this.$t('securityModule.view'),
            callback: () => {
              this.commandHandle('show', data)
            },
            args: 'folder',
          })
        }
      }

      return options
    },

    commandHandle(command, data) {
      switch (command) {
        case 'show':
          this.showTheme(data)
          this.recordLog(data)
          break
        case 'addSame':
          this.addTheme(data, 'same')
          break
        case 'addNext':
          this.addTheme(data, 'next')
          break
        case 'change':
          this.changeTheme(data)
          break
        case 'delete':
          this.deleteTheme(data)
          break
      }
    },
    // 查看目录记录日志
    recordLog(data) {
      const params = {
        desc: data.comment,
        catalogName: data.name,
        catalogId: data.id,
        catalogType: 'AUTH_STANDARD',
      }
      api
        .recordLogApi(params)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },

    getAutoCode() {
      api
        .getInformationItemCodeConfig()
        .then(res => {
          this.autoCode = res.data.autoIncState
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    showTheme(data) {
      this.catalogDetails = _.cloneDeep(data)
      this.catalogDialogTitle = this.$t('securityModule.view') + this.title
      this.catalogEditable = false
      this.catalogDialogVisible = true
    },

    addTheme(data, type) {
      if (!data.parentId) {
        data.parentId = 0
      }
      if (!data.id) {
        data.id = 0
      }

      this.catalogDetails = {
        parentId: type === 'same' ? data.parentId : data.id,
        name: '',
        comment: '',
        level: data.level ? parseInt(data.level) + 1 : 1,
      }
      this.catalogDialogTitle = this.$t('securityModule.new') + this.title
      this.catalogEditable = true
      this.catalogDialogVisible = true
      this.$refs.catalogForm &&
        this.$refs.catalogForm.$refs.form.clearValidate()
    },
    changeTheme(data) {
      this.catalogDetails = _.cloneDeep(data)
      this.catalogDialogTitle = this.$t('securityModule.edit') + this.title
      this.catalogEditable = true
      this.catalogDialogVisible = true
      this.$refs.catalogForm &&
        this.$refs.catalogForm.$refs.form.clearValidate()
    },

    // 删除信息项分类目录
    deleteTheme(data) {
      let tipContent = ''
      if (data.leaf) {
        tipContent = this.$t('securityModule.sureDelTip1', { name: data.name })
      } else {
        tipContent = this.$t('securityModule.delTip1', { name: data.name })
      }
      this.$DatablauCofirm(tipContent, this.$t('informationItems.delTitle'))
        .then(() => {
          this.deleteCatalog(data.id, data.parentId)
        })
        .catch(e => {
          console.log(e)
        })
    },

    // 删除信息项分类目录
    async deleteCatalog(foldId, parentId) {
      api
        .deleteItemCatalog(foldId)
        .then(async deleteRes => {
          if (deleteRes.status === 200) {
            this.$datablauMessage.success(this.$t('securityModule.delSuccess'))
            this.$refs.mainTree.$refs.tree.remove({ id: foldId })
            if (this.nowFolder.id === foldId) {
              this.nowFolder =
                parentId === 0 ? '{}' : this.allCatalogs[parentId]
            } else {
              this.nowFolder = _.cloneDeep(this.nowFolder)
            }
          } else {
            this.$showFailure(deleteRes.data)
          }
        })
        .catch(error => {
          this.$showFailure(error)
        })
    },
    cancelCatalog() {
      this.catalogDialogVisible = false
      this.catalogDialogTitle = ''
      this.catalogDetails = {}
    },

    submitCatalog() {
      if (this.catalogDetails.id) {
        this.changeCatalog()
      } else {
        this.addCatalog()
      }
    },

    // 提交新增信息项分类目录
    async addCatalog() {
      this.$refs.catalogForm.validate(async valid => {
        if (valid) {
          try {
            const { level, name, parentId } = this.catalogDetails
            const addRes = await api.addNewItemCatalog({
              ...this.catalogDetails,
              structureId: this.treeStructure.id,
              catalogTypeId: this.treeStructure.detailVos[0].catalogTypeId,
            })
            if (addRes.status === 200) {
              this.catalogDialogVisible = false
              if (parentId === 0) {
                this.refreshTreeData()
              } else {
                await this.refreshTreeData(this.allCatalogs[parentId], name)
              }
              this.$datablauMessage.success(
                this.$t('securityModule.newSuccess')
              )
            }
          } catch (error) {
            this.$showFailure(error)
          }
        }
      })
    },
    // 提交修改信息项分类目录
    async changeCatalog() {
      this.$refs.catalogForm.validate(async valid => {
        if (valid) {
          let para = _.cloneDeep(this.catalogDetails)
          const level = para.level
          const updateRes = await api.updateItemCatalog({
            ...para,
            structureId: this.treeStructure.id,
            catalogTypeId: this.treeStructure.detailVos[0].catalogTypeId,
          })
          if (updateRes.status === 200) {
            this.catalogDialogVisible = false
            if (para.parentId === 0) {
              await this.refreshTreeData()
            } else {
              await this.refreshTreeData(this.allCatalogs[para.parentId])
            }
            this.nowFolder = this.allCatalogs[para.id]
            this.$nextTick(() => {
              this.$refs.mainTree.$refs.tree.setCurrentKey(para.id)
            })
            this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
          }
        }
      })
    },

    // 点击树节点
    handleItemClicked(data) {
      if (this.itemCatalogDialogVisible) {
        this.targetItemCatalog = data
      } else {
        this.nowFolder = data
      }
    },
    clickChild(name, options) {
      switch (name) {
        case 'itemsTree':
          console.log(options.data)
          this.handleItemClicked(options.data)
          break
        default:
          break
      }
    },
    getParents(target) {
      const parents = [target]
      let parent = this.allCatalogs[target.parentId]
      while (parent) {
        parents.unshift(parent)
        parent = this.allCatalogs[parent.parentId]
      }
      return parents
    },
    getPathName(path) {
      const nameList =
        path.split('/').filter(m => m && parseFloat(m) !== 0) || []
      let newList = []
      if (nameList.length > 0) {
        nameList.map(item => {
          const newMap = {}
          newMap.name = this.allCatalogs[item].name
          newList.push(newMap)
        })
      }
      // 添加当前的目录
      newList.push({ name: this.allCatalogs[this.nowFolder.id].name })
      return newList
    },
    async setBreadcrumb() {
      if (this.nowFolder.id) {
        const nameList = await this.getPathName(
          this.allCatalogs[this.nowFolder.id].catalogPath
        )
        this.breadNodeData = [...nameList, { name: this.curName }]
      } else {
        this.breadNodeData = [
          {
            name: this.curName,
          },
        ]
      }
    },
    setCurBreadcrumb(path) {
      const pathList = path.split('/')
      let newList = []
      pathList.map(item => {
        const newMap = {
          name: item,
        }
        newList.push(newMap)
      })
      this.breadNodeData = [...newList, { name: this.curName }]
    },
    // 新建信息项
    addItem() {
      // 1. 是否可以自动生成信息项编码
      this.getAutoCode()
      // 2. 获取信息项扩展属性
      this.getUdps()
      this.curName = this.$t('informationItems.newInfo')
      this.setBreadcrumb()
      this.itemEditable = true
      this.showDetails = true
      this.itemDetails.catalog = this.nowFolder.id
      // this.itemDetails.catalogPathName = this.getParents(this.nowFolder)
      //   .map(item => item.name)
      //   .join('/')
      this.itemDetails.catalogPathName = this.nowFolder.name
      this.$refs.itemForm && this.$refs.itemForm.$refs.form.clearValidate()
    },
    // 信息项导出，导出已选信息项或全部信息项
    exportItems(isAll = true) {
      let list = []
      if (!isAll) {
        list = this.tableSelection.map(item => item.itemId)
      }
      let params = {
        ids: list,
      }
      if (isAll) {
        params.catalogId = this.nowFolder.id || null
        params.nameLike = this.searchFormData.itemName
      }
      api.exportItems(params).then(res => {
        this.$refs.itemTable.clearSelection()
        this.$bus.$emit('getTaskJobResult', res.data, 'export')
      })
    },
    handlerExport() {
      this.exportItems(false)
    },
    // 更多操作
    moreHandle(command) {
      switch (command) {
        case 'a':
          // 导入
          this.uploadDialogVisible = true
          break
        case 'b':
          // 导出
          this.exportItems()
          // console.log('导出信息项')
          break
        case 'c':
          this.getUdps()
          this.showUdps = true
          break
      }
    },
    checkItemNameIsValid(rule, value, callback) {
      if (!this.itemDetails.name) {
        callback(new Error(this.$t('securityModule.input')))
      } else {
        if (this.itemDetails.name.indexOf('_') !== -1) {
          callback(new Error(this.$t('informationItems.infoNameTip')))
        } else {
          callback()
        }
      }
    },

    // 判断信息项编码是否有效
    checkItemCodeIsValid(rule, value, callback) {
      // 编辑时不需要判断编码的有效性，因为编辑时，编码不允许修改
      if (this.itemDetails.itemId) {
        callback()
      } else {
        // 新增信息项时需要判断编码的有效性
        if (!this.itemDetails.stdCode) {
          callback(new Error(this.$t('securityModule.input')))
        } else {
          api.isExistCode(this.itemDetails.stdCode).then(res => {
            if (res.data) {
              callback(new Error(this.$t('informationItems.repeatCode')))
            } else {
              callback()
            }
          })
        }
      }
    },
    // 判断英文简称是否有效
    checkEnglishName(rule, value, callback) {
      if (this.itemDetails.englishName) {
        let englishName = this.itemDetails.englishName
        ;['[', ']', '\\'].forEach(item => {
          englishName = englishName.replace(item, '')
        })
        const pattern = new RegExp(
          '^[a-zA-Z0-9~!@#$%^&*(){}|<>?:"_+-=;\',./· !@#￥%……&*+{}|/]+$',
          'gi'
        )
        if (englishName.replace(pattern, '').length === 0) {
          callback()
        } else {
          callback(new Error(this.$t('informationItems.formatError')))
        }
      } else {
        callback()
      }
    },

    // 自动生成信息项编码
    autoCodeChange(value) {
      if (value === true) {
        this.itemDetails.stdCode = null
        this.$set(this.itemRules, 'stdCode', [])
        this.$refs.itemForm.clearValidate('stdCode')
      } else {
        this.$set(this.itemRules, 'stdCode', [
          {
            required: true,
            trigger: 'blur',
            validator: this.checkItemCodeIsValid,
            // message: '请输入信息项编码',
          },
        ])
      }
    },
    // 打开选择目录的对话框
    openItemCatalogDialog() {
      this.itemCatalogDialogVisible = true
      this.$refs.selectTree &&
        this.$refs.selectTree.$refs.tree.setCurrentKey(null)
    },
    // 选择目录
    selectItemCatalog() {
      this.itemDetails.catalog = this.targetItemCatalog.id
      // this.itemDetails.catalogPathName = this.getParents(this.targetItemCatalog)
      //   .map(item => item.name)
      //   .join('/')
      this.itemDetails.catalogPathName = this.targetItemCatalog.catalogPathName
      this.itemCatalogDialogVisible = false
      this.targetItemCatalog = null
    },
    // 关闭分类目录选择弹窗
    closeItemCatalogDialog() {
      this.itemCatalogDialogVisible = false
      this.targetItemCatalog = null
    },

    // 提交信息项新增或编辑内容
    async submitItem() {
      this.$refs.itemForm.validate(async valid => {
        if (valid) {
          // console.log(this.itemDetails)
          const {
            itemId,
            catalog,
            name,
            englishName,
            businessDepartment,
            stdCode,
            creator,
            createTime,
          } = this.itemDetails
          const submitRes = await api.addOrUpdateItem({
            id: itemId,
            sensitiveCatalogId: catalog,
            name,
            englishName,
            stdCode,
            businessDepartment,
            creator,
            createTime,
            udpValueDtos: this.udps.map(udp => ({
              udpId: itemId ? udp.udpId : udp.id,
              valueId: itemId ? udp.valId : null,
              value: udp.value,
            })),
          })
          if (submitRes.status === 200) {
            if (!itemId) {
              this.$datablauMessage.success(
                this.$t('securityModule.newSuccess')
              )
              this.itemPagination.currentPage = 1
              this.getItemTableData()
              this.showDetails = false
              this.udps = []
              this.itemEditable = false
              this.cancelItem()
              this.$nextTick(() => {
                this.nowFolder = this.allCatalogs[catalog] || {}
              })
            } else {
              this.$datablauMessage.success(
                this.$t('securityModule.editSuccess')
              )
              this.itemPagination.currentPage = 1
              this.getItemTableData()
              this.showDetails = false
              this.udps = []
              this.itemEditable = false
              this.cancelItem()
              this.$nextTick(() => {
                this.nowFolder = this.allCatalogs[catalog] || {}
              })
            }
          }
          // console.log(submitRes)
        }
      })
    },

    // 查看信息项
    checkItem(row) {
      const { catalogPath, sensitiveCatalogId } = row
      this.getUdps(row.itemId, 1)
      this.itemDetails = {
        ...row,
        catalog: `${catalogPath}/${sensitiveCatalogId}`.split('/').slice(1),
      }
      this.curName = this.$t('informationItems.viewInfo')
      this.setCurBreadcrumb(row.catalogPathName)
      this.itemEditable = false
      this.showDetails = true
    },

    // 编辑信息项
    editItem(row) {
      const { catalogPath, sensitiveCatalogId } = row
      // 获取当前信息项的扩展属性
      this.getUdps(row.itemId)
      this.itemDetails = {
        ...row,
        catalogPathName: row.catalogPathName,
        catalog: sensitiveCatalogId,
      }
      this.curName = this.$t('informationItems.editInfo')
      this.setCurBreadcrumb(row.sensitiveCatalogName)
      this.itemEditable = true
      this.showDetails = true
    },

    // 删除信息项
    deleteItem(type, row = {}) {
      let ids = []
      let delParams = {
        this: this,
        objName: this.$t('informationItems.info'),
        type,
      }
      switch (type) {
        case 'single':
          delParams.name = row.name
          ids = [row.itemId]
          break
        case 'multiple':
          delParams.num = this.tableSelection.length
          ids = this.tableSelection.map(item => item.itemId)
          break
        default:
          break
      }
      delObjMethod(delParams)
        .then(() => {
          api
            .deleteItem(ids)
            .then(res => {
              if (res.data.status === 200) {
                const { data: securityList } = res.data
                if (this.isEmpty(securityList)) {
                  this.$datablauMessage.success(
                    this.$t('securityModule.delSuccess')
                  )
                } else {
                  if (!this.isEmpty(securityList)) {
                    this.showDeleteTips = true
                    this.deleteTipList = securityList
                    this.successNum = ids.length - securityList.length
                  }
                }
                this.itemPagination.currentPage = 1
                this.getItemTableData()
                this.$refs.itemTable.clearSelection()
                this.tableSelection = []
              } else {
                this.$showFailure(res.data.errorMsg)
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(error => {
          console.log(error)
        })
    },

    isEmpty(data) {
      return (
        data === null ||
        data === undefined ||
        data === '' ||
        data.length === 0 ||
        (typeof data === 'object' && Object.keys(data).length === 0)
      )
    },

    // 取消信息项的查看、编辑和新增
    cancelItem() {
      if (this.$route.query.blank) {
        window.opener = null
        window.open('', '_self')
        window.close()
      } else {
        this.showDetails = false
        this.udps = []
        this.autoCodeSelect = false
        this.itemDetails = {
          stdCode: null,
          name: null,
          englishName: null,
          catalog: '',
          catalogPathName: '',
          businessDepartment: '',
        }
        this.autoCode = false
      }
    },

    // 获取信息项列表数据
    async getItemTableData() {
      this.tableLoading = true
      const param = {
        catalogId: this.nowFolder.id || 0,
        data: {
          nameLike: this.searchFormData.itemName,
          currentPage: this.itemPagination.currentPage,
          pageSize: this.itemPagination.pageSize,
          orderBy: this.searchFormData.orderBy || 'createTime',
          seq: this.searchFormData.seq
            ? this.searchFormData.seq === 'ascending'
              ? 'asc'
              : 'desc'
            : 'desc',
        },
      }
      try {
        const queryRes = await api.getItemData(param)
        if (queryRes.status === 200 && queryRes.data) {
          this.itemList = queryRes.data.content || []
          this.itemPagination = {
            currentPage: param.data.currentPage,
            pageSize: param.data.pageSize,
            total: queryRes.data.totalItems,
          }
        } else {
          this.$showFailure(queryRes.data)
        }
        this.tableLoading = false
        this.pageLoading = false
        this.listShow = true
      } catch (error) {
        this.$showFailure(error)
        this.tableLoading = false
        this.pageLoading = false
        this.listShow = false
      }
    },

    // 选择信息项
    tableSelectionChanged(selection) {
      this.tableSelection = selection
    },

    // 信息项表格currentPage
    handleCurrentChange(val) {
      this.itemPagination.currentPage = val
      this.getItemTableData()
    },
    handleSearch() {
      this.itemPagination.currentPage = 1
      this.getItemTableData()
    },

    // 信息项表格 pageSize
    handleSizeChange(size) {
      this.itemPagination.pageSize = size
      this.getItemTableData()
    },

    handleItemSortChange({ column, order, prop }) {
      // console.log(order, prop)
      this.searchFormData.orderBy = order ? prop : ''
      this.searchFormData.seq = order
      this.itemPagination.currentPage = 1
      this.getItemTableData()
    },

    // 关闭扩展属性弹窗
    closeudpDialog() {
      this.showUdps = false
      this.udps = []
    },

    // 新增或编辑扩展属性
    updateUdps(list) {
      api
        .updateItemUdps(list)
        .then(res => {
          if (res.status === 200) {
            this.$datablauMessage.success(
              this.$t('securityModule.submitSuccess')
            )
            this.showUdps = false
            this.udps = []
          }
        })
        .catch(error => {
          this.$showFailure(error)
        })
    },

    // 获取扩展属性（新增、编辑或查看信息项时）
    getUdps(id, record = 0) {
      if (id) {
        api.getItemUdpsById(id, record).then(res => {
          this.udps = _.cloneDeep(res.data)
          this.setUdpRules(res.data)
        })
      } else {
        api.getItemUdps().then(res => {
          this.udps = _.cloneDeep(res.data)
          this.setUdpRules(res.data)
        })
      }
    },
    // 设置扩展属性必填校验
    setUdpRules(udps) {
      if (this.itemEditable) {
        // console.log('设置扩展属性必填校验')
        udps.forEach(u => {
          if (u.type === 'NUM' && !u.value) u.value = undefined
          if (u.required) {
            this.itemRules[u.propName] = [
              {
                required: true,
                validator: this.isUdpValidate,
                trigger: 'blur',
              },
            ]
          }
        })
      }
    },

    // 扩展属性必填校验方法
    isUdpValidate(rule, value, callback) {
      const udp = this.udps.find(u => u.propName === rule.field)
      let valid = true
      if (udp && udp.type === 'STRING')
        valid = !!udp.value && !!udp.value.trim().length
      if (udp && udp.type === 'NUM') valid = udp.value === 0 || udp.value
      if (udp && udp.type === 'ENUM') valid = !!udp.value
      if (valid) {
        callback()
      } else {
        callback(new Error(this.$t('informationItems.inputAttrTip')))
      }
    },
    // 下载导入模板
    modelDownload() {
      const url = `/datasecurity/datasecurity/sensitive/download/template`
      this.$downloadFilePost(url, {}, this.$t('informationItems.infoTem'))
    },
    // 导入信息项
    showBegain(file) {
      this.uploading = true
      const len = file.name.split('.').length
      const type = file.name.split('.')[len - 1]
      if (type !== '.xlsx') {
        this.uploading = false
      }
    },
    // 上传导入文件
    onChange(e, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$datablauMessage.error(this.$t('informationItems.uploadFormat'))
          this.formFile = []
          this.$refs.itemImport.showList = []
          this.$refs.itemImport.$refs.upload.uploadFiles = []
          return false
        }
      }
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm(this.$t('securityModule.singleUploadTip'))
          .then(() => {
            this.formFile = fileList[1]
            fileList.shift()
          })
          .catch(e => {
            fileList.pop()
            this.formFile = fileList
          })
      } else {
        this.formFile = fileList
      }
      // console.log(e)
      if (e.status === 'success') {
        this.uploadDialogVisible = false
        this.$bus.$emit('getTaskJobResult', e.response, 'import')
      }
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    // 删除导入文件
    beforeRemove(e) {
      this.formFile = []
    },
    // 导入文件上传失败
    onError(e) {
      this.uploading = false
      this.$message.closeAll()
      // this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(e)
    },
    // 导入文件上传成功
    onSuccess() {
      this.uploading = false
      this.$message.closeAll()
      // this.$bus.$emit('changeUploadProgress', true)
      // this.stateChange()
    },

    // 导入信息项
    importItems() {
      this.$refs.itemImport.$refs.upload.submit()
    },
    handleCloseUploadDialog() {
      this.uploadDialogVisible = false
      this.formFile = []
      this.showUploadRes = false
      this.uploadResList = {}
      this.uploadSuccessNum = 0
      this.uploadResMap = {}
      this.autoCodeSelect = false
    },
  },
  inject: ['headerProduction'],
  computed: {
    standardUploadUrl() {
      return `/datasecurity/datasecurity/sensitive/import/standard?autoNum=${this.autoCodeSelect}`
    },
    // 是否展示更多操作
    showMoreOptionsButton() {
      let bool = false
      let authList = []
      authList = ['DATA_SECURITY_AUTH_STANDARD_MANAGE']
      authList.forEach(item => {
        if (this.$auth[item]) {
          bool = true
        }
      })
      return bool
    },
  },
  watch: {
    uploadDialogVisible(value) {
      if (value === true) {
        this.getAutoCode()
        this.$refs.itemImport && this.$refs.itemImport.$refs.upload.clearFiles()
      }
    },

    nowFolder: {
      async handler(node, old) {
        if (node && node.id && node.id !== old.id) {
          try {
            this.tableLoading = true
            await this.getAllSubCatalog(
              node.catalogPath
                ? `${node.catalogPath}${node.id}`
                : `${this.nowFolder.catalogPath}${this.nowFolder.id}/${data.id}`
            )
            this.expandParents(node)
            this.itemPagination.currentPage = 1
            this.getItemTableData()
            this.$nextTick(() => {
              this.$refs.mainTree.$refs.tree.setCurrentKey(node.id)
            })
          } catch (error) {
            this.tableLoading = false
          }
        }
        this.$datablauLoading.close()
      },
    },
    treeData: {
      handler(newData, prevData) {
        if (newData.length && !prevData.length) {
          this.nowFolder = newData[0]
        }
      },
    },
    'searchFormData.itemName'(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
}
