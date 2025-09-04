<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <!-- {{ $t('assets.dashboard.assetDistriTil') }} -->
      <is-show-tooltip
        :content="$t('assets.dashboard.assetDistriTil')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.assetDistriTil') }}
        </template>
      </is-show-tooltip>
    </div>
    <template v-if="datas">
      <!--    资产目录数据资产分布(assetDistribution)-->
      <lineAndBarCom
        :picTil="$t('assets.dashboard.assetDistriTil')"
        :options="options"
        :formatter="true"
        containerRef="assetDistribution"
        v-if="datas.length !== 0"
      ></lineAndBarCom>
      <!--    <div class="echart-container">-->
      <!--      &lt;!&ndash;    <div class="picTil">{{ picTil }}</div>&ndash;&gt;-->
      <!--      <div class="echart-container" ref="echartsCon"></div>-->
      <!--    </div>-->
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
    </template>
  </div>
</template>

<script>
import lineAndBarCom from './echartsCom/lineAndBarCom'
import HTTP from '../../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'AssetDistribution',
  components: { lineAndBarCom, isShowTooltip },
  data() {
    return {
      loading: false,
      options: {
        legend: {
          top: 0,
          right: 0,
          itemHeight: 6,
          itemWidth: 5,
          icon: '',
          width: '65%',
        },
        bottom: '10%',
        axisLabel: {
          // interval: 0,
          // rotate: -40,
        },
        xAxisData: [],
        yAxisData: [
          {
            name: this.$t('assets.dashboard.unit'),
            min: 0,
            max: 120,
            interval: 20,
            // itemWidth: 16,
          },
        ],
        seriesData: [],
      },
      datas: null,
      color: {
        TABLE: '#409EFF',
        VIEW: '#4B5CC4',
        DATA_STANDARD: '#3BA272',
        DATA_STANDARD_CODE: '#9D5B8B',
        DATA_SERVICE: '#EF6666',
        DATA_OBJECT: '#C185F1',
        INDEX: '#FAC858',
        FILE: '#73C0DE',
        REPORT: '#92CC76',
      },
      numList: [],
      max: null,
      interval: null,
      structureIdChange: this.$store.state.structureIdChange,
      seriesDataLis: {
        DATA_OBJECT: {
          data: [],
          name: this.$t('assets.generalSettings.object'),
          color: '#C185F1',
        },
        DATA_SERVICE: {
          data: [],
          name: this.getName(AssetsTypeEnum.DATA_SERVICE),
          color: '#EF6666',
        },
        DATA_STANDARD: {
          data: [],
          name: this.getName(AssetsTypeEnum.DATA_STANDARD),
          color: '#3BA272',
        },
        DATA_STANDARD_CODE: {
          data: [],
          name: this.getName(AssetsTypeEnum.DATA_STANDARD_CODE),
          color: '#9D5B8B',
        },
        FILE: {
          data: [],
          name: this.getName(AssetsTypeEnum.FILE),
          color: '#73C0DE',
        },
        INDEX: {
          data: [],
          name: this.getName(AssetsTypeEnum.INDEX),
          color: '#FAC858',
        },
        REPORT: {
          data: [],
          name: this.getName(AssetsTypeEnum.REPORT),
          color: '#92CC76',
        },
        TABLE: {
          data: [],
          name: this.getName(AssetsTypeEnum.TABLE),
          color: '#409EFF',
        },
        VIEW: {
          data: [],
          name: this.getName(AssetsTypeEnum.VIEW),
          color: '#4B5CC4',
        },
      },
      arylist: [
        { type: AssetsTypeEnum.DATA_OBJECT, count: 0 },
        { type: AssetsTypeEnum.DATA_SERVICE, count: 0 },
        { type: AssetsTypeEnum.DATA_STANDARD, count: 0 },
        { type: AssetsTypeEnum.DATA_STANDARD_CODE, count: 0 },
        { type: AssetsTypeEnum.FILE, count: 0 },
        { type: AssetsTypeEnum.INDEX, count: 0 },
        { type: AssetsTypeEnum.REPORT, count: 0 },
        { type: AssetsTypeEnum.TABLE, count: 0 },
        { type: AssetsTypeEnum.VIEW, count: 0 },
      ],
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.catalogDataAsset(val)
      },
    },
  },
  methods: {
    catalogDataAsset(id) {
      this.loading = true
      this.datas = []
      this.options.seriesData = []
      for (let k in this.seriesDataLis) {
        this.seriesDataLis[k].data = []
      }
      id &&
        HTTP.catalogDataAsset(id)
          .then(res => {
            let datas = res.data.data
            for (let key in datas) {
              this.datas.push(key)
              this.countDealWith(datas[key])
            }
            this.options.xAxisData = this.datas
            for (let key in this.seriesDataLis) {
              this.options.seriesData.push({
                ...this.seriesDataLis[key],
                ...{ type: 'bar', stack: '1' },
              })
            }
            this.options.yAxisData = [
              {
                name: this.$t('assets.dashboard.unit'),
                min: 0,
                max: Math.ceil((Math.max(...this.numList) + 3) / 7) * 7,
                interval: Math.ceil((Math.max(...this.numList) + 3) / 7),
              },
            ]
            this.$set(this.options, 'axisLabel', {
              formatter: item => {
                let len =
                  this.datas.length < 2 ? 10 : this.datas.length < 4 ? 6 : 3
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
    countDealWith(ary) {
      this.arylist = [
        { type: AssetsTypeEnum.DATA_OBJECT, count: 0 },
        { type: AssetsTypeEnum.DATA_SERVICE, count: 0 },
        { type: AssetsTypeEnum.DATA_STANDARD, count: 0 },
        { type: AssetsTypeEnum.DATA_STANDARD_CODE, count: 0 },
        { type: AssetsTypeEnum.FILE, count: 0 },
        { type: AssetsTypeEnum.INDEX, count: 0 },
        { type: AssetsTypeEnum.REPORT, count: 0 },
        { type: AssetsTypeEnum.TABLE, count: 0 },
        { type: AssetsTypeEnum.VIEW, count: 0 },
      ]
      if (ary.length < 7) {
        ary.forEach(item => {
          this.arylist.forEach((k, index) => {
            if (item.type == k.type) {
              this.arylist.splice(index, 1, item)
            }
          })
        })
      } else {
        this.arylist = ary
      }
      let num = 0
      this.arylist.forEach((item, index) => {
        num += item.count
        this.seriesDataLis[item.type].data.push(item.count)
      })
      this.numList.push(num)
    },
    getName(val) {
      switch (val) {
        case AssetsTypeEnum.DATA_OBJECT:
          return this.$t('assets.generalSettings.object')
        case AssetsTypeEnum.TABLE:
          return this.$t('assets.generalSettings.table')
        case AssetsTypeEnum.VIEW:
          return this.$t('assets.generalSettings.view')
        // case AssetsTypeEnum.DOMAIN:
        //   return 'DOMAIN'
        case AssetsTypeEnum.DATA_STANDARD:
          return this.$t('assets.generalSettings.basicStandard')
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          return this.$t('assets.generalSettings.standardCode')
        // case 'DOCUMENT':
        //   return '本地文档'
        case AssetsTypeEnum.INDEX:
          return this.$t('assets.generalSettings.index')
        case AssetsTypeEnum.REPORT:
          return this.$t('assets.generalSettings.report')
        case AssetsTypeEnum.FILE:
          return this.$t('assets.generalSettings.file')
        case AssetsTypeEnum.DATA_SERVICE:
          return this.$t('assets.generalSettings.service')
        case 'CATALOG':
          return this.$t('assets.generalSettings.none')
      }
    },
  },
  mounted() {
    this.$store.state.structureIdChange &&
      this.catalogDataAsset(this.$store.state.structureIdChange)
  },
}
</script>

<style scoped lang="scss">
.picBox {
  padding: 16px;
}
.picTil {
  font-size: 14px;
}
.echart-container {
  width: 100%;
  height: 98%;
}
.nodata {
  width: 100%;
  height: 98%;
  display: flex;
  align-items: center;
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
