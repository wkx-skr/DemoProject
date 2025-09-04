<template>
  <div class="datablau-loading">
    <div class="loading-wrapper">
      <div class="loading-content">
        <span>
          <i class="iconfont icon-loadings"></i>
        </span>
        <p>{{ title }}</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return { title: '加载中,请稍后...' }
  },
}
</script>
<style lang="scss" scoped>
@import '../../color';
.datablau-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
}
.loading-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  //   width: 100%;
  //   height: 100%;
  .loading-content {
    width: 100%;
    text-align: center;
    .title {
      line-height: 20px;
      font-size: 12px;
      margin: 0;
    }
    span {
      position: relative;
      padding-left: 30px;
      color: #555555;
      i {
        animation: loading-rotate 2s linear infinite;
        font-size: 20px;
        position: absolute;
        left: 0;
        top: 0px;
        color: $primary-color;
      }
    }
    p {
      color: $text-default;
      margin-top: 10px;
    }
  }
}
@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
