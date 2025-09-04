<template>
  <!-- 自定义模块 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.customModuleArea') }}</p>
    </div>
    <div id="mian" style="width: 100%; height: 586px"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import China from './China.json'
export default {
  name: 'customModule',
  components: {},
  data() {
    return {
      myChart: null,
    }
  },
  props: {
    timeRange: {
      type: String,
      default() {
        return null
      },
    },
    text: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  mounted() {
    // this.drawChart()
    this.$nextTick(() => {
      this.dataInit()
    })
  },
  beforeDestroy() {
    this.myChart && this.myChart.dispose()
  },
  methods: {
    dataInit() {
      this.myChart && this.myChart.clear()
      this.myChart = echarts.init(document.getElementById('mian'))
      echarts.registerMap('china', China)
      var option = {
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
        },
        series: [
          {
            name: '',
            type: 'map',
            roam: false,
            map: 'china',
            itemStyle: {
              emphasis: {
                label: {
                  show: true,
                },
                areaColor: '#409EFF',
              },
            },
            data: [],
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
