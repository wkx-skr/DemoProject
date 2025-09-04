<template>
  <!-- 标准数据元业务域分布 standardBusinessDistributionChart -->
  <div class="dashboard-item">
    <title-line title-text="标准数据元业务域分布"></title-line>
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
  name: 'standardBusinessDistributionChart',
  components: {
    titleLine,
  },
  data() {
    return {
      loading: false,
      echartsInstance: null,
      businessDomainData: [],
      colors: [
        '#49CCFF',
        '#20D3AB',
        '#FDD56A',
        '#49CCFF',
        '#20D3AB',
        '#FDD56A',
        '#49CCFF',
        '#20D3AB',
        '#FDD56A',
        '#49CCFF',
        '#20D3AB',
        '#FDD56A',
      ],
      colors2: [
        '#49CCFF88',
        '#20D3AB88',
        '#FDD56A88',
        '#49CCFF88',
        '#20D3AB88',
        '#FDD56A88',
        '#49CCFF88',
        '#20D3AB88',
        '#FDD56A88',
        '#49CCFF88',
        '#20D3AB88',
        '#FDD56A88',
      ],
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
        .post('/domain/domains/getBusinessCount')
        .then(res => {
          const data = res.data
          this.processData(data)
          this.drawEcharts()
        })
        .catch(e => {
          // this.$showFailure(e)


          // 在接口调用失败时使用模拟数据
          console.error('获取业务域数据失败，使用模拟数据', e)
          
          // 模拟数据
          const mockData = { 
            "保险业": 42, 
            "制造业": 89, 
            "金融行业": 156, 
            "证券行业": 65, 
            "自定义": 31, 
            "银行业": 78,
            "能源行业": 54,
            "医疗行业": 67,
            "教育行业": 45,
            "零售行业": 92
          }
          
          // 使用模拟数据进行处理和渲染
          this.processData(mockData)
          this.drawEcharts()
          
          // 仍然显示错误提示
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    processData(data) {
      // 处理新接口返回的数据格式
      // 示例数据: { "保险业": 2, "制造业": 9, "123213": 1, "证券行业": 0, "自定义": 1, "银行业": 3 }
      if (data) {
        let domainData = []
        for (const domain in data) {
          if (data.hasOwnProperty(domain) && data[domain] > 0) {
            domainData.push({
              name: domain,
              value: data[domain],
            })
          }
        }

        // 按照数值大小排序
        domainData = domainData.sort(this.compare('value')).reverse()
        this.businessDomainData = domainData
      }
    },
    compare(propertyName) {
      return function (object1, object2) {
        var value1 = object1[propertyName]
        var value2 = object2[propertyName]
        if (value2 < value1) {
          return 1
        } else if (value2 > value1) {
          return -1
        } else {
          return 0
        }
      }
    },
    drawEcharts() {
      if (!this.$refs.echartsContainer) return

      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init(this.$refs.echartsContainer)
      }

      let seriesData = []

      for (let i = 0; i < this.businessDomainData.length; i++) {
        let ss = 120
        if (i < 3) {
          ss = 100 - i * 10
        } else if (i >= 3 && i < 10) {
          ss = 100 - i * 10
        } else {
          ss = 100 - i * 4
        }

        const item = {
          name: this.businessDomainData[i].name,
          value: this.businessDomainData[i].value,
          symbolSize: ss,
          draggable: true,
          label: {
            show: true,
            formatter: ['{title|{b}}', '{name|{c}}'].join('\n'),
            rich: {
              title: {
                fontSize: 12,
                color: '#fff',
                textBorderColor: this.colors[i % this.colors.length],
                textBorderWidth: 2,
                textAlign: 'center',
                align: 'center',
              },
              name: {
                fontSize: 12,
                color: '#fff',
                textBorderColor: this.colors[i % this.colors.length],
                textBorderWidth: 2,
                textAlign: 'center',
                align: 'center',
              },
            },
          },
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                {
                  offset: 0,
                  color: this.colors[i % this.colors.length],
                },
                {
                  offset: 1,
                  color: this.colors2[i % this.colors2.length],
                },
              ],
              global: false,
            },
            borderColor: this.colors[i % this.colors.length],
            shadowBlur: 20,
            shadowColor: this.colors[i % this.colors.length],
            borderWidth: 2,
          },
        }

        seriesData.push(item)
      }

      const option = {
        tooltip: {
          formatter: function (params) {
            const str =
              params.marker +
              '' +
              params.data.name +
              '</br>' +
              '标准数量：' +
              nUtils.insertComma(params.data.value) +
              '个</br>'
            return str
          },
        },
        animationDurationUpdate: function (idx) {
          // 越往后的数据延迟越大
          return idx * 1
        },
        animationEasingUpdate: 'bounceIn',
        color: ['#fff', '#fff', '#fff'],
        series: [
          {
            type: 'graph',
            layout: 'force',
            force: {
              repulsion: 130,
              edgeLength: 10,
            },
            roam: true,
            data: seriesData,
          },
        ],
      }

      this.echartsInstance.setOption(option)
      this.echartsInstance.on('click', this.handleChartClick)
    },
    handleChartClick(params) {
      // 点击散点时的处理逻辑
      if (params.componentType === 'series') {
        const data = params.data
        console.log('点击了业务域:', data.name)
        // 这里可以添加导航到详情页或其他交互逻辑
      }
    },
  },
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
