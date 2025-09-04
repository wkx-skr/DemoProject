<template>
    <div>
        <datablau-form class="jobForm">
            <datablau-detail-subtitle title="任务调度" mt="0px"></datablau-detail-subtitle>
            <el-form-item label="是否启用">
                <datablau-switch
                v-model="jobDetail.enable"
                :active-value="true"
                :inactive-value="false"
                ></datablau-switch>
            </el-form-item>
            <el-form-item>
                <datablau-button
                @click="runJob"
                :disabled="!jobDetail.enable || isRunning"
                >
                <span v-if="isRunning">
                    <i class="el-icon-loading"></i>
                    正在运行...
                </span>
                <span v-else>运行</span>
                </datablau-button>
            </el-form-item>
            <el-form-item class="sub-header" style="margin-left: -31.5px">
                <select-period
                style="transform: translateX(-27px)"
                @getCronString="getCronString"
                :cron="
                    jobDetail.cronExpression && jobDetail.cronExpression.includes('cron:')
                    ? jobDetail.cronExpression.split('cron:')[1]
                    : jobDetail.cronExpression
                "
                defaultCheck="scheduleByWeekdays"
                class="datablau-select-period"
                ></select-period>
            </el-form-item>
            </datablau-form>
            <div style="    position: absolute;
    top: 230px;
    left: 20px;
    right: 20px;
    bottom: 50px;
    overflow: auto;">
              <datablau-table
                  :data="jobHistory"
                  :default-sort="{ prop: 'startTime', order: 'descending' }"
                  class="datablau-table job-detail-table"
                  row-key="id"
                  ref="historyTable"
                  show-overflow-tooltip
                  :show-column-selection="false"
                  :data-selectable="false"
                  height="100%"
                  >
                  <el-table-column
                      prop="createDate"
                      label="创建时间"
                      :formatter="$timeFormatter"
                      sortable
                      width="200"
                  ></el-table-column>
                  <el-table-column
                      prop="startDate"
                      label="最近运行"
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
                                      {{ statusList[scope.row.status] }}
                                  </span>
                      </div>
                      </template>
                  </el-table-column>
                  <el-table-column
                      prop="executionResult"
                      label="任务结果"
                      sortable
                  ></el-table-column>
                  </datablau-table>
            </div>
                <div class="cut-apart-btn">
                    <datablau-button  type="important" @click="save">
                        保存
                    </datablau-button>
                </div>
    </div>
</template>
<script>
import selectPeriod from './selectPeriod'
// import JobLogPage from './jobLog.vue'
export default {
  components: {
    // JobLogPage,
    selectPeriod
  },
  data () {
    return {
      rawData: {},
      isRunning: false,
      jobDetail: {
        cronExpression: null,
        enable: false,
        id: 1
      },
      jobHistory: [],
      statusList: {
        1: '成功',
        2: '正在运行',
        0: '失败'
      }
    }
  },
  mounted () {
    this.getTasksList()
    this.getSetting()
  },
  methods: {
    getSetting () {
      let url = `${this.$domains}metricManagement/metricWarning/setting`
      this.$http
        .get(url)
        .then(res => {
          console.log(res, 'res')
          this.jobDetail.enable = res.data.enable
          this.jobDetail.cronExpression = res.data?.cronExpression
          this.jobDetail.id = res.data.id
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTasksList () {
      let url = `${this.$domains}metricManagement/metricWarning/tasks`
      this.$http
        .get(url)
        .then(res => {
          this.jobHistory = res.data
          if (
            this.jobHistory.filter(
              e => e.status === 2
            ).length
          ) {
            this.updateJobRunning(true)
          } else {
            this.isRunning = false
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateJobRunning (isRunning) {
      this.isRunning = isRunning
      if (isRunning) {
        setTimeout(() => {
          this.getTasksList()
        }, 3000)
      }
    },
    getCronString (cronString, type) {
      this.jobDetail.cronExpression = cronString
    },
    save () {
      console.log(this.jobDetail, 'this.jobDetail')

      let url = `${this.$domains}metricManagement/metricWarning/setting`
      this.$http
        .put(url, this.jobDetail)
        .then(res => {
          this.$message.success('保存成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    runJob () {
      let url = `${this.$domains}metricManagement/metricWarning/execute`
      this.$http
        .get(url)
        .then(res => {
        //   this.$message.success('成功')
          this.isRunning = true
          setTimeout(() => {
            this.getTasksList()
          }, 1000)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 设置颜色
    getJobColor (status) {
      let color = '#ccc'
      switch (status) {
        case 1:
          color = '#66BF16'
          break
        case 0:
          color = '#F2220A'
          break
        case 'NOT_RUN':
          color = '#5dc4c0'
          break
        case 'SKIPPED':
        case 'STOPPED':
          color = '#999999'
          break
        case 2:
          color = '#409EFF'
          break
        case 'INIT':
          color = '#e6ad00'
          break
      }
      return color
    }
  }
}
</script>
<style lang="scss">
.cut-apart-btn{
    position: absolute;
    left: 0;
    bottom: 0;
    box-shadow: 0 -5px 14px -8px rgba(0,0,0,.2);
    border-top: 1px solid transparent;
    width: 100%;
    height: 50px;
    padding: 8px 20px;
    background-color: #fff;
}
</style>
