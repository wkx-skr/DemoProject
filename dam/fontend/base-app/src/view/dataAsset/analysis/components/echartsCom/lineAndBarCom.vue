<template>
  <div class="echart-box">
    <div class="echart-container" :ref="containerRef || 'echartsCon'"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  data() {
    return {
      echartInstance: null,
    }
  },
  props: [
    'picTil',
    'options',
    'clear',
    'formatter',
    'yCategory',
    'yAxisDataLabel',
    'containerRef',
  ],
  methods: {
    drawEcharts() {
      let seriesData = []
      let valueData = []
      let categoryData = [
        {
          type: 'category',
          // boundaryGap: false,
          axisLabel: this.options.axisLabel,
          data: this.options.xAxisData,
          axisLine: {
            show: false, // 新的echarts需要设置true才会显示，默认是不显示的
          },
          axisTick: {
            show: false,
          },
          axisPointer: {
            show: true,
            type: 'shadow',
            label: { show: false }, // 去掉鼠标移入时，x轴文字的黑色底
            shadowStyle: {
              shadowColor: '#7F8FC',
              opacity: 0.2,
            },
          },
          // z: 20,
        },
      ]
      let len = this.options.seriesData.length < 3 ? 6 : 3
      this.options.yAxisData.forEach(item => {
        let obj = {
          type: 'value',
          name: item.name,
          splitNumber: 7,
          interval: item.interval,
          min: item.min,
          max: item.max,
          axisLine: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: { type: 'dashed' },
          },
          axisLabel: {
            formatter: '{value}',
          },
          axisPointer: {
            show: this.yAxisDataLabel != undefined ? this.yAxisDataLabel : true,
            type: 'line',
            lineStyle: {
              color: '#999',
              type: 'solid',
            },
            triggerTooltip: false,
          },
        }
        valueData.push(obj)
      })
      this.options.seriesData.forEach(item => {
        let obj = {
          name: item.name,
          type: item.type,
          data: item.data,
        }
        item.color && (obj.color = item.color)
        item.smooth && (obj.smooth = true)
        item.stack && (obj.stack = item.stack)
        obj.barWidth = 16
        const emphasis = {
          focus: 'series',
        }
        obj.emphasis = emphasis
        if (item.type === 'bar' && item.color1) {
          obj.itemStyle = {
            barBorderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: item.color1,
              },
              {
                offset: 1,
                color: item.color2,
              },
            ]),
          }
        } else if (item.type === 'line' && item.color1) {
          this.options.yAxisData.length === 2 && (obj.yAxisIndex = 1)
          obj.areaStyle = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: item.color1,
              },
              {
                offset: 1,
                color: item.color2,
              },
            ]),
          }
        }
        seriesData.push(obj)
      })
      this.$nextTick(() => {
        const opt = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
              shadowStyle: {
                color: 'rgba(0,0,0,0.3)',
              },
            },
            textStyle: {
              fontSize: 12,
            },
            // rich: {},
          },
          title: {
            text: this.picTil,
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal',
              color: ' #555',
            },
          },
          color: this.options.color || [],
          legend: this.options.legend,
          textStyle: {
            fontSize: 12,
            fontWeight: 'normal',
            color: ' #777',
          },
          grid: [
            {
              bottom: this.options.bottom,

              left: this.options.left || 30,
              right: this.options.right || 30,
            },
          ],
          xAxis: this.yCategory ? valueData : categoryData,
          yAxis: !this.yCategory ? valueData : categoryData,
          series: seriesData,
        }
        this.options.top && (opt.grid[0].top = this.options.top)
        this.options.dataZoom && (opt.dataZoom = this.options.dataZoom)
        this.formatter &&
          (opt.tooltip.formatter = data => {
            let res = `${data[0].name} <br/>`
            data.forEach(item => {
              !!item.value &&
                (res += `<span style="display: inline-block;width:10px;height:10px;border-radius: 10px;background: ${item.color};margin-right: 5px"></span>${item.seriesName}：${item.value}<br/>`)
            })
            return res
          })
        const container = this.$refs[this.containerRef || 'echartsCon']
        if (container) {
          this.echartInstance = echarts.init(container)
          this.echartInstance.setOption(opt)
        }
      })
    },
    handleResize() {
      if (this.echartInstance) {
        this.$nextTick(() => {
          this.echartInstance.resize()
        })
      } else {
        this.drawEcharts()
      }
    },
  },
  beforeDestroy() {
    $(window).off('resize', this.handleResize)
    this.echartInstance && echarts.dispose(this.echartInstance)
  },
  mounted() {
    $(window).resize(this.handleResize)
  },
  watch: {
    options: {
      handler(val) {
        console.log(val)
        this.drawEcharts()
      },
      immediate: true,
      deep: true,
    },
    clear(val) {
      if (val) {
        this.drawEcharts()
      }
    },
  },
}
</script>

<style scoped lang="scss">
.picTil {
  font-size: 14px;
  color: #555;
}
.echart-box {
  width: 100%;
  height: 100%;
}
.echart-container {
  width: 100%;
  height: 98%;
}
</style>
