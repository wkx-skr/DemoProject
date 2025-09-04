<template>
  <div id="container" class="clear-fix">
    <div class="top">
      <div class="card">
        <div class="title grey">数据源</div>
        <div class="number red">826</div>
        <div class="foot red">
          <i class="fa fa-arrow-up"></i>
          23
        </div>
      </div>
      <div class="card">
        <div class="title grey">表</div>
        <div class="number red">2389</div>
        <div class="foot red">
          <i class="fa fa-arrow-up"></i>
          695
        </div>
      </div>
      <div class="card">
        <div class="title grey">字段</div>
        <div class="number red">23138</div>
        <div class="foot red">
          <i class="fa fa-arrow-up"></i>
          4238
        </div>
      </div>
      <div class="card">
        <div class="title grey">数据标签</div>
        <div class="number grey">3147</div>
      </div>
      <div class="card">
        <div class="title grey">数据标准</div>
        <div class="number blue">1755</div>
        <div class="foot blue">
          <i class="fa fa-arrow-down"></i>
          482
        </div>
      </div>
      <div class="card">
        <div class="title grey">业务词汇表</div>
        <div class="number blue">4300</div>
        <div class="foot blue">
          <i class="fa fa-arrow-down"></i>
          336
        </div>
      </div>
      <div class="card">
        <div class="title grey">数据查询</div>
        <div class="number grey">9582</div>
      </div>
    </div>
    <div class="quality card">
      <div class="title">
        <div class="text">质量指数</div>
        <div class="icon">
          <img src="../../assets/images/icon/Set-up.png" alt="" />
        </div>
      </div>
      <div class="graph" id="quality_graph" style="width: 400px"></div>
    </div>
    <div class="meta card">
      <div class="title">
        <div class="text">元数据指数</div>
        <div class="icon">
          <img src="../../assets/images/icon/Set-up.png" alt="" />
        </div>
      </div>
      <div class="graph" id="meta_graph"></div>
    </div>
    <div class="app card">
      <div class="title">
        <div class="text">应用指数</div>
        <div class="icon">
          <img src="../../assets/images/icon/Set-up.png" alt="" />
        </div>
      </div>
      <div class="graph" id="app_graph"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
var option_quality = {
  tooltip: {
    trigger: 'item',
    //      formatter: "{a} <br/>{b}: {c} ({d}%)"
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    x: 'center',
    y: '80%',
    itemWidth: 14,
    data: ['业务数据A', '业务数据B', '业务数据C', '其他'],
  },
  color: ['#F4C645', '#EE3535', '#0E8FF0', '#AAA'],
  series: [
    {
      name: '访问来源',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '35%'],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: true,
          position: 'center',
          formatter: '36',
          textStyle: {
            fontSize: 44,
            fontWeight: 'lighter',
            color: '#555',
          },
        },
        emphasis: {
          show: false,
          textStyle: {
            fontSize: '30',
            fontWeight: 'bold',
          },
        },
      },
      labelLine: {
        normal: {
          show: false,
        },
      },
      itemStyle: {
        normal: {},
      },
      data: [
        { value: 335, name: '业务数据A' },
        { value: 310, name: '业务数据B' },
        { value: 234, name: '业务数据C' },
        { value: 135, name: '其他' },
      ],
    },
  ],
}

var option_meta = {
  radar: [
    {
      indicator: [
        { text: '品牌', max: 10 },
        { text: '功能', max: 10 },
        { text: '可用性', max: 10 },
        { text: '价值', max: 10 },
        { text: '内容', max: 10 },
      ],
      center: ['50%', '45%'],
      radius: '70%',
    },
  ],
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [6, 6, 5, 8, 4],
          itemStyle: {
            normal: {
              borderColor: 'rgb(122,207,249)',
              borderWidth: 1,
            },
          },
          areaStyle: {
            normal: {
              color: 'rgba(122,207,249,0.6)',
            },
          },
          lineStyle: {
            normal: {
              color: 'rgba(122,207,249)',
            },
            emphasis: {
              color: 'rgba(122,207,249)',
            },
          },
        },
      ],
    },
  ],
}

var option_app = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  /* legend: {
        data:['邮件营销','联盟广告','视频广告','直接访问','搜索引擎']
    }, */
  /* toolbox: {
        feature: {
            saveAsImage: {}
        }
    }, */
  grid: {
    left: '3%',
    right: '4%',
    //      bottom: '3%',
    top: '2%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
  ],
  yAxis: [
    {
      type: 'value',
    },
  ],
  series: [
    {
      name: '邮件营销',
      type: 'line',
      stack: '总量',
      areaStyle: { normal: {} },
      data: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      name: '联盟广告',
      type: 'line',
      stack: '总量',
      areaStyle: { normal: {} },
      data: [220, 182, 191, 234, 290, 330, 310],
    },
    {
      name: '视频广告',
      type: 'line',
      stack: '总量',
      areaStyle: { normal: {} },
      data: [150, 232, 201, 154, 190, 330, 410],
    },
    {
      name: '直接访问',
      type: 'line',
      stack: '总量',
      areaStyle: { normal: {} },
      data: [320, 332, 301, 334, 390, 330, 320],
    },
    {
      name: '搜索引擎',
      type: 'line',
      stack: '总量',
      label: {
        normal: {
          show: true,
          position: 'top',
        },
      },
      areaStyle: { normal: {} },
      data: [820, 932, 901, 934, 1290, 1330, 1320],
    },
  ],
}

export default {
  data: function () {
    return {}
  },
  mounted: function () {
    this.drawEcharts()
  },
  methods: {
    drawEcharts: function () {
      echarts
        .init(document.getElementById('quality_graph'))
        .setOption(option_quality)
      echarts.init(document.getElementById('meta_graph')).setOption(option_meta)
      echarts.init(document.getElementById('app_graph')).setOption(option_app)
    },
  },
}
</script>
<style scoped lang="scss">
$fontFamily: '微软雅黑';
$fontSmall: 12px;
$fontMiddle: 16px;
$fontLarge: 44px;

$Red: #f25d5c;
$Blue: #47bcbe;
$Grey: #484848;
$White: #fff;
.red {
  color: $Red;
}
.blue {
  color: $Blue;
}
.grey {
  color: $Grey;
}

#container {
  font-size: $fontSmall;
  width: 100%;
  & > .top {
    /*height:200px;*/
    width: 100%;
    background: #fff;
    margin: 10px 0;
    padding: 40px 20px 0 20px;
    & > .card {
      /*width:200px;*/
      width: 14%;
      display: inline-block;
      vertical-align: top;
      > div {
        margin-left: 20px;
      }

      .title {
        font-size: $fontMiddle;
        margin-bottom: 30px;
      }
      .number {
        font-family: 'Microsoft YaHei', 'PingFang SC', serif;
        font-size: $fontLarge;
        line-height: 1;
        margin-bottom: 20px;
        font-weight: 100;
      }
      .foot {
        font-size: $fontMiddle;
        margin-bottom: 40px;
        i {
          transform: scaleX(0.7);
        }
      }
    }
  }
  & > .card {
    float: left;
    height: 580px;
    background-color: #fff;
    margin: 0 5px 10px 5px;
    & > .title {
      height: 80px;
      line-height: 80px;
      .text {
        color: $Grey;
        float: left;
        width: 100px;
        text-align: right;
      }
      .icon {
        float: right;
        margin: 5px 20px;
      }
    }
    & > .graph {
      height: 500px;
    }
  }
  & > .quality {
    width: 400px;
  }
  & > .meta {
    width: 480px;
  }
  & > .app {
    width: 540px;
  }
}
</style>
