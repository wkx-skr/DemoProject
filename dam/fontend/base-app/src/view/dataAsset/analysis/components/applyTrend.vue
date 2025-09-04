<template>
  <div style="background: #fff" class="ApplyTrend" v-loading="loading">
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.applyTrendUtil')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.applyTrendUtil') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.applyTrendUtil') }} -->
    </div>
    <template v-if="datas">
      <!--    数据资产申请趋势(ApplyTrend)-->
      <lineAndBarCom
        :picTil="$t('assets.dashboard.applyTrendUtil')"
        :options="options"
        containerRef="applyTrend"
        v-if="datas.length !== 0"
      ></lineAndBarCom>
      <div class="noData" v-else-if="!loading && datas.length === 0">
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
  name: 'ApplyTrend',
  components: { lineAndBarCom, isShowTooltip },
  data() {
    return {
      loading: false,
      datas: null,
      options: {
        legend: {
          top: 0,
          right: 0,
          itemHeight: 6,
          itemWidth: 17,
          fontSize: 12,
          width: '75%',
        },
        bottom: '10%',
        xAxisData: [],
        yAxisData: [
          {
            name: this.$t('assets.dashboard.unit'),
            min: 0,
            max: 120,
            interval: 20,
          },
        ],
        seriesData: [],
        axisLabel: {},
      },
      structureIdChange: this.$store.state.structureIdChange,
      color: {
        DATA_COLLECTION: '#409EFF',
        TABLE: '#409EFF',
        DATA_SERVICE: '#EF6666',
        DATA_OBJECT: '#C185F1',
      },
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (newVal, oldVal) {
        newVal && this.getAssetApplication(newVal)
      },
    },
  },
  methods: {
    getAssetApplication(id) {
      this.loading = true
      let xAxisData = []
      let seriesData = []
      this.datas = []
      id &&
        HTTP.getAssetApplication(id)
          .then(res => {
            this.datas = res.data.data instanceof Object ? [] : res.data.data
            // console.log(this.datas)
            let obj
            for (let key in this.datas) {
              obj = {
                name: this.getName(key),
                color: this.color[key],
                type: 'line',
                smooth: true,
                data: [],
              }
              this.datas[key].forEach((item, index) => {
                if (
                  key === AssetsTypeEnum.DATA_OBJECT ||
                  key === AssetsTypeEnum.DATA_COLLECTION ||
                  key === AssetsTypeEnum.TABLE ||
                  key === AssetsTypeEnum.DATA_SERVICE
                ) {
                  xAxisData.indexOf(this.time(item.createDate)) === -1 &&
                    xAxisData.push(this.time(item.createDate))
                }
                obj.data.push(item.applyNums)
              })
              seriesData.push(obj)
            }
            this.options.xAxisData = xAxisData
            this.options.seriesData = seriesData
            this.options.yAxisData = [
              {
                name: this.$t('assets.dashboard.unit'),
                min: 0,
                max: Math.ceil((Math.max(...obj.data) + 5) / 7) * 7,
                interval: Math.ceil((Math.max(...obj.data) + 5) / 7),
              },
            ]
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
    },
    time(time) {
      let ary = time.split('-')
      return `${ary[1]}月${ary[2]}日`
    },
    getName(val) {
      switch (val) {
        case AssetsTypeEnum.DATA_OBJECT:
          return this.$t('assets.generalSettings.object')
        case AssetsTypeEnum.DATA_COLLECTION:
          return this.$t('assets.generalSettings.table')
        case AssetsTypeEnum.TABLE:
          return this.$t('assets.generalSettings.table')
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
      this.getAssetApplication(this.$store.state.structureIdChange)
  },
}
</script>

<style scoped lang="scss">
.ApplyTrend {
  width: 100%;
  height: 100%;
}
.noData {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.noresults {
  margin: 0px auto 0;
  text-align: center;
  .noresult-img {
    flex-direction: column;
  }
  p {
    display: block;
    padding-left: 0;
  }
}
.picTil {
  color: #555555;
  font-size: 14px;
}
</style>
