<template>
  <div :style="{ color: colorFormatter }">
    <span
      class="dot"
      :class="{ detail: source === 'detail' }"
      :style="{ background: colorFormatter }"
    ></span>
    {{ textFormatter }}
  </div>
</template>
<script>
export default {
  props: {
    type: {
      type: Number,
    },
    source: {},
  },
  computed: {
    colorFormatter() {
      switch (this.type) {
        case 0:
          return '#c1c1c1'
        case 1:
          return '#5cb793'
        default:
          return ''
      }
    },
    textFormatter() {
      switch (this.type) {
        case 1:
          return this.$t('quality.page.dataQualityRules.released')
        case 0:
          return this.$t('quality.page.dataQualityRules.notReleased')
        default:
          return ''
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 3.5px;
  margin-right: 0.6em;
  vertical-align: top;
  margin-top: 8px;
  &.detail {
    margin-top: 14px;
  }
  .item & {
    margin-top: 6px;
  }
}
</style>
