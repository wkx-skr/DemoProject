<template>
  <datablau-dialog
    custom-class="algorithm-dialog-page"
    :title="title"
    :visible="visible"
    :before-close="closeDialog"
    width="960px"
    :height="height"
    :table="true"
    ref="standardDialog"
  >
    <div class="standard-box">
      <div
        class="selected-items"
        ref="selectedItems"
        v-if="selectedAssets.length > 0 && !type"
      >
        <el-tag
          :key="asset.id"
          v-for="(asset, index) in selectedAssets"
          closable
          :disable-transitions="false"
          @close="handleRemoveStandard(index)"
        >
          <template>
            {{ asset.name }}
          </template>
        </el-tag>
        <span v-if="selectedAssets.length > 0" style="color: #409eff">
          {{
            $t('assets.assetList.selectedTips', {
              num: selectedAssets.length,
            })
          }}
        </span>
      </div>
      <div class="standard-content">
        <div class="tree-box">
          <datablau-input
            clearable
            :placeholder="'目录名称'"
            v-model="catalogueKey"
            :iconfont-state="true"
          ></datablau-input>
          <datablau-tree
            class="grey-tree data-asset-tree"
            ref="catalogTree"
            :default-expand-all="false"
            auto-expand-parent
            v-loading="treeLoading"
            @node-click="queryCatalog"
            node-key="id"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            :props="defaultProps"
            :data-icon-function="dataIconFunction"
            :data="treeData"
          ></datablau-tree>
        </div>
        <div class="right-standard-box">
          <div class="table-seach">
            <datablau-input
              style="width: 240px; display: inline-block"
              clearable
              :iconfont-state="true"
              :placeholder="'搜索算法名称，描述'"
              v-model="key"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureySure"
              style="display: inline-block; margin-left: 8px"
            >
              查询
            </datablau-button>
          </div>
          <div class="table-box">
            <datablau-table
              :data="tableData"
              ref="table"
              class="datablau-table table"
              height="100%"
              show-overflow-tooltip
              :show-column-selection="false"
              :data-selectable="false"
              @selection-change="selectTable"
              :header-cell-style="{
                color: '#494850',
                'font-size': '12px',
                'font-weight': 'bold',
              }"
              :row-key="getRowKeys"
            >
              <el-table-column
                type="selection"
                width="20"
                :selectable="row => !row.disabled"
                :reserve-selection="true"
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="name"
                label="算法名称"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="type"
                label="算法类型"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="250"
                prop="describe"
                label="描述"
                show-overflow-tooltip
              ></el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="footer">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="pagination.page"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next"
        :pager-count="5"
        class="page"
        :total="total"
      ></datablau-pagination>
      <div class="footer-btn">
        <datablau-button @click="closeDialog">
          {{ $t('assets.common.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="submitAssets">
          {{ $t('assets.common.add') }}
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    clickChild: {
      type: Function,
    },
    type: {
      // type有值时，不展示顶部已选数据
      type: String,
      default: '',
    },
  },
  data() {
    return {
      height: 530,
      title: '选择算法',
      selectedAssets: [],
      standardData: [],
      catalogueKey: '',
      treeLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      treeData: [],
      pagination: {
        page: 1,
        size: 20,
      },
      key: '',
      tableData: [],
      total: 0,
      height: 530,
      showSelect: false,
    }
  },
  mounted() {
    this.treeData = [
      {
        name: '一级目录',
        id: 1,
        children: [
          {
            name: '二级目录',
            id: 2,
          },
          {
            name: 'new二级目录',
            id: 3,
          },
        ],
      },
      {
        name: 'new一级目录',
        id: 4,
      },
    ]
    this.getList()
  },
  watch: {
    catalogueKey(val) {
      this.$refs.catalogTree.filter(val)
    },
  },
  methods: {
    getList() {
      this.tableData = [
        {
          name: '信息项名称',
          type: '信息项主题',
          describe: '描述',
        },
      ]
    },
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.nodeName)
      return false
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    closeDialog() {
      this.clickChild('selAlgorithm', {
        type: 'close',
        // data: this.baseInfo,
      })
    },
    submitAssets() {
      this.clickChild('selAlgorithm', {
        type: 'submit',
        // data: this.baseInfo,
      })
    },
    handleRemoveStandard(index) {
      this.selectedAssets.splice(index, 1)
      this.toggleRowSelection()
    },
    // 表格数据是否多页回显
    toggleRowSelection() {
      const selectedList = _.cloneDeep(this.selectedAssets)
      this.standardData.forEach(row => {
        let selected = false
        selected = selectedList.find(s => s.id === row.id)
        this.$refs.assetsTable.toggleRowSelection(row, Boolean(selected))
      })
      this.selectedAssets = selectedList
    },
    queryCatalog(data) {
      //   this.curReportList = data
      this.pagination.page = 1
      // 清空已选资产
      this.$refs.table.clearSelection()
      this.getList()
    },
    qureySure() {},
    getRowKeys(row) {
      return row.id
    },
    selectTable(list) {
      this.selectedAssets = _.cloneDeep(list)
      this.$nextTick(() => {
        if (this.selectedAssets.length > 0 && !this.type) {
          const itemH = this.$refs.selectedItems.offsetHeight
          this.showSelect = true
          this.height = 530 + itemH
        } else {
          this.height = 530
          this.showSelect = false
        }
      })
    },
    handleSizeChange(val) {
      this.pagination.page = 1
      this.pagination.size = val
      this.getList()
    },
    handlePageChange(val) {
      this.pagination.page = page
      this.getList()
    },
  },
}
</script>

<style scoped lang="scss">
.standard-box {
  width: 100%;
  height: 395px;
  .selected-items {
    width: 100%;
    max-height: 60px;
    overflow-y: scroll;
    padding-bottom: 10px;
  }
  .standard-content {
    height: 395px;
    .tree-box {
      height: 100%;
      width: 210px;
      overflow-y: auto;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      float: left;
    }
    .right-standard-box {
      width: 700px;
      height: 100%;
      float: left;
      margin-left: 10px;
      box-sizing: border-box;
      .table-seach {
      }
    }
  }
}
.footer {
  .page {
    float: left;
  }
  .footer-btn {
    float: right;
  }
}
</style>
<style lang="scss">
.algorithm-dialog-page {
  .datablau-dialog-content {
    overflow: hidden !important;
  }
}
</style>
