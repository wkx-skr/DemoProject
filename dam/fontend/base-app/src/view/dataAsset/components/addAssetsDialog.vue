<template>
  <datablau-dialog
    custom-class="assets-dialog-page"
    :title="title"
    :visible="visible"
    :before-close="closeDialog"
    width="960px"
    :height="height"
    :table="true"
    ref="assetDialog"
  >
    <div style="width: 100%; height: 405px">
      <div
        class="selectedItems"
        ref="selectedItems"
        v-if="selectedAssets.length > 0"
        style="
          width: 100%;
          max-height: 60px;
          overflow-y: scroll;
          margin-bottom: 10px;
        "
      >
        <el-tag
          :key="asset.id"
          v-for="(asset, index) in selectedAssets"
          closable
          :disable-transitions="false"
          @close="handleRemoveAsset(index)"
        >
          <template
            v-if="
              type === AssetsTypeEnum.DATA_OBJECT ||
              type === AssetsTypeEnum.TABLE ||
              type === AssetsTypeEnum.VIEW
            "
          >
            {{ asset.tableName }}
          </template>
          <template v-else-if="type === AssetsTypeEnum.DATA_STANDARD">
            <template>
              {{ asset.tableName }}
            </template>
          </template>
          <template v-else-if="type === AssetsTypeEnum.DATA_STANDARD_CODE">
            <template>
              {{ asset.name }}
            </template>
          </template>
          <template v-else-if="type === AssetsTypeEnum.REPORT">
            {{ asset.tableName }}
          </template>
          <template v-else>
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
      <div style="width: 100%; display: flex; height: 100%">
        <div
          v-if="!noTreeList.includes(type)"
          class="directory-tree"
          style="border-radius: 2px; height: 395px"
        >
          <div class="asset-dir-tree">
            <datablau-input
              :placeholder="$t('assets.catalogue.name')"
              v-model="catalogueKey"
              :iconfont-state="true"
            ></datablau-input>
            <div v-if="type === AssetsTypeEnum.REPORT">
              <!-- <i class=""></i> -->
              <datablau-button
                type="normal"
                @click="showCatalogDetail"
                class="iconfont icon-allfile"
                :style="{
                  backgroundColor: currentNodeKey
                    ? '#fff'
                    : 'rgba(64, 158, 255, 0.1)',
                }"
                style="
                  margin-top: 4px;
                  line-height: 30px;
                  border: none;
                  width: 100%;
                  text-align: left;
                  padding-left: 27px;
                "
              >
                全部报表
              </datablau-button>
              <el-divider></el-divider>
            </div>
            <datablau-tree
              class="grey-tree data-asset-tree"
              ref="directoryTree"
              :default-expand-all="false"
              auto-expand-parent
              v-loading="treeLoading"
              @node-click="queryAssetsByDir"
              node-key="id"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              :props="defaultProps"
              :default-expanded-keys="expandedKeys"
              :data-icon-function="dataIconFunction"
              :data="treeData"
              @node-expand="setCurrentExpandTheme"
              :showOverflowTooltip="true"
            ></datablau-tree>
          </div>
        </div>
        <div
          class="assets-box"
          :style="{
            padding: '0 10px',
            width: type === AssetsTypeEnum.DATA_OBJECT ? '100%' : '720px',
          }"
        >
          <div
            v-if="type === AssetsTypeEnum.TABLE || type === AssetsTypeEnum.VIEW"
            style="width: 100%; height: 40px"
          >
            <span>
              <datablau-input
                style="width: 200px; display: inline-block"
                clearable
                :iconfont-state="true"
                :placeholder="$t('assets.assetList.searchKeywords')"
                v-model="assetsKeyword"
              ></datablau-input>
              <datablau-select
                style="width: 200px; display: inline-block; margin-left: 20px"
                v-model="modelId"
                v-selectLazyLoad="modelloading"
                filterable
                clearable
                :placeholder="$t('assets.assetList.sourceName')"
              >
                <el-option
                  v-for="item in allFromreList"
                  :key="item.modelId"
                  :label="item.definition"
                  :value="item.modelId"
                ></el-option>
              </datablau-select>
              <datablau-button
                type="normal"
                style="margin-left: 10px"
                @click="qureyAssets"
              >
                {{ $t('assets.common.query') }}
              </datablau-button>
            </span>
          </div>
          <div
            v-if="type === AssetsTypeEnum.DATA_OBJECT"
            style="width: 100%; height: 40px"
          >
            <datablau-input
              style="width: 200px; display: inline-block"
              clearable
              :iconfont-state="true"
              :placeholder="$t('assets.assetList.searchKeywords')"
              v-model="assetsKeyword"
            ></datablau-input>
            <datablau-select
              style="width: 200px; display: inline-block; margin-left: 20px"
              v-model="modelId"
              filterable
              clearable
              :placeholder="$t('assets.assetList.sourceName')"
              v-selectLazyLoad="modelloading"
            >
              <el-option
                v-for="item in allFromreList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
              <el-option v-if="modelLoading" value="" class="table-option">
                {{ $t('assets.assetList.loading') }}
              </el-option>
            </datablau-select>
            <div style="display: inline-block; margin-left: 20px">
              <label
                for="dataTable"
                style="display: inline-block; margin-right: 6px"
              >
                {{ $t('assets.assetList.dataSheet') }}
              </label>
              <datablau-select
                id="dataTable"
                filterable
                clearable
                remote
                v-model="tableName"
                v-selectLazyLoad="lazyloading"
                :remote-method="tableSelect"
                style="display: inline-block; width: 200px"
              >
                <el-option
                  v-for="(table, index) in tableOptions"
                  :key="table.objectId + '' + index"
                  :label="table.physicalName"
                  :value="table.objectId"
                ></el-option>
                <el-option
                  v-if="selectTableLoading"
                  value=""
                  class="table-option"
                >
                  {{ $t('assets.assetList.loading') }}
                </el-option>
              </datablau-select>
            </div>
            <datablau-button
              type="normal"
              style="margin-left: 20px"
              @click="qureyAssets"
            >
              {{ $t('assets.common.query') }}
            </datablau-button>
          </div>
          <div
            v-if="
              type === AssetsTypeEnum.DATA_STANDARD ||
              type === AssetsTypeEnum.DATA_STANDARD_CODE
            "
            style="width: 100%; height: 40px"
          >
            <datablau-input
              style="width: 300px"
              clearable
              :iconfont-state="true"
              :placeholder="$t('assets.assetList.searchStandard')"
              v-model="assetsKeyword"
            ></datablau-input>
            <datablau-input
              v-if="type === AssetsTypeEnum.DATA_STANDARD"
              clearable
              :placeholder="$t('assets.assetList.department')"
              v-model="departmentFullName"
              @focus="selectDepartment"
              style="width: 180px; margin-left: 20px"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureyAssets"
              style="margin-left: 20px"
            >
              {{ $t('assets.common.query') }}
            </datablau-button>
          </div>
          <div v-if="type === AssetsTypeEnum.INDEX" style="height: 40px">
            <datablau-input
              :placeholder="$t('assets.assetList.searchIndex')"
              v-model="indexKeyword"
              :iconfont-state="true"
              clearable
              style="width: 300px"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureyAssets"
              style="margin-left: 20px"
            >
              {{ $t('assets.common.query') }}
            </datablau-button>
          </div>
          <div v-if="type === AssetsTypeEnum.REPORT" style="height: 40px">
            <datablau-input
              :placeholder="$t('assets.assetList.reportNumber')"
              v-model="reportKeyword"
              style="width: 240px"
            >
              <i
                class="el-icon-search el-input__icon"
                slot="prefix"
                style="font-size: 14px"
              ></i>
            </datablau-input>
            <datablau-select
              v-model="reportType"
              @change="queryReportAssets"
              style="display: inline-block; margin-left: 20px"
            >
              <el-option
                v-for="t in appTypes"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              ></el-option>
            </datablau-select>
          </div>
          <div
            v-if="type === AssetsTypeEnum.FILE"
            style="width: 100%; height: 40px"
          >
            <datablau-input
              :placeholder="$t('assets.assetList.searchFile')"
              clearable
              v-model="fileName"
              size="small"
              style="width: 240px"
              :iconfont-state="true"
            ></datablau-input>
            <datablau-button
              type="normal"
              style="margin-left: 10px"
              @click="qureyAssets"
            >
              {{ $t('assets.common.query') }}
            </datablau-button>
          </div>
          <div
            v-if="type === AssetsTypeEnum.DATA_SERVICE"
            style="width: 100%; height: 40px"
          >
            <datablau-input
              :placeholder="$t('assets.assetList.searchApi')"
              clearable
              v-model="applyWord"
              style="width: 240px"
              :iconfont-state="true"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureyAssets"
              style="margin-left: 20px"
            >
              {{ $t('assets.common.query') }}
            </datablau-button>
          </div>
          <div class="table-box">
            <datablau-table
              :data="assetsData"
              v-loading="tableLoading"
              ref="assetsTable"
              class="datablau-table table"
              height="100%"
              show-overflow-tooltip
              :show-column-selection="false"
              :data-selectable="false"
              @selection-change="selectAsset"
              :header-cell-style="{
                color: '#494850',
                'font-size': '12px',
                'font-weight': 'bold',
              }"
              :row-key="getAssetRowKeys"
            >
              <el-table-column
                type="selection"
                width="22"
                :selectable="row => !row.disabled"
                :reserve-selection="true"
                class-name="is-checked"
              ></el-table-column>
              <template v-for="c in columns">
                <el-table-column
                  v-if="c.prop === 'tagNames'"
                  :prop="c.prop"
                  :label="c.label"
                  :min-width="c.minWidth"
                >
                  <template
                    slot-scope="scope"
                    v-if="scope.row.tagNames.length > 0"
                  >
                    <div
                      class="result-tag"
                      v-for="o in scope.row.tagNames.slice(0, 1)"
                      :key="o"
                    >
                      <is-show-tooltip
                        :content="o"
                        :refName="'tag'"
                      ></is-show-tooltip>
                    </div>
                    <el-popover
                      popper-class="dir-tm-popover"
                      style="
                        display: inline-block;
                        vertical-align: middle;
                        height: 24px;
                      "
                      v-show="scope.row.tagNames.length - 1 > 0"
                      placement="bottom-end"
                      title=""
                      width="490"
                      trigger="hover"
                      transition="fade-in-linear"
                      :visible-arrow="false"
                    >
                      <span slot="reference" style="cursor: pointer">
                        更多 {{ scope.row.tagNames.length - 1 }}
                        {{ scope.row.tagNames.length - 1 > 99 ? '+' : '' }}
                      </span>
                      <p
                        style="
                          margin-bottom: 8px;
                          overflow: hidden;
                          color: #20293b;
                          font-size: 12px;
                        "
                      >
                        标签：{{ scope.row.tagNames.length }}条
                      </p>
                      <el-tag
                        class="result-tag"
                        style="margin-bottom: 5px"
                        v-for="item in scope.row.tagNames"
                        :key="item"
                        size="normal"
                        effect="light"
                      >
                        <is-show-tooltip
                          class="tag-type"
                          :content="item"
                          :refName="'tag'"
                        ></is-show-tooltip>
                      </el-tag>
                    </el-popover>
                  </template>
                  <template v-else><span>null</span></template>
                </el-table-column>
                <el-table-column
                  v-else
                  :prop="c.prop"
                  :label="c.label"
                  :min-width="c.minWidth"
                  show-overflow-tooltip
                ></el-table-column>
              </template>
            </datablau-table>
          </div>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      style="width: 920px; display: flex; justify-content: space-between"
    >
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="assetPagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="assetPagination.pageSize"
        layout="total, sizes, prev, pager, next"
        :pager-count="5"
        class="page"
        :total="assetPagination.total"
      ></datablau-pagination>
      <div>
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
import addAssetsDialog from './addAssetsDialog.js'
export default addAssetsDialog
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.table-box {
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
}
/deep/ .el-dialog {
  .content-inner {
    height: 100%;
  }
}
/deep/ .datablau-pagination .el-pager li {
  padding: 0 2px;
}
.el-tag {
  height: 24px;
  line-height: 24px;
  border: none;
  margin: 3px 6px;
}
.assets-type-btn {
  background-color: transparent;
  color: #999;
  border-color: #ddd;

  &.table {
    border-radius: 2px 0 0 2px;
    &:hover {
      background-color: #fff;
      color: #409eff;
      border-color: #409eff;
    }
  }
  &.view {
    border-radius: 0 2px 2px 0;
    margin-left: 1px;
    &:hover {
      background-color: #fff;
      color: #409eff;
      border-color: #409eff;
    }
  }
  &.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
    &:hover {
      background-color: #409eff;
      color: #fff;
      border-color: #409eff;
    }
  }
}
.standard-type {
  display: inline-block;
  width: 50%;
  text-align: center;
  line-height: 32px;
  border: 1px solid #ddd;
  cursor: pointer;
  &.active {
    border-color: #409eff;
    color: #409eff;
  }
}
.asset-dir-tree {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  height: 100%;
  border-top-color: #ddd;
  overflow-y: auto;

  /deep/.el-divider--horizontal {
    margin: 4px 0;
  }
  /deep/.el-tree-node__content
    > .el-tree-node__expand-icon.el-icon-caret-right {
    margin-left: 0;
  }
}
.assets-box {
  box-sizing: content-box;
  .btn-box {
    display: inline-block;
    height: 34px;
    .btn-list {
      line-height: 34px;
      height: 34px;
      display: inline-block;
      width: 54px;
      text-align: center;
      border: 1px solid $border-color;
      border-radius: 2px 0px 0px 2px;
      position: relative;
      cursor: pointer;
      &:last-child {
        margin-left: -1px;
        border-radius: 0px 2px 2px 0px;
      }
      &.active {
        border: 1px solid $primary-color;
        z-index: 1;
        color: $primary-color;
      }
    }
  }
}
</style>

<style lang="scss">
.result-tag {
  display: inline-block;
  padding: 0 8px;
  margin-right: 4px;
  border-radius: 2px;
  width: 88px;
  height: 24px;
  line-height: 24px;
  box-sizing: border-box;
  background: transparentize(#409eff, 0.9);
  color: #409eff;
  text-align: center;
  vertical-align: middle;
  &:last-child {
    margin-right: 0;
  }
}
.dir-tm-popover {
  padding: 8px 16px;
  text-align: left;
  .el-popover__reference-wrapper {
    vertical-align: middle;
  }
  .result-tag {
    margin: 0;
    margin-right: 4px;
    &:nth-of-type(5n) {
      margin-right: 0;
    }
  }
}
.datablau-option {
  .table-option {
    text-align: center;
  }
}
</style>
