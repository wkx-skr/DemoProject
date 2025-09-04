<template>
  <datablau-form-submit
    style="position: absolute; top: 50px; bottom: 0; left: 0; right: 0"
    :style="{ top: jobApp ? '80px' : '50px' }"
    v-loading="jobDetailLoading"
  >
    <datablau-form>
      <el-form-item :label="$t('meta.job.taskName')">
        <span class="form-value">{{ jobDetail.name }}</span>
      </el-form-item>
      <el-form-item :label="$t('meta.job.taskType')">
        <span class="form-value">{{ jobDetail.jobType }}</span>
      </el-form-item>
      <el-form-item :label="$t('meta.job.OwningMicroservice')">
        <span class="form-value">{{ jobDetail.appName }}</span>
      </el-form-item>
      <el-form-item :label="$t('meta.job.ownCreate')">
        <span class="form-value">
          {{
            jobDetail.builtIn ? $t('meta.common.true') : $t('meta.common.false')
          }}
        </span>
      </el-form-item>
      <el-form-item
        v-for="o in jobDetail.jobContent &&
        JSON.parse(jobDetail.jobContent).parameters"
        :key="o.parameterName"
        :label="o.parameterDescription"
      >
        <span class="form-value">{{ o.value }}</span>
      </el-form-item>
    </datablau-form>
  </datablau-form-submit>
</template>
<script>
export default {
  props: {
    rawData: {},
    jobApp: {},
  },
  data() {
    return {
      jobDetail: {},
      jobDetailLoading: true,
    }
  },
  computed: {
    baseUrl() {
      if (this.jobApp === 'metadata') {
        return '/metadata/service/jobs'
      } else {
        return '/job/main'
      }
    },
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      if (this.jobApp === 'metadata') {
        this.jobDetail = this.rawData
        this.jobDetailLoading = false
      } else {
        const jobId = this.rawData.jobId
        this.$http
          .post(`${this.baseUrl}/query/jobs/byCriteria`, {
            '@type': '.MultipleCriteria',
            criteria: [
              {
                '@type': '.FieldEqualsCriteria',
                page: null,
                fieldName: 'jobId',
                compareValue: jobId,
                notEqual: false,
              },
            ],
          })
          .then(res => {
            this.jobDetail = res.data.content[0]
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .then(() => {
            this.jobDetailLoading = false
          })
      }
    },
  },
}
</script>
