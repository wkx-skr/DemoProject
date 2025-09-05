<template>
  <div class="batch-manager">
    <!-- 搜索区域 -->
    <div style="margin-left: 20px">
      <datablau-input
        :iconfont-state="true"
        placeholder="批次名称"
        v-model="filterForm.applyName"
        style="display: inline-block"
        clearable
      ></datablau-input>
      <datablau-select
        key=""
        style="display: inline-block; margin-left: 10px"
        clearable
        filterable
        multiple
        v-model="filterForm.applyType"
        placeholder="批次类型"
      >
        <el-option label="资产DL123" value="资产DL123"></el-option>
        <el-option label="资产DL45" value="资产DL45"></el-option>
        <el-option label="标准数据元" value="标准数据元"></el-option>
        <el-option label="业务术语" value="业务术语"></el-option>
      </datablau-select>
      <datablau-input
        :iconfont-state="true"
        placeholder="创建人"
        v-model="filterForm.applyCreator"
        style="display: inline-block; margin-left: 10px"
        clearable
      ></datablau-input>
      <datablau-dateRange
        @changeDateTime="changeEventStartTime"
        style="display: inline-block; margin-left: 10px"
        v-model="dateRange"
        start-placeholder="创建开始日期"
        end-placeholder="创建结束日期"
        clearable
      ></datablau-dateRange>
      <!-- 当没有固定state参数时才显示状态搜索框 -->
      <datablau-select
        v-if="!fixedState"
        style="display: inline-block; margin-left: 10px"
        clearable
        filterable
        v-model="filterForm.innerState"
        placeholder="审核状态"
      >
        <el-option label="未确认" value="UNCONFIRMED"></el-option>
        <el-option label="已确认" value="CONFIRMED"></el-option>
        <el-option label="已绑定" value="BIND"></el-option>
        <el-option label="通过" value="PASS"></el-option>
        <el-option label="未通过" value="REJECT"></el-option>
      </datablau-select>
      <datablau-button
        type="primary"
        style="margin-left: 10px"
        @click="handleSearch"
      >
        查询
      </datablau-button>
      <datablau-button style="margin-left: 10px" @click="resetSearch">
        重置
      </datablau-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <datablau-table
        class="datablau-table-info"
        ref="batchTable"
        :data="tableData"
        :key="tableKey"
        height="100%"
        highlight-current-row
        @sort-change="handleSortChange"
        :border="true"
        v-loading="loading"
        :row-key="row => row.id"
        :data-selectable="true"
        :row-selectable="selectableBatch"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          label="批次类型"
          prop="applyType"
          show-overflow-tooltip
        />
        <el-table-column
          label="批次名称"
          prop="applyName"
          show-overflow-tooltip
        />
        <el-table-column
          label="业务域"
          prop="innerName"
          show-overflow-tooltip
        />
        <el-table-column
          label="资产编码"
          prop="buCode"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建人"
          prop="applyCreator"
          show-overflow-tooltip
        />
        <el-table-column label="状态" prop="innerState" show-overflow-tooltip>
          <template slot-scope="scope">
            <span
              v-if="scope.row.innerState === 'UNCONFIRMED'"
              style="color: #f56c6c"
            >
              未确认
            </span>
            <span
              v-else-if="scope.row.innerState === 'CONFIRMED'"
              style="color: #67c23a"
            >
              已确认
            </span>
            <span
              v-else-if="scope.row.innerState === 'BIND'"
              style="color: #e6a23c"
            >
              已绑定
            </span>
            <span
              v-else-if="scope.row.innerState === 'PASS'"
              style="color: #409eff"
            >
              通过
            </span>
            <span
              v-else-if="scope.row.innerState === 'REJECT'"
              style="color: #909399"
            >
              未通过
            </span>
            <span v-else>{{ scope.row.innerState }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="确认人"
          prop="confirmUser"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="创建时间"
          prop="applyCreateTime"
          show-overflow-tooltip
          sortable="custom"
          :formatter="$dateFormatter"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="250"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              size="mini"
              @click="handleView(scope.row)"
            >
              查看
            </datablau-button>
            <!-- 确认按钮 -->
            <datablau-button
              v-if="
                scope.row.innerState === 'UNCONFIRMED' && $auth['APPLY_CONFIRM']
              "
              type="text"
              size="mini"
              @click="handleConfirm(scope.row)"
            >
              确认
            </datablau-button>

            <datablau-button
              v-if="
                !dopEnabled &&
                scope.row.innerState === 'UNCONFIRMED' &&
                $auth['APPLY_CONFIRM']
              "
              type="text"
              size="mini"
              @click="handleApproval(scope.row)"
            >
              审批
            </datablau-button>
            <datablau-button
              type="text"
              size="mini"
              @click="handleDelete(scope.row)"
              v-if="
                scope.row.innerState === 'UNCONFIRMED' && $auth['APPLY_DELETE']
              "
            >
              删除
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <!-- 当有固定state参数时显示确定按钮 -->
      <div v-if="fixedState" style="float: left">
        <datablau-button
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="handleConfirmSelection"
        >
          确定 ({{ selectedRows.length }})
        </datablau-button>
      </div>
      <datablau-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>

    <!-- 审批弹窗 -->
    <el-dialog title="审批" :visible.sync="approvalDialogVisible">
      <el-radio-group v-model="approvalStatus">
        <el-radio :label="2">通过</el-radio>
        <el-radio :label="3">驳回</el-radio>
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <datablau-button @click="approvalDialogVisible = false">
          取消
        </datablau-button>
        <datablau-button type="primary" @click="submitApproval">
          确定
        </datablau-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BatchManager',
  data() {
    return {
      // 筛选表单
      dateRange: [],
      filterForm: {
        pageNum: 1,
        pageSize: 20,
        applyType: [],
        applyName: '',
        applyCreator: '',
        startTime: '',
        endTime: '',
        innerState: '',
      },
      // 表格数据
      tableData: [],
      tableKey: 0,
      loading: false,
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      total: 0,
      // 排序参数
      sortData: {
        prop: '',
        order: 'ascending',
      },
      // DOP相关
      dopEnabled: false,
      approvalDialogVisible: false,
      approvalRow: null,
      approvalStatus: null,
      selectedRows: [],
      // 固定状态参数
      fixedState: '',
    }
  },
  created() {
    this.initFixedState()
    this.getDopConfig()
    this.getTableData()
  },
  methods: {
    // 初始化固定状态参数
    initFixedState() {
      const { state,buName,operate } = this.$route.query
      let mapObj = {
        "asset":["资产DL123"],
        "model":["资产DL45"],
        "standard":["标准数据元","业务术语"]
      }
      let innerBuNameArr = buName && buName.split(",") ||[]
      // if (state) {
      this.fixedState = state
      this.filterForm.innerState = state
      this.$set(this.filterForm,"applyType",mapObj[operate])
      this.$set(this.filterForm,"innerBuName",innerBuNameArr)
      // }
    },

    // 向父窗口发送消息
    sendMessageToParent(message) {
      if (window.parent !== window) {
        window.parent.postMessage(message, '*')
      }
    },

    // 处理勾选确定
    handleConfirmSelection() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要确认的批次')
        return
      }

      // 向父窗口发送勾选数据
      this.sendMessageToParent({
        type: 'batchSelection',
        selectedRows: this.selectedRows,
        state: this.fixedState,
      })

      this.$message.success(`已选择 ${this.selectedRows.length} 个批次`)
    },

    changeEventStartTime(value) {
      if (value && value.length === 2) {
        this.filterForm.startTime = new Date(value[0]).toISOString()
        this.filterForm.endTime = new Date(value[1]).toISOString()
      } else {
        this.filterForm.startTime = ''
        this.filterForm.endTime = ''
      }
    },

    handleConfirm(row) {
      this.$http
        .post(`/domain/apply/confirm`, {
          batchIds: Array.isArray(row.id) ? row.id : [row.id],
        })
        .then(res => {
          this.$message.success(`确认成功: ${row.applyName}`)
          this.getTableData()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },

    handleApproval(row) {
      this.approvalRow = row
      this.approvalStatus = null
      this.approvalDialogVisible = true
    },

    submitApproval() {
      if (!this.approvalStatus) {
        this.$message.warning('请选择审批结果')
        return
      }
      this.$http
        .post('/domain/apply/batch/flow/notice', {
          approvalId: 2,
          batchId: this.approvalRow.id,
          approvalStatus: this.approvalStatus,
        })
        .then(res => {
          this.$message.success('审批成功')
          this.approvalDialogVisible = false
          this.getTableData()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },

    handleView(row) {
      // 内部路由跳转到批次详情页，参数统一为 id
      this.$router.push({
        path: '/dop/batchDetail',
        query: { type: 'detail', id: row.id },
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          this.$http
            .post('/domain/apply/delete', {
              batchIds: [row.id],
            })
            .then(res => {
              this.$message.success(`删除成功: ${row.applyName}`)
              this.getTableData()
              this.loading = false
            })
            .catch(err => {
              this.loading = false
              this.$showFailure(err)
            })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },

    getTableData() {
      this.loading = true
      this.$http
        .post(`/domain/apply/page`, this.filterForm)
        .then(res => {
          this.tableData = res.data.content
          this.total = res.data.totalItems
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          this.$showFailure(err)
        })
    },

    handleSearch() {
      this.currentPage = 1
      this.filterForm.pageNum = 1
      this.getTableData()
    },

    resetSearch() {
      this.filterForm = {
        pageNum: 1,
        pageSize: 20,
        applyType: [],
        applyName: '',
        applyCreator: '',
        startTime: '',
        endTime: '',
        innerState: this.fixedState || '', // 保持固定状态值
      }
      this.currentPage = 1
      this.getTableData()
    },

    handleSortChange(val) {
      this.sortData.prop = val.prop
      this.sortData.order = val.order
      this.getTableData()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.filterForm.pageSize = val
      this.filterForm.pageNum = 1
      this.currentPage = 1
      this.getTableData()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.filterForm.pageNum = val
      this.getTableData()
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    getDopConfig() {
      this.$http.get('/domain/apply/conf/info').then(res => {
        this.dopEnabled = res.data === true
      })
    },

    selectableBatch(row) {
      // 当有固定state参数时，允许勾选所有行
      if (this.fixedState) {
        return true
      }
      // 原有逻辑
      return this.dopEnabled && row.innerState === 'CONFIRMED'
    },
  },
}
</script>

<style scoped lang="scss">
.batch-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding-top: 20px;

  .table-container {
    flex: 1;
    overflow: auto;
    padding: 0 20px 10px 20px;
    margin-bottom: 10px;
    min-height: 500px;
  }

  .pagination-container {
    height: 50px;
    padding: 10px 20px;
    box-sizing: border-box;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    position: sticky;
    bottom: 0;
    z-index: 10;
  }
}
</style>
