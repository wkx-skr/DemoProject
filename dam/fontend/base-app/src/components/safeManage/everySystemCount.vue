<template>
  <div class="bg-white">
    <h2>各系统安全标签统计</h2>
    <div class="origin-container" v-loading="showloading">
      <div class="echart-container" ref="echartsCon"></div>
    </div>
  </div>
</template>

<script>
import themeMixin from '@/components/common/themePick/themeMixin.js'
import * as echarts from 'echarts'

let echartInstance = null
export default {
  name: 'systemCount',
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
    }
  },
  props: {
    getData: {
      type: Promise,
      required: true,
    },
    getAllTages: {
      type: Promise,
      required: true,
    },
    colorMap: {
      type: Array,
      default() {
        return []
      },
    },
    safeTagCatalogName: {
      type: String,
      required: true,
    },
  },
  beforeMount() {
    this.resetStyle()
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
      this.resetStyle()
      this.dataInit()
    },
    drawEcharts({ legendData, seriesData, catalogArr }) {
      const container = this.$refs.echartsCon
      const opt = {
        // title: {
        //   text: '各系统安全标签统计',
        //   x: 'center',
        //   top: 4,
        //   textStyle: {
        //     fontWeight: 'normal',
        //   }
        // },
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
          top: 50,
          right: 20,
          left: 15,
          type: 'scroll',
          itemWidth: 10,
          itemHeight: 10,
          pageIconSize: 8,
          textStyle: {
            color: this.themeName === 'dark' ? '#ddd' : '#333',
          },
        },
        grid: {
          left: 20,
          right: 20,
          top: 100,
          bottom: 10,
          containLabel: true,
        },
        xAxis: {
          axisLabel: {
            inside: true,
            textStyle: {
              color: '#444',
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          type: 'category',
          data: catalogArr,
          axisLabel: {
            rotate: 30,
            fontSize: this.mediaStyleData.barLabelFontSize,
          },
        },
        yAxis: {
          axisLine: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#ddd'],
              width: 1,
              type: 'solid',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            textStyle: {
              color: '#444',
            },
          },
          type: 'value',
        },
        series: seriesData,
      }
      if (container) {
        this.$nextTick(() => {
          echartInstance = echarts.init(container)
          echartInstance.setOption(opt)
          // echartInstance.on('click', (params) => {
          //   this.$router.push('/main/modelCategory')
          // })
        })
      }
      this.showloading = false
    },
    dataInit() {
      this.showloading = true
      this.getAllTages
        .then(res => {
          const tagIdMap = {}
          const tagArr = res.data
          const allSafeTags = []
          if (tagArr && Array.isArray(tagArr) && tagArr.length > 0) {
            tagArr.forEach(tag => {
              tagIdMap[tag.tagId] = tag
              if (tag.parentName === this.safeTagCatalogName) {
                allSafeTags.push(tag)
              }
            })
          }
          this.$utils.sort.sort(allSafeTags)
          this.allSafeTags = allSafeTags
          this.tagIdMap = tagIdMap
          if (true) {
            return this.getData
          } else {
            return new Promise((resolve, reject) => {
              const data = {
                1: {
                  84: 10,
                  86: 30,
                  102: 200,
                },
                2: {
                  104: 30,
                  103: 50,
                  84: 33,
                  86: 30,
                  102: 55,
                },
                3: {
                  104: 30,
                  103: 250,
                  84: 433,
                  86: 330,
                  102: 515,
                },
                4: {
                  104: 304,
                  103: 50,
                  84: 333,
                  86: 30,
                  102: 525,
                },
                5: {
                  104: 30,
                  103: 540,
                  84: 333,
                  86: 30,
                  102: 255,
                },
              }
              resolve({ data: data })
            })
          }
        })
        .then(res => {
          const data = res.data
          let formatData = []
          const totalShow = []
          for (const key in data) {
            if (!this.$modelCategoriesDetailsMap[key]) {
              continue
            }
            let total = 0
            const cataData = data[key]
            const arr = []
            this.allSafeTags.forEach(tag => {
              const tagId = tag.tagId
              const count = cataData[tagId] || 0
              arr.push(count)
              total += count
            })
            const obj = {
              catalog: this.$modelCategoriesDetailsMap[key],
              catalogName: this.$modelCategoriesDetailsMap[key].categoryName,
              categoryId: key,
              total: total,
              dataArr: arr,
              tagCountMap: cataData,
            }
            formatData.push(obj)
            totalShow.push(0)
          }
          this.$bus.$emit('system-size', formatData.length)
          formatData.sort((a, b) => {
            return b.total - a.total
          })
          formatData = formatData.splice(0, this.showCataLength)
          // console.log(formatData, 'formatData')
          const seriesData = []
          const catalogArr = formatData.map(item => {
            return item.catalogName.length >= 6
              ? item.catalogName.slice(0, 6) + '...'
              : item.catalogName
          })
          const legendData = []
          this.allSafeTags.forEach((tag, index) => {
            legendData.push({
              name: tag.name,
              icon: 'rect',
            })
            const dataArr = []
            formatData.forEach(item => {
              // let count = item.tagCountMap[tag.tagId] || 0;
              // dataArr.push(count);
              const ifShowLable =
                item.tagCountMap[tag.tagId] &&
                item.tagCountMap[tag.tagId] > 0 &&
                false
              // console.log(ifShowLable, 'ifShowLable')
              const obj = {
                name: '',
                label: {
                  normal: {
                    show: ifShowLable,
                    position: 'inside',
                  },
                },
                value: item.tagCountMap[tag.tagId] || 0,
              }
              dataArr.push(obj)
            })
            const itemColor = this.colorMap[index] || 'auto'
            // let ifShowLable = true;
            const obj = {
              cursor: 'default',
              name: tag.name,
              type: 'bar',
              stack: '总量',
              label: {
                normal: {
                  // show: true,
                  // position: 'top'
                },
              },
              data: dataArr,
              barMaxWidth: 20,
              itemStyle: {
                normal: { color: itemColor },
                emphasis: { color: itemColor },
              },
            }
            seriesData.push(obj)
          })
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
  },
}
</script>

<style scoped lang="scss">
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

.bg-white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible !important;
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
