<template>
  <div class="datablau-checkbox2" :class="{'black-theme': themeBlack}">
    <el-checkbox-group
      v-if="checkboxType === 'group'"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot></slot>
    </el-checkbox-group>

    <el-checkbox
      v-if="checkboxType === 'single'"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot></slot>
    </el-checkbox>
  </div>
</template>

<script>
export default {
  name: 'DatablauCheckbox',
  props: {
    checkboxType: {
      type: String,
      required: false,
      default: 'group'
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data () {
    return {}
  },
  beforeMount () {},
  mounted () {},
  methods: {},
  computed: {},
  created () {},
  watch: {}
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';
.datablau-checkbox2 {
  .checkboxTitle {
    color: $text-default;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
@import '../color';
.datablau-checkbox2 {
  .el-checkbox-group {
    display: inline-block;
  }
  .el-checkbox__label {
    padding-left: 6px;
  }
  .el-checkbox__inner {
    border: 1px solid $text-disabled;
  }
   .el-checkbox__inner::after {
    border-top: 0;
    border-left: 0;
  }
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    border-color: $text-disabled;
    background-color: $read-only;
  }
  .el-checkbox__input.is-disabled + span.el-checkbox__label {
    color: $text-disabled;
  }
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: $text-disabled;
  }
  .el-checkbox {
    margin-right: 24px;
  }
  &.black-theme{
    .el-checkbox__inner{
      border: 1px solid #888888;
    }
    .el-checkbox__inner{
      background-color: transparent;
    }
    .el-checkbox__label{
      color: #BBBBBB;
    }
  }
}
</style>
