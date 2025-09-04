<template>
  <div
    class="rightView"
    v-loading="jobtype === 'ClusterColumnJobDescriptor' ? jobLoading : false"
  >
    <!-- <div @click="clickChange">11111</div> -->
    <datablau-dialog
      :title="$t('quality.page.qualityExamineJob.table.result')"
      :visible.sync="resultDialogVisible"
      size="l"
      class="dialog-job-item-result"
      append-to-body
    >
      <div class="job-item-result-container" v-html="nl2br(resultString)"></div>
    </datablau-dialog>
    <datablau-dialog
      class="jobs-sta"
      size="l"
      :title="$t('quality.page.qualityExamineJob.taskStatus')"
      :visible.sync="showJobsStaPop"
      append-to-body
      ref="popover_jobs_sta"
      custom-class="eltable-list-dialog"
    >
      <job-run-report
        :jobInstanceId="showInstanceId"
        :showTopLine="showTopLine"
      ></job-run-report>
    </datablau-dialog>
    <dataSource-model
      ref="dataSourceModel"
      @selDataSource="dataSource"
    ></dataSource-model>
    <div :class="{ lineageTab: lineageTab }">
      <div id="breadCrum" v-if="!isAdd">
        <el-breadcrumb
          class="breadCrum bread-crumb"
          separator=">"
          v-if="!couldEditName && !lineageTab"
        >
          <el-breadcrumb-item>
            {{ $t('system.job.jobDetail') }} - {{ jobDetails.name }}
          </el-breadcrumb-item>
          <!-- <span :value="jobDetails.name">{{jobDetails.name}}</span> -->
        </el-breadcrumb>
        <!-- <div class="edit-name" v-if="couldEditName">
        <span class="item-title">任务名称 :</span>
        <div class="input-container">
          <datablau-input
            size="mini"
            v-model="jobDetails.name"
          ></datablau-input>
        </div>
      </div> -->
        <datablau-form v-if="couldEditName">
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.table.jobName')"
          >
            <datablau-input
              size="mini"
              v-model="jobDetails.name"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
        <el-form style="padding-top: 20px" v-if="false">
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.table.jobName')"
            :rules="{ required: true }"
            v-if="couldEditName"
          >
            <datablau-input
              size="mini"
              v-model="jobDetails.name"
              v-if="couldEditName"
            ></datablau-input>
          </el-form-item>
        </el-form>
        <datablau-form
          ref="formData1"
          :model="lineageTabForm"
          :rules="rule1"
          label-width="180px"
          style="padding-top: 20px"
          v-if="lineageTab"
        >
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.table.jobName')"
            prop="lineageName"
          >
            <datablau-input
              v-model="lineageTabForm.lineageName"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
        <datablau-form style="padding-top: 20px" label-width="120px">
          <!--          <el-upload
            v-if="
              (jobDetails.type === 'MetadataSyncJobDescriptor' ||
                jobDetails.jobType === 'MetadataSyncJobDescriptor') &&
              jobDetails.jobContent.logical &&
              jobDetails.jobContent.logical === true
            "
            :action="uploadHost"
            :show-file-list="false"
            :accept="acceptTypes"
            :limit="1"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleFileRemoved"
            :headers="$headers"
            :on-change="handleUploadChange"
            :on-exceed="
              () => {
                $message.info($t('meta.dataSource.edit.oneFile'))
              }
            "
            :on-error="$showUploadFailure"
            ref="uploadFileUpdates"
          >
            <datablau-button type="primary">
              {{ $t('system.job.uploadFileUpdates') }}
            </datablau-button>
          </el-upload>-->
          <div>
            <el-form-item>
              <!--              <el-col
                :span="3"
                style="padding-right: 10px; width: 110px; text-align: right"
              >
                <span>{{ $t('system.job.isDisabled') }}</span>
              </el-col>-->
              <el-col
                :span="2"
                style="padding-right: 10px; width: 94px"
              ></el-col>
              <!--              <el-col
                :span="4"
                style="height: 34px; line-height: 2.5; width: auto"
              >
                <datablau-switch
                  v-model="jobDetails.disabled"
                  @change="setActiveState"
                  :width="50"
                  class="job-detail-switch"
                ></datablau-switch>
                <span :class="{ isActive: jobDetails.disabled }">
                  {{
                    jobDetails.disabled
                      ? this.$t('system.job.enabled')
                      : this.$t('system.job.disabled')
                  }}
                </span>
              </el-col>-->
              <el-col
                :span="4"
                style="height: 34px; line-height: 2.5; width: auto"
              >
                <datablau-switch
                  v-model="jobDetails.disabled"
                  @change="setActiveState"
                  :width="50"
                  class="job-detail-switch"
                  :active-text="this.$t('system.job.enabled')"
                  :inactive-text="this.$t('system.job.disabled')"
                ></datablau-switch>
              </el-col>
            </el-form-item>
            <!--            <el-form-item v-if="job.type === 'DomainVerifyJobDescriptor'">
              <el-col
                :span="3"
                style="padding-right: 10px; width: 110px; text-align: right"
              >
                <span>是否产出问题清单</span>
              </el-col>
              <el-col
                :span="4"
                style="height: 34px; line-height: 2.5; width: auto"
              >
                <div class="checkbox">
                  <datablau-radio v-model="generateQualityTaskPolicy">
                    <el-radio label="DEPEND_ON_DOMAIN">遵从标准设置</el-radio>
                    <el-radio label="FORCE_CREATE">是</el-radio>
                    <el-radio label="FORCE_NOT_CREATE">否</el-radio>
                  </datablau-radio>
                </div>
              </el-col>
            </el-form-item>-->
            <el-form-item :key="jobInRunning">
              <datablau-button
                v-if="!jobInRunning"
                type="important"
                @click="preRunAtOnce"
                :disabled="!jobDetails.disabled"
              >
                {{ $t('system.job.runTaskAtOnce') }}
              </datablau-button>
              <datablau-button v-else type="important" @click="showJobStatus">
                {{ $t('system.job.checkJobRunReport') }}
              </datablau-button>
              <datablau-button
                type="icon"
                v-if="jobInRunning"
                class="job-detail-icon"
              >
                <i class="el-icon-loading"></i>
              </datablau-button>
              <span class="currentStep" v-if="jobInRunning">
                {{ currentStep }}
              </span>
            </el-form-item>
          </div>
        </datablau-form>
      </div>
      <div class="create-ji" v-if="isAdd">
        <div class="form-sub-title detail-title schedule-message">
          <i class="user-detail-tu"></i>
          <span>{{ $t('quality.page.qualityExamineJob.essential') }}</span>
        </div>
        <datablau-form
          ref="formData"
          :model="lineageTabForm"
          :rules="rule1"
          label-width="180px"
          style="padding-top: 20px"
          v-if="lineageTab"
        >
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.table.jobName')"
            prop="lineageName"
          >
            <datablau-input
              v-model="lineageTabForm.lineageName"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
        <datablau-form
          class="page-form"
          label-position="right"
          label-width="180px"
          ref="form"
          v-else
        >
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.taskName')"
            :rules="{ required: true }"
          >
            <datablau-input
              v-model="jobName"
              class="input-detail"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div id="job-details">
        <!-- <el-row> -->
        <datablau-form label-width="180px">
          <div>
            <el-form-item class="sub-header" style="margin-left: -35px">
              <div class="form-sub-title detail-title schedule-management">
                <i class="user-detail-tu"></i>
                <span>{{ $t('system.job.scheduleManagement') }}</span>
              </div>
              <select-period
                style="transform: translateX(-27px)"
                @getCronString="getCronString"
                :cron="
                  jobDetails.schedule && jobDetails.schedule.includes('cron:')
                    ? jobDetails.schedule.split('cron:')[1]
                    : jobDetails.schedule
                "
                defaultCheck="scheduleByWeekdays"
                class="datablau-select-period"
              ></select-period>
            </el-form-item>
            <el-form-item
              :label="$t('quality.page.qualityExamineJob.timeFiltering')"
            >
              <datablau-select
                multiple
                v-model="jobDetails.jobContent.canExecuteDateTemplates"
                clearable
              >
                <el-option
                  v-for="o in dateTemplates"
                  :key="o.id"
                  :label="o.name"
                  :value="o.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item :label="$t('system.job.taskMemory')">
              <datablau-select
                v-model="jobDetails.jobContent.expectedMemory"
                size="mini"
                style="width: 500px; display: inline-block"
              >
                <el-option
                  v-for="item in memoryList"
                  :label="item + 'G'"
                  :value="item"
                  :key="item"
                ></el-option>
              </datablau-select>
              <datablau-tooltip
                :content="$t('system.job.memoryTooltip')"
                placement="bottom"
              >
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>
            </el-form-item>
            <!--   中文名同步策略   -->
            <el-form-item
              :label="$t('system.job.synchronizationPolicy')"
              v-if="
                job.type === 'MetadataSyncJobDescriptor' ||
                `${query.update}` === 'true'
              "
            >
              <datablau-select
                v-model="syncType"
                size="mini"
                style="width: 500px; display: inline-block"
              >
                <el-option
                  v-for="item in syncTypeList"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <!-- 关联数据源 -->
            <el-form-item
              :label="$t('system.job.relDataSource')"
              v-if="$route.query.jobType == 3 || isLineagejob"
            >
              <el-select
                v-model="modelIds"
                multiple
                class="relDataSource"
                style="width: 500px; display: inline-block"
              >
                <el-option
                  v-for="item in selDataSource"
                  :label="item.definition"
                  :value="item.modelId"
                  :key="item.modelId"
                ></el-option>
              </el-select>
              <span
                class="el-icon-circle-plus-outline"
                style="
                  transform: scale(1.5);
                  margin-left: 6px;
                  cursor: pointer;
                  color: #999;
                "
                @click="openDataSource"
              ></span>
            </el-form-item>
            <el-form-item
              :label="$t('system.job.skipResolve')"
              v-if="$route.query.jobType == 3 || isLineagejob"
            >
              <datablau-radio v-model="skipProcessed">
                <el-radio
                  :label="true"
                  style="margin-bottom: 10px; margin-top: 6px"
                >
                  {{ $t('meta.common.true') }}
                </el-radio>
                <el-radio :label="false">
                  {{ $t('meta.common.false') }}
                </el-radio>
              </datablau-radio>
            </el-form-item>
            <el-form-item
              :label="$t('system.job.resourcePattern')"
              v-if="
                jobDetails.type === 'MetadataSyncJobDescriptor' ||
                jobDetails.jobType === 'MetadataSyncJobDescriptor'
              "
            >
              <datablau-radio v-model="resourceModeType">
                <el-radio
                  :label="false"
                  style="margin-bottom: 10px; margin-top: 6px"
                >
                  {{ $t('system.job.highPerformance') }}
                </el-radio>
                <el-radio :label="true">
                  {{ $t('system.job.lowPerformance') }}
                </el-radio>
              </datablau-radio>
            </el-form-item>
            <el-form-item
              class="sub-header btm-border"
              v-if="showJobPram"
              style="margin-left: -60px"
            >
              <div class="form-sub-title detail-title schedule-params">
                <i class="user-detail-tu"></i>
                <span>{{ $t('system.job.taskParameters') }}</span>
              </div>
              <!-- <span>任务参数</span> -->
              <job-content-param
                :job="job"
                @shareStateChange="shareStateChange"
                @addressTypeChange="addressTypeChange"
                @paramsValidationChange="paramsValidationChange"
                ref="jobParams"
                :lineageTab="lineageTab"
                style="margin-left: -60px"
              ></job-content-param>
            </el-form-item>
          </div>
          <!-- 任务日志 -->
          <div
            class="form-sub-title detail-title schedule-message"
            v-if="!isAdd"
          >
            <i class="user-detail-tu"></i>
            <span>{{ $t('system.job.jobLog') }}</span>
          </div>
          <el-form v-if="!isAdd">
            <el-form-item>
              <datablau-table
                :data="jobHistory"
                :default-sort="{ prop: 'startTime', order: 'descending' }"
                class="datablau-table job-detail-table"
                @row-click="expandDetailRow"
                row-key="id"
                ref="historyTable"
                :expand-row-keys="expandRowKeys"
                show-overflow-tooltip
                :show-column-selection="false"
                :data-selectable="false"
              >
                <el-table-column
                  prop="startTime"
                  :label="$t('system.job.lastRunStart')"
                  :formatter="dateFormat"
                  sortable
                  width="200"
                ></el-table-column>
                <el-table-column
                  prop="endTime"
                  :label="$t('system.job.lastRunEnd')"
                  :formatter="dateFormat"
                  sortable
                  width="200"
                ></el-table-column>
                <!-- 状态 -->
                <el-table-column
                  prop="status"
                  :label="$t('system.job.status')"
                  sortable
                  width="100"
                >
                  <template slot-scope="scope">
                    <div>
                      <i
                        class="status-style"
                        :style="{ background: getJobColor(scope.row.status) }"
                      ></i>
                      <span :style="{ color: getJobColor(scope.row.status) }">
                        {{ statusFormatter(scope.row.status) }}
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <!-- 任务结果 -->
                <el-table-column
                  :label="$t('system.job.jobResult')"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <div
                      class="result-container"
                      v-if="
                        jobDetails.type === 'LoadDataStageJobFileJobDescriptor'
                      "
                    >
                      <span v-if="scope.row.failureCause">
                        {{ scope.row.failureCause }}
                      </span>
                      <span v-else-if="!$utils.isJSON(scope.row.result)">
                        {{ scope.row.result }}
                      </span>
                    </div>
                    <div
                      class="result-container"
                      v-if="jobDetails.type === 'LoadLineageJobDescriptor'"
                    >
                      <span v-if="scope.row.failureCause">
                        {{ scope.row.failureCause }}
                      </span>
                      <div v-else>
                        <div
                          class="result"
                          v-html="formatJobResult(scope.row.result).resultHtml"
                        ></div>
                      </div>
                    </div>
                    <div v-else class="result-container">
                      <div
                        v-if="scope.row.failureCause"
                        v-html="nl2br(scope.row.failureCause)"
                      ></div>
                      <div
                        v-else-if="!$utils.isJSON(scope.row.result)"
                        v-html="nl2br(scope.row.result)"
                      ></div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  type="expand"
                  :width="1"
                  label=""
                  v-if="jobDetails.type === 'LoadLineageJobDescriptor'"
                >
                  <template slot-scope="scope">
                    <div
                      v-html="formatJobResult(scope.row.result).allFileArrHtml"
                    ></div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="name"
                  :label="$t('system.user.operation')"
                  width="120"
                  align="center"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      v-if="
                        jobDetails.type === 'LoadDataStageJobFileJobDescriptor'
                      "
                      type="text"
                      class="iconfont icon-chakan"
                      @click="showJobResult(scope.row)"
                    >
                      <!-- 查看 -->
                    </datablau-button>
                    <el-button
                      type="text"
                      size="small"
                      @click="showJobLog(scope.row)"
                    >
                      {{
                        $t(
                          'quality.page.qualityExamineJob.historyDataTable.seeLog'
                        )
                      }}
                    </el-button>
                  </template>
                </el-table-column>
              </datablau-table>
            </el-form-item>
          </el-form>
        </datablau-form>
        <!-- </el-row> -->
      </div>
    </div>

    <div
      class="job-detail-buttons"
      :class="{
        'job-detail-buttons2': lineageTab,
        'job-detail-buttons3': appName === 'DDD',
      }"
    >
      <div class="btn-outer">
        <datablau-button
          size="small"
          type="secondary"
          style="position: absolute; left: 20px"
          @click="remove"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          style="margin-left: 74px"
          @click="onSubmit"
          v-if="lineageTab"
          :disabled="
            (showTestBtn &&
              isTestTrue &&
              this.job.type === 'LoadLineageJobDescriptor') ||
            !paramsValidation ||
            !lineageTabName
          "
        >
          {{ $t('common.button.save') }}
        </datablau-button>
        <datablau-button
          v-else
          type="important"
          style="margin-left: 74px"
          @click="onSubmit"
          :disabled="
            (showTestBtn &&
              isTestTrue &&
              this.job.type === 'LoadLineageJobDescriptor') ||
            !paramsValidation
          "
        >
          {{ $t('common.button.save') }}
        </datablau-button>
        <template v-if="showTestBtn">
          <datablau-button
            type="important"
            @click="testShareCatalog"
            :disabled="!couldTestShareCatalog"
          >
            {{ $t('common.button.test') }}
          </datablau-button>
          <datablau-tooltip
            :content="$t('system.job.testTooltip')"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
            +
          </datablau-tooltip>
        </template>
      </div>
    </div>
    <!-- </div> -->
  </div>
