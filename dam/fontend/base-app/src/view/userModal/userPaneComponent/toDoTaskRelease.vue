<template>
  <el-card class="box-card todo-task-release">
    <div slot="header" class="clearfix">
      <span class="sub-title">{{ $t('userPane.userPane.toPublish') }}</span>
      <el-button
        class="showMore"
        style="float: right; padding: 3px 0"
        type="text"
        @click="toMyTodo"
      >
        {{ $t('userPane.userPane.more') }}
      </el-button>
    </div>
    <div
      id="toDoTaskChart"
      style="width: 360px; height: 372px; margin: 0 auto"
    ></div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      myChart: null,
      taskData: [],
      colorMap: {
        数据标准: '#38B48B',
        指标标准: '#FFDE6A',
        标准代码: '#9D5B8B',
        数据权限: '#409EFF',
        指标权限: '#EDAD4A',
        数据服务: '#3779B4',
        资产目录: '#796EE0',
        数据资产: '#463AB8',
        资产发布申请: '#463AB8',
        发布目录申请: '#463AB8',
        领域标准代码: '#E01F54',
        领域数据标准: '#A4CE62',
        技术规则: '#85A452',
        业务规则: '#BF794E',
      },
      color: [],
    }
  },
  mounted() {
    const appName = JSON.parse(localStorage.getItem('allServers'))
    this.$http
      // .get(this.$url + '/service/dashboard/workbench/tasks')
      .post('/workflow/dashboard/workbench/tasks', { appName: appName })
      .then(res => {
        let temp = []
        let tempColor = []
        if (res.data && JSON.stringify(res.data) !== '{}') {
          for (let key in res.data) {
            let obj = {
              name: key,
              value: res.data[key],
            }
            if (`${key}` !== '数据服务') {
              temp.push(obj)
              tempColor.push(this.colorMap[key])
            }
          }
          this.color = tempColor
          this.taskData = temp
          this.drawChart()
        }
      })
      .catch(e => {
        console.log(e)
      })
  },
  beforeDestroy() {
    this.myChart && this.myChart.dispose()
  },
  methods: {
    toMyTodo() {
      this.$router.push({
        name: 'userModal',
        query: {
          currentNav: 'myTodo',
        },
      })
    },
    drawChart() {
      var chartDom = document.getElementById('toDoTaskChart')
      this.myChart && this.myChart.clear()
      this.myChart = echarts.init(chartDom)
      var option
      option = {
        color: this.color,
        legend: {
          top: 'bottom',
          icon: 'emptyCircle',
          itemHeight: 7,
          itemGap: 10, // 图例之间的间距
          itemWidth: 10,
          padding: [0, 20, 0, 20],
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255,255,255,1)',
          color: 'black',
          confine: true, // tooletip 内容限制在容器内
          textStyle: {
            color: '#555555',
          },
          padding: 5,
          // formatter:'{b} :{c} 条待完成'
          formatter: function (params, ticket, callback) {
            let res = `<div style="padding:5px;display:flex;align-items:center;">
                            <div style="display:inline-block;border-left:5px solid ${params.color};height:20px;width:4px;border-radius: 2px;">
                            </div>
                            <div style="display:inline-block;padding-left:5px">
                                <span style='color:#555;font-size:14px;margin-right:35px;'>${params.name}</span>
                                <span style='font-size:12px;'>待完成 &nbsp${params.value} &nbsp条</span>
                            </div>
                            </div>`
            return res
          },
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        series: [
          {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [35, 120],
            center: ['50%', '40%'],
            // roseType: 'radius',
            itemStyle: {
              borderRadius: 8,
            },
            data: this.taskData,
            label: {
              show: false,
            },
          },
        ],
      }
      option && setTimeout(this.myChart.setOption(option), 1000)
    },
  },
}
</script>

<style lang="scss">
.todo-task-release {
  background: #fff;
  height: 100%;

  .sub-title {
    width: 126px;
    height: 21px;
    font-size: 14px;
    // font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #555555;
    line-height: 21px;
  }
  .showMore {
    position: absolute;
    right: 10px;
    font-size: 12px;
    // font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #409eff;
  }
  .el-card__body {
    padding: 14px;
  }
}
.todo-task-release.el-card.is-always-shadow {
  box-shadow: none;
}
</style>
