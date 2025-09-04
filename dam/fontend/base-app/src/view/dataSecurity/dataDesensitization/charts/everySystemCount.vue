<template>
  <div class="origin-container" v-loading="showloading">
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
      tagIdMap: null,
      allSafeTags: [],
      showCataLength: 10,
      showloading: false,
      mediaStyleData: {
        barLabelFontSize: 10,
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
    statusMap: {
      type: Object,
      required: true,
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
    this.$bus.$on('changeGlobalTheme', this.handleThemeChange)
  },
  mounted() {
    $(window).resize(this.handleResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    echartInstance && echarts.dispose(echartInstance)
    this.$bus.$off('changeGlobalTheme', this.handleThemeChange)
  },
  methods: {
    handleThemeChange(newTheme) {
      this.theme = newTheme === 'dark' ? 'dark' : 'light'
      if (this.myChart) {
        this.myChart.dispose()
        this.$nextTick(() => {
          this.dataInit()
        })
      }
    },
    drawEcharts({ legendData, seriesData, catalogArr }) {
      const hasData =
        seriesData[0] && seriesData[0].data && seriesData[0].data.length > 0
      const container = this.$refs.echartsCon
      const opt = {
        title: {
          text: '按系统数据脱敏落地统计',
          x: 'center',
          top: 10,
          textStyle: {
            fontWeight: 'normal',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
          // formatter: '{b0}: {c0}<br />{b1}: {c1}'
        },
        legend: {
          data: legendData,
          bottom: 10,
          type: 'scroll',
          width: '90%',
          itemWidth: 10,
          itemHeight: 10,
          pageIconSize: 8,
          textStyle: {
            color: this.themeName === 'dark' ? '#ddd' : '#333',
          },
        },
        grid: {
          left: '5%',
          right: '4%',
          bottom: hasData ? '20' : '40',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: catalogArr,
          axisLabel: {
            rotate: 30,
            fontSize: this.mediaStyleData.barLabelFontSize,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: seriesData,
      }
      // console.log(opt, 'option')
      if (container) {
        this.$nextTick(() => {
          echartInstance && echarts.dispose(echartInstance)
          echartInstance = echarts.init(container, this.theme)
          this.myChart = echartInstance
          echartInstance.setOption(opt)
        })
      }
      this.showloading = false
    },
    dataInit() {
      this.showloading = true
      this.getData
        .then(res => {
          const data = res.data
          if (false) {
            for (let i = 0; i < 15; i++) {
              data[i] = {
                无法映射: parseInt(Math.random() * 40),
                部分映射: parseInt(Math.random() * 40),
                完全映射: parseInt(Math.random() * 40),
              }
            }
          }
          // console.log(data, 'data')
          let formatData = []
          const totalShow = []
          for (const key in data) {
            if (!this.$modelCategoriesDetailsMap[key]) {
              continue
            }
            let total = 0
            const cataData = data[key]
            const arr = []
            for (const matchType in this.matchType) {
              const count = cataData[this.matchType[matchType]] || 0
              arr.push(count)
              total += count
            }
            const obj = {
              catalog: this.$modelCategoriesDetailsMap[key],
              catalogName: this.$modelCategoriesDetailsMap[key].categoryName,
              categoryId: key,
              total: total,
              dataArr: arr,
              originData: cataData,
            }
            formatData.push(obj)
            totalShow.push(0)
          }
          formatData.sort((a, b) => {
            return b.total - a.total
          })
          formatData = formatData.splice(0, this.showCataLength)
          // console.log(formatData, 'formatData')
          const seriesData = []
          const catalogArr = formatData.map(item => {
            return item.catalogName
          })
          const legendData = []
          for (const key in this.matchType) {
            legendData.push({
              name: this.matchType[key],
              icon: 'circle',
            })
            const dataArr = []
            formatData.forEach(item => {
              // let count = item.tagCountMap[tag.tagId] || 0;
              // dataArr.push(count);
              // let ifShowLable = item.tagCountMap[tag.tagId] && item.tagCountMap[tag.tagId] > 0 && false;
              // console.log(ifShowLable, 'ifShowLable')
              const obj = {
                name: '',
                label: {
                  normal: {
                    // show: ifShowLable,
                    show: false,
                    position: 'inside',
                  },
                },
                value: item.originData[this.matchType[key]] || 0,
              }
              dataArr.push(obj)
            })
            const itemColor = this.colorMap[this.matchType[key]] || 'auto'
            // let ifShowLable = true;
            const obj = {
              name: this.matchType[key],
              type: 'bar',
              stack: '总量',
              label: {
                normal: {
                  // show: true,
                  // position: 'top'
                },
              },
              data: dataArr,
              barMaxWidth: 30,
              itemStyle: {
                normal: { color: itemColor },
                emphasis: { color: itemColor },
              },
            }
            seriesData.push(obj)
          }
          const totalItem = {
            name: '合计',
            type: 'bar',
            stack: 'xxx',
            label: {
              normal: {
                show: true,
                position: 'top',
                textStyle: {
                  color: '#000',
                },
                formatter: '',
              },
            },
            data: totalShow, // 思路一：给series集合末尾多加一栏用于展示合计，但是值都是0；缺点：必须根据xAxis的data生成一组为空的数据，且tooltip不能加trigger: 'axis',这个条件，不然会展示合计：0
          }
          // seriesData.push(totalItem);

          const para = {
            legendData: legendData,
            seriesData: seriesData,
            catalogArr: catalogArr,
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
            xAxis: {
              axisLabel: {
                fontSize: this.mediaStyleData.barLabelFontSize,
              },
            },
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
          barLabelFontSize: 12,
        }
      } else {
        mediaStyleData = {
          barLabelFontSize: 10,
        }
      }
      this.mediaStyleData = mediaStyleData
    },
    refreshEchart() {
      this.$emit('setEsystemData')
      this.$nextTick(this.dataInit)
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.origin-container {
  position: relative;
  width: 100%;
  height: 100%;

  .echart-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
