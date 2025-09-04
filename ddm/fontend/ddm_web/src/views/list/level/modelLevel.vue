<template>
  <div class="model-level-list">
    <model-item-title>模型血缘</model-item-title>
    <div class="tabs-outer">
      <datablau-tabs
        v-model="currentTab"
        v-loading="tabLoading"
        type="card"
        :class="{'less-tabs': !modelLevel}"
      >
        <el-tab-pane
          name="upstreamList" label="上层模型"
          v-if="modelLevel"
          :disabled="!(modelLevel && modelLevel !== modelLevelArr[0])"
        >
          <model-list
            ref="upstreamList"
            key="upstreamList"
            :modelId="modelId"
            listType="upstream"
            :modelLevel="modelLevel"
            :modelLevelArr="modelLevelArr"
          ></model-list>
        </el-tab-pane>
        <el-tab-pane
          name="downstreamList" label="下层模型"
          v-if="modelLevel"
          :disabled="!(modelLevel && modelLevel !== modelLevelArr[modelLevelArr.length -1])"
        >
          <model-list
            ref="downstreamList"
            key="downstreamList"
            :modelId="modelId"
            :modelLevelArr="modelLevelArr"
            :modelLevel="modelLevel"
            listType="downstream"
          ></model-list>
        </el-tab-pane>
        <el-tab-pane name="lineage" label="血缘管理">
          <lineage-graph
            :modelId="modelId"
            v-if="currentTab === 'lineage'"
            :title="currentModel.modelName"
          ></lineage-graph>
        </el-tab-pane>
      </datablau-tabs>
    </div>

  </div>
</template>
<script>
import list from './modelLevel'

export default list
</script>

<style lang="scss" scoped>
.model-level-list {
  //border: 1px solid red;
  position: absolute;
  left: 0;
  right: 0;
  top: 0px;
  bottom: 0px;
  padding: 0 20px;

  .tabs-outer {
    position: absolute;
    left: 0;
    right: 0;
    top: 26px;
    bottom: 0px;
    padding: 0 20px;
  }

  /deep/ .datablau-tabs {
    height: 100%;

    .el-tabs, .el-tabs--card {
      height: 100%;
      //border: 1px solid red;

      .el-tabs__content {
        //border: 1px solid red;
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0;

      }
    }
  }

  .less-tabs {
    /deep/ {
      .top-header-info-panel-wrapper {
        left: 100px;
      }

      .el-tabs__header {
        display: none;
      }

      .lineage-container.model-lineage-outer {
        top: 0;
      }
    }

  }
}
</style>
