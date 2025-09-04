<template>
  <div>
    <ag-table
      ref="agTreeTable"
      @grid-ready="onGridReady"
      @cellClicked="cellClicked"
      @selectionChanged="gridSelectionChanged"
      :gridOptions="gridOptions"
      :columnDefs="columnDefs"
      :rowData="tableData"
      :loading="tableLoading"
    ></ag-table>
  </div>
</template>

<script>
import agTable from '@/components/common/agTableComponent.vue'
export default {
  data() {
    return {
      tableData: {},
      tableLoading: false,
      columnDefsResult: null,
    }
  },
  props: {
    gridOptions: {
      type: Object,
      default() {
        return {}
      },
    },
    columnDefs: {
      type: Array,
      reuqired: true,
    },
  },
  components: {
    agTable,
  },
  computed: {
    gridOptionsResult() {
      const result = _.assign({}, this.defaultTableOption, this.gridOptions)
      return result
    },
  },
  beforeMount() {
    const result = []
    // this.columnDefs.map(() => {});
    this.columnDefsResult = result
  },
  mounted() {},
  methods: {
    onGridReady() {},
    cellClicked() {},
    gridSelectionChanged() {},
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
