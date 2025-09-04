<template>
  <div class="identify-result-page">
    <datablau-dialog
      class="jobs-sta"
      width="500px"
      :isTree="true"
      :title="$t('intelligence.modifySecurityClass')"
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
        <datablau-button
          :tooltip-content="notAdd ? addTip : ''"
          type="normal"
          @click="changeClassification"
          :disabled="notAdd"
          style="margin-left: 5px"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <template v-if="listShow">
      <datablau-list-search
        :noMinWidth="true"
        ref="searchBox"
        @domResize="domResize"
        style="padding: 10px 20px 0"
      >
        <el-form ref="form">
          <el-form-item label="">
            <datablau-input
              :iconfont-state="true"
              style="width: 200px"
              clearable
              type="text"
              v-model="form.name"
              @keyup.native.enter="handleSearch"
              :placeholder="$t('intelligence.searchAssetsName')"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('intelligence.idTask')">
            <datablau-select
              ref="loadRule"
              style="width: 160px"
              v-model="form.taskId"
              v-selectLazyLoad="taskLoad"
              :remote-method="taskSelect"
              @focus="focusTask"
              remote
              filterable
              clearable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in taskList"
                :key="item.taskId"
                :label="item.taskName"
                :value="item.taskId"
              ></el-option>
              <el-option v-if="taskLoading" value="" class="table-option">
                {{ $t('securityModule.loading') }}
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('intelligence.idRules')">
            <datablau-select
              ref="loadRule"
              style="width: 160px"
              v-model="form.ruleId"
              v-selectLazyLoad="ruleLoad"
              :remote-method="ruleSelect"
              @focus="focusRule"
              remote
              filterable
              clearable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in ruleList"
                :key="item.ruleId"
                :label="item.ruleName"
                :value="item.ruleId"
              ></el-option>
              <el-option v-if="ruleLoading" value="" class="table-option">
                {{ $t('securityModule.loading') }}
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.busSystem')">
            <datablau-select
              style="width: 160px"
              v-model="form.system"
              @change="handleSystemChange"
              filterable
              clearable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in systemList"
                :key="item.categoryId"
                :label="item.categoryName"
                :value="item.categoryId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.collectName')">
            <datablau-select
              style="width: 160px"
              v-model="form.datasourceId"
              @change="handleGatherChange"
              filterable
              clearable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in gatherDataList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.datasource')">
            <datablau-select
              style="width: 160px"
              v-model="form.modelId"
              @change="handleDatasourceChange"
              filterable
              clearable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in datasourceList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="schema">
            <datablau-select
              style="width: 120px"
              v-model="form.schema"
              @change="handleSchemaChange"
              filterable
              clearable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in schemaList"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('intelligence.tableAndView')"
            class="search-tree-box"
          >
            <datablau-select
              ref="loadSelect"
              style="width: 160px"
              v-model="form.tableId"
              :disabled="!form.schema"
              filterable
              clearable
              remote
              @clear="clearTable"
              v-selectLazyLoad="lazyloading"
              :remote-method="remoteMethod"
              :placeholder="$t('intelligence.fuzzySearch')"
            >
              <el-option
                v-for="item in tableList"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
              <el-option
                v-if="selectTableLoading"
                value=""
                class="table-option"
              >
                {{ $t('securityModule.loading') }}
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.securityLevel')">
            <datablau-select
              style="width: 120px"
              v-model="form.levelId"
              filterable
              clearable
              :placeholder="$t('securityModule.all')"
            >
              <el-option
                v-for="item in levelList"
                :key="item.tagId"
                :label="item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button type="normal" @click="query">
              {{ $t('securityModule.search') }}
            </datablau-button>
            <datablau-button type="secondary" @click="reset">
              {{ $t('securityModule.reset') }}
            </datablau-button>
          </el-form-item>
        </el-form>
      </datablau-list-search>
      <div class="table-box" :style="{ top: top + 10 + 'px' }">
        <datablau-form-submit>
          <datablau-table
            v-loading="tableLoading"
            :loading="tableLoading"
            :data-selectable="false"
            :show-column-selection="false"
            height="100%"
            ref="table"
            @selection-change="handleTableChange"
            :data="tableData"
            :default-sort="{ prop: orderBy, order: sort }"
            @sort-change="sortChange"
            row-key="resultId"
            :row-class-name="rowClass"
            :cell-class-name="cellClass"
          >
            <el-table-column
              :reserve-selection="true"
              v-if="$auth.DATA_SECURITY_DISCERN_RESULT_MANAGE"
              type="selection"
              width="20"
              :selectable="row => !row.disabled"
            ></el-table-column>
            <el-table-column prop="none" width="1">
              <template slot-scope="scope">
                <div class="check-box">
                  <datablau-tooltip
                    effect="dark"
                    :content="$t('intelligence.resultTip')"
                    placement="bottom"
                  >
                    <span></span>
                  </datablau-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column width="28">
              <template slot-scope="scope">
                <datablau-icon
                  :data-type="'logicaltable'"
                  v-if="scope.row.logical && scope.row.typeId === 80000004"
                  :size="20"
                  style="position: relative; top: 3px; left: -3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'logicalcolumn'"
                  v-else-if="scope.row.logical && scope.row.typeId === 80000005"
                  :size="20"
                  style="position: relative; top: 3px; left: -3px"
                ></datablau-icon>
                <datablau-icon
                  v-else
                  :data-type="getType(scope.row.typeId)"
                  :size="20"
                  style="position: relative; top: 3px; left: -3px"
                ></datablau-icon>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('securityModule.dataAssetsName')"
              prop="dataAssetName"
              sortable="custom"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ getName(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('securityModule.busSystem')"
              prop="categoryName"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('securityModule.collectName')"
              prop="datasourceName"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('securityModule.datasource')"
              prop="modelName"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'schema'"
              prop="schema"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('intelligence.tableAndView')"
              prop="tableName"
              :min-width="100"
              header-align="center"
            >
              <template slot-scope="scope">
                <el-popover
                  popper-class="table-popover-pop"
                  placement="bottom"
                  width="420"
                  trigger="hover"
                  @show="showTablePop(scope.row)"
                  transition="fade-in-linear"
                >
                  <div class="catalog-name" slot="reference">
                    {{ scope.row.tableName }}
                  </div>
                  <table-pop
                    v-if="columnLoading"
                    :scopeDetail="scope.row"
                    :columnObj="columnObj"
                  ></table-pop>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('intelligence.idSecurityClass')"
              prop="catalogList"
              :min-width="getMinWidth(typeNum)"
            >
              <template
                slot-scope="scope"
                v-if="scope.row.catalogList && scope.row.catalogList[0]"
              >
                <table-popover
                  ref="tablePopover"
                  :row="scope.row"
                ></table-popover>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('intelligence.idTask')"
              prop="taskName"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('securityModule.securityLevel')"
              prop="level"
              :min-width="150"
            >
              <template slot="header">
                <div class="level-header">
                  {{ $t('securityModule.securityLevel') }}
                  <!-- 组价不支持 -->
                  <el-tooltip
                    :visible-arrow="false"
                    popper-class="table-header-tooltip"
                  >
                    <div slot="content">
                      {{ $t('intelligence.resultTip1') }}
                      <br />
                      {{ $t('intelligence.resultTip2') }}
                      {{ $t('intelligence.resultTip3') }}
                    </div>
                    <i
                      class="iconfont icon-tips"
                      style="margin-left: 4px; cursor: pointer"
                    ></i>
                  </el-tooltip>
                </div>
              </template>
              <template
                slot-scope="scope"
                v-if="scope.row.catalogList.length > 0"
              >
                <template
                  v-if="
                    scope.row.ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE
                  "
                >
                  <div class="table-level-tag">
                    <is-show-tooltip
                      class="tag-type"
                      :content="getLevelName(scope.row.levelList)"
                      :refName="'catalog'"
                    ></is-show-tooltip>
                  </div>
                  <el-popover
                    popper-class="table-card-popover"
                    style="display: inline-block"
                    v-if="scope.row.levelList.length - 1 > 0"
                    placement="bottom"
                    title=""
                    width="490"
                    trigger="hover"
                    transition="fade-in-linear"
                    :visible-arrow="false"
                  >
                    <div class="more" slot="reference">
                      {{ $t('securityModule.more') }}
                      {{ scope.row.levelList.length - 1 }}
                      {{ scope.row.levelList.length - 1 > 99 ? '+' : '' }}
                    </div>
                    <p
                      style="
                        margin-bottom: 8px;
                        overflow: hidden;
                        color: #20293b;
                        font-size: 12px;
                        text-align: left;
                      "
                    >
                      {{ $t('securityModule.securityLevel') }}：{{
                        scope.row.levelList.length
                      }}条
                    </p>
                    <el-tag
                      class="table-result-tag"
                      :class="{
                        'select-tag': scope.row.levelList.length > 1,
                        'cur-tag': item.select,
                      }"
                      style="margin-bottom: 5px"
                      v-for="item in scope.row.levelList"
                      :key="item.id"
                      @click="selectLevelType(scope.row, item.tagId)"
                      size="normal"
                      effect="light"
                    >
                      <is-show-tooltip
                        class="tag-type"
                        :content="item.tagName"
                        :refName="'catalog'"
                      ></is-show-tooltip>
                    </el-tag>
                  </el-popover>
                </template>
                <div
                  v-else
                  class="normal-level table-level-tag"
                  :class="{ 'animate-level': scope.row.changeLevel }"
                >
                  <is-show-tooltip
                    class="tag-type"
                    :content="getLevel(scope.row)"
                    :refName="'catalog'"
                  ></is-show-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('intelligence.idTime')"
              prop="discernTime"
              sortable="custom"
              :min-width="140"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('intelligence.idRules')"
              prop="ruleName"
              :min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <table-cell
                  :icon="methodRuleType(scope.row.ruleType, 3)"
                  :name="scope.row.ruleName"
                ></table-cell>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('intelligence.priority')"
              align="center"
              prop="priority"
              :width="70"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span :class="['priority-cell', 'cell' + scope.row.priority]">
                  {{ getPriorityType(scope.row.priority) }}
                </span>
              </template>
            </el-table-column>
            <!-- <el-table-column
            :label="'识别信息项'"
            prop="infoName"
            :min-width="100"
            show-overflow-tooltip
          ></el-table-column> -->
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <template
                v-if="
                  selections.length > 0 &&
                  $auth.DATA_SECURITY_DISCERN_RESULT_MANAGE
                "
              >
                <btn-tip :num="selections.length"></btn-tip>
                <datablau-button
                  :disabled="noNext"
                  @click="sureSubmit"
                  type="important"
                >
                  {{ $t('intelligence.submitReview') }}
                </datablau-button>
                <datablau-button
                  :disabled="noNext"
                  @click="handlerClick(1)"
                  type="secondary"
                >
                  {{ $t('intelligence.reorganize') }}
                </datablau-button>
                <datablau-button
                  :disabled="noNext"
                  @click="handlerClick(2)"
                  type="secondary"
                >
                  {{ $t('intelligence.notComb') }}
                </datablau-button>
                <el-popover
                  :disabled="noNext"
                  popper-class="identify-popper"
                  placement="top-start"
                  width="280"
                  trigger="click"
                  @show="showPop"
                  ref="identifyPopover"
                >
                  <datablau-select
                    v-model="anquan"
                    clearable
                    @change="handleLevel"
                    :placeholder="$t('intelligence.editSecurity')"
                    style="
                      display: inline-block;
                      margin-left: 10px;
                      width: 166px;
                    "
                  >
                    <el-option
                      :label="item.name"
                      :value="item.tagId"
                      v-for="item in levelList"
                      :key="item.tagId"
                    ></el-option>
                  </datablau-select>
                  <div class="cancel" @click="cancelPopover">
                    {{ $t('securityModule.cancel') }}
                  </div>
                  <div class="sure" @click="changeLevel">
                    {{ $t('securityModule.sure') }}
                  </div>
                  <datablau-button
                    :disabled="noNext"
                    type="normal"
                    slot="reference"
                    class="select-btn"
                  >
                    <i class="iconfont icon-safetylevel"></i>
                    {{ $t('intelligence.modifySecurity') }}
                  </datablau-button>
                </el-popover>
                <datablau-button
                  @click="handlerClassify"
                  style="margin-left: 10px"
                  type="secondary"
                >
                  {{ $t('intelligence.modifySecurityClass') }}
                </datablau-button>
              </template>
              <datablau-pagination
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                :current-page.sync="form.page"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="form.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </template>
  </div>
