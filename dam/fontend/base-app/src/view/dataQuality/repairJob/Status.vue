<template>
  <div :style="{ color: colorFormatter }">
    <span class="dot" :style="{ background: colorFormatter }"></span>
    {{ textFormatter }}
  </div>
</template>
<script>
export default {
  props: {
    type: {},
  },
  mounted() {},
  computed: {
    colorFormatter() {
      switch (this.type) {
        case 'Not_Started':
          return '#c1c1c1'
        case 'Complete':
          return '#5cb793'
        case 'Progressing':
          return '#4386f5'
        default:
          return ''
      }
    },
    textFormatter() {
      switch (this.type) {
        case 'Complete':
          return '已完成'
        case 'Progressing':
          return '未完成'
        case 'Not_Started':
          return '未开始'
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
  .item & {
    margin-top: 6px;
  }
}
</style>
