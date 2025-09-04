<template>
  <div>
    <el-dialog
      :test-name="testName"
      :z-index="zIndex"
      v-on="$listeners"
      v-bind="$attrs"
      @close="close"
      :append-to-body="showTop"
      :close-on-click-modal="canClose"
      :ref="'dialog' + ran"
      :class="{
        'no-footer-dialog': !isShow,
        xx: getHeight,
        'no-padding-dialog': noPadding || isNoPadding,
        'has-border': hasBorder,
        'dialog-shadow': hasShadow,
      }"
    >
      <div slot="title" v-if="$slots.title">
        <slot name="title"></slot>
      </div>
      <div class="datablau-dialog-content" ref="content">
        <div class="content-inner" :ref="'contentInner' + ran">
          <slot></slot>
        </div>
      </div>
      <div class="datablau-dialog-footer" slot="footer" v-if="isShow">
        <slot name="footer"></slot>
      </div>
      <div class="dialog-bottom" slot="bottom" v-if="$slots.bottom"></div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DatablauDialog',
  props: {
    testName: String,
    table: {
      type: Boolean,
      default: false,
    },
    isTree: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [String, Number],
      default: '',
    },
    'append-to-body': {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: [String, Number],
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
    hasBorder: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      screenHeight: 0,
      innerHeight: 0,
      arr: ['s', 'm', 'l', 'xl'],
      ran: null,
      ranDialog: '',
      isNoPadding: false,
      hasShadow: false,
      observe: null,
    }
  },
  computed: {
    isShow() {
      return this.$slots.footer
    },
    getHeight() {
      this.$nextTick(() => {
        if (this.height) {
          this.setHeight()
        }
        this.initMethod()
      })
    },
    showTop() {
      if (this.$attrs['append-to-body'] !== false) {
        return true
      } else {
        return false
      }
    },
    canClose() {
      if (this.$attrs['close-on-click-modal'] !== true) {
        return false
      } else {
        return true
      }
    },
  },
  watch: {
    '$attrs.visible': {
      immediate: true,
      handler(newVal) {
        this.$nextTick(() => {
          setTimeout(async () => {
            await this.getScreenHeight()
            await this.initMethod()
            if (newVal) {
              if (this.height) {
                this.setHeight()
              }
              if (this.table) {
                this.handleTable()
              } else if (this.isTree) {
                this.handleTree()
              } else {
                this.scrollChange()
              }
            }
          }, 0)
        })

        // 在 iframe 中, 显示 dialog, 向父窗口发送消息
        this.$bus.$emit('dialog-visible-change', newVal)
      },
    },
    height(val) {
      this.$nextTick(() => {
        if (val) {
          this.setHeight()
        }
        this.initMethod()
      })
    },
  },
  beforeDestroy() {
    this.$bus.$emit('dialog-visible-change', false)
    if (this.observe) {
      this.observe.disconnect()
    }
    $(this.$refs.content).off('scroll')
    window.onresize = null
  },
  mounted() {
    this.ran = Math.random()
    this.ranDialog = 'dialog' + this.ran
    window.onresize = () => {
      this.$nextTick(() => {
        this.getScreenHeight()
        this.initMethod()
        if (this.table) {
          this.handleTable()
        } else if (this.isTree) {
          this.handleTree()
        } else {
          this.scrollChange()
        }
      })
    }
  },
  methods: {
    setHeight() {
      $(this.$refs[this.ranDialog].$refs.dialog).css({
        height: parseFloat(this.height) + 'px',
        'max-height':
          parseFloat(this.height) >= 750
            ? 750 + 'px'
            : parseFloat(this.height) + 'px',
      })
    },
    scrollChange() {
      const contentRan = 'contentInner' + this.ran
      if (!this.$refs[contentRan]) {
        return
      }
      const handler = () => {
        const boxH = $(this.$refs.content).height()
        const contentH = $(this.$refs[contentRan]).height()
        const scrollTop = $(this.$refs.content).scrollTop()
        // boxH的高度有时会差1px的像素
        if (boxH + scrollTop >= contentH - 2) {
          this.hasShadow = false
        } else {
          this.hasShadow = true
        }
      }
      $(this.$refs.content).scroll(() => {
        handler()
      })
      const targetNode = this.$refs[contentRan]
      const config = { attributes: true, childList: true, subtree: true }
      const observe = new MutationObserver(function (mutations, observe) {
        handler()
      })
      handler()
      this.observe = observe
      observe.observe(targetNode, config)
    },
    handleTable() {
      const targetNode = $(this.$refs.content).find(
        '.el-table__body-wrapper'
      )[0]
      if (!targetNode) {
        return
      }
      const handler = () => {
        const contentHeight = parseFloat($(targetNode).css('height'))
        const innerHeight = parseFloat(
          $(targetNode).children('table').css('height')
        )
        const scrollTop = $(targetNode).scrollTop()
        this.hasShadow =
          contentHeight < innerHeight &&
          Math.abs(contentHeight + scrollTop - innerHeight) > 1
      }
      $(targetNode).scroll(() => {
        handler()
      })
      const config = { attributes: true, childList: true, subtree: true }
      const observe = new MutationObserver(function (mutations, observe) {
        handler()
      })
      this.observe = observe
      observe.observe(targetNode, config)
    },
    handleTree() {
      const targetNode = $(this.$refs.content).find('.el-tree')[0]
      if (!targetNode) {
        return
      }
      const handler = () => {
        const contentHeight = parseFloat($(targetNode).css('height'))
        const boxHeight = parseFloat($('#tree-box').css('height'))
        const scrollTop = $('#tree-box').scrollTop()
        // console.log(contentHeight)
        // console.log(boxHeight)
        // console.log(scrollTop)
        this.hasShadow =
          contentHeight > boxHeight &&
          Math.abs(boxHeight + scrollTop - contentHeight) > 1
        // console.log(this.hasShadow)
      }
      $('#tree-box').scroll(() => {
        handler()
      })
      const config = { attributes: true, childList: true, subtree: true }
      const observe = new MutationObserver(function (mutations, observe) {
        handler()
      })
      this.observe = observe
      observe.observe(targetNode, config)
    },
    getScreenHeight() {
      this.screenHeight = document.documentElement.clientHeight
      if (!this.height) {
        if (this.screenHeight < 750) {
          $(this.$refs[this.ranDialog].$refs.dialog).css({
            'max-height': '85%',
          })
        } else {
          $(this.$refs[this.ranDialog].$refs.dialog).css({
            'max-height': '75%',
          })
        }
      }
    },
    getSize() {
      let w
      switch (this.size.toLowerCase()) {
        case 's':
          w = 560
          break
        case 'm':
          w = 640
          break
        case 'l':
          w = 800
          break
        case 'xl':
          w = 960
          break
        default:
          break
      }
      $(this.$refs[this.ranDialog].$refs.dialog).css({
        width: w + 'px',
      })
    },
    initMethod() {
      // console.log($(this.$refs.content).hasClass('dialog-bottom'))
      // 如果没有footer插槽和class(dialog-bottom)的时候,下padding为0
      if (!this.$slots.footer) {
        if ($('.datablau-dialog-content .dialog-bottom').length > 0) {
          this.isNoPadding = false
        } else {
          this.isNoPadding = true
        }
      }
      if (this.size && this.arr.includes(this.size.toLowerCase())) {
        this.getSize()
      }
      if (this.height) {
      } else {
        const contentInner = this.$refs['contentInner' + this.ran]
        this.innerHeight = $(contentInner).height()
        if (contentInner) {
          let headerAndBottomHeight
          if (this.noPadding || this.isNoPadding) {
            headerAndBottomHeight = 60 + 20
          } else {
            headerAndBottomHeight = 60 + 60
          }
          if (this.innerHeight < this.screenHeight * 0.85) {
            $(this.$refs[this.ranDialog].$refs.dialog).css(
              'height',
              this.innerHeight + headerAndBottomHeight + 'px'
            )
          } else {
            $(this.$refs[this.ranDialog].$refs.dialog).css(
              'height',
              this.screenHeight * 0.85 + 'px'
            )
          }
        }
      }
      if (
        $(this.$refs[this.ranDialog].$refs.dialog).height() -
          this.screenHeight <
        0
      ) {
        $(this.$refs[this.ranDialog].$refs.dialog).css('marginTop', '15vh')
      } else {
        $(this.$refs[this.ranDialog].$refs.dialog).css('marginTop', '0px')
      }
    },
    close(...args) {
      this.$emit('close', ...args)
      this.$bus.$emit('dialog-visible-change', false)
    },
  },
}
</script>

