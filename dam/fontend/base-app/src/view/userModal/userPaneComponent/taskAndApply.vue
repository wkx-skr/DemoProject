<template>
  <div class="task-and-apply" style="background: white; padding: 0 14px">
    <div style="position: absolute; right: 10px; top: 15px; z-index: 1">
      <datablau-button
        v-if="activeName === 'first'"
        class="showMore"
        type="text"
        @click="handleBatch"
        :disabled="selection.length === 0"
      >
        <i
          class="iconfont icon-menu-bwdsq"
          style="position: relative; top: 2px; margin-right: 2px"
        ></i>
        {{ $t('userPane.userPane.batchProcessing') }}
      </datablau-button>
      <datablau-button class="showMore" type="text" @click="showMore">
        {{ $t('userPane.userPane.more') }}
      </datablau-button>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane name="first">
        <span slot="label">
          <div style="height: 40px">
            {{ $t('userPane.userPane.todo') }}
            <div class="tag">
              {{ todoTotalNum }}
            </div>
          </div>
        </span>
        <!-- :header-cell-style="headerClass" -->
      </el-tab-pane>
      <el-tab-pane name="second">
        <span slot="label">
          <div style="height: 40px">
            {{ $t('userPane.userPane.myApplications') }}
            <div class="tag">
              {{ applyTotalNum }}
            </div>
          </div>
        </span>
      </el-tab-pane>
    </el-tabs>
    <div
      v-if="activeName === 'first'"
      style="
        position: absolute;
        top: 50px;
        left: 14px;
        bottom: 14px;
        right: 14px;
      "
    >
      <datablau-table
        ref="todoTable"
        :data="tableData"
        :show-column-selection="false"
        :data-selectable="true"
        tooltip-effect="dark"
        height="100%"
        style="width: 100%"
        :hasHeaderStyle="true"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column
          prop="processType"
          :label="$t('userPane.userPane.relatedModules')"
          align="center"
          :width="$i18n.locale === 'zh' ? 120 : 260"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-status
              business-type
              :bgWidth="baseLen"
              :type="scope.row.proCategoryCode"
              :desc="scope.row.proCategoryName"
            ></datablau-status>
          </template>
        </el-table-column>

        <el-table-column
          prop="processName"
          min-width="490"
          show-overflow-tooltip
          :label="$t('userPane.userPane.todoProcessName')"
        ></el-table-column>
        <el-table-column :label="$t('userPane.userPane.date')" width="140">
          <template slot-scope="scope">
            {{ $timeFormatter(scope.row.startTime, 'YYYY-MM-DD hh:mm') }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.operation')"
          fixed="right"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <datablau-button
              size="mini"
              type="icon"
              @click="handleTodoTask(scope.row)"
            >
              <i
                class="iconfont icon-menu-bwdsq"
                style="position: relative; top: 2px; margin-right: 2px"
                title="办理"
              ></i>
            </datablau-button>
            <datablau-button
              size="mini"
              type="icon"
              @click="checkResult(scope.row)"
            >
              <i
                class="iconfont icon-liucheng"
                style="position: relative; top: 2px; margin-right: 2px"
                title="流程进度"
              ></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div
      v-else-if="activeName === 'second'"
      style="
        position: absolute;
        top: 50px;
        left: 14px;
        bottom: 14px;
        right: 14px;
      "
    >
      <!-- key值为防止渲染同页面两个table导致的错乱 -->
      <datablau-table
        ref="applyTable"
        :show-column-selection="false"
        key="'applyTable123'"
        :data-selectable="false"
        :data="applyTableData"
        tooltip-effect="dark"
        style="width: 100%"
        height="100%"
        :hasHeaderStyle="true"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column
          prop="businessType"
          :label="$t('userPane.userPane.applyModel')"
          :width="$i18n.locale === 'zh' ? 120 : 260"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-status
              business-type
              :type="scope.row.proCategoryCode"
              :desc="scope.row.proCategoryName"
            ></datablau-status>
          </template>
        </el-table-column>

        <el-table-column
          prop="processInstanceName"
          :label="$t('userPane.userPane.processName')"
          :min-width="243"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="currentAssignee"
          :label="$t('userPane.userPane.currentAssignee')"
          :width="$i18n.locale === 'zh' ? 100 : 150"
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.applyResult')"
          show-overflow-tooltip
          :width="$i18n.locale === 'zh' ? 100 : 150"
        >
          <template slot-scope="scope">
            <datablau-status
              :type="scope.row.resultType"
              :desc="scope.row.resultName"
            ></datablau-status>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('userPane.userPane.startTime')"
          width="140"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{
              scope.row.startTime
                ? $timeFormatter(
                    new Date(scope.row.startTime).getTime(),
                    'YYYY-MM-DD hh:mm'
                  )
                : ''
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="endTime"
          :label="$t('userPane.userPane.endTime')"
          width="140"
        >
          <template slot-scope="scope">
            {{
              scope.row.endTime
                ? $timeFormatter(
                    new Date(scope.row.endTime).getTime(),
                    'YYYY-MM-DD hh:mm'
                  )
                : ''
            }}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('userPane.userPane.operation')"
          align="center"
          fixed="right"
          width="180"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              size="small"
              :disabled="ifCheckDisabled(scope.row)"
              @click="withdraw(scope.row)"
            >
              <i
                class="iconfont icon-chehui"
                style="position: relative; top: 2px; margin-right: 2px"
                title="撤回"
              ></i>
            </datablau-button>
            <datablau-button
              type="icon"
              size="small"
              @click="getProcessImage(scope.row)"
            >
              <i
                class="iconfont icon-liucheng"
                style="position: relative; top: 2px; margin-right: 2px"
                title="流程进度"
              ></i>
            </datablau-button>
            <datablau-button
              type="icon"
              size="small"
              @click="checkItemDetail(scope.row)"
            >
              <i
                class="iconfont icon-see"
                style="position: relative; top: 2px; margin-right: 2px"
                title="查看"
              ></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      custom-class="apply-detail-dialog"
      :append-to-body="true"
      width="960px"
      class="my-apply-dia"
    >
      <div class="dialog-outer detail-dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
          @changeVisible="changeVisible"
          :businessType="businessType"
        ></apply-detail>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="批量审批"
      :visible.sync="batchVisible"
      append-to-body
      width="700px"
    >
      <el-form label-position="right" label-width="5em">
        <el-form-item label="审批意见">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            v-model="comment"
            maxlength="1000"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <datablau-button
            size="small"
            type="primary"
            :disabled="!batchButtonReady"
            @click="approveBatch"
          >
            通过
          </datablau-button>
          <datablau-button
            size="small"
            type="primary"
            :disabled="!batchButtonReady"
            @click="rejectBatch"
          >
            驳回
          </datablau-button>
        </el-form-item>
      </el-form>
    </datablau-dialog>
    <processDetail v-if="showProcessDetail" ref="processDetail"></processDetail>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import processDetail from '../../../components/processDetail/processDetail.vue'
import applyDetail from '../../../view/processControl/applyDetailModel.vue'
import moment from 'moment'
import userPane from '@constant/userPane'

export default {
  mixins: [userPane],
  name: 'taskAndApply',
  data() {
    return {
      num: 1,
      activeName: 'first',
      showProcessDetail: false,
      tableData: [],
      dialogTitle: '',
      selection: [],
      batchVisible: false,
      batchButtonReady: false,
      comment: '',
      applyTotalNum: 0,
      todoTotalNum: 0,
      applyTableData: [],
      multipleSelection: [],
      showApplyDetails: false,
      baseLen: '0px',
      baseLen1: '0px',
      businessType: null,
    }
  },
  components: {
    processDetail,
    applyDetail,
  },
  mounted() {
    this.getMyTodoData()
    this.getApplyData()
  },
  methods: {
    getMyTodoData() {
      HTTP.getMyTodopage({ currentPage: 1, pageSize: 10, name: '' }).then(
        res => {
          let baseLen = 0
          res.data.value.forEach(item => {
            baseLen =
              item.proCategoryName.length > baseLen
                ? item.proCategoryName.length
                : baseLen
          })
          this.$nextTick(() => {
            if (this.$i18n.locale === 'zh') {
              this.baseLen = baseLen * 12 + 12 + 'px'
            } else {
              this.baseLen = baseLen * 7 + 12 + 'px'
            }
          })
          this.tableData = res.data.value
          this.todoTotalNum = res.data.total
        }
      )
    },
    headerClass(row, column, rowIndex, columnIndex) {
      return 'background:#f5f5f5; color:#555;font-size:12px;font-weight:500'
    },
    handleClick(tab, event) {
      // 切换时清空上一选项卡的勾选及selection中的数据
      let obj = { first: 'applyTable', second: 'todoTable' }
      this.selection = []
      this.$refs[obj[tab.name]].clearSelection()
      if (tab.name === 'first') {
        this.getMyTodoData()
      } else {
        this.getApplyData()
      }
    },
    handleText(row) {
      let arr = []
      row.message = row.message?.replace('null', '')
      if (row) {
        arr = (row.message &&
          row.itemName &&
          row.message.split(row.itemName)) || ['', row.message]
        arr[1] = row.itemName ? row.itemName + arr[1] : arr[1]
      }
      return arr
    },
    getApplyData() {
      HTTP.getMyApply({
        allApply: false,
        currentPage: 1,
        pageSize: 10,
        processName: '',
      })
        .then(res => {
          let baseLen = 0
          res.data.value.forEach(item => {
            //   审核通过  审核中  审核不通过  已撤销
            for (let key in this.resultMap) {
              if (item.result === key) {
                item.resultType = this.resultMap[key].resultType
                item.resultName = this.resultMap[key].label
              }
            }
            baseLen =
              item.proCategoryName.length > baseLen
                ? item.proCategoryName.length
                : baseLen
          })
          this.$nextTick(() => {
            if (this.$i18n.locale === 'zh') {
              this.baseLen1 = baseLen * 12 + 12 + 'px'
            } else {
              this.baseLen1 = baseLen * 7 + 12 + 'px'
            }
          })
          this.applyTotalNum = res.data.total
          this.applyTableData = res.data.value
        })
        .catch(e => {
          console.log(e)
          this.applyTableData = []
        })
    },
    showMore() {
      if (this.activeName === 'first') {
        // 跳转我的待办
        this.$router.push({
          name: 'userModal',
          query: {
            currentNav: 'myTodo',
          },
        })
      } else {
        // 跳转我的申请
        this.$router.push({
          name: 'userModal',
          query: {
            currentNav: 'myApply',
          },
        })
      }
    },
    changeVisible(type) {
      this.showApplyDetails = type
      this.getMyTodoData()
    },
    handleTodoTask(data) {
      this.dialogTitle = data.processName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 2
      this.applyDetailData.processType = data.processType
      this.businessType = data.businessType
    },
    checkResult(data) {
      this.showProcessDetail = true
      setTimeout(() => {
        this.$refs.processDetail.initData(data)
      })
    },
    approveBatch() {
      this.approveOrRejectBatch(0)
    },
    rejectBatch() {
      this.approveOrRejectBatch(1)
    },
    approveOrRejectBatch(idx) {
      const promises = []
      this.batchRequestBody.forEach(item => {
        const promise = new Promise(resolve => {
          const requestBody = {
            comment: this.comment,
            formDtos: item.formDtos,
            nextFlow: item.outgoingFlows[idx].id,
            processType: item.processType,
            taskId: item.taskId,
            username: item.username,
          }
          HTTP.completeTask({ requestBody: requestBody })
            .then(res => {
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        promises.push(promise)
      })
      this.batchButtonReady = false
      const info = this.$message.info('正在进行批量审核，请稍后……')
      Promise.all(promises)
        .then(() => {
          info.close()
          this.$message.success('操作成功')
          // 更新新表格
          this.getMyTodoData()()
        })
        .catch(() => {})
        .finally(() => {
          this.batchButtonReady = true
          this.batchVisible = false
        })
    },
    handleBatch() {
      if (this.activeName === 'first') {
        // 待办批量办理
        this.comment = ''
        this.batchVisible = true
        this.batchRequestBody = this.selection.map(item => {
          return {
            comment: '',
            formDtos: null,
            nextFlow: null,
            processType: item.processType,
            taskId: item.taskId,
            username: this.$user.username,
          }
        })
        let cnt = this.selection.length
        this.selection.forEach((item, index) => {
          HTTP.getApplyDetail({
            processInstanceId: item.processInstanceId,
            taskId: item.taskId,
            type: 2,
          })
            .then(res => {
              this.batchRequestBody[index].formDtos = res.data.formDtos
              this.batchRequestBody[index].outgoingFlows =
                res.data.outgoingFlows
              this.batchRequestBody[index].formDtos = res.data.formDtos
            })
            .catch(() => {})
            .finally(() => {
              cnt--
              if (cnt === 0) {
                this.batchButtonReady = true
              }
            })
        })
      } else {
        this.$DatablauCofirm('确定批量撤回申请吗？')
          .then(() => {
            this.applyBatch()
          })
          .catch(() => {})
      }
    },
    applyBatch() {
      // 申请批量撤销
      let applyRequestBody = []
      for (let i in this.selection) {
        if (this.selection[i].result === '审核中') {
          applyRequestBody.push(this.selection[i].processInstanceId)
        }
      }
      let promises = []
      applyRequestBody.forEach(item => {
        const promise = new Promise(resolve => {
          HTTP.withdrawProcess(item)
            .then(res => {
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        promises.push(promise)
      })
      const applyInfo = this.$message.info('正在进行批量撤回，请稍后……')
      Promise.all(promises)
        .then(() => {
          applyInfo.close()
          this.$message.success('操作成功')
          // 更新表格
          this.getApplyData()
        })
        .catch(() => {})
        .finally(() => {
          // this.batchVisible = false
        })
    },
    checkItemDetail(data) {
      this.dialogTitle = data.processInstanceName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 1
    },
    getProcessImage(data) {
      this.showProcessDetail = true
      setTimeout(() => {
        this.$refs.processDetail.initData(data)
      })
    },
    withdraw(data) {
      this.$DatablauCofirm('确定要撤回申请吗？')
        .then(() => {
          const processInstanceId = data.processInstanceId
          HTTP.withdrawProcess(processInstanceId)
            .then(res => {
              this.$message.success('申请已撤回')
              this.getApplyData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    ifCheckDisabled(row) {
      return row.result !== 'APPLY'
    },

    handleSelectionChange(val) {
      this.selection = val
    },
    setResultStyle(val) {
      let str = '#ccc'
      switch (val) {
        case '审核通过':
          str = '#66BF16 '
          break
        case '审核中':
          str = '#E6AD00 '
          break
        case '审核不通过':
          str = '#FF4B53 '
          break
        case '已撤销':
          str = '#afb4bf '
          break
      }
      return str
    },
    setBg(val) {
      let typeToBgObj = {
        0: 'rgba(52, 102, 192, 0.15)',
        1: '#E8F6DC',
        2: 'rgba(244, 101, 101, 0.15)',
      }
      return typeToBgObj[val]
    },
  },
}
</script>

<style lang="scss">
.task-and-apply {
  overflow: hidden;
  border-radius: 4px;
  .tag {
    display: inline-block;
    text-align: center;
    line-height: 20px;
    // width: 28px;
    padding: 0 8px;
    height: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    // font-family: PingFangSC-Semibold, PingFang SC;
  }
  .el-tabs__item {
    height: 50px;
    line-height: 50px;
  }
  .el-tabs__item.is-active {
    .tag {
      background: rgba(64, 158, 255, 0.1);
    }
  }
  .el-tab-pane {
    padding-top: 6px;
  }
  .showMore {
    padding: 0 5px;
    font-size: 12px;
    // font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #409eff;
    &:hover {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }
  }

  .my-apply-dia {
    .dialog-outer {
      position: relative;
      min-height: 400px;
    }
  }
}
</style>
