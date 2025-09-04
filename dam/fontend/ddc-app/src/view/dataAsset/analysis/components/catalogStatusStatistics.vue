<template>
  <div style="background: #fff" class="picBox" v-loading="loading">
    <!--    资产目录发布状态占比统计-->
    <div class="picTil" v-if="!datas || datas.length === 0" style="width: 100%">
      <is-show-tooltip
        :content="$t('assets.dashboard.catalogStatusStatistics')"
        :open-delay="200"
        placement="top"
      >
        <template>
          {{ $t('assets.dashboard.catalogStatusStatistics') }}
        </template>
      </is-show-tooltip>
      <!-- {{ $t('assets.dashboard.catalogStatusStatistics') }} -->
    </div>
    <template v-if="datas">
      <pieChartCom
        :picTil="$t('assets.dashboard.catalogStatusStatistics')"
        :datas="datas"
        :options="options"
        :co="colors"
        :formatter="
          data => {
            return `{name|${data.data.name}}\n{value|${data.data.pre}}`
          }
        "
        v-if="datas.length !== 0"
      ></pieChartCom>
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
import pieChartCom from './echartsCom/pieChartCom'
import HTTP from '../../utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'assetTypeStatistics',
  components: { pieChartCom, isShowTooltip },
  data() {
    return {
      loading: true,
      datas: [],
      options: {
        center: ['50%', '50%'],
      },
      structureIdChange: this.$store.state.structureIdChange,
      color: {
        PUBLISHED: '#4181f1',
        UNDER_REVIEW: '#a2c1f6',
        UNPUBLISHED: '#D1DFFA',
        OFFLINE: '#74a2f1',
      },
      colors: [],
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.postStatus(val)
      },
    },
  },
  methods: {
    postStatus(id) {
      this.loading = true
      this.colors = []
      id &&
        HTTP.postStatus(id)
          .then(res => {
            let ary = []
            let sort = []
            // 已发布，下线，审核中，未发布
            res.data.data.forEach(item => {
              if (item.publishType === 'PUBLISHED') {
                sort.splice(0, 0, item)
              } else if (item.publishType === 'OFFLINE') {
                sort.splice(1, 0, item)
              } else if (item.publishType === 'UNDER_REVIEW') {
                sort.splice(1, 0, item)
              } else if (item.publishType === 'UNPUBLISHED') {
                sort.splice(3, 0, item)
              }
            })

            sort.forEach((item, index) => {
              let len = index < 3 ? (index + 3) * 8 : ((index + 2) / 2) * 8
              if (item.publishType !== null && this.getName(item.publishType)) {
                item.assetsNums !== 0 &&
                  ary.push({
                    value: item.assetsNums,
                    name: this.getName(item.publishType),
                    pre: item.ratio,
                    labelLine: {
                      length2: this.getName(item.publishType).length * 15,
                      length: len > 40 ? len / 2 : len,
                    },
                    label: {
                      padding: [
                        0,
                        -(this.getName(item.publishType).length * 15),
                      ],
                    },
                  })
                this.colors.push(this.color[item.publishType])
              }
            })
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
        case 'PUBLISHED':
          return this.$t('assets.dashboard.published')
        case 'UNDER_REVIEW':
          return this.$t('assets.dashboard.review')
        case 'UNPUBLISHED':
          return this.$t('assets.dashboard.unpublished')
        case 'OFFLINE':
          return this.$t('assets.dashboard.offline')
        default:
          return false
      }
    },
  },
  mounted() {
    if (this.$store.state.structureIdChange) {
      this.postStatus(this.$store.state.structureIdChange)
    } else {
      this.loading = false
      this.datas = []
    }
  },
}
</script>

<style scoped lang="scss">
.picBox {
  padding-top: 16px;
  padding-bottom: 16px;
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
