<template>
  <!-- 逾期问题记录数 -->
  <div class="box-part2">
    <div class="box-left">
      <img src="./img/overdue.png" alt="" />
    </div>
    <div class="box-right">
      <div class="quantity">
        <p>{{ overProblemDataNum }}</p>
        <span>{{ $t('quality.page.qualityDashboardNew.strip') }}</span>
      </div>
      <p class="quantity-title">
        {{ $t('quality.page.qualityDashboardNew.overdueIssueRecords') }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'overdueIssuesNum',
  components: {},
  data() {
    return {
      overProblemDataNum: null,
    }
  },

  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.overProblemDataNum =
        data.mainCount.overProblemDataNum.toLocaleString()
    })
  },

  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
  },
}
</script>
<style scoped lang="scss">
@import './public.scss';
</style>
