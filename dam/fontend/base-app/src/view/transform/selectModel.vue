<template>
  <div class="page-outer width-1440">
    <div class="page-container">
      <div class="tree-box">
        <el-scrollbar style="height: 100%">
          <el-tree
            class="default-tree"
            :props="defaultProps"
            :data="treeData"
            height="100%"
            node-key="id"
            :render-content="renderContent"
            @node-click="handleNodeClick"
            default-expand-all
          ></el-tree>
        </el-scrollbar>
      </div>
      <div class="table-box">
        <el-table class="stripe-table" :data="tableData" height="100%">
          <el-table-column
            prop="physicalName"
            label="表名"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="name"
            label="表中文名"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button size="small" type="text" @click="transform(scope.row)">
                变换
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'selectModel',
  data() {
    return {
      treeData: [],
      defaultProps: {
        label: 'name',
        children: 'subNodes',
      },
      tableData: [],
      modelId: null,
      tableName: null,
    }
  },
  mounted() {
    this.getModels()
    this.getTables()
  },
  methods: {
    getModels() {
      this.$http.get(this.$url + '/service/models/modeltree').then(res => {
        this.treeData = res.data.subNodes
      })
    },
    handleNodeClick(data) {
      if (data.type === 'MODEL') {
        this.modelId = data.id
        this.getTables()
      }
    },
    transform(detail) {
      this.tableName = detail.physicalName
      this.modelId = detail.parentId
      this.$router.push({
        name: 'transformAction',
        query: { modelId: this.modelId, tableName: this.tableName },
      })
    },
    getTables() {
      this.$http
        .post(this.$meta_url + '/service/entities/searchMetadata', {
          currentPage: 1,
          keyword: null,
          modelId: this.modelId,
          pageSize: 500,
          types: ['TABLE'],
        })
        .then(res => {
          this.tableData = res.data.content
        })
    },
    renderContent(h, { node, data }) {
      if (data.type === 'MODEL') {
        return (
          <span class="tree-item-outer" data-code={data.code}>
            <span>
              <span class="tree-icon fa fa-database"></span>
              <span oneline-eclipse>{node.label}</span>
            </span>
          </span>
        )
      } else {
        return (
          <span class="tree-item-outer">
            <span>
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
              <span oneline-eclipse>{node.label}</span>
            </span>
          </span>
        )
      }
    },
  },
}
</script>

<style scoped lang="scss">
.tree-box {
  position: absolute;
  left: 20px;
  top: 20px;
  bottom: 20px;
  width: 320px;
  outline: 1px solid #eee;
  overflow: hidden;
}
.table-box {
  position: absolute;
  left: 350px;
  right: 20px;
  bottom: 20px;
  outline: 1px solid #eee;
  top: 20px;
}
</style>
<style>
.tree-box .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
