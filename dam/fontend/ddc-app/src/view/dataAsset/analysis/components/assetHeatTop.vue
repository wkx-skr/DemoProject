<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div class="title">
      <is-show-tooltip
        :content="$t('assets.dashboard.top10')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.top10') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.top10') }} -->
      <span>{{ $t('assets.dashboard.timesUntil') }}</span>
    </div>
    <template v-if="datas">
      <!--    数据资产热度 TOP 10(assetHeatTop)-->
      <div class="echart-container" v-show="datas.length !== 0">
        <div class="echart-container" ref="echartsCon"></div>
      </div>
      <div class="nodata" v-if="!loading && datas.length === 0">
        <div class="noresults">
          <div class="noresult-img">
            <img src="@/assets/images/search/no-result.svg" alt="" />
            <p>
              {{ $t('assets.dashboard.noData') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import HTTP from '../../utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'assetHeatTop',
  components: { isShowTooltip },
  data() {
    return {
      loading: true,
      datas: null,
      yAxisData: [],
      max: null,
      minData: [],
      maxData: [],
      structureId: null,
      structureIdChange: this.$store.state.structureIdChange,
      echartsDoc: null,
      screenWidth: document.body.clientWidth, // 屏幕尺寸
      option: {},
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        console.log(val)
        if (val) {
          this.top10(val)
        } else {
          this.loading = false
        }
      },
    },
  },
  methods: {
    drawEcharts() {
      let datas = this.datas
      let _this = this
      let opt = {
        grid: [
          {
            bottom: '5%',
            top: '3%',
            left: '150px',
            right: '20px',
          },
        ],
        xAxis: [
          {
            type: 'value',
            max: this.max,
            axisLine: {
              show: false,
            },
            // 文字
            axisLabel: {
              show: false,
            },
            // x轴标注点
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            silent: true,
            // 升序
            inverse: true,
            type: 'category',
            data: this.yAxisData,
            // axisLabel: {
            //   show: false,
            // },
            axisLabel: {
              align: 'left',
              margin: 135,
              show: true,
              formatter: function (name, dataIndex) {
                let names = ''
                let num = _this.screenWidth <= 1536 ? 4 : 6
                name.length >= 8
                  ? (names = name.substr(0, num) + '…')
                  : (names = name)
                if (dataIndex === 0) {
                  return `{a|${dataIndex + 1}}  {e|${names}}`
                } else if (dataIndex === 1) {
                  return `{b|${dataIndex + 1}}  {e|${names}}`
                } else if (dataIndex === 2) {
                  return `{c|${dataIndex + 1}}  {e|${names}}`
                } else {
                  return `{d|${dataIndex + 1}}  {e|${names}}`
                }
              },
              rich: {
                a: {
                  width: 18,
                  height: 18,
                  fontSize: 12,
                  color: '#fff',
                  align: 'center',
                  lineHeight: 18,
                  backgroundColor: '#F46565',
                  shadowBlur: 8,
                  borderRadius: 100,
                },
                b: {
                  width: 18,
                  height: 18,
                  fontSize: 12,
                  color: '#fff',
                  align: 'center',
                  lineHeight: 18,
                  backgroundColor: '#EDA443',
                  shadowBlur: 8,
                  borderRadius: 100,
                },
                c: {
                  width: 18,
                  height: 18,
                  fontSize: 12,
                  color: '#fff',
                  align: 'center',
                  lineHeight: 18,
                  backgroundColor: '#E0C65A',
                  shadowBlur: 8,
                  borderRadius: 100,
                },
                d: {
                  width: 18,
                  height: 18,
                  fontSize: 12,
                  color: '#777',
                  align: 'center',
                  lineHeight: 18,
                  backgroundColor: '#EFEFEF',
                  shadowBlur: 8,
                  borderRadius: 100,
                },
                e: {
                  fontSize: 12,
                  color: '#444444',
                  padding: [0, 5],
                  cursor: 'none',
                },
              },
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            triggerEvent: true,
          },
        ],
        series: [
          {
            barGap: '-140%',
            barCategoryGap: 10,
            silent: true,
            type: 'bar',
            stack: 'chart',
            z: 5,
            itemStyle: {
              barBorderColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0)',
            },
            data: this.minData, // 是灰色背景的值的0.014倍
          },
          {
            type: 'bar',
            stack: 'chart',
            z: 5,
            barWidth: '8',
            itemStyle: {
              normal: {
                position: 'center',
                barBorderRadius: 5,
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  {
                    offset: 0,
                    color: '#409EFF',
                  },
                  {
                    offset: 1,
                    color: '#89C3FF',
                  },
                ]),
              },
            },
            data: datas,
          },
          {
            type: 'bar',
            // stack: 'chart',
            barGap: '-165%',
            barCategoryGap: 10,
            silent: true,
            barWidth: 18,
            itemStyle: {
              normal: {
                barBorderRadius: 9,
                color: '#F5F5F5',
              },
            },
            data: this.maxData,
            label: {
              normal: {
                show: true,
                position: this.screenWidth <= 1536 ? ['85%', 1] : ['86%', 1],
                textStyle: {
                  fontSize: 14,
                  color: '#fff',
                },
                formatter: function (data) {
                  let result = ''
                  result += datas[data.dataIndex]
                  // '{a|' + result + '}'
                  return `{a| |}{b| ${result}}`
                },
                rich: {
                  a: {
                    color: '#DDDDDD',
                    fontSize: 14,
                    padding: [0, 9, 0, 0],
                  },
                  b: {
                    color: '#5C6BE8',
                    padding: [3, 20, 0, 0],
                  },
                },
              },
            },
          },
        ],
        formatter: function (params) {
          var tooltipStr = ''
          params.forEach(function (param) {
            tooltipStr += param.axisValue + '<br>'
          })
          return tooltipStr
        },
        tooltip: {
          show: true,
          trigger: 'item',
          textStyle: {
            fontSize: 12,
          },
          formatter: data => {
            // 提示文字自动折行
            let str = `<p style="max-width: 300px;white-space:normal">${data.name}</p>`
            return str
          },
        },
      }
      this.$nextTick(() => {
        this.option = opt
        const container = this.$refs.echartsCon
        this.echartsDoc = container && echarts.init(container)
        container && this.echartsDoc.setOption(opt)
      }, 0)
    },
    top10(id) {
      this.echartsDoc && this.echartsDoc.clear()
      this.loading = true
      id &&
        HTTP.top10(id)
          .then(res => {
            this.datas = []
            this.yAxisData = []
            this.minData = []
            this.maxData = []
            this.max = null
            res.data.data
              .sort((a, b) => {
                return b.visitCount - a.visitCount
              })
              .forEach(item => {
                this.datas.push(item.visitCount)
                this.yAxisData.push(item.catalogName)
              })
            this.max = Math.floor(Math.max(...this.datas)) + 240
            for (let i = 0; i < this.datas.length; i++) {
              this.maxData.push(this.max)
              this.minData.push(Math.floor(this.max * 0.014))
            }

            if (this.datas.length !== 0) {
              this.drawEcharts()
            }
            this.loading = false
          })
          .catch(e => {
            this.loading = false
            this.$showFailure(e)
          })
    },
  },
  beforeDestroy() {
    this.echartsDoc && echarts.dispose(this.echartsDoc)
  },
  mounted() {
    const that = this
    if (this.$store.state.structureIdChange) {
      this.top10(this.$store.state.structureIdChange)
    } else {
      this.loading = false
      this.datas = []
    }
    window.onresize = () => {
      window.screenWidth = document.body.clientWidth
      this.screenWidth = window.screenWidth
      setTimeout(() => {
        this.echartsDoc && this.echartsDoc.resize()
        if (this.echartsDoc) {
          this.echartsDoc.on('mouseover', function (params) {
            if (params.value && params.value.length > 6) {
              if (
                params.componentType === 'yAxis' ||
                params.componentType === 'xAxis'
              ) {
                $('#extension')
                  .css({
                    position: 'absolute',
                    color: '#555',
                    background: '#fff',
                    'font-size': '12px',
                    padding: '8px 10px',
                    'border-radius': '2px',
                    display: 'inline',
                    'z-index': 9999,
                    'box-shadow': '0 0 8px rgba(0,0,0, 0.3)',
                  })
                  .text(params.value)
                $('html').mousemove(function (even) {
                  var xx = event.pageX - 18
                  var yy = event.pageY + 15
                  $('#extension').css('top', yy).css('left', xx)
                })
              }
            }
          })
          this.echartInstance.on('mouseout', function (params) {
            if (
              params.componentType == 'yAxis' ||
              params.componentType === 'xAxis'
            ) {
              $('#extension').css('display', 'none')
            }
          })
        }
      }, 200)
      // this.$forceUpdate()
    }
    this.echartsDoc &&
      this.echartsDoc.on('mouseover', function (params) {
        if (params.value && params.value.length > 6) {
          if (
            params.componentType === 'yAxis' ||
            params.componentType === 'xAxis'
          ) {
            $('#extension')
              .css({
                position: 'absolute',
                color: '#555',
                background: '#fff',
                'font-size': '12px',
                padding: '8px 10px',
                'border-radius': '2px',
                display: 'inline',
                'z-index': 9999,
                'box-shadow': '0 0 8px rgba(0,0,0, 0.3)',
              })
              .text(params.value)
            $('html').mousemove(function (even) {
              var xx = event.pageX - 18
              var yy = event.pageY + 15
              $('#extension').css('top', yy).css('left', xx)
            })
          }
        }
      })
    this.echartsDoc &&
      this.echartInstance.on('mouseout', function (params) {
        if (
          params.componentType == 'yAxis' ||
          params.componentType === 'xAxis'
        ) {
          $('#extension').css('display', 'none')
        }
      })
  },
}
</script>

<style scoped lang="scss">
.picBox {
  width: 100%;
  height: 100%;
  padding: 16px;
}
.echart-container {
  width: 100%;
  height: 98%;
}
.title {
  font-size: 14px;
  color: #555;
  span {
    font-size: 12px;
    color: #777;
    float: right;
  }
}
.nodata {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}
.noresults {
  margin: 20px auto 0;
  text-align: center;
  .noresult-img {
    flex-direction: column;
  }
  p {
    display: block;
  }
}
</style>
