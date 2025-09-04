<template>
  <!--  <div class="domain-count-top" v-loading="loading">-->
  <div class="domain-count-top">
    <!--    <p class="titles" style="padding-top: 10px">
      <i></i>
      数据标准概况
    </p>-->
    <div :class="'echarts1'"></div>
    <div style="" class="tuli">
      <dl v-for="(item, index) in this.tites" :key="index">
        <datablau-tooltip
          :content="item"
          placement="top"
          :open-delay="700"
          style="width: 100%"
        >
          <div>
            <dt :style="'backgroundColor:' + tuliColorList[index] + ';'"></dt>
            <dd
              :style="
                'color:' +
                (theme === 'dark' ? '#969696' : 'var(--ddc-header-color)') +
                ';'
              "
            >
              {{ item }}
            </dd>
          </div>
        </datablau-tooltip>
      </dl>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  props: {
    domainData: {
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
  // props: ['canClick'],
  mounted() {
    // this.dataInit()
    // this.$bus.$on('embeddedDataLoaded', this.dataInit)
    $(window).resize(this.drawEcharts)
  },
  data() {
    return {
      datas: [],
      names: '',
      dataBase: [],
      tites: [],
      values: [],
      loading: true,
      echartsInstance: null,
      tuliColorList: [
        '#9981FF',
        '#1D8EFF',
        '#80C7EF',
        '#4B30DE',
        '#80C7EF',
        '#36D0FF',
        '#4B30DE',
        '#7996B3',
        '#36D0FF',
        '#7996B3',
      ],
    }
  },
  watch: {
    domainData() {
      this.dataInit()
    },
  },
  beforeDestroy() {
    // this.$bus.$off('embeddedDataLoaded', this.dataInit)
  },
  methods: {
    dataInit() {
      this.tites = []
      this.values = []
      // let data = localStorage.getItem('domains')
      // if (data && this.$utils.isJSON(data)) {
      //   this.datas = JSON.parse(data)
      this.datas = this.domainData
      if (!this.datas[1]) return
      let names = this.datas[1].name
      if (names && Array.isArray(names)) {
        names = datas.slice(0, 3)
      }
      this.names = names
      for (var i = 0; i < this.datas[1].nodes.length; i++) {
        this.tites.push(this.datas[1].nodes[i].name)
        this.values.push(this.datas[1].nodes[i].domainCount)
      }
      this.tites = this.tites.filter((item, index) => index < 5)
      this.values = this.values.filter((item, index) => index < 5)
      this.loading = false
      // }
      this.drawEcharts()
      this.getechars()
    },
    getechars() {},
    getEs() {
      this.drawEcharts()
    },
    handleThemeChange() {
      this.drawEcharts()
    },
    drawEcharts() {
      let that = this
      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init($('.echarts1')[0])
      }
      this.echartsInstance.off('click')
      let option = {
        title: {
          show: true, // 显示策略，默认值true,可选为：true（显示） | false（隐藏）

          subtext: this.names, // 副标题文本，'\n'指定换行
          sublink: '', // 副标题文本超链接
          subtarget: null, // 指定窗口打开副标题超链接，支持'self' | 'blank'，不指定等同为'blank'（新窗口）
          x: '18px', // 水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
          y: 'top', // 垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
          subtextStyle: {
            // 副标题文本样式{"color": "#aaa"}
            fontFamily: 'Arial, Verdana, sans...',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 'normal',
            color: this.theme === 'dark' ? '#969696' : '#000',
            // color: '#969696',
          },
        },
        xAxis: {
          max: 'dataMax',
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false },
        },
        grid: {
          left: '15%',
          right: '2%',
          top: '20%',
          bottom: '20%',
          containLabel: true,
        },
        yAxis: {
          type: 'category',
          data: this.tites,
          inverse: true,
          animationDuration: 300,
          animationDurationUpdate: 300,
          max: this.tites.length, // only the largest 3 bars will be displayed
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false },
        },

        series: [
          {
            realtimeSort: false,
            // name: 'X',
            type: 'bar',
            data: this.values,
            label: {
              show: true,
              position: 'left',
              valueAnimation: true,
            },
            // 柱间距离
            barCategoryGap: '45%',
            itemStyle: {
              normal: {
                barBorderRadius: [0, 15, 15, 0],
                opacity: 0.9,
                color: function (params) {
                  var colorlist = that.tuliColorList
                  return colorlist[params.dataIndex]
                },
              },
              emphasis: {
                opacity: 1,
              },
            },
            cursor: 'default',
          },
        ],
        legend: {
          show: true,
        },
        animationDuration: 0,
        animationDurationUpdate: 3000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear',
      }
      let vm = this
      setTimeout(() => {
        this.echartsInstance.setOption(option)
        this.echartsInstance.resize()
        /* let tuliDd = $('.tuli').find('dl')
        let ddWidth = $('.tuli').width() / vm.tites.length
        console.log('ddWidth', tuliDd, ddWidth)
        tuliDd.css('width', ddWidth) */
        // $('.echarts1').find('div').css('cusor', 'default')
      }, 500)

      window.onresize = function () {
        this.echartsInstance.resize()
      }
      // 暂时取消click事件
      this.echartsInstance.on('click', params => {
        return
        if (this.canClick) {
          localStorage.setItem('tys', '2')
          this.$router.push({
            name: 'embeddedModule',
            query: {
              auth: true,
              iframeNav: '/main/index',
            },
          })
        } else {
          this.$message({
            showClose: true,
            message: '需要开通指标体系查看权限',
            type: 'error',
          })
          // this.$message.error("需要开通指标体系查看权限");
        }
      })
    },
  },
  computed: {},
}
</script>

<style lang="scss" scoped>
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
.domain-count-top {
  //height: 50%;
  //background: var(--color-primary-darker-home);
  //background: #1d1d1d;
  background: $color-primary-darker-home;
  position: relative;
  //border-bottom: 1px solid var(--grey-split);
  //border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid $grey-split;
}
.echarts1 {
  height: px2Rem(220px);
}
.tuli {
  position: absolute;
  box-sizing: border-box;
  bottom: px2Rem(3px);
  padding: 0 5%;
  width: 100%;
  height: px2Rem(54px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  dl {
    width: 20%;
    flex-shrink: 0;
    padding-left: 2px;
    dt {
      margin-right: 4px;
      margin-top: 5px;
      width: 10px;
      height: 10px;
      float: left;
      border-radius: 2px;
      margin-right: 4px;
    }
    dd {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

<style lang="scss">
@function px2Rem($px, $base-font-size: 18px) {
  @if (unitless($px)) {
    //有无单位
    @return ($px / 19.2) * 1rem;
  } @else if (unit($px) == em) {
    @return $px;
  }
  @return ($px / $base-font-size) * 1rem;
}
.titles {
  i {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #3b8ab1;
    margin-right: 10px;
  }
}
.tuli {
  font-size: 12px;
  dl {
    float: left;
    overflow: hidden;
    margin-top: 7px;
    display: flex;
    align-items: center;
    dt {
      width: px2Rem(10px);
      height: px2Rem(10px);
      float: left;
      border-radius: 2px;
    }
    dd {
      // line-height: 10px;
      // color: var(--ddc-header-color);
    }
  }
  dl:nth-child(1) {
    dt {
      background: #36d0ff;
    }
  }
  dl:nth-child(2) {
    dt {
      background: #1d8eff;
    }
  }
  dl:nth-child(3) {
    dt {
      background: #8387ff;
    }
  }
}
</style>
