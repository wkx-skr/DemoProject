<template>
  <!-- 历史逾期统计 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.overduestatistics') }}</p>
    </div>
    <div
      id="hisOverdueStatistics"
      style="width: 100%; height: 246px; margin-top: 10px"
    ></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  name: 'hisOverdueStatistics',
  components: {},
  data() {
    return {
      label: [],
      normalData: [],
      overData: [],
      myChart: null,
    }
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
    this.myChart && this.myChart.dispose()
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.handleData(data)
    })
  },
  methods: {
    handleData(data) {
      let label = []
      let normalData = []
      let overData = []
      if (Array.isArray(data?.overTimeCount) && data.overTimeCount.length) {
        data.overTimeCount.forEach(o => {
          label.push(o.month)
          normalData.push(o.problemNum - o.overProblemNum)
          overData.push(o.overProblemNum)
        })
        this.label = label
        this.normalData = normalData
        this.overData = overData
      } else {
        this.label = []
        this.normalData = []
        this.overData = []
      }
      this.dataInit()
    },
    dataInit() {
      this.myChart && this.myChart.clear()
      this.myChart = echarts.init(
        document.getElementById('hisOverdueStatistics')
      )
      let formatter = null
      var option = {
        grid: {
          left: '8%',
          //   right: "2%",
          bottom: '10%',
          top: '12%',
          // containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#333333',
          extraCssText:
            'box-shadow: 0px 2px 6px 0px rgba(178,178,178,0.32);border-radius: 4px;max-width:320px;height:auto;white-space: normal; word-break: break-all;',
          formatter: function (params) {
            let res = ''
            for (let i = params.length - 1; i >= 0; i--) {
              var data = '<p>' + params[i].name + '</p>'
              res +=
                "<div style='font-size:12px'>" +
                "<p style='display:inline-block;width:10px;height:10px;margin-right:4px;border-radius:2px;background-color:" +
                params[i].color +
                ";'></p>" +
                '\t' +
                params[i].seriesName +
                ' : ' +
                params[i].value +
                '</div>'
            }
            return data + res
          },
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              shadowColor: '#409eff',
              shadowBlur: 10,
              opacity: 0.2,
            },
            // lineStyle: {
            //   type: 'solid',
            // },
            // z: 10,
          },
        },
        legend: {
          top: '0',
          right: '2%',
          itemWidth: 10,
          itemHeight: 10,
          data: [
            this.$t('quality.page.qualityDashboardNew.overdueissues'),
            this.$t('quality.page.qualityDashboardNew.outstandingIssues'),
          ],
          textStyle: {
            color: '#555555',
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: [],
          show: true,
          axisLabel: {
            // show: true,
            interval: 0,
            fontSize: 11,
            width: 50,
            // color: 'red',
            overflow: 'truncate',
            ellipsis: '...',
            formatter: function (value) {
              if (value.length > 6) {
                return `${value.slice(0, 6)}...`
              }
              return value
            },
            textStyle: {
              color: '#555555',
              fontSize: 12,
            },
          },
          axisLine: {
            lineStyle: {
              color: '#EFEFEF',
            },
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
          },
        },
        yAxis: {
          type: 'value',
          name: this.$t('quality.page.qualityDashboardNew.unitPieces'),
          // splitNumber: 10,
          nameTextStyle: {
            color: '#999999',
            fontSize: 12,
          },
          axisLabel: {
            textStyle: {
              color: '#999999',
              fontSize: 12,
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#EFEFEF',
            },
          },

          splitLine: {
            show: true,
            lineStyle: {
              color: 'transparent',
              // type: 'dashed',
            },
          },
        },
        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.outstandingIssues'),
            type: 'bar',
            stack: this.$t('quality.page.qualityDashboardNew.usage'),
            data: [],
            itemStyle: {
              normal: { color: '#F6D8C9', borderColor: '#fff' },
            },
            barWidth: '16',
          },
          {
            name: this.$t('quality.page.qualityDashboardNew.overdueissues'),
            type: 'bar',
            stack: this.$t('quality.page.qualityDashboardNew.usage'),
            data: [],
            itemStyle: {
              normal: { color: '#F9716C', borderColor: '#fff' },
            },
            barWidth: '16',
          },
        ],
      }
      this.$set(option.xAxis, 'data', this.label)
      this.$set(option.series[1], 'data', this.overData)
      this.$set(option.series[0], 'data', this.normalData)
      this.myChart.setOption(option)
    },
  },
}
</script>

<style scoped lang="scss">
@import './public.scss';

.box {
  background: var(--default-bgc);
}
</style>
