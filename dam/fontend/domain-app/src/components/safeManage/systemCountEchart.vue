<template>
  <div class="bg-white">
    <h2>数据分级总体分布</h2>
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
  name: 'systemEchart',
  mixins: [themeMixin],
  data() {
    return {
      tagIdMap: null,
      classNameWithoutTag: '',
      showloading: false,
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
          formatter: '{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: '5%',
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
            name: '字段统计',
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
      this.getAllTages
        .then(res => {
          const tagIdMap = {}
          const tagArr = res.data
          if (tagArr && Array.isArray(tagArr) && tagArr.length > 0) {
            tagArr.forEach(tag => {
              tagIdMap[tag.tagId] = tag
            })
          }
          this.tagIdMap = tagIdMap
          if (true) {
            return this.getData
          } else {
            return new Promise((resolve, reject) => {
              const data = {
                total: 300,
                84: 10,
                86: 30,
                102: 200,
              }
              resolve({ data: data })
            })
          }
        })
        .then(res => {
          const data = res.data
          const seriesData = []
          let totalWithTag = 0
          let total = 0
          const allData = []
          let index = 0
          for (const key in data) {
            if (key !== 'total') {
              // console.log(this.colorMap, 'this.colorMap')
              const tag = this.tagIdMap[key]
              if (tag) {
                // 数字为0不展示
                const itemColor = this.colorMap[index++] || 'auto'
                const obj = {
                  id: key,
                  value: data[key],
                  name:
                    tag.name.length >= 8
                      ? tag.name.slice(0, 8) + '...'
                      : tag.name,
                  itemStyle: {
                    normal: { color: itemColor },
                    emphasis: { color: itemColor },
                  },
                }
                totalWithTag += data[key]
                if (data[key] !== 0) {
                  seriesData.push(obj)
                }
                allData.push(obj)
              }
            } else {
              total = data[key]
            }
          }
          const selectedData = {}
          seriesData.forEach(item => {
            selectedData[item.name] = true
          })
          const epmtColor = this.colorMap.default || 'auto'
          // let empItem = {
          //   name: '没有标签的字段',
          //   value: total - totalWithTag,
          //   itemStyle: {
          //     normal: {color: epmtColor},
          //     emphasis: {
          //       color: epmtColor
          //     },
          //   }
          // };
          // seriesData.push(empItem);
          // selectedData[empItem.name] = false;
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
          this.$bus.$emit('security-all', allData)
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
