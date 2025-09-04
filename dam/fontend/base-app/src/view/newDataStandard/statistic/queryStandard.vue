<template>
  <div class="query-standard-container">
    <div class="tab-content-box">
      <datablau-tabs
        v-model="activeName"
        @tab-click="handleClick"
        :class="{ hideTab: showStandard }"
      >
        <el-tab-pane :label="$t('domain.queryStandard.domainQuoteCount')" name="standard">
          <theme-detail
            v-if="activeName === 'standard' && !showStandard"
            :themeName="themeValue"
            :standardName="standardValue"
            :systemName="systemValue"
            :domainCodeName="domainCode"
            @showImpactAnalysis="showImpactAnalysis"
            @handleStatisticsRefresh="handleStatisticsRefresh"
          ></theme-detail>
          <impactAnalysis
            v-show="showStandard"
            @back="back"
            :domainObj="domainObj"
          ></impactAnalysis>
        </el-tab-pane>
        <el-tab-pane :label="$t('domain.queryStandard.domainCountByDepartmentAndTheme')" name="department">
          <manage-part
            v-if="activeName === 'department'"
            :departmentName="departmentValue"
            :systemName="systemValue"
            @handleStatisticsRefresh="handleStatisticsRefresh"
          ></manage-part>
        </el-tab-pane>
      </datablau-tabs>
    </div>
  </div>
</template>

<script>
import queryStandard from './queryStandard.js'
export default queryStandard
</script>
<style lang="scss">
.query-standard-container {
  /*min-width: 1200px;*/
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
  width: 100%;
  .tab-content-box {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 20px;
    margin-top: 10px;
    .hideTab {
      .el-tabs__header {
        display: none;
      }
      .el-tabs__content {
        top: -35px;
      }
    }
    .el-tabs__content {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin-top: 20px;
    }
  }
}
.select-system {
  margin: 20px 0 20px 20px;
  min-width: 800px;
}
</style>
