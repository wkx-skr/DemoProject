<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <!-- {{ $t('assets.dashboard.published') }} -->
      <is-show-tooltip
        :content="$t('assets.dashboard.published')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.published') }}
        </template>
      </is-show-tooltip>
    </div>
    <template v-if="datas">
      <!--    数据资产类型统计(assetTypeStatistics)-->
      <pieChartCom
        :picTil="$t('assets.dashboard.published')"
        :datas="datas"
        :label="false"
        :options="options"
        :co="colors"
        :formatter="'{name|{b}}\n{value|{d}%}'"
        v-if="datas.length !== 0"
      ></pieChartCom>
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
    </template>
  </div>
</template>

<script>
import pieChartCom from './echartsCom/pieChartCom'
import HTTP from '../../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'assetTypeStatistics',
  components: { pieChartCom, isShowTooltip },
  data() {
    return {
      loading: false,
      datas: null,
      options: {
        round: {
          inner: ['15%', '20%'],
          outer: ['25%', '65%'],
        },
      },
      structureIdChange: this.$store.state.structureIdChange,
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
      colors: [],
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.getDistribution(val)
      },
    },
  },
  methods: {
    getDistribution(id) {
      this.loading = true
      this.colors = []
      id &&
        HTTP.getTotalAsset(id)
          .then(res => {
            let ary = []
            res.data.data.forEach((item, index) => {
              let len = ((index + item.count) * 10) / 4 + 2 * (index + 1)
              if (item.type !== null && this.getName(item.type)) {
                item.count !== 0 &&
                  ary.push({
                    value: item.count,
                    name: this.getName(item.type),
                    pre: item.ratio,
                  })
                this.colors.push(this.color[item.type])
              }
            })
            this.datas = ary
            // this.datas.label = false
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
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
        //   return this.$t('assets.generalSettings.standard')
        case AssetsTypeEnum.DATA_STANDARD:
          return this.$t('assets.generalSettings.basicStandard')
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          return this.$t('assets.generalSettings.standardCode')
        case AssetsTypeEnum.INDEX:
          return this.$t('assets.generalSettings.index')
        case AssetsTypeEnum.REPORT:
          return this.$t('assets.generalSettings.report')
        case AssetsTypeEnum.FILE:
          return this.$t('assets.generalSettings.file')
        case AssetsTypeEnum.DATA_SERVICE:
          return this.$t('assets.generalSettings.service')
        case AssetsTypeEnum.CATALOG:
          return this.$t('assets.generalSettings.none')
        default:
          return false
      }
    },
  },
  mounted() {
    this.$store.state.structureIdChange &&
      this.getDistribution(this.$store.state.structureIdChange)
  },
}
</script>

<style scoped lang="scss">
.picBox {
  padding: 16px 0;
}
.picTil {
  font-size: 14px;
  padding: 0 16px;
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
.nodata {
  width: 100%;
  height: 98%;
  display: flex;
  align-items: center;
}
</style>
