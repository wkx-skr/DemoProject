<template>
  <div class="graph-outer" :style="{ backgroundColor: pageColor }">
    <div class="top-header-info-panel-wrapper" v-if="false">
      <el-checkbox v-model="showMiddleProcess" @change="changeParams('showMiddleProcess')">显示加工过程</el-checkbox>

    </div>
    <div class="lineage-container model-lineage-outer">
      <lineage
        :getLineageDataPromise="getLineageDataPromise"
        :disableShowColumn="true"
        :showMiddleProcess="showMiddleProcess"
        ref="lineageComponent"
      ></lineage>
    </div>
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
  //border: 1px solid red;
  background-color: var(--default-bgc);

  .lineage-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    //border: 1px solid red;
    &.model-lineage-outer {
      top: 40px;
    }
  }
}

#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 85px;
  left: 20px;
  right: 20px;
  border: 1px solid gray;
  overflow: auto;

  &.to-top {
    top: 20px;
  }
}

.legend-container {
  float: right;
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
  width: 300px;
  right: 20px;
  top: 30px;
}

.tree-container {
  height: 300px;
  position: relative;
}

.top-header-info-panel-wrapper {
  position: absolute;
  left: 260px;
  right: 20px;
  top: 0;
  height: 34px;
  padding-top: 5px;

}

</style>
