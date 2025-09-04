<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <!--    各资产目录质量问题率-->
    <div class="picTil" v-if="datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.analysis.qualityProblemRateByCatalog')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.analysis.qualityProblemRateByCatalog') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.analysis.qualityProblemRateByCatalog') }} -->
    </div>
    <lineAndBarCom
      :picTil="$t('assets.analysis.qualityProblemRateByCatalog')"
      :options="options"
      containerRef="catalogQualityProblem"
      v-if="datas.length !== 0"
    ></lineAndBarCom>
    <div class="nodata" v-else>
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
import lineAndBarCom from './echartsCom/lineAndBarCom'
import HTTP from '../../utils/api'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'QualityProblemRate',
  components: { lineAndBarCom, isShowTooltip },
  data() {
    return {
      loading: false,
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
      this.datas = []
      id &&
        HTTP.catalogProblem(id)
          .then(res => {
            this.datas = res.data.data || []
            // console.log(res, '-=-=-=-=-')
            res.data.data.forEach(item => {
              assetsNums.push(item.assetsNums)
              qualityNums.push(item.qualityNums)
              let names = ''
              item.catalogName.length >= 6
                ? (names = item.catalogName.substr(0, 6) + '…')
                : (names = item.catalogName)
              catalogName.push(names)
            })
            let max = Math.max(...assetsNums, ...qualityNums)
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
                  color1: '#C185F1',
                  color2: 'rgba(193, 133, 241, 0.3)',
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
                  max: Math.ceil((max + 5) / 7) * 7,
                  interval: Math.ceil((max + 5) / 7),
                },
              ],
            }
            this.setOpt(setOptions)
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
    },
    // time(time) {
    //   let ary = time.split('-')
    //   return `${ary[1]}月${ary[2]}日`
    // },
    setOpt(obj) {
      for (let key in obj) {
        this.$set(this.options, key, obj[key])
      }
    },
  },
  mounted() {
    this.$store.state.structureIdChange &&
      this.catalogProblem(this.$store.state.structureIdChange)
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
