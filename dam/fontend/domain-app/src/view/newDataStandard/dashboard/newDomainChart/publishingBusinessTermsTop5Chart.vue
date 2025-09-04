<template>
  <!-- 业务域发布业务术语TOP5 publishingBusinessTermsTop5Chart -->
  <div class="dashboard-item">
    <title-line title-text="业务域发布业务术语TOP5"></title-line>
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
  name: 'publishingBusinessTermsTop5Chart',
  components: {
    titleLine,
  },
  data() {
    return {
      loading: false,
      echartsInstance: null,
      businessTermsData: [],
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
      if (this.echartsInstance) {
        this.echartsInstance.resize()
      }
    },
    dataInit() {
      this.loading = true
      // TODO: 业务术语接口待对接
      this.$http
        .post(`/domain/domains/getBusinessTermCount`)
        .then(res => {
          this.businessTermsData = Object.keys(res.data)
            .map(key => ({
              businessDomain: key,
              count: res.data[key],
            }))
            .sort((a, b) => b.count - a.count)
          this.drawEcharts(this.getEchartsOptions(this.businessTermsData))
        })
        .catch(e => {
          this.$showFailure(e)
          // 模拟数据渲染效果
          const mockData = [
            { businessDomain: 'A业务域', count: 850 },
            { businessDomain: 'B业务域', count: 720 },
            { businessDomain: 'C业务域', count: 650 },
            { businessDomain: 'D业务域', count: 580 },
            { businessDomain: 'E业务域', count: 500 },
          ]
          this.businessTermsData = mockData
          this.drawEcharts(this.getEchartsOptions(mockData))
        })
        .finally(() => {
          this.loading = false
        })
    },
    getEchartsOptions(data) {
      // 对数据进行排序和处理
      let sortedData = [...data]
      sortedData.sort((a, b) => b.count - a.count)
      sortedData = sortedData.slice(0, 5) // 只取前5条数据

      // 注意：为了从上到下按从大到小排序，需要反转数组
      // 因为Y轴的类目是从下到上排列的
      const reversedData = [...sortedData].reverse()

      const xAxisData = reversedData.map(item => item.businessDomain)
      const seriesData = reversedData.map(item => item.count)

      const self = this
      return {
        grid: {
          left: '5%',
          right: '8%',
          bottom: '8%',
          top: '8%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (params) {
            const value = nUtils.insertComma(params[0].value || 0)
            return `${params[0].name}：${value}`
          },
          backgroundColor: 'rgba(50,50,50,0.7)',
          borderColor: '#333',
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E0E6F1',
            },
          },
          axisLabel: {
            color: '#666',
            fontSize: 12,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#F0F0F0',
              type: 'dashed',
            },
          },
        },
        yAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            color: '#666',
            fontSize: 12,
            formatter: function (value) {
              if (value.length > 10) {
                return value.slice(0, 10) + '...'
              }
              return value
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#E0E6F1',
            },
          },
        },
        series: [
          {
            name: '业务术语数量',
            type: 'bar',
            barWidth: '50%',
            data: seriesData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#4FCCFF' },
                { offset: 1, color: '#3A88FF' },
              ]),
              borderRadius: [0, 4, 4, 0],
            },
            label: {
              show: true,
              position: 'right',
              color: '#666',
              formatter: function (params) {
                return nUtils.insertComma(params.value || 0)
              },
            },
          },
        ],
      }
    },
    drawEcharts(options) {
      if (!this.$refs.echartsContainer) return

      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init(this.$refs.echartsContainer)
      }

      this.echartsInstance.setOption(options, true)
    },
  },
}
</script>

<style scoped lang="scss">
.dashboard-item {
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding-bottom: 10px;

  .bottom-container {
    height: calc(100% - 47px);
    position: relative;
    padding: 0 10px;

    .echarts-outer {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
