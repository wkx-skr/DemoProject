<template>
  <div class="datablau-loading" v-if="show && loading">
    <div
      class="mask-box"
      id="mask-box"
      @click.stop="closeMask"
      :style="{
        cursor: defaultsOptions.closeOnClickModal ? 'pointer' : 'default',
        background: defaultsOptions.background,
      }"
    >
      <div class="load-box">
        <i
          class="iconfont icon-loadings"
          :style="{ color: defaultsOptions.color }"
        ></i>
        <span>{{ defaultsOptions.text }}</span>
      </div>
    </div>
  </div>
  <div class="datablau-message" v-else-if="show && message">
    <div class="message-box">
      <span>
        {{ defaultsOptions.text }}
        <i v-if="defaultsOptions.isIcon" class="iconfont icon-loading"></i>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    message: {
      type: Boolean,
      default: false,
    },
    defaultsOptions: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    show(val) {
      this.$nextTick(() => {
        this.setPossion()
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setPossion()
    })
    window.addEventListener('resize', this.setPossion)
  },
  destroyed() {
    window.removeEventListener('resize', this.setPossion)
  },
  methods: {
    setPossion() {
      this.screenHeight = $(window).height()
      this.maskHeight = $('#mask-box .load-box').height()
      $('#mask-box .load-box').css(
        'marginTop',
        (this.screenHeight - this.maskHeight) / 2 + 'px'
      )
    },
    closeMask() {
      if (this.defaultsOptions.closeOnClickModal) {
        this.$datablauLoading.close()
      }
    },
  },
}
</script>

<style lang="scss">
@import '../color';
.datablau-loading {
  #mask-box {
    cursor: pointer;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 3001;
    .load-box {
      width: 336px;
      height: 190px;
      margin: 0 auto;
      text-align: center;
      padding-top: 65px;
      box-sizing: border-box;
      color: $white;
      i {
        font-size: 34px;
        display: block;
        margin-bottom: 10px;
        animation: loading-rotate 2s linear infinite;
      }
      span {
        font-size: 12px;
        text-align: center;
      }
    }
  }
}
.datablau-message {
  position: fixed;
  top: 40px;
  left: 0;
  z-index: 3001;
  width: 100%;
  animation: mymove 0.2s linear;
  -webkit-animation: mymove 0.2s linear;
  .message-box {
    width: 300px;
    height: 50px;
    line-height: 50px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    border: 1px solid #d2d2d2;
    text-align: center;
    font-size: 12px;
    span {
      position: relative;
      padding-left: 30px;
      i {
        animation: loading-rotate 2s linear infinite;
        font-size: 20px;
        position: absolute;
        left: 0;
        top: 0px;
      }
    }
  }
}
@keyframes mymove {
  from {
    top: 0px;
  }
  to {
    top: 40px;
  }
}

@-webkit-keyframes mymove /*Safari and Chrome*/ {
  from {
    top: 0px;
  }
  to {
    top: 40px;
  }
}
// animation: loading-rotate 2s linear infinite;
@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }

  to {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>
