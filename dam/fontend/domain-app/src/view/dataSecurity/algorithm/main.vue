<template>
  <div class="algorithm-page">
    <div class="tabs-box">
      <div class="tabs-content">
        <datablau-tabs
          v-model="currentTab"
          @tab-click="tabClick"
          :hasContent="false"
        >
          <el-tab-pane
            v-if="
              $auth.DATA_SECURITY_DISCERN_ALGORITHM_MANAGE ||
              $auth.DATA_SECURITY_DISCERN_ALGORITHM
            "
            label="算法库"
            name="first"
          >
            算法库
          </el-tab-pane>
          <el-tab-pane
            v-if="
              $auth.DATA_SECURITY_DISCERN_CC &&
              $versionFeature.datasecurity_LineageIdentification
            "
            label="血缘级联算法"
            name="second"
          >
            血缘级联算法
          </el-tab-pane>
          <el-tab-pane
            v-if="
              $auth.DATA_SECURITY_DISCERN_ML &&
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
    <div class="algorithm-content">
      <div v-if="currentTab === 'first'">
        <algorithm-library></algorithm-library>
      </div>
      <div v-if="currentTab === 'second'">
        <div class="blood-kinship">
          <div class="blood-content">
            <div class="cover">
              <img src="static/kgimg/blood.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentTab === 'third'">
        <machine></machine>
      </div>
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
    top: 44px;
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
      background: url('static/kgimg/blood_bg.png');
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
