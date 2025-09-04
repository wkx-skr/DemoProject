<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <!--    数据资产质量问题率(QualityProblemRate)-->
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.quality')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.quality') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.quality') }} -->
    </div>
    <template v-if="datas">
      <lineAndBarCom
        :picTil="$t('assets.dashboard.quality')"
        :options="options"
        containerRef="qualityProblem"
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
    </template>
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
        bottom: 18,
        right: 20,
        axisLabel: {},
        xAxisData: [],
        yAxisData: [
          {
            name: this.$t('assets.dashboard.unit'),
            min: 0,
            max: 120,
            interval: 20,
          },
          {
            min: 0,
            max: 90,
            interval: 15,
            name: this.$t('assets.dashboard.untilPercentage'),
          },
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
      datas: null,
      structureIdChange: this.$store.state.structureIdChange,
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.numberOfQuality(val)
      },
    },
  },
  methods: {
    numberOfQuality(id) {
      this.loading = true
      let qualityNums = []
      let qualityRatio = []
      let dayTime = []
      this.datas = []
      id &&
        HTTP.numberOfQuality(id)
          .then(res => {
            this.datas = res.data.data || []
            res.data.data.forEach(item => {
              qualityNums.push(item.qualityNums)
              qualityRatio.push(item.assetsNums)
              dayTime.push(this.time(item.dayTime))
            })
            const maxNum = Math.ceil((Math.max(...qualityNums) + 5) / 7) * 7
            let setOptions = {
              seriesData: [
                {
                  type: 'bar',
                  data: qualityRatio, // 80, 60, 100, 100, 100, 100, 100
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
              xAxisData: dayTime,
              yAxisData: [
                {
                  name: this.$t('assets.dashboard.unit'),
                  type: 'special',
                  min: 0,
                  max: Math.ceil((Math.max(...qualityRatio) + 5) / 7) * 7,
                  interval: Math.ceil((Math.max(...qualityRatio) + 5) / 7),
                },
                {
                  type: 'special',
                  min: 0,
                  max: maxNum,
                  interval: Math.ceil((Math.max(...qualityNums) + 5) / 7),
                  name: this.$t('assets.dashboard.untilPercentage'),
                },
              ],
              right: String(String(maxNum).length * 5 + 25),
            }
            this.setOpt(setOptions)
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
    setOpt(obj) {
      for (let key in obj) {
        this.$set(this.options, key, obj[key])
      }
    },
  },
  mounted() {
    this.$store.state.structureIdChange &&
      this.numberOfQuality(this.$store.state.structureIdChange)
  },
}
</script>

<style scoped lang="scss">
.picBox {
  padding: 16px 16px 12px 16px;
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
