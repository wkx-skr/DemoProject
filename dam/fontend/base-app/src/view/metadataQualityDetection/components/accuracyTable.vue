<template>
  <div class="accuracy-table" v-loading="loading">
    <datablau-table
      ref="table"
      :data="tableData"
      style="width: 100%"
      height="350"
      @scroll="handleTableScroll"
    >
      <el-table-column
        prop="businessDomain"
        label="业务域"
        width="120"
      ></el-table-column>
      <el-table-column prop="score" label="准确性" width="80"></el-table-column>
    </datablau-table>
  </div>
</template>

<script>
export default {
  props: {
    filterParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      tableData: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true,
    }
  },
  watch: {
    filterParams: {
      handler() {
        this.resetTable()
        this.fetchTableData()
      },
      deep: true,
    },
  },
  methods: {
    resetTable() {
      this.tableData = []
      this.page = 1
      this.hasMore = true
    },
    fetchTableData() {
      if (!this.hasMore || this.loading) return

      this.loading = true

      // 模拟接口请求
      setTimeout(() => {
        // 实际项目中应该是调用接口
        // const params = {
        //   ...this.filterParams,
        //   page: this.page,
        //   pageSize: this.pageSize
        // }
        // this.axios.get('/api/accuracyTable', { params }).then(res => {
        //   const { list, total } = res.data
        //   this.tableData = [...this.tableData, ...list]
        //   this.total = total
        //   this.hasMore = this.tableData.length < total
        //   this.page++
        //   this.loading = false
        // })

        // 模拟数据
        const mockData = [
          { businessDomain: '业务域1', score: 0.67 },
          { businessDomain: '业务域2', score: 0.7 },
          { businessDomain: '业务域3', score: 0.54 },
          { businessDomain: '业务域4', score: 0.92 },
          { businessDomain: '业务域5', score: 1 },
        ]

        // 模拟分页
        if (this.page <= 3) {
          // 假设只有3页数据
          this.tableData = [...this.tableData, ...mockData]
          this.page++
          this.hasMore = this.page <= 3
        } else {
          this.hasMore = false
        }

        this.loading = false
      }, 500)
    },
    handleTableScroll({ scrollTop, scrollHeight, height }) {
      // 触底加载更多
      if (
        scrollTop + height >= scrollHeight - 50 &&
        this.hasMore &&
        !this.loading
      ) {
        this.fetchTableData()
      }
    },
  },
  mounted() {
    this.fetchTableData()

    // 为表格添加滚动事件监听
    const tableWrapper = this.$refs.table.$el.querySelector(
      '.el-table__body-wrapper'
    )
    tableWrapper.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = tableWrapper
      this.handleTableScroll({
        scrollTop,
        scrollHeight,
        height: clientHeight,
      })
    })
  },
}
</script>

<style lang="scss" scoped>
.accuracy-table {
  width: 100%;

  /deep/ .el-table__body-wrapper {
    overflow-y: auto;
  }
}
</style>
