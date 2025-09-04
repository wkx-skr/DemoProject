<template>
  <el-transfer
    class="db-transfer"
    v-bind="$attrs"
    v-on="$listeners"
  ></el-transfer>
</template>

<script>
export default {
  name: 'DatablauTransfer',
  data() {
    return {}
  },
}
</script>

<style lang="scss">
.db-transfer {
  // 头部
  .el-transfer-panel__header {
    background-color: #f5f5f5;
    border-color: #d2d2d2;
    border-radius: 2px 2px 0 0;
  }
  // 过滤
  .el-transfer-panel__filter {
    margin: 10px 12px;
  }
  .el-transfer-panel__filter .el-input__inner {
    border-radius: 2px;
  }
  .el-input__icon {
    font-size: 16px;
  }
  .el-icon-search:before {
    font-family: 'iconfont', serif;
    content: '\e6e7';
  }
  .el-input--prefix .el-input__inner {
    padding-left: 32px;
  }
  .el-input__inner {
    height: 34px;
    line-height: 34px;
    border-radius: 2px;
    padding-left: 10px;
  }
  .el-input__prefix {
    left: 5px;
    top: 1px;
  }
  // 滚动条
  /*::-webkit-scrollbar-track {*/
  /*  width: 14px;*/
  /*  background-color: #efefef;*/
  /*  border: 1px solid #d2d2d2;*/
  /*  border-radius: 0;*/
  /*}*/
  /*::-webkit-scrollbar-thumb {*/
  /*  background-color: #c1c1c1;*/
  /*  border-radius: 4px;*/
  /*  width: 8px;*/
  /*  margin: 3px;*/
  /*}*/
  /*::-webkit-scrollbar {*/
  /*  width: 14px;*/
  /*  height: 8px;*/
  /*}*/
}
</style>
