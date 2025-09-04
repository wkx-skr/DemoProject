<template>
  <div :style="style.container" v-loading="loading">
    <el-dialog
      title="新增模块"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
    >
      <el-form label-position="right" label-width="6em" size="small">
        <el-form-item label="类型">
          <el-radio v-model="dialog.componentType" label="topLine">
            顶部小型模块
          </el-radio>
          <el-radio v-model="dialog.componentType" label="left">
            左侧宽型模块
          </el-radio>
          <el-radio v-model="dialog.componentType" label="right">
            右侧窄型模块
          </el-radio>
        </el-form-item>
        <el-form-item label="模块">
          <el-select
            v-if="dialog.componentType === 'topLine'"
            v-model="dialog.component"
            style="width: 360px"
          >
            <el-option
              v-for="i in topCanSelect"
              :key="i"
              :label="$version.dashboard[i]"
              :value="i"
            ></el-option>
          </el-select>
          <el-select
            v-if="dialog.componentType === 'left'"
            v-model="dialog.component"
            style="width: 360px"
          >
            <el-option
              v-for="i in fullMap.left.filter(item => {
                return !layoutMap.left.includes(item)
              })"
              :key="i"
              :label="$version.dashboard[i]"
              :value="i"
            ></el-option>
          </el-select>
          <el-select
            v-if="dialog.componentType === 'right'"
            v-model="dialog.component"
            style="width: 360px"
          >
            <el-option
              v-for="i in fullMap.right.filter(item => {
                return !layoutMap.right.includes(item)
              })"
              :key="i"
              :label="$version.dashboard[i]"
              :value="i"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="!dialog.component"
            type="primary"
            size="small"
            @click="processAddComponent"
          >
            应用
          </el-button>
          <el-button size="small" @click="closeDialog">关闭</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div
      v-if="
        layoutMap &&
        layoutMap.topLine.length === 0 &&
        layoutMap.left.length === 0 &&
        layoutMap.right.length === 0
      "
      style="text-align: center; margin-top: 200px"
    >
      <span v-if="isAdmin">暂无模块，请配置驾驶舱</span>
      <span v-else>暂无模块，如有需要，请联系管理员配置驾驶舱</span>
      <br />
      <br />
      <el-button v-if="isAdmin" size="small" @click="resetLayout('empty')">
        默认布局
      </el-button>
      <el-button v-if="isAdmin" size="small" @click="addComponent(null)">
        新增模块
      </el-button>
    </div>
    <div
      v-if="countingData && dashboardData && detailData && layoutMap"
      :style="style.top"
    >
      <div v-for="item in layoutMap.topLine" :style="topStyle">
        <problem-statistics
          v-if="item === 'problemStatistics'"
          :data="countingData.allQualityCount"
        ></problem-statistics>
        <rule-statistics
          v-else-if="item === 'ruleStatistics'"
          :root-data="countingData.ruleQualityCount"
        ></rule-statistics>
        <system-statistics
          v-else-if="item === 'systemStatistics'"
          :root-data="countingData.categoryQualityCount"
        ></system-statistics>
        <repair-job-statistics
          v-else-if="item === 'repairJobStatistics'"
          :root-data="countingData.taskQualityCount"
        ></repair-job-statistics>
        <other-statistics
          v-else-if="item === 'otherStatistics'"
          :root-data="countingData.jobCount ? countingData.jobCount : {}"
        ></other-statistics>
        <model-category
          v-else-if="item === 'modelCategory'"
          :dashboard-data="dashboardData"
        ></model-category>
        <data-source
          v-else-if="item === 'dataSource'"
          :dashboard-data="dashboardData"
        ></data-source>
        <rule
          v-else-if="item === 'rule'"
          :dashboard-data="dashboardData"
        ></rule>
        <report
          v-else-if="item === 'report'"
          :dashboard-data="dashboardData"
        ></report>
        <domain
          v-else-if="item === 'domain'"
          :dashboard-data="dashboardData"
        ></domain>
      </div>
    </div>
    <div :style="style.bottom" v-if="countingData && detailData && layoutMap">
      <div :style="style.leftContainer" :class="{ 'no-right': noRight }">
        <div v-for="item in layoutMap.left" :style="style.leftItem">
          <problem-detail
            style="height: 730px; position: relative"
            v-if="item === 'problemDetail'"
            :root-data="detailData"
          ></problem-detail>
          <catalog-count-list
            style="position: relative; height: 730px"
            v-else-if="item === 'systemAsset'"
            :getData="getCatalogCount"
            from5dot5
          ></catalog-count-list>
        </div>
      </div>
      <div :style="style.rightContainer">
        <div :style="style.rightItem" v-for="item in layoutMap.right">
          <important-problem
            v-if="item === 'importantProblem'"
            :root-data="detailData.filter(i => i.important)"
            style="height: 410px; position: relative"
          ></important-problem>
          <top-person
            v-else-if="item === 'topPerson'"
            :root-data="countingData.userTop"
            style="height: 730px; position: relative"
          ></top-person>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dashboard from './dashboard.js'
export default dashboard
</script>
<style scoped>
.no-right {
  width: 100% !important;
}
</style>
