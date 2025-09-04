<template>
  <div class="my-done">
    <my-done></my-done>
  </div>
</template>

<script>
import myDone from '@/view/processControl/myDone.vue'
export default {
  components: {
    myDone
  }
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
$topLineH: 75px;
.my-done {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  background-color: #fff;

  /deep/ .my-done-tab {
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
