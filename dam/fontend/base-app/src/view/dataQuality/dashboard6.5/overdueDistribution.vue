<template>
  <!-- 逾期分布 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.overdueDistribution') }}</p>
    </div>
    <div class="switch-tab">
      <div
        class="tabType"
        :class="{ tabTypeActive: tabTypeSelectActive === 1 }"
        @click="tabTypeSelect(1)"
      >
        <p>{{ $t('quality.page.qualityDashboardNew.organization') }}</p>
      </div>
      <div
        class="tabType"
        :class="{ tabTypeActive: tabTypeSelectActive === 2 }"
        @click="tabTypeSelect(2)"
      >
        <p>{{ $t('quality.page.qualityDashboardNew.system') }}</p>
      </div>
    </div>
    <div
      id="overdueDistribution"
      v-if="tabTypeSelectActive === 1"
      style="width: 100%; height: 246px; margin-top: 10px"
    ></div>
    <div
      id="overdueDistribution2"
      v-if="tabTypeSelectActive === 2"
      style="width: 100%; height: 246px; margin-top: 10px"
    ></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  name: 'overdueDistribution',
  components: {},
  data() {
    return {
      myChart: null,
      myChart2: null,
      tabTypeSelectActive: 1,
      orgData: [],
      orgLabel: [],
      sysLabel: [],
      sysData: [],
    }
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
    this.myChart && this.myChart.dispose()
    this.myChart2 && this.myChart2.dispose()
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.handleData(data)
    })
  },
  methods: {
    handleData(data) {
      let orgData = []
      let sysData = []
      let orgLabel = []
      let sysLabel = []
      if (Array.isArray(data?.detailDataOrg) && data.detailDataOrg.length) {
        data.detailDataOrg.forEach(o => {
          orgLabel.push(o.groupName)
          orgData.push(o.overProblemNum)
        })
        this.orgLabel = orgLabel
        this.orgData = orgData
      } else {
        this.orgLabel = []
        this.orgData = []
      }
      if (
        Array.isArray(data?.detailDataCategory) &&
        data.detailDataCategory.length
      ) {
        data.detailDataCategory.forEach(d => {
          sysLabel.push(d.groupName)
          sysData.push(d.overProblemNum)
        })
        this.sysLabel = sysLabel
        this.sysData = sysData
      } else {
        this.sysLabel = []
        this.sysData = []
      }
      this.dataInit()
    },
    tabTypeSelect(type) {
      this.tabTypeSelectActive = type
      if (type === 1) {
        this.$nextTick(() => {
          this.dataInit()
        })
      } else {
        this.$nextTick(() => {
          this.dataInit2()
        })
      }
    },
    dataInit() {
      this.myChart && this.myChart.clear()
      this.myChart = echarts.init(
        document.getElementById('overdueDistribution')
      )
      var option = {
        grid: {
          left: '8%',
          //   right: "2%",
          bottom: 60,
          top: '12%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#333333',
          extraCssText:
            'box-shadow: 0px 2px 6px 0px rgba(178,178,178,0.32);border-radius: 4px;max-width:320px;height:auto;white-space: normal; word-break: break-all;',
          formatter: function (params) {
            // params[0].name表示x轴数据
            let str = params[0].name + '<br/>'
            // params是数组格式

            for (let item of params) {
              // 设置浮层图形的样式跟随图中展示的颜色
              if (item.componentSubType === 'bar') {
                str +=
                  "<div style='font-size:12px'>" +
                  "<p style='display:inline-block;width:10px;height:10px;border-radius:2px;background-color:" +
                  item.color +
                  ";'></p>" +
                  '\t' +
                  item.seriesName +
                  ' : ' +
                  item.value +
                  '</div>'
              } else {
                str +=
                  "<div style='font-size:12px'>" +
                  // "<p style='display:inline-block;width:10px;height:10px;border-radius:10px;background-color:" +
                  // item.color +
                  // ";'></p>" +
                  "<p class='echarts-org-legend' ></p>" +
                  '\t' +
                  item.seriesName +
                  ' : ' +
                  item.value +
                  '</div>'
              }
            }
            return str
          },
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          axisPointer: {
            lineStyle: {
              type: 'solid',
            },
            z: 10,
          },
        },
        legend: {
          top: '0',
          right: '2%',
          itemWidth: 24,
          itemHeight: 8,
          data: [
            {
              name: this.$t('quality.page.qualityDashboardNew.organizationNum'),
              icon: 'path://M12,5 C13.8639271,5 15.4300871,6.27489272 15.8740452,8.00024347 L24,8 L24,10 L15.8737865,10.0007613 C15.429479,11.7256022 13.8635652,13 12,13 C10.1364348,13 8.57052105,11.7256022 8.12621352,10.0007613 L0,10 L0,8 L8.12595483,8.00024347 C8.56991294,6.27489272 10.1360729,5 12,5 Z M12,7 C10.8954305,7 10,7.8954305 10,9 C10,10.1045695 10.8954305,11 12,11 C13.1045695,11 14,10.1045695 14,9 C14,7.8954305 13.1045695,7 12,7 Z',
            },
          ],
          textStyle: {
            color: '#555555',
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: [],
          show: true,
          axisLabel: {
            // show: true,
            interval: 0,
            fontSize: 11,
            rotate: 30,
            width: 50,
            // color: 'red',
            overflow: 'truncate',
            ellipsis: '...',
            formatter: function (value) {
              if (value.length > 6) {
                return `${value.slice(0, 6)}...`
              }
              return value
            },
            textStyle: {
              color: '#555555',
              fontSize: 12,
            },
          },
          axisLine: {
            lineStyle: {
              color: '#EFEFEF',
            },
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: this.$t('quality.page.qualityDashboardNew.unitPiece'),
            nameTextStyle: {
              color: '#999999',
              fontSize: 12,
            },
            // min: 0,
            // interval: 50,
            axisLabel: {
              formatter: '{value} ',
              textStyle: {
                color: '#999999',
                fontSize: 12,
              },
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#EFEFEF',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'transparent',
                // type: 'dashed',
              },
            },
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            height: 12,
          },
          {
            type: 'slider',
            height: 12,
            bottom: 10,
            textStyle: {
              color: 'transparent',
            },
          },
        ],
        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.organizationNum'),
            type: 'line',
            smooth: true, // 平滑曲线
            // showSymbol: false,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              },
            },
            data: [],
            itemStyle: {
              color: '#3AD1BF',
            },
            lineStyle: {
              width: 2,
              color: '#3AD1BF',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(58,209,191,0.1)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(58,209,191,0)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            barWidth: '16',
          },
        ],
      }
      this.$set(option.xAxis, 'data', this.orgLabel)
      this.$set(option.series[0], 'data', this.orgData)
      this.myChart.setOption(option)
    },
    dataInit2() {
      this.myChart2 && this.myChart2.clear()
      this.myChart2 = echarts.init(
        document.getElementById('overdueDistribution2')
      )
      var option = {
        grid: {
          left: '8%',
          //   right: "2%",
          bottom: 60,
          top: '12%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#333333',
          extraCssText:
            'box-shadow: 0px 2px 6px 0px rgba(178,178,178,0.32);border-radius: 4px;max-width:320px;height:auto;white-space: normal; word-break: break-all;',
          formatter: function (params) {
            // params[0].name表示x轴数据
            let str = params[0].name + '<br/>'
            // params是数组格式

            for (let item of params) {
              // 设置浮层图形的样式跟随图中展示的颜色
              if (item.componentSubType === 'bar') {
                str +=
                  "<div style='font-size:12px'>" +
                  "<p style='display:inline-block;width:10px;height:10px;margin-right:4px;border-radius:2px;background-color:" +
                  item.color +
                  ";'></p>" +
                  '\t' +
                  item.seriesName +
                  ' : ' +
                  item.value +
                  '</div>'
              } else {
                str +=
                  "<div style='font-size:12px'>" +
                  "<p style='display:inline-block;width:10px;height:10px;border-radius:10px;background-color:" +
                  item.color +
                  ";'></p>" +
                  '\t' +
                  item.seriesName +
                  ' : ' +
                  item.value +
                  '%</div>'
              }
            }
            return str
          },
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          axisPointer: {
            lineStyle: {
              type: 'solid',
            },
            z: 10,
          },
        },
        legend: {
          top: '0',
          right: '2%',
          itemWidth: 10,
          itemHeight: 10,
          data: [
            this.$t('quality.page.qualityDashboardNew.systemIssuesNum'),
            this.$t('quality.page.qualityDashboardNew.organizationNum'),
          ],
          textStyle: {
            color: '#555555',
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: [],
          show: true,
          axisLabel: {
            // show: true,
            interval: 0,
            fontSize: 11,
            rotate: 30,
            width: 50,
            // color: 'red',
            overflow: 'truncate',
            ellipsis: '...',
            formatter: function (value) {
              if (value.length > 6) {
                return `${value.slice(0, 6)}...`
              }
              return value
            },
            textStyle: {
              color: '#555555',
              fontSize: 12,
            },
          },
          axisLine: {
            lineStyle: {
              color: '#EFEFEF',
            },
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: this.$t('quality.page.qualityDashboardNew.unitPieces'),
            nameTextStyle: {
              color: '#999999',
              fontSize: 12,
            },
            // min: 0,
            // interval: 50,
            axisLabel: {
              formatter: '{value} ',
              textStyle: {
                color: '#999999',
                fontSize: 12,
              },
            },
            axisLine: {
              lineStyle: {
                color: '#EFEFEF',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'transparent',
                // type: 'dashed',
              },
            },
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            height: 12,
          },
          {
            type: 'slider',
            height: 12,
            bottom: 10,
            textStyle: {
              color: 'transparent',
            },
          },
        ],
        series: [
          {
            name: this.$t('quality.page.qualityDashboardNew.systemIssuesNum'),
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              },
            },
            data: [],
            itemStyle: {
              normal: {
                color: '#7582E5',
                borderColor: '#fff',
              },
            },
            barWidth: '16',
          },
        ],
      }
      this.$set(option.xAxis, 'data', this.sysLabel)
      this.$set(option.series[0], 'data', this.sysData)
      this.myChart2.setOption(option)
    },
  },
}
</script>
<style lang="scss">
.echarts-org-legend {
  display: inline-block;
  width: 24px;
  height: 8px;
  background: url(./img/green.svg) no-repeat center;
  background-size: 100% auto;
  margin-right: 4px;
}
</style>
<style scoped lang="scss">
@import './public.scss';

.box {
  background: var(--default-bgc);
}
</style>
