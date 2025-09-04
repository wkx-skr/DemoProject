<template>
  <div>
    <datablau-tabs v-if="jobApp" v-model="currentTab" :style="{'margin-top': jobApp ? 40: 30}">
      <el-tab-pane
        :label="$t('domain.dataFind.taskDetail')"
        name="detail"
      >
      </el-tab-pane>
      <el-tab-pane
        :label="$t('common.page.jobScheduler')"
        name="scheduler"
      ></el-tab-pane>
<!--      <el-tab-pane
        label="任务历史"
        name="log"
      ></el-tab-pane>-->
    </datablau-tabs>
    <job-detail-page
      v-if="currentTab === 'detail'"
      :raw-data="data"
      :jobApp="jobApp"
    ></job-detail-page>
    <job-scheduler-page
      v-else-if="currentTab === 'scheduler'"
      :raw-data="data"
      :jobApp="jobApp"
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
    currentTabInitial: {
      default: 'detail'
    },
    jobApp: {
      default: null
    },
  },
  data() {
    return {
      currentTab: this.currentTabInitial
    }
  },
  mounted() {
    console.log(this.data)
  },
  methods: {
    close() {
      this.$emit('close')
    },
  },
  computed: {
    baseUrl() {
      if(this.jobApp === 'metadata') {
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
</style>
