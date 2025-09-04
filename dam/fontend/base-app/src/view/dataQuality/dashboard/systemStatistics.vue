<template>
  <item-statistics
    :title="$t('quality.page.dataQualityDashboard.systemStatistics')"
    :data="data"
    :number="rootData.categoryQualityCount.detectedCategoryCount"
    :router-name="
      $auth['QUALITY_CHECK_TASK_VIEW_MY'] || $auth['QUALITY_CHECK_TASK_VIEW_ALL']
        ? 'qualityExamineJob'
        : ''
    "
    from="systemStatistics"
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
          name: this.$t('quality.page.dataQualityDashboard.monitored'),
          count: this.rootData.categoryQualityCount.detectedCategoryCount,
          color: 1,
        },
        {
          name: this.$t('quality.page.dataQualityDashboard.notMonitored'),
          count: this.rootData.categoryQualityCount.undetectedCategoryCount,
          color: 0,
        },
      ],
    }
  },
}
</script>
