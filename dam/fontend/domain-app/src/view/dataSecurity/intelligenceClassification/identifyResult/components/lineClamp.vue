<template>
  <div
    class="vue-text"
    ref="text"
    :style="textStyle"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
  >
    {{ value }}
  </div>
</template>

<script>
export default {
  // 显示文字组件，可以设置最多显示几行，超过后会隐藏并且鼠标hover显示全部信息（需要给组件设置宽度）
  name: 'VueText',
  props: {
    value: {
      type: String,
      default: '',
    },
    row: {
      // 最多显示几行，超过后会...隐藏 为0时不隐藏
      type: [Number, String],
      default: 0,
    },
  },
  computed: {
    text() {
      return this.$refs.text
    },
  },
  data() {
    return {
      isShowHover: false,
      textStyle: {},
      div: null,
    }
  },
  watch: {
    row: function (val) {
      this.init()
    },
    value: function () {
      this.isShowHover = false
      this.textStyle = {
        cursor: 'text',
      }
      this.$nextTick(() => {
        this.getStyle(this.row - 0)
      })
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.div = document.querySelector('.line-clamp')
      if (!this.div && this.row - 0) {
        this.div = document.createElement('div')
        this.div.className = 'line-clamp'
        this.div.style.top = 0
        this.div.style.left = 0
        document.body.append(this.div)
      }
      if (this.div && this.row - 0) {
        this.getStyle(this.row - 0)
      }
    },
    getStyle(val) {
      let lineHeight =
        getComputedStyle(this.text).lineHeight.replace('px', '') - 0 || 20
      let height = getComputedStyle(this.text).height.replace('px', '') - 0
      if (height > lineHeight * val) {
        this.isShowHover = true
        this.textStyle = {
          height: `${lineHeight * val}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          webkitLineClamp: val,
          webkitBoxOrient: 'vertical',
          cursor: 'pointer',
          // lineHeight:'inherit'
        }
      } else {
        this.isShowHover = false
        this.textStyle = {
          cursor: 'text',
        }
      }
    },
    mouseenter(e) {
      if (!this.isShowHover) {
        return
      }
      let box = e.target.getBoundingClientRect()
      let top = box.top + box.height + 5 + 'px'
      let left = 0
      this.div.innerHTML = this.value
      left =
        box.left +
        (box.width - this.div.getBoundingClientRect().width) / 2 +
        'px'
      this.div.style.top = top
      this.div.style.left = left
      this.div.classList.add('active')
    },
    mouseleave(e) {
      if (!this.isShowHover) {
        return
      }
      if (e.relatedTarget !== this.div) {
        this.div.style.top = 0
        this.div.style.left = 0
        this.div.classList.remove('active')
      }
      this.div.onmouseleave = () => {
        this.div.style.top = 0
        this.div.style.left = 0
        this.div.classList.remove('active')
      }
    },
  },
}
</script>

<style lang="scss">
.line-clamp {
  position: absolute;
  background-color: rgba(85, 85, 85, 0.8);
  color: #f5f5f5;
  font-size: 12px;
  line-height: 20px;
  padding: 6px 10px;
  border-radius: 5px;
  max-width: 400px;
  transition: opacity 0.3s linear;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: -1;
  opacity: 0;
  &.active {
    z-index: 99999999;
    opacity: 1;
  }
}
</style>
