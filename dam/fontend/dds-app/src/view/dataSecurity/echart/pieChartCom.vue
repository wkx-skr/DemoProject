<template>
  <div class="echart-container">
    <div class="picTil">{{ picTil }}</div>
    <div class="echart-container" ref="echartsCon"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
// let echartInstance = null
export default {
  props: ['picTil', 'datas', 'options', 'formatter', 'co', 'label'],
  data() {
    return {
      echartInstance: null,
    }
  },
  methods: {
    // 有数据再调用
    drawEcharts() {
      this.$nextTick(() => {
        let opt = {
          legend: {
            show: true,
            bottom: '3',
            // left: 'right',
            right: '10',
            itemWidth:
              (this.options.legend && this.options.legend.itemWidth) || 6,
            itemHeight:
              (this.options.legend && this.options.legend.itemHeight) || 6,
            itemGap: 10,
            icon: (this.options.legend && this.options.legend.icon) || 'circle',
            color: '#555',
          },
          color: this.co,
          tooltip: {
            trigger: 'item',
            formatter: data => {
              const name =
                data.data.name.length > 10
                  ? data.data.name.substr(0, 10) + '…'
                  : data.data.name
              return `<span style="display: inline-block;width:10px;height:10px;border-radius: 10px;background: ${
                data.color
              };margin-right: 5px"></span>${name}：${
                data.data.values || data.data.value
              }（${data.data.pre || data.percent + '%'}）`
            },
            rich: {},
          },
          series: [
            {
              name: 'pie1',
              type: 'pie',
              selectedMode: 'single',
              center: (this.options && this.options.center) || ['50%', '45%'],
              radius:
                this.options && this.options.round
                  ? this.options.round.inner
                  : ['15%', '20%'],
              color: ['#F0F2F5'],
              data: [{ value: 100 }],
              animation: false,
              silent: true,
              label: {
                show: false,
              },
            },
            {
              name: 'pie',
              type: 'pie',
              avoidLabelOverlap: true,
              minAngle: 5,
              center: (this.options && this.options.center) || ['50%', '45%'],
              radius:
                this.options && this.options.round
                  ? this.options.round.outer
                  : ['25%', '50%'],
              roseType: this.options ? this.options.roseType : '',
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
              },
              label: {
                // normal: {
                // alignTo: 'edge',
                // bleedMargin: 20,
                formatter: this.formatter,
                // minMargin: 5,
                edgeDistance: 10,
                // rotate: 10,
                position: 'outside',
                padding: [0, -70],
                borderWidth: 20,
                borderRadius: 4,
                lineHeight: 16,
                show: this.label !== undefined ? this.label : true,
                itemStyle: {
                  fontSize: 12,
                  color: '#555',
                },
                rich: {
                  name: {
                    fontSize: 12,
                    color: '#555',
                  },
                  pre: {
                    fontSize: 12,
                    color: '#555',
                  },
                  value: {
                    fontSize: 12,
                    color: '#555',
                    padding: [0, 10, 0, 0],
                  },
                },
                // },
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              data: this.datas,
            },
          ],
        }
        if (this.options && this.options.legend) {
          Object.keys(this.options.legend).forEach(k => {
            if (k === 'right') {
              delete opt.legend.left
            }
            opt.legend[k] = this.options.legend[k]
          })
        }
        const container = this.$refs.echartsCon
        if (container) {
          this.echartInstance = echarts.init(container)
          this.echartInstance.setOption(opt)
        }
      })
    },
    handleResize() {
      if (this.echartInstance) {
        this.$nextTick(() => {
          this.echartInstance.resize({
            width: $('.echart-container').width(),
          })
        })
      } else {
        this.drawEcharts()
      }
    },
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    this.echartInstance && echarts.dispose(this.echartInstance)
  },
  mounted() {
    $(window).resize(this.handleResize)
  },
  watch: {
    datas: {
      handler(val) {
        setTimeout(() => {
          this.drawEcharts()
        }, 100)
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<style scoped lang="scss">
.picTil {
  font-size: 14px;
  color: #555;
  padding: 0 16px;
}
.echart-container {
  width: 100%;
  height: 98%;
}
</style>
