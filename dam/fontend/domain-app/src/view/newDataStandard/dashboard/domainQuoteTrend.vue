<template>
  <div class="dashboard-item">
    <title-line
      :title-text="$t('domain.dashboard.lastYearDomainPublishedTrend')"
    ></title-line>
    <div class="bottom-container" v-loading="loading">
      <div class="echarts-outer" ref="echartsContainer"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import moment from 'moment'
import titleLine from './titleLine'
import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'

export default {
  name: 'domainQuoteTrend',
  data() {
    return {
      loading: false,
      echartsInstance: null,
      getOrganizations: null,
      getCount: null,
    }
  },
  components: {
    titleLine,
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.loading = true
      // const getCount = HTTP.dashboardDomainCount()
      const getCount = HTTP.getDomainPublicCount()
      if (!this.getCount) {
        this.getCount = getCount
      }
      getCount
        .then(res => {
          let data = res.data
          this.drawEcharts(this.getEchartsOptions(data))
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getEchartsOptions(data) {
      let monthArr = []
      let countArr = []
      // console.log(data, 'data')
      data = data.data
      let dataMap = {}
      // console.log(data, 'data')
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          dataMap[`${item.year}-${item.month}`] = item.count
          // monthArr.push(`${item.year}-${item.month}`)
          // countArr.push(item.count)
        })
      }
      // console.log(dataMap, 'dataMap')

      let now = moment()
      for (let i = 0, len = 12; i < len; i++) {
        let monthName = now.format('YYYY-M')
        monthArr.unshift(monthName)
        now = now.subtract(1, 'months')
        countArr.unshift(dataMap[monthName] || 0)
      }
      const self = this
      let result = {}
      result = {
        xAxis: {
          data: monthArr,
          // boundaryGap: true,
          axisLabel: {
            interval: 0,
            fontSize: 11,
            rotate: 60,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          // formatter: 'time：{b}<br/>domainCount：{c}',
          formatter: function (params, ticket, callback) {
            let value = nUtils.insertComma((params[0] || {}).value || 0)
            return `${self.$t('domain.dashboard.time')}：${
              (params[0] || {}).axisValue || ''
            }<br>${self.$t('domain.dashboard.domainCountValue')}：${value}`
          },
        },
        yAxis: {
          type: 'value',
          name: this.$t('domain.dashboard.domainCountValue'),
          position: 'left',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#777',
            },
          },
        },
        series: [
          {
            data: countArr,
            type: 'line',
            lineStyle: {
              color: '#40C8E0',
              shadowColor: 'rgba(64, 200, 224, 0.8)',
              shadowOffsetY: '-10px',
              shadowBlur: 10,
            },
            itemStyle: {
              color: '#fff',
              borderColor: '#40C8E0',
            },
            areaStyle: {
              // color: '#40C8E0',
              // opacity: 0.5,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#40C8E0', // color for 0%
                  },
                  {
                    offset: 1,
                    color: '#fff', // color for 100%
                  },
                ],
                global: false, // default false
              },
            },
            smooth: true,
          },
        ],
      }
      // console.log(result, 'result')
      return result
    },
    drawEcharts(options) {
      if (!this.$refs.echartsContainer) return
      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init(this.$refs.echartsContainer)
      }
      this.echartsInstance.setOption(options)
    },
  },
  beforeDestroy() {
    this.echartsInstance && this.echartsInstance.dispose()
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.dashboard-item {
  background-color: #fff;
  position: relative;

  .bottom-container {
    @include absPos();
    top: 47px;

    .echarts-outer {
      @include absPos();
      //border: 1px solid red;
    }
  }
}
</style>
