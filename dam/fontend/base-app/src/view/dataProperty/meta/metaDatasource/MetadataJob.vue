<script>
import JobItem from '../metadataJob/jobItem.vue'
export default {
  props: {
    metadataJobArgs: {},
  },
  components: {
    JobItem,
  },
  mounted() {
    this.getJob()
  },
  data() {
    return {
      jobDetailVisible: false,
      currentJob: null,
      jobType: '',
    }
  },
  methods: {
    getJob() {
      console.log(this.metadataJobArgs)
      let jobType = undefined
      let resourceId = undefined
      if (this.metadataJobArgs.resourceId && this.metadataJobArgs.jobType) {
        // 此处用于打开地址栏携带信息的情况
        // jobType = decodeURIComponent(this.metadataJobArgs.jobType)
        jobType = decodeURI(this.metadataJobArgs.jobType)
        resourceId = this.metadataJobArgs.resourceId
      } else {
        const row = this.metadataJobArgs.row
        const jobTypeNumber = this.metadataJobArgs.jobTypeNumber
        resourceId = row.modelId
        if (jobTypeNumber === 1) {
          // 更新任务
          if (row.reverseOptions?.biType) {
            jobType = 'BI报表更新扫描任务'
          } else {
            jobType = '元数据-更新扫描任务'
          }
        } else if (jobTypeNumber === 2) {
          jobType = '元数据-数据源与模型差异比较与同步任务'
        } else if (jobTypeNumber === 3) {
          jobType = '元数据-血缘解析任务'
        }
      }
      this.jobType = jobType

      this.$http
        .post(`/metadata/service/jobs/query/jobs/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'resourceId',
              compareValue: `${resourceId}`,
              notEqual: false,
            },
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobType',
              compareValue: jobType,
              notEqual: false,
            },
          ],
        })
        .then(res => {
          this.currentJob = res.data.content[0]
          this.jobDetailVisible = true
        })
        .catch(e => {
          this.$showFailure(e)
          this.handleClose()
        })
    },
    handleClose() {
      this.jobDetailVisible = false
      this.$emit('close')
    },
  },
}
</script>

<template>
  <job-item
    v-if="jobDetailVisible"
    :data="currentJob"
    @close="handleClose"
    class="detail-page"
    job-app="metadata"
    :jobType="jobType"
  ></job-item>
</template>

<style scoped lang="scss">
.detail-page {
  background-color: #fff;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
}
</style>
