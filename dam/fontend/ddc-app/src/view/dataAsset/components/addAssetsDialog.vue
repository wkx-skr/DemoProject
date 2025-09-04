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
    <div style="width: 100%; height: 400px">
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
            $t('assets.addAssets.selectedTips', {
              num: selectedAssets.length,
            })
          }}
        </span>
      </div>
      <div
        class="add-assets-body"
        style="width: 100%; height: 100%; overflow: auto; position: relative"
      >
        <div v-if="!noTreeList.includes(type)" class="assets-directory-tree">
          <div
            v-if="type === AssetsTypeEnum.INDEX && metric"
            style="height: 31px; width: 100%"
          >
            <datablau-tabs
              v-model="tabPosition"
              @tab-click="handleClick"
              type="card"
              class="indexTab"
            >
              <el-tab-pane
                label="原子/衍生指标"
                name="derivative"
              ></el-tab-pane>
              <el-tab-pane label="派生指标" name="derived"></el-tab-pane>
            </datablau-tabs>
          </div>
          <div
            class="asset-dir-tree"
            :style="{
              height:
                type === AssetsTypeEnum.INDEX && metric ? '360px' : '100%',
            }"
          >
            <datablau-input
              :placeholder="$t('assets.addAssets.name')"
              v-model="catalogueKey"
              :iconfont-state="true"
              style="width: 100%"
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
                {{ $t('assets.addAssets.allReport') }}
              </datablau-button>
              <el-divider></el-divider>
            </div>
            <datablau-easy-tree
              class="grey-tree data-asset-tree"
              ref="directoryTree"
              :default-expand-all="false"
              auto-expand-parent
              v-loading="treeLoading"
              @node-click="queryAssetsByDir"
              node-key="treeId"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              :props="defaultProps"
              :default-expanded-keys="expandedKeys"
              :data-icon-function="dataIconFunction"
              :data="treeData"
              :showOverflowTooltip="true"
              :itemSize="34"
              keyField="id"
              :height="
                type === AssetsTypeEnum.REPORT ||
                (this.type === AssetsTypeEnum.INDEX && this.metric)
                  ? '300px'
                  : '340px'
              "
              :style="{
                height:
                  type === AssetsTypeEnum.REPORT ||
                  (this.type === AssetsTypeEnum.INDEX && this.metric)
                    ? '300px'
                    : '340px',
              }"
              style="margin-top: 5px; width: 100%"
              :emptyText="treeLoading ? '' : $t('assets.addAssets.noData')"
            ></datablau-easy-tree>
          </div>
        </div>
        <div class="resize-middle" style=""></div>
        <div
          class="assets-box"
          :style="{
            width: type === AssetsTypeEnum.DATA_OBJECT ? '' : '700px',
            left: type === AssetsTypeEnum.DATA_OBJECT ? '0' : '200px',
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
                :placeholder="$t('assets.addAssets.searchKeywords')"
                v-model="assetsKeyword"
              ></datablau-input>
              <datablau-select
                style="width: 200px; display: inline-block; margin-left: 20px"
                v-model="modelId"
                v-selectLazyLoad="modelloading"
                filterable
                clearable
                @change="modelIdChange"
                :placeholder="$t('assets.addAssets.collectionName')"
              >
                <el-option
                  v-for="item in allFromreList"
                  :key="item.treeId"
                  :label="item.databaseDisplayName"
                  :value="item.treeId"
                ></el-option>
              </datablau-select>
              <datablau-button
                type="normal"
                style="margin-left: 10px"
                @click="qureyAssets"
              >
                {{ $t('common.button.query') }}
              </datablau-button>
            </span>
          </div>

          <div
            v-if="type === AssetsTypeEnum.META_MODEL"
            style="width: 100%; height: 40px"
          >
            <span>
              <datablau-input
                style="width: 140px; display: inline-block"
                clearable
                :iconfont-state="true"
                :placeholder="$t('assets.addAssets.searchKeywords')"
                v-model="assetsKeyword"
              ></datablau-input>
              <datablau-select
                style="width: 140px; display: inline-block; margin-left: 20px"
                v-model="modelId"
                v-selectLazyLoad="modelloading"
                filterable
                clearable
                @change="modelIdChangeMeta"
                :placeholder="$t('assets.addAssets.collectionName')"
              >
                <el-option
                  v-for="item in allFromreList"
                  :key="item.treeId"
                  :label="item.databaseDisplayName"
                  :value="item.treeId"
                ></el-option>
              </datablau-select>
              <!--元模型 类型-->
              <datablau-select
                style="width: 140px; display: inline-block; margin-left: 20px"
                v-model="metaModelId"
                v-selectLazyLoad="modelloading"
                filterable
                clearable
                placeholder="资产类型"
              >
                <el-option
                  v-for="item in metaModelTypesArr"
                  :key="item.assetKey"
                  :label="item.name"
                  :value="item.assetKey"
                ></el-option>
              </datablau-select>
              <datablau-button
                type="normal"
                style="margin-left: 10px"
                @click="qureyAssets"
              >
                {{ $t('common.button.query') }}
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
              :placeholder="$t('assets.addAssets.searchKeywords')"
              v-model="assetsKeyword"
            ></datablau-input>
            <datablau-select
              style="width: 200px; display: inline-block; margin-left: 20px"
              v-model="modelId"
              filterable
              clearable
              :placeholder="$t('assets.addAssets.sourceName')"
              v-selectLazyLoad="modelloading"
            >
              <el-option
                v-for="item in allFromreList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
              <el-option v-if="modelLoadings" value="" class="table-option">
                {{ $t('assets.addAssets.loading') }}
              </el-option>
            </datablau-select>
            <div style="display: inline-block; margin-left: 20px">
              <label
                for="dataTable"
                style="display: inline-block; margin-right: 6px"
              >
                {{ $t('assets.addAssets.dataSheet') }}
              </label>
              <datablau-select
                ref="tableSelect"
                id="dataTable"
                filterable
                clearable
                remote
                v-model="tableName"
                v-selectLazyLoad="lazyloading"
                :remote-method="tableSelect"
                :automatic-dropdown="true"
                @focus="tableSelect('')"
                style="display: inline-block; width: 200px"
              >
                <el-option
                  v-for="(table, index) in tableOptions"
                  :key="table.objectId + '' + index"
                  :label="table.physicalName"
                  :value="table.objectId"
                ></el-option>
                <el-option
                  v-if="!selectTableLoading && tableOptions.length === 0"
                  :value="undefined"
                  disabled
                >
                  <div style="text-align: center">无数据</div>
                </el-option>
                <el-option
                  v-if="selectTableLoading"
                  value=""
                  class="table-option"
                >
                  {{ $t('assets.addAssets.loading') }}
                </el-option>
              </datablau-select>
            </div>
            <datablau-button
              type="normal"
              style="margin-left: 20px"
              @click="qureyAssets"
            >
              {{ $t('common.button.query') }}
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
              :placeholder="$t('assets.addAssets.searchStandard')"
              v-model="assetsKeyword"
            ></datablau-input>
            <datablau-input
              v-if="type === AssetsTypeEnum.DATA_STANDARD"
              clearable
              :placeholder="$t('assets.addAssets.department')"
              v-model="departmentFullName"
              @focus="selectDepartment"
              style="width: 180px; margin-left: 20px"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureyAssets"
              style="margin-left: 20px"
            >
              {{ $t('common.button.query') }}
            </datablau-button>
          </div>
          <div v-if="type === AssetsTypeEnum.INDEX" style="height: 40px">
            <datablau-input
              :placeholder="$t('assets.addAssets.searchIndex')"
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
              {{ $t('common.button.query') }}
            </datablau-button>
          </div>
          <div v-if="type === AssetsTypeEnum.REPORT" style="height: 40px">
            <datablau-input
              :placeholder="$t('assets.addAssets.reportNumber')"
              v-model="reportKeyword"
              style="width: 240px"
              clearable
            >
              <i
                class="el-icon-search el-input__icon"
                slot="prefix"
                style="font-size: 14px"
              ></i>
            </datablau-input>
            <datablau-select
              v-model="reportType"
              style="display: inline-block; margin-left: 20px"
            >
              <el-option
                v-for="t in appTypes"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              ></el-option>
            </datablau-select>

            <datablau-button
              type="normal"
              @click="queryReportAssets"
              style="margin-left: 10px"
            >
              {{ $t('common.button.query') }}
            </datablau-button>
          </div>
          <div
            v-if="type === AssetsTypeEnum.FILE"
            style="width: 100%; height: 40px"
          >
            <datablau-input
              :placeholder="$t('assets.addAssets.searchFile')"
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
              {{ $t('common.button.query') }}
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
                  :key="c.prop"
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
                        {{ $t('assets.addAssets.more') }}
                        {{ scope.row.tagNames.length - 1 }}
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
                        {{
                          $t('assets.addAssets.tagText', {
                            num: scope.row.tagNames.length,
                          })
                        }}
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
                  :key="c.prop"
                  :prop="c.prop"
                  :label="c.label"
                  :min-width="c.minWidth"
                  show-overflow-tooltip
                  :formatter="c.prop === 'creationTime' ? $timeFormatter : null"
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
        :page-sizes="sizesList"
        :page-size="assetPagination.pageSize"
        layout="total, sizes, prev, jumper, next"
        :pager-count="5"
        class="page"
        :total="assetPagination.total"
      ></datablau-pagination>
      <div>
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="submitAssets">
          {{ $t('common.button.registry') }}
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
/deep/.vue-recycle-scroller__item-wrapper {
  overflow: unset;
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
  // border-right-color: transparent;
  // overflow-y: auto;
  padding-right: 5px;
  padding-bottom: 5px;

  /deep/.el-divider--horizontal {
    margin: 4px 0;
  }
  /deep/.el-tree-node__content
    > .el-tree-node__expand-icon.el-icon-caret-right {
    margin-left: 0;
  }
}
.assets-directory-tree {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px;
  height: 400px;
  width: 200px;
}

.resize-middle {
  position: absolute;
  left: 200px;
  top: 0;
  height: 400px;
  background-color: transparent;
  width: 10px;
  z-index: 99999999999;
  cursor: e-resize;
}
.assets-box {
  position: absolute;
  right: 0;
  top: 0;
  left: 200px;
  box-sizing: content-box;
  padding: 0 10px;
  height: 100%;
  min-width: 540px;
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
.datablau-tabs.indexTab.datablau-tabs-card
  .el-tabs.el-tabs--card
  .el-tabs__header
  .el-tabs__nav
  .el-tabs__item {
  width: 100px;
  text-align: center;
}
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
  max-width: 560px;
  .table-option {
    text-align: center;
  }
}
</style>
