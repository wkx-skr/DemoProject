<template>
  <div class="code-asset-tab">
    <datablau-input
      clearable
      maxlength="100"
      style="width: 9vw; min-width: 180px"
      placeholder="请输入代码名称或编号"
      type="text"
      size="mini"
      v-model="searchFormData.keyword"
    ></datablau-input>
    <datablau-table
      class="datablau-table"
      height="100%"
      :data="tableData"
      v-loading="tableLoading"
    >
      <el-table-column
        min-width="120px"
        label="标准主题"
        prop="datasetName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        min-width="120px"
        label="中文名称"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="英文名称"
        prop="enName"
        min-width="120px"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        width="100px"
        label="代码编号"
        prop="code"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="代码状态"
        prop="state"
        :min-width="80"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span :style="`color:${getStatusColor(scope.row.state)}`">
            <span
              :style="`background-color:${getStatusColor(scope.row.state)}`"
              class="circle"
            ></span>
            {{ statusFormatter(scope.row.state) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="submitter"
        :min-width="80"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="创建时间"
        :min-width="130"
        prop="createTime"
        :formatter="$timeFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$version.tableHeader.publishTime"
        :min-width="130"
        column-key="publish"
        prop="publishTime"
        :formatter="$timeFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$version.tableHeader.lastModificationTime"
        :min-width="130"
        column-key="last"
        prop="lastModification"
        :formatter="$timeFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="备注"
        prop="comment"
        :min-width="80"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template slot-scope="scope">
          <datablau-button
            size="small"
            type="text"
            @click="openScan(scope.row)"
          >
            查看
          </datablau-button>
          <datablau-button
            size="small"
            type="text"
            v-if="scope.row.state === 'D' || scope.row.state === ''"
            @click="openEdit(scope.row)"
            v-show="
              $auth['STANDARD_CODE_EDIT'] || $auth['ROLE_STANDARD_CODE_EDIT']
            "
          >
            编辑
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div class="dialog-bottom">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :pager-count="5"
        layout="total, sizes, prev, pager, next"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  data() {
    return {
      tableData: [],
      tableLoading: false,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      searchFormData: {
        keyword: '',
        code: '',
        state: null,
      },
    }
  },
  components: {},
  beforeMount() {},
  computed: {},
  mounted() {
    this.getListData()
  },
  methods: {
    getListData() {
      this.tableLoading = true
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchFormData.keyword,
        state: this.searchFormData.state,
        datasetName: this.currentCatalog.includes('所有')
          ? ''
          : this.currentCatalog,
      }
      // this.$http
      //   .post(`${this.$url}/service/domains/codes/page`, obj)
      HTTP.getCodeListService(obj)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.data
          this.total = res.data.total
          //   setTimeout(() => {
          //     this.tableHeight = document.documentElement.clientHeight - 190
          //   })
          //   if (this.$route.params.code) {
          //     setTimeout(() => {
          //       this.openScan(this.$route.params)
          //     })
          //   }
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getListData()
    },
    handleCurrentChange(current, type) {
      this.currentPage = current
      this.getListData(type)
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.code-asset-tab {
  // border: 1px solid red;
  min-height: 500px;
  position: relative;

  .delete-btn {
    margin-left: 20px;
  }
}
</style>

<style lang="scss">
.code-asset-tab {
}
</style>
