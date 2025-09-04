<template>
  <dashboard-main :dashboard-properties="dashboardProperties"></dashboard-main>
</template>

<script>
import * as dashboardProperties from './fullDashboard.ts'
import dashboardMain from '../container/main.vue'

export default {
  components: {
    dashboardMain
  },
  props: {
    enName: String,
    chName: String
  },
  data () {
    const properties = {}
    Object.keys(dashboardProperties).forEach(k => {
      properties[k] = dashboardProperties[k]
    })
    properties.displayName = this.chName
    properties.dashboardName = 'user-' + this.enName
    return {
      dashboardProperties: properties
    }
  }
}
</script>
