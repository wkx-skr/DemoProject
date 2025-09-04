<template>
  <div class="graph-outer" :style="{ backgroundColor: pageColor }">
    <div class="title" v-if="title">
      {{ title }}
    </div>
    <div id="loading-box" v-if="loading">
      <i class="el-icon-loading"></i>
      <div id="loading-progress"></div>
    </div>
    <div id="consa-graph" v-show="!loading"></div>
    <div id="graph-outline" v-show="!loading"></div>
    <div id="consa-function" v-show="!loading">

      <el-checkbox
        v-model="showFullProcess"
        v-show="param.developerMode"
        label="显示全部过程"
      ></el-checkbox>
      <el-input
        placeholder="copy your json here..."
        class="textarea"
        v-model="jsonData"
        @change="handleJson"
        v-show="param.developerMode"
        type="textarea"
      ></el-input>

      <el-checkbox v-model="param.showMiddleProcess" @change="paintGraph">
        显示加工过程
      </el-checkbox>
      <!--<el-checkbox-->
      <!--  v-model="param.showColumn"-->
      <!--  v-if="!disableShowColumn"-->
      <!--  @change="paintGraph"-->
      <!--&gt;-->
      <!--  显示字段-->
      <!--</el-checkbox>-->
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
  background-color: var(--default-bgc);
}

#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 47px;
  left: 20px;
  right: 20px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
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
  height: 12px;
  line-height: 12px;
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
</style>
