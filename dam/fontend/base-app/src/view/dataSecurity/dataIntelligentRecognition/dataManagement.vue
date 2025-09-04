<template>
  <div v-loading="tableLoading" id="dir-data-management">
    <div class="page-title-row">
      <span class="menu font-medium">智能识别结果</span>
    </div>
    <div class="nav-box">
      <datablau-tabs v-model="currentTableName" @tab-click="handleSelect">
        <el-tab-pane label="识别到的标签" name="tag"></el-tab-pane>
        <el-tab-pane label="识别到的目录" name="infoCatalog"></el-tab-pane>
        <el-tab-pane label="识别到的标准" name="domain"></el-tab-pane>
        <el-tab-pane label="识别到的安全等级" name="dataAuth"></el-tab-pane>
        <el-tab-pane label="识别到的脱敏函数" name="datamask"></el-tab-pane>
      </datablau-tabs>
    </div>
    <datablau-list-search style="padding: 0 20px; margin-top: 10px">
      <datablau-input
        placeholder="搜索识别对象名称、打标规则"
        :iconfont-state="true"
        v-model="keyword"
        clearable
      ></datablau-input>
      <!-- <datablau-datePicker
        style="display: inline-block; margin-left: 20px"
        :datapicker-title="'时间筛选：'"
        @changeDateTime="changeEventStartTime"
        v-model="eventStartTime"
        :placeholder="'选择日期'"
        ref="eventStartTime"
      ></datablau-datePicker> -->
      <div class="label">审批状态：</div>
      <datablau-select
        @change="changeStatus"
        v-model="currentStatus"
        placeholder="筛选审批状态"
        clearable
      >
        <el-option
          v-for="item in opt"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </datablau-select>
      <div class="label">对象类型：</div>
      <datablau-select
        @change="changeObjectType"
        v-model="currentType"
        placeholder="筛选对象类型"
        clearable
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </datablau-select>
      <template slot="buttons">
        <datablau-button type="important" @click="exportData">
          导出
        </datablau-button>
      </template>
    </datablau-list-search>
    <div class="table-box">
      <datablau-form-submit>
        <datablau-table
          row-key="id"
          ref="table"
          style="width: 100%"
          height="100%"
          :data="currentTableData"
          :data-selectable="true"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="name"
            label="识别对象名称"
            min-width="120"
          >
            <template slot-scope="scope">
              <span
                @click="jumpToColumn(scope.row)"
                style="cursor: pointer; color: #409eff"
              >
                {{ formatObjectName(scope.row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="识别对象"
            min-width="100"
            prop="typeId"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div
                v-if="
                  scope.row.elementObjectDto &&
                  scope.row.elementObjectDto.typeId === 80000004
                "
                class="meta-data surface"
              >
                表
              </div>
              <div
                v-if="
                  scope.row.elementObjectDto &&
                  scope.row.elementObjectDto.typeId === 80500008
                "
                class="meta-data view"
              >
                视图
              </div>
              <div
                v-if="
                  scope.row.elementObjectDto &&
                  scope.row.elementObjectDto.typeId === 80000005
                "
                class="meta-data field"
              >
                字段
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="currentTableName === 'datamask'"
            label="脱敏层级"
            min-width="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{
                scope.row.datamaskType === ''
                  ? '静态脱敏'
                  : scope.row.datamaskType
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="所属路径"
            min-width="200"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ getCurrentPath(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            :label="getCurrentNameLabel()"
            min-width="130"
          >
            <template slot-scope="scope">
              {{ getCurrentName(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            sortable
            :formatter="timeFormatter"
            label="识别时间"
            :min-width="150"
          ></el-table-column>
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="ruleName"
            label="打标规则"
            :min-width="120"
          >
            <template scope="{row}">
              <span>{{ row.ruleName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" :min-width="100">
            <template slot-scope="scope">
              <span
                class="circle"
                :style="`background-color:${getStatusColor(scope.row.status)}`"
              ></span>
              <span :style="`color:${getStatusColor(scope.row.status)}`">
                {{ getStatus(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <template>
                <datablau-tooltip
                  effect="dark"
                  content="批准"
                  placement="bottom"
                >
                  <datablau-button
                    class="iconfont icon-approve"
                    @click="updateStatus(scope.row, 'APPROVED')"
                    type="text"
                    :disabled="scope.row.status === 'PENDING' ? false : true"
                  ></datablau-button>
                </datablau-tooltip>
                <datablau-tooltip
                  effect="dark"
                  content="移除"
                  placement="bottom"
                >
                  <datablau-button
                    class="iconfont icon-delete"
                    :disabled="scope.row.status === 'PENDING' ? false : true"
                    @click="updateStatus(scope.row, 'DELETED')"
                    type="text"
                  ></datablau-button>
                </datablau-tooltip>
              </template>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="bottom">
            <span v-if="mutipleLength" class="check-info"></span>
            <span v-if="mutipleLength" class="footer-row-info">
              当前选中“{{ mutipleLength }}条”信息，是否
            </span>
            <datablau-tooltip
              v-if="mutipleLength"
              style="margin-right: 10px"
              :manual="canClick"
              content="已批准的无法操作"
              placement="top"
              effect="dark"
            >
              <datablau-button
                class="iconfont icon-approve"
                @click="batchUpdateStatus('APPROVED')"
                :disabled="!canClick"
              >
                批准
              </datablau-button>
            </datablau-tooltip>
            <datablau-tooltip
              v-if="mutipleLength"
              :manual="canClick"
              content="已删除的无法操作"
              placement="top"
              effect="dark"
            >
              <datablau-button
                type="danger"
                :disabled="!canClick"
                class="el-icon-delete"
                @click="batchUpdateStatus('DELETED')"
              >
                移除
              </datablau-button>
            </datablau-tooltip>
            <datablau-pagination
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
              :current-page.sync="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="currentPageSize"
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
import dataManagement from './dataManagement.js'
export default dataManagement
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.meta-data {
  border-radius: 2px;
  display: inline-block;
  padding: 0px 6px;
  width: auto;
  height: 22px;
  line-height: 22px;
  vertical-align: middle;
  color: #719ff5;
  font-size: 12px;
  margin: 0 auto;
  &.surface {
    color: #0095d9;
    background: transparentize(#0095d9, 0.9);
  }
  &.view {
    color: #4b5cc4;
    background: transparentize(#4b5cc4, 0.9);
  }
  &.field {
    color: #b44c97;
    background: transparentize(#b44c97, 0.9);
  }
}
#dir-data-management {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  .header {
    box-sizing: border-box;
    padding: 0 20px;
    width: 100%;
    height: 50px;
    .title {
      float: left;
      font-size: 16px;
      line-height: 50px;
    }
  }
  .nav-box {
    padding: 0 20px;
    /deep/ .el-tabs {
      .el-tabs__content {
        display: none;
      }
    }
  }
  .table-box {
    position: absolute;
    top: 128px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
  }
  .bottom {
    box-sizing: border-box;
    padding: 8px 20px;
    //padding-top: 10px;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;
    .page {
      float: right;
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
  }
  .label {
    padding-left: 20px;
    padding-right: 10px;
    display: inline-block;
  }
  .circle {
    display: inline-block;
    margin-right: 10px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    position: relative;
    bottom: 1px;
  }
}
</style>
