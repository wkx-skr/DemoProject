<template>
  <div>
    <div class="search-part" style="position: relative; z-index: 1">
      <datablau-input
        style="width: 200px; float: left"
        :placeholder="$t('domain.code.placeholderColumn')"
        :iconfont-state="true"
        clearable
        v-model="searchKeyword"
      ></datablau-input>
      <datablau-button
        size="mini"
        type="normal"
        @click="handleCurrentChange(1, 'search')"
        style="margin-left: 8px"
      >
        {{ $t('domain.common.search') }}
      </datablau-button>
    </div>
    <div
      style="position: absolute; top: 54px; left: 0px; right: 0px; bottom: 60px"
    >
      <datablau-table
        :data="tableData"
        :show-column-selection="columnOption.showColumnSelection"
        :column-selection="columnOption.columnSelection"
        :border="columnOption.columnResizable"
        height="100%"
        v-loading="tableLoading"
      >
        <el-table-column
          :label="$t('domain.code.tableName')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="jumpToTable(scope.row)">
              {{ scope.row.parentName }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.column.columnName')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="jumpToColumn(scope.row)">
              {{ scope.row.physicalName }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.code.fieldCName')"
          prop="logicalName"
          show-overflow-tooltip
          width="200"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.code.sourceName')"
          prop="modelName"
          show-overflow-tooltip
          width="200"
        ></el-table-column>
        <el-table-column
          label="schema"
          prop="schemaName"
          show-overflow-tooltip
          width="200"
        ></el-table-column>
      </datablau-table>
      <div
        style="
          width: 100%;
          position: absolute;
          bottom: -60px;
          right: 0;
          height: 50px;
          background: #fff;
          border-top: 1px solid #eee;
        "
      >
        <datablau-pagination
          style="margin-top: 10px; text-align: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 500]"
          :page-size="pageSize"
          :layout="'total, sizes, prev, pager, next, jumper'"
          :total="totalItems"
        ></datablau-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  data() {
    return {
      columnOption: {
        // selectable: true,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      searchKeyword: '',
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      tableLoading: true,
      isAssets: '',
      assetsQuery: '',
    }
  },
  props: ['codeData'],
  components: {},
  computed: {},
  mounted() {
    if (this.$route.query.isAssets) {
      this.isAssets = this.$route.query.isAssets
      this.assetsQuery = `&isAssets=${this.isAssets}`
    }
    this.getRefData()
  },
  methods: {
    getRefData() {
      let para = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        code: this.codeData.code,
        keyword: this.searchKeyword,
        state: this.codeData.state,
      }
      HTTP.getCodeRefDataMeta(para)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.content || []
          this.totalItems = res.data.totalItems || 0
        })
        .catch(e => {
          this.tableData = []
          this.$showFailure(e)
        })
    },
    jumpToTable(row) {
      let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
        objectId: row.tableId,
        isAssets: this.isAssets,
      })
      window.open(pageUrl)
    },
    jumpToColumn(row) {
      let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
        objectId: row.id,
        isAssets: this.isAssets,
      })
      window.open(pageUrl)
    },
    jumpToModel(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/systemManage/dataSource?id=${row.modelId}`)
    },
    handleSizeChange(val) {
      this.tableLoading = true
      this.pageSize = val
      this.currentPage = 1
      this.getRefData()
    },
    handleCurrentChange(val) {
      this.tableLoading = true
      this.currentPage = val
      this.getRefData()
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
