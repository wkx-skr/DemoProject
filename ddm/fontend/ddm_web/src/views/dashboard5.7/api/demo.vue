<template>
  <dashboard-main :dashboard-properties="dashboardProperties"></dashboard-main>
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
      dashboardProperties: dashboardProperties
    }
  }
}
</script>
