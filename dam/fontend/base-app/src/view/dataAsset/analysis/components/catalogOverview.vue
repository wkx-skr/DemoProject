<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <!--    资产目录概览(CatalogOverview)-->
    <div class="title" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.catalogOverview')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.catalogOverview') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.catalogOverview') }} -->
    </div>
    <template v-if="datas">
      <div class="echart-container" v-show="datas.length !== 0">
        <div class="echart-container" ref="echartsCon"></div>
        <!-- <div class="views">{{ $t('assets.dashboard.views') }}</div> -->
      </div>
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
import HTTP from '../../utils/api'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
let echartInstance = null
export default {
  name: 'CatalogOverview',
  components: { isShowTooltip },
  data() {
    return {
      datas: null,
      loading: false,
      color: [
        'rgba(66,76,223,0.8)',
        'rgba(65,129,241,0.8)',
        'rgba(64,158,255,0.8)',
        'rgba(91,184,255,0.8)',
        'rgba(146,204,118,0.8)',
        'rgba(181,204,118,0.8)',
        'rgba(181,204,118,0.8)',
        'rgba(250,200,88,0.8)',
        'rgba(255,171,50,0.8)',
        'rgba(255,134,50,0.8)',
        'rgba(255,104,0,0.8)',
        'rgba(255,46,46,0.8)',
      ],
      source: [],
      structureIdChange: this.$store.state.structureIdChange,
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.assetCatalogOverview(val)
      },
    },
  },
  methods: {
    drawEcharts() {
      let pieces = []
      this.source.forEach((item, index) => {
        pieces.push({
          data: [item],
          type: 'scatter',
          symbolSize: 20,
          itemStyle: { color: this.color[index] || this.color[0] },
        })
      })
      let opt = {
        legend: { show: false },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
              type: 'solid',
            },
          },
          formatter: param => {
            return `${param.data[2]}<br> ${this.$t(
              'assets.dashboard.views'
            )}：${param.data[0]}<br> ${this.$t('assets.dashboard.number')}：${
              param.data[1]
            }`
          },
        },
        xAxis: {
          name: '访问量',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          name: this.$t('assets.dashboard.number'),
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: { type: 'dashed' },
          },
          axisLabel: {
            formatter: '{value}',
          },
        },
        grid: {
          top: 40,
          left: 30,
          right: 52,
          bottom: 35,
        },
        series: pieces,
      }
      this.$nextTick(() => {
        const container = this.$refs.echartsCon
        if (container) {
          echartInstance = echarts.init(container)
          echartInstance.setOption(opt)
        }
        // container && echarts.init(container).setOption(opt)
      }, 0)
    },
    assetCatalogOverview(id) {
      this.loading = true
      let ary = []
      this.datas = []
      id &&
        HTTP.assetCatalogOverview(id)
          .then(res => {
            this.datas = res.data.data || []
            res.data.data.forEach(item => {
              ary.push([item.visitCount, item.count, item.catalogName])
            })
            this.source = ary
            if (this.datas.length !== 0) {
              this.drawEcharts()
            }
            this.loading = false
          })
          .catch(e => {
            this.loading = false
            this.$showFailure(e)
          })
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
  // mounted() {
  //   // this.drawEcharts()
  //   this.assetCatalogOverview()
  // },
  mounted() {
    this.$store.state.structureIdChange &&
      this.assetCatalogOverview(this.$store.state.structureIdChange)
    $(window).resize(this.handleResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    echartInstance && echarts.dispose(echartInstance)
  },
}
</script>

<style scoped lang="scss">
.picBox {
  width: 100%;
  height: 100%;
  padding: 16px;
}
.echart-container {
  width: 100%;
  height: 98%;
}
.title {
  font-size: 14px;
  color: #555;
  span {
    font-size: 12px;
  }
}
.nodata {
  width: 100%;
  height: 100%;
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
.views {
  position: absolute;
  bottom: 46px;
  right: 15px;
}
</style>
