<template>
  <div>
    <!--<table-details
      :rawData="v"
      :current-model="currentModel"
      :data-by-type="dataByType"
      :isLogicalModel="isDesignModel"
      @updateTabName="updateTabName"
      @updateVersion="updateVersion"
      @updateTableData="updateTableData"
    >
    </table-details>-->
  </div>
</template>

<script>
import tableDetails from '@/views/list/tables/tableDetails.vue'
export default {
  props: {
    item: {
      required: true,
      type: Object
    }
  },
  components: {
    // tableDetails
  },
  data () {
    return {

    }
  },
  methods: {
    getModelInfo () {

    }
  }
}
</script>

<style lang="scss" scoped></style>
