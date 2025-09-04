<template>
  <!--  <div class="zhi-coumt" v-loading="loading">-->
  <div class="zhi-coumt">
    <div :class="'echarts2'"></div>
    <div style="height: 40px" class="tu">
      <dl v-for="(item, index) in this.titles1" :key="index">
        <datablau-tooltip
          style="width: 100%"
          :content="item"
          placement="top"
          :open-delay="700"
        >
          <div>
            <dt :style="'backgroundColor:' + tuliColorList[index] + ';'"></dt>
            <dd
              :style="'color:' + (theme === 'dark' ? '#969696' : '#000') + ';'"
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
      names: '',
      datas: [],
      values: [],
      titles1: [],
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
      loading: true,
      echartsInstance: null,
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
      this.titles1 = []
      this.values = []
      // let data = localStorage.getItem('domains')
      // if (data && this.$utils.isJSON(data)) {
      //   this.datas = JSON.parse(data)
      this.datas = this.domainData
      this.names = this.datas[0].name
      for (var i = 0; i < this.datas[0].nodes.length; i++) {
        this.titles1.push(this.datas[0].nodes[i].name)
        this.values.push(Number(this.datas[0].nodes[i].domainCount))
      }
      this.titles1 = this.titles1.filter((item, index) => index < 5)
      this.values = this.values.filter((item, index) => index < 5)
      this.loading = false
      // }
      this.drawEcharts()
      this.getechars()
    },
    getechars() {},
    getEs() {
      // console.log(this.value);
      this.drawEcharts()
    },
    handleThemeChange() {
      this.drawEcharts()
    },
    drawEcharts() {
      let that = this
      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init($('.echarts2')[0])
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
          data: this.titles1,
          inverse: true,
          animationDuration: 300,
          animationDurationUpdate: 300,
          max: this.titles1.length, // only the largest 3 bars will be displayed
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false },
        },

        series: [
          {
            cursor: 'default',

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
          },
        ],
        legend: {
          // data: this.titles1,
          show: true,
          // left: '5%',
          // itemGap:100
        },
        animationDuration: 0,
        animationDurationUpdate: 3000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear',
      }
      setTimeout(() => {
        this.echartsInstance.setOption(option)
        this.echartsInstance.resize()
      }, 500)

      window.onresize = () => {
        this.echartsInstance.resize()
      }
      // 暂时取消click事件
      this.echartsInstance.on('click', params => {
        return
        if (this.canClick) {
          this.$router.push({
            name: 'embeddedModule',
            query: {
              auth: true,
              iframeNav: '/main/dataStandard',
            },
          })
          // window.location.href='/#/main/embeddedModule?auth=true&iframeNav=/main/dataStandard';
        } else {
          this.$message({
            showClose: true,
            message: '需要开通数据标准查看权限',
            type: 'error',
          })
          // this.$message.error('需要开通数据标准查看权限')
        }
      })
    },
  },
  computed: {},
}
</script>
<style scoped lang="scss">
.tu {
  padding-left: 10%;
}
</style>

<style scoped lang="scss">
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
.zhi-coumt {
  //height: 50%;
  //background: var(--color-primary-darker-home);
  //background: #1d1d1d;
  background: $color-primary-darker-home;
  flex-grow: 1;
  position: relative;
  .echarts2 {
    height: px2Rem(220px);
  }
}
.tu {
  // margin-top: 20px;
  position: absolute;
  box-sizing: border-box;
  bottom: px2Rem(18px);
  padding: 0 5%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  dl {
    width: 20%;
    flex-shrink: 0;
    //width: 50px;
    margin-top: 6px;
    dt {
      width: 10px;
      height: 10px;
      float: left;
      border-radius: 2px;
      margin-right: 4px;
      margin-top: 2px;
    }
    dd {
      line-height: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      //display: inline-block;
      // color:var(--ddc-header-color);
    }
  }
  dl:nth-child(1) {
    // margin-left: 74px;
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
  dl:nth-child(4) {
    dt {
      background: #8387ff;
    }
  }
  /* dl:nth-child(4){*/
  /*  dt{*/
  /*     background: #8C5DFF;*/
  /*  }*/
  /*}*/
}
</style>
