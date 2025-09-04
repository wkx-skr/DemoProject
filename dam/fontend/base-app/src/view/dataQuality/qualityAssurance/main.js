import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import userSelect from './userSelect.vue'

export default {
  components: { userSelect },
  data() {
    return {
      currentTab: 'businessList',
      lastTab: 'businessList',
      showAddBusinessRule: false,
      businessRulesMap: {},
      businessRulesArray: [],
      rulesEditing: [],
      categories: this.$modelCategories,
      editTitle: this.$t('quality.page.qualityAssurance.addDirectory'),
      dialogVisible: false,
      keyword: '',
      ruleForm: {
        name: '',
        type: 'QUALITY_RULE',
        parentId: null,
        id: null,
        owner: null,
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('quality.page.qualityAssurance.rulesName'),
            trigger: 'blur',
          },
        ],
        owner: [
          {
            required: true,
            message: this.$t('quality.page.qualityAssurance.rulesOwner'),
            trigger: 'blur',
          },
        ],
      },
      rules2: {
        groupIds: [
          {
            required: true,
            message: '请选择用户组',
            trigger: 'change',
          },
        ],
        accessAuth: [
          {
            required: true,
            message: '请选择权限',
            trigger: 'change',
          },
        ],
      },
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      treeData: null,
      treeKey: 0,
      showCodePop: false,
      isEdit: false,
      catalogsMap: new Map(),
      catalogPath: [],
      nav: [],
      catalogStr: '',
      routeString: '',
      ruleDetail: [],
      dialogVisible2: false,
      nodeArr: {
        categoryAuths: [],
      },
      formOwner: {
        owner: null,
        ownerOptions: [],
      },
      accessAuthOsptions: [
        { value: 'WRITE', label: this.$t('common.button.edit') },
        { value: 'READ', label: this.$t('common.button.scan') },
      ],
      jurisdictionArr: {
        WRITE: '编辑',
        READ: '查看',
      },
      groupIdsOptions: [],
      categoryId: null,
      rowList: [],
      activeName: 'catalogue',
      rowList2: [],
      parentIdNow: null,
      parentMenuList: [],
      catalogId: null,
      modify: true,
      ownerModify: true,
      clickData: null,
      clickNode: null,
      loadingDetail: true,
      nodeData: [],
      clickDataName: '',
      catalogueKeyword: '',
      dataDisplay: [],
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      currentPageInherit: 1,
      pageSizeInherit: 20,
      totalItemsInherit: 0,
      inheritKeyword: '',
      optioInherit: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      selectList: [],
      dialogVisibleUser: false,
      isShowTooltip: false,
      multipleSelection: [],
      dataDisplayInherit: null,
      modelGroupId: null,
      accessAuthInherit: false,
      modelGroupIdInherit: null,
      initialization: true,
    }
  },
  mounted() {
    this.getTreeData()
    this.initResizeHorizontal()
    this.$bus.$on('startEditBusinessRule', detail => {
      this.addTab('business', _.clone(detail))
      this.showAddBusinessRule = true
      this.currentTab = 'edit'
      this.ruleDetail = detail
      this.nodeData = [
        { name: '业务规则', couldClick: false },
        { name: detail.name, couldClick: false },
      ]
    })
    this.$bus.$on('addBusinessRule', catalogStr => {
      this.catalogStr = catalogStr
      this.showAddBusinessRule = true
      this.currentTab = 'add'
      this.nodeData = [
        { name: '业务规则', couldClick: false },
        { name: '创建规则', couldClick: false },
      ]
    })
    this.$bus.$on('removeAddRule', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
    this.$bus.$on('rulesDeleted', rules => {
      rules.forEach(rule => {
        this.removeTab(rule.name)
      })
    })
    this.$bus.$on('removeEditRule', name => {
      this.removeTab(name)
    })
    this.$bus.$on('cancel', () => {
      this.removeTab(this.currentTab)
    })
    this.getGroups()
  },
  beforeDestroy() {
    this.$bus.$off('cancel')
    this.$bus.$off('startEditBusinessRule')
    this.$bus.$off('addBusinessRule')
    this.$bus.$off('removeAddRule')
    this.$bus.$off('removeEditRule')
    this.$bus.$off('rulesDeleted')
  },
  methods: {
    searchTree(nodes, searchKey) {
      for (let _i = 0; _i < nodes.length; _i++) {
        if (nodes[_i].id === searchKey) {
          return nodes[_i].name
        } else {
          if (nodes[_i].subNodes && nodes[_i].subNodes.length > 0) {
            let res = this.searchTree(nodes[_i].subNodes, searchKey)
            if (res) {
              return res
            }
          }
        }
      }
      return null
    },
    onMouseOver(str) {
      const tag = this.$refs[str]
      const parentWidth = tag.parentNode.offsetWidth // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth
    },
    primary(selectedPerson) {
      this.dialogVisibleUser = false
      let response = []
      selectedPerson.add.forEach(element => {
        response.push({
          accessAuth: element.permission,
          categoryId: this.catalogId,
          groupId: element.id,
          childrenInherit: selectedPerson.childrenInherit,
        })
      })
      this.$http
        .post(`${this.$quality_url}/categories/category/grantAuth`, response)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.qualityAssurance.grantAuthSuccess')
          )
          this.getTreeData(false)
          this.modify = true
          this.nodeArr.categoryAuths = []
          this.loadingDetail = false
          this.getAuth(this.catalogId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close() {
      this.dialogVisibleUser = false
    },
    handleDeleteClick(row, type) {
      let response = []

      if (type) {
        this.multipleSelection.forEach(element => {
          response.push(element.id)
        })
      } else {
        response.push(row.id)
      }

      this.$http
        .post(`${this.$quality_url}/categories/category/deleteAuth`, response)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.qualityAssurance.deleteSuccess')
          )
          this.getAuth(this.catalogId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getAuth(this.catalogId)
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getAuth(this.catalogId)
    },
    handleSizeChangeInherit(size) {
      this.pageSizeInherit = size
      this.currentPageInherit = 1
      this.getAuth(this.catalogId)
    },
    handleCurrentChangeInherit(current) {
      this.currentPageInherit = current
      this.getAuth(this.catalogId)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    addUserGroup() {
      this.getGroup()
      this.dialogVisibleUser = true
    },
    searchList() {
      this.getAuth(this.catalogId)
    },
    activeNameChange(name) {
      if (this.activeName === 'catalogue') {
        this.accessAuthInherit = false
        this.getAuth(this.catalogId)
      } else {
        this.accessAuthInherit = true
        this.getAuth(this.catalogId)
      }
    },
    updateAuth(row) {
      let response = {
        accessAuth: row.accessAuth,
        categoryId: row.categoryId,
        groupId: row.groupId,
        id: row.id,
      }
      this.$http
        .post(`${this.$quality_url}/categories/category/updateAuth`, response)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.qualityAssurance.updateAuthSuccess')
          )
          this.getAuth(this.catalogId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取用户组
    getGroup() {
      this.$http
        .get('/user/org/groups')
        .then(res => {
          this.selectList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectSubmitter() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.ruleForm.owner = res[0].username
        this.$refs.ruleForm.validateField('owner')
      })
    },
    selectSubmitter2() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.formOwner.owner = res[0].username
        this.saveOwner()
      })
    },
    changeOwner() {},
    modifyGrantAuth() {
      this.modify = false
    },
    modifyOwner() {
      this.ownerModify = false
    },
    saveOwner() {
      this.$http
        .post(
          `${this.$quality_url}/quality/category/updateCategoryOwner?categoryId=${this.clickData.id}&owner=${this.formOwner.owner}`
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.qualityAssurance.updateCategoryOwner')
          )
          this.ownerModify = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeOwner() {
      this.ownerModify = true
    },
    test(tree) {
      tree.forEach(item => {
        if (!item.parentId) return
        const pName = item.name
        if (item.subNodes) {
          item.subNodes.forEach(c => {
            c.path = pName
          })
          this.test(item.subNodes)
        }
      })
      return tree
    },
    getParent(node) {
      var that = this
      if (node.parent.data && !Array.isArray(node.parent.data)) {
        if (node.data.categoryAuths !== null) {
          node.data.categoryAuths.forEach(element => {
            that.rowList.push(element)
          })
        }
        that.getParent(node.parent)
      } else if (that.rowList.length === 0) {
        if (node.data.categoryAuths !== null) {
          node.data.categoryAuths.forEach(element => {
            that.rowList.push(element)
          })
        }
      } else {
        if (node.data.categoryAuths !== null) {
          node.data.categoryAuths.forEach(element => {
            that.rowList.push(element)
          })
        }
      }
    },
    handleData(data) {
      let map = new Map()
      data.forEach(item => {
        if (!map.has(item.groupId)) {
          map.set(item.groupId, item)
        } else {
          if (map.get(item.groupId).accessAuth < item.accessAuth) {
            map.set(item.groupId, item)
          }
        }
      })
      let arr = []
      for (const key of map) {
        arr.push(key[1])
      }
      return arr
    },
    deleteClick(index) {
      this.nodeArr.categoryAuths.splice(index, 1)
    },
    addClick(index) {
      this.nodeArr.categoryAuths.splice(index + 1, 0, {
        accessAuth: 'READ',
        groupId: '',
        categoryId: this.categoryId,
      })
    },
    groupIdsChange(value) {
      // console.log(value, 'value')
    },
    getGroups() {
      this.$http
        .get(`/user/org/groups`)
        .then(res => {
          this.groupIdsOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveGrantAuth() {
      this.$refs.ruleForm2.validate(valid => {
        if (valid) {
          this.loadingDetail = true
          this.$http
            .post(
              `${this.$quality_url}/categories/category/grantAuth?catalogId=${this.catalogId}`,
              this.nodeArr.categoryAuths
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityAssurance.grantAuthSuccess')
              )
              this.getTreeData(false)
              this.modify = true
              this.nodeArr.categoryAuths = []
              this.loadingDetail = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    closeGrantAuth() {
      this.modify = true
      this.nodeArr.categoryAuths = []
      this.$nextTick(function () {
        this.$refs.mainTree.setCurrentKey(this.clickData.id)
        this.grantAuth(
          this.$refs.mainTree.getCurrentNode(this.clickData.id),
          this.$refs.mainTree.getNode(this.clickData.id)
        )
      })
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.removeTab()
      }
    },
    dataOptionsFunction(data, node) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.id !== 0) {
        options.push({
          label: this.$t('quality.page.qualityAssurance.addSubdirectory'),
          callback: () => {
            this.addCatalogue(data, node)
          },
          args: 'folder',
        })
        options.push({
          label: this.$t('quality.page.qualityAssurance.rename'),
          callback: () => {
            this.handleEditCatalogue(data)
          },
          args: 'folder',
        })
        options.push({
          label: this.$t('common.button.delete'),
          callback: () => {
            this.deleteCatalogue(data)
          },
          args: 'folder',
        })
      }
      return options
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    grantAuth(data, node) {
      this.parentIdNow = data.parentId
      this.catalogId = data.id
      if (data.parentId === 0) {
        this.activeName = 'catalogue'
      }
      this.getParent(node)
      this.getGroups()
      this.categoryId = data.id
      if (data.categoryAuths === null) {
        this.nodeArr.categoryAuths = [
          {
            accessAuth: 'READ',
            groupId: '',
            categoryId: data.id,
          },
        ]
      } else {
        data.categoryAuths.forEach(element => {
          this.nodeArr.categoryAuths.push({
            accessAuth: element.accessAuthLevel,
            groupId: element.groupId,
            categoryId: element.categoryId,
          })
        })
      }
      this.rowList = this.rowList.filter(item => {
        return item.categoryId != data.id
      })
      this.rowList = this.handleData(this.rowList)
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.folder-line'),
          rightDom: $('.content-detail'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    nameKeydown(e) {
      e.target.value = e.target.value.replace(/[`\\/]/g, '')
    },
    handleEditCatalogue(data) {
      this.editTitle = this.$t('quality.page.qualityAssurance.renameCatalogue')
      if (data) {
        this.ruleForm.name = data.name
        this.ruleForm.id = data.id
        this.ruleForm.parentId = data.parentId
      }
      this.dialogVisible = true
      this.isEdit = true
    },
    handleDialogClose() {
      this.dialogVisible = false
      this.ruleForm.name = ''
      this.ruleForm.id = null
      this.ruleForm.parentId = null
      this.parentMenuList = []
    },
    deleteCatalogue(data) {
      const text = this.$t('quality.page.qualityAssurance.deleteTips', {
        name: data.name,
      })
      this.$DatablauCofirm(text, this.$t('quality.page.qualityAssurance.tip'), {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          this.$http
            .post(
              this.$quality_url +
                `/quality/category/deleteCategory?categoryId=${data.id}`
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityAssurance.deleteSucceeded')
              )
              this.nodeArr.categoryAuths = []
              this.getTreeData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getTreeData(type) {
      this.treeData = null
      this.$http
        .get(
          this.$quality_url +
            '/categories/tree/?type=QUALITY_RULE&forCurrentUser=false'
        )
        .then(res => {
          if (`${res}` === 'null' || !res.data.subNodes) {
            this.treeData = []
            this.dataDisplay = []
            this.dataDisplayInherit = []
            this.loadingDetail = false
            return
          }
          // res.data.name = '全部业务规则'
          // this.treeData.push(res.data)
          this.catalogsMap = new Map()
          this.catalogsMap.set(res.data.id, res.data)
          const arrayToMap = arr => {
            if (arr !== null) {
              arr.forEach(item => {
                this.catalogsMap.set(item.id, item)
                if (Array.isArray(item.subNodes)) {
                  arrayToMap(item.subNodes)
                }
              })
            }
          }
          if (
            Array.isArray(res.data.subNodes) &&
            res.data.subNodes.length === 0
          ) {
            this.treeData = []
            this.dataDisplay = []
            this.dataDisplayInherit = []
            this.loadingDetail = false
            return
          }
          arrayToMap(res.data.subNodes)
          if (!res.data.subNodes) {
            this.loadingDetail = false
            this.initialization = true
          } else {
            this.initialization = false
          }
          if (res.data.subNodes) {
            this.$utils.sort.sortConsiderChineseNumber(
              res.data.subNodes,
              'name',
              'ascending',
              true
            )
            this.treeData = this.test(res.data.subNodes)
            if (type !== false) {
              this.$nextTick(function () {
                this.$refs.mainTree.setCurrentKey(res.data.subNodes[0].id)
                this.grantAuth(
                  res.data.subNodes[0],
                  this.$refs.mainTree.getNode(res.data.subNodes[0].id)
                )
                this.clickData = res.data.subNodes[0]
                this.clickDataName = res.data.subNodes[0].name
                this.getCategoryOwner(res.data.subNodes[0])
                this.nodeData = []
                this.nodeData.push({
                  name: res.data.subNodes[0].name,
                  couldClick: false,
                })
                this.getAuth(res.data.subNodes[0].id)
              })
            } else {
              this.$nextTick(function () {
                this.$refs.mainTree.setCurrentKey(this.clickData.id)
                this.grantAuth(
                  this.$refs.mainTree.getCurrentNode(this.clickData.id),
                  this.$refs.mainTree.getNode(this.clickData.id)
                )
                this.scroll(this.clickData)
              })
            }
          }
        })
        .catch(e => {
          this.treeData = []
          this.dataDisplay = []
          this.dataDisplayInherit = []
          this.$showFailure(e)
        })
    },
    addRulesCatalogue(value) {
      this.dialogVisible = true
      this.isEdit = false
      this.editTitle = this.$t('quality.page.qualityAssurance.addDirectory')
      this.parentMenuList = []
      this.ruleForm.name = ''
      this.ruleForm.owner = null
      this.ruleForm.parentId = ''
      if (value === 'add2') {
        this.ruleForm.parentId = this.ruleForm.id
      }
    },
    addCatalogue(data, node) {
      this.parentMenuList = []
      this.ruleForm.parentId = data.id
      this.nodeClick2(node)
      this.dialogVisible = true
      this.editTitle = this.$t('quality.page.qualityAssurance.addSubdirectory')
      this.isEdit = false
      this.ruleForm.name = ''
      this.ruleForm.owner = ''
      this.parentMenuList.reverse()
    },
    nodeClick2(node) {
      if (node.label) {
        this.parentMenuList.push(node.label)
      }
      // 迭代
      if (node.parent) {
        this.nodeClick2(node.parent)
      }
    },
    nodeClickNode(node) {
      if (node.label) {
        this.nodeData.push({
          name: node.label,
          couldClick: false,
        })
      }
      // 迭代
      if (node.parent) {
        this.nodeClickNode(node.parent)
      }
    },
    conEdi() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.ruleForm.name = this.ruleForm.name.replace('/', '')
          const response = {
            name: this.ruleForm.name,
            type: 'QUALITY_RULE',
            owner: this.ruleForm.owner,
          }
          if (this.ruleForm.parentId) {
            response.parentId = this.ruleForm.parentId
          }
          this.$http
            .post(
              this.$quality_url + '/quality/category/createCategory',
              response
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityAssurance.createdSuccessfully')
              )
              this.dialogVisible = false
              this.getTreeData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    editCatalogueName() {
      const requestBody = {
        name: this.ruleForm.name,
        type: 'QUALITY_RULE',
        merge: false,
        parentId: this.ruleForm.parentId,
      }
      this.$http
        .put(this.$quality_url + `/categories/${this.ruleForm.id}`, requestBody)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.qualityAssurance.modifySuccessfully')
          )
          this.dialogVisible = false
          this.getTreeData()
          this.$refs.businessRules.loadRules(this.ruleForm.name)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleNodeClick(data, node) {
      this.activeName = 'catalogue'
      this.accessAuthInherit = false
      this.nodeData = []
      this.clickDataName = data.name
      this.clickData = data
      this.clickNode = node
      this.rowList = []
      this.nodeArr.categoryAuths = []
      this.grantAuth(data, node)
      this.getCategoryOwner(data)
      this.nodeClickNode(node)
      this.getAuth(data.id)
      this.ownerModify = true
      this.ownerMmodifyodify = true
      this.modify = true
      this.loadingDetail = true
      this.modelGroupId = null
      this.modelGroupIdInherit = null
      this.nodeData.reverse()
    },
    // 滚动到指定元素位置
    scroll(data) {
      const node = document.getElementById(data.id)
      setTimeout(() => {
        if (node) {
          this.$nextTick(() => {
            node.scrollIntoView({ block: 'center' })
          })
        }
      }, 100)
    },
    getAuth(id) {
      this.dataDisplay = []
      this.dataDisplayInherit = []
      let response = {
        categoryId: id,
        accessAuthInherit: this.accessAuthInherit,
      }
      if (this.activeName === 'catalogue') {
        response.groupIds = this.modelGroupId ? [this.modelGroupId] : null
        response.currentPage = this.currentPage
        response.pageSize = this.pageSize
      } else {
        response.groupIds = this.modelGroupIdInherit
          ? [this.modelGroupIdInherit]
          : null
        response.currentPage = this.currentPageInherit
        response.pageSize = this.pageSizeInherit
      }
      this.$http
        .post(this.$quality_url + `/categories/category/getAuthList`, response)
        .then(res => {
          // if (`${res}` === 'null') {
          //   this.dataDisplay = []
          //   this.dataDisplayInherit = []
          //   return
          // }
          if (this.activeName === 'catalogue') {
            res.data.forEach(element => {
              element.name = this.groupIdsOptions.find(
                x => x.id === element.groupId
              )?.groupName
            })
            this.dataDisplay = res.data
            // this.totalItems = res.data.totalItems
          } else {
            res.data.forEach(element => {
              element.name = this.groupIdsOptions.find(
                x => x.id === element.groupId
              )?.groupName
            })
            this.dataDisplayInherit = res.data
            // this.totalItemsInherit = res.data.totalItems
          }
        })
        .catch(e => {
          this.dataDisplay = []
          this.dataDisplayInherit = []
          this.$showFailure(e)
        })
    },
    getCategoryOwner(data) {
      this.$http
        .post(
          this.$quality_url +
            `/quality/category/getCategoryOwner?categoryId=${data.id}`
        )
        .then(res => {
          this.formOwner.owner = res.data
          this.loadingDetail = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    renderContent(h, { node, data, store }) {
      if (
        data.name === '全部业务规则' ||
        (!this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME &&
          !this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE)
      ) {
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span style="margin-left:5px">
              {node.label.indexOf('/') != -1
                ? node.label.split('/')[1]
                : node.label}
            </span>
            <span
              class="three-point"
              style="position: absolute;right: 5px;"
            ></span>
          </span>
        )
      } else {
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            &nbsp;
            <span>
              {node.label.indexOf('/') != -1
                ? node.label.split('/')[1]
                : node.label}
            </span>
            <span class="three-point" style="position: absolute;right: 5px;">
              <el-dropdown
                trigger="hover"
                style="float:right;margin-right:5px"
                size="mini"
                on-command={command => this.commandHandle(command, data)}
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-more" slot="reference"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  {this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME ? (
                    <el-dropdown-item command="addSame" style="padding: 0 20px">
                      重命名
                    </el-dropdown-item>
                  ) : (
                    ''
                  )}
                  {this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE ? (
                    <el-dropdown-item command="addNext" style="padding: 0 20px">
                      删除
                    </el-dropdown-item>
                  ) : (
                    ''
                  )}
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        )
      }
    },
    commandHandle(command, data) {
      switch (command) {
        case 'addSame':
          this.handleEditCatalogue(data)
          break
        case 'addNext':
          this.deleteCatalogue(data)
          break
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    refreshCallback() {
      this.$refs.businessRules.queryRules()
    },
    addTab(type, data) {
      if (type === 'business') {
        if (this.businessRulesMap[data.name]) {
        } else {
          this.businessRulesMap[data.name] = data
          this.businessRulesArray.push(data)
        }
        this.currentTab = data.name
      }
    },
    removeTab(tabName) {
      this.showAddBusinessRule = false
      // if (tabName === 'add') {
      //   this.currentTab = this.lastTab
      //   this.showAddBusinessRule = false
      // } else {
      //   this.businessRulesArray.forEach((rule, index) => {
      //     if (rule.name === tabName) {
      //       this.businessRulesArray.splice(index, 1)
      //       delete this.businessRulesMap[tabName]
      //     }
      //   })
      //   this.currentTab = this.lastTab
      // }
    },
    updateCurrentTab(rule) {
      this.businessRulesArray.forEach((item, index) => {
        if (item.id === rule.id) {
          this.businessRulesArray[index] = rule
          this.$set(this.businessRulesArray, '-1', item.id)
          this.currentTab = rule.name
        }
      })
    },
  },
  computed: {
    showTabs() {
      return this.businessRulesArray.length > 0 || this.showAddBusinessRule
    },
    treeDataNull() {
      return this.treeData && this.treeData.length === 0
    },
  },
  watch: {
    keyword(val) {
      this.$refs.mainTree.filter(val)
    },
  },
}
