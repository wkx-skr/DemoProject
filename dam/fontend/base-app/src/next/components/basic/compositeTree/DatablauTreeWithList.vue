<!--
 * @FileDescription: 通用组件, 左侧是树, 右侧是表(table)
 * 配置参数:
 *    // 树相关
 *    getTreeData: fn, 获取 tree 数据
 *    treeNodeRender: fn, 渲染树节点
 *    nodeId: string, 树节点 node-key 属性名称
 *    treeSearchPH: 树 搜索框 placeholder
 *    treeProps: element tree props
 *    showTreeTop: 是否显示树 顶部, 可以放置搜索框, 按钮
 *    showTreeBottom: 是否显示底部, 可以放置 按钮
 *    showTreeCheckBox: 树 是否显示复选框
 *    filterTreeNode: 树 过滤函数, 如果使用树本身的过滤功能
 *    showTreeMoreIcon: 是否显示 树顶部搜索框 旁边的 `...` 按钮
 *    moreCallback: fn, 树顶部 `...` 按钮的 回调函数
 *    treeDefaultExpanded: 树默认展开的节点
 *    // 右侧列表相关
 *    listShowData: table 展示 数据
 *    listTotal: table 分页 总数
 *    columnDefs: 字段定义
 *    tableHideTopLine: 表是否显示顶部 搜索框
 *    tableOption: element table 的 tableOption
 * 监听事件:
 * 组件方法:
 *    左侧:
 *    treeSetCurrent: 设置树 备选中的节点
 *    右侧:
 *    refreshRightList: 刷新右侧树
 *
 -->
<template>
  <div
    class="outer-box"
    :class="{
      'show-tree-bottom': showTreeBottom,
      'show-tree-top': showTreeTop,
    }"
  >
    <div class="tree-box">
      <div class="tree-top-row">
        <slot name="treeTopRow">
          <datablau-input
            v-model="keyword"
            clearable
            :iconfont-state="true"
            class="tree-search-input"
            :placeholder="treeSearchPH"
            :class="{ 'show-more-btn': showTreeMoreIcon }"
            v-length-validator:[50]="keyword"
            style="display: inline-block"
          ></datablau-input>
          <span
            class="el-icon-more more"
            @click="moreCallback"
            v-if="showTreeMoreIcon"
          ></span>
        </slot>
      </div>
      <div>
        <slot name="treeSecondRow"></slot>
      </div>
      <div
        class="tree-com-box"
        :class="hideTreeSecondRow ? 'hide-tree-second-row' : ''"
      >
        <!-- v-loading="treeLoading" -->
        <datablau-tree
          ref="leftTree"
          class="grey-tree"
          :data="treeData"
          :props="treeProps"
          :current-node-key="currentNodeKey"
          :default-expand-all="expandAll"
          :filter-node-method="filterTreeNode"
          :render-content="treeNodeRender"
          :data-supervise="supervise"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          :highlight-current="true"
          :node-key="nodeId"
          :default-checked-keys="treeCheckedKeys"
          :show-checkbox="showTreeCheckBox"
          :default-expanded-keys="treeDefaultExpanded"
          @check-change="handleCheckChange"
          @node-click="handleNodeClick"
          :emptyText="emptyText"
        ></datablau-tree>
      </div>
      <div class="tree-bottom-row" v-if="!hideTreeFooter">
        <slot name="treeBottomRow"></slot>
      </div>
    </div>
    <div class="resize-column-middle"></div>
    <div class="right-box">
      <div class="nav-right">
        <slot name="navRight"></slot>
      </div>
      <div class="list-container">
        <div class="filterTable">
          <div class="search">
            <datablau-input
              style="width: 240px"
              :iconfont-state="true"
              :placeholder="searchPlaceholder"
              v-model="searchKeyword"
              maxlength="50"
              filterable
              clearable
            ></datablau-input>
          </div>
          <div slot="header">
            <slot name="tableHeader"></slot>
          </div>
        </div>
        <datablau-form-submit class="right-table">
          <datablau-table
            :data="tableData"
            :data-selectable="true"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              :label="$t('meta.report.reportNum')"
              prop="code"
            ></el-table-column>
            <el-table-column
              :label="$t('meta.report.reportName')"
              prop="name"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column :label="$t('meta.report.reportType')" prop="type">
              <template slot-scope="scope">
                <datablau-status
                  businessType
                  :type="scope.row.type"
                  :desc="appTypes[scope.row.type]"
                ></datablau-status>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.report.updateFrequency')"
              prop="frequency"
            ></el-table-column>
            <el-table-column
              :label="$t('meta.report.createTime')"
              prop="createTime"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="$t('meta.report.owner')"
              prop="owner"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('meta.DS.metaTable.operation')"
              :width="$i18n.locale === 'zh' ? 80 : 100"
              fixed="right"
              align="center"
            >
              <template slot-scope="scope">
                <datablau-button type="icon" @click="onSee(scope.row)">
                  <i class="iconfont icon-see"></i>
                </datablau-button>
                <datablau-button
                  type="icon"
                  @click="onClick(scope.row)"
                  :disabled="isAuth"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="" style="float: left">
              <span v-show="mutipleLength" class="check-info-icon"></span>
              <span v-show="mutipleLength" class="footer-row-info">
                {{
                  this.$t('common.deleteMessage', { selection: mutipleLength })
                }}
              </span>
              <datablau-button
                v-show="mutipleLength"
                size="small"
                type="danger"
                class="el-icon-delete"
                @click="handleDeleteReports"
                :disabled="deleteDisabled"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
            </div>
            <datablau-pagination
              style="float: right"
              class="bottom-pagination"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :total="totalShow"
              layout="total, sizes, prev, pager, next, jumper"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </div>
    </div>
  </div>
