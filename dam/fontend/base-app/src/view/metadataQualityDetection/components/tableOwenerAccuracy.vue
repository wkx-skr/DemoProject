<template>
  <div class="accuracy-table" v-loading="loading">
    <datablau-form :inline="true" :model="filterForm" class="filter-form">
      <el-form-item label="负责人：">
        <el-select
          v-model="filterForm.responsiblePerson"
          @change="handleFilterChange('user')"
          placeholder="请选择"
          clearable
          multiple
        >
          <el-option
            v-for="item in responsiblePersonOptions"
            :key="item.id"
            :label="item.username"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务域：">
        <el-select
          v-model="filterForm.businessDomain"
          @change="handleFilterChange('bu')"
          placeholder="请选择"
          clearable
          multiple
        >
          <el-option
            v-for="item in businessDomainOptions"
            :key="item.id"
            :label="item.buName"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="btn" style="float: right">
        <datablau-button type="normal" @click="exportCheck">导出</datablau-button>
      </el-form-item>
    </datablau-form>
    <!-- <datablau-button style="float: right;z-index:999" @click="exportCheck">
      导出
    </datablau-button> -->
    <datablau-table ref="table" :data="tableData" style="width: 100%" height="500">
      <el-table-column prop="cnName" label="表中文名"></el-table-column>
      <el-table-column prop="enName" label="表英文名"></el-table-column>
      <el-table-column prop="userName" label="负责人"></el-table-column>
      <el-table-column prop="batchNu" width="400" label="业务域"></el-table-column>
    </datablau-table>
    <datablau-pagination
      style="text-align: right; margin-top: 10px; margin-right: 10px"
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
  data() {
    return {
      tableData: [],
      pageParam: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      loading: false,
      filterForm: {
        responsiblePerson: [],
        responsiblePersonNames: [],
        businessDomain: [],
        businessDomainNames: [],
      },
      responsiblePersonOptions: [],
      businessDomainOptions: [],
    }
  },
  methods: {
    // 获取负责人列表
    fetchResponsiblePersons() {
      this.$http
        .get('/assets/checkResult/user/list')
        .then(res => {
          this.responsiblePersonOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取业务域列表
    fetchBusinessDomains() {
      this.$http
        .get('/assets/checkResult/bu/list')
        .then(res => {
          this.businessDomainOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleFilterChange(prop) {
      if (prop === 'bu') {
        this.filterForm.businessDomainNames = (
          this.filterForm.businessDomain || []
        ).map(id => {
          return this.businessDomainOptions.find(item => item.id === id).buName
        })
      } else if (prop === 'user') {
        this.filterForm.responsiblePersonNames = (
          this.filterForm.responsiblePerson || []
        ).map(id => {
          return this.responsiblePersonOptions.find(item => item.id === id)
            .username
        })
      }
      this.fetchTableData()
    },
    exportCheck() {
      let url = '/assets/checkResult/need/check/export'
      this.$downloadFilePost(url, {
        buName: this.filterForm.businessDomainNames,
        username: this.filterForm.responsiblePersonNames,
        page: this.pageParam.currentPage,
        size: this.pageParam.pageSize,
      })
    },
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
      this.loading = true
      const params = {
        buName: this.filterForm.businessDomainNames,
        page: this.pageParam.currentPage,
        size: this.pageParam.pageSize,
        username: this.filterForm.responsiblePersonNames,
      }
      this.loading = true
      this.$http
        .post(`/assets/checkResult/need/check`, params)
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
  created() {
    this.fetchResponsiblePersons()
    this.fetchBusinessDomains()
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
