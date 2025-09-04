<template>
  <dashboard-main :dashboard-properties="dashboardProperties"></dashboard-main>
</template>

<script>
import * as dashboardProperties from '../api/dataStandardDashboard.ts'
import dashboardMain from '../container/main.vue'

export default {
  name: 'dataStandardDashboard',
  data() {
    return {
      dashboardProperties: dashboardProperties,
    }
  },
  components: {
    dashboardMain,
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      // console.log('dataInit')
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
