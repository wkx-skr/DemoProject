<template>
  <!-- 逾期问题数 -->
  <div class="box-part2">
    <div class="box-left">
      <img src="./img/overdue.png" alt="" />
    </div>
    <div class="box-right">
      <div class="quantity">
        <p>{{ overProblemNum }}</p>
        <span>{{ $t('quality.page.qualityDashboardNew.strip') }}</span>
      </div>
      <p class="quantity-title">
        {{ $t('quality.page.qualityDashboardNew.overdueissues') }}
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
      overProblemNum: null,
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.overProblemNum = data.mainCount.overProblemNum.toLocaleString()
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
