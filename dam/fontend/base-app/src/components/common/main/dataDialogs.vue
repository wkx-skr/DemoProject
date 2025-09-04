<template>
  <el-dialog
    title="运行结果"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
  >
    <el-table v-if="dialogVisible" :data="tableData" :max-height="400">
      <el-table-column
        v-for="(v, k) in tableData[0]"
        :label="k.replace(/\uEE01/g, '.')"
        :min-width="150"
        :prop="k"
        :key="k"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      tableData: [],
    }
  },
  mounted() {
    this.$bus.$on('showTaskResult', id => {
      this.getTaskResult(id)
    })
    this.$bus.$on('showJobHistoryResult', data => {
      this.getHistoryDetail(data.jobId, data.historyId, data.ruleId)
    })
  },
  beforeDestroy() {
    this.$bus.$off('showTaskResult')
    this.$bus.$off('showJobHistoryResult')
  },
  methods: {
    getTaskResult(id) {
      this.$http
        .get(this.$quality_url + '/quality/rule/task/' + id + '/result')
        .then(res => {
          this.result = res.data
          this.tableData = res.data
          this.dialogVisible = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    downloadHistoryDetail() {},
    getHistoryDetail(jobId, historyId, ruleId) {
      this.$http
        .get(
          this.$url +
            '/service/quality/job/' +
            jobId +
            '/history/' +
            historyId +
            '/result/' +
            ruleId
        )
        .then(res => {
          this.result = res.data
          this.result.forEach(item => {
            for (const i in item) {
              if (i.indexOf('.') > -1) {
                item[i.replace(/\./g, '\uEE01')] = item[i]
                delete item[i]
              }
            }
          })
          this.tableData = this.result
          this.dialogVisible = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
