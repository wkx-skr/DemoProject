<!--柱状图和折线图 业务域数据资产覆盖统计  businessDomainCoverageStatistics -->
<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="'业务域数据资产覆盖统计'"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ '业务域数据资产覆盖统计' }}
        </template>
      </is-show-tooltip>
    </div>
    <template v-if="datas">
      <lineAndBarCom
        :picTil="'业务域数据资产覆盖统计'"
        :options="options"
        containerRef="businessDomainCoverage"
        v-if="datas.length !== 0"
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
    </template>
  </div>
</template>

<script>
import lineAndBarCom from './echartsCom/lineAndBarCom'
import HTTP from '../../utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'

export default {
  name: 'businessDomainCoverageStatistics',
  components: { lineAndBarCom, isShowTooltip },
  data() {
    return {
      loading: true,
      datas: null,
      options: {
        legend: {
          top: 0,
          right: 0,
          itemHeight: 6,
          itemWidth: 5,
          icon: '',
        },
        bottom: '10%',
        color: ['#4181F1', '#74A2F1'],
        xAxisData: [],
        yAxisData: [
          {
            name: '',
            min: 0,
            max: 100,
          },
        ],
        seriesData: [
          {
            name: '属性数',
            type: 'bar',
            data: [],
            color1: '#6e93f1',
            color2: '#6e93f1',
          },
          {
            name: '注册数',
            type: 'bar',
            data: [],
            color1: '#84d7ae',
            color2: '#84d7ae',
          },
          {
            name: '落标数',
            type: 'bar',
            data: [],
            color1: '#687695',
            color2: '#687695',
          },
          {
            name: '落标率',
            type: 'line',
            data: [],
            // color1: '#edbf46',
            // color2: '#edbf46',
            smooth: true,
          },
        ],
      },
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      this.datas = []
      HTTP.getGuanwangTotalAsset()
        .then(res => {
          // res.data.coverageList = [
          //   {
          //     Level1: 'DL1A', // 业务域名称
          //     count5InLevel1: 20, // 属性数
          //     reg5InLevel1: 40, // 注册数
          //     compliance5InLevel1: 30, // 落标数
          //     compliance5RateInLevel1: 44.5, // 落标率
          //   },
          //   {
          //     Level1: 'DL1B', // 业务域名称
          //     count5InLevel1: 110, // 属性数
          //     reg5InLevel1: 20, // 注册数
          //     compliance5InLevel1: 320, // 落标数
          //     compliance5RateInLevel1: 20.0, // 落标率
          //   },
          //   {
          //     Level1: 'DL1C', // 业务域名称
          //     count5InLevel1: 330, // 属性数
          //     reg5InLevel1: 20, // 注册数
          //     compliance5InLevel1: 30, // 落标数
          //     compliance5RateInLevel1: 30.0, // 落标率
          //   },
          // ]
          if (res.data.coverageList && res.data.coverageList.length > 0) {
            this.datas = res.data.coverageList
            const xData = []
            const data1 = []
            const data2 = []
            const data3 = []
            const data4 = []

            this.datas.forEach(item => {
              xData.push(item.Level1)
              data1.push(item.count5InLevel1)
              data2.push(item.reg5InLevel1)
              data3.push(item.compliance5InLevel1)
              data4.push(item.compliance5RateInLevel1)
            })

            this.options.xAxisData = xData
            this.options.seriesData[0].data = data1
            this.options.seriesData[1].data = data2
            this.options.seriesData[2].data = data3
            this.options.seriesData[3].data = data4
          }
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val) {
        val && this.fetchData(val)
      },
    },
  },
  mounted() {
    this.fetchData()
  },
}
</script>

<style scoped lang="scss">
.picBox {
  width: 100%;
  height: 100%;
  padding: 16px;
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
