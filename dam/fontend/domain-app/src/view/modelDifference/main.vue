<template>
  <div id="outer">
    <div class="search-box">
      <input type="text" v-model="keyword" placeholder="可以输入关键字搜索" />
    </div>
    <div class="tree-item table-header show-table-head-tooltip">
      <span>对象类型</span>
      <el-tooltip effect="light" :content="data.rightObject" placement="top">
        <span class="right">{{ data.rightObject }}</span>
      </el-tooltip>
      <el-tooltip effect="light" :content="data.leftObject" placement="top">
        <span class="left">{{ data.leftObject }}</span>
      </el-tooltip>
    </div>
    <div
      style="
        position: absolute;
        bottom: 10px;
        left: 20px;
        right: 20px;
        top: 100px;
        overflow: auto;
      "
    >
      <el-tree
        ref="tree1"
        class="light-blue-tree"
        :data="tableData"
        v-loading="treeLoading"
        :props="businessDefaultProps"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
        :expand-on-click-node="true"
        :default-expand-all="false"
        :render-content="renderContent"
      ></el-tree>
    </div>
  </div>
</template>

<script>
import modelCompare from './modelCompare.js'
export default modelCompare
</script>

<style lang="scss">
body {
  background: #fff;
}
#outer {
  margin: 20px;
  background: #fff;
}
.tree-item {
  width: 100%;
  /*flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;*/
  span.left {
    text-align: center;
    float: right;
    width: 240px;
    margin-right: 30px;
  }
  span.right {
    text-align: center;
    float: right;
    width: 40%;
  }
}
</style>
<style lang="scss" scoped>
@import '../../assets/styles/const.scss';
.table-header {
  background-color: $blue;
  color: #fff;
  padding: 10px 20px 5px;
  span:first-child {
    margin-left: 2em;
  }
}
</style>
