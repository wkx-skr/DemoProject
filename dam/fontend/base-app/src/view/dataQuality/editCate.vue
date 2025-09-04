<template>
  <div class="outbox">
    <el-dialog
      title="编辑目录"
      :visible.sync="cataDiaVisible"
      width="500px"
      class="outdia"
      append-to-body
    >
      <el-input
        placeholder="搜索目录..."
        v-model="cateFilterText"
        clearable
      ></el-input>
      <div class="cate-tree-container cate-scroll-box">
        <el-tree
          :props="treeProps"
          :data="treeData"
          ref="cateTree"
          :render-content="cateTreeNodeRender"
          @current-change="selectCateChange"
          :filter-node-method="filterCateNode"
          highlight-current
        ></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button icon="plus" @click="addCategory">创建目录</el-button>
        <!-- <el-button type="primary" :disabled="!canSelectTag" @click="bindTagToObject">选定</el-button> -->
      </span>
    </el-dialog>
    <el-dialog
      title="创建目录"
      :visible.sync="createCategoryVisible"
      width="500px"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newCateName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createCate">创建</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateFilterText: '',
      createCategoryVisible: false,
      newCateName: '',
      cataDiaVisible: false,
      showData: [],
      treeProps: {
        label: 'name',
      },
    }
  },
  props: {
    treeData: Array,
    showDia: Boolean,
  },

  watch: {
    cateFilterText(newVal) {
      this.dataFilter(newVal)
    },
  },

  components: {},

  computed: {},

  mounted() {
    this.dataFilterText = ''
    this.dataFilter(this.dataFilterText)
  },

  methods: {
    removeNode(node) {
      this.$emit('deletNode', node.data)
    },
    filterCateNode(value, data, node) {
      return data.name.indexOf(value) > -1
    },
    dataFilter(keyword) {
      this.$refs.cateTree && this.$refs.cateTree.filter(keyword)
    },
    showCataDia() {
      this.cataDiaVisible = true
      setTimeout(() => {
        var scroll = $('.cate-scroll-box')
        if (scroll[0] && !scroll.attr('inited')) {
          Ps.initialize(scroll[0])
          scroll.attr('inited', 'true')
        }
      }, 10)
    },
    selectCateChange() {},
    addCategory() {
      this.cateFilterText = ''
      this.newCateName = ''
      this.createCategoryVisible = true
    },
    createCate() {
      this.$emit('createNode', this.newCateName)
      this.createCategoryVisible = false
    },
    cateTreeNodeRender(h, { node, data, store }) {
      return (
        <div class="custom-tree-node" style="width:400px">
          <span>{node.label}</span>
          <span class="editIcon" style="float: right">
            <i
              class="el-icon-delete"
              style="color: #409EFF"
              on-click={() => this.removeNode(node, data)}
            ></i>
          </span>
        </div>
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.outdia {
  padding-left: 10px;
  .cate-tree-container {
    position: relative;
    margin-top: 10px;
    height: 400px;
    overflow: hidden;
    border: 1px solid rgba(170, 170, 170, 0.479);
  }
}
.el-icon-delete {
  color: red;
}
.custom-tree-node {
  color: red;
  .editIcon {
  }
}
</style>
