<template>
  <div class="data-source">
    <el-dialog
      :title="$t('meta.dataSource.updateMetadata')"
      v-if="$isIE"
      :visible.sync="dialogIEUploadVisible"
      width="400px"
      append-to-body
    >
      <form
        :action="baseIEUploadUrl"
        method="post"
        class="IE-upload"
        enctype="multipart/form-data"
        target="nm_iframe"
      >
        <input type="file" name="file" value="选择文件" />
        <el-button size="mini" @click="handleIEMetaUpload">
          <input
            id="id_submit"
            name="nm_submit"
            type="submit"
            @click="handleIEMetaUpload"
            value="上传"
          />
        </el-button>
      </form>
      <iframe id="id_iframe" name="nm_iframe" style="display: none"></iframe>
    </el-dialog>
    <datablau-page-title
      :parent-name="$t('common.page.dataResource')"
      :name="$t('common.page.dataSourceConnect')"
    ></datablau-page-title>
    <div class="citic-card-tabs">
      <el-tabs
        type="card"
        :class="{ hideTab: !showTabs }"
        v-model="currentTab"
        @tab-remove="removeTab"
      >
        <el-tab-pane
          :label="$t('common.page.dataSourceConnect')"
          name="dataSourceTab"
          ref="dataSourceTab"
        >
          <data-source-tab
            @showDSeditab="showtab"
            @downloadMetadata="showDownloadTab"
            @removeEdiTab="removeTab"
            :formatDataSource="formatDataSource"
            :dsformConstant="dsformConstant"
            ref="dataSourceList"
          ></data-source-tab>
        </el-tab-pane>
        <el-tab-pane
          v-for="item in editTabsArray"
          :key="item.id"
          :label="item.name"
          :name="item.id + ''"
          closable
        >
          <edi-data-source
            @removeEdiTab="closeEidTab(item.id + '')"
            :dsEditing="item.isEdit"
            :dsform="item.supdsform"
            :formatDataSource="formatDataSource"
            :dataZoneTags="dataZoneTags"
            :tagTree="tagTree"
            :tagMap="tagMap"
            :jdbcDs="jdbcDs"
            :isJDBC="isJDBC"
          ></edi-data-source>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.dataSource.importMetadata')"
          name="downloadTab"
          closable
          v-if="ifShowDownloadTab"
          ref="downloadTab"
        >
          <download-tab :modelId="modelId" :key="modelId"></download-tab>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="edit-ds-container" v-if="editTabData">
      <edi-data-source
        @removeEdiTab="closeEidTab()"
        @reportDsCreated="reportDsCreated"
        :dsEditing="editTabData.isEdit"
        :dsform="editTabData.supdsform"
        :formatDataSource="formatDataSource"
        :dataZoneTags="dataZoneTags"
        :tagTree="tagTree"
        :tagMap="tagMap"
        :jdbcDs="jdbcDs"
        :isJDBC="isJDBC"
      ></edi-data-source>
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
}
</style>
