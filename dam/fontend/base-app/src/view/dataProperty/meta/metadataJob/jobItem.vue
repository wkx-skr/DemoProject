<template>
  <div>
    <div :class="{ 'breadcrumb-line': !jobApp }">
      <datablau-breadcrumb
        :node-data="[data.name]"
        :couldClick="false"
        @back="close"
      ></datablau-breadcrumb>
    </div>
    <datablau-tabs
      v-if="jobApp"
      v-model="currentTab"
      :style="{ 'margin-top': jobApp ? 0 : 30 }"
    >
      <!--      <el-tab-pane label="任务详情" name="detail"></el-tab-pane>-->
      <el-tab-pane label="任务调度" name="scheduler"></el-tab-pane>
      <!--      <el-tab-pane
        label="任务历史"
        name="log"
      ></el-tab-pane>-->
    </datablau-tabs>
    <!--    <job-detail-page
      v-if="currentTab === 'detail'"
      :raw-data="data"
      :jobApp="jobApp"
    ></job-detail-page>-->
    <job-scheduler-page
      v-if="currentTab === 'scheduler'"
      :raw-data="data"
      :jobApp="jobApp"
      :jobType="jobType"
    ></job-scheduler-page>
  </div>
</template>
<script>
import JobDetailPage from './jobDetail.vue'
import JobLogPage from './jobLog.vue'
import JobSchedulerPage from './jobScheduler.vue'
export default {
  components: {
    JobDetailPage,
    JobSchedulerPage,
    JobLogPage,
  },
  props: {
    data: {},
    /* currentTabInitial: {
      default: 'scheduler',
    }, */
    jobApp: {
      default: null,
    },
    jobType: {
      default: '',
    },
  },
  data() {
    return {
      currentTab: 'scheduler',
    }
  },
  mounted() {
    console.log(this.data, this.jobType)
  },
  methods: {
    close() {
      if (this.$route.query.blank) {
        window.close()
      }
      this.$emit('close')
    },
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
}
</script>
<style lang="scss" scoped>
.form-value {
  line-height: 38px;
}
::v-deep .el-tabs.el-tabs--top {
  display: none;
}
</style>
