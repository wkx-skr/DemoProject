<template>
  <div>
    <datablau-dialog
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
                label="规则名称"
                min-width="120"
              ></el-table-column>
              <el-table-column prop="ruleMode" label="识别对象" min-width="120">
                <template slot-scope="scope">
                  <div
                    v-if="scope.row.discernType === 80000004"
                    class="meta-data surface"
                  >
                    表
                  </div>
                  <div
                    v-if="scope.row.discernType === 80500008"
                    class="meta-data view"
                  >
                    视图
                  </div>
                  <div
                    v-if="scope.row.discernType === 80000005"
                    class="meta-data field"
                  >
                    字段
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="ruleDescription"
                label="规则描述"
                min-width="350"
              ></el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close"> {{ $t('common.button.cancel') }} </datablau-button>
        <datablau-button @click="addRules" type="important">
          添加
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
        .get(this.$url + '/service/categories/tree/?type=DISCERN_RULE')
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
      HTTP.getDIscernRules({
        keyword: encodeURI(this.keyword),
        page: this.currentPage,
        size: this.pageSize,
        ruleInfoCatalog: this.ruleInfoCatalog,
      })
        .then(res => {
          this.tableLoading = false
          const data = res.data || {}
          this.tableData = data.content || []
          this.total = data.totalItems
        })
        .catch(err => {
          this.tableLoading = false
          console.error(err)
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
      this.selection = selection
      //     if (selection.length > 1) {
      //     let del_row = selection.shift()
      //     this.$refs.table.toggleRowSelection(del_row, false)
      //   }
    },
    addRules() {
      this.$emit('addRules', this.selection)
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
<style lang="scss" scoped>
/deep/ .el-dialog {
  .datablau-dialog-content {
    overflow-y: hidden;
  }
}
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
