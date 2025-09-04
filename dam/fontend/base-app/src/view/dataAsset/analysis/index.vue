<!-- 数据资产--资产分析 -->
<template>
  <div class="bigBox" style="width: 100%; height: 100%">
    <data-asset-dashboard></data-asset-dashboard>
  </div>
</template>

<script>
import DataAssetDashboard from '@/view/dashboard5.7/api/dataAssetDashboard.vue'
export default {
  name: 'AssetAnalysis',
  components: { DataAssetDashboard },
  data() {
    return {}
  },
}
</script>

<style scoped lang="scss">
/deep/.el-select .el-input input {
  border: 0;
  width: 100%;
  background: #409eff;
  color: #fff;
  padding-left: 10px;
  height: 29px;
  line-height: 29px;
  margin-top: 6px;
  border-radius: 3px;
  &::-webkit-input-placeholder {
    color: #fff !important;
  }
}
/deep/ .el-select .el-input span i {
  line-height: 29px;
  margin-top: 3px;
  color: #fff;
}
/deep/ .el-select .el-input.is-focus .el-select__caret {
  color: #fff;
}
/deep/.el-select .el-input .el-select__caret {
  color: #fff;
}
/deep/ .el-select:hover .el-input .el-select__caret {
  color: #fff;
}
</style>
