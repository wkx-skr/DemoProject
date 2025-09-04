<template>
  <div v-loading="loading" class="access-strategy-panel">
    <div
      v-show="!showDetails"
      style="position: absolute; top: 0; bottom: 0; right: 0; left: 0"
    >
      <div class="page-tree">
        <datablau-tree-header>
          <template slot="title">访问策略管理</template>
          <template slot="more" v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE">
            <datablau-tooltip
              class="item"
              effect="dark"
              content="新建目录"
              placement="top"
            >
              <i
                class="iconfont icon-tianjia"
                @click="openCatalogDialog('new', {})"
              ></i>
            </datablau-tooltip>
          </template>
          <template slot="search">
            <datablau-input
              v-model="catalogKeyword"
              clearable
              :placeholder="$t('common.placeholder.normal')"
              :iconfont-state="true"
            ></datablau-input>
          </template>
        </datablau-tree-header>
        <div class="tree">
          <datablau-tree
            class="el-tree light-blue-tree directory-tree"
            style="clear: both; position: relative"
            :show-checkbox="false"
            ref="strategyTree"
            :data="treeData"
            :expand-on-click-node="false"
            :default-expand-all="false"
            :props="defaultProps"
            @node-click="handleNodeClick"
            :showOverflowTooltip="true"
            check-strictly
            node-key="catalogId"
            :data-supervise="true"
            :data-icon-function="dataIconFunction"
            :data-options-function="dataOptionsFunction"
            :highlight-current="true"
            :auto-expand-parent="true"
            :filter-node-method="filterStrategyCatalogs"
            :empty-text="$t('assets.assetList.noCatalogInfo')"
            height="100%"
          ></datablau-tree>
        </div>
      </div>
      <div class="resize-column-middle"></div>
      <div class="page-content">
        <div class="search">
          <datablau-input
            v-model="keyword"
            :iconfont-state="true"
            clearable
            placeholder="搜索策略名称"
          ></datablau-input>
          <div
            class="right-box"
            style="float: right"
            v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
          >
            <el-dropdown @command="handleCommand">
              <datablau-button type="important" class="iconfont icon-tianjia">
                新建访问策略
              </datablau-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="iconfont icon-tianjia"
                  :command="'ACCESS_STRATEGY'"
                >
                  访问策略
                </el-dropdown-item>
                <el-dropdown-item
                  icon="iconfont icon-tianjia"
                  :command="'ACCESS_ROW_STRATEGY'"
                >
                  行级访问策略
                </el-dropdown-item>
                <el-dropdown-item
                  icon="iconfont icon-tianjia"
                  :command="'ACCESS_DATAMASK_TABLE'"
                >
                  表脱敏策略
                </el-dropdown-item>
                <el-dropdown-item
                  :command="'ACCESS_DATAMASK_COLUMN'"
                  icon="iconfont icon-tianjia"
                >
                  字段脱敏策略
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="search-result">
          <datablau-form-submit>
            <datablau-table
              height="100%"
              :show-column-selection="false"
              ref="strategyTable"
              :data="tableData"
              :data-selectable="$auth.DATA_SECURITY_STRATEGY_MANAGE"
              row-key="accessControlId"
              reserve-selection
              @selection-change="handleTableSelectChange"
              @sort-change="handleSortChange"
            >
              <el-table-column
                :min-width="120"
                label="策略名称"
                prop="accessControlName"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="策略类型"
                :min-width="120"
                prop="type"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ strategyTypeMap(scope.row) }}
                </template>
              </el-table-column>
              <el-table-column
                label="数据执行动作"
                :min-width="120"
                prop="action"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.action ? scope.row.action.join(', ') : '' }}
                </template>
              </el-table-column>
              <el-table-column
                label="数据访问动作"
                :min-width="120"
                prop="allow"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <div>
                    <span
                      style="
                        display: inline-block;
                        width: 6px;
                        height: 6px;
                        border-radius: 3px;
                      "
                      :style="{
                        backgroundColor:
                          scope.row.type === 'ACCESS_STRATEGY'
                            ? scope.row.allow
                              ? '#66bf16'
                              : '#f2220a'
                            : 'transparent',
                      }"
                    ></span>
                    <span
                      style="margin-left: 3px"
                      :style="{
                        color:
                          scope.row.type === 'ACCESS_STRATEGY'
                            ? scope.row.allow
                              ? '#66bf16'
                              : '#f2220a'
                            : 'transparent',
                      }"
                    >
                      {{
                        scope.row.type === 'ACCESS_STRATEGY'
                          ? scope.row.allow
                            ? '允许'
                            : '拒绝'
                          : ''
                      }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <!-- <el-table-column
                :min-width="120"
                label="引用安全策略名称"
                prop="securityControlName"
                show-overflow-tooltip
              ></el-table-column> -->
              <el-table-column
                label="创建人"
                prop="creator"
                :min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="创建时间"
                sortable
                prop="createTime"
                :min-width="145"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ $timeFormatter(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                align="center"
                fixed="right"
                header-align="center"
                :min-width="120"
              >
                <template slot-scope="scope">
                  <datablau-button
                    v-if="$auth.DATA_SECURITY_STRATEGY"
                    style="margin: 0 3px"
                    type="icon"
                    @click="checkStrategy(scope.row)"
                  >
                    <datablau-tooltip content="查看" placement="top">
                      <i class="iconfont icon-see"></i>
                    </datablau-tooltip>
                  </datablau-button>

                  <datablau-button
                    v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
                    style="margin: 0 3px"
                    type="icon"
                    @click="editStrategy(scope.row)"
                  >
                    <datablau-tooltip
                      :content="$t('common.button.edit')"
                      placement="top"
                    >
                      <i class="iconfont icon-bianji"></i>
                    </datablau-tooltip>
                  </datablau-button>

                  <datablau-button
                    v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
                    style="margin: 0 3px"
                    type="icon"
                    @click="deleteStrategy(scope.row)"
                  >
                    <datablau-tooltip content="删除" placement="top">
                      <i class="iconfont icon-delete"></i>
                    </datablau-tooltip>
                  </datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <div
                class="left-btn"
                v-show="tableSelection && tableSelection.length > 0"
              >
                <div style="display: inline-block">
                  <span class="check-info"></span>
                  <span class="footer-row-info">
                    {{
                      $t('common.deleteMessage', {
                        selection: tableSelection.length,
                      })
                    }}
                  </span>
                  <datablau-button
                    class="iconfont icon-delete"
                    type="danger"
                    size="mini"
                    @click="deleteStrategy(false)"
                  >
                    {{ $t('common.button.delete') }}
                  </datablau-button>
                </div>
              </div>
              <datablau-pagination
                class="pagination-component"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="pagination.currentPage"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="pagination.pageSize"
                :pager-count="5"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total"
              ></datablau-pagination>
            </template>
          </datablau-form-submit>
        </div>
      </div>
    </div>
    <div
      v-if="showDetails"
      style="
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #fff;
      "
    >
      <template v-if="editable">
        <NewAccessStrategy
          v-if="strategyType === 'ACCESS_STRATEGY'"
          @cancel="closeDetails"
          :initData="activeStrategy"
          :catalogInfo="catalogInfo"
          :strategyType="strategyType"
        ></NewAccessStrategy>
        <RowAccessStrategy
          v-else-if="strategyType === 'ACCESS_ROW_STRATEGY'"
          :catalogInfo="catalogInfo"
          @cancel="closeDetails"
          :initData="activeStrategy"
          :strategyType="strategyType"
        ></RowAccessStrategy>
        <desensitize-box
          :catalogInfo="catalogInfo"
          @cancel="closeDetails"
          :initData="activeStrategy"
          :strategyType="strategyType"
          v-else
        ></desensitize-box>
      </template>

      <Details
        v-else
        @cancel="closeDetails"
        :strategyType="strategyType"
        :id="currentStrategyId"
      ></Details>
    </div>
    <datablau-dialog
      width="650px"
      :title="catalogDialogTitle"
      :visible.sync="catalogDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      @close="closeCatalogDialog"
    >
      <datablau-form
        v-if="catalogEditable"
        :model="catalogDetails"
        :rules="rulePram"
        ref="catalogForm"
        label-width="130px"
        size="mini"
        class="catalogDialog"
      >
        <el-form-item label="目录名称" prop="name">
          <datablau-input
            clearable
            show-word-limit
            maxlength="30"
            size="small"
            style="width: 100%"
            v-model="catalogDetails.name"
            placeholder="请输入目录名称，避免使用#/\@$_%<>等特殊字符"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="目录描述" prop="description">
          <datablau-input
            type="textarea"
            clearable
            show-word-limit
            maxlength="200"
            size="small"
            class="item-desc"
            style="width: 100%"
            v-model="catalogDetails.describe"
            placeholder="请输入描述"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <datablau-detail v-else :fullWidth="true">
        <el-form-item label="目录名称" style="width: 100%">
          <span>{{ catalogDetails.name }}</span>
        </el-form-item>
        <el-form-item label="目录描述" style="width: 100%">
          <span>{{ catalogDetails.describe }}</span>
        </el-form-item>
      </datablau-detail>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeCatalogDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="catalogEditable"
          type="important"
          @click="submitCatalog"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import strategy from './main.js'
export default strategy
</script>
<style lang="scss" scoped>
.access-strategy-panel {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;

  .page-tree {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    border-right: 1px solid #ebeef5;
    .title {
      padding: 0 10px;
      height: 44px;
      line-height: 44px;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .search {
      padding: 0 10px;
      .filter-input {
        width: 100%;
      }
    }
    .tree {
      margin-top: 5px;
      height: calc(100% - 88px);
      overflow-y: scroll;
    }
  }
  .resize-column-middle {
    left: 240px;
    z-index: 8;
  }
  .page-content {
    position: absolute;
    top: 0;
    left: 240px;
    right: 0;
    bottom: 0;
    height: 100%;
    .search {
      padding: 10px 20px 0 20px;
    }
    .search-result {
      position: absolute;
      top: 42px;
      right: 0;
      left: 0;
      bottom: 0;
      .left-btn {
        position: absolute;
        left: 0;
        height: 100%;
        width: 600px;
        padding-left: 20px;
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
    }
  }
  .desensitize-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
  }
}
</style>
