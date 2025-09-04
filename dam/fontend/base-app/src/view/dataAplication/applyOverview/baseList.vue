<template>
  <datablau-eltable
    class="base-list-eltable"
    ref="tabWitdTable"
    :totalShow="totalShow"
    tableHeightInfo="100%"
    :getShowData="getShowData"
    :columnDefs="columnDefs"
    :hideDefaultFilter="hideDefaultFilter"
    :hideTopLine="hideTopLine"
    :defaultParaData="defaultParaData"
    :tableOption="tableOption"
  ></datablau-eltable>
</template>

<script>
import HTTP from '../ddsHTTP.js'
export default {
  props: {
    detailData: {
      type: Object,
      required: true,
    },
    hasAccess: {
      type: Boolean,
    },
    modeType: {
      type: String,
    },
  },
  data() {
    return {
      // AccessAll: false,
      AccessAll: this.$auth.APP_MANAGE_ALL,
      totalShow: 0,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: true,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    const formatterPath = para => {
      return para.value && para.value.join('/')
    }
    const formatterTime = data => {
      const t = this.$timeFormatter(data.data.createTime)
      return t.slice(0, -3)
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: 'API名称',
        field: 'name',
        tooltipField: 'name',
        // width: 100,
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        // width: 200,
      },
      {
        headerName: '状态',
        field: 'apiStatus',
        // width: 80,
        // cellRenderer: params => {
        //   let result = ''
        //   if (params.data.apiStatus === 'RELEASE') {
        //     result = `<div class="dot-shape" style="background-color:#57A07F"></div>
        //     <span style="color:#57A07F">已发布</span>`
        //   } else if (params.data.apiStatus === 'OFFLINE') {
        //     result = `<div class="dot-shape" style="background-color:#F46565"></div>
        //     <span style="color:#F46565">下线</span>`
        //   }
        //   return result
        // },
        // type: ['customSortCol'],
      },
      {
        headerName: '测试状态',
        field: 'apiTestStatus',
        // width: 80,
        // cellRenderer: params => {
        //   let result = ''
        //   if (params.data.apiTestStatus === 'SUCCESS') {
        //     result = `<div class="dot-shape" style="background-color:#57A07F"></div>
        //     <span style="color:#57A07F">成功</span>`
        //   } else if (params.data.apiTestStatus === 'FAIL') {
        //     result = `<div class="dot-shape" style="background-color:#F46565"></div>
        //     <span style="color:#F46565">失败</span>`
        //   }
        //   return result
        // },
        // type: ['customSortCol'],
      },
      {
        headerName: '分类',
        field: 'apiCatalog',
        tooltipField: 'apiCatalog',
        // width: 100,
      },
      {
        headerName: '创建人',
        field: 'creator',
        tooltipField: 'creator',
        // valueFormatter: formatterPath,
        // width: 80,
      },
      {
        headerName: '创建时间',
        field: 'createTime',
        // width: 100,
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // cellRenderer: (params) => {
        //   let result = new Date(params.data.createTime).toLocaleDateString();
        //   return result;
        // },
      },
    ]
    const obj1 = {
      headerName: '操作',
      width: 130,
      type: ['optionsWithContent'],
      cellRendererParams: {
        tabComponent: this,
        options: [
          { name: 'remove', text: '移除', method: 'removeItem' },
          { name: 'check', text: '查看', method: 'checkItem' },
        ],
      },
    }
    const obj2 = {
      headerName: '操作',
      width: 100,
      type: ['optionsWithContent'],
      cellRendererParams: {
        tabComponent: this,
        options: [{ name: 'check', text: '查看', method: 'checkItem' }],
      },
    }
    if (this.hasAccess) {
      this.columnDefs = [...columnDefs, obj1]
    } else {
      this.columnDefs = [...columnDefs, obj2]
    }
    this.defaultParaData = {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {
    // this.getData();
  },
  methods: {
    checkItem(data) {
      const routeData = this.$router.resolve({
        name: 'apiOverview',
        query: { apiId: data.data.apiId },
      })
      window.open(routeData.href, '_blank')
    },
    removeItem(data) {
      this.$DatablauCofirm('移除后不可恢复，确认移除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          HTTP.deleteBindApi(data.data.id)
            .then(res => {
              this.$showSuccess('移除成功')
              this.refreshData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          // this.$showFailure(e);
        })
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        let id
        let statu = {
          RELEASE: '已发布',
          OFFLINE: '下线',
          APPLY: '未申请',
          APPLYING: '申请中',
        }
        let ceshi = {
          SUCCESS: '测试成功',
          FAIL: '测试失败',
        }
        if (this.modeType === 'requestApp') {
          id = this.detailData.appId
        } else {
          id = this.detailData.id
        }
        HTTP.getAuthedList(id)
          .then(res => {
            const c = para.currentPage
            const s = para.pageSize
            let arr = []
            res.data.appApiAuthResultDtoList.forEach(item => {
              item.apiStatus = statu[item.apiStatus]
              item.apiTestStatus = ceshi[item.apiTestStatus]
            })
            const content = res.data.appApiAuthResultDtoList
            this.totalShow = content.length
            arr = content.slice((c - 1) * s, c * s)
            resolve(arr)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    refreshData() {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData()
    },
  },
  watch: {
    //   'codeData.code': {
    //     handler(newVal) {
    //       this.getData(newVal);
    //       this.refreshData();
    //     },
    //     immediate: true
    //   }
  },
}
</script>

<style lang="scss" scoped>
.remove-result-table {
  border: 1px solid red;
}
</style>
