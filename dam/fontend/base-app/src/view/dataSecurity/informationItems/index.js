import udps from './components/udps/index.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal.js'
import api from '../util/api'

export default {
  components: {
    udps,
  },
  props: {
    typeIds: {
      default: 5,
    },
  },
  data() {
    var nameValidatePass = async (rule, value, callback) => {
      if (this.catalogDetails.name === '') {
        callback(new Error('请输入信息项分类名称'))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(this.catalogDetails.name)) {
          callback(new Error('分类名称不允许包含#/\\@$_%<>等特殊字符'))
        } else {
          // 判断分类名称是否已存在
          const existRes = await api.isExistCatalogName({
            parentId: this.catalogDetails.parentId,
            name: this.catalogDetails.name,
            id: this.catalogDetails.id,
          })
          if (existRes.data) {
            callback(new Error('分类名称已存在，请重新输入'))
          } else {
            callback()
          }
        }
      }
    }
    const hasEditAuth = this.$auth.DATA_SECURITY_AUTH_STANDARD_MANAGE
    return {
      hasEditAuth,
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
      nowFolder: null,
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
      catalogDialogTitle: '新建信息项分类',
      catalogDialogVisible: false,
      catalogEditable: false,
      catalogDetails: {},
      breadNodeData: [],
      itemTitle: '新增信息项',
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
    }
  },
  beforeMount() {
    if (this.$route.query.blank) {
      this.blank = true
      $('#main-content').css({
        left: 0,
        top: 0,
      })
      $('#page-heading').remove()
      $('#top-menu').remove()
    }
  },
  mounted() {
    const id = this.$route.query.id
    // 从其他页面跳转过来，查看信息项
    if (id) {
      api.getItemAttrs(id).then(res => {
        this.checkItem({
          ...res.data.base,
          catalogPathName: res.data.base.sensitiveCatalogName,
        })
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
            message: '请输入信息项名称',
          },
        ],
        catalogPathName: [
          {
            required: true,
            trigger: ['change', 'blur'],
            message: '请选择目录',
          },
        ],
        englishName: [
          {
            trigger: 'blur',
            validator: this.checkEnglishName,
          },
        ],
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('userNameChange')
    this.$bus.$off('reloadStandard')
    this.$bus.$off('goToDomain')
    this.$message.closeAll()
  },
  methods: {
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
          minWith: { leftMinWidth: 240 },
          callback: this.treeListDragCallback,
        })
      }, 1000)
    },
    async getSubCatalog(parentId) {
      // console.log(parentId)
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
      return treeRes
    },

    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.mainTree.$refs.tree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        const targetNode = this.allCatalogs[node]
        if (!targetNode) {
          console.log('请求子节点')
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
        this.rootNode = node
        this.resolve = resolve
      }
      node.childNodes = []
      // console.log(node)
      const parentId = node.level === 0 ? 0 : node.data.id
      const treeRes = await this.getSubCatalog(parentId)
      if (this.$refs.mainTree) {
        const tree = this.$refs.mainTree.$refs.tree
        tree.updateKeyChildren(parentId, Array.from(treeRes.data.catalogVos))
        if (!(this.nowFolder && this.nowFolder.id)) {
          this.nowFolder = treeRes.data.catalogVos[0]
        } else {
          this.nowFolder = _.cloneDeep(this.nowFolder)
        }
      }
      resolve(treeRes.data.catalogVos)
    },

    async refreshTreeData(data) {
      if (data) {
        const node = this.$refs.mainTree.$refs.tree.getNode({
          id: data.id,
        })
        if (node) {
          const treeRes = await this.getSubCatalog(node.data.id)
          if (this.$refs.mainTree) {
            const tree = this.$refs.mainTree.$refs.tree
            tree.updateKeyChildren(
              node.data.id,
              Array.from(treeRes.data.catalogVos)
            )
          }
        }
      } else {
        await this.loadTreeData(this.rootNode, this.resolve)
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
        if (this.hasEditAuth) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: '新建子类',
            callback: () => {
              this.commandHandle('addNext', data)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-revise',
            label: '修改分类',
            callback: () => {
              this.commandHandle('change', data)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-delete',
            label: '删除分类',
            callback: () => {
              this.commandHandle('delete', data)
            },
            args: 'folder',
          })
        }
        options.splice(1, 0, {
          icon: 'iconfont icon-see',
          label: '查看分类',
          callback: () => {
            this.commandHandle('show', data)
          },
          args: 'folder',
        })
      }

      return options
    },

    commandHandle(command, data) {
      switch (command) {
        case 'show':
          this.showTheme(data)
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

    getAutoCode() {
      api.getInformationItemCodeConfig().then(res => {
        this.autoCode = res.data.autoIncState
      })
    },

    showTheme(data) {
      this.catalogDetails = _.cloneDeep(data)
      this.catalogDialogTitle = '查看信息项分类'
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
      this.catalogDialogTitle = '新建信息项分类'
      this.catalogEditable = true
      this.catalogDialogVisible = true
      this.$refs.catalogForm &&
        this.$refs.catalogForm.$refs.form.clearValidate()
    },
    changeTheme(data) {
      this.catalogDetails = _.cloneDeep(data)
      this.catalogDialogTitle = '修改信息项分类'
      this.catalogEditable = true
      this.catalogDialogVisible = true
      this.$refs.catalogForm &&
        this.$refs.catalogForm.$refs.form.clearValidate()
    },

    // 删除信息项分类目录
    deleteTheme(data) {
      if (!data.nodes || data.nodes.length === 0) {
        this.$DatablauCofirm(
          this.$t('domain.domain.delClassificationConfirm'),
          this.$t('domain.common.tip'),
          {
            type: 'warning',
            closeOnClickModal: false,
          }
        ).then(() => {
          this.deleteCatalog(data.id, data.parentId)
        })
      } else {
        this.$message.error(this.$t('domain.domain.noDeleteWithSub'))
      }
    },

    // 删除信息项分类目录
    async deleteCatalog(foldId, parentId) {
      api
        .deleteItemCatalog(foldId)
        .then(async deleteRes => {
          // console.log(deleteRes)
          if (deleteRes.status === 200) {
            this.$blauShowSuccess('删除成功')
            this.$refs.mainTree.$refs.tree.remove({ id: foldId })
            const treeRes = await this.getSubCatalog(parentId)
            const catalogVos = treeRes.data.catalogVos
            if (this.nowFolder.id === foldId) {
              this.nowFolder =
                parentId === 0 ? catalogVos[0] : this.allCatalogs[parentId]
            } else {
              this.nowFolder = _.cloneDeep(this.nowFolder)
            }
          } else {
            this.$blauShowFailure(deleteRes.data)
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
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
      // console.log('add catalog')
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
              const treeRes = await this.getSubCatalog(parentId)
              if (parentId === 0) {
                this.refreshTreeData()
              }
              this.nowFolder = treeRes.data.catalogVos.find(
                c => c.name === name
              )
              this.$message.success('新增成功')
            }
          } catch (error) {
            this.$blauShowFailure(error)
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
            this.$message.success('修改成功')
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
    getParents(target) {
      const parents = [target]
      let parent = this.allCatalogs[target.parentId]
      while (parent) {
        parents.unshift(parent)
        parent = this.allCatalogs[parent.parentId]
      }
      return parents
    },

    // 新增信息项
    addItem() {
      // 1. 是否可以自动生成信息项编码
      this.getAutoCode()
      // 2. 获取信息项扩展属性
      this.getUdps()
      // 3. 信息项内容可编辑
      // 4. 信息项内容title为：新增信息项
      // 5. 打开信息项内容
      this.itemTitle = '新增信息项'
      this.itemEditable = true
      // this.itemDialogVisible = true
      this.showDetails = true
      this.breadNodeData = [{ name: '所有信息项' }, { name: '新增信息项' }]
      this.itemDetails.catalog = this.nowFolder.id
      this.itemDetails.catalogPathName = this.getParents(this.nowFolder)
        .map(item => item.name)
        .join('/')
      this.$refs.itemForm && this.$refs.itemForm.$refs.form.clearValidate()
    },
    // 信息项导出，导出已选信息项或全部信息项
    exportItems() {
      // let url = this.$url + `/service/datasecurity/sensitive/export/standard`
      // this.$datablauDownload(
      //   url,
      //   (this.tableSelection || []).map(item => item.itemId),
      //   '分类信息项'
      // )
      api
        .exportItems((this.tableSelection || []).map(item => item.itemId))
        .then(res => {
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
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

    // 判断信息项编码是否有效
    checkItemCodeIsValid(rule, value, callback) {
      // 编辑时不需要判断编码的有效性，因为编辑时，编码不允许修改
      if (this.itemDetails.itemId) {
        callback()
      } else {
        // 新增信息项时需要判断编码的有效性
        if (!this.itemDetails.stdCode) {
          callback(new Error('请输入信息项编码'))
        } else {
          api.isExistCode(this.itemDetails.stdCode).then(res => {
            if (res.data) {
              callback(new Error('信息项编码重复，请重新输入'))
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
          callback(new Error('英文名称格式有误，请重新输入'))
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
      this.itemDetails.catalogPathName = this.getParents(this.targetItemCatalog)
        .map(item => item.name)
        .join('/')
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
              this.$blauShowSuccess('提交成功')
              this.getItemTableData({
                pageNum: 1,
                pageSize: 20,
              })
              this.showDetails = false
              this.itemTitle = ''
              this.udps = []
              this.itemEditable = false
              this.cancelItem()
              this.$nextTick(() => {
                this.nowFolder = this.allCatalogs[catalog]
              })
            } else {
              this.$blauShowSuccess('修改成功')
              this.getItemTableData({
                pageNum: 1,
                pageSize: 20,
              })
              this.showDetails = false
              this.itemTitle = ''
              this.udps = []
              this.itemEditable = false
              this.cancelItem()
              this.$nextTick(() => {
                this.nowFolder = this.allCatalogs[catalog]
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
      this.getUdps(row.itemId)
      this.itemDetails = {
        ...row,
        catalog: `${catalogPath}/${sensitiveCatalogId}`.split('/').slice(1),
      }
      this.breadNodeData = [{ name: '所有信息项' }, { name: '查看信息项' }]
      this.itemTitle = '查看信息项'
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
      this.breadNodeData = [{ name: '所有信息项' }, { name: '编辑信息项' }]
      this.itemTitle = '编辑信息项'
      this.itemEditable = true
      this.showDetails = true
    },

    // 删除信息项
    deleteItem(ids = []) {
      let confirmTip = ''
      if (ids.length) {
        confirmTip = '确认要删除吗？'
      } else {
        ids = this.tableSelection.map(item => item.itemId)
        confirmTip = `已选择“${ids.length}条”数据，确认要删除吗？`
      }
      // console.log(row)
      this.$DatablauCofirm(confirmTip, '提示', {
        type: 'warning',
      })
        .then(() => {
          api.deleteItem(ids).then(res => {
            if (res.data.status === 200) {
              const { data: securityList } = res.data
              if (this.isEmpty(securityList)) {
                this.$blauShowSuccess('删除成功')
              } else {
                if (!this.isEmpty(securityList)) {
                  // this.$blauShowFailure(
                  //   `信息项“${securityList
                  //     .map(item => item.name)
                  //     .join(',')}”已被关联到安全分类，不允许被删除`
                  // )
                  this.showDeleteTips = true
                  this.deleteTipList = securityList
                  this.successNum = ids.length - securityList.length
                }
              }
              const isLastPage =
                (this.itemList.length - ids.length) /
                  this.itemPagination.pageSize !==
                this.itemPagination.currentPage
              this.getItemTableData({
                currentPage: isLastPage
                  ? this.itemPagination.currentPage - 1
                  : this.itemPagination.currentPage,
              })
              this.$refs.itemTable.clearSelection()
              this.tableSelection = []
            } else {
              this.$blauShowFailure(res.data.errorMsg)
            }
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
        this.itemDetails = {}
        this.autoCode = false
        this.itemTitle = ''
      }
    },

    // 获取信息项列表数据
    async getItemTableData(defaultParam) {
      this.tableLoading = true
      const param = {
        catalogId: this.nowFolder.id,
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
          ...defaultParam,
        },
      }
      try {
        const queryRes = await api.getItemData(param)
        if (
          queryRes.status === 200 &&
          queryRes.data &&
          param.catalogId === this.nowFolder.id
        ) {
          this.itemList = queryRes.data.content || []
          this.itemPagination = {
            currentPage: param.data.currentPage,
            pageSize: param.data.pageSize,
            total: queryRes.data.totalItems,
          }
        } else {
          this.$blauShowFailure(queryRes.data)
        }
        this.tableLoading = false
      } catch (error) {
        this.$blauShowFailure(error)
        this.tableLoading = false
      }
    },

    // 选择信息项
    tableSelectionChanged(selection) {
      this.tableSelection = selection
    },

    // 信息项表格currentPage
    handleCurrentChange(val) {
      // console.log(val)
      this.getItemTableData({
        currentPage: val,
      })
    },

    // 信息项表格 pageSize
    handleSizeChange(size) {
      this.getItemTableData({
        pageSize: size,
      })
    },

    handleItemSortChange({ column, order, prop }) {
      // console.log(order, prop)
      this.searchFormData.orderBy = order ? prop : ''
      this.searchFormData.seq = order
      this.getItemTableData({
        currentPage: 1,
      })
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
            this.$blauShowSuccess('提交成功')
            this.showUdps = false
            this.udps = []
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },

    // 获取扩展属性（新增、编辑或查看信息项时）
    getUdps(id) {
      if (id) {
        api.getItemUdpsById(id).then(res => {
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
        callback(new Error('请完成扩展属性值'))
      }
    },
    // 下载导入模板
    modelDownload() {
      const url =
        this.$url + `/service/datasecurity/sensitive/download/template`
      this.$downloadFilePost(url, {}, '信息项模板')
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
          this.$blauShowFailure('请选择xlsx格式文件')
          this.formFile = []
          this.$refs.itemImport.showList = []
          this.$refs.itemImport.$refs.upload.uploadFiles = []
          return false
        }
      }
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm('仅支持上传一个文件，是否覆盖？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
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
      return `${this.$url}/service/datasecurity/sensitive/import/standard?autoNum=${this.autoCodeSelect}`
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
      async handler(node) {
        if (node && node.id) {
          await this.getAllSubCatalog(
            node.catalogPath
              ? `${node.catalogPath}/${node.id}`
              : `${this.nowFolder.catalogPath}/${this.nowFolder.id}/${data.id}`
          )
          this.expandParents(node)
          this.getItemTableData({
            pageNum: 1,
            pageSize: 20,
          })
          this.$nextTick(() => {
            this.$refs.mainTree.$refs.tree.setCurrentKey(node.id)
          })
        }
        this.$datablauLoading.close()
      },
    },
    treeData: {
      handler(newData, prevData) {
        // console.log(newData, prevData, newData.length && !prevData.length)
        if (newData.length && !prevData.length) {
          this.nowFolder = newData[0]
        }
      },
    },
  },
}
