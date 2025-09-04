<template>
  <div class="datablau-rate">
    <el-rate
      v-model="$attrs.value"
      v-bind="$attrs"
      v-on="$listeners"
      :test-name="testName"
    ></el-rate>
  </div>
</template>

<script>
export default {
  name: 'DatablauRate',
  props: {
    testName: String,
  },
  data() {
    return {}
  },
  beforeMount() {},
  mounted() {},
  methods: {},
  computed: {},
  created() {},
  watch: {},
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';
</style>
<style lang="scss" scoped>
/deep/ .el-rate__item {
  .el-rate__icon {
    margin-right: 0px;
  }
}
</style>
