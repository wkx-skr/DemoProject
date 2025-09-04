<template>
  <div></div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  mounted() {
    if (this.tableData && this.tableData.length > 0) {
      this.tableData.forEach((item, index) => {
        if (item.keys.length > 0) {
          this.keys = item.keys
          return
        }
      })
      this.setOption()
      this.draw()
    }
    $(window).resize(this.handleResize)
    this.handleResize()
  },
  props: {
    tableData: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      option: null,
      graph: null,
      resize: [],
      keys: [],
    }
  },
  methods: {
    handleResize() {
      this.resize.forEach(item => {
        setTimeout(() => {
          item()
        })
      })
    },
    setOption() {
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let html = params[0].name
            params.forEach((item, index) => {
              html += `<br/>${item.marker + item.seriesName}: ${
                item.value === 0.1
                  ? 0
                  : `${item.value}`.includes('.')
                  ? Number(`${item.value}`.split('.')[0])
                  : item.value
              }`
            })
            return html
          },
        },
        xAxis: {
          type: 'category',
          data: this.keys,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#9096a3',
          },
          offset: 10,
        },
        yAxis: {
          type: 'log',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#9096a3',
            formatter: function (value) {
              return value === 0.1 ? 0 : value
            },
          },
          splitLine: {
            lineStyle: {
              color: ['#efefef'],
            },
          },
        },
        grid: {
          top: 20,
          bottom: 10,
          left: 0,
          right: '40%',
          containLabel: true,
        },
        legend: {
          show: true,
          orient: 'vertical',
          icon: 'roundRect',
          itemWidth: 8,
          itemHeight: 8,
          textStyle: {
            color: '#9096a3',
          },
          left: '65%',
          top: 10,
        },
        series: [],
      }
      this.tableData.forEach((item, index) => {
        const series = {
          name: this.$utils.getBranchNameByBm(item.category),
          // data: item.values,
          // data: item.values.slice(0, item.keys.length),
          data: item.values.slice(-item.keys.length),
          type: 'line',
          // symbol: 'none'
        }
        if (index === 0) {
          series.itemStyle = {
            color: '#f15466',
          }
        } else if (index === 1) {
          series.itemStyle = {
            color: '#2eb0d1',
          }
        } else if (index === 2) {
          series.itemStyle = {
            color: '#ffc14f',
          }
        }
        option.series.push(series)
      })
      option.author = 'wk'
      this.option = option
    },
    draw() {
      const graph = echarts.init(this.$el)
      graph.setOption(this.option)
      this.resize.push(graph.resize)
    },
  },
}
</script>
<style lang="scss" scoped="scoped"></style>
