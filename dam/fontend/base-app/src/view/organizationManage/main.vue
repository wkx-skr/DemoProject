<template>
  <div class="manage-box">
    <list
      class="left-tree"
      ref="tree"
      @addSame="addSame"
      @addNext="addNext"
      @deleteDate="deleteDate"
    ></list>
    <div class="manage-line"></div>
    <div class="right-table">
      <tab-pane
        :addData="addData"
        @refreshTree="refreshTree"
        ref="tabPane"
      ></tab-pane>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped>
.left-tree {
  position: absolute;
  left: 0;
  width: 280px;
  top: 0;
  bottom: 0;
  z-index: 2;
  /* border: 1px solid var(--border-color-lighter);
  border-left: none;
  border-right: none; */
  background-color: var(--default-bgc);
}
.manage-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 280px;
  width: 10px;
  z-index: 5;
  cursor: e-resize !important;
  background-color: transparent;
}
.right-table {
  background: #faffcb;
  position: absolute;
  left: 281px;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: var(--default-bgc);
  z-index: 3;
}
.el-input {
  width: 350px;
}
.title-1 {
  font-size: 16px;
  font-weight: bold;
}
.title-2 {
  margin: 20px 0 30px 30px;
  font-size: 14px;
  font-weight: bold;
}
.add-organization {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  padding: 20px;
  background: #fff;
}
.bottom-btn {
  margin: 30px 0 0 35px;
}
</style>
