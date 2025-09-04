<template>
  <div class="file-asset-tab">
    <datablau-eltable
      class="table-tab-container"
      ref="fileTable"
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
        <!-- <datablau-button
          type="primary"
          size="mini"
          @click="showAddDialog"
        >添 加</datablau-button> -->
        <datablau-button size="mini" @click="refreshTable">
          刷 新
        </datablau-button>
      </div>
      <div class="bottom-btn-container" slot="footer">
        <!-- <datablau-button
          type="danger"
          size="small"
          class="delete-btn"
          @click="deleteBatch"
          :disabled="!couldDeleteBatch"
        >删 除</datablau-button> -->
      </div>
    </datablau-eltable>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      hideTopLine: false,
      tableOption: {},
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 0,
        pageSize: 20,
      },
      selection: [],
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
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      {
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
        headerName: '文件名',
        field: 'name',
        tooltipField: 'name',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '所有者',
        field: 'shareUser',
        tooltipField: 'shareUser',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '大小',
        field: 'size',
        tooltipField: 'size',
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
        // tooltipField: 'modifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [{ name: 'edit', text: '添加', method: 'add2Catalog' }],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    editBottomItemConfirm() {
      let bool = false
      bool = !!(this.editSynonymsData && this.editSynonymsData.synonyms)
      return bool
    },
    couldDeleteBatch() {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  mounted() {},
  methods: {
    // *** tab with table ***
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        const keyword = para.keyword || ''
        const url = `${this.$url}/service/shareFile/folder?currentPage=${currentPage}&pageSize=${pageSize}&fileName=${keyword}`

        this.$http
          .get(url)
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
      if (this.$refs.fileTable && this.$refs.fileTable.refreshData) {
        this.$refs.fileTable.refreshData()
      }
    },

    tableLayout() {
      if (this.$refs.fileTable && this.$refs.fileTable.resetTableStyle) {
        this.$refs.fileTable.resetTableStyle()
      }
    },

    add2Catalog(para) {
      const data = para.data
      this.$emit('add2Catalog', data)
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.file-asset-tab {
  // border: 1px solid red;
  min-height: 500px;
  position: relative;
  .table-tab-container {
    left: 0;
  }
  .delete-btn {
    margin-left: 20px;
  }
}
</style>

<style lang="scss">
.file-asset-tab {
  margin-left: -20px;
}
</style>
