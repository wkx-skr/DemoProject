<template>
  <div class="bg-white">
    <h2>按照业务统计</h2>
    <div class="origin-container-pie" v-loading="showloading">
      <div class="echart-container" ref="echartsCon"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import themeMixin from '@/components/common/themePick/themeMixin.js'
let echartInstance = null
export default {
  name: 'folderEchart',
  mixins: [themeMixin],
  data() {
    return {
      tagIdMap: null,
      classNameWithoutTag: '',
      showloading: false,
      summaryColorList: ['#52CBF0', '#A756F4', '#51a1ff', '#F8B95D', '#FF7575'],
      muluIdToName: {},
    }
  },
  props: {
    getData: {
      type: Promise,
      required: true,
    },
    colorMap: {
      type: Array,
      default() {
        return []
      },
    },
    muluData: {
      type: Promise,
      required: true,
    },
  },
  components: {},
  computed: {},
  beforeMount() {
    this.dataInit()
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
    drawEcharts({ legendData, selectedData, seriesData }) {
      const container = this.$refs.echartsCon
      const opt = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: '10%',
          top: 'center',
          type: 'scroll',
          data: legendData,
          selected: selectedData,
          // width: '20px',
          width: 50,
          height: '90%',
          itemWidth: 10,
          itemHeight: 10,
          // borderRadius: 50,
          // borderWidth: 3,
          // borderColor: '#f00',
          pageIconSize: 8,
          textStyle: {
            color: this.themeName === 'dark' ? '#ddd' : '#333',
          },
          formatter: name => {
            return name.replace(/^L[0-9]+-/, '')
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['55%', '60%'],
            center: ['25%', '50%'],
            left: 60,
            selectedMode: false,
            hoverAnimation: false,
            data: [{ value: 1, name: '' }],
            itemStyle: {
              color: 'rgb(248, 251, 255)',
            },
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            tooltip: {
              show: false,
            },
            animation: false,
            cursor: 'auto',
          },
          {
            cursor: 'default',
            name: '目录统计',
            type: 'pie',
            radius: ['35%', '55%'],
            center: ['25%', '50%'],
            left: 60,
            avoidLabelOverlap: false,
            labelLine: {
              normal: {
                show: false,
              },
            },
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: false,
                textStyle: {
                  fontSize: '20',
                  fontWeight: 'bold',
                },
              },
            },
            data: seriesData,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          {
            type: 'pie',
            radius: ['30%', '31%'],
            center: ['25%', '50%'],
            left: 60,
            selectedMode: false,
            hoverAnimation: false,
            data: [{ value: 1, name: '' }],
            itemStyle: {
              color: 'rgba(67, 134, 245, 0.2)',
            },
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            tooltip: {
              show: false,
            },
            animation: false,
            cursor: 'auto',
          },
        ],
      }
      if (container) {
        this.$nextTick(() => {
          echartInstance = echarts.init(container)
          echartInstance.setOption(opt)
        })
      }
      this.showloading = false
    },
    dataInit() {
      this.showloading = true
      this.muluData
        .then(res => {
          res.data.forEach(item => {
            this.muluIdToName[item.id] = item.name
          })
          return this.getData
        })
        .then(res => {
          const data = res.data
          let arr = []
          for (const key in data) {
            arr.push({
              key,
              value: data[key],
            })
          }
          arr = arr.sort((a, b) => {
            return b.value - a.value
          })
          const seriesData = []
          let i = 0
          for (const item of arr) {
            if (i >= 5 || !this.muluIdToName[item.key]) {
              // 最多展示5个
              break
            }
            const itemColor = this.summaryColorList[i]
            i++
            const obj = {
              value: item.value,
              name:
                this.muluIdToName[item.key].length >= 6
                  ? this.muluIdToName[item.key].slice(0, 6) + '...'
                  : this.muluIdToName[item.key],
              itemStyle: {
                normal: { color: itemColor },
                emphasis: { color: itemColor },
              },
            }
            seriesData.push(obj)
          }
          const selectedData = {}
          seriesData.forEach(item => {
            selectedData[item.name] = true
          })
          const legendData = seriesData.map(item => {
            const obj = {
              name: item.name,
              icon: 'rect',
            }
            return obj
          })
          const para = {
            legendData: legendData,
            seriesData: seriesData,
            selectedData: selectedData,
          }
          this.drawEcharts(para)
        })
        .catch(e => {
          this.$showFailure(e)
          this.showloading = false
        })
    },
    handleResize() {
      if (echartInstance) {
        this.$nextTick(echartInstance.resize)
      } else {
        this.dataInit()
      }
    },
  },
  watch: {},
}
</script>

<style scoped lang="scss">
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
.bg-white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background: #fff;
  border-radius: 2px;
  box-sizing: border-box;
  h2 {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 14px;
    line-height: 1;
    color: #555;
    border-left: 4px solid #409eff;
    padding-left: 6px;
  }
}
</style>
