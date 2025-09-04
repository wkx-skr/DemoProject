<template>
  <div v-loading="loading">
    <div
      @click="put"
      class="reAnaButton"
      :style="{
        'border-color': lineageIsLoaded ? '#ddd' : '#409eff',
        color: lineageIsLoaded ? '#666' : '#409eff',
        cursor: lineageIsLoaded ? 'not-allowed' : 'pointer',
      }"
    >
      {{ $t('meta.DS.tableDetail.reAna') }}
    </div>
    <div
      style="width: 100%; background: #f7f7f7; padding: 20px; margin-top: 10px"
    >
      <div
        id="table-view-graph"
        style="
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
          height: 0;
          max-width: 900px;
        "
      >
        <canvas width="320" height="1000"></canvas>
      </div>
      <span style="color: #909399" v-if="!tables || tables.length === 0">
        {{ $t('meta.common.noMessage') }}
      </span>
    </div>
    <br />
    <!-- <el-button size="mini" type="text" @click="put" sytle="margin-top:10px;">{{$version.dataCatalog.tableDetail.reAna}}</el-button> -->
  </div>
</template>
<script>
import tableInView from './tableInView'
export default tableInView
</script>
<style lang="scss">
#table-view-graph {
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  position: relative;
  .line {
    position: absolute;
    display: inline-block;
    width: 2px;
    height: 2px;
    background-color: #696969;
  }
  .center-box1,
  .right-box1 {
    position: absolute;
    border-radius: 4px;
    .title {
      height: 25px;
      line-height: 25px;
      text-align: center;
      font-size: 14px;
      border-radius: 4px;
    }
  }
  .center-box1 {
    border: 1px solid #b2b7c2;
    .title {
      /*background: #d7e8ff;*/
    }
    left: 0;
  }
  .right-box1 {
    cursor: pointer;
    border: 1px solid #b2b7c2;
    left: 300px;
    .title {
      padding-left: 20px;
      background-position: 4px 4px;
      background-size: 18px;
      background-repeat: no-repeat;
    }
    &.table {
      border: 1px solid #509dea;
      .title {
        background-color: #d7e8ff;
        background-image: url('../../../../../assets/images/search/table.svg');
      }
    }
    &.view {
      border: 1px solid #4d82c1;
      .title {
        background-color: #dbe9f8;
        background-image: url('../../../../../assets/images/search/view.svg');
      }
    }
    &.storedProcedure {
      border: 1px solid #b262b2;
      .title {
        background-color: #f0e1f0;
        background-image: url('../../../../../assets/images/search/storedProcedure.svg');
      }
    }
    &.function {
      border: 1px solid #83bdd0;
      .title {
        background-image: url('../../../../../assets/images/search/function.svg');
      }
    }
  }
}
.reAnaButton {
  width: 100px;
  height: 30px;
  text-align: center;
  border: 1px solid #4386f5;
  line-height: 30px;
  color: #409eff;
  cursor: pointer;
  &:hover {
    color: #409eff;
    background: #ecf5ff;
    border-color: #4386f5;
  }
}
</style>