</template>

<script>
import identifyResult from './identifyResult.js'
export default identifyResult
</script>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.catalog-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
  &:hover {
    background: transparentize($color: #409eff, $amount: 0.9);
    color: #409eff;
  }
}
/deep/ .priority-cell {
  height: 24px;
  display: inline-block;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    left: -12px;
    top: 9px;
    width: 6px;
    height: 6px;
    border-radius: 6px;
  }
  &.cell1 {
    color: #f2220a;
    &:before {
      background: #f2220a;
    }
  }
  &.cell2 {
    color: #ff7519;
    &:before {
      background: #ff7519;
    }
  }
  &.cell3 {
    color: #66bf16;
    &:before {
      background: #66bf16;
    }
  }
}
.normal-level {
  border-radius: 2px;
  height: 24px;
  line-height: 24px;
  padding: 0 4px;
  display: inline-block;
  width: 88px;
  &.animate-level {
    animation: change 0.2s infinite;
    line-height: 22px;
  }
  i {
    font-size: 14px;
  }
}
@keyframes change {
  0% {
    // background: transparent;
    border: 1px solid transparent;
  }
  100% {
    border: 1px solid $primary-color;
    // background: $primary-color;
  }
}

/deep/ .datablau-table {
  .disabled-btn {
    position: relative;
    .disabled-cell {
      position: static;
      display: block;
      .cell {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 9;
        width: 20px;
        height: 40px;
        .check-box {
          position: absolute;
          left: 0;
          top: 0;
          width: 20px;
          height: 40px;
        }
        .datablau-tooltip {
          width: 20px;
          height: 40px;
          display: flex;
          align-items: center;
          span {
            display: block;
            width: 14px;
            height: 14px;
          }
        }
      }
    }
  }
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
  &:last-child {
    margin-right: 0;
  }
  &.select-tag {
    cursor: pointer;
  }
  &.cur-tag {
    background: #409eff;
    color: #fff;
  }
}
.identify-result-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .table-box {
    position: absolute;
    top: 54px;
    left: 0;
    right: 0;
    bottom: 0;
    .bottom {
      box-sizing: border-box;
      padding: 10px 20px 0;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 50px;

      .select-btn {
        margin-left: 17px;
        position: relative;
        &:before {
          content: '';
          position: absolute;
          left: -9px;
          top: 8px;
          height: 16px;
          width: 1px;
          background: #ddd;
        }
        i {
          font-size: 14px;
        }
      }
      .page {
        float: right;
      }
    }
  }
}
</style>

