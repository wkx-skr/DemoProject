<template>
  <div class="com-container">
    <div class="dev-Active" id="report-container" v-loading="loading">
      <div class="filter-line">
        <span class="component-title">服务调用活跃度</span>
        <div class="operate-panel-dev">
          <el-date-picker
            type="year"
            size="mini"
            placeholder="请选择年"
            v-model="applyMonth"
            :picker-options="pickerOptions"
            @change="changeApplyMonth"
          ></el-date-picker>
        </div>
      </div>
      <div class="echarts-outer">
        <div id="main-Active" ref="devStatistics"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import HTTP from '../ddsHTTP.js'

export default {
  data() {
    return {
      loading: false,
      detailData: null,
      chartData: null,
      devOptions: {},
      applyMonth: '',
      timeNow: +new Date(),
      pickerOptions: {
        disabledDate: this.disabledDate,
      },
      // colors: ["#EF4976", "#F46565", "#DC5DFF", "#DD63AC",  "#E0724C", "#F5DC71", "#9BE9FF", "#3EC5E6", "#9BE9FF", "#3EC5E6", "#4386F5", "#455C7C", "#355C7C"],
      // colors: ['#c23531', "#EF4976", "#DD63AC", "#F5DC71", '#2f4554', "#3EC5E6", '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622'],
    }
  },
  mounted() {
    const yearStart = new Date()
    yearStart.setMonth(0)
    yearStart.setDate(1)
    yearStart.setHours(0, 0, 0)
    this.applyMonth = yearStart.getTime()
    this.getDetailData()

    $(window).resize(this.echartsResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.echartsResize)
  },
  watch: {
    // applyMonth(newVal) {
    //   if (newVal && newVal < +new Date()) {
    //     this.applyMonth = newVal;
    //     this.getDetailData()
    //   }
    // }
  },
  methods: {
    getDetailData() {
      const requestBody = {
        fomTime: this.applyMonth,
      }
      this.loading = true
      HTTP.getCallActive(requestBody)
        .then(res => {
          this.detailData = res.data
          this.dealOptions()
          this.$nextTick(() => {
            this.initChartDate()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.loading = false
        })
    },
    dealOptions() {
      const xAxisData = this.detailData.map(item => {
        return item.fomTime
      })
      const seriesData = this.detailData.map(item => {
        return item.number
      })
      // console.log(seriesData, 'series data')
      // seriesData = {
      //   data: seriesData,
      //
      // }
      this.devOptions = {
        title: {
          text: '',
        },
        tooltip: {
          trigger: 'axis',
        },
        calculable: true,
        grid: {
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: xAxisData && xAxisData.length > 3 ? 45 : 0,
          },
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            barWidth: 30,
            data: seriesData,
            smooth: true,
            type: 'line',
            symbol: 'circle',
            symbolSize: 5,
            sampling: 'average',
            itemStyle: {
              color: '#66D9BA',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#cbf2e7',
                },
                {
                  offset: 1,
                  color: '#fff',
                },
              ]),
            },
          },
        ],
      }
    },

    initChartDate() {
      if (!this.$refs.devStatistics) return
      this.chartData = echarts.init(this.$refs.devStatistics)
      this.chartData.setOption(this.devOptions)
    },
    echartsResize() {
      setTimeout(() => {
        this.chartData.resize()
      }, 500)
    },
    changeApplyMonth(val) {
      if (!val) {
        this.applyMonth = ''
        this.getDetailData()
        return
      }
      this.applyMonth = new Date(val).getTime()
      if (+this.applyMonth > +this.timeNow) {
        this.$message.info('不能选择未来年份，请重新选择！')
      } else {
        this.getDetailData()
      }
    },
    disabledDate(date) {
      return date > new Date().getTime()
    },
  },
}
</script>

<style lang="scss" scoped>
.com-container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
}

.dev-Active {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(201, 228, 229, 0.14);
  border-radius: 4px;
  //border: 1px solid red;
  padding: 16px;

  .filter-line {
    //padding: 16px 16px 0;

    .operate-panel-dev {
      width: 220px;
      margin-top: -2px;
      float: right;
    }

    .component-title {
      display: inline-block;
      border-left: 4px solid #4386f5;
      padding-left: 6px;
      color: #20293b;
      font-size: 15px;
    }
  }

  .echarts-outer {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    //border: 1px solid red;
  }

  #main-Active {
    width: 100%;
    height: 100%;
  }
}
</style>
