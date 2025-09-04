<template>
  <div>
    <datablau-page-title
      v-if="currentTab === 'list'"
      :parent-name="$t('common.page.businessData')"
      :name="$t('common.page.businessObject')"
    ></datablau-page-title>
    <div class="model-category-header" v-else>
      <div>
        <datablau-breadcrumb
          @back="goBack"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <datablau-button
      size="small"
      type="primary"
      style="
        position: absolute;
        right: 20px;
        top: 41px;
        z-index: 2000;
        font-size: 12px;
      "
      v-show="currentTab === 'list'"
      @click="addObject"
      ref="addButton"
      class="iconfont icon-tianjia"
    >
      添加业务实体
    </datablau-button>
    <div class="citic-card-tabs">
      <!-- :class="{ hideTab: !showTabs }" -->
      <el-tabs
        type="card"
        :class="{ hideTab: true }"
        v-model="currentTab"
        @tab-remove="removeTab"
        @tab-click="handleTab"
      >
        <el-tab-pane label="业务实体" name="list" ref="list">
          <object-list ref="objectList" @modify="modify"></object-list>
        </el-tab-pane>
        <el-tab-pane
          v-for="item in editTabsArray"
          :key="item.businessTabId"
          :label="item.businessTabName"
          :name="item.businessTabId + ''"
          closable
        >
          <object-detail
            is-edit
            @removeTab="removeTab"
            @refreshList="refresh"
            :currentObject="currentObject"
          ></object-detail>
        </el-tab-pane>
        <el-tab-pane
          v-if="appendingObject"
          key="add"
          label="添加业务实体"
          name="add"
          closable
        >
          <object-detail
            is-edit
            is-append
            @removeTab="removeTab('add')"
            @refreshList="refresh"
          ></object-detail>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import objects from './objects.js'
export default objects
</script>

<style scoped lang="scss">
.page-title-row {
  height: 40px;
  padding-top: 8px;
  line-height: 24px;
}
.citic-card-tabs {
  top: 40px;
  background-color: #fff;
  /deep/ .tab-page {
    top: 0;
    .filter-row {
      top: 0;
    }
  }
}
.model-category-header {
  height: 40px;
  background-color: #fff;
  padding: 0 20px;
  padding-top: 8px;
  > div {
    height: 100%;
    border-bottom: 1px solid var(--border-color-lighter);
  }
}
/deep/ .el-form-item {
  margin-bottom: 14px;
  .el-form-item__label {
    line-height: 34px;
  }
  .el-form-item__content {
    line-height: 34px;
  }
}
/deep/ .el-tab-pane {
  padding: 10px 0;
}
</style>
