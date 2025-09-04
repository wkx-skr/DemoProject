<template>
  <div v-loading="loading" id="DD-static-rule">
    <div class="static-rule-search" style="padding: 0 20px">
      <datablau-list-search>
        <template slot="title">
          <div>数据脱敏任务</div>
        </template>
        <el-form ref="form">
          <el-form-item label="">
            <datablau-input
              :iconfont-state="true"
              clearable
              type="text"
              v-model="form.search"
              placeholder="搜索"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="时间">
            <datablau-dateRange
              v-model="form.date"
              type="daterange"
              @changeDateTime="changeEventStartTime"
            ></datablau-dateRange>
          </el-form-item>
          <el-form-item label="任务状态">
            <datablau-select
              v-model="form.jobStatus"
              placeholder="请选择任务状态"
            >
              <el-option
                v-for="item in statusList"
                :key="item.name"
                :label="item.name"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button type="normal" @click="query">查询</datablau-button>
            <datablau-button type="secondary" @click="resetForm">
              重置
            </datablau-button>
          </el-form-item>
        </el-form>
        <template slot="buttons">
          <datablau-button
            style="float: right"
            type="important"
            class="iconfont icon-tianjia"
            @click="addRule"
          >
            新建脱敏任务
          </datablau-button>
        </template>
      </datablau-list-search>
    </div>
    <div class="table-box">
      <datablau-form-submit>
        <datablau-table
          :show-column-selection="false"
          :data-selectable="true"
          @selection-change="handleSelectionChange"
          :data="tableData"
          ref="table"
          style="width: 100%"
          height="100%"
        >
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="name"
            label="任务名"
            min-width="120"
          ></el-table-column>
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="originalModel.definition"
            label="源数据源"
            min-width="150"
          ></el-table-column>
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="targetModel.definition"
            label="目标数据源"
            min-width="150"
          ></el-table-column>
          <el-table-column
            prop="jobStartTime"
            label="运行时间"
            min-width="130"
            sortable
            :formatter="timeFormatter"
          ></el-table-column>
          <el-table-column
            prop="jobEndTime"
            label="结束时间"
            min-width="130"
            sortable
            :formatter="timeFormatter"
          ></el-table-column>
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
            label="操作"
            fixed="right"
            header-align="left"
            width="240"
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
                  @change="updateDatamaskingModelStatus($event, scope.row)"
                ></datablau-switch>
              </datablau-tooltip>

              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.edit')"
                placement="bottom"
              >
                <datablau-button
                  class="iconfont icon-bianji"
                  type="text"
                  @click="editRule(scope.row.id, scope.row)"
                ></datablau-button>
              </datablau-tooltip>
              <datablau-tooltip effect="dark" content="删除" placement="bottom">
                <datablau-button
                  class="iconfont icon-delete"
                  type="text"
                  @click="deleteRule(scope.row.name, scope.row.id)"
                ></datablau-button>
              </datablau-tooltip>

              <datablau-button
                v-show="scope.row.jobStatus === 'RUNNING'"
                type="text"
                class="text-btn-in-table"
                style="margin-left: 3px"
                v-popover:popover_jobs_sta
                @click.prevent.stop=""
              >
                <i
                  class="el-icon-refresh-right animation"
                  style="color: #409eff"
                ></i>
                <span
                  style="color: #409eff; font-size: 12px; line-height: 18px"
                >
                  正在运行...
                </span>
              </datablau-button>
              <datablau-tooltip effect="dark" content="运行" placement="bottom">
                <datablau-button
                  class="iconfont icon-working"
                  v-show="scope.row.jobStatus !== 'RUNNING'"
                  :disabled="!scope.row.enabled"
                  type="text"
                  @click="runJob(scope.row.jobId, scope.row.name, scope.row)"
                ></datablau-button>
              </datablau-tooltip>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="bottom">
            <span v-if="currentSelection.length > 0" class="check-info"></span>
            <span v-if="currentSelection.length > 0" class="footer-row-info">
              当前选中“{{ currentSelection.length }}条”信息，是否
            </span>
            <datablau-button
              v-if="currentSelection.length > 0"
              type="danger"
              class="el-icon-delete"
              @click="mulitpDelete"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
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
          </div>
        </template>
      </datablau-form-submit>
    </div>

    <edit-static-rule
      v-if="showEdit"
      :currentId="currentId"
      :details="currentRow"
      :editMode="editMode"
      @close="closeEdit"
    ></edit-static-rule>
  </div>
