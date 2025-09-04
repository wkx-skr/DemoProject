<template>
  <div>
    <datablau-dialog
      custom-class="new-rule-dialog"
      title="添加识别规则"
      :visible.sync="visible"
      size="xl"
      :close-on-click-modal="false"
      :height="500"
      :before-close="close"
    >
      <div id="dir-rule-selector">
        <div class="rules-box">
          <datablau-input
            style="width: 220px"
            class="filter-input"
            v-model="treeKey"
            clearable
            :iconfont-state="true"
            placeholder="检索目录"
          ></datablau-input>
          <div class="tree-content">
            <datablau-tree
              v-loading="treeLoading"
              class="el-tree"
              style="position: relative"
              :show-checkbox="false"
              ref="tree"
              :data="treeData"
              :expand-on-click-node="false"
              default-expand-all
              :props="defaultProps"
              @node-click="handleNodeClick"
              :filter-node-method="filterNode"
              check-strictly
              node-key="id"
              :data-supervise="true"
              :data-icon-function="dataIconFunction"
            ></datablau-tree>
          </div>
        </div>
        <div class="right-box">
          <datablau-input
            v-model="keyword"
            style="width: 240px"
            placeholder="搜索规则名称"
            :iconfont-state="true"
            clearable
          ></datablau-input>
          <div class="table-box">
            <datablau-table
              v-loading="tableLoading"
              ref="table"
              @selection-change="tableSelectionChanged"
              :data="tableData"
              height="100%"
              :data-selectable="true"
            >
              <el-table-column
                prop="ruleName"
                show-overflow-tooltip
                label="规则名称"
                min-width="180"
              ></el-table-column>
              <el-table-column
                prop="ruleDescription"
                show-overflow-tooltip
                label="规则描述"
                min-width="300"
              ></el-table-column>
              <el-table-column
                prop="createTime"
                label="创建时间"
                min-width="180"
                :formatter="$timeFormatter"
              ></el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close">取消</datablau-button>
        <datablau-button @click="addRules" type="important">
          确定
        </datablau-button>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="page"
          style="float: left"
        ></datablau-pagination>
      </span>
    </datablau-dialog>
  </div>
</template>
<script>
import HTTP from '@/http/main.js'

export default {
  data() {
    return {
      visible: true,
      keyword: '',
      tableLoading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      treeData: [],
      treeKey: '',
      treeLoading: false,
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      ruleInfoCatalog: '', // 规则目录
      sigleRulemap: {},
    }
  },
  mounted() {
    this.getTree()
    this.getRules()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    getTree() {
      // 获取识别规则目录
      this.treeLoading = true
      this.$http
        .get(this.$url + '/service/categories/tree/?type=ATOM_DISCERN_RULE')
        .then(data => {
          this.treeLoading = false
          this.treeData = data.data.subNodes || []
        })
        .catch(err => {
          this.treeLoading = false
          this.$showFailure(err)
        })
    },
    handleNodeClick(data, e) {
      this.ruleInfoCatalog = data.name
      this.getRules()
    },
    getRules() {
      this.tableLoading = true
      const params = {
        search: this.keyword,
        order_by: 'createTime',
        is_asc: false,
        current_page: this.currentPage,
        page_size: this.pageSize,
        ruleInfoCatalog: this.ruleInfoCatalog,
      }
      this.$http
        .get(this.$url + '/service/discern/atom/rules', { params: params })
        .then(data => {
          this.tableLoading = false
          this.tableData = data.data.content || []
          this.total = data.data.totalItems
        })
        .catch(err => {
          this.tableLoading = false
          this.$showFailure(err)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getRules()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getRules()
    },
    tableSelectionChanged(selection) {
      this.sigleRulemap = selection[selection.length - 1]
      if (selection.length > 1) {
        const del_row = selection.shift()
        this.$refs.table.toggleRowSelection(del_row, false)
      }
    },
    addRules() {
      this.$emit('addRules', this.sigleRulemap)
      this.$emit('close')
    },
    close() {
      this.$emit('close')
    },
  },
  watch: {
    keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getRules()
      }, 200)
    },
    treeKey(val) {
      this.$refs.tree.filter(val)
    },
  },
}
</script>
<style lang="scss">
.new-rule-dialog {
  .el-dialog__body {
    .datablau-dialog-content {
      overflow: hidden !important;
    }
  }
}
</style>
<style lang="scss" scoped>
/deep/ .el-table {
  &:before {
    border: 0;
    background: transparent;
  }
}

#dir-rule-selector {
  width: 100%;
  // height: 520px;
  .rules-box {
    width: 240px;
    height: 365px;
    float: left;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    overflow: hidden;
    overflow-y: auto;
    .filter-input {
      margin: 10px;
    }
    .tree-content {
    }
  }
  .right-box {
    height: 365px;
    // width: 660px;
    max-width: 660px;
    float: left;
    margin-left: 20px;
  }

  .table-box {
    // height: 460px;
    // min-height: 200px;
    margin-top: 2px;
    /deep/ .el-table__body-wrapper {
      min-height: 285px;
    }
  }
  .buttom {
    padding-top: 6px;
  }
  .button-box {
    position: absolute;
    bottom: 5px;
    right: 18px;
  }
}
</style>
