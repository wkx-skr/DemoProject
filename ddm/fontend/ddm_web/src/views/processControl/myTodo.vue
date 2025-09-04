<template>
  <div :class="{ 'to-do-tab': !assets }">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      :append-to-body="true"
      :show-close="!$route.query.taskId"
      custom-class="apply-detail-dialog"
      :width="$route.query.taskId ? '100vw' : '960px'"
      :fullscreen="$route.query.taskId"
      :height="450"
    >
      <div class="dialog-outer detail-dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
          :businessType="businessType"
        ></apply-detail>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('userPane.myTodo.batchApproval')"
      :visible.sync="batchVisible"
      append-to-body
      width="700px"
    >
      <el-form label-position="right" label-width="5em">
        <el-form-item :label="$t('userPane.myTodo.ApproOpinion')">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            v-model="comment"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <datablau-button
            size="small"
            type="primary"
            :disabled="!batchButtonReady"
            @click="approveBatch"
          >
            {{ $t('userPane.myTodo.pass') }}
          </datablau-button>
          <datablau-button
            size="small"
            type="primary"
            :disabled="!batchButtonReady"
            @click="rejectBatch"
          >
            {{ $t('userPane.myTodo.reject') }}
          </datablau-button>
        </el-form-item>
      </el-form>
    </datablau-dialog>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="showHistory"
      :append-to-body="true"
      width="1000px"
      class="my-done-tab"
    >
      <div class="dialog-outer">
        <task-result :taskId="currentTaskId" v-if="currentTaskId"></task-result>
      </div>
    </el-dialog>
    <processDetail ref="processDetail"></processDetail>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="showUserElementsDialog"
      :append-to-body="true"
      width="1200px"
      class="my-apply-dia"
    >
      <el-table :data="userElements" style="width: 100%">
        <el-table-column
          prop="name"
          :label="$t('userPane.myTodo.nodeName')"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="processName"
          :label="$t('userPane.myTodo.processName')"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="currentNode"
          :label="$t('userPane.myTodo.curNode')"
          width="180"
        ></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope" v-if="scope.row.currentNode === '否'">
            <el-button @click="jumpToNode(scope.row)" type="text" size="small">
              {{ $t('userPane.myTodo.jump') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <div class="table-tab-container tab-with-table">
      <div
        :class="{
          'tab-top-line': assets !== 'assets',
          assets: assets === 'assets',
        }"
      >
        <p class="tab-title" v-if="assets !== 'assets'">
          {{ $t('userPane.myTodo.myTodo') }}
          <i
            style="cursor: pointer"
            class="el-icon-refresh"
            @click="refreshTable"
          ></i>
        </p>
        <div class="vertical-middle top-line-inner">
          <datablau-input
            :iconfont-state="true"
            :placeholder="$t('userPane.myTodo.queryKey')"
            v-model="keyword"
            prefix-icon="el-icon-search"
            :clearable="true"
          ></datablau-input>
          <div style="display: inline-block; margin-left: 20px">
            <span style="padding-right: 6px; font-size: 12px; color: #555">
              {{ $t('userPane.myTodo.applyType') }}
            </span>
            <datablau-select
              v-model="processTypeValue"
              clearable
              filterable
              style="width: 120px; display: inline-block"
            >
              <el-option
                v-for="item in processTypeOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </div>
          <div style="display: inline-block; margin-left: 20px">
            <span style="padding-right: 6px; font-size: 12px; color: #555">
              {{ $t('userPane.myTodo.applyTime') }}
            </span>
            <datablau-dateRange
              v-model="dataTime"
              style="display: inline-block"
              value-format="yyyy-MM-dd"
              clearable
              :start-placeholder="$t('userPane.myTodo.startDate')"
              :end-placeholder="$t('userPane.myTodo.endDate')"
            ></datablau-dateRange>
          </div>
          <div style="display: inline-block; margin-left: 10px">
            <datablau-button type="normal" @click="handleClickSearch">
              {{ $t('userPane.myTodo.query') }}
            </datablau-button>
          </div>
        </div>
      </div>
      <datablau-form-submit
        class="table-row"
        ref="tableOuter"
        :style="{
          'margin-top': assets !== 'assets' ? '100px' : '64px',
          left: assets !== 'assets' ? '' : '-20px',
        }"
      >
        <datablau-table
          height="100%"
          ref="deTable"
          :data="tableData"
          class="datablau-table el-table"
          :show-column-selection="false"
          tooltip-effect="dark"
          :data-selectable="true"
          v-loading="tableLoading"
          @selection-change="handleSelectionChange"
        >
          <!-- <el-table-column type="selection" :width="50"></el-table-column> -->
          <!-- <el-table-column
            prop="taskName"
            label="审批节点"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="assignee"
            label="负责人"
            show-overflow-tooltip
          ></el-table-column> -->
          <el-table-column
            prop="processName"
            min-width="300"
            :label="$t('userPane.myTodo.processName')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('userPane.myTodo.applyType')"
            align="center"
            min-width="160"
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
            prop="startUserId"
            :label="$t('userPane.myTodo.applicant')"
            show-overflow-tooltip
          ></el-table-column>

          <el-table-column
            :label="$t('userPane.myTodo.applyTime')"
            minWidth="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ $timeFormatter(scope.row.startTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.userPane.operation')"
            width="140"
            align="center"
            fixed="right"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-button
                type="icon"
                @click.stop="checkItemDetail(scope.row)"
                :title="$t('common.button.scan')"
              >
                <i class="iconfont icon-see"></i>
              </datablau-button>
              <datablau-button
                type="icon"
                @click.stop="getProcessImage(scope.row)"
                :title="$t('common.button.progress')"
              >
                <i class="iconfont icon-liucheng"></i>
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div :class="{ flex: assets }">
            <div class="left-button">
              <datablau-button
                size="small"
                type="primary"
                :disabled="!couldDeleteBatch"
                @click="handleBatch"
              >
                {{ $t('userPane.myTodo.handle') }}
              </datablau-button>
            </div>
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :total="totalShow"
              layout="total, sizes, prev, pager, next, jumper"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import moment from 'moment'
