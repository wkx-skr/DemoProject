<template>
  <div
    style="height: 60px; width: 125px; margin: 0 auto; position: relative"
  ></div>
</template>

<script>
import * as eChart from 'echarts'
export default {
  props: ['data'],
  mounted() {
    if (this.data) {
      this.draw()
    } else {
      this.show = true
    }
  },
  data() {
    return {
      show: false,
      nullRate: 0,
    }
  },
  methods: {
    draw() {
      const vm = this
      this.nullRate = this.data.nullRate
      const rateOption = {
        animation: false,
        color: ['#4278c9', '#d6d6d6'],
        series: [
          {
            name: vm.$t('meta.DS.tableDetail.dataQuality.accessSource'),
            type: 'pie',
            radius: ['45%', '65%'],
            hoverAnimation: false,
            avoidLabelOverlap: false,
            emphasis: {
              label: {
                show: false,
                formatter: '{c}',
              },
            },
            label: {
              show: false,
              position: 'center',
              // formatter:100-nullRate + '%'
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: 100 - this.nullRate,
                name: vm.$t('meta.DS.tableDetail.dataQuality.directAccess'),
              },
              { value: this.nullRate, name: '' },
            ],
          },
        ],
      }
      eChart.init(this.$el).setOption(rateOption)
      $(this.$el).append(
        `<div class="cccc" style="color:#4278C9;font-size:12px;position:absolute;width:100%;text-align:center;z-index:9999;top:50%;left:0;margin-top:-12px;display: block;">${
          100 - this.nullRate
        }</span>`
      )
    },
  },
}
</script>

<style scoped></style>
<style></style>
