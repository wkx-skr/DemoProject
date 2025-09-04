<template>
  <div class="knowledge-content">
    <datablau-page-title
      class="page-title-row2"
      :parent-name="$t('common.page.dataQuality')"
      :name="$t('common.page.knowledgebase')"
    ></datablau-page-title>
    <div class="citic-card-tabs" style="background: #fff">
      <our-list :hasAccess="hasAccess"></our-list>
    </div>
    <div class="our-detail" v-if="showAddTab">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <our-detail
        style="margin-top: 59px"
        :preData="detailData"
        :hasAccess="hasAccess"
      ></our-detail>
    </div>
    <!-- <el-tabs
        type="card"
        v-model="currentTab"
        @tab-remove="removeTab"
        :class="{ hideTab: !showTabs }"
      >
        <el-tab-pane label="知识库" name="list">
          <our-list :hasAccess="hasAccess"></our-list>
        </el-tab-pane>
        <el-tab-pane label="添加" name="add" v-if="showAddTab" closable>
          <our-detail :hasAccess="hasAccess"></our-detail>
        </el-tab-pane>
        <el-tab-pane
          closable
          v-for="item in dataArray"
          :key="item.title"
          :label="item.title"
          :name="item.title"
        >
          <our-detail :preData="item" :hasAccess="hasAccess"></our-detail>
        </el-tab-pane>
      </el-tabs> -->
    <!--      <our-list :hasAccess="hasAccess" v-if="showType === 1"></our-list>-->
    <!--      <our-detail :preData="detail" :hasAccess="hasAccess" v-if="showType === 2"></our-detail>-->
    <!--      <our-detail :hasAccess="hasAccess" v-if="showType === 3"></our-detail>-->
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style lang="scss" scoped>
.knowledge-content {
  .our-detail {
    background: #fff;
    position: absolute;
    width: 100%;
    z-index: 12;
    top: 0;
    bottom: 0;
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
}
</style>
