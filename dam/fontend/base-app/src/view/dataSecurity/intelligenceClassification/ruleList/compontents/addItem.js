import API from '@/view/dataSecurity/util/api'
import folder from '../../../../../assets/images/search/folder.svg'
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
      heightCatalog: {},
      curCatalogTree: {},
      nameList: [],
      allTreeList: [],
      showClose: false,
    }
  },
  mounted() {
    this.$utils.enterSearch.addEvent(window, 'keydown', this.keyDown)
  },
  methods: {
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    focusSelect() {
      if (!this.catalogueKey && !this.showClose) {
        this.nameList = []
      }
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
        API.classifySearch(key)
          .then(res => {
            res.data.map(item => {
              item.name = item.catalogPathName + item.name
            })
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
        const nameList = itemMap.name.split('/')
        const idList = itemMap.catalogPath.split('/')
        await this.getTreeList(idList, nameList)
      } else {
        this.$refs.tree.$refs.tree.$data.store.lazy = true
        this.getTree(0, this.resolve)
      }
    },
    getTreeStructure(treeList, attrList) {
      let newArray = []
      treeList.map(item => {
        const newList = attrList.filter(
          o => o.level === item.level && o.structureId === item.structureId
        )
        item.icon = newList[0].icon
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.id === ret.parentId) {
              if (!res.hasOwnProperty('children')) {
                res.children = []
              }
              res.children.push(ret)
            }
          })
          if (res.hasOwnProperty('children')) {
            arrToTree(list, res.children)
          }
        })
      }
      this.treeData = newArray
      return newArray
    },
    async getTreeList(idList, nameList) {
      this.treeLoading = true
      for (let i = 0; i < idList.length; i++) {
        const { data } = await API.getClassifyTree(idList[i])
        let treeList = data.DataSecurityStructureVo.catalogVos || []
        treeList.map(async item => {
          const newList = this.structureVos.filter(
            o => o.level === item.level && o.structureId === item.structureId
          )
          item.icon = newList[0].icon
          this.allTreeList.push(item)
        })
      }
      this.treeData = this.getTreeStructure(this.allTreeList, this.structureVos)
      const xx = this.allTreeList.map(item => item.id)
      console.log(xx)
      const itemList = this.allTreeList.filter(
        item => item.id === parseFloat(this.catalogueKey)
      )
      this.heightCatalog = itemList[0]
      this.curCatalogTree = itemList[0]
      setTimeout(() => {
        this.$refs.tree.expandTopLevel()
        this.$refs.tree.filter(itemList[0].name)
        this.$refs.tree.setCurrentKey(this.heightCatalog.id)
        this.getList()
        this.treeLoading = false
      }, 100)
    },
    getName(row) {
      const result =
        row.name + (row.englishName ? '(' + row.englishName + ')' : '')
      return result
    },
    // 局部刷新树节点
    refreshTreeNode(id) {
      if (id) {
        const node = this.$refs.tree.getNode(id)
        if (node) {
          node.loaded = false
          node.expand()
        }
      } else {
        this.treeLoading = true
        this.getTree(0, this.resolve)
      }
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
    async getTree(id, resolve, isLazy = true) {
      const { data } = await API.getClassifyTree(id)
      this.structureVos = data.DataSecurityStructureVo.detailVos
      let treeList = data.DataSecurityStructureVo.catalogVos || []
      if (treeList.length > 0) {
        treeList.map(async item => {
          const newList = this.structureVos.filter(
            o => o.level === item.level && o.structureId === item.structureId
          )
          item.icon = newList[0].icon
        })
      }
      if (id === 0) {
        this.treeData = treeList
        if (treeList.length > 0) {
          this.$nextTick(async () => {
            this.heightCatalog = treeList[0]
            this.curCatalogTree = treeList[0]
          })
        }
      }
      this.treeLoading = false
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.heightCatalog.id) {
            this.getList()
            this.$refs.tree.setCurrentKey(this.heightCatalog.id)
          }
        })
      })
      if (isLazy) {
        return resolve(treeList)
      }
    },
    getList() {
      const params = {
        nameLike: this.key,
        currentPage: this.pagination.page,
        pageSize: this.pagination.size,
        orderBy: 'createTime',
        seq: 'DESC',
      }
      API.getInfoItemDetail(this.heightCatalog.id, params).then(res => {
        this.total = res.data.totalItems
        this.tableData = res.data.content || []
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
        ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
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
    handleNodeClick(data) {
      this.heightCatalog = data
      this.curCatalogTree = data
      this.$refs.tree.setCurrentKey(data.id)
      this.pagination.page = 1
      // 清空已选资产
      this.$refs.table.clearSelection()
      this.getList()
    },
    qureySure() {
      this.pagination.page = 1
      this.getList()
    },
    getRowKeys(row) {
      return row.id
    },
    selectTable(list) {
      this.selectedAssets = _.cloneDeep(list)
    },
    singleSelect(selection, row) {
      this.$refs.table.clearSelection()
      if (selection.length === 0) {
        // 判断selection是否有值存在
        return
      }
      if (row) {
        this.selectedAssets = [row]
        this.$refs.table.toggleRowSelection(row, true)
      }
    },

    handleSizeChange(val) {
      this.pagination.page = 1
      this.pagination.size = val
      this.getList()
    },
    handlePageChange(val) {
      this.pagination.page = page
      this.getList()
    },
  },
  destroyed() {
    this.$utils.enterSearch.removeEvent(window, 'keydown', this.keyDown)
  },
}
