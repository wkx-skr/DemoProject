<template>
  <div class="folder-detail-app">
    <datablau-dialog
      :close-on-click-modal="false"
      :title="addTitle"
      :visible.sync="showAddDetail"
      width="550px"
      append-to-body
    >
      <add-item
        :editData="editData"
        @cancelItem="cancelItem"
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
        @applySuccess="applySuccess"
        @cancelApply="cancelApply"
        :applyDetail="applyData"
        v-if="showApplyDetail"
      ></apply-info>
    </datablau-dialog>
    <datablau-page-title
      style="margin-left: -20px"
      parent-name="数据服务"
      :name="
        isManageApp
          ? '管理应用'
          : isDevApp
          ? '我创建的应用'
          : isApplyOverview
          ? '应用列表'
          : ''
      "
    ></datablau-page-title>
    <el-form
      class="st-page-form search-list"
      id="standardListForm"
      label-position="right"
      ref="searchForm"
      :inline="true"
      :model="searchFormData"
      style="margin-top: 5px; min-width: 980px; margin-right: -20px"
    >
      <el-form-item prop="definition">
        <datablau-input
          placeholder="应用名称"
          maxlength="50"
          :iconfont-state="true"
          filterable
          clearable
          style="width: 240px"
          v-model="searchFormData.applicationName"
        ></datablau-input>
      </el-form-item>
      <el-form-item prop="dateDetail" v-if="isDevApp">
        <datablau-dateRange
          v-if="isDevApp"
          format="yyyy-MM-dd"
          size="mini"
          v-model="searchFormData.dateDetail"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></datablau-dateRange>
      </el-form-item>

      <el-form-item prop="applicationOwner" v-if="!isDevApp" label="所有者:">
        <datablau-select
          v-if="!isDevApp"
          placeholder="请选择所有者"
          class="select-style"
          filterable
          clearable
          size="mini"
          style="width: 170px"
          v-model="searchFormData.applicationOwner"
        >
          <el-option
            v-for="item in ownersOpt"
            :key="item"
            :value="item"
            :label="item"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <!-- <el-form-item label="状态" prop="status">
        <datablau-select class="select-style" filterable clearable size="mini" v-model="searchFormData.status">
          <el-option v-for="item in statusOpt" :key="item.label" :value="item.value" :label="item.label">
          </el-option>
        </datablau-select>
      </el-form-item> -->
      <el-form-item class="list-button">
        <!-- <datablau-button
          size="mini"
          type="primary"
          @click="handleCurrentChange(1)"
        >
          查询
        </datablau-button> -->
        <datablau-button
          class="iconfont icon-tianjia"
          v-if="isDevApp"
          type="important"
          @click="showAddPage"
        >
          新增应用
        </datablau-button>
        <!-- <datablau-button size="mini" type="primary" @click="resetQuery()">重置</datablau-button> -->
      </el-form-item>
    </el-form>
    <div class="list-info">
      <datablau-table
        class="datablau-table-app"
        @cell-click="cellClick"
        height="100%"
        ref="domainTable"
        :data="tableData"
        v-loading="tableLoading"
        @selection-change="tableSelectionChanged"
      >
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
          label="应用描述"
          min-width="120px"
          prop="description"
          show-overflow-tooltip
        ></el-table-column>
        <!-- <el-table-column v-if="isDevApp" label="创建时间" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{$dateFormatter(scope.row.createTime)}}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          label="所有者"
          prop="applicationOwner"
          width="60px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="修改时间" width="140px" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ $timeFormatter(scope.row.modifyTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          header-align="center"
          min-width="50px"
        >
          <template slot-scope="scope">
            <el-switch
              :title="getTitle(scope.row)"
              v-if="!isApplyOverview"
              v-model="scope.row.status"
              @change="toggleStatus(scope.$index, scope.row)"
              :active-value="activeVal"
              :inactive-value="inactiveVal"
              style="margin-bottom: 10px; margin-right: 5px"
            ></el-switch>
            <datablau-button
              v-if="!isApplyOverview"
              @click="editItem(scope.row)"
              type="icon"
              :title="$t('common.button.edit')"
              class="iconfont icon-bianji"
            ></datablau-button>
            <datablau-button
              v-if="!isApplyOverview"
              @click="deleteItem(scope.row)"
              type="icon"
              :title="$t('common.button.delete')"
              class="iconfont icon-delete"
            ></datablau-button>

            <datablau-button
              :disabled="!hasAccessApply"
              v-if="isApplyOverview && scope.row.applyState !== 1"
              @click="applyItem(scope.row)"
              type="text"
              size="small"
            >
              申请
            </datablau-button>
            <datablau-button
              v-if="isApplyOverview && scope.row.applyState === 1"
              :disabled="true"
              type="text"
              size="small"
            >
              已申请
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
      <!-- <div style="position:absolute;bottom: 0;right: 40px">
                <el-dropdown v-if="exportAccess">
                    <datablau-button type="primary" size="mini" style="margin-left: 5px;width: 80px">
                        导出<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
                    </datablau-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                            <div @click="exportStandards(true)">导出全部查询结果</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <div @click="exportStandards(false)">导出勾选</div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div> -->
    </div>
  </div>
