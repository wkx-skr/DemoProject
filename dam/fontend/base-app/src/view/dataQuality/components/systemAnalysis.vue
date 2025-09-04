<template>
  <div class="new-container">
    <div id="new-map"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  data() {
    return {
      systemName: [],
      systemValue: [],
      theme: 'light',
      name: '',
      value: '',
      type: '',
      myChart: null,
    }
  },
  mounted() {
    this.theme = this.$globalData.$theme.themeName === 'dark' ? 'dark' : 'light'
    this.$bus.$on('systemData', (name, value, type) => {
      this.name = name
      this.value = value
      this.type = type
      this.$nextTick(() => {
        this.systemAnalysis(name, value, type)
      })
    })
    this.$bus.$on('changeGlobalTheme', this.handleThemeChange)
  },
  beforeDestroy() {
    this.$bus.$off('systemData')
    if (document.getElementById('new-map')) {
      var charts1 = echarts.init(document.getElementById('new-map'))
      charts1.dispose()
    }
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
    this.$bus.$off('changeGlobalTheme', this.handleThemeChange)
  },
  methods: {
    handleThemeChange(newTheme) {
      this.theme = newTheme === 'dark' ? 'dark' : 'light'
      if (this.name) {
        this.myChart.dispose()
        this.$nextTick(() => {
          this.systemAnalysis(this.name, this.value, this.type)
        })
      }
    },
    systemAnalysis(name, value, type) {
      var charts1 = echarts.init(document.getElementById('new-map'), this.theme)
      this.myChart = charts1
      charts1.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        barWidth: 60,
        color: ['#5587CF', '#F48E40'],
        legend: {
          data: [
            '直接访问',
            '邮件营销',
            '联盟广告',
            '视频广告',
            '搜索引擎',
            '百度',
            '谷歌',
            '必应',
            '其他',
          ],
        },
        grid: {
          left: '3%',
          right: '5%',
          top: '5%',
          height: '400px',
          x: 35,
          y: 55,
          x2: 35,
          y2: 60,
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: name,
            axisLabel: {
              interval: 0,
              rotate: 45,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name:
              type === 0
                ? this.$t('quality.page.ruleReport.ruleNum')
                : this.$t('quality.page.problemReport.problemsNum'),
            type: 'bar',
            stack: '广告',
            data: value,
          },
        ],
      })
    },
  },
}
</script>

<style>
.new-container {
  width: 1200px;
}
#new-map {
  width: 1200px;
  height: 550px;
  overflow: auto;
}
</style>
