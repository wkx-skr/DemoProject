<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div
      class="picTil"
      v-if="!tabList || tabList.length === 0"
      style="width: 50%"
    >
      <!-- {{ $t('assets.dashboard.byDeptTil') }} -->
      <is-show-tooltip
        :content="$t('assets.dashboard.byDeptTil')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.byDeptTil') }}
        </template>
      </is-show-tooltip>
    </div>
    <template v-if="tabList">
      <!--    各部门数据资产分布(AssetDistributionByDept)-->
      <div class="tabChang">
        <span
          :class="{ active: tab === 'business' }"
          @click="tabCh('business')"
        >
          {{ $t('assets.dashboard.businessUnit') }}
        </span>
        <span
          :class="{ active: tab === 'tech' }"
          @click="tabCh('tech')"
          style="margin-right: 0"
        >
          {{ $t('assets.dashboard.technicalDepartment') }}
        </span>
      </div>
      <lineAndBarCom
        :picTil="$t('assets.dashboard.byDeptTil')"
        :options="options"
        :clear="clear"
        containerRef="deptAssetDistribution"
        v-if="tabList && tabList.length !== 0"
      ></lineAndBarCom>
      <div class="nodata" v-else-if="!loading && tabList.length === 0">
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
import HTTP from '../../utils/api'
import lineAndBarCom from './echartsCom/lineAndBarCom'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'AssetDistributionByDept',
  components: { lineAndBarCom, isShowTooltip },
  data() {
    return {
      loading: true,
      tab: 'business',
      clear: false,
      datas: [],
      tabList: null,
      options: {
        legend: {
          show: false,
        },
        bottom: '10%',
        xAxisData: [],
        yAxisData: [
          {
            name: this.$t('assets.dashboard.unit'),
            // min: 0,
            // max: 120,
            interval: 20,
          },
        ],
        seriesData: [
          {
            type: 'bar',
            data: [],
            color1: 'rgba(64,158,255,1)',
            color2: 'rgba(64,158,255,0.4)',
            name: this.$t('assets.dashboard.amount'),
          },
        ],
        axisLabel: {
          // interval: 0,
          // rotate: -40,
        },
      },
      structureIdChange: this.$store.state.structureIdChange,
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        if (val) {
          this.departmental(val)
          this.tab = 'business'
        } else {
          this.loading = false
        }
      },
    },
  },
  methods: {
    departmental(id) {
      this.loading = true
      this.tabList = []
      this.datas = []
      id &&
        HTTP.departmental(id)
          .then(res => {
            this.datas = res.data.data
            this.tabList = res.data.data.business || []
            this.tabListDealWith()
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
    },
    tabCh(val) {
      this.clear = true
      this.tabList = this.datas[val] || []
      this.tab = val
      this.tabListDealWith()
    },
    tabListDealWith() {
      this.options.xAxisData = []
      this.options.seriesData = []
      let nums = this.tab === 'tech' ? 'assetsNums' : 'assetsNums'
      let xAxisData = []
      let seriesData = []
      let max = 0
      this.tabList.forEach(item => {
        if (max < item.assetsNums) {
          max = item.assetsNums
        }
        let xdata = item.techDept || item.businessDept
        xAxisData.push(xdata)
        seriesData.push(item.assetsNums)
      })
      this.options.yAxisData = [
        {
          name: this.$t('assets.dashboard.unit'),
          min: 0,
          max: Math.ceil((Math.max(...seriesData) + 5) / 7) * 7,
          interval: Math.ceil((Math.max(...seriesData) + 5) / 7),
        },
      ]
      this.$set(this.options, 'xAxisData', xAxisData)
      this.$set(this.options, 'axisLabel', {
        formatter: item => {
          let len =
            this.tabList.length < 2 ? 10 : this.tabList.length < 4 ? 6 : 3
          let name = item.length > len ? item.substr(0, len) + '…' : item
          return name
        },
      })
      this.options.seriesData = [
        {
          type: 'bar',
          data: seriesData,
          color1: 'rgba(64,158,255,1)',
          color2: 'rgba(64,158,255,0.4)',
          name: this.$t('assets.dashboard.amount'),
        },
      ]
      this.$set(
        this.options,
        'left',
        Math.max(String(max).length * 10 + 10, 25)
      )
      this.clear = false
    },
  },
  mounted() {
    if (this.$store.state.structureIdChange) {
      this.departmental(this.$store.state.structureIdChange)
    } else {
      this.loading = false
      this.datas = []
      this.tabList = []
    }
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
