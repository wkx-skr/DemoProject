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
              :use-default-sort="false"
              :data="treeData"
              :expand-on-click-node="false"
              :props="defaultProps"
              @node-click="handleNodeClick"
              :filter-node-method="filterNode"
              check-strictly
              node-key="categoryId"
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
              :reserve-selection="true"
              row-key="ruleId"
              v-loading="tableLoading"
              ref="table"
              @selection-change="tableSelectionChanged"
              :data="tableData"
              height="100%"
              :data-selectable="false"
            >
              <el-table-column
                :reserve-selection="true"
                type="selection"
                width="20"
                :selectable="row => !judgeSelect(row.ruleId)"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="ruleName"
                label="规则名称"
                min-width="100"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="ruleType"
                label="规则类型"
                min-width="100"
              >
                <template slot-scope="scope">
                  <div
                    class="type-class"
                    :style="methodRuleType(scope.row.ruleType, 2)"
                  >
                    {{ methodRuleType(scope.row.ruleType, 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="ruleMode"
                label="识别对象"
                min-width="80"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <!-- <div
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
                  </div> -->
                  <div
                    v-if="scope.row.mlModel === 'TABLE_ONLY'"
                    class="meta-data surface"
                  >
                    表
                  </div>
                  <div v-else class="meta-data field">字段</div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="ruleDescription"
                label="规则描述"
                min-width="250"
              ></el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          @click="addRules"
          :disabled="selection.length === 0"
          type="important"
        >
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
import API from '@/view/dataSecurity/util/api'
import { methodRuleType } from '@/view/dataSecurity/util/util.js'

export default {
  props: {
    idList: {
      type: Array,
      default() {
        return []
      },
    },
    currentRule: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      methodRuleType: methodRuleType,
      visible: true,
      keyword: '',
      tableLoading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selection: [],
      treeData: [],
      treeKey: '',
      treeLoading: false,
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'children',
      },
      ruleInfoCatalog: '', // 规则目录
      heightCatalog: {},
    }
  },
  mounted() {
    this.getTree()
  },
  methods: {
    judgeSelect(id) {
      const result = this.currentRule.some(
        item => parseFloat(item.ruleId) === parseFloat(id)
      )
      return result
    },
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
    setHeightTree() {
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(this.heightCatalog.categoryId)
      })
    },
    getTreeStructure(treeList) {
      let newArray = []
      treeList.map(item => {
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.categoryId === ret.parentId) {
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
    getTree() {
      // 获取识别规则目录
      this.treeLoading = true
      API.getRuleTree()
        .then(async res => {
          this.treeLoading = false
          if (res.data.length > 0) {
            await this.getTreeStructure(res.data)
            this.heightCatalog = this.treeData[0]
            this.$nextTick(() => {
              this.setHeightTree()
            })
            this.getRules()
          } else {
            this.treeData = []
          }
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    handleNodeClick(data) {
      this.ruleInfoCatalog = data.name
      this.heightCatalog = data
      this.currentPage = 1
      this.getRules()
    },
    getRules() {
      this.tableLoading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        orderBy: 'createTime',
        sort: 'DESC',
        searchStr: this.keyword,
        catalogId: this.heightCatalog.categoryId,
      }
      API.getFilterRuleList(params)
        .then(res => {
          this.tableLoading = false
          this.total = res.data.data.totalItems
          this.tableData = res.data.data.content
          console.log(this.tableData)
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
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
        this.currentPage = 1
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
.type-class {
  display: inline-block;
  width: 88px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  text-align: center;
  border-radius: 2px;
  margin: 0 auto;
}
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
    width: 652px;
    float: left;
    margin-left: 20px;
    overflow: hidden;
  }

  .table-box {
    margin-top: 2px;
    width: 100%;
    overflow: hidden;
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
