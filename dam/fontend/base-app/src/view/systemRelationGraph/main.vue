<template>
  <div id="graph-container">
    <div id="no-lineage-warn" v-show="!hasData">
      当前没有血缘关系，不能展示系统关系，请先导入血缘文件。
    </div>
    <div id="graph-canvas" v-show="hasData"></div>
    <el-button id="graph-layout-btn" @click="relayout" v-show="hasData">
      <i
        class="fa fa-object-group"
        aria-hidden="true"
        style="margin-right: 5px"
      ></i>
      重新布局
    </el-button>
  </div>
</template>

<script>
import SystemRelationGraph from './SystemRelationGraph.js'
export default {
  data() {
    return {
      rawData: {},
      data: {},
      hasData: true,
      param: {},
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.$http
        .get(this.$meta_url + '/service/lineage/overview')
        .then(res => {
          this.rawData = res.data
          this.handleData()
          if (this.hasData) {
            this.drawGraph()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleData() {
      this.data = this.rawData
      if (!this.data.lines || this.data.lines.length === 0) {
        this.hasData = false
      } else {
        this.hasData = true
      }
    },
    relayout() {
      this.graph.relayout()
    },
    drawGraph() {
      const container = $('#graph-canvas')[0]
      const outlineContainer = undefined
      const data = this.data
      const param = this.param
      this.graph = new SystemRelationGraph(
        container,
        data,
        param,
        outlineContainer,
        this
      )
      this.graph.start()
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
#graph-container {
  position: absolute;
  top: 15px;
  left: 20px;
  right: 20px;
  bottom: 15px;
}

#graph-canvas {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 45px;
  border: 1px solid #dfdfdf;
  background: #fff;
}

#graph-layout-btn {
  position: absolute;
  bottom: 0px;
}

#no-lineage-warn {
  position: absolute;
  width: 100%;
  top: 50%;
  text-align: center;
  font-size: 30px;
  color: #afafaf;
}
</style>
