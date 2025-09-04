<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <!--    各资产目录质量问题率-->
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.qualityProblemRateByCatalog')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.qualityProblemRateByCatalog') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.qualityProblemRateByCatalog') }} -->
    </div>
    <lineAndBarCom
      :picTil="$t('assets.dashboard.qualityProblemRateByCatalog')"
      :options="options"
      containerRef="catalogQualityProblem"
      v-if="datas && datas.length !== 0"
    ></lineAndBarCom>
    <div class="nodata" v-else-if="!loading && datas.length === 0">
      <div class="noresults">
        <div class="noresult-img">
          <img src="@/assets/images/search/no-result.svg" alt="" />
          <p>
            {{ $t('assets.dashboard.noData') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lineAndBarCom from './echartsCom/lineAndBarCom'
import HTTP from '../../utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'QualityProblemRate',
  components: { lineAndBarCom, isShowTooltip },
  data() {
    return {
      loading: true,
      options: {
        legend: {
          top: 0,
          right: 0,
          itemHeight: 6,
        },
        bottom: 20,
        axisLabel: {},
        xAxisData: [],
        yAxisData: [
          {
            name: this.$t('assets.dashboard.unit'),
            min: 0,
            max: 120,
            interval: 20,
          },
          // {
          //   min: 0,
          //   max: 90,
          //   interval: 15,
          //   name: this.$t('assets.dashboard.untilPercentage'),
          // },
        ],
        seriesData: [
          {
            type: 'bar',
            data: [80, 60, 100, 100, 100, 100, 100], // 80, 60, 100, 100, 100, 100, 100
            color1: 'rgba(64,158,255,1)',
            color2: 'rgba(64,158,255,0.4)',
            name: this.$t('assets.dashboard.amount'),
          },
          {
            data: [45, 30, 47, 45, 75, 60, 60], // 45, 30, 47, 45, 75, 60, 60
            color: '#C185F1',
            color1: '#C185F1',
            color2: 'rgba(193, 133, 241, 0.3)',
            name: this.$t('assets.dashboard.problem'),
            type: 'line',
            smooth: true,
          },
        ],
      },
      datas: [],
      structureIdChange: this.$store.state.structureIdChange,
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.catalogProblem(val)
      },
    },
  },
  methods: {
    catalogProblem(id) {
      this.loading = true
      let assetsNums = []
      let qualityNums = []
      let catalogName = []
      this.datas = null
      id &&
        HTTP.catalogProblem(id)
          .then(res => {
            this.datas = res.data.data || []
            res.data.data.forEach(item => {
              assetsNums.push(item.assetsNums)
              qualityNums.push(item.qualityNums)
              let names = ''
              // item.catalogName.length >= 6
              //   ? (names = item.catalogName.substr(0, 6) + '…')
              //   : (names = item.catalogName)
              names = item.catalogName
              catalogName.push(names)
            })
            let max = Math.max(
              ...assetsNums.map(item => String(item).length),
              ...qualityNums.map(item => String(item).length),
              3
            )
            let maxNum1 = Math.max(...assetsNums)
            let maxNum2 = Math.max(...qualityNums)
            let setOptions = {
              seriesData: [
                {
                  type: 'bar',
                  data: assetsNums, // 80, 60, 100, 100, 100, 100, 100
                  color1: 'rgba(64,158,255,1)',
                  color2: 'rgba(64,158,255,0.4)',
                  name: this.$t('assets.dashboard.amount'),
                },
                {
                  data: qualityNums, // 45, 30, 47, 45, 75, 60, 60
                  color: '#C185F1',
                  color1: 'rgba(193, 133, 241, 0.3)',
                  color2: 'rgba(193, 133, 241, 0.01)',
                  name: this.$t('assets.dashboard.problem'),
                  type: 'line',
                  smooth: true,
                },
              ],
              xAxisData: catalogName,
              yAxisData: [
                {
                  name: this.$t('assets.dashboard.unit'),
                  type: 'special',
                  min: 0,
                  max: Math.ceil((maxNum1 + 5) / 7) * 7,
                  interval: Math.ceil((maxNum1 + 5) / 7),
                },
                {
                  min: 0,
                  max: maxNum2,
                  max: Math.ceil((maxNum2 + 5) / 7) * 7,
                  interval: Math.ceil((maxNum2 + 5) / 7),
                  name: this.$t('assets.dashboard.untilPercentage'),
                },
              ],
              right: Math.max(String(maxNum2).length * 10, 25),
              left: Math.max(String(maxNum1).length * 10, 25),
            }
            this.setOpt(setOptions)
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
    },
    setOpt(obj) {
      for (let key in obj) {
        this.$set(this.options, key, obj[key])
      }
    },
  },
  mounted() {
    if (this.$store.state.structureIdChange) {
      this.catalogProblem(this.$store.state.structureIdChange)
    } else {
      this.loading = false
      this.datas = []
    }
  },
}
</script>

<style scoped lang="scss">
.picBox {
  padding: 16px 16px 8px 16px;
}
.picTil {
  font-size: 14px;
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
