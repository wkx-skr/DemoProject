<template>
  <div class="datablau-radio" :test-name="testName">
    <span class="radioTitle">{{ radioTitle }}</span>
    <el-radio-group v-bind="$attrs" v-on="$listeners">
      <slot></slot>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'DatablauRadio',
  props: {
    testName: String,
    radioTitle: String, // 单选标题，默认空，非必传。
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

.datablau-radio {
  .radioTitle {
    color: $text-default;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
@import '../../color';

.datablau-radio {
  .el-radio {
    margin-right: 24px;
  }

  .el-radio__label {
    padding-left: 6px;
  }

  .el-radio__inner {
    border: 1px solid $text-disabled;
  }

  .el-radio__input.is-disabled.is-checked .el-radio__inner {
    border: 1px solid $text-disabled;
    background-color: $component-divide-color;
  }

  .el-radio__input.is-disabled + span.el-radio__label {
    color: $text-disabled;
  }

  .el-radio__input.is-disabled .el-radio__inner {
    border-color: $text-disabled;
    background-color: $component-divide-color;
  }

  .el-radio__inner::after {
    width: 6px;
    height: 6px;
  }

  .el-radio__input.is-disabled.is-checked .el-radio__inner::after {
    background-color: $text-disabled;
  }

  .el-radio__inner:hover {
    border: 1px solid $primary-color;
  }

  &.inline-block-components {
    display: inline-block;
  }
}
</style>
