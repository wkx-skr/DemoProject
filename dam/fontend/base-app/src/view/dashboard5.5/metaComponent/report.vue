<template>
  <div
    @click="goPreview('reportFormManage')"
    class="grid-content card bg-purple"
  >
    <div class="card-inner">
      <div class="cardTop">
        <div class="card-icon">
          <div class="cardIcon" style="background-color: #956bfe">
            <i class="icon-total"></i>
          </div>
        </div>
        <div class="center">
          <div class="title">
            {{ $version.dashboard.report }}
          </div>
          <div class="number">
            {{ dashboardData.dataReportCnt | lineageData }}
          </div>
        </div>
      </div>
      <div class="data">
        <p>
          {{ $t('common.page.glossary') }}：
          <span class="cardData">
            {{ dashboardData.namingStandardCnt | lineageData }}
          </span>
        </p>
        <p>
          {{ $t('common.page.indexMenu') }}：
          <span class="cardData">
            {{ dashboardData.meCodeCnt | lineageData }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import base from './base'
export default {
  name: 'report',
  mixins: [base],
}
</script>

<style scoped lang="scss">
@import './style';
</style>
