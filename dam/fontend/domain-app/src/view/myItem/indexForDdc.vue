<template>
  <div class="page-outer width-1280 table-main-page" v-loading="pageLoading">
    <div class="page-container" v-show="show">
      <div class="content-nav">
        <span
          @click="handleClose"
          class="ddc-icon-back"
          style="margin-left: 15px; margin-top: 5px"
        >
          返回
        </span>
        <span class="menu" @click="handleShowAllData">
          {{
            searchKeyword ? '"' + searchKeyword + '" 的搜索结果' : '全部结果'
          }}
        </span>
        <span
          class="catalog-path-item"
          v-for="(item, index) in catalogPathArr"
          :key="index"
        >
          <i class="fa fa-chevron-right"></i>
          <span class="path-item-text" @click="handleSkip2catalog(item)">
            {{ item.name }}
          </span>
        </span>
        <i class="fa fa-chevron-right"></i>
        <span>{{ summary.wholeName }}</span>
      </div>
      <div class="ps-container top-40">
        <div :style="style.preview" class="content-preview">
          <div class="title">
            <datablau-icon
              data-type="domain"
              :size="20"
              style="position: relative; top: 5px"
            ></datablau-icon>
            {{ summary.wholeName }}
          </div>
          <div class="description-line">
            <span
              class="description"
              v-html="$utils.string.nl2br(summary.description)"
            ></span>
          </div>
          <!--<div class="description" style="margin-bottom:1em;" v-html="n2br(summary.description)"></div>-->
          <div class="properties">
            <!--<span class="property">
              <i class="fa fa-user-o"></i>{{summary.submitter}}
            </span>-->
            <span class="property star">
              <span>评分：</span>
              <el-rate
                class="table-rate"
                v-model="tableRate"
                disabled
                :show-score="tableRate !== 0 && false"
                text-color="#898989"
                score-template="{value}"
              ></el-rate>
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
              <span class="tag">{{ t.name }}</span>
            </el-tooltip>
            {{ dataType }}
          </div>
        </div>
        <div>
          <el-tabs
            v-model="activeName"
            class="blue-tabs"
            @tab-click="handleTabClick"
          >
            <el-tab-pane label="详情" name="detail"></el-tab-pane>
            <el-tab-pane name="comment">
              <span slot="label">评论</span>
            </el-tab-pane>
          </el-tabs>
          <index-scan
            v-if="activeName === 'detail' && summary.codeId"
            :detail="summary"
            :type="currentType"
            :key="queryData.code"
            :msgFromParent="msgFromParent"
            :baseCodeObj="baseCode"
          ></index-scan>
          <comment
            v-if="activeName === 'comment' && summary.codeId"
            :objectId="summary.codeId"
            :showRate="true"
            @rateSubmitSuccess="handleRateSubmit"
            :typeId="$commentPreCode.Index"
          ></comment>
        </div>
      </div>
    </div>
    <!-- End of  container-->
  </div>
</template>

<script>
import main from './index.js'
export default main
</script>

<style scoped lang="scss">
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
