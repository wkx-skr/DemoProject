<template>
  <div
    class="algorithm-page"
    :style="{
      top: from == 'rules' ? '-30px' : '0',
      zIndex: 1,
    }"
  >
    <div class="tabs-box" v-if="false">
      <div class="tabs-content">
        <datablau-tabs
          v-model="currentTab"
          @tab-click="tabClick"
          :hasContent="false"
        >
          <el-tab-pane
            v-if="
              $auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE ||
              $auth.DATA_ASSET_DISCERN_ALGORITHM
            "
            label="算法库"
            name="first"
          >
            算法库
          </el-tab-pane>
          <!-- <el-tab-pane
            v-if="
              $auth.DATA_ASSET_DISCERN_CC &&
              $versionFeature.datasecurity_LineageIdentification &&
              $featureMap['FE_LINEAGE']
            "
            label="血缘级联算法"
            name="second"
          >
            血缘级联算法
          </el-tab-pane> -->
          <el-tab-pane
            v-if="
              $auth.DATA_ASSET_DISCERN_ML &&
              hasMachine &&
              $versionFeature.datasecurity_AIIdentification
            "
            label="机器学习算法"
            name="third"
          >
            机器学习算法
          </el-tab-pane>
        </datablau-tabs>
      </div>
    </div>
    <div
      style="
        height: 32px;
        line-height: 32px;
        padding-left: 16px;
        border-bottom: 1px solid #eee;
      "
    >
      <datablau-breadcrumb
        node-data="管理算法库"
        @back="backClick"
      ></datablau-breadcrumb>
    </div>
    <div
      class="algorithm-content"
      :style="{
        top: from == 'rules' ? '30px' : 0,
      }"
    >
      <algorithm-library></algorithm-library>
    </div>
  </div>
</template>

<script>
import Main from './main.js'
export default Main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.algorithm-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  .tabs-box {
    padding: 0 10px;
    box-sizing: border-box;
    height: 44px;
    border-bottom: 1px solid #ddd;
    line-height: 44px;
    .tabs-content {
      float: left;
      /deep/ .datablau-tabs {
        .el-tabs {
          .el-tabs__header {
            .el-tabs__nav-wrap {
              &:after {
                background-color: transparent;
              }
              .el-tabs__item {
                height: 39px;
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
  .algorithm-content {
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .blood-kinship {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    .blood-content {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      bottom: 16px;
      background: url('../../../../static/kgimg/blood_bg.png');
      // background: #eee;
      // background-image: radial-gradient(circle, #ccc 30%, transparent 31%);
      // background-size: 8px 8px;
      // background-position: 50% 50%;
      // background-repeat: no-repeat;
      align-items: center;
      display: flex;
      min-height: 300px;
    }
    .cover {
      width: 800px;
      height: 300px;
      margin: 0 auto;
      align-items: center;
    }
  }
}
</style>
