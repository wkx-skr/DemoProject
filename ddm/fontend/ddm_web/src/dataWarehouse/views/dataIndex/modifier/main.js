import List from './list.vue'
import Tables from './tables.vue'
import EditItem from './editItem.vue'
import EmptyPage from './emptyPage.vue'
import { ModifierCategory } from './entrance/Constant'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  props: {
    modifierCategory: ModifierCategory
  },
  components: {
    List,
    Tables,
    EditItem,
    EmptyPage
  },
  mounted () {
    this.initResizeHorizontal()
    this.openDefaultModifierType()
  },
  data () {
    return {
      showEditItem: false,
      currentItem: null,
      pageReady: false,
      options: [],
      folderId: null,
      rootFolderId: null,
      editMode: false,
      showEmptyPage: false,
      udps: []
    }
  },
  methods: {
    openDefaultModifierType () {
      const id = this.$route.query.id
      if (!id) {
        return
      }
      const url = `${this.$domains}modifier/getType?id=${id}`
      this.$http
        .post(url)
        .then(res => {
          this.editItem(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
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
    updateTree () {
      this.$refs.listBox.getTreeData()
    },
    handleFolderClick (data) {
      this.$refs.tables.getDataFromFolder(data)
      this.folderId = data.id
      if (!this.rootFolderId && this.rootFolderId !== 0) {
        this.rootFolderId = data.id
      }
    },
    addItem () {
      this.currentItem = null
      this.editMode = true
      this.showEditItem = true
    },
    editItem (row) {
      this.currentItem = row
      this.editMode = true
      this.showEditItem = true
    },
    viewItem (row) {
      // todo 暂不支持浏览模式
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
      this.showEmptyPage = false
    },
    createCategory () {
      // this.showEmptyPage = false
      this.$refs.listBox.createCategory(true)
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
    },
    updateUdps (udps) {
      this.udps = udps
    }
  }
}
