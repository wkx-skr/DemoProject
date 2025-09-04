<template>
  <div @click="goPreview('modelCategory')" class="card" ref="card">
    <div class="card-inner">
      <div class="cardTop">
        <div class="card-icon">
          <div class="cardIcon">
            <i class="icon-business"></i>
          </div>
        </div>
        <div class="center">
          <div class="title">
            {{ $t('common.page.modelCategory') }}
          </div>
          <div class="number">
            {{ dashboardData.modelCategoryCnt | lineageData }}
          </div>
        </div>
      </div>
      <div class="data">
        <p>
          {{ $version.dashboard.accessRate }}：
          <span class="cardData">
            {{ dashboardData.usedPecent | lineageDataPer }}
          </span>
        </p>
        <p>
          {{ $version.dashboard.dataJobs }}：
          <span class="cardData">
            {{ dashboardData.lineageCnt | lineageData }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import base from './base'
export default {
  name: 'modelCategory',
  mixins: [base],
}
</script>

<style scoped lang="scss">
@import './style';
</style>
