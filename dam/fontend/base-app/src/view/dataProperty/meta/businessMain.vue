<template>
  <div class="outer-box">
    <business-list
      ref="metaList"
      @node-click="handleModelClick"
      @update-path="handleUpdatePath"
      :writable="writable"
      class="list-box"
    ></business-list>
    <div class="resize-column-middle"></div>
    <div class="right-box">
      <datablau-breadcrumb
        class="top-bread"
        @nodeClick="nodeClick"
        :node-data="displayPath"
        :showBack="false"
        separator="/"
      ></datablau-breadcrumb>
      <items
        :key="'m' + modelId"
        :modelId="modelId"
        :expand="true"
        @itemClick="handleItemClick"
        :writable="writable"
        class="items detail-item-info"
      ></items>
      <table-details
        v-if="currentObjectType && currentObjectType !== 'DOMAIN'"
        from-business
        :isFloder="
          currentObject.type === 'SHARE_FILE' || currentObject.type === 'FILE'
            ? true
            : false
        "
        :isZichan="true"
        :key="currentObjectKey"
        :objectId="currentObjectId"
        :objectTypeMaybe="currentObjectType"
        :object="currentObject"
        :loadedTagsBefore="loadedTags"
        @close="handleDetailClose"
        class="details"
      >
        <div class="navigator" style="">
          <span class="d-return icon-i-return" @click="handleDetailClose">
            {{ $t('common.button.return') }}
          </span>
        </div>
      </table-details>
      <div
        class="details bus-details"
        v-else-if="currentObjectType === 'DOMAIN'"
      >
        <scan
          :isZichan="true"
          :domainHasComment="domainHasComment"
          :data="summary"
          :udps="udps"
          :containID="true"
          :key="currentObjectKey"
          :categoryTypeId="parseInt(typeIds)"
          :allOrganizations="allOrganizations"
          :dims="dims"
          :typeIds="typeIds"
          :labelText="labelText"
          @back="handleDetailClose"
        ></scan>
      </div>

      <!--      <div class="col-shadow"></div>-->
    </div>
    <standard-selector></standard-selector>
    <index-selector></index-selector>
  </div>
</template>

<script>
import main from './businessMain'
export default main
</script>

<style scoped lang="scss">
/deep/ .asset-report-scan-component {
  top: 0;
  .tab-outer {
    .el-tabs {
      .ql-snow {
        padding: 0;
      }
      .tab-table-line {
        padding: 0;
      }
      .report-detail-tab {
        padding: 0;
      }
      #pane-knowledgeMap {
        padding: 0;
        padding-top: 20px;
      }
    }
  }
}
@import './main.scss';
.outer-box {
  .right-box {
    .items {
      /deep/ .list-search-content {
        margin-top: 10px;
      }
    }
  }
}
@import '~@/next/components/basic/color.sass';
$border-color: #e0e0e0;
.details {
  left: -280px;
}
.items {
  margin-top: 10px;
}
.top-bread {
  height: 48px;
  padding-top: 20px;
  margin-left: 20px;
  border-bottom: 1px solid $border-color;
}
.d-return {
  color: var(--document-color);
  display: inline-block;
  height: 2.7em;
  line-height: 2.7em;
  border-radius: 3px;
  padding: 0 0.7em;
}
</style>
