<template>
  <div class="overview" style="background: #fff" v-loading="loading">
    <!--数据资产分级概览-->
    <pieChartCom
      v-if="!!datas.length"
      :picTil="'数据资产分级概览'"
      :datas="datas"
      :label="false"
      :options="options"
      :co="colors"
    ></pieChartCom>
    <div class="picTil" v-if="datas.length === 0">数据资产分级概览</div>
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
import pieChartCom from '@/view/dataAsset/analysis/components/echartsCom/pieChartCom'
import HTTP from '../util/api'
export default {
  components: { pieChartCom },
  data() {
    return {
      datas: [],
      colors: [
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
      options: {
        round: {
          inner: ['35%', '35%'],
          outer: ['35%', '80%'],
        },
        legend: {
          right: '50',
          bottom: '0',
          // type: 'scroll',
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 10,
          top: 'center',
          orient: 'vertical',
          pageTextStyle: {
            fontSize: 0,
          },
          tooltip: {
            show: true,
            trigger: 'item',
            textStyle: {
              fontSize: 12,
            },
            formatter: data => {
              if (data.name.length > 10) {
                return data.name
              }
            },
          },
          formatter: data => {
            if (data) {
              return data.length > 10 ? data.substr(0, 10) + '…' : data
            }
          },
          pageIcons: {
            vertical: [
              'path://M0.779518793,5.85231646 L5,1.19196369 L9.2204812,5.85231646 C9.3988069,6.04922781 9.68793,6.04922781 9.8662557,5.85231646 C10.0445814,5.65540509 10.0445814,5.3361487 9.8662557,5.13923734 L5.34583415,0.147683475 C5.25083335,0.042781475 5.12438723,-0.006235325 5,0.000633075 C4.87561277,-0.006235325 4.74916665,0.042781475 4.65416585,0.147683475 L0.133744283,5.13923734 C-0.0445814275,5.3361487 -0.0445814275,5.65540509 0.133744283,5.85231646 C0.312069993,6.04922781 0.601193083,6.04922781 0.779518793,5.85231646 Z',
              'path://M0.779518793,0.147683495 L5,4.80803627 L9.2204812,0.147683495 C9.3988069,-0.049227865 9.68793,-0.049227865 9.8662557,0.147683495 C10.0445814,0.344594855 10.0445814,0.663851255 9.8662557,0.860762615 L5.34583415,5.85231648 C5.25083335,5.95721848 5.12438723,6.00623528 5,5.99936688 C4.87561277,6.00623528 4.74916665,5.95721848 4.65416585,5.85231648 L0.133744283,0.860762615 C-0.0445814275,0.663851255 -0.0445814275,0.344594855 0.133744283,0.147683495 C0.312069993,-0.049227865 0.601193083,-0.049227865 0.779518793,0.147683495 Z',
            ],
          },
          pageIconColor: '#409EFF', // 可以点击的翻页按钮颜色
          pageIconInactiveColor: '#DDDDDD', // 禁用的按钮颜色
          pageIconSize: 15, // 这当然就是按钮的大小
        },
        center: ['33%', '50%'],
      },
      loading: false,
    }
  },
  methods: {
    getClassification() {
      this.datas = []
      this.loading = true
      HTTP.getClassification()
        .then(res => {
          let obj = res.data.data
          Object.keys(obj).forEach(key => {
            !!Number(obj[key].split('_')[1]) &&
              this.datas.push({
                value: Number(obj[key].split('_')[1]),
                name: key,
              })
          })
          if (this.datas.length > 15) {
            this.options.legend.type = 'scroll'
            this.options.legend.top = '0'
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
    this.getClassification()
  },
}
</script>

<style scoped lang="scss">
.overview {
  padding: 16px 0;
}

.picTil {
  font-size: 14px;
  padding-left: 16px;
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
