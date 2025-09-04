<template>
  <div class="rule-impl" :class="color">
    {{ label }}
  </div>
</template>

<script>
export default {
  props: {
    type: {
      required: true,
      type: String,
    },
  },
  computed: {
    color() {
      switch (this.type) {
        case 'Regex':
          return 'blue'
        case 'Groovy':
          return 'yellow'
        default:
          break
      }
    },
    label() {
      switch (this.type) {
        case 'Regex':
          return '正则表达式'
        default:
          return this.type
      }
    },
  },
}
</script>

<style scoped lang="scss">
.rule-impl {
  width: 80px;
  height: 20px;
  border-width: 1px;
  border-style: solid;
  border-radius: 2px;
  text-align: center;
  line-height: 18px;
  border-color: #9d5cce;
  color: #9d5cce;
  &.yellow {
    border-color: #ceb170;
    color: #ceb170;
  }
  &.blue {
    border-color: #7591d0;
    color: #7591d0;
  }
}
</style>
