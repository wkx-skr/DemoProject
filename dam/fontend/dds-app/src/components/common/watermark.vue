<template>
  <div class="watermark-container" v-if="show">
    <div class="watermark-wrapper" ref="watermarkWrapper"></div>
  </div>
</template>

<script>
export default {
  name: 'Watermark',
  props: {
    // 水印文字
    text: {
      type: String,
      default: '',
    },
    // 水印字体大小
    fontSize: {
      type: Number,
      default: 14,
    },
    // 水印颜色
    color: {
      type: String,
      default: 'rgba(0, 0, 0, 0.1)',
    },
    // 水印旋转角度
    rotate: {
      type: Number,
      default: -20,
    },
    // 水印之间的间距
    gap: {
      type: Array,
      default: () => [200, 200], // 增大间距，减少水印密度
    },
    // 是否显示水印
    show: {
      type: Boolean,
      default: true,
    },
    // z-index
    zIndex: {
      type: Number,
      default: 9999,
    },
  },
  data() {
    return {
      observer: null,
      watermarkEl: null,
    }
  },
  mounted() {
    this.createWatermark()
    this.observeWatermark()
  },
  beforeDestroy() {
    this.destroyObserver()
  },
  methods: {
    createWatermark() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const { text, fontSize, color, rotate, gap } = this

      // 设置画布大小
      const [gapX, gapY] = gap
      canvas.width = gapX
      canvas.height = gapY

      // 设置字体样式
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 清空画布
      ctx.clearRect(0, 0, gapX, gapY)
      
      // 旋转并绘制文字
      ctx.translate(gapX / 2, gapY / 2)
      ctx.rotate((rotate * Math.PI) / 180)
      ctx.fillText(text, 0, 0)

      // 创建水印元素
      const base64Url = canvas.toDataURL('image/png')
      const watermarkEl = document.createElement('div')
      const style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: ${this.zIndex};
        pointer-events: none;
        background-repeat: repeat;
        background-image: url(${base64Url});
      `
      watermarkEl.setAttribute('style', style)

      // 添加到容器中
      const wrapper = this.$refs.watermarkWrapper
      if (wrapper) {
        wrapper.innerHTML = ''
        wrapper.appendChild(watermarkEl)
        this.watermarkEl = watermarkEl
      }
    },
    observeWatermark() {
      // 防止水印被篡改
      if (!this.watermarkEl) return

      const wrapper = this.$refs.watermarkWrapper
      if (!wrapper) return

      this.destroyObserver()

      this.observer = new MutationObserver(mutations => {
        if (mutations.length) {
          const removed = mutations.some(
            m =>
              [...m.removedNodes].some(n => n === this.watermarkEl) ||
              (m.type === 'attributes' && m.target === this.watermarkEl)
          )
          if (removed) {
            this.observer.disconnect()
            this.createWatermark()
            this.observeWatermark()
          }
        }
      })

      this.observer.observe(wrapper, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    },
    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
    }
  },
  watch: {
    text() {
      this.createWatermark()
    },
    color() {
      this.createWatermark()
    },
    fontSize() {
      this.createWatermark()
    },
    rotate() {
      this.createWatermark()
    },
    gap() {
      this.createWatermark()
    },
    show(val) {
      if (val) {
        this.$nextTick(() => {
          this.createWatermark()
          this.observeWatermark()
        })
      }
    },
  },
}
</script>

<style scoped>
.watermark-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
.watermark-wrapper {
  width: 100%;
  height: 100%;
}
</style>
