<template>
  <!-- 重要程度 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.importance') }}</p>
    </div>
    <div
      id="importance"
      style="width: 100%; height: 176px; display: inline-block"
    ></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'

export default {
  name: 'importance',
  components: {},
  data() {
    return {
      myChart: null,
      legendBox2: false,
      importanceRatio: null,
      importanceList: {
        1: this.$t('quality.page.qualityRule.detail.importanceList.p1'),
        2: this.$t('quality.page.qualityRule.detail.importanceList.p2'),
        3: this.$t('quality.page.qualityRule.detail.importanceList.p3'),
        '-1': '未填写',
      },
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.importanceRatio = data.mainCount.importanceRatio
      this.$nextTick(() => {
        this.dataInit()
      })
    })
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
    this.myChart && this.myChart.dispose()
  },
  methods: {
    dataInit() {
      this.myChart && this.myChart.clear()
      this.myChart = echarts.init(document.getElementById('importance'))
      let chartData = []
      let dataName = []

      this.importanceRatio.forEach(element => {
        chartData.push({
          value: element.number,
          name: this.importanceList[element.name],
          ratio: element.ratio,
        })
        dataName.push(this.importanceList[element.name])
      })
      let _this = this
      var option = {
        tooltip: {
          trigger: 'item',
          extraCssText:
            'max-width:320px;height:auto;line-height:24px;white-space: normal; word-break: break-all;background-color:#000;color:#fff;border:none;font-size:12px;',
          formatter: function (params) {
            let str =
              _this.$t('quality.page.qualityDashboardNew.importance') + '<br/>'
            str +=
              "<span style='display:inline-block;width:10px;height:10px;margin-right:4px;border-radius:2px;background-color:" +
              params.color +
              ";'></span>" +
              '\t' +
              params.data.name +
              ' : ' +
              "<span style='color: " +
              params.color +
              "'>" +
              params.data.value +
              '</span>'

            return str
          },
        },
        legend: {
          orient: 'vertical',
          // top: '20%',
          right: 0,
          left: '38%',
          y: 'center',
          itemHeight: 10, // 图例图标的高度
          itemWidth: 10, // 图例图标的宽度
          data: dataName,
          textStyle: {
            color: '#333',
            fontSize: 12,
            margin: 16,
            rich: {
              a: {
                width: 70,
                align: 'left',
                fontSize: 12,
                height: 16,
                verticalAlign: 'middle',
                backgroundColor: 'transparent',
                borderRadius: [16, 16, 16, 16],
              },
              percent: {
                width: 55,
                align: 'left',
                fontSize: 12,
                height: 16,
                verticalAlign: 'middle',
                // backgroundColor: '#F7F8FC',
                borderRadius: [16, 0, 0, 16],
              },
              percent2: {
                width: 40,
                align: 'left',
                fontSize: 12,
                height: 16,
                verticalAlign: 'middle',
                // backgroundColor: '#F7F8FC',
                borderRadius: [0, 16, 16, 0],
              },
              percent1: {
                width: 10,
                align: 'left',
                color: '#bbbbbb',
                fontSize: 12,
                height: 16,
                // backgroundColor: '#F7F8FC',
                verticalAlign: 'middle',
              },
            },
          },
          formatter: function (val) {
            var index = 0
            var datas = chartData
            var totalNum = 0
            datas.forEach(function (v, i) {
              totalNum += v.value
            })
            var legendData = dataName
            legendData.forEach(function (v, i) {
              if (v == val) {
                index = i
              }
            })
            let str = []
            datas.forEach(e => {
              let percent = ''
              let value = datas[index].value + ''
              if (e.value === 0) {
                percent = datas[index].value + '%'
              } else {
                percent = parseFloat((datas[index].ratio * 100).toFixed(2))
                percent += '%'
              }
              let s
              if (val.length > 6) {
                s = `{a|${
                  val.substr(0, 6) + '...'
                }}  {percent| ${percent}}{percent1||}{percent2|${value}}   `
              } else {
                s = `{a|${val}}  {percent| ${percent}}{percent1||}{percent2|${value}}   `
              }
              str.push(s)
            })
            return str[index]
          },
        },
        color: ['#D1495B', '#F9716C', '#FBC372'],
        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.importance'),
            type: 'pie',
            radius: ['30%', '55%'],
            // hoverAnimation: false,
            center: ['20%', '47%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            // hoverAnimation: false,
            hoverAnimation: true,
            emphasis: {
              label: {
                show: false,
                fontSize: 12,
                fontWeight: 'bold',
              },
            },

            labelLine: {
              show: false,
            },
            data: chartData,
          },
        ],
      }
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
