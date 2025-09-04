<template>
  <div style="margin-right: 20px">
    <div class="row-filter">
      <datablau-input
        v-model="keyword"
        iconfont-state
        style="display: inline-block; width: 252px"
        clearable
        :placeholder="$t('indicator.demand.searchPlaceholder')"
        @keydown.enter.native="changePage"
      ></datablau-input>
      <span class="label">{{ $t('indicator.demand.state') }}</span>
      <datablau-select
        clearable
        v-model="conditions.requirementStatus"
        style="width: 100px; display: inline-block"
      >
        <el-option
          v-for="item in stautsOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </datablau-select>
      <span class="label">{{ $t('indicator.demand.type.label') }}</span>
      <datablau-select
        clearable
        v-model="conditions.dmndType"
        style="width: 100px; display: inline-block"
      >
        <el-option
          :label="$t('indicator.demand.type.新增')"
          value="新增"
        ></el-option>
        <el-option
          :label="$t('indicator.demand.type.优化')"
          value="优化"
        ></el-option>
        <el-option
          :label="$t('indicator.demand.type.缺陷修复')"
          value="缺陷修复"
        ></el-option>
      </datablau-select>
      <datablau-button
        type="primary"
        @click="changePage"
        style="margin-left: 10px"
      >
        {{ $t('quality.page.ruleReport.query') }}
      </datablau-button>
      <div style="position: absolute; right: 0; top: 10px; right: 20px">
        <datablau-button
          type="important"
          class="iconfont icon-tianjia"
          style="float: right"
          @click="addDemand"
        >
          {{ $t('indicator.demand.addDemand') }}
        </datablau-button>
      </div>
    </div>
    <datablau-form-submit style="margin-top: 50px">
      <datablau-table
        :data="tableData"
        style="width: 100%; height: 100%"
        tooltip-effect="dark"
        data-selectable
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          min-width="100"
          :label="$t('indicator.demand.code')"
          prop="requirementCode"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.requirementCode }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="140"
          :label="$t('indicator.demand.name')"
          prop="name"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('indicator.demand.priority')"
          prop="requirementPriority"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.requirementPriority }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('indicator.demand.state')"
          prop="requirementStauts"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span
              :style="`color:${getStatusColor(scope.row.requirementStauts)}`"
            >
              <span
                :style="`background-color:${getStatusColor(
                  scope.row.requirementStauts
                )}`"
                class="circle"
              ></span>
              {{ statusFormatter(scope.row.requirementStauts) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('indicator.demand.type.label')"
          prop="dmndType"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ $t('indicator.demand.type.' + scope.row.dmndType) }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('indicator.demand.module')"
          prop="module"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ $t('indicator.demand.' + scope.row.module) }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('indicator.demand.owner')"
          prop="requirementLeader"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.requirementLeader }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('meta.DS.tableDetail.changeHistory.submitTime')"
          prop="requirementCreatTime"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{
              scope.row.requirementCreatTime
                ? $timeFormatter(scope.row.requirementCreatTime).slice(0, 16)
                : ''
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('system.user.operation')"
          min-width="120"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button type="icon" @click="handleItemClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.scan')"
                placement="bottom"
              >
                <i class="iconfont icon-see"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button type="icon" @click="EditClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.edit')"
                placement="bottom"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button type="icon" @click="DeleteClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.delete')"
                placement="bottom"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!-- </div> -->
      <template slot="buttons">
        <div class="row-page-info">
          <span v-if="multipleLength" class="check-info"></span>
          <span v-if="multipleLength" class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: multipleLength,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            v-show="multipleLength"
            @click="DeleteClick"
          >
            <i class="iconfont icon-shanchu"></i>
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 500]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>
<script>
import items from './items.js'
export default items
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-filter {
  margin-top: 10px;
  vertical-align: middle;
  .label {
    margin: 0 10px 0 20px;
    &:first-of-type {
      //margin-left: 0;
    }
  }
  &.full {
    .label:first-of-type {
      margin-left: 20px;
    }
  }
}
.table-area {
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
  top: 50px;
  transition: top 0.5s ease-in-out;
  &.show {
    top: 100px;
  }
  .db-table {
    height: 100%;
  }
}
.row-page-info {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 30px;
  height: 50px;
  padding-left: 26px;
  margin-right: -20px;
  margin-left: -30px;
  overflow-x: visible;
  overflow-y: hidden;
  line-height: 50px;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: middle;
    background: $primary-color;
  }
  .footer-row-info {
    margin-right: 10px;
    &::before {
      margin-right: 5px;
      margin-left: -13px;
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
.circle {
  position: relative;
  bottom: 1px;
  display: inline-block;
  margin-right: 7px;
  background-color: #5cb793;
  border-radius: 3.5px;
  width: 7px;
  height: 7px;
}
</style>
