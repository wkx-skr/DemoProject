<template>
  <div class="datablau-dropdown">
    <el-dropdown
      v-bind="$attrs"
      v-on="$listeners"
      class="ssss"
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
.dropThemeBlack{
  background: #2A2A2A ;
  border: 1px solid #333333;
  .el-dropdown-menu__item{
    color: #BBBBBB;
    &:hover{
      background-color: rgba(24, 127, 255, .2);
    }
  }
  .popper__arrow{
    border-bottom-color:#333333 !important;
  }
  .popper__arrow::after{
    border-bottom-color: #2A2A2A !important;
  }
}
</style>
