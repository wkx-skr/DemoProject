<template>
  <div class="model-item-title">
    <span class="title-text"><slot></slot></span>
  </div>
</template>

<script>
export default {
  name: 'modelItemTitle',
  data () {
    return {}
  },
  props: {},
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.model-item-title {
  height: 32px;
  position: relative;

  .title-text {
    display: inline-block;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 16px;
    line-height: 16px;
    font-size: 16px;
  }
}
</style>
