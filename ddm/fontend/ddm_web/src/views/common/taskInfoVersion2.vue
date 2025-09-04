<template>
  <el-tooltip style="margin-right: 10px;" :content="$t('common.task.title')" :hide-after="1000" effect="dark">
    <el-popover
      v-clickOutside="closeTask"
      placement="right"
      width="800"
      trigger="manual"
      v-model="taskPopover"
      popper-class="task-popper common_ui_header_task_pop"
    >
      <div style="padding-left: 12px">
        <p
          class="title"
          style="
              height: 32px;
              font-size: 14px;
              font-weight: 600;
              color: #555;
              line-height: 32px;
            "
        >
          {{$t('common.task.taskProgressOverview')}}
        </p>
        <datablau-tabs
          v-if="taskPopover"
          v-model="taskTabName"
          @tab-click="handleTaskTabChange"
          class="task-tabs"
        >
          <el-tab-pane v-if="!damEnabled" :label="$t('common.task.importTask')" name="import"></el-tab-pane>
          <el-tab-pane v-if="!damEnabled" :label="$t('common.task.exportTask')" name="export"></el-tab-pane>
<!--          <el-tab-pane v-if="!damEnabled" :label="$t('common.task.explorationTask')" name="profiling"></el-tab-pane>
          <el-tab-pane v-if="!damEnabled" :label="$t('common.task.otherTasks')" name="other"></el-tab-pane>-->
          <el-tab-pane label="逆向任务" name="reverse"></el-tab-pane>
        </datablau-tabs>
        <div
          style="
              width: 100%;
              overflow: hidden;
              margin-top: 2px;
              margin-bottom: 37px;
            "
          :style="{
              height: tableHeight + 'px',
            }"
        >
          <datablau-table
            v-if="!damEnabled && taskTabName !== 'reverse'"
            ref="taskTable"
            :data-selectable="option.selectable"
            :auto-hide-selection="option.autoHideSelectable"
            :show-column-selection="option.showColumnSelection"
            :column-selection="option.columnSelection"
            :border="option.columnResizable"
            :data="taskData"
            height="100%"
            style="
                margin-bottom: 37px;
                border-bottom: 1px solid #eee;
                padding-right: 12px;
              "
            :expand-row-keys="taskTableExpends"
            row-key="jobId"
            :row-class-name="getRowClassName"
            @row-click="handleRowClick"
            @expand-change="handleTableExpand"
          >
            <el-table-column
              type="expand"
              :width="taskTabName === 'import'  ? 20 : 1"
            >
              <template slot-scope="scope">
                <div style="padding: 8px;box-shadow: inset 0 4px 4px 0 rgba(0,0,0,0.06);" v-if="importTaskResult.errorMessage">
                  <p style="max-height: 100px;overflow: auto;background: #f5f5f5;padding: 12px;color: #555;">{{ importTaskResult.errorMessage }}</p>
                </div>
                <div class="import-result" v-else>
                  <div class="success-title">
                    <i class="el-icon-success success-icon"></i>
                    <span
                      style="
                          margin-left: 8px;
                          line-height: 19px;
                          float: left;
                          display: inline-block;
                        "
                    >
                        {{$t('common.task.importSuccessful')}}{{ importTaskResult.success }} {{$t('common.task.strip')}}
                      </span>
                  </div>
                  <div v-if="importTaskResult.resultType === 'com.datablau.data.common.data.instantjob.ImportInstantJobResult'">
                    <div
                      class="error-group"
                    >
                      <div class="error-title">
                        <i class="el-icon-error fail-icon"></i>
                        <span class="error-reason">{{$t('common.task.errorMessage2')}}{{ importTaskResult.failed }} {{$t('common.task.strip')}}</span>
                        <datablau-button
                          style="float: right;"
                          type="text"
                          v-if="importTaskResult.failed !== 0"
                          @click="handleDownload(importTaskResult.fileId)"
                        >
                        <span style="display: flex;align-items: center;">
                          <span>{{$t('common.task.incorrectData')}}</span>
                          <datablau-tooltip
                            :content="$t('common.task.incorrectDataTip')"
                            placement="bottom"
                          >
                            <i style="font-size: 14px;padding-left: 4px;" class="iconfont icon-tips"></i>
                          </datablau-tooltip>
                        </span>
                        </datablau-button>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div
                      v-if="importTaskResult.errorMsg.length"
                      class="error-group"
                    >
                      <div class="error-title">
                        <i class="el-icon-error fail-icon"></i>
                        <span
                          class="error-reason"
                          v-if="importTaskResult.errorMsg.length === 1"
                        >
                            {{ importTaskResult.errorMsg[0] }}
                          </span>
                        <span class="error-reason" v-else>{{$t('common.task.errorMessage')}}{{ importTaskResult.failed }} {{$t('common.task.strip')}}</span>
                      </div>
                      <div
                        v-if="importTaskResult.errorMsg.length > 1"
                        class="error-list"
                      >
                        {{ importTaskResult.errorMsg.join('， ') }}
                      </div>
                    </div>
                    <div  v-else>
                      <div
                        v-for="errorKey in Object.keys(
                            importTaskResult.errorListMap || {}
                          )"
                        :key="errorKey"
                        class="error-group"
                      >
                        <!-- 数据资产模块的数据资产导入结果展示 -->
                        <template
                          v-if="
                              scope.row.jobName.slice(0, 6) === '数据资产导入' &&
                              errorKey &&
                              importTaskResult.errorListMap[errorKey]
                            "
                        >
                          <div class="error-title">
                            <i v-if="errorKey === 'INITIATE_CHANGE'" class="el-icon-success success-icon"></i>
                            <i v-else class="el-icon-error fail-icon"></i>
                            <span class="error-reason">
                                {{ importTaskResult.messageMap[errorKey] }}:
                              </span>
                            <span class="error-count">
                                {{
                                Object.values(
                                  importTaskResult.errorListMap[errorKey]
                                ).reduce((a, b) => {
                                  return a + b.length
                                }, 0)
                              }}
                                {{$t('common.task.strip')}}
                              </span>
                            <span
                              class="copy"
                              v-copy="
                                  Object.entries(
                                    importTaskResult.errorListMap[errorKey]
                                  )
                                    .map(
                                      arr =>
                                        importTaskResult.messageMap[arr[0]] +
                                        ':' +
                                        arr[1]
                                    )
                                    .join('\n')
                                "
                            >
                              {{$t('common.task.copy')}}
                              </span>
                          </div>
                          <div class="error-list">
                            {{
                              Object.entries(
                                importTaskResult.errorListMap[errorKey]
                              )
                                .map(
                                  arr =>
                                    importTaskResult.messageMap[arr[0]] +
                                    ' : ' +
                                    arr[1]
                                )
                                .join('\n')
                            }}
                          </div>
                        </template>
                        <template
                          v-else-if="
                              scope.row.jobName.slice(0, 6) !== '数据资产导入' &&
                              errorKey &&
                              importTaskResult.errorListMap[errorKey] &&
                              importTaskResult.errorListMap[errorKey].length
                            "
                        >
                          <div class="error-title">
                            <i v-if="errorKey === 'INITIATE_CHANGE'" class="el-icon-success success-icon"></i>
                            <i v-else class="el-icon-error fail-icon"></i>
                            <span class="error-reason">
                                {{ importTaskResult.messageMap[errorKey] }}:
                              </span>
                            <span class="error-count">
                                {{ importTaskResult.errorListMap[errorKey].length }}
                                {{$t('common.task.strip')}}
                              </span>
                            <span
                              class="copy"
                              v-copy="
                                  importTaskResult.errorListMap[errorKey].join(
                                    '， '
                                  )
                                "
                            >
                              {{$t('common.task.copy')}}
                              </span>
                          </div>
                          <div class="error-list">
                            {{
                              importTaskResult.errorListMap[errorKey].join('， ')
                            }}
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              min-width="250"
              prop="jobName"
              :label="$t('common.task.taskName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                  <span :class="{ highlight: scope.row.highlight }">
                    {{ scope.row.jobName }}
                  </span>
              </template>
            </el-table-column>
            <el-table-column min-width="150" prop="stage" :label="$t('common.task.taskStatus')">
              <template slot-scope="scope">
                <!-- <span>{{ getStatus(scope.row.stage) }}</span> -->
                <p
                  v-if="
                      scope.row.stage === 'FINISHED' ||
                      scope.row.stage === 'RUNNING'
                    "
                  style="display: inline-block"
                >
                  <datablau-progressed
                    class="task-progress"
                    :percent="scope.row.percent"
                    :strokeWidth="8"
                  ></datablau-progressed>
                </p>
                <span v-if="scope.row.stage === 'FAILED'">{{$t('common.task.taskFailed')}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.task.operation')" min-width="100" align="center">
              <template slot-scope="scope">
                <datablau-button
                  v-if="taskTabName === 'export'"
                  type="text"
                  @click="scanResult(scope.row)"
                  :disabled="
                      !(
                        scope.row.stage === 'FINISHED'
                      )
                    "
                  :tooltip-content="$t('common.task.export')"
                  class="iconfont icon-import"
                ></datablau-button>
                <datablau-button
                  v-if="taskTabName === 'profiling'"
                  type="icon"
                  @click="goProfiling(scope.row)"
                  class="iconfont icon-see"
                  :tooltip-content="$t('common.button.scan')"
                ></datablau-button>
                <datablau-button
                  type="text"
                  @click="deleteThis(scope.row)"
                  class="iconfont icon-qingchu"
                  :disabled="
                      !(
                        scope.row.stage === 'FINISHED' ||
                        scope.row.stage === 'FAILED'
                      )
                    "
                  :tooltip-content="$t('common.task.cleanUp')"
                  style="margin-left: 0"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <reverse-task-info ref="taskTable2" v-show="taskTabName === 'reverse'"></reverse-task-info>
        </div>
        <datablau-button
          style="position: absolute; bottom: 6px; right: 20px"
          type="secondary"
          @click="closeTask"
        >
          {{ $t('common.button.close') }}
        </datablau-button>
      </div>
      <datablau-button
        slot="reference"
        type="icon"
        low-key
        no-background
        @click="showTask"
        v-if="currentProduct !== 'ddd'"
      >
        <i class="iconfont icon-wentiqingdan"></i>
      </datablau-button>
    </el-popover>
  </el-tooltip>
</template>
<script>
import reverseTaskInfo from './taskInfo.vue'
export default {
  components: {
    reverseTaskInfo
  },
  mounted () {
    window.addEventListener('message', this.handleMessage, false)
    this.$bus.$on('openReverseTaskInfoDialog', this.openReverseTaskInfoDialog)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.handleMessage)
    this.$bus.$off('openReverseTaskInfoDialog')
  },
  data () {
    return {
      damEnabled: window.setting.damEnabled !== 'false' && window.setting.damEnabled !== false,
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true
      },
      taskData: null,
      taskPopover: false,
      eventInterval: {}, // 将eventInterval定义为object类型，用来存放多个任务的定时器（查询任务进度）
      taskId: null,
      taskTabName: window.setting.damEnabled !== 'false' && window.setting.damEnabled !== false ? 'reverse' : 'import',
      taskTableExpends: [],
      importTaskResult: {
        errorMsg: []
      },
      currentProduct: window.localStorage.getItem('currentProduct')
    }
  },
  computed: {
    tableHeight () {
      const maxHeight =
        document.getElementsByTagName('body')[0].clientHeight - 200
      if (this.taskData) {
        const allDataHeight = this.taskTabName === 'reverse' ? this.$refs.taskTable2.taskData.length * 40 + 42 : this.taskData.length * 40 + 42
        return allDataHeight > maxHeight
          ? maxHeight
          : allDataHeight < 300
            ? 300
            : allDataHeight
      } else {
        return null
      }
    }
  },
  methods: {
    openReverseTaskInfoDialog () {
      this.taskTabName = 'reverse'
      this.showTask()
    },
    handleMessage (event) {
      try {
        let data = JSON.parse(event.data)
        if (data.type && data.taskId) {
          this.taskTabName = data.type
          this.taskId = data.taskId
          this.taskPopover = true
          this.getJobs()
        } else if (data.hideTaskInfoPopover) {
          this.taskPopover = false
        }
      } catch (err) {

      }
    },
    // table 上加了一个自定义的 row-class-name，用来判断是否展示“展开”图标
    getRowClassName ({ row, rowIndex }) {
      if (this.taskTabName === 'import' && (row.stage === 'FINISHED' || row.stage === 'FAILED')) { return 'show-expand' }
      return 'hide-expand'
    },
    handleDownload (id) {
      const url = '/base' + '/files/download?fileId=' + id
      this.$downloadFilePost(url)
    },
    getTaskJobResult (data, type) {
      if (data) {
        this.taskTabName = type
        this.taskId = data
        this.showTask()
      }
    },
    getStatus (str) {
      let status = ''
      switch (str) {
        case 'RUNNING':
          status = '运行中'
          break
        case 'FINISHED':
          status = '已完成'
          break
        case 'FAILED':
          status = '失败'
          break
        case 'IN_QUEUE':
          status = '排队中'
          break
        default:
          status = '未运行'
      }
      return status
    },
    showTask () {
      this.taskPopover = true
      if (this.taskPopover === true) {
        if (this.taskTabName === 'reverse') {
          this.$refs.taskTable2.showTask()
        } else {
          this.taskData = []
          this.getJobs()
        }
      }
    },
    handleTaskTabChange (tab) {
      if (this.taskTabName === 'reverse') {
        this.$refs.taskTable2.showTask()
      } else {
        this.taskData = []
        this.getJobs()
      }
    },
    goProfiling (row) {
      this.$http
        .post(
          `/base/instantJob/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
        )
        .then(res => {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl + `main/meta?objectId=${res.data.objectId}&isQuality=true`
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getJobs () {
      this.$http
        .post(
          `/base/instantJob/getJobs/type?type=${this.taskTabName.toUpperCase()}`
        )
        .then(res => {
          this.taskData = res.data.filter(item => {
            return !!item
          })
          // 默认按照接口返回的数据排序（任务生成时间）
          // this.taskData.sort((a, b) => {
          //   const x = a.jobName.toLowerCase()
          //   const y = b.jobName.toLowerCase()
          //   if (x > y) {
          //     return -1
          //   }
          //   if (x < y) {
          //     return 1
          //   }
          //   return 0
          // })
          // this.taskData.map((item, indexto) => {
          //   if (item.stage === 'RUNNING') {
          //     this.taskData.unshift(this.taskData.splice(indexto, 1)[0])
          //   }
          // })
          this.taskData.forEach(element => {
            this.eventInterval[element.jobId] &&
            clearInterval(this.eventInterval[element.jobId])
            if (element.stage === 'RUNNING') {
              this.getJobStatus(element)
            }
            if (this.taskId) {
              if (this.taskId === element.jobId) {
                element.highlight = true
              }
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getJobStatus (ele) {
      this.$http
        .post(
          `/base/instantJob/getJobStatus?name=${encodeURI(ele.jobName)}&jobId=${
            ele.jobId
          }`
        )
        .then(res => {
          clearInterval(this.eventInterval[ele.jobId])
          if (res.data.stage === 'RUNNING') {
            this.eventInterval[ele.jobId] = setInterval(() => {
              this.getJobStatus(ele)
            }, 2000)
          } else {
            this.getJobs()
            return false
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 关闭任务弹窗
    closeTask () {
      this.taskId = null
      Object.keys(this.eventInterval).forEach(k => {
        clearInterval(this.eventInterval[k])
      })
      this.taskTableExpends = []
      this.taskPopover = false
    },
    // 下载 导出的文件
    scanResult (row) {
      this.$http
        .post(
          `/base/instantJob/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
        )
        .then(res => {
          const url =
            '/base' + '/files/download?fileId=' + res.data.fileId

          if (row.jobName.indexOf('系统日志导出') !== -1) {
            this.$downloadFilePost(url, {}, '系统日志.csv')
          } else {
            this.$downloadFilePost(url)
          }
        })
        .then(() => {
          this.closeTask()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // table  row-click 回调
    handleRowClick (row, column) {
      if (
        this.taskTabName === 'import' &&
        (row.stage === 'FINISHED' || row.stage === 'FAILED') &&
        column.label !== '操作'
      ) {
        this.handleTableExpand(row)
      }
    },
    // table expand-change 回调
    handleTableExpand (row) {
      if (this.taskTabName === 'import' && (row.stage === 'FINISHED' || row.stage === 'FAILED')) {
        if (this.taskTableExpends[0] === row.jobId) {
          this.taskTableExpends = []
        } else {
          this.taskTableExpends = []
          // 调接口，查询导入结果
          this.$http
            .post(
              `/base/instantJob/getJobResult?name=${row.jobName}&jobId=${row.jobId}`
            )
            .then(res => {
              if (res.data.resultType === 'com.datablau.data.common.data.instantjob.ImportInstantJobResult' || res.data.resultType === 'com.datablau.data.common.data.instantjob.FailedInstantJobResult') {
                this.importTaskResult = res.data
                this.taskTableExpends = [row.jobId]
              } else {
                this.importTaskResult.resultType = ''
                this.importTaskResult = JSON.parse(res.data.errorMessage)
                this.importTaskResult.resultType = res.data.resultType
                this.taskTableExpends = [row.jobId]
              }
            })
        }
      }
    },
    // 删除任务
    deleteThis (row) {
      let deleteRequest
      if (this.taskTabName === 'import') {
        deleteRequest = this.$http?.post(
          `/base/instantJob/deleteImportJob?name=${row.jobName}&jobId=${row.jobId}`
        )
      } else {
        deleteRequest = this.$http?.post(
          `/base/instantJob/deleteJob?name=${encodeURI(row.jobName)}&jobId=${
            row.jobId
          }`
        )
      }
      if (deleteRequest instanceof Promise) {
        deleteRequest
          .then(res => {
            this.getJobs()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.task-progress {
  width: 100px;
  ::v-deep .el-progress__text {
    line-height: 13px;
    font-size: 12px !important;
  }
}
.import-result {
  width: 100%;
  padding: 16px 0;
  padding-left: 10px;
  box-shadow: inset 0px 4px 4px 0px rgba(0, 0, 0, 0.11);
  .success-title {
    height: 20px;
    line-height: 20px;
    color: #555;
    i {
      font-size: 20px;
      vertical-align: middle;
      margin-left: 0;
      float: left;
      &.success-icon {
        color: #66bf16;
      }
    }
  }
  .error-title {
    height: 20px;
    line-height: 20px;
    margin-top: 8px;
    i {
      font-size: 20px;
      vertical-align: middle;
      margin-left: 0;
      float: left;
      &.success-icon {
        color: #66bf16;
      }
      &.same-icon {
        color: #e6ad00;
      }
      &.fail-icon {
        color: #ff4b53;
      }
    }
    .error-reason {
      margin-left: 8px;
      float: left;
      line-height: 19px;
    }
    .error-count {
      margin-left: 6px;
    }
    .copy {
      float: right;
      padding: 5px 10px;
      color: #409eff;
      cursor: pointer;
      font-weight: normal;
      height: 14px;
      line-height: 14px;
    }
  }
  .error-list {
    margin-top: 8px;
    padding: 10px;
    background-color: #f5f5f5;
    line-height: 18px;
    max-height: 100px;
    overflow-y: scroll;
    width: 100%;
  }
}
.task-popper {
  z-index: 2000 !important;
  .hide-expand {
    .el-table__expand-icon {
      visibility: hidden;
    }
  }
  .show-expand {
    cursor: pointer;
    visibility: visible;
  }
  .el-table__body,
  .el-table__footer,
  .el-table__header {
    table-layout: auto;
  }
}
.top-right-corner-vue {
  .searchButton {
    border-color: transparent;
  }
  .is-block.icon {
    margin-left: 4px;
  }
  .is-block.icon + .is-block.icon {
    margin-left: 8px;
  }
  .el-badge__content {
    height: 15px;
    line-height: 12px;
    padding: 0 3px;
  }
  .el-badge__content.is-fixed {
    top: 5px;
  }
  .el-dropdown {
    font-size: 12px;
  }
}
.highlight {
  color: #409eff;
}
.task-tabs {
  .el-tabs .el-tab-pane {
    padding: 0;
  }
}
</style>
