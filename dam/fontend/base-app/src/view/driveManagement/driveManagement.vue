<template>
  <div>
    <datablau-page-title
      v-if="currentTab === 'dataSourceTab'"
      :parent-name="$t('common.page.driveManagement')"
      :name="$t('common.page.driveManagement')"
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
        <el-tab-pane
          :label="$t('meta.driveManage.driveManage')"
          name="dataSourceTab"
          ref="dataSourceTab"
        >
          <driveManagementTab
            @showDSeditab="showtab"
            @downloadMetadata="showDownloadTab"
            @removeEdiTab="removeTab"
            ref="driveManagementTab"
          ></driveManagementTab>
        </el-tab-pane>
        <el-tab-pane
          class="absolute-tab"
          v-for="item in editTabsArray"
          :key="item.id"
          :label="item.name"
          :name="item.id + ''"
          closable
        >
          <editDriveManagement
            @removeEdiTab="closeEidTab(item.id + '')"
            :dsEditing="item.isEdit"
            :supdsform="item.supdsform"
          ></editDriveManagement>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.driveManage.importMetadata')"
          name="downloadTab"
          closable
          v-if="ifShowDownloadTab"
          ref="downloadTab"
        >
          <download-tab :modelId="modelId" :key="modelId"></download-tab>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import driveManagement from './driveManagement.js'
export default driveManagement
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
  .el-tabs {
    // margin: 0 20px;
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
