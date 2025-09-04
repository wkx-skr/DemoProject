<template>
  <div class="origin-container-pie" v-loading="showloading">
    <div class="echart-container" ref="echartsCon"></div>
  </div>
</template>

<script>
import themeMixin from '@/components/common/themePick/themeMixin.js'
import * as echarts from 'echarts'
let echartInstance = null
export default {
  mixins: [themeMixin],
  data() {
    return {
      classNameWithoutTag: '',
      showloading: false,
      mediaStyleData: {
        gaugeXLineW: 10,
        splitLineLength: 20,
      },
      theme: 'light',
      myChart: null,
    }
  },
  props: {
    getData: {
      type: Promise,
      required: true,
    },
    colorMap: {
      type: Object,
      default() {
        return {}
      },
    },
    matchType: {
      type: Object,
      required: true,
    },
  },
  components: {},
  computed: {},
  beforeMount() {
    this.resetStyle()
    this.dataInit()
    this.theme = this.$globalData.$theme.themeName === 'dark' ? 'dark' : 'light'
    this.$bus.$on('changeGlobalTheme', newTheme => {
      this.theme = newTheme === 'dark' ? 'dark' : 'light'
      if (this.myChart) {
        this.myChart.dispose()
        this.$nextTick(() => {
          this.dataInit()
        })
      }
    })
  },
  mounted() {
    $(window).resize(this.handleResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    echartInstance && echarts.dispose(echartInstance)
  },
  methods: {
    handleThemeChange(theme) {
      this.dataInit()
    },
    drawEcharts({ seriesData }) {
      const container = this.$refs.echartsCon
      const opt = {
        title: {
          text: '数据脱敏总体评估通过率',
          x: 'center',
          top: 10,
          textStyle: {
            fontWeight: 'normal',
          },
        },
        tooltip: {
          trigger: 'item',
          position: ['50%', '50%'],
          formatter: (params, ticket, callback) => {
            return params.data.tooltipString
          },
        },
        series: [seriesData],
        radius: '40%',
      }
      // console.log(opt, 'opt')
      if (container) {
        this.$nextTick(() => {
          echartInstance && echarts.dispose(echartInstance)
          echartInstance = echarts.init(container, this.theme)
          this.myChart = echartInstance
          echartInstance.setOption(opt, true)
        })
      }
      this.showloading = false
    },
    dataInit() {
      this.showloading = true
      return this.getData
        .then(res => {
          const data = res.data
          // console.log(res.data, 'res.data')
          const totalWithTag = 0
          let total = 0
          const count = {
            match: data['完全映射'] || 0,
            partMatch: data['部分映射'] || 0,
            notMatch: data['无法映射'] || 0,
          }
          for (const key in count) {
            total += count[key]
          }
          const matchRate = total ? parseInt((count.match / total) * 100) : 0
          const tooltipString = `${this.matchType.match} 数量为 ${
            count.match
          }, 占比: ${total ? parseInt((count.match / total) * 100) : 0}%;<br>
            ${this.matchType.partMatch} 数量为 ${count.partMatch}, 占比: ${
            total ? parseInt((count.partMatch / total) * 100) : 0
          }%;<br>
            ${this.matchType.notMatch} 数量为 ${count.notMatch}, 占比: ${
            total ? parseInt((count.notMatch / total) * 100) : 0
          }%;`
          const seriesData = {
            name: '数据标准总体评估通过率',
            type: 'gauge',
            title: {
              show: true,
              offsetCenter: [0, '-20%'],
            },
            detail: {
              formatter: '{value}%',
            },
            data: [
              {
                value: matchRate,
                name: '合标比例',
                tooltipString: tooltipString,
              },
            ],
            axisLine: {
              lineStyle: {
                color: [
                  [0.6, '#c23531'],
                  [0.8, '#63869e'],
                  [1, '#91c7ae'],
                ],
                width: this.mediaStyleData.gaugeXLineW,
              },
            },
            splitLine: {
              length: this.mediaStyleData.splitLineLength,
            },
            center: ['50%', '60%'],
          }
          const epmtColor = this.colorMap.default || 'auto'
          const para = {
            seriesData: seriesData,
          }
          this.drawEcharts(para)
        })
        .catch(e => {
          this.$showFailure(e)
          this.showloading = false
        })
    },
    handleResize() {
      this.resetStyle()
      if (echartInstance) {
        this.$nextTick(() => {
          echartInstance.setOption({
            series: [
              {
                axisLine: {
                  lineStyle: {
                    width: this.mediaStyleData.gaugeXLineW,
                  },
                },
                splitLine: {
                  length: this.mediaStyleData.splitLineLength,
                },
              },
            ],
          })
          echartInstance.resize()
        })
      } else {
        this.dataInit()
      }
    },
    resetStyle() {
      const windowWidth = $(window).width()
      let mediaStyleData = {}
      if (windowWidth > 1400) {
        mediaStyleData = {
          gaugeXLineW: 18,
          splitLineLength: 30,
        }
      } else {
        mediaStyleData = {
          gaugeXLineW: 10,
          splitLineLength: 20,
        }
      }
      this.mediaStyleData = mediaStyleData
    },
    refreshEchart() {
      this.$emit('setPieData')
      this.$nextTick(this.dataInit)
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.origin-container-pie {
  position: relative;
  width: 100%;
  height: 100%;
  // background-color: #fff;
  .echart-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: #fff;
  }
}
</style>
