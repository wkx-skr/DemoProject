<template>
  <div class="job-run-report">
    <div class="top-filter-line" v-if="showTopLine">
      <datablau-button
        @click="
          () => {
            this.refreshJobStatus()
          }
        "
        :disabled="loadingData"
        size="mini"
      >
        <!-- <i icon="el-icon-refresh"></i> -->
        {{ $t('quality.page.qualityExamineJob.refresh') }}
      </datablau-button>
      <datablau-button
        type="secondary"
        @click="stopJob"
        size="mini"
        :disabled="stopDisabled"
      >
        {{ $t('quality.page.qualityExamineJob.stopTask') }}
      </datablau-button>
      <datablau-button
        type="secondary"
        @click="forceStopJob"
        size="mini"
        :disabled="stopDisabled"
      >
        强制停止
      </datablau-button>
    </div>
    <!-- <div class="table-line"> -->
    <datablau-table
      :data="jobStaData"
      ref="jobStaTable"
      class="datablau-table table"
      height="440px"
      show-overflow-tooltip
      v-loading="loadingData"
      :show-column-selection="false"
      :data-selectable="false"
      :header-cell-style="{
        color: '#494850',
        'font-size': '12px',
        'font-weight': 'bold',
      }"
    >
      <el-table-column
        prop="timestamp"
        :label="$t('quality.page.qualityExamineJob.jobStatusTable.timestamp')"
        width="160"
        show-overflow-tooltip
        :formatter="$timeFormatter"
      ></el-table-column>
      <el-table-column
        prop="status"
        :label="$t('quality.page.qualityExamineJob.jobStatusTable.status')"
        min-width="60"
        show-overflow-tooltip
        :formatter="formateJobSta"
      ></el-table-column>
      <el-table-column
        prop="message"
        :label="$t('quality.page.qualityExamineJob.jobStatusTable.message')"
        min-width="200"
      ></el-table-column>
    </datablau-table>
    <!-- </div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      stopDisabled: false,
      jobStaData: [],
      loadingData: false,
      refreshTimer: null,
    }
  },
  props: {
    jobId: {
      type: [String, Number],
      required: true,
    },
    showTopLine: {
      type: Boolean,
      default: false,
    },
    getHistoryLog: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.refreshJobStatus()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    refreshJobStatus(callback) {
      this.$http
        .post(`/job/main/query/jobEvents/byCriteria`, {
          '@type': '.FieldEqualsCriteria',
          page: null,
          fieldName: 'jobId',
          compareValue: this.jobId,
          notEqual: false,
        })
        .then(res => {
          this.loadingData = false
          if (res.data && Array.isArray(res.data.content)) {
            this.jobStaData = res.data.content.reverse()
          }
          if (!this.getHistoryLog) {
            callback && callback(res.data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    stopJob() {
      this.stopDisabled = true
      const requestUrl = `/job/main/stopJob?jobId=${this.jobId}`
      this.$http
        .post(requestUrl)
        .then(res => {
          this.stopDisabled = false
        })
        .catch(e => {
          this.stopDisabled = false
          this.$showFailure(e)
        })
    },
    forceStopJob() {
      this.stopDisabled = true
      const requestUrl = `/job/main/forciblyStopJob?jobId=${this.jobId}`
      this.$http
        .post(requestUrl)
        .then(res => {
          this.stopDisabled = false
        })
        .catch(e => {
          this.stopDisabled = false
          this.$showFailure(e)
        })
    },
    formateJobSta(row, column, cellValue, index) {
      const sta = cellValue
      const staMap = {
        INFO: '信息',
        ERROR: '错误',
        STOP: '停止',
        COMPLETE: '完成',
      }
      return staMap[sta] ? staMap[sta] : sta
    },

    showJobsStatu({ row, column, $index, store }) {
      this.jobStaData = [] // 初始化
      const jobId = row ? row.id : ''
      this.checkStaJobId = jobId
      this.stopDisabled = false
      this.initJobStatus(jobId)
      this.showJobsStaPop = true
      if (false) {
        const data = [
          // 数据结构
          {
            timestamp: 1542266364862,
            message: '执行完毕，总共找到603行数据',
            status: 'INFO',
          },
          {
            timestamp: 1542266364865,
            message:
              '开始执行query:select *, sleep(20) from dam7.acl_class limit 1;',
            status: 'INFO',
          },
        ]
      }
    },
    startAutoRefresh(events = []) {
      console.log('events', events)
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
      }
      this.refreshTimer = setTimeout(() => {
        this.refreshJobStatus(this.startAutoRefresh)
      }, 3000)
      const current = events[0] || {}
      if (current.percent == 100) {
        setTimeout(this.refreshJobStatus, 1000)
        this.stopAutoRefresh()
      }
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
      }
      this.refreshTimer = null
    },
  },
  watch: {
    jobId: {
      handler: function (newVal) {
        console.log('newVal', newVal)
        this.jobStaData = []
        if (!newVal) return
        this.startAutoRefresh()
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss">
.job-run-report {
  .top-filter-line {
    margin-bottom: 10px;
  }
  // .table-line {
  // margin-bottom: 20px;
  // height: 440px;
  .table {
    height: 100%;
    border-bottom: 1px solid #e0e0e0;
  }
  // }
}
</style>
