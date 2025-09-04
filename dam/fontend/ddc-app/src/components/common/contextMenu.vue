<template>
  <div id="context-menu" v-show="showContext">
    <ul class="context-menu-style">
      <div v-for="(o, idx) in contextOptions" :key="o.idx">
        <li
          v-if="!o.line"
          class="context-option"
          :class="{
            disabled: o.disabled,
          }"
          @click="o.disabled ? null : o.callback(o.args)"
        >
          <i v-if="o.icon" class="icon" :class="o.icon"></i>
          <el-tooltip
            popper-class="tooltip-outer-security"
            v-if="o.tooltip"
            :disabled="!o.disabled"
            effect="dark"
            :content="o.text"
            placement="bottom"
          >
            <span class="label">{{ o.label }}</span>
          </el-tooltip>
          <span v-else class="label">{{ o.label }}</span>
        </li>
        <template v-else>
          <div class="hr"></div>
        </template>
      </div>
    </ul>
    <div class="arrow"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContext: false,
      contextOptions: [],
    }
  },
  mounted() {
    this.createContextMenu()
  },
  beforeDestroy() {
    this.$bus.$off('callContextMenu')
    this.$bus.$off('removeContextMenu')
  },
  methods: {
    createContextMenu() {
      const dom = $('#context-menu')
      let isMac = /macintosh|mac os x/i.test(navigator.userAgent)
      $(window).on('mouseup', e => {
        if (isMac) {
          if (e.button === 0) {
            this.showContext = false
          }
        } else {
          this.showContext = false
        }
      })
      this.$bus.$on('removeContextMenu', () => {
        this.showContext = false
      })
      this.$bus.$on(
        'callContextMenu',
        ({ x, y, options, placement = 'right' }) => {
          this.contextOptions = options
          this.showContext = true
          this.$nextTick(() => {
            const domHeight = parseInt($(dom).css('height'))
            let defaultTop = y + 1 + 10
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
<style lang="scss">
.tooltip-outer-security {
  z-index: 9999 !important;
}
</style>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
// 右键 options

#context-menu {
  padding: 8px 4px;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.11);
  z-index: 9999;
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
