<template>
  <div class="page-outer table-main-page" v-loading="pageLoading">
    <div class="page-container" v-show="show" style="padding: 0">
      <div class="datablau-breadcrumb-header">
        <div>
          <datablau-breadcrumb
            :node-data="nodeData"
            :couldClick="false"
            @back="handleClose"
          ></datablau-breadcrumb>
          <!-- 面包靴中间部分 ，暂无遇见 -->
          <!-- <span
          class="catalog-path-item"
          v-for="(item, index) in catalogPathArr"
          :key="index"
        >
          <i class="fa fa-chevron-right"></i>
          <span class="path-item-text" @click="handleSkip2catalog(item)">
            {{ item.name }}
          </span>
        </span> -->
        </div>
      </div>
      <scan
        style="height: auto"
        v-if="udps"
        :domainHasComment="domainHasComment"
        :data="summary"
        :udps="udps"
        :containID="true"
        :categoryTypeId="parseInt(typeIds)"
        :typeIds="typeIds"
        :labelText="labelText"
        :hideHeader="true"
        :hideDerive="true"
        class="ddc-standard-scan"
      ></scan>
      <!--<div class="ps-container top-40">
        <div :style="style.preview" class="content-preview">
          <div class="title">
            <datablau-icon
              data-type="domain" :size="20" style="position:relative;top:5px;"></datablau-icon>
            {{summary.chineseName}}
          </div>
          <div class="description-line">
            <span class="description" v-html="$utils.string.nl2br(summary.definition)"></span>
          </div>
          <div class="properties">
            <span class="property">
              <i class="fa fa-user-o"></i>{{summary.submitter}}
            </span>
            <span class="property collection" @click="toggleCollecStatus">
              <i class="el-icon-star-on" v-if="hasCollected"></i>
              <i class="el-icon-star-off" v-else></i>
              <span>收藏</span>
            </span>
          </div>
          <div class="tag-box blue">
            <el-tooltip
              v-for="t in summary.tags"
              :key="t.id"
              :disabled="!$globalData.tagDescriptionMap.get(t.id)"
              :content="$globalData.tagDescriptionMap.get(t.id)"
            >
              <span
                class="tag">{{t.name}}</span>
            </el-tooltip>
            {{dataType}}
          </div>
        </div>
        <div>
          <standard-scan
            v-if="activeName==='detail' && summary.domainId"
            :data-summary="summary"
            :key="queryData.domainId"
          >

          </standard-scan>
          <comment
            v-if="activeName==='comment'"
            :objectId="summary.domainId"
            :showRate="true"
            @rateSubmitSuccess="handleRateSubmit"
            :typeId="$commentPreCode.Domain"
          ></comment>
        </div>
      </div>-->
    </div>
  </div>
</template>

<script>
import main from './domain.js'
export default main
</script>

<style scoped lang="scss">
.page-container {
  /deep/ #standard-scan {
    .detail-box {
      top: 40px;
    }
    .el-tabs {
      padding: 0 20px;
      .comment-list {
        padding-left: 0;
      }
      .row-publish {
        margin-left: 0 !important;
      }
    }
  }
}
@import '../../assets/styles/constForDDC.sass';
@import './main.scss';
</style>
<style lang="scss">
.btn-con {
  .btn-item.el-button {
    font-size: 10px;
  }
}
</style>
