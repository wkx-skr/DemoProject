<template>
  <div class="approval-domain-list">
    <datablau-tab-with-eltable
      class="table-tab-container"
      ref="domainList"
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
import HTTP from '@/resource/http.js'
export default {
  data() {
    return {
      domainIds: [],
      domainMap: {},

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
    domainList: {
      type: Array,
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
    // this.getDomainMap();
    this.dataInit()
  },
  methods: {
    getDomainMap() {
      const domainMap = {}
      HTTP.getAporovalDomain('C')
        .then(res => {
          const data = res.data
          const nodes = data.nodes
          this.formateDomainMap(nodes)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formateDomainMap(nodes) {
      if (nodes && Array.isArray(nodes) && nodes.length > 0) {
        nodes.forEach(item => {
          const domains = item.domains
          if (domains && Array.isArray(domains) && domains.length > 0) {
            domains.forEach(item => {
              this.domainMap[item.id] = item
            })
          }
          const childrenNodes = item.nodes
          this.formateDomainMap(childrenNodes)
        })
      }
    },
    dataInit() {
      const domainList = this.domainList
      if (domainList && Array.isArray(domainList)) {
        this.totalShow = domainList.length
        this.refreshTable()
      }
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        let domainIds = []
        const s = para.pageSize
        const c = para.currentPage

        const domainList = this.domainList
        if (domainList && Array.isArray(domainList)) {
          domainIds = domainList.slice(s * (c - 1), s * c)
        }
        HTTP.getDomainDetailList(domainIds)
          .then(res => {
            const data = res.data || []
            resolve(data)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    tableLayout() {
      if (this.$refs.domainList && this.$refs.domainList.resetTableStyle) {
        this.$refs.domainList.resetTableStyle()
      }
    },
    checkDomain(para) {
      const domainId = para.data.domainId
      // 跳转 dataStandard / domain
      this.$skip2({ name: 'domain', query: { domainId: domainId } })
    },
    refreshTable() {
      if (this.$refs.domainList && this.$refs.domainList.refreshData) {
        this.$refs.domainList.refreshData()
      }
    },
  },
  watch: {
    domainList: {
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
