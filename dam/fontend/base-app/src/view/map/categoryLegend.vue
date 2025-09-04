<template>
  <div v-show="show">
    <div style="height: 12px; background-color: #2f2f31">
      <i
        v-if="showContent"
        @click="re"
        class="fa fa-backward"
        style="float: right; cursor: pointer; color: #969696; margin-right: 2px"
      ></i>
      <span v-else style="color: #969696; cursor: pointer" @click="re">
        <span style="position: relative; top: -2px">
          {{ $t('meta.map.legend') }}
        </span>
        <i
          class="fa fa-forward"
          style="
            float: right;
            cursor: pointer;
            color: #969696;
            margin-right: 2px;
          "
        ></i>
      </span>
    </div>
    <div
      style="
        padding: 10px;
        padding-top: 2px;
        z-index: 2;
        position: relative;
        color: #d6d6d6;
      "
      v-show="showContent"
    >
      <div
        v-for="k in zoneMapKeys"
        class="legend-item"
        @click="handleLegendClick(zoneMap[k.name])"
      >
        <div
          :style="{ background: colors[zoneMap[k.name]] }"
          style="
            width: 10px;
            height: 10px;
            border-radius: 3px;
            margin-right: 0.5em;
            position: relative;
            display: inline-block;
          "
        ></div>
        {{ k.name.replace('\uEE99', '') }} ({{ zoneCnt[k.name] }})
        <br />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {
    this.$bus.$on('gotLegend', data => {
      this.colors = data.colors
      this.zoneCnt = data.zoneCnt
      this.zoneMapKeys = data.names
      this.zoneMap = data.zoneMap
      this.show = true
    })
  },
  beforeDestroy() {
    this.$bus.$off('gotLegend')
  },
  data() {
    return {
      colors: [],
      zoneCnt: [],
      zoneMapKeys: [],
      zoneMap: [],
      show: false,
      showContent: true,
    }
  },
  methods: {
    re() {
      this.showContent = !this.showContent
    },
    handleLegendClick(groupId) {
      this.$emit('legend-click', groupId)
    },
  },
}
</script>
<style scoped="scoped" lang="scss">
.legend-item {
  cursor: pointer !important;
  margin-top: 0.5em;
  &:hover {
    color: #fff;
    /*font-weight: bold;*/
  }
}
</style>
