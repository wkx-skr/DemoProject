<template>
  <div id="popover-menu" v-show="showPop">
    <div class="arrow"></div>
    <p style="font-size: 12px; color: #555; padding: 8px">
      {{ $t('coordination.hasSelect') }}
      <span style="color: #409eff">
        {{ options.num }}
      </span>
      {{ $t('coordination.hasSelectTip') }}
    </p>
    <div class="btn" style="text-align: right; margin: 0">
      <datablau-button
        type="secondary"
        size="mini"
        style="border: none; padding: 0 10px; min-width: 0"
      >
        {{ $t('securityModule.no') }}
      </datablau-button>
      <datablau-button
        type="strong"
        size="mini"
        @click="options.callback('sure')"
        style="border: none; padding: 0 10px; min-width: 0"
      >
        {{ $t('securityModule.yes') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showPop: false,
      options: {},
    }
  },
  mounted() {
    this.createPopoverMenu()
  },
  beforeDestroy() {
    this.$bus.$off('callPopoverMenu')
    this.$bus.$off('removePopoverMenu')
  },
  methods: {
    createPopoverMenu() {
      const dom = $('#popover-menu')
      let isMac = /macintosh|mac os x/i.test(navigator.userAgent)
      $(window).on('mouseup', e => {
        if (isMac) {
          if (e.button === 0) {
            this.showPop = false
          }
        } else {
          this.showPop = false
        }
      })
      this.$bus.$on('removePopoverMenu', () => {
        this.showPop = false
      })
      this.$bus.$on(
        'callPopoverMenu',
        ({ x, y, options, placement = 'right' }) => {
          this.showPop = true
          this.options = options
          this.$nextTick(() => {
            const domHeight = parseInt($(dom).css('height'))
            let defaultTop = y + 1 + 20
            if (y + domHeight > document.body.clientHeight) {
              defaultTop = y - domHeight - 22
              dom.addClass('to-bottom')
            } else {
              dom.removeClass('to-bottom')
            }
            switch (placement) {
              case 'right':
                dom.removeClass('to-right')
                dom.css({
                  top: defaultTop + 'px',
                  left: x + 1 - 23 + 'px',
                })
                break
              case 'left':
                dom.addClass('to-right')
                dom.css({
                  top: defaultTop + 'px',
                  left: x + 25 - parseFloat(dom.css('width')) + 'px',
                })
                break
              case 'bottom-left':
                dom.css({
                  top: defaultTop + 'px',
                  left: x - 100 + 'px',
                })
                break
            }
          })
        }
      )
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
#popover-menu {
  padding: 8px 4px;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.11);
  z-index: 9999;
  width: 200px;
  position: absolute;
  .arrow {
    position: absolute;
    top: -6px;
    bottom: unset;
    right: unset;
    left: 20px;
    width: 0;
    height: 0;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.11));
    border: 6px solid transparent;
    border-top-width: 0;
    border-bottom-color: $border-color;

    &::after {
      position: absolute;
      top: 1px;
      width: 0;
      height: 0;
      margin-left: -6px;
      content: ' ';
      border: 6px solid transparent;
      border-top-width: 0;
      border-bottom-color: $white;
    }
  }

  &.to-right {
    .arrow {
      right: 20px;
      left: unset;
    }
  }
  &.to-bottom {
    .arrow {
      display: none;
    }
  }
}

#context-menu {
  position: absolute;
  z-index: 9999;
  //box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  .disabled {
    cursor: not-allowed;
    color: #ddd;
    // background-color: #edf2fc;
    i {
      color: #ddd;
      cursor: not-allowed;
    }
  }
}
</style>
