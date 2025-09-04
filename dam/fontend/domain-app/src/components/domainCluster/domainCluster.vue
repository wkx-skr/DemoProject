<template>
  <div style="background: #fff">
    <!-- <datablau-page-title
      :parent-name="$t('common.page.dataIntelligence')"
      :name="$t('common.page.domainCluster')"
      v-if="showHome"
    ></datablau-page-title> -->
    <datablau-breadcrumb
      style="
        height: 40px;
        background: #fff;
        display: flex;
        align-items: center;
        margin: 0 20px;
      "
      :node-data="breadcrumbData"
      :separator="'/'"
      :couldClick="false"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>
    <div class="data-cluster" style="overflow-y: auto">
      <cluster-result
        v-show="currentShowPageName === 'dataCluster' || showHome === true"
        @addItemTab="addItemTab"
        @refreshResultOk="refreshResultOk"
        @addJobTab="addJobTab"
        class="cluster-result"
        ref="dataCluster"
        :allDataLoading="allDataLoading"
        :columnsSort="columnsSort"
        :getColumnsData="getColumnsData"
        :getPrecision="getPrecision"
      ></cluster-result>
      <!-- </div> -->
      <div v-if="currentShowPageName !== 'dataCluster' && showHome === false">
        <cluster-item
          v-if="currentShowPageName === 'clusterItem'"
          :clusterData="currentShowPageData.clusterData"
          :ref="currentShowPageData.name"
          :key="'clus' + currentShowPageData.clusterId"
          :id="currentShowPageData.clusterId"
          :propDomainId="currentShowPageData.propDomainId"
          :allDataLoading="allDataLoading"
          :columnsSort="columnsSort"
          :getColumnsData="getColumnsData"
          :getPrecision="getPrecision"
          @createDom="handleCreateDom"
        ></cluster-item>
        <!-- @removeItemColumn="handleRemoveItemColumn" -->
        <create-domain
          v-if="currentShowPageName === 'createDomain'"
          :ref="currentShowPageData.name"
          :key="'creDom' + currentShowPageData.columnId"
          :columnData="currentShowPageData.columnData"
          :creDomOpt="creDomOpt"
          :udps="udps"
          :id="currentShowPageData.columnId"
          :clusterId="currentShowPageData.clusterId"
          :selectionColumns="currentShowPageData.selectionColumns"
          :getColumnsData="getColumnsData"
          :getPrecision="getPrecision"
          @handleCreateDomain="handleDomainCreated"
          :columnTabArr="columnTabArr"
          @back="closeDomin"
        ></create-domain>
        <!--TODO i18n-->
        <domain-job
          v-if="currentShowPageName === 'jobDetail'"
          :jobId="currentJobId"
          job-type="数据标准-聚合推荐数据标准任务"
        ></domain-job>
        <!--        <job-detail
          :job="cluJob"
          v-if="currentShowPageName === 'jobDetail'"
          ref="jobDetail"
          @runJob="handleRunJob"
          @pageJob="getJob"
        ></job-detail>-->
      </div>
      <!-- </datablau-tabs> -->
    </div>
  </div>
</template>

<script>
import domainCluster from './domainCluster.js'
export default domainCluster
</script>

<style lang="scss">
@import '~@/next/components/basic/color.sass';
.row-page-info {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 30px;
  height: 50px;
  padding-left: 26px;
  margin-right: -20px;
  margin-left: -30px;
  overflow-x: visible;
  overflow-y: hidden;
  line-height: 50px;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);

  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: middle;
    background: $primary-color;
  }

  .footer-row-info {
    margin-right: 10px;

    &::before {
      margin-right: 5px;
      margin-left: -13px;
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      line-height: 13px;
      color: white;
      vertical-align: middle;
      content: '\e6da';
    }
  }
}
.data-cluster {
  background: var(--white-grey-bgc);
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0;
  left: 0;
  padding-top: 20px;
  .datablau-tabs > .el-tabs {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: var(--white-grey-bgc);
  }
  .datablau-tabs > .el-tabs > .el-tabs__header {
    margin: 0 20px;
    height: 28px;
    // border-bottom: 1px solid;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      bottom: -4px;
      background: #ddd;
    }
  }
  .datablau-tabs.hideTab .el-tabs__header {
    display: none !important;
  }
  .datablau-tabs > .el-tabs > .el-tabs__content {
    position: absolute;
    top: 40px;
    right: 0;
    bottom: 0;
    left: 0;
    border-top: none;
    overflow: auto;
    overflow-x: hidden;
  }
  .datablau-tabs.hideTab .el-tabs > .el-tabs__content {
    top: 0;
  }
  .rightView {
    position: relative;
  }
  .job-detail-buttons {
    // position: absolute;
    // bottom: -20px;
    // left: 0;
  }
}
</style>
