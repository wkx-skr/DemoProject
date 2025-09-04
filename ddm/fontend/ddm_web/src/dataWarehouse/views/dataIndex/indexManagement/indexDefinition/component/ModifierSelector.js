import {
  Label,
  ModifierCategory
} from '@/dataWarehouse/views/dataIndex/modifier/entrance/Constant'
import ModifierValueSelector from '@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/component/ModifierValueSelector'
import LDMTypes from '@constant/DAMLDMTypes'
import HTTP from '@/resource/http.js'
const URL_BASE = `${HTTP.$domains}modifier/`
export default {
  mounted () {},
  components: {
    ModifierValueSelector
  },
  data () {
    return {
      ModifierCategory: ModifierCategory,
      visible: false,
      modifierCategory: null,
      /*
      tree start
       */
      keyword: '',
      rootId: null,
      treeData: [],
      defaultProps: {
        children: 'nodes',
        label: 'name'
      },
      defaultExpandedKeys: [2],
      folderId: null,
      /*
      tree end
       */
      /*
      table start
       */
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: null,
      searchFormData: {
        name: '' // 搜索关键字
      },
      getDataTimer: null,
      /*
      table end
       */
      showValueDialog: false,
      modifierType: null
    }
  },
  methods: {
    handleClose () {
      this.visible = false
    },
    callSelector (modifierCategory) {
      this.modifierCategory = modifierCategory
      this.setLabelsAndClearForm()
      this.visible = true
      this.getTreeData()
      this.getData()
    },
    setLabelsAndClearForm () {
      this.folderId = null
      this.keyword = ''
      this.currentPage = 1
      this.pageSize = 20
      this.total = 0
      this.modifierType = null
      this.searchFormData.name = ''
    },
    getTreeLDMType () {
      let treeType = LDMTypes.ModifierType
      if (this.modifierCategory === ModifierCategory.TIME_PERIOD) {
        treeType = LDMTypes.TimeModifierType
      }
      return treeType
    },
    treeSort (root) {
      let t = root.subNodes
      if (t) {
        t.forEach(item => {
          if (item.subNodes) {
            item.nodes = item.subNodes
            this.treeSort(item)
          }
        })
      }
      return t
    },
    getTreeData () {
      let url = `${this.$domains}categories/tree?type=${this.getTreeLDMType()}`
      this.$http.post(url).then(res => {
        this.rootId = res.data.subNodes[0].id
        if (res.data.subNodes[0] && res.data.subNodes[0].subNodes) {
          this.treeData = this.treeSort(res.data.subNodes[0])
          this.noCategory = false
        }
      })
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    filterNode (value, data, node) {
      if (!value) return true
      return this.$MatchKeyword(node.data, value, 'name')
    },
    // 节点展开
    nodeExpand (node) {
      this.defaultExpandedKeys.push(node.id)
    },
    // 节点关闭
    nodeCollapse (node) {
      this.defaultExpandedKeys = this.defaultExpandedKeys.filter(
        item => item !== node.id
      )
    },
    handleNodeClick (data) {
      this.folderId = data.id
      this.getData()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getData()
    },
    getData () {
      this.tableData = null
      if (this.getDataTimer) {
        clearTimeout(this.getDataTimer)
        this.getDataTimer = null
      }
      this.getDataTimer = setTimeout(() => {
        this.$http
          .post(URL_BASE + 'page', {
            keyword: this.searchFormData.name,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            catalogId: this.folderId ? this.folderId : this.rootId
          })
          .then(res => {
            this.tableData = res.data.content
            this.total = res.data.totalItems
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 500)
    },
    handleRowClick (row) {
      this.modifierType = row
      this.showValueDialog = true
    },
    handleCloseModifierValueSelector () {
      this.showValueDialog = false
    },
    handleModifierValueSelect (list) {
      const values = []
      list.forEach(item => {
        values.push({
          id: item.id,
          code: item.code,
          name: item.name
        })
      })
      this.$emit('select', {
        type: {
          category: this.modifierType.category,
          code: this.modifierType.code,
          name: this.modifierType.name
        },
        values: values
      })
      this.showValueDialog = false
      this.handleClose()
    }
  },
  computed: {
    Label () {
      const result = Label[this.modifierCategory]
      if (result) {
        return result
      } else {
        return {}
      }
    }
  },
  watch: {
    keyword (val) {
      this.$refs.tree.filter(val)
    },
    'searchFormData.name': {
      handler () {
        this.currentPage = 1
        this.getData()
      }
    }
  }
}
