<!-- 资产总量 -->
<template>
  <div style="background: #fff" class="flex itemAlign spaceBetween">
    <!--    数据资产总量(assetTotal)-->
    <div class="analysisLeft flex itemAlign">
      <div class="analysis flex itemAlign">
        <img src="/static/images/dataAssets/analysis.svg" alt="" />
        <div>
          <div class="sum">{{ $t('assets.dashboard.totalTil') }}</div>
          <p>{{ numFormat(total) }}</p>
        </div>
      </div>
    </div>
    <div class="iconbox flex itemAlign">
      <div v-for="item in list" :key="item.type">
        <div>
          {{ item.name }}
          <p>
            <img
              src="/static/images/dataAssets/file.svg"
              v-if="item.class.indexOf('allfile') !== -1"
              alt=""
              :class="item.class"
            />
            <img
              src="@/assets/images/search/view.svg"
              v-else-if="item.class.indexOf('view') !== -1"
              alt=""
              :class="item.class"
            />
            <i :class="item.class" v-else></i>
            <span>{{ numFormat(item.count) }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="flex itemAlign but">
      <datablau-button
        type="normal"
        @click="goOverview"
        v-if="$auth['DATA_ASSET_DOOR_MANAGE']"
      >
        {{ $t('assets.dashboard.butTil') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import HTTP from '../../utils/api'
import http from '@/http/main'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
export default {
  name: 'assetTotal',
  data() {
    return {
      total: 0,
      list: [
        {
          type: AssetsTypeEnum.TABLE,
          count: 0,
          class: 'iconfont icon-biao biao',
          name: this.$t('assets.generalSettings.table'),
        },
        {
          type: AssetsTypeEnum.VIEW,
          count: 0,
          class: 'view',
          name: this.$t('assets.generalSettings.view'),
        },
        {
          type: AssetsTypeEnum.DATA_OBJECT,
          count: 0,
          class: 'iconfont icon-ziduan ziduan',
          name: this.$t('assets.generalSettings.object'),
        },
        {
          type: AssetsTypeEnum.DATA_STANDARD,
          count: 0,
          class: 'iconfont icon-biaozhun biaozhun',
          name: this.$t('assets.generalSettings.basicStandard'),
        },
        {
          type: AssetsTypeEnum.DATA_STANDARD_CODE,
          count: 0,
          class: 'iconfont icon-daima biaozhun',
          name: this.$t('assets.generalSettings.standardCode'),
        },
        {
          type: AssetsTypeEnum.INDEX,
          count: 0,
          class: 'iconfont icon-zhibiao zhibiao',
          name: this.$t('assets.generalSettings.index'),
        },
        {
          type: AssetsTypeEnum.REPORT,
          count: 0,
          class: 'iconfont icon-baobiao baobiao',
          name: this.$t('assets.generalSettings.report'),
        },
        {
          type: AssetsTypeEnum.FILE,
          count: 0,
          class: 'allfile',
          name: this.$t('assets.generalSettings.file'),
        },
        {
          type: AssetsTypeEnum.DATA_SERVICE,
          count: 0,
          class: 'iconfont icon-shujufuwu shujufuwu',
          name: this.$t('assets.generalSettings.service'),
        },
      ],
      structureIdChange: this.$store.state.structureIdChange,
      structureId: '',
      flagList: [],
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        this.structureId = val
        val && this.getTotalAsset(val)
      },
    },
  },
  methods: {
    goOverview() {
      let id
      if (
        this.$store.state.structureIdChange &&
        this.$store.state.structureIdChange !== 'null'
      ) {
        id = this.$store.state.structureIdChange
      }
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      const url = `main/dataAsset/overview?structureId=${id}`
      window.open(baseUrl + url)
    },
    getName(val) {
      switch (val) {
        case AssetsTypeEnum.DATA_OBJECT:
          return {
            name: this.$t('assets.generalSettings.object'),
            class: 'iconfont icon-ziduan ziduan',
          }
        case AssetsTypeEnum.VIEW:
          return {
            name: this.$t('assets.generalSettings.view'),
            class: 'view',
          }
        case AssetsTypeEnum.TABLE:
          return {
            name: this.$t('assets.generalSettings.table'),
            class: 'iconfont icon-biao biao',
          }
        case AssetsTypeEnum.DATA_STANDARD:
          return {
            name: this.$t('assets.generalSettings.basicStandard'),
            class: 'iconfont icon-biaozhun biaozhun',
          }
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          return {
            name: this.$t('assets.generalSettings.standardCode'),
            class: 'iconfont icon-daima biaozhun',
          }
        case AssetsTypeEnum.INDEX:
          return {
            name: this.$t('assets.generalSettings.index'),
            class: 'iconfont icon-zhibiao zhibiao',
          }
        case AssetsTypeEnum.REPORT:
          return {
            name: this.$t('assets.generalSettings.report'),
            class: 'iconfont icon-baobiao baobiao',
          }
        case AssetsTypeEnum.FILE:
          return {
            name: this.$t('assets.generalSettings.file'),
            class: 'allfile',
          }
        case AssetsTypeEnum.DATA_SERVICE:
          return {
            name: this.$t('assets.generalSettings.service'),
            class: 'iconfont icon-shujufuwu shujufuwu',
          }
        default:
          return false
      }
    },
    getTotalAsset(id) {
      this.total = 0
      // this.$datablauLoading.loading({ color: '#409EFF' })
      id &&
        HTTP.getTotalAsset(id)
          .then(res => {
            // this.list = []
            res.data.data.forEach(item => {
              if (item.type !== null && this.getName(item.type)) {
                this.total += Number(item.count)
                let num = this.getIndex(item.type)
                let obj = {
                  type: item.type,
                  count: item.count,
                  name: this.getName(item.type).name,
                  class: this.getName(item.type).class,
                }
                this.list.splice(num, 1, obj)
              }
            })
            // this.$datablauLoading.close()
          })
          .catch(e => {
            this.$showFailure(e)
            // this.$datablauLoading.close()
          })
    },
    getIndex(type) {
      let num = -1
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].type === type) {
          num = i
          break
        }
      }
      return num
    },
    isNullorEmpty(str) {
      return str === '' || str === null || str === undefined || isNaN(str)
    },
    numFormat(num, str) {
      if (this.isNullorEmpty(num)) return '--'
      const isNegative = !(num >= 0)
      // 是否负数
      if (isNegative) num = Math.abs(Number(num))
      str = str || ''
      // var c=num && num != 0 ? Number(num).toFixed(len).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : '0';
      let c =
        num && num !== 0
          ? Number(num)
              .toString()
              .replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
          : '0'
      // 是否负数
      if (isNegative) c = '-' + c
      return str + c
    },
  },
  mounted() {
    this.$store.state.structureIdChange &&
      this.getTotalAsset(this.$store.state.structureIdChange)
  },
}
</script>

