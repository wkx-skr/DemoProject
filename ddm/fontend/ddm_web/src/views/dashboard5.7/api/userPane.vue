<template>
  <div class="userPane" v-if="dashboardProperties">
    <!-- <span class="sub-title">个人工作台</span> -->
    <dashboard-main
      :dashboard-properties="dashboardProperties"
      :componentsCustomSize="componentsCustomSize"
      v-if="showDashboard"
    ></dashboard-main>
  </div>
</template>

<script>
import * as dashboardProperties from './userPaneDashboard.ts'

import dashboardMain from '../container/main.vue'

export default {
  name: 'userPane',
  components: {
    dashboardMain
  },
  data () {
    return {
      dashboardProperties: null,
      showDashboard: false,
      componentsCustomSize: {}
    }
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      let properties = JSON.parse(JSON.stringify(dashboardProperties))
      this.showDashboard = false
      if (!this.$store.state.featureMap.ddm_Messages) {
        _.pull(properties.defaultComponents, 'dashboardMyMessage')
        _.pull(properties.selectableComponents, 'dashboardMyMessage')
        this.componentsCustomSize = {
          dashboardMyReport: {
            width: 3,
            height: 8
          }
        }
      } else {
        this.componentsCustomSize = {
          dashboardMyReport: {
            width: 3,
            height: 4
          }
        }
      }
      this.dashboardProperties = properties
      this.showDashboard = true
    }
  },
  watch: {
    '$store.state.featureMap.ddm_Messages' () {
      this.dataInit()
    }
  }
}
</script>

<style lang="scss" scoped>
.userPane {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  //.sub-title {
  //  width: 90px;
  //  height: 25px;
  //  font-size: 18px;
  //  font-weight: 500;
  //  color: #555555;
  //  line-height: 25px;
  //}
}
</style>
