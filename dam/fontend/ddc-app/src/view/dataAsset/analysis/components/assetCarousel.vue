<template>
  <div style="background: #fff" class="picBox">
    <!--    轮播图(AssetCarousel)-->
    <!-- <el-carousel trigger="click" class="carousel" arrow="never">
      <el-carousel-item>
        <funnelCom :picTil="$t('assets.dashboard.assetCarousel')"></funnelCom>
      </el-carousel-item>
      <el-carousel-item>
        <applyTrend></applyTrend>
      </el-carousel-item>
    </el-carousel> -->
    <funnelCom :picTil="$t('assets.dashboard.assetCarousel')"></funnelCom>
  </div>
</template>

<script>
import funnelCom from './echartsCom/funnelCom'
// import applyTrend from './applyTrend'
export default {
  name: 'assetCarousel',
  components: {
    funnelCom,
    // applyTrend
  },
  data() {
    return {}
  },
  methods: {},
  mounted() {},
}
</script>

<style scoped lang="scss">
.picBox {
  width: 100%;
  height: 100%;
  padding: 16px;
}
.carousel {
  height: 100%;
}
/deep/ .el-carousel__container {
  height: 100%;
}
/deep/.el-carousel__indicator button {
  width: 16px;
  height: 4px;
  border-radius: 3px;
  background: #dddddd;
}
/deep/.el-carousel__indicator.is-active button {
  background: #409eff;
}
</style>
