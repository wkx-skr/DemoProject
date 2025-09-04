<template>
  <!-- 问题系统分布 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.problemSystems') }}</p>
    </div>
    <div id="problemSystem" style="width: 100%; height: 255px; top: 5px"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'

export default {
  name: 'problemSystem',
  components: {},
  data() {
    return {
      myChart: null,
      label: [],
      proData: [],
      proRatio: [],
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.handleData(data)
    })
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
    this.myChart && this.myChart.dispose()
  },
  methods: {
    handleData(data) {
      let label = []
      let proData = []
      let proRatio = []
      if (Array.isArray(data?.detailDataOrg) && data.detailDataOrg.length) {
        data.detailDataCategory.forEach(d => {
          label.push(d.groupName)
          proData.push(d.problemNum)
          proRatio.push(parseFloat((d.totalProblemRatio * 100).toFixed(2)))
        })
        this.label = label
        this.proData = proData
        this.proRatio = proRatio
      } else {
        this.label = []
        this.proData = []
        this.proRatio = []
      }
      this.dataInit()
    },
    dataInit() {
      this.myChart && this.myChart.clear()
      this.myChart = echarts.init(document.getElementById('problemSystem'))
      let formatter = null
      var option = {
        grid: {
          left: '8%',
          right: '10%',
          bottom: 60,
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

            for (let item of params) {
              // 设置浮层图形的样式跟随图中展示的颜色
              if (item.componentSubType === 'bar') {
                str +=
                  "<div style='font-size:12px'>" +
                  "<p style='display:inline-block;width:24px;height:8px;margin-right:4px;border-radius:2px;background-color:" +
                  item.color +
                  ";'></p>" +
                  '\t' +
                  item.seriesName +
                  ' : ' +
                  item.value +
                  '</div>'
              } else {
                str +=
                  "<div style='font-size:12px'>" +
                  "<p class='echarts-proRatio-legend' ></p>" +
                  // "<p style='display:inline-block;width:10px;height:10px;border-radius:10px;background-color:green'></p>" +
                  '\t' +
                  item.seriesName +
                  ' : ' +
                  item.value +
                  '%</div>'
              }
            }
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
          },
        },
        legend: {
          top: '0',
          right: '2%',
          itemWidth: 24,
          itemHeight: 8,
          // data: ['问题数', '问题数错误比率'],
          textStyle: {
            color: '#555555',
          },
          data: [
            {
              name: this.$t(
                'quality.page.qualityDashboardNew.numberOfProblems'
              ),
            },
            {
              name: this.$t(
                'quality.page.qualityDashboardNew.problemsErrorRatio'
              ),
              icon: 'path://M12,5 C13.8639271,5 15.4300871,6.27489272 15.8740452,8.00024347 L24,8 L24,10 L15.8737865,10.0007613 C15.429479,11.7256022 13.8635652,13 12,13 C10.1364348,13 8.57052105,11.7256022 8.12621352,10.0007613 L0,10 L0,8 L8.12595483,8.00024347 C8.56991294,6.27489272 10.1360729,5 12,5 Z M12,7 C10.8954305,7 10,7.8954305 10,9 C10,10.1045695 10.8954305,11 12,11 C13.1045695,11 14,10.1045695 14,9 C14,7.8954305 13.1045695,7 12,7 Z',
            },
          ],
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
        yAxis: [
          {
            type: 'value',
            name: this.$t('quality.page.qualityDashboardNew.unitPieces'),
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
          {
            type: 'value',
            // name: 'Temperature',
            min: 0,
            max: 100,
            interval: 10,
            axisLabel: {
              formatter: '{value} %',
              textStyle: {
                color: '#999999',
                fontSize: 12,
              },
            },
            axisLine: {
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
        dataZoom: [
          {
            type: 'inside',
            height: 12,
          },
          {
            type: 'slider',
            height: 12,
            bottom: 10,
            textStyle: {
              color: 'transparent',
            },
          },
        ],
        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.numberOfProblems'),
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              },
            },
            data: [],
            itemStyle: {
              normal: {
                color: '#FBC372',
                borderColor: '#fff',
              },
            },
            barWidth: '16',
          },
          {
            name: this.$t(
              'quality.page.qualityDashboardNew.problemsErrorRatio'
            ),
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' °C'
              },
            },
            itemStyle: {
              normal: {
                color: '#F9716C',
              },
            },
            data: [],
          },
        ],
      }
      this.$set(option.xAxis, 'data', this.label)
      this.$set(option.series[0], 'data', this.proData)
      this.$set(option.series[1], 'data', this.proRatio)
      this.myChart.setOption(option)
    },
  },
}
</script>
<style lang="scss">
.echarts-proRatio-legend {
  display: inline-block;
  width: 24px;
  height: 8px;
  background: url(./img/red.svg) no-repeat center;
  background-size: 100% auto;
  margin-right: 4px;
}
</style>
<style scoped lang="scss">
@import './public.scss';

.box {
  background: var(--default-bgc);
  .proRatio {
    width: 24px;
    height: 8px;
    background: url(./img/red.svg) no-repeat center;
    background-size: 100% auto;

    // background-image: url('～@/assets/images/icon/quality/business.svg');
    // background-size: cover;
  }
}
</style>
