<template>
  <div
    class="dashboardAsset"
    v-loading="loading"
    style="width: 100%; height: 100%"
  >
    数据资产dashboard
    <dashboard-main
      :dashboard-properties="dashboardProperties"
      :marginLeft="'17px'"
      :from="'dataAsset'"
      :options="options"
      :min="80"
    ></dashboard-main>
  </div>
</template>

<script>
import * as dashboardProperties from '../api/dataAssetDashboard.ts'
import dashboardMain from '../container/main.vue'
import HTTP from '@/view/dataAsset/utils/api.js'
export default {
  components: {
    dashboardMain,
  },
  data() {
    return {
      dashboardProperties: dashboardProperties,
      options: [],
      loading: false,
    }
  },
  methods: {
    getStructure() {
      // this.$datablauLoading.loading({ color: '#409EFF' })
      this.loading = true
      HTTP.getStructureList('BROWSE')
        .then(res => {
          this.options = res.data
          // this.$datablauLoading.close()
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          // this.$datablauLoading.close()
          this.loading = false
        })
    },
  },
  mounted() {
    this.getStructure()
  },
}
</script>
<style scoped>
.dashboardAsset {
  width: 100%;
}
</style>
