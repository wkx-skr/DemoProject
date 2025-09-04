<template>
  <!-- 全部问题数 -->
  <div class="box-part2">
    <div class="box-left">
      <img src="./img/questionsNum.png" alt="" />
    </div>
    <div class="box-right">
      <div class="quantity">
        <p>{{ totalProblemNum }}</p>
        <span>{{ $t('quality.page.qualityDashboardNew.strip') }}</span>
      </div>
      <p class="quantity-title">
        {{ $t('quality.page.qualityDashboardNew.questionsNum') }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'allQuestionsNum',
  components: {},
  data() {
    return {
      totalProblemNum: null,
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.totalProblemNum = data.mainCount.totalProblemNum.toLocaleString()
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
