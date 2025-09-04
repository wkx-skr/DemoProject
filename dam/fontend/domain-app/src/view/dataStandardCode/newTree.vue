<template>
  <div class="en-tree-box">
    <datablau-input
      v-if="showSearch"
      style="width: 100%"
      :placeholder="$t('domain.domain.searchThemeName')"
      v-model="keyword"
      clearable
      :iconfont-state="true"
    ></datablau-input>
    <div
      class="tree-box"
      :style="{ top: showSearch ? '50px' : '10px' }"
      style="overflow: auto"
      v-loading="treeLoading"
    >
      <!--:render-content="renderContent"-->
      <datablau-tree
        ref="folderTree"
        class="grey-tree"
        :data="treeData"
        :props="defaultProps"
        :show-checkbox="showCheckbox"
        node-key="foldId"
        :key="treeKey"
        :default-expanded-keys="expandedKeys"
        :default-expand-all="defaultExpandAll"
        :expand-on-click-node="false"
        :highlight-current="true"
        auto-expand-parent
        :check-strictly="checkStrictly"
        :filter-node-method="filterNode"
        :data-icon-function="dataIconFunction"
        :data-options-function="dataOptionsFunction"
        :data-supervise="true"
        :current-node-key="defaultCurrentNode"
        :showOverflowTooltip="true"
        @node-click="handleItemClicked"
        @check-change="handleCheckChange"
      ></datablau-tree>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'newCodeTree',
  props: {
    typeIds: {
      type: Number,
      default: 1,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    signalChecked: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      keyword: '',
      keywordSetTimeout: null,
      treeLoading: false,
      treeData: [],
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'id',
      },
      treeKey: 0,
      expandedKeys: [],
      defaultExpandAll: false,
      defaultCurrentNode: '',
    }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {},
  destroyed() {},
  computed: {},
  methods: {
    getCheckedNodes() {
      return this.$refs.folderTree.getCheckedNodes()
    },
    handleCheckChange(data, checked) {
      if (checked && this.signalChecked) {
        this.$refs.folderTree.setCheckedKeys([data.foldId]) // 只选中当前点击的节点
      }
    },
    loadData(foldId) {
      this.treeLoading = true
      // const url = `${this.$url}/service/domains/tree?onlyFolder=true&categoryId=${this.typeIds}`
      HTTP.getDomainTreeDetailService({
        onlyFolder: true,
        categoryId: this.typeIds,
      })
        .then(res => {
          this.treeData = [res.data]
          const defaultFoldId = foldId || res.data.foldId
          this.expandedKeys = [defaultFoldId]
          this.$nextTick(() => {
            this.$refs.folderTree.setCurrentKey(defaultFoldId)
            const defaultFolder = this.findByFoldId(res.data, defaultFoldId)
            this.handleItemClicked(defaultFolder)
          })
          if (this.keyword) {
            setTimeout(() => {
              this.$refs.folderTree.filter(this.keyword)
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.treeLoading = false
        })
    },
    keywordChange() {
      if (!this.keyword) {
        return
      }
      clearTimeout(this.keywordSetTimeout) // debounce
      this.keywordSetTimeout = setTimeout(() => {
        this.$refs.folderTree.filter(this.keyword)
      }, 300)
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      let className = ''
      // console.log(data, 'data')
      if (data.code) {
        className = 'tree-icon domain'
        if (data.updatingId) {
          className += ' is-updating'
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
    dataOptionsFunction(data, node) {
      const options = []
      return options
    },
    handleItemClicked(data, node) {
      this.$emit('itemClick', data, node)
    },
    commandHandle(command, data, node) {},
    findByFoldId(root, targetId) {
      if (root.foldId && root.foldId === targetId) {
        return root
      } else {
        if (root.nodes && root.nodes.length) {
          for (let i = 0; i < root.nodes.length; i++) {
            const res = this.findByFoldId(root.nodes[i], targetId)
            if (res) {
              return res
            }
          }
        }
      }
    },
    getTreeData() {
      return this.treeData
    },
  },
  watch: {
    keyword(val) {
      this.keywordChange()
    },
  },
}
</script>
<style lang="scss">
.en-tree-box .input input {
  background-color: #f6f6f6;
  border-radius: 3px;
  border: none;
  height: 30px;
  line-height: 30px;
}

.grey-tree > div.el-tree-node > .el-tree-node__content > span:first-child {
  /*display:none;*/
}

.grey-tree.enterprise .el-icon-caret-right {
  margin-left: 0;
}
</style>
<style scoped lang="scss">
.en-tree-box {
  padding: 10px;
}

.input {
  margin-top: 10px;
}

.opt-icon {
  float: right;
}

.tree-box {
  position: absolute;
  /*background-color: lightskyblue;*/
  top: 50px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  overflow-y: auto;
}

.refresh,
.opt-icon {
  display: inline-block;
  height: 24px;
  width: 24px;
  border-radius: 4px;
  text-align: center;
  vertical-align: top;
  line-height: 24px;
  font-size: 18px;
  font-weight: bolder;
  margin-left: 2px;
  color: #7d8493;
  position: relative;
  top: -1px;
  transition: background 0.3s, color 0.3s;

  &:hover {
    cursor: pointer;
    color: initial;
    background: #f0f0f0;
  }
}

.refresh {
  font-size: 15px;
  font-weight: normal;
}
</style>
