<template>
  <!--  <div class="doman" v-loading="loading">-->
  <div class="doman">
    <p class="titles">
      <i></i>
      N中心数据资产介绍
    </p>
    <div class="lists1">
      <dl v-for="(item, index) in dataList" :key="index">
        <dt
          :style="'border-top:3px solid' + item.color + ';'"
          @click="goTobusinessCatalog(item)"
        >
          <img :src="item.imgUrl" alt="" />
          <span>{{ item.name }}</span>
        </dt>
        <dd>
          <p class="lists1-item-content">
            {{ item.message }}
          </p>
        </dd>
      </dl>
    </div>
  </div>
</template>
<script>
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  props: {
    catalogData: {
      type: Array,
      default: () => {
        return []
      },
    },
    theme: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      datas: [],
      dlshow: false,
      loading: true,
      dataList: [
        {
          name: '对公业务中心',
          message:
            '通过对对公客户元数据的采集和管理，实现对公客户的基本信息、账户信息、合约信息、资产及统计信息、贷款管理等对公客户数据资产的管理、使用和服务。',
          color: '#9981FF',
          imgUrl: require('./image/产品信息中心.png'),
        },
        {
          name: '零售业务中心',
          message:
            '实现以零售客户为中心的客户信息元数据360视图，全面的提供客户的数据资产信息、为客户画像、客户资产管理、客户风险管理提供有效的数据资产支撑和数据资产查询服务。',
          color: '#C1A340',
          imgUrl: require('./image/投资者信息中心.png'),
        },
        {
          name: '风险管理中心',
          message:
            '汇集对公客户及零售客户的理财风险偏好、客户资产等级管理、客户信贷风险管理等风险数据资源，为对公、零售业务提供理财业务系统、信贷管理系统和信贷风险管理系统等风险数据资产的管理和应用。',
          color: '#1D8EFF',
          imgUrl: require('./image/交易信息中心.png'),
        },
        {
          name: '基础数据标准',
          message:
            '提供银行业零售、对公、风险管理等业务应用场景的基础数据标准，包括客户编号、客户全称、客户联系地址、客户联系电话、主账号、客户等级等数据标准信息，实现银行数据的标准化、统一管理、提升数据质量，加强工作效率。',
          color: '#48DDD7',
          imgUrl: require('./image/资讯中心.png'),
        },
        {
          name: '指标数据标准',
          message:
            '制定符合行内实际情况的数据指标标准、反映行内业务的生产运营情况，满足行内的经营管理需求、为银行的决策支持提供充分的数据支撑。',
          color: '#80C7EF',
          imgUrl: require('./image/行情中心.png'),
        },
        {
          name: '帐卡信息统计',
          message:
            '通过对行内的银行客户和银行卡信息的统计，实时了解行内的客户及银行卡的增长和汇总情况，能更好的实现以客户为中心的运营管理。',
          color: '#36D0FF',
          imgUrl: require('./image/员工信息中心.png'),
        },
        {
          name: '报表类数据',
          message:
            '通过对行内的银行零售客户信息、对公客户信息和银行卡等关键指标进行统计，可帮助行内用户快速了解行内客户、卡数量、交易额、存贷款计划完成情况等指标监控。',
          color: '#95E09B',
          imgUrl: require('./image/另类数据中心.png'),
        },
        {
          name: '文件类资产',
          message:
            '通过资产目录可快速查询部门的管理规章制度，系统操作流程等文件资产。',
          color: '#33DD8E',
          imgUrl: require('./image/指标中心.png'),
        },
      ],
    }
  },
  watch: {
    catalogData() {
      this.dataInit()
    },
  },
  mounted() {
    // this.dataInit()
    // this.$bus.$on('embeddedDataLoaded', this.dataInit)
  },
  beforeDestroy() {
    // this.$bus.$off('embeddedDataLoaded', this.dataInit)
  },
  methods: {
    dataInit() {
      // let data = localStorage.getItem('catalog')
      // if (data && this.$utils.isJSON(data)) {
      // this.datas = JSON.parse(data)
      this.datas = this.catalogData
      this.datas = this.datas.filter((item, index) => index < 8)
      this.loading = false
      // }
    },
    goTobusinessCatalog(item) {
      return
      // console.log(item)
      item.name !== '指标中心' &&
        this.$router.push('/main/embeddedModule?currentNav=businessCatalog')
      item.name === '指标中心' &&
        this.$router.push({
          name: 'embeddedModule',
          query: {
            iframeNav: '/main/index',
          },
        })
    },
  },
}
</script>
<style lang="scss">
@import './theme/dark.sass';
//@import './theme/default.sass';

