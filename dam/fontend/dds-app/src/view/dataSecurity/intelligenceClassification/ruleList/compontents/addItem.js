import API from '@/view/dataSecurity/util/api'
import folder from '../../../../../assets/images/search/folder.svg'
import classifyTree from '@/view/dataSecurity/components/classifyTree.vue'
export default {
  props: {
    showItem: {
      type: Boolean,
      default: false,
    },
    clickChild: {
      type: Function,
    },
    id: {
      // 绑定数据分类的目录id
      type: [Number, String],
      default: '',
    },
    infoItemId: {
      // 识别信息项id
      type: [Number, String],
      default: '',
    },
  },
  components: {
    classifyTree,
  },
  data() {
    return {
      height: 530,
      title: '',
      selectedAssets: [],
      standardData: [],
      catalogueKey: '',
      treeLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf',
      },
      treeData: [],
      pagination: {
        page: 1,
        size: 20,
      },
      key: '',
      tableData: [],
      total: 0,
      sensitiveId: '',

      // 新的
      resolve: null,
      structureVos: [],
      curClassifyNode: {},
      nameList: [],
      allTreeList: [],
      showClose: false,
      rootNode: null,
      loading: false,
    }
  },
  mounted() {
    this.title = this.$t('intelligence.addInfoItem')
    this.$utils.enterSearch.addEvent(window, 'keydown', this.keyDown)
  },
  methods: {
    classifyTree(name, options) {
      switch (name) {
        case 'classifyTree':
          if (options) {
            this.curClassifyNode = options.data || {}
          } else {
            this.curClassifyNode = {}
          }
          if (this.curClassifyNode.id) {
            this.pagination.page = 1
            // 清空已选资产
            this.$refs.table.clearSelection()
            this.getList()
          }
          break
        default:
          break
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
    keyDown(e) {
      var ev = document.all ? window.event : e
      if (ev.keyCode == 13) {
        this.qureySure()
      }
    },
    getName(row) {
      const result =
        row.name + (row.englishName ? '(' + row.englishName + ')' : '')
      return result
    },
    getList() {
      this.loading = true
      const params = {
        nameLike: this.key,
        currentPage: this.pagination.page,
        pageSize: this.pagination.size,
        orderBy: 'createTime',
        seq: 'DESC',
      }
      API.getInfoItemDetail(this.curClassifyNode.id, params)
        .then(res => {
          let curItem = {}
          this.total = res.data.totalItems
          res.data.content.map(item => {
            if (parseFloat(item.itemId) === parseFloat(this.infoItemId)) {
              // this.$refs.table.toggleRowSelection(item, true)
              curItem = item
            }
          })
          this.tableData = res.data.content || []
          this.loading = false
          this.$nextTick(() => {
            if (curItem.itemId) {
              this.singleSelect(curItem)
            }
          })
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
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
    dataIconFunction(data, node) {
      return data.icon
        ? window.setting.iconApiPathName +
            '/datasecurity/datasecurity/structure/icon/' +
            data.icon
        : folder
    },
    closeDialog() {
      this.clickChild('addItem', {
        type: 'close',
        // data: this.baseInfo,
      })
    },
    submitAssets() {
      this.clickChild('addItem', {
        type: 'infoItem',
        data: this.selectedAssets[0],
      })
    },
    qureySure() {
      this.pagination.page = 1
      this.getList()
    },
    getRowKeys(row) {
      return row.refId
    },
    selectTable(list) {
      this.selectedAssets = _.cloneDeep(list)
    },
    singleSelect(selection) {
      if (selection.refId) {
        this.selectedAssets = [selection]
        this.$refs.table.toggleRowSelection(selection, true)
      } else {
        return
      }
    },

    handleSizeChange(val) {
      this.pagination.page = 1
      this.pagination.size = val
      this.getList()
    },
    handlePageChange(page) {
      this.pagination.page = page
      this.getList()
    },
  },
  destroyed() {
    this.$utils.enterSearch.removeEvent(window, 'keydown', this.keyDown)
  },
}
