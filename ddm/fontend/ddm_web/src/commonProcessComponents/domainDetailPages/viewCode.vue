<template>
  <div>
    <div class="details">
      <div class="detail">
        {{ $t('domain.code.codePropCode') }} : {{ code }}
      </div>
      <div class="detail">{{ $t('domain.code.codeName') }} : {{ name }}</div>
    </div>
    <div class="table-box">
      <!--<ag-table-component-->
      <!--  ref="codeTable"-->
      <!--  @grid-ready="onGridReady"-->
      <!--  :gridOptions="gridOptions"-->
      <!--  :columnDefs="columnDefs"-->
      <!--  :rowData="tableData"-->
      <!--  :loading="tableLoading"-->
      <!--&gt;</ag-table-component>-->
      <datablau-table
        :data="tableData"
        :loading="tableLoading"
        height="100%"
        ref="codeTable"
        @sort-change="handleSortChange"
      >
        <el-table-column
          min-width="120"
          :label="$t('domain.code.codeValueCode')"
          prop="value"
          sortable="custom"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('domain.code.cName')"
          sortable="custom"
          prop="name"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('domain.code.order')"
          sortable="custom"
          prop="order"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('domain.code.remark1')"
          sortable="custom"
          prop="definition"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('domain.code.remark2')"
          sortable="custom"
          prop="definition2"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('domain.code.remark3')"
          sortable="custom"
          prop="definition3"
          show-overflow-tooltip
        >
        </el-table-column>
      </datablau-table>
    </div>
    <div class="bottom-line dialog-bottom">
      <datablau-pagination
        style="float: left"
        class="ddc-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
      <datablau-button @click="closeDialog" style="float: right">
        {{ $t('domain.common.close') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import agTableComponent from '@/components/common/agTableComponent'
import paginationMixin from "@/components/common/mixin/paginationMixin";

export default {
  components: {agTableComponent},
  data() {
    return {
      name: '',
      gridApi: null,
      columnApi: null,
      gridOptions: {
        rowSelection: false,
      },
      tableLoading: false,
      columnDefs: null,
      tableData: null,
    }
  },
  props: ['code', 'categoryId'],
  mixins: [paginationMixin],
  beforeMount() {
    // this.columnDefs = [
    //   {
    //     headerName: this.$t('domain.code.codeValueCode'),
    //     field: 'value',
    //     sortable: true,
    //     filter: true,
    //     tooltipField: 'value',
    //   },
    //   {
    //     headerName: this.$t('domain.code.cName'),
    //     field: 'name',
    //     sortable: true,
    //     filter: true,
    //     tooltipField: 'name',
    //   },
    //   {
    //     headerName: this.$t('domain.code.order'),
    //     field: 'order',
    //     sortable: true,
    //     filter: true,
    //     tooltipField: 'order',
    //   },
    //   {
    //     headerName: this.$t('domain.code.remark1'),
    //     field: 'definition',
    //     sortable: true,
    //     filter: true,
    //     tooltipField: 'definition',
    //   },
    //   {
    //     headerName: this.$t('domain.code.remark2'),
    //     field: 'definition2',
    //     sortable: true,
    //     filter: true,
    //     tooltipField: 'definition2',
    //   },
    //   {
    //     headerName: this.$t('domain.code.remark3'),
    //     field: 'definition3',
    //     sortable: true,
    //     filter: true,
    //     tooltipField: 'definition3',
    //   },
    // ]
  },
  mounted() {
    this.getCodeTable()
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    getCodeTable() {
      HTTP.getCodeContent({
        codeNumber: this.code,
        categoryId: this.categoryId > 4 ? '' : this.categoryId,
      })
        .then(res => {
          // let arr = []
          // for (let i = 0; i < 50; i++) {
          //   arr.push(...res.data.values)
          // }
          // // this.tableData = res.data.values
          this.allData = res.data.values
          this.name = res.data.name

          this.getDataFromAll()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData() {
      this.getDataFromAll()
    },
    handleUploadSuccess() {
      this.$message.success(this.$t('domain.common.uploadSuccessful'))
      // this.getCodes()
    },
    // onGridReady(params) {
    //   this.gridApi = params.api
    //   this.columnApi = params.columnApi
    //   this.initAgGrid()
    //   //        this.setTableHeight();
    // },
    // initAgGrid() {
    //   this.$refs.codeTable.sizeColumnsToFit()
    // },
  },
}
</script>

<style lang="scss" scoped>
.details {
  .detail {
    display: inline;
    margin-right: 50px;
  }
}

.table-box {
  margin-top: 10px;
  height: 420px;
  overflow: auto;
}
</style>
