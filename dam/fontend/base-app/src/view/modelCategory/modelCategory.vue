<template>
  <div>
    <datablau-page-title
      v-if="currentTab == 'list'"
      :parent-name="$t('common.page.dataResource')"
      :name="$t('common.page.modelCategory')"
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
      <!-- :class="{ hideTab: !showTabs }" -->
      <el-tabs
        type="card"
        :class="{ hideTab: true }"
        v-model="currentTab"
        @tab-remove="removeTab"
        @tab-click="handleTab"
      >
        <el-tab-pane :label="$t('common.page.modelCategory')" name="list">
          <category-list @getItPars="getItPars"></category-list>
        </el-tab-pane>
        <el-tab-pane
          class="absolute-tab"
          :label="$version.modelCategory.add"
          name="add"
          v-if="showAdd"
          closable
        >
          <category-details
            ref="addCategory"
            :itDepsArr="itDepsArr"
            :zoneArr="zoneArr"
            :busDepArr="busDepArr"
          ></category-details>
        </el-tab-pane>
        <el-tab-pane
          class="absolute-tab"
          v-for="tab in tabs"
          :key="tab.categoryId"
          :label="tab.categoryName"
          :name="tab.categoryName"
          closable
        >
          <category-details
            ref="category"
            :data="tab"
            :itDepsArr="itDepsArr"
            :zoneArr="zoneArr"
            :busDepArr="busDepArr"
          ></category-details>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import modelCategory from './modelCategory.js'
export default modelCategory
</script>

<style lang="scss" scoped>
.page-title-row {
  padding-top: 8px;
  line-height: 24px;
}
.citic-card-tabs {
  top: 40px;
  background-color: #fff;
  /deep/ .tab-page {
    top: 0;
    .row-inner {
      top: 0;
    }
  }
}
.model-category-header {
  height: 40px;
  background-color: #fff;
  padding-left: 20px;
  padding-top: 8px;
  > div {
    height: 100%;
    border-bottom: 1px solid var(--border-color-lighter);
  }
}
.absolute-tab {
  height: 100%;
  overflow: auto;
  padding-bottom: 100px;
}
</style>
