<template>
  <datablau-form-submit
    style="position: absolute;top: 50px;bottom: 0;left: 0;right: 0;"
    v-loading="jobDetailLoading">
    <datablau-form>
      <el-form-item :label="$t('common.task.taskName')"><span class="form-value">{{jobDetail.name}}</span></el-form-item>
      <el-form-item :label="$t('system.job.taskType')"><span class="form-value">{{jobDetail.jobType}}</span></el-form-item>
      <el-form-item :label="$t('system.job.owningSystem')"><span class="form-value">{{jobDetail.appName}}</span></el-form-item>
      <!--<el-form-item label="内建"><span class="form-value">{{jobDetail.builtIn ? '是': '否'}}</span></el-form-item>-->
      <template
        v-for="o in parameters"
      >
        <el-form-item
          :key="o.parameterName"
          v-if="o.parameterName === 'threshold'"
          :label="$t('system.job.threshold')"
          prop="threshold">
          <el-input-number
            v-model="jobContent.threshold"
            @change="handleParameterChange"
            :min="0.5"
            :max="1.0"
            :precision="1"
            :step="0.1"
            size="mini"
          ></el-input-number>
          <datablau-tooltip
            :content="$t('system.job.thresholdTips')"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          :key="o.parameterName"
          v-else-if="o.parameterName==='groupCount'"
          :label="$t('system.job.groupCount')"
          prop="groupCount"
        >
          <el-input-number
            v-model="jobContent.groupCount"
            @change="handleParameterChange"
            :min="20"
            :max="100"
            :precision="0"
            :step="1"
            size="mini"
          ></el-input-number>
          <!-- <el-tooltip effect="light" content="设置字段聚合的分组数量" placement="right">
            <i class="iconfont icon-tips"></i>
          </el-tooltip> -->
        </el-form-item>
        <el-form-item
          :key="o.parameterName"
          v-else-if="o.parameterDescription"
          :label="o.parameterDescription"><span class="form-value">{{o.value}}</span></el-form-item>
      </template>
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
      jobContent: {
        threshold: '',
        groupCount: '',
      },
      successMessageTimeout: null,
    }
  },
  computed: {
    baseUrl() {
      return '/metadata/service/jobs'
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
    handleParameterChange() {
      const json = JSON.parse(this.jobDetail.jobContent)
      json.parameters.forEach(item => {
        if (item.parameterName === 'groupCount') {
          item.value = this.jobContent.groupCount
        }
        if (item.parameterName === 'threshold') {
          item.value = this.jobContent.threshold
        }
      })
      clearTimeout(this.successMessageTimeout)
      this.successMessageTimeout = setTimeout(_ => {
        this.$http
          .post(
            this.$meta_url + `/jobs/updateJob?jobId=${this.jobDetail.jobId}`,
            json
          )
          .then(_ => {
              this.$message.success(this.$t('domain.common.modifySuccessfully'))
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 500)
    },
    getData() {
      if (this.jobApp === 'metadata') {
        this.jobDetail = this.rawData
        this.jobDetailLoading = false
      } else{
        const jobId = this.rawData.jobId
        this.$http.post(`${this.baseUrl}/query/jobs/byCriteria`,{
          "@type": ".MultipleCriteria",
          "criteria": [
            {
              "@type": ".FieldEqualsCriteria",
              "page": null,
              "fieldName": "jobId",
              "compareValue": jobId,
              "notEqual": false
            }
          ]
        }).then(res => {
          this.jobDetail = res.data.content[0]
          JSON.parse(this.jobDetail.jobContent).parameters.forEach(p => {
            if (p.parameterName === 'threshold') {
              this.jobContent.threshold = p.value
            }
            if (p.parameterName === 'groupCount') {
              this.jobContent.groupCount = p.value
            }
          })
        }).catch(e => {
          this.$showFailure(e)
        }).then(() => {
          this.jobDetailLoading = false
        })
      }
    }
  }
}
</script>
