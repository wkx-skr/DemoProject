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
            :label="$t('algorithm.title1')"
            name="first"
          >
            {{ $t('algorithm.title1') }}
          </el-tab-pane>
          <el-tab-pane
            v-if="
              $auth.DATA_SECURITY_DISCERN_CC &&
              $versionFeature.datasecurity_LineageIdentification &&
              $featureMap['FE_LINEAGE']
            "
            :label="$t('algorithm.title2')"
            name="second"
          >
            {{ $t('algorithm.title2') }}
          </el-tab-pane>
          <el-tab-pane
            v-if="
              $auth.DATA_SECURITY_DISCERN_ML &&
              hasMachine &&
              $versionFeature.datasecurity_AIIdentification
            "
            :label="$t('algorithm.title3')"
            name="third"
          >
            {{ $t('algorithm.title3') }}
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
              <img src="../../../../static/kgimg/blood.png" alt="" />
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
