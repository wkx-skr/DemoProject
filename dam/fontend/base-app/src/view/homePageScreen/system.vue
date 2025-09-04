<template>
  <!--  <div class="system" v-loading="loading">-->
  <div class="system">
    <p class="titles">
      <i></i>
      数据资产涉及系统
    </p>
    <div class="imgs">
      <dl
        v-for="(item, index) in datas"
        :key="index"
        @click="clickDate(item.id, index)"
        class="circle-lable"
        :style="{ background: ColorList[index] }"
      >
        <dt>{{ item.modelCategoryCnt }}</dt>
        <dd class="lable-text">
          <span>{{ item.name }}</span>
        </dd>
      </dl>
      <div class="line-pepr"></div>
    </div>
    <div class="list">
      <div id="cartoon">
        <dl
          v-if="databas.length"
          v-for="(item, index) in databas"
          :key="index + item.name + item.modelCategory"
        >
          <dt>
            <img src="" alt="" />
          </dt>
          <dd :style="'border-color:' + ColorList[colorIndex] + ';'">
            <span
              class="spanColor"
              :style="'color:' + ColorList[colorIndex] + ';'"
            >
              {{ item.name }}
            </span>
            {{ item.modelCategory }}
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>
<script>
export default {
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
      databas: [],
      loading: true,
      ColorList: [
        '#AA68F7',
        '#7479FF',
        '#5638F8',
        '#5984F8',
        '#7B9FFF',
        '#1D8EFF',
        '#48D0FA',
        '#6ED1FD',
        '#62D1C0',
        '#1BDB99',
      ],
      colorIndex: 0,
    }
  },
  mounted() {
    // this.dataInit()
    // this.$bus.$on('embeddedDataLoaded11', this.dataInit)
  },
  beforeDestroy() {
    // this.$bus.$off('embeddedDataLoaded11', this.dataInit)
  },
  watch: {
    catalogData() {
      this.dataInit()
    },
  },
  methods: {
    dataInit() {
      // let data = localStorage.getItem('catalog')
      // if (data && this.$utils.isJSON(data)) {
      //   this.datas = JSON.parse(data)
      this.datas = this.catalogData
      this.datas = this.datas.filter((item, index) => index < 10)
      let arr = []
      if (this.datas[0] && this.datas[0].modelCategory) {
        for (var k = 0; k < this.datas[0].modelCategory.length; k++) {
          let obj = {
            name: this.datas[0].name,
            modelCategory: this.datas[0].modelCategory[k],
          }
          arr.push(obj)
        }
      }
      this.databas = arr
      this.$nextTick(() => {
        let rowupScrollTime = arr.length
        if (arr.length <= 4) return
        $('#cartoon').addClass('rowup')
        $('#cartoon').css('animation-duration', `${rowupScrollTime}s`)
      })
      this.loading = false
      // }
    },
    clickDate(id, colorIndex) {
      this.colorIndex = colorIndex
      let rowupClassName = $('#cartoon')[0].className.includes('rowupCopy')
      $('#cartoon').removeClass('rowupCopy')
      $('#cartoon').removeClass('rowup')
      let arr = []
      this.datas = this.datas.filter((item, index) => index < 10)
      for (var i = 0; i < this.datas.length; i++) {
        if (id == this.datas[i].id) {
          for (var k = 0; k < this.datas[i].modelCategory.length; k++) {
            let obj = {
              name: this.datas[i].name,
              modelCategory: this.datas[i].modelCategory[k],
            }
            arr.push(obj)
          }
        }
      }
      this.databas = arr

      this.$nextTick(() => {
        if (arr.length <= 4) return
        let rowupScrollTime = arr.length
        !rowupClassName && $('#cartoon').addClass('rowupCopy')
        rowupClassName && $('#cartoon').addClass('rowup')
        // 数据不同 动画时间均匀分配滚动速度不同bug
        $('#cartoon').css('animation-duration', `${rowupScrollTime}s`)
      })
    },
  },
}
</script>
<style scoped lang="scss">
.list {
  padding-left: 10px;
}
</style>
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
@keyframes rowupCopy {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
}
@keyframes rowup {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
}
.system {
  // height: px2Rem(450px);
  //background: var(--color-primary-darker-home);
  background: $color-primary-darker-home;
  //background: #1d1d1d;
  padding: px2Rem(10px) px2Rem(5px) px2Rem(10px) 0px;
  flex-grow: 1;
}
.list {
  // height: 56%;
  height: px2Rem(550px);
  width: 100%;
  position: relative;
  overflow: hidden;
  .rowup {
    // min-height: px2Rem(400px);
    -webkit-animation: 30s rowup linear infinite normal;
    animation: 30s rowup linear infinite normal;
    // animation-delay: 20s;
    position: relative;
  }
  .rowupCopy {
    // min-height: px2Rem(400px);
    -webkit-animation: 30s rowupCopy linear infinite normal;
    animation: 30s rowupCopy linear infinite normal;
    position: relative;
  }
}
.imgs {
  padding: 7px;
  position: relative;
  height: px2Rem(180px);
  //overflow: hidden;
  margin-bottom: px2Rem(10px);
  dl.circle-lable {
    float: left;
    width: 18%;
    margin-left: 6px;
    margin-top: 6px;
    cursor: pointer;
    border-radius: 4px;
    text-align: center;
    //color: var(--huaxia-system-color);
    //color: #fff;
    color: $huaxia-system-color;
    min-height: 15%;
    padding: 16% 0 0 0;
    position: relative;
    dt {
      font-size: 20px;
      position: absolute;
      top: 5px;
      width: 100%;
      text-align: center;
    }
    dd {
      position: absolute;
      width: 100%;
      height: px2Rem(18px);
      text-align: left;
      //top: px2Rem(42px);
      top: px2Rem(36px);
      span {
        display: block;
        //width: 150%;
        width: 130%;
        white-space: pre-wrap;
        height: px2Rem(18px);
        font-size: px2Rem(14px);
        margin-left: 50%;
        transform: translateX(-50%) scale(0.8);
        transform-origin: center;
        text-align: center;
      }
    }
  }
  dl {
    opacity: 0.9;
  }
}
.line-pepr {
  width: 93%;
  height: 1px;
  //background: var(--grey-split);
  //background: rgba(255, 255, 255, 0.12);
  background: $grey-split;
  position: absolute;
  bottom: 5px;
  margin-left: 5px;
}
@media only screen and (min-width: 1700px) {
  .line-pepr {
    bottom: 0px;
  }
  .imgs {
    height: 164px;
  }
}
@media only screen and (max-width: 1366px) {
  .line-pepr {
    bottom: 10px;
  }
  .imgs {
    height: 154px;
  }
}
.list {
  padding-top: 10px;
  dl {
    height: 25px;
    //background: var(--huaxia-list);
    //background: #333;
    background: $huaxia-list;
    margin-bottom: 15px;
    display: flex;
    dt {
      flex: 0 0 auto;
      img {
        width: 20px;
        margin: 5px 5px 0 5px;
      }
    }
    dd {
      flex: 1 1 auto;
      border-left: 2px solid #1d8eff;
      padding-left: 10px;
      float: left;
      line-height: 25px;
      //color: var(--huaxia-dlList-color);
      //color: rgba(255, 255, 255, 0.65);
      color: $huaxia-dlList-color;
    }
    .spanColor {
      color: #1d8eff;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .color {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.titles {
  i {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #3b8ab1;
    margin-right: 10px;
  }
}
</style>
