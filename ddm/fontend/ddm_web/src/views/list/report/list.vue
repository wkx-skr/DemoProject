<template>
  <div class="report-list-tabs new-style" :class="{'hide-tab-header': !showTabs, 'style-for-single-report': hideList}">
    <div class="title-container" v-if="!showTabs && !hideList">
      <model-item-title :titleText="$store.state.$v.report.reportList"></model-item-title>
    </div>
    <datablau-tabs
      type="card"
      class="report-outer-tabs"
      :class="{hideTab:(!showTabs || hideList)}"
      v-model="currentTab"
      @tab-remove="removeTab"
      @tab-click="clickTab"
      :key="tabsKey"
    >
      <el-tab-pane :label="$store.state.$v.report.reportList" name="list" ref="list" v-if="!hideList">
        <pane-list
          ref="paneList"
          :detail="detail"
          @row-click="handleRowClick"
          @add-report="addReport"
          @row-delete="handldeRowDelete"
        ></pane-list>
      </el-tab-pane>
      <el-tab-pane
        v-for="t in tabs"
        :label="reportsMap[t].name"
        :key="t"
        :name="String(t)"
        :closable="!hideList"
      >
        <span slot="label">
          <datablau-tooltip
            effect="dark"
            :content="reportsMap[t].name"
            placement="top"
            :open-delay="200"
            class="pane-report-header"
          >
            <span class="content">{{ reportsMap[t].name }}</span>
           </datablau-tooltip>
        </span>
        <pane-report
          :current-report="reportsMap[t]"
          :detail="detail"
          :path="currentPath"
          :versions="versions"
          @scan-detail="scanDetail"
          @scan-change="scanChange"
          @scan-domain="scanDomain"
          @show-script-detail="showScriptDetail"
          @updateModelReport="updateModelReport"
          :model-id="detail.id"
          :hideList="hideList"
        ></pane-report>
      </el-tab-pane>
    </datablau-tabs>

    <div class="add-report-container" v-if="addReportVisible">
      <add-report
        :model-id="detail.id"
        :model="detail"
        @close="handleCloseAddReport"
        @reload="reloadReports"
      ></add-report>
    </div>

    <div class="report-detail-item" v-if="showReportDetailItem">
      <div class="detail-container">
        <evalute-report
          v-if="itemType === 'detail' && getCurrentReportPromise"
          :model-id="detail.id"
          :report-name="reportsMap[currentReportId].name"
          :detail="detail"
          :path="currentPath"
          :versions="versions"
          :report-data="reportsMap[currentReportId]"
          :getCurrentReportPromise="getCurrentReportPromise"
          @backToReportList="backToReportList"
        ></evalute-report>
        <change-report
          v-if="itemType === 'change' && getCurrentReportPromise"
          :model-id="detail.id"
          :report-name="reportsMap[currentReportId].name"
          :detail="detail"
          :current-report="reportsMap[currentReportId]"
          :path="currentPath"
          :getCurrentReportPromise="getCurrentReportPromise"
          @backToReportList="backToReportList"
        ></change-report>
        <domain-report
          v-if="itemType === 'domain'"
          :model-id="detail.id"
          :report-name="reportsMap[currentReportId].name"
          :detail="detail"
          :current-report="reportsMap[currentReportId]"
          :path="currentPath"
          :modelVersionMap="modelVersionMap"
          @backToReportList="backToReportList"
        ></domain-report>
        <script-detail
          v-if="itemType === 'script' && getCurrentReportPromise"
          :modelId="detail.id"
          :path="currentPath"
          :reportData="reportsMap[currentReportId]"
          :getCurrentReportPromise="getCurrentReportPromise"
          :model-data="detail"
          @backToReportList="backToReportList"
          @uploadScript="uploadScript"
        ></script-detail>
      </div>
    </div>
  </div>
</template>
<script>
import list from './list'

export default list
</script>
<style scoped lang="scss">
.report-list-tabs.new-style {
  .pane-report-header .content {
    max-width: 300px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    vertical-align: top;
  }
  .add-report-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 2;
  }

  .report-detail-item {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 2;
  }

  /deep/ .hideTab.datablau-tabs {
    .el-tabs__nav > .el-tabs__item:first-child {
      color: #555 !important;

      &::after {
        display: none !important;
      }
    }
  }

  /deep/ .report-outer-tabs.datablau-tabs > .el-tabs {
    position: absolute;
    top: -5px;
    left: 0;
    right: 0;
    bottom: 0;

    & > .el-tabs__header {
      .el-tabs__nav > .el-tabs__item {
        border-left: 1px solid #ddd;

        &.is-active {
          border-color: #409eff;
        }

        &:first-child {
          padding-left: 20px;
          font-size: 16px;
          line-height: 40px;
          border: none !important;
          vertical-align: baseline;
          margin-right: 1px;

          &:after {
            content: '/';
            margin-left: 5px;
            display: inline-block;
            color: #ddd;
          }
        }

        & + .el-tabs__item {
          margin-left: 5px;
        }
      }
    }

    & > .el-tabs__content {
      position: absolute;
      top: 40px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: visible;
    }
  }

  &.hide-tab-header {
    .title-container {
      position: absolute;
      left: 20px;
      top: 8px;
      z-index: 1;
    }

    /deep/ .el-tabs__header {
      display: none;
    }
  }

  &.style-for-single-report {
    /deep/ {
      .el-tabs__header {
        display: none;
      }

      .report-outer-tabs.datablau-tabs > .el-tabs > .el-tabs__content {
        top: 0;
      }
    }
  }
}
</style>
