<template>
  <div class="datablau-tag">
    <el-tag
      ref="datablautag"
      v-bind="$attrs"
      v-on="$listeners"
      :test-name="testName"
    >
      <slot></slot>
    </el-tag>
  </div>
</template>
<script>
export default {
  props: {
    testName: String,
  },
  name: 'DatablauTag',
  data() {
    return {}
  },
  methods: {},
}
</script>
<style lang="scss" scoped>
@import '../../basic/color.sass';
.datablau-tag {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 10px;
  .el-tag {
    border-radius: 2px;
  }
}
</style>
