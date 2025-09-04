<template>
  <div class="networ-component">
    <div class="network-card" @wheel.stop>
      <div ref="network" class="network">
        <p>{{ dataLoaded ? emptyText : loadingSystem }}</p>
      </div>
    </div>
    <ul class="visControl">
      <li class="controlItem fit" @click="networkFit">
        <el-tooltip effect="light" content="重置显示位置" placement="bottom">
          <i class="el-icon-location-outline"></i>
        </el-tooltip>
      </li>
      <li class="controlItem filter" @click="networkFilter" v-if="!filtered">
        <el-tooltip
          effect="light"
          content="显示重要性为高的系统"
          placement="bottom"
        >
          <i class="fa fa-filter"></i>
        </el-tooltip>
      </li>
      <li class="controlItem all" @click="networkShowAll" v-else>
        <el-tooltip effect="light" content="显示所有系统" placement="right">
          <i class="fa fa-mail-reply"></i>
        </el-tooltip>
      </li>
    </ul>
  </div>
</template>

<script>
import vis from 'vis'
export default {
  data() {
    return {
      filtered: false,
      datasourceCount: {},
      catagoriesMap: {},
      lineageDataSet: [],
      emptyText: '当前没有系统，不能展示系统关系，请先创建系统或导入系统名录。',
      loadingSystem: '数据加载中...',
      dataLoaded: false,
      lineageNetworkMethod: {},
      colorMap: {},
    }
  },
  components: {},
  props: {},
  computed: {},
  mounted() {
    this.drawNetwork()

    this.$bus.$on('changeGlobalTheme', this.handleThemeChange)
  },
  beforeDestroy() {
    this.$bus.$off('changeGlobalTheme', this.handleThemeChange)
  },
  methods: {
    drawNetwork() {
      const self = this
      const nodes = []
      if (!this.$modelCategories.forEach) {
        return
      }
      this.$modelCategories.forEach(catagory => {
        const node = {
          id: catagory.categoryId,
          primaryModelId: catagory.primaryModelId,
          label:
            catagory.categoryName + '(' + catagory.categoryAbbreviation + ')',
          importance: catagory.importance,
        }
        nodes.push(node)
      })
      // 获得系统数据源数量
      const dataSourceCountUrl =
        this.$url + '/service/modelCategories/datasourceCount'
      this.$http
        .get(dataSourceCountUrl)
        .then(res => {
          this.datasourceCount = res.data
          if (this.$featureMap.FE_LINEAGE) {
            // 拥有血缘lic
            this.drawLineageNetWork(nodes)
          } else if (this.$featureMap.FE_META) {
            // 显示系统调用
            this.drawSystemCallNetWork(nodes)
          }
        })
        .catch(e => this.$showFailure(e))
    },
    drawLineageNetWork(nodes) {
      const lineageDataUrl = this.$meta_url + '/service/lineage/overview'
      this.$http
        .get(lineageDataUrl)
        .then(res => {
          const nodesData = res.data.steps
          _.forOwn(nodesData, (value, key) => {
            const node = {
              id: parseInt(value.properties.modelCategoryId),
              targetId: value.id,
              name: value.name,
            }
            this.catagoriesMap[value.id] = value.properties.modelCategoryId
          })
          nodes.forEach(node => {
            const size = this.datasourceCount[node.id] || 0
            const nodeadd = {
              color: this.getRandomColor(),
              value: size,
            }
            _.assign(node, nodeadd)
          })
          const nodeSet = new vis.DataSet(nodes)
          const edges = []
          const edgesData = res.data.lines
          const duplicateTest = {}
          edgesData.forEach((item, index) => {
            const fromCId = this.catagoriesMap[item.sourceStepId]
            const toCId = this.catagoriesMap[item.targetStepId]
            if (duplicateTest[fromCId + '/' + toCId]) {
              return
            } else {
              duplicateTest[fromCId + '/' + toCId] = true
            }
            const edge = {
              from: fromCId,
              to: toCId,
              id: index,
            }
            edges.push(edge)
          })
          const edgeSet = new vis.DataSet(edges)
          const data = {
            nodes: nodeSet,
            edges: edgeSet,
          }
          this.drawNetworkSet({ nodeSet, edgeSet, data })
          this.dataLoaded = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    drawSystemCallNetWork(nodes) {
      this.$http
        .get(this.$meta_url + '/service/systemcall/overview')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            nodes.forEach(node => {
              const size = this.datasourceCount[node.id] || 0
              const nodeadd = {
                color: this.getRandomColor(),
                value: size,
              }
              _.assign(node, nodeadd)
            })
            const nodeSet = new vis.DataSet(nodes)
            const edges = []
            const edgesData = res.data
            const duplicateTest = {}
            edgesData.forEach((item, index) => {
              const fromCId = item.srcSystemId
              const toCId = item.dstSystemId
              if (duplicateTest[fromCId + '/' + toCId]) {
                return
              } else {
                duplicateTest[fromCId + '/' + toCId] = true
              }
              const edge = {
                from: fromCId,
                to: toCId,
                id: index,
              }
              edges.push(edge)
            })
            const edgeSet = new vis.DataSet(edges)
            const data = {
              nodes: nodeSet,
              edges: edgeSet,
            }
            this.drawNetworkSet({ nodeSet, edgeSet, data })
            this.dataLoaded = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    drawNetworkSet({ nodeSet, edgeSet, data }) {
      const self = this
      this.lineageDataSet = data
      const options = {
        edges: {
          arrows: 'to',
        },
        nodes: {
          shape: 'dot',
          font: {
            color: 'var(--default-opposite-color)',
          },
        },
        layout: {
          improvedLayout: false,
        },
      }
      if (data.nodes.length === 0 && data.edges.length === 0) return
      if (self.lineageNetwork != null) {
        self.lineageNetwork.destroy()
        self.lineageNetwork = null
      }
      const lineageNetwork = new vis.Network($('.network')[0], data, options)
      const initArr = ['click']
      initArr.forEach(event => {
        lineageNetwork.on(event, item => {
          this['handle' + event](
            item,
            lineageNetwork,
            nodeSet,
            edgeSet,
            options
          )
        })
      })
      this.lineageNetwork = lineageNetwork
      // lineageNetwork, nodeSet, edgeSet, options
      this.lineageNetworkMethod.filter = () => {
        const filterednode = new vis.DataSet(
          nodeSet.get({
            filter: item => {
              return item.importance === '高'
            },
          })
        )
        const filterededge = new vis.DataSet(
          edgeSet.get({
            filter: item => {
              return filterednode.get(item.from) && filterednode.get(item.to)
            },
          })
        )
        lineageNetwork.setData({
          nodes: filterednode,
          edges: filterededge,
        })
      }
      this.lineageNetworkMethod.showAll = () => {
        lineageNetwork.setData({
          nodes: nodeSet,
          edges: edgeSet,
        })
      }
    },
    networkFit() {
      this.lineageNetwork.fit({
        animation: true,
      })
    },
    networkFilter() {
      this.lineageNetworkMethod.filter()
      this.filtered = true
    },
    networkShowAll() {
      this.lineageNetworkMethod.showAll()
      this.filtered = false
    },
    pageTransition(item) {
      const targetedge = this.lineageDataSet.edges.get([item.edges[0]])[0]
      const srcNode = this.lineageDataSet.nodes.get([targetedge.from])[0]
      const dstNode = this.lineageDataSet.nodes.get([targetedge.to])[0]
      const data = {
        srcName: srcNode.label,
        dstName: dstNode.label,
        src: srcNode.id,
        dst: dstNode.id,
      }
      this.$confirm(
        '是否跳转查看"' +
          srcNode.label +
          '"到"' +
          dstNode.label +
          '"的血缘关系？',
        '跳转',
        {
          confirmButtonText: '跳转',
          type: 'warning',
        }
      )
        .then(() => {
          this.$router.push({
            name: 'lineage',
            query: data,
          })
        })
        .catch(() => {})
    },
    getRandomColor() {
      // return '#' + (function (h) {
      //   return new Array(7 - h.length).join("0") + h;
      // })((Math.random() * 0x1000000 << 0).toString(16));
      const colors = ['#009b61', '#00d889', '#00a7ff', '#ff8500']
      const index = parseInt(Math.random() * 4)
      return colors[index] || '#009b61'
    },

    handlezoom(item, visObj, nodeSet, edgeSet, options) {
      return false
    },
    handleclick(item, visObj, nodeSet, edgeSet, options) {
      const self = this
      const getSelection = visObj.getSelection()
      if (item.edges.length === 1 && item.nodes.length === 0) {
        self.pageTransition(item)
      } else if (item.nodes.length === 1) {
        visObj.focus(item.nodes[0], {
          animation: true,
        })
      }
    },
    handleThemeChange() {
      this.drawNetwork()
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.networ-component {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .network-card {
    height: 100%;
    // min-height: 680px;
    background-color: var(--default-bgc);
    position: relative;
    .network {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      p {
        display: inline-block;
        color: #aaa;
        font-size: 25px;
        padding-top: 20%;
      }
    }
    .control {
      position: absolute;
      bottom: 0;
      right: 0;
      border: 1px solid #aaa;
    }
  }
}
</style>
