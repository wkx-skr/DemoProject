/** * content: String, 显示的内容 * classString: String, 类名字符串 * effect:
String, tooltip 颜色 * placement: String, tooltip 位置 * widthStr: String,
默认宽度 * displayType: String, display 值 */

<template>
  <el-tooltip
    :content="content + ''"
    :placement="placement"
    effect="light"
    :disabled="!showTooltip || !content"
    class="span-with-tooltip"
  >
    <span class="span-content" :class="classString" ref="spanContent">
      {{ content }}
    </span>
  </el-tooltip>
</template>

<script>
export default {
  name: 'SpanWithTooltip',
  props: {
    content: {
      type: [String, Number, Boolean],
      default: '',
    },
    classString: {
      type: String,
    },
    effect: {
      type: String,
      default: 'light',
    },
    placement: {
      type: String,
      default: 'top',
    },
    widthStr: {
      type: String,
    },
    displayType: {
      type: String,
      default: 'inline-block',
    },
    forceShowTooltip: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showTooltip: true,
    }
  },
  components: {},
  computed: {},
  mounted() {
    // this.styleInit();
    this.testHideTooltip()
  },
  methods: {
    testHideTooltip() {
      this.$nextTick(() => {
        this.styleInit()
        const dom = $(this.$refs.spanContent)[0]
        if (!dom) {
          return
        }
        const scrollWidth = dom.scrollWidth
        const clientWidth = dom.clientWidth
        window.theDom = dom
        if (scrollWidth > clientWidth) {
          this.showTooltip = true
        } else {
          this.showTooltip = false
        }
        if (this.forceShowTooltip) {
          this.showTooltip = true
        }
      })
    },
    styleInit() {
      const $dom = $(this.$refs.spanContent)
      $dom.css({
        display: this.displayType,
      })
      if (this.widthStr) {
        $dom.css({
          // display: 'inline-block',
          width: this.widthStr,
        })
      }
    },
  },
  watch: {
    content() {
      this.testHideTooltip()
    },
  },
}
</script>

<style lang="scss">
.span-content {
  // display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  // width: 100%;
  vertical-align: top;
}
</style>
