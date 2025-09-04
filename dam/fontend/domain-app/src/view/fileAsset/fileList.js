// import agTableComponent from '@/components/common/agTableComponent.vue'
// import {AgGridVue} from 'ag-grid-vue'
// import MyScanRenderer from './MyScanRenderer'

export default {
  props: ['listData', 'folderData'],
  components: {
    // agTableComponent,AgGridVue
  },
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      tableOption: {},
      defaultParaData: {
        currentPage: 0,
        pageSize: 20,
      },
      selection: [],

      // old
      frameworkComponents: null,
      gridOptions: {
        rowSelection: false,
        headerHeight: 50,
        rowStyle: {
          cursor: 'pointer',
        },
        onRowClicked: row => {
          this.$bus.$emit('goToDomain', row.data.dataServiceId)
        },
      },

      currentSortCondition: { column: 'lastModification', dir: 'desc' },
    }
  },
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      // {
      //   type: ['firstEmptyColumn'],
      // },
      {
        headerName: '',
        width: 20,
        type: ['iconCol'],
        cellRendererParams: {
          tabComponent: this,
          classStr: '',
          typeProp: 'fileType',
        },
      },
      {
        headerName: '文件名',
        field: 'name',
        tooltipField: 'name',
        width: 150,
        type: ['customSortCol'],
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'createTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '修改时间',
        field: 'lastModifyTime',
        // tooltipField: 'lastModifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '操作',
      //   width: 100,
      //   type: ['optionsWithContent'],
      //   cellRendererParams: {
      //     tabComponent: this,
      //     options: [
      //       // {name: 'edit', text: '编辑', method: 'showEditDialog'},
      //       {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
      //     ]
      //   },
      // }
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    // couldDeleteBatch() {
    //   let arr = this.selection;
    //   return arr && Array.isArray(arr) && arr.length>0;
    // }
  },
  mounted() {},
  methods: {
    getShowData(para) {
      return new Promise((resolve, reject) => {
        let path = _.cloneDeep(this.folderData.path)
        let url = ''
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        const keyword = para.keyword || ''
        if (!path || !Array.isArray(path)) {
          path = []
        } else {
          path.shift()
        }
        url = `${this.$url}/service/shareFile/folder?filePath=${path.join(
          '/'
        )}&currentPage=${currentPage}&pageSize=${pageSize}&fileName=${keyword}`

        this.$http
          .get(url)
          .then(res => {
            const data = res.data
            this.totalShow = data.totalItems
            const content = data.content
            if (content && Array.isArray(content)) {
              content.forEach(item => {
                item.fileType = this.$fileTypeFormatter(item.type)
              })
            }
            resolve(content)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },

    cellClicked(para) {
      // console.log(para, 'para')
      this.$emit('showFileDetail', para.data)
    },
    // old
    // *** tab with table ***
    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
      // console.log(this.selection, 'selection')
    },

    refreshTable() {
      if (this.$refs.synonymsTable && this.$refs.synonymsTable.refreshData) {
        this.$refs.synonymsTable.refreshData()
      }
    },
    // deleteItem(para, callback) {
    //   let id = para.id;
    //   let url = `${this.$url}/service/synonym/?id=${id}`;

    //   this.$http.delete(url)
    //   .then(res => {
    //     this.$message.success('删除成功');
    //     this.refreshTable();
    //   })
    //   .catch(e => {
    //     this.$showFailure(e);
    //   });
    // },

    // async delete  synonyms item
    // async deleteItemAsync(para, callback) {
    //   let id = para.id;
    //   let url = `${this.$url}/service/synonym/?id=${id}`;

    //   await this.$http.delete(url)
    //   callback && callback();
    // },

    // deleteBatch() {
    //   let arr = this.selection.map(item => {
    //     let obj ={
    //       id: item.id
    //     };
    //     return obj;
    //   });
    //   // let arr = this.selection.map(item => {id:item.id});
    //   let callback = () => {
    //     this.$message.success('删除成功');
    //     this.refreshTable();
    //   };
    //   let para = {
    //     fun: this.deleteItemAsync,
    //     paraArr: arr,
    //     callback
    //   };
    //   this.$confirm('删除后不可恢复，确认删除？','提示',{
    //     type: 'warning',
    //   }).then(()=>{
    //     this.seriesFunCallback(para);
    //   }).catch(e => console.info(e));
    // },
    // seriesFunCallback({fun, paraArr, callback}) {
    //   let delCallback = null;
    //   let nextCallback = () => {
    //     paraArr.shift();
    //     this.seriesFunCallback({fun, paraArr, callback})
    //   };
    //   let obj = null;
    //   if (paraArr && Array.isArray(paraArr) && paraArr.length>1) {
    //     delCallback = nextCallback;
    //     obj = paraArr[0];
    //   } else if (paraArr && Array.isArray(paraArr) && paraArr.length==1) {
    //     obj = paraArr[0];
    //     delCallback = () => {
    //       paraArr.shift();
    //       callback && callback();
    //     };
    //   } else {
    //     callback && callback();
    //   }
    //   try {
    //     obj && fun(obj, delCallback);
    //   } catch (e) {
    //     this.$showFailure(e);
    //   }
    // },
    tableLayout() {
      if (
        this.$refs.synonymsTable &&
        this.$refs.synonymsTable.resetTableStyle
      ) {
        this.$refs.synonymsTable.resetTableStyle()
      }
    },
  },
}