</template>
<script>
/* eslint-disable */
import editStaticRule from './newEditStaticRule.vue'
import HTTP from '@/http/main.js'

export default {
  data () {
    return {
      form: {
        search: '',
        date: [],
        jobStatus: '',
      },
      statusList: [
        {
          name: '全部',
          value: '',
        },
        {
          name: '已完成',
          value: 'FINISHED',
        },
        {
          name: '失败',
          value: 'FAILED',
        },
        {
          name: '未运行',
          value: 'NOT',
        },
      ],
      tableData: [],
      currentPage: 1,
      currentPageSize: 20,
      total: 0,
      keyword: '',
      showEdit: false,
      editMode: false,
      currentId: '',
      currentSelection: [],
      currentRow: {},

      timers: [],
      loading: true,
    }
  },
  components: {
    editStaticRule,
  },
  mounted () {
    this.getDatamaskingModels()
  },
  beforeDestroy () {
    window.onresize = null
    this.timers.forEach(v => {
      clearInterval(v)
    })
  },
  methods: {
    changeEventStartTime (val) {
      this.form.date = val
    },
    query () {
      this.getDatamaskingModels()
    },
    resetForm () {
      this.form = {
        keyword: '',
        date: [],
        jobStatus: '',
      }
      this.getDatamaskingModels()
    },
    getDatamaskingModels () {
      let params = {
        ...this.form,
      }
      if (this.form.date && this.form.date.length > 0) {
        params.startTime = this.form.date[0]
        params.endTime = this.form.date[1]
      } else {
        params.startTime = ''
        params.endTime = ''
      }
      params.current_page = this.currentPage
      params.page_size = this.currentPageSize
      delete params.date
      HTTP.getDatamaskingModels({
        // keyword: encodeURI(params.keyword),
        // startTime: params.startTime,
        // endTime: params.endTime,
        // jobStatus: params.jobStatus,
        // page: this.currentPage,
        // size: this.currentPageSize,
        params,
      }).then(res => {
        const data = res.data
        data.content.forEach(v => {
          if (!v.originalModel) {
            v.originalModel = {}
          }
          if (!v.targetModel) {
            v.targetModel = {}
          }
        })
        this.tableData = res.data.content
        this.total = res.data.totalItems
        this.loading = false
      })
    },
    handlePageChange () {
      this.getDatamaskingModels()
    },
    handleSizeChange (size) {
      this.currentPageSize = size
      this.getDatamaskingModels()
    },
    addRule () {
      this.showEdit = true
    },
    editRule (id, row) {
      this.editMode = true
      this.currentId = id
      this.currentRow = row
      this.showEdit = true
    },
    deleteRule (name, ids) {
      this.beforeDelete(name).then(res => {
        HTTP.deleteDataMaskingRule(ids)
          .then(res => {
            this.$message.success('删除成功')
            this.getDatamaskingModels()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    updateDatamaskingModelStatus (bool, row) {
      HTTP.updateDatamaskingModelStatus(row.id, bool ? 'enable' : 'disable')
        .then(res => {
          this.$message.success(`${row.name} 的状态修改成功`)
        })
        .catch(err => {
          console.error(err)
          this.$message.success(`${row.name} 的状态修改失败`)
          this.$set(row, 'enabled', !bool)
        })
    },
    closeEdit () {
      this.showEdit = false
      this.keyword = ''
      this.currentPage = 1
      this.editMode = false
      this.currentId = ''
      this.getDatamaskingModels()
    },
    handleSelectionChange (val) {
      this.currentSelection = val
    },
    mulitpDelete () {
      const newArr = this.currentSelection.map(v => v.id)
      const ids = newArr.join(',')
      this.beforeDelete('').then(res => {
        this.deleteDatamaskingModels(ids)
      })
    },
    deleteDatamaskingModels (ids) {
      HTTP.deleteDatamaskingModels(ids)
        .then(res => {
          this.$message.success('删除成功')
          this.getDatamaskingModels()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    getActionType (type) {
      const obj = { val: '', color: '' }
      switch (type) {
        case 'INCREMENT':
          obj.val = '自增'
          obj.color = '#8C5DFF'
          break
        case 'ALL':
          obj.val = '全量'
          obj.color = '#3EC5E6'
          break
        case 'NONE':
          obj.val = '仅一次'
          obj.color = '#F79B3F'
          break
      }
      return obj
    },
    getRun (id) {
      this.tableData.map(item => {
        if (item.jobId === id) {
          item.jobStatus = 'RUNNING'
        }
      })
    },
    runJob (id, name, row) {
      this.getRun(id)
      this.$http
        .put(this.$url + '/service/datablau_jobs/' + id + '/run')
        .then(res => {
          this.$message(`${name} 任务发起成功`)
          this.$set(row, 'jobEndTime', '')
          // 定时查询任务状态，直到任务完成
          let lock = false
          if (!lock) {
            lock = true
            this.checkCurrentJobStatus(id, row, timer)
          }
          const timer = setInterval(() => {
            this.getRun(id)
            this.checkCurrentJobStatus(id, row, timer)
          }, 5000)
          this.timers.push(timer)
        })
        .catch(err => {
          console.error(err)
        })
    },
    checkCurrentJobStatus (id, row, timer) {
      this.$http
        .get(this.$url + '/service/datablau_jobs/' + id + '/history')
        .then(res => {
          const current = res.data[0]
          this.$set(row, 'jobStartTime', current.startTime)
          switch (current.status) {
            case 'RUNNING':
              break
            case 'FINISHED':
              this.$set(row, 'jobEndTime', current.endTime)
              this.$message.success(`任务 ${row.name} 运行成功`)
              clearInterval(timer)
              break
            case 'SKIPPED':
              this.$set(row, 'jobEndTime', current.endTime)
              this.$message.warning(`任务 ${row.name} 已被跳过`)
              clearInterval(timer)
              break
            case 'FAILED':
              this.$set(row, 'jobEndTime', current.endTime)
              this.$showFailure(`任务 ${row.name} 运行失败`)
              clearInterval(timer)
          }
          this.$set(row, 'jobStatus', current.status)
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
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
        case 'SKIPPED':
          status = '跳过'
          break
        default:
          status = '未运行'
      }
      return status
    },
    getStatusColor (status) {
      if (status === 'RUNNING') {
        return '#4386F5'
      }
      if (status === 'FINISHED') {
        return '#57A07F'
      }
      if (status === 'SKIPPED') {
        return '#F79B3F'
      }
      if (status === 'FAILED') {
        return '#F46565'
      }
      return '#AFB4BF'
    },
    getDate (time) {
      if (!time) {
        return
      }
      const date = new Date(time)
      return moment(date).format('YYYY-MM-DD HH:mm')
    },
    beforeDelete (name) {
      return this.$DatablauCofirm(`确认删除任务 ${name} ？`, '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
    },
    timeFormatter () {
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
  },
  watch: {
    keyword () {
      clearTimeout(this.keyTimer)
      this.keyTimer = setTimeout(() => {
        this.currentPage = 1
        this.getDatamaskingModels()
      }, 600)
    },
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
/deep/ .is-block {
  i {
    font-size: 14px;
  }
}
#DD-static-rule {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  .header {
    box-sizing: border-box;
    padding: 0 20px;
    width: 100%;
    height: 50px;
    .title {
      float: left;
      font-size: 16px;
      line-height: 50px;
    }
  }
  .table-box {
    padding: 0 20px;
    position: absolute;
    top: 84px;
    left: 0;
    bottom: 0px;
    right: 0;
    overflow: auto;
    .edit-button {
      font-size: 20px;
      color: #dbdbdb;
      cursor: pointer;
    }
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
    .type {
      display: inline-block;
      width: 56px;
      height: 22px;
      border: 1px solid black;
      color: black;
      font-size: 12px;
      line-height: 22px;
      text-align: center;
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
  .bottom {
    box-sizing: border-box;
    padding: 8px 20px 0;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;
    z-index: 4;

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
</style>
<style lang="scss">
#DD-static-rule {
  .el-button--text {
    padding-right: 5px;
    font-size: 16px;
    color: #9099a3;
  }
  .el-button--primary.is-disabled {
    color: #555;
    background-color: #fff;
    border-color: rgb(220, 223, 230);
  }
}
</style>
