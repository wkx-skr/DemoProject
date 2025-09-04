<template>
  <!-- 数据资产注册状态占比 -->
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.registrationStatus')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.registrationStatus') }}
        </template>
      </is-show-tooltip>
    </div>
    <template v-if="datas">
      <!--    数据资产注册状态占比(registrationStatus)-->
      <pieChartCom
        :picTil="$t('assets.dashboard.registrationStatus')"
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
              {{ $t('assets.dashboard.noData') }}
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
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'registrationStatus',
  components: { pieChartCom, isShowTooltip },
  data() {
    return {
      loading: true,
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
        DATA_OBJECT: '#C185F1',
        INDEX: '#FAC858',
        REPORT: '#92CC76',
        FILE: '#73C0DE',
        METAMODEL_OBJECT: '#10578a',
      },
      colors: [],
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.getDistribution()
      },
    },
  },
  methods: {
    getDistribution() {
      this.loading = true
      this.colors = []
      this.datas = []
      HTTP.getGuanwangTotalAsset()
        .then(res => {
          let ary = []
          ary.push({
            value: res.data.registrationPct.regY,
            name: '已注册',
            pre:
              (res.data.registrationPct.regY /
                (res.data.registrationPct.regY +
                  res.data.registrationPct.regN)) *
              100 + '%',
          })
          this.colors.push('#6e94f3')
          ary.push({
            value: res.data.registrationPct.regN,
            name: '未注册',
            pre:
              (res.data.registrationPct.regN /
                (res.data.registrationPct.regY +
                  res.data.registrationPct.regN)) *
              100 + '%',
          })
          this.colors.push('#84d7ae')
          this.datas = ary
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
        case AssetsTypeEnum.CATALOG:
          return this.$t('assets.generalSettings.none')
        case AssetsTypeEnum.META_MODEL:
          return '自定义对象'
        default:
          return false
      }
    },
  },
  mounted() {
    this.getDistribution()
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
