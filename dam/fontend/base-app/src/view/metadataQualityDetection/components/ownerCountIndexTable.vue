<template>
  <div class="accuracy-table" v-loading="loading">
    <datablau-table
      ref="table"
      :data="tableData"
      style="width: 100%"
      height="350"
    >
      <el-table-column
        prop="username"
        label="负责人"
        width="80"
      ></el-table-column>
      <el-table-column
        prop="cnCommentRate"
        label="中文注释填充率"
        width="130"
        sortable
      ></el-table-column>
      <el-table-column
        prop="securityLevelRate"
        label="安全等级填充率"
        width="130"
        sortable
      ></el-table-column>
      <el-table-column
        prop="bizDescRate"
        label="业务描述填充率"
        width="130"
        sortable
      ></el-table-column>
      <el-table-column
        prop="usageDescRate"
        label="使用描述填充率"
        width="130"
        sortable
      ></el-table-column>
      <el-table-column
        prop="typeMatchRate"
        label="类型与实际存储类型匹配率"
        width="120"
        sortable
      ></el-table-column>
      <el-table-column
        prop="tableDescComplianceRate"
        label="表中文名与描述合规率"
        width="120"
        sortable
      ></el-table-column>
      <el-table-column
        prop="batchDate"
        label="统计时间"
        width="100"
        sortable
      ></el-table-column>
    </datablau-table>
    <datablau-pagination
      style="float: right; margin-top: 10px; margin-right: 10px"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageParam.currentPage"
      :page-sizes="[10, 20, 50]"
      :page-size="pageParam.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageParam.total"
    ></datablau-pagination>
  </div>
</template>

<script>
export default {
  props: {
    filterParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      tableData: [],
      pageParam: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      loading: false,
    }
  },
  methods: {
    refreshTable() {
      this.resetTable()
      this.fetchTableData()
    },
    resetTable() {
      this.tableData = []
      this.pageParam = {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      }
    },
    handleSizeChange() {
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    fetchTableData(sortParams) {
      if (this.loading) return
      const params = {
        startTime: this.filterParams.statisticalPeriod,
        endTime: this.filterParams.statisticalPeriod,
        username: this.filterParams.responsiblePersonNames,
        page: this.pageParam.currentPage,
        size: this.pageParam.pageSize,
        sortParams: sortParams || [],
      }
      this.loading = true
      this.$http
        .post(`/assets/checkResult/user/ac/rate`, params)
        .then(res => {
          this.tableData = res.data.content || []
          this.pageParam.total = res.data.totalPages || 0
        })
        .catch(err => {
          this.$showFailure(err)
          this.tableData = []
          this.pageParam.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  mounted() {
    this.fetchTableData()
  },
}
</script>

<style lang="scss" scoped>
.accuracy-table {
  width: 100%;

  /deep/ .el-table__body-wrapper {
    overflow-y: auto;
  }
}
</style>
