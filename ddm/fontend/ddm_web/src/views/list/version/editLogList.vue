<template>
  <div class="edit-logs">
    <div class="top-shadow"></div>
    <div class="edit-logs-table-outer">
      <datablau-table :data="tableData">
        <el-table-column
          prop=""
          :width="showCheckBox ? 38 : 24"
          header-align="center"
          align="center"
        >
        </el-table-column>
        <el-table-column
            show-overflow-tooltip label="记录号"
            prop="verId"
            width="130"
            header-align="left"
            align="left"
        >
        </el-table-column>
        <el-table-column
            show-overflow-tooltip
            label="修改记录"
            min-width="250"
        >
          <template slot-scope="scope">
            {{logFormatter(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column
            prop="creator"
            width="160"
            :label="$store.state.$v.modelDetail.Submitter"
            show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{
                scope.row.creator ? scope.row.creator : scope.row.user
              }}</span>
          </template>
        </el-table-column>
        <el-table-column
            width="140"
            :label="$store.state.$v.modelDetail.commitTime"
            show-overflow-tooltip
            :formatter="$timeFormatter"
            prop="timestamp"
        >
        </el-table-column>
      </datablau-table>
      <div class="edit-logs-pagination-container">
        <datablau-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></datablau-pagination>
      </div>
    </div>
    <!--<div class="no-log" v-else>-->
    <!--  {{ $store.state.$v.modelDetail.noRecord }}-->
    <!--</div>-->
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import paginationMixin from '@/components/common/mixin/paginationMixin'
export default {
  name: 'editLogList',
  data () {
    return {
      startVersion: '',
      endVersion: '',
      loading: true
    }
  },
  props: {
    source: {
      required: true,
      type: Object
    },
    modelId: {
      required: true
    },
    minnVerMap: {
      required: true
    },
    showCheckBox: {
      default: false
    }
  },
  mixins: [paginationMixin],
  components: {},
  computed: {},
  beforeMount () {
    this.tableData = null
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.startVersion = this.source.startVersion
      this.endVersion = this.source.endVersion
      this.fetchData()
    },
    getData (para) {
      let params = {
        modelId: this.modelId,
        startVersion: this.startVersion,
        endVersion: this.endVersion,
        pageSize: para.pageSize,
        currentPage: para.currentPage
      }
      HTTP.getEditLogPage(params)
        .then((res) => {
          this.total = res.totalElements
          res.content.forEach((item, index) => {
            let verData = this.minnVerMap.get(item.verId)
            item.id = this.indexMethod(index)
            item.timestamp = verData.timestamp
            item.user = verData.user
          })
          this.tableData = res.content
        })
        .catch((e) => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    indexMethod (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    },
    logFormatter (row) {
      let str = ''
      switch (row.opType) {
        case 'CREATE':
          str += this.$store.state.$v.modelDetail.create
          break
        case 'UPDATE':
          str += this.$store.state.$v.modelDetail.mod
          break
        case 'DELETE':
          str += this.$store.state.$v.modelDetail.delete
          break
        default:
          console.error(
            this.$store.state.$v.modelDetail.noOperation + row.opType
          )
          break
      }
      str += this.typeFormatter(row)
      str += row.name
      return str
    },
    typeFormatter (a) {
      let typeId
      if (typeof a === 'object') {
        typeId = a.typeId
      } else if (typeof a === 'number') {
        typeId = a
      } else if (typeof a === 'string') {
        typeId = Number.parse(a)
      }
      switch (typeId) {
        case 80000004:
          return this.$store.state.$v.udp.table
        case 80000005:
          return this.$store.state.$v.udp.column
        case 80000006:
          return this.$store.state.$v.udp.category
        case 80000093:
          return this.$store.state.$v.modelDetail.keyKeygroup
        case 80500001:
          return this.$store.state.$v.modelDetail.keyIndex
        case 80500008:
          return this.$store.state.$v.udp.view
        case 80010001:
          return this.$store.state.$v.udp.Model
        case 80100073:
          return this.$store.state.$v.dataEntity.business
        default:
          return typeId
      }
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.edit-logs {
  background-color: #F7F8FC;

  .edit-logs-pagination-container {
    text-align: right;
    padding-top: 10px;
    /deep/ {
      .el-pager li {
        margin-top: 3px;
      }
      .btn-pre,
      .el-pager,
      .el-pager .number,
      .el-pager .el-icon.more,
      .btn-next,
      .datablau-pagination .el-pagination button:disabled {
        background-color: #F7F8FC;
      }
    }
  }

  /deep/ {
    .el-table tr,
    .el-table th.el-table__cell {
      background-color: #F7F8FC;
    }
  }
}

.edit-logs {
  position: relative;
  overflow: hidden;

  .top-shadow {
    border: 1px solid red;
    z-index: 2;
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .06);
  }
}
</style>

<style lang="scss">
.db-table .el-table--border td:first-child,
.db-table .el-table--border th:first-child,
.db-table  {
  .edit-logs {
    .selection-column, .cell {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
}
</style>
