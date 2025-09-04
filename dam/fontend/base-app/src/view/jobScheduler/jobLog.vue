<template>
  <div>
    <datablau-dialog
      :title="$t('system.taskScheduling.log')"
      size="xl"
      :visible.sync="logDialogVisible"
      custom-class="log-dialog"
    >
      <div class="item-container">
        <div v-for="i in logContent" class="item">
          <span v-if="i.startsWith('\t')" style="margin-left: 4em">
            {{ i }}
          </span>
          <span v-else>{{ i }}</span>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="closeDialog">
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-table
      :data="jobHistory"
      :default-sort="{ prop: 'startTime', order: 'descending' }"
      class="datablau-table job-detail-table"
      row-key="id"
      ref="historyTable"
      show-overflow-tooltip
      :show-column-selection="false"
      :data-selectable="false"
    >
      <el-table-column
        prop="createOn"
        :label="$t('system.taskScheduling.createTime')"
        :formatter="$timeFormatter"
        sortable
        width="200"
      ></el-table-column>
      <el-table-column
        prop="startTime"
        :label="$t('system.taskScheduling.startTime')"
        :formatter="$timeFormatter"
        sortable
        width="200"
      ></el-table-column>
      <el-table-column
        prop="endTime"
        :label="$t('system.taskScheduling.endTime')"
        :formatter="$timeFormatter"
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
            v-if="jobDetails.type === 'LoadDataStageJobFileJobDescriptor'"
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
        :label="$t('system.taskScheduling.operate')"
        width="100"
        align="center"
        header-align="center"
      >
        <template slot-scope="scope">
          <datablau-button @click="showLog(scope.row)" type="text">
            {{ $t('system.taskScheduling.log') }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>
<script>
export default {
  props: {
    rawData: {},
  },
  data() {
    return {
      jobHistory: null,
      logContent: null,
      logDialogVisible: false,
    }
  },
  computed: {
    jobDetails() {
      return this.rawData
    },
  },
  mounted() {
    // this.scanJobResult()
  },
  methods: {
    scanJobResult() {
      const jobId = this.rawData.jobId
      this.jobHistory = null
      this.$http
        .post(`/job/main/query/jobResults/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobId',
              compareValue: jobId,
              notEqual: false,
            },
          ],
        })
        .then(res => {
          this.jobHistory = res.data.content
          let isRunning = false
          if (
            ['INIT', 'CREATED', 'PREPARED', 'RUNNING'].includes(
              this.jobHistory[0].status
            )
          ) {
            isRunning = true
          } else {
            isRunning = false
          }
          this.$emit('update-running', isRunning)
        })
        .catch(e => {
          this.$showFailure(e)
          this.jobHistory = []
        })
    },
    showLog(row) {
      this.$http
        .post(`/job/main/findLogByInstanceId`, {
          jobInstanceId: row.id,
          jobId: row.jobId,
        })
        .then(res => {
          if (!res.data || res.data.length === 0) {
            this.$message.warning('没有日志可以展示')
          } else {
            this.logContent = res.data
            console.log(this.logContent, 'ff')
            this.logDialogVisible = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialog() {
      this.logDialogVisible = false
    },
    statusFormatter(status) {
      return this.$t('quality.page.qualityExamineJob.statusList.' + status)
    },
    // 设置颜色
    getJobColor(status) {
      let color = '#ccc'
      switch (status) {
        case 'FINISHED':
          color = '#66BF16'
          break
        case 'FAILED':
          color = '#F2220A'
          break
        case 'NOT_RUN':
          color = '#5dc4c0'
          break
        case 'SKIPPED':
        case 'STOPPED':
          color = '#999999'
          break
        case 'RUNNING':
          color = '#409EFF'
          break
        case 'INIT':
          color = '#e6ad00'
          break
      }
      return color
    },
  },
}
</script>
