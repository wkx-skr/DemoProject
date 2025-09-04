<template>
  <div class="trend-chart" v-loading="loading">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    filterParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart: null,
      chartData: {
        dates: [],
        accuracy: [],
        completeness: [],
        effectiveness: [],
      },
      loading: false,
    }
  },
  methods: {
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      this.chart = echarts.init(this.$refs.chartContainer)
      this.updateChart()
    },
    updateChart() {
      const option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['准确性', '完整性', '有效性'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.chartData.dates,
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 1,
          interval: 0.2,
        },
        series: [
          {
            name: '准确性',
            type: 'line',
            data: this.chartData.accuracy,
            itemStyle: {
              color: '#FF6B6B',
            },
          },
          {
            name: '完整性',
            type: 'line',
            data: this.chartData.completeness,
            itemStyle: {
              color: '#4ECDC4',
            },
          },
          {
            name: '有效性',
            type: 'line',
            data: this.chartData.effectiveness,
            itemStyle: {
              color: '#FFD166',
            },
          },
        ],
      }
      this.chart.setOption(option)
    },
    fetchChartData() {
      this.loading = true
      const params = {
        buName: this.filterParams.businessDomainNames,
        username: this.filterParams.responsiblePersonNames, // 注意这两个值是相斥的
      }
      if (
        this.filterParams.statisticalPeriod &&
        this.filterParams.statisticalPeriod.length === 8
      ) {
        const timeStr = `${this.filterParams.statisticalPeriod.substring(
          0,
          4
        )}-${this.filterParams.statisticalPeriod.substring(4, 6)}`
        const endTime = new Date(timeStr)
        let year = endTime.getFullYear()
        let month = endTime.getMonth() + 1
        if (month === 1) {
          params.startTime = `${year - 1}01`
          params.endTime = `${year - 1}12`
        } else {
          params.startTime = `${year - 1}${String(month).padStart(2, '0')}`
          params.endTime = `${year}${String(month - 1).padStart(2, '0')}`
        }
      }
      this.$http
        .post(`/assets/checkResult/month`, params)
        .then(res => {
          const data = res.data || []
          this.chartData.dates = data.map(item => item.month)
          this.chartData.accuracy = data.map(item => item.accuracyRate)
          this.chartData.completeness = data.map(item => item.dataIntegrityRate)
          this.chartData.effectiveness = data.map(item => item.validityRate)
          this.updateChart()
        })
        .catch(err => {
          this.$showFailure(err)
          this.chartData.dates = []
          this.chartData.accuracy = []
          this.chartData.completeness = []
          this.chartData.effectiveness = []
          this.updateChart()
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  mounted() {
    this.initChart()
    this.fetchChartData()

    // 监听窗口大小变化，重新调整图表大小
    window.addEventListener('resize', () => {
      this.chart && this.chart.resize()
    })
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    // 移除事件监听
    window.removeEventListener('resize', this.chart.resize)
  },
}
</script>

<style lang="scss" scoped>
.trend-chart {
  width: 100%;

  .chart-container {
    width: 100%;
    height: 300px;
  }
}
</style>
