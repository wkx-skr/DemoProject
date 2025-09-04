<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.ratioTil')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.ratioTil') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.ratioTil') }} -->
    </div>
    <template v-if="datas">
      <!--    数据资产安全等级占比统计(SecurityLevelRatio)-->
      <pieChartCom
        :picTil="$t('assets.dashboard.ratioTil')"
        :datas="datas"
        :label="false"
        :co="colors"
        :options="options"
        :formatter="
          data => {
            return `{name|${data.data.name}}\n{value|${data.data.pre}}{pre|${data.data.values}}`
          }
        "
        v-if="datas.length !== 0"
      ></pieChartCom>
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
import pieChartCom from './echartsCom/pieChartCom'
import HTTP from '../../utils/api'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'SecurityLevelRatio',
  components: { pieChartCom, isShowTooltip },
  data() {
    return {
      loading: false,
      datas: null,
      options: {
        roseType: 'radius',
        round: { inner: ['15%', '17%'], outer: ['20%', '60%'] },
      },
      colors: [
        '#FF2E2E',
        '#FF8632',
        '#FFC009',
        '#92CC76',
        '#56B0F4',
        '#409EFF',
        '#406EFF',
      ],
      structureIdChange: this.$store.state.structureIdChange,
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.getSecurityLevel(val)
      },
    },
  },
  methods: {
    getSecurityLevel(id) {
      this.loading = true
      id &&
        HTTP.getSecurityLevel(id)
          .then(res => {
            this.datas = []
            let maxData =
              res.data.data.sort((a, b) => {
                return b.count - a.count
              })[0]?.count / 2
            res.data.data.forEach((item, index) => {
              let len = (index * 10) / 4 + 5
              let accessCode =
                item.accessCode || this.$t('assets.dashboard.securityLevel')
              this.datas.push({
                value: item.count + maxData,
                values: item.count,
                name: accessCode,
                pre: item.ratio,
              })
              // this.datas.label = false
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
    this.$store.state.structureIdChange &&
      this.getSecurityLevel(this.$store.state.structureIdChange)
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
