<template>
  <div id="demo" style="width: 400px; height: 400px; background-color: pink">
    <svg class="chart"></svg>
  </div>
</template>
<script>
if (!window.d3 || window.d3.version !== '5.7.0') {
  $(document.body).append(
    '<script src="./static/libs/d3.3.5.17.min.js"><\/script>'
  )
}
const BAR_HEIGHT = 20
const GRAPH_WIDTH = 420
class DrawD3Graph {
  constructor(container, data) {
    this.container = container
    this.data = data
  }

  play() {
    //    this.drawBarChart()
  }

  drawColumnChart() {
    var width = 960
    var height = 500
    var data = [
      { name: 'A', value: 0.08167 },
      { name: 'B', value: 0.01492 },
      { name: 'C', value: 0.02782 },
    ]
    var y = d3.scale.linear().range([height, 0])
    var chart = d3
      .select(this.container)
      .attr('width', width)
      .attr('height', height)
  }

  drawBarChart() {
    var width = GRAPH_WIDTH
    var barHeight = BAR_HEIGHT
    var data = this.data
    var x = d3.scale
      .linear()
      .domain([0, d3.max(data)])
      .range([0, width])
    var chart = d3
      .select(this.container)
      .attr('width', width)
      .attr('height', barHeight * data.length)
    var bar = chart
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        return 'translate(0,' + i * barHeight + ')'
      })
    bar
      .append('rect')
      .attr('width', x)
      .attr('height', barHeight - 1)
    bar
      .append('text')
      .attr('x', d => {
        return x(d) - 3
      })
      .attr('y', barHeight / 2)
      .attr('dy', '.35em')
      .text(d => {
        return d
      })
  }
}
export default {
  mounted() {
    const dom = '.chart'
    const data = [4, 8, 15, 16, 23, 42]
    var graph = new DrawD3Graph(dom, data)
    graph.play()
  },
  data() {
    return {}
  },
  methods: {
    note() {
      d3.selectAll('div') // select doms by tag
      d3.select('div') // select dom by tag
      d3.select('div').data([1, 2, 3]) // save data to dom
    },
  },
}
</script>
<style lang="scss">
.chart {
  rect {
    fill: steelblue;
  }
  text {
    fill: white;
    font: 10px sans-serif;
    text-anchor: end;
  }
}
</style>
