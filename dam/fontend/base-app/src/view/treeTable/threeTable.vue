<template>
  <div style="display: flex">
    <div
      :class="'echart-graph'"
      style="width: 500px; height: 700px; margin-left: 300px"
    ></div>
    <el-select
      v-model="value"
      placeholder="请选择展开层级"
      @change="getEs"
      style="position: absolute; right: 10px; top: 10px"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  mounted() {
    this.drawEcharts()
    this.getechars()
  },
  data() {
    return {
      loading: false,
      list: [],
      options: [
        {
          value: '1',
          label: '第一层',
        },
        {
          value: '2',
          label: '第二层',
        },
        {
          value: '3',
          label: '第三层',
        },
      ],
      value: '2',
    }
  },
  watch: {},
  methods: {
    getechars() {
      this.$http.get(`${this.$url}/service/catalogs/`).then(res => {
        this.list.push(res.data)
        // this.list.itemStyle={
        //   color: "rgba(25, 225, 179, 1)"
        // }
        // console.log(this.list);
        for (var i = 0; i < this.list.length; i++) {
          this.list[i].itemStyle = {
            color: 'rgba(121, 196, 196, 1)',
          }
          this.list[i].name = '目录树形图'
          // console.log(this.list[i].children.length);
          if (this.list[i].children) {
            for (var x = 0; x < this.list[i].children.length; x++) {
              this.list[i].children[x].itemStyle = {
                color: 'rgba(169, 52, 193, 1)',
              }
              if (this.list[i].children[x].children) {
                for (
                  var k = 0;
                  k < this.list[i].children[x].children.length;
                  k++
                ) {
                  this.list[i].children[x].children[k].itemStyle = {
                    color: 'rgba(36, 185, 222, 1)',
                  }
                  if (this.list[i].children[x].children[k].children) {
                    for (
                      var j = 0;
                      j < this.list[i].children[x].children[k].children.length;
                      j++
                    ) {
                      this.list[i].children[x].children[k].children[
                        j
                      ].itemStyle = {
                        color: 'rgba(241, 214, 11, 1)',
                      }
                    }
                  }
                }
              }
            }
          }
        }
        // console.log(this.list);
      })
    },
    getEs() {
      // console.log(this.value);
      this.drawEcharts()
    },
    drawEcharts() {
      const option_quality = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        series: [
          {
            type: 'tree',
            id: 0,
            name: 'tree1',
            data: this.list,
            top: '1%',
            left: '20%',
            bottom: '1%',
            right: '20%',

            symbolSize: 7,

            edgeShape: 'polyline',
            edgeForkPosition: '63%',
            initialTreeDepth: 3,

            lineStyle: {
              width: 2,
            },

            label: {
              backgroundColor: '#fff',
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
            },

            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left',
              },
            },
            initialTreeDepth: this.value,
            symbol: 'circle',
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
            roam: true,
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
//   @import './main';
</style>
