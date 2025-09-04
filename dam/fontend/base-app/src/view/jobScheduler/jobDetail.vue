<template>
  <datablau-form-submit
    class="jobDetail"
    :style="{ top: jobApp ? '80px' : '50px' }"
    v-loading="jobDetailLoading"
  >
    <datablau-form>
      <el-form-item label="任务名称">
        <span class="form-value">{{ jobDetail.name }}</span>
      </el-form-item>
      <el-form-item label="任务类型">
        <span class="form-value">{{ jobDetail.jobType }}</span>
      </el-form-item>
      <el-form-item label="所属微服务">
        <span class="form-value">{{ jobDetail.appName }}</span>
      </el-form-item>
      <!--<el-form-item label="内建">-->
      <!--  <span class="form-value">{{ jobDetail.builtIn ? '是' : '否' }}</span>-->
      <!--</el-form-item>-->
      <el-form-item
        v-for="o in parameters"
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
    parameters() {
      let result = []
      if (!this.jobDetail || !this.jobDetail.jobContent) {
        return result
      }
      const hideParamsMap = {
        '数据标准-数据标准智能推荐任务': [
          'modelIds',
          'searchConfig',
        ],
        '数据标准-数据标准自动核验任务': [
          'modelId',
        ],
      }
      try {
        let jobContent = JSON.parse(this.jobDetail.jobContent)
        result = jobContent.parameters || []
        // 移除隐藏的参数
        let hideParams = hideParamsMap[jobContent.typeName] || []
        if (hideParams?.length > 0) {
          _.pullAllBy(
            result,
            hideParams.map(item => {
              return { parameterName: item }
            }),
            'parameterName'
          )
        }
      } catch (e) {
        console.log(e)
      }
      return result
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
<style lang="scss" scoped>
.jobDetail {
  position: absolute;
  top: 50px;
  bottom: 0;
  left: 0;
  right: 0;
  ::v-deep {
    .el-form {
      .el-form-item__label {
        margin-top: 0;
      }
    }
  }
}
</style>
