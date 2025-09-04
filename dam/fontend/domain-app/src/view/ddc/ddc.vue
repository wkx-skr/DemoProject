<template>
  <div class="ddc-root">
    <router-view></router-view>
  </div>
</template>

<script>
require('@/assets/styles/baseForDDC.scss')
export default {
  data() {
    return {}
  },
  components: {},
  computed: {},
  beforeCreate() {
    this.$globalData.$isDam = false
    $('body').removeClass('body-for-dam')
  },
  mounted() {},
  beforeDestroy() {
    this.$globalData.$isDam = true
    $('body').addClass('body-for-dam')
  },
  methods: {},
  watch: {},
}
</script>

<style lang="scss" scoped></style>
