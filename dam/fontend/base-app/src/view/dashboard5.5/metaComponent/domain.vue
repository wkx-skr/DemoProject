<template>
  <div @click="goPreview('dataStandard')" class="grid-content card bg-purple">
    <div class="card-inner">
      <div class="cardTop">
        <div class="card-icon">
          <div class="cardIcon" style="background-color: #2faef3">
            <i class="icon-model"></i>
          </div>
        </div>
        <div class="center">
          <div class="title">
            {{ $version.dashboard.domain }}
          </div>
          <div class="number">{{ dashboardData.domainCnt | lineageData }}</div>
        </div>
      </div>
      <div class="data">
        <p>
          {{ $t('common.page.code') }}：
          <span class="cardData">
            {{ dashboardData.domainCodeCnt | lineageData }}
          </span>
        </p>
        <p>
          {{ $version.dashboard.quote }}：
          <span class="cardData">
            {{ dashboardData.domainAssignmentCnt | lineageData }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import base from './base'
export default {
  name: 'domain',
  mixins: [base],
}
</script>

<style scoped lang="scss">
@import './style';
</style>
