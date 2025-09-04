<template>
  <!-- 识别任务 -->
  <div class="identify-tasks-page">
    <add-ir-task
      v-if="showAddTask"
      :details="currentRow"
      :editMode="isEdit"
      :isLineage="isLineage"
      @close="handleClose"
    ></add-ir-task>
    <template>
      <datablau-list-search style="padding: 10px 20px 0">
        <datablau-input
          :iconfont-state="true"
          clearable
          v-model="keyword"
          :placeholder="'搜索任务名称'"
        ></datablau-input>
        <template slot="buttons">
          <datablau-button type="secondary" @click="newTask">
            新建识别任务
          </datablau-button>
        </template>
      </datablau-list-search>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            :data-selectable="true"
            :show-column-selection="false"
            height="100%"
            ref="table"
            @selection-change="handleTableChange"
            :data="tableData"
          >
            <el-table-column
              :sortable="true"
              :label="'任务名称'"
              prop="scopeName"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :sortable="true"
              :label="'数据源'"
              prop="datasource"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.elementObject.physicalName }}
              </template>
            </el-table-column>
            <el-table-column
              :label="'任务状态'"
              prop="jobStatus"
              :min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <p :style="'color:' + getStatus(scope.row.jobStatus, 1)">
                  <span
                    :style="`background-color:${getStatus(
                      scope.row.jobStatus,
                      1
                    )}`"
                    class="circle"
                  ></span>
                  {{ getStatus(scope.row.jobStatus, 2) }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              :label="'创建人'"
              prop="ownerUsername"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'创建时间'"
              prop="createTime"
              :min-width="120"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'运行时间'"
              prop="jobStartTime"
              :min-width="120"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'结束时间'"
              prop="jobEndTime"
              :min-width="120"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'操作'"
              :min-width="160"
              align="center"
              fixed="right"
              prop="operation"
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
                  :tooltip-content="'编辑'"
                  type="text"
                  class="iconfont icon-bianji"
                  @click="handleEdit(scope.row)"
                ></datablau-button>
                <datablau-button
                  :tooltip-content="'删除'"
                  type="text"
                  class="iconfont icon-delete"
                  @click="beforeDelete(scope.row.scopeName, scope.row.scopeId)"
                ></datablau-button>

                <datablau-button
                  v-if="scope.row.jobStatus === 'RUNNING'"
                  type="text"
                  class="text-btn-in-table"
                  style="margin-left: 3px"
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
                  :tooltip-content="'运行'"
                  :disabled="!scope.row.enabled"
                  v-if="scope.row.jobStatus !== 'RUNNING'"
                  type="text"
                  class="iconfont icon-working"
                  @click="
                    runJob(scope.row.jobId, scope.row.scopeName, scope.row)
                  "
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <template v-if="selections.length > 0">
                <span class="check-info"></span>
                <span class="footer-row-info">
                  当前选中“{{ selections.length }}条”信息，是否
                </span>
                <datablau-button
                  type="danger"
                  class="el-icon-delete"
                  @click="handleDelete"
                >
                  删除
                </datablau-button>
              </template>
              <datablau-pagination
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                :current-page.sync="page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </template>
  </div>
</template>

<script>
import API from '../util/api'
import addIrTask from '../dataIntelligentRecognition/addIRtask.vue'
export default {
  compontents: {
    addIrTask,
  },
  props: {
    clickChild: {
      type: Function,
    },
  },
  data() {
    return {
      keyword: '',
      tableData: [],
      page: 1,
      size: 20,
      total: 0,
      loading: false,
      selections: [],
      currentRow: {},
      isEdit: false,
      isLineage: false,
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    newTask() {
      this.isEdit = false
    },
    getList() {
      this.loading = true
      const params = {
        page: this.page,
        keyword: encodeURI(this.keyword),
        size: this.size,
      }
      API.getIdentifyTask(params)
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
    handlePageChange(val) {
      this.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
      this.getList()
    },
    handleDelete() {},
    handleTableChange(data) {
      this.selections = data
    },
    getStatus(status, type) {
      let result = ''
      let name = ''
      switch (status) {
        case 'RUNNING':
          result = '#409EFF'
          name = '运行中'
          break
        case 'FINISHED':
          result = '#66BF16'
          name = '已完成'
          break
        case 'SKIPPED':
          result = '#E6AD00'
          name = '跳过'
          break
        case 'FAILED':
          result = '#FF4B53'
          name = '失败'
          break
        default:
          result = '#5DC4C0'
          name = '未运行'
          break
      }
      if (type === 1) {
        return result
      }
      if (type === 2) {
        return name
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
    handleEdit(row) {
      if (row.lineageOrientation) {
        this.isLineage = true
      } else {
        this.isLineage = false
      }
      this.isEdit = true
      this.currentRow = row
      this.showAddTask = true
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
    getRun(id) {
      this.tableData.map(item => {
        if (item.jobId === id) {
          item.jobStatus = 'RUNNING'
        }
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
    runJob(id, name, row) {
      this.getRun(id)
      this.$http
        .put(this.$url + '/service/datablau_jobs/' + id + '/run')
        .then(res => {
          this.$message(`${name} 任务发起成功`)
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
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.identify-tasks-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .table-box {
    position: absolute;
    top: 54px;
    left: 0;
    right: 0;
    bottom: 0;

    .bottom {
      box-sizing: border-box;
      padding: 10px 20px 0;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 50px;

      .check-info {
        width: 14px;
        height: 14px;
        display: inline-block;
        background: $primary-color;
        margin-right: -13px;
        vertical-align: middle;
      }

      .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &:before {
          content: '\e6da';
          font-family: 'element-icons';
          font-size: 12px;
          font-weight: 200;
          margin-right: 5px;
          vertical-align: middle;
          line-height: 13px;
          color: white;
        }
      }
      .page {
        float: right;
      }
    }
  }
}
</style>
