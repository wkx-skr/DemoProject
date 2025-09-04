<template>
  <div style="top: 0; left: 0; right: 0; bottom: 0; position: absolute">
    <datablau-form-submit>
      <datablau-table :data="tableData" height="100%" empty-text=" ">
        <el-table-column
          v-for="(c, idx) in columns"
          :key="idx"
          :prop="c"
          :label="c"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          class="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="sizes, prev, pager, next"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <empty-page1 v-if="showEmptyPage"></empty-page1>
  </div>
</template>
<script>
import emptyPage1 from '@/view/dataIndex/indexManagement/indexDefinition/emptyPage1'

export default {
  components: {
    emptyPage1,
  },
  props: {
    metricId: {
      required: true,
    },
  },
  data() {
    return {
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      columns: [],
    }
  },
  computed: {
    showEmptyPage() {
      return this.tableData && this.tableData.length === 0
    },
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.$http
        .post(
          `/domain/metricManagement/dataPreview?metricId=${this.metricId}&currentPage=${this.currentPage}&pageSize=${this.pageSize}`
        )
        .then(res => {
          const tableData = []
          this.columns = res.data.mappingName
          res.data.content.forEach((item, index) => {
            const one_item = {}
            this.columns.forEach((c, subIndex) => {
              one_item[c] = item[subIndex]
            })
            tableData.push(one_item)
          })
          this.total = res.data.hasNext
            ? res.data.currentPage * res.data.pageSize + 1
            : res.data.currentPage * res.data.pageSize
          this.tableData = tableData
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableData = []
        })
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.tableData = null
      this.getData()
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.tableData = null
      this.getData()
    },
  },
}
</script>
