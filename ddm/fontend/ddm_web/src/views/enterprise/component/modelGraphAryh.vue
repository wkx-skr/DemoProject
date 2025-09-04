<template>
  <div class="mxgraphBox">
    <datablau-dialog class="company-info-edit-wrapper" :visible.sync="flag" width="90%" :before-close="close" title="模型">
      <div class="abow_dialog">
        <div id="consa-graph" ref="consa"></div>
  <!--        缩略图-->
        <div :class="['outline-container', {shrink: shrink}]" v-show="showOutline">
          <div class="navigator-header" @click="shrink = !shrink"><img :src="navigatorImg" alt="" /><span class="name">导航</span><div class="triangle"><span></span><span></span></div></div>
          <div id="graph-outline" ref="outline" class="graph-outline"></div>
          <div class="resize-wrapper">
            <div class="img-wrapper" style="margin-right: 10px;" @click="minView">
              <img :src="reduceImg" />
            </div>
            <el-slider class="slider-wrapper" :min="0.1" :max="2" :step="0.1" v-model="scale" @change="sliderChange"></el-slider>
            <div class="img-wrapper" style="margin-left: 10px;" @click="maxView">
              <img :src="plusImg" />
            </div>
          </div>
        </div>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import $ from 'jquery'
// import DrawGraph from '@/views/list/graph/DrawGraph'
export default {
  props: {
    flag: {
      type: Boolean,
      default: () => false
    },
    currentId: {
      type: String,
      default: () => ''
    },
    dataByType: {
      type: Object,
      default: () => {}
    }

  },
  watch: {
    flag: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.start()
          })
        }
      },
      immediate: true
    }
  },
  data () {
    return {
      showOutline: true,
      shrink: true,
      plusImg: require('../../../assets/images/icon/plus.svg'),
      reduceImg: require('../../../assets/images/icon/reduce.svg'),
      navigatorImg: require('../../../assets/images/icon/navigator.svg'),
      scale: 1,
      graph: null,
      param: { $This: this, diagramId: this.currentId }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    sliderChange (val) {
      const scale = Math.pow(1.2, (val - 1) * 10)
      this.graph.getView().setScale(scale)
    },
    minView () {
      if (this.scale === 0.1) {
        return
      }
      this.graph.zoomOut()
      this.scale = (this.scale * 10 - 1) / 10
    },
    maxView () {
      if (this.scale === 2) {
        return
      }
      this.graph.zoomIn()
      this.scale = (this.scale * 10 + 1) / 10
    },
    modelData () {
      // let data = this.dataByType

      // if (this.graph) {
      //   this.graph.destroy()
      // }
      // this.graph = new DrawGraph($('#consa-graph')[0], data, this.param, $('.graph-outline')[0])
      // this.graph.start()
      this.arrowType()
    },
    start () {
      const MxPoint = mxPoint
      const MxEditor = mxEditor
      const MxGraph = mxGraph
      const MxHierarchicalLayout = mxHierarchicalLayout
      const MxRectangle = mxRectangle
      const MxFastOrganicLayout = mxFastOrganicLayout
      const MxRubberband = mxRubberband
      const MxOutline = mxOutline
      if (!window.mxGraph) {
        // 不兼容显示错误信息
        // mxUtils.error('Browser is not supported!', 200, false)
      } else {
        // 禁用鼠标右键
        const container = document.getElementById('consa-graph')
        container.innerHTML = ''
        // const container = this.$refs.consa
        mxEvent.disableContextMenu(container)
        this.graph = new MxGraph(container)
        // const editor = new MxEditor()
        // editor.setGraphContainer(this.container)
        // const graph1 = editor.graph
        // let layout = new MxHierarchicalLayout(graph1)
        // let organic = new MxFastOrganicLayout(graph1)
        // organic.forceConstant = 120
        // 画小图
        const outLine = document.getElementById('graph-outline')
        outLine.innerHTML = ''
        // const outLine = $('#graph-outline')
        const outln = new MxOutline(this.graph, outLine)
        outln.setZoomEnabled(true)

        this.graph.setHtmlLabels(true) // Label 将显示 Html 格式的 Value
        this.graph.setCellsEditable(false)// 开启方块上的文字编辑功能
        this.graph.setVertexLabelsMovable(false) // 允许移动 Vertex 的 Label
        this.graph.setConnectable(true)
        this.graph.panningHandler.useLeftButtonForPanning = true // 设置左键可移动容器坐标轴
        this.graph.container.style.cursor = 'move'
        this.graph.setPanning(true) // //设置镜头可移动
        this.graph.setResizeContainer(false) // 容器大小自适应
        // 开启区域选择
        const rubber = new MxRubberband(this.graph)
        // 插入节点获得默认的父节点
        const parent = this.graph.getDefaultParent()
        const model = this.graph.getModel()
        model.beginUpdate()
        this.graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalEdgeStyle' // 定义线的样式

        let html = `<div class="demo">
      <div class="title">标题</div>
      <ul>
        <li>字段1</li>
        <li>字段2</li>
      </ul>
</div>`
        // let v1
        // let geo
        try {
          const v1 = this.graph.insertVertex(parent, 10, html, 20, 20, 100, 120, 'fillColor=none;strokeColor=#DDD')// 创建第一个节点
          const v2 = this.graph.insertVertex(parent, 11, html, 200, 150, 100, 120, 'fillColor=none;strokeColor=#DDD')// 创建第二个节点
          const v3 = this.graph.insertVertex(parent, 12, html, 350, 20, 100, 120, 'fillColor=none;strokeColor=#DDD')// 创建第二个节点
          const e1 = this.graph.insertEdge(parent, 1, '', v1, v2)// 创建连线
          const e2 = this.graph.insertEdge(parent, 1, '', v2, v3, 'dashed=1;startArrow=connectorBasic;endArrow=connectorCircle;sourcePerimeterSpacing=1;')// 创建连线
        } finally {
          this.graph.getModel().endUpdate()
        }

        // 更新画小图
        // console.log(outLine)
        // outLine.refresh()

        // outln.getModel().setGeometry(v1, geo)

        // var title = document.getElementsByClassName('title')[0]
        // console.log(title)
        // container.onclick = function (e) {
        //   console.log('title', e.target)
        // }
      }
    },
    // 箭头样式
    arrowType () {
      function createArrow ({ hasCircle = false, hasFoot = false }) {
        return function (canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
          return function () {
            let action = (type, x, y, ...args) => {
              if (Math.abs(unitY) < 0.1) {
                if (Math.abs(unitX - 1) < 0.1) {
                  canvas[type](pe.x - y, pe.y + x, ...args)
                } else if (Math.abs(unitX + 1) < 0.1) {
                  canvas[type](pe.x + y, pe.y + x, ...args)
                }
              } else {
                if (Math.abs(unitY - 1) < 0.1) {
                  canvas[type](pe.x + x, pe.y - y, ...args)
                } else if (Math.abs(unitY + 1) < 0.1) {
                  canvas[type](pe.x + x, pe.y + y, ...args)
                }
              }
              //            canvas[type](pe.x - x*unitY , pe.y-y*unitY)
            }
            let ellipseAction = (x, y, a, b) => {
              if (Math.abs(unitY) < 0.1) {
                if (Math.abs(unitX - 1) < 0.1) {
                  canvas.ellipse(pe.x - y - b / 2, pe.y + x - a / 2, b, a)
                } else if (Math.abs(unitX + 1) < 0.1) {
                  canvas.ellipse(pe.x + y - b / 2, pe.y + x - a / 2, b, a)
                }
              } else {
                if (Math.abs(unitY - 1) < 0.1) {
                  canvas.ellipse(pe.x + x - a / 2, pe.y - y - b / 2, a, b)
                } else if (Math.abs(unitY + 1) < 0.1) {
                  canvas.ellipse(pe.x + x - a / 2, pe.y + y - b / 2, a, b)
                }
              }
            }
            canvas.styleEnabled = true
            canvas.setFillColor('#F0F0F0')
            canvas.begin()

            if (hasFoot) {
              action('moveTo', -4, 13)
              action('lineTo', 4, 13)
              action('moveTo', 0, 12)
              action('lineTo', 2, 6)
              action('moveTo', 3, 3)
              action('lineTo', 4, 0)
              action('moveTo', 0, 12)
              action('lineTo', -1, 9)
              action('moveTo', -2, 6)
              action('lineTo', -4, 0)
            } else {
              action('moveTo', -6, 13)
              action('lineTo', 6, 13)
            }
            canvas.stroke()
            if (hasCircle) {
              ellipseAction(0, 18, 9, 9)
              canvas.fillAndStroke()
            }

            canvas.close()
          }
        }
      }

      mxMarker.addMarker('connectorBasic', createArrow({ hasCircle: false }))
      mxMarker.addMarker('connectorCircle', createArrow({ hasCircle: true }))
      mxMarker.addMarker('connectorHasFoot', createArrow({ hasCircle: true, hasFoot: true }))
      mxMarker.addMarker('connectorHasFootNoCircle', createArrow({ hasCircle: false, hasFoot: true }))
    }
  },
  mounted () {
    this.modelData()
  }
}
</script>