@function px2Rem($px, $base-font-size: 16px) {
  @if (unitless($px)) {
    //有无单位
    @return ($px / 19.2) * 1rem;
  } @else if (unit($px) == em) {
    @return $px;
  }
  @return ($px / $base-font-size) * 1rem;
}
// @keyframes rowup {
//   0% {
//     -webkit-transform: translate3d(0, 0, 0);
//     transform: translate3d(0, 0, 0);
//   }
//   100% {
//     -webkit-transform: translate3d(0, -307px, 0);
//     transform: translate3d(0, -307px, 0);
//     display: none;
//   }
// }
.doman {
  height: px2Rem(299px);
  //background-color: var(--color-primary-darker-home);
  //background-color: #1d1d1d;
  background-color: $color-primary-darker-home;
  padding: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.lists1 {
  height: 80%;
  padding: 0 10px;
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  dl {
    width: 24%;
    height: 45%;
    dt {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 20%;
      //background-color: var(--huaxia-list);
      //background-color: #333;
      background-color: $huaxia-list;
      //color: var(--huaxia-home-doman-title);
      //color: rgba(255, 255, 255, 0.8);
      color: $huaxia-home-doman-title;
      font-weight: bold;
      font-size: px2Rem(13px);
      box-sizing: border-box;
      padding-left: px2Rem(3px);
      margin-top: px2Rem(5px);
      margin-bottom: 5px;
      cursor: pointer;
      img {
        flex-shrink: 0;
        vertical-align: middle;
        width: px2Rem(25px);
        margin-right: 5px;
      }
      .color-box {
        flex-shrink: 0;
        width: 10px;
        height: 10px;
        margin-left: 3px;
        margin-right: 3px;
      }
      span {
        flex-shrink: 0;
        // width: 100px;
      }
    }
    dd {
      box-sizing: border-box;
      padding: px2Rem(8px) 0 px2Rem(8px) px2Rem(8px);
      height: 80%;
      line-height: 35px;
      //background-color: var(--huaxia-list);
      background-color: $huaxia-list;
      //color: var(--huaxia-home-doman-content);
      //color: rgba(255, 255, 255, 0.6);
      color: $huaxia-home-doman-content;
      font-size: px2Rem(12px);
      overflow: hidden;
      position: relative;
      .lists1-item-content {
        max-height: 100%;
        overflow-y: auto;
        font-size: 10px;
        line-height: 1.5;
        //  transform-origin: left top;
        // transform: scale(.8);
      }
      .lists1-item-content::-webkit-scrollbar {
        width: 5px;
      }
      //  .rowup{
      //      -webkit-animation: 10s rowup linear infinite normal;
      //      animation: 10s rowup linear infinite normal;
      //      position: relative;
      //  }
      // ul {
      //   padding-bottom: 10px;
      // }
      // li{
      //   height: 23px;
      //   line-height: 23px;
      //   font-size: 12px;
      //   overflow:hidden;
      //   text-overflow:ellipsis;
      //   white-space:nowrap;
      // }
    }

    // dd::-webkit-scrollbar {
    //   /*滚动条整体样式*/
    //   width : 5px;  /*高宽分别对应横竖滚动条的尺寸*/
    //   height: 1px;
    // }
    // dd::-webkit-scrollbar-thumb {
    //   /*滚动条里面小方块*/
    //   border-radius: 10px;
    //   box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
    //   background   : #535353;
    // }
    // dd::-webkit-scrollbar-track {
    //   display: none;
    // }
  }
  // dl:nth-child(1){
  //     // margin-left: 10px;
  //     dt{
  //        border-top:3px solid #8387FF;
  //     }
  // }
  // dl:nth-child(2){
  //     dt{
  //        border-top:3px solid #1D8EFF;
  //     }
  // }
  // dl:nth-child(3){
  //     dt{
  //         img{

  //         }
  //        border-top:3px solid #36D0FF
  //     }
  // }
  // dl:nth-child(4){
  //     margin-right:0;
  //     dt{
  //        border-top:3px solid #5BE8E3;
  //     }
  // }
}
.titles {
  //   padding-top: 20px;
  //   background: #fff;
  i {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #3b8ab1;
    margin-right: 10px;
  }
}
</style>
