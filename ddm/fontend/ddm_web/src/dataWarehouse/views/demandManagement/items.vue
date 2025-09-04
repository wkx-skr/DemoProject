<template>
  <div style="margin-right: 20px">
    <project v-show="false"></project>
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
      <!-- <span class="label">{{ $t('indicator.demand.type.label') }}</span>
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
      </datablau-select> -->
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
          v-if="auth['DDD_DEMAND_CREATE']"
        >
          {{ $t('indicator.demand.addDemand') }}
        </datablau-button>
      </div>
    </div>
    <datablau-dialog
          :visible.sync="showUsersApply"
          title="审批"
          width="500px"
          append-to-body
          >
        <div class="content">
          <datablau-form
            size="small"
            label-width='90px'
            :model="formExamine"
            ref="form"
          >
            <el-form-item
              label="选择审批人"
              prop="approver"
            >
              <datablau-select
                v-model="formExamine.approver"
                size="mini"
                clearable
                style="width: 300px;"
                filterable
                multiple
                remote
                :remote-method="remoteMethod"
                @focus="changeApproverlList('')"
                @clear="changeApproverlList('')"
                @change="changeApproverlList"
                v-selectLazyLoad="approverListloading"
              >
                <el-option
                  v-for="v in userList"
                  :key="v.username"
                  :label="v.fullUserName+'('+v.username+')'"
                  :value="v.username"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </datablau-form>
        </div>
        <span slot="footer">
          <datablau-button @click="closeBtn" type="secondary">取 消</datablau-button>
          <datablau-button type="primary" :disabled="formExamine.approver.length === 0" @click="applicationApproval">
            确 定
          </datablau-button>
        </span>
      </datablau-dialog>
    <datablau-form-submit style="margin-top: 50px">
      <datablau-table
        :data="tableData"
        style="width: 100%; height: 100%"
        tooltip-effect="dark"
        data-selectable
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        height="100%"
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
          min-width="130"
          :label="$t('indicator.demand.state')"
          prop="requirementStauts"
          show-overflow-tooltip
        >
          <template slot="header" slot-scope="scope">
            <span :data="scope.$index" class="table-label required">{{$t('indicator.demand.state')}}
              <el-popover
                placement="top"
                width="818"
                trigger="hover">
                <datablau-detail-subtitle title="流程说明" mt="0px" mb="0"></datablau-detail-subtitle>
                <img  src="./flowchart.png"  style="width:100%;height: auto;"/>
                <span class="iconfont icon-tips" style="color: #999;font-size: 14px;;margin-left: 2px;" slot="reference"></span>
              </el-popover>
            </span>
          </template>
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
          min-width="130"
          label="所属项目"
          prop="projectName"
          show-overflow-tooltip
        >
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
          min-width="160"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button type="icon" @click="handleItemClick(scope.row)" v-if="auth['DDD_DEMAND_VIEW']">
              <datablau-tooltip
                :content="$t('common.button.scan')"
                placement="bottom"
              >
                <i class="iconfont icon-see"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button v-if="auth['DDD_DEMAND_BUSINESS_EDIT'] || auth['DDD_DEMAND_TECH_EDIT']" type="icon" :disabled="!((scope.row.requirementStauts === 'A' || scope.row.requirementStauts === 'RJ') && auth['DDD_DEMAND_BUSINESS_EDIT'] && ((scope.row.requirementLeader === $store.state.user.name)|| isAdmin)) && !((scope.row.requirementStauts === 'C'||scope.row.requirementStauts === 'RK') && auth['DDD_DEMAND_TECH_EDIT'])" @click="EditClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.edit')"
                placement="bottom"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
            <!-- <datablau-button type="icon" @click="DeleteClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.delete')"
                placement="bottom"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
            </datablau-button> -->
            <datablau-button type="icon" v-if="auth['DDD_DEMAND_APPROVAL']" @click="applyRelease(scope.row)" :disabled="scope.row.module==='D3'?!((scope.row.requirementStauts === 'A' || scope.row.requirementStauts === 'C')&& scope.row.projectName ) : (scope.row.requirementStauts !== 'A' && scope.row.requirementStauts !== 'C')">
              <datablau-tooltip
                content="审批"
                placement="bottom"
              >
                <i class="iconfont icon-menu-bwdsq"></i>
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
          <!-- <datablau-button
            type="danger"
            v-show="multipleLength"
            @click="DeleteClick"
          >
            <i class="iconfont icon-shanchu"></i>
            {{ $t('common.button.delete') }}
          </datablau-button> -->
          <datablau-button
            type="important"
            v-show="multipleLength"
            @click="addPro"
            :disabled="addProDisabled"
          >
            创建项目
          </datablau-button>
          <datablau-tooltip
              popper-class="tooltipBox"
              content="只能选择未绑定的需求进行创建项目"
              placement="bottom"
              effect="dark"
            >
              <i
                class="icon-tips iconfont settingIcon"
                type="icon"
                style="margin-left: 10px;"
                v-show="multipleLength"
              >
              </i>
            </datablau-tooltip>
            <datablau-button
            type="important"
            v-show="multipleLength"
            @click="applyChanges"
            :disabled="applyChangesDisabled"
            style="margin-left: 8px;"
          >
            申请变更
          </datablau-button>
          <datablau-button
            type="important"
            v-show="multipleLength"
            @click="applyAbolish"
            :disabled="applyChangesDisabled"
          >
            申请废弃
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
  // right: 0;
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