<style scoped lang='scss'>
  @import '../../list/graph/graph';
  @import '../../list/graph/scoped';
  #consa-graph{
    overflow: hidden;
  }
  .datablau-dialog-content{
    /*position: relative;*/
  }
  .abow_dialog{
    height: 59vh;
    /*position: relative;*/
  }
  .outline-container{
    position: absolute;
    right: 1px;
    bottom: 2px;
    width: 240px;
    height: 234px;
    background: #fff;
    .navigator-header {
      padding: 0 0 0 10px;
      line-height: 26px;
      color: #3A3E44;
      font-size: 12px;
      border-bottom: 1px solid #E8E8E8;
      cursor: pointer;
    }
    .triangle{
      margin-right: 10px;
      height: 26px;
      display: inline-block;
      vertical-align: middle;
      float: right;
      span{
        display: inline-block;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-right-color: #969696;
        vertical-align: middle;
        &:last-child{
          margin-left: -6px;
        }
      }
    }
  }
  .resize-wrapper{
    position: absolute;
    bottom: 5px;
    left: 20px;
    right: 20px;
    font-size: 12px;
    .img-wrapper{
      position: relative;
      top: -2px;
      display: inline-block;
      vertical-align: middle;
      cursor: pointer;
      width: 10px;
    }
    .slider-wrapper {
      display: inline-block;
      width: 160px;
      vertical-align: middle;
    }
  }
  /deep/{
    .el-slider__runway {
      height: 4px;
      border-radius: 2px;
      background-color: #EAEAEA;
    }
    .el-slider__button {
      width: 14px;
      height: 14px;
      box-shadow: 0px 0px 6px rgba(31, 26, 47, 0.16);
      background-color: #fff;
      border: none;
    }
    .el-slider__button-wrapper {
      top: -16px;
    }
    .el-slider__bar {
      background-color: initial;
    }
  }
/*  */
  .box{
    border: 1px solid #000;
  }
</style>
