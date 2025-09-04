<template>
  <datablau-dialog
    custom-class="standard-dialog-page"
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
        <span v-if="selectedAssets.length > 0" style="color: #409eff">
          {{
            $t('securityModule.hasSelect', {
              num: selectedAssets.length,
            })
          }}
        </span>
        <el-tag
          style="margin-right: 4px; margin-bottom: 4px"
          :key="asset.id"
          v-for="asset in selectedAssets"
          :disable-transitions="false"
        >
          <template>
            {{ asset.name }}
          </template>
        </el-tag>
      </div>
      <div class="standard-content">
        <div class="tree-box lazy-tree-box">
          <datablau-tree-header>
            <template slot="search">
              <!-- <i
                v-show="showClose"
                class="el-icon-circle-close cursor-close"
                :class="{ 'show-cursor-close': showClose }"
                @click="clear"
              ></i> -->
              <datablau-select
                ref="loadSelect"
                filterable
                clearable
                class="filter-input"
                v-model="catalogueKey"
                remote
                reserve-keyword
                :placeholder="$t('securityModule.search')"
                :remote-method="getCatalogName"
                @focus="focusSelect"
                @change="selectCatalogName(catalogueKey)"
                @visible-change="visibleChange"
                :isIcon="'icon-search'"
              >
                <el-option
                  v-for="item in nameList"
                  :key="item.id"
                  :label="item.catalogPathName"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </template>
          </datablau-tree-header>
          <div
            class="tree-title"
            :class="{ 'tree-title-active': !sensitiveId }"
            @click="handleAllTree"
          >
            <i class="iconfont icon-file"></i>
            <span>{{ $t('securityModule.allName') }}</span>
          </div>
          <div class="tree-line"></div>
          <div class="tree-content">
            <datablau-tree
              :use-default-sort="false"
              lazy
              :load="loadCallback"
              class="grey-tree data-asset-tree"
              ref="tree"
              :default-expand-all="false"
              show-overflow-tooltip
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
        </div>
        <div class="right-standard-box">
          <div class="table-seach">
            <datablau-input
              style="width: 240px; display: inline-block; vertical-align: top"
              clearable
              :iconfont-state="true"
              :placeholder="$t('accessControl.searchInfoItem')"
              v-model="key"
              @keyup.native.enter="handleSearch"
            ></datablau-input>
            <!-- <datablau-button
              type="normal"
              @click="qureySure"
              style="
                display: inline-block;
                margin-left: 8px;
                vertical-align: top;
              "
            >
              搜索
            </datablau-button> -->
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
              :reserve-selection="true"
              @selection-change="selectTable"
              :header-cell-style="{
                color: '#494850',
                'font-size': '12px',
                'font-weight': 'bold',
              }"
              row-key="itemId"
            >
              <el-table-column
                type="selection"
                width="20"
                :selectable="row => !row.bind"
                :reserve-selection="true"
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="name"
                :label="$t('accessControl.infoName')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="stdCode"
                :label="$t('accessControl.infoCode')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="sensitiveCatalogName"
                :label="$t('accessControl.infoCatalog')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="businessDepartment"
                :label="$t('securityModule.businessDefinition')"
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
        <datablau-button @click="closeDialog" type="secondary">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="submitAssets"
          :disabled="selectedAssets.length === 0"
        >
          {{ $t('securityModule.add') }}
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import addStandard from './addStandard.js'
export default addStandard
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
      box-sizing: border-box;
      border: 1px solid #ddd;
      float: left;
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
        margin: 4px 0;
        background: #efefef;
      }
      .tree-content {
        position: absolute;
        top: 92px;
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
        top: 40px;
        bottom: 0;
        left: 0;
        right: 0;
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
