<template>
  <div
    @click="goPreview('dataQualityRules')"
    class="grid-content card bg-purple"
  >
    <div class="card-inner">
      <div class="cardTop">
        <div class="card-icon">
          <div class="cardIcon" style="background-color: #54d086">
            <i class="icon-standard"></i>
          </div>
        </div>
        <div class="center">
          <div class="title">
            {{ $version.dashboard.rule }}
          </div>
          <div class="number">
            {{
              (Number.parseInt(dashboardData.buRuleCnt) +
                Number.parseInt(dashboardData.techRuleCnt))
                | lineageData
            }}
          </div>
        </div>
      </div>
      <div class="data">
        <p>
          {{ $version.dashboard.buRule }}：
          <span class="cardData">
            {{ dashboardData.buRuleCnt | lineageData }}
          </span>
        </p>
        <p>
          {{ $version.dashboard.teRule }}：
          <span class="cardData">
            {{ dashboardData.techRuleCnt | lineageData }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import base from './base'
export default {
  name: 'rule',
  mixins: [base],
}
</script>

<style scoped lang="scss">
@import './style';
</style>
