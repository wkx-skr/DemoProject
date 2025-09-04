<template>
  <div>
    <div class="details">
      <div class="detail">代码编号 : {{ code }}</div>
      <div class="detail">代码名称 : {{ name }}</div>
    </div>
    <div class="table-box">
      <ag-table-component
        ref="codeTable"
        @grid-ready="onGridReady"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="tableData"
        :loading="tableLoading"
      ></ag-table-component>
      <!--<el-table
				:data="tableData"
				border
				>
				<el-table-column label="编码取值" prop="value"></el-table-column>
				<el-table-column label="编码名称" prop="name"></el-table-column>
				<el-table-column label="编码含义" prop="definition"></el-table-column>
				</el-table>-->
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import agTableComponent from '@/components/common/agTableComponent'
export default {
  components: { agTableComponent },
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
  props: ['code'],
  beforeMount() {
    this.columnDefs = [
      {
        headerName: '编码取值',
        field: 'value',
        sortable: true,
        filter: true,
        tooltipField: 'value',
      },
      {
        headerName: '编码名称',
        field: 'name',
        sortable: true,
        filter: true,
        tooltipField: 'name',
      },
      {
        headerName: '编码含义',
        field: 'definition',
        sortable: true,
        filter: true,
        tooltipField: 'definition',
      },
    ]
  },
  mounted() {
    this.getCodeTable()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    getCodeTable() {
      HTTP.getCodeContent({codeNumber: this.code})
        .then(res => {
          this.tableData = res.data.values
          this.name = res.data.name
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleUploadSuccess() {
      this.$message.success('上传成功')
      this.getCodes()
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
      //        this.setTableHeight();
    },
    initAgGrid() {
      this.$refs.codeTable.sizeColumnsToFit()
    },
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
  height: 400px;
  overflow: auto;
}
</style>
