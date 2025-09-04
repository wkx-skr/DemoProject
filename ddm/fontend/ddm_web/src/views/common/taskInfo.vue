<template>
  <div style="display: inline-block;height: 100%;">
    <datablau-dialog
      :title="taskTitle"
      :visible.sync="taskDetailModal"
      size="m"
      height="300px"
      append-to-body
      custom-class="task-detail-dialog-wrapper"
    >
      <div class="task-detail-wrapper">
        <span v-if="+taskDetail.percentage === 100">
          任务完成:{{moment(taskDetail.timestamp).format('YYYY-MM-DD HH:mm:ss')}}
        </span>
        <span v-else>
          正在运行：{{taskDetail.percentage}}%...
        </span>
        <datablau-input
          style="margin-top: 16px;"
          resize="none"
          :value="taskDetail.messageList.map(msg => typeof msg === 'string' ? msg : msg.message || '').filter(Boolean).join('\r\n')"
          placeholder="暂无内容"
          type="textarea"
        ></datablau-input>
      </div>
    </datablau-dialog>
    <datablau-table
      v-loading="loading"
      ref="taskTable"
      :data-selectable="option.selectable"
      :auto-hide-selection="option.autoHideSelectable"
      :show-column-selection="option.showColumnSelection"
      :column-selection="option.columnSelection"
      :border="option.columnResizable"
      :data="taskData"
      height="100%"
      row-key="taskId"
      @expand-change="handleExpand"
    >
      <el-table-column
        type="expand"
      >
        <template slot-scope="scope">
          <div class="task-result">
            <div class="header">
              <span v-if="+scope.row.percentage === 100">
                任务完成:{{moment(getLastMessageTime(scope.row)).format('YYYY-MM-DD HH:mm:ss')}}
              </span>
              <span v-else>
                任务正在运行：{{scope.row.percentage}}%...
              </span>
              <datablau-button class="go-detail-btn" @click="goTaskDetail(scope.row)" style="float: right;margin-right: 6px;" type="text">查看进度</datablau-button>
            </div>
            <ul class="content">
              <li :key="index" v-for="(item, index) in scope.row.detailMessages">
                {{formatMessage(item)}}<span v-if="index === scope.row.detailMessages.length - 1">...</span>
              </li>
            </ul>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="150"
        prop="jobName"
        label="数据库类型"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
                    <span :class="{ highlight: scope.row.highlight }">
                      <Database-Type
                        :key="scope.row.dbtype"
                        :value="scope.row.dbtype"
                      ></Database-Type>
                    </span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="模型名称"
        prop="modelName"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        label="运行时间"
        min-width="200">
        <template slot-scope="scope">
          {{moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column min-width="150" prop="stage" label="任务状态">
        <template slot-scope="scope">
          <!-- <span>{{ getStatus(scope.row.stage) }}</span> -->
          <span v-if="scope.row.message === 'FAILED'">任务失败</span>
          <p
            v-else
            style="display: inline-block"
          >
            <datablau-progressed
              class="task-progress"
              :percent="+scope.row.percentage"
              :strokeWidth="8"
            ></datablau-progressed>
          </p>
        </template>
      </el-table-column>
    </datablau-table>
  </div>

</template>

<script>
import DatabaseType from '@/components/common/DatabaseType.vue'
import moment from 'moment'
export default {
  mounted () {
  },
  data () {
    return {
      taskDetailModal: false,
      taskTitle: '',
      taskDetail: {
        messageList: []
      },
      moment,
      taskPopover: false,
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true
      },
      taskData: [],
      loading: false
    }
  },
  components: {
    DatabaseType
  },
  methods: {
    getLastMessageTime (row) {
      if (row.detailMessages && row.detailMessages.length > 0) {
        const lastMessage = row.detailMessages[row.detailMessages.length - 1]
        return lastMessage.timestamp || row.createTime
      }
      return row.createTime
    },
    formatMessage (message) {
      if (typeof message === 'string') return message
      if (typeof message === 'object') {
        const { message: msg, progress, status } = message
        let formattedMsg = msg || ''
        if (progress) formattedMsg += ` (${progress}%)`
        if (status) formattedMsg += ` [${status}]`
        return formattedMsg
      }
      return ''
    },
    goTaskDetail (row) {
      this.$http.get(`${this.$url}/service/re/${row.taskId}/progress`).then(res => {
        const messages = res.data || []
        const lastMessage = messages[messages.length - 1] || {}
        this.taskTitle = row.dbtype
        this.taskDetail = {
          ...row,
          messageList: messages,
          percentage: lastMessage.progress || row.percentage || 0,
          timestamp: lastMessage.timestamp || row.createTime
        }
        this.taskDetailModal = true
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    deleteTask (row, index) {
      this.$http.delete(`${this.$url}/service/re/job/${row.taskId}`)
        .then(res => {
          this.getJobs()
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    // 关闭任务弹窗
    closeTask () {
      this.taskPopover = false
    },
    showTask () {
      this.taskPopover = true
      this.taskData = []
      this.loading = true
      setTimeout(() => { // 确保process返回数据
        this.getJobs()
      }, 500)
    },
    getJobStatus (element) {
      if (!element || !element.jobId) return
      this.$http.post(`${this.$url}/service/re/${element.jobId}/progress`)
        .then(res => {
          if (res.data) {
            const index = this.taskData.findIndex(item => item.jobId === element.jobId)
            if (index !== -1) {
              this.taskData[index] = {
                ...this.taskData[index],
                percentage: res.data.progress || 0,
                messageListInfo: res.data.messages || [],
                message: res.data.status === 'FAILED' ? 'FAILED' : 'Done'
              }
            }
          }
        })
        .catch(e => {
          console.error('Failed to get job status:', e)
        })
    },
    getJobs () {
      this.loading = true
      this.$http.get(`${this.$url}/service/re/job/list`)
        .then(res => {
          if (!Array.isArray(res.data)) {
            this.taskData = []
            return
          }
          this.taskData = res.data.map(item => ({
            taskId: item.jobId,
            dbtype: item.dbType || '',
            modelName: item.modelName || '',
            createTime: item.createTime,
            percentage: item.progress || 100,
            message: item.status === 'FAILED' ? 'FAILED' : 'Done',
            detailMessages: []
          }))

          // 获取运行中任务的状态
          const runningTasks = this.taskData.filter(task => task.percentage !== 100)
          if (runningTasks.length) {
            this.updateRunningTasks(runningTasks)
          }
        })
        .catch(err => {
          this.$showFailure(err)
          this.taskData = []
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 新增方法处理运行中任务的状态更新
    updateRunningTasks (runningTasks) {
      Promise.all(runningTasks.map(task =>
        this.$http.get(`${this.$url}/service/re/${task.taskId}/progress`)
      )).then(progressResults => {
        progressResults.forEach((res, index) => {
          const task = runningTasks[index]
          const taskIndex = this.taskData.findIndex(t => t.taskId === task.taskId)
          if (res.data && taskIndex !== -1) {
            const messages = res.data || []
            const lastMessage = messages[messages.length - 1] || {}
            this.$set(this.taskData, taskIndex, {
              ...this.taskData[taskIndex],
              percentage: lastMessage.progress || 0,
              message: lastMessage.status === 'FAILED' ? 'FAILED' : 'Done'
            })
          }
        })

        // 如果还有运行中任务，继续轮询
        if (this.taskData.some(task => task.percentage !== 100)) {
          setTimeout(() => {
            this.updateRunningTasks(this.taskData.filter(task => task.percentage !== 100))
          }, 1000)
        }
      })
    },
    handleExpand (row, expanded) {
      if (expanded) {
        this.$http.get(`${this.$url}/service/re/${row.taskId}/progress`)
          .then(res => {
            const index = this.taskData.findIndex(item => item.taskId === row.taskId)
            if (index !== -1) {
              // 使用Vue.set确保响应式更新
              const messages = res.data || []
              const lastMessage = messages[messages.length - 1] || {}
              this.$set(this.taskData[index], 'detailMessages', messages)
              // 更新进度和状态
              this.$set(this.taskData[index], 'percentage', lastMessage.progress || this.taskData[index].percentage)
              this.$set(this.taskData[index], 'message', lastMessage.status === 'FAILED' ? 'FAILED' : 'Done')
            }
          })
          .catch(err => {
            this.$showFailure(err)
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.task-detail-wrapper {
  span {
    margin-top: 16px;
    display: block;
    font-size: 14px;
    color: #555;
  }
  .datablau-input /deep/ textarea {
    width: 528px;
    height: 286px;
  }
}
.task-result {
  padding: 12px 16px;
  font-size: 12px;
  color: #555;
  .header {
    line-height: 1;
    .go-detail-btn {
      position: relative;
      top: -5px;
    }
  }
  .content {
    margin-top: 10px;
    background: #F5F5F5;
    padding: 10px;
  }
}
.task-progress {
  width: 100px;
  /deep/.el-progress__text {
    line-height: 13px;
    font-size: 12px !important;
  }
}
.is-block.icon:hover {
  color: rgb(153, 153, 153)!important;
}
</style>
