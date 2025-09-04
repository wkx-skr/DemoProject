<template>
  <!-- 近一年标准数据元发布趋势 oneyearStandardsReleaseTrendsChart -->
  <div class="dashboard-item">
    <title-line title-text="近一年标准数据元发布趋势"></title-line>
    <div class="bottom-container" v-loading="loading">
      <div class="echarts-outer" ref="echartsContainer"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import titleLine from '../titleLine'
import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'

export default {
  name: 'oneyearStandardsReleaseTrendsChart',
  components: {
    titleLine,
  },
  data() {
    return {
      loading: false,
      echartsInstance: null,
      chartData: [],
    }
  },
  mounted() {
    this.dataInit()
    $(window).resize(this.handleResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    this.echartsInstance && echarts.dispose(this.echartsInstance)
  },
  methods: {
    handleResize() {
      this.echartsInstance && this.echartsInstance.resize()
    },
    dataInit() {
      this.loading = true
      this.$http
        .post('/domain/domains/getDomainCountByMonth')
        .then(res => {
          this.chartData = res.data || []
          this.drawEcharts()
        })
        .catch(e => {
          console.error('获取标准数据元发布趋势数据失败', e)
          
          // 模拟数据
          const mockData = [
            { 
              "abolishDomain": 0, 
              "allDomain": 320, 
              "month": "2025-01", 
              "monthAddCount": 320, 
              "monthUpdateCount": 210, 
              "monthAbolishCount": 0 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 520, 
              "month": "2025-02", 
              "monthAddCount": 250, 
              "monthUpdateCount": 280, 
              "monthAbolishCount": 0 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 580, 
              "month": "2025-03", 
              "monthAddCount": 60, 
              "monthUpdateCount": 220, 
              "monthAbolishCount": 30 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 650, 
              "month": "2025-04", 
              "monthAddCount": 70, 
              "monthUpdateCount": 550, 
              "monthAbolishCount": 60 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 850, 
              "month": "2025-05", 
              "monthAddCount": 200, 
              "monthUpdateCount": 150, 
              "monthAbolishCount": 70 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1400, 
              "month": "2025-06", 
              "monthAddCount": 550, 
              "monthUpdateCount": 80, 
              "monthAbolishCount": 70 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1450, 
              "month": "2025-07", 
              "monthAddCount": 10, 
              "monthUpdateCount": 140, 
              "monthAbolishCount": 150 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1460, 
              "month": "2025-08", 
              "monthAddCount": 10, 
              "monthUpdateCount": 80, 
              "monthAbolishCount": 130 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1470, 
              "month": "2025-09", 
              "monthAddCount": 10, 
              "monthUpdateCount": 120, 
              "monthAbolishCount": 80 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1480, 
              "month": "2025-10", 
              "monthAddCount": 10, 
              "monthUpdateCount": 200, 
              "monthAbolishCount": 70 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1490, 
              "month": "2025-11", 
              "monthAddCount": 10, 
              "monthUpdateCount": 280, 
              "monthAbolishCount": 140 
            },
            { 
              "abolishDomain": 0, 
              "allDomain": 1500, 
              "month": "2025-12", 
              "monthAddCount": 10, 
              "monthUpdateCount": 210, 
              "monthAbolishCount": 0 
            }
          ]
          
          this.chartData = mockData
          this.drawEcharts()
          
          // 显示错误提示
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    drawEcharts() {
      if (!this.$refs.echartsContainer) return

      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init(this.$refs.echartsContainer)
      }

      // 处理数据
      const months = this.chartData.map(item => item.month)
      const addData = this.chartData.map(item => item.monthAddCount)
      const updateData = this.chartData.map(item => item.monthUpdateCount)
      const abolishData = this.chartData.map(item => item.monthAbolishCount)

      // 计算默认显示的数据范围（最近6个月）
      const dataLength = months.length
      const startIndex = Math.max(0, dataLength - 6)
      const endIndex = dataLength - 1
      
      // 计算默认的dataZoom范围百分比
      const startPercent = (startIndex / dataLength) * 100
      const endPercent = 100

      const option = {
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%', // 增加底部空间以容纳dataZoom控件
          top: '15%',
          containLabel: true
        },
        legend: {
          data: ['新增', '变更', '废弃'],
          top: '5%',
          textStyle: {
            color: '#666',
            fontSize: 12
          },
          itemWidth: 12,
          itemHeight: 4,
          icon: 'rect',
          itemGap: 20
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: (params) => {
            let result = params[0].name + '<br/>';
            params.forEach(item => {
              let value = nUtils.insertComma(item.value || 0);
              let color = item.color;
              let seriesName = item.seriesName;
              result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${seriesName}：${value}<br/>`;
            });
            return result;
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months,
          axisLine: {
            lineStyle: {
              color: '#E0E6F1'
            }
          },
          axisLabel: {
            color: '#666',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          name: '',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E0E6F1'
            }
          },
          axisLabel: {
            color: '#666',
            fontSize: 12,
            formatter: function(value) {
              return value;
            }
          },
          splitLine: {
            lineStyle: {
              color: '#F0F0F0',
              type: 'dashed'
            }
          }
        },
        // 添加dataZoom组件，实现拖拽控制
        dataZoom: [
          {
            type: 'slider', // 滑动条型数据区域缩放组件
            show: true,
            xAxisIndex: [0],
            start: startPercent, // 默认显示最近6个月数据
            end: endPercent,
            height: 20,
            bottom: 10,
            borderColor: '#ddd',
            fillerColor: 'rgba(64, 158, 255, 0.1)',
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
              color: '#fff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            textStyle: {
              color: '#999'
            },
            zoomLock: false, // 是否锁定选择区域的大小
            moveOnMouseWheel: true, // 鼠标滚轮是否触发缩放
            zoomOnMouseWheel: false // 鼠标滚轮是否触发缩放
          },
          {
            type: 'inside', // 内置型数据区域缩放组件
            xAxisIndex: [0],
            start: startPercent,
            end: endPercent,
            zoomOnMouseWheel: false, // 禁用鼠标滚轮缩放
            moveOnMouseWheel: true, // 启用鼠标滚轮平移
            preventDefaultMouseMove: true // 阻止默认鼠标移动行为
          }
        ],
        series: [
          {
            name: '新增',
            type: 'line',
            smooth: false,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: '#4080FF'
            },
            itemStyle: {
              color: '#4080FF',
              borderWidth: 2,
              borderColor: '#fff'
            },
            emphasis: {
              itemStyle: {
                borderWidth: 3,
                borderColor: '#fff'
              }
            },
            data: addData
          },
          {
            name: '变更',
            type: 'line',
            smooth: false,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: '#20D3AB'
            },
            itemStyle: {
              color: '#20D3AB',
              borderWidth: 2,
              borderColor: '#fff'
            },
            emphasis: {
              itemStyle: {
                borderWidth: 3,
                borderColor: '#fff'
              }
            },
            data: updateData
          },
          {
            name: '废弃',
            type: 'line',
            smooth: false,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: '#6E6E6E'
            },
            itemStyle: {
              color: '#6E6E6E',
              borderWidth: 2,
              borderColor: '#fff'
            },
            emphasis: {
              itemStyle: {
                borderWidth: 3,
                borderColor: '#fff'
              }
            },
            data: abolishData
          }
        ]
      }

      this.echartsInstance.setOption(option)
    }
  }
}
</script>

<style scoped>
.dashboard-item {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  box-sizing: border-box;
}

.bottom-container {
  width: 100%;
  height: calc(100% - 40px);
  position: relative;
}

.echarts-outer {
  width: 100%;
  height: 100%;
}
</style>