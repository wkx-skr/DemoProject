<template>
  <!-- <el-button
    size="small"
    @click.prevent="handleClick"
    class="datablau-btn"
  >

  </el-button>-->
  <div
    v-if="isBlock"
    @click="handleClick"
    class="is-block"
    :class="[
      styleClass,
      {
        'is-disabled': disabled,
        'low-key': lowKey,
        'no-background': noBackground,
        'no-padding': fromTable,
        'black-theme': themeBlack
      },
    ]"
  >
    <datablau-tooltip
      v-if="!!tooltipContent"
      class="button-inner-tooltip"
      :content="tooltipContent"
      :disabled="!tooltipContent"
      :effect="tooltipOpt.effect"
      :placement="tooltipOpt.placement"
      :open-delay="tooltipOpt.openDelay"
      :hide-after="tooltipOpt.hideAfter"
      :popper-class="tooltipOpt.popperClass"
    >
      <div class="tooltip-inner">{{ tooltipContent }}</div>
    </datablau-tooltip>
    <span v-if="$slots.default"><slot></slot></span>
    <span v-if="type === 'cancel'">{{ $t('common.button.cancel') }}</span>
    <span v-if="type === 'confirm'">{{ $t('common.button.ok') }}</span>
  </div>
</template>

<script>
import datablauTooltip from '@/next/components/basic/tooltip/DatablauTooltip.vue'
export default {
  name: 'DatablauButton',
  props: {
    type: {
      type: String,
      required: false,
      default: 'normal',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    lowKey: {
      type: Boolean,
      required: false,
      default: false,
    },
    noBackground: {
      type: Boolean,
      required: false,
      default: false,
    },
    fromTable: {
      type: Boolean,
      required: false,
      default: false,
    },
    tooltipContent: {
      type: String,
      default: '',
    },
    tooltipOptions: {
      type: Object,
      default() {
        return {
          effect: 'dark',
          placement: 'bottom',
          openDelay: 0,
          hideAfter: 0,
          popperClass: '',
        }
      },
    },
    // 按钮被连续点击时，对后续操作进行屏蔽，允许用户自定义双击敏感度，默认500毫秒。
    dblClickTimeout: {
      type: Number,
      required: false,
      default: 1000,
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      firstClick: false,
      editorTheme: localStorage.getItem('editorTheme')
    }
  },
  components: {
    datablauTooltip,
  },
  beforeMount() {},
  methods: {
    handleClick($event) {
      if (this.firstClick) {
        console.warn(`按钮被连续点击,点击无效，敏感度${this.dblClickTimeout}ms`)
        $event.preventDefault()
        $event.stopPropagation()
      } else {
        this.firstClick = true
        setTimeout(() => {
          this.firstClick = false
        }, window.dblClickTimeout || this.dblClickTimeout)
        if (this.disabled) {
          $event.preventDefault()
          $event.stopPropagation()
          console.warn('按钮被禁用,点击无效')
        } else {
          this.$emit('click', $event)
        }
      }
    },
  },
  computed: {
    styleClass() {
      if (
        [
          'important',
          'normal',
          'secondary',
          'text',
          'icon',
          'danger',
          'strong',
          'subscribe',
        ].includes(this.type)
      ) {
        return this.type
      } else if (this.type === 'cancel') {
        return 'secondary'
      } else if (this.type === 'confirm') {
        return 'important'
      } else if (this.type === 'primary') {
        return 'important'
      } else {
        return 'normal'
      }
    },
    isBlock() {
      // return ['important', 'normal', 'secondary', ''].includes(this.styleClass)
      return true
    },
    tooltipOpt() {
      return _.merge({}, this.tooltipOptions)
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';

$border-color-secondary: #d2d2d2;
$danger-hover-color: transparentize(#ff4b53, 0.9);
.is-block {
  font-size: 12px;
  cursor: pointer;
  display: inline-block;
  line-height: 30px;
  min-width: 64px;
  text-align: center;
  padding: 0 10px;
  height: 32px;
  border-radius: 2px;
  position: relative;

  &[class*='icon-']::before {
    font-size: 16px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
  &.icon,
  &.text {
    height: 24px !important;
    line-height: 24px !important;
    top: 1px;
    & .iconfont {
      vertical-align: inherit;
    }
  }
  // 调试热区专用
  /*outline: 1px dashed pink;*/
  &.important {
    color: #ffffff;

    &:hover {
      background-color: $click-color;
      transition: background-color 0.2s ease-in-out;
    }

    background-color: $primary-color;
    border: 1px solid $primary-color;
    &.black-theme{
      background-color: #1E6ED2;
      border: 1px solid #1E6ED2;
      color: #fffffd;
      &:hover {
        background-color: #357DD7;
      }
      &:active{
        background-color: #1858A8;
        border: 1px solid #1858A8;
      }
      &.is-disabled{
        background: rgba(77,77,77,0.4) !important;
        border: 1px solid #4D4D4D !important;
        color: #888888;
      }
    }
  }

  &.normal {
    border: 1px solid $primary-color;
    background-color: #fff;
    color: $primary-color;

    &:hover {
      background-color: $table-hover-color;
      transition: all 0.2s ease-in-out;
    }
    &.black-theme{
      border: 1px solid #666;
      background-color: transparent;
      color:#bbbbbb;
      &:hover {
        background-color: rgba(64,158,255,0.1);
        border: 1px solid #409EFF;
        color: #409EFF;
      }
      &:active{
        background-color: rgba(30,110,210,0.1);
        border: 1px solid #1E6ED2;
      }
      &.is-disabled{
        background: rgba(77,77,77,0.4) !important;
        border: 1px solid #4D4D4D !important;
        color: #888888;
      }
    }
  }
  &.subscribe {
    border: 1px solid $primary-color;
    background-color: #ffffff;
    color: $primary-color;

    &:hover {
      background-color: $table-hover-color;
      transition: all 0.2s ease-in-out;
    }
  }
  &.strong {
    border: 1px solid $primary-color;
    background-color: $table-hover-color;
    color: $primary-color;

    &:hover {
      background-color: $primary-color;
      color: #fff;
      transition: all 0.2s ease-in-out;
    }
  }

  &.danger {
    border: 1px solid $danger-color;
    background-color: #ffffff;
    color: $danger-color;

    &:hover {
      background-color: $danger-hover-color;
      // color: #fff;
      transition: all 0.2s ease-in-out;
    }
    &.black-theme{
      border: 1px solid #666;
      background-color: rgba(218,31,9,0.1);;
      color:#DA1F09;
      border: 1px solid #DA1F09;
    }
  }

  &.secondary {
    border: 1px solid $border-color-secondary;
    background-color: #ffffff;
    color: $text-default;
    &:before {
      color: $text-disabled;
    }

    &:hover {
      background-color: $table-hover-color;
      color: $primary-color;
      transition: all 0.2s ease-in-out;
      border: 1px solid $primary-color;
      &:before {
        color: $primary-color;
      }
    }
    &.black-theme{
      border: 1px solid #666;
      background-color: transparent;
      color:#bbbbbb;
      &:hover {
        background-color: rgba(64,158,255,0.1);
        border: 1px solid #409EFF;
        color: #409EFF;
      }
      &:active{
        background-color: rgba(30,110,210,0.1);
        border: 1px solid #1E6ED2;
      }
      &.is-disabled{
        background: rgba(77,77,77,0.4) !important;
        border: 1px solid #4D4D4D !important;
        color: #888888;
      }
    }
  }

  &.text {
    line-height: 32px;
    height: 32px;
    transition: color 0.2s ease-in-out;
    color: $primary-color;
    min-width: unset;
    &:hover {
      color: $click-color;
      background-color: $table-hover-color;
    }
    &.no-padding {
      padding: 0 5px;
    }
    &.black-theme{
      &:hover {
        color: #409EFF;
        background-color: rgba(64,158,255,0.2);
      }
      &:active{
        color: #409EFF;
        background-color: rgba(64,158,255,0.1);
      }
    }
  }
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    &.text {
      min-width: auto;
    }
  }

  &.icon {
    height: 32px;
    width: 24px;
    min-width: unset;
    padding: 0 0;
    font-size: 16px;
    text-align: center;
    line-height: 30px;
    color: $primary-color;
    &.low-key {
      color: #979797;
    }
    transition: all 0.2s ease-in-out;

    &:hover {
      &:not(.no-background) {
        background-color: $table-hover-color;
      }
      color: $click-color;
    }
    &.black-theme{
      &:hover {
        &:not(.no-background) {
          background-color: rgba(64,158,255,0.2);
        }
        color:  #409EFF;
      }
      &:active{
        &:not(.no-background) {
        background-color: rgba(64,158,255,0.1);
      }
      }
      .tooltip-inner{
        background-color: transparent !important;
      }
    }
  }
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    &.icon {
      min-width: auto;
    }
  }

  &.is-disabled {
    background: $read-only !important;
    border: 1px solid $border-color !important;
    color: $text-disabled !important;
    cursor: not-allowed;
  }

  &.text.is-disabled {
    background: transparent !important;
    border: none !important;
  }

  &.icon.is-disabled {
    background: transparent !important;
    border: none !important;
  }

  .button-inner-tooltip {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    .tooltip-inner {
      font-size: 0;
    }
  }
}
</style>
