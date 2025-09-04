<template>
  <!--  <div class="top-two" v-loading="loading">-->
  <div class="top-two">
    <p class="titles">
      <i></i>
      数据资产中文完整度
    </p>
    <div :class="'echart-grap'" style="width: 100%"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  props: {
    catalogData: {
      type: Array,
      default: () => {
        return []
      },
    },
    theme: {
      type: String,
      default: 'default',
    },
  },
  mounted() {
    // this.getechars()
    // this.$bus.$on('embeddedDataLoaded', this.getechars)
    $(window).resize(this.drawEcharts)
  },
  data() {
    return {
      datas: [],
      names1: [],
      valuees: [],
      valuees1: null,
      loading: true,
      echartsInstance: null,
      // colorList: ['#9981FF', '#4B30DE', '#1D8EFF', '#36D0FF', '#80C7EF', '#7996B3', '#48DDD7', '#33DD8E', '#95E09B', '#C1A340', '#656565']
      colorList: [
        '#1D8EFF',
        '#4B30DE',
        '#9981FF',
        '#36D0FF',
        '#80C7EF',
        '#7996B3',
        '#48DDD7',
        '#33DD8E',
        '#95E09B',
        '#C1A340',
      ],
    }
  },
  watch: {
    catalogData() {
      this.dataInit()
    },
  },
  beforeDestroy() {
    // this.$bus.$off('embeddedDataLoaded', this.getechars)
  },
  created() {},
  methods: {
    dataInit() {
      this.valuees = []
      this.names1 = []
      // let data = localStorage.getItem('catalog')
      // if (data && this.$utils.isJSON(data)) {
      //   this.datas = JSON.parse(data)
      this.datas = this.catalogData
      for (var i = 0; i < this.datas.length; i++) {
        this.names1.push(this.datas[i].name)
        if (this.datas[i].fieldWithAilse != 0 && this.datas[i].fieldNum != 0) {
          this.valuees.push(
            (
              (this.datas[i].fieldWithAilse / this.datas[i].fieldNum) *
              100
            ).toFixed()
          )
        } else {
          this.valuees.push('0.00')
        }
      }
      this.names1 = this.names1.filter((item, index) => index < 10)
      this.valuees = this.valuees.filter((item, index) => index < 10)
      this.loading = false
      // }
      this.drawEcharts()
    },
    getEs() {
      this.drawEcharts()
    },
    handleThemeChange() {
      this.drawEcharts()
    },
    drawEcharts() {
      let that = this
      var colorlist = JSON.parse(JSON.stringify(that.colorList))
      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init($('.echart-grap')[0])
      }
      let picwidth =
        this.names1.length > 10
          ? Math.ceil(350 / 10)
          : Math.ceil(350 / that.names1.length)
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          formatter: function (params) {
            return params[0].name + ': ' + params[0].value
          },
        },

        // grid: { // 控制图的大小，调整下面这些值就可以，
        // 	x: 3,//控制x轴文字与底部的距离
        //       //  y2: 200 // y2可以控制倾斜的文字狱最右边的距离，放置倾斜的文字超过显示区域
        // 	},
        xAxis: {
          data: this.names1,
          // boundary:false,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            textStyle: {
              color: this.theme === 'dark' ? '#969696' : '#000',
              // color: '#969696',
              // margin:8
              fontSize: '14px',
              fontSamily: 'Avenir',
              fontWeight: 500,
            },
            interval: 0,
            rotate: 45,
          },
        },
        yAxis: {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false },
        },
        // color: ['#36D0FF','#1D8EFF','#8387FF','#3BFFF8'],
        series: [
          {
            name: 'hill',
            type: 'pictorialBar',
            // 位置偏移
            barCategoryGap: '-10%',
            // 图形宽度
            barWidth: picwidth,
            // 图形形状
            symbol: 'path://M150 50 L130 130 L170 130  Z',
            itemStyle: {
              normal: {
                label: {
                  color: '#969696',
                  show: true,
                  position: 'top',
                  formatter: function (val) {
                    if (val.value !== 0) {
                      return val.value + '%'
                    } else {
                      return ''
                    }
                  },
                },
                opacity: 0.9,
                color: function (params) {
                  // switch(params.name) {
                  //   case '渠道':
                  //     return '#9981FF';
                  //   case '参与人':
                  //     return '#1D8EFF';
                  //   case '产品':
                  //     return '#4B30DE';
                  //   case '资讯':
                  //     return '#36D0FF';
                  //   default:
                  //     return colorlist.splice(0,1)
                  // }
                  return colorlist[params.dataIndex]
                },
              },
              emphasis: {
                opacity: 1,
              },
            },
            lable: {
              show: true,
              position: 'inside',
            },
            data: this.valuees,
            z: 10,
          },
        ],
      }
      setTimeout(() => {
        this.echartsInstance.resize()
        this.echartsInstance.setOption(option)
      }, 500)
      window.onresize = function () {
        this.echartsInstance.resize()
      }
    },
  },
  computed: {},
}
</script>

<style lang="scss">
@import './theme/dark.sass';
//@import './theme/default.sass';
@function px2Rem($px, $base-font-size: 16px) {
  @if (unitless($px)) {
    //有无单位
    @return ($px / 19.2) * 1rem;
  } @else if (unit($px) == em) {
    @return $px;
  }
  @return ($px / $base-font-size) * 1rem;
}
.top-two {
  //background: var(--color-primary-darker-home);
  background: $color-primary-darker-home;
  //background: #1d1d1d;
  margin-bottom: px2Rem(20px);
  //height: 40%;
  .echart-grap {
    height: px2Rem(360px);
  }
}
</style>