<style lang="scss">
.table-popover-pop {
  padding: 15px 8px;
  text-align: left;
}
.datablau-option {
  .table-option {
    text-align: center;
  }
}
.table-header-tooltip {
  padding: 12px 8px;
  width: 260px;
}
.table-blood-popover {
  padding: 0 8px;
  .blood-popover-box {
    position: relative;
    max-height: 350px;
    .title {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      padding-left: 12px;
      font-weight: 600;
      color: #555555;
      border-bottom: 1px solid #ddd;
    }
    .path-list-box {
      position: absolute;
      top: 40px;
      left: 0;
      right: 0;
      bottom: 10px;
      overflow-y: auto;
      .list {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #ddd;
        padding: 0 12px;
        box-sizing: border-box;
        font-size: 12px;
        &:last-child {
          border-bottom: 0;
        }
        &.list-head {
          .en-name,
          .zh-name {
            font-weight: 600;
          }
        }
        .en-name {
          float: left;
          width: 50%;
        }
        .zh-name {
          float: left;
          width: 50%;
        }
      }
    }
  }
}
.identify-popper {
  .cancel {
    display: inline-block;
    width: 40px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    margin-left: 8px;
    cursor: pointer;
    font-size: 12px;
  }
  .sure {
    font-size: 12px;
    display: inline-block;
    width: 40px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
    background: transparentize(#409eff, 0.9);
    border-radius: 2px;
    color: #409eff;
  }
}
</style>
