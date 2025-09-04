<template>
  <div
    class="tab-page tab-page-ver2"
    style="min-width: 1150px; top: 0"
    :class="{ rules: typeState === 'rules' }"
  >
    <datablau-dialog
      class="jobs-sta"
      width="800"
      :title="$t('quality.page.qualityExamineJob.taskStatus')"
      :visible.sync="showJobsStaPop"
      append-to-body
      ref="popover_jobs_sta"
    >
      <job-run-report
        v-if="showJobsStaPop"
        :jobId="jobInstanceId"
        :showTopLine="true"
        :getHistoryLog="false"
      ></job-run-report>
    </datablau-dialog>
    <datablau-dialog
      width="900px"
      :visible.sync="showHistoryDialog"
      append-to-body
      :title="historyTitle"
      style="position: relative"
    >
      <div>
        {{
          $t('quality.page.qualityExamineJob.historyData', {
            historyData: historyData.length,
          })
        }}
      </div>
      <div style="height: 200px">
        <div
          style="
            margin-top: 30px;
            position: absolute;
            top: 0;
            left: 20px;
            right: 20px;
            bottom: 20px;
          "
        >
          <datablau-table
            height="100%"
            :data="historyData"
            v-loading="historyLoading"
            style="height: 100%"
          >
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.startTime')
              "
              prop="startTime"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.endTime')
              "
              prop="endTime"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="
                $t(
                  'quality.page.qualityExamineJob.historyDataTable.timeConsuming'
                )
              "
            >
              <template slot-scope="scope">
                <span>
                  {{
                    expend(
                      historyData[scope.$index].endTime -
                        historyData[scope.$index].startTime
                    )
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.scoring')
              "
            >
              <template slot-scope="scope">
                <span>
                  {{ scoreFormatter(historyData[scope.$index].result) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.operation')
              "
              align="center"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="showJobResult2(scope.$index)"
                >
                  {{ $t('common.button.scan') }}
                </el-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
    </datablau-dialog>
    <datablau-filter-row>
      <div class="row-inner" style="padding-top: 1px">
        <!--        <span class="label">搜索</span>-->
        <el-radio-group
          class="screen-switch-radio"
          v-model="isSelf"
          @change="filterSelf"
        >
          <el-tooltip
            :content="$t('quality.page.qualityExamineJob.showSelf')"
            placement="top-start"
            :open-delay="500"
          >
            <el-radio-button
              :label="true"
              v-if="$auth['QUALITY_CHECK_TASK_VIEW_MY']"
            >
              <i class="iconfont icon-ownsee"></i>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip
            :content="$t('quality.page.qualityExamineJob.showGroup')"
            placement="top-start"
            :open-delay="500"
          >
            <el-radio-button
              :label="false"
              v-if="$auth['QUALITY_CHECK_TASK_VIEW_ALL']"
            >
              <i class="iconfont icon-manysee"></i>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
        <datablau-input
          maxlength="100"
          style="
            width: 160px;
            min-width: 130px;
            margin-left: 10px;
            display: inline-block;
          "
          :placeholder="$t('quality.page.qualityExamineJob.jobPlaceholder')"
          v-model="keyword"
          :iconfont-state="true"
          clearable
        ></datablau-input>
        <span style="margin-left: 8px; margin-right: 6px">
          {{ $t('quality.page.qualityExamineJob.chooseModelCategoryId') }}
        </span>
        <datablau-select
          style="width: 140px; display: inline-block"
          filterable
          clearable
          v-model="systemValue"
        >
          <el-option
            v-for="item in systemList"
            :key="item.categoryId"
            :label="item.categoryName + '（' + item.categoryAbbreviation + '）'"
            :value="item.categoryId"
          ></el-option>
        </datablau-select>
        <span style="margin-left: 8px; margin-right: 6px">
          {{ $t('quality.page.qualityExamineJob.cycle') }}
        </span>
        <datablau-select
          style="
            width: 6vw;
            min-width: 100px;
            margin-right: 10px;
            display: inline-block;
          "
          v-model="runCycle"
        >
          <el-option
            v-for="item in runCycleArr"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
        <!--        <span style="margin-left:20px">创建时间：</span>-->
        <datablau-dateRange
          v-model="dataTime"
          value-format="yyyy-MM-dd"
          clearable
          style="min-width: 240px; display: inline-block; vertical-align: top"
        ></datablau-dateRange>
        <datablau-button
          type="text"
          @click="showTop = !showTop"
          style="display: inline-block"
          class="iconfont icon-filter"
          v-if="$versionFeature['domain_DataRule'] && typeState !== 'rules'"
        >
          {{
            showTop
              ? $t('quality.page.qualityRule.index.openScreen')
              : $t('quality.page.qualityRule.index.foldScreen')
          }}
        </datablau-button>
        <datablau-button
          type="normal"
          style="margin-left: 10px"
          @click="searchTab"
        >
          {{ $t('quality.page.qualityExamineJob.search') }}
        </datablau-button>
        <div class="page-btn-group right-top" style="top: 2px">
          <el-dropdown @command="handleCommand" trigger="click">
            <datablau-button
              type="important"
              v-if="$auth['QUALITY_CHECK_TASK_ADD'] && typeState !== 'rules'"
              class="iconfont icon-tianjia"
            >
              {{ $t('quality.page.qualityExamineJob.createTask') }}
              <i
                class="el-icon-arrow-down el-icon--right"
                style="color: #fff"
              ></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown" class="menu head-dropdown">
              <el-dropdown-item command="dataQualityAdd">
                <!-- <i class="iconfont icon-tianjia"></i> -->
                新建质量检核任务
              </el-dropdown-item>
              <el-dropdown-item
                command="domainAdd"
                v-if="$versionFeature['domain_DataRule']"
              >
                新建标准检核任务
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div
          style="margin-top: 6px"
          v-if="$versionFeature['domain_DataRule'] && typeState !== 'rules'"
        >
          <span style="margin-left: 29px; margin-right: 6px">任务类型</span>
          <datablau-select
            style="width: 160px; margin-right: 10px; display: inline-block"
            v-model="jobTypeName"
            clearable
          >
            <el-option
              v-for="item in typeOption"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </datablau-select>
        </div>
      </div>
    </datablau-filter-row>
    <datablau-form-submit
      class="table-row"
      :style="{ 'margin-top': showTop ? '40px' : '0px' }"
    >
      <!-- @row-click="handleRowClick" -->
      <datablau-table
        :data="jobsDisplay"
        ref="multipleTable"
        height="100%"
        style="height: 100%"
        :key="tableKey"
        @selection-change="handleSelectionChange"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
        :cell-style="cellStyle"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <el-table-column width="18">
          <datablau-icon
            :data-type="'examinejob'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('quality.page.qualityExamineJob.table.jobName')"
          width="200px"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="modelCategoryId"
          :formatter="$mappingCategory"
          width="200px"
          show-overflow-tooltip
          :label="$t('quality.page.qualityExamineJob.table.system')"
        ></el-table-column>
        <el-table-column
          prop="jobType"
          label="任务类型"
          min-width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.jobType }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('quality.page.qualityExamineJob.table.creator')"
          min-width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.creator }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityExamineJob.table.runCycle')"
          :width="$i18n.locale === 'zh' ? '80' : '200'"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ runCycleObj[scope.row.runCycle] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('quality.page.qualityExamineJob.table.lastResult')"
          :width="$i18n.locale === 'zh' ? '120' : '200'"
        >
          <template slot-scope="scope">
            <p
              v-if="scope.row.lastRunStatus === 'FAILED'"
              style="color: #f2220a"
            >
              <i class="el-icon-warning-outline"></i>
              {{
                $t('quality.page.qualityExamineJob.table.lastResultTip.label1')
              }}
            </p>
            <div v-else>
              <el-popover
                placement="right"
                trigger="hover"
                :width="$i18n.locale === 'zh' ? '250' : '380'"
              >
                <div class="contentProgress">
                  <p>
                    <span class="red"></span>
                    {{
                      $t(
                        'quality.page.qualityExamineJob.table.lastResultTip.label2'
                      )
                    }}{{ scope.row.lastRunFailedNumber }}
                  </p>
                  <p>
                    <span class="yellow"></span>
                    {{
                      $t(
                        'quality.page.qualityExamineJob.table.lastResultTip.label3'
                      )
                    }}{{ scope.row.lastRunErrorNumber }}
                  </p>
                  <p>
                    <span class="green"></span>
                    {{
                      $t(
                        'quality.page.qualityExamineJob.table.lastResultTip.label4'
                      )
                    }}{{ scope.row.lastRunNoErrorNumber }}
                  </p>
                </div>
                <div slot="reference">
                  <div class="resultProgress">
                    <div
                      class="progress"
                      v-for="(item, index) in scope.row.lastResult"
                      :key="index"
                      :style="{
                        background: item.color,
                        width: item.width + 'px',
                      }"
                    ></div>
                  </div>
                </div>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createOn"
          :formatter="$timeFormatter"
          :label="$t('quality.page.qualityExamineJob.table.creatTime')"
          min-width="150"
        ></el-table-column>
        <el-table-column
          prop="lastRunStartTime"
          :formatter="$timeFormatter"
          :label="$t('quality.page.qualityExamineJob.table.lastRunStartTime')"
          min-width="150"
        ></el-table-column>
        <el-table-column
          prop="lastRunEndTime"
          :formatter="$timeFormatter"
          :label="$t('quality.page.qualityExamineJob.table.lastRunEndTime')"
          min-width="150"
        ></el-table-column>
        <el-table-column
          prop="nextRunTime"
          :formatter="$timeFormatter"
          :label="$t('quality.page.qualityExamineJob.table.nextRunStartTime')"
          :min-width="$i18n.locale === 'zh' ? 160 : 170"
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityExamineJob.table.operation')"
          align="center"
          width="220"
          fixed="right"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-switch
              :disabled="
                jobStatus[scope.row.jobId] && !!scope.row.lastRunEndTime
              "
              v-model="scope.row.disabled"
              :active-value="false"
              :inactive-value="true"
              style="display: inline-block; margin-right: 10px"
              v-if="$auth['QUALITY_CHECK_TASK_START'] && typeState !== 'rules'"
              :title="
                scope.row.disabled
                  ? $t('quality.page.qualityExamineJob.table.enable')
                  : $t('quality.page.qualityExamineJob.table.disable')
              "
              @change="enableOrDisableJob(scope.row)"
            ></datablau-switch>
            <datablau-button
              type="icon"
              style="display: inline-block"
              :disabled="
                jobStatus[scope.row.jobId] && !!scope.row.lastRunEndTime
              "
              :title="$t('quality.page.qualityExamineJob.table.result')"
              @click.prevent.stop="showJobResult(scope.row)"
            >
              <i class="iconfont icon-see"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :disabled="
                jobStatus[scope.row.jobId] && !!scope.row.lastRunEndTime
              "
              v-if="$auth['QUALITY_CHECK_TASK_EDIT'] && typeState !== 'rules'"
              :title="$t('common.button.edit')"
              @click.prevent.stop="editJob(scope.$index)"
            >
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
            <datablau-button
              v-if="jobStatus[scope.row.jobId] && typeState !== 'rules'"
              type="text"
              class="text-btn-in-table"
              style="
                margin-left: 3px;
                width: 100px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                display: inline-block;
                vertical-align: middle;
                overflow: hidden;
              "
              v-popover:popover_jobs_sta
              @click.prevent.stop="showJobsStatu(scope)"
            >
              <i
                style="top: 2px; padding: 0; font-size: 16px"
                class="el-icon-refresh-right animation"
              ></i>
              <!--              {{ $version.quality.job.running }}-->
              {{ currentStep && currentStep[scope.row.jobId] }}
            </datablau-button>
            <datablau-button
              type="icon"
              v-else
              v-show="
                $auth['QUALITY_CHECK_TASK_OPERATION'] && typeState !== 'rules'
              "
              :title="$t('quality.page.qualityExamineJob.table.playTooltip')"
              :disabled="jobStatus[scope.row.jobId] || scope.row.disabled"
              @click.prevent.stop="runJob(scope.$index)"
            >
              <i class="iconfont icon-working"></i>
            </datablau-button>
          </template>
        </el-table-column>
        <!--        <el-table-column width="10" fixed="right"></el-table-column>-->
      </datablau-table>
      <template slot="buttons">
        <!-- v-if="writable" -->
        <div
          class="left-button"
          v-show="
            multipleSelection.length > 0 && $auth['QUALITY_CHECK_TASK_DELETE']
          "
        >
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: multipleSelection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="preDeleteRows"
            v-if="$auth['QUALITY_CHECK_TASK_DELETE']"
            :disabled="deleteJobDisabled"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          v-if="paginationShow"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import jobList from './jobList.js'
export default jobList
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.contentProgress {
  padding: 8px;
  p {
    padding-bottom: 8px;
    &:last-child {
      padding-bottom: 0px;
    }
    span {
      width: 8px;
      height: 8px;
      border-radius: 100%;
      display: inline-block;
      margin-bottom: 1px;
      margin-right: 1px;
      &.red {
        background: $red;
      }
      &.yellow {
        background: $yellow;
      }
      &.green {
        background: $green;
      }
    }
  }
}
.resultProgress {
  width: 100px;
  height: 8px;
  // border: 1px solid #fff;
  background-color: #eee;
  border-radius: 100px;
  overflow: hidden;
  &.resultProgressNo {
    .progress {
      &:first-child {
        border-right: none;
      }
      &:last-child {
        border-left: none;
      }
    }
  }
  span {
    display: inline-block;
    width: 2px;
    height: 8px;
    background: #fff;
  }
  .progress {
    // width: 25%;
    height: 8px;
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    &.red {
      background: $red;
    }
    &.yellow {
      background: $yellow;
    }
    &.green {
      background: $green;
    }
  }
}
.switch-in-table {
  top: -1px;
}
.rules {
  margin-left: -20px;
  margin-right: -20px;
}
.statusClass {
  padding-left: 14px;
  position: relative;
  &::before {
    position: absolute;
    content: '';
    top: 7px;
    left: 0;
    width: 6px;
    height: 6px;
    border-radius: 100%;
  }
  &.statusClass1 {
    color: #66bf16;
    &::before {
      background: #66bf16;
    }
  }
  &.statusClass2 {
    color: #ff4b53;
    &::before {
      background: #ff4b53;
    }
  }
  &.statusClass3 {
    color: #409eff;
    &::before {
      background: #409eff;
    }
  }
  &.statusClass4 {
    color: #5dc4c0;
    &::before {
      background: #5dc4c0;
    }
  }
  &.statusClass5 {
    color: #a05ee8;
    &::before {
      background: #a05ee8;
    }
  }
  &.statusClass6 {
    color: #53a7ad;
    &::before {
      background: #53a7ad;
    }
  }
  &.statusClass7 {
    color: #e6ad00;
    &::before {
      background: #e6ad00;
    }
  }
  &.statusClass8 {
    color: #999999;
    &::before {
      background: #999999;
    }
  }
}
.table-row {
  top: 34px;
  // left: 20px;
  // right: 20px;
  margin-top: 10px;
  transition: margin-top 0.6s;
  &.monitor {
    top: 90px;
  }
}
.jobs-sta {
  .top-filter-line {
    margin-bottom: 10px;
  }
}
.white-space {
  display: inline-block;
  width: 20px;
}
.top-button {
  position: absolute;
  top: 50px;
  right: 0;
}
.left-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 20px;
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
</style>
<style lang="scss">
.el-dropdown-menu.head-dropdown.menu {
  width: auto;
}
</style>
