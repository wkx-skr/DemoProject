<template>
  <!--  <div class="data-assert-center-count" v-loading="loading">-->
  <div class="data-assert-center-count">
    <!--    <div
      class="show"
      style="position: relative"
      :class="{
        'dark-img-outer': themeName === 'dark',
        'light-img-outer': themeName !== 'dark',
      }"
    >-->
    <div class="show dark-img-outer" style="position: relative">
      <div class="img-outer">
        <!-- <div class="bg-container"></div> -->

        <video
          width="100%"
          height="100%"
          :src="theme === 'dark' ? videoUrl : lightVideoUrl"
          autoplay="autoplay"
          loop="loop"
          muted="muted"
        ></video>
        <!--        <video
          width="100%"
          height="100%"
          :src="videoUrl"
          autoplay="autoplay"
          loop="loop"
          muted="muted"
        ></video>-->
      </div>
      <div class="title-box" style="float: left">
        <p class="titles">
          <i></i>
          数据资产总览
        </p>
      </div>
      <!-- <p style="position: absolute;right: 26px;top: 0px;z-index:999">
               <el-button class="more-btn" type="text" @click="gobusiness" icon="el-icon-position" style="height: 40px; border: none;font-size: 12px;">探索更多</el-button>
             </p> -->
      <div class="dls">
        <dl style="position: absolute" class="des-label">
          <dt><img src="~@/assets/images/system_count_list.png" alt="" /></dt>
          <dd>
            <span>数据源</span>
            <span>{{ listCount.modelCnt }}</span>
            <span>个</span>
          </dd>
        </dl>
        <dl style="position: absolute">
          <dt><img src="./image/产品.svg" alt="" /></dt>
          <dd>
            <span>数据表</span>
            <span>{{ listCount.tableCnt }}</span>
            <span>张</span>
          </dd>
        </dl>
        <dl style="position: absolute">
          <dt><img src="~@/assets/images/col_with_alias_rate.png" alt="" /></dt>
          <dd>
            <span>字段信息项</span>
            <span>{{ listCount.columnCnt }}</span>
            <span>个</span>
          </dd>
        </dl>
        <dl style="position: absolute">
          <dt><img src="~@/assets/images/search/domain.png" alt="" /></dt>
          <dd>
            <span>数据标准项</span>
            <span>{{ listCount.domainCnt + listCount.meCodeCnt }}</span>
            <span>个</span>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>
<script>
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  props: {
    conList: {
      type: Object,
      default: () => {
        return {}
      },
    },
    theme: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      listCount: {},
      loading: true,
      videoUrl: require('./image/card.mp4'),
      lightVideoUrl: require('./image/card-light-2.mp4'),
    }
  },
  watch: {
    conList() {
      this.dataInit()
    },
  },
  created() {},
  mounted() {
    // this.dataInit()
    // this.$bus.$on('embeddedDataLoaded', this.dataInit)
  },
  beforeDestroy() {
    // this.$bus.$off('embeddedDataLoaded', this.dataInit)
  },
  methods: {
    dataInit() {
      // let data = localStorage.getItem('conList')
      // if (data && this.$utils.isJSON(data)) {
      // this.listCount = JSON.parse(data)
      this.listCount = this.conList
      this.loading = false
      // }
    },
    gobusiness() {
      let heas = this.$router.resolve({ path: 'meta' })
      localStorage.removeItem('status')
      window.open(heas.href, '_blank')
    },
  },
}
</script>
<style scoped lang="scss">
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
.data-assert-center-count {
  height: px2Rem(470px);
  margin-bottom: px2Rem(20px);
  //background-color: var(--color-primary-darker-home);
  //background-color: #1d1d1d;
  background-color: $color-primary-darker-home;
  .more-btn {
    border-color: transparent;
    //color: var(--ddc-nav-color);
    //color: #6f94b0;
    color: $ddc-nav-color;
    &:hover {
      //color: var(--ddc-nav-hover-color);
      //color: #4588bf;
      color: $ddc-nav-hover-color;
    }
  }
  .show {
    overflow: hidden;
    width: 100%;
    height: 100%;
    // &.dark-img-outer {
    //   background: url('./image/card.gif') center center no-repeat;
    //   background-size: 120%;
    // }
    // &.light-img-outer {
    //   background: url('./image/card-light.gif') center center no-repeat;
    //   background-size: 120%;
    // }
    .img-outer {
      position: absolute;
      top: 0;
      left: -10%;
      margin: auto;
      width: 120%;
      height: 100%;
      .bg-container {
        //border: 1px solid green;
        width: 70%;
        //padding-top: 50%;
        height: 100%;
        display: inline-block;
      }
    }
  }
}
</style>
<style lang="scss">
@import './theme/dark.sass';
//@import './theme/default.sass';

.title-box {
  position: absolute;
}
.dls {
  //color: var(--ddc-header-color);
  //color: #f1f5f7;
  color: $ddc-header-color;
  dl {
    position: absolute;
    // padding: 10px 48px 10px 10px;
    width: 35%;
    // height: 50px;
    background: url('./image/bg.png') 0 0 no-repeat;
    background-size: 100%;
    background-color: $color-primary-darker-home;

    // opacity: 0.3;
    img {
      width: 26px;
      margin-top: 6px;
      margin-left: 11px;
      margin-right: 5px;
      vertical-align: middle;
    }
    dt {
      float: left;
    }
    dd {
      float: left;

      span {
        display: inline-block;
        line-height: 36px;
        text-align: center;
      }
      span:nth-child(1) {
        // font-size: 14px;
        //color: var(--ddc-header-color);
        //color: #f1f5f7;
        color: $ddc-header-color;
      }
      span:nth-child(2) {
        // font-size: 14px;
        font-size: 28px;
        //color: var(--ddc-header-color);
        //color: #f1f5f7;
        color: $ddc-header-color;
        font-size: 15px;
      }
    }
  }
  dl:nth-child(1) {
    top: 16%;
    left: 3%;
    img {
      margin-left: 45px;
    }
    // top: 80px;
    // left: 400px;
  }
  dl:nth-child(2) {
    top: 16%;
    right: 4%;
    img {
      margin-left: 40px;
    }
  }
  dl:nth-child(3) {
    bottom: 7%;
    right: 4%;
    img {
      margin-left: 20px;
    }
  }
  dl:nth-child(4) {
    bottom: 7%;
    left: 3%;
    img {
      margin-left: 40px;
    }
  }
  @media (min-width: 1500px) {
  }
}
@keyframes a {
  form {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(36000deg);
  }
}
@keyframes b {
  form {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-36000deg);
  }
}
/* @import './css/zhengfu.css'; */
</style>