</template>

<script>
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  name: 'DatablauTreeWithList',
  data() {
    return {
      treeData: null,
      emptyText: ' ',
      keyword: '',
      searchKeyword: '',
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      totalShow: 0,
      appTypes: {
        List: this.$t('meta.report.list'),
        Report: this.$t('meta.report.report'),
        Analysis: this.$t('meta.report.analysis'),
      },
      selection: [], // 选中的报表
      mutipleLength: 0,
      deletedIds: new Set(),
    }
  },
  props: {
    listArr: {
      type: Array,
    },
    hideTreeFooter: {
      // 是否显示树底部的操作
      type: Boolean,
      default: false,
    },
    hideTreeSecondRow: {
      default: false,
      type: Boolean,
    },
    expandAll: {
      default: false,
      type: Boolean,
    },
    getTreeData: {
      required: true,
      type: Function,
    },
    treeNodeRender: {
      required: false,
      type: Function,
    },
    dataIconFunction: {
      required: false,
      type: Function,
    },
    dataOptionsFunction: {
      required: false,
      type: Function,
    },
    supervise: {
      required: false,
      type: Boolean,
    },
    nodeId: {
      type: String,
      default: 'id',
    },
    tableHeightInfo: {
      type: String,
    },
    currentNodeKey: {
      type: Number,
      default: 0,
    },
    treeSearchPH: {
      type: String,
      default: '搜索...',
    },
    treeCheckedKeys: {
      type: Array,
      default() {
        return []
      },
    },
    treeProps: {
      type: Object,
      default() {
        return {}
      },
    },
    showTreeBottom: {
      type: Boolean,
      default: true,
    },
    showTreeTop: {
      type: Boolean,
      default: true,
    },
    showTreeCheckBox: {
      type: Boolean,
      default: true,
    },
    filterTreeNode: {
      type: Function,
      default: (value, data, node) => {
        // console.log(value, data, node, 'value, data, node')
        let result = false
        if (!value) {
          result = true
        } else if (value && node.label) {
          const index = node.label.toLowerCase().indexOf(value.toLowerCase())
          if (index !== -1) {
            result = true
          }
        }
        return result
      },
    },
    showTreeMoreIcon: {
      type: Boolean,
      default: false,
    },
    moreCallback: {
      type: Function,
      default: function d() {},
    },
    treeDefaultExpanded: {
      type: Array,
      default() {
        return []
      },
    },
    listTotal: {
      type: Number,
      default: 0,
    },
    tableHideTopLine: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: '',
    },
  },
  components: {},
  computed: {
    deleteDisabled() {
      return !(
        this.selection &&
        this.selection.length > 0 &&
        this.$auth.METADATA_REPORT_DELETE
      )
    },
    isAuth() {
      let bool = true
      if (this.$isAdmin || this.$auth.METADATA_REPORT_MODIFY) {
        bool = false
      }
      return bool
    },
  },
  mounted() {
    this.initResizeHorizontal()
    // this.setTreeData()
  },
  methods: {
    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
    },
    handleDeleteReports() {
      const selection = this.selection.filter(
        item => !this.deletedIds.has(item.id)
      )
      this.$emit('deleteRow', selection)
      this.selection
        .map(item => item.id)
        .forEach(id => {
          this.deletedIds.add(id)
        })
    },
    onSee(row) {
      this.$emit('rightListRowClick', { data: row })
    },
    onClick(row) {
      this.$emit('rightListRowClick', { data: row }, 'edit')
    },
    getTableData() {
      const s = this.pageSize
      const c = this.currentPage
      let filterData = []
      if (Array.isArray(this.listArr)) {
        if (this.listArr.length) {
          filterData = this.listArr.filter(item =>
            this.$MatchKeyword(item, this.searchKeyword, 'code', 'name')
          )
        }
        let result =
          Array.isArray(filterData) && filterData.slice(s * (c - 1), s * c)
        this.totalShow = filterData.length
        this.tableData = result
      } else {
        this.tableData = []
      }
    },
    handleSizeChange(newVal) {
      this.currentPage = 1
      this.pageSize = newVal
      this.getTableData()
    },
    handleCurrentChange(newVal) {
      this.currentPage = newVal
      this.getTableData()
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    forceUpdateCell() {
      if (this.$refs.rightList && this.$refs.rightList.forceUpdateCell) {
        // this.$refs.rightList.forceUpdateCell()
      }
    },
    refreshData() {
      this.setTreeData()
      this.getTableData()
    },
    refreshRightData(val) {
      if (val) {
        this.currentPage = 1
        this.getTableData()
      }
    },
    refreshLeftData() {
      this.setTreeData()
    },
    setTreeData() {
      this.emptyText = ' '
      this.getTreeData()
        .then(res => {
          setTimeout(() => {
            this.treeData = res
            if (this.treeData.length > 0) {
              this.emptyText = ' '
            } else {
              this.emptyText = this.$t('el.empty.description')
            }
          }, 200)
        })
        .catch(e => {
          this.treeData = []
          this.emptyText = this.$t('el.empty.description')
          this.$showFailure(e)
        })
    },
    refreshLeftTree() {
      this.setTreeData()
    },
    treeSetCurrent(nodeKey) {
      if (this.$refs.leftTree && this.$refs.leftTree.setCurrentKey) {
        this.$refs.leftTree.setCurrentKey(nodeKey)
      }
    },
    // filterTreeNode(value, data, node) {
    //   console.log(value, data, node, 'value, data, node')
    //   let result = false;
    //   if (!value) {
    //     result = true;
    //   } else if (value && data.name) {
    //     let index = data.name.toLowerCase().indexOf(value.toLowerCase());
    //     if (index !== -1) {
    //       result = true;
    //     }
    //   }
    //   return result;
    // },
    handleCheckChange(para) {
      if (this.$refs.leftTree && this.$refs.leftTree.getCheckedKeys) {
        const checkedKeys = this.$refs.leftTree.getCheckedKeys()
        this.$emit('handleCheckChange', checkedKeys)
      }
    },
    handleNodeClick(data, node, com) {
      this.$emit('handleNodeClick', { data, node, com })
    },
    refreshRightList() {
      this.setTreeData()
    },
  },
  watch: {
    keyword(newVal, oldVal) {
      if (this.$refs.leftTree && this.$refs.leftTree.filter) {
        this.$refs.leftTree.filter(newVal)
        const rootData = this.$refs.leftTree.$refs.tree.root
        if (rootData.visible) {
          this.emptyText = ' '
        } else {
          this.emptyText = this.$t('el.empty.description')
        }
      }
    },
    searchKeyword(newVal, oldVal) {
      if (!newVal && !oldVal) {
        return
      }
      this.currentPage = 1
      this.getTableData()
    },
    listArr: {
      handler: function () {
        this.getTableData()
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.filterTable {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 0;
  display: flex;
  justify-content: space-between;
}
.form-submit.right-table {
  top: 50px !important;
  ::v-deep .row-content {
    //top: 50px;
    left: 0;
    right: 0;
    bottom: 50px;
    & > div {
      right: 0 !important;
    }
  }
}
.outer-box {
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  // box-sizing: border-box;
  .tree-box {
    position: absolute;
    left: 0;
    // right:230px;
    width: 280px;
    top: 0;
    bottom: 0;
    // border: 1px solid red;
    overflow: hidden;
    .tree-top-row {
      display: none;
    }
    .tree-com-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: auto;
      .tree-item-outer {
        position: relative;
        .more-dot-btn {
          position: absolute;
          right: 0;
          top: 0;
          line-height: 34px;
          width: 24px;
          padding-right: 4px;
          font-weight: bold;
          text-align: center;
          display: none;
        }
        &:hover {
          .more-dot-btn {
            display: inline-block;
          }
        }
      }
    }
    .tree-bottom-row {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      line-height: 50px;
      // border: 1px solid green;
      border-top: 1px solid #eee;
      display: none;
    }
  }
  .resize-column-middle {
    width: 7px;
    left: 278px;
    position: absolute;
    top: 0px;
    bottom: 0;
    z-index: 2;
    cursor: e-resize !important;
  }
  .right-box {
    position: absolute;
    left: 280px;
    right: 20px;
    bottom: 0;
    top: 0;
    border-left: 1px solid var(--border-color-lighter);
    // border: 1px solid red;
    .list-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  }
  &.show-tree-top {
    .tree-top-row {
      display: block;
      position: relative;
      height: 52px;
      .tree-search-input {
        position: absolute;
        left: 10px;
        width: 260px;
        margin: 10px auto;
      }
      .show-more-btn {
        // border: 1px solid red;
        // display: inline-block;
        position: absolute;
        height: 32px;
        top: 10px;
        left: 10px;
        width: auto;
        right: 40px;
        bottom: 10px;
        margin: 0;
        box-sizing: border-box;
      }
      .more {
        // display: inline-block;
        float: right;
        display: inline-block;
        width: 30px;
        height: 20px;
        vertical-align: middle;
        margin: 15px 4px 0 0;
        text-align: center;
        padding-top: 5px;
        cursor: pointer;
        &:hover {
          background-color: #ddd;
        }
      }
    }
    .tree-com-box {
      top: 104px;
      &.hide-tree-second-row {
        top: 54px;
      }
    }
  }
  &.show-tree-bottom {
    .tree-com-box {
      bottom: 0px;
    }
    .tree-bottom-row {
      display: block;
    }
  }
}

// .condense {
//   position: absolute;
//   width:20px;
//   height:60px;
//   background: #f0f0f0;
//   cursor:pointer;
//   color: #68758b;
//   z-index:3;
//   top: calc(50% - 30px);
//   i {
//     margin-top:24px;
//     margin-left:7px;
//   }
//   &.right {
//     left:420px;
//     .fa-chevron-left {
//       display:none;
//     }
//   }
//   &.left {
//     right:0;
//     .fa-chevron-right {
//       display:none;
//     }
//   }
// }
</style>
