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
              {{ $t('assets.dashboard.noData') }}
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
// let echartInstance = null
export default {
  data() {
    return {
      datas: null,
      loading: true,
      max: '',
      echartInstance: null,
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
              color: '#555',
            },
          },
          color: ['#4181F1', '#74A2F1', '#A2C1F6', '#D1DFFA', '#E6EFFC'],
          grid: {
            bottom: '10%',
            left: '-20px',
          },
          series: [
            {
              gap: 0,
              name: '漏斗图',
              type: 'funnel',
              width: 320,
              left: 'center',
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
                cursor: 'default',
                formatter: data => {
                  if (data.name === '全部')
                    return `${data.name} ${data.data.values}`
                  if (data.name === '注册')
                    return `${data.name}率 ${data.data.ratio}`
                  if (data.name === '落标')
                    return `${data.name}率 ${data.data.ratio}`
                },
              },
              data: this.datas,
              itemStyle: {
                borderWidth: 0,
              },
              emphasis: {
                disabled: true,
              },
            },
            {
              gap: 0,
              name: '漏斗图',
              type: 'funnel',
              width: 320,
              left: 'center',
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
              emphasis: {
                disabled: true,
              },
            },
          ],
        }
        this.$nextTick(() => {
          const container = this.$refs.echartsCon
          if (container) {
            this.echartInstance = echarts.init(container)
            this.echartInstance.setOption(opt)
          }
        }, 0)
      })
    },
    funnel() {
      this.loading = true
      this.datas = []
      let ary = []
      let maxAry = []
      HTTP.getGuanwangTotalAsset()
        .then(res => {
          ary.push({
            name: '全部',
            values: res.data.conversionFunnel.all,
            value: 3 * 20,
            ratio: '',
            labelLine: {
              lineStyle: {
                width: 1,
                color: '#fff',
                type: 'solid',
              },
            },
          })
          ary.push({
            name: '注册',
            values: res.data.conversionFunnel.reg,
            value: 2 * 20,
            ratio:
              res.data.registrationPct.regY + res.data.registrationPct.regN ===
              0
                ? '0%'
                : (res.data.registrationPct.regY /
                    (res.data.registrationPct.regY +
                      res.data.registrationPct.regN)) *
                    100 +
                  '%',
            labelLine: {
              length: 30, // label拉线的长度根据自己的场景进行设置即可
              lineStyle: {
                width: 1,
                color: '#ddd',
                type: 'solid',
              },
            },
          })
          ary.push({
            name: '落标',
            values: res.data.conversionFunnel.compliance,
            value: 1 * 20,
            ratio:
              res.data.compliancePct.complianceY +
                res.data.compliancePct.complianceN ===
              0
                ? '0%'
                : (res.data.compliancePct.complianceY /
                    (res.data.compliancePct.complianceY +
                      res.data.compliancePct.complianceN)) *
                    100 +
                  '%',
            labelLine: {
              length: 30, // label拉线的长度根据自己的场景进行设置即可
              lineStyle: {
                width: 1,
                color: '#ddd',
                type: 'solid',
              },
            },
          })
          maxAry.push(res.data.conversionFunnel.all)
          maxAry.push(res.data.conversionFunnel.reg)
          maxAry.push(res.data.conversionFunnel.compliance)
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
          return this.$t('assets.dashboard.hotLabel')
        case 'ALL':
          return this.$t('assets.dashboard.allLabel')
        case 'REGISTRY':
          return this.$t('assets.dashboard.registerLabel')
        case 'PUBLISHED':
          return this.$t('assets.dashboard.publishLabel')
      }
    },
    handleResize() {
      if (this.echartInstance) {
        this.$nextTick(() => {
          this.echartInstance.resize()
        })
      } else {
        this.drawEcharts()
      }
    },
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (newVal, oldVal) {
        newVal && this.funnel()
      },
    },
  },
  // mounted() {
  //   this.drawEcharts()
  // },
  mounted() {
    this.funnel()
    $(window).resize(this.handleResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    this.echartInstance && echarts.dispose(this.echartInstance)
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
  /deep/ > div {
    cursor: default !important;
  }
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
