<template>
  <div class="datablau-dropdown">
    <el-dropdown
      :test-name="testName"
      v-bind="$attrs"
      v-on="$listeners"
      :placement="$attrs.placement ? $attrs.placement : 'bottom-start'"
    >
      <slot></slot>
      <slot name="dropdown" slot="dropdown"></slot>
    </el-dropdown>
  </div>
</template>
<script>
export default {
  name: 'DatablauDropdown',
  props: {
    testName: String,
  },
}
</script>
<style lang="scss" scoped>
@import '../../basic/color.sass';
.datablau-dropdown {
  /deep/ .el-dropdown-link {
    cursor: pointer;
    color: $primary-color;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
.el-dropdown-menu {
  padding: 4px 0;
  .el-dropdown-menu__item {
    padding: 0 8px;
    i {
      font-size: 14px;
    }
  }
}
.el-dropdown-menu__item--divided:before {
  margin: 0 -8px;
}
</style>
