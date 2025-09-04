<template>
  <div class="dashboard-item">
    <title-line
      :title-text="`${$t('domain.dashboard.domainGroupByDepartment')} TOP10`"
    ></title-line>
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
  name: 'departmentDomainCount',
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
      const getOrganizations = HTTP.getAllOrganizations()
      if (!this.getOrganizations) {
        this.getOrganizations = getOrganizations
      }
      const getCount = HTTP.dashboardDomainCount()
      if (!this.getCount) {
        this.getCount = getCount
      }
      const promisesArr = []
      promisesArr.push(getOrganizations, getCount)
      Promise.all(promisesArr)
        .then(res => {
          let [organizations, count] = res
          this.drawEcharts(
            this.getEchartsOptions(organizations.data, count.data)
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getEchartsOptions(organizations, count) {
      // console.log(organizations, 'organizations')
      let organizationsMap = {}
      if (organizations && Array.isArray(organizations)) {
        organizations.forEach(organization => {
          organizationsMap[organization.bm] = organization
        })
      }
      let departmentCount = count.departmentCount
      let xAxisData = []
      let seriesData = []
      let sortData = []
      Object.keys(departmentCount).forEach(department => {
        let depart = organizationsMap[department]
        // console.log(depart, 'depart')
        let obj = {
          department: depart ? depart.fullName : department,
          count: departmentCount[department],
        }
        sortData.push(obj)
      })
      sortData.sort((a, b) => b.count - a.count)
      sortData = sortData.slice(0, 10)
      sortData.forEach(item => {
        xAxisData.push(item.department)
        seriesData.push(item.count)
      })
      let result = {}
      const self = this
      result = {
        xAxis: {
          // data: ['A', 'B', 'C', 'D', 'E'],
          data: xAxisData,
          axisLabel: {
            interval: 0,
            fontSize: 11,
            rotate: 60,
            formatter: function (value, index) {
              return value.length > 4 ? value.slice(0, 4) + '...' : value
            },
          },
        },
        yAxis: {
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
        tooltip: {
          trigger: 'axis',
          formatter: function (params, ticket, callback) {
            let value = nUtils.insertComma((params[0] || {}).value || 0)
            return `${self.$t('domain.common.department')}：${
              (params[0] || {}).axisValue || ''
            }<br>${self.$t('domain.dashboard.domainCount')}：${value}`
          },
        },
        series: [
          {
            type: 'bar',
            data: seriesData,
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
            backgroundColor: {
              // color: '#409EFF',
            },
          },
        ],
      }
      return result
    },
    drawEcharts(options) {
      if (!this.$refs.echartsContainer) return
      // console.log(options, 'options')
      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init(this.$refs.echartsContainer)
      }
      this.echartsInstance.setOption(options)
      this.echartsInstance.on('click', this.echartsClick)
    },
    echartsClick(params) {
      if (!this.$versionFeature.domain_Statistics) {
        return
      }
      let para = {
        name: 'queryStandard',
        query: { departmentValue: params.name, activeName: 'department' },
      }
      this.$skip2(para)
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
