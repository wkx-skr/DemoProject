<template>
  <div>
    <datablau-tab-with-table
      class="table-tab-container"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="true"
      :hideBottomLine="true"
      :tableOption="tableOption"
      :tableHidePagination="true"
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
      tableOption: {
        rowSelection: 'single',
      },
    }
  },
  props: {
    getData: {
      type: Promise,
      required: true,
    },
  },
  components: {},
  computed: {},
  beforeMount() {
    const getModelcatalogName = para => {
      const catalogname = this.$modelCategoriesMap[para.value]
      return catalogname || ''
    }
    const getColRate = para => {
      console.log(para, 'para')
      const totalCol = para.data.totalCol
      if (totalCol) {
        const result = parseInt((para.value / totalCol) * 100) + '%'
        return result || '0%'
      } else {
        return '0%'
      }
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '系统名称',
        field: 'modelCategoryId',
        valueFormatter: getModelcatalogName,
        // tooltipField: 'timestamp',
        width: 150,
      },
      {
        headerName: '表数量',
        field: 'totalTable',
        tooltipField: 'totalTable',
        width: 150,
      },
      {
        headerName: '字段数量',
        field: 'totalCol',
        tooltipField: 'totalCol',
        width: 150,
      },
      {
        headerName: '数据充足率',
        field: 'colWithAlias',
        valueFormatter: getColRate,
        tooltipField: 'colWithAlias',
        width: 150,
      },
      {
        headerName: '标准覆盖率',
        field: 'colWithDomain',
        valueFormatter: getColRate,
        tooltipField: 'colWithDomain',
        width: 150,
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {},
  methods: {
    getShowData(para) {
      return new Promise((resolve, reject) => {
        this.getData
          .then(res => {
            const data = res.data
            resolve(data)
          })
          .catch(e => {
            console.log(e)
          })
      })
    },
    gridSelectionChanged() {},
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
