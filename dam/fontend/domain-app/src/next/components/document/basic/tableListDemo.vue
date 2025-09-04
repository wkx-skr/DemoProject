<template>
  <div class="tablelist-demo">
    <datablau-eltable
      class="table-tab-container"
      ref="domainList"
      :hideDefaultFilter="false"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    ></datablau-eltable>
  </div>
</template>
<script>
const tableData = [
  {
    id: 1,
    abbreviation: 'H-M-CI-ADDRESS',
    chineseName: '地址信息表',
    submitter: '潘广宗等4人',
  },
  {
    id: 2,
    abbreviation: 'BAT_BATCH_STAGE_CONFIG',
    chineseName: '批次任务表',
    submitter: '潘广宗、刘丹丹等',
  },
]
export default {
  data() {
    return {
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
    }
  },
  beforeMount() {
    const columnDefs = [
      {
        headerName: '中文名称',
        field: 'chineseName',
        tooltipField: 'chineseName',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '英文名称',
        field: 'abbreviation',
        tooltipField: 'abbreviation',
        minWidth: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },

      {
        headerName: '所有者',
        field: 'submitter',
        tooltipField: 'submitter',
        minWidth: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },

      {
        headerName: '操作',
        minWidth: 100,
        headerAlign: 'center',
        align: 'center',
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // {name: 'edit', text: '编辑', method: 'showEditDialog'},
            // {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
            { name: 'edit', text: '查看', method: 'checkDomain' },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  methods: {
    getShowData() {
      return new Promise((resolve, reject) => {
        const s = this.defaultParaData.pageSize
        const c = this.defaultParaData.currentPage
        // if (tableData && Array.isArray(tableData)) {
        //   tableData = tableData.slice(s * (c - 1), s * c)
        // }
        resolve(tableData)
      })
    },
  },
}
</script>
<style lang="scss" scoped></style>
