<template>
  <div id="dir-task-management">
    <template v-if="listShow">
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
      <add-ir-task
        v-if="showAddTask"
        :id="currentRow.taskId"
        :jobId="currentRow.jobId"
        :editMode="isEdit"
        :curCatalog="curCatalog"
        @close="handleClose"
      ></add-ir-task>
      <template v-else>
        <div class="tree-box">
          <catalog-tree
            ref="catalogTree"
            :type="'DISCERN_TASK'"
            :clickTree="clickTree"
          ></catalog-tree>
        </div>
        <div class="resize-column-middle"></div>
        <div class="right-box">
          <datablau-list-search style="padding: 10px 20px">
            <div>
              <datablau-input
                v-model="keyword"
                :placeholder="$t('intelligence.searchName1')"
                @keyup.native.enter="searchList"
                :iconfont-state="true"
                clearable
              ></datablau-input>
            </div>
            <template slot="buttons">
              <datablau-button
                v-if="$auth.DATA_SECURITY_DISCERN_TASK_MANAGE"
                type="important"
                class="iconfont icon-tianjia"
                @click="newTask"
                :tooltip-content="
                  catalogLen === 0 ? $t('intelligence.placeNewCatalog') : ''
                "
                :disabled="catalogLen === 0"
              >
                {{ $t('securityModule.new') }}
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
                v-loading="loading"
                :loading="loading"
                :show-column-selection="false"
                :data="tableData"
                :default-sort="{ prop: orderBy, order: sort }"
                @sort-change="sortChange"
              >
                <el-table-column
                  prop="taskName"
                  :label="$t('securityModule.name')"
                  min-width="150"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="modelName"
                  :label="$t('securityModule.datasource')"
                  min-width="120"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.modelName || '--' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="creator"
                  :label="$t('intelligence.creator')"
                  min-width="80"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('intelligence.applyRules')"
                  :min-width="220"
                >
                  <template
                    slot-scope="scope"
                    v-if="scope.row.rules.length > 0"
                  >
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
                      v-show="scope.row.ruleNum - 1 > 0"
                      placement="bottom"
                      title=""
                      width="420"
                      @show="showTip(scope.row)"
                      @hide="showRule = false"
                      trigger="hover"
                      transition="fade-in-linear"
                      :visible-arrow="false"
                    >
                      <span slot="reference" style="cursor: pointer">
                        {{ $t('securityModule.more') }}
                        {{ scope.row.ruleNum - 1 }}
                        {{ scope.row.ruleNum - 1 > 99 ? '+' : '' }}
                      </span>
                      <p
                        style="
                          margin-bottom: 8px;
                          overflow: hidden;
                          color: #20293b;
                          font-size: 12px;
                        "
                      >
                        {{ $t('intelligence.applyRules') }}：{{
                          scope.row.ruleNum
                        }}{{ $t('securityModule.strip') }}
                      </p>
                      <template v-loading="ruleLoading">
                        <el-tag
                          class="result-tag"
                          :style="methodRuleType(item.type, 2)"
                          style="margin-bottom: 5px"
                          v-for="item in curRuleList"
                          :key="item.id"
                          size="normal"
                          effect="light"
                        >
                          <is-show-tooltip
                            class="tag-type"
                            :content="item.name"
                            :refName="'catalogType'"
                          ></is-show-tooltip>
                        </el-tag>
                      </template>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  :label="$t('intelligence.taskStatus')"
                  min-width="80"
                >
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
                  :label="$t('securityModule.creationTime')"
                  width="125"
                  sortable="custom"
                  :formatter="timeFormatter"
                ></el-table-column>
                <el-table-column
                  prop="runTime"
                  :label="$t('intelligence.runTime')"
                  width="125"
                  :formatter="timeFormatter"
                ></el-table-column>
                <el-table-column
                  prop="endTime"
                  :label="$t('intelligence.endTime')"
                  width="125"
                  :formatter="timeFormatter"
                ></el-table-column>
                <el-table-column
                  v-if="$auth.DATA_SECURITY_DISCERN_TASK_MANAGE"
                  :label="$t('securityModule.operate')"
                  width="200"
                  fixed="right"
                  align="center"
                >
                  <template slot-scope="scope">
                    <datablau-tooltip
                      effect="dark"
                      :content="
                        scope.row.enabled
                          ? $t('intelligence.openTask')
                          : $t('intelligence.closeTask')
                      "
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
                      :tooltip-content="$t('securityModule.copy')"
                      type="icon"
                      class="iconfont icon-copy"
                      @click="handleCopy(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      :tooltip-content="$t('securityModule.edit')"
                      type="icon"
                      class="iconfont icon-bianji"
                      @click="handleEdit(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      :tooltip-content="$t('securityModule.delete')"
                      type="icon"
                      class="iconfont icon-delete"
                      @click="
                        beforeDelete(scope.row.taskName, scope.row.taskId)
                      "
                    ></datablau-button>

                    <datablau-button
                      v-if="
                        scope.row.status === 'RUNNING' ||
                        scope.row.status === 'INIT' ||
                        scope.row.status === 'CREATED'
                      "
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
                        {{ $t('intelligence.running') }}
                      </span>
                    </datablau-button>
                    <datablau-button
                      :tooltip-content="judgeMachine(scope.row, 2)"
                      :disabled="!scope.row.enabled || judgeMachine(scope.row)"
                      v-if="
                        scope.row.status !== 'RUNNING' &&
                        scope.row.status !== 'INIT' &&
                        scope.row.status !== 'CREATED'
                      "
                      type="icon"
                      class="iconfont icon-working"
                      @click="
                        runJob(scope.row.jobId, scope.row.taskName, scope.row)
                      "
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
        </div>
      </template>
    </template>
  </div>
