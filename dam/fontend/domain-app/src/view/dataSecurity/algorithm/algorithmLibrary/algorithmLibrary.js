import newAlgorithm from './components/newAlgorithm.vue'
import detail from './components/detail.vue'
import API from '@/view/dataSecurity/util/api'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  components: {
    newAlgorithm,
    detail,
  },
  data() {
    let nameValidatePass = async (rule, value, callback) => {
      if (this.catalogDetails.name === '') {
        callback(new Error('请输入目录名称'))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(this.catalogDetails.name)) {
          callback(new Error('目录名称不允许包含#/\\@$_%<>等特殊字符'))
        } else {
          // 判断名称是否已存在
          const params = {
            parentId: this.catalogDetails.parentId || 0,
            name: this.catalogDetails.name,
            type: 'DISCERN_ALGORITHM',
            catalogId: this.catalogDetails.catalogId,
          }
          const existRes = await API.checkStrategyCatalogName(params)
          if (!existRes.data.data) {
            callback(new Error('目录名称已存在，请重新输入'))
          } else {
            callback()
          }
        }
      }
    }
    return {
      showMap: {},
      showTip: false,
      uploadShow: false,
      ruleTipList: [],
      fileList: [],
      tableLoading: false,
      keyword: '',
      tableData: [],
      selections: [],
      page: 1,
      size: 20,
      total: 0,
      sort: '',
      orderBy: 'createTime',
      newShow: false,
      isView: false,
      breadcrumbNodes: [],
      algorithmId: '',
      isEdit: false,
      typeList: [
        {
          type: 'USER_DEFINED',
          value: '自定义',
        },
        {
          type: 'BUILT_IN',
          value: '内置',
        },
      ], // 算法库类型
      currentNode: {}, // 高亮目录
      catalogKeyword: '',
      catalogDetails: {}, // 操作目录
      catalogDialogTitle: '新建目录',
      catalogDialogVisible: false,
      catalogEditable: false,
      algorithmPram: {
        name: {
          required: true,
          validator: nameValidatePass,
          trigger: 'blur',
        },
      },
      treeData: [],
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      title: '算法目录',
    }
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.page = 1
        this.getList()
      }
    },
    catalogKeyword: {
      handler(val) {
        this.$refs.catalogTree.$refs.tree.filter(val)
      },
    },
  },
  mounted() {
    this.breadcrumbNodes = [
      {
        level: 1,
        name: '智能分类分级-算法库',
      },
      {
        level: 2,
        name: '新建算法',
      },
    ]
    this.initResizeHorizontal()
    this.getTree()
    this.getList()
  },
  methods: {
    // 根据关键字过滤策略目录树
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 目录树节点图标
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
    async getTree() {
      try {
        const type = 'DISCERN_ALGORITHM'
        const res = await API.getStrategyCatalog(type)
        if (res.status === 200) {
          this.treeData = res.data.data.subNodes || []
        } else {
          this.$blauShowFailure(res)
        }
      } catch (e) {
        this.$showFailure(e)
      }
    },
    handleAllTree() {
      this.currentNode = {}
      this.page = 1
      this.setCurrentKey()
    },
    handleNodeClick(data, node) {
      this.currentNode = data
      this.page = 1
      this.getList()
    },
    // 打开目录对话框（新建或修改）
    dataOptionsFunction(data) {
      let options = []
      if (this.$auth.DATA_SECURITY_DISCERN_ALGORITHM_CATALOG_MANAGE) {
        options.push({
          icon: 'iconfont icon-tianjia',
          label: '新建',
          callback: () => {
            this.openCatalogDialog('new', data)
          },
        })
        options.push({
          icon: 'iconfont icon-revise',
          label: '编辑',
          callback: () => {
            this.openCatalogDialog('edit', data)
          },
        })
        options.push({
          icon: 'iconfont icon-delete',
          label: '删除',
          callback: () => {
            this.deleteCatalog(data)
          },
        })
      }
      if (this.$auth.DATA_SECURITY_DISCERN_ALGORITHM_CATALOG) {
        options.push({
          icon: 'iconfont icon-see',
          label: '查看',
          callback: () => {
            this.openCatalogDialog('see', data)
          },
        })
      }
      return options
    },
    // 删除目录
    deleteCatalog(data) {
      if (data.subNodes && data.subNodes.length !== 0) {
        this.$message.error('存在下级目录，不能直接删除本目录')
      } else {
        this.$DatablauCofirm('确认要删除吗？').then(() => {
          const { catalogId, parentId } = data
          API.deleteStrategyCatalog(catalogId, 'DISCERN_ALGORITHM')
            .then(async deleteRes => {
              const tree = this.$refs.catalogTree.$refs.tree
              if (deleteRes.status === 200) {
                this.$blauShowSuccess('删除成功')
                tree.remove({ catalogId })
                if (
                  this.currentNode.catalogId &&
                  this.currentNode.catalogId === catalogId
                ) {
                  if (parentId) {
                    tree.setCurrentKey(parentId)
                    this.currentNode = tree.getNode(parentId).data
                  } else {
                    this.currentNode = {}
                    tree.setCurrentKey(null)
                  }
                }
                this.page = 1
                this.getList()
              } else {
                this.$blauShowFailure(deleteRes.data)
              }
            })
            .catch(error => {
              this.$blauShowFailure(error)
            })
        })
      }
    },
    // 打开目录对话框（新建或修改）
    openCatalogDialog(type, data) {
      if (type === 'new') {
        this.catalogDetails = {
          name: '',
          describe: '',
          parentId: data.catalogId || 0,
        }
        this.catalogDialogTitle = '新建' + this.title
        this.catalogEditable = true
      }
      if (type === 'edit') {
        this.catalogDetails = {
          name: data.name,
          describe: data.describe,
          parentId: data.parentId,
          catalogId: data.catalogId,
        }
        this.catalogDialogTitle = '编辑' + this.title
        this.catalogEditable = true
      }

      if (type === 'see') {
        this.catalogDetails = {
          ...data,
        }
        this.catalogDialogTitle = '查看' + this.title
        this.catalogEditable = false
      }
      this.catalogDialogVisible = true
    },
    closeCatalogDialog() {
      this.catalogDialogVisible = false
    },
    submitCatalog() {
      let params = {
        describe: this.catalogDetails.describe,
        name: this.catalogDetails.name,
        parentId: this.catalogDetails.parentId || 0,
        subNodes: [],
        type: 'DISCERN_ALGORITHM',
      }
      this.$refs.catalogForm.validate(valid => {
        if (valid) {
          if (this.catalogDetails.catalogId) {
            params.catalogId = this.catalogDetails.catalogId
            this.changeCatalog(params)
          } else {
            this.addCatalog(params)
          }
        }
      })
    },
    // 将当前节点的所有父级节点展开
    async expandParents(id) {
      const tree = this.$refs.catalogTree.$refs.tree
      const node = tree.getNode(id)
      this.currentNode = node.data
      this.page = 1
      this.getList()
      let parentId = node.data.parentId
      if (parentId) {
        handleData(parentId)
      }
      function handleData(parentId) {
        tree.store.nodesMap[parentId].expanded = true
        const nowId = tree.getNode(parentId).data.parentId
        if (nowId) {
          handleData(nowId)
        }
      }
      tree.setCurrentKey(id)
    },
    changeCatalog(params) {
      API.modifyStrategyCatalog(params)
        .then(async res => {
          this.catalogDialogVisible = false
          this.$nextTick(() => {
            const tree = this.$refs.catalogTree.$refs.tree
            let node = tree.getNode(params.catalogId)
            node.data = { ...params, subNodes: node.data.subNodes }
            this.currentNode = node.data
            this.page = 1
            tree.setCurrentKey(params.catalogId)
            this.getList()
            this.$datablauMessage.success('编辑成功')
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addCatalog(params) {
      API.addStrategyCatalog(params)
        .then(async res => {
          this.catalogDialogVisible = false
          await this.getTree()
          this.$nextTick(() => {
            this.expandParents(res.data.data)
          })
          this.$datablauMessage.success('新建成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    moreHandle(command) {
      switch (command) {
        case 'import':
          this.uploadShow = true
          break
        case 'export':
          this.exportAlgorithm(true)
          break
        default:
          break
      }
    },
    exportAlgorithm(isAll = false) {
      if (this.tableData.length > 0) {
        let params
        if (isAll) {
          params = {
            catalogId: this.currentNode.catalogId || 0,
          }
          API.exportAllAlgorithm(params).then(res => {
            this.$refs.table.clearSelection()
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
        } else {
          params = this.selections.map(item => item.algorithmId)
          API.exportSelectedAlgorithm(params).then(res => {
            this.$refs.table.clearSelection()
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
        }
      } else {
        this.$datablauMessage.warning(`算法为空，不允许导出`)
      }
    },
    uploadSure() {
      this.$refs.algorithmUpload.$refs.upload.submit()
    },
    // 下载算法模板
    modelDownload() {
      const url = this.$url + `/service/datasecurity/algorithm/download`
      this.$downloadFilePost(url, {}, '算法模板')
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$blauShowFailure('请选择xlsx或csv格式文件')
        return false
      }
    },
    // 导入文件上传失败
    handleUploadError(e) {
      this.uploadShow = false
      this.$showUploadFailure(e)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$blauShowFailure('请选择xlsx格式文件')
          this.fileList = []
          this.$refs.algorithmUpload.showList = []
          this.$refs.algorithmUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm('仅支持上传一个文件，是否覆盖？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
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
        this.uploadShow = false
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
      }
    },
    sortChange(data) {
      this.orderBy = data.prop
      this.sort = data.order
      this.page = 1
      this.getList()
    },
    getType(type) {
      if (type) {
        const resuleList = this.typeList.filter(item => item.type === type)
        const result = resuleList[0].value
        return result
      } else {
        return ''
      }
    },
    search() {
      this.page = 1
      this.getList()
    },
    goBack() {
      this.newShow = false
      this.setCurrentKey()
    },
    getList() {
      this.tableLoading = true
      const params = {
        catalogId: this.currentNode.catalogId || 0,
        pageNum: this.page,
        pageSize: this.size,
        searchStr: this.keyword,
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
        orderBy: this.orderBy,
      }
      API.getAlgorithmList(params)
        .then(res => {
          this.tableLoading = false
          this.total = res.data.data.total
          this.tableData = res.data.data.algorithms || []
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    addAlgorithm() {
      this.selections = []
      this.breadcrumbNodes = [
        {
          level: 1,
          name: '智能分类分级-算法库',
        },
        {
          level: 2,
          name: '新建算法',
        },
      ]
      this.isEdit = false
      this.isView = false
      this.newShow = true
    },
    handleTableChange(data) {
      this.selections = data
    },
    editAlgorithm(row) {
      this.selections = []
      this.breadcrumbNodes = [
        {
          level: 1,
          name: '智能分类分级-算法库',
        },
        {
          level: 2,
          name: '编辑算法',
        },
      ]
      this.isEdit = true
      this.algorithmId = row.algorithmId
      this.isView = false
      this.newShow = true
    },
    handleEdit(row) {
      const params = {
        type: 'algorithmId',
        id: row.algorithmId,
      }
      API.judgeTaskRun(params)
        .then(res => {
          API.judgeAlgorithm(row.algorithmId)
            .then(res => {
              if (res.data.data) {
                this.editAlgorithm(row)
              } else {
                this.$DatablauCofirm(
                  '当前算法被规则所引用，确认是否修改？',
                  '提示',
                  {
                    type: 'warning',
                    cancelButtonText: '取消',
                    confirmButtonText: '确定',
                  }
                )
                  .then(() => {
                    this.editAlgorithm(row)
                  })
                  .catch(() => {})
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleView(row) {
      this.selections = []
      this.breadcrumbNodes = [
        {
          level: 1,
          name: '智能分类分级-算法库',
        },
        {
          level: 2,
          name: row.algorithmName + '的详情',
        },
      ]
      this.algorithmId = row.algorithmId
      this.isView = true
      this.newShow = true
    },
    handleDel(row) {
      this.$DatablauCofirm(`确认要删除吗？`).then(() => {
        const idList = [row.algorithmId]
        this.delAlgorithm(idList)
      })
    },
    handleDelete() {
      this.$DatablauCofirm(
        `已选择“${this.selections.length}条”数据，确认要删除吗？`
      ).then(() => {
        let idList = []
        this.selections.map(item => {
          idList.push(item.algorithmId)
        })
        this.delAlgorithm(idList)
      })
    },
    handleData(data) {
      const tipMap = data.tipMap
      data.mapList.map(item => {
        if (item.type === 'array') {
          let list = []
          Object.keys(tipMap[item.prop]).map(m => {
            list.push(tipMap[item.prop][m])
          })
          item.list = list
        }
        if (item.type === 'number') {
          if (tipMap[item.prop]) {
            item.num = tipMap[item.prop]
          } else {
            item.num = 0
          }
        }
      })
      const flag = data.mapList.some(
        item => item.type === 'array' && item.list.length > 0
      )
      this.showMap = data
      if (flag) {
        this.showTip = true
      }
    },
    delAlgorithm(ids) {
      API.delAlgorithm(ids)
        .then(async res => {
          this.showMap = {}
          let mapList = [
            {
              tip: '',
              name: '成功删除',
              icon: 'error',
              type: 'number',
              prop: 'sucNums',
            },
            {
              tip: '父算法下有子算法，不允许删除父算法',
              type: 'array',
              name: '失败删除',
              icon: 'error',
              prop: 'hasChildren',
            },
            {
              tip: '算法已被识别规则引用，不允许被删除',
              type: 'array',
              icon: 'error',
              name: '失败删除',
              prop: 'ref',
            },
          ]
          this.showMap.mapList = mapList
          this.showMap.tipMap = res.data.data
          await this.handleData(this.showMap)
          this.$refs.table.clearSelection()
          // this.$blauShowSuccess('删除成功')
          this.page = 1
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlePageChange(val) {
      this.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
      this.getList()
    },
    setCurrentKey() {
      this.$nextTick(() => {
        if (this.currentNode.catalogId) {
          this.$refs.catalogTree.$refs.tree.setCurrentKey(
            this.currentNode.catalogId
          )
          this.expandParents(this.currentNode.catalogId)
        } else {
          this.getList()
          this.$refs.catalogTree.$refs.tree.setCurrentKey(null)
        }
      })
    },
    algorithmClick(name, params) {
      this.page = 1
      switch (name) {
        case 'new':
          if (params.type === 'cancel') {
            this.newShow = false
          }
          this.setCurrentKey()
          break
        default:
          break
      }
    },
  },
}
