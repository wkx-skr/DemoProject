<template>
  <div>
    <datablau-dialog :title="$t('system.taskMonitoring.log')" size="xl" :visible.sync="logDialogVisible" custom-class="log-dialog">
      <div class="item-container">
        <div v-for="i in logContent" class="item">{{i}}</div>
      </div>
      <span slot="footer">
        <datablau-button
          @click="closeDialog"
        >
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-detail
      :column="1"
      label-width="6em"
    >
      <el-form-item :label="$t('system.taskMonitoring.serverName')">{{JobServerLabel[message.jobServerName] || message.jobServerName}}</el-form-item>
      <br>
<!--      <el-form-item label="监听队列">{{message.queueName}}</el-form-item>-->
<!--      <br>-->
      <el-form-item :label="$t('system.taskMonitoring.numberOfServices')">{{message.processLimit}}</el-form-item>
<!--      <el-form-item label="服务列表"></el-form-item>-->
      <datablau-table :data="message.jobServers" style="max-width: 1000px;">
        <el-table-column label="#" prop="topicName" :formatter="topicNameFormatter" :width="37">
        </el-table-column>
        <el-table-column :label="$t('system.taskMonitoring.processID')" prop="processId" :min-width="200"></el-table-column>
        <el-table-column :label="$t('system.taskMonitoring.status')" prop="jobServerStatus" show-overflow-tooltip :min-width="200">
          <template slot-scope="scope">{{JobServerStatusLabel[JobServerStatus[scope.row.jobServerStatus]]}}</template>
        </el-table-column>
        <el-table-column :label="$t('system.taskMonitoring.operate')" :width="140" align="right">
          <template slot-scope="scope">
            <datablau-button @click="stopService(scope.row)" type="text" :disabled="disableStopButton(scope.row)">{{$t('system.taskMonitoring.stop')}}</datablau-button>
            <datablau-button @click="showLogs(scope.row)" type="text" :disabled="disableLogs(scope.row)">{{$t('system.taskMonitoring.viewLogs')}}</datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </datablau-detail>
    <datablau-table style="margin: 20px;max-width: 1000px;" :data="jobList">
      <el-table-column :label="$t('system.taskMonitoring.taskName')" prop="name" show-overflow-tooltip :min-width="300"></el-table-column>
      <el-table-column :label="$t('system.taskMonitoring.taskType')" prop="jobType" :min-width="200" show-overflow-tooltip></el-table-column>
      <el-table-column :label="$t('system.taskMonitoring.processID')" prop="processId" :min-width="100" :formatter="processIdFormatter"></el-table-column>
<!--      <el-table-column-->
<!--        prop="creator"-->
<!--        :label="$t('system.job.creator')"-->
<!--        :width="100"-->
<!--      ></el-table-column>-->
      <el-table-column
        prop="lastRunStatus"
        :label="$t('system.job.status')"
        width="120"
      >
        <template slot-scope="scope">
          <div>
            <i
              class="status-style"
              :style="{ background: getJobColor(scope.row.lastRunStatus) }"
            ></i>
            <span :style="{ color: getJobColor(scope.row.lastRunStatus) }">
                {{ statusFormatter(scope.row.lastRunStatus) }}
              </span>
          </div>
        </template>
      </el-table-column>
<!--      <el-table-column-->
<!--        prop="lastRunStartTime"-->
<!--        :label="$t('system.job.lastRun')"-->
<!--        :formatter="$timeFormatter"-->
<!--        :width="170"-->
<!--      ></el-table-column>-->
<!--      <el-table-column-->
<!--        prop="nextRunTime"-->
<!--        :label="$t('system.job.nextRun')"-->
<!--        :formatter="$timeFormatter"-->
<!--        :width="170"-->
<!--      ></el-table-column>-->
    </datablau-table>
<!--    <datablau-button style="margin: 20px;">删除勾选</datablau-button>-->
  </div>
</template>
<script>
import _ from 'lodash'
import {JobServerStatus, JobServerStatusLabel, JobServerLabel} from "@/view/jobMonitor/Constant";
export default {
  props: {
    rawMessage: Object,
  },
  data() {
    return {
      message: {},
      logDialogVisible: false,
      currentJobRow: null,
      getDataTimer: null,
      JobServerLabel: JobServerLabel,
    }
  },
  mounted () {
    this.message = _.cloneDeep(this.rawMessage)
    this.getData()
  },
  beforeDestroy() {
    clearTimeout(this.getDataTimer)
  },
  computed: {
    JobServerStatus() {
      return JobServerStatus
    },
    JobServerStatusLabel() {
      return JobServerStatusLabel
    },
    jobList() {
      const service = this.message
      const result = []
      if (service.jobDtos) {
        service.jobDtos.forEach(item => {
          try {
            if (item.lastRunStatus === JobServerStatus[JobServerStatus.RUNNING]) {
              const runningService = service.jobServers.find(i => i.runningJob.name === item.name)
              if (runningService) {
                item.processId = runningService.processId
              }
            }
          } catch(e) {
            console.error(e)
          }
          result.push(item)
        })
      }
      return result
    },
    logContent() {
      if (this.currentJobRow && this.currentJobRow.startMessage) {
        return this.currentJobRow.startMessage.split('\r\n')
      } else {
        return []
      }
    },
  },
  methods: {
    disableLogs(message) {
      return !message.startMessage
    },
    disableStopButton(message) {
      return message.jobServerStatus !== 'RUNNING'
    },
    // 接口调整，已经不可使用。
    getData() {
      clearTimeout(this.getDataTimer)
      const serverId = this.message.serverId
      this.$http.post(`/job/manager/getInstProcess?serverId=${serverId}`).then(res => {
        this.message = res.data.executions.filter(i => i.jobServerName === this.message.jobServerName)[0]
        this.message.serverId = serverId
        // this.$emit('update-tree-item',  this.message)
        // if (this.message.jobServerStatus === 'RUNNING') {
        this.getDataTimer = setTimeout(() => {
            this.getData()
          }, 3000)
        // }
      })
    },
    stopService(row) {
      const service = this.message
      this.isLoading = true
      this.message.jobServers = null
      this.$http.post(`/job/manager/stopJobServer?serverInstanceId=${service.serverId}&appName=${service.jobServerName}&pid=${row.processId}`).then(res => {
        this.$message.success(this.message.jobServerName + this.$t('system.taskMonitoring.stopRun'))
        this.getData()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    showLogs(row) {
      this.currentJobRow = row
      this.logDialogVisible = true
    },
    closeDialog() {
      this.logDialogVisible = false
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
    statusFormatter(status) {
      return this.$t('quality.page.qualityExamineJob.statusList.' + status)
    },
    topicNameFormatter(row) {
      if (row.topicName.includes(':')) {
        return row.topicName.split(':')[1]
      }
    },
    processIdFormatter(row) {
      return row.processId || '-'
    },
  }
}
</script>
