<template>
  <div class="dop-list tab-page tabPageAbs" style="top: 0">
    <!-- Tab切换区域 -->
    <div class="tabs-box">
      <div class="tabs-content">
        <datablau-tabs
          v-model="currentTab"
          @tab-click="handleTabClick"
          :hasContent="false"
        >
          <el-tab-pane label="批次" name="tab1">批次</el-tab-pane>
          <el-tab-pane label="详细" name="tab2" :disabled="!currentBatchId">
            详细
          </el-tab-pane>
          <el-tab-pane
            label="权限"
            name="tab3"
            v-if="$auth['APPLY_CONFIRM_MAG']"
          >
            权限
          </el-tab-pane>
        </datablau-tabs>
      </div>
    </div>

    <!-- 列表内容区域 -->
    <div class="list-content">
      <!-- 批次内容 -->
      <batch-list
        v-if="currentTab === 'tab1'"
        :loading="loading"
        :table-data="tableData"
        :pagination="pagination"
        :filter-form="filterForm"
        :dop-enabled="dopEnabled"
        :selected-rows="selectedRows"
        @search="handleSearch"
        @reset="resetSearch"
        @view="handleView"
        @confirm="handleConfirm"
        @approval="handleApproval"
        @delete="handleDelete"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @updateFilterForm="handleFilterFormUpdate"
        @reject="handleReject"
      />

      <!-- 详细内容 -->
      <detail-list
        v-if="currentTab === 'tab2'"
        :loading="loading2"
        :table-data="filteredTableData2"
        :pagination="pagination2"
        :filter-form="filterForm2"
        :current-batch-id="currentBatchId"
        @search="handleLocalFilter"
        @reset="resetSearch2"
        @sort-change="handleLocalSort"
        @size-change="handleSizeChange2"
        @current-change="handleCurrentChange2"
        @export="handleExport"
      />

      <!-- 权限内容 -->
      <permission-list v-if="currentTab === 'tab3'" />
    </div>

    <!-- 审批弹窗 -->
    <approval-dialog
      :visible="approvalDialogVisible"
      :approval-status="approvalStatus"
      @confirm="submitApproval"
      @cancel="approvalDialogVisible = false"
    />
  </div>
</template>

<script>
import BatchList from './components/BatchList.vue'
import DetailList from './components/DetailList.vue'
import ApprovalDialog from './components/ApprovalDialog.vue'
import PermissionList from './components/PermissionList.vue'

