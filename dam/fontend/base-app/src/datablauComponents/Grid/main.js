import { AgGridVue } from 'ag-grid-vue'
import cellRenderer from './cellRenderer.js'
import operationRenderer from './operationRenderer.js'
import customTooltip from './customTooltip.js'
export default {
  name: 'Grid',
  components: {
    AgGridVue,
  },
  props: {
    //    rowData:Array,
    //    columnDefs:Array,
    //    gridStyle:String,  //grid的外部样式
    //    gridClass:String,
  },
  data() {
    return {
      frameworkComponents: null,
    }
  },
  beforeMount() {
    //    this.rowData= null;
    //    return;
    this.rowData = [
      { make: 'Toyota', model: 'Celica', price: 35000, date: 1554970222100 },
      { make: 'Ford', model: 'Mondeo', price: 32000, date: 1554970212100 },
      { make: 'Porsche', model: 'Boxter', price: 72000, date: 1554960222100 },
    ]
    this.frameworkComponents = {
      cellRenderer: cellRenderer,
      operationRenderer: operationRenderer,
      customTooltip: customTooltip,
    }
  },
  mounted() {},
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
    },
    getSelectedRows() {
      const selectedNodes = this.gridApi.getSelectedNodes()
      const selectedData = selectedNodes.map(node => node.data)
      const selectedDataStringPresentation = selectedData
        .map(node => node.make + ' ' + node.model)
        .join(', ')
      console.log(`Selected nodes: ${selectedDataStringPresentation}`)
    },
  },
}
