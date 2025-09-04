<template>
  <div>
    <div class="table-box">
      <ag-table-component
        ref="codeTable"
        @grid-ready="onGridReady"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="tableData"
        :loading="tableLoading"
        :frameworkComponents="frameworkComponents"
      ></ag-table-component>
    </div>
  </div>
</template>

<script>
import agTableComponent from '@/components/common/agTableComponent'
import MyScanRenderer from './favouriteScanRenderer.js'
export default {
  components: { agTableComponent },
  data() {
    return {
      name: '',
      gridApi: null,
      columnApi: null,
      frameworkComponents: null,
      gridOptions: {
        rowSelection: false,
        domLayout: 'autoHeight',
      },
      tableLoading: false,
      columnDefs: null,
      tableData: null,
      columnTypesMap: {
        Dim: '维度',
        Index: '指标',
        Other: '普通',
      },
    }
  },
  props: {
    getData: {
      type: Function,
      required: true,
    },
    indexMap: {
      type: Object,
      required: true,
    },
    dimMap: {
      type: Object,
      required: true,
    },
  },
  beforeMount() {
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
    this.columnDefs = [
      {
        headerName: '列名/查询项',
        field: 'label',
        // sortable: true,
        // filter: true,
        tooltipField: 'label',
      },
      {
        headerName: '说明',
        field: 'description',
        // sortable: true,
        // filter: true,
        tooltipField: 'description',
      },
      {
        headerName: '数据类型',
        field: 'datatype',
        // sortable: true,
        // filter: true,
        tooltipField: 'datatype',
      },
      {
        headerName: '子报表名称',
        field: 'category',
        // sortable: true,
        // filter: true,
        tooltipField: 'category',
      },
      {
        headerName: '关联类型',
        field: 'type',
        valueFormatter: params => {
          return this.columnTypesMap[params.value] || params.value
        },
        // sortable: true,
        // filter: true,
        tooltip: params => {
          return this.columnTypesMap[params.value]
        },
      },
      {
        headerName: '关联的维度/指标',
        field: 'code',
        valueFormatter: this.getRefer,
        // sortable: true,
        // filter: true,
        tooltip: this.getRefer,
        cellRenderer: 'MyScanRenderer',
      },
    ]
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    getTableData() {
      this.getData()
        .then(data => {
          // console.log(data, 'data')
          const result = []
          if (data.type === 'Analysis') {
            // w维度
            const conditionArea = data.conditionArea
            if (conditionArea && Array.isArray(conditionArea)) {
              conditionArea.forEach(item => {
                const obj = {
                  label: item.label,
                  type: 'Dim',
                  id: result.length + 1,
                  description: item.description,
                  code: item.code,
                  dimData: null,
                }
                this.$http
                  .get(`${this.$url}/service/me/dims/catalogs/${obj.code}/dims`)
                  .then(res => {
                    obj.dimData = res.data || []
                  })
                  .catch(e => {
                    // this.$showFailure(e);
                    console.log(e)
                  })
                result.push(obj)
              })
            }
            const resultArea = data.resultArea
            if (resultArea && Array.isArray(resultArea)) {
              resultArea.forEach(item => {
                const obj = {
                  label: item.columnName,
                  type: item.type,
                  id: result.length + 1,
                  description: item.description,
                  code: item.code,
                }
                result.push(obj)
              })
            }
          } else {
            const conditionArea = data.conditionArea
            if (conditionArea && Array.isArray(conditionArea)) {
              // 维度
              conditionArea.forEach(item => {
                const obj = {
                  label: item.label,
                  type: 'Dim',
                  id: item.id,
                  description: item.description,
                  code: item.code,
                  dimData: null,
                }
                this.$http
                  .get(`${this.$url}/service/me/dims/catalogs/${obj.code}/dims`)
                  .then(res => {
                    obj.dimData = res.data || []
                  })
                  .catch(e => {
                    // this.$showFailure(e);
                    console.log(e)
                  })
                result.push(obj)
              })
            }
            const resultArea = data.resultArea
            if (resultArea && Array.isArray(resultArea)) {
              resultArea.forEach(item => {
                let obj = {}
                if (item.type === 'Lat') {
                  obj = {
                    label: item.columnName,
                    type: 'Dim',
                    id: result.length + 1,
                    description: item.description,
                    code: item.code,
                    dimData: null,
                    datatype: item.datatype,
                    category: item.category,
                  }
                  this.$http
                    .get(
                      `${this.$url}/service/me/dims/catalogs/${obj.code}/dims`
                    )
                    .then(res => {
                      obj.dimData = res.data || []
                    })
                    .catch(e => {
                      // this.$showFailure(e);
                      console.log(e)
                    })
                } else if (item.type === 'Index' || item.type === 'Other') {
                  obj = {
                    label: item.columnName,
                    type: item.type,
                    id: result.length + 1,
                    description: item.description,
                    code: item.code,
                    datatype: item.datatype,
                    category: item.category,
                  }
                } else {
                  obj = {
                    label: item.columnName,
                    type: item.type,
                    id: result.length + 1,
                    description: item.description,
                    code: item.code,
                    datatype: item.datatype,
                    category: item.category,
                  }
                }
                result.push(obj)
              })
            }
          }
          this.tableData = result
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
    getRefer(params) {
      // console.log(params, 'params')
      let result = ''
      const data = params.data
      if (data.type === 'Index') {
        result = this.indexMap[data.code] ? this.indexMap[data.code].name : ''
      } else if (data.type === 'Dim') {
        result = this.dimMap[data.code] ? this.dimMap[data.code].catalog : ''
      }
      return result || ''
    },
  },
  watch: {
    indexMap: {
      immediate: true,
      deep: true,
      handler: function (newVal) {
        this.gridApi &&
          this.gridApi.refreshCells({
            force: true,
            columns: ['code'],
          })
      },
    },
    dimMap: {
      immediate: true,
      deep: true,
      handler: function (newVal) {
        this.gridApi &&
          this.gridApi.refreshCells({
            force: true,
            columns: ['code'],
          })
      },
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
  margin-bottom: 20px;
}
</style>
