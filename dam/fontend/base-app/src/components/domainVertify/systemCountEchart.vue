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
          text: this.$t('domain.verification.standardPassRate'),
          x: 'center',
          top: 10,
          textStyle: {
            fontWeight: 'normal',
            fontSize: 14,
            color: '#555',
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
          const tooltipString = `${this.matchType.match} ${this.$t(
            'domain.verification.quantity'
          )} ${count.match}, ${this.$t('domain.verification.proportion')}: ${
            total ? parseInt((count.match / total) * 100) : 0
          }%;<br>
            ${this.matchType.partMatch} ${this.$t(
            'domain.verification.quantity'
          )} ${count.partMatch}, ${this.$t(
            'domain.verification.proportion'
          )}: ${total ? parseInt((count.partMatch / total) * 100) : 0}%;<br>
            ${this.matchType.notMatch} ${this.$t(
            'domain.verification.quantity'
          )} ${count.notMatch}, ${this.$t('domain.verification.proportion')}: ${
            total ? parseInt((count.notMatch / total) * 100) : 0
          }%;`
          const seriesData = {
            name: this.$t('domain.verification.standardPassRate'),
            type: 'gauge',
            title: {
              show: true,
              offsetCenter: [0, '-20%'],
            },
            detail: {
              formatter: '{value}%',
              color: '#4b4b4b',
              offsetCenter: [0, '62%'],
            },
            pointer: {
              width: 6,
              length: 50,
            },
            data: [
              {
                value: matchRate,
                name: this.$t('domain.verification.complianceRatio'),
                tooltipString: tooltipString,
              },
            ],
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: [
                  [matchRate / 100, '#409EFF'],
                  [1, '#e6ebf7'],
                ],
                width: this.mediaStyleData.gaugeXLineW,
              },
            },
            splitLine: {
              show: false,
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
          gaugeXLineW: 15,
          splitLineLength: 10,
        }
      } else {
        mediaStyleData = {
          gaugeXLineW: 10,
          splitLineLength: 10,
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
