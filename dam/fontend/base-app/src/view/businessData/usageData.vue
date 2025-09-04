<template>
  <div
    class="usage-table"
    :class="{ 'table-add-min-height': !tableHidePagination }"
  >
    <datablau-tab-with-table
      class="table-tab-container"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="tableHidePagination"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      @gridSelectionChanged="gridSelectionChanged"
    ></datablau-tab-with-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalShow: 0,
      columnDefs: null,
      hideTopLine: true,
      // showBottom: false,
      tableHidePagination: false,
      tableOption: {},
      selections: [],
    }
  },
  props: {
    objData: {
      type: Object,
      required: true,
    },
  },
  components: {},
  beforeMount() {
    const tableOption = {
      rowSelection: 'single',
    }
    this.tableOption = tableOption
    const columnDefs = [
      {
        // type: ['selectionCheckboxColumn'],
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '模型路径',
        field: 'modelPath',
        tooltipField: 'modelPath',
        width: 150,
      },
      {
        headerName: '模型名称',
        field: 'modelName',
        tooltipField: 'modelName',
        width: 150,
      },
      {
        headerName: '模型分支',
        field: 'modelBranch',
        tooltipField: 'modelBranch',
        width: 150,
      },
      {
        headerName: '表英文名',
        field: 'tableName',
        tooltipField: 'tableName',
        width: 150,
      },
      {
        headerName: '表中文名',
        field: 'tableAlias',
        tooltipField: 'tableAlias',
        width: 150,
      },
      {
        headerName: '列英文名',
        field: 'columnName',
        tooltipField: 'columnName',
        width: 150,
      },
      {
        headerName: '列中文名',
        field: 'columnAlias',
        tooltipField: 'columnAlias',
        width: 150,
      },
      {
        headerName: '模型负责人',
        field: 'modelOwner',
        tooltipField: 'modelOwner',
        width: 150,
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted() {},
  methods: {
    getShowData(para) {
      const objectId = this.objData.objId
      const s = para.pageSize || 20
      const c = para.currentPage || 1
      const url = `${
        this.$url
      }/service/busiObjects/objects/${objectId}/ddm/usage?currentPage=${
        c - 1
      }&pageSize=${s}`
      return new Promise((resolve, reject) => {
        this.$http
          .get(url)
          .then(res => {
            let data = []
            if (true) {
              const resdata = res.data
              this.totalShow = resdata.totalItems
              data = resdata.items
            } else {
              const count = parseInt(Math.random() * 40)
              this.totalShow = count
              for (let i = 0; i < count; i++) {
                const obj = {
                  modelPath: 'modelPath' + i,
                  modelName: 'modelName' + i,
                  modelBranch: 'modelBranch' + i,
                  tableName: 'tableName' + i,
                  tableAlias: 'tableAlias' + i,
                  columnName: 'columnName' + i,
                  columnAlias: 'columnAlias' + i,
                  modelOwner: 'modelOwner' + i,
                }
                data.push(obj)
              }
            }
            // if (this.totalShow < 20) {
            //   this.tableHidePagination = true;
            // } else {
            //   this.tableHidePagination = false;
            // }
            resolve(data)
          })
          .catch(e => {
            reject(e)
            this.$showFailure(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      const selections = api.getSelectedRows()

      this.selections = selections
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.usage-table {
  position: relative;
  &.table-add-min-height {
    min-height: 600px;
    // overflow: auto;
  }
}
</style>
