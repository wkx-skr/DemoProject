<template>
  <div class="new-container">
    <div id="curve-analysis"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  data() {
    return {}
  },
  mounted() {
    this.$bus.$on('curveData', (name, all, add, del, type) => {
      this.$nextTick(() => {
        this.curveAnalysis(name, all, add, del, type)
      })
    })
    this.$nextTick(() => {
      this.curveAnalysis()
    })
  },
  beforeDestroy() {
    this.$bus.$off('curveData')
    if (document.getElementById('curve-analysis')) {
      var myChart = echarts.init(document.getElementById('curve-analysis'))
      myChart.dispose()
    }
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
  },
  methods: {
    curveAnalysis(name, all, add, del, type) {
      var myChart = echarts.init(document.getElementById('curve-analysis'))
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#283b56',
            },
          },
        },
        legend: {
          data:
            type === 0
              ? [
                  this.$t('quality.page.ruleReport.addRule'),
                  this.$t('quality.page.ruleReport.deleteRule'),
                  this.$t('quality.page.ruleReport.ruleTotal'),
                ]
              : [
                  this.$t('quality.page.problemReport.addProblem'),
                  this.$t('quality.page.problemReport.closeProblem'),
                  this.$t('quality.page.problemReport.problemTotal'),
                ],
        },
        color: ['#5587CF', '#F48E40', '#A3A3A3'],
        grid: {
          height: '350px',
        },
        xAxis: [
          {
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 45,
            },
            boundaryGap: true,
            data: name,
          },
          {
            type: 'category',
            boundaryGap: true,
            data: (function () {
              var res = []
              if (name) {
                name.forEach(item => {
                  res.push('')
                })
              }
              return res
            })(),
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
          {
            type: 'value',
          },
        ],
        series: [
          {
            name:
              type === 0
                ? this.$t('quality.page.ruleReport.addRule')
                : this.$t('quality.page.problemReport.addProblem'),
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: add,
          },
          {
            name:
              type === 0
                ? this.$t('quality.page.ruleReport.deleteRule')
                : this.$t('quality.page.problemReport.closeProblem'),
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: del,
          },
          {
            name:
              type === 0
                ? this.$t('quality.page.ruleReport.ruleTotal')
                : this.$t('quality.page.problemReport.problemTotal'),
            type: 'line',
            data: all,
          },
        ],
      })
    },
  },
}
</script>

<style scoped>
#curve-analysis {
  width: 1200px;
  height: 560px;
  overflow: auto;
}
</style>
