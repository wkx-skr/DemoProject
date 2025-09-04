import $ from 'jquery'
import _ from 'lodash'
import moment from 'moment'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import { mapGetters } from 'vuex'
import { matchKeyword } from '@/utils/object.js'
import dbType from '@/components/dataSource/databaseType.js'
import inElectron from '@/resource/utils/environment'
import editImg from '@/assets/images/mxgraphEdit/Edit.svg'
import modelDetail from '../list/model.vue'
import TagSelector from '@/components/selector/TagSelector.vue'
import TagCheckboxGroup from './tagCheckboxGroup.vue'
import moreAction from '@/components/common/moreActionBtn.vue'
import down from '@/resource/utils/downloadFile.js'
import dbTree from './tree/DatablauTree.vue'
import authManage from '@/views/list/manage/main.vue'
import reportReview from '@/views/modelLibrary/reportReview'
import recycleBin from './recycleBin/recycleBin.vue'
import modelList from './modelList.vue'

let download = down.download

export default {
  components: {
    modelDetail,
    TagSelector,
    TagCheckboxGroup,
    moreAction,
    recycleBin,
    modelList,
    dbTree,
    authManage,
    reportReview
  },
  beforeCreate () {
  },
  beforeMount () {
    this.refreshModelData()
  },
  props: {
    needBind: {
      default: false
    },
    dialogOpen: {
      default: false
    },
    sqlEditor: {
      default: false
    }
  },
  data () {
    return {
      currentNode: null,
      inElectron,
      categoryEditModel: false,
      bg: require('../../assets/images/bg/bg33.png'),
      editImg,
      modelCategoryMap: new Map(), // 目录下的模型
      treeData: [],
      treeDataLoaded: false,
      keyword: '',
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      currentPath: '',
      modelPath: [],
      currentModel: null,
      prevModel: null,
      wholeLoading: true,
      contentLoading: false,
      actionsArr: [],
      templateUploading: false,
      uploadUrl: `${this.$url}/service/categories/upload-sys`,
      defaultkey: [1],
      currentCategoryId: '', // tree 点击选中的目录节点
      logicalModel: ['Conceptual', 'Logical'],
      sqlModels: dbType.SQL_MODEL_LIST,
      noSqlModels: dbType.NO_SQL_MODEL_LIST,
      addModelForm: {
        name: '',
        type: ''
      },
      addModelFormRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          {
            min: 4,
            max: 40,
            message: '长度在 4 到 40 个字符',
            trigger: 'blur'
          }
        ],
        type: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ]
      },
      isEditor: false,
      bindPermission: false,
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
      showEditCategoryDialog: false,
      isCreateCategory: false,
      loadingEditModelCategory: false,
      showModeCategory: false,
      disableMoveMap: {},
      chosenMoveCategoryId: '',
      chosenCategoryId: '', // tree 右键点击选中 将要处理的节点
      categoryMap: {},
      currentCategory: {},
      bindSystemData: null, // 绑定的 dam 系统
      systemKeyword: '',
      // 编辑的目录 数据
      categoryData: {
        name: '',
        alias: '',
        description: '',
        parentId: null,
        entityTemplateId: '',
        forceCheckFlag: false
      },
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      damConnectable: false,
      showAuthManageDialog: false,
      displayPath: [],
      showChooseSystem: false,
      loadingSystems: false,
      selectionSystem: [],
      allSystem: [],
      rootModelId: 1, // 模型目录根节点id, 默认为 1
      showSystemList: [],
      groupVisible: false,
      groupLoading: false,
      currentGroupList: [],
      groupOption: false,
      showGroupList: false,
      groupList: [],
      keyword2: '',
      currentPage2: 1,
      pageSize2: 20,
      total2: 0,
      checkedGroup: [],
      currentCategoryId2: null,
      // originModels: null,

      modelTypes: [],
      modelTypeFilteredData: [],
      webPath: window.setting.products.ddm.webPath,
      systemSelect: '',
      pathMap: [],
      reviewReportId: '',
      showOperator: true,
      permissionsMap: null,
      getTagsOfModels: null,
      showReviewReportId: false,
      templateList: []
    }
  },
  mounted () {
    this.initHorizontalResize()
    this.setResizeStyle()
    window.addEventListener('resize', this.setResizeStyle)
    this.showOperator = !this.needBind
    let options = [
      {
        icon: 'el-icon-download',
        label: this.$store.state.$v.common.exportTemplate,
        callback: this.downloadTemplate
      },
      {
        icon: 'el-icon-upload',
        label: this.$store.state.$v.common.import,
        callback: () => {
          if (!this.templateUploading) {
            $('#ban-upload-btn').click()
          } else {
            this.$message.warning(this.$store.state.$v.common.importing)
          }
        }
      }
    ]
    this.actionsArr = options
    if (this.$route.query?.reviewReportId) {
      this.reviewReportId = this.$route.query.reviewReportId
      this.showReviewReportId = true
    }
    HTTP.damConnectable()
      .then((res) => {
        if (res === true) {
          $('.more-action').css('display', 'none')
          this.damConnectable = true
          if (this.$store.state.featureMap.ddm_BindingSystem) {
            this.getAllSystem()
          }
        }
      })
      .catch((e) => {
        console.log(e)
      })
    if (this.$route.query.id) {
      this.wholeLoading = true
    }
    this.$bus.$on('refreshLibrary', () => {
      this.refreshModelData()
    })
    this.$bus.$on('updateModelList', this.refreshModelData)
    this.$bus.$on('changeModelStatus', this.changeModelStatus)
  },
  beforeDestroy () {
    this.$bus.$off('refreshLibrary')
    if (this.$route.name !== 'list') {
      this.$store.commit('setLastCategoryId', '')
    }
    this.$bus.$off('updateModelList')
    this.$bus.$off('changeModelStatus')
    window.removeEventListener('resize', this.setResizeStyle)
  },
  inject: [
    // 刷新 main, 整个组件通过 v-if 刷新, src/views/common/main.vue
    'refresh'
  ],
  methods: {
    changeModelStatus (model) {
      if (model.root) {

      } else { // 不是root，需要修改root结点的phase状态
        if (this.preRoot) {
          this.preRoot.phase = model.phase
        }
      }
    },
    generateScript () {
      console.log(this.currentCategory, 'this.currentCategory')
      this.$http.get(this.$url + `/service/categories/tencent/mapping?categoryId=${this.currentCategory.id}`).then(res => {
        if (res.data === '' || !res.data.projectId) {
          this.$datablauMessage({
            message: '未找到该项目',
            type: 'info'
          })
        } else {
          window.open(
            `${window.setting.wedataUrl}?ProjectId=${res.data.projectId}`
          )
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    initHorizontalResize () {
      this.initListSize()
      setTimeout(() => {
        let r = new ResizeHorizontal({
          leftDom: $('.tree-area.model-library-tree'),
          rightDom: $('.content-area.model-library-content'),
          middleDom: $('.resize-column-middle.model-library-middle'),
          outerDom: $(this.$el),
          callback: this.resizeCallback,
          onDragEvent: this.setResizeStyle,
          leftMinSize: 200
        })
      }, 200)
    },
    initListSize () {
      let $leftWidth = this.sqlEditor ? '215' : localStorage.getItem('modelListPosition') || 0
      if ($leftWidth) {
        let $left = $('#model-library .tree-area')
        let $right = $('#model-library .content-area')
        let $middle = $('#model-library .model-library-middle')

        $left.css('width', $leftWidth + 'px')
        $right.css('left', $leftWidth + 'px')
        $middle.css('left', ($leftWidth - 5) + 'px')
      }
    },
    resizeCallback () {
      let $left = $('#model-library .tree-area')
      let $leftWidth = Number.parseFloat($left.css('width'))
      localStorage.setItem('modelListPosition', $leftWidth)
    },
    setResizeStyle () {
      setTimeout(() => {
        let $categoryName = $('.category-name')
        let $right = $('.content-area.model-library-content')
        let $nameLine = $('.top-info-container .name-line')
        let maxWidth = $nameLine.css('width')
        maxWidth = parseInt(maxWidth)
        if (this.bindSystemData?.name) {
          maxWidth -= 140
          if (this.bindPermission) {
            // 解绑按钮
            maxWidth -= 40
          }
        } else {
          if (this.bindPermission) {
            // 解绑按钮
            maxWidth -= 150
          }
        }
        if (maxWidth < 0) {
          maxWidth = 0
        }
        // console.log(maxWidth, 'maxWidth')
        $categoryName.css({ 'maxWidth': maxWidth + 'px' })

        this.$refs.modelList?.tableResize()
      }, 100)
    },
    getParentGroupList () {
      this.groupLoading = true
      HTTP.getParentGroupList(this.chosenCategoryId)
        .then((res) => {
          let arr = this.currentGroupList.concat(res)
          let obj = {}
          let result = []
          arr.forEach((v) => {
            if (!obj[v.id]) {
              result.push(v)
              obj[v.id] = 1
            }
          })
          this.currentGroupList = result
          this.groupLoading = false
        })
        .catch((err) => {
          this.groupLoading = false
          console.error(err)
        })
    },
    updateCurrentCategoryGroupList () {
      this.groupLoading = true
      HTTP.updateCurrentCategoryGroupList({
        id: this.currentCategoryId2,
        ids: this.currentGroupList.map((v) => v.id)
      })
        .then((res) => {
          this.groupLoading = false
          this.groupVisible = false
          this.$blauShowSuccess('保存成功')
        })
        .catch((err) => {
          this.groupLoading = false
          this.$showFailure(err)
        })
    },
    closeGroupList () {
      this.keyword2 = ''
      this.showGroupList = false
    },
    addGroup () {
      let arr = this.currentGroupList.concat(this.checkedGroup)
      let obj = {}
      let result = []
      arr.forEach((v) => {
        if (!obj[v.id]) {
          result.push(v)
          obj[v.id] = 1
        }
      })
      this.closeGroupList()
      this.currentGroupList = result
    },
    handleSizeChange2 (val) {
      this.currentPage2 = 1
      this.pageSize2 = val
      this.getRuleGroupList()
    },
    handleCurrentChange2 (val) {
      this.currentPage2 = val
      this.getRuleGroupList()
    },
    handleAddGroupChange (val) {
      this.checkedGroup = val
    },
    handleSearch () {
      clearTimeout(this.groupTimer)
      this.groupTimer = setTimeout(() => {
        this.getRuleGroupList()
      }, 300)
    },
    getRuleGroupList () {
      this.showGroupList = true
      this.groupLoading = true
      let { keyword2, currentPage2, pageSize2 } = this
      HTTP.getRuleGroupList({
        keyword: keyword2,
        currentPage: currentPage2,
        pageSize: pageSize2
      })
        .then((res) => {
          this.groupList = res.content
          this.groupList.forEach((v) => {
            v.ruleNums = v.children ? v.children.length : 0
            delete v.children
          })
          this.total2 = res.totalElements
          this.groupLoading = false
        })
        .catch((e) => {
          this.$showFailure(e)
          this.groupLoading = false
        })
    },
    deleteGroup (scope) {
      this.$DatablauCofirm(`确定删除策略 “${scope.row.name}” ？`, 'error').then(
        (res) => {
          this.currentGroupList.splice(scope.$index, 1)
        }
      )
    },
    showGroup (id) {
      this.currentCategoryId2 = id
      this.getCurrentCategoryGroupList(id)
    },
    getCurrentCategoryGroupList (id) {
      this.groupLoading = true
      this.groupVisible = true
      HTTP.getCurrentCategoryGroupList(id)
        .then((res) => {
          this.currentGroupList = res
          this.groupLoading = false
        })
        .catch((err) => {
          this.$showFailure(err)
          this.groupLoading = false
        })
    },

    handlePageVisbleChange () {
      let currentKey = this.$refs.modelTree.getCurrentKey()
      if (document.hidden && this.$refs.modelTree && currentKey !== null) {
        this.$store.commit('setLastCategoryId', currentKey)
      }
    },
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
      this.$store.commit(
        'setLastCategoryId',
        this.$refs.modelTree.getCurrentKey()
      )
      this.showEditModelInfo = true
      this.currentModelInfo = {
        name: row.modelName,
        description: row.description || '',
        id: row.id
      }
    },
    modModelInfo () {
      HTTP.modModelInfo(this.currentModelInfo).then((res) => {
        this.refresh()
      })
    },
    refreshModels () {
      this.refresh()
    },
    getCurrentUserCategoryPermissions () {
      this.contentLoading = false
      if (this.$store.state.user.isAdmin) {
        this.isEditor = true
        this.bindPermission = true
        this.contentLoading = false
      } else {
        HTTP.getCurrentUserCategoryPermissions(this.currentCategoryId)
          .then((res) => {
            this.isEditor = !!res.admin
            this.bindPermission = !!res.admin
            this.contentLoading = false
          })
          .catch((err) => {
            this.contentLoading = false
            this.$showFailure(err)
          })
      }
    },
    openLastCategory () {
      let lastCategoryId = this.$store.state.lastCategoryId
      // 之前选中的目录，如果没有权限，则不再显示
      if (!lastCategoryId || !this.categoryMap[lastCategoryId]) {
        lastCategoryId = this.treeData[0]?.id
      }
      if (lastCategoryId) {
        let node = this.$refs.modelTree.getNode(lastCategoryId)
        this.$nextTick(() => {
          this.defaultkey = this.getPathByModel(node.data.id).map(
            (path) => path.id
          )
          this.$refs.modelTree?.setCurrentKey(lastCategoryId)
        })
        node && this.handleNodeClick(node.data, node)
        // 清除记录
        // this.$store.commit('setLastCategoryId', null)
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
        .then((res) => {
          this.wholeLoading = false
          this.refresh()
          this.$message.success('模型新增成功')
          this.editModel({ row: res })
        })
        .catch((err) => {
          console.error(err)
          this.wholeLoading = false
        })
    },
    refreshModelData () {
      // this.getTagsOfModels = null
      // this.permissionsMap = {}
      HTTP.flushPermissions()
        .then(res => {
          HTTP.getModelsPermissions()
            .then(res => {
              this.permissionsMap = res
            })
            .catch(e => {
              this.$showFailure(e)
            })
          this.getData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData () {
      HTTP.getModelsList()
        .then(data => {
          this.modelCategoryMap = new Map()
          this.$store.state.modelsList = data
          // 将模型与目录绑定
          data.forEach((item) => {
            if (!this.modelCategoryMap.has(item.categoryId)) {
              this.modelCategoryMap.set(item.categoryId, [])
            }
            this.modelCategoryMap.get(item.categoryId).push(item)
          })
          // 获取模型相关标签
          this.getTagsOfModels = HTTP.getTagsOfModels({
            modelIds: (data || []).map(item => item.id)
          })
          this.getModelsTree()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    pushModels (treeData) {
      // 递归统计 当前目录与子目录 数据
      const forEach = (node) => {
        node.categoryModelCount = node?.models?.length || 0 // 当前目录下模型的数量
        node.subModelCount = 0 // 当前目录下子目录下模型的数量
        if (!node) return
        let rootMap = {}
        let categoryModels = this.modelCategoryMap.get(node.id)
        if (node.models) {
          node.models.forEach((v) => {
            v.root = true
            v.modelName = v.name
            rootMap[v.id] = v
          })
          if (categoryModels) {
            categoryModels.forEach((v) => {
              if (v.branch && rootMap[v.referredModelId]) {
                v.modelName = rootMap[v.referredModelId].name
              } else {
                v.modelName = v.name
              }
            })
            node.models = node.models.concat(categoryModels)
          }
        }
        if (node.children) {
          node.children.forEach((item) => {
            forEach(item)
            node.subModelCount += item.categoryModelCount + item.subModelCount
          })
        }
      }
      forEach(treeData)
    },
    // 按树形结构获取模型数据
    getModelsTree (callback) {
      let categoryMap = {}
      const sortModelLib = (result, bindDam = false) => {
        // 递归 增加判断 是否已经绑定 dam 系统
        // childrenBindDam: 自身 或者 子目录 绑定了 dam 系统
        result.childrenBindDam = false
        categoryMap[result.id] = result
        if (result.damModelCategoryId) {
          result.childrenBindDam = true
        }
        result.parentBindDam = !!bindDam
        if (result.children) {
          sort.sortConsiderChineseNumber(result.children, 'name')
          result.children.forEach((item) => {
            // 排序 并 返回 是否绑定 dam 系统
            if (
              sortModelLib(
                item,
                !!item.damModelCategoryId || result.parentBindDam
              )
            ) {
              result.childrenBindDam = true
            }
          })
        }

        return !!result.childrenBindDam
      }
      const pathMap = new Map()
      const forEach = (obj, path) => {
        if (obj.models && Array.isArray(obj.models)) {
          pathMap.set(obj.id, path + '/' + obj.name)
        }
        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach((child) => {
            forEach(child, path + '/' + obj.name)
          })
        }
      }
      HTTP.getModels()
        .then(result => {
          this.$store.commit('setModels', result)
          forEach(result, '')
          this.pathMap = pathMap
          this.rootModelId = result.id
          sortModelLib(result)
          this.pushModels(result)
          this.treeData = [result]
          this.treeDataLoaded = true
          this.categoryMap = categoryMap
          setTimeout(() => {
            if (!this.$route.query.id && !this.$route.query.pId) {
              this.openLastCategory()
            } else {
              this.openModelByQuery()
            }
            callback && callback()
          }, 10)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getPIdById () {
      const id = Number.parseInt(this.$route.query.id)
      let pId
      const map = this.modelCategoryMap
      map.forEach((models) => {
        models.forEach((item) => {
          if (item.id === id) {
            pId = item.categoryId
          }
        })
      })
      return pId
    },
    // getAllModel (originModels) {
    //   this.originModels = originModels
    // },
    handleSelectionChange (val) {
      val.path =
        this.pathMap.get(val.categoryId) +
        `/${val.modelName}(${val.branch ? val.name : 'master'})`
      this.multipleSelection = val
      this.$emit('mullTip', this.multipleSelection)
    },
    openModelByQuery () {
      const id = this.$route.query.id
      const pId = this.$route.query.pId || this.getPIdById(id)
      this.$refs.modelTree.setCurrentKey(pId)
      let node =
        this.$refs.modelTree.getNode(
          this.$route.query.pId || this.getPIdById(this.$route.query.id)
        ) || {}
      let model = this.$store.state.modelsList.find(
        (v) => v.id === parseInt(id) && !v.root
      )
      if (node && node.data) {
        this.defaultkey = this.getPathByModel(node.data.id).map(
          (path) => path.id
        )
        this.handleNodeClick(node.data, node)
        this.$refs.modelTree?.setCurrentNode(node.data)
      }
      if (model) {
        this.showModelDetail(model)
        this.getPath(node)
      } else {
        if (id) {
          // 没有模型权限
          this.$message.warning(this.$v.modelList.tip_1)
          this.$router.push('/')
        }
      }
    },
    showModelDetail (model) {
      this.handleRowClick(model)
    },
    renderContent (h, { node, data, store }) {
      let label = node.label
      if (data.alias) {
        label += ' (' + data.alias + ')'
      }
      if (node.level === 1) {
        setTimeout(() => {
          $($('.el-tree-node__expand-icon')[0]).css('visibility', 'hidden')
        })
        return (
          <span class="tree-item-outer">
            <span>
              <span class="tree-icon model"></span>
              <span style="font-weight:bold">{label}</span>
            </span>
          </span>
        )
      } else if (!data.type) {
        let modelCount = 0
        const ForEach = (node) => {
          if (!node) return
          if (node.data.models) {
            modelCount += node.data.models.length
          }
          if (node.childNodes) {
            node.childNodes.forEach((item) => {
              ForEach(item)
            })
          }
        }
        ForEach(node)
        return (
          <span class="tree-item-outer">
            <span>
              <span class="tree-icon icon-18">
                <span class="path1"></span>
                <span class="path2"></span>
                <span class="path3"></span>
              </span>
              <span class="oneline-eclipse tree-label">{label}</span>
            </span>
            <span style="float:right;margin-right:1em;background-color:inherit;">
              {modelCount}
            </span>
          </span>
        )
      } else if (data.type === 'model') {
        return (
          <span class="tree-item-outer">
            <span>
              <span class="tree-icon folder"></span>
              <span>{label}</span>
            </span>
          </span>
        )
      } else {
        return (
          <span class="tree-item-outer">
            <span>
              <span class="tree-icon branch"></span>
              <span>{node.label}</span>
            </span>
          </span>
        )
      }
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      if (string.matchKeyword(node.data, value, 'name', 'alias')) {
        hasValue = true
      }
      return hasValue
    },
    handleNodeClick (data, node) {
      this.currentCategory = data
      this.currentNode = node
      this.$store.commit('setCurrentCategory', data.id)
      if (data) {
        this.currentCategoryId = data.id || ''
        this.$store.commit('setLastCategoryId', this.currentCategoryId)
        let currentCategory = this.categoryMap[this.currentCategoryId]
        if (currentCategory.damModelCategoryId) {
          let bindSystemData = this.allSystem.find(
            (item) => item.id === currentCategory.damModelCategoryId
          )
          this.bindSystemData = bindSystemData
        } else {
          this.bindSystemData = null
        }
      }
      this.getCurrentUserCategoryPermissions()
      this.getPath(node)

      // 左侧树的数据更新完成,开始更新右侧 table 数据
      this.getTableData(data)
    },
    getPath (node) {
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.displayPath = result
      this.currentPath = result[result.length - 1]
    },
    getPathByModel (pId) {
      let node = this.$refs.modelTree.getNode(pId)
      if (!node) {
        return
      }
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data)
        current = current.parent
      }
      result = result.reverse()
      this.modelPath = result
      return result
    },
    getTableData (data) {
      this.$refs.modelList?.getTableData(data)
    },
    handleRowClick (row, replace = true) {
      if (this.needBind) {
        return
      }
      if (!row) return
      let currentRow = row
      if (row.root) {
        this.preRoot = row
        currentRow = row.children.filter(item => item.id === row.id)[0]
      } else {
        if (row.branch) {
          this.preRoot = null
        } else {
          this.preRoot = row.parent
        }
      }
      this.prevModel = currentRow
      try {
        this.getPathByModel(currentRow.categoryId)
      } catch (err) {
        console.error(err)
      }
      this.$nextTick(() => {
        this.wholeLoading = false
      })
      if (replace) {
        this.$router
          .replace({
            query: {
              id: currentRow.id,
              pId: currentRow.categoryId,
              currentVersion: currentRow.currentVersion,
              rId: this.$route.query.rId,
              objectId: this.$route.query.objectId,
              objectType: this.$route.query.objectType,
              elementId: this.$route.query.elementId,
              parentId: this.$route.query.parentId,
              typeId: this.$route.query.typeId,
              tab: this.$route.query.tab
            }
          })
      } else {
        this.$router
          .push({
            query: {
              id: currentRow.id,
              pId: currentRow.categoryId,
              currentVersion: currentRow.currentVersion,
              rId: this.$route.query.rId,
              objectId: this.$route.query.objectId,
              objectType: this.$route.query.objectType,
              elementId: this.$route.query.elementId,
              parentId: this.$route.query.parentId,
              typeId: this.$route.query.typeId,
              tab: this.$route.query.tab
            }
          })
      }
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
      this.$message.success(
        this.$store.state.$v.SoftwareUpdater.serverSuccessMsg
      )
      this.refresh()
    },
    treeLabelFormatter (node) {
      let modelCount = 0
      const ForEach = (node) => {
        if (!node) return
        if (node.data.models) {
          // 获取 是 master 的 分支, 并且去重
          let length =
            node.data.models.filter((item) => !item.branch).length || 0
          modelCount += length / 2
        }
        if (node.childNodes) {
          node.childNodes.forEach((item) => {
            ForEach(item)
          })
        }
      }
      ForEach(node)
      node.modelCount = modelCount
      let alias = node.data.alias ? `(${node.data.alias})` : ''
      // ${node.data.damModelCategoryId ? '*' : ''}
      return `${node.label}${alias}`
    },
    manageCategory (type) {
      this.chosenCategoryId = this.currentCategoryId
      if (type === 'edit') {
        this.isCreateCategory = false
        this.categoryEdit(this.chosenCategoryId)
      } else if (type === 'move') {
        this.categoryMove()
      } else if (type === 'create') {
        this.isCreateCategory = true
        this.categoryCreate(this.chosenCategoryId)
      } else if (type === 'auditManage') {
        this.categoryAuditManage(this.chosenCategoryId)
      } else if (type === 'delete') {
        this.categoryDelete(this.chosenCategoryId)
      } else if (type === 'bingSystem') {
        this.handleBindClick(this.chosenCategoryId)
      } else if (type === 'group') {
        this.showGroup(this.chosenCategoryId)
      }
    },
    handleBindClick (chosenCategoryId) {
      let currentCategory = this.categoryMap[chosenCategoryId]
      if (
        currentCategory &&
        !currentCategory.damModelCategoryId &&
        !currentCategory.parentBindDam &&
        !currentCategory.childrenBindDam
      ) {
        this.chooseSystem(chosenCategoryId)
      } else if (currentCategory && currentCategory.damModelCategoryId) {
        this.unbindSystem(chosenCategoryId)
      } else if (currentCategory && currentCategory.parentBindDam) {
        this.notBindMessage('parent')
      } else if (currentCategory && currentCategory.childrenBindDam) {
        this.notBindMessage('child')
      }
    },
    getCategoryData (id) {
      this.loadingEditModelCategory = true
      HTTP.getModelCategory(id)
        .then((res) => {
          this.categoryData.name = res.name
          this.categoryData.alias = res.alias
          this.categoryData.description = res.description
          this.categoryData.parentId = res.parentId
          this.categoryData.id = res.id
          this.categoryData.entityTemplateId = _.cloneDeep(res.entityTemplateId)
          this.categoryData.forceCheckFlag = _.cloneDeep(res.forceCheckFlag)
        })
        .catch((e) => {
          this.categoryData.name = ''
          this.$showFailure(e)
        })
        .finally(() => {
          this.loadingEditModelCategory = false
        })
    },
    categoryEdit (id) {
      this.getTemplateList()
      this.categoryEditModel = true
      this.showEditCategoryDialog = true
      this.getCategoryData(id)
    },
    // 命名规则模板列表
    getTemplateList () {
      this.$http.get(this.$url + '/service/entitytemplate/publish').then(res => {
        this.templateList = res.data
        this.templateList.unshift({
          name: '无',
          id: null
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    entityTemplateIdChange (value) {
      if (this.categoryData.entityTemplateId === null) {
        this.categoryData.forceCheckFlag = false
      }
      this.$set(this.categoryData, 'entityTemplateId', value)
    },
    goModelTemplate () {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/modelTemplate`)
    },
    categoryMove () {
      this.showModeCategory = true
      this.$nextTick(() => {
        if (this.$refs.tree2 && this.$refs.tree2.expandTopLevel) {
          this.$refs.tree2.expandTopLevel()
        }
      })
    },
    chooseMoveCategoryNode (data, node) {
      if (node.parent) {
        this.chosenMoveCategoryId = data.id
      } else {
        this.chosenMoveCategoryId = ''
      }
    },
    chooseLockedMoveCategoryNode () {
      this.chosenMoveCategoryId = ''
    },
    handleMoveCategory () {
      if (!this.chosenMoveCategoryId) {
        return
      }
      HTTP.moveModelCategory({
        targetCatId: this.chosenMoveCategoryId,
        oriCatId: this.chosenCategoryId
      })
        .then((res) => {
          this.$message.success('移动成功')
          this.showModeCategory = false
          this.refreshCategory()
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    categoryCreate (parentId) {
      this.categoryEditModel = false
      this.categoryData = {
        name: '',
        alias: '',
        description: '',
        parentId
      }
      this.showEditCategoryDialog = true
    },
    categoryDelete (id, name) {
      let arr = this.modelCategoryMap.get(id)
      if (arr && Array.isArray(arr) && arr.length > 0) {
        this.$message.info('目录下有模型，不能删除')
        return
      }

      this.$DatablauCofirm(
        `目录“${name || this.currentPath}”,确定要删除吗?`,
        'warning'
      )
        .then(() => {
          HTTP.deleteModelCategory(id)
            .then((res) => {
              this.$message.success('删除成功')
            })
            .catch((e) => {
              this.$showFailure(e)
            })
            .finally(() => {
              this.refreshCategory()
            })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    categoryAuditManage () {
      this.showAuthManageDialog = true
    },
    goBack () {
      this.showAuthManageDialog = false
    },
    saveEditCategory () {
      if (this.isCreateCategory) {
        HTTP.createModelCategory(this.categoryData)
          .then((res) => {
            this.$message.success('创建成功')
          })
          .catch((e) => {
            this.$showFailure(e)
          })
          .finally(() => {
            this.showEditCategoryDialog = false
            this.refreshCategory()
          })
      } else {
        HTTP.updateModelCategory(this.categoryData)
          .then((res) => {
            this.$message.success('修改成功')
          })
          .catch((e) => {
            this.$showFailure(e)
          })
          .finally(() => {
            this.showEditCategoryDialog = false
            this.refreshCategory()
          })
      }
    },
    dataIconFunction (data, node) {
      if (node.level === 1) {
        return 'tree-icon model'
      }
      if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    isMoveDisabled (data) {
      return this.disableMoveMap[data.id]
    },
    treeRightInfoFormatter (node) {
      // return node.modelCount
      return `${node.data.categoryModelCount + node.data.subModelCount}`
    },
    async getModelCategoryOption (data, node) {
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      // result.push('权限管理')
      this.displayPath = result
      this.chosenCategoryId = data.id
      let chosenCategoryId = data.id
      let resultArr = [
        {
          label: '新建子目录',
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.isCreateCategory = true
            this.categoryCreate(chosenCategoryId)
          }
        },
        {
          label: '编辑目录',
          icon: 'iconfont icon-revise',
          callback: () => {
            this.isCreateCategory = false
            this.categoryEdit(chosenCategoryId)
          }
        },
        {
          label: '删除目录',
          icon: 'iconfont icon-delete',
          callback: () => {
            this.categoryDelete(chosenCategoryId, data.name)
          }
        },
        {
          label: '权限管理',
          icon: 'iconfont icon-lock',
          callback: () => {
            this.categoryAuditManage(chosenCategoryId)
          }
        },
        {
          label: '移动目录',
          icon: 'iconfont icon-Moveto',
          callback: () => {
            this.categoryMove()
          }
        }
        // {
        //   label: '模型检查策略',
        //   icon: 'iconfont icon-revise',
        //   callback: () => {
        //     this.showGroup(chosenCategoryId)
        //   }
        // }
      ]

      let currentCategory = this.categoryMap[data.id]
      if (
        currentCategory &&
        !currentCategory.parentBindDam &&
        !currentCategory.childrenBindDam
      ) {
        resultArr.push({
          label: '绑定到资产系统',
          icon: 'iconfont icon-lock',
          callback: () => {
            this.chooseSystem(chosenCategoryId)
          }
        })
      } else if (currentCategory && currentCategory.damModelCategoryId) {
        resultArr.push({
          label: '解绑资产系统',
          icon: 'iconfont icon-lock',
          callback: () => {
            this.unbindSystem(chosenCategoryId)
          }
        })
      } else if (currentCategory && currentCategory.parentBindDam) {
        resultArr.push({
          label: '父目录已绑定系统',
          icon: 'iconfont icon-lock',
          callback: () => {
            this.notBindMessage('parent')
          }
        })
      } else if (currentCategory && currentCategory.childrenBindDam) {
        resultArr.push({
          label: '子目录已绑定系统',
          icon: 'iconfont icon-lock',
          callback: () => {
            this.notBindMessage('child')
          }
        })
      }
      // 连不上 dam 或者 lic 是简版时, 不能绑定
      if (!this.damConnectable || !this.$store.state.featureMap.ddm_BindingSystem) {
        resultArr.pop()
      }
      try {
        if (!this.$store.state.user.isAdmin) {
          // 不是admin过滤权限
          let res = await this.$http.get(
            `${this.$url}/service/permissions/categories/${data.id}`
          )
          let permission = res.data
          if (permission) {
            if (permission.admin) {
            } else if (permission.editor) {
              // const editorCategoryOptions = ['权限管理']
              // resultArr = resultArr.filter(item => {
              //   return !editorCategoryOptions.includes(item.label)
              // })
              this.$datablauMessage.error('无此目录的管理员权限')
              resultArr = []
            } else if (permission.viewer) {
              this.$datablauMessage.error('无此目录的管理员权限')
              resultArr = []
            } else {
              this.$datablauMessage.error('无此目录的管理员权限')
              resultArr = []
            }
          } else {
            this.$datablauMessage.error('无此目录的管理员权限')
            resultArr = []
          }
        }
      } catch (e) {
      }

      // 根目录只能编辑和添加子目录
      if (data.id === this.rootModelId) {
        const rootCategoryOptions = ['新建子目录', '编辑目录']
        resultArr = resultArr.filter((item) => {
          return rootCategoryOptions.includes(item.label)
        })
      }

      if (
        !this.isEditor &&
        !this.$store.state.lic.editor &&
        !this.$store.state.user.isAdmin
      ) {
        resultArr = []
      }
      return resultArr
    },
    statusFilterMethod (value, row, column) {
      return true
    },

    refreshCategory () {
      this.$store.commit('setLastCategoryId', this.currentCategoryId)
      this.treeDataLoaded = false
      HTTP.getModels()
        .then((res) => {
          this.$store.commit('setModels', res)
        })
        .catch((e) => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.$nextTick(() => {
            this.treeDataLoaded = true
            this.getModelsTree(this.refresh)
          })
        })
    },
    // 刷新左侧树显示, 不从后台获取新数据
    localRefreshCategory () {
      this.getModelsTree()
    },
    getAllSystem () {
      HTTP.getCategories()
        .then((res) => {
          this.allSystem = res
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    handleSystemRowClick (selection) {
      this.selectionSystem = selection
      if (selection.length > 1) {
        const delRow = selection.shift()
        this.$refs.selectSystemTable.toggleRowSelection(delRow, false)
      }
    },
    chooseSystem (chosenCategoryId) {
      this.chosenCategoryId = chosenCategoryId
      this.showChooseSystem = true
      this.getShowSystemList()
    },
    bindSystem () {
      // let damCategoryId = this.selectionSystem && this.selectionSystem[0] ? this.selectionSystem[0].id : ''
      let damCategoryId = this.systemSelect
      if (!damCategoryId) {
        return
      }
      HTTP.bindSystem({
        categoryId: this.chosenCategoryId,
        damCategoryId: damCategoryId
      })
        .then((res) => {
          this.$message.success('绑定成功')
          this.showChooseSystem = false
          let currentNode = this.$refs.modelTree.getNode(this.chosenCategoryId)
          currentNode.data.damModelCategoryId = damCategoryId
          this.localRefreshCategory()
        })
        .catch((e) => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.systemSelect = ''
        })
    },
    getShowSystemList () {
      let showSystemList = this.allSystem
      let systemKeyword = _.trim(this.systemKeyword)
      if (systemKeyword) {
        showSystemList = this.allSystem.filter((item) => {
          let props = ['name', 'alias', 'itDepartment']
          return matchKeyword(item, systemKeyword, ...props)
        })
      }
      this.showSystemList = showSystemList
    },
    unbindSystem (categoryId) {
      this.$DatablauCofirm('确定解除和资产目录的绑定吗?')
        .then((res) => {
          HTTP.unbindSystem(categoryId)
            .then((res) => {
              this.$blauShowSuccess('解绑成功')
              setTimeout(this.refreshCategory, 100)
            })
            .catch((e) => {
              this.$showFailure(e)
            })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    notBindMessage (reason) {
      let msg =
        reason === 'parent' ? '父级目录已绑定系统' : '子级目录已绑定系统'
      this.$message.info(msg)
    },
    getDisabledMoveMap () {
      let disableMoveMap = {}
      let current = this.categoryMap[this.chosenCategoryId]
      if (!current) return
      if (current.parentId) {
        disableMoveMap[current.parentId] = true
      }
      let handler = (node, map) => {
        map[node.id] = true
        let children = node.children
        if (children && Array.isArray(children)) {
          children.forEach((child) => {
            handler(child, map)
          })
        }
      }
      handler(current, disableMoveMap)
      this.disableMoveMap = disableMoveMap
    }
  },
  computed: {
    bindLabel () {
      let str = '绑定到资产系统'
      let currentCategory = this.categoryMap[this.currentCategoryId]
      if (
        currentCategory &&
        !currentCategory.parentBindDam &&
        !currentCategory.childrenBindDam
      ) {
        str = '绑定到资产系统'
      } else if (currentCategory && currentCategory.damModelCategoryId) {
        str = '解绑资产系统'
      } else if (currentCategory && currentCategory.parentBindDam) {
        str = '父目录已绑定系统'
      } else if (currentCategory && currentCategory.childrenBindDam) {
        str = '子目录已绑定系统'
      }
      return str
    },
    showBindInfo () {
      return this.currentCategoryId !== 1 && this.$store.state.lic.editor && this.damConnectable && this.$store.state.featureMap.ddm_BindingSystem && this.sqlEditor !== true
    },
    ...mapGetters({ allPhase: 'status' })
  },
  watch: {
    '$store.state.openCreateModel' (value) {
      if (value) {
        this.$store.commit('setOpenCreateModel', false)
        this.refresh()
      }
    },
    keyword (value) {
      this.$refs.modelTree.filter(value)
    },
    currentModel (val) {
      if (val) {
        this.prevModel = val
      } else {
        this.$refs.modelList?.updateRateAndPermission()
      }
      this.setResizeStyle()
    },
    $route (newValue) {
      // 如果是从报告列表跳转到报告详情，不需要展示模型列表
      this.showReviewReportId = !!newValue.query?.reviewReportId
      if (!newValue.query.id) {
        this.currentModel = null
      } else {
        this.currentModel = this.prevModel
      }
      if (newValue.query.pId || newValue.query.id) {
        this.openModelByQuery()
      }
    },
    systemKeyword: {
      immediate: true,
      handler: function (value) {
        this.getShowSystemList()
      }
    },
    chosenCategoryId: {
      immediate: true,
      handler: function (value) {
        this.getDisabledMoveMap()
      }
    },
    'bindSystemData.name' () {
      this.setResizeStyle()
    },
    currentPath () {
      this.setResizeStyle()
    },
    bindPermission () {
      this.setResizeStyle()
    }
  }
}
