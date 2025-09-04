import API from '../util/api'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    clickChild: {
      type: Function,
    },
    type: {
      // type有值时，不展示顶部已选数据
      type: String,
      default: '',
    },
    id: {
      // 绑定安全分类的目录id
      type: [Number, String],
      default: '',
    },
  },
  data() {
    return {
      height: 530,
      title: '添加信息项',
      selectedAssets: [],
      catalogueKey: '',
      treeLoading: false,
      defaultProps: {
        children: 'nodes',
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
      height: 530,
      showSelect: false,
      sensitiveId: '',
      resolve: null,
      allTreeList: [],
      nameList: [],
      showClose: false,
    }
  },
  mounted() {
    // this.$utils.enterSearch.addEvent(window, 'keydown', this.keyDown)
  },
  methods: {
    focusSelect() {
      if (!this.catalogueKey && !this.showClose) {
        this.nameList = []
      }
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    keyDown(e) {
      var ev = document.all ? window.event : e
      if (ev.keyCode == 13) {
        this.qureySure()
      }
    },
    getCatalogName(key) {
      if (key) {
        this.showClose = true
        API.searchItemCatalog(key)
          .then(res => {
            this.nameList = res.data || []
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    async selectCatalogName(keyId) {
      if (keyId) {
        this.showClose = false
        this.allTreeList = []
        this.$refs.tree.$refs.tree.$data.store.lazy = false
        const itemMap = this.nameList.filter(
          item => item.id === parseFloat(keyId)
        )[0]
        const idList = itemMap.catalogPath.split('/')
        await this.getTreeList(idList)
      } else {
        this.$refs.tree.$refs.tree.$data.store.lazy = true
        this.getTree(0, this.resolve)
      }
    },
    async getTreeList(idList) {
      this.treeLoading = true
      for (let i = 0; i < idList.length; i++) {
        const { data } = await API.getItemCatalog(idList[i])
        data.catalogVos.map(async item => {
          this.allTreeList.push(item)
        })
      }
      this.treeData = this.getTreeStructure(this.allTreeList)
      const itemMap = this.allTreeList.find(
        item => item.id === parseFloat(this.catalogueKey)
      )
      this.sensitiveId = itemMap.id
      setTimeout(() => {
        this.$refs.tree.expandTopLevel()
        this.$refs.tree.filter(itemMap.name)
        this.$refs.tree.setCurrentKey(this.sensitiveId)
        this.getList()
        this.treeLoading = false
      }, 100)
    },
    getTreeStructure(treeList) {
      let newArray = []
      treeList.map(item => {
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.id === ret.parentId) {
              if (!res.hasOwnProperty('nodes')) {
                res.nodes = []
              }
              res.nodes.push(ret)
            }
          })
          if (res.hasOwnProperty('nodes')) {
            arrToTree(list, res.nodes)
          }
        })
      }
      this.treeData = newArray
      return newArray
    },
    async loadCallback(node, resolve) {
      this.resolve = resolve
      if (node.level === 0) {
        this.treeLoading = true
        this.getTree(0, resolve)
      } else {
        this.getTree(node.data.id, resolve)
      }
    },
    getTree(id, resolve, isLazy = true) {
      API.getItemCatalog(id)
        .then(res => {
          const treeList = res.data.catalogVos || []
          if (id === 0) {
            this.treeData = treeList
            this.sensitiveId = treeList[0].id
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(this.sensitiveId)
            })
            this.getList()
          }
          this.treeLoading = false
          if (isLazy) {
            return resolve(treeList)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getList() {
      const params = {
        nameLike: this.key,
        currentPage: this.pagination.page,
        pageSize: this.pagination.size,
        orderBy: 'createTime',
        seq: 'desc',
      }
      API.getBindInfoItemList(this.sensitiveId, this.id, params)
        .then(res => {
          this.total = res.data.totalItems
          this.tableData = res.data.content || []
        })
        .catch(e => {
          this.total = 0
          this.tableData = []
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
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    closeDialog() {
      this.clickChild('addStandard', {
        type: 'close',
        // data: this.baseInfo,
      })
    },
    submitAssets() {
      let idList = []
      this.selectedAssets.map(item => {
        idList.push(item.itemId)
      })
      const params = {
        id: this.id,
        data: idList,
      }
      API.bindInfoItem(params)
        .then(res => {
          this.clickChild('addStandard', {
            type: 'submit',
            // data: this.baseInfo,
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRemoveStandard(index) {
      this.selectedAssets.splice(index, 1)
    },
    queryCatalog(data) {
      this.sensitiveId = data.id
      this.pagination.page = 1
      // 清空已选资产
      this.$refs.table.clearSelection()
      this.getList()
    },
    qureySure() {
      this.pagination.page = 1
      this.getList()
    },
    selectTable(list) {
      this.selectedAssets = _.cloneDeep(list)
      this.$nextTick(() => {
        if (this.selectedAssets.length > 0 && !this.type) {
          const itemH = this.$refs.selectedItems.offsetHeight
          this.showSelect = true
          this.height = 530 + itemH
        } else {
          this.height = 530
          this.showSelect = false
        }
      })
    },
    handleSizeChange(val) {
      this.pagination.page = 1
      this.pagination.size = val
      this.getList()
    },
    handlePageChange(val) {
      this.pagination.page = val
      this.getList()
    },
  },
  destroyed() {
    this.$utils.enterSearch.removeEvent(window, 'keydown', this.keyDown)
  },
}
