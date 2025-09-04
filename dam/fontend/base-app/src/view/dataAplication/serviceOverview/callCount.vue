<template>
  <div class="com-container">
    <div class="dev-container" id="report-container" v-loading="loading">
      <div class="filter-line">
        <span class="component-title">按应用组统计月度服务调用次数</span>
        <div class="operate-panel-dev">
          <el-date-picker
            type="month"
            size="mini"
            placeholder="请选择年月"
            v-model="applyMonth"
            @change="changeApplyMonth"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </div>
      </div>
      <div class="echarts-outer">
        <div id="main-report" ref="devStatistics"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import HTTP from '../ddsHTTP.js'

require('echarts/theme/macarons')
export default {
  data() {
    return {
      loading: false,
      detailData: null,
      chartData: null,
      devOptions: {},
      applyMonth: +new Date(),
      timeNow: +new Date(),
      pickerOptions: {
        disabledDate: this.disabledDate,
      },
      // colors: ["#EF4976", "#F46565", "#DC5DFF", "#DD63AC",  "#E0724C", "#F5DC71", "#9BE9FF", "#3EC5E6", "#9BE9FF", "#3EC5E6", "#4386F5", "#455C7C", "#355C7C"],
      // colors: ['#c23531', "#EF4976", "#DD63AC", "#F5DC71", '#2f4554', "#3EC5E6", '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622'],
    }
  },
  mounted() {
    this.getDetailData()

    $(window).resize(this.echartsResize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.echartsResize)
  },
  watch: {
    applyMonth(newVal) {
      if (newVal && newVal < +new Date()) {
        this.applyMonth = newVal
        this.getDetailData()
      }
    },
  },
  methods: {
    getDetailData() {
      const requestBody = {
        time: this.applyMonth ? this.applyMonth : this.timeNow,
      }
      const timeSearch = new Date(requestBody.time).getTime()
      this.loading = true
      HTTP.getcallCount(timeSearch)
        .then(res => {
          this.loading = false
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
      const xAxisData = Object.keys(this.detailData)
      const seriesData = Object.values(this.detailData)
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
            formatter: function (value, index) {
              return value.length > 6 ? value.substring(0, 4) + '...' : value
            },
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
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4386F5' },
                { offset: 0.1, color: '#4386F5' },
                { offset: 1, color: '#aac5f2' },
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
      this.applyMonth = new Date(val).getTime()
      if (+this.applyMonth > +this.timeNow) {
        this.$message.info('不能选择未来月份，请重新选择！')
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

.dev-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(201, 228, 229, 0.14);
  border-radius: 4px;
  //border: 1px solid red;
  padding: 16px;

  .filter-line {
    //padding: 15px 20px 0;

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
  }

  #main-report {
    width: 100%;
    height: 100%;
    //border: 1px solid red;
  }
}
</style>