<style scoped lang="scss">
.flex {
  display: flex;
}
.itemAlign {
  align-items: center;
}
.spaceBetween {
  justify-content: space-between;
}
.analysisLeft {
  width: 210px;
  height: 100%;
  background: url('/static/images/dataAssets/analysisBg.svg') center right
    no-repeat;
  background-size: cover;
  padding-left: 30px;
}
.analysis {
  p {
    font-size: 16px;
  }
  img {
    margin-right: 15px;
  }
}
.iconbox {
  margin-left: 20px;
  width: 100px;
  flex: 1;
  & > div {
    font-size: 12px;
    color: #777;
    position: relative;
    width: 120px;
    padding: 0 24px 0 14px;
    flex: 1;
    & > div {
      width: 55px;
      margin: 0 auto;
    }
    /*margin: 0 25px;*/
    /*border-right: 1px solid #ddd;*/
    &:after {
      content: '';
      position: absolute;
      right: 0;
      top: 0px;
      width: 1px;
      height: 40px;
      background: #ddd;
    }
    p {
      margin-top: 2px;
      white-space: nowrap;
      i {
        margin-right: 6px;
      }
      i.shujufuwu {
        color: #ef6666 !important;
      }
      img.allfile,
      img.view {
        width: 16px;
        height: 16px;
        margin-right: 6px;
        position: relative;
        top: -3px;
      }
      span {
        font-size: 14px;
        color: #555555;
      }
    }
  }
  div:last-child:after {
    content: '';
    display: none;
  }
}
.but {
  width: 120px;
  margin-left: 62px;
  /*margin-right: 30px;*/
}
.sum {
  font-size: 14px;
}
</style>
