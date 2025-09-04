<template>
  <div class="identify-result-page">
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
            placeholder="搜索数据资产名称"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="业务系统">
          <datablau-select
            style="width: 160px"
            v-model="form.system"
            @change="handleSystemChange"
            filterable
            clearable
            placeholder="安全业务系统 "
          >
            <el-option
              v-for="item in systemList"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="数据源">
          <datablau-select
            style="width: 160px"
            v-model="form.datasource"
            @change="handleDatasourceChange"
            filterable
            clearable
            placeholder="信息数据源 "
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
            placeholder="数据schema"
          >
            <el-option
              v-for="item in schemaList"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="表" class="search-tree-box">
          <datablau-select
            ref="loadSelect"
            style="width: 160px"
            v-model="form.tableId"
            :disabled="!form.schema"
            filterable
            clearable
            remote
            v-selectLazyLoad="lazyloading"
            :remote-method="remoteMethod"
            placeholder="支持模糊搜索"
          >
            <el-option
              v-for="item in tableList"
              :key="item.objectId"
              :label="item.name"
              :value="item.objectId"
            ></el-option>
            <el-option v-if="selectTableLoading" value="" class="table-option">
              加载中...
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="安全等级">
          <datablau-select
            style="width: 120px"
            v-model="form.levelId"
            filterable
            clearable
            placeholder="全部 "
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
            {{ $t('assets.common.query') }}
          </datablau-button>
          <datablau-button type="secondary" @click="reset">
            {{ $t('assets.common.reset') }}
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
                  :content="'该条数据资产已有确认结果，不能再次确认结果'"
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
                :data-type="getType(scope.row.typeId)"
                :size="20"
                style="position: relative; top: 3px; left: -3px"
              ></datablau-icon>
            </template>
          </el-table-column>
          <el-table-column
            :label="'数据资产名称'"
            prop="assetName"
            :min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ getName(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="'业务系统'"
            prop="categoryName"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'数据源'"
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
          <el-table-column :label="'表'" prop="tableName" :min-width="100">
            <template slot-scope="scope">
              <el-popover
                popper-class="table-popover-pop"
                placement="bottom"
                width="408"
                trigger="hover"
                @show="showTablePop(scope.row)"
                transition="fade-in-linear"
              >
                <div class="catalog-name" slot="reference">
                  {{ scope.row.tableName }}
                </div>
                <table-pop
                  v-if="columnLoading"
                  :columnData="columnData"
                ></table-pop>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            :label="'识别安全分类'"
            prop="catalogList"
            :min-width="getMinWidth(typeNum)"
          >
            <template
              slot-scope="scope"
              v-if="scope.row.catalogList && scope.row.catalogList[0]"
            >
              <table-popover :row="scope.row"></table-popover>
            </template>
          </el-table-column>
          <el-table-column
            :label="'安全等级'"
            prop="level"
            :min-width="150"
            show-overflow-tooltip
          >
            <template slot="header">
              <div class="level-header">
                安全等级
                <!-- 组价不支持 -->
                <el-tooltip
                  :visible-arrow="false"
                  popper-class="table-header-tooltip"
                >
                  <div slot="content">
                    1、默认显示已选安全分类对应的安全等级。
                    <br />
                    2、当在【识别安全分类】列中进行更换操作，对应的安全等级会继承新分类新等级。
                    可通过多选批量修改安全等级
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
                v-if="scope.row.ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE"
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
                    更多 {{ scope.row.levelList.length - 1 }}
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
                    安全等级：{{ scope.row.levelList.length }}条
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
              <span
                v-else
                class="normal-level"
                :class="{ 'animate-level': scope.row.changeLevel }"
              >
                <!-- :style="getLevel(scope.row, 2)" -->
                <!-- <i class="iconfont icon-safetylevel"></i> -->
                {{ getLevel(scope.row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="'识别时间'"
            prop="discernTime"
            sortable="custom"
            :min-width="140"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'识别规则'"
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
            :label="'优先级'"
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
            <template v-if="selections.length > 0">
              <span class="check-info"></span>
              <span class="footer-row-info">
                当前选中“{{ selections.length }}条”数据，是否
              </span>
              <datablau-button
                :disabled="noNext"
                @click="sureSubmit"
                type="important"
              >
                提交评审
              </datablau-button>
              <datablau-button
                :disabled="noNext"
                @click="handlerClick(1)"
                type="secondary"
              >
                待梳理
              </datablau-button>
              <datablau-button
                :disabled="noNext"
                @click="handlerClick(2)"
                type="secondary"
              >
                暂不梳理
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
                  placeholder="修改安全等级"
                  style="display: inline-block; margin-left: 10px; width: 166px"
                >
                  <el-option
                    :label="item.name"
                    :value="item.tagId"
                    v-for="item in levelList"
                    :key="item.tagId"
                  ></el-option>
                </datablau-select>
                <div class="cancel" @click="cancelPopover">取消</div>
                <div class="sure" @click="changeLevel">确定</div>
                <datablau-button
                  :disabled="noNext"
                  type="normal"
                  slot="reference"
                  class="select-btn"
                >
                  <i class="iconfont icon-safetylevel"></i>
                  修改安全等级
                </datablau-button>
              </el-popover>
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
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
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
  // animation: all 1s;
  // background: transparentize($color: $primary-color, $amount: 1);
  &.animate-level {
    // background: transparentize($color: $primary-color, $amount: 0);
    animation: change 0.2s infinite;
    line-height: 22px;
    // color: #fff;
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

      .check-info {
        width: 14px;
        height: 14px;
        display: inline-block;
        background: $primary-color;
        margin-right: -13px;
        vertical-align: middle;
      }

      .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &:before {
          content: '\e6da';
          font-family: 'element-icons';
          font-size: 12px;
          font-weight: 200;
          margin-right: 5px;
          vertical-align: middle;
          line-height: 13px;
          color: white;
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
}
.datablau-option {
  .table-option {
    text-align: center;
  }
}
.table-header-tooltip {
  padding: 12px 8px;
  width: 240px;
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