</template>
<script>
import addIrTask from './compontents/addIRtask.vue'
import enabledImg from '@/assets/images/icon/dir-enabled.png'
import disabledImg from '@/assets/images/icon/dir-disabled.png'
import API from '@/view/dataSecurity/util/api'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import { methodRuleType } from '@/view/dataSecurity/util/util.js'
import { ruleTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import catalogTree from '@/view/dataSecurity/components/catalogTree.vue'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
export default {
  props: {
    hasMachine: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      listShow: true,
      curCatalog: {}, // 当前操作的目录
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

      currentRule: [],
      enabled: true,
      isEdit: false,

      timers: [],
      currentRow: {},

      keyword: '',
      isSee: false,
      catalogLen: 0,
      curRuleList: [],
      ruleLoading: false,
      showRule: false,
    }
  },
  components: {
    addIrTask,
    isShowTooltip,
    catalogTree,
  },
  mounted() {
    this.initResizeHorizontal()
    window.onresize = () => {
      this.$nextTick(() => {
        this.$refs.table && this.$refs.table.doLayout()
      })
    }
  },
  beforeDestroy() {
    window.onresize = null
    this.timers.forEach(v => {
      clearInterval(v)
    })
  },
  methods: {
    showTip(row) {
      this.showRule = true
      this.ruleLoading = true
      API.getTaskRuleList(row.taskId)
        .then(res => {
          this.ruleLoading = false
          this.curRuleList = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clickTree(name, options) {
      switch (name) {
        case 'catalogTree':
          this.catalogLen = options.catalogLen
          this.currentPage = 1
          this.curCatalog = options.data
          this.catalogId = options.data.catalogId || 0
          this.getDiscernTasks()
          break
        case 'listShow':
          this.listShow = false
          break
        default:
          break
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    judgeMachine(row, type = 1) {
      let result = false
      let tooltip = this.$t('intelligence.run')
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
            tooltip = this.$t('intelligence.machineServiceNotStart')
          } else {
            tooltip = this.$t('intelligence.run')
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
      this.setBreadcrumb()
    },
    setBreadcrumb() {
      if (this.curCatalog.nameList) {
        this.breadcrumbNodes = [
          ...this.curCatalog.nameList,
          { name: this.$t('intelligence.newIdentifyTask') },
        ]
      } else {
        this.breadcrumbNodes = [
          {
            name: this.$t('intelligence.newIdentifyTask'),
          },
        ]
      }
    },
    setCurBreadcrumb(path, name) {
      const pathList = path.split('/')
      let newList = []
      pathList.map(item => {
        const newMap = {
          name: item,
        }
        newList.push(newMap)
      })
      this.breadcrumbNodes = [...newList, { name }]
    },
    searchList() {
      this.currentPage = 1
      this.getDiscernTasks()
    },
    goBack() {
      this.showAddTask = false
      this.setCurrentKey()
    },
    handleCopy(row) {
      const params = {
        taskId: row.taskId,
        // newName: row.taskName,
      }
      API.copyTask(params)
        .then(res => {
          this.$datablauMessage.success(this.$t('securityModule.copySuccess'))
          this.currentPage = 1
          this.getDiscernTasks()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEdit(row) {
      this.setCurBreadcrumb(
        row.catalogPath,
        this.$t('intelligence.editIdentifyTask')
      )
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
        catalogId: this.catalogId || 0,
        searchStr: this.keyword,
        pageNum: this.currentPage,
        pageSize: this.currentPageSize,
        orderBy: this.orderBy,
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
      }
      API.getTaskList(params)
        .then(res => {
          this.listShow = true
          this.loading = false
          res.data.data.list.map(item => {
            if (!item.rules) {
              item.rules = []
            }
          })
          this.tableData = res.data.data.list
          this.total = res.data.data.total
          this.$nextTick(() => {
            this.$refs.table && this.$refs.table.doLayout()
          })
        })
        .catch(e => {
          this.listShow = false
          this.loading = false
          this.$showFailure(e)
        })
    },
    changeStatus(obj) {
      API.enabledTask(obj.taskId, obj.enabled)
        .then(res => {
          // this.$datablauMessage.success('编辑成功')
        })
        .catch(err => {
          this.$set(obj, 'enabled', !obj.enabled)
          this.$showFailure(err)
        })
    },
    deleteTask(id) {
      API.delTaskList(id)
        .then(res => {
          this.$datablauMessage.success(this.$t('securityModule.delSuccess'))
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
      this.setCurrentKey()
    },
    setCurrentKey() {
      this.$nextTick(() => {
        this.$refs.catalogTree.resetId = this.curCatalog.catalogId
      })
    },
    reSetEdit() {
      this.isEdit = false
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
      API.taskLogApi(row.jobId, row.taskId)
        .then(res => {
          this.$message(`${name} ${this.$t('intelligence.taskOpenSuccess')}`)
          this.$set(row, 'endTime', '')
          this.checkCurrentJobStatus(id, row)
        })
        .catch(e => {
          // this.tableData.map(item => {
          //   if (item.jobId === id) {
          //     item.status = 'FAILED'
          //   }
          // })
          this.getDiscernTasks()
          this.$showFailure(e)
        })
    },
    async runJob(id, name, row) {
      // this.runFun(id, name, row)
      // return
      const { data } = await API.judgeTimeTemplate(id)
      if (data) {
        this.runFun(id, name, row)
      } else {
        this.$DatablauCofirm(this.$t('intelligence.runTip'))
          .then(() => {
            this.runFun(id, name, row)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    checkCurrentJobStatus(id, row, timer) {
      timer && clearTimeout(timer)
      const params = {
        '@type': '.MultipleCriteria',
        criteria: [
          {
            '@type': '.FieldEqualsCriteria',
            compareValue: id,
            fieldName: 'jobId',
            notEqual: false,
            page: null,
          },
        ],
      }
      API.historyTaskInfo(params)
        .then(res => {
          const len = res.data.content.length
          // const current = res.data.content[len - 1]
          const current = res.data.content[0]
          this.$set(row, 'runTime', current.startTime)
          switch (current.status) {
            case 'FINISHED':
              this.$set(row, 'endTime', current.endTime)
              this.$datablauMessage.success(
                `${this.$t('intelligence.task')} ${row.taskName} ${this.$t(
                  'intelligence.runSuccess'
                )}`
              )
              break
            case 'SKIPPED':
              this.$set(row, 'endTime', current.endTime)
              this.$datablauMessage.warning(
                `${this.$t('intelligence.task')} ${row.taskName} ${this.$t(
                  'intelligence.skip'
                )}`
              )
              break
            case 'FAILED':
              this.$set(row, 'endTime', current.endTime)
              this.$showFailure(
                `${this.$t('intelligence.task')} ${row.taskName} ${this.$t(
                  'intelligence.runFailed'
                )}`
              )
              break
            // case 'CREATED':
            //   this.$set(row, 'endTime', current.endTime)
            //   this.$showFailure(`任务 ${row.taskName} 已创建`)
            //   break
            // case 'INIT':
            //   this.$set(row, 'endTime', current.endTime)
            //   this.$showFailure(`任务 ${row.taskName} 队列中`)
            //   break
            // case 'NOT_RUN':
            //   this.$set(row, 'endTime', current.endTime)
            //   this.$showFailure(`任务 ${row.taskName} 未运行`)
            //   break
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
        case 'PREPARED':
          status = this.$t('intelligence.prepared')
          break
        case 'SKIPPED':
          status = this.$t('intelligence.skipped')
          break
        case 'STOPPED':
          status = this.$t('intelligence.stopped')
          break
        case 'FAILED':
          status = this.$t('intelligence.failed')
          break
        case 'CREATED':
          status = this.$t('intelligence.created')
          break
        case 'INIT':
          status = this.$t('intelligence.init')
          break
        case 'NOT_RUN':
          status = this.$t('intelligence.notRun')
          break
        case 'RUNNING':
          status = this.$t('intelligence.running1')
          break
        case 'FINISHED':
          status = this.$t('intelligence.finished')
          break
        default:
          status = this.$t('intelligence.notRun')
          break
      }
      return status
    },
    beforeDelete(name, id) {
      const delParams = {
        this: this,
        objName: this.$t('intelligence.idTask'),
        name,
        type: 'single',
      }
      delObjMethod(delParams).then(() => {
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
        return '--'
      }
    },
    getStatusColor(status) {
      let ressult = ''
      switch (status) {
        case 'PREPARED':
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
        this.searchList()
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
/deep/ .el-form {
  .el-form-item {
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
}
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
    &:hover {
      color: #409eff;
    }
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
  .tree-box {
    position: absolute;
    left: 0;
    width: 240px;
    bottom: 0;
    top: 0px;
    border-right: 1px solid var(--border-color-lighter);
  }
  .resize-column-middle {
    left: 240px;
    top: 0;
    background-color: transparent;
    width: 10px;
    z-index: 8;
  }
  .right-box {
    position: absolute;
    left: 240px;
    right: 0;
    top: 0;
    bottom: 0;
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
    margin-right: 4px;
    background-color: #5cb793;
    border-radius: 3px;
    width: 6px;
    height: 6px;
  }
}
</style>
