<template>
  <div
    v-loading="loading"
    id="dir-task-management"
    :class="{ 'dir-task-management': isSecurity }"
  >
    <datablau-dialog
      title="系统信息"
      :visible.sync="showZhanbi"
      size="m"
      :height="420"
    >
      <datablau-table :data="taskData" v-loading="infoLoading">
        <el-table-column prop="cpu" label="CPU"></el-table-column>
        <el-table-column prop="memory" label="内存"></el-table-column>
        <el-table-column prop="hardDisk" label="硬盘"></el-table-column>
      </datablau-table>
    </datablau-dialog>
    <datablau-list-search style="padding: 0 20px">
      <template slot="title">
        <div>识别任务管理</div>
      </template>
      <div>
        <datablau-input
          v-model="keyword"
          placeholder="搜索任务名称"
          :iconfont-state="true"
          clearable
        ></datablau-input>
      </div>
      <template slot="buttons">
        <!-- <datablau-button type="normal" @click="handleTask">
          系统信息
        </datablau-button> -->
        <datablau-button
          type="important"
          class="iconfont icon-tianjia"
          @click="showAddTask = true"
        >
          新建识别任务
        </datablau-button>
      </template>
    </datablau-list-search>
    <div class="table-box">
      <datablau-form-submit>
        <datablau-table
          class="datablau-table table"
          style="width: 100%"
          height="100%"
          ref="table"
          :show-column-selection="false"
          :data="tableData"
        >
          <el-table-column
            :sortable="true"
            prop="scopeName"
            label="任务名称"
            min-width="130"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :sortable="true"
            label="数据源"
            min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.elementObject.physicalName }}
            </template>
          </el-table-column>
          <el-table-column
            :sortable="true"
            prop="ownerUsername"
            label="创建人"
            min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="应用规则" :min-width="220">
            <template slot-scope="scope">
              <el-tag
                class="dir-tm"
                v-if="scope.row.ruleDtos[0]"
                style="margin-right: 10px; display: inline-block"
                size="normal"
                effect="light"
              >
                <i
                  :class="['iconfont', 'icon-yyguize']"
                  style="margin-right: 5px; font-size: 14px; color: #a05ee8"
                ></i>
                {{
                  scope.row.ruleDtos[0] ? scope.row.ruleDtos[0].ruleName : ''
                }}
              </el-tag>
              <el-popover
                popper-class="dir-tm-popover"
                style="display: inline-block"
                v-show="scope.row.ruleDtos.length - 1 > 0"
                placement="bottom-end"
                title=""
                width="400"
                trigger="hover"
                transition="fade-in-linear"
                :visible-arrow="false"
              >
                <span
                  style="
                    cursor: default;
                    color: #a05ee8;
                    position: relative;
                    bottom: 6px;
                  "
                  slot="reference"
                >
                  更多 {{ scope.row.ruleDtos.length - 1 }}+
                  <i class="el-icon-arrow-down"></i>
                </span>
                <p
                  style="
                    margin-bottom: 5px;
                    overflow: hidden;
                    color: #20293b;
                    font-size: 14px;
                  "
                >
                  共{{ scope.row.ruleDtos.length }}条应用规则
                  <i style="float: right" class="el-icon-arrow-up"></i>
                </p>
                <el-tag
                  class="dir-tm"
                  :type="getType(item)"
                  style="margin-right: 10px; margin-bottom: 5px"
                  v-for="item in scope.row.ruleDtos"
                  :key="item.ruleId"
                  size="normal"
                  effect="light"
                >
                  <i
                    :class="['iconfont', 'icon-yyguize']"
                    style="margin-right: 5px; font-size: 14px; color: #a05ee8"
                  ></i>
                  {{ item.ruleName }}
                </el-tag>
              </el-popover>
              <el-tag
                style="margin-right: 10px; display: inline-block"
                size="normal"
                effect="light"
                class="dir-tm"
                v-if="scope.row.lineageOrientation"
              >
                血缘识别
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            sortable
            prop="jobStatus"
            label="任务状态"
            min-width="100"
          >
            <template slot-scope="scope">
              <p :style="'color:' + getStatusColor(scope.row.jobStatus)">
                <span
                  :style="`background-color:${getStatusColor(
                    scope.row.jobStatus
                  )}`"
                  class="circle"
                ></span>
                {{ getStatus(scope.row.jobStatus) }}
              </p>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            min-width="120"
            sortable
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            prop="jobStartTime"
            label="运行时间"
            min-width="120"
            sortable
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            prop="jobEndTime"
            label="结束时间"
            min-width="120"
            sortable
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            label="操作"
            :min-width="160"
            fixed="right"
            align="center"
          >
            <template slot-scope="scope">
              <datablau-tooltip
                effect="dark"
                :content="scope.row.enabled ? '关闭' : '启动'"
                placement="bottom"
              >
                <datablau-switch
                  v-model="scope.row.enabled"
                  :active-value="true"
                  :inactive-value="false"
                  style="display: inline-block"
                  @change="changeStatus(scope.row)"
                ></datablau-switch>
              </datablau-tooltip>
              <datablau-tooltip effect="dark" content="编辑" placement="bottom">
                <datablau-button
                  type="text"
                  class="iconfont icon-bianji"
                  @click="handleEdit(scope.row)"
                ></datablau-button>
              </datablau-tooltip>
              <datablau-tooltip effect="dark" content="删除" placement="bottom">
                <datablau-button
                  type="text"
                  class="iconfont icon-delete"
                  @click="beforeDelete(scope.row.scopeName, scope.row.scopeId)"
                ></datablau-button>
              </datablau-tooltip>

              <datablau-button
                v-if="scope.row.jobStatus === 'RUNNING'"
                type="text"
                class="text-btn-in-table"
                style="margin-left: 3px"
                v-popover:popover_jobs_sta
                @click.prevent.stop=""
              >
                <i
                  class="el-icon-refresh-right animation"
                  style="
                    color: #409eff;
                    font-size: 16px;
                    vertical-align: middle;
                  "
                ></i>
                <span
                  style="
                    color: #409eff;
                    font-size: 12px;
                    vertical-align: middle;
                  "
                >
                  正在运行...
                </span>
              </datablau-button>
              <datablau-tooltip effect="dark" content="运行" placement="bottom">
                <datablau-button
                  :disabled="!scope.row.enabled"
                  v-if="scope.row.jobStatus !== 'RUNNING'"
                  type="text"
                  class="iconfont icon-working"
                  @click="
                    runJob(scope.row.jobId, scope.row.scopeName, scope.row)
                  "
                ></datablau-button>
              </datablau-tooltip>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-pagination
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="currentPageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="page"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <add-ir-task
      v-if="showAddTask"
      :isSecurity="isSecurity"
      :details="currentRow"
      :editMode="isEdit"
      :isLineage="isLineage"
      @close="handleClose"
    ></add-ir-task>
  </div>
</template>
<script>
import HTTP from '@/http/main.js'
import ruleSelector from './ruleSelector.vue'
import sourceSelector from './sourceSelector.vue'
import addIrTask from './addIRtask.vue'
import enabledImg from '@/assets/images/icon/dir-enabled.png'
import disabledImg from '@/assets/images/icon/dir-disabled.png'
export default {
  props: {
    isSecurity: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      enabledImg,
      disabledImg,

      loading: false,
      showAddTask: false,
      showSS: false,
      showRS: false,
      tableData: [],
      currentPage: 1,
      currentPageSize: 20,
      total: 0,
      addTaskLoading: false,

      currentRule: [],
      currentDs: {},
      enabled: true,
      isEdit: false,

      timers: [],
      currentRow: {},

      keyword: '',
      showZhanbi: false,
      taskData: [],
      taskSize: 10,
      taskPage: 1,
      taskTotal: 0,
      infoLoading: true,
      isLineage: false,
    }
  },
  components: {
    ruleSelector,
    sourceSelector,
    addIrTask,
  },
  mounted() {
    window.onresize = () => {
      this.$refs.table.doLayout()
    }
    this.getDiscernTasks()
  },
  beforeDestroy() {
    window.onresize = null
    this.timers.forEach(v => {
      clearInterval(v)
    })
  },
  methods: {
    getTask() {
      // 暂时去掉系统信息
      return
      this.infoLoading = true
      this.taskData = []
      this.$http.get('http://192.168.2.37:38080/osinfo/getosinfo').then(res => {
        this.infoLoading = false
        let newMap = {}
        newMap.cpu = res.data.cpu.user
        // newMap.memory = res.data.memory.available + '/' + res.data.memory.total
        newMap.memory =
          (res.data.memory.available / (1024 * 1024 * 1024)).toFixed(2) +
          'GB' +
          '/' +
          (res.data.memory.total / (1024 * 1024 * 1024)).toFixed(2) +
          'GB'
        newMap.hardDisk =
          (
            (res.data.disks[0].size - res.data.disks[0].writes) /
            (1024 * 1024 * 1024)
          ).toFixed(2) + 'GB'
        this.taskData.push(newMap)
        // this.taskTotal = res.data.toTal
        // this.taskData = res.data.
      })
    },
    handleTask() {
      this.getTask()
      this.showZhanbi = true
    },

    handleTaskSizeChange(size) {
      this.taskSize = size
      this.getTask()
    },
    handleTaskCurrentChange(page) {
      this.taskPage = page
      this.getTask()
    },
    handleEdit(row) {
      if (row.lineageOrientation) {
        this.isLineage = true
      } else {
        this.isLineage = false
      }
      this.isEdit = true
      this.currentRow = row
      this.showAddTask = true
      // this.currentDs.definition = row.elementObject.physicalName
      // this.currentDs.modelId = row.elementObjectId
      // this.currentRule = row.ruleDtos
      // this.enabled = row.enabled
      // this.currentId = row.scopeId
    },
    getDate(time) {
      if (!time) {
        return
      }
      const date = new Date(time)
      return moment(date).format('YYYY-MM-DD HH:mm')
    },
    getDiscernTasks() {
      this.loading = true
      HTTP.getDiscernTasks({
        page: this.currentPage,
        keyword: encodeURI(this.keyword),
        size: this.currentPageSize,
      })
        .then(res => {
          this.loading = false
          const data = res.data
          data.content.forEach(v => {
            if (!v.elementObject) {
              v.elementObject = {}
            }
            v.ruleDtos.sort((a, b) => a.ruleId - b.ruleId)
          })
          this.tableData = data.content
          this.total = data.totalItems
          this.$refs.table.doLayout()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    addDs(obj) {
      this.currentDs = obj
    },
    addRules(arr) {
      if (this.currentRule.length === 0) {
        this.currentRule = arr
        return
      }
      // 去重
      arr.forEach(v => {
        if (this.currentRule.every(item => item.ruleId !== v.ruleId)) {
          this.currentRule.push(v)
        }
      })
    },
    submitTask() {
      const rules = this.currentRule
      if (!this.currentDs.modelId) {
        alert('请选择数据源！')
        return
      }
      if (rules.length === 0) {
        alert('识别规则不能为空')
      }
      const ids = rules.map(v => {
        return v.ruleId
      })
      this.addTaskLoading = true
      if (this.isEdit) {
        HTTP.updateDiscernTasks(
          {
            elementObjectId: this.currentDs.modelId,
            ruleIds: ids,
            enabled: this.enabled,
          },
          this.currentId
        )
          .then(res => {
            this.$message.success('成功修改识别任务')
            this.addTaskLoading = false
            this.showAddTask = false
            this.reSetEdit()
            this.currentPage = 1
            this.getDiscernTasks()
          })
          .catch(err => {
            this.$showFailure(err)
            this.addTaskLoading = false
          })
      } else {
        HTTP.addDiscernTasks({
          elementObjectId: this.currentDs.modelId,
          ruleIds: ids,
          enabled: this.enabled,
        })
          .then(res => {
            this.$message.success('成功添加识别任务')
            this.addTaskLoading = false
            this.showAddTask = false
            this.currentPage = 1
            this.getDiscernTasks()
          })
          .catch(err => {
            this.$showFailure(err)
            this.addTaskLoading = false
          })
      }
    },
    changeStatus(obj) {
      HTTP.updateDiscernTasksStatus(obj.scopeId, obj.enabled)
        .then(res => {
          this.$message.success('状态修改成功')
        })
        .catch(err => {
          this.$set(obj, 'enabled', !obj.enabled)
          this.$showFailure(err)
        })
    },
    deleteTask(id) {
      HTTP.deleteDiscernTask(id)
        .then(res => {
          this.$message.success('删除成功')
          this.getDiscernTasks()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    handlePageChange() {
      this.getDiscernTasks()
    },
    handleSizeChange(size) {
      this.currentPageSize = size
      this.getDiscernTasks()
    },
    handleClose() {
      this.showAddTask = false
      this.getDiscernTasks()
    },
    deleteCurrentRule(idx) {
      this.currentRule.splice(idx, 1)
    },
    reSetEdit() {
      this.isEdit = false
      this.currentDs.definition = ''
      this.currentRule = []
    },
    getRun(id) {
      this.tableData.map(item => {
        if (item.jobId === id) {
          item.jobStatus = 'RUNNING'
        }
      })
    },
    runJob(id, name, row) {
      this.getRun(id)
      this.$http
        .put(this.$url + '/service/datablau_jobs/' + id + '/run')
        .then(res => {
          this.$message(`${name} 任务发起成功`)
          // this.$set(row, 'jobStatus', '')
          this.$set(row, 'jobEndTime', '')
          this.checkCurrentJobStatus(id, row)
        })
        .catch(err => {
          this.tableData.map(item => {
            if (item.jobId === id) {
              item.jobStatus = 'FAILED'
            }
          })
          this.$showFailure(err)
        })
    },
    checkCurrentJobStatus(id, row, timer) {
      timer && clearTimeout(timer)
      this.$http
        .get(this.$url + '/service/datablau_jobs/' + id + '/history')
        .then(res => {
          const current = res.data[0]
          this.$set(row, 'jobStartTime', current.startTime)
          switch (current.status) {
            case 'FINISHED':
              this.$set(row, 'jobEndTime', current.endTime)
              this.$message.success(`任务 ${row.scopeName} 运行成功`)
              break
            case 'SKIPPED':
              this.$set(row, 'jobEndTime', current.endTime)
              this.$message.warning(`任务 ${row.scopeName} 已被跳过`)
              break
            case 'FAILED':
              this.$set(row, 'jobEndTime', current.endTime)
              this.$showFailure(`任务 ${row.scopeName} 运行失败`)
              break
            default:
              timer = setTimeout(() => {
                this.checkCurrentJobStatus(id, row, timer)
              }, 1000)
          }
          this.$set(row, 'jobStatus', current.status)
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    getStatus(str) {
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
        case 'SKIPPED':
          status = '跳过'
          break
        default:
          status = '未运行'
      }
      return status
    },
    beforeDelete(name, id) {
      this.$DatablauCofirm(`确认删除任务“${name}”？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.deleteTask(id)
      })
    },
    getDate(time) {
      if (!time) {
        return ''
      }
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    timeFormatter() {
      if (typeof arguments[0] === 'number') {
        return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
      } else if (arguments[0] == undefined) {
        return ''
      } else if (typeof arguments[0] === 'string') {
        return arguments[0]
      }
      if (arguments[0][arguments[1].property]) {
        return moment(arguments[0][arguments[1].property]).format(
          'YYYY-MM-DD HH:mm'
        )
      } else {
        return '-'
      }
    },
    getType(obj) {
      if (obj) {
        return obj.enabled ? '' : 'info'
      }
    },
    getStatusColor(status) {
      if (status === 'RUNNING') {
        return '#409EFF'
      }
      if (status === 'FINISHED') {
        return '#66BF16'
      }
      if (status === 'SKIPPED') {
        return '#E6AD00'
      }
      if (status === 'FAILED') {
        return '#FF4B53'
      }
      return '#5DC4C0'
    },
  },
  watch: {
    showAddTask(val) {
      if (!val) {
        this.reSetEdit()
      }
    },
    keyword() {
      clearTimeout(this.keyTimer)
      this.keyTimer = setTimeout(() => {
        this.currentPage = 1
        this.getDiscernTasks()
      }, 600)
    },
  },
}
</script>
<style lang="scss" scoped>
.task-page {
  /deep/ .datablau-pagination {
    float: left;
    text-align-last: left;
  }
}
#dir-task-management {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  &.dir-task-management {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .search-wrapper {
    padding: 0 20px;
    .input-box {
      width: 220px;
      display: inline-block;
    }
  }
  .table-box {
    position: absolute;
    top: 84px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
    .edit {
      color: #7d8493;
      font-size: 19px;
      padding-left: 30px;
      padding-right: 20px;
    }
    .delete {
      color: #7d8493;
      font-size: 19px;
    }
    .edit-button {
      font-size: 20px;
      color: #dbdbdb;
      cursor: pointer;
    }
  }
}
</style>
<style lang="scss">
#dir-task-dialog {
  .row {
    padding-top: 18px;
    width: 100%;
    height: 40px;
    .label {
      float: left;
      text-align: right;
      width: 82px;
      padding-right: 12px;
    }
    .box {
      float: left;
    }
  }
  .tag-row {
    height: unset;
    padding-top: 18px;
    overflow: hidden;
  }
}
#dir-task-management {
  .el-button--text {
    margin: 0;
    padding-right: 5px;
    font-size: 16px;
    color: #9099a3;
  }

  .el-icon-arrow-down {
    &:before {
      color: #a05ee8;
    }
  }
  .circle {
    position: relative;
    bottom: 1px;
    display: inline-block;
    margin-right: 7px;
    background-color: #5cb793;
    border-radius: 3.5px;
    width: 7px;
    height: 7px;
  }
}
.el-popover.el-popper.dir-tm-popover {
  padding: 12px 10px;
}
.dir-tm.el-tag.el-tag--normal {
  margin-top: 6px;
  padding-left: 4px;
  color: #a05ee8;
  // background-color: #f1f3fe;
  background-color: rgba(160, 94, 232, 0.1);
  max-width: 213px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dir-tm.el-tag.el-tag--normal.el-tag--info {
  color: #7d8493;
  color: #a05ee8;
  background-color: #ededed;
  background-color: rgba(160, 94, 232, 0.1);
}
.dir-tm img {
  // position: relative;
  // top: 3px;
  padding-right: 3px;
}
</style>
