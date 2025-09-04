<template>
  <div class="text-tooltip">
    <datablau-tooltip
      class="item"
      effect="dark"
      :disabled="disabled || isShowTooltip"
      :content="content"
      :placement="placement"
      v-bind="$attrs"
    >
      <p @mouseover="onMouseOver(refName)" :style="{ width: w }">
        <span :ref="refName">
          <slot v-if="$slots.default"></slot>
          <template v-else>{{ content || '-' }}</template>
        </span>
      </p>
    </datablau-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    // 文字内容
    content: {
      type: String,
      default: () => {
        return ''
      },
    },
    // 外层框的样式，在传入的这个类名中设置文字显示的宽度
    w: {
      type: String,
      default: '100%',
    },
    // 为页面文字标识（如在同一页面中调用多次组件，此参数不可重复）
    refName: {
      type: String,
      default: () => {
        return ''
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placement: {
      type: String,
      default: 'bottom-start',
    },
  },
  data() {
    return {
      isShowTooltip: true,
    }
  },
  mounted() {
    // console.log(this.content)
  },
  methods: {
    onMouseOver(str) {
      let parentWidth = this.$refs[str].parentNode.offsetWidth
      let contentWidth = this.$refs[str].offsetWidth
      // 判断是否开启tooltip功能
      if (contentWidth > parentWidth + 1) {
        this.isShowTooltip = false
      } else {
        this.isShowTooltip = true
      }
    },
  },
}
</script>

<style scoped lang="scss">
.text-tooltip {
  max-width: 100%;
  width: auto;
  display: inline-block;
  /deep/ .datablau-tooltip {
    width: 100%;
    .el-tooltip {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      -o-text-overflow: ellipsis;
      text-overflow: ellipsis;
      span {
        width: auto !important;
      }
    }
  }
}
</style>