</template>
<script>
import HTTP from '../ddsHTTP.js'
import applyInfo from './applyInfo.vue'
import addItem from './addItem.vue'
export default {
  props: {
    moudleType: {
      type: String, // 管理应用  manageApp
      default: 'applyOverview',
    },
    componentType: {
      type: String, // 开发的应用  devApp
      default: 'applyOverview',
    },
  },
  components: { applyInfo, addItem },
  beforeMount() {},
  computed: {
    isRole() {
      return (
        this.$isRole('数据工程师') ||
        this.$isRole('数据服务管理员') ||
        this.$isAdmin
      )
    },
    isManageApp() {
      return (
        this.moudleType === 'manageApp' &&
        this.componentType === 'applyOverview'
      )
    },
    isDevApp() {
      return (
        this.componentType === 'devApp' && this.moudleType === 'applyOverview'
      )
    },
    isApplyOverview() {
      return (
        this.moudleType === 'applyOverview' &&
        this.componentType === 'applyOverview'
      )
    },
  },
  mounted() {
    if (this.isDevApp && this.$route.query.type === '新增') {
      this.showAddDetail = true
    }
    this.initTableData()
    this.getAllOptions()
  },

  data() {
    return {
      // AccessAll: false,
      applyClass: 'click-style',
      hasAccessApply: this.$auth.APP_MANAGE_APPLYING,
      AccessAll: this.$auth.APP_MANAGE_ALL,
      AccessView: this.$auth.APP_MANAGE_VIEW,
      showAddDetail: false,
      showApplyDetail: false,
      columnDefs: null,
      isEdit: false,
      activeVal: 1,
      inactiveVal: 0,
      addTitle: '新增应用组',
      selectedId: '',
      allData: [],
      editData: {},
      tableData: [],
      applyData: {},
      frameworkComponents: null,
      tableLoading: false,

      searchFormData: {
        pageSize: 20,
        currentPage: 1,
        dateDetail: '',
        applicationName: '',
        applicationOwner: '全部',
        status: '',
      },
      nameOpt: [],
      ownersOpt: [],
      statusOpt: [
        {
          label: '启用',
          value: '1',
        },
        {
          label: '禁用',
          value: '0',
        },
      ],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      stas: localStorage.getItem('status'),
    }
  },
  methods: {
    getTitle(data) {
      if (data.status === 0) {
        return '启用'
      } else {
        return '禁用'
      }
    },
    getapplyClass(data) {
      if (!this.accessIsTrue(data, '详情') || this.isDevApp) {
        return 'color:#4386F5'
      } else {
        return 'color:black'
      }
    },
    cellClick(row, column, cell, event) {
      if (
        (column.property === 'applicationName' &&
          !this.accessIsTrue(row, '详情')) ||
        (column.property === 'applicationName' && this.isDevApp)
      ) {
        this.goToDetail(row)
      }
    },
    cancelApply() {
      this.showApplyDetail = false
    },
    accessIsTrue(data, tag) {
      const isManage = data.userState === 1
      const // 创建者
        isApply = data.applyState === 1
      const // 已经申请
        isAuthed = data.authState === 1
      let // 审核通过的
        result
      if (this.moudleType === 'manageApp') {
        result = false
      } else {
        // 管理员，创建人，已申请,审核通过
        switch (tag) {
          case '详情':
            result = !(this.AccessAll || isManage || isAuthed)
            break
          case '申请':
            result = this.AccessAll || isManage || isAuthed || isApply
            break
          case '归还':
            result = !isApply
            break
        }
      }

      return result
    },

    showAddPage() {
      this.showAddDetail = true
      this.editData = {}
      this.addTitle = '新增应用组'
    },
    cancelItem() {
      this.showAddDetail = false
    },
    editSuccess() {
      this.showAddDetail = false
      this.refreshData()
      if (this.editData.appId || this.editData.id) {
        this.$message.success('编辑应用成功')
      }
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
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    deleteItem(data) {
      this.$DatablauCofirm('是否确认删除？', '提示', {
        type: 'warning',
      }).then(() => {
        let newpromise
        if (this.isDevApp) {
          newpromise = HTTP.deleteNormalApply(data.id)
        } else if (this.isManageApp) {
          newpromise = HTTP.deleteApply(data.id)
        }
        newpromise
          .then(() => {
            this.showSuccess('删除成功')
            this.refreshData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getAllOptions() {
      HTTP.getAppOwners()
        .then(res => {
          this.ownersOpt = res.data
          this.ownersOpt.unshift('全部')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshData() {
      this.initTableData()
    },

    toggleStatus(index, data) {
      const status = data.status
      const id = data.id

      HTTP.changeApplyStatus(id, status)
        .then(res => {
          this.isEdit = false
          this.tableData[index].status = status
          this.$set(this.tableData, index, data)
        })
        .catch(e => {
          // this.refreshData();
          this.tableData[index].status = status === 0 ? 1 : 0
          this.$set(this.tableData, index, data)
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
      let startTime, endTime, obj, obj2, name
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
      name =
        this.searchFormData.applicationOwner === '全部'
          ? ''
          : this.searchFormData.applicationOwner
      obj = {
        applicationName: this.searchFormData.applicationName,
        applicationOwner: name,
        status: this.searchFormData.status,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      obj2 = {
        appName: this.searchFormData.applicationName,
        startTime: startTime,
        endTime: endTime,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.tableLoading = true
      let newPromise
      if (this.isManageApp) {
        newPromise = HTTP.getManageAPP(obj)
      } else if (this.isApplyOverview) {
        newPromise = HTTP.getApplyLists(obj)
      } else if (this.isDevApp) {
        newPromise = HTTP.getCreateApplyLists(obj2)
      }

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
.folder-detail-app {
  position: absolute;
  top: 0;
  right: 0px;
  left: 20px;
  padding-right: 20px;
  bottom: 0;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0);
  background-color: white;
  .datablau-table-app {
    height: 100%;
  }
  .search-list {
    .el-form-item {
      margin-right: 20px !important;
    }
    .list-button {
      float: right;
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
    right: 20px;
    left: 0;

    .click-style {
      cursor: pointer;
    }
  }

  .check-button {
    position: absolute;
    right: 0;
  }

  .bottom-info {
    position: absolute;
    padding-top: 9px;
    left: -20px;
    right: -20px;
    height: 50px;
    bottom: 0;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    .datablau-pagination {
      margin-right: 20px;
      float: right;
    }
  }
}
</style>
