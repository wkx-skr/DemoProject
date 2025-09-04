<template>
  <div id="main-container">
    <various-selector></various-selector>
    <!-- <page-heading
      id="page-heading"
      :class="{ dark: $theme === 'dark', 'ddc-home': $store.state.isDdcHome }"
      v-if="deeps"
    ></page-heading>
    <datablau-nav v-if="deeps"></datablau-nav> -->
    <div
      id="main-content"
      :class="{
        'to-top': !deeps,
        'ddc-home': $store.state.isDdcHome,
        ext: $store.state.isNavExtension,
        full: $store.state.isMainFull,
        en: $i18n.locale === 'en',
      }"
      v-loading="loading"
    >
      <div class="loading-outer" v-if="!loading">
        <keep-alive>
          <router-view
            v-if="isRouterAlive && $route.meta.keepAlive"
          ></router-view>
        </keep-alive>
        <router-view
          v-if="isRouterAlive && !$route.meta.keepAlive"
        ></router-view>
      </div>
      <!-- <router-view v-if="isRouterAlive"></router-view> -->
    </div>
    <div id="full-screen-mask"></div>
    <data-dialogs></data-dialogs>
    <div id="error-list">
      <el-alert
        v-if="showMessageList"
        :show-icon="item.type === 'error'"
        v-for="(item, index) in $errorList"
        :key="'k' + index"
        style="margin-top: 10px"
        :closable="item.type === 'error'"
        @close="removeErrorMessage(index)"
        :type="item.type"
      >
        <span slot="title" v-if="item.time">
          <span v-if="item.time">
            {{ $timeFormatter(new Date(item.time).getTime()) }}
          </span>
        </span>
        <div><span v-html="item.msg"></span></div>
      </el-alert>
    </div>
    <product-document></product-document>
    <!--<div
      id="upload-progress"
      style="outline:1px solid pink;width:300px;height:100px;background:#FFF;">-->
    <el-dialog
      :visible.sync="showUploadProgress"
      width="500px"
      :title="uploadProgress.title"
      :close-on-click-modal="true"
      append-to-body
    >
      <datablau-progress
        ref="progress"
        :timePrediction="uploadProgress.time"
      ></datablau-progress>
      <div style="text-align: right; margin-right: 1em; margin-top: 0.5em">
        <span v-if="uploadProgress.status === 'success'">
          {{
            this.$t(
              'quality.page.dataQualityRepairJob.documents.uploadSuccessful'
            )
          }}!
        </span>
        <span v-if="uploadProgress.status === 'progress'">
          {{ this.$t('quality.page.dataQualityRepairJob.documents.Uploading') }}
        </span>
        <span v-if="uploadProgress.status === 'failure'">
          {{
            this.$t('quality.page.dataQualityRepairJob.documents.uploadFailed')
          }}
        </span>
      </div>
    </el-dialog>

    <!--</div>-->
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style scoped lang="scss">
@import './main.scss';
</style>