<style scoped lang="scss">
@import '../color';
// 弹出框样式
.el-dialog__wrapper {
  top: 0 !important;
  &.has-border {
    .datablau-dialog-footer {
      box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    }
  }

  &.dialog-shadow {
    /deep/ .el-dialog__body {
      .datablau-dialog-content {
        .dialog-bottom {
          box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
        }
      }
    }
    /deep/ .el-dialog__footer {
      box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    }
  }
  &.no-footer-dialog {
    &.has-border {
      /deep/ .el-dialog__body {
        .datablau-dialog-content {
          border-bottom: 1px solid #ddd;
          box-sizing: border-box;
        }
      }
    }
    /deep/ .el-dialog {
      .el-dialog__body {
        bottom: 14px;
        padding-bottom: 46px;
      }
    }
  }
  &.no-padding-dialog {
    /deep/ .el-dialog {
      .el-dialog__body {
        padding-bottom: 0px;
        bottom: 20px;
      }
      .el-dialog__footer {
        height: 0;
      }
    }
  }
  /deep/ .el-dialog {
    position: relative;
    min-height: 200px;
    max-height: 600px;

    .el-dialog__header {
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      line-height: 49px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 45px;
      .el-dialog__headerbtn {
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        top: 13px;
        right: 10px;
        border-radius: 2px;
        &:hover {
          background: transparentize($color: $primary-color, $amount: 0.9);
          i {
            color: $primary-color;
          }
        }

        i {
          color: #999;
          font-size: 16px;
        }
      }

      .el-dialog__title {
        color: #555;
        font-weight: 500;
      }
    }

    .el-dialog__body {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      bottom: 60px;
      padding: 0;
      padding-top: 10px;

      .datablau-dialog-content {
        height: 100%;
        overflow: auto;
        padding: 0 20px;
      }
      .dialog-bottom {
        background: #fff;
        padding: 0 20px;
        padding-top: 10px;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 44px;
        text-align: right;
      }
    }
    .el-dialog__footer {
      height: 60px;
      padding: 14px 20px;
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      .datablau-dialog-footer {
        text-align: right;
      }
    }
  }
}
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  // 这里写样式，IE 11 下才有效
  /deep/ .el-dialog {
    .el-dialog__body {
      .datablau-dialog-content {
        overflow-y: hidden !important;
      }
    }
  }
}
</style>
<style lang="scss">
.el-dialog .el-dialog__body {
  font-size: 12px;
}
</style>
