<template>
  <div>
    <el-dialog
      :title="diaTitle"
      :visible.sync="showChooseTree"
      width="700px"
      class="choose-tree"
      append-to-body
    >
      <el-input
        size="mini"
        :placeholder="$t('meta.tagManage.placeholder')"
        v-model="keyword"
        clearable
      ></el-input>
      <div
        style="
          height: 400px;
          position: relative;
          margin-top: 5px;
          overflow: auto;
        "
        class="choose-tree-con"
      >
        <el-tree
          ref="tree1"
          node-key="id"
          class="light-blue-tree"
          :data="chooseTreeData"
          :render-content="renderContent"
          :props="businessDefaultProps"
          :filter-node-method="filterNode"
          :accordion="true"
          :default-expanded-keys="expandedKeys"
          @node-click="handleNodeClick"
          v-if="showChooseTree"
        ></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="bind"
          :disabled="disableChooseNode"
        >
          {{ $t('common.button.ok') }}
        </el-button>
        <el-button class="white-btn" size="small" @click="close">
          {{ $t('common.button.close') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: ['chooseTreeData', 'diaTitle'], // expandBranch
  data() {
    return {
      businessDefaultProps: {},
      // expandedKeys:['c1'],
      disableChooseNode: true,
      keyword: '',
      showChooseTree: false,
      treeBox: {},
      modelClicked: {},
      expandedKeys: [],
    }
  },
  mounted() {
    this.treeBox = $('.choose-tree-con')[0]
    setTimeout(() => {
      this.treeBox && Ps.initialize(this.treeBox)
    })
  },
  watch: {
    keyword(val) {
      this.$refs.tree1.filter(val)
    },
  },
  methods: {
    filterNode(value, data, node) {
      setTimeout(() => {
        this.treeBox && Ps.update(this.treeBox)
      }, 100)
      if (!value) return true
      if (!data.label) return false
      let hasValue = false
      let current = node
      do {
        if (
          current.data.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
        ) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    bind() {
      this.$emit('chooseNode', _.clone(this.modelClicked))
      // this.showChooseTree = false;
    },
    close() {
      this.showChooseTree = false
    },
    handleNodeClick(data, node) {
      if (data.type === 'folder') {
        this.disableChooseNode = false
        this.modelClicked = data
      } else if (data.type === 'node') {
        this.disableChooseNode = false
        this.modelClicked = data
        this.modelClicked.parent = node.parent.data
      } else {
        setTimeout(() => {
          this.treeBox && Ps.update(this.treeBox)
        }, 100)

        this.disableChooseNode = true
      }
    },
    renderContent(h, { node, data, store }) {
      const label = node.label
      if (data.type === 'folder') {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span>{label}</span>
          </span>
        )
      } else if (data.type === 'node') {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="tree-icon fa fa-database"></span>
            <span>{label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="tree-icon branch"></span>
            <span>{label}</span>
          </span>
        )
      }
    },
    showDialog() {
      this.showChooseTree = true
      this.keyword = ''
    },
  },
}
</script>

<style lang="scss" scoped>
.choose-tree {
  overflow: hidden;
}
</style>
