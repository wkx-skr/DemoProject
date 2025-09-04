<template>
  <div class="outer-box">
    <list class="list-box" ref="listBox"></list>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="right-box" ref="rightBox">
      <item></item>
    </div>
  </div>
</template>

<script>
import autonomousQuery from './autonomousQuery.js'
export default autonomousQuery
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.stack-pane {
  // 完全覆盖层
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  background-color: #fff;
}
.outer-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #fff;
  .list-box {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 280px;
  }
  .resize-column-middle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 282px;
    z-index: 2;
    width: 7px;
    cursor: e-resize !important;
    background-color: transparent;
  }
  .right-box {
    left: 280px;
    padding-left: 20px;
    //background-color: lightskyblue;
  }
}
</style>