<template>
  <div class="data-service-page">
    <datablau-tab-with-table
      class="table-tab-container"
      ref="dataService"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <div class="right-btn-container" slot="header">
        <!-- <el-button
          type="primary"
          size="mini"
          @click="showAddDialog"
        >添 加</el-button> -->
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div>
      <div class="bottom-btn-container" slot="footer">
        <!-- <el-button
          type="danger"
          size="small"
          class="delete-btn"
          @click="deleteBatch"
          :disabled="!couldDeleteBatch"
        >删 除</el-button> -->
      </div>
    </datablau-tab-with-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      hideTopLine: false,
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],

      getAllApis: null,
    }
  },
  props: {
    serType: {
      type: String,
      default: 'mySer',
    },
  },
  components: {},
  computed: {},
  beforeMount() {
    this.resetGetAllApi()
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      {
        // type: ['selectionCheckboxColumn'],
        type: ['firstEmptyColumn'],
      },
      // {
      //   headerName: '序号',
      //   field: 'domainName',
      //   tooltipField: 'domainName',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '名称',
        field: 'name',
        tooltipField: 'name',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '所属数据源',
        field: 'modelName',
        tooltipField: 'modelName',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '所有者',
        field: 'creator',
        tooltipField: 'creator',
        // valueFormatter: formatterTime,
        // tooltipValueGetter: formatterTime,
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '过期时间',
        field: 'expire',
        // tooltipField: 'expire',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // {name: 'edit', text: '编辑', method: 'showEditDialog'},
            { name: 'checkView', text: '查看', method: 'checkView' },
            { name: 'remove', text: '删除', method: 'handleDeleteView' },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {},
  methods: {
    resetGetAllApi() {
      let url = `${this.$url}/service/vdp/views/shared`
      if (this.serType === 'mySer') {
        url = `${this.$url}/service/vdp/views`
      }
      this.getAllApis = this.$http.get(url)
    },
    // *** tab with table ***
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const s = para.pageSize
        const c = para.currentPage

        this.getAllApis
          .then(res => {
            let data = res.data
            if (data && Array.isArray(data)) {
              let filteredArr = null
              if (para.keyword) {
                const keyword = para.keyword.toLowerCase()
                filteredArr = data.filter(item => {
                  let bool = false
                  const props = ['name', 'modelName', 'description', 'creator']
                  props.forEach(prop => {
                    if (item[prop] && item[prop].indexOf(keyword) !== -1) {
                      bool = true
                    }
                  })
                  return bool
                })
                data = filteredArr
              }
              this.totalShow = data.length
              const arr = data.slice(s * (c - 1), s * c)
              // console.log(arr, 'arr')
              resolve(arr)
            } else {
              this.totalShow = 0
              resolve([])
            }
            // console.log(data, 'data')
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
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
      this.resetGetAllApi()
      if (this.$refs.dataService && this.$refs.dataService.refreshData) {
        this.$refs.dataService.refreshData()
      }
    },
    tableLayout() {
      if (this.$refs.dataService && this.$refs.dataService.resetTableStyle) {
        this.$refs.dataService.resetTableStyle()
      }
    },
    checkView(para) {
      const viewId = para.data.uuid
      this.$skip2({
        name: 'dataShow',
        query: {
          viewId,
        },
      })
    },
    deleteView(para) {
      const viewId = para.data.uuid
      this.$http
        .delete(`${this.$url}/service/vdp/views/${viewId}`)
        .then(res => {
          // this.$emit('deteleView', this.viewData);
          this.$message.success('删除成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDeleteView(para) {
      this.$confirm('视图删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.deleteView(para)
        })
        .catch(e => {
          console.log('cancel')
        })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
@mixin absPo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.data-service-page {
  // border: 1px solid red;
  @include absPo;
}
</style>
