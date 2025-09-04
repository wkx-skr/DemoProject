<template>
  <datablau-dialog
    custom-class="standard-dialog-page"
    :title="title"
    :visible="showItem"
    v-if="showItem"
    :before-close="closeDialog"
    width="960px"
    :height="height"
    :table="true"
    ref="standardDialog"
  >
    <div class="standard-box">
      <div class="standard-content">
        <div class="tree-box lazy-tree-box">
          <i
            v-show="showClose"
            class="el-icon-circle-close cursor-close"
            :class="{ 'show-cursor-close': showClose }"
            @click="clear"
          ></i>
          <datablau-select
            ref="loadSelect"
            filterable
            clearable
            class="filter-input"
            v-model="catalogueKey"
            remote
            reserve-keyword
            placeholder="搜索目录名称"
            :remote-method="getCatalogName"
            @focus="focusSelect"
            @change="selectCatalogName(catalogueKey)"
            @visible-change="visibleChange"
            :isIcon="'icon-search'"
          >
            <el-option
              v-for="item in nameList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
          <datablau-tree
            v-loading="treeLoading"
            lazy
            :load="loadCallback"
            :use-default-sort="false"
            class="grey-tree"
            ref="tree"
            :default-expand-all="false"
            auto-expand-parent
            @node-click="handleNodeClick"
            node-key="id"
            :show-overflow-tooltip="true"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            :props="defaultProps"
            :data-img-function="dataIconFunction"
            :data="treeData"
          ></datablau-tree>
        </div>
        <div class="right-standard-box">
          <div class="table-seach">
            <datablau-input
              style="width: 240px; display: inline-block; vertical-align: top"
              clearable
              :iconfont-state="true"
              :placeholder="'搜索信息项名称'"
              v-model="key"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureySure"
              style="
                display: inline-block;
                margin-left: 16px;
                vertical-align: top;
              "
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
              :data-selectable="true"
              @selection-change="selectTable"
              @select="singleSelect"
              :header-cell-style="{
                color: '#494850',
                'font-size': '12px',
                'font-weight': 'bold',
              }"
              :row-key="getRowKeys"
              :reserve-selection="true"
            >
              <!-- <el-table-column
                type="selection"
                width="20"
                :selectable="row => !row.bind"
                :reserve-selection="true"
              ></el-table-column> -->
              <el-table-column width="28">
                <template slot-scope="scope">
                  <datablau-icon
                    :data-type="'infoitems'"
                    :size="20"
                    style="position: relative; top: 3px"
                  ></datablau-icon>
                </template>
              </el-table-column>
              <el-table-column
                :min-width="120"
                prop="name"
                label="信息项名称"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ getName(scope.row) }}
                </template>
              </el-table-column>
              <el-table-column
                :min-width="120"
                prop="stdCode"
                label="信息项编码"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="sensitiveCatalogName"
                label="信息项主题"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="businessDepartment"
                label="业务定义"
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
        :page-sizes="[20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next"
        :pager-count="5"
        class="page"
        :total="total"
      ></datablau-pagination>
      <div class="footer-btn">
        <datablau-button @click="closeDialog">取消</datablau-button>
        <datablau-button
          type="primary"
          @click="submitAssets"
          :disabled="selectedAssets.length === 0"
        >
          确定
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import addItem from './addItem.js'
export default addItem
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
      position: relative;
      .grey-tree {
        position: absolute;
        top: 52px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      }
    }
    .right-standard-box {
      width: 700px;
      height: 100%;
      float: left;
      margin-left: 10px;
      box-sizing: border-box;
      position: relative;
      .table-seach {
      }
      .table-box {
        position: absolute;
        top: 44px;
        bottom: 0;
        left: 0;
        right: 0;
        /deep/ .has-gutter {
          .el-checkbox {
            display: none;
          }
        }
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
.standard-dialog-page {
  .datablau-dialog-content {
    overflow: hidden !important;
  }
}
</style>
