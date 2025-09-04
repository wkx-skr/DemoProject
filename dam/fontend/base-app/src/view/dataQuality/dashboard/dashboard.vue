<template>
  <div :style="style.container" v-loading="loading">
    <grid-layout
      v-if="countingData && detailData"
      :layout.sync="layout"
      :col-num="20"
      :row-height="30"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[20, 20]"
      :use-css-transforms="false"
    >
      <grid-item
        v-for="item in layout.slice(0, 6)"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
      >
        <problem-statistics
          v-if="item.i === 'problemStatistics'"
          :data="countingData.allQualityCount"
        ></problem-statistics>
        <rule-statistics
          v-else-if="item.i === 'ruleStatistics'"
          :root-data="countingData.ruleQualityCount"
        ></rule-statistics>
        <system-statistics
          v-else-if="item.i === 'systemStatistics'"
          :root-data="countingData.categoryQualityCount"
        ></system-statistics>
        <repair-job-statistics
          v-else-if="item.i === 'repairJobStatistics'"
          :root-data="countingData.taskQualityCount"
        ></repair-job-statistics>
        <other-statistics
          v-else-if="item.i === 'otherStatistics'"
          :root-data="countingData.jobCount ? countingData.jobCount : {}"
        ></other-statistics>
        <problem-detail
          v-else-if="item.i === 'problemDetail'"
          :root-data="detailData"
        ></problem-detail>
        <important-problem
          v-else-if="item.i === 'importantProblem'"
          :root-data="detailData.filter(i => i.important)"
        ></important-problem>
        <top-person
          v-else-if="item.i === 'topPerson'"
          :root-data="countingData.userTop"
          :nameMapping="nameMapping"
        ></top-person>
      </grid-item>
      <!-- <grid-item
        v-for="item in layout.slice(6)"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i">
      </grid-item> -->
    </grid-layout>
  </div>
</template>

<script>
import dashboard from './dashboard.js'
export default dashboard
</script>

<style scoped lang="scss">
@import './dashboard';
</style>
