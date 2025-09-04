<template>
  <div class="api-asset-tab">
    <datablau-eltable
      class="table-tab-container"
      ref="apiTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="false"
      :hideBottomLine="false"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <div class="right-btn-container" slot="header">
        <datablau-button size="mini" @click="refreshTable">
          刷 新
        </datablau-button>
      </div>
      <div class="bottom-btn-container" slot="footer"></div>
    </datablau-eltable>
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalShow: 0,
      tableLoading: false,
      tableHidePagination: false,
      columnDefs: [],
      tableOption: {},
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
    }
  },
  components: {},
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const formatterSize = this.$fileSizeFormatter
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: 'API名称',
        field: 'name',
        tooltipField: 'name',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '调用协议',
        field: 'apiProtocol',
        tooltipField: 'apiProtocol',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '更新频率',
        field: 'updateFrequency',
        tooltipField: 'updateFrequency',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '返回格式',
        field: 'resultType',
        tooltipField: 'resultType',
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
        headerName: '接口说明',
        field: 'description',
        tooltipField: 'description',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [{ name: 'edit', text: '添加', method: 'addCatalogApi' }],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted() {},
  methods: {
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const obj = {
          currentPage: para.currentPage - 1,
          pageSize: para.pageSize,
          name: para.keyword || '',
          status: 0,
        }
        const url = `${this.$url}/service/api/apis/search`

        this.$http
          .post(url, obj)
          .then(res => {
            const data = res.data
            this.totalShow = data.totalItems
            resolve(data.content)
          })
          .catch(e => {
            this.$showFailure(e)
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
      if (this.$refs.apiTable && this.$refs.apiTable.refreshData) {
        this.$refs.apiTable.refreshData()
      }
    },
    addCatalogApi(para) {
      const data = para.data
      this.$emit('addCatalogApi', data)
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.api-asset-tab {
  // border: 1px solid red;
  min-height: 500px;
  position: relative;

  .delete-btn {
    margin-left: 20px;
  }
}
</style>

<style lang="scss">
.api-asset-tab {
}
</style>
