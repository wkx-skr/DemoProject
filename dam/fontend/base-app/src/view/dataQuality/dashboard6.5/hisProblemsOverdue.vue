<template>
  <!-- 问题数据逾期与即将逾期分布 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.dataAndUpcoming') }}</p>
    </div>
    <div
      id="hisProblemsOverdue"
      style="width: 50%; height: 346px; float: left"
    ></div>
    <div
      id="hisProblemsOverdue1"
      style="width: 50%; height: 346px; float: left"
    ></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'

export default {
  name: 'hisProblemsOverdue',
  components: {},
  data() {
    return {
      label: [],
      overTimeData: [],
      label1: [],
      overTimeData1: [],
      myChart: null,
      myChart1: null,
    }
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
    this.myChart && this.myChart.dispose()
    this.myChart1 && this.myChart1.dispose()
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.handleData(data)
    })
  },
  methods: {
    handleData(data) {
      let label = []
      let overTimeData = []
      let label1 = []
      let overTimeData1 = []
      if (
        Array.isArray(data?.historyOverTimeData) &&
        data.historyOverTimeData.length
      ) {
        data.historyOverTimeData.forEach(h => {
          label.push(h.time)
          overTimeData.push(h.overProblemNum)
        })
        this.label = label
        this.overTimeData = overTimeData
      } else {
        this.label = []
        this.overTimeData = []
      }
      if (
        Array.isArray(data?.predictOverTimeData) &&
        data.predictOverTimeData.length
      ) {
        data.predictOverTimeData.forEach(p => {
          label1.push(p.time)
          overTimeData1.push(p.overProblemNum)
        })
        this.label1 = label1
        this.overTimeData1 = overTimeData1
      } else {
        this.label1 = []
        this.overTimeData1 = []
      }
      this.dataInit()
    },
    dataInit() {
      this.myChart && this.myChart.clear()
      this.myChart1 && this.myChart1.clear()
      this.myChart = echarts.init(document.getElementById('hisProblemsOverdue'))
      this.myChart1 = echarts.init(
        document.getElementById('hisProblemsOverdue1')
      )
      let formatter = null
      var option = {
        grid: {
          left: '8%',
          right: '2%',
          bottom: '20%',
          top: '12%',
          // containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#333333',
          extraCssText:
            'box-shadow: 0px 2px 6px 0px rgba(178,178,178,0.32);border-radius: 4px;max-width:320px;height:auto;white-space: normal; word-break: break-all;',
          formatter: function (params) {
            // params[0].name表示x轴数据
            let str = params[0].name + '<br/>'
            // params是数组格式
            str +=
              "<div style='font-size:12px'>" +
              "<p style='display:inline-block;width:10px;height:10px;margin-right:4px;border-radius:2px;background-color:#F9716C" +
              ";'></p>" +
              '\t' +
              params[0].seriesName +
              ' : ' +
              params[0].value +
              '</div>'
            return str
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
          data: [this.$t('quality.page.qualityDashboardNew.problemData')],
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
            fontSize: 12,
            rotate: 30,
            width: 100,
            // color: 'red',
            overflow: 'truncate',
            ellipsis: '...',
            formatter: function (value) {
              if (value.length > 12) {
                return `${value.slice(0, 12)}...`
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
        yAxis: [
          {
            type: 'value',
            name: this.$t('quality.page.qualityDashboardNew.unitPiece'),
            nameTextStyle: {
              color: '#999999',
              fontSize: 12,
            },
            // min: 0,
            // interval: 50,
            axisLabel: {
              formatter: '{value} ',
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
        ],

        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.problemData'),
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              },
            },
            data: [],
            itemStyle: {
              normal: {
                // borderColor: '#fff',
                // borderWidth: 2,
                barBorderRadius: [8, 8, 0, 0],
                color: {
                  type: 'linear',
                  x: 0, // 右
                  y: 0, // 下
                  x2: 0, // 左
                  y2: 1, // 上
                  colorStops: [
                    {
                      offset: 0,
                      color: '#F9716C', // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#FEDBD9', // 100% 处的颜色
                    },
                  ],
                },
              },
            },
            barWidth: '16',
          },
        ],
      }
      var option1 = {
        grid: {
          left: '8%',
          right: '2%',
          bottom: '20%',
          top: '12%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#333333',
          extraCssText:
            'box-shadow: 0px 2px 6px 0px rgba(178,178,178,0.32);border-radius: 4px;max-width:320px;height:auto;white-space: normal; word-break: break-all;',
          formatter: function (params) {
            let str = params[0].name + '<br/>'
            str +=
              "<div style='font-size:12px'>" +
              "<p class='echarts-overTimeData1-legend' ></p>" +
              // "<p style='display:inline-block;width:10px;height:10px;border-radius:5px;background-color:" +
              // params[0].color +
              // ";'></p>" +
              '\t' +
              params[0].seriesName +
              ' : ' +
              params[0].value +
              '</div>'
            return str
          },
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          axisPointer: {
            lineStyle: {
              type: 'solid',
            },
            z: 0,
          },
        },
        legend: {
          top: '0',
          right: '2%',
          itemWidth: 24,
          itemHeight: 8,
          data: [
            {
              name: this.$t(
                'quality.page.qualityDashboardNew.upcomingOverdueIssues'
              ),
              icon: 'path://M12,5 C13.8639271,5 15.4300871,6.27489272 15.8740452,8.00024347 L24,8 L24,10 L15.8737865,10.0007613 C15.429479,11.7256022 13.8635652,13 12,13 C10.1364348,13 8.57052105,11.7256022 8.12621352,10.0007613 L0,10 L0,8 L8.12595483,8.00024347 C8.56991294,6.27489272 10.1360729,5 12,5 Z M12,7 C10.8954305,7 10,7.8954305 10,9 C10,10.1045695 10.8954305,11 12,11 C13.1045695,11 14,10.1045695 14,9 C14,7.8954305 13.1045695,7 12,7 Z',
            },
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
            fontSize: 12,
            rotate: 30,
            width: 100,
            // color: 'red',
            overflow: 'truncate',
            ellipsis: '...',
            formatter: function (value) {
              if (value.length > 12) {
                return `${value.slice(0, 12)}...`
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
        yAxis: [
          {
            type: 'value',
            name: this.$t('quality.page.qualityDashboardNew.unitPiece'),
            nameTextStyle: {
              color: '#999999',
              fontSize: 12,
            },
            // min: 0,
            // interval: 50,
            axisLabel: {
              formatter: '{value} ',
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
        ],

        series: [
          {
            name: this.$t(
              'quality.page.qualityDashboardNew.upcomingOverdueIssues'
            ),
            type: 'line',
            smooth: true, // 平滑曲线
            showSymbol: false,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              },
            },
            data: [],
            itemStyle: {
              color: '#FBC372',
            },
            lineStyle: {
              width: 2,
              color: '#FBC372',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(251,195,114,0.31)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(251,195,114,0)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            barWidth: '16',
          },
        ],
      }
      this.$set(option.xAxis, 'data', this.label)
      this.$set(option.series[0], 'data', this.overTimeData)
      this.$set(option1.xAxis, 'data', this.label1)
      this.$set(option1.series[0], 'data', this.overTimeData1)
      this.myChart.setOption(option)
      this.myChart1.setOption(option1)
    },
  },
}
</script>
<style lang="scss">
.echarts-overTimeData1-legend {
  display: inline-block;
  width: 24px;
  height: 8px;
  background: url(./img/yellow.svg) no-repeat center;
  background-size: 100% auto;
  margin-right: 4px;
}
</style>
<style scoped lang="scss">
@import './public.scss';

.box {
  background: var(--default-bgc);
}
</style>
