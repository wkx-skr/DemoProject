import searchbusinesscolumn from './searchbusinesscolumn.vue'
import chooseReport from './chooseReport.vue'
import chooseFileAsset from './chooseFileAsset.vue'
import chooseCode from './chooseCode.vue'
import chooseApi from './chooseApi.vue'
import HTTP from '@/http/main.js'
export default {
  components: {
    searchbusinesscolumn,
    chooseReport,
    chooseFileAsset,
    chooseCode,
    chooseApi,
  },
  props: {
    writable: {
      type: Boolean,
      default: false,
    },
    dataSecurity: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
  },
  data() {
    return {
      loading: false,
      base: this.$url + '/service/catalogs',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'catalogName',
      },
      keyword: '',
      currentData: null,

      expandedKeys: [],

      dialogVisible: false,
      dialogVisibleData: false,
      dialogVisibleUpload: false,
      dialogVisibleRename: false,
      dialogVisibleMove: false,
      reportDialogVisible: false,
      catalogName: '',
      newName: '',
      currentId: 0,
      currentParentId: 0,
      selectedParentId: 0,
      currentDepth: 1,
      treeLoading: false,

      fileDialogVisible: false,
      codeDialogVisible: false,
      apiDialogVisible: false,
      ruleForm: {
        parentId: [],
        name: '',
        englishName: '',
        comment: '',
      },
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      },
      categoryOptions: [],
      optionProps: {
        value: 'id',
        label: 'name',
        checkStrictly: true,
      },
      categoryDialogTitle: '',
      categoryDialogType: '',
      handleNodeClickData: [],
      showUnFold: true,
    }
  },
  mounted() {
    this.initEventListener()
    this.getData()
  },
  beforeDestroy() {
    this.$bus.$off('addColumnToBusinessMenu')
    this.$bus.$off('updateBusinessList')
  },
  methods: {
    expandOrCollapseTopLevel() {
      if (this.showUnFold) {
        this.$refs.tree2.collapseTopLevel()
      } else {
        this.$refs.tree2.expandTopLevel()
      }
      this.showUnFold = !this.showUnFold
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (this.$auth.MAIN_CATALOG_MANAGE) {
        if (data.level === 1) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: '添加子目录',
            callback: () => {
              this.categoryDialog('add', data)
            },
          })
        } else {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: '添加子目录',
            callback: () => {
              this.categoryDialog('add', data)
            },
          })
          if (this.$featureMap.FE_META) {
            options.push({
              icon: 'iconfont icon-tianjia',
              label: '添加元数据',
              callback: () => {
                this.showDialog('item', data)
              },
            })
            options.push({
              icon: 'iconfont icon-tianjia',
              label: '添加报表',
              callback: () => {
                this.showDialog('report', data)
              },
            })
            if (!this.dataSecurity) {
              options.push({
                icon: 'iconfont icon-tianjia',
                label: '添加文件资产',
                callback: () => {
                  this.showDialog('file', data)
                },
              })
            }
          }
          if (this.$featureMap.FE_DOMAIN) {
            options.push({
              icon: 'iconfont icon-tianjia',
              label: '添加数据标准',
              callback: () => {
                this.showDialog('domain', data)
              },
            })
          }
          options.push({
            icon: 'iconfont icon-delete',
            label: '删除',
            callback: () => {
              this.currentId = data.id
              this.removeCatalog()
            },
          })
          options.push({
            icon: 'iconfont icon-bianji',
            label: '修改目录',
            callback: () => {
              this.categoryDialog('edit', data)
            },
          })
          options.push({
            icon: 'iconfont icon-Moveto',
            label: '移动到...',
            callback: () => {
              this.currentId = data.id
              this.dialogVisibleMove = true
            },
          })
        }
      }

      return options
    },
    initEventListener() {
      const self = this
      $(document).on('click', self.clickDocument)
      self.$bus.$on('addColumnToBusinessMenu', obj => {
        self.addToCatalog(obj.column, obj.prevent)
      })
      self.$bus.$on('updateBusinessList', () => {
        self.handleNodeClick(this.currentData, { isLeaf: true })
      })
    },
    addToCatalog(objectId, preventErrorMsg) {
      const self = this
      self.$http
        .post(self.base + '/' + self.currentParentId + '/' + objectId)
        .then(data => {
          self.$message.success(this.$version.common.operationSucceed)
          self.handleNodeClick(this.currentData, { isLeaf: true })
          self.$bus.$emit('addColumnToBusinessMenuSuccess', {})
          self.handleNodeExpand({ id: self.currentParentId })
        })
        .catch(e => {
          if (!preventErrorMsg) {
            this.$showFailure(e)
          }
        })
    },
    updatePath(node) {
      const path = []
      let current = node
      while (current && current.data.name) {
        let obj = {}
        obj.name = current.data.name
        obj.id = current.data.id
        path.unshift(obj)
        this.$emit('update-path', path)
        current = current.parent
      }
    },
    handleNodeClick(data, node) {
      this.currentData = data
      if (!node.data) {
        let tree = this.$refs.tree2
        let nodeData = tree.getNode(data.id)
        this.updatePath(nodeData)
      } else {
        this.updatePath(node)
      }

      this.handleNodeClickData = data
      this.ruleForm.parentId = []
      const self = this
      this.currentId = data.id
      this.parentId = data.parentId
      this.currentDepth = node.level
      if (node) {
        self.currentParentId = data.id
        this.$emit('node-click', data.id, data.name)
      }
      // let tree = this.$refs.tree2
      // this.getTreeNode(tree.getNode(data.id))
    },
    getTreeNode(node) {
      // 获取当前树节点和其父级节点
      if (node) {
        if (node.data.id !== undefined) {
          this.ruleForm.parentId.unshift(node.data.id) // 在数组头部添加元素
          if (node.parent && node.data.parentId !== null) {
            this.getTreeNode(node.parent) // 递归
          }
        }
      }
    },
    handleNodeExpand(data, node) {
      // const self = this
      // if (self.expandedKeys.indexOf(data.id) == -1) {
      //   self.expandedKeys.push(data.id)
      // }
    },
    handleNodeCollapse(data, node) {
      const self = this
      let index = -1
      index = self.expandedKeys.indexOf(data.id)
      if (index != -1) {
        self.expandedKeys.splice(index, 1)
      }
    },
    ohandleNodeClick(data) {
      return
      if (data.type === 'MODEL') {
        this.$emit('node-click', data.id)
        this.currentData = data
        this.changeHighlightModel()
      } else if (data.type === 'ALL') {
        this.$emit('node-click', null)
        this.changeHighlightModel('remove')
      } else {
        this.changeHighlightModel('remove')
      }
    },

    getData() {
      HTTP.refreshBusinessCatalog()
        .then(res => {
          /*
          这段代码是用来检测当数据库里有order为null的数据时，能否正常浏览
        const setNull = node => {
          node.order = null
          if (node.children) {
            node.children.forEach(item => {
              setNull(item)
            })
          }
        }
        setNull(res.data) */
          if (res.data.children) {
            this.setName(this.treeSort(res.data))
            this.treeData = this.treeSort(res.data)
            this.categoryOptions = this.getTreeData(this.treeSort(res.data))
            setTimeout(() => {
              if (this.keyword && this.keyword !== '') {
                this.$refs.tree2.filter(this.keyword)
              }
              $('.el-tree-node')[0] && $('.el-tree-node')[0].click()
            })
          }
          // this.refreshGlobalCatalog()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    categoryChange(value) {},
    setName(datas) {
      // 遍历树  获取id数组
      for (var i in datas) {
        // this.expandedKeys.push(datas[i].id) // 遍历项目满足条件后的操作
        if (datas[i].children) {
          // 存在子节点就递归
          if (datas[i].englishName && datas[i].englishName !== null) {
            datas[i].catalogName =
              datas[i].name + '(' + datas[i].englishName + ')'
          } else {
            datas[i].catalogName = datas[i].name
          }
          this.setName(datas[i].children)
        }
      }
    },
    getTreeData(data) {
      for (var i = 0; i < data.length > 0; i++) {
        if (data[i].children == null || data[i].children.length <= 0) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          // if (data[i].englishName !== '' && data[i].englishName !== null) {
          //   data[i].name = data[i].name + '(' + data[i].englishName + ')'
          // }
          // children若不为空数组，则继续 递归调用 本方法
          this.getTreeData(data[i].children)
        }
      }
      return data
    },
    refreshGlobalCatalog() {
      this.loading = true
      HTTP.refreshBusinessCatalog()
        .then(res => {
          this.loading = false
          if (!res.data) {
            return
          }

          const data = res.data
          const globalData = this.$globalData
          this.$utils.sort.sortConsiderChineseNumber(data.children)
          data.children.forEach(item => {
            if (item.children) {
              this.$utils.sort.sortConsiderChineseNumber(item.children)
            }
          })
          globalData.catalogs = data
          globalData.catalogsMap = new Map()
          globalData.catalogsMap.set(data.id, data)
          const arrayToMap = arr => {
            arr.forEach(item => {
              globalData.catalogsMap.set(item.id, item)
              if (Array.isArray(item.children)) {
                arrayToMap(item.children)
              }
            })
          }
          arrayToMap(data.children)
          if (res.data.children) {
            this.setName(this.treeSort(res.data))
            this.treeData = this.treeSort(res.data)
            this.categoryOptions = this.getTreeData(this.treeSort(res.data))
            setTimeout(() => {
              if (this.keyword && this.keyword !== '') {
                this.$refs.tree2.filter(this.keyword)
              }
              $('.el-tree-node')[0] && $('.el-tree-node')[0].click()
            })
          }
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    treeSort(root) {
      const t = root.children
      if (t != null) {
        this.sortByName(root, 1)
        // t.forEach(item=>{
        //   this.sortByName(item);
        // });
      }
      root.name = '所有目录'
      this.expandedKeys.push(root.id)
      // return t
      return [root]
    },
    sortByName(node, level) {
      const departments = node.children
      node.level = level
      node.children.forEach(item => {
        this.sortByName(item, level + 1)
      })
      this.$utils.sort.sort(departments, 'order')
      // this.$utils.sort.sortConsiderChineseNumber(departments);
    },

    changeHighlightModel(status) {
      const tree = $('.list-box')
      const treeNodes = tree.find('.el-tree-node')

      treeNodes.removeClass('is-current')
      if (status !== 'remove') {
        const cur = tree
          .find('[data-id=' + this.currentData.id + ']')
          .parent()
          .parent()
        cur.addClass('is-current')
      }
    },
    // callContext(data, evt) {
    //   //      evt.stopPropagation();
    //   this.currentData = data
    //   this.currentId = data.id
    //   this.newName = data.name
    //   const x = evt.clientX
    //   const y = evt.clientY

    //   const options = []
    //   const node = this.$refs.tree2.getNode(data.id)
    //   if (data.level === 1) {
    //     options.push({
    //       icon: 'el-icon-plus',
    //       label: '添加子目录',
    //       callback: this.categoryDialog,
    //       args: 'add',
    //     })
    //   } else {
    //     if (
    //       this.$auth.MAIN_CATALOG_MANAGE_ADD &&
    //       this.$auth.MAIN_CATALOG_MANAGE_MODIFY &&
    //       this.$auth.MAIN_CATALOG_MANAGE_DELETE
    //     ) {
    //       options.push({
    //         icon: 'el-icon-plus',
    //         label: '添加子目录',
    //         callback: this.categoryDialog,
    //         args: 'add',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加元数据',
    //         callback: this.showDialog,
    //         args: 'item',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加数据标准',
    //         callback: this.showDialog,
    //         args: 'domain',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加报表',
    //         callback: this.showDialog,
    //         args: 'report',
    //       })
    //       if (!this.dataSecurity) {
    //         options.push({
    //           icon: 'el-icon-circle-plus',
    //           label: '添加文件资产',
    //           callback: this.showDialog,
    //           args: 'file',
    //         })
    //       }
    //       // options.push({
    //       //   icon: 'el-icon-circle-plus',
    //       //   label: '添加标准代码',
    //       //   callback: this.showDialog,
    //       //   args: 'code',
    //       // })
    //       // options.push({
    //       //   icon: 'el-icon-circle-plus',
    //       //   label: '添加数据服务API',
    //       //   callback: this.showDialog,
    //       //   args: 'api',
    //       // })
    //       options.push({
    //         icon: 'el-icon-delete',
    //         label: '删除',
    //         callback: this.removeCatalog,
    //       })
    //       options.push({
    //         icon: 'fa fa-edit',
    //         label: '修改目录',
    //         callback: this.categoryDialog,
    //         args: 'edit',
    //       })
    //       options.push({
    //         icon: 'fa-space-shuttle fa',
    //         label: '移动到...',
    //         callback: () => {
    //           this.dialogVisibleMove = true
    //         },
    //       })
    //     } else if (this.$auth.MAIN_CATALOG_MANAGE_ADD) {
    //       options.push({
    //         icon: 'el-icon-plus',
    //         label: '添加子目录',
    //         callback: this.categoryDialog,
    //         args: 'add',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加元数据',
    //         callback: this.showDialog,
    //         args: 'item',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加数据标准',
    //         callback: this.showDialog,
    //         args: 'domain',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加报表',
    //         callback: this.showDialog,
    //         args: 'report',
    //       })
    //       options.push({
    //         icon: 'el-icon-circle-plus',
    //         label: '添加文件资产',
    //         callback: this.showDialog,
    //         args: 'file',
    //       })
    //       // options.push({
    //       //   icon: 'el-icon-circle-plus',
    //       //   label: '添加标准代码',
    //       //   callback: this.showDialog,
    //       //   args: 'code',
    //       // })
    //       // options.push({
    //       //   icon: 'el-icon-circle-plus',
    //       //   label: '添加数据服务API',
    //       //   callback: this.showDialog,
    //       //   args: 'api',
    //       // })
    //     } else if (this.$auth.MAIN_CATALOG_MANAGE_MODIFY) {
    //       options.push({
    //         icon: 'fa fa-edit',
    //         label: '修改目录',
    //         callback: this.categoryDialog,
    //         args: 'edit',
    //       })
    //       options.push({
    //         icon: 'fa-space-shuttle fa',
    //         label: '移动到...',
    //         callback: () => {
    //           this.dialogVisibleMove = true
    //         },
    //       })
    //     } else if ($auth.MAIN_CATALOG_MANAGE_DELETE) {
    //       options.push({
    //         icon: 'el-icon-delete',
    //         label: '删除',
    //         callback: this.removeCatalog,
    //       })
    //     }
    //   }
    //   // options.push({
    //   //   icon: 'el-icon-unlock',
    //   //   label: '访问控制',
    //   //   callback: this.showAccessControl,
    //   // })
    //   if (options.length > 0) {
    //     let yOfResult = y
    //     if (window.innerHeight - y < 250) {
    //       yOfResult = window.innerHeight - 250
    //     }
    //     this.$bus.$emit('callContextMenu', {
    //       x: x,
    //       y: yOfResult,
    //       options: options,
    //     })
    //   }
    // },
    callbottomContent(evt) {
      const x = evt.clientX
      const y = evt.clientY

      const options = []
      if (this.$auth.MAIN_CATALOG_MANAGE_ADD) {
        options.push(
          {
            icon: 'iconfont icon-tianjia',
            label: '新建一级目录',
            callback: this.showAddL1,
          },
          {
            icon: 'iconfont icon-import',
            label: '导入资产目录',
            callback: this.importContent,
          },
          {
            icon: 'iconfont icon-export',
            label: '导出资产目录',
            callback: this.downloadTab,
          },
          {
            icon: 'iconfont icon-download',
            label: '下载模板',
            callback: this.dwonloadConTem,
          }
        )
      } else {
        options.push(
          {
            icon: 'iconfont icon-import',
            label: '导入资产目录',
            callback: this.importContent,
          },
          {
            icon: 'iconfont icon-export',
            label: '导出资产目录',
            callback: this.downloadTab,
          },
          {
            icon: 'iconfont icon-download',
            label: '下载模板',
            callback: this.dwonloadConTem,
          }
        )
      }

      if (options.length > 0) {
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: y,
          options: options,
        })
      }
    },
    showAddL1() {
      this.ruleForm.parentId = [0]
      this.categoryDialog('add', this.treeData[0])
    },
    dwonloadConTem() {
      const url = `${this.$url}/service/catalogs/export`
      this.$downloadFile(url)
    },
    downloadTab() {
      const url = `${this.$url}/service/catalogs/export/all`
      this.$downloadFile(url)
    },
    importContent() {
      $('#uploadConTem').click()
    },
    startImport() {
      this.treeLoading = true
    },
    handleUploadFailure(para) {
      this.treeLoading = false
      this.$showUploadFailure(para)
    },
    onUploadSuccessed(para) {
      this.$message.success('导入成功!')
      this.treeLoading = false
      this.refreshGlobalCatalog()
    },
    onUplodFailure(para) {
      this.$showUploadFailure(para)
      this.treeLoading = false
    },
    showDialog(self, data) {
      const tree = this.$refs.tree2
      let node = tree.getNode(data.id)
      this.currentData = data
      this.currentId = data.id
      this.currentParentId = data.id
      if (self === 'item') {
        this.dialogVisibleData = true
      } else if (self === 'folder') {
        this.dialogVisible = true
      } else if (self === 'domain') {
        this.$bus.$once('domainSelected', domain => {
          this.appendDomainToCatalog(domain)
        })
        this.$bus.$emit('callDomainSelector', { multiple: true })
        // this.$bus.$emit('callDomainSelector')
      } else if (self === 'report') {
        this.reportDialogVisible = true
      } else if (self === 'file') {
        this.fileDialogVisible = true
      }
      // else if (self === 'code') {
      //   this.codeDialogVisible = true
      // } else if (self === 'api') {
      //   this.apiDialogVisible = true
      // }
    },
    categoryDialog(type, dataArr) {
      this.handleNodeClickData = dataArr
      let mode, data
      if (typeof type === 'object') {
        mode = type[0]
        data = type[1]
      } else {
        mode = type
        data = dataArr
      }
      this.categoryDialogType = type
      if (mode === 'add') {
        let tree = this.$refs.tree2
        this.getTreeNode(tree.getNode(data.id))
        this.categoryDialogTitle = '增加目录项'
        this.ruleForm.name = ''
        this.ruleForm.englishName = ''
        this.ruleForm.comment = ''
        if (dataArr) {
          if (dataArr.parentId !== null) {
            this.ruleForm.parentId.push(dataArr.parentId)
          } else {
            this.ruleForm.parentId = [0]
          }
        }
        let toRepeat = new Set(this.ruleForm.parentId)
        this.ruleForm.parentId = [...toRepeat]
      } else {
        let tree = this.$refs.tree2
        this.getTreeNode(tree.getNode(data.id))
        this.categoryDialogTitle = '修改目录'
        this.ruleForm.parentId.pop()
        this.$set(this.ruleForm, 'parentId', this.ruleForm.parentId)

        // this.ruleForm.parentId.pop()
        this.ruleForm.name = data.name
        this.ruleForm.comment = data.comment
        this.ruleForm.englishName = data.englishName
        this.ruleForm.id = data.id
        this.ruleForm.order = data.order
        this.ruleForm.parentIdNum = data.parentId
        this.ruleForm.comment = data.comment
      }
      this.dialogVisible = true
    },
    cancelCatalog() {
      this.dialogVisible = false
      this.ruleForm.parentId = []
      this.ruleForm.name = ''
      this.ruleForm.englishName = ''
      this.ruleForm.comment = ''
      //   this.$nextTick(() => {
      //     this.$refs.ruleForm.resetFields() // 等弹窗里的form表单的dom渲染完在执行this.$refs.staffForm.resetFields()，去除验证
      //   })
    },
    empty() {
      this.ruleForm.name = ''
      this.ruleForm.englishName = ''
      this.ruleForm.comment = ''
    },
    appendDomainToCatalog(domain) {
      let resId = []
      if (Array.isArray(domain)) {
        domain.forEach(item => {
          resId.push(item.domainId)
        })
      } else {
        resId.push(domain.domainId)
      }
      let obj = {
        catalogId: this.currentParentId,
        typeId: 80010066,
        objectIds: resId,
      }
      const self = this
      this.$http
        .post(this.base + '/bind', obj)
        /* this.$http
        .post(
          this.base +
            `/${this.currentParentId}/${domain.domainId}?typeId=80010066`
        ) */
        .then(data => {
          this.$message.success(this.$version.common.operationSucceed)
          this.handleNodeClick(this.currentData, { isLeaf: true })
          this.handleNodeExpand({ id: self.currentParentId })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleAddReport(row) {
      const self = this
      this.$http
        .post(this.base + `/${this.currentParentId}/${row.id}?typeId=82800002`)
        .then(data => {
          this.$message.success(this.$version.common.operationSucceed)
          this.handleNodeClick(this.currentData, { isLeaf: true })
          this.handleNodeExpand({ id: self.currentParentId })
          this.$bus.$emit('reportAddedToCatalog')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addCatalogApi(row) {
      const self = this
      this.$http
        .post(this.base + `/${this.currentParentId}/${row.id}?typeId=82800019`)
        .then(data => {
          this.$message.success(this.$version.common.operationSucceed)
          this.handleNodeClick(this.currentData, { isLeaf: true })
          this.handleNodeExpand({ id: self.currentParentId })
          this.$bus.$emit('reportAddedToCatalog')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    add2Catalog(row) {
      const self = this
      this.$http
        .post(this.base + `/${this.currentParentId}/${row.id}?typeId=82800008`)
        .then(data => {
          this.$message.success(this.$version.common.operationSucceed)
          this.handleNodeClick(this.currentData, { isLeaf: true })
          this.handleNodeExpand({ id: self.currentParentId })
          this.$bus.$emit('reportAddedToCatalog')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    appendCatalog() {
      let response = {
        parentId: this.ruleForm.parentId.pop(),
        name: this.ruleForm.name,
        englishName: this.ruleForm.englishName,
        comment: this.ruleForm.comment,
      }
      const self = this
      this.$http
        .post(self.base + '/', response)
        .then(res => {
          self.expandedKeys = []
          self.$message.success('添加成功')
          self.catalogName = ''
          this.refreshGlobalCatalog()
          self.dialogVisible = false
          // self.handleNodeExpand({ id: self.currentId })
          if (self.expandedKeys.indexOf(res.data.id) == -1) {
            self.expandedKeys.push(res.data.id)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    renameCatalog() {
      this.loading = true
      let response = {
        parentId: this.ruleForm.parentIdNum,
        name: this.ruleForm.name,
        englishName: this.ruleForm.englishName,
        comment: this.ruleForm.comment,
        id: this.ruleForm.id,
        order: this.ruleForm.order,
      }
      const self = this
      this.$http
        .post(self.base + '/', response)
        .then(res => {
          this.loading = false
          self.$blauShowSuccess(this.$version.common.operationSucceed)
          self.getData()
          self.dialogVisible = false
          this.refreshGlobalCatalog()
          // self.dialogVisibleRename = false
        })
        .catch(e => {
          this.loading = false
          this.$blauShowFailure(e)
        })
    },
    removeCatalog() {
      const self = this
      self
      this.$DatablauCofirm(
        '确定删除该目录吗？该删除操作是不可逆的。',
        '删除提示',
        {
          confirmButtonText: '删除',
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .delete(self.base + '/' + self.currentId)
            .then(res => {
              self.expandedKeys = []
              self.$message.success('删除成功')
              this.refreshGlobalCatalog()
              if (self.expandedKeys.indexOf(self.parentId) == -1) {
                self.expandedKeys.push(self.parentId)
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    moveCatalog() {
      const self = this
      this.$http
        .put(self.base + '/' + self.currentId + '/to/' + self.moveToNode)
        .then(res => {
          self.$message.success('移动成功')
          this.refreshGlobalCatalog()
          self.dialogVisibleMove = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleMoveToNodeClick(data, node) {
      this.moveToNode = data.id
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (data.type === 'ALL') {
        return true
      }
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    allowDrag(node) {
      return node.id
    },
    allowDrop(draggingNode, dropNode, type) {
      const allow =
        draggingNode.parent &&
        dropNode.parent &&
        draggingNode.parent.id === dropNode.parent.id &&
        type !== 'inner'
      return allow
    },
    nodeDragEnd(draggingNode, dropNode, type, event) {
      dropNode.parent.childNodes.forEach((item, index) => {
        this.$http.put(
          this.$url + `/service/catalogs/${item.data.id}/reorder/${index}`
        )
      })
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree2.filter(val)
    },
  },
}
