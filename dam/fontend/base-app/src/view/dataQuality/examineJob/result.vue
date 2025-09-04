<template>
  <div class="result-detail">
    <el-dialog
      :title="$t('quality.page.qualityExamineJob.problemList')"
      :visible.sync="dialogVisibleJobData"
      width="800px"
      append-to-body
      class="problemListDialog"
    >
      <el-table :data="jobData" class="datablau-table" ref="resultTable">
        <el-table-column width="20"></el-table-column>
        <el-table-column
          sortable
          :label="$t('quality.page.qualityExamineJob.jobDataTable.name')"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityExamineJob.jobDataTable.operation')"
          align="center"
          title-align="right"
          width="290"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="jumpToJobData(scope.row)"
            >
              {{
                $t('quality.page.qualityExamineJob.jobDataTable.viewQuestions')
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisibleJobData = false">
          {{ $t('common.button.close') }}
        </el-button>
      </span>
    </el-dialog>
    <datablau-dialog
      :title="$t('quality.page.qualityExamineJob.errorMsg')"
      :visible.sync="dialogVisible"
      width="560px"
      append-to-body
    >
      <div style="overflow: auto; height: 150px" v-html="errorMsg"></div>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      width="900px"
      :visible.sync="showHistoryDialog"
      append-to-body
      :title="historyTitle"
      style="position: relative"
    >
      <div style="height: 400px">
        <div
          style="
            margin-top: 10px;
            position: absolute;
            top: 10px;
            left: 20px;
            right: 20px;
            bottom: 20px;
          "
        >
          <datablau-table
            :data="historyData"
            v-loading="historyLoading"
            width="100%"
            height="100%"
            style="height: 100%"
          >
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.startTime')
              "
              min-width="200"
              prop="startTime"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.endTime')
              "
              min-width="200"
              prop="endTime"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="
                $t(
                  'quality.page.qualityExamineJob.historyDataTable.timeConsuming'
                )
              "
              :min-width="$i18n.locale === 'zh' ? '100px' : '110px'"
            >
              <template slot-scope="scope">
                <span
                  v-if="
                    historyData[scope.$index].endTime ||
                    checkStatus(historyData[scope.$index].status)
                  "
                >
                  {{
                    (historyData[scope.$index].endTime -
                      historyData[scope.$index].startTime) /
                      1000 +
                    $t('quality.page.qualityExamineJob.second')
                  }}
                </span>
                <span v-else>
                  <i
                    style="
                      position: relative;
                      top: 2px;
                      padding: 0;
                      font-size: 16px;
                    "
                    class="el-icon-refresh-right animation"
                  ></i>
                  <span style="font-size: 12px">
                    {{
                      $t('quality.page.qualityExamineJob.statusList.RUNNING')
                    }}...
                  </span>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.historyDataTable.scoring')
              "
              min-width="100"
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
              min-width="100"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="
                    handleHistorySelect(historyData[scope.$index], scope.$index)
                  "
                >
                  {{ $t('common.button.scan') }}
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="showJobLog(scope.row)"
                >
                  {{
                    $t('quality.page.qualityExamineJob.historyDataTable.seeLog')
                  }}
                </el-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
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
        :jobId="showInstanceId"
        :showTopLine="showTopLine"
        :getHistoryLog="true"
      ></job-run-report>
    </datablau-dialog>

    <div
      class="db-fieldMessage-title"
      style="margin-bottom: 25px; padding-top: 22px"
    >
      <p class="message-title">{{ $t('common.page.qualityExamineJob') }}</p>
    </div>
    <div class="review-job">
      <div class="scoreboard-part">
        <!-- <datablau-tooltip content="Bottom center" placement="top" effect="dark"> -->
        <div style="width: 140px; height: 140px; margin-left: 20px">
          <div id="darwMain" ref="echartsCon"></div>
          <!-- <span class="number">{{ parseInt(cnt.success) }}</span>
          <br />
          <span class="score-title">计分板</span> -->
        </div>
        <!-- </datablau-tooltip> -->
      </div>
      <div class="result-part">
        <p class="result-part-title">{{ resultPartTitle }}</p>
        <div class="result-part-text">
          <span>
            {{
              $t('quality.page.qualityExamineJob.historyDataTable.startTime')
            }}
          </span>
          <span>{{ $timeFormatter(currentJob.startTime) }}</span>
        </div>
        <div class="result-part-text">
          <span>
            {{ $t('quality.page.qualityExamineJob.historyDataTable.endTime') }}
          </span>
          <span>{{ $timeFormatter(currentJob.endTime) }}</span>
        </div>
        <div class="result-part-text">
          <span>
            {{ $t('quality.page.qualityExamineJob.runTime') }}
          </span>
          <span
            class="content"
            v-if="currentJob.endTime && currentJob.startTime"
          >
            <span style="color: #409eff; font-weight: bold; padding-right: 2px">
              {{ parseInt((currentJob.endTime - currentJob.startTime) / 1000) }}
            </span>
            {{ $t('quality.page.qualityExamineJob.second') }}
          </span>
        </div>
        <div class="result-part-button">
          <datablau-button type="secondary" @click="showHistory">
            {{ $t('quality.page.qualityExamineJob.historicalSituation') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            v-if="resultPartTitle === '历史情况'"
            @click="toBack"
          >
            {{ $t('quality.page.qualityExamineJob.latestResults') }}
          </datablau-button>
        </div>
      </div>
      <div class="problem-part">
        <div class="problem-cont">
          <div class="problem-img">
            <img src="static/images/examineJob/noproblemfound.svg" alt="" />
          </div>
          <!--          未发现问题-->
          <div class="problem-text">
            <p>{{ cnt.successNumber }}</p>
            <span>
              {{ $t('quality.page.qualityExamineJob.noProblemsFound') }}
            </span>
          </div>
        </div>
        <!--        发现问题-->
        <div class="problem-cont">
          <div class="problem-img">
            <img src="static/images/examineJob/discoverproblems.svg" alt="" />
          </div>

          <div class="problem-text">
            <p>{{ cnt.warningNumber }}</p>
            <span>
              {{ $t('quality.page.qualityExamineJob.discoverProblems') }}
            </span>
          </div>
        </div>
        <!--        运行失败-->
        <div class="problem-cont">
          <div class="problem-img">
            <img src="static/images/examineJob/runfailed.svg" alt="" />
          </div>
          <div class="problem-text">
            <p>{{ cnt.errorNumber }}</p>
            <span>
              {{ $t('quality.page.qualityExamineJob.runFailed') }}
            </span>
          </div>
        </div>
        <!-- 统计异常 -->
        <div class="problem-cont">
          <div class="problem-img">
            <img src="static/images/examineJob/exception.svg" alt="" />
          </div>
          <div class="problem-text">
            <p>{{ cnt.exceptionNumber || 0 }}</p>
            <span>
              {{ $t('quality.page.qualityExamineJob.exception') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="db-fieldMessage-title"
      v-if="currentJob.status !== 'FAILED'"
      style="margin-bottom: 20px; padding-top: 20px; clear: both"
    >
      <p class="message-title">
        {{ $t('quality.page.qualityExamineJob.ruleDetails') }}
      </p>
    </div>
    <div id="tab-filter-area" v-if="currentJob.status !== 'FAILED'">
      <!-- <el-checkbox v-model="hasProblem">仅显示发现问题的规则</el-checkbox> -->
      <el-form
        style="display: inline-block"
        :model="searchFormData"
        ref="searchForm"
        inline
      >
        <el-form-item prop="ruleName" style="padding-right: 10px">
          <datablau-input
            :iconfont-state="true"
            clearable
            :placeholder="$t('quality.page.qualityExamineJob.rulePlaceholder')"
            v-model="searchFormData.ruleName"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityExamineJob.table.result')"
          prop="runResult"
        >
          <datablau-select
            v-model="searchFormData.runResult"
            style="width: 150px"
          >
            <el-option
              v-for="item in runResultList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityExamineJob.table.countResult')"
          prop="countResult"
        >
          <datablau-select
            v-model="searchFormData.countResult"
            style="width: 150px"
          >
            <el-option
              v-for="item in countResultList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <datablau-button type="important" @click="showSearch">
          {{ $t('common.button.search') }}
        </datablau-button>
        <datablau-button type="secondary" @click="reset">
          {{ $t('common.button.reset') }}
        </datablau-button>
      </el-form>
      <div style="float: right">
        <datablau-button type="important" @click="exportResult">
          {{ $t('quality.page.qualityExamineJob.exportResults') }}
        </datablau-button>
      </div>
    </div>
    <div
      id="tab-table-area"
      v-if="currentJob.status !== 'FAILED'"
      ref="ruleResultOuter"
    >
      <datablau-table
        :data="displayRules"
        ref="resultTable"
        :height="tableHeight"
      >
        <!-- <el-table-column width="20"></el-table-column> -->
        <!-- <el-table-column width="60">
          <template slot-scope="scope">
            <i :class="iconFormat(problemMap[scope.row.id])"></i>
          </template>
        </el-table-column> -->
        <el-table-column
          :label="
            $t('quality.page.qualityExamineJob.displayRules.operationResults')
          "
          width="120"
        >
          <template slot-scope="scope">
            <div v-if="job.jobType === '标准核检任务'">
              <span
                class="resulticon good"
                v-if="
                  scope.row.ruleResultStatus ===
                  $t('quality.page.qualityExamineJob.results.good')
                "
              >
                {{ scope.row.ruleResultStatus }}
              </span>
              <span
                class="resulticon problem"
                v-if="
                  scope.row.ruleResultStatus ===
                  $t('quality.page.qualityExamineJob.results.problem')
                "
              >
                {{ scope.row.ruleResultStatus }}
              </span>
              <span
                class="resulticon fail"
                v-if="
                  scope.row.ruleResultStatus ===
                  $t('quality.page.qualityExamineJob.results.fail')
                "
              >
                {{ scope.row.ruleResultStatus }}
              </span>
            </div>
            <div v-else>
              <span
                class="resulticon good"
                v-if="
                  mapFormatter(problemMap[scope.row.id]) ===
                  $t('quality.page.qualityExamineJob.results.good')
                "
              >
                {{ mapFormatter(problemMap[scope.row.id]) }}
              </span>
              <span
                class="resulticon problem"
                v-if="
                  mapFormatter(problemMap[scope.row.id]) ===
                  $t('quality.page.qualityExamineJob.results.problem')
                "
              >
                {{ mapFormatter(problemMap[scope.row.id]) }}
              </span>
              <span
                class="resulticon fail"
                v-if="
                  mapFormatter(problemMap[scope.row.id]) ===
                  $t('quality.page.qualityExamineJob.results.fail')
                "
              >
                {{ mapFormatter(problemMap[scope.row.id]) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <!--<el-table-column
          label="规则ID"
          prop="id"
        ></el-table-column>-->
        <el-table-column
          min-width="100"
          sortable
          :label="$t('quality.page.qualityExamineJob.displayRules.name')"
          :prop="job.jobType === '标准核检任务' ? 'fullRuleName' : 'name'"
          width="180"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span v-if="job.jobType === '标准核检任务'">
              {{ scope.row.fullRuleName }}
            </span>
            <span
              style="cursor: pointer; color: #409eff"
              @click="jumpTotechRuleName(scope.row)"
              v-else
            >
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityExamineJob.displayRules.type')"
          show-overflow-tooltip
          prop="bigClassSelectOption"
        >
          <template slot-scope="scope">
            {{ scope.row.bigClassSelectOption | bigClassFilter($bigClassList) }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('quality.page.qualityExamineJob.displayRules.importance')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{ importFormatter(displayRules[scope.$index].importance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            $versionFeature['dataquality_RuleBindingMetaData'] &&
            job.jobType === '标准核检任务'
          "
          label="数据源"
          show-overflow-tooltip
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.modelName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="$versionFeature['dataquality_RuleBindingMetaData']"
          label="Schema"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                job.jobType === '标准核检任务'
                  ? scope.row.schema
                  : rulesResultArr[scope.row.id].schema
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="$versionFeature['dataquality_RuleBindingMetaData']"
          :width="$i18n.locale === 'zh' ? 120 : 130"
          :label="$t('quality.page.qualityExamineJob.displayRules.tableName')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                job.jobType === '标准核检任务'
                  ? scope.row.tablePhysicalName
                  : rulesResultArr[scope.row.id].tableName
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="$versionFeature['dataquality_RuleBindingMetaData']"
          :width="$i18n.locale === 'zh' ? '' : 110"
          :label="$t('quality.page.qualityExamineJob.displayRules.columnName')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                job.jobType === '标准核检任务'
                  ? scope.row.columnPhysicalName
                  : rulesResultArr[scope.row.id].columnName
              }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('quality.page.qualityExamineJob.displayRules.totalCount')"
          :sortable="false"
          :width="120"
          prop="totalCount"
        >
          <template slot-scope="scope">
            <div v-if="job.jobType === '标准核检任务'">
              <div class="exception" v-if="scope.row.totalCnt === -1">
                <span>
                  {{ $t('quality.page.qualityExamineJob.exception') }}
                </span>
                <i class="icon iconfont icon-warn" />
              </div>
              <div v-else>{{ displayValue(scope.row.totalCnt) }}</div>
            </div>
            <div v-else>
              <div class="exception" v-if="scope.row.totalCount === '-'">
                <span>
                  {{ $t('quality.page.qualityExamineJob.exception') }}
                </span>
                <i class="icon iconfont icon-warn" />
              </div>
              <div v-else>{{ displayValue(scope.row.totalCount) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="
            $t('quality.page.qualityExamineJob.displayRules.problemCount')
          "
          :sortable="false"
          :width="$i18n.locale === 'zh' ? 120 : 130"
          prop="problemCount"
          v-if="job.jobType !== '标准核检任务'"
        >
          <template slot-scope="scope">
            <div class="exception" v-if="scope.row.problemCount === '-'">
              <span>{{ $t('quality.page.qualityExamineJob.exception') }}</span>
              <i class="icon iconfont icon-warn" />
            </div>
            <div v-else>{{ scope.row.problemCount }}</div>
          </template>
        </el-table-column>
        <el-table-column
          :label="
            $t('quality.page.qualityExamineJob.displayRules.problemSample')
          "
          :sortable="false"
          :width="$i18n.locale === 'zh' ? 120 : 140"
          prop="problemSample"
        >
          <template slot-scope="scope">
            {{
              job.jobType === '标准核检任务'
                ? displayValue(scope.row.outputCnt)
                : displayValue(scope.row.problemSample)
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityExamineJob.displayRules.proportion')"
          :width="120"
          v-if="job.jobType !== '标准核检任务'"
        >
          <template slot-scope="scope">
            {{ problemRaTio[scope.row.id] }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityExamineJob.displayRules.operation')"
          align="center"
          title-align="right"
          :width="$i18n.locale === 'zh' ? '170' : '240'"
          fixed="right"
        >
          <template slot-scope="scope">
            <!--<el-button type="text" v-if="scope.row.errorMsg" @click="showError(scope.row.errorMsg)">查看</el-button>-->
            <datablau-button
              type="text"
              :disabled="
                scope.row.ruleResultStatus !==
                $t('quality.page.qualityExamineJob.results.fail')
              "
              @click="showError(scope.row.errorMessage)"
              v-if="job.jobType === '标准核检任务'"
            >
              {{ $t('quality.page.qualityExamineJob.displayRules.viewReason') }}
            </datablau-button>
            <datablau-button
              type="text"
              :disabled="
                mapFormatter(problemMap[scope.row.id]) !==
                $t('quality.page.qualityExamineJob.results.fail')
              "
              @click="showError(errorMap[scope.row.id])"
              v-else
            >
              {{ $t('quality.page.qualityExamineJob.displayRules.viewReason') }}
            </datablau-button>
            <datablau-button
              type="text"
              :disabled="
                scope.row.ruleResultStatus !==
                $t('quality.page.qualityExamineJob.results.problem')
              "
              @click="jumpToIssues(scope.row.taskName)"
              v-if="job.jobType === '标准核检任务'"
            >
              {{
                $t('quality.page.qualityExamineJob.displayRules.viewQuestions')
              }}
            </datablau-button>
            <datablau-button
              type="text"
              :disabled="
                mapFormatter(problemMap[scope.row.id]) !==
                $t('quality.page.qualityExamineJob.results.problem')
              "
              @click="jumpToIssues(scope.row.id)"
              v-else
            >
              {{
                $t('quality.page.qualityExamineJob.displayRules.viewQuestions')
              }}
            </datablau-button>
            <!-- <el-button
              size="mini"
              type="text"
              :disabled="!(problemMap[scope.row.id] > 0)"
              @click="showProblems(scope.row.id)"
            >查看问题数据</el-button>
            <el-button
              size="mini"
              type="text"
              :disabled="!(problemMap[scope.row.id] > 0)"
              @click="downloadProblems(scope.row.id)"
            >下载问题数据</el-button> -->
          </template>
        </el-table-column>
      </datablau-table>
      <datablau-pagination
        @current-change="handleCurrentPageChange"
        @size-change="handlePageSizeChange"
        :current-page.sync="multipleCriteria.page.currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size.sync="multipleCriteria.page.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="page"
        style="margin-top: 10px; float: right"
      ></datablau-pagination>
    </div>
    <div
      v-if="currentJob.status === 'FAILED'"
      style="position: absolute; top: 222px; bottom: 20px; width: 100%"
    >
      <div
        class="noresult-img"
        style="
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0;
          right: 0;
          text-align: center;
        "
      >
        <img src="../../../../static/statePage/wrongResult.svg" alt="" />
        <p style="padding: 10px 0">
          {{
            $t('quality.page.qualityExamineJob.failureCause', {
              currentJob: currentJob.failureCause,
            })
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import result from './result.js'
export default result
</script>
<style scoped lang="scss">
@import './result.scss';
</style>
<style lang="scss">
.result-detail {
  .el-form--inline .el-form-item__label {
    padding-right: 6px;
  }
}
</style>
