<template>
  <div class="report-tab-container">
    <div class="top-line">
      <p class="tab-title">
        {{ $t('userPane.title.myReport') }}
        <i
          style="cursor: pointer"
          class="el-icon-refresh"
          @click="refreshTable"
        ></i>
      </p>
      <div class="vertical-middle top-line-inner">
        <datablau-input
          :iconfont-state="true"
          placeholder="搜索报告名称"
          prefix-icon="el-icon-search"
          v-model="keyword"
          :clearable="true"
        ></datablau-input>
      </div>
    </div>
    <datablau-form-submit
      class="table-row"
      ref="tableOuter"
    >
      <datablau-table
          height="100%"
          ref="reportTable"
          :data="tableData"
          v-loading="tableLoading"
          @sort-change="handleSortChange"
      >
        <el-table-column
            prop="name"
            label="报告名称"
            min-width="300"
            show-overflow-tooltip
            sortable="custom"
        ></el-table-column>
        <el-table-column
            label="状态"
            align="center"
            min-width="160"
            show-overflow-tooltip
            sortable="custom"
            prop="state"
        >
          <template slot-scope="scope">
            <Status style="line-height:2em;display:inline-block;margin-right:1em;" :type="scope.row.state"></Status>
          </template>
        </el-table-column>
        <el-table-column
            prop="createTime"
            minWidth="80"
            label="创建时间"
            show-overflow-tooltip
            :formatter="$timeFormatter"
            sortable="custom"
        ></el-table-column>
        <el-table-column
            :label="$t('userPane.userPane.operation')"
            width="120"
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
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          class="bottom-pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import paginationMixin from '@/components/common/mixin/paginationMixin.js'
import HTTP from '@/resource/http'
import Status from '@/views/list/report/Status.vue'

export default {
  name: "myReport",
  mixins: [
    paginationMixin
  ],
  data() {
    return {
      tableData: null,
      tableLoading: true,
      searchProps: ['name']
    }
  },
  components: {
    Status
  },
  computed: {},
  mounted() {
    this.dataInit();
  },
  methods: {
    dataInit() {
      this.tableLoading = true
      HTTP.getUserReports()
        .then(data => {
          this.allData = data.content

          this.fetchData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    refreshTable() {
      this.dataInit()
    },
    getData(para) {
      this.getDataFromAll(para)
    },
    checkItemDetail(row) {
      this.$router.push({
        name: 'list',
        query: {
          // id: row.ddmModelId,
          reviewReportId: row.id
        }
      })
    }
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

.report-tab-container {
  $topLineH: 75px;

  .top-line {
    position: absolute;
    left: 20px;
    top: 0;
    right: 0;
  }

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

  .table-row {
    position: absolute;
    top: $topLineH;
    left: 0px;
    right: 0px;
    bottom: 0;
  }
}


</style>
