<template>
  <div
    class="dashboardAsset"
    v-loading="loading"
    style="width: 100%; height: 100%"
  >
    <!-- 数据资产dashboard -->
    <dashboard-main
      :dashboard-properties="displayDashboardProperties"
      :marginLeft="'17px'"
      :from="'dataAsset'"
      :options="options"
      :min="80"
    ></dashboard-main>
  </div>
</template>

<script>
import * as dashboardProperties from '../api/dataAssetDashboard.js'
import dashboardMain from '../container/main.vue'
import HTTP from '@/view/dataAsset/utils/api.js'
export default {
  components: {
    dashboardMain,
  },
  data() {
    return {
      options: [],
      loading: false,
    }
  },
  computed: {
    displayDashboardProperties() {
      const defaultComponents = dashboardProperties.defaultComponents
      if (!this.$featureMap.FE_QUALITY) {
        defaultComponents.splice(
          defaultComponents.findIndex(item => item === 'qualityProblemRate'),
          1
        )
        defaultComponents.splice(
          defaultComponents.findIndex(
            item => item === 'qualityProblemRateByCatalog'
          ),
          1
        )
      }
      if (!this.$featureMap.FE_SECURITY) {
        defaultComponents.splice(
          defaultComponents.findIndex(item => item === 'securityLevelRatio'),
          1
        )
      }
      return {
        ...dashboardProperties,
        defaultComponents,
      }
    },
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
