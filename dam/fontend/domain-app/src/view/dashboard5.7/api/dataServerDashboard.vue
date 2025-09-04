<template>
  <dashboard-main :dashboard-properties="dashboardProperties"></dashboard-main>
</template>

<script>
import * as dashboardProperties from '@/view/dashboard5.7/api/dataServerDashboard.ts'
import dashboardMain from '@/view/dashboard5.7/container/main.vue'

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
