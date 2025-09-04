<template>
  <div class="examineJob-content">
    <datablau-page-title
      class="page-title-row2"
      :parent-name="$t('common.page.dataQuality')"
      :name="$t('common.page.qualityExamineJobList')"
    ></datablau-page-title>
    <div
      class="citic-card-tabs"
      style="background: var(--default-bgc); overflow: auto"
    >
      <!-- <el-tab-pane v-for="job in jobsArray" :key="job.name" :label="job.name" closable :name="job.name">
          <job-detail :details="job" :rules="rulesIdMap"></job-detail>
        </el-tab-pane> -->
      <!--<el-tab-pane v-for="job in jobsResult" :key="job.name + 'result'" :label="'检测结果:' + job.name" closable :name="'result:' + job.name">-->
      <!--<job-result-->
      <!--:details="job"-->
      <!--:rules="rulesIdMap"-->
      <!--:currentJob="job.name"-->
      <!--:currentJobId="job.id"></job-result>-->
      <!--</el-tab-pane>-->
      <!-- <el-tab-pane
          v-for="job in jobsResult"
          :key="job.name + 'result'"
          :label="'检测结果:' + job.name"
          closable
          :name="'result:' + job.name">
          <j-result
            :job="job"
            :rulesMap="rulesIdMap"
            :rules="rules"
            ref="ruleResultTab"
          ></j-result>
        </el-tab-pane>
        <el-tab-pane
          v-for="job in jobsResult2"
          :key="job.name + 'result'"
          :label="'检测结果:' + job.name"
          closable
          :name="'result:' + job.name">
          <history-result
            :job="job"
            :rulesMap="rulesIdMap"
            :rules="rules"
            :scoreData="scoreData"
            ref="ruleResultTab"
          ></history-result>
        </el-tab-pane>
      </el-tabs> -->
      <job-list
        ref="jobList"
        :moreDetail="jobsArray"
        v-show="showPart === 1"
        :jobListData="jobListData"
        @historyData="historyData"
        @addJobDomain="addJobDomain"
      ></job-list>
    </div>
    <div
      class="our-detail"
      v-if="
        showPart === 2 || showPart === 3 || showPart === 4 || showPart === 5
      "
    >
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeDetail"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <job-detail
        v-if="showPart === 2"
        :details="detail"
        :jobListData="jobListData"
        @toBackList="toBackList"
        @reload-jobs="reloadJobs"
      ></job-detail>
      <job-domainDetail
        v-if="showPart === 5"
        :details="detail"
        :jobListData="jobListData"
        @toBackList="toBackList"
        @reload-jobs="reloadJobs"
      ></job-domainDetail>
      <j-result
        v-if="showPart === 3"
        :job="jobsResult"
        :rulesMap="rulesIdMap"
        ref="ruleResultTab"
        :jobListData="jobListData"
        :historyResult="historyResult"
        @toBackList="toBackList"
        @showJobResult="showJobResult"
      ></j-result>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style lang="scss" scoped>
.examineJob-content {
  .our-detail {
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
}
.problem-part {
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 0;
  right: 0;
  overflow: auto;
}
</style>
