<template>
  <div class="approval-domain-list" v-loading="loading">
    <datablau-tab-with-eltable
      class="table-tab-container"
      ref="tableList"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="false"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    >
      <!-- @gridSelectionChanged="gridSelectionChanged" -->
      <div class="right-btn-container" slot="header">
        <!-- <el-button
          type="primary"
          size="mini"
          @click="showAddDialog"
        >添 加</el-button>
        <el-button
          size="mini"
          @click="refreshTable"
        >刷 新</el-button> -->
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
    </datablau-tab-with-eltable>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  data() {
    return {
      loading: true,
      tableIds: [],
      tableMap: {},

      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: true,
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      // selection: [],
    }
  },
  props: {
    currentTaskDtail: {
      type: Object,
      required: true,
    },
  },
  components: {},
  computed: {},
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '中文名称',
        field: 'chineseName',
        tooltipField: 'chineseName',
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '英文名称',
        field: 'abbreviation',
        tooltipField: 'abbreviation',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '标准编码',
        field: 'domainCode',
        tooltipField: 'domainCode',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '所有者',
        field: 'submitter',
        tooltipField: 'submitter',
        width: 150,
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '发布时间',
        field: 'firstPublish',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        suppressSizeToFit: true,
        // type: ['customSortCol'],
      },
      {
        headerName: '最后更新时间',
        field: 'lastModification',
        // tooltipField: 'modifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        suppressSizeToFit: true,
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
            // {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
            { name: 'edit', text: '查看', method: 'checkDomain' },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {
    // this.dataInit();
  },
  methods: {
    dataInit() {
      const processInstanceId = this.currentTaskDtail.processInstanceId
      HTTP.getProcessResult({ taskId: processInstanceId })
        .then(res => {
          let data = res.data
          if (data && Array.isArray(data) && data.length > 0) {
            data = data[0]
            data = data.formPropertyDtos
            if (data && Array.isArray(data) && data.length > 0) {
              data = data[0] || {}
              data = data.value || {}
              if (this.$utils.isJSON(data)) {
                data = JSON.parse(data)
              }
              data = data.targetTableIdArr || []
            } else {
              data = []
            }
          } else {
            data = []
          }
          this.totalShow = data.length
          this.tableIds = data
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableDetail(ids) {
      const proArr = []
      if (ids && Array.isArray(ids)) {
        ids.forEach(item => {
          const pro = HTTP.getTableSummaryPro({ objectId: item })
          pro
            .then(res => {
              this.tableMap[item] = res.data
            })
            .catch(e => {})
          proArr.push(pro)
        })
      }
      return Promise.all(proArr)
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        let tableIds = this.tableIds
        const s = para.pageSize
        const c = para.currentPage

        if (tableIds && Array.isArray(tableIds)) {
          tableIds = tableIds.slice(s * (c - 1), s * c)
        } else {
          tableIds = []
        }
        if (tableIds.length > 0) {
          this.getTableDetail(tableIds)
            .then(res => {
              const tableDetailArr = []
              tableIds.forEach(id => {
                tableDetailArr.push(this.tableMap[id] || {})
              })
              resolve(tableDetailArr)
            })
            .catch(e => {
              this.$showFailure(e)
              reject(e)
            })
        } else {
          resolve([])
        }
      })
    },
    tableLayout() {
      if (this.$refs.tableList && this.$refs.tableList.resetTableStyle) {
        this.$refs.tableList.resetTableStyle()
      }
    },
    checkDomain(para) {
      const domainId = para.data.domainId
      // 跳转 dataStandard / domain
      this.$skip2({ name: 'domain', query: { domainId: domainId } })
    },
    refreshTable() {
      if (this.$refs.tableList && this.$refs.tableList.refreshData) {
        this.$refs.tableList.refreshData()
      }
    },
  },
  watch: {
    currentTaskDtail: {
      immediate: true,
      handler: function (newVal, oldVal) {
        this.dataInit()
      },
    },
  },
}
</script>

<style lang="scss">
.approval-domain-list {
  width: 100%;
  height: 100%;
  // border: 1px solid red;
  .tab-with-table {
    .tab-with-table {
      border: 1px solid red;
    }
  }
}
</style>
