<template>
  <div class="workflow-event-watch">
    <div class="event-watch">
      <datablau-tab-with-eltable
        class="table-tab-container"
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
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import Vue from 'vue'
export default {
  data () {
    return {
      // *** tab with table ***
      allData: null,
      totalShow: 0,
      columnDefs: [],
      tableOption: {
        rowSelection: 'single'
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20
      },
      getAllInfo: null
    }
  },
  props: {},
  components: {},
  beforeMount () {
    const columnDefs = [
      {
        type: ['firstEmptyColumn']
      },
      {
        headerName: '名称',
        field: 'name',
        tooltipField: 'name'
        // width: 150
      },
      {
        headerName: '监听器',
        field: 'value',
        tooltipField: 'value',
        minWidth: 300
      },
      {
        headerName: '类型',
        field: 'listenerType',
        tooltipField: 'listenerType'
        // width: 100
      },
      {
        headerName: '事件',
        field: 'event',
        tooltipField: 'event'
        // width: 100
      },
      {
        headerName: '所属流程类型',
        field: 'processType',
        tooltipField: 'processType'
        // width: 100
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description'
        // width: 200
      }
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted () {
    this.getAllData()
  },
  destroyed () {},
  methods: {
    getAllData () {
      this.allData = HTTP.getWorkflwoListeners()
    },
    getShowData (para) {
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
    tableLayout () {
      if (
        this.$refs.eventListener &&
        this.$refs.eventListener.resetTableStyle
      ) {
        this.$refs.eventListener.resetTableStyle()
      }
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
// .workflow-event-watch {
//   position: relative;
//   min-height: 500px;
//   .event-watch {}
// }
</style>
