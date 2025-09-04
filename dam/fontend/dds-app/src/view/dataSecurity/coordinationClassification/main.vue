<template>
  <div class="data-asset-security-page" v-resize="domResize">
    <datablau-dialog
      class="jobs-sta"
      width="500px"
      :isTree="true"
      :title="$t('coordination.modifySecurityClass')"
      :visible.sync="showModifyClassificationDialog"
      v-if="showModifyClassificationDialog"
      append-to-body
      :height="400"
      :close-on-click-modal="false"
    >
      <classify-tree :clickChild="clickChild" :isDia="true"></classify-tree>
      <div slot="footer">
        <datablau-button type="secondary" @click="cancelChangeClassification">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-tooltip :disabled="canAdd" :content="cannotAddTooltip">
          <datablau-button
            type="normal"
            @click="changeClassification"
            :disabled="!canAdd"
            style="margin-left: 5px"
          >
            {{ $t('securityModule.sure') }}
          </datablau-button>
        </datablau-tooltip>
      </div>
    </datablau-dialog>
    <template v-if="listShow">
      <assets-upload
        ref="uploadAssets"
        :showImport="showImport"
        :click-child="clickChild"
        :close="cancelImportAssets"
        :structureId="treeStructure.id"
      ></assets-upload>
      <div class="page-head">
        <p class="title">{{ $t('coordination.title') }}</p>
        <datablau-button
          v-if="$auth.DATA_SECURITY_ASSET_IMPORT"
          style="float: right; line-height: 32px; margin-top: 6px"
          type="primary"
          class="iconfont icon-import"
          @click="importAssets"
        >
          {{ $t('coordination.importDataassets') }}
        </datablau-button>
      </div>
      <div class="page-filter">
        <div class="page-search">
          <div class="search-item">
            <el-select
              v-model="pageSearchParams.systemId"
              :placeholder="$t('securityModule.selBusSystem')"
              @change="handleSystemChange"
              class="item-value"
              filterable
              popper-class="coo-select"
            >
              <template slot="prefix">
                <span class="icon iconfont icon-xitong coo-icon"></span>
              </template>
              <el-option
                v-for="system in systemOptions"
                :key="system.categoryId"
                :label="system.categoryName"
                :value="system.categoryId"
                :title="system.categoryName"
              >
                <span class="icon iconfont icon-xitong option-icon"></span>
                <span style="margin-left: 5px">{{ system.categoryName }}</span>
              </el-option>
            </el-select>
          </div>
          <div class="search-item">
            <el-select
              v-model="pageSearchParams.datasourceId"
              :placeholder="$t('securityModule.selCollectName')"
              class="item-value"
              filterable
              popper-class="coo-select"
              @change="handleGatherChange"
            >
              <template slot="prefix">
                <span class="icon iconfont icon-shujuyuan coo-icon"></span>
              </template>
              <!-- <el-option value="" label="全部采集名称">
              <span class="icon iconfont icon-shujuyuan option-icon"></span>
              <span style="margin-left: 5px">全部采集名称</span>
            </el-option> -->
              <el-option
                v-for="source in gatherDataList"
                :key="source.modelId"
                :label="source.definition"
                :value="source.modelId"
                :title="source.definition"
              >
                <span class="icon iconfont icon-shujuyuan option-icon"></span>
                <span style="margin-left: 5px">{{ source.definition }}</span>
              </el-option>
            </el-select>
          </div>
          <div class="search-item" v-if="logicalModelNo === true">
            <!-- waitScan -->
            <el-select
              v-model="pageSearchParams.modelId"
              :placeholder="$t('securityModule.searchDataSource')"
              class="item-value"
              filterable
              popper-class="coo-select"
              @change="handleSourceChange"
            >
              <template slot="prefix">
                <span class="icon iconfont icon-shujuyuan coo-icon"></span>
              </template>
              <el-option value="" :label="$t('securityModule.allDataSource')">
                <span class="icon iconfont icon-shujuyuan option-icon"></span>
                <span style="margin-left: 5px">
                  {{ $t('securityModule.allDataSource') }}
                </span>
              </el-option>
              <el-option
                v-for="source in dataSourceOptions"
                :key="source.modelId"
                :label="source.definition"
                :title="source.definition"
                :value="source.modelId"
              >
                <span class="icon iconfont icon-shujuyuan option-icon"></span>
                <span style="margin-left: 5px">{{ source.definition }}</span>
              </el-option>
            </el-select>
          </div>
          <div class="search-item">
            <!-- <span class="item-label">schema</span> -->
            <el-select
              v-if="logicalModelNo === true"
              v-model="pageSearchParams.schemaName"
              :placeholder="$t('securityModule.selectSchema')"
              class="item-value"
              filterable
              popper-class="coo-select"
              @change="handleSchemaChange"
            >
              <template slot="prefix">
                <span class="icon iconfont icon-ownsee coo-icon"></span>
              </template>
              <!-- <el-option value="" label="全部schema">
              <span class="icon iconfont icon-ownsee option-icon"></span>
              <span style="margin-left: 5px">全部schema</span>
            </el-option> -->
              <el-option
                v-for="schema in schemaOptions"
                :key="schema"
                :label="schema"
                :title="schema"
                :value="schema"
              >
                <span class="icon iconfont icon-ownsee option-icon"></span>
                <span style="margin-left: 5px">{{ schema }}</span>
              </el-option>
            </el-select>
            <template
              v-if="
                (listStatus === 'updating' || listStatus === 'prepare') &&
                $auth.DATA_SECURITY_CATALOG_ELEMENT_MANAGE
              "
            >
              <span
                v-if="listStatus === 'updating'"
                style="margin-left: 4px; display: inline-block; width: auto"
              >
                <span style="margin-left: 5px; float: right">
                  {{ $t('coordination.updating') }}
                </span>
                <span class="icon">
                  <i class="iconfont icon-loading"></i>
                </span>
              </span>
              <el-popover
                v-else
                placement="right"
                width="160"
                v-model="scanVisible"
                style="margin-left: 10px"
              >
                <p
                  style="
                    font-size: 12px;
                    color: #555;
                    padding: 8px;
                    text-align: left;
                  "
                >
                  {{ $t('coordination.updateTip') }}
                </p>
                <div style="text-align: right; margin: 0 8px 0">
                  <datablau-button
                    type="strong"
                    size="mini"
                    @click="scanByModel"
                    style="
                      font-size: 12px;
                      padding: 3px 6px;
                      border: none;
                      line-height: 26px;
                      min-width: 0;
                    "
                  >
                    {{ $t('coordination.update') }}
                  </datablau-button>
                </div>
                <datablau-button slot="reference" type="icon">
                  <span
                    class="iconfont icon-banben"
                    style="cursor: pointer"
                  ></span>
                </datablau-button>
              </el-popover>
            </template>
          </div>
        </div>
        <div class="page-progress">
          <p class="title">
            {{ $t('coordination.assestsProgress') }}
            <datablau-tooltip
              effect="dark"
              :content="$t('coordination.progressTip')"
              placement="top"
            >
              <i class="iconfont icon-tips"></i>
            </datablau-tooltip>
          </p>
          <div style="width: 100%; margin-top: 2px">
            <p style="float: left; width: 180px" class="sub-title">
              <is-show-tooltip
                :content="currentDataPath"
                refName="currentDataPath"
              >
                {{ currentDataPath }}
              </is-show-tooltip>
            </p>
            <p style="float: right">
              <span style="font-size: 12px; font-weight: 500; color: #409eff">
                {{ formatNum(assetsTotal.NOT_COMB + assetsTotal.PUBLISH) }}
              </span>
              /
              <span style="font-size: 12px; font-weight: 500; color: #999">
                {{ getTotal(assetsTotal) }}
              </span>
            </p>
          </div>

          <datablau-tooltip
            class="item"
            effect="dark"
            :content="percent + '%'"
            placement="bottom"
            style="width: 100%"
          >
            <el-progress
              :percentage="percent"
              :show-text="false"
              :stroke-width="8"
              style="height: 8px; border-radius: 0; margin-top: 5px"
            ></el-progress>
          </datablau-tooltip>
          <p style="position: absolute; top: 7px; right: 16px">
            <span style="font-size: 20px; font-weight: 800; color: #555">
              {{ percent }}
            </span>
            <span style="font-size: 12px; font-weight: 800; color: #555">
              %
            </span>
          </p>
        </div>
      </div>
      <div
        class="asset-box"
        :style="{
          right: cardingStatus === 'NOT_COMB' ? '0' : '306px',
        }"
      >
        <datablau-tabs v-model="cardingStatus" @tab-click="handleClick">
          <el-tab-pane name="UN_COMB">
            <span slot="label">
              <el-badge :is-dot="dotTab.UN_COMB" class="item">
                {{ $t('coordination.unComb') }}({{ assetsTotal.UN_COMB }})
              </el-badge>
            </span>
          </el-tab-pane>
          <el-tab-pane name="UN_CONFIRMED">
            <span slot="label">
              <el-badge :is-dot="dotTab.UN_CONFIRMED" class="item">
                {{ $t('coordination.confirmed') }}({{
                  assetsTotal.UN_CONFIRMED
                }})
              </el-badge>
            </span>
          </el-tab-pane>
          <el-tab-pane name="PUBLISH">
            <span slot="label">
              <el-badge :is-dot="dotTab.PUBLISH" class="item">
                {{ $t('coordination.publish') }}({{ assetsTotal.PUBLISH }})
              </el-badge>
            </span>
          </el-tab-pane>
          <el-tab-pane name="NOT_COMB">
            <span slot="label">
              <el-badge :is-dot="dotTab.NOT_COMB" class="item">
                {{ $t('coordination.notComb') }}({{ assetsTotal.NOT_COMB }})
              </el-badge>
            </span>
          </el-tab-pane>
          <el-tab-pane name="tab-tips" disabled>
            <span slot="label">
              <datablau-tooltip :content="tabTips" :disabled="!tabTips.length">
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>
            </span>
          </el-tab-pane>
        </datablau-tabs>
        <div class="tab-search-box" ref="searchBox">
          <datablau-button
            v-if="$auth.DATA_SECURITY_ASSET_EXPORT"
            type="normal"
            style="float: right; margin-left: 10px"
            @click="handleFun(3)"
            :disabled="exportBtnDisabled"
            class="iconfont icon-export"
          >
            {{ $t('securityModule.export') }}
          </datablau-button>
          <datablau-input
            v-model="assetKeywords"
            @keyup.native.enter="handleSearch"
            :iconfont-state="true"
            :placeholder="$t('coordination.searchName')"
            clearable
            style="float: right; width: 200px"
          ></datablau-input>
          <div class="types-selector">
            <span style="margin-right: 8px">资产类型</span>
            <datablau-select
              multiple
              v-model="selAssetsList"
              @change="handleTypeChange"
              style="width: 138px; display: inline-block"
            >
              <el-option
                v-for="item in assetsTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
            <!-- <el-dropdown :hide-on-click="false" trigger="click">
              <span
                class="el-dropdown-link"
                :class="{
                  all: typesNameStr === $t('coordination.allAssetsType'),
                }"
              >
                {{ typesNameStr }}
                <i
                  class="el-icon-arrow-down el-icon--right"
                  style="float: right; line-height: 30px; margin-left: 0"
                ></i>
              </span>
              <el-dropdown-menu
                slot="dropdown"
                style="margin-top: 0; padding-top: 5px; padding-bottom: 7px"
              >
                <el-dropdown-item
                  v-for="item in assetsTypeList"
                  :key="item.value"
                  style="line-height: 30px; padding: 0 10px"
                >
                  <el-checkbox v-model="item.selected">
                    <span
                      class="iconfont"
                      :class="'icon-' + typeIconMap[item.value]"
                      style="font-size: 14px; vertical-align: middle"
                    ></span>
                    <span style="margin-left: 5px; vertical-align: middle">
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
          </div>
        </div>
        <div class="content-box">
          <datablau-form-submit>
            <datablau-table
              :key="cardingStatus"
              v-loading="loading"
              :loading="loading"
              :data="assetList"
              height="100%"
              :data-selectable="false"
              :show-column-selection="false"
              :default-sort="defaultSort"
              ref="assetTable"
              :reserve-selection="true"
              :row-key="getAssetRowKeys"
              @selection-change="handleSelectChange"
              @sort-change="sortChange"
            >
              <el-table-column
                :reserve-selection="true"
                v-if="
                  $auth.DATA_SECURITY_CATALOG_ELEMENT_MANAGE ||
                  $auth.DATA_SECURITY_ASSET_EXPORT
                "
                :width="22"
                type="selection"
                :selectable="() => listStatus !== 'updating'"
              ></el-table-column>
              <el-table-column :width="30" prop="type" label="">
                <template slot-scope="scope">
                  <datablau-icon
                    :data-type="'logicaltable'"
                    v-if="scope.row.logical && scope.row.type === 80000004"
                    :size="19"
                  ></datablau-icon>
                  <datablau-icon
                    :data-type="'logicalcolumn'"
                    v-else-if="scope.row.logical && scope.row.type === 80000005"
                    :size="19"
                  ></datablau-icon>
                  <span
                    v-else
                    class="iconfont"
                    :class="'icon-' + typeIconMap[scope.row.type]"
                    style="font-size: 20px; vertical-align: middle"
                  ></span>
                </template>
              </el-table-column>
              <el-table-column
                :min-width="120"
                prop="assetName"
                :label="$t('coordination.dataAssetsName')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="150"
                prop="tableName"
                :label="$t('coordination.inTable')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="datasourceName"
                :label="$t('securityModule.collectName')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="modelName"
                :label="$t('securityModule.datasource')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="schemaName"
                label="schema"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                v-if="
                  cardingStatus === 'UN_CONFIRMED' ||
                  cardingStatus === 'PUBLISH'
                "
                :min-width="150"
                prop="catalogName"
                :label="$t('securityModule.inSecurityClassify')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                v-if="
                  cardingStatus === 'UN_CONFIRMED' ||
                  cardingStatus === 'PUBLISH'
                "
                :min-width="150"
                prop="securityName"
                :label="$t('securityModule.securityLevel')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="80"
                prop="status"
                :label="$t('coordination.combStatus')"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span :class="scope.row.status">
                    {{ combStatusMap[scope.row.status] }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="cardingStatus === 'UN_COMB'"
                :min-width="150"
                prop="createTime"
                :label="$t('securityModule.creationTime')"
                sortable="custom"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ $timeFormatter(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column
                v-if="
                  cardingStatus === 'UN_CONFIRMED' ||
                  cardingStatus === 'NOT_COMB'
                "
                :min-width="150"
                prop="combTime"
                :label="$t('coordination.combTime')"
                show-overflow-tooltip
                sortable="custom"
              >
                <template slot-scope="scope">
                  {{
                    $timeFormatter(
                      scope.row.createTime || scope.row.publishTime
                    )
                  }}
                </template>
              </el-table-column>
              <el-table-column
                v-if="cardingStatus === 'PUBLISH'"
                :min-width="150"
                prop="publishTime"
                :label="$t('coordination.publishTime')"
                show-overflow-tooltip
                sortable="custom"
              >
                <template slot-scope="scope">
                  {{ $timeFormatter(scope.row.publishTime) }}
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('securityModule.operate')"
                :width="60"
                align="center"
                fixed="right"
                prop="operation"
              >
                <template slot-scope="scope">
                  <datablau-button
                    type="icon"
                    :tooltip-content="$t('securityModule.view')"
                    class="iconfont icon-see"
                    @click="toCheckAssetDetails(scope.row)"
                  ></datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <div class="bottom">
                <template v-if="$auth.DATA_SECURITY_CATALOG_ELEMENT_MANAGE">
                  <btn-tip :num="selectedList.length"></btn-tip>
                  <template
                    v-if="
                      cardingStatus === 'UN_COMB' &&
                      selectedUncombList.length > 0
                    "
                  >
                    <datablau-button
                      type="normal"
                      @click="handleFun(2)"
                      style="margin-left: 8px"
                    >
                      {{ $t('coordination.notComb') }}
                    </datablau-button>
                  </template>
                  <template
                    v-if="
                      cardingStatus === 'UN_CONFIRMED' &&
                      selectedUnreviewList.length > 0
                    "
                  >
                    <datablau-button
                      type="normal"
                      @click="handleFun(4)"
                      style="margin-left: 8px"
                    >
                      {{ $t('coordination.submitReview') }}
                    </datablau-button>
                    <el-divider direction="vertical"></el-divider>
                    <datablau-button type="normal" @click="handleFun(5)">
                      {{ $t('coordination.editSecurityClass') }}
                    </datablau-button>
                    <span
                      direction="vertical"
                      style="width: 12px; display: inline-block"
                    ></span>
                    <el-popover
                      placement="top"
                      v-model="showSecurityPopover"
                      width="280px"
                    >
                      <div style="padding: 8px 6px">
                        <datablau-select
                          v-model="currentSecurityLevel"
                          style="width: 150px; float: left"
                        >
                          <el-option
                            v-for="level in securityOptions"
                            :key="level.tagId"
                            :value="level.tagId"
                            :label="level.name"
                          ></el-option>
                        </datablau-select>
                        <datablau-button
                          type="text"
                          @click="showSecurityPopover = false"
                          style="margin-left: 5px"
                        >
                          {{ $t('securityModule.cancel') }}
                        </datablau-button>
                        <datablau-button
                          type="strong"
                          @click="changeAssetSecurityLevel"
                          style="
                            border: none;
                            padding: 0 10px;
                            min-width: 0;
                            margin-left: 5px;
                          "
                        >
                          {{ $t('securityModule.sure') }}
                        </datablau-button>
                      </div>

                      <datablau-button slot="reference" type="normal">
                        {{ $t('securityModule.editSecurityLevel') }}
                      </datablau-button>
                    </el-popover>
                    <span
                      direction="vertical"
                      style="width: 12px; display: inline-block"
                    ></span>
                    <datablau-button type="normal" @click="handleFun(7)">
                      {{ $t('coordination.reComb') }}
                    </datablau-button>
                  </template>
                  <template
                    v-if="
                      cardingStatus === 'PUBLISH' &&
                      selectedPublishList.length > 0
                    "
                  >
                    <datablau-button
                      type="normal"
                      @click="handleFun(7)"
                      style="margin-left: 8px"
                    >
                      {{ $t('coordination.reComb') }}
                    </datablau-button>
                  </template>
                  <template
                    v-if="
                      cardingStatus === 'NOT_COMB' &&
                      selectedNotcombList.length > 0
                    "
                  >
                    <datablau-button
                      type="normal"
                      @click="handleFun(7)"
                      style="margin-left: 8px"
                    >
                      {{ $t('coordination.reComb') }}
                    </datablau-button>
                  </template>
                </template>

                <div class="page">
                  <span v-if="listStatus === 'updating'" class="page-scaning">
                    <span class="icon">
                      <i class="iconfont icon-loading"></i>
                    </span>
                    <span style="margin-left: 25px">
                      {{ $t('coordination.updating') }}
                    </span>
                  </span>
                  <datablau-pagination
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                    :current-page.sync="form.page"
                    :page-sizes="[20, 50, 100, 200]"
                    :pager-count="5"
                    :page-size="form.size"
                    :layout="
                      listStatus === 'updating'
                        ? 'sizes, prev, pager, next, jumper'
                        : 'total, sizes, prev, pager, next, jumper'
                    "
                    :total="total"
                    :loading="listStatus === 'updating'"
                  ></datablau-pagination>
                </div>
              </div>
            </template>
          </datablau-form-submit>
        </div>
      </div>
      <div v-if="cardingStatus !== 'NOT_COMB'" class="tree-box">
        <datablau-detail-subtitle
          style="margin-left: 10px"
          :title="$t('securityModule.dataClassify')"
          mt="10px"
          mb="10px"
        ></datablau-detail-subtitle>
        <el-popover
          popper-class="assets-type-popover"
          placement="right"
          width="224"
          trigger="hover"
        >
          <span slot="reference" class="suport-tip">
            <i class="iconfont icon-tips"></i>
            <span>{{ $t('coordination.catalogSupType') }}</span>
          </span>
          <div class="assets-type-content">
            <div class="pop-head">目录支持数据资产类型</div>
            <div class="table-box">
              <div
                class="table-list"
                v-for="item in supportList"
                :key="item.id"
              >
                <div class="name">{{ item.name }}</div>
                <div class="list-cell" :class="{ 'list-cell-spe': item.type }">
                  {{ item.type ? item.type : $t('coordination.canNotAdd') }}
                </div>
              </div>
            </div>
          </div>
        </el-popover>
        <div class="tree-content">
          <classify-tree
            :selectedUncombList="selectedUncombList"
            ref="classifyTree"
            :coordinate="true"
            :clickChild="clickChild"
            :isAdd="cardingStatus === 'UN_COMB'"
            :hasAll="
              cardingStatus === 'UN_CONFIRMED' || cardingStatus === 'PUBLISH'
            "
          ></classify-tree>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.suport-tip {
  height: 21px;
  cursor: pointer;
  vertical-align: middle;
  margin-left: 4px;
  display: inline-block;
  &:hover {
    i,
    span {
      color: #409eff;
    }
  }
  i {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    margin-right: 4px;
  }
  span {
    vertical-align: top;
  }
}
.assets-type-content {
  .pop-head {
    height: 16px;
    line-height: 16px;
    font-size: 14px;
    color: #555555;
    font-weight: Medium;
  }
  .table-box {
    margin-top: 8px;
    border: 1px solid #efefef;
    .table-list {
      height: 24px;
      line-height: 24px;
      border-bottom: 1px solid #efefef;
      &:after {
        content: '';
        display: block;
        clear: both;
      }
      .name {
        width: 48px;
        border-right: 1px solid #efefef;
        float: left;
        text-align: center;
        font-size: 12px;
      }
      .list-cell {
        float: left;
        padding-left: 8px;
        color: #b0b0b0;
        font-size: 12px;
        &.list-cell-spe {
          color: #555555;
        }
      }
    }
  }
}
.dialog-tree-box {
  position: absolute;
  top: 42px;
  bottom: 0;
  left: 20px;
  right: 20px;
  overflow-y: auto;
}
.data-asset-security-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  padding: 0 16px;
  .page-head,
  .page-filter {
    width: 100%;
  }
  .page-head {
    min-width: 900px;
    height: 44px;
    vertical-align: middle;
    .title {
      float: left;
      font-size: 16px;
      color: #555;
      font-weight: 600;
      line-height: 44px;
    }
  }
  .page-filter {
    min-width: 950px;
    background-color: #f7f8fc;
    border-radius: 4px;
    height: 80px;
    margin-bottom: 10px;
    .page-search {
      float: left;
      min-width: 580px;
      height: 80px;
      padding: 20px 0 20px 16px;
      .search-item {
        float: left;
        margin-right: 10px;
        line-height: 40px;
        width: 175px;
        &:last-child {
          width: 280px;
          /deep/ .el-select {
            width: 190px;
          }
        }
        .item-label {
          margin-right: 10px;
        }
        .item-value {
          display: inline-block;
          .coo-icon {
            font-size: 21px;
            color: #409eff;
          }
          /deep/.el-input__inner {
            height: 40px;
            line-height: 40px;
            padding-left: 40px;
          }
        }
        .waitScan {
          /deep/.el-input__inner {
            border-color: #409eff;
            color: #409eff;
          }
        }
        .scaning {
          margin-left: 10px;
          position: relative;
          color: #409eff;
          .icon {
            position: relative;
            width: 30px;
            height: 30px;
            margin-top: 5px;
            float: right;
            background-color: rgba(64, 158, 255, 0.1);
          }
          i {
            animation: loading-rotate 2s linear infinite;
            font-size: 20px;
            position: absolute;
            left: 5px;
            top: 5px;
          }
        }
        /deep/.is-block.icon {
          height: 30px;
          width: 30px;
        }
      }
      /deep/.el-input__prefix {
        line-height: 46px;
        left: 10px;
      }
    }
    .page-progress {
      position: relative;
      padding: 13px 16px 16px 16px;
      width: 310px;
      float: right;
      .title {
        font-size: 14px;
        color: #555;
        line-height: 20px;
        font-weight: 500;
      }
      .sub-title {
        font-size: 12px;
        color: #999;
        line-height: 17px;
      }
      /deep/.el-progress-bar__inner {
        border-radius: 0;
      }
      /deep/ .el-progress-bar__outer {
        border-radius: 0;
      }
    }
  }

  .resize-column-middle {
    left: 240px;
    top: 60px;
    background-color: transparent;
    width: 10px;
    z-index: 8;
  }
  .asset-box {
    position: absolute;
    top: 132px;
    bottom: 0;
    right: 450px;
    left: 0;
    padding: 10px 0;
    min-width: 870px;
    min-width: 820px;
    /deep/ .datablau-tabs {
      padding-left: 20px;
    }

    /deep/ .datablau-list-search {
      .datablau-form-box {
        .list-search-box {
          .el-form-item {
            .el-form-item__content {
              min-width: 120px;
            }
          }
        }
      }
    }
    /deep/ .datablau-tabs {
      .el-tabs__content {
        height: 0;
      }
      .el-tabs .el-tabs__nav-wrap:after {
        height: 0;
      }
      #tab-tab-tips {
        float: right;
        margin-top: 2px;
      }
    }
    /deep/ .el-badge__content.is-fixed {
      top: 10px;
    }
    .content-box {
      position: absolute;
      top: 55px;
      left: 0px;
      right: 0px;
      bottom: 0;
      /deep/ .datablau-list-search {
        // padding: 0 20px;
      }
      .bottom {
        .page {
          float: right;
          .page-scaning {
            margin-left: 10px;
            position: relative;
            line-height: 30px;
            float: left;
            margin-right: 10px;
            .icon {
              position: relative;
            }
            i {
              animation: loading-rotate 2s linear infinite;
              font-size: 20px;
              position: absolute;
              left: 0;
              top: 0;
            }
          }
        }
      }
      /deep/.row-buttons {
        padding: 8px 10px 8px 20px;
      }
    }
    .tab-search-box {
      width: 700px;
      position: absolute;
      right: 0;
      top: 12px;
      padding-right: 20px;
      .types-selector {
        position: relative;
        float: right;
        // width: 120px;
        line-height: 30px;
        margin-right: 10px;
        /deep/.el-dropdown {
          font-size: 12px;
        }

        .el-dropdown-link {
          display: inline-block;
          width: 104px;
          cursor: pointer;
          padding-left: 8px;
          padding-right: 8px;
          background-color: #f5f5f5;
          &.all {
            background-color: transparent;
          }
          &:hover {
            background-color: #efefef;
            &.all {
              background-color: transparent;
            }
          }
        }
      }
      .order-selector {
        float: right;
        width: 100px;
        line-height: 30px;
        margin-right: 10px;
      }
      /deep/.selector .el-input__inner {
        border: none;
      }
    }
  }
  .relation-box {
    position: absolute;
    right: 260px;
    width: 145px;
    top: 132px;
    bottom: 0;
    text-align: center;
    padding-top: 30vh;
    padding-left: 6px;
    padding-right: 6px;
  }
  .tree-box {
    position: absolute;
    right: 16px;
    width: 290px;
    top: 142px;
    bottom: 0px;
    border-left: 1px solid var(--border-color-lighter);
    // border: 1px solid #efefef;
    box-sizing: border-box;
    .tree-catalog {
      height: 44px;
      line-height: 24px;
      padding: 10px;
      font-size: 14px;
      font-weight: 600;
    }
    .tree-content {
      position: absolute;
      bottom: 0px;
      top: 38px;
      left: 0;
      right: 0;
      // overflow-y: auto;
      /deep/ .el-tree {
        position: absolute;
        bottom: 0px;
        top: 0;
        left: 0;
        right: 0;
      }
    }
    .tree-bottom {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 52px;
      background: #fff;

      .export-assets {
        position: absolute;
        right: 65px;
        top: 10px;
        width: 94px;
        height: 32px;
        line-height: 30px;
        border: 1px solid $primary-color;
        text-align: center;
        color: $primary-color;
        border-radius: 2px;
        cursor: pointer;
      }
    }
  }
  @keyframes loading-rotate {
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>

<style lang="scss">
.assets-type-popover {
  padding: 16px !important;
}
.coo-select {
  max-width: 320px;
  .option-icon {
    font-size: 16px;
    color: #409eff;
  }
}
</style>
