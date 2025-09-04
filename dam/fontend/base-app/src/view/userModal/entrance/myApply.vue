<template>
  <div class="user-workbench-apply">
    <my-apply></my-apply>
  </div>

</template>

<script>
import myApply from '@/view/processControl/myApply.vue'
export default {
  components: {
    myApply
  }
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
$topLineH: 75px;
.user-workbench-apply {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  background-color: #fff;
  
  /deep/ .my-apply-tab {
    left: 0px;
  }
  /deep/ .tab-top-line {
    position: absolute;
    top: 0;
    left: 20px;
    right: 0;
    height: $topLineH;

    .tab-title {
      height: 40px;
      line-height: 40px;
      font-weight: 600;
      font-size: 16px;
      color: #555;

      .el-icon-refresh:hover {
        color: $primary-color;
      }
    }

    .top-line-inner {
      width: 100%;
    }

    .search-input {
      max-width: 200px;
      display: inline-block;
    }

    .button-container {
      float: right;
      padding-right: 20px;
    }
  }
}
</style>
