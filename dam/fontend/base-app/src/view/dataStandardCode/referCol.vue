<template>
  <div class="logssary-tab">
    <datablau-eltable
      class="table-tab-container"
      ref="referCol"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideBottomLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
    ></datablau-eltable>
  </div>
</template>

<script>
import vue from 'vue'
import HTTP from '@/http/main'

export default {
  props: {
    codeData: {
      type: Object,
      required: true,
    },
  },
  components: {},
  data() {
    return {
      totalShow: 0,
      hideTopLine: true,
      hideBottomLine: false,
      tableOption: null,
      tableHidePagination: false,
      defaultParaData: {
        keyword: '',
        sortData: {},
        filterType: {},
        currentPage: 1,
        pageSize: 20,
      },
      // deleteDisabled: true,
    }
  },
  beforeMount() {
    const tableOption = {
      frameworkComponents: {},
      rowSelection: 'single',
    }
    this.tableOption = tableOption
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: this.$t('domain.code.modelName'),
        field: 'modelName',
        tooltipField: 'modelName',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.modelOwner'),
        field: 'modelOwner',
        tooltipField: 'modelOwner',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.modelPath'),
        field: 'modelPath',
        tooltipField: 'modelPath',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.modelBranch'),
        field: 'modelBranch',
        tooltipField: 'modelBranch',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.tableEnName'),
        field: 'tableName',
        tooltipField: 'tableName',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.tableCName'),
        field: 'tableAlias',
        tooltipField: 'tableAlias',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.fieldEnName'),
        field: 'columnName',
        tooltipField: 'columnName',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
      {
        headerName: this.$t('domain.code.fieldCName'),
        field: 'columnAlias',
        tooltipField: 'columnAlias',
        minWidth: 100,
        width: this.totalShow ? 150 : 0,
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        // const url = `${this.$url}/service/domains/ddm/code/usage?currentPage=${currentPage}&pageSize=${pageSize}`
        const codeId = this.codeData.code
        // this.$plainRequest
        //   .put(url, codeId)
        const obj = {
          pageSize,
          currentPage,
          code: codeId,
        }
        HTTP.getCodeDdmUsagesService(obj)
          .then(res => {
            let resData = res.data || {}
            if (this.$utils.isJSON(resData)) {
              resData = JSON.parse(resData)
            }
            const data = resData.items || []
            this.totalShow = resData.totalItems || 0
            this.$emit('getColCount', this.totalShow)
            resolve(data)
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
      // this.selection = result;
      // this.deleteDisabled = this.selection.length === 0 ? true : false;
    },
    getTableData() {
      this.$refs.referCol && this.$refs.referCol.refreshData()
    },
  },
  watch: {
    codeData() {
      this.getTableData()
    },
  },
  computed: {},
}
</script>
<style lang="scss">
.logssary-tab {
  .datablau-tab-table-line {
    margin-left: 0 !important;
    top: 10px !important;
  }
  .bottom-line {
    // margin-left: 20px;
  }
}
</style>
