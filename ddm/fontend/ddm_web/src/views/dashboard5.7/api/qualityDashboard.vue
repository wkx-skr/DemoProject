<template>
  <div
    class="qualityDashboard"
    v-loading="loading"
    style="width: 100%; height: 100%"
  >
    <dashboard-main
      :dashboard-properties="dashboardProperties"
      :min="80"
    ></dashboard-main>
  </div>
</template>

<script>
import * as dashboardProperties from './qualityDashboard.ts'
import dashboardMain from '../container/main.vue'

export default {
  components: {
    dashboardMain
  },
  data () {
    return {
      dashboardProperties: dashboardProperties,
      loading: true
    }
  },
  beforeDestroy () {
    this.$bus.$off('dashboardLoading')
  },
  mounted () {
    this.$bus.$on('dashboardLoading', data => {
      this.loading = data
    })
  }
}
</script>
