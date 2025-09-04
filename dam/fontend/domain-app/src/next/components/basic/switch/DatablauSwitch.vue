<template>
  <div class="datablau-switch">
    <el-switch
      :test-name="testName"
      ref="datablauswitch"
      v-bind="$attrs"
      v-on="$listeners"
      :class="type === 'innerText' ? 'textdesc' : ''"
    ></el-switch>
  </div>
</template>
<script>
export default {
  props: {
    testName: String,
    type: {
      type: String,
      default: '',
    },
  },
  name: 'DatablauSwitch',
  data() {
    let DATA = {}
    this.emitElementMethod(DATA)
    return DATA
  },
  methods: {
    emitElementMethod(DATA) {
      const ElementMethods = ['focus']
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.datablauswitch[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        DATA[m] = MethodGenerator(m)
      })
    },
  },
}
</script>
<style lang="scss">
@import '../../basic/color.sass';

.datablau-switch {
  .el-switch__core {
    width: 33px !important;
    height: 10px;
    background-color: #dbdbdb;
  }

  .el-switch.is-checked .el-switch__core {
    background-color: #c9e3ff;
    border-color: transparent;
  }

  .el-switch__core::after {
    top: -4px;
    left: -2px;
    box-shadow: 0 0 6px #e0e0e0;
  }

  .el-switch.is-checked .el-switch__core::after {
    background-color: $primary-color;
    box-shadow: 0 0 6px #a3c8ff;
  }

  // 文字描述
  .textdesc {
    .el-switch__core {
      width: 54px !important;
      height: 24px;
      background: #efefef;
      border-radius: 13px;
      transition: background-color 0.5s, color 0.5s;

      &::after {
        width: 20px;
        height: 20px;
        background: #ffffff;
        top: 1px;
        left: 1px;
      }
    }

    &.is-checked {
      .el-switch__core {
        background: $green;

        &::after {
          background: #ffffff;
          left: 48px;
        }
      }
    }

    .el-switch__label,
    .el-switch__label.is-active {
      position: absolute;
      display: none;
      margin: 0;
    }

    .el-switch__label.el-switch__label--left,
    .el-switch__label.el-switch__label--right {
      z-index: 9;
      color: #999999;
      left: 24px;

      & span {
        display: inline;
        display: inline-block;
        width: 28px;
        text-align: center;
        position: relative;
        left: -2px;
        font-size: 12px !important;
      }
    }

    .el-switch__label.el-switch__label--right {
      color: #ffffff;
      left: 3px;

      & span {
        left: 2px;
      }
    }

    .el-switch__label.is-active {
      display: block;
    }
  }
}
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .datablau-switch .textdesc .el-switch__label.el-switch__label--left span,
  .datablau-switch .textdesc .el-switch__label.el-switch__label--right span {
    top: -10px;
  }
}
</style>
