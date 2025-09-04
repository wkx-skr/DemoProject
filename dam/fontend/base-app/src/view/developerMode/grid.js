export default {
  data() {
    return {
      rowData: null,
      columnDefs: null,
      gridStyle: 'width:600px;height:200px;',
      gridClass: 'ag-theme-balham',
      rowSelection: 'multiple',
      conf: {
        rowData: null,
        columnDefs: null,
      },
    }
  },
  methods: {
    draw() {
      this.columnDefs = JSON.parse(this.conf.columnDefs)
      this.rowData = JSON.parse(this.conf.rowData)
    },
  },

  beforeMount() {
    this.conf.rowData = JSON.stringify([
      { make: 'Toyota', model: 'Celica', price: 35000 },
      { make: 'Ford', model: 'Mondeo', price: 32000 },
      { make: 'Porsche', model: 'Boxter', price: 72000 },
    ])
    this.conf.columnDefs = JSON.stringify([
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 40,
      },
      {
        headerName: 'Make1',
        field: 'make',
        sortable: true,
        filter: true,
        cellRenderer: param => {
          return '1' + '2'
        },
      },
      { headerName: 'Model', field: 'model', sortable: true },
      //      {headerName: '价格', field: 'price',sortable:true}
    ])
  },
  mounted() {
    //      console.log('mounted');
    this.draw()
  },
}
