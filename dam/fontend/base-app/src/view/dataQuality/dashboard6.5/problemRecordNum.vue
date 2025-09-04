<template>
  <!-- 全部问题记录数 -->
  <div class="box-part2">
    <div class="box-left">
      <img src="./img/questionsNum.png" alt="" />
    </div>
    <div class="box-right">
      <div class="quantity">
        <p>{{ totalProblemDataNum }}</p>
        <span>{{ $t('quality.page.qualityDashboardNew.strip') }}</span>
      </div>
      <p class="quantity-title">
        {{ $t('quality.page.qualityDashboardNew.problemRecords') }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'problemRecordNum',
  components: {},
  data() {
    return {
      totalProblemDataNum: null,
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.totalProblemDataNum =
        data.mainCount.totalProblemDataNum.toLocaleString()
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
