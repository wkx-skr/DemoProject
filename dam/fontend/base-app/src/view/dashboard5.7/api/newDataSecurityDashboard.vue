<template>
  <div style="width: 100%; height: 100%">
    <!--数据安全dashboard-->
    <dashboardMain
      :dashboard-properties="newDataSecurityDashboard"
      :min="80"
      :gridsNum="10"
    ></dashboardMain>
  </div>
</template>

<script>
import dashboardMain from '../container/main.vue'
import * as newDataSecurityDashboard from '../api/newDataSecurityDashboard.ts'
export default {
  components: { dashboardMain },
  data() {
    return {
      newDataSecurityDashboard: newDataSecurityDashboard,
    }
  },
  methods: {},
  beforeDestroy() {},
  mounted() {},
}
</script>

<style scoped lang="scss"></style>
