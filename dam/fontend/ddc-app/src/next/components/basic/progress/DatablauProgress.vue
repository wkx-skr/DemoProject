<template>
  <div class="datablau-progress">
    <el-progress
      v-bind="$attrs"
      :percentage="percent"
      :stroke-width="10"
    ></el-progress>
  </div>
</template>

<script>
export default {
  name: 'DatablauProgressed',
  props: {
    percent: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      screenHeight: null,
      maskHeight: null,
    }
  },
  computed: {
    getType() {
      if (['line', 'load', 'overall'].includes(this.type)) {
        return this.type
      } else {
        return 'line'
      }
    },
  },
  watch: {
    visible(val) {
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
      if (this.closeOnClickModal) {
        this.$parent.visible = false
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../color';
.datablau-progress {
  .progress-box {
    text-align: center;
    line-height: 24px;
    font-size: 12px;
    i {
      font-size: 20px;
    }
  }
  #progress-mask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 3000;
  }
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
      border: 1px solid #e9e9e9;
      margin: 0 auto;
      background: #fff;
      text-align: center;
      padding-top: 65px;
      box-sizing: border-box;
      color: $text-default;
      i {
        font-size: 34px;
        display: block;
        margin-bottom: 10px;
      }
      span {
        font-size: 12px;
        text-align: center;
      }
    }
  }
}
</style>
