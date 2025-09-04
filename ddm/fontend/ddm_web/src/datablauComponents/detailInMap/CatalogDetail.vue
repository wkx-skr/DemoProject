<template>
  <div class="container">
    <h2>{{ catalogName }}</h2>
    <p class="definition">
      该业务目录包含指定的元数据，这是该业务目录的概述，概述应该简明扼要的描述该业务目录的作用和分类依据
    </p>
    <h3>数据资产的分布</h3>
    <div :class="'echart-graph'" style="height: 120px"></div>
    <h3>有哪些业务实体</h3>
    <ul>
      <li>#1 客户</li>
      <li>#2 合同</li>
    </ul>
    <h3>分布在哪些IT系统</h3>
    <ul>
      <li>#1 信贷系统BCBS</li>
      <li>#2 客户关系CRM系统</li>
    </ul>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  name: 'CatalogDetail',
  mounted() {
    this.drawEcharts()
  },
  props: ['catalog-name'],
  data() {
    return {
      loading: false,
    }
  },
  watch: {},
  methods: {
    drawEcharts() {
      const option_quality = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
          textStyle: {
            fontSize: 8,
            lineHeight: 20,
          },
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['60%', '90%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
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
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' },
            ],
          },
        ],
      }
      setTimeout(() => {
        echarts.init($('.echart-graph')[0]).setOption(option_quality)
      }, 500)
    },
  },
  computed: {},
}
</script>

<style scoped lang="scss">
@import './main';
</style>
