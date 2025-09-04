<template>
  <div style="padding-top: 20px">
    <div
      ref="dom"
      style="display: inline-block; width: 50%; height: 400px"
    ></div>
    <div
      ref="dom2"
      style="display: inline-block; float: right; width: 45%; height: 400px"
    ></div>
    <empty-page1
      v-if="ready && (!rawData || rawData.length === 0)"
    ></empty-page1>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import HTTP from '@/resource/http.js'
import moment from 'moment'
import emptyPage1 from './emptyPage1.vue'
import {
  WarningLevel,
  WarningLevelLabel
} from '@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/class/Alert'

export default {
  components: {
    emptyPage1
  },
  props: {
    metricId: {
      required: true
    }
  },
  data () {
    return {
      rawData: null,
      rawData2: null,
      dataIndex: -1,
      ready: false
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getDemoData () {
      const data = [
        { WARNING: 12, createTime: 1646214445000 },
        { SERIOUS_WARNING: 12, createTime: 1646214526000 },
        { WARNING: 12, createTime: 1646214528000 },
        { WARNING: 12, createTime: 1646214530000 },
        { WARNING: 12, createTime: 1646214532000 },
        { WARNING: 12, createTime: 1646214536000 },
        { WARNING: 12, SERIOUS_WARNING: 12, createTime: 1646214538000 },
        // { WARNING: 12, createTime: 1646214527000 },
        // { WARNING: 12, createTime: 1646214529000 },
        { WARNING: 24, createTime: 1646214531000 },
        { WARNING: 12, createTime: 1646214533000 },
        { SERIOUS_WARNING: 12, createTime: 1646214535000 }
      ]
      this.rawData = data
      this.drawFirstChart()
    },
    getData () {
      this.$http
        .post(
          `${this.$domains}metricManagement/metricWarning/result?metricId=${this.metricId}`
        )
        .then(res => {
          if (res.data && res.data.length > 0) {
            res.data.sort((a, b) => {
              return -a.createTime + b.createTime
            })
            this.rawData = res.data.slice(0, 10).reverse()
            this.drawFirstChart()
            this.dataIndex = this.rawData.length - 1
            this.getData2(this.rawData[this.dataIndex].createTime)
          }
          this.ready = true
        })
        .catch(e => {
          this.$showFailure(e)
          this.ready = true
        })
    },
    getData2 (timestamp) {
      this.$http
        .post(
          `${this.$domains}metricManagement/metricWarning/result/details?metricId=${this.metricId}&time=${timestamp}`
        )
        .then(res => {
          this.rawData2 = res.data
          this.rawData2.sort((a, b) => {
            return WarningLevel[a.warningLevel] - WarningLevel[b.warningLevel]
          })
          this.drawSecondChart()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    drawSecondChart () {
      const dom = this.$refs.dom2
      dom.innerHtml = ''
      // const total = this.rawData2.reduce((total, current) => {
      //   if (typeof total === 'number') {
      //     return total + current.problemCount
      //   } else {
      //     return total.problemCount + current.problemCount
      //   }
      // })
      const total = this.rawData2[0].dataTotal
      const option = {
        title: {
          text:
            moment(this.rawData[this.dataIndex].createTime).format(
              'YYYY-MM-DD'
            ) + '指标预警分布情况',
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b}: {c} ({d}%)',
          formatter: '{b}<br/>{c} ({d}%)<br />问题总数：' + total
        },
        legend: {
          show: false,
          data: this.rawData2.map(i => {
            return i.warningName
          }),
          textStyle: {
            width: 10,
            overflow: 'truncate',
            ellipsis: '...'
          },
          right: 30
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              position: 'inner',
              fontSize: 14
            },
            labelLine: {
              show: false
            },
            color: ['#3ba1ff', '#f7a945', '#df273d'],
            data: [
              {
                value: this.rawData[this.dataIndex].EARLY_WARNING,
                name: WarningLevelLabel[WarningLevel.EARLY_WARNING]
              },
              {
                value: this.rawData[this.dataIndex].WARNING,
                name: WarningLevelLabel[WarningLevel.WARNING]
              },
              {
                value: this.rawData[this.dataIndex].SERIOUS_WARNING,
                name: WarningLevelLabel[WarningLevel.SERIOUS_WARNING],
                selected: true
              }
            ]
          },
          {
            name: 'Access From',
            type: 'pie',
            radius: ['45%', '60%'],
            labelLine: {
              length: 30
            },
            label: {
              // formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
              // backgroundColor: '#F6F8FC',
              // borderColor: '#8C8D8E',
              // borderWidth: 1,
              // borderRadius: 4,
              // rich: {
              //   a: {
              //     color: '#6E7079',
              //     lineHeight: 22,
              //     align: 'center',
              //   },
              //   hr: {
              //     borderColor: '#8C8D8E',
              //     width: '100%',
              //     borderWidth: 1,
              //     height: 0,
              //   },
              //   b: {
              //     color: '#4C5058',
              //     fontSize: 14,
              //     fontWeight: 'bold',
              //     lineHeight: 33,
              //   },
              //   per: {
              //     color: '#fff',
              //     backgroundColor: '#4C5058',
              //     padding: [3, 4],
              //     borderRadius: 4,
              //   },
              // },
            },
            data: this.rawData2.map(i => {
              return {
                value: i.problemCount,
                name: i.warningName
              }
            })
          }
        ]
      }
      echarts.init(dom).setOption(option)
    },
    drawFirstChart () {
      const dom = this.$refs.dom
      const option = {
        title: {
          text: `近${this.rawData.length}次指标预警监控`,
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          right: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 45
            },
            data: this.rawData.map(i => {
              return moment(i.createTime).format('YYYY-MM-DD')
            }),
            rotate: 45
          }
        ],
        yAxis: [
          {
            // type: 'log',
            // min: 0.1,
          }
        ],
        color: ['#3ba1ff', '#f7a945', '#df273d'],
        series: [
          {
            name: WarningLevelLabel[WarningLevel.EARLY_WARNING],
            type: 'bar',
            stack: 'Ad',
            emphasis: {
              focus: 'series'
            },
            data: this.rawData.map(i =>
              i.EARLY_WARNING ? i.EARLY_WARNING : 0
            )
          },
          {
            name: WarningLevelLabel[WarningLevel.WARNING],
            type: 'bar',
            stack: 'Ad',
            emphasis: {
              focus: 'series'
            },
            barWidth: 30,
            data: this.rawData.map(i => (i.WARNING ? i.WARNING : 0))
          },
          {
            name: WarningLevelLabel[WarningLevel.SERIOUS_WARNING],
            type: 'bar',
            stack: 'Ad',
            emphasis: {
              focus: 'series'
            },
            data: this.rawData.map(i =>
              i.SERIOUS_WARNING ? i.SERIOUS_WARNING : 0
            )
          }
        ]
      }
      const myChart = echarts.init(dom)
      myChart.setOption(option)
      myChart.on('click', params => {
        this.dataIndex = params.dataIndex
        this.getData2(this.rawData[params.dataIndex].createTime)
      })
    }
  }
}
</script>
