<template>
  <div class="userPane">
    <!-- <span class="sub-title">个人工作台</span> -->
    <dashboard-main
      :dashboard-properties="dashboardProperties"
    ></dashboard-main>
  </div>
</template>

<script>
import * as dashboardProperties from './userPaneDashboard.ts'

import dashboardMain from '../container/main.vue'
export default {
  name: 'userPane',
  components: {
    dashboardMain,
  },
  data() {
    return {
      dashboardProperties: dashboardProperties,
    }
  },
}
</script>

<style lang="scss" scoped>
.userPane {
  position: relative;
  height: 100%;
  .sub-title {
    width: 90px;
    height: 25px;
    font-size: 18px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #555555;
    line-height: 25px;
  }
}
</style>
