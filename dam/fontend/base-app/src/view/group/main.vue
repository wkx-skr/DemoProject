<template>
  <div class="group-content">
    <datablau-page-title
      v-if="currentTab === 'list'"
      :parent-name="$t('common.page.group')"
      :name="$t('common.page.group')"
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
    <div class="citic-card-tabs">
      <el-tabs
        type="card"
        :class="{ hideTab: true }"
        :activeName="currentTab"
        @tab-remove="removeTab"
        @tab-click="handleClick"
      >
        <el-tab-pane :label="$t('system.group.role')" name="list">
          <our-list></our-list>
        </el-tab-pane>
        <el-tab-pane
          name="add"
          v-if="showAddTab"
          closable
        >
          <our-detail ref="addGroup"></our-detail>
        </el-tab-pane>
        <el-tab-pane
          v-for="item in dataArray"
          :key="item.name"
          :name="item.name"
          closable
        >
          <our-detail
            :key="item.name"
            :preData="item"
            :tableData="tableData"
            ref="editGroup"
          ></our-detail>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style lang="scss" scoped>
.group-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  background-color: var(--default-bgc);
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
  .citic-card-tabs {
    top: 40px;
    background-color: #fff;
    /deep/ .tab-page {
      top: 0;
    }
  }
}
</style>
