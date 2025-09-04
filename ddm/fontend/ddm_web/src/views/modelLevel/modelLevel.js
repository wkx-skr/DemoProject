import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import dbType from '@/components/dataSource/databaseType.js'
import $ from 'jquery'
import moment from 'moment'
import Status from '../list/Status.vue'
import DatabaseType from '@/components/common/DatabaseType.vue'
import modelDetail from '../list/model.vue'
import TagSelector from '@/components/selector/TagSelector.vue'
import TagCheckboxGroup from './tagCheckboxGroup.vue'
import moreAction from '@/components/common/moreActionBtn.vue'
import down from '@/resource/utils/downloadFile.js'
import editImg from '@/assets/images/mxgraphEdit/Edit.svg'

let download = down.download
export default {
  components: {
    Status,
    DatabaseType,
    modelDetail,
    TagSelector,
    TagCheckboxGroup,
    moreAction
  },
  beforeCreate () {
  },
  beforeMount () {
  },
  data () {
    return {
      editImg,
      firstQuery: true,
      modelCategoryMap: new Map(),
      treeData: [],
      treeDataLoaded: false,
      keyword: '',
      tags: [],
      defaultProps: {
        label: 'name',
        children: 'child',
        id: 'id'
      },
      currentPath: '',
      modelPath: [],
      allData: null,
      filteredData: null,
      tagFilteredData: null,
      phaseFilteredData: null,
      sortedData: null,
      tableData: null,
      total: 0,
      pageSize: 50,
      currentPage: 1,
      currentModel: null,
      prevModel: null,
      modelKeyword: '',
      keywordModelSelect: '',
      modelToTagMap: new Map(),
      tagToModelMap: new Map(),
      // allPhase: this.$store.getters.status,
      phases: [],
      rateKey: 0,
      wholeLoading: false,
      contentLoading: false,
      // actionsArr: [],
      templateUploading: false,
      uploadUrl: `${this.$url}/service/categories/upload-sys`,
      defaultkey: [],
      currentCategoryId: '',
      showAddModel: false,
      logicalModel: ['Logical'],
      sqlModels: dbType.SQL_MODEL_LIST,
      noSqlModels: dbType.NO_SQL_MODEL_LIST,
      addModelForm: {
        name: '',
        type: ''
      },
      addModelFormRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { min: 4, max: 40, message: '长度在 4 到 40 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ]
      },
      isEditor: false,
      showEditModelInfo: false,
      currentModelInfo: {
        name: '',
        description: ''
      },
      modelRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' }
          // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      editCategoryShow: false,
      dialogTitle: '',
      dialogType: '',
      currentCategory: {
        parentName: '',
        parentId: '',
        name: '',
        alias: '',
        description: ''
      },
      categoryRules: {
        name: [{ required: true, message: '请输入目录名称', trigger: ['blur'] }]
      },
      chooseModelDialog: false,
      modelTreeData: [],
      modelTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      currentModelLevel: 'ModelA',
      choseBindModel: null,
      couldSelect: false
    }
  },
  mounted () {
    // if (this.$route.query.id) {
    //   this.wholeLoading = true
    // }
    this.getData()
    this.initHorizontalResize()
    this.$bus.$on('updateTagsMap', () => {
      this.getTagsByModels()
    })
    this.$bus.$on('updateRateForList', () => {
      this.rateKey++
    })
    this.$bus.$on('refreshLibrary', () => {
      this.getData()
    })

    // let options = [
    //   {
    //     icon: 'el-icon-download',
    //     label: this.$store.state.$v.common.exportTemplate,
    //     callback: this.downloadTemplate
    //   },
    //   {
    //     icon: 'el-icon-upload',
    //     label: this.$store.state.$v.common.import,
    //     callback: () => {
    //       if (!this.templateUploading) {
    //         $('#ban-upload-btn').click()
    //       } else {
    //         this.$message.warning(this.$store.state.$v.common.importing)
    //       }
    //     }
    //   }
    // ]
    // this.actionsArr = options
    this.$http.get(this.$url + '/service/main/damConnectable').then(res => {
      if (res.data === true) {
        $('.more-action').css('display', 'none')
      }
    })
  },
  beforeDestroy () {
    this.$bus.$off('updateTagsMap')
    this.$bus.$off('updateRateForList')
    this.$bus.$off('refreshLibrary')
  },
  inject: ['refresh'],
  methods: {
    beforeSave () {
      this.$refs['modelInfoForm'].validate((valid) => {
        if (valid) {
          this.modModelInfo()
        } else {
          return false
        }
      })
    },

    handleShowEditModelInfo (row) {
      this.$store.commit('setLastCategoryId', this.$refs.modelTree.getCurrentKey())
      this.showEditModelInfo = true
      this.currentModelInfo = {
        name: row.modelName,
        description: row.description || '',
        id: row.id
      }
    },
    modModelInfo () {
      HTTP.modModelInfo(this.currentModelInfo)
        .then(res => {
          this.refresh()
        })
    },
    getCurrentUserCategoryPermissions () {
      this.contentLoading = true
      if (this.$store.state.user.isAdmin) {
        this.isEditor = { 'admin': true, 'viewer': true, 'editor': true }
        this.contentLoading = false
      } else {
        HTTP.getCurrentUserCategoryPermissions(this.currentCategoryId)
          .then(res => {
            this.contentLoading = false
            this.isEditor = res.editor
          })
          .catch(err => {
            this.contentLoading = false
            this.$showFailure(err)
          })
      }
    },
    handleCreateModel () {
      this.showAddModel = true
      this.$store.commit('setLastCategoryId', this.$refs.modelTree.getCurrentKey())
    },
    openLastcategory () {
      let lastCategoryId = this.$store.state.lastCategoryId
      if (lastCategoryId) {
        this.$refs.modelTree.setCurrentKey(lastCategoryId)
        let node = this.$refs.modelTree.getNode(lastCategoryId)
        this.handleNodeClick(node.data, node)
        // 清除记录
        this.$store.commit('setLastCategoryId', null)
      }
    },
    cancelForm () {
      this.$refs.addModelForm.resetFields()
      this.showAddModel = false
      this.addModelForm = {
        name: '',
        type: ''
      }
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addModel()
        } else {
          return false
        }
      })
    },
    addModel () {
      this.wholeLoading = true
      HTTP.addModel({
        modelInfo: {
          name: this.addModelForm.name,
          description: '',
          categoryId: this.currentCategoryId,
          type: this.addModelForm.type,
          owner: this.$store.state.user.name
        }
      })
        .then(res => {
          this.wholeLoading = false
          this.refresh()
          this.$message.success('模型新增成功')
        })
        .catch(err => {
          console.error(err)
          this.wholeLoading = false
        })
    },
    removeModel (scope) {
      this.$DatablauCofirm('确定解绑模型吗?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          // console.log(scope, 'scope')
          HTTP.unbindModel2LevelTree({ gradeId: this.currentCategoryId, modelId: scope.row.id })
            .then(res => {
              // this.getData()
              this.refreshRightTable()
              this.$message.success('解绑成功')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    // editModel (scope) {
    //   this.$http.put(`${this.$url}/service/editor/${scope.row.id}/lock`).then(res => {
    //     if (res.data) {
    //       window.open(`${window.baseUrl}#/main/modeledit?id=${scope.row.id}&currentVersion=${scope.row.currentVersion}&modelType=${scope.row.modelType}`)
    //     }
    //   }).catch(err => {
    //     this.$showFailure(err)
    //   })
    // },
    initHorizontalResize () {
      setTimeout(() => {
        let r = new ResizeHorizontal($('.tree-area'), $('.content-area'), $('.resize-column-middle'), $(this.$el))
      }, 1000)
    },
    modelTreeIconFunction (data, node) {
      // console.log(data, 'data')
      if (data.nodeType === 'model') {
        return 'iconfont icon-shujuyuan'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    handleModelNodeClick (data, node) {
      this.choseBindModel = data
      this.couldSelect = data.nodeType === 'model'
    },
    handleBindModel () {
      HTTP.bindModel2LevelTree({ gradeId: this.currentCategory.id, modelId: this.choseBindModel.data.id })
        .then(res => {
          this.$message.success('绑定成功')
          this.chooseModelDialog = false

          if (this.$refs.modelTree && this.$refs.modelTree.getCurrentNode) {
            let currentNode = this.$refs.modelTree.getCurrentNode()
            // console.log(currentNode, 'currentNode')
            // 右侧树为当前目录, 需要刷新
            // TODO
            if (currentNode.id === this.currentCategory.id) {
              this.refreshRightTable()
            }
          }
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    getData () {
      this.getModelsTree()
      this.getModelsList()
    },
    getModelsList (callback) {
      const handler = data => {
        this.$store.state.modelsList = data
        if (data) {
          this.modelCategoryMap = new Map()
          const masterMap = new Map()
          data.forEach(item => {
            if (!item.branch) {
              masterMap.set(item.id, item.name)
            }
            if (!this.modelCategoryMap.has(item.categoryId)) {
              this.modelCategoryMap.set(item.categoryId, [])
            }
            this.modelCategoryMap.get(item.categoryId).push(item)
          })
          data.forEach(item => {
            if (item.branch) {
              item.modelName = masterMap.get(item.referredModelId)
            } else {
              item.modelName = item.name
            }
          })
          if (callback) {
            callback()
          }
        }
      }
      if (this.$store.state.modelsList) {
        handler(this.$store.state.modelsList)
      } else {
        HTTP.getModelsList({
          successCallback: handler
        })
      }
      HTTP.getModelsList({
        successCallback: handler
      })
    },
    pushModels (treeData) {
      const forEach = node => {
        if (!node) return
        if (this.modelCategoryMap.has(node.id)) {
          node.models = this.modelCategoryMap.get(node.id)
        }
        if (node.children) {
          node.children.forEach(item => {
            forEach(item)
          })
        }
      }
      forEach(treeData)
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction (data) {
      // 添加子目录
      // 删除目录
      // 添加模型
      const options = []
      options.push({
        icon: 'iconfont icon-tianjia',
        label: '添加子目录',
        callback: () => {
          this.categoryDialog('add', data)
        }
      })
      // console.log(data, 'data')
      if (data.parentId && data.parentId !== 0) {
        options.push({
          icon: 'iconfont icon-bianji',
          label: '编辑目录',
          callback: () => {
            this.currentId = data.id
            this.categoryDialog('edit', data)
          }
        })
        options.push({
          icon: 'iconfont icon-delete',
          label: '删除目录',
          callback: () => {
            this.removeCatalog(data)
          }
        })
      }
      options.push({
        icon: 'iconfont icon-tianjia',
        label: '添加模型',
        callback: () => {
          this.choseSubModel(data)
        }
      })

      return options
    },
    getModelsTree () {
      // const sortModelLib = (result) => {
      //   if (result.children) {
      //     sort.sortConsiderChineseNumber(result.children, 'name')
      //     result.children.forEach(item => {
      //       sortModelLib(item)
      //     })
      //   }
      // }
      const handler = (result) => {
        // console.log(result, 'result')
        // sortModelLib(result)
        // this.pushModels(result)
        this.treeData = result
        console.log(result.sort((a, b) => a.sort - b.sort), 123)
        // console.log(this.treeData, 'treeData')
        this.treeDataLoaded = true
        setTimeout(() => {
          if (!this.$route.query.id && !this.$route.query.pId) {
            let node = this.$refs.modelTree.getNode(this.treeData[0].id) || {}
            if (!node.data) return
            this.handleNodeClick(node.data, node)
          } else {
            let node = this.$refs.modelTree.getNode(this.$route.query.pId || this.getPIdById(this.$route.query.id)) || {}
            if (!node.data) {
              node = this.$refs.modelTree.getNode(this.treeData[0].id) || {}
            }
            this.getPath(node)
            // this.defaultkey = this.getPathByModel(node.data.id).map(path => path.id)
            node.data && this.handleNodeClick(node.data, node)
            node.id && this.$refs.modelTree.setCurrentNode(node.id)
          }
          this.openLastcategory()
        })
      }
      HTTP.getLevelModelTree()
        .then((data) => {
          handler(data)
        })
        .catch((err) => {
          this.$showFailure(err)
        })
    },
    categoryDialog (type, data) {
      // console.log('edit data: ', data)
      this.dialogTitle = type === 'add' ? '添加目录' : '编辑目录'
      this.dialogType = type
      if (type === 'add') {
        this.currentCategory = {
          parentName: data.name,
          parentId: data.id,
          name: '',
          alias: '',
          description: ''
        }
      } else {
        if (this.$refs.modelTree && this.$refs.modelTree.getNode) {
          let parent = this.$refs.modelTree.getNode(data.parentId)
          // console.log(parent, 'parent')

          data.parentName = parent.data.name
        }

        this.currentCategory = data
      }
      this.editCategoryShow = true

      setTimeout(() => {
        // console.log(this.$refs.demoForm, 'this.$refs.demoForm')
        this.$refs.demoForm.clearValidate()
      }, 500)
    },
    handleEditSave () {
      let savePromise = null
      let obj = this.currentCategory
      this.$refs.demoForm.validate(valid => {
        if (!valid) {
          return false
        } else {
          if (this.dialogType === 'add') {
            savePromise = HTTP.createCategory({
              requestBody: {
                'name': obj.name,
                'alias': obj.alias,
                'description': obj.description,
                'parentId': obj.parentId
              }
            })
          } else {
            savePromise = HTTP.updateCategory({
              requestBody: {
                'id': obj.id,
                'name': obj.name,
                'alias': obj.alias,
                'description': obj.description
              }
            })
          }
          savePromise
            .then(res => {
              // console.log(res, 'res')
              if (this.dialogType === 'add') {
                if (this.$refs.modelTree && this.$refs.modelTree.append) {
                  this.$refs.modelTree.append(res, obj.parentId)
                }
              } else {
                if (this.$refs.modelTree && this.$refs.modelTree.updateKeyChildren) {
                  this.$refs.modelTree.updateKeyChildren(obj.id, res)
                }
              }
              this.editCategoryShow = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    handleEditClose () {
      this.editCategoryShow = false
    },
    removeCatalog (data) {
      // HTTP.deleteLevelCategory()
      this.$DatablauCofirm('确定删除目录吗?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          HTTP.deleteLevelCategory(data.id)
            .then(res => {
              this.getData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    refreshRightTable () {
      if (this.$refs.modelTree && this.$refs.modelTree.getCurrentNode) {
        let currentData = this.$refs.modelTree.getCurrentNode()
        let currentNode = this.$refs.modelTree.getNode(currentData.id)
        // console.log(currentData, 'currentData')
        // console.log(currentNode, 'currentNode')
        this.handleNodeClick(currentData, currentNode)
      }
    },
    choseSubModel (data) {
      // console.log(data, 'data')
      const type = data.type
      this.currentCategory = data
      this.keywordModelSelect = ''
      this.chooseModelDialog = true
      let modelType = ''
      if (type === 'ModelCA' || type === 'ModelC') { // C'
        modelType = 'Logical'
      } else if (type === 'ModelA' || type === 'ModelB') {
        modelType = 'Conceptual'
      } else if (type === 'ModelD') {
        modelType = 'Physics'
      }
      let handle = (res) => {
        let modelTree = res
        let nodeFormatter = (node, type) => {
          let obj = {
            data: node,
            nodeType: type && type === 'model' ? 'model' : 'category',
            name: node.name,
            id: '',
            children: []
          }
          obj.id = obj.nodeType + node.id
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => {
              let subNode = nodeFormatter(child)
              obj.children.push(subNode)
            })
          }
          if (node.models && Array.isArray(node.models)) {
            node.models.forEach(child => {
              let subNode = nodeFormatter(child, 'model')
              obj.children.push(subNode)
            })
          }
          return obj
        }
        let root = nodeFormatter(modelTree)
        // console.log(root, 333)
        this.modelTreeData = root.children
      }
      HTTP.getAddModel({ modelType }).then(res => {
        handle(res)
      })
    },
    filterModelTreeNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      do {
        if (string.matchKeyword(current.data, value, 'name')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    getPIdById () {
      const id = Number.parseInt(this.$route.query.id)
      let pId
      const map = this.modelCategoryMap
      map.forEach(models => {
        models.forEach(item => {
          if (item.id === id) {
            pId = item.categoryId
          }
        })
      })
      return pId
    },
    openModelByQuery (treeData) {
      const id = this.$route.query.id
      const pId = this.$route.query.pId || this.getPIdById(id)
      this.$refs.modelTree.setCurrentKey(pId)
      let node = this.$refs.modelTree.getNode(pId)
      // this.handleRowClick(treeData.filter(item => item.id === Number.parseInt(id))[0])
      let model = treeData.filter(item => item.id === Number.parseInt(id))[0]
      if (model) {
        this.handleRowClick(model)
        // } else {
        //   this.getModelDetail(id)
      }
    },
    // getModelDetail (id) {
    //   this.$http.get(`${this.$url}/service/models/allowAccess/${id}`)
    //     .then(res => {
    //       if (res.data) {
    //         this.handleRowClick(res.data)
    //       } else {
    //         this.wholeLoading = false
    //         /* 方案1：提示未找到
    //         // 方案2：router跳转，去除参数
    //         // 采取方案1，如有需要，再行调整
    //         */
    //         this.$message.warning(`未找到id为${id}的模型`)
    //         // this.$router.push({
    //         //   query: {}
    //         // }).catch()
    //       }
    //     })
    //     .catch(err => {
    //       this.$showFailure(err)
    //       console.error(err)
    //     })
    // },

    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      do {
        if (string.matchKeyword(current.data, value, 'name')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    handleNodeClick (data, node) {
      if (data) {
        this.currentCategoryId = data.id || ''
      }
      // this.getCurrentUserCategoryPermissions()
      this.getPath(node)
      this.getTableData(data)
    },
    getPath (node) {
      let result = []
      let current = node
      while (current.data && current.data.name) {
        // console.log(current.data, 'current.data')
        this.currentModelLevel = current.data.type
        result.push(current.data.name)
        // console.log(current, 'current')
        current = current.parent
      }
      result = result.reverse()
      this.currentPath = result.join(' / ')
    },
    getPathByModel (pId) {
      let node = this.$refs.modelTree.getNode(pId)
      let result = []
      let current = node
      while (current && current.data && current.data.name) {
        result.push(current.data)
        current = current.parent
      }
      result = result.reverse()
      this.modelPath = result
      return result
    },
    getTableData (data) {
      this.gatherAllModel(data)
    },
    gatherAllModel (data) {
      // console.log('gatherAllModel data: ', data)
      if (!data || !data.id) return
      HTTP.getLevelNodeSubModel(data.id)
        .then(res => {
          // console.log(res, 'res')
          this.allData = res
          this.simplyFilterData()
          this.getCurrentPageData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    simplyFilterData () {
      this.filteredData = this.allData.filter(item => {
        return string.matchKeyword(item, this.modelKeyword, 'name', 'description')
      })
      this.total = this.filteredData.length
      this.currentPage = 1
      this.handleSortChange({})
    },
    filterData () {
      this.filteredData = this.allData.filter(item => {
        return string.matchKeyword(item, this.modelKeyword, 'name', 'description')
      })
      this.simplyFilterData()
    },
    handleSortChange ({ column, prop, order }) {
      this.sortedData = this.filteredData
      if (order) {
        sort.sortConsiderChineseNumber(this.sortedData, prop, order)
      } else {
      }
      this.currentPage = 1
      this.getCurrentPageData()
    },
    getCurrentPageData () {
      this.tableData = this.sortedData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage) * this.pageSize)
    },
    dateFormatter (row, col) {
      let time = row[col.property]
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getCurrentPageData()
    },
    handleCurrentChange () {
      this.getCurrentPageData()
    },
    handleRowClick (row) {
      if (!row) return
      this.prevModel = row
      try {
        this.getPathByModel(row.categoryId)
      } catch (err) {
        console.error(err)
      }
      this.$nextTick(() => {
        this.wholeLoading = false
      })
      this.$router.push({
        query: {
          id: row.id,
          pId: row.categoryId,
          currentVersion: row.currentVersion,
          rId: this.$route.query.rId,
          objectId: this.$route.query.objectId,
          objectType: this.$route.query.objectType,
          elementId: this.$route.query.elementId,
          parentId: this.$route.query.parentId,
          typeId: this.$route.query.typeId,
          tab: this.$route.query.tab
        }
      }).then(() => {
      }).catch(() => {
        this.$router.push({
          query: {
            rId: this.$route.query.rId
          }
        }).then(() => {
          this.handleRowClick(row)
        })
      })
    },
    cancelTag () {
      this.tags = []
      this.filterTag()
      this.$refs.tagDialog.clear()
    },
    updateTags (tags) {
      this.tags = tags
      this.filterTag()
    },
    downloadTemplate () {
      let url = `${this.$url}/service/categories/sys-template`
      download(url)
    },
    showBegain () {
      this.templateUploading = true
      this.$bus.$emit('showUploadProgress', {
        name: '导入系统目录',
        time: 10
      })
    },
    onError (e) {
      this.templateUploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(e)
    },
    onSuccess () {
      this.templateUploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', true)
      // this.stateChange()
      this.$message.success(this.$store.state.$v.SoftwareUpdater.serverSuccessMsg)
      this.refresh()
    }
  },
  computed: {
    allPhase () {
      return this.$store.getters.status
    }
  },
  watch: {
    keyword (value) {
      this.$refs.modelTree.filter(value)
    },
    keywordModelSelect (value) {
      this.$refs.modelSelectTree.filter(value)
    },
    modelKeyword (value) {
      this.filterData()
    },
    currentModel (val) {
      if (val) {
        this.prevModel = val
      }
    },
    $route (newValue) {
      if (!newValue.query.id) {
        this.currentModel = null
      } else {
        this.currentModel = this.prevModel
      }
      if (newValue.query.pId || newValue.query.id) {
        // let node = this.$refs.modelTree.getNode(this.$route.query.pId || this.getPIdById(this.$route.query.id)) || {}
        // console.log('node router: ', node)
        // if (!node || !node.data) return
        // this.getPath(node)
        // this.defaultkey = this.getPathByModel(node.data.id).map(path => path.id)
        // this.handleNodeClick(node.data, node)
        // this.$refs.modelTree.setCurrentNode(node.data)
      }
    }
  }
}
