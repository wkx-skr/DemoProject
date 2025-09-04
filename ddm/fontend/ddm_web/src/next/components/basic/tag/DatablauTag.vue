<template>
  <div class="datablau-tag">
    <el-tag ref="datablautag" v-bind="$attrs" v-on="$listeners">
      <slot></slot>
    </el-tag>
  </div>
</template>
<script>
export default {
  props: {},
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

    height: 24px;
    line-height: 24px;
    border: none;
  }
}
</style>
