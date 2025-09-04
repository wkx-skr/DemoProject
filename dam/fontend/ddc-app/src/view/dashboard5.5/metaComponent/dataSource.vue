<template>
  <div @click="goPreview('dataSource')" class="grid-content card bg-purple">
    <div class="card-inner">
      <div class="cardTop">
        <div class="card-icon">
          <div class="cardIcon" style="background-color: #f9785c">
            <i class="icon-dataSource"></i>
          </div>
        </div>
        <div class="center">
          <div class="title">
            {{ $version.dashboard.dataSource }}
          </div>
          <div class="number">{{ dashboardData.modelCnt | lineageData }}</div>
        </div>
      </div>
      <div class="data">
        <p>
          {{ $version.dataCatalog.table }}：
          <span class="cardData">
            {{ dashboardData.tableCnt | lineageData }}
          </span>
        </p>
        <p>
          {{ $version.dataCatalog.column }}：
          <span class="cardData">
            {{ dashboardData.columnCnt | lineageData }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import base from './base'
export default {
  name: 'dataSource',
  mixins: [base],
}
</script>

<style scoped lang="scss">
@import './style';
</style>
