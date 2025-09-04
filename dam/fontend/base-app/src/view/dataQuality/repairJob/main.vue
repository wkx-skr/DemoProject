<template>
  <div>
    <datablau-page-title
      class="page-title-row2"
      :parent-name="$t('common.page.dataQuality')"
      :name="
        isCheck
          ? $t('common.page.dataQualityCheck')
          : isMonitor
          ? $t('common.page.dataQualityMonitor')
          : $t('common.page.dataQualityRepairJob')
      "
      :refreshCallback="refreshCallback"
    ></datablau-page-title>
    <div>
      <div
        class="citic-card-tabs"
        style="background: var(--default-bgc); overflow: auto"
      >
        <job-list
          :is-monitor="isMonitor"
          :is-check="isCheck"
          ref="jobList"
          @loadQualityJobs="loadQualityJobs"
          :total="total"
          :jobsDisplay="jobsDisplay"
          :defaultPara="defaultPara"
          :isOwner="isOwner"
          @saveNameMapping="saveNameMapping"
        ></job-list>
        <!-- <el-tabs
          type="card"
          v-model="currentTab"
          :class="{ hideTab: !showTabs }"
          @tab-remove="removeTab"
        >
          <el-tab-pane
            :label="$version.nav.dataQualityRepairJob"
            name="jobList"
          >
            <job-list
              :is-monitor="isMonitor"
              :is-check="isCheck"
              ref="jobList"
              @loadQualityJobs="loadQualityJobs"
              :total="total"
              :jobsDisplay="jobsDisplay"
              :defaultPara="defaultPara"
              :isOwner="isOwner"
              @saveNameMapping="saveNameMapping"
            ></job-list>
          </el-tab-pane>
          <el-tab-pane
            key="addJob"
            label="创建问题"
            name="add"
            closable
            v-if="showAddPane"
          >
            <job-detail></job-detail>
          </el-tab-pane>
          <el-tab-pane
            v-for="job in jobsArray"
            :key="job.name"
            :label="job.name"
            closable
            :name="job.name"
          >
            <job-detail
              :is-monitor="isMonitor"
              :is-check="isCheck"
              :details="job"
              :nameMapping="nameMapping"
              :canSave="canSave"
            ></job-detail>
          </el-tab-pane>
          <el-tab-pane
            label="查看问题数据"
            name="showProblemData"
            closable
            v-if="showProblemDataPane"
          >
            <show-problem-data
              :taskId="taskId"
              :task="task"
              :isCheck="isCheck"
              :isMonitor="isMonitor"
            ></show-problem-data>
          </el-tab-pane>
        </el-tabs> -->
      </div>
    </div>

    <div class="showProblemData" v-if="showProblemDataPane">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="nodeClickTaskName"
        ></datablau-breadcrumb>
      </div>
      <job-detail v-if="showName === 'add'"></job-detail>
      <job-detail
        :is-monitor="isMonitor"
        :is-check="isCheck"
        :details="jobData"
        :nameMapping="nameMapping"
        :canSave="canSave"
        v-if="showName === 'seedetail'"
      ></job-detail>
      <show-problem-data
        v-if="showName === 'seetask'"
        :taskId="taskId"
        :task="task"
        :isCheck="isCheck"
        :isMonitor="isMonitor"
      ></show-problem-data>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style></style>
<style lang="scss" scoped>
.page-title-row {
  padding-top: 8px;
  line-height: 24px;
}
.showProblemData {
  background: #fff;
  position: absolute;
  width: 100%;
  z-index: 12;
  top: 0;
  bottom: 0;
  .model-item-page-title {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 9;
    height: 40px;
    margin: 0 20px;
    font-size: 16px;
    // line-height: 40px;
    padding-top: 8px;
    background: var(--default-bgc);
    border-bottom: 1px solid var(--border-color-lighter);
    // border-bottom: 1px solid red;
    button {
      margin-top: 8px;
    }
    .item-title {
      font-size: 18px;
    }
    .bottom-line {
      position: absolute;
      right: 20px;
      bottom: 0;
      left: 20px;
      display: inline-block;
      border-bottom: 1px solid #ddd;
    }
  }
}
</style>