import processDetail from '../../components/processDetail/processDetail'
import selectUser from './selectUser.vue'
import applyDetail from './applyDetail.vue'
import userPane from '@constant/userPane'

import axios from 'axios'

export default {
  props: {
    assets: {
      default: false,
    }
  },
  mixins: [userPane],
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        rowSelection: 'single',
      },
      showApplyDetails: false,
      applyDetailData: {},
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],
      modelMap: {},

      // *** edit dialog ***
      currentTaskId: null,
      dialogVisible: false,
      applyData: {},
      dialogTitle: '发起流程',
      isTransfer: false,
      applyPropArr: [],
      editRules: {},
      currentNormal: true,
      dialogWidth: '1000px',
      dialogType: 'edit',
      currentInstanceId: '',
      showHistory: false,
      editOriginData: null,
      getAllData: null,
      processImage: {
        show: false,
        data: '',
      },

      dialogData: {
        processInstanceId: '',
        taskId: '',
        requestType: '',
      },
      userElements: [],
      showUserElementsDialog: false,
      statusDetailList: [],
      taskName: '',
      nameMapping: {},
      active: null,
      showDialog: false,
      msgList: [],
      detailVisible: false,
      clientHeight: null,
      todoDelete: [
        'columnDefs',
        'applyPropArr',
        'userElements',
        'statusDetailList',
      ],
      tableData: null,
      keyword: '',
      currentPage: 1,
      pageSize: 20,
      tableHeight: null,
      tableLoading: false,
      tableApi: {
        // table 组件的函数集合
        getSelectedNodes: null,
      },
      batchVisible: false,
      comment: '',
      batchRequestBody: null,
      batchButtonReady: false,
      baseLen: '0px',
      processTypeValue: '',
      processTypeOption: [
        {
          label: this.$t('el.table.clearFilter'),
          value: '',
        },
      ],
      dataTime: [],
      businessType: null,
      processTypeListAsset: [
        '发布目录申请',
        '下线目录申请',
        '资产发布申请',
        '资产下线申请',
        '变更目录申请',
        '资产目录权限申请',
      ],
    }
  },
  components: {
    selectUser,
    applyDetail,
    processDetail,
  },
  async beforeMount() {
    this.$user = this.$store.state.user
    if (this.$route.query.taskId) {
      this.clientHeight = document.documentElement.clientHeight
      document.getElementsByTagName('body')[0].style.display = 'none'
      let wHttp = null
      let wBase = ''
      await this.$http
        .get(`${this.$url}/service/workflow/config`)
        .then(res => {
          const obj = res.data
          const ip = obj.ip
          wBase = `http://${ip}:${obj.port}${obj.path}`
          const headers = {
            locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
            username: this.$user.username,
          }
          wHttp = axios.create({
            headers: headers,
            baseURL: HTTP.wBase,
          })
        })
        .catch(() => {
          this.$message.error('workflow未启动')
        })
      await wHttp
        .post(`${wBase}task/todo/${this.$route.query.taskId}`, {})
        .then(res => {
          this.dialogTitle = res.data.processInstanceName
          this.showApplyDetails = true
          this.applyDetailData = res.data
          this.applyDetailData.requestType = 2
          this.applyDetailData.processType = res.data.processType
          setTimeout(() => {
            document.getElementsByTagName('body')[0].style.display = 'block'
          }, 1000)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
  },
  computed: {
    disabledSave() {
      let bool = false
      if (this.editRules) {
        for (const key in this.editRules) {
          if (!this.applyData || !this.applyData[key]) {
            bool = true
          }
        }
      }
      return bool
    },
    couldDeleteBatch() {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  mounted() {
    this.$bus.$on('completeTask', () => {
      this.showApplyDetails = false
      this.refreshTable()
    })
    this.getShowData(this.defaultParaData)
    // this.tablePropFomatter()
    $(window).resize(this.resize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resize)

    setTimeout(() => {
      this.todoDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    handleClickSearch() {
      this.defaultParaData.currentPage = 1
      this.currentPage = 1
      this.getShowData(this.defaultParaData)
    },
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    tablePropFomatter() {
      const tableOuter = this.$refs.tableOuter
      const height = $(tableOuter).height() || 300
      this.tableHeight = height

      const tableCom = this.$refs.deTable
      this.tableApi.getSelectedNodes = () => {
        const arr = this.selection.map(item => {
          return {
            data: item,
          }
        })
        return arr
      }
      // this.gridApi = params.api;
      // this.columnApi = params.columnApi;
      this.selectionChangePara = {
        api: this.tableApi,
      }
      this.gridReady = true
      // let para = this.defaultParaData
      // this.getPageData(para)
    },
    // *** tab with table ***
    getShowData(para) {
      this.tableLoading = true
      this.processTypeOption = [
        {
          label: this.$t('el.table.clearFilter'),
          value: '',
        },
      ]
      return new Promise((resolve, reject) => {
        // if (!this.getAllData) {
        //   this.setGetAllData();
        // }
        this.setGetAllData(para)
        this.getAllData
          .then(res => {
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
            let data = res.data.value
            if (!data || !Array.isArray(data)) {
              data = []
            }

            data.sort((a, b) => {
              return b.startTime - a.startTime
            })
            if (para.sortData && para.sortData.colId) {
              const colId = para.sortData.colId
              data.sort((a, b) => {
                return a[colId] - b[colId]
              })
              if (para.sortData.sort === 'desc') {
                data.reverse()
              }
            }
            if (res.data.properties && res.data.properties.processType) {
              res.data.properties.processType.forEach(element => {
                this.processTypeOption = [{label: '全部', value: ''}].concat(
                  Object.values(res.data.properties.processType.map(item => {
                    return {
                      label: item.proCategoryName,
                      value: item.proCategoryCode,
                    }
                  }))
                )
                /*  if (this.assets === 'assets') {
                    this.processTypeListAsset.indexOf(element) !== -1 &&
                      this.processTypeOption.push({
                        label: this.applyTypesMap[element].label,
                        value: this.applyTypesMap[element].value,
                      })
                    return
                  }
                  this.processTypeOption.push({
                    label: this.applyTypesMap[element].label,
                    value: this.applyTypesMap[element].value,
                  }) */
              })
            }
            this.tableData = data
            this.$nextTick(() => {
              this.$refs.deTable && this.$refs.deTable.doLayout() // 解决表格错位
            })
            this.tableLoading = false
            this.totalShow = res.data.total

            const s = para.pageSize
            const c = para.currentPage
            const value = data.slice(s * (c - 1), s * c)

            const map = {}
            const result = []
            this.modelMap = map
            resolve(value)
          })
          .catch(e => {
            this.$showFailure(e)
            this.tableLoading = false
            reject([])
          })
      })
    },
    handleCurrentChange(newVal) {
      const para = this.defaultParaData
      para.currentPage = newVal
      this.currentPage = newVal
      this.getShowData(para)
    },
    handleSizeChange(newVal) {
      const para = this.defaultParaData
      para.pageSize = newVal
      para.currentPage = 1

      this.currentPage = 1
      this.pageSize = newVal
      this.getShowData(para)
    },
    setGetAllData(para) {
      if (this.$route.query.taskId) {
        return
      }
      this.getAllData = HTTP.getMyTodopage({
        currentPage: para.currentPage,
        pageSize: para.pageSize,
        processName: this.keyword,
        startUserId: this.keyword,
        // this.assets === 'assets' ? '发布目录申请,下线目录申请' : ''
        processType: this.processTypeValue
          ? this.processTypeValue
          : this.assets === 'assets'
            ? this.$t('assets.matter.tableOfContents')
            : null,
        startTimeLeft:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        startTimeRight:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },

    // *** edit dialog ***
    showAddDialog() {
      this.isTransfer = true
      this.applyData = {
        name: '',
        key: '',
        description: '',
      }
      this.dialogVisible = true
    },
    checkItemDetail(data) {
      this.dialogTitle = data.processName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 2
      this.applyDetailData.processType = data.processType
      this.businessType = data.businessType
    },

    getProcessImage(data) {
      setTimeout(() => {
        this.$refs.processDetail.initData(data)
      })
    },

    openJumpToNodeDialog({ data, api, e }) {
      HTTP.isMultiInstanceElement(data.taskId).then(re => {
        if (re.data) {
          this.$message.error({
            message: '会签节点不允许跳转',
          })
          return
        }

        HTTP.getUserElements(data.processDefinitionDto.id)
          .then(re => {
            this.userElements = re.data
            this.userElements.forEach(e => {
              e.processName = data.processName
              e.currentNode = '否'
              e.currentTask = data.taskId
              if (e.name === data.taskName) {
                e.currentNode = '是'
              }
            })
          })
          .catch(e => {})
        this.showUserElementsDialog = true
      })
    },

    jumpToNode(data) {
      HTTP.jumpToAnyUserElement(data.currentTask, data.id)
        .then(re => {
          this.$message.success({
            message: '跳转成功',
          })
        })
        .catch(e => {
          this.$message.error({
            message: '跳转失败',
          })
        })
    },

    showHistoryDialog({ data, api, e }) {
      this.currentTaskId = data.processInstanceId
      this.dialogTitle = data.taskName
      this.showHistory = true
    },

    ifShowCheck(data) {
      return data.processName === this.$processMap.dataStandard
    },

    saveEditObj() {
      if (this.$refs.processDia && this.$refs.processDia.validate()) {
        const formData = []
        const formProperties = this.editOriginData.formProperties
        if (formProperties && Array.isArray(formProperties)) {
          formProperties.forEach(item => {
            formData.push(`${item.name}=${this.applyData[item.name] || ''}`)
          })
        }
        const obj = {
          name: this.editOriginData.name,
          formData,
        }

        const url = `${this.$url}/service/workflow/process/apply`
        this.$http
          .post(url, obj)
          .then(res => {
            this.$message.success('发起成功')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    },

    refreshTable() {
      this.getShowData(this.defaultParaData)
      // this.setGetAllData();
      // if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
      //   this.$refs.modelsTable.refreshData();
      // }
    },

    chooseUser(userData) {
      //
      const username = userData.username
      this.changeOwner(this.currentTaskId, username)
    },

    changeOwner(id, owner) {
      const url = `${this.$url}/service/workflow/task/transfer?taskId=${id}&assignee=${owner}`
      //
      this.$http
        .get(url)
        .then(res => {
          //
          this.$message.success('转办成功')
          this.dialogVisible = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    signTask({ data, api, e }) {
      const url = `${this.$url}/service/workflow/task/sign?taskId=${data.id}`
      this.$http
        .get(url)
        .then(res => {
          //
          this.$message.success('签收成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    tableLayout() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    },
    closeToDoDialog() {
      this.refreshTable()
      this.dialogVisible = false
    },
    getPeopleName(list) {
      const list2 = list.includes(',') ? list.split(',') : [list]
      return list2.toString()
    },
    handleSelectionChange(selection) {
      this.selection = selection
    },
    handleBatch() {
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
            this.batchRequestBody[index].outgoingFlows = res.data.outgoingFlows
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
          this.refreshTable()
        })
        .catch(() => {})
        .finally(() => {
          this.batchButtonReady = true
          this.batchVisible = false
        })
    },
    approveBatch() {
      this.approveOrRejectBatch(0)
    },
    rejectBatch() {
      this.approveOrRejectBatch(1)
    },
  },
  watch: {
    keyword(newVal) {
      // this.getShowData(this.defaultParaData)
    },
  },
}
</script>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';

$topLineH: 75px;
/deep/ .datablau-table {
  &:before {
    height: 0;
  }
}

.tab-top-line {
  position: absolute;
  top: 0;
  left: 20px;
  right: 0;
  height: $topLineH;

  .tab-title {
    height: 40px;
    line-height: 40px;
    font-weight: 600;
    font-size: 16px;
    color: #555;

    .el-icon-refresh:hover {
      color: $primary-color;
    }
  }

  .top-line-inner {
    width: 100%;
  }

  .search-input {
    max-width: 200px;
    display: inline-block;
  }

  .button-container {
    float: right;
    padding-right: 20px;
  }
}
</style>

<style lang="scss">
.to-do-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 160px;
  right: 0;
  top: 0;
  bottom: 0;

  .delete-btn {
    margin-left: 20px;
  }
  .left-button {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    left: 20px;
  }
}
.tab-with-table .assets {
  position: absolute;
  top: 20px;

  /deep/ .form-submit {
    left: -20px;
  }
}
</style>

<style lang="scss">
.to-do-dia {
  .to-do-dialog-body {
    min-height: 100px;
    .el-textarea,
    .el-input {
      max-width: 400px;
    }
  }
}
.todo-Table {
  .el-table .cell {
    //line-height: unset !important;
  }
}
.flex {
  display: flex;
  justify-content: space-between;
}
</style>
