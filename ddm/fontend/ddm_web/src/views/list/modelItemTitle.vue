<template>
  <div style="display: inline-block">
    <span class="title-text"><slot>{{ titleText }}</slot></span>
  </div>
</template>

<script>
export default {
  name: 'modelItemTitle',
  data () {
    return {}
  },
  props: {
    titleText: {
      type: String,
      default: ''
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // console.log('dataInit')
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.title-text {
  font-size: 16px;
  color: #555;
  line-height: 1;
}
</style>
