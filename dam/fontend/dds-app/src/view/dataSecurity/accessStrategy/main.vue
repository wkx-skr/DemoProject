<template>
  <div v-loading="loading" class="access-strategy-panel">
    <div
      v-show="!showDetails"
      style="position: absolute; top: 0; bottom: 0; right: 0; left: 0"
    >
      <div class="page-tree">
        <catalog-tree
          ref="catalogTree"
          :type="'ACCESS_CONTROL'"
          :clickTree="clickTree"
        ></catalog-tree>
      </div>
      <div class="resize-column-middle"></div>
      <div class="page-content">
        <template v-if="listShow">
          <div class="search">
            <datablau-input
              v-model="keyword"
              @keyup.native.enter="handleSearch"
              :iconfont-state="true"
              clearable
              style="width: 240px"
              :placeholder="$t('accessStrategy.searchName')"
            ></datablau-input>
            <div
              class="right-box"
              style="float: right"
              v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
            >
              <el-dropdown @command="handleCommand">
                <datablau-button type="important" class="iconfont icon-tianjia">
                  {{ $t('securityModule.new') }}
                </datablau-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    icon="iconfont icon-tianjia"
                    :command="'ACCESS_STRATEGY'"
                  >
                    {{ $t('accessStrategy.accessPolicy') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="iconfont icon-tianjia"
                    :command="'ACCESS_ROW_STRATEGY'"
                  >
                    {{ $t('accessStrategy.rowLevelAccessPolicy') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="iconfont icon-tianjia"
                    :command="'ACCESS_DATAMASK_TABLE'"
                  >
                    {{ $t('accessStrategy.tableDesensitizationStrategy') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="'ACCESS_DATAMASK_COLUMN'"
                    icon="iconfont icon-tianjia"
                  >
                    {{ $t('accessStrategy.fieldDesensitizationStrategy') }}
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
                v-loading="tableLoading"
                :loading="tableLoading"
                :data-selectable="$auth.DATA_SECURITY_STRATEGY_MANAGE"
                row-key="accessControlId"
                reserve-selection
                @selection-change="handleTableSelectChange"
                @sort-change="handleSortChange"
              >
                <el-table-column
                  :min-width="150"
                  :label="$t('accessStrategy.name')"
                  prop="accessControlName"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('accessStrategy.type')"
                  :min-width="120"
                  prop="type"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <div
                      class="type-class"
                      :style="strategyTypeMap(scope.row.type, 2)"
                    >
                      {{ strategyTypeMap(scope.row.type, 1) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('accessStrategy.dataExecutionAction')"
                  :min-width="120"
                  prop="action"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.action ? scope.row.action.join(', ') : '--' }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('accessStrategy.dataAccessAction')"
                  :min-width="140"
                  prop="allow"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <div v-if="scope.row.type === 'ACCESS_STRATEGY'">
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
                              ? $t('securityModule.allow')
                              : $t('securityModule.refuse')
                            : ''
                        }}
                      </span>
                    </div>
                    <span v-else>--</span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('accessStrategy.founder')"
                  prop="creator"
                  :min-width="120"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('accessStrategy.creationTime')"
                  sortable
                  prop="createTime"
                  width="150"
                  :formatter="$timeFormatter"
                  show-overflow-tooltip
                >
                  <!-- <template slot-scope="scope">
                  {{ $timeFormatter(scope.row.createTime) }}
                </template> -->
                </el-table-column>
                <el-table-column
                  :label="$t('accessStrategy.operate')"
                  align="center"
                  fixed="right"
                  header-align="center"
                  width="160"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
                      :tooltip-content="
                        scope.row.type === 'ACCESS_STRATEGY'
                          ? $t('accessStrategy.copy')
                          : $t('accessStrategy.notCopy')
                      "
                      type="icon"
                      :disabled="scope.row.type !== 'ACCESS_STRATEGY'"
                      class="iconfont icon-copy"
                      @click="copyStrategy(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      v-if="$auth.DATA_SECURITY_STRATEGY"
                      type="icon"
                      :tooltip-content="$t('securityModule.view')"
                      class="iconfont icon-see"
                      @click="checkStrategy(scope.row)"
                    ></datablau-button>

                    <datablau-button
                      v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
                      type="icon"
                      :tooltip-content="$t('securityModule.edit')"
                      class="iconfont icon-bianji"
                      @click="editStrategy(scope.row)"
                    ></datablau-button>

                    <datablau-button
                      v-if="$auth.DATA_SECURITY_STRATEGY_MANAGE"
                      style="margin: 0 3px"
                      type="icon"
                      :tooltip-content="$t('securityModule.delete')"
                      class="iconfont icon-delete"
                      @click="deleteStrategy(scope.row)"
                    ></datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons">
                <div
                  class="left-btn"
                  v-show="tableSelection && tableSelection.length > 0"
                >
                  <div style="display: inline-block">
                    <btn-tip :num="tableSelection.length"></btn-tip>
                    <datablau-button
                      class="iconfont icon-delete"
                      type="danger"
                      size="mini"
                      @click="deleteStrategy(false)"
                    >
                      {{ $t('securityModule.delete') }}
                    </datablau-button>
                  </div>
                </div>
                <datablau-pagination
                  class="pagination-component"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page.sync="pagination.pageNum"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="pagination.pageSize"
                  :pager-count="5"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="pagination.total"
                ></datablau-pagination>
              </template>
            </datablau-form-submit>
          </div>
        </template>
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
          :breadcrumbNodes="breadcrumbNodes"
          :strategyType="strategyType"
        ></NewAccessStrategy>
        <RowAccessStrategy
          v-else-if="strategyType === 'ACCESS_ROW_STRATEGY'"
          :catalogInfo="catalogInfo"
          @cancel="closeDetails"
          :breadcrumbNodes="breadcrumbNodes"
          :initData="activeStrategy"
          :strategyType="strategyType"
        ></RowAccessStrategy>
        <desensitize-box
          :catalogInfo="catalogInfo"
          @cancel="closeDetails"
          :initData="activeStrategy"
          :breadcrumbNodes="breadcrumbNodes"
          :strategyType="strategyType"
          v-else
        ></desensitize-box>
      </template>

      <Details
        v-else
        @cancel="closeDetails"
        :breadcrumbNodes="breadcrumbNodes"
        :strategyType="strategyType"
        :id="currentStrategyId"
      ></Details>
    </div>
  </div>
</template>
<script>
import strategy from './main.js'
export default strategy
</script>
<style lang="scss" scoped>
.type-class {
  display: inline-block;
  width: 88px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  text-align: center;
  border-radius: 2px;
  margin: 0 auto;
  padding: 0 8px;
  box-sizing: border-box;
}
/deep/ .el-form {
  .el-form-item {
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
}
.datablau-detail {
  /deep/ .detail-form {
    padding: 0;
  }
}
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
