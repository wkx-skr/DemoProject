import List from './list.vue'
import Tables from './tables.vue'
import EditItem from './editItem.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import EmptyPage from './emptyPage.vue'
import HTTP from '@/dataWarehouse/resource/http.js'
import { IndexPage, CategoryId } from './entrance/Constant'
export default {
  props: {
    indexPage: IndexPage
  },
  components: {
    List, // 指标目录树
    Tables, // 指标搜索、过滤及结果页
    EditItem, // 指标编辑页，含新增功能
    EmptyPage
  },
  mounted () {
    this.initResizeHorizontal()
    this.openDefaultMetric()
    this.getUdps()
    this.getDimensionPage()
  },
  data () {
    return {
      showEditItem: false,
      currentItem: null,
      currentIndexType: null,
      showEmptyPage: false,
      pageReady: false,
      options: [],
      folderId: null,
      rootFolderId: null,
      editMode: false,
      udps: [],
      allOrganizations: [],
      allDimsTree: [],
      allDims: []
    }
  },
  methods: {
    getDimensionPage (callback) {
      const dimensionList = []
      const combineDimensionCallback = () => {
        this.encodeDimensionTreeData(dimensionList)
        if (callback) {
          callback()
        }
      }
      const pageSize = 100
      const getDimensionPage = currentPage => {
        const requestUrl = `${this.$domains}dimension/page`
        const requestBody = {
          categoryId: null,
          currentPage: currentPage,
          keyword: '',
          pageSize: pageSize,
          orderBy: null,
          orderIsAsc: null
        }
        this.$http
          .post(requestUrl, requestBody)
          .then(res => {
            if (res.data && Array.isArray(res.data.content)) {
              res.data.content.forEach(item => {
                dimensionList.push(item)
              })
              if (pageSize * currentPage < res.data.totalItems) {
                getDimensionPage(currentPage + 1)
              } else {
                combineDimensionCallback()
              }
            } else {
              combineDimensionCallback()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      getDimensionPage(1)
    },
    encodeDimensionTreeData (content) {
      this.allDimsTree = []
      this.allDims = []
      if (Array.isArray(content)) {
        const arr = []
        const dimsArr = []
        content.forEach(item => {
          const obj = {}
          obj.id = item.dimensionId
          obj.treeLabel = item.dimensionName
          obj.children = []
          item.hierarchy.forEach(h => {
            const i = {
              id: item.dimensionId + '-' + h.order,
              treeLabel: h.chName,
              displayName: item.dimensionName + ':' + h.chName
            }
            obj.children.push(i)
            dimsArr.push(i)
          })
          arr.push(obj)
        })
        this.allDimsTree = arr
        this.allDims = dimsArr
      } else {
      }
    },
    updateTree () {
      this.$refs.listBox.getTreeData()
    },
    getUdps () {
      HTTP.getUpds({ categoryId: CategoryId[this.indexPage] })
        .then(res => {
          let data = res
          if (data && Array.isArray(data)) {
          } else {
            data = []
          }
          this.udps = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    openDefaultMetric () {
      const metricId = this.$route.query.id
      if (metricId) {
        this.viewItem({
          domainId: metricId
        })
      }
    },
    initResizeHorizontal () {
      setTimeout(() => {
        let r = new ResizeHorizontal({
          leftDom: $(this.$refs.listBox.$el),
          middleDom: $(this.$refs.resizeBar),
          rightDom: $(this.$refs.rightBox),
          noCrack: true,
          // minWith: { leftMinWidth: 240 },
          callback: () => {}
        })
      }, 1000)
    },
    addItem (indexType) {
      this.currentItem = null
      this.currentIndexType = indexType
      this.editMode = true
      this.showEditItem = true
    },
    updateItem (row) {
      this.currentItem = row
      this.editMode = true
      this.showEditItem = true
    },
    editItem (row) {
      this.currentItem = row
      this.editMode = true
      this.showEditItem = true
    },
    viewItem (row) {
      this.currentItem = row
      this.editMode = false
      this.showEditItem = true
    },
    closeEditItem () {
      this.showEditItem = false
    },
    handleShowEmptyPage () {
      this.pageReady = true
      this.showEmptyPage = true
    },
    handlePageReady (treeData) {
      this.options = treeData
      this.pageReady = true
    },
    /*
      当emptyPage.vue组件发出新增目录事件时，隐藏空白页，并调用list.vue组件的新增目录功能，创建第一个目录
     */
    createCategory () {
      this.showEmptyPage = false
      this.$refs.listBox.createCategory(true)
    },
    handleFolderClick (data) {
      this.$refs.tables.getDataFromFolder(data)
      this.folderId = data.foldId
      if (!this.rootFolderId) {
        this.rootFolderId = data.foldId
      }
    },
    handleUpdateCategoryMessage (category) {
      this.$refs.tables.updateCategoryMessage(category)
    },
    handleRemoveCategoryMessage (removedId) {
      if (removedId === this.folderId) {
        this.handleFolderClick({
          id: this.rootFolderId,
          name: this.$t('indicator.demand.allCategory')
        })
      }
      // if (this.currentItem)
    },
    updateList () {
      this.$refs.tables.getData()
    }
  }
}
