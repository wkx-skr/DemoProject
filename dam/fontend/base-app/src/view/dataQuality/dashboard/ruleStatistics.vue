<template>
  <div>
    <item-statistics
      :title="$t('quality.page.dataQualityDashboard.ruleStatistics')"
      :data="data"
      v-if="
        this.$auth['QUALITY_TECHNICAL_REGULATION_VIEW_MY'] ||
        this.$auth['QUALITY_TECHNICAL_REGULATION_VIEW_ALL']
      "
      router-name="qualityRule"
      from="ruleStatistics"
    ></item-statistics>
    <item-statistics
      :title="$t('quality.page.dataQualityDashboard.ruleStatistics')"
      :data="data"
      v-else
      router-name=""
      from="ruleStatistics"
    ></item-statistics>
  </div>
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
  methods: {},
  data() {
    return {
      data: [
        {
          name: this.$t('quality.page.dataQualityDashboard.dataQualityRules'),
          count: this.rootData.ruleQualityCount.businessQualityCount,
          color: 1,
        },
        {
          name: this.$t('quality.page.dataQualityDashboard.qualityRule'),
          count: this.rootData.ruleQualityCount.techQualityCount,
          color: 2,
        },
      ],
    }
  },
}
</script>
