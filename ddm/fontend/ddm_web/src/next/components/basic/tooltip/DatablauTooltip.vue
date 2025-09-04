<template>
  <div
    class="datablau-tooltip"
    :class="{'auto-hide': autoHide}"
    ref="container"
  >
    <el-tooltip
      v-delTooltip
      :popper-class="maxHeight ? 'datablau-tooltip-option datablau-tooltip-optionMaxH' : 'datablau-tooltip-option'"
      v-bind="tableBind"
      v-on="$listeners"
      :disabled="disabledComputed"
      ref="tooltip"
    >
      <slot></slot>
    </el-tooltip>
  </div>
</template>

<script>
// 注意：使用 autoHide 时，默认 content 跟 slot 显示文本相同，
// 当 content 修改时才会自动触发校验是否显示 tooltip
const BOOLEAN_KEYS = [
  // 'disabled',
  'manual'
]
export default {
  name: 'DatablauTooltip',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    autoHide: {
      type: Boolean,
      default: false
    },
    modelVal: {
      type: Array,
      default() {
        return []
      },
    },
    maxHeight: {}
  },
  data() {
    return {
      // 内容是否超出，当 autoHide 为 true 时，据此判断是否显示tooltip
      scrollOver: false,
      resizeObserver: null,
      testScroll: null,
      value: []
    }
  },
  mounted() {
    this.testScroll = _.throttle(this.handleRestScroll, 200)
    this.$nextTick(() => {
      if (this.autoHide) {
        let innerDom = this.$slots.default[0].elm
        // 创建 ResizeObserver 实例，传入回调函数
        const resizeObserver = new ResizeObserver(this.testScroll)
        // 开始观察 outerContainer
        innerDom && resizeObserver.observe(innerDom)
        this.resizeObserver = resizeObserver
      }
    })

  },
  beforeDestroy() {
    this.resizeObserver?.disconnect()
  },
  methods: {
    handleRestScroll() {
      if (!this.autoHide) return
      // 计算是否需要显示 tooltip
      let innerDom = this.$slots.default[0].elm
      if (innerDom) {
        this.scrollOver = innerDom.scrollWidth > innerDom.clientWidth
        if (this.scrollOver) {
          // TODO: 判断鼠标是否仍然 hover，需要显示hover 时更新 tooltip，否则 tooltip 位置错误
          if (this.$refs.tooltip?.showPopper) {
            this.$refs.tooltip?.updatePopper()
          }

        }
      }
    },
  },
  computed: {
    disabledComputed() {
      if (this.autoHide) {
        return !this.scrollOver
      } else {
        return this.disabled
      }
    },
    tableBind() {
      // TODO 增加 BOOLEAN_KEYS 数组, 判断非vue组件属性(html原生属性) 是否适用
      const {$attrs} = this
      const bind = {}
      Object.keys($attrs).forEach(key => {
        const v = $attrs[key]
        const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
        bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
      })
      return bind
    },
  },
  watch: {
    '$attrs.content'() {
      this.testScroll()
    }
  }
}
</script>

<style lang="scss">
@import '../../basic/color.sass';
.datablau-tooltip {
  display: inline-block;

  &.auto-hide {
    width: 100%;
    height: 100%;
  }
}
.el-tooltip__popper {
  // transition: 0.2s ease-in-out;
  // transition: all 0.3s linear;
  padding: 4px 10px;
  line-height: 16px !important;

  &.is-dark {
    background-color: transparentize($text-default, 0.2);
    color: $read-only;
    .popper__arrow {
      // border-width: 2px;
    }
  }

  &.is-dark[x-placement^='right'] {
    transform: translate(-3px, 0px);
    .popper__arrow {
      // border-right-color: transparentize($text-default, 0.2) !important;
      border-right-color: transparent !important;
      &:after {
        border-right-color: transparentize($text-default, 0.2) !important;
      }
    }
  }

  &.is-dark[x-placement^='bottom'] {
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
    transform: translate(0px, 3px);
    .popper__arrow {
      // border-top-color: transparentize($text-default, 0.2) !important;
      border-top-color: transparent !important;
      &:after {
        border-top-color: transparentize($text-default, 0.2) !important;
      }
    }
  }

  &.is-dark[x-placement^='left'] {
    transform: translate(3px, 0px);
    .popper__arrow {
      // border-left-color: transparentize($text-default, 0.2) !important;
      border-left-color: transparent !important;
      &:after {
        border-left-color: transparentize($text-default, 0.2) !important;
      }
    }
  }
}
.datablau-tooltip-option{
  &.datablau-tooltip-optionMaxH{
    max-height: 90%;
    overflow: auto;
  }
}
</style>
