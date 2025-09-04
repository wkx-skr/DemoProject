<template>
  <div class="task-manage" v-loading="loading">
    <div>
      <datablau-page-title
        :parent-name="$t('common.page.systemManage')"
        :name="$t('common.page.taskManage')"
      ></datablau-page-title>
      <div style="float: right; margin-right: 20px">
        <datablau-button
          type="primary"
          class="iconfont icon-tianjia"
          @click="toAddTask"
        >
          {{ $t('assets.taskManage.addTaskText') }}
        </datablau-button>
      </div>
    </div>
    <div class="one">
      <datablau-input
        :iconfont-state="true"
        style="width: 240px"
        clearable
        v-model="keyword"
        :placeholder="$t('assets.taskManage.inputPlaceholder')"
        @keydown.enter.native="search"
      ></datablau-input>
    </div>
    <datablau-form-submit style="top: 80px">
      <datablau-table :data="taskData" ref="taskTable" class="task-table">
        <el-table-column
          prop="taskName"
          :label="$t('assets.taskManage.nameText')"
        ></el-table-column>
        <el-table-column
          prop="status"
          :label="$t('assets.taskManage.statusText')"
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
        <el-table-column
          prop="creator"
          :label="$t('assets.taskManage.creatorText')"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('assets.taskManage.createTimeText')"
        >
          <template slot-scope="scope">
            {{ $timeFormatter(new Date(scope.row.createTime).getTime()) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="runTime"
          :label="$t('assets.taskManage.runTimeText')"
        >
          <template slot-scope="scope">
            {{
              scope.row.runTime
                ? $timeFormatter(new Date(scope.row.runTime).getTime())
                : ''
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="endTime"
          :label="$t('assets.taskManage.finishTimeText')"
        >
          <template slot-scope="scope">
            {{
              scope.row.endTime
                ? $timeFormatter(new Date(scope.row.endTime).getTime())
                : ''
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('assets.taskManage.operationText')"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-tooltip
              effect="dark"
              :content="scope.row.enabled ? '任务开启' : '任务关闭'"
              placement="bottom"
            >
              <datablau-switch
                v-model="scope.row.enabled"
                @change="handleStatusChange(scope.row)"
                :disabled="runningIds.indexOf(scope.row.taskId) !== -1"
                :tooltipContent="
                  scope.row.status === 'RUNNING'
                    ? $t('assets.taskManage.enableErrorTip')
                    : ''
                "
                style="display: inline-block"
              ></datablau-switch>
            </datablau-tooltip>

            <datablau-button
              type="icon"
              style="margin-left: 4px"
              class="iconfont icon-bianji"
              :tooltipContent="
                scope.row.status === 'RUNNING'
                  ? $t('assets.taskManage.cannotText', {
                      text: $t('assets.taskManage.editText'),
                    })
                  : $t('assets.taskManage.editText')
              "
              :disabled="runningIds.indexOf(scope.row.taskId) !== -1"
              @click="toEditTask(scope.row)"
            ></datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-delete"
              :tooltipContent="
                scope.row.status === 'RUNNING'
                  ? $t('assets.taskManage.cannotText', {
                      text: $t('assets.taskManage.deleteText'),
                    })
                  : $t('assets.taskManage.deleteText')
              "
              :disabled="runningIds.indexOf(scope.row.taskId) !== -1"
              @click="toDeleteTask(scope.row)"
            ></datablau-button>
            <datablau-button
              v-if="runningIds.indexOf(scope.row.taskId) === -1"
              type="icon"
              class="iconfont"
              :class="['icon-working']"
              @click="handleTaskRun(scope.row)"
              :tooltipContent="
                runningIds.indexOf(scope.row.taskId) !== -1
                  ? $t('assets.taskManage.cannotText', {
                      text: $t('assets.taskManage.repeatRun'),
                    })
                  : $t('assets.taskManage.runText')
              "
              :disabled="runningIds.indexOf(scope.row.taskId) !== -1"
            ></datablau-button>
            <datablau-button
              v-if="runningIds.indexOf(scope.row.taskId) !== -1"
              type="text"
              class="iconfont icon-loading"
              style="cursor: default"
            >
              {{ statusFormatter(scope.row.status) || '正在执行...' }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </datablau-form-submit>

    <task-details
      v-if="showDetails"
      :taskId="activeTaskId"
      :couldEdit="couldEditDetails"
      @back="closeTaskDetail"
    ></task-details>
  </div>
</template>

<script>
import api from '../utils/api'
import taskDetails from './taskDetails.vue'
export default {
  name: 'TaskManage',
  components: { taskDetails },
  data() {
    return {
      loading: false,
      keyword: '',
      taskData: [],
      showDetails: false,
      couldEditDetails: true,
      activeTaskId: null,
      runningIds: [],
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    statusFormatter(status) {
      return this.$t('assets.taskManage.statusList.' + status)
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
    async search(defaultParams = {}) {
      // 按照设计稿，暂不分页
      const params = {
        taskName: this.keyword,
        page: 1,
        pageSize: 1000,
        ...defaultParams,
      }
      try {
        this.loading = true
        const res = await api.getSyncTaskList(params)
        this.taskData = res.data.data.content
        const runningIds = res.data.data.content
          .filter(
            i =>
              i.status !== 'FINISHED' &&
              i.status !== 'FAILED' &&
              i.status !== 'NOT_RUN' &&
              i.status !== 'STOPPED'
          )
          .map(i => i.taskId)
        this.runningIds = runningIds
        if (runningIds.length) {
          setTimeout(() => {
            this.onlyGetList()
          }, 200)
        }
        this.loading = false
      } catch (error) {
        this.$blauShowFailure(error)
        this.loading = false
      }
    },
    // 是否启用任务
    async handleStatusChange(row) {
      try {
        const enableRes = await api.changeTaskEnable(row.taskId, row.enabled)
        if (enableRes.status === 200) {
          this.$blauShowSuccess(
            this.$t('assets.taskManage.successText', {
              type: row.enabled
                ? this.$t('assets.taskManage.openText')
                : this.$t('assets.taskManage.closeText'),
            })
          )
        } else {
          this.$blauShowFailure(
            this.$t('assets.taskManage.failedText', {
              type: row.enabled
                ? this.$t('assets.taskManage.openText')
                : this.$t('assets.taskManage.closeText'),
            })
          )
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    closeTaskDetail() {
      this.showDetails = false
      this.activeTaskId = null
      this.search()
    },
    // 添加同步任务
    toAddTask() {
      this.showDetails = true
      this.couldEdit = true
    },
    // 编辑同步任务
    toEditTask(row) {
      this.activeTaskId = row.taskId
      this.couldEdit = true
      this.showDetails = true
    },
    // 删除同步任务
    async toDeleteTask(row) {
      this.$DatablauCofirm(
        `删除[${row.taskName}]为不可逆操作，是否确定删除`,
        '删除任务',
        {
          type: 'warning',
        }
      ).then(async () => {
        try {
          const res = await api.deleteSyncTask(row.taskId)
          if (res.status === 200) {
            this.$blauShowSuccess(
              this.$t('assets.taskManage.successText', {
                type: this.$t('assets.taskManage.deleteText'),
              })
            )
            this.search()
          } else {
            this.$blauShowFailure(
              this.$t('assets.taskManage.failedText', {
                type: this.$t('assets.taskManage.deleteText'),
              })
            )
          }
        } catch (error) {
          this.$blauShowFailure(error)
        }
      })
    },
    // 运行任务
    async runTask(taskId) {
      try {
        this.loading = true
        this.runningIds.push(taskId)
        const runRes = await api.runTask(taskId, this.$user.username)
        if (runRes) {
          this.search()
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        this.$blauShowFailure(error)
      }
    },
    async onlyGetList() {
      const params = {
        taskName: this.keyword,
        page: 1,
        pageSize: 1000,
      }
      try {
        const res = await api.getSyncTaskList(params)
        this.taskData = res.data.data.content
        const runningIds = res.data.data.content
          .filter(
            i =>
              i.status !== 'FINISHED' &&
              i.status !== 'FAILED' &&
              i.status !== 'NOT_RUN' &&
              i.status !== 'STOPPED'
          )
          .map(i => i.taskId)
        this.runningIds = runningIds
        if (runningIds.length) {
          setTimeout(() => {
            this.onlyGetList()
          }, 200)
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 运行任务
    async handleTaskRun(row) {
      try {
        const canRes = api.canTaskRun(row.jobId)
        const canExecute = !!canRes.data
        if (canExecute) {
          this.runTask(row.jobId)
        } else {
          this.$confirm(this.$t('assets.taskManage.runTips'))
            .then(() => {
              this.runTask(row.jobId)
            })
            .catch(() => {})
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.task-manage {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: #fff;
  .one {
    display: inline-block;
    margin-left: 20px;
    margin-bottom: 10px;
    span {
      margin-right: 6px;
    }
  }
  .task-table {
    .status-style {
      width: 6px;
      height: 6px;
      display: inline-block;
      transform: translateY(-2px);
      border-radius: 50%;
    }
    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 3px;
    }
    .finished {
      .status-dot {
        background-color: #66bf16;
      }
      .status-text {
        color: #66bf16;
      }
    }
    .not-finished {
      .status-dot {
        background-color: #ff7519;
      }
      .status-text {
        color: #ff7519;
      }
    }
  }
}
</style>
