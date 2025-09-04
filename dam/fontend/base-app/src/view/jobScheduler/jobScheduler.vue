<template>
  <datablau-form-submit
    style="position: absolute; top: 80px; bottom: 0; left: 0; right: 0"
    :style="{ top: jobApp ? '80px' : '50px' }"
    v-loading="jobDetailLoading"
  >
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
        v-if="showJobsStaPop"
        :jobId="rawData.jobId"
        :showTopLine="true"
      ></job-run-report>
    </datablau-dialog>
    <datablau-form class="jobForm">
      <el-form-item :label="$t('system.job.isDisabled')">
        <datablau-switch
          v-model="rawData.disabled"
          :active-value="false"
          :inactive-value="true"
          @change="save"
        ></datablau-switch>
      </el-form-item>
      <el-form-item>
        <datablau-button
          @click="runJob"
          :disabled="rawData.disabled || isRunning"
        >
          <span v-if="isRunning">
            <i class="el-icon-loading"></i>
            {{ $t('system.taskScheduling.running') }}...
          </span>
          <span v-else>{{ $t('system.taskScheduling.run') }}</span>
        </datablau-button>
        <datablau-button @click="showProgress">
          {{ $t('system.taskScheduling.viewTaskProgress') }}
        </datablau-button>
        <datablau-button @click="forceResetJobStatus" v-if="developerMode">
          {{ $t('system.taskScheduling.resetTaskStatus') }}
        </datablau-button>
      </el-form-item>
      <el-form-item class="sub-header" style="margin-left: -31.5px">
        <select-period
          style="transform: translateX(-27px)"
          @getCronString="getCronString"
          :cron="
            jobDetail.schedule && jobDetail.schedule.includes('cron:')
              ? jobDetail.schedule.split('cron:')[1]
              : jobDetail.schedule
          "
          defaultCheck="scheduleByWeekdays"
          class="datablau-select-period"
        ></select-period>
      </el-form-item>
      <el-form-item :label="$t('quality.page.qualityExamineJob.timeFiltering')">
        <datablau-select
          multiple
          v-model="jobDetail.canExecuteDateTemplates"
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
      <!--      <el-form-item :label="$t('system.job.taskMemory')">
        <datablau-select
          v-model="jobDetail.expectedMemory"
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
      </el-form-item>-->
    </datablau-form>
    <job-log-page
      ref="logs"
      :raw-data="rawData"
      style="margin: 20px"
      @update-running="updateJobRunning"
    ></job-log-page>
    <template slot="buttons">
      <div>
        <datablau-button class="cut-apart-btn" type="important" @click="save">
          {{ $t('system.taskScheduling.save') }}
        </datablau-button>
      </div>
    </template>
  </datablau-form-submit>
