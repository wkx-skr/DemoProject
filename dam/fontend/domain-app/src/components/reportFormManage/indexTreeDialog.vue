<template>
  <div>
    <datablau-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="600px"
      class="index-tree-dia"
      :close-on-click-modal="false"
    >
      <div class="tree-box">
        <!-- :render-content="rendNode" -->
        <datablau-tree
          ref="indexTree"
          :data="treeData"
          :props="treeProp"
          :node-key="treeNodeKey"
          :data-icon-function="dataIconFunction"
          :default-expanded-keys="defaultExpandedKeys"
          :expand-on-click-node="false"
          @current-change="setCheckNode"
          @check="setCheckNode"
          highlight-current
          check-strictly
          show-checkbox
          v-if="dialogVisible"
        ></datablau-tree>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="confirmCheck">

          {{ $t('common.button.ok') }}

        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
// 需要传入数据: title, treeData
export default {
  props: ['title', 'treeData', 'treeProp', 'treeNodeKey'],
  data() {
    return {
      dialogVisible: false,
      defaultExpandedKeys: [],
    }
  },
  components: {},
  computed: {},
  mounted() {},
  methods: {
    dataIconFunction(data, node) {
      if (node.disabled) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else {
        return 'iconfont icon-zhibiao'
      }
    },
    rendNode(h, { node, data, store }) {
      let className = ''
      if (node.disabled) {
        className = 'icon-i-folder'
      } else {
        className = 'tree-icon index'
      }
      return h('div', [
        h('span', { class: className }, [
          h('span', { class: 'path1' }),
          h('span', { class: 'path2' }),
        ]),
        h('span', ' '),
        h('span', node.data.name),
      ])
    },
    setCheckNode(node) {
      if (!node.disabled) {
        this.$refs.indexTree.setCheckedKeys([node.id], true)
      }
    },
    confirmCheck() {
      const index = this.$refs.indexTree.getCheckedNodes()[0]
      this.$emit('chickIndex', index)
      this.dialogVisible = false
    },
    showDialog() {
      this.defaultExpandedKeys = []
      this.dialogVisible = true
      if (this.$refs.indexTree && this.$refs.indexTree.setCheckedKeys) {
        this.$refs.indexTree.setCheckedKeys([])
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.index-tree-dia {
  .tree-box {
    padding: 10px 0;
    min-height: 250px;
    border: 1px solid #eee;
    height: 60vh;
    overflow: auto;
  }
}
</style>
