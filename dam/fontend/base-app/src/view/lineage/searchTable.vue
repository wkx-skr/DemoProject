<template>
  <div class="search-table lineage-search-table" ref="searchTable">
    <datablau-eltable
      class="table-tab-container"
      ref="tabWithTable"
      :iconfont-state="true"
      :totalShow="totalShow"
      :tableOption="tableOption"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideDefaultFilter="false"
      :searchPlaceholder="$t('meta.lineageManage.searchTableName')"
    >
      <div slot="header"></div>
      <!-- <div slot="table">
        table
      </div> -->
      <div slot="footer">
        <!-- <el-button @click="deleteItem">删除</el-button> -->
      </div>
    </datablau-eltable>
  </div>
</template>

<script>
import Vue from 'vue'
let tableOptionCell = {
  template:
    '<div><el-button type="text" @click="checkItem" size="small">查看</el-button></div>',
  data() {
    return {
      searchTableComponent: null,
    }
  },
  mounted() {
    this.searchTableComponent = this.params.searchTableComponent
  },
  methods: {
    checkItem(e) {
      const data = this.params.data
      const parentVueComponent = this.searchTableComponent
      parentVueComponent &&
        parentVueComponent.checkItem &&
        parentVueComponent.checkItem(data)
    },
  },
}
tableOptionCell = Vue.extend(tableOptionCell)
export default {
  data() {
    return {
      totalShow: 0,
      pageSize: 20,
      keyword: '',
      columnDefs: null,
      tableOption: {
        rowSelection: 'single',
      },
    }
  },
  props: ['folderId'],
  components: {},
  computed: {},
  beforeMount() {
    const columnDefs = [
      // {
      //   type: ['firstEmptyColumn'],
      // },
      {
        headerName: '',
        field: '',
        type: ['iconCol'],
        iconType: 'TABLE',
        className: 'iconfont icon-tancha',
        customColName: 'iconfont icon-biao',
        // valueFormatter: formatterTime,
      },
      {
        headerName: this.$t('meta.lineageManage.tableName'),
        field: 'name',
        tooltipField: 'name',
        minWidth: 100,
      },
      {
        headerName: this.$t('meta.lineageManage.lineageFile'),
        field: 'lineageName',
        tooltipField: 'lineageName',
        minWidth: 200,
      },
      {
        headerName: this.$t('meta.lineageManage.lineageFileDesc'),
        field: 'lineageDescription',
        tooltipField: 'lineageDescription',
        minWidth: 200,
      },
      {
        headerName: this.$t('meta.lineageManage.uploader'),
        field: 'lineageCreator',
        tooltipField: 'lineageCreator',
        minWidth: 100,
      },
      {
        headerName: this.$t('meta.lineageManage.operation'),
        minWidth: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'editItem',
              text: this.$t('common.button.scan'),
              method: 'checkItem',
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const url = this.$meta_url + '/service/lineage/searchTables/'
        const body = {
          pageSize: para.pageSize,
          keyword: para.keyword,
          currentPage: para.currentPage - 1,
          lineageId: '',
          folderId: this.folderId,
        }
        this.$http
          .post(url, body)
          .then(res => {
            const data = res.data
            this.totalShow = data.totalElements
            const showData = data.content
            resolve(showData)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    checkItem(data) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      const skipUrl = `${baseUrl}lineageDemo?id=${
        data.data.lineageId
      }&filename=${encodeURIComponent(
        data.data.lineageDescription
      )}&name=${encodeURIComponent(
        data.data.lineageName
      )}&stepId=${encodeURIComponent(data.data.stepId)}${
        data.data.lineageCreator === this.$user.username
          ? '&writable=false'
          : ''
      }&blank=true`
      // ${data.lineageCreator === this.$user.username ? '&writable=true' : ''}
      window.open(skipUrl, '_blank')
    },
    resetTableStyle() {
      this.$refs.tabWithTable.resetTableStyle()
    },
  },
  watch: {
    folderId: {
      deep: true,
      handler: function (newVal) {
        this.$refs.tabWithTable.refreshData()
      },
      // immediate: true,
    },
  },
}
</script>

<style lang="scss">
.search-table {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .table-tab-container {
    .datablau-tab-table-line {
      margin-right: 20px;

      .datablau-table-info {
        height: 100%;
      }
    }
  }
}
</style>
