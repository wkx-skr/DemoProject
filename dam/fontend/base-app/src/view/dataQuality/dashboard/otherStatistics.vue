<template>
  <item-statistics
    :title="$t('quality.page.dataQualityDashboard.otherStatistics')"
    :data="data"
    :router-name="
      $auth['QUALITY_CHECK_TASK_VIEW_MY'] || $auth['QUALITY_CHECK_TASK_VIEW_ALL']
        ? 'qualityExamineJob'
        : ''
    "
    from="otherStatistics"
  ></item-statistics>
</template>
<script>
import itemStatistics from './itemStatistics'
export default {
  components: {
    itemStatistics,
  },
  props: {
    rootData: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      data: [
        {
          name: this.$t('quality.page.dataQualityDashboard.enable'),
          count: this.rootData.jobCount.enabled
            ? this.rootData.jobCount.enabled
            : 0,
          color: 1,
        },
        {
          name: this.$t('quality.page.dataQualityDashboard.disabled'),
          count: this.rootData.jobCount.disabled
            ? this.rootData.jobCount.disabled
            : 0,
          color: 0,
        },
      ],
    }
  },
}
</script>
