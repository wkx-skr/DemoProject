<template>
  <div class="data-source">
    <datablau-page-title
      :parent-name="$t('common.page.dataResource')"
      :name="$t('common.page.dataResource')"
    ></datablau-page-title>
    <div class="citic-card-tabs" v-if="!showReDetail">
      <re-list
        @showRe="showRe"
        @showDSeditab="showtab"
        @downloadMetadata="showDownloadTab"
        @showMetadataJob="showMetadataJob"
        @removeEdiTab="removeTab"
        :formatDataSource="formatDataSource"
        :dsformConstant="dsformConstant"
        :default-keyword="defaultKeyword"
        ref="dataSourceList"
      ></re-list>
    </div>
    <div class="reMeta" v-if="showReDetail">
      <re-main
        :tagTree="tagTree"
        :tagMap="tagMap"
        :dsEditing="isEdit"
        :editRow="editRow"
        :isReport="isReport"
        :isFile="isFile"
        :isShareFile="isShareFile"
        :isMetaModel="isMetaModel"
        @removeReTab="removeReTab"
      ></re-main>
    </div>
    <div class="metadata-job" v-if="metadataJobVisible">
      <metadata-job
        :metadataJobArgs="metadataJobArgs"
        @close="metadataJobVisible = false"
      ></metadata-job>
    </div>
  </div>
</template>

<script>
import dataSource from './index.js'

export default dataSource
</script>
<style scoped lang="scss">
.page-title-row {
  height: 42px;
  padding-top: 8px;
  line-height: 24px;
  .font-medium {
  }
}

@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-source {
  background: #fff;
  .citic-card-tabs {
    z-index: 1;
    top: 40px;

    /deep/ .tab-page {
      top: 0;
      overflow: hidden;
    }
  }

  @include absPos();

  .edit-ds-container {
    @include absPos();
    z-index: 2;
    background-color: #fff;
  }
  .metadata-job {
    @include absPos();
    background-color: #fff;
    z-index: 10;
  }
}
</style>
