<template>
  <div class="folder-detail-info">
    <datablau-dialog
      :close-on-click-modal="false"
      :title="addTitle"
      :visible.sync="showAddDetail"
      width="600px"
      append-to-body
    >
      <add-item
        :editData="editData"
        @editSuccess="editSuccess"
        v-if="showAddDetail"
      ></add-item>
    </datablau-dialog>
    <datablau-dialog
      :close-on-click-modal="false"
      title="申请应用"
      :visible.sync="showApplyDetail"
      append-to-body
      width="800px"
    >
      <apply-info
        @cancelApply="cancelApply"
        modeType="applyAgain"
        @applySuccess="applySuccess"
        :applyDetail="applyData"
        v-if="showApplyDetail"
      ></apply-info>
    </datablau-dialog>
    <datablau-page-title
      style="margin-left: -20px"
      parent-name="数据服务"
      name="我申请的应用"
    ></datablau-page-title>
    <el-form
      class="st-page-form nav-list"
      id="standardListForm"
      label-position="right"
      ref="searchForm"
      :inline="inlineInfo"
      :model="searchFormData"
      style="margin-top: 5px; min-width: 980px"
    >
      <el-form-item prop="statusDetail" label="申请状态:">
        <datablau-select
          placeholder="请选择申请状态"
          class="select-style"
          style="width:170px"
          filterable
          clearable
          size="mini"
          v-model="searchFormData.statusDetail"
        >
          <el-option
            v-for="item in statusOpt"
            :key="item.lable"
            :value="item.value"
            :label="item.lable"
          ></el-option>
        </datablau-select>
      </el-form-item>

      <el-form-item prop="dateDetail">
        <datablau-dateRange
          format="yyyy-MM-dd"
          size="mini"
          v-model="searchFormData.dateDetail"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></datablau-dateRange>
      </el-form-item>
      <el-form-item class="list-button">
        <!-- <datablau-button
          size="mini"
          type="primary"
          @click="handleCurrentChange(1)"
        >
          查询
        </datablau-button> -->
        <!-- <datablau-button type="primary" size="mini" @click="showAddPage">添 加
        </datablau-button> -->
      </el-form-item>
    </el-form>
    <div class="list-info">
      <datablau-table
        class="datablau-table"
        @cell-click="cellClick"
        height="100%"
        ref="domainTable"
        :data="tableData"
        v-loading="tableLoading"
        @selection-change="tableSelectionChanged"
      >
        <!-- <el-table-column type="selection" width="50"></el-table-column> -->
        <el-table-column
          style="cursor: pointer"
          min-width="60px"
          label="应用名称"
          prop="applicationName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="click-style" :style="getapplyClass(scope.row)">
              {{ scope.row.applicationName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="应用简称"
          min-width="80px"
          prop="applicationAbbr"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="创建人"
          min-width="80px"
          width="60"
          prop="authCreator"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="应用描述"
          min-width="80px"
          prop="description"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="申请状态"
          min-width="80px"
          prop="currentState"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div
              class="dot-shape"
              :style="getColor(scope.row, 'background')"
            ></div>
            <span :style="getColor(scope.row)">
              {{ scope.row.currentState }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="审核意见"
          min-width="80px"
          prop="auditComment"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="申请时间" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ $timeFormatter(scope.row.applyTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          align="center"
          head-align="center"
          label="操作"
          min-width="60px"
        >
          <template slot-scope="scope">
            <datablau-button
              :disabled="accessIsTrue(scope.row, '归还')"
              @click="returnItem(scope.row)"
              type="text"
            >
              归还
            </datablau-button>
            <datablau-button
              v-if="accessIsTrue(scope.row, '再申请')"
              @click="applyItem(scope.row)"
              type="text"
            >
              再次申请
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="bottom-info">
      <datablau-pagination
        style="margin-left: -10px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
import HTTP from '../ddsHTTP.js'
import applyInfo from '../applyOverview/applyInfo.vue'
import addItem from '../applyOverview/addItem.vue'
export default {
  components: { applyInfo, addItem },
  beforeMount() {},
  mounted() {
    this.initTableData()
    this.getAllOptions()
  },

  data() {
    return {
      // AccessAll: false,
      AccessAll: this.$auth.APP_MANAGE_ALL,
      AccessView: this.$auth.APP_MANAGE_VIEW,
      showAddDetail: false,
      showApplyDetail: false,
      columnDefs: null,
      isEdit: false,
      activeVal: 1,
      inactiveVal: 0,
      addTitle: '新增应用组',
      inlineInfo: true,
      selectedId: '',
      allData: [],
      editData: {},
      tableData: [],
      applyData: {},
      frameworkComponents: null,
      tableLoading: false,
      searchFormData: {
        statusDetail: '',
        dateDetail: '',
        appCatalog: '',
      },
      pageSize: 20,
      currentPage: 1,
      nameOpt: [],
      ownersOpt: [],
      statusOpt: [
        {
          lable: '全部',
          value: '',
        },
        {
          lable: '已归还',
          value: 0,
        },
        {
          lable: '审核中',
          value: 3,
        },
        {
          lable: '审核通过',
          value: 1,
        },
        {
          lable: '审核未通过',
          value: 4,
        },
      ],
      total: 0,
      selection: [],
      stas: localStorage.getItem('status'),
    }
  },
  methods: {
    cancelApply() {
      this.showApplyDetail = false
    },
    getapplyClass(data) {
      if (!this.accessIsTrue(data, '详情')) {
        return 'color:#4386F5'
      } else {
        return 'color:black'
      }
    },
    getColor(data, info) {
      if (info === 'background') {
        if (data.currentState === '审核通过') {
          return 'background-color:#57A07F'
        } else if (data.currentState === '审核未通过') {
          return 'background-color:#F46565'
        } else if (data.currentState === '审核中') {
          return 'background-color:#AFB4BF'
        } else if (data.currentState === '已归还') {
          return 'background-color:#4386F5'
        }
      } else {
        if (data.currentState === '审核通过') {
          return 'color:#57A07F'
        } else if (data.currentState === '审核未通过') {
          return 'color:#F46565'
        } else if (data.currentState === '审核中') {
          return 'color:#AFB4BF'
        } else if (data.currentState === '已归还') {
          return 'color:#4386F5'
        }
      }
    },
    cellClick(row, column, event) {
      if (
        column.property === 'applicationName' &&
        !this.accessIsTrue(row, '详情')
      ) {
        this.goToDetail(row)
      }
    },
    showAddPage() {
      this.showAddDetail = true
      this.editData = {}
      this.addTitle = '新增应用组'
    },
    formattComment(data) {
      let result = ''
      if (data === 0) {
        result = '审核中'
      } else if (data === -1) {
        result = '驳回'
      } else if (data === 1) {
        result = '通过'
      }
      return result
    },
    accessIsTrue(data, tag) {
      // 管理员，创建人，已申请,申请通过
      const isManage = data.userState === 1
      const isAuthed = data.authState === 1
      const isAudited = data.currentState === '审核通过'
      let result
      switch (tag) {
        case '详情':
          result = !(this.AccessAll || isManage || isAuthed)
          break
        case '编辑':
          result = !(this.AccessAll || isManage)
          break
        case '归还':
          result = !isAudited
          break
        case '再申请':
          result =
            data.currentState === '已归还' || data.currentState === '归还'
          break
      }
      return result
    },

    showAddPage() {
      this.showAddDetail = true
      this.editData = {}
      this.addTitle = '新增应用组'
    },
    editSuccess() {
      this.showAddDetail = false
      this.refreshData()
    },
    applySuccess() {
      this.showApplyDetail = false

      this.refreshData()
    },
    goToDetail(data) {
      this.$emit('showDetail', data)
    },
    applyItem(data) {
      this.applyData = data
      this.showApplyDetail = true
    },
    editItem(data) {
      this.editData = data
      this.showAddDetail = true
      this.addTitle = '编辑应用组'
    },
    returnItem(data) {
      this.$DatablauCofirm('归还后不可恢复，确认归还？', '提示', {
        type: 'warning',
      })
        .then(() => {
          HTTP.returnApply(data.id)
            .then(() => {
              this.showSuccess('归还成功')
              this.refreshData()
            })
            .catch(e => {})
        })
        .catch(e => {})
    },
    deleteItem(data) {
      HTTP.deleteApply(data.id)
        .then(() => {
          this.showSuccess('删除成功')
          this.refreshData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAllOptions() {
      HTTP.getAppOwners()
        .then(res => {
          this.ownersOpt = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshData() {
      this.initTableData()
    },

    toggleStatus(data) {
      const status = data.appStatus
      const id = data.id

      HTTP.changeApplyStatus(id, status)
        .then(res => {
          this.isEdit = false
          this.refreshData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeThreshold(row, event, column) {
      if (this.hasAccess) {
        this.isEdit = true
        this.selectedId = row.indexId
        this.$nextTick(() => {
          this.$refs.input.focus()
        })
      }
    },
    initTableData() {
      let startTime = ''
      let endTime = ''
      if (
        this.searchFormData.dateDetail &&
        this.searchFormData.dateDetail !== null
      ) {
        startTime = new Date(this.searchFormData.dateDetail[0])
          .toLocaleDateString()
          .replaceAll('/', '-')
        endTime = new Date(this.searchFormData.dateDetail[1])
          .toLocaleDateString()
          .replaceAll('/', '-')
      }
      const obj = {
        appStatus: this.searchFormData.statusDetail,
        startTime: startTime,
        endTime: endTime,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.tableLoading = true
      const newPromise = HTTP.getMyApp(obj)
      newPromise
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    tableSelectionChanged(selection) {
      this.selection = selection
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initTableData()
    },

    exportStandards(isAll) {
      if (isAll) {
        const obj = {
          definition: this.searchFormData.definition,
          owner: this.searchFormData.owner,
          dimension: this.searchFormData.dimension,
          submitter: this.searchFormData.submitter,
          name: this.searchFormData.name,
          state: this.searchFormData.state,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        }
        this.$downloadFilePost(
          `${this.$url}/service/thresholds/exportSearchThreshold`,
          obj,
          '指标阈值'
        )
      } else {
        if (!this.selection.length) {
          this.$message.info('请先勾选数据标准')
          return
        }
        this.$downloadFilePost(
          `${this.$url}/service/thresholds/exportChooseThreshold`,
          this.selection.map(e => e.indexId),
          '指标阈值'
        )
      }
    },
    disabledControl(state) {
      return (
        !this.selection.length ||
        this.selection.filter(e => e.state === state).length !==
          this.selection.length
      )
    },
    resetQuery() {
      this.searchFormData = {
        definition: '',
        owner: '',
        dimension: '',
        submitter: '',
        name: '',
        state: '',
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.handleCurrentChange(1)
    },
  },
  watch: {
    searchFormData: {
      deep: true,
      handler: function () {
        this.handleCurrentChange(1)
      },
    },
  },
}
</script>
<style lang="scss" scoped>
.folder-detail-info {
  position: relative;
  height: 100%;
  margin-right: 20px;
  margin-left: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0);
  background-color: white;
  .nav-list {
    .el-form-item {
      margin-right: 20px !important;
    }
    .list-button {
      margin-left: -6px;
    }
  }
  .page-title-row {
    span {
      margin-left: 0 !important;
    }
  }

  .list-info {
    position: absolute;
    top: 90px;
    bottom: 50px;
    width: 100%;

    .click-style {
      cursor: pointer;
    }

    .dot-shape {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 8px;
      /* background-color: grey; */
    }
  }

  .check-button {
    position: absolute;
    right: 20px;
  }

  .bottom-info {
    position: absolute;
    height: 50px;
    bottom: 0;
    left: -20px;
    right: -20px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);

    .datablau-pagination {
      float: right;
      margin-top: 9px;
      margin-right: 20px;
    }
  }
}

.select-style {
  /* width: 14vw !important; */
  /* margin-left:6px; */
}
</style>
