<template>
  <div
    :style="{
      position: 'absolute',
      left: '16px',
      right: '16px',
      height: `calc(100vh - ${138 + topH}px)`,
    }"
  >
    <div style="display: table; width: 100%; height: 100%">
      <div class="statistics-info">
        <statistics-info
          v-on="$listeners"
          v-bind="$attrs"
          :statisticsInfo="summaryInfo.statisticsInfo"
        ></statistics-info>
      </div>
      <div class="attr-infos">
        <right-attr-info
          v-on="$listeners"
          v-bind="$attrs"
          :attrs="summaryInfo.attrInfo"
          :isNull="isNull"
        ></right-attr-info>
      </div>
    </div>
  </div>
</template>

<script>
import StatisticsInfo from '../components/statisticsInfo.vue'
import RightAttrInfo from '../components/rightAttrInfo'
export default {
  name: 'SummaryInfo',
  props: {
    summaryInfo: {
      type: Object,
      default() {
        return {
          statisticsInfo: {},
          attrInfo: {},
        }
      },
    },
    topH: {
      type: Number,
      default: 0,
    },
    isNull: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  mounted() {},
  components: { StatisticsInfo, RightAttrInfo },
  methods: {},
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.statistics-info {
  position: absolute;
  top: 0px;
  bottom: 0;
  left: 16px;
  right: 361px;
  overflow: auto;
  transition: all 0.3s;
}
.attr-infos {
  position: absolute;
  top: -10px;
  bottom: -10px;
  right: 0;
  width: 360px;
}
@media screen and (max-width: 1440px) {
  .statistics-info {
    right: 70px;
  }
}
</style>
