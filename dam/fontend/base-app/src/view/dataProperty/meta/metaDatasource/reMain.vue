<template>
  <div class="reDetail">
    <div class="container">
      <div class="breadcrumb-line">
        <datablau-breadcrumb
          :node-data="pathArr"
          @back="backClick"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
      <div class="form-container">
        <div v-if="!isReport && !isFile && !isShareFile && !isMetaModel">
          <re-datasource
            :tagTree="tagTree"
            :tagMap="tagMap"
            :dsEditing="dsEditing"
            :editRow="editRow"
            :isReport="isReport"
            :isFile="isFile"
            :isShareFile="isShareFile"
            @removeReTab="removetab"
          ></re-datasource>
        </div>
        <div class="database-info-container" v-else-if="isReport">
          <report-ds
            ref="reportDs"
            @createdJob="createdReportJob"
            @testSucceed="reportTest"
            :editRow="editRow"
            :dsEditing="dsEditing"
            @removeReTab="removetab"
          ></report-ds>
        </div>
        <!--          添加文件 -->
        <div class="database-info-container" v-else-if="isFile || isShareFile">
          <re-file
            ref="reFile"
            @createdJob="createdReportJob"
            @testSucceed="fileTest"
            :tagTree="tagTree"
            :tagMap="tagMap"
            :dsEditing="dsEditing"
            :editRow="editRow"
            :isShareFile="isShareFile"
            @removeReTab="removetab"
          ></re-file>
        </div>
        <div class="database-info-container" v-else-if="isMetaModel">
          <re-metaModel
            ref="reMetaModel"
            @createdJob="createdMetaModelJob"
            :tagTree="tagTree"
            :tagMap="tagMap"
            :dsEditing="dsEditing"
            :editRow="editRow"
            :isShareFile="isShareFile"
            @removeReTab="removetab"
          ></re-metaModel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './reMain.js'

export default js
</script>
<style lang="scss" scoped>
@import '~@/assets/styles/const.scss';
$back-line-height: 40px;
$bottom-line-height: 50px;
.reDetail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #fff;
  .container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .breadcrumb-line {
      box-sizing: border-box;
      padding-top: 8px;
      position: absolute;
      left: 20px;
      top: 0;
      right: 20px;
      height: $back-line-height;
      border-bottom: 1px solid var(--border-color-lighter);
    }
    .form-container {
      position: absolute;
      left: 0;
      right: 0;
      top: $back-line-height;
      bottom: 0;
      overflow: auto;
      padding: 20px 0 40px;
    }
  }
}
</style>
