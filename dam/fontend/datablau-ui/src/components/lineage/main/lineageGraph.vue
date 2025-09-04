<template>
  <div
    class="graph-outer"
    :style="{ backgroundColor: pageColor }"
    @click="handleOuterClick"
  >
    <div class="legend-container">
    </div>
    <div id="loading-box" v-if="loading">
      <i class="el-icon-loading"></i>
      <div id="loading-progress"></div>
    </div>
    <div
      id="consa-graph"
      v-show="!loading"
      @mousedown="graphMousedown($event)"
      @mousemove="graphMousemove($event)"
      @mouseup="graphMouseup($event)"
      @scroll="graphScroll($event)"
      @contextmenu="onContextMenu"
      @dblclick="onDblClick($event)"
      :style="{
        cursor: dragInfo.dragFlag ? 'grabbing' : 'default',
      }"
    >
      <lineage-view
        ref="view"
        :graphType="graphType"
        :raw-data="rawData"
        :support-edit="supportEdit"
        @update-can-undo="updateCanUndo"
        @update-can-redo="updateCanRedo"
        @get-version-list="getVersionList"
        @dblclick="onDblClick($event)"
        @show-detail="showDetail"
        @remove-detail="removeDetail"
      ></lineage-view>
    </div>
    <mini-view ref="miniView" id="graph-outline" v-show="!loading"></mini-view>
    <detail-drawer ref="drawer"></detail-drawer>
  </div>
</template>
<script>
import lineageGraph from './lineageGraph.js'
export default lineageGraph
</script>
<style lang="scss" scoped>
.graph-outer {
  padding: 10px 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //background:#FFF;
  background-color: var(--default-bgc);
}
#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 20px;
  left: 20px;
  right: 20px;
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
  overflow: auto;
  &.to-top {
    top: 20px;
  }
}
#graph-outline {
  position: absolute;
  height: 200px;
  width: 300px;
  /*top: 100px;*/
  bottom: 40px;
  right: 38px;
  border: 1px solid gray;
  background: rgba(225, 225, 225, 0.8);
}
.legend-container {
  float: right;
  margin-top: 15px;
}
.graph-legend {
  display: inline-block;
  width: 80px;
  text-align: center;
  border: 1px solid #bfbfbf;
}
.title {
  font-size: 20px;
  font-weight: bold;
}
.subtitle {
  font-size: 18px;
  font-style: italic;
}
#graph-outline {
  position: absolute;
  height: 200px;
  width: 300px;
  /*top: 100px;*/
  bottom: 40px;
  right: 38px;
  border: 1px solid gray;
  background: #efefef;
  opacity: 0.8;
}
.btn-group {
  float: right;
}
#loading-box {
  width: 200px;
  height: 36px;
  position: absolute;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
  i {
    font-size: 36px;
  }
}
#consa-function {
  margin-top: 5px;
  height: 30px;
  line-height: 30px;
}
.textarea {
  position: absolute;
  width: 500px;
  right: 20px;
  top: 30px;
}
.tree-container {
  height: 300px;
  position: relative;
}
</style>
<style lang="scss">
//@import '~@service/lineage/asset/base';
</style>
