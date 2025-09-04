import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
export default {
  data () {
    return {
      visible: false,
      keyword: '',
      treeData: null,
      treeDataLoaded: false,
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      key: 0,
      currentData: null,
      editDialogVisible: false,
      editDialogTitle: '',
      tagName: '',
      checkedTags: null
    }
  },
  mounted () {
    this.getTags()
  },
  methods: {
    onTagSelected () {
      this.$emit('selected', this.checkedTags)
      this.visible = false
    },
    openDialog () {
      setTimeout(() => {
        this.visible = true
      }, 100)
    },
    closeDialog () {
      this.visible = false
    },
    setKeys (keys) {
      setTimeout(() => {
        this.$refs.modelTree.setCheckedKeys(keys.map(item => item.id))
      }, 100)
    },
    clear () {
      this.$refs.modelTree.setCheckedKeys([])
    },
    getTags () {
      HTTP.getTags({
        successCallback: data => {
          this.treeData = [{
            id: 0,
            name: '全部标签',
            children: data
          }]
          this.treeDataLoaded = true
        }
      })
    },
    callCategoryContext (data, evt) {
      evt.stopPropagation()
      this.currentData = data
      let x = evt.clientX
      let y = evt.clientY
      let options = []
      if (data.id === 0) {
        options.push({
          label: this.$store.state.$v.dataEntity.createTag,
          callback: this.initCreateTag
        })
      } else {
        options.push({
          label: this.$store.state.$v.modelList.mod,
          callback: this.initEditTag
        })
        options.push({
          label: this.$store.state.$v.modelList.delete,
          callback: this.deleteTag
        })
      }
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options
      })
    },
    renderContent (h, { node, data }) {
      let label = node.label
      if (node.level === 1) {
        return (
          <span class="tree-item-outer" style="left: -5px;">
            <span>
              {/* <span class1="tree-icon icon-18" class="" style="color:#555;">
                <span class="path1"></span>
                <span class="path2"></span>
                <span class="path3"></span>
              </span> */}
              <span class="tree-label">{label}</span>
            </span>
            <span class="el-icon-more more" style="line-height:34px;display:none;"
              on-click={(evt) => this.callCategoryContext(data, evt)}></span>
          </span>)
      } else {
        return (
          <span class="tree-item-outer">
            <span>
              {/* <span class="fa fa-tag" style="color:#555"></span> */}
              <span >{label}</span>
            </span>
            <span class="el-icon-more more" style="line-height:34px;display:none;"
              on-click={(evt) => this.callCategoryContext(data, evt)}></span>
          </span>)
      }
    },
    filterNode (value, data, node) {
      if (!value) return true
      if (!data.name) return false
      let hasValue = false
      let current = node
      do {
        if (string.matchKeyword(current.data, value, 'name', 'alias')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    handleNodeClick (data, node) {
    },
    handleCheckChange () {
      this.checkedTags = this.$refs.modelTree.getCheckedNodes().filter(item => {
        return item.id
      })
    }
  },
  watch: {
    keyword (value) {
      this.$refs.modelTree.filter(value)
    }
  },
  computed: {
    canClose () {
      return this.checkedTags && this.checkedTags.length > 0
    }
  }
}
