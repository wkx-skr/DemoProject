<template>
  <div class="workflow-event-watch">
    <datablau-page-title
      class="event-listener-title"
      :parent-name="$t('common.page.monitor')"
      :name="$t('common.page.monitor')"
    ></datablau-page-title>
    <datablau-tab-with-eltable
      class="table-tab-container event-watch-table"
      ref="eventListener"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="true"
      :hideBottomLine="false"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    ></datablau-tab-with-eltable>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import Vue from 'vue'
export default {
  data() {
    return {
      // *** tab with table ***
      allData: null,
      totalShow: 0,
      columnDefs: [],
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      getAllInfo: null,
    }
  },
  props: {},
  components: {},
  beforeMount() {
    const columnDefs = [
      // {
      //   type: ['firstEmptyColumn'],
      // },
      {
        headerName: this.$t('meta.process.name'),
        field: 'name',
        tooltipField: 'name',
        width: 150,
      },
      {
        headerName: this.$t('meta.process.monitor'),
        field: 'value',
        tooltipField: 'value',
        minWidth: 250,
      },
      {
        headerName: this.$t('meta.process.type'),
        field: 'listenerType',
        tooltipField: 'listenerType',
        // width: 100
      },
      {
        headerName: this.$t('meta.process.event'),
        field: 'event',
        tooltipField: 'event',
        // width: 100
      },
      {
        headerName: this.$t('meta.process.processType1'),
        field: 'processType',
        tooltipField: 'processType',
        // width: 100
      },
      {
        headerName: this.$t('meta.process.desc'),
        field: 'description',
        tooltipField: 'description',
        minWidth: 220,
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted() {
    this.getAllData()
  },
  destroyed() {},
  methods: {
    getAllData() {
      this.allData = HTTP.getWorkflwoListeners()
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const keyword = para.keyword || ''
        if (!this.allData) {
          this.getAllData()
        }
        this.allData
          .then(res => {
            let data = res.data
            if (!data || !Array.isArray(data)) {
              data = []
            }

            let keyword = para.keyword || ''
            keyword = _.trim(keyword)
            if (keyword) {
              const result = []
              keyword = keyword.toLowerCase()
              let name = ''
              data.forEach(item => {
                name = item.name || ''
                name = name.toLowerCase()
                const index = name.indexOf(keyword)
                if (index !== -1) {
                  result.push(item)
                }
              })
              data = result
            }

            this.totalShow = data.length

            const s = para.pageSize
            const c = para.currentPage

            const arr = data.slice(s * (c - 1), s * c)
            resolve(arr)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    tableLayout() {
      if (
        this.$refs.eventListener &&
        this.$refs.eventListener.resetTableStyle
      ) {
        this.$refs.eventListener.resetTableStyle()
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.workflow-event-watch {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);
  .event-watch-table {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    /deep/ .tab-table-line {
      top: 0;
      left: 20px;
      right: 20px;
      border-top: none;
    }
    /deep/ .tab-bottom-line {
      box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
