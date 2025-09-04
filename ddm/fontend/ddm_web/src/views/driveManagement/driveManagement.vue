<template>
  <div class="driver-manage-tabs content-area">
    <div class="top-header-info-panel-wrapper"><b>{{$v.drive.driveManagement}}</b><i class="el-icon-refresh" @click="refreshTable"></i></div>
    <!--<datablau-page-title :parent-name="$version.nav.driveManagement"-->
    <!--                     :name="$version.nav.driveManagement"></datablau-page-title>-->
    <div class="citic-card-tabs tab-container">
      <el-tabs
        type="card"
        :class="{hideTab:!showTabs}"
        v-model="currentTab"
        @tab-remove="removeTab"
        class="ref-tabs"
      >
        <el-tab-pane :label="$v.drive.driveManagement" name="dataSourceTab" ref="dataSourceTab">
          <driveManagementTab
            @showDSeditab="showtab"
            @downloadMetadata="showDownloadTab"
            @removeEdiTab="removeTab"
            ref="driveManagementTab"
          ></driveManagementTab>
        </el-tab-pane>
        <el-tab-pane v-for="item in editTabsArray" :key="item.id" :label="item.name" :name="item.id + ''" closable>
          <editDriveManagement
            @removeEdiTab="closeEidTab(item.id + '')"
            :dsEditing="item.isEdit"
            :supdsform="item.supdsform"
          ></editDriveManagement>
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
.content-area {
  left: 0;
}

.driver-manage-tabs {
  //border: 1px solid red;

  .top-header-info-panel-wrapper {
    position: absolute;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    left: 20px;
    top: 0;

    b {
      line-height: 16px;
      //margin-right: 5px;
    }

    //vertical-align: bottom;
  }

  .tab-container {
    //border: 1px solid red;
    position: absolute;
    top: 40px;
    left: 0px;
    right: 0px;
    bottom: 0;

    /deep/ .el-table .caret-wrapper {
      height: 34px;
    }
  }
}
</style>
