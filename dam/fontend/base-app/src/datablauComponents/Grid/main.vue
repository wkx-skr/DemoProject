<template>
  <div>
    <ag-grid-vue
      style="height: 200px"
      class="ag-theme-balham"
      :rowData="rowData"
      rowSelection="multiple"
      @grid-ready="onGridReady"
      :frameworkComponents="frameworkComponents"
      enableBrowserTooltips
    >
      <ag-grid-column
        checkboxSelection
        headerCheckboxSelection
        :width="40"
      ></ag-grid-column>
      <ag-grid-column
        headerName="Make"
        field="make"
        sortable
        filter
        :width="100"
        cellRenderer="cellRenderer"
        tooltipComponent="customTooltip"
        tooltipField="make"
        :tooltipComponentParams="{ color: '#ececec' }"
      ></ag-grid-column>
      <ag-grid-column
        headerName="Model"
        field="model"
        sortable
        filter
        :width="100"
      ></ag-grid-column>
      <ag-grid-column
        headerName="价格"
        field="price"
        sortable
        filter
        :minWidth="100"
      ></ag-grid-column>
      <ag-grid-column
        headerName="日期"
        field="date"
        sortable
        filter
      ></ag-grid-column>
      <ag-grid-column
        headerName="操作"
        cellRenderer="operationRenderer"
        :width="60"
      ></ag-grid-column>
    </ag-grid-vue>
    <button @click="getSelectedRows()">Get Selected Rows</button>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped></style>
