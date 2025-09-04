<template>
  <div class="datablau-checkbox2">
    <el-checkbox-group
      :test-name="testName"
      v-if="checkboxType === 'group'"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot></slot>
    </el-checkbox-group>

    <el-checkbox
      :test-name="testName"
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
    testName: String,
    checkboxType: {
      type: String,
      required: false,
      default: 'group',
    },
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
@import '../../color';
.datablau-checkbox2 {
  .checkboxTitle {
    color: $text-default;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
@import '../../color';
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
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    border-color: $text-disabled;
    background-color: $component-divide-color;
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
  .el-checkbox__input {
    &.is-disabled {
      .el-checkbox__inner {
        border-color: $text-disabled;
        background-color: $component-divide-color;
        &:after {
          border-color: $text-disabled;
        }
      }
    }
  }
}
</style>
