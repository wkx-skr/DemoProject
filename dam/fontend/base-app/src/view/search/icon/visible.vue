<template>
  <span style="display: inline-block; vertical-align: top" @click="changeState">
    <img :class="{ visible: visible }" :src="visibleIcon" alt="" />
    <img :class="{ visible: !visible }" :src="invisibleIcon" alt="" />
  </span>
</template>

<script>
export default {
  props: {
    isVisible: {},
  },
  mounted() {},
  data() {
    return {
      visibleIcon: require('./visible.svg'),
      invisibleIcon: require('./invisible.svg'),
      visible: this.isVisible,
    }
  },
  model: {
    prop: 'isVisible',
    event: 'change',
  },
  methods: {
    changeState() {
      this.visible = !this.visible
      this.$emit('change', this.visible)
    },
  },
}
</script>

<style scoped lang="scss">
img {
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease-out 0s;
}
img:not(.visible) {
  display: none;
}
img.visible {
  opacity: 1;
}
</style>
