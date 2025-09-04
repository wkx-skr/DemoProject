<template>
  <div class="echart-container" v-loading="loading">
    <div class="picTil" v-show="!datas || datas.length === 0">{{ picTil }}</div>
    <template v-if="datas">
      <div
        class="echart-container"
        ref="echartsCon"
        v-show="datas.length !== 0"
      ></div>
      <div class="nodata" v-show="!loading && datas.length === 0">
        <div class="noresults">
          <div class="noresult-img">
            <img src="@/assets/images/search/no-result.svg" alt="" />
            <p>
              {{ $t('meta.DS.tableDetail.noData') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import HTTP from '../../../utils/api'
let echartInstance = null
export default {
  data() {
    return {
      datas: null,
      loading: false,
      max: '',
    }
  },
  props: ['picTil'],
  methods: {
    drawEcharts() {
      this.$nextTick(function () {
        let opt = {
          title: {
            text: this.picTil,
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal',
              color: ' #555',
            },
          },
          color: ['#4181F1', '#74A2F1', '#A2C1F6', '#D1DFFA', '#E6EFFC'],
          grid: {
            bottom: '10%',
          },
          series: [
            {
              gap: 0,
              name: '漏斗图',
              type: 'funnel',
              width: 320,
              right: '10%',
              top: '20%',
              bottom: '10%',
              min: 0,
              max: 80,
              minSize: '30%',
              maxSize: '100%',
              label: {
                show: true,
                fontSize: 12,
                color: '#555555',
                formatter: data => {
                  let names = ''
                  data.name === '注册'
                    ? (names = '注册率')
                    : data.name === '发布'
                    ? (names = '发布率')
                    : data.name === '热门'
                    ? (names = '访问率')
                    : ''
                  return `${names} ${data.data.ratio}`
                },
              },
              // labelLine: {
              //   length: 30, // label拉线的长度根据自己的场景进行设置即可
              //   lineStyle: {
              //     width: 1,
              //     color: '#ddd',
              //     type: 'solid',
              //   },
              // },
              data: this.datas,
              itemStyle: {
                borderWidth: 0,
              },
            },
            {
              gap: 0,
              name: '漏斗图',
              type: 'funnel',
              width: 320,
              right: '10%',
              top: '20%',
              bottom: '10%',
              min: 0,
              max: 80,
              minSize: '30%',
              maxSize: '100%',
              label: {
                show: true,
                position: 'inside',
                formatter: data => {
                  if (data.dataIndex <= 1) {
                    return `{a|${data.name}   ${data.data.values}}`
                  } else {
                    return `{b|${data.name}   ${data.data.values}}`
                  }
                },
                rich: {
                  a: {
                    color: ' #fff',
                  },
                  b: {
                    color: '#1763E8',
                  },
                },
              },
              data: this.datas,
              itemStyle: {
                borderWidth: 0,
              },
            },
          ],
        }
        this.$nextTick(() => {
          const container = this.$refs.echartsCon
          if (container) {
            echartInstance = echarts.init(container)
            echartInstance.setOption(opt)
          }
        }, 0)
      })
    },
    funnel(id) {
      this.loading = true
      this.datas = []
      let ary = []
      let maxAry = []
      id &&
        HTTP.funnel(id)
          .then(res => {
            res.data.data.reverse().forEach((item, index) => {
              ary.push({
                name: this.dashboardType(item.statisticsRange),
                values: item.assetsNums,
                value: (index + 1) * 20,
                ratio:
                  item.ratio === null || item.ratio === '0%' ? '' : item.ratio,
                labelLine:
                  item.statisticsRange === 'ALL'
                    ? {
                        lineStyle: {
                          width: 1,
                          color: '#fff',
                          type: 'solid',
                        },
                      }
                    : {
                        length: 30, // label拉线的长度根据自己的场景进行设置即可
                        lineStyle: {
                          width: 1,
                          color: '#ddd',
                          type: 'solid',
                        },
                      },
              })
              maxAry.push(item.assetsNums)
            })
            this.datas = ary
            this.max = Math.max(maxAry)
            if (this.datas.length !== 0) {
              this.drawEcharts()
            }
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
    },
    dashboardType(val) {
      switch (val) {
        case 'HOT':
          return '热门'
        case 'ALL':
          return '全部'
        case 'REGISTRY':
          return '注册'
        case 'PUBLISHED':
          return '发布'
      }
    },
    handleResize() {
      if (echartInstance) {
        this.$nextTick(() => {
          echartInstance.resize()
        })
      } else {
        this.drawEcharts()
      }
    },
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (newVal, oldVal) {
        newVal && this.funnel(newVal)
      },
    },
  },
  // mounted() {
  //   this.drawEcharts()
  // },
  mounted() {
    this.$store.state.structureIdChange &&
      this.funnel(this.$store.state.structureIdChange)
    $(window).resize(this.handleResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    echartInstance && echarts.dispose(echartInstance)
  },
}
</script>

<style scoped lang="scss">
.picTil {
  font-size: 14px;
  color: #555;
}
.echart-container {
  width: 100%;
  height: 98%;
}
.nodata {
  width: 100%;
  height: 98%;
  display: flex;
  align-items: center;
}
.noresults {
  margin: 20px auto 0;
  text-align: center;
  .noresult-img {
    flex-direction: column;
  }
  p {
    display: block;
  }
}
</style>
