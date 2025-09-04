<script>
import JobItem from '@/view/jobScheduler/jobItem.vue'
export default {
  props: {
    jobId: {
      type: Number,
      default: null,
    },
    jobType: {
      type: String,
      default: '',
    },
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
    }
  },
  methods: {
    getJob() {
      // console.log('getJob调用了', this.jobType)
      const jobId = this.jobId
      let jobType = this.jobType
      this.$http
        .post(`/metadata/service/jobs/query/jobs/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobId',
              compareValue: jobId,
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
    currentTabInitial="detail"
    job-app="domain"
    :job-from-data-find="true"
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
