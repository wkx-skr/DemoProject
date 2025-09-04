<template>
  <div class="graph-outer" v-loading="loadingGraph">

    <div class="button-left" v-if="hoverErrorMsg === '' && showLineage "  style="display: inline-block;padding-top: 6px;">
      <datablau-checkbox
      :checkboxType="'single'"
          style="margin-left: 10px;display: inline-block"
          v-model="optionslineage.showFullProcess"
          :label="$t('meta.lineageManage.graph.wholeProcess')"
          :themeBlack="true"
        ></datablau-checkbox>
        <datablau-checkbox
          v-model="optionslineage.showColumn"
          :checkboxType="'single'"
          :themeBlack="true"
          style="margin-left: 10px;display: inline-block"
        >
          {{ $t('meta.lineageManage.graph.showColumn') }}
        </datablau-checkbox>
    </div>
    <div class="hidden-btn">
      <span
        class="full-screen-btn"
        @click="showFullScreenDialog"
        v-if="hoverErrorMsg === ''"
      >
        <datablau-tooltip
          content="全屏"
          placement="bottom"
        >
        <i class="iconfont icon-fangda1"></i>
        </datablau-tooltip>
      </span>
      <datablau-button
        @click="hiddenLineageTab"
        size="small"
        type="icon"
        class="icon el-icon-minus"
      >
      </datablau-button>
    </div>
    <el-dialog
      :visible.sync="showDialog"
      append-to-body
      custom-class="lineage-full-dialog"
      @close="showDialogClose"
    >
    <div class="button-left" style="display: inline-block;position: absolute;
    top: 10px;z-index: 99;">
      <datablau-checkbox
      style="margin-left: 10px;display: inline-block"
          v-model="optionslineage.showFullProcess"
          :label="$t('meta.lineageManage.graph.wholeProcess')"
          :checkboxType="'single'"
          :themeBlack="true"
        ></datablau-checkbox>
        <datablau-checkbox
        style="margin-left: 10px;display: inline-block"
          v-model="optionslineage.showColumn"
          :checkboxType="'single'"
          :themeBlack="true"
        >
          {{ $t('meta.lineageManage.graph.showColumn') }}
        </datablau-checkbox>
    </div>
      <datablau-lineage
      :dataWarehouse="dataWarehouse"
          class="lineage"
          ref="lineage"
          :theme="'black'"
          :themeBlack="true"
          v-if="JSON.stringify(rawData) !== '{}' && typeLineage==='2'"
          :rawData="rawData"
          :options="optionslineage"
          :consagraphTop="30"
          style="position: absolute;
    top: 14px;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;"
        ></datablau-lineage>
    </el-dialog>
    <div class="lineage-container model-lineage-outer" v-if="hoverErrorMsg === ''">
      <div class="scroll-outer">
        <datablau-lineage
        :dataWarehouse="dataWarehouse"
          class="lineage"
          ref="lineage"
          :theme="'black'"
          :themeBlack="true"
          v-if="JSON.stringify(rawData) !== '{}' && typeLineage==='1'"
          :rawData="rawData"
          :options="optionslineage"
          :consagraphTop="0"
          style="position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;"
        ></datablau-lineage>
      </div>
    </div>
    <div class="no-data" v-if="!sql">
      <div class="center-content">
        <datablau-icon :data-type="'no-result'" icon-type="svg" :size="80"></datablau-icon>
      </div>
    </div>
    <div v-if="hoverErrorMsg !== ''" class="errorMessage">
      <div class="errorImg" style="position: absolute;top: 30px;">
        <img src="./errorimg.png">
      </div>
      <p style="    position: absolute;
    top: 122px;
    left: 20px;
    right: 20px;
    bottom: 0px;
    overflow: auto;">{{ hoverErrorMsg }}</p>
    </div>
  </div>
</template>
<script>
import lineageComponent from './lineageComponent.js'

export default lineageComponent
</script>
<style lang="scss">
.lineage-full-dialog {
  //border: 1px solid red;
  background: #222222;
  margin-top: 0 !important;
  height: 100vh;
  // width: 98%;
  .el-loading-mask{
    background-color: rgba(0, 0, 0, .5) !important;
    color: #bbb;
  }

  // margin: 66px auto 20px;
  position: relative;

  &.el-dialog {
    overflow: visible;
    // max-height: 90%;
    width: 100%;
  }

  .el-dialog__header {
    position: relative;

    .el-dialog__headerbtn {
      position: absolute;
      right: 12px;
      top: 6px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      // background-color: #fffffc;
      color: #777;
      z-index: 2;
      i{
        font-size: 20px;
      }
    }
  }

  .dialog-container {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    &.lineage-fullscreen-dialog {
      padding: 10px 0 0 20px;

      .hide-dialog-btn {
        position: absolute;
        border: 1px solid red;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        right: 0;
        top: -75px;
      }

      .consa-graphBg {
        left: 20px;
        top: 64px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.graph-outer {
  position: relative;
  width: 100%;
  height: 100%;
  //height: 500px;
  background-color: #222222;
  //overflow: auto;
  //border: 1px solid red;
.errorMessage{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-flow: column;
  justify-content: center;
  .errorImg{
    width: 88px;
    img{
      width: 100%;
      height: auto;
    }
  }
  p{
    font-size: 12px;
    padding-top: 8px;
  }
}
  .hidden-btn {
    position: absolute;
    right: 20px;
    top: 3px;
    width: auto;
    height: 24px;
    z-index: 2;
    .full-screen-btn{
      display: inline-block;
      margin-right: 10px;
      text-align: center;
      cursor: pointer;
      &:hover{
        i{
          color: #1E6ED2;
        }
      }
    }
  }

  .lineage-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .scroll-outer {
      position: absolute;
      top: 30px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
      //border: 1px solid red;
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
  background-color: #222222;
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

.no-data {
  width: 100%;
  height: 100%;
  position: relative;

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

</style>
