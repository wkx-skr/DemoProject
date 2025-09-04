<template>
  <datablau-dialog
    title="选择脱敏规则"
    size="xl"
    :visible.sync="showRule"
    v-if="showRule"
    :height="500"
    :before-close="beforeClose"
  >
    <div id="dir-rule-selector">
      <div class="tree-box">
        <datablau-tree-header>
          <template slot="search">
            <datablau-input
              style="width: 220px"
              class="filter-input"
              v-model="catalogKey"
              clearable
              :iconfont-state="true"
              placeholder="搜索目录名称"
            ></datablau-input>
          </template>
        </datablau-tree-header>
        <div
          class="tree-title"
          :class="{ 'tree-title-active': !catalogId }"
          @click="handleAllTree"
        >
          <i class="iconfont icon-file"></i>
          <span>全部目录</span>
        </div>
        <div class="tree-line"></div>
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
            node-key="catalogId"
            :data-supervise="true"
            :data-icon-function="dataIconFunction"
          ></datablau-tree>
        </div>
      </div>
      <div class="right-box">
        <datablau-input
          v-model="keyword"
          clearable
          @keyup.native.enter="searchRuleList"
          style="width: 240px"
          placeholder="搜索规则名称"
          :iconfont-state="true"
        ></datablau-input>
        <div class="table-box">
          <datablau-table
            row-key="ruleId"
            v-loading="ruleLoading"
            ref="table"
            @selection-change="tableSelectionChanged"
            :data="ruleData"
            height="100%"
            :single-select="true"
          >
            <el-table-column
              show-overflow-tooltip
              prop="ruleName"
              label="规则名称"
              min-width="100"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="ruleDesc"
              label="描述"
              min-width="250"
            ></el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              min-width="150"
              :formatter="$timeFormatter"
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
        :disabled="!selection"
        type="important"
      >
        添加
      </datablau-button>
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100, 200]"
        :page-size.sync="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="ruleTotal"
        class="page"
        style="float: left"
      ></datablau-pagination>
    </span>
  </datablau-dialog>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
export default {
  props: {
    showRule: {
      type: Boolean,
      default: false,
    },
    clickRule: {
      type: Function,
    },
    nowRule: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      tableLoading: false,
      treeData: [],
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      catalogKey: '',
      treeLoading: false,
      currentPage: 1,
      pageSize: 20,
      ruleTotal: 0,
      ruleData: [],
      ruleLoading: false,
      selection: null,
      keyword: '',
      catalogId: 0,
    }
  },
  mounted() {},
  watch: {
    showRule(val) {
      if (val) {
        this.keyword = ''
        this.catalogKey = ''
        this.$nextTick(() => {
          this.getTree()
        })
      }
    },
    keyword(val) {
      if (!val) {
        this.currentPage = 1
        this.getRules()
      }
    },
    catalogKey(val) {
      this.$refs.tree.filter(val)
    },
    nowRule: {
      handler(val) {
        if (val.ruleId) {
          this.$nextTick(() => {
            this.$refs.table.singleSelectChange(1, val)
          })
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleAllTree() {
      this.$refs.tree.$refs.tree.setCurrentKey(null)
      this.catalogId = 0
      this.currentPage = 1
      this.getRules()
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    searchRuleList() {
      this.currentPage = 1
      this.getRules()
    },
    getTree() {
      this.treeLoading = true
      API.getDesensitizeTree()
        .then(res => {
          this.treeLoading = false
          this.treeData = res.data.data.subNodes || []
          this.$nextTick(() => {
            // if (this.treeData.length > 0) {
            //   this.catalogId = this.treeData[0].catalogId
            // } else {
            //   this.catalogId = ''
            // }
            // this.$refs.tree.$refs.tree.setCurrentKey(this.catalogId)
            this.getRules()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    tableSelectionChanged(row) {
      this.selection = row
    },
    handleNodeClick(data) {
      this.catalogId = data.catalogId
      this.currentPage = 1
      this.getRules()
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    getRules() {
      this.ruleLoading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        orderBy: 'createDate',
        sort: 'DESC',
        ruleName: this.keyword, // 规则名字
        catalogId: this.catalogId || 0, // 目录id
        limit: true, // 是否分页
      }
      API.desensitizeRuleList(params)
        .then(res => {
          this.ruleLoading = false
          const data = res.data.data
          this.ruleData = data.result || []
          this.ruleTotal = data.total
        })
        .catch(err => {
          this.ruleData = []
          this.ruleLoading = false
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
    async addRules() {
      const newMap = {}
      newMap.name = this.selection.ruleName
      newMap.id = this.selection.ruleId
      await this.clickRule('add', newMap)
      this.selection = null
    },
    close() {
      this.beforeClose()
    },
    beforeClose() {
      this.selection = null
      this.clickRule('close')
    },
  },
}
</script>

<style scoped lang="scss">
#dir-rule-selector {
  width: 100%;
  .tree-box {
    width: 240px;
    height: 365px;
    float: left;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    /deep/ .tree-search-box {
      margin-top: 10px;
    }
    .tree-title {
      height: 32px;
      line-height: 32px;
      padding: 0 10px;
      margin-top: 8px;
      box-sizing: content-box;
      cursor: pointer;
      &:hover {
        background: rgba(64, 158, 255, 0.1);
        span {
          color: #409eff;
        }
      }
      &.tree-title-active {
        background: rgba(64, 158, 255, 0.1);
        span {
          color: #409eff;
        }
      }
      i {
        color: #409eff;
      }
      span {
        margin-left: 5px;
      }
    }
    .tree-line {
      height: 1px;
      margin: 8px 0;
      background: #efefef;
    }
    .tree-content {
      position: absolute;
      top: 102px;
      bottom: 10px;
      left: 0;
      right: 0;
      overflow: hidden;
      /deep/ .el-tree {
        position: absolute !important;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
        .el-loading-mask {
          top: 30px;
        }
      }
    }
  }
  .right-box {
    height: 365px;
    width: 652px;
    float: left;
    margin-left: 20px;
    overflow: hidden;
    position: relative;
  }

  .table-box {
    position: absolute;
    top: 34px;
    left: 0;
    right: 0;
    bottom: 0;
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
