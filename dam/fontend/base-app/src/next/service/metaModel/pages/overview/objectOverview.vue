<template>
  <div style="position: absolute;top:0;right: 0;bottom:0;left: 0;background-color: #000;"></div>
</template>
<script>
import Context from '@/next/service/metaModel/class/Context.ts';
import vis from 'vis'
export default {
  mounted() {
    this.getData()
  },
  components: {},
  data() {
    return {
      currentDomain: '',
      relationships: [],
      assets: [],
      nodes: null,
      edges: null,
      data: null,
      options: null,
    }
  },
  methods: {
    getData() {
      this.$http.post(`/metamodel/getConnections?namespace=${Context.namespace}`).then(res => {
        this.assets = res.data.objects;
        this.relationships = res.data.connections;
        this.draw();
      })
    },
    draw() {
      this.nodes = new vis.DataSet(this.assets.map(i => {
        return {
          id: i.id,
          label: "   " + i.name + "   ",
        }
      }))
      this.edges = new vis.DataSet(this.relationships.map(i => {
        return {
          from: i.sourceId,
          to: i.targetId,
          label: i.typeId.split('.').pop(),
        }
      }))
      this.options = {
        nodes: {
          // shape: 'dot',
          font: {
            // size: 16,
            fontSize: 18,
            color: '#2b2b2b',
          },
          shadow: true,
        },
        edges: {
          width: 3,
          dashes: true,
          arrows: 'to',
          length: 200,
          // shadow: true,
        },
        layout: {

        },
        physics: {
          enabled: true,
          forceAtlas2Based: {
            theta: 0.5,
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springConstant: 0.08,
            springLength: 100,
            damping: 0.4,
            avoidOverlap: 0
          },
          hierarchicalRepulsion: {
            centralGravity: 0.0,
            springLength: 100,
            springConstant: 0.01,
            nodeDistance: 120,
            damping: 0.09,
            avoidOverlap: 0
          },
          maxVelocity: 50,
          minVelocity: 0.1,
          solver: 'forceAtlas2Based',
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 100,
            onlyDynamicEdges: false,
            fit: true
          },
        },
      }
      this.data = {
        nodes: this.nodes,
        edges: this.edges,
      }
      const container = this.$el
      this.network = new vis.Network(container, this.data, this.options)
    },
  },
}
</script>
<style lang="scss" scoped>

</style>
