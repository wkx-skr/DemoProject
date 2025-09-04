<template>
  <div class="overview" style="background: #fff" v-loading="loading">
    <!--数据资产分类分级概览-->
    <!--    数据资产分类分级概览  参考assetDistribution.vue-->
    <div class="picTil" v-if="datas.length === 0">数据资产分类分级概览</div>
    <lineAndBarCom
      :picTil="'数据资产分类分级概览'"
      :options="options"
      :formatter="true"
      :yAxisDataLabel="false"
      containerRef="classificationOverview"
      v-if="datas.length !== 0"
    ></lineAndBarCom>
    <div class="nodata" v-else-if="!loading && datas.length === 0">
      <div class="noresults">
        <div class="noresult-img">
          <img src="@/assets/images/search/no-result.svg" alt="" />
          <p>
            {{ $t('meta.DS.tableDetail.noData') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lineAndBarCom from '@/view/dataAsset/analysis/components/echartsCom/lineAndBarCom'
import HTTP from '../util/api'
export default {
  components: { lineAndBarCom },
  data() {
    return {
      options: {
        legend: {
          top: 25,
          left: 0,
          itemHeight: 10,
          itemWidth: 10,
          itemGap: 16,
          icon: '',
          tooltip: {
            show: true,
            trigger: 'item',
            textStyle: {
              fontSize: 12,
            },
            formatter: data => {
              if (data.name.length > 6) {
                return data.name
              }
            },
          },
          formatter: data => {
            if (data) {
              return data.length > 6 ? data.substr(0, 6) + '…' : data
            }
          },
          type: 'scroll',
          pageIcons: {
            horizontal: [
              'path://M5.85231648,9.22048119 L1.19196371,5 L5.85231648,0.779518775 C6.04922784,0.601193075 6.04922784,0.312069975 5.85231648,0.133744275 C5.65540512,-0.044581425 5.33614872,-0.044581425 5.13923736,0.133744275 L0.147683503,4.65416583 C0.0427815025,4.74916663 -0.0062352975,4.87561275 0.0006331025,5 C-0.0062352975,5.12438721 0.0427815025,5.25083333 0.147683503,5.34583413 L5.13923736,9.8662557 C5.33614872,10.0445814 5.65540512,10.0445814 5.85231648,9.8662557 C6.04922784,9.68792998 6.04922784,9.3988069 5.85231648,9.22048119 Z',
              'path://M0.147683523,9.22048119 L4.80803629,5 L0.147683523,0.779518775 C-0.0492278375,0.601193075 -0.0492278375,0.312069975 0.147683523,0.133744275 C0.344594883,-0.044581425 0.663851283,-0.044581425 0.860762643,0.133744275 L5.8523165,4.65416583 C5.9572185,4.74916663 6.0062353,4.87561275 5.9993669,5 C6.0062353,5.12438721 5.9572185,5.25083333 5.8523165,5.34583413 L0.860762643,9.8662557 C0.663851283,10.0445814 0.344594883,10.0445814 0.147683523,9.8662557 C-0.0492278375,9.68792998 -0.0492278375,9.3988069 0.147683523,9.22048119 Z',
            ],
          },
          pageIconColor: '#409EFF', // 可以点击的翻页按钮颜色
          pageIconInactiveColor: '#DDDDDD', // 禁用的按钮颜色
          pageIconSize: 15, // 这当然就是按钮的大小
        },
        bottom: '10%',
        top: '25%',
        axisLabel: {
          // interval: 0,
          // rotate: -40,
        },
        xAxisData: [],
        yAxisData: [
          {
            name: this.$t('assets.dashboard.unit'),
            min: 0,
            max: 10,
            interval: 50,
            // itemWidth: 16,
          },
        ],
        seriesData: [],
      },
      datas: [],
      loading: false,
      slider1: {
        type: 'slider',
        show: true,
        start: 0,
        end: 40,
        zoomLock: true,
        filterMode: 'none',
        height: 10,
        backgroundColor: '#F5F5F5', // 两边未选中的滑动条区域的颜色
        dataBackground: {
          areaStyle: { shadowColor: '#F5F5F5', color: '#F5F5F5' },
          lineStyle: { shadowColor: '#F5F5F5', color: '#F5F5F5' },
        },
        fillerColor: '#ddd', // 滚动条颜色
        borderColor: '#F5F5F5',
        handleSize: 0, // 两边手柄尺寸
        showDetail: false, // 拖拽时是否展示滚动条两侧的文字
        slider: { brushSelect: false },
        bottom: 0,
      },
      inside: {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true, // 鼠标移动能触发数据窗口平移
        moveOnMouseWheel: true,
      },
      color: [
        '#3AD1BF',
        '#8DC78A',
        '#FB98B9',
        '#FBC372',
        '#FBA476',
        '#F9716C',
        '#BB6CF9',
        '#6F54EB',
        '#4E85F7',
        '#81B5FF',
      ],
    }
  },
  methods: {
    getDataAsset() {
      this.datas = []
      this.loading = true
      HTTP.getDataAsset()
        .then(res => {
          let ary = []
          this.datas = Object.keys(res.data.data)
          let datas = res.data.data
          this.options.xAxisData = Object.keys(datas)
          let num = []
          Object.keys(datas).forEach(k => {
            let max = 0
            datas[k].forEach(data => {
              let findAry = ary.filter(item => item.name === data.tagName)
              max += data.total
              if (findAry.length) {
                ary.forEach(item => {
                  item.name === data.tagName && item.data.push(data.total)
                })
              } else {
                let index = Math.floor(ary.length / this.color.length)
                ary.push({
                  name: data.tagName,
                  data: [data.total],
                  type: 'bar',
                  color:
                    index > 0
                      ? this.color[ary.length - this.color.length * index]
                      : this.color[ary.length],
                  stack: 'Ad',
                  emphasis: {
                    focus: 'series',
                  },
                })
              }
            })
            num.push(max)
          })
          this.options.yAxisData = [
            {
              name: this.$t('assets.dashboard.unit'),
              min: 0,
              max: Math.ceil((Math.max(...num) + 3) / 10) * 10,
              interval: Math.ceil((Math.max(...num) + 3) / 10),
            },
          ]
          this.options.seriesData = ary
          this.$set(this.options, 'axisLabel', {
            formatter: item => {
              let len =
                this.options.xAxisData.length < 10
                  ? 10
                  : this.options.xAxisData.length < 12
                  ? 6
                  : 3
              // const name = item.length > len ? item.substr(0, len) + '…' : item
              const name = item
              return name
            },
          })
          // 设置滚动条
          if (this.options.xAxisData.length > 10) {
            this.options.dataZoom = [this.slider1, this.inside]
          }
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
  },
  mounted() {
    this.getDataAsset()
  },
}
</script>

<style scoped lang="scss">
.picTil {
  font-size: 14px;
}
.overview {
  padding: 16px;
}
.nodata {
  width: 100%;
  height: 98%;
  display: flex;
  align-items: center;
  text-align: center;
}
.noresults {
  margin: 20px auto 0;
  text-align: center;
  .noresult-img {
    flex-direction: column;
  }
  p {
    display: block;
  }
}
</style>
