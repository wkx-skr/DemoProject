<template>
  <!-- 规则类型 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.ruleType') }}</p>
    </div>
    <div
      id="ruleType"
      style="width: 100%; height: 176px; display: inline-block"
    ></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'

export default {
  name: 'ruleType',
  components: {},
  data() {
    return {
      myChart: null,
      bigClassSelectOption: null,
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.bigClassSelectOption = data.mainCount.bigClassSelectOption
      // this.bigClassSelectOption.push(
      //   { name: '完整性1完整性1完整性1完整性1完整性1', number: 4, ratio: 1 },
      //   { name: '完整性2', number: 4, ratio: 1 },
      //   { name: '完整性3', number: 4, ratio: 1 },
      //   { name: '完整性4', number: 4, ratio: 1 },
      //   { name: '完整性5', number: 4, ratio: 1 },
      //   { name: '完整性6', number: 4, ratio: 1 },
      //   { name: '完整性7', number: 4, ratio: 1 },
      //   { name: '完整性8', number: 4, ratio: 1 },
      //   { name: '完整性9', number: 4, ratio: 1 }
      // )
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
      this.myChart = echarts.init(document.getElementById('ruleType'))
      let chartData = []
      let dataName = []
      this.bigClassSelectOption.forEach(element => {
        chartData.push({
          value: element.number,
          name: element.name,
          ratio: element.ratio,
        })
        dataName.push(element.name)
      })
      let _this = this
      var option = {
        tooltip: {
          trigger: 'item',
          extraCssText:
            'max-width:320px;height:auto;line-height:24px;white-space: normal; word-break: break-all;background-color:#000;color:#fff;border:none;font-size:12px;',
          formatter: function (params) {
            let str =
              _this.$t('quality.page.qualityDashboardNew.ruleType') + '<br/>'
            console.log('params', params)
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
          right: 0,
          left: '38%',
          y: 'center',
          itemHeight: 10, // 图例图标的高度
          itemWidth: 10, // 图例图标的宽度
          type: 'scroll',
          data: dataName,
          pageIcons: {
            vertical: [
              'path://（M241.92 694.528L512 396.288l270.08 298.24a27.328 27.328 0 0 0 41.344 0 34.688 34.688 0 0 0 0-45.632l-289.28-319.424A27.712 27.712 0 0 0 512 320a27.712 27.712 0 0 0-22.144 9.408l-289.28 319.424a34.688 34.688 0 0 0 0 45.632 27.328 27.328 0 0 0 41.344 0z）',
              'path://（M241.92 329.472L512 627.712l270.08-298.24a27.328 27.328 0 0 1 41.344 0 34.688 34.688 0 0 1 0 45.632l-289.28 319.424A27.712 27.712 0 0 1 512 704a27.712 27.712 0 0 1-22.144-9.408l-289.28-319.424a34.688 34.688 0 0 1 0-45.632 27.328 27.328 0 0 1 41.344 0z）',
            ],
          },
          pageIconSize: 12,
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
                }}  {percent| ${percent} }{percent1||}{percent2|${value}}   `
              } else {
                s = `{a|${val}}  {percent| ${percent} }{percent1||}{percent2|${value}}   `
              }
              str.push(s)
            })
            return str[index]
          },
        },
        color: [
          '#38B48B',
          '#409EFF',
          '#7582E5',
          '#8DC78A',
          '#3AD1BF',
          '#FBC372',
          '#F9716C',
          '#D1495B',
        ],
        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.ruleType'),
            type: 'pie',
            radius: ['30%', '55%'],
            center: ['18%', '47%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
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
