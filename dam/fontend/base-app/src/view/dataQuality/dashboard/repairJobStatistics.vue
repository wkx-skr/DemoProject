<template>
  <item-statistics
    title="修复任务情况"
    :data="data"
    :router-name="
      $auth['QUALITY_ISSUE_LIST_VIEW_MY'] || $auth['QUALITY_ISSUE_LIST_VIEW_ALL']
        ? 'dataQualityRepairJob'
        : ''
    "
    from="repairJobStatistics"
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
          name: '已完成',
          count: this.rootData.taskQualityCount.Complete
            ? this.rootData.taskQualityCount.Complete
            : 0,
          color: 1,
        },
        {
          name: '未完成',
          count: this.rootData.taskQualityCount.Progressing
            ? this.rootData.taskQualityCount.Progressing
            : 0,
          color: 2,
        },
        {
          name: '未开始',
          count: this.rootData.taskQualityCount.Not_Started
            ? this.rootData.taskQualityCount.Not_Started
            : 0,
          color: 0,
        },
      ],
    }
  },
}
</script>
