<template>
  <div>
    <dashboard-main
      :dashboard-properties="displayDashboardProperties"
    ></dashboard-main>
  </div>
</template>

<script>
import * as dashboardProperties from '../api/dataCatalogDashboard.ts'
import dashboardMain from '../container/main.vue'
export default {
  components: {
    dashboardMain,
  },
  data() {
    return {
      dashboardProperties: dashboardProperties,
    }
  },
  mounted() {},
  methods: {},
  computed: {
    displayDashboardProperties() {
      const defaultComponents = dashboardProperties.defaultComponents
      console.log(this.$featureMap.FE_DOMAIN)
      if (!this.$featureMap.FE_DOMAIN) {
        defaultComponents.splice(
          defaultComponents.findIndex(item => item === 'domain'),
          1
        )
      }
      return {
        ...dashboardProperties,
        defaultComponents,
      }
    },
  },
}
</script>
