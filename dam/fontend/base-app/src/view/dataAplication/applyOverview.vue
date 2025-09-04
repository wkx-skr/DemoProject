<template>
  <div class="apply-overview">
    <list
      v-if="showList"
      :moudleType="moudleType"
      :componentType="componentType"
      @showDetail="showDetail"
    ></list>
    <detail
      v-if="!showList"
      :moudleType="moudleType"
      :componentType="componentType"
      modeType="applyOverview"
      :detailData="detailData"
    ></detail>
  </div>
</template>
<script>
import detail from './applyOverview/detail.vue'
import list from './applyOverview/list.vue'
export default {
  props: ['moudleType', 'componentType'],
  name: 'applyOverview',
  components: { detail, list },
  mounted() {},

  data() {
    return {
      showList: true,
      detailData: {},
    }
  },
  methods: {
    showDetail(data) {
      this.showList = false
      this.detailData = data
    },
  },
}
</script>
<style lang="scss" scoped>
.apply-overview {
  height: 100%;
  width: 100%;
  padding-left: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0);
  background-color: white;
}
</style>
