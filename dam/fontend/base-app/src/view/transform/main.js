import moment from 'moment'
import saveAs from './FileSaver'
import columnar from './columnar.vue'
import addStep from './addStep.vue'
import recipeList from './recipe.vue'
import suggestion from './suggestion.vue'
import { AgGridVue } from 'ag-grid-vue'
import CustomHeader from './customHeader.js'
import axios from 'axios'
import base32 from 'hi-base32'
export default {
  props: {},
  components: {
    columnar,
    addStep,
    recipeList,
    suggestion,
    AgGridVue,
  },
  data() {
    return {
      fullHeader: [],
      fullHeaderMap: new Map(),
      fullData: [],
      columnMap: {},
      key: 0,
      selectedColumns: new Map(),
      currentSide: 'recipe',
      sugKey: 0,
      schema: null,
      actions: [],
      showTable: true,

      gridOptions: null,
      gridApi: null,
      columnApi: null,
      columnDefs: null,
      frameworkComponents: null,
      defaultColDef: null,
      rowData: null,
      moveTmp: null,
    }
  },
  beforeMount() {
    this.prepareAgGrid()
    this.$bus.$on('enforceStep', setting => {
      this.selectedColumns.clear()
      this.chalkSelectedColumns()
      // this.rowData  = [];
      this.gridApi.showLoadingOverlay()
      this.fullHeader.forEach(item => {
        item.class = ''
      })
      this.currentSide = 'recipe'
      if (setting.stepType === 'return') {
        this.gridApi.hideOverlay()
      } else if (setting.stepType === 'drop') {
        if (setting.single) {
          this.actions.push({
            '@class': 'com.datablau.etl.action.condition.DeleteColumnCondition',
            columnIndexes: [setting.column.index],
          })
          this.getTable()
        } else {
        }
      } else if (setting.stepType === 'rename') {
        if (setting.single) {
          this.actions.push({
            '@class': 'com.datablau.etl.action.condition.RenameCondition',
            col: setting.column.index,
            columnName: setting.columnName,
            newColumnName: setting.newColumnName,
          })
          this.getTable()
        }
      } else if (setting.stepType === 'split') {
        this.actions.push({
          '@class': setting['@class'],
          col: setting.col,
          columnName: setting.columnName,
          seperators: setting.separators,
          maxSplittedNumber: setting.separateNames.length,
          newColumnNames: setting.separateNames,
          timeFormat: setting.timeFormat,
        })
        this.getTable()
      } else if (setting.stepType === 'retain') {
        this.actions.push(setting.data)
        this.getTable()
      } else {
        this.actions.push(setting)
        this.getTable()
      }
    })
  },
  mounted() {
    this.gridApi = this.gridOptions.api
    this.columnApi = this.gridOptions.columnApi
    setTimeout(() => {
      this.getTable()
    })
    $('.ag-layout-normal').on('scroll', () => {
      this.chalkSelectedColumns()
    })
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resize)
    this.$bus.$off('enforceStep')
  },
  methods: {
    onGridReady() {},
    onCellClicked({ column, event }) {
      this.handleColumnClick(column.colDef, event)
    },
    onDragStarted() {},
    onDragStopped() {
      const { column, toIndex } = this.moveTmp
      this.$bus.$emit('enforceStep', {
        '@class': 'com.datablau.etl.action.condition.ChangeIndexCondition',
        col: column.colDef.index,
        columnName: column.colDef.label,
        moveToIndex: toIndex,
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Move Column </em> <ins>${column.colDef.label}</ins> To Index ${toIndex}`
      )
    },
    onColumnMoved({ column, toIndex }) {
      this.moveTmp = {
        column: column,
        toIndex: toIndex,
      }
    },
    prepareAgGrid() {
      this.gridOptions = {
        headerHeight: 135,
        onCellClicked: this.onCellClicked,
        onColumnMoved: this.onColumnMoved,
        onDragStarted: this.onDragStarted,
        onDragStopped: this.onDragStopped,
      }

      this.frameworkComponents = { agColumnHeader: CustomHeader }
      this.defaultColDef = {
        width: 200,
        headerComponentParams: { menuIcon: 'fa-bars' },
        sortable: true,
        resizable: true,
        filter: true,
        valueFormatter: this.valueFormatter,
      }
    },
    redo() {},
    undo() {
      this.$refs.recipe.recipes.pop()
      this.actions.pop()
      this.getTable()
    },
    getTable() {
      const headers = {
        locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
      }
      const headerName = window.localStorage.login_name
      headers[headerName] = window.localStorage.login_csrf
      const instance = axios.create({
        responseType: 'arraybuffer',
        headers: headers,
      })
      instance
        .post(this.$url + '/service/etl/transforms/output', {
          actions: this.actions,
          source: {
            sql: 'select * from ' + this.$route.query.tableName,
            modelId: this.$route.query.modelId,
          },
          target: {
            name: 'target',
          },
          type: 'ETL',
        })
        .then(res => {
          this.avro(res.data)
        })
        .catch(e => {
          this.$message.error('数据加载失败或操作步骤无法执行')
          this.gridApi.hideOverlay()
        })
    },
    avro(buf) {
      const avro = require('avsc')
      /** Create a stream of decoded values from a container file string. */
      const self = this
      function createStringDecoder(str, encoding) {
        var decoder = new avro.streams.BlockDecoder({
          parseHook: schema => {
            self.schema = schema
            schema.fields.forEach(s => {
              s.name = base32.decode(s.name.slice(1))
            })
            return avro.Type.forSchema(schema, { wrapUnions: true })
          },
        })
        decoder.readerSchema = 'String'
        decoder.end(new Buffer(str, encoding))
        return decoder
      }
      /** Gather all values into an array. */
      function gatherValues(str, encoding, cb) {
        const vals = []
        createStringDecoder(str, encoding)
          .on('data', function (val) {
            vals.push(val)
          })
          .on('end', function () {
            cb(null, vals)
          })
      }

      gatherValues(buf, 'binary', (err, vals) => {
        this.createFullData(vals)
      })
    },

    createFullData(values) {
      const fullData = []
      const fullHeader = []
      let index = 0
      const length = values.length
      this.schema.fields.forEach(item => {
        let t
        let physicalT
        item.type.forEach(type => {
          if (typeof type === 'object') {
            t = type.logicalType
            physicalT = type.type
          }
        })

        fullHeader.push({
          headerName: item.name,
          field: item.name,
          suppressMenu: true,
          sortable: true,
          label: item.name,
          logicalType: t,
          physicalType: physicalT,
          index: index++,
          // cellClass: 'selected-cell'
        })
      })
      this.columnDefs = fullHeader
      fullHeader.forEach(item => {
        this.fullHeaderMap.set(item.label, item)
        this.columnMap[item.label] = []
      })
      for (let i = 0; i < length; i++) {
        const value = values[i]
        const keys = Object.keys(value)
        const targetValue = {}
        keys.forEach(key => {
          if (value[key]) {
            targetValue[key] = value[key][Object.keys(value[key])[0]]
          } else {
            targetValue[key] = '<null>'
          }
        })
        fullData.push(targetValue)
        fullHeader.forEach(h => {
          if (value[h.label]) {
            this.columnMap[h.label].push(
              value[h.label][Object.keys(value[h.label])[0]]
            )
          } else {
            this.columnMap[h.label].push(value[h.label])
          }
        })
      }
      this.rowData = fullData
    },
    refresh() {
      this.getTable()
    },
    download() {
      const recipe = this.$refs.recipe.recipes
      let mobileCode = recipe.join('<br>')
      mobileCode = mobileCode.concat(
        '<style>ins {\n' +
          '      text-decoration: none;\n' +
          '    }\n' +
          '    em {\n' +
          '      font-weight: bold;\n' +
          '      font-style:initial;\n' +
          '    }</style>'
      )
      var downloadTextFile = function (mobileCode) {
        var file = new File([mobileCode], 'recipe.html', {
          type: 'text/plain;charset=utf-8',
        })
        saveAs.saveAs(file)
      }
      downloadTextFile(mobileCode)
    },
    handleCellClick(row, column, cell, event) {
      this.handleColumnClick(column, event)
    },

    chalkSelectedColumns() {
      setTimeout(() => {
        const columns = this.selectedColumns
        $('[col-id]').removeClass('selected-cell')
        columns.forEach(item => {
          $(`[col-id=${item.label}]`).addClass('selected-cell')
          $(`[col-id^=${item.label}_1]`).addClass('selected-cell')
        })
      })
    },
    handleColumnClick(col, event) {
      this.showTable = false
      const ctrlKey = event.ctrlKey && false
      if (ctrlKey) {
        if (this.selectedColumns.has(col.label)) {
          this.selectedColumns.delete(col.label)
        } else {
          this.selectedColumns.set(col.label, col)
        }
      } else {
        if (this.selectedColumns.has(col.label)) {
          this.selectedColumns.clear()
        } else {
          this.selectedColumns.clear()
          this.selectedColumns.set(col.label, col)
        }
      }
      if (this.selectedColumns.size > 0) {
        this.currentSide = 'suggestion'
        this.sugKey++
      } else {
        this.currentSide = 'recipe'
      }
      this.chalkSelectedColumns()

      /* this.columnDefs.forEach(item=>{
        if(item.label === col.label){
          if(item.cellClass === 'selected-cell'){
            item.cellClass = '';
          }else{
            item.cellClass = 'selected-cell'
          }
        }else if(!ctrlKey){
          item.cellClass = '';
        }

      }); */
      // this.key++;

      // let left = $('.el-table__body-wrapper').scrollLeft();
      // setTimeout(()=>{
      //   $('.el-table__body-wrapper').scrollLeft(left);
      //   this.showTable = true;
      // })
    },
    valueFormatter(param) {
      const cellValue = param.value
      const propertyName = param.colDef.field
      const logicalType = this.fullHeaderMap.get(propertyName).logicalType
      if (
        logicalType === 'Timestamp' ||
        logicalType === 'Time' ||
        logicalType === 'Date'
      ) {
        return this.$timeFormatter(cellValue)
      } else if (logicalType === 'Boolean') {
        if (cellValue === true) {
          return 'TRUE'
        } else if (cellValue === false) {
          return 'FALSE'
        }
      } else {
        return cellValue
      }
    },
    cellFormatter(row, column, cellValue, index) {
      const propertyName = column.property
      const logicalType = this.fullHeaderMap.get(propertyName).type
      if (
        logicalType === 'Timestamp' ||
        logicalType === 'Time' ||
        logicalType === 'Date'
      ) {
        return this.$timeFormatter(cellValue)
      } else if (logicalType === 'Boolean') {
        if (cellValue === true) {
          return 'TRUE'
        } else if (cellValue === false) {
          return 'FALSE'
        }
      } else {
        return cellValue
      }
    },
  },
  watch: {},
  computed: {},
}