</template>
<script>
import JobLogPage from '@/view/jobScheduler/jobLog.vue'
import JobRunReport from './jobRunReport.vue'
export default {
  props: {
    rawData: {},
    jobApp: {},
  },
  components: {
    JobLogPage,
    JobRunReport,
  },
  computed: {
    baseUrl() {
      if (this.jobApp === 'metadata') {
        return '/metadata/service/jobs'
      } else {
        return '/job/main'
      }
    },
  },
  data() {
    return {
      jobDetail: {
        schedule: null,
        canExecuteDateTemplates: [],
        expectedMemory: null,
      },
      jobDetailLoading: true,
      dateTemplates: [],
      memoryList: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
        57, 58, 59, 60, 61, 62, 63, 64,
      ],
      disabled: null,
      isRunning: false,
      showJobsStaPop: false,
      developerMode: false,
      runCycleList: {
        noRepeat: this.$t(
          'quality.page.qualityExamineJob.selectPeriod.noRepeat'
        ),
        everyday: this.$t(
          'quality.page.qualityExamineJob.selectPeriod.everyday'
        ),
        weekly: this.$t('quality.page.qualityExamineJob.selectPeriod.weekly'),
        monthly: this.$t('quality.page.qualityExamineJob.selectPeriod.monthly'),
        quarterly: this.$t(
          'quality.page.qualityExamineJob.selectPeriod.quarterly'
        ),
        yearly: this.$t('quality.page.qualityExamineJob.selectPeriod.yearly'),
        schedulings: this.$t(
          'quality.page.qualityExamineJob.selectPeriod.schedulings'
        ),
      },
    }
  },
  mounted() {
    this.getData()
    this.getDateTemplate()
    $(document).on('keydown', this.dev)
  },
  beforeDestroy() {
    $(document).off('keydown')
  },
  methods: {
    dev(e) {
      if (e.keyCode === 46 && e.ctrlKey) {
        this.developerMode = !this.developerMode
      }
    },
    getDateTemplate() {
      this.$http
        .post(`/job/dateTemplate/list`)
        .then(res => {
          this.dateTemplates = res.data.filter(i => i.state === 1)
          if (this.jobDetail.canExecuteDateTemplates) {
            this.jobDetail.canExecuteDateTemplates =
              this.jobDetail.canExecuteDateTemplates.filter(item =>
                this.dateTemplates.map(i => i.id).includes(item)
              )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateLog() {
      this.$refs.logs.scanJobResult()
    },
    getData(forceUpdate) {
      const callback = jobContent => {
        this.jobDetail['@class'] = jobContent['@class']
        this.jobDetail.schedule = jobContent.schedule
        this.jobDetail.expectedMemory = jobContent.expectedMemory
        this.jobDetail.canExecuteDateTemplates =
          jobContent.canExecuteDateTemplates
        this.jobDetail.disabled = jobContent.disabled
        this.jobDetail.parameters = jobContent.parameters
        this.jobDetailLoading = false
        this.updateLog()
      }
      if (!forceUpdate && this.jobApp === 'metadata') {
        callback(JSON.parse(this.rawData.jobContent))
      } else {
        const jobId = this.rawData.jobId
        this.$http
          .post(`${this.baseUrl}/query/jobs/byCriteria`, {
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
            const jobContent = JSON.parse(res.data.content[0].jobContent)
            callback(jobContent)
          })
          .catch(e => {
            this.updateJobRunning(false)
            this.$showFailure(e)
          })
          .then(() => {
            this.jobDetailLoading = false
          })
      }
    },
    updateJobRunning(isRunning) {
      this.isRunning = isRunning
      if (isRunning) {
        setTimeout(() => {
          this.getData()
        }, 3000)
      }
    },
    getCronString(cronString, type, runCycle) {
      this.jobDetail.schedule = cronString
      this.jobDetail.runCycle = runCycle
        ? this.runCycleList[runCycle]
        : '暂不调度'
    },
    save() {
      if (this.jobDetail.schedule === '') {
        this.$message.error(
          this.$t('quality.page.qualityExamineJob.periodicScheduling')
        )
      } else {
        let requestUrl = `/job/main/updateJobInfo?jobId=${this.rawData.jobId}`
        this.jobDetail.disabled = this.rawData.disabled
        // todo: 元数据API参数未知
        // if (this.jobApp === 'metadata') { /
        //   requestUrl = `/metadata/service/jobs/updateJob?jobId=${this.rawData.jobId}`
        // }
        this.$http
          .post(requestUrl, this.jobDetail)
          .then(() => {
            this.$message.success('任务修改成功')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    runJob() {
      const run = _ => {
        this.isRunning = true
        this.$http
          .post(`/job/main/startJob?jobId=${this.rawData.jobId}&executor=admin`)
          .then(() => {
            setTimeout(() => {
              this.getData(true)
            }, 1000)
          })
      }
      const check = () => {
        this.$http
          .post(`/job/main/canExecuteToday?jobId=${this.rawData.jobId}`)
          .then(res => {
            const canExecute = !!res.data
            if (canExecute) {
              run()
            } else {
              this.$DatablauCofirm(
                '当前操作不在系统时间模版允许范围内执行，是否继续执行？'
              )
                .then(() => {
                  run()
                })
                .catch(() => {})
            }
          })
          .catch(e => {
            run()
            this.$showFailure(e)
          })
      }
      check()
    },
    showProgress() {
      this.showJobsStaPop = true
    },
    forceResetJobStatus() {
      this.$http
        .post('/job/main/setStatusToFailed?jobId=' + this.rawData.jobId)
        .then(res => {
          this.getData()
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.jobForm {
  .datablau-select-period {
    ::v-deep {
      .el-form .el-form-item {
        margin-bottom: 0 !important;
      }
    }
  }
}
</style>