export default {
  name: 'DopList',
  components: {
    BatchList,
    DetailList,
    ApprovalDialog,
    PermissionList,
  },

  data() {
    return {
      // Tab切换
      currentTab: 'tab1',
      currentBatchId: null,
      dopEnabled: false,

      // 批次数据
      loading: false,
      tableData: [],
      selectedRows: [],
      total: 0,

      // 批次筛选表单
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

      // 详细数据
      loading2: false,
      allTableData2: [], // 原始数据
      filteredTableData2: [], // 筛选后的数据
      currentPage2: 1,
      pageSize2: 10,
      filteredTotal2: 0,

      // 详细筛选表单
      filterForm2: {
        cnName: '',
        enName: '',
        dataType: '',
        orderType: '',
      },

      // 排序配置
      sortData: {
        prop: '',
        order: 'ascending',
      },
      sortData2: {
        prop: '',
        order: 'ascending',
      },

      // 审批相关
      approvalDialogVisible: false,
      approvalRow: null,
      approvalStatus: null,
    }
  },

  computed: {
    // 批次分页配置
    pagination() {
      return {
        currentPage: this.filterForm.pageNum,
        pageSize: this.filterForm.pageSize,
        total: this.total,
        pageSizes: [10, 20, 50, 100],
      }
    },

    // 详细分页配置
    pagination2() {
      return {
        currentPage: this.currentPage2,
        pageSize: this.pageSize2,
        total: this.filteredTotal2,
        pageSizes: [10, 20, 50, 100],
      }
    },
  },

  created() {
    this.initializeData()
  },

  methods: {
    // 初始化数据
    async initializeData() {
      try {
        await this.getDopConfig()

        // 检查路由参数
        const { type, id } = this.$route.query
        if (type === 'detail' && id) {
          this.currentTab = 'tab2'
          this.currentBatchId = id
          await this.getDetailData(id)
        } else {
          await this.getTableData()
        }
      } catch (error) {
        this.$showFailure(error)
      }
    },

    // 获取DOP配置
    async getDopConfig() {
      try {
        const response = await this.$http({
          url: '/domain/apply/conf/info',
          method: 'get',
        })
        this.dopEnabled = response.data === true
      } catch (error) {
        console.error('获取DOP配置失败:', error)
        this.dopEnabled = false
      }
    },

    // Tab切换处理
    async handleTabClick(tab) {
      if (tab.name === 'tab2' && !this.currentBatchId) {
        this.$message.warning('请先从批次列表中选择一条记录查看')
        this.currentTab = 'tab1'
        return false
      }

      this.currentTab = tab.name

      if (tab.name === 'tab1') {
        await this.getTableData()
      } else if (tab.name === 'tab2' && this.currentBatchId) {
        if (this.allTableData2.length === 0) {
          await this.getDetailData(this.currentBatchId)
        }
      }
    },

    // 批次相关方法
    async getTableData() {
      this.loading = true
      try {
        const response = await this.$http({
          url: '/domain/apply/page',
          method: 'post',
          data: this.filterForm,
        })
        this.tableData = response.data.content
        this.total = response.data.totalItems
      } catch (error) {
        this.$showFailure(error)
      } finally {
        this.loading = false
      }
    },

    async handleSearch() {
      this.filterForm.pageNum = 1
      await this.getTableData()
    },

    async resetSearch() {
      this.filterForm = {
        pageNum: 1,
        pageSize: 20,
        applyType: [],
        applyName: '',
        applyCreator: '',
        startTime: '',
        endTime: '',
        innerState: '',
      }
      await this.getTableData()
    },

    async handleView(row) {
      if (!row?.id) {
        this.$message.warning('无效的记录ID')
        return
      }

      this.currentBatchId = row.id
      await this.getDetailData(row.id)

      // 更新URL
      this.$router.push({
        path: this.$route.path,
        query: { type: 'detail', id: row.id },
      })

      this.currentTab = 'tab2'
    },

    async handleConfirm(row) {
      try {
        // 向父窗口发送postMessage
        if (window.parent !== window) {
          window.parent.postMessage(
            {
              type: 'confirm',
              batchId: row.id,
              batchName: row.applyName,
            },
            '*'
          )
        }

        await this.$http({
          url: '/domain/apply/confirm',
          method: 'post',
          data: {
            batchIds: Array.isArray(row.id) ? row.id : [row.id],
          },
        })

        this.$message.success(`确认成功: ${row.applyName}`)
        await this.getTableData()
      } catch (error) {
        this.$showFailure(error)
      }
    },

    handleApproval(row) {
      this.approvalRow = row
      this.approvalStatus = null
      this.approvalDialogVisible = true
    },

    async submitApproval(approvalStatus) {
      if (!approvalStatus) {
        this.$message.warning('请选择审批结果')
        return
      }

      try {
        await this.$http({
          url: '/domain/apply/batch/flow/notice',
          method: 'post',
          data: {
            approvalId: 2,
            batchId: this.approvalRow.id,
            approvalStatus: approvalStatus,
          },
        })

        this.$message.success('审批成功')
        this.approvalDialogVisible = false
        await this.getTableData()
      } catch (error) {
        this.$showFailure(error)
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该记录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })

        this.loading = true
        await this.$http({
          url: '/domain/apply/delete',
          method: 'post',
          data: {
            batchIds: [row.id],
          },
        })

        this.$message.success(`删除成功: ${row.applyName}`)
        await this.getTableData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$showFailure(error)
        } else {
          this.$message.info('已取消删除')
        }
      } finally {
        this.loading = false
      }
    },

    handleSortChange(val) {
      this.sortData = {
        prop: val.prop,
        order: val.order,
      }
      this.getTableData()
    },

    async handleSizeChange(val) {
      this.filterForm.pageSize = val
      this.filterForm.pageNum = 1
      await this.getTableData()
    },

    async handleCurrentChange(val) {
      this.filterForm.pageNum = val
      await this.getTableData()
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 详细相关方法
    async getDetailData(batchId) {
      if (!batchId) {
        this.$message.warning('批次ID不能为空')
        return
      }

      this.loading2 = true
      try {
        const response = await this.$http({
          url: `/domain/apply/detail/${batchId}`,
          method: 'get',
        })
        this.allTableData2 = response.data || []
        this.applyLocalPagination()
      } catch (error) {
        this.$showFailure(error)
      } finally {
        this.loading2 = false
      }
    },

    // 前端分页处理
    applyLocalPagination() {
      this.handleLocalFilter(false)
    },

    // 本地筛选
    handleLocalFilter(updatePage = true) {
      if (updatePage) {
        this.currentPage2 = 1
      }

      let filtered = [...this.allTableData2]
      const { cnName, enName, dataType, orderType } = this.filterForm2

      // 应用筛选条件
      if (cnName) {
        filtered = filtered.filter(
          item =>
            item.cnName &&
            item.cnName.toLowerCase().includes(cnName.toLowerCase())
        )
      }

      if (enName) {
        filtered = filtered.filter(
          item =>
            item.enName &&
            item.enName.toLowerCase().includes(enName.toLowerCase())
        )
      }

      if (dataType) {
        filtered = filtered.filter(item => item.dataType === dataType)
      }

      if (orderType) {
        filtered = filtered.filter(item => item.orderType === orderType)
      }

      // 应用排序
      if (this.sortData2.prop && this.sortData2.order) {
        const { prop, order } = this.sortData2
        const isAsc = order === 'ascending'

        filtered.sort((a, b) => {
          const valueA = a[prop]
          const valueB = b[prop]

          if (valueA === valueB) return 0
          if (valueA > valueB) return isAsc ? 1 : -1
          return isAsc ? -1 : 1
        })
      }

      // 更新筛选后的总数
      this.filteredTotal2 = filtered.length

      // 应用分页
      const start = (this.currentPage2 - 1) * this.pageSize2
      const end = start + this.pageSize2
      this.filteredTableData2 = filtered.slice(start, end)
    },

    // 本地排序
    handleLocalSort(val) {
      this.sortData2 = {
        prop: val.prop,
        order: val.order,
      }
      this.handleLocalFilter(false)
    },

    resetSearch2() {
      this.filterForm2 = {
        cnName: '',
        enName: '',
        dataType: '',
        orderType: '',
      }
      this.currentPage2 = 1
      this.handleLocalFilter()
    },

    handleSizeChange2(val) {
      this.pageSize2 = val
      this.applyLocalPagination()
    },

    handleCurrentChange2(val) {
      this.currentPage2 = val
      this.applyLocalPagination()
    },

    // 日期范围变化处理
    changeEventStartTime(value) {
      if (value && value.length === 2) {
        this.filterForm.startTime = new Date(value[0]).toISOString()
        this.filterForm.endTime = new Date(value[1]).toISOString()
      } else {
        this.filterForm.startTime = ''
        this.filterForm.endTime = ''
      }
    },

    // 批量操作
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      try {
        await this.$confirm(
          `确认删除选中的 ${this.selectedRows.length} 条记录吗?`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )

        const batchIds = this.selectedRows.map(row => row.id)
        this.loading = true

        await this.$http({
          url: '/domain/apply/delete',
          method: 'post',
          data: { batchIds },
        })

        this.$message.success(`成功删除 ${batchIds.length} 条记录`)
        await this.getTableData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$showFailure(error)
        } else {
          this.$message.info('已取消删除')
        }
      } finally {
        this.loading = false
      }
    },

    handleBatchSend() {
      const ids = this.selectedRows.map(row => row.id)
      if (window.parent !== window) {
        window.parent.postMessage({ ids }, '*')
      }
      this.$message.success('已发送选中ID到父窗口')
    },

    // 行选择条件
    selectableBatch(row) {
      return this.dopEnabled && row.innerState === 'CONFIRMED'
    },

    // 处理子组件表单更新
    handleFilterFormUpdate(newFilterForm) {
      this.filterForm = { ...newFilterForm }
    },

    // 导出处理
    handleExport() {
      if (!this.currentBatchId) {
        this.$message.warning('批次ID不能为空')
        return Promise.reject(new Error('批次ID不能为空'))
      }

      // 使用系统提供的$downloadFile方法，复用batchDetail的导出功能
      this.$downloadFile(`/domain/apply/export/${this.currentBatchId}`)
      return Promise.resolve()
    },

    handleReject(row) {
      this.$confirm('确认驳回该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          this.$http
            .post('/domain/apply/batch/reject',[row.id])
            .then(res => {
              this.$message.success(`驳回成功: ${row.applyName}`)
              this.getTableData()
              this.loading = false
            })
            .catch(err => {
              this.loading = false
              this.$showFailure(err)
            })
        })
        .catch(() => {
          this.$message.info('已取消驳回')
        })
    },
  },
}
</script>

<style scoped lang="scss">
.dop-list {
  position: relative;
  height: 100%;
  background: #fff;

  .tabs-box {
    padding: 0 10px;
    box-sizing: border-box;
    height: 44px;
    border-bottom: 1px solid #ddd;
    line-height: 44px;

    .tabs-content {
      float: left;
      /deep/ .datablau-tabs {
        .el-tabs {
          .el-tabs__header {
            .el-tabs__nav-wrap {
              &:after {
                background-color: transparent;
              }
              .el-tabs__item {
                height: 39px;
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  .list-content {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
