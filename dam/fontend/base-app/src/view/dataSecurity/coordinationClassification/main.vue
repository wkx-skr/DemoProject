<template>
  <div class="data-asset-security-page" v-resize="domResize">
    <datablau-dialog
      class="jobs-sta"
      width="500px"
      title="修改安全分类"
      :visible.sync="showModifyClassificationDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div style="min-height: 400px">
        <datablau-tree
          @node-click="handleNodeClick"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          :data-supervise="false"
          :data-icon-function="dataIconFunction"
          :expand-on-click-node="false"
          ref="changeTree"
          lazy
          :load="loadTreeData"
          :filter-node-method="filterNode"
          :use-default-sort="false"
          show-overflow-tooltip
        ></datablau-tree>
      </div>

      <div slot="footer">
        <datablau-button type="secondary" @click="cancelChangeClassification">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-tooltip :disabled="canAdd" :content="cannotAddTooltip">
          <datablau-button
            type="normal"
            @click="changeClassification"
            :disabled="!canAdd"
            style="margin-left: 5px"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </datablau-tooltip>
      </div>
    </datablau-dialog>
    <assets-upload
      ref="uploadAssets"
      :showImport="showImport"
      :click-child="clickChild"
      :close="cancelImportAssets"
      :structureId="treeStructure.id"
    ></assets-upload>
    <div class="page-head">
      <p class="title">分类分级工作台</p>
      <datablau-button
        v-if="$auth.DATA_SECURITY_ASSET_IMPORT"
        style="float: right; line-height: 32px; margin-top: 6px"
        type="primary"
        class="iconfont icon-tianjia"
        @click="importAssets"
      >
        导入数据资产
      </datablau-button>
    </div>
    <div class="page-filter">
      <div class="page-search">
        <div class="search-item">
          <!-- <span class="item-label">业务系统</span> -->
          <el-select
            v-model="pageSearchParams.systemId"
            placeholder="请选择业务系统"
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
            >
              <span class="icon iconfont icon-xitong option-icon"></span>
              <span style="margin-left: 5px">{{ system.categoryName }}</span>
            </el-option>
          </el-select>
        </div>
        <div class="search-item">
          <!-- <span class="item-label">数据源</span> -->
          <el-select
            v-model="pageSearchParams.modelId"
            placeholder="请选择数据源"
            class="item-value"
            :class="{
              waitScan: scanAgain,
            }"
            filterable
            popper-class="coo-select"
            @change="handleSourceChange"
          >
            <template slot="prefix">
              <span class="icon iconfont icon-shujuyuan coo-icon"></span>
            </template>
            <el-option value="" label="全部数据源">
              <span class="icon iconfont icon-shujuyuan option-icon"></span>
              <span style="margin-left: 5px">全部数据源</span>
            </el-option>
            <el-option
              v-for="source in dataSourceOptions"
              :key="source.modelId"
              :label="source.definition"
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
            v-model="pageSearchParams.schemaName"
            placeholder="请选择schema"
            class="item-value"
            filterable
            popper-class="coo-select"
            @change="handleSchemaChange"
          >
            <template slot="prefix">
              <span class="icon iconfont icon-ownsee coo-icon"></span>
            </template>
            <el-option value="" label="全部schema">
              <span class="icon iconfont icon-ownsee option-icon"></span>
              <span style="margin-left: 5px">全部schema</span>
            </el-option>
            <el-option
              v-for="schema in schemaOptions"
              :key="schema"
              :label="schema"
              :value="schema"
            >
              <span class="icon iconfont icon-ownsee option-icon"></span>
              <span style="margin-left: 5px">{{ schema }}</span>
            </el-option>
          </el-select>
          <template v-if="scanAgain">
            <span v-if="scaning" class="scaning">
              <span style="margin-left: 5px; float: right">正在更新...</span>
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
                当前数据源有新版本，是否更新数据？
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
                  更新
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
          资产梳理进度
          <datablau-tooltip
            effect="dark"
            :content="`(暂不梳理的数据资产+已发布的数据资产）/ 总数据资产  *100%`"
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
              {{
                formatNum(
                  assetsTotal.UN_COMB +
                    assetsTotal.UN_CONFIRMED +
                    assetsTotal.PUBLISH +
                    assetsTotal.NOT_COMB
                )
              }}
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
          <span style="font-size: 12px; font-weight: 800; color: #555">%</span>
        </p>
      </div>
    </div>
    <div
      class="asset-box"
      :style="{
        right:
          cardingStatus === 'UN_COMB'
            ? '420px'
            : cardingStatus === 'NOT_COMB'
            ? '0'
            : '256px',
      }"
    >
      <datablau-tabs v-model="cardingStatus" @tab-click="handleClick">
        <el-tab-pane name="UN_COMB">
          <span slot="label">
            <el-badge :is-dot="dotTab.UN_COMB" class="item">
              待梳理({{ assetsTotal.UN_COMB }})
            </el-badge>
          </span>
        </el-tab-pane>
        <el-tab-pane name="UN_CONFIRMED">
          <span slot="label">
            <el-badge :is-dot="dotTab.UN_CONFIRMED" class="item">
              待确认({{ assetsTotal.UN_CONFIRMED }})
            </el-badge>
          </span>
        </el-tab-pane>
        <el-tab-pane name="PUBLISH">
          <span slot="label">
            <el-badge :is-dot="dotTab.PUBLISH" class="item">
              已发布({{ assetsTotal.PUBLISH }})
            </el-badge>
          </span>
        </el-tab-pane>
        <el-tab-pane name="NOT_COMB">
          <span slot="label">
            <el-badge :is-dot="dotTab.NOT_COMB" class="item">
              暂不梳理({{ assetsTotal.NOT_COMB }})
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
          type="primary"
          style="float: right; margin-left: 10px"
          @click="handleFun(3)"
          :disabled="exportBtnDisabled"
        >
          导出
        </datablau-button>
        <datablau-input
          v-model="assetKeywords"
          :iconfont-state="true"
          placeholder="搜索数据资产名称"
          clearable
          style="float: right; width: 240px"
        ></datablau-input>
        <div class="types-selector">
          <el-dropdown :hide-on-click="false" trigger="click">
            <span
              class="el-dropdown-link"
              :class="{
                all: typesNameStr === '全部资产类型',
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
          </el-dropdown>
        </div>
        <!-- <datablau-select
          v-model="assetSearchParams.orderBy"
          class="selector order-selector"
        >
          <el-option label="按创建时间" value="createTime"></el-option>
          <el-option label="按资产名称" value="assetName"></el-option>
        </datablau-select> -->
      </div>
      <div class="content-box">
        <datablau-form-submit>
          <div class="table-box" style="">
            <datablau-table
              :key="cardingStatus"
              v-loading="loading"
              :data="assetList"
              height="100%"
              :data-selectable="false"
              :show-column-selection="false"
              :default-sort="defaultSort"
              ref="assetTable"
              :reserveSelection="true"
              :row-key="getAssetRowKeys"
              @selection-change="handleSelectChange"
              @sort-change="sortChange"
            >
              <el-table-column
                :width="22"
                type="selection"
                :selectable="() => !scaning"
              ></el-table-column>
              <el-table-column :width="30" prop="type" label="">
                <template slot-scope="scope">
                  <span
                    class="iconfont"
                    :class="'icon-' + typeIconMap[scope.row.type]"
                    style="font-size: 20px; vertical-align: middle"
                  ></span>
                </template>
              </el-table-column>
              <el-table-column
                :min-width="120"
                prop="assetName"
                label="数据资产名称"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="150"
                prop="tableName"
                label="所在表"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="modelName"
                label="数据源"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="schemaName"
                label="schema"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                v-if="cardingStatus === 'UN_CONFIRMED'"
                :min-width="150"
                prop="catalogName"
                label="所在安全分类"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                v-if="cardingStatus === 'UN_CONFIRMED'"
                :min-width="150"
                prop="securityName"
                label="安全等级"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="80"
                prop="status"
                label="梳理状态"
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
                label="创建时间"
                sortable="creatTime"
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
                label="梳理时间"
                show-overflow-tooltip
                sortable="combTime"
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
                label="发布时间"
                show-overflow-tooltip
                sortable="publishTime"
              >
                <template slot-scope="scope">
                  {{ $timeFormatter(scope.row.publishTime) }}
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                :width="60"
                align="center"
                fixed="right"
                prop="operation"
              >
                <template slot-scope="scope">
                  <datablau-button
                    type="icon"
                    tooltip-content="查看"
                    class="iconfont icon-see"
                    @click="toCheckAssetDetails(scope.row)"
                  ></datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
          <template slot="buttons">
            <div class="bottom">
              <span class="check-info" v-if="selectedList.length > 0"></span>
              <span
                class="footer-row-info"
                style="margin-right: 0px"
                v-if="selectedList.length > 0"
              >
                当前选中“{{ selectedList.length }}条”信息，是否
              </span>
              <!-- type="danger" -->
              <template
                v-if="
                  cardingStatus === 'UN_COMB' && selectedUncombList.length > 0
                "
              >
                <datablau-button
                  type="normal"
                  @click="handleFun(2)"
                  style="margin-left: 8px"
                >
                  标记为暂不梳理
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
                  确认提交评审
                </datablau-button>
                <el-divider direction="vertical"></el-divider>
                <datablau-button type="normal" @click="handleFun(5)">
                  修改安全分类
                </datablau-button>
                <el-divider direction="vertical"></el-divider>
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
                      取消
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
                      确定
                    </datablau-button>
                  </div>

                  <datablau-button slot="reference" type="normal">
                    修改安全等级
                  </datablau-button>
                </el-popover>
                <el-divider direction="vertical"></el-divider>
                <datablau-button type="normal" @click="handleFun(7)">
                  重新梳理
                </datablau-button>
              </template>
              <template
                v-if="
                  cardingStatus === 'PUBLISH' && selectedPublishList.length > 0
                "
              >
                <datablau-button
                  type="normal"
                  @click="handleFun(7)"
                  style="margin-left: 8px"
                >
                  重新梳理
                </datablau-button>
              </template>
              <template
                v-if="
                  cardingStatus === 'NOT_COMB' && selectedNotcombList.length > 0
                "
              >
                <datablau-button
                  type="normal"
                  @click="handleFun(7)"
                  style="margin-left: 8px"
                >
                  重新梳理
                </datablau-button>
              </template>
              <div class="page">
                <span v-if="scaning && scanAgain" class="page-scaning">
                  <span class="icon">
                    <i class="iconfont icon-loading"></i>
                  </span>
                  <span style="margin-left: 25px">正在更新...</span>
                </span>
                <datablau-pagination
                  @current-change="handlePageChange"
                  @size-change="handleSizeChange"
                  :current-page.sync="form.page"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="form.size"
                  :layout="
                    scaning
                      ? 'sizes, prev, pager, next, jumper'
                      : 'total, sizes, prev, pager, next, jumper'
                  "
                  :total="total"
                  :loading="scaning"
                ></datablau-pagination>
              </div>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </div>
    <div v-if="cardingStatus === 'UN_COMB'" class="relation-box">
      <img src="/static/images/relation.svg" alt="" />
      <br />
      <span style="display: inline-block; margin-top: 10px; margin-bottom: 8px">
        同时选择资产和安全目录进行分类操作
      </span>
      <datablau-tooltip :disabled="canAdd" :content="cannotAddTooltip">
        <el-popover
          placement="bottom"
          width="160"
          trigger="manual"
          :disabled="!canAdd"
          v-model="confirmVisible"
        >
          <p style="font-size: 12px; color: #555; padding: 8px">
            已选
            <span style="color: #409eff">{{ selectedList.length }}</span>
            条数据，是否移动到安全分类中？
          </p>
          <div style="text-align: right; margin: 0">
            <datablau-button
              size="mini"
              type="text"
              @click="confirmVisible = false"
            >
              否
            </datablau-button>
            <datablau-button
              type="strong"
              size="mini"
              @click="handleFun(1)"
              style="border: none; padding: 0 10px; min-width: 0"
            >
              是
            </datablau-button>
          </div>
          <datablau-button
            slot="reference"
            :type="canAdd ? 'primary' : 'normal'"
            :disabled="!canAdd"
            @click="confirmVisible = true"
          >
            添加到待确认
          </datablau-button>
        </el-popover>
      </datablau-tooltip>
    </div>
    <div v-if="cardingStatus !== 'NOT_COMB'" class="tree-box">
      <datablau-detail-subtitle
        title="安全分类目录"
        mt="10px"
        mb="10px"
      ></datablau-detail-subtitle>
      <div class="tree-content">
        <datablau-easy-tree
          @node-click="handleNodeClick"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          :data-supervise="false"
          :data-icon-function="dataIconFunction"
          :expand-on-click-node="false"
          ref="classificationTree"
          lazy
          :load="loadTreeData"
          :filter-node-method="filterNode"
          :use-default-sort="false"
          show-overflow-tooltip
          height="calc(100vh - 285px)"
          :itemSize="34"
          :highlightCurrent="true"
        ></datablau-easy-tree>
      </div>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
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
    min-width: 900px;
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
        margin-right: 20px;
        line-height: 40px;
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
      width: 320px;
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
    padding: 10px 20px 10px;

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
      left: 20px;
      right: 20px;
      bottom: 0;
      /deep/ .datablau-list-search {
        // padding: 0 20px;
      }
      .table-box {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        /deep/ .db-table {
          // padding: 0 20px;
        }
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
        .check-info {
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: -13px;
          vertical-align: middle;
          background: #409eff;
        }
        .footer-row-info {
          margin-right: 10px;
          &::before {
            margin-right: 5px;
            font-family: 'element-icons';
            font-size: 12px;
            font-weight: 200;
            line-height: 13px;
            color: white;
            vertical-align: middle;
            content: '\e6da';
          }
        }
      }
      /deep/.row-buttons {
        padding: 8px 20px 8px 6px;
      }
    }
    .tab-search-box {
      width: 500px;
      position: absolute;
      right: 0;
      top: 12px;
      padding-right: 20px;
      .types-selector {
        position: relative;
        float: right;
        width: 110px;
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
    right: 272px;
    width: 145px;
    top: 132px;
    bottom: 0;
    text-align: center;
    padding-top: 18%;
    padding-left: 6px;
    padding-right: 6px;
  }
  .tree-box {
    position: absolute;
    right: 16px;
    width: 240px;
    top: 142px;
    bottom: 50px;
    border-right: 1px solid var(--border-color-lighter);
    border: 1px solid #efefef;
    .tree-catalog {
      height: 44px;
      line-height: 24px;
      padding: 10px;
      font-size: 14px;
      font-weight: 600;
    }
    .tree-content {
      position: absolute;
      bottom: 15px;
      top: 38px;
      left: 0;
      right: 0;
      // overflow-y: auto;
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

<style>
.coo-select .option-icon {
  font-size: 16px;
  color: #409eff;
}
</style>
