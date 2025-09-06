<template>
  <div class="datablau-tooltip">
    <el-tooltip
      :test-name="testName"
      v-delTooltip
      popper-class="datablau-tooltip-option"
      v-bind="tableBind"
      v-on="$listeners"
    >
      <slot></slot>
    </el-tooltip>
  </div>
</template>

<script>
const BOOLEAN_KEYS = ['disabled', 'manual']
export default {
  name: 'DatablauTooltip',
  props: {
    testName: String,
    modelVal: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      value: [],
    }
  },
  beforeMount() {},
  methods: {},
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
@import '../../color.sass';
.datablau-tooltip {
  display: inline-block;
}
.el-tooltip__popper {
  // transition: 0.2s ease-in-out;
  // transition: all 0.3s linear;
  padding: 4px 10px;
  line-height: 16px !important;
  white-space: pre-line !important;
  &.is-dark {
    background-color: transparentize($text-default, 0.2);
    color: $read-only;
    .popper__arrow {
      // border-width: 2px;
    }
  }

  &.is-dark[x-placement^='right'] {
    transform: translate(-8px, 0px);
    .popper__arrow {
      // border-right-color: transparentize($text-default, 0.2) !important;
      border-right-color: transparent !important;
      &:after {
        border-right-color: transparentize($text-default, 0.2) !important;
      }
    }
  }

  &.is-dark[x-placement^='bottom'] {
    margin-top: 10px;
    transform: translate(0px, -3px);
    .popper__arrow {
      // border-bottom-color: transparentize($text-default, 0.2) !important;
      border-bottom-color: transparent !important;
      &:after {
        border-bottom-color: transparentize($text-default, 0.2) !important;
      }
    }
  }

  &.is-dark[x-placement^='top'] {
    transform: translate(0px, 6px);
    .popper__arrow {
      // border-top-color: transparentize($text-default, 0.2) !important;
      border-top-color: transparent !important;
      &:after {
        border-top-color: transparentize($text-default, 0.2) !important;
      }
    }
  }

  &.is-dark[x-placement^='left'] {
    transform: translate(8px, 0px);
    .popper__arrow {
      // border-left-color: transparentize($text-default, 0.2) !important;
      border-left-color: transparent !important;
      &:after {
        border-left-color: transparentize($text-default, 0.2) !important;
      }
    }
  }
}
</style>
