<template>
  <dashboard-main :dashboard-properties="dashboardProperties"></dashboard-main>
</template>

<script>
import * as dashboardProperties from '../api/dataServerDashboard.ts'
import dashboardMain from '../container/main.vue'
export default {
  name: 'dataServerDashboard',
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
