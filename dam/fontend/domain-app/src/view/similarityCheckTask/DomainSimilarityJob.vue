<script>
import JobItem from '@/view/jobScheduler/jobItem.vue'

export default {
  name: 'DomainSimilarityJob',
  props: {},
  created() {
    this.getJob()
  },
  components: {
    JobItem,
  },
  mounted() {},
  data() {
    return {
      initComp: false,
      currentJob: {},
      currentJobId: '',
    }
  },
  methods: {
    getJob() {
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: '数据标准-相似度检查任务',
      }
      this.$http
        .post(`${this.$job_url}/main/query/jobs/byDto`, options)
        .then(res => {
          const job = res.data.content[0]
          this.currentJob = job
          this.currentJobId = job?.jobId
          this.initComp = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<template>
  <JobItem
    v-if="initComp"
    :data="currentJob"
    class="similarity-task-detail-page"
    currentTabInitial="detail"
    job-app="domain"
    :job-from-data-find="true"
  ></JobItem>
</template>

<style scoped lang="scss">
.similarity-task-detail-page {
  min-height: 500px;
}
</style>
