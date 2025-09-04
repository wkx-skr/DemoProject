<template>
  <div
    class="mapWrap"
    :style="{ width: styles.miniViewW, height: styles.miniViewH }"
  >
    <lineage-view
      :style="{
        transform: `scale(${styles.scale})`,
        'transform-origin': '0% 0%',
      }"
      :mini="true"
      class="miniview"
      ref="view"
    ></lineage-view>
    <div
      class="mask"
      ref="mask"
      :style="{
        width: styles.maskW + 'px',
        height: styles.maskH + 'px',
        transform: `scale(${maskScale})`,
        'transform-origin': '0% 0%',
      }"
      @mousedown.stop="maskMousedown($event)"
      @mousemove.stop="maskMousemove($event)"
      @mouseup.stop="maskMouseup($event)"
    ></div>
    <div class="cBtn">
      <i class="icons el-icon-circle-plus-outline" @click="zoomIn"></i>
      <i class="icons el-icon-remove-outline" @click="zoomOut"></i>
      <i class="icons el-icon-refresh-left" @click="reset"></i>
    </div>
  </div>
</template>

<script>
import lineageView from './lineageView'

export default {
  components: {
    lineageView,
  },
  data() {
    return {
      miniViewScale: 0,
      LineageGraph: null,
      styles: {},
      dragFlag: false,
      mouseObj: {
        mouseX: 0,
        mouseY: 0,
      },
      zoom: {
        step: 0.1,
        inOut: -1,
      },
      maskScale: 1,
    }
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.maskMouseup)
    document.onselectstart = null
  },
  created() {
    document.addEventListener('mouseup', this.maskMouseup)
    // 解决拖动会选中文字的问题
    document.onselectstart = function () {
      return false
    }
  },
  methods: {
    zoomIn() {
      this.zoom.inOut = 1
      let miniViewScale = this.zoom.step + this.miniViewScale
      if (miniViewScale > this.styles.scale) {
        miniViewScale = this.styles.scale
      }
      this.miniViewScale = miniViewScale
      let viewScale = this.zoom.step + this.LineageGraph.getMaxViewScale()
      this.LineageGraph.maxViewScale(viewScale)
      this.LineageGraph.minMaskScale(viewScale)
    },
    zoomOut() {
      this.zoom.inOut = 0
      let miniViewScale = this.miniViewScale - this.zoom.step
      if (miniViewScale <= 0) {
        miniViewScale = 0
      }
      this.miniViewScale = miniViewScale
      let viewScale = this.LineageGraph.getMaxViewScale() - this.zoom.step
      this.LineageGraph.maxViewScale(viewScale)
      this.LineageGraph.minMaskScale(viewScale)
    },
    reset() {
      this.LineageGraph.maxViewScale(1)
      this.LineageGraph.setMiniViewStyle()
    },
    // 缩放后mask 尺寸
    setMaskScale(scale) {
      let tempStyle = this.styles
      tempStyle.scaleWidth = scale.scaleWidth
      tempStyle.scaleHeight = scale.scaleHeight
      tempStyle.maskW = scale.maskW
      tempStyle.maskH = scale.maskH
      tempStyle.scale1 = scale.scale1
      this.styles = tempStyle
      const m = this.$refs.mask
      let sLeft = (m.offsetLeft * scale.scale1) / 2
      let sTop = (m.offsetTop * scale.scale1) / 2
      if (this.zoom.inOut === 0) {
        const left = m.offsetLeft + sLeft
        const top = m.offsetTop + sTop
        this.rangeLimit(left, top, m)
      } else if (this.zoom.inOut === 1) {
        const left = m.offsetLeft - sLeft
        const top = m.offsetTop - sTop
        this.rangeLimit(left, top, m)
      }
    },
    setLineageObj(lineage) {
      this.LineageGraph = lineage
    },
    setStyle(styles) {
      this.styles = styles
    },
    maskMousedown(e) {
      const mask = this.$refs.mask
      e = e || window.event
      this.dragFlag = true
      this.mouseObj.mouseX = e.clientX - mask.offsetLeft
      this.mouseObj.mouseY = e.clientY - mask.offsetTop
    },
    maskMousemove(e) {
      const mask = this.$refs.mask
      if (this.dragFlag) {
        e = e || window.event
        let maskX = e.clientX - this.mouseObj.mouseX
        let maskY = e.clientY - this.mouseObj.mouseY
        this.rangeLimit(maskX, maskY, mask)
        const viewLeft = maskX / this.styles.scale1
        const viewTop = maskY / this.styles.scale1
        this.LineageGraph.viewMove(viewLeft, viewTop)
      }
    },
    maskMouseup() {
      this.dragFlag = false
    },
    setMaskMove(x, y) {
      if (!this.dragFlag) {
        const mask = this.$refs.mask
        let left = x * this.styles.scale1
        let top = y * this.styles.scale1
        this.rangeLimit(left, top, mask)
      }
    },
    rangeLimit(left, top, dom) {
      let mapWrap = $('.mapWrap')
      if (left < 0) left = 0
      if (top < 0) top = 0
      if (left > mapWrap.width() - dom.clientWidth - 2) {
        left = mapWrap.width() - dom.clientWidth - 2
      }
      if (top > mapWrap.height() - dom.clientHeight - 2) {
        top = mapWrap.height() - dom.clientHeight - 2
      }
      let minCanvas = this.$refs.view.$refs.canvas
      let minCanvasWidth = minCanvas.width * this.styles.scale
      let minCanvasHeight = minCanvas.height * this.styles.scale
      if (top + this.styles.maskH > minCanvasHeight - 2) {
        let t = top + this.styles.maskH
        top = top - (t - minCanvasHeight) - 2
        if (top < 0) {
          top = 0
        }
      }
      if (left + this.styles.maskW > minCanvasWidth - 2) {
        let l = left + this.styles.maskW
        left = left - (l - minCanvasWidth) - 2
        if (left < 0) {
          left = 0
        }
      }
      dom.style.left = left + 'px'
      dom.style.top = top + 'px'
    },
  },
}
</script>

<style scoped lang="scss">
/deep/ .shape.column {
  background: transparent !important;
}
/deep/ .shape {
  cursor: default !important;
}

.mapWrap {
  position: absolute;
  border: 1px solid gray;
  transition: right 0.4s;
  .miniview {
    position: absolute;
    top: 0;
    left: 0;
  }

  .mask {
    width: 240px;
    height: 80px;
    box-sizing: border-box;
    border: 1px solid rgb(0, 153, 255);
    background: transparent;
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;

    &:hover {
      cursor: move;
    }
  }

  .cBtn {
    position: absolute;
    top: -100px;
    right: 0;

    .icons {
      display: block;
      font-size: 20px;
      color: #000;
      margin-top: 10px;
      cursor: pointer;
    }
  }
}
</style>
