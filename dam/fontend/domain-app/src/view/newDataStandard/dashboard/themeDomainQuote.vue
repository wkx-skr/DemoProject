<template>
  <div class="dashboard-item">
    <title-line
      :title-text="`${$t(
        'domain.dashboard.domainImportAnalysisByTheme'
      )} TOP20`"
    >
      <div class="system-selector-container">
        <datablau-select
          size="mini"
          v-model="sortAttribute"
          @change="changeSortAttribute"
          filterable
          :placeholder="$t('domain.common.chooseSortField')"
          clearable
          class="system-selector"
        >
          <el-option
            v-for="item in this.sortTypes"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
      </div>
    </title-line>
    <div class="bottom-container" v-loading="loading">
      <div class="echarts-outer" ref="echartsContainer"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import titleLine from './titleLine'
import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'

export default {
  name: 'themeDomainQuote',
  data() {
    return {
      loading: false,
      echartsInstance: null,
      getCount: null,
      allData: null,
      systemValue: '',
      systemsArr: [],
      sortAttribute: 'all',
      sortTypes: [
        { value: 'all', label: this.$t('domain.dashboard.sortByPublished') },
        { value: 'used', label: this.$t('domain.dashboard.sortByImportCount') },
        { value: 'rate', label: this.$t('domain.dashboard.sortByImportRate') },
      ],
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
      const getCount = HTTP.dashboardDomainCount()
      if (!this.getCount) {
        this.getCount = getCount
      }

      getCount
        .then(res => {
          const allData = res.data
          this.allData = allData
          this.drawEcharts(this.getEchartsOptions(allData))
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getEchartsOptions(count, system) {
      const all = this.$t('domain.common.all')
      if (!_.trim(system)) {
        system = all
      }
      this.systemsArr = Object.keys(count.themeDtoMap).filter(
        item => item !== 'all_domain_count'
      )
      this.systemsArr.unshift(all)

      let themeDtoMap = count.themeDtoMap

      let allData = themeDtoMap.all_domain_count.map(item => item.all)
      let data = themeDtoMap.all_domain_count || []
      let dataArr = []
      if (data && Array.isArray(data)) {
        data.forEach((item, index) => {
          let percentDataItem =
            item.all && item.all !== 0 ? item.used / item.all : 0
          let obj = {
            xAxisData: item.theme,
            unUsedData: item.all - item.used,
            usedData: item.used,
            all: item.all,
            percentData: percentDataItem,
          }
          dataArr.push(obj)
        })
      }

      let sortAttribute = this.sortAttribute
      dataArr.sort((a, b) => {
        if (sortAttribute === 'all') {
          return b.all - a.all
        } else if (sortAttribute === 'rate') {
          return b.percentData - a.percentData
        } else {
          return b.usedData - a.usedData
        }
      })
      dataArr = dataArr.slice(0, 20)

      let xAxisData = dataArr.map(item => item.xAxisData)
      let usedData = dataArr.map(item => item.usedData)
      let percentData = dataArr.map(item =>
        nUtils.value2percent(item.percentData * 100)
      )
      allData = dataArr.map(item => item.all)

      let result = {
        xAxis: {
          data: xAxisData,
          axisTick: {
            interval: 0,
          },

          axisLine: {
            // lineStyle: {
            //   color: 'red'
            // }
          },
          axisLabel: {
            interval: 0,
            fontSize: 11,
            rotate: 60,
            formatter: function (value, index) {
              return value.length > 4 ? value.slice(0, 4) + '...' : value
            },
          },
        },
        yAxis: [
          {
            type: 'value',
            name: this.$t('domain.dashboard.domainCount'),
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#777',
              },
            },
          },
          {
            type: 'value',
            name: this.$t('domain.dashboard.matchRate'),
            min: 0,
            max: 100,
            // splitNumber: 10,
            position: 'right',
            splitLine: {
              show: false,
            },
            axisLabel: {
              formatter: '{value}%',
            },
            axisLine: {
              lineStyle: {
                color: '#777',
              },
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          // formatter: '{b1}<br/>{a0}：{c0}<br/>{a1}：{c1}<br/>{a2}：{c2}%',
          formatter: function (params, ticket, callback) {
            let str = (params[0] || {}).axisValue || ''
            params.forEach((item, index) => {
              let value =
                index > 1 ? item.value + '%' : nUtils.insertComma(item.value)
              str += `<br/>${item.seriesName}：${value}`
            })
            return str
          },
        },
        legend: {
          show: true,
          top: 20,

          lineStyle: {
            color: '#40C8E0',
          },
          // 40C8E0
        },
        grid: {
          bottom: 80,
          // borderColor: 'red'
        },
        series: [
          {
            data: usedData,
            name: this.$t('domain.dashboard.domainImportCount'),
            type: 'bar',
            yAxisIndex: 0,
            stack: 'x',
            barWidth: '16',
            itemStyle: {
              // barBorderRadius: 5,
              borderWidth: 1,
              borderType: 'solid',
              color: '#409EFF',
              // borderColor: '#73c0de',
              // shadowColor: '#5470c6',
              // shadowBlur: 3,
              barBorderRadius: [5, 5, 0, 0],
            },
          },
          {
            data: allData,
            name: this.$t('domain.dashboard.publishedDomainCount'),
            type: 'bar',
            stack: 'x',
            yAxisIndex: 0,
            barWidth: '16',
            itemStyle: {
              // barBorderRadius: 5,
              borderWidth: 1,
              borderType: 'solid',
              color: 'rgba(215, 237, 255, 1)',
              // borderColor: '#73c0de',
              // shadowColor: '#5470c6',
              // shadowBlur: 3,
              barBorderRadius: [5, 5, 0, 0],
            },
          },
          {
            data: percentData,
            name: this.$t('domain.dashboard.matchRate'),
            yAxisIndex: 1,
            type: 'line',
            legendHoverLink: true,
            smooth: true,
            lineStyle: {
              color: '#40C8E0',
              shadowColor: 'rgba(64, 200, 224, 0.8)',
              shadowOffsetY: 3,
              shadowBlur: 6,
            },
            itemStyle: {
              color: '#40C8E0',
              borderColor: '#40C8E0',
            },
            tooltip: {
              format: '{c}%',
            },
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
      // console.log('setOption', options)
      this.echartsInstance.setOption(options)
      this.echartsInstance.on('click', this.echartsClick)
    },
    echartsClick(params) {
      if (!this.$versionFeature.domain_Statistics) {
        return
      }
      let para = {
        name: 'queryStandard',
        query: { themeValue: params.name },
      }
      this.$skip2(para)
    },
    changeSystem(newVal) {
      this.drawEcharts(this.getEchartsOptions(this.allData, newVal))
    },
    changeSortAttribute() {
      this.drawEcharts(this.getEchartsOptions(this.allData))
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

    .system-selector-container {
      border: 1px solid red;
      width: 300px;
      position: relative;
      z-index: 2;

      .system-selector {
        display: inline-block;
      }
    }

    .echarts-outer {
      @include absPos();
      //border: 1px solid red;
    }
  }
}
</style>
