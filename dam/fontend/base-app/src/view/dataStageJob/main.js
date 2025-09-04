import agTableComponent from '@/components/common/agTableComponent'
import MyScanRenderer from './MyScanRenderer'

export default {
  components: {
    agTableComponent,
  },
  data() {
    this.FieldTypeTranslator = {
      SQL_TEXT: '数据源查询sql',
      SRC_HASH_FILE: '源哈希文件路径',
      TARGET_TABLE_NAME: '目标表',
      TARGET_HASH_FILE: '目标哈希文件路径',
      EXEC_DOS_LIST: 'EXEC_DOS_LIST',
      JOB_NAMES: '使用到的job',
      EXEC_COMMANDS: 'cmd',
      SENDER_ADDRESS: '发送邮件地址',
      RECIPIENT_ADDRESS: '接收邮件地址',
      WAIT_FILES: 'WAIT_FILES',
    }
    return {
      gridApi: null,
      columnApi: null,
      dialogVisible: false,
      currentData: null,
      requestBody: {
        annotation: null,
        jobName: null,
        fieldName: null,
        stageName: null,
        pageSize: 999,
        jobType: null,
        currentPage: 0,
        fieldType: null,
        value: null,
        keyword: null,
      },
      frameworkComponents: null,
      columnDefs: null,
      defaultColDef: null,
      getRowHeight: null,
      tableData: [
        {
          //        annotations: "liuys@20171115\n\r合并财汇一般企业和金融类企业资产负债表",
          //        category: "\\作业\\CDW\\T31\\CH",
          fieldName: 'CDWDG.T31_CH_BALANCE_SHEET_ALL',
          fieldStageName: 'CDW_T31_CH_BALANCE_SHEET_ALL',
          fieldType: 'TARGET_TABLE_NAME',
          fieldValues:
            'Org_Cd↵Report_Term↵Public_Date↵Report_Type↵EQUITY_TOT↵ETL_DATE',
          importTimestamp: 1560503224702,
          jobFileHashValue: '7fc6aea640253a683fa37dd6a0938977',
          jobName: 'tmptestP_CDW_T31_CH_BALANCE_SHEET_ALL',
          jobType: 'JOB',
          uuid: '5553a71514a54c7fa131126ce1a9d6e9',
        },
      ],
      tableLoading: false,
      gridOptions: {
        rowSelection: false,
        enableCellTextSelection: true,
      },
      pro: false,
    }
  },
  beforeMount() {
    const cellStyle = {}
    this.defaultColDef = {}
    this.getRowHeight = param => {
      return 40
    }
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
    this.columnDefs = [
      /* {
        checkboxSelection: true,
        width: 50,
        resizable: false,
        suppressSizeToFit: true,
        headerCheckboxSelection: true
      }, */
      {
        headerName: 'job名称',
        field: 'jobName',
        sortable: true,
        filter: true,
        tooltipField: 'jobName',
        minWidth: 260,
      },
      {
        headerName: 'Stage类型',
        field: 'jobType',
        minWidth: 80,
        cellRenderer: params => {
          if (params.value === 'JOB') {
            return '<div style="display:inline-block;height:24px;border-radius:2px;line-height:24px;margin-top:7px;padding:0px 8px;background-color:#29a7ca;color:#F1F5F8;">任务</div>'
          } else if (params.value.toUpperCase().includes('SEQ')) {
            return '<div style="display:inline-block;height:24px;border-radius:2px;line-height:24px;margin-top:7px;padding:0px 8px;background-color:#8c5dff;color:#F1F5F8;">序列</div>'
          } else {
            return params.value
          }
        },
      },
      {
        headerName: '数据项类型',
        field: 'fieldType',
        sortable: true,
        filter: true,
        minWidth: 180,
        valueFormatter: value => this.FieldTypeTranslator[value.value],
        //        tooltipField: 'fieldType'
      },
      {
        headerName: '字段',
        field: 'fieldValues',
        sortable: true,
        filter: true,
        tooltipField: 'fieldValues',
        cellRenderer: params => {
          return '<span>' + this.$utils.string.nl2br(params.value) + '</span>'
          if (params.value) {
            return params.value.replace(/\n/g, ',')
          } else {
            return ''
          }
        },
        minWidth: 150,
      },
      {
        headerName: 'Stage名称',
        field: 'fieldStageName',
        tooltipField: 'fieldStageName',
        sortable: true,
        filter: true,
        minWidth: 150,
        //        cellStyle: { "white-space": "normal" },
      },
      {
        headerName: '数据项值',
        field: 'originalFieldName',
        sortable: true,
        filter: true,
        minWidth: 150,
        tooltipField: 'originalFieldName',
      },
      {
        headerName: '路径',
        field: 'category',
        sortable: true,
        filter: true,
        tooltipField: 'category',
        minWidth: 150,
      },
      {
        resizable: true,
        headerName: '导入时间',
        field: 'importTimestamp',
        sortable: true,
        filter: true,
        //        tooltipField: 'importTimestamp',
        cellRenderer: params => {
          return this.$timeFormatter(params.value)
        },
        minWidth: 150,
      },
      {
        resizable: true,
        headerName: '注释',
        field: 'annotations',
        sortable: true,
        filter: true,
        tooltipField: 'annotations',
        cellRenderer: params => {
          return '<span>' + this.$utils.string.nl2br(params.value) + '</span>'
        },
        minWidth: 150,
      },
      {
        resizable: true,
        headerName: '操作',
        minWidth: 70,
        maxWidth: 70,
        cellRenderer: 'MyScanRenderer',
        pinned: 'right',
      },
    ]
  },
  mounted() {
    this.getData()
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      this.$refs.columnsTable.sizeColumnsToFit()
    },
    getData() {
      this.tableLoading = true
      let body = {
        /* annotation : null,
        jobName : null,
        fieldName : 'select' */
        stageName: 'CDW',
        jobType: 'JOB',
        //        fieldType : 'SQL_TEXT',
        pageSize: 999,
        currentPage: 0,

        //        value : null
      }
      body = _.clone(this.requestBody)
      if (this.pro) {
        delete body.keyword
      } else {
        body = {
          keyword: this.requestBody.keyword || '',
        }
      }

      const url = this.$url + '/service/lineage/queryDataStageJob'
      const tableData = []
      /* this.$http.post(url,body).then(res=>{
        if(res.data.hits && Array.isArray(res.data.hits.hits)){
          res.data.hits.hits.forEach(hit=>{
            if(hit._source.fieldValues){
              hit._source.fieldValues = hit._source.fieldValues.replace(/\r\n/g,',');
            }
            if(!hit._source.originalFieldName){
              hit._source.originalFieldName = hit._source.fieldName;
            }
            tableData.push(hit._source);
          });
        }
        this.tableData = tableData;
      }).catch(e=>{
        this.$showFailure(e);
      }).then(()=>{
        this.tableLoading = false;
      }); */
      this.tableLoading = false
    },
    scan(params) {
      this.currentData = params.data
      this.dialogVisible = true
    },
  },
}
