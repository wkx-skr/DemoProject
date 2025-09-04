<template>
  <!--  <div class="top-one" v-loading="loading">-->
  <div class="top-one">
    <p class="titles">
      <i></i>
      数据资产表数量统计
    </p>
    <div :class="'echart-graph'" @click="skip2"></div>
    <div
      class="link-mask"
      @click="skip2('fourSubject')"
      :style="{
        cursor: 'pointer',
        backgroundColor: 'transparent',
        width: '100px',
        height: dataBas.length * 23 + 'px',
        position: 'absolute',
        right: '0px',
        top: '40px',
        zIndex: 999,
      }"
    ></div>
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
    // this.dataInit()
    $(window).resize(this.drawEcharts)
    // this.$bus.$on('embeddedDataLoaded', this.dataInit)
  },
  data() {
    return {
      datas: [],
      dataBas: [],
      loading: true,
      echart: null,
    }
  },
  watch: {
    catalogData() {
      this.dataInit()
    },
  },
  beforeDestroy() {
    // this.$bus.$off('embeddedDataLoaded', this.dataInit)
  },
  methods: {
    dataInit() {
      // let data = localStorage.getItem('catalog')
      // if (data && this.$utils.isJSON(data)) {
      // this.datas = JSON.parse(data)
      this.datas = this.catalogData
      this.datas = this.datas.filter((item, index) => index < 10)
      let obj = {}
      let arr = []
      for (var i = 0; i < this.datas.length; i++) {
        obj = {
          name: this.datas[i].name,
          value: this.datas[i].tableNum,
        }
        arr.push(obj)
      }
      this.dataBas = arr
      this.loading = false
      // }
      this.drawEcharts()
    },
    skip2(target = 'fourSubject') {
      return
      console.log(target)
      if (target === 'fourSubject') {
        this.$router.push({
          name: 'embeddedModule',
          query: {
            currentNav: 'fourSubject',
          },
        })
      }
    },
    getEs() {
      // console.log(this.value);
      this.drawEcharts()
      this.eventClick()
    },
    handleThemeChange() {
      this.drawEcharts()
    },
    drawEcharts() {
      let option_quality = {
        color: [
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
        tooltip: {
          trigger: 'item',
          show: false,
        },

        legend: {
          // x: "center",
          // y: "bottom",
          top: '2px',
          left: '70%',
          right: '20px',
          orient: 'vertical',
          align: 'left',
          padding: [0, 0, 0, 10],
          itemWidth: 14,
          itemHeight: 14,
          selectedMode: false,
          textStyle: {
            // 图例文字的样式
            color: this.theme === 'dark' ? '#969696' : '#000',
            // color: '#969696',
            fontSize: 12,
          },
        },

        series: [
          {
            type: 'pie',
            startAngle: 100,
            radius: ['69%', '78%'],
            center: ['35%', '48%'],
            avoidLabelOverlap: false,
            legendHoverLink: false,
            label: {
              show: false,
              position: 'center',
              formatter: '{b}:{c}张',
              fontSize: '20',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold',
                formatter: '{b}:{c}张',
              },
            },

            labelLine: {
              show: true,
            },
            data: this.dataBas,
          },
        ],
      }
      if ($('.echart-graph').length > 0) {
        this.$nextTick(() => {
          // console.log(2)
          this.echart && this.echart.clear()
          this.echart = echarts.init($('.echart-graph')[0])
          this.echart.setOption(option_quality)
          const This = this
          this.echart.on('click', function (para) {
            This.skip2('fourSubject')
          })
          this.echart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: 0,
          })
          This.eventClick()
        })
      } else {
        return
      }
    },
    eventClick() {
      let that = this
      window.onresize = function () {
        that.echart.resize()
      }
      that.$nextTick(() => {
        var index = 0
        // 当鼠标移入时，如果不是第一项，则把当前项置为选中，如果是第一项，则设置第一项为当前项
        that.echart.on('mouseover', function (e) {
          that.echart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: 0,
          })
          if (e.dataIndex != index) {
            that.echart.dispatchAction({
              type: 'downplay',
              seriesIndex: 0,
              dataIndex: index,
            })
          }
          if (e.dataIndex == 0) {
            that.echart.dispatchAction({
              type: 'highlight',
              seriesIndex: 0,
              dataIndex: e.dataIndex,
            })
          }
        })

        // 当鼠标离开时，把当前项置为选中
        that.echart.on('mouseout', function (e) {
          index = e.dataIndex
          that.echart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: e.dataIndex,
          })
        })
      })
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

.titles {
  // background: ;
  //padding-left: 10px;
  font-weight: 500;
  font-size: px2Rem(16px);
  //padding: 8px 20px;
  color: $color-text-primary;
  //color: rgba(255, 255, 255, 0.8);
  i {
    display: inline-block;
    width: px2Rem(8px);
    height: px2Rem(8px);
    background: #3b8ab1;
    margin-right: px2Rem(10px);
  }
}
.top-one {
  background-color: $color-primary-darker-home;
  // flex-grow:1;
  position: relative;
  margin-bottom: px2Rem(20px);
  flex-grow: 1;
  .echart-graph {
    height: px2Rem(340px);
  }
}
</style>