</template>
<script>
import jobDetail from './jobDetail.js'
export default jobDetail
</script>
<style scoped lang="scss">
$blue: #409eff;
$green: #66bf16;
$red: #f2220a;
$notRun: #e6ad00;
$disColor: #999999;
$textColor: #0084ff;
.rightView {
  padding: 20px;
  /deep/ .el-form-item__label {
    line-height: 34px;
    height: 34px;
  }
}
#breadCrum {
  // padding-bottom: 0px;
  width: 100%;
  border-bottom: 0;
  // .bread-crumb {
  // margin-top: 20px!important;
  // }

  // border-bottom: 1px solid #ccc;
  .edit-name {
    width: 500px;
    .item-title {
      font-size: 14px;
      color: #666;
    }
    .input-container {
      display: inline-block;
      width: 300px;
    }
  }
  /deep/ .job-detail-icon.is-block.icon:hover:not(.no-background) {
    background-color: transparent !important;
  }
  /deep/ .job-detail-icon.is-block.icon:hover {
    color: $blue !important;
  }
  .job-detail-icon {
    cursor: text;
  }
  .currentStep {
    color: $blue;
  }
  .job-detail-switch {
    display: inline-block;
    /deep/ .el-switch__label * {
      font-size: 12px !important;
    }
  }
  .isActive {
    color: $blue;
  }
}
#job-details {
  padding-top: 10px;
  // padding-left: 20px;
  // padding-right: 20px;
  padding-bottom: 10px;

  .right {
    float: right;
    display: inline-block;
  }
  .sub-header {
    font-size: 14px;
    // margin-bottom: 20px;
    &.btm-border {
      // border-bottom: 1px solid #ccc;
    }
  }
  .cronSchedule {
    width: 580px;
  }
  /deep/.el-form {
    margin-top: 10px;
    margin-bottom: 10px;
    .relDataSource {
      .el-select__caret.el-input__icon {
        line-height: 34px !important;
      }
    }
  }

  .el-col {
    margin-bottom: 5px;
  }

  .btn-outer {
    display: inline-block;
    margin-right: 20px;
    margin-bottom: 25px;
  }
  // .share-catalog-job {
  // 	width: 50%;
  // 	min-width: 500px;
  // 	// border: 1px solid red;
  // 	.el-input {
  // 		width: 50%;
  // 	}
  // }

  .result-container {
    width: 100%;
    height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    div {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .datablau-select-period {
  }
  .job-detail-table {
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
    .cell {
      div {
        width: 100%;
        .status-style {
          width: 6px;
          height: 6px;
          display: inline-block;
          transform: translateY(-2px);
          border-radius: 50%;
        }
        span {
          margin-left: 5px;
          font-size: 12px;
        }
      }
    }
  }
}
.select-box {
  height: 400px;
  width: 350px;
  float: left;
  overflow: auto;
  margin-right: 20px;
  &:last-child {
    margin-right: 20px;
    clear: right;
  }
}
.dialog-job-item-result {
  .job-item-result-container {
    border: 1px solid #eee;
    min-height: 400px;
    box-sizing: border-box;
    padding: 10px;
    margin-bottom: 20px;
  }
}
.detail-title {
  display: flex;
  align-items: center;
  .user-detail-tu {
    display: inline-block;
    width: 4px;
    height: 16px;
    background: $blue;
    margin-right: 6px;
  }
  &.schedule-message {
    margin-left: -20px;
  }
  &.schedule-management {
    margin-left: -165px;
  }
  &.schedule-params {
    margin-left: -140px;
  }
}
.job-detail-buttons {
  text-align: left;
  position: fixed;
  bottom: 0;
  left: 160px;
  z-index: 9999;
  border-top: 1px solid #e0e0e0;
  width: 100%;
  height: 50px;
  padding: 8px 20px;
  background-color: #fff;
  &.job-detail-buttons3 {
    z-index: 1;
  }
  .tab-button {
    margin-left: 20px;
  }
  transition: box-shadow 0.3s ease-in-out, border-top-color 0.3s ease-in-out;
  &.has-shadow {
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    border-top: 1px solid transparent;
    z-index: 9;
  }
}
.job-detail-buttons2 {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.lineageTab {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: auto;
}
.input-detail {
  width: 600px !important;
  // 	min-width: 500px;
}
</style>
