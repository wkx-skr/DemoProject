<template>
  <div class="user-content">
    <datablau-page-title
      v-if="currentTab === 'list'"
      :parent-name="$t('common.page.user')"
      :name="$t('common.page.user')"
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
        :class="{ hideTab: true }"
        type="card"
        :activeName="currentTab"
        @tab-remove="removeTab"
        @tab-click="handleClick"
      >
        <el-tab-pane name="list" key="list">
          <our-list></our-list>
        </el-tab-pane>
        <el-tab-pane name="add" key="add" v-if="showAddTab">
          <our-detail :allRoles="allRoles" ref="addDetail"></our-detail>
        </el-tab-pane>
        <el-tab-pane
          v-for="item in dataArray"
          :key="item.username"
          :name="item.username"
        >
          <our-detail
            :key="item.username"
            :allRoles="allRoles"
            :preData="item"
            ref="editDetail"
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
.citic-card-tabs {
  top: 40px;
  background-color: #fff;
  /deep/ .tab-page {
    top: 0;
  }
}
.user-content {
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
}
// /deep/ .el-tab-pane {
//   padding: 0;
// }
</style>
<style lang="scss">
$primary-color: #409eff;
.row-page-footer {
  white-space: nowrap;
  margin: 10px 20px;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }

  .footer-span {
    color: rgba(85, 85, 85, 1);
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 14px;
      color: white;
    }
  }

  .delete {
    // width: 66px;
    height: 30px;
    line-height: 30px;
  }
}
/deep/ .el-form-item__label {
  line-height: 34px;
  height: 34px;
}
</style>
