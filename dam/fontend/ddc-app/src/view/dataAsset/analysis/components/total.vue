<!-- 资产总量 -->
<template>
  <div style="background: #fff" class="flex itemAlign spaceBetween">
    <!--    数据资产总量(assetTotal)-->
    <div class="analysisLeft flex itemAlign">
      <div class="analysis flex itemAlign">
        <img src="@/assets/images/dataAssets/analysis.png" alt="" />
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
            <span>{{ numFormat(item.count) }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="flex itemAlign but">
      <datablau-button
        type="normal"
        :disabled="!Boolean(structureId)"
        @click="goOverview"
        v-if="$auth && $auth['DATA_ASSET_DOOR_MANAGE']"
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
          count: 0,
          name: '业务域',
          type: 'count1',
        },
        {
          count: 0,
          name: '主题域',
          type: 'count2',
        },
        {
          count: 0,
          name: '业务对象',
          type: 'count3',
        },
        {
          count: 0,
          name: '逻辑数据实体',
          type: 'count4',
        },
        {
          count: 0,
          name: '属性',
          type: 'count5',
        },
        {
          count: 0,
          name: '指标',
          type: 'count6',
        },
      ].filter(item => !!item),
      structureIdChange: this.$store.state.structureIdChange,
      structureId: '',
      flagList: [],
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        this.structureId = val
        this.list.forEach(item => (item.count = 0))
        val && this.getTotalAsset()
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
      window.open(
        this.BaseUtils.RouterUtils.getFullUrl('assetsSupermarket', {
          structure: id,
          blank: true,
        })
      )
      // const pos = location.href.indexOf('#/')
      // const baseUrl = location.href.slice(0, pos + 2)

      // const url = `main/dataAsset/overview?structureId=${id}`
      // window.open(baseUrl + url)
    },
    getTotalAsset() {
      this.total = 0
      HTTP.getGuanwangTotalAsset()
        .then(res => {
          this.total = res.data.count['count0']
          this.list.forEach(item => (item.count = 0))
          Object.keys(res.data.count).forEach(item => {
            this.list.forEach(count => {
              if (item === count.type) {
                count.count = res.data.count[item]
              }
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.$http
        .get(`/assets/labelDrop/getTechLabelDropModelCategoryCount`)
        .then(res => {
          this.list.forEach(item => {
            if (item.type === 'count6') {
              item.count = res.data
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
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
    this.getTotalAsset()
    if (this.$store.state.structureIdChange) {
      this.structureId = this.$store.state.structureIdChange
    }
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
  background: url('../../../../assets/images/dataAssets/analysisBg.svg') center
    right no-repeat;
  background-size: cover;
  padding-left: 30px;
  .analysis {
    img {
      width: 48px;
      height: 48px;
      display: block;
    }
  }
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
      width: 80px;
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
