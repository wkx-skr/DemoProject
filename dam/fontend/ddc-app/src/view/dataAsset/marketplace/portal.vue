<template>
  <div class="asset-portal">
    <div class="page-head">
      <div class="head-left">
        <img
          src="../../../assets/images/dataAssets/guanwang_white.png"
          style="height: 64px; margin-top: -6px"
          alt=""
        />
        <div
          class="portal-menu"
          @click="changeRouter('dataMarketplace')"
          :style="{
            color: currentRoute === 'dataMarketplace' ? '#fff' : '#D6DCEA',
          }"
          @mouseover="handleMenuHover(0)"
          @mouseleave="handleMouseLeave"
        >
          {{ $t('assets.marketplace.homeTitle') }}
        </div>
        <div
          class="portal-menu"
          :style="{
            color: currentRoute === 'assetSupermarket' ? '#fff' : '#D6DCEA',
          }"
          @click="changeRouter('assetSupermarket')"
          @mouseover="handleMenuHover(1)"
          @mouseleave="handleMouseLeave"
        >
          {{ $t('assets.marketplace.marketTitle') }}
        </div>
        <span
          class="active-bar disappear"
          style="--transition: all 0.3s; --width: 76px; --left: 304px"
        ></span>
      </div>
      <div class="head-right">
        <datablau-button
          type="primary"
          class="iconfont icon-cart-none cart-btn"
          @click="changeRouter('assetCart')"
        >
          {{ $t('assets.marketplace.cartTitle') }}
        </datablau-button>
        <datablau-button
          type="text"
          class="iconfont icon-menu-zlbg"
          @click="changeRouter('assetCart', { sub: 'newApply' })"
          style="
            color: #d6dcea;
            height: 32px !important;
            line-height: 32px !important;
          "
        >
          {{ $t('assets.marketplace.newApply') }}
        </datablau-button>
        <div class="others">
          <top-right-corner />
        </div>
      </div>
    </div>
    <div class="page-content">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive && isRouterAlive" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive && isRouterAlive"></router-view>
    </div>
  </div>
</template>

<script>
import TopRightCorner from './topRightCorner/topRightCorner.vue'
export default {
  name: 'CommonHead',
  components: { TopRightCorner },
  data() {
    return {
      currentRoute: 'assetHome',
      isRouterAlive: true,
    }
  },
  beforeMount() {
    // console.log(this.$route)
    this.currentRoute = this.$route.name
  },
  methods: {
    changeRouter(route, query) {
      console.log(query)
      this.currentRoute = route
      if (this.$route.name === route) {
        if (route == 'assetCart') {
          if (query === undefined) {
            if (this.$route.query && this.$route.query.sub) {
              this.$router.push({ name: route, query })
            } else {
              this.isRouterAlive = false
              this.$nextTick(() => {
                this.isRouterAlive = true
              })
            }
          } else {
            this.$router.push({ name: route, query })
          }
        } else {
          this.isRouterAlive = false
          this.$nextTick(() => {
            this.isRouterAlive = true
          })
        }
      } else {
        this.$router.push({ name: route, query })
      }
    },
    handleMenuHover(index) {
      $('.active-bar').removeClass('disappear')
      const dom = document.getElementsByClassName('portal-menu')[index]
      if (dom) {
        // console.log(dom, dom.clientWidth, dom.offsetLeft)
        $('.active-bar').css('--width', dom.clientWidth - 32)
        $('.active-bar').css('--left', dom.offsetLeft + 16)
        $('.active-bar').css('--transition', 'all .3s')
      }
    },
    handleMouseLeave() {
      $('.active-bar').addClass('disappear')
    },
  },
  watch: {
    $route: {
      handler() {
        this.currentRoute = this.$route.name
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.asset-portal {
  width: 100%;
  height: 100%;
  min-width: 1280px;
  overflow: hidden;

  .page-head {
    position: relative;
    width: 100%;
    height: 64px;
    padding: 0 16px;
    background-color: #16308b;
    background-image: url(../../../assets/images/dataAssets/portal/background.png);
    background-position: 0 -550px;
    background-size: 100%;

    .head-left {
      position: relative;
      display: inline-block;
      width: calc(100% - 350px);

      .portal-menu {
        display: inline-block;
        height: 64px;
        line-height: 58px;
        cursor: pointer;
        font-size: 16px;
        color: #d6dcea;
        position: relative;
        border-top: 3px solid transparent;
        touch-action: pinch-zoom;
        transition: color 0.3s;
        padding: 0 16px;
      }
      .active-bar {
        --width: 0;
        --left: 16;
        --transition: all 0.3s;
        background-color: #fff;
        top: 0;
        content: ' ';
        height: 0;
        height: 2px;
        left: var(--left);
        position: absolute;
        transition: var(--transition);
        width: var(--width);
        &.disappear {
          transform: rotateY(90deg);
        }
      }
      // .active-bar {
      //   position: absolute;
      //   top: -3px;
      //   left: 50%;
      //   width: 2px;
      //   height: 3px;
      //   background: transparent;
      //   transform: scaleX(0);
      //   opacity: 1;
      //   transition: all 0.4s;
      // }
      // &:hover {
      //   .active-bar {
      //     left: 0px;
      //     width: 100%;
      //     background: #fff;
      //     transform: scaleX(1);
      //     opacity: 1;
      //   }
      // }
    }
    .head-right {
      float: right;
      height: 64px;
      display: flex;
      align-items: center;

      .cart-btn {
        float: left;
        background: linear-gradient(227deg, #77d6ff 0%, #406aff 100%);
        border: none;
        border-radius: 4px;
      }
      .others {
        float: left;
      }
    }
  }
  .page-content {
    width: 100%;
    min-width: 1280px;
    overflow: auto;
    height: calc(100% - 64px);
    float: left;
    position: relative;
  }
}
</style>
