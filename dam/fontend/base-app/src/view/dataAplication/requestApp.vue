<template>
  <div class="apply-overview-app">
    <list v-if="showList" @showDetail="showDetail"></list>
    <detail
      style="padding-left: 20px"
      v-if="!showList"
      modeType="requestApp"
      :detailData="detailData"
    ></detail>
  </div>
</template>
<script>
import detail from './applyOverview/detail.vue'
import list from './requestApp/list.vue'
export default {
  name: 'requestApp',
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
.apply-overview-app {
  position: relative;
  height: 100%;
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0);
  background-color: white;
}
</style>
