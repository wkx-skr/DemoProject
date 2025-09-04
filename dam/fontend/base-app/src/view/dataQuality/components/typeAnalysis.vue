<template>
  <div
    :class="{
      'type-analysis': heightType === 0,
      'type-analysis-2': heightType === 1,
    }"
    ref="chart1"
  ></div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  data() {
    return {
      heightType: null,
      theme: 'light',
      currentTypeData: null,
      option: {},
      myChart: null,
      legend: [],
    }
  },
  mounted() {
    this.theme = this.$globalData.$theme.themeName === 'dark' ? 'dark' : 'light'
    this.$bus.$on('typeData', (typeData, type, legend) => {
      this.legend = legend
      this.heightType = type
      this.currentTypeData = typeData
      this.$nextTick(() => {
        this.typeAnalysis(typeData)
      })
    })
    this.$bus.$on('changeGlobalTheme', this.handleThemeChange)
  },
  beforeDestroy() {
    this.$bus.$off('typeData')
    var chart1 = this.$refs.chart1
    var myChart = echarts.init(chart1)
    myChart.dispose()
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
    this.$bus.$off('changeGlobalTheme', this.handleThemeChange)
  },
  methods: {
    handleThemeChange(newTheme) {
      this.theme = newTheme === 'dark' ? 'dark' : 'light'
      if (this.currentTypeData) {
        this.myChart.dispose()
        this.typeAnalysis(this.currentTypeData)
      }
    },
    typeAnalysis(val) {
      let tempData = []
      let series = []
      tempData.push(['product', ...val.dateStr])
      for (let key in val) {
        if (key !== 'dateStr') {
          tempData.push([key, ...val[key]])
          series.push({ type: 'line', smooth: true, seriesLayoutBy: 'row' })
        }
      }
      var option = {}
      var chart1 = this.$refs.chart1
      var myChart = echarts.init(chart1, this.theme)
      option = {
        legend: {
          data: this.legend,
        },
        tooltip: {
          trigger: 'axis',
          showContent: false,
        },
        dataset: {
          source: tempData,
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 45,
          },
        },
        yAxis: { gridIndex: 0 },
        grid: {
          top: '40%',
          x: 80,
          y: 70,
          x2: 80,
          y2: 120,
        },
        series: [
          ...series,
          {
            type: 'pie',
            id: 'pie',
            radius: '20%',
            center: ['50%', '25%'],
            label: {
              formatter: '{b}: {@1} ({d}%)',
            },
            encode: {
              itemName: 'product',
              value: 1,
              tooltip: 1,
            },
          },
        ],
      }
      myChart.on('updateAxisPointer', function (event) {
        var xAxisInfo = event.axesInfo[0]
        if (xAxisInfo) {
          var dimension = xAxisInfo.value + 1
          myChart.setOption({
            series: {
              id: 'pie',
              label: {
                formatter: '{b}: {@[' + dimension + ']} ({d}%)',
              },
              encode: {
                value: dimension,
                tooltip: dimension,
              },
            },
          })
        }
      })
      this.myChart = myChart
      myChart.setOption(option)
    },
  },
}
</script>
<style scoped>
.type-analysis {
  min-width: 1200px;
  height: 495px;
}
.type-analysis-2 {
  min-width: 1200px;
  height: 495px;
}
</style>
