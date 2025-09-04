<template>
  <div class="overview" style="background: #fff" v-loading="loading">
    <!--数据资产分级情况-->
    <div class="title-tip">
      <datablau-tooltip
        effect="dark"
        content="【业务部门/业务系统】中，已有安全分级的数据资产统计情况"
        placement="right"
        style="margin-right: 6px"
      >
        <i class="iconfont icon-tips"></i>
      </datablau-tooltip>
    </div>
    <div class="picTil" v-if="datas.length === 0">数据资产分级情况</div>
    <div class="tabChang">
      <span :class="{ active: tab === 'business' }" @click="tabCh('business')">
        业务部门
      </span>
      <span
        :class="{ active: tab === 'system' }"
        @click="tabCh('system')"
        style="margin-right: 0"
      >
        业务系统
      </span>
    </div>
    <lineAndBarCom
      :picTil="'数据资产分级情况'"
      :options="options"
      :clear="clear"
      :formatter="true"
      :yCategory="true"
      :yAxisDataLabel="false"
      containerRef="assetClassification"
      v-if="datas.length !== 0"
    ></lineAndBarCom>
    <div class="nodata" v-if="!loading && datas.length === 0">
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
      datas: [],
      loading: false,
      tab: 'business',
      clear: false,
      options: {
        legend: {
          top: 25,
          left: 0,
          itemHeight: 10,
          itemWidth: 10,
          icon: '',
          itemGap: 16,
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
        left: '11%',
        axisLabel: {
          // interval: 0,
          // rotate: -40,
        },
        xAxisData: [],
        yAxisData: [
          {
            name: '',
            min: 0,
            max: 7,
            interval: 50,
            // itemWidth: 16,
          },
        ],
        seriesData: [],
        // dataZoom: [],
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
      inside: {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true, // 鼠标移动能触发数据窗口平移
        moveOnMouseWheel: true,
      },
      slider2: {
        type: 'slider',
        zoomLock: true,
        show: true,
        yAxisIndex: 0,
        start: 100,
        end: 60,
        backgroundColor: '#F5F5F5', // 两边未选中的滑动条区域的颜色
        fillerColor: '#ddd', // 滚动条颜色
        borderColor: '#F5F5F5',
        filterMode: 'empty',
        width: 12,
        height: '80%',
        showDataShadow: false,
        top: '18%',
        right: '0%',
        handleSize: 0, // 两边手柄尺寸
        showDetail: false, // 拖拽时是否展示滚动条两侧的文字
      },
    }
  },
  methods: {
    tabCh(val) {
      this.tab = val
      this.clear = true
      if (val === 'system') {
        this.getSystemAsset()
      } else {
        this.getbusinessAsset()
      }
    },
    getbusinessAsset() {
      this.loading = true
      this.datas = []
      HTTP.getbusinessAsset()
        .then(res => {
          let ary = []
          this.datas = Object.keys(res.data.data)
          let data = res.data.data
          this.options.xAxisData = Object.keys(data)
          let num = []
          Object.keys(data).forEach(k => {
            let max = 0
            Object.keys(data[k]).forEach(keys => {
              let findAry = ary.filter(item => item.name === keys)
              max += data[k][keys]
              if (findAry.length) {
                ary.forEach(item => {
                  item.name === keys && item.data.push(data[k][keys])
                })
              } else {
                let index = Math.floor(ary.length / this.color.length)
                ary.push({
                  name: keys,
                  data: [data[k][keys]],
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
              name: '',
              min: 0,
              max: Math.ceil((Math.max(...num) + 3) / 10) * 10,
              interval: Math.ceil((Math.max(...num) + 3) / 10),
            },
          ]
          this.options.seriesData = ary
          this.$set(this.options, ' ', {
            formatter: item => {
              let len = 6
              let name = item.length > len ? item.substr(0, len) + '…' : item
              return name
            },
          })
          // 设置滚动条
          if (this.options.xAxisData.length > 6) {
            this.options.dataZoom = [this.inside, this.slider2]
          }
          this.loading = false
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    getSystemAsset() {
      this.datas = []
      this.loading = true
      HTTP.getSystemAsset()
        .then(res => {
          let ary = []
          let xAxisData = []
          this.datas = res.data.data
          this.datas.forEach(item => {
            xAxisData.push(item.categoryName)
          })
          this.options.xAxisData = xAxisData
          let num = []
          // Object.keys(this.datas).forEach(k => {
          for (let k = 0; k < xAxisData.length; k++) {
            let max = 0
            this.datas[k].statistics.forEach(keys => {
              let findAry = ary.filter(item => item.name === keys.name)
              max += keys.total
              if (findAry.length) {
                ary.forEach(item => {
                  item.name === keys.name && item.data.push(keys.total)
                })
              } else {
                let index = Math.floor(ary.length / this.color.length)
                ary.push({
                  name: keys.name,
                  data: [keys.total],
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
          }
          // })
          this.options.yAxisData = [
            {
              name: '',
              min: 0,
              max: Math.ceil((Math.max(...num) + 3) / 7) * 7,
              interval: Math.ceil((Math.max(...num) + 3) / 7),
            },
          ]
          this.options.seriesData = ary
          this.$set(this.options, 'axisLabel', {
            formatter: item => {
              let len = 6
              let name = item.length > len ? item.substr(0, len) + '…' : item
              return name
            },
          })
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
  },
  mounted() {
    this.getbusinessAsset()
  },
}
</script>

<style scoped lang="scss">
.overview {
  padding: 16px;
  position: relative;
  .title-tip {
    position: absolute;
    top: 16px;
    left: 135px;
    height: 24px;
    width: 24px;
    line-height: 24px;
    text-align: center;
    z-index: 9;
    cursor: pointer;
    i {
      font-size: 14px;
      color: #999;
    }
  }
}

.picTil {
  font-size: 14px;
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
.tabChang {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 111;
  span {
    margin-right: 10px;
    cursor: pointer;
  }
  span.active {
    color: #409eff;
    position: relative;
    &:after {
      content: '';
      display: block;
      width: 50px;
      height: 1px;
      background: #409eff;
      position: absolute;
      bottom: -3px;
      left: 0;
    }
  }
}
</style>
