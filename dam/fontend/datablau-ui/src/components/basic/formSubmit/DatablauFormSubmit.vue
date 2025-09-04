<template>
  <div class="form-submit">
    <div
      :class="{ 'row-content': true, 'no-buttons': !$slots.buttons }"
      ref="content"
    >
      <div ref="content-inner">
        <slot></slot>
      </div>
    </div>
    <div
      class="row-buttons"
      :class="{ 'has-shadow': hasShadow }"
      v-if="$slots.buttons"
    >
      <slot name="buttons"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DatablauFormSubmit',
  data() {
    return {
      hasShadow: false,
      observe: null,
    }
  },
  mounted() {
    try {
      const IsTable = this.$slots.default[0].tag.includes('DatablauTable')
      if (IsTable) {
        this.handleTable()
      } else {
        this.initEventListener()
      }
    } catch (e) {
      console.error(e)
    }
  },
  beforeDestroy() {
    if (this.observe) {
      this.observe.disconnect()
    }
    $(this.$refs.content).off('scroll')
  },
  methods: {
    handleTable() {
      const targetNode = $(this.$refs['content-inner']).find(
        '.el-table__body-wrapper'
      )[0]
      $(this.$refs['content-inner']).css({
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        bottom: 0,
      })
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
    initEventListener() {
      const content = this.$refs.content
      const self = this
      const handler = () => {
        const boxHeight = parseInt($(content).css('height'))
        const contentHeight = parseInt(
          $(this.$refs['content-inner']).css('height')
        )
        const scrollTop = $(content).scrollTop()
        this.hasShadow = !(
          contentHeight < boxHeight ||
          Math.abs(boxHeight - contentHeight + scrollTop) < 1
        )
      }
      $(this.$refs.content).scroll(() => {
        handler()
      })
      let targetNode = this.$refs['content-inner']
      const config = { attributes: true, childList: true, subtree: true }
      const observe = new MutationObserver(function (mutations, observe) {
        handler()
      })
      this.observe = observe
      observe.observe(targetNode, config)
    },
  },
}
</script>
<style lang="scss" scoped>
.form-submit {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.row-content {
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  &.no-buttons {
    bottom: 0;
  }
}
.row-buttons {
  text-align: left;
  position: absolute;
  bottom: 0;
  left: 0;
  // z-index: 9999;
  border-top: 1px solid #e0e0e0;
  width: 100%;
  height: 50px;
  padding: 8px 20px;
  background-color: #fff;
  .tab-button {
    margin-left: 20px;
  }
  transition: box-shadow 0.3s ease-in-out, border-top-color 0.3s ease-in-out;
  &.has-shadow {
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    border-top: 1px solid transparent;
    z-index: 9;
  }
}
</style>
<style lang="scss">
.form-submit {
  .el-pagination {
    text-align: right;
  }
}
</style>
