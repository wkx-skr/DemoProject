<template>
  <div class="datablau-cascader" :class="{'black-theme': themeBlack}">
    <el-cascader
      :popper-class="themeBlack ? 'datablau-cascader-option datablau-cascader-option-balack': 'datablau-cascader-option'"
      v-bind="tableBind"
      v-on="$listeners"
      ref="dataCascader"
    ></el-cascader>
  </div>
</template>

<script>
const BOOLEAN_KEYS = [
  'disabled',
  'clearable',
  'filterable',
  'remote',
  'collapse-tags',
]
export default {
  name: 'DatablauCascader',
  props: {
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    const DATA = {}
    this.emitElementMethod(DATA)
    return {
      DATA,
    }
  },
  beforeMount() {},
  methods: {
    emitElementMethod(DATA) {
      const ElementMethods = [
        'change',
        'expand-change',
        'blur',
        'focus',
        'visible-change',
        'remove-tag',
        'getCheckedNodes',
      ]
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.dataCascader[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        DATA[m] = MethodGenerator(m)
      })
    },
  },
  computed: {
    tableBind() {
      // TODO 增加 BOOLEAN_KEYS 数组, 判断非vue组件属性(html原生属性) 是否适用
      const { $attrs } = this
      const bind = {}
      Object.keys($attrs).forEach(key => {
        const v = $attrs[key]
        const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
        bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
      })
      return bind
    },
  },
}
</script>

<style lang="scss">
@import '../../basic/color.sass';
.datablau-cascader {
  &.seeCascader {
    .el-cascader {
      .el-input {
        input {
          border-color: transparent;
        }
      }
      &:hover {
        .el-input {
          &.is-disabled {
            input {
              border-color: transparent;
            }
          }
          input {
            border-color: transparent;
          }
        }
      }
    }
  }
  .el-cascader {
    width: 100%;
    line-height: 32px;
    height: 32px;
    &:hover {
      .el-input {
        input {
          border-color: $primary-color;
        }
        span {
          i {
            &:before {
              color: $primary-color;
            }
          }
        }
        &.is-disabled {
          input {
            border-color: #e4e7ed;
          }
        }
      }
    }
    .el-input {
      input {
        height: 32px;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 2px;
      }
    }
    .is-focus {
      span {
        i {
          &:before {
            color: $primary-color;
          }
        }
      }
    }
  }
  .el-input__icon {
    line-height: 32px;
    color: #999;
  }
  &.black-theme{
    .el-input__inner{
      border-color: #4D4D4D;
      background-color: transparent;
      color: #c6c6c6;
    }
    .el-cascader .el-input input::placeholder{
      color: #888888 !important;
    }
  }
}
.datablau-cascader-option {
  .el-cascader-panel {
    .el-cascader-node__label {
      font-size: 12px;
    }

    .el-cascader-menu {
      min-width: 188px;

      li.el-cascader-node {
        padding-left: 0px;
        height: 32px;
        line-height: 32px;

        &:hover {
          background-color: $table-hover-color;
        }

        &.in-active-path {
          font-weight: normal;
          background-color: transparent;
          &:hover {
            background-color: $table-hover-color;
          }
        }
        &.is-active {
          font-weight: normal;
          // background-color: $table-hover-color;
          i {
            //display: none;
          }
        }
        .el-radio__input {
          margin-left: 10px;
        }
      }
    }
  }
  .el-radio__inner {
    border: 1px solid $text-disabled;
  }
  .el-radio__inner:hover {
    border: 1px solid $primary-color;
  }

  .el-radio__label {
    padding-left: 6px;
  }

  .el-radio__inner {
    border: 1px solid $text-disabled;
  }

  .el-radio__input.is-disabled.is-checked .el-radio__inner {
    border: 1px solid $text-disabled;
    background-color: $read-only;
  }

  .el-radio__input.is-disabled + span.el-radio__label {
    color: $text-disabled;
  }

  .el-radio__input.is-disabled .el-radio__inner {
    border-color: $text-disabled;
    background-color: $read-only;
  }

  .el-radio__inner::after {
    width: 6px;
    height: 6px;
  }

  .el-radio__input.is-disabled.is-checked .el-radio__inner::after {
    background-color: $text-disabled;
  }
  &.datablau-cascader-option-balack{
    background: #2A2A2A;;
    border: 1px solid #333333;
    .popper__arrow::after{
      border-bottom-color: #2A2A2A;
    }
    .popper__arrow{
      border-bottom-color: #333333;
    }
    .el-cascader-node__label{
      color: #BBBBBB;
    }
    .el-radio__input.is-disabled .el-radio__inner{
      border-color: #888888;
      background-color: transparent;
    }
    .el-radio__inner{
      border-color: #888888;
      background-color: transparent;
    }
    .el-cascader-menu{
      border-right: solid 1px #4D4D4D;
    }
    .el-radio__input.is-checked .el-radio__inner{
      background-color:#187FFF;
      border-color: transparent;
    }
    .el-radio__inner::after{
      background-color:#222222;
    }
    .el-cascader-node:not(.is-disabled):focus{
      background: transparent;
    }
  }
}
.el-cascader-menu__wrap.el-scrollbar__wrap {
  margin-bottom: 0 !important;
}
</style>
