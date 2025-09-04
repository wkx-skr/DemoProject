<template>
  <div>
    <div class="details">
      <div class="detail">
        {{ $t('domain.code.codePropCode') }} : {{ code }}
      </div>
      <div class="detail">{{ $t('domain.code.codeName') }} : {{ name }}</div>
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
  props: ['code', 'categoryId'],
  beforeMount() {
    this.columnDefs = [
      {
        headerName: this.$t('domain.code.codeValueCode'),
        field: 'value',
        sortable: true,
        filter: true,
        tooltipField: 'value',
      },
      {
        headerName: this.$t('domain.code.cName'),
        field: 'name',
        sortable: true,
        filter: true,
        tooltipField: 'name',
      },
      {
        headerName: this.$t('domain.code.order'),
        field: 'order',
        sortable: true,
        filter: true,
        tooltipField: 'order',
      },
      {
        headerName: this.$t('domain.code.remark1'),
        field: 'definition',
        sortable: true,
        filter: true,
        tooltipField: 'definition',
      },
      {
        headerName: this.$t('domain.code.remark2'),
        field: 'definition2',
        sortable: true,
        filter: true,
        tooltipField: 'definition2',
      },
      {
        headerName: this.$t('domain.code.remark3'),
        field: 'definition3',
        sortable: true,
        filter: true,
        tooltipField: 'definition3',
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
      HTTP.getCodeContent({
        codeNumber: this.code,
        categoryId: this.categoryId > 4 ? '' : this.categoryId,
      })
        .then(res => {
          this.tableData = res.data.values
          this.name = res.data.name
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleUploadSuccess() {
      this.$message.success(this.$t('domain.common.uploadSuccessful'))
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
