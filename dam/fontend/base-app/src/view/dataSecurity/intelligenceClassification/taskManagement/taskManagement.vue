<template>
  <div v-loading="loading" id="dir-task-management">
    <!-- 复制任务 -->
    <datablau-dialog
      title="复制任务"
      size="s"
      v-if="taskShow"
      :visible.sync="taskShow"
    >
      <el-form
        label-width="80px"
        :rules="taskRules"
        ref="taskForm"
        :model="taskForm"
      >
        <el-form-item label="任务名称" prop="taskName" style="margin-top: 10px">
          <datablau-input
            maxlength="100"
            show-word-limit
            style="width: 100%"
            placeholder="请输入任务名称"
            v-model.trim="taskForm.taskName"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="taskShow = false">
          取消
        </datablau-button>
        <datablau-button type="important" @click="sureName">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
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
    <div class="breadcrumb-box" v-if="showAddTask">
      <div class="datablau-breadcrumb-header" style="padding: 8px 20px 0">
        <div>
          <datablau-breadcrumb
            :nodeData="breadcrumbNodes"
            :couldClick="false"
            @back="goBack"
          ></datablau-breadcrumb>
        </div>
      </div>
    </div>
    <datablau-list-search style="padding: 10px 20px">
      <div>
        <datablau-input
          v-model="keyword"
          placeholder="搜索任务名称"
          @keyup.native.enter="searchList"
          :iconfont-state="true"
          clearable
        ></datablau-input>
      </div>
      <template slot="buttons">
        <!-- <datablau-button type="normal" @click="handleTask">
          系统信息
        </datablau-button> -->
        <datablau-button
          v-if="$auth.DATA_SECURITY_DISCERN_TASK_MANAGE"
          type="important"
          class="iconfont icon-tianjia"
          @click="newTask"
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
          :default-sort="{ prop: orderBy, order: sort }"
          @sort-change="sortChange"
        >
          <el-table-column
            prop="taskName"
            label="任务名称"
            min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="modelName"
            label="数据源"
            min-width="100"
            show-overflow-tooltip
          >
            <!-- <template slot-scope="scope">
              {{ scope.row.elementObject.physicalName }}
            </template> -->
          </el-table-column>
          <el-table-column
            prop="creator"
            label="创建人"
            min-width="80"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="应用规则" :min-width="220">
            <template slot-scope="scope" v-if="scope.row.rules.length > 0">
              <div
                class="result-tag"
                :style="methodRuleType(item.ruleType, 2)"
                v-for="item in scope.row.rules.slice(0, 1)"
                :key="item.ruleId"
              >
                <is-show-tooltip
                  :content="item.ruleName"
                  :refName="'catalogType'"
                ></is-show-tooltip>
              </div>
              <el-popover
                popper-class="cursor-popover"
                style="
                  display: inline-block;
                  vertical-align: middle;
                  height: 24px;
                "
                v-show="scope.row.rules.length - 1 > 0"
                placement="bottom"
                title=""
                width="420"
                trigger="hover"
                transition="fade-in-linear"
                :visible-arrow="false"
              >
                <span slot="reference" style="cursor: pointer">
                  更多 {{ scope.row.rules.length - 1 }}
                  {{ scope.row.rules.length - 1 > 99 ? '+' : '' }}
                </span>
                <p
                  style="
                    margin-bottom: 8px;
                    overflow: hidden;
                    color: #20293b;
                    font-size: 12px;
                  "
                >
                  应用规则：{{ scope.row.rules.length }}条
                </p>
                <el-tag
                  class="result-tag"
                  :style="methodRuleType(item.ruleType, 2)"
                  style="margin-bottom: 5px"
                  v-for="item in scope.row.rules"
                  :key="item.ruleId"
                  size="normal"
                  effect="light"
                >
                  <is-show-tooltip
                    class="tag-type"
                    :content="item.ruleName"
                    :refName="'catalogType'"
                  ></is-show-tooltip>
                </el-tag>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="任务状态" min-width="80">
            <template slot-scope="scope">
              <p :style="'color:' + getStatusColor(scope.row.status)">
                <span
                  :style="`background-color:${getStatusColor(
                    scope.row.status
                  )}`"
                  class="circle"
                ></span>
                {{ getStatus(scope.row.status) }}
              </p>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            min-width="125"
            sortable="custom"
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            prop="runTime"
            label="运行时间"
            min-width="125"
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            prop="endTime"
            label="结束时间"
            min-width="125"
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            v-if="$auth.DATA_SECURITY_DISCERN_TASK_MANAGE"
            label="操作"
            :min-width="180"
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
              <datablau-button
                style="margin-left: 6px"
                :tooltip-content="'复制'"
                type="icon"
                class="iconfont icon-copy"
                @click="handleCopy(scope.row)"
              ></datablau-button>
              <datablau-button
                :tooltip-content="'编辑'"
                type="icon"
                class="iconfont icon-bianji"
                @click="handleEdit(scope.row)"
              ></datablau-button>
              <datablau-button
                :tooltip-content="'删除'"
                type="icon"
                class="iconfont icon-delete"
                @click="beforeDelete(scope.row.taskName, scope.row.taskId)"
              ></datablau-button>

              <datablau-button
                v-if="scope.row.status === 'RUNNING'"
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
              <datablau-button
                :tooltip-content="judgeMachine(scope.row, 2)"
                :disabled="!scope.row.enabled || judgeMachine(scope.row)"
                v-if="scope.row.status !== 'RUNNING'"
                type="icon"
                class="iconfont icon-working"
                @click="runJob(scope.row.jobId, scope.row.taskName, scope.row)"
              ></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-pagination
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100, 200]"
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
      :id="currentRow.taskId"
      :editMode="isEdit"
      @close="handleClose"
    ></add-ir-task>
  </div>
</template>
<script>
import addIrTask from './compontents/addIRtask.vue'
import enabledImg from '@/assets/images/icon/dir-enabled.png'
import disabledImg from '@/assets/images/icon/dir-disabled.png'
import API from '@/view/dataSecurity/util/api'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import { methodRuleType } from '@/view/dataSecurity/util/util.js'
import { ruleTypeEnum } from '@/view/dataSecurity/util/attrEnum'
export default {
  props: {
    hasMachine: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      taskShow: false,
      taskRules: {
        taskName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
        ],
      },
      taskForm: {
        taskName: '',
      },
      curTask: {},
      methodRuleType: methodRuleType,
      breadcrumbNodes: [],
      enabledImg,
      disabledImg,
      loading: false,
      showAddTask: false,
      showSS: false,
      showRS: false,
      tableData: null,
      currentPage: 1,
      currentPageSize: 20,
      total: 0,
      sort: '',
      orderBy: 'createTime',
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
    }
  },
  components: {
    addIrTask,
    isShowTooltip,
  },
  mounted() {
    this.breadcrumbNodes = [
      {
        id: 1,
        name: '智能分类分级-识别任务',
      },
      {
        id: 2,
        name: '新建识别任务',
      },
    ]
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
    judgeMachine(row, type = 1) {
      let result = false
      let tooltip = '运行'
      if (!this.hasMachine && row.rules) {
        result = row.rules.some(
          item => item.ruleType === ruleTypeEnum.MACHINE_LEARNING
        )
      }
      switch (type) {
        case 1:
          break
        case 2:
          if (result) {
            tooltip = '机器学习服务未启动'
          } else {
            tooltip = '运行'
          }
          break
        default:
          break
      }
      if (type === 1) {
        return result
      }
      if (type === 2) {
        return tooltip
      }
    },
    sortChange(data) {
      this.orderBy = data.prop
      this.sort = data.order
      this.currentPage = 1
      this.getDiscernTasks()
    },
    newTask() {
      this.showAddTask = true
      this.breadcrumbNodes.splice(1, 1, {
        id: 2,
        name: '新建识别任务',
      })
    },
    searchList() {
      this.currentPage = 1
      this.getDiscernTasks()
    },
    goBack() {
      this.showAddTask = false
    },
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
    sureName() {
      const params = {
        taskId: this.curTask.taskId,
        newName: this.taskForm.taskName,
      }
      API.copyTask(params)
        .then(res => {
          this.taskShow = false
          this.$datablauMessage.success('复制成功')
          this.currentPage = 1
          this.getDiscernTasks()
        })
        .catch(e => {
          this.taskShow = false
          this.$showFailure(e)
        })
    },
    handleCopy(row) {
      this.curTask = row
      this.taskForm.taskName = row.taskName + '-副本'
      this.taskShow = true
    },
    handleEdit(row) {
      this.breadcrumbNodes.splice(1, 1, {
        id: 2,
        name: '编辑识别任务',
      })
      this.isEdit = true
      this.currentRow = row
      this.showAddTask = true
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
      const params = {
        currentPage: this.currentPage,
        pageSize: this.currentPageSize,
        searchStr: encodeURI(this.keyword),
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
        orderBy: this.orderBy,
      }
      API.getTaskList(params)
        .then(res => {
          this.loading = false
          res.data.data.list.map(item => {
            if (!item.rules) {
              item.rules = []
            }
          })
          this.tableData = res.data.data.list
          this.total = res.data.data.total
          this.$refs.table.doLayout()
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
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
    changeStatus(obj) {
      API.enabledTask(obj.taskId, obj.enabled)
        .then(res => {
          this.$message.success('状态修改成功')
        })
        .catch(err => {
          this.$set(obj, 'enabled', !obj.enabled)
          this.$showFailure(err)
        })
    },
    deleteTask(id) {
      API.delTaskList(id)
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
          item.status = 'RUNNING'
        }
      })
    },
    runFun(id, name, row) {
      this.getRun(id)
      this.$http
        .put(this.$url + '/service/datablau_jobs/' + id + '/run')
        .then(res => {
          this.$message(`${name} 任务发起成功`)
          this.$set(row, 'endTime', '')
          this.checkCurrentJobStatus(id, row)
        })
        .catch(err => {
          this.tableData.map(item => {
            if (item.jobId === id) {
              item.status = 'FAILED'
            }
          })
          this.$showFailure(err)
        })
    },
    async runJob(id, name, row) {
      const { data } = await API.judgeTimeTemplate(id)
      if (data) {
        this.runFun(id, name, row)
      } else {
        this.$DatablauCofirm(
          '当前操作不在系统时间模版允许范围内执行，是否继续执行？',
          '提示',
          {
            type: 'warning',
            cancelButtonText: '取消',
            confirmButtonText: '确定',
          }
        )
          .then(() => {
            this.runFun(id, name, row)
          })
          .catch(e => {
            // this.$showFailure(e)
          })
      }
    },
    checkCurrentJobStatus(id, row, timer) {
      timer && clearTimeout(timer)
      this.$http
        .get(this.$url + '/service/datablau_jobs/' + id + '/history')
        .then(res => {
          const current = res.data[0]
          this.$set(row, 'runTime', current.startTime)
          switch (current.status) {
            case 'FINISHED':
              this.$set(row, 'endTime', current.endTime)
              this.$message.success(`任务 ${row.taskName} 运行成功`)
              break
            case 'SKIPPED':
              this.$set(row, 'endTime', current.endTime)
              this.$message.warning(`任务 ${row.taskName} 已被跳过`)
              break
            case 'FAILED':
              this.$set(row, 'endTime', current.endTime)
              this.$showFailure(`任务 ${row.taskName} 运行失败`)
              break
            default:
              timer = setTimeout(() => {
                this.checkCurrentJobStatus(id, row, timer)
              }, 1000)
          }
          this.$set(row, 'status', current.status)
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
        case 'NOT_RUN':
          status = '未运行'
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
    getStatusColor(status) {
      let ressult = ''
      switch (status) {
        case 'RUNNING':
          ressult = '#409EFF'
          break
        case 'FINISHED':
          ressult = '#66BF16'
          break
        case 'FAILED':
          ressult = '#FF4B53'
          break
        case 'SKIPPED':
          ressult = '#E6AD00'
          break
        case 'NOT_RUN':
          ressult = '#5DC4C0'
          break
        default:
          ressult = '#5DC4C0'
      }
      return ressult
    },
  },
  watch: {
    showAddTask(val) {
      if (!val) {
        this.reSetEdit()
      }
    },
    keyword(val) {
      if (!val) {
        this.currentPage = 1
        this.getDiscernTasks()
      }
    },
  },
}
</script>
<style lang="scss">
.result-tag {
  display: inline-block;
  padding: 0 8px;
  margin-right: 4px;
  border-radius: 2px;
  width: 88px;
  height: 24px;
  line-height: 24px;
  box-sizing: border-box;
  background: transparentize(#409eff, 0.9);
  color: #409eff;
  text-align: center;
  vertical-align: middle;
  &:last-child {
    margin-right: 0;
  }
}
.cursor-popover {
  padding: 8px 16px;
  text-align: left;
  .el-popover__reference-wrapper {
    vertical-align: middle;
  }
  .result-tag {
    &:nth-of-type(5n) {
      margin-right: 0;
    }
  }
}
</style>
<style lang="scss" scoped>
/deep/ .el-popover__reference-wrapper {
  vertical-align: top;
  height: 24px;
  line-height: 24px;
  display: inline-block;
  .el-popover__reference {
    color: rgb(85, 85, 85);
    position: relative;
    margin-left: 4px;
    height: 24px;
    line-height: 24px;
    display: inline-block;
    vertical-align: top;
  }
}
#dir-task-management {
  position: absolute;
  top: 0px;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: var(--default-bgc);
  .breadcrumb-box {
    position: absolute;
    top: -48px;
    left: 0;
    right: 0;
    height: 40px;
    background: #fff;
    z-index: 9;
  }
  .task-list-content {
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 9;
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
    top: 52px;
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
.rule-dir-tm {
  position: relative;
  i {
    position: absolute;
    left: 5px;
    top: 5px;
  }
  .tag-type {
    max-width: 100px;
    height: 24px;
    line-height: 24px;
    padding-left: 20px;
  }
}
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
</style>
