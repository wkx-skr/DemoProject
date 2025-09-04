<!-- 数据资产 -- 资产浏览 -->
<template>
  <div>
    <apply-power
      v-if="showApply"
      :showApply="showApply"
      :close-modal="closeModal"
      :applyInfo="applyInfo"
    ></apply-power>
    <div class="overview-left-box" v-show="!onlyDetail">
      <div class="list" @click="navClick('home')">
        <datablau-tooltip
          effect="dark"
          :content="'资产门户'"
          placement="bottom"
        >
          <i class="iconfont icon-menu-fwzl"></i>
        </datablau-tooltip>
      </div>
      <div class="list list-active" @click="navClick('overview')">
        <datablau-tooltip
          effect="dark"
          :content="'资产浏览'"
          placement="bottom"
        >
          <i class="iconfont icon-see"></i>
        </datablau-tooltip>
      </div>
    </div>
    <div class="directory-tree" v-show="!onlyDetail">
      <directory-tree
        ref="overviewTree"
        :clickNode="clickNode"
        :curStructureId="curStructureId"
        :isOverview="true"
        :editable="false"
        :treeData="treeData"
        :originTreeData="originTreeData"
        @node-click="handleNodeClick"
        @structureClick="structureClick"
        :authFunction="authFunction"
        :currentNode="currentNode"
        :structureList="structureList"
        :allCatalogs="allCatalogs"
        :getSubCatalog="getSubCatalog"
        :pageId="1"
      ></directory-tree>
    </div>
    <div class="resize-column-middle" v-show="!onlyDetail"></div>
    <div
      v-if="!isNull"
      class="directory-content"
      :class="{
        'directory-content1': type === 'firstCatalogue' && !isShowDetail,
        'only-content': onlyDetail,
        'directory-content-detail': isShowDetail,
      }"
      v-loading="loading || listLoading"
    >
      <div
        class="datablau-breadcrumb-header"
        style="padding-left: 0"
        v-if="type !== 'firstCatalogue' && type !== 'StructureDir'"
      >
        <div>
          <span
            v-if="type === 'StructureDir'"
            style="font-size: 16px; font-weight: 500"
          >
            {{ structureName }}
          </span>
          <datablau-breadcrumb
            v-else
            :showBack="isShowDetail"
            :nodeData="breadcrumbNodes"
            @nodeClick="handleNodeClick"
            @back="goBack"
          ></datablau-breadcrumb>
        </div>
      </div>
      <div
        class="datablau-breadcrumb-header"
        style="padding-left: 0"
        v-show="isShowDetail && type === 'firstCatalogue'"
      >
        <datablau-breadcrumb
          :showBack="isShowDetail"
          :nodeData="breadcrumbNodes"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <top-base-info
        :selectedAttr="selectedAttr"
        :clickNode="clickNode"
        :editable="false"
        :baseInfo="baseInfo"
        :isoverView="true"
        :managerMap="managerMap"
        :curManage="curManage"
        :isShowDetail="isShowDetail"
        v-if="type !== 'StructureDir'"
      ></top-base-info>

      <datablau-tabs
        v-model="activeName"
        v-show="isShowDetail"
        @tab-click="handleClick"
      >
        <el-tab-pane
          :label="$t('assets.summaryInfo.title')"
          name="first"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.assetList.title')"
          name="second"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.knowledgeGraph.title')"
          name="third"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.history.title')"
          name="fourth"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.version.title')"
          name="fifth"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.comment.title')"
          name="sixth"
        ></el-tab-pane>
      </datablau-tabs>
      <div
        v-show="!isShowDetail"
        :style="{ top: topH + breadcrumbH + 'px' }"
        class="assets-list-box"
        :class="{
          'assets-list-box1': type === 'firstCatalogue',
          'assets-list-box2': type === 'catalogue',
        }"
      >
        <assets-list-view
          :clickNode="clickNode"
          :selectedAttr="selectedAttr"
          :currentNode="currentNode"
          :breadcrumbNodes="breadcrumbNodes"
          :nowBase="nowBase"
          ref="assetsListView"
        ></assets-list-view>
      </div>
      <summary-info
        v-if="activeName === 'first'"
        :editable="false"
        :summaryInfo="summaryInfo"
        :currentNode="currentNode"
        :topH="topH"
        :authFunction="authFunction"
        :authTooltip="authTooltip"
        :pageId="1"
      ></summary-info>
      <assets-list
        :type="1"
        :isView="true"
        v-show="activeName === 'second'"
        ref="assetsList"
        :assetsType="subAssetsType"
        :clickNode="clickNode"
        :id="currentNode.id"
        :currentNode="currentNode"
        :breadcrumbNodes="breadcrumbNodes"
        :topH="topH"
      ></assets-list>
      <comment
        v-if="activeName === 'sixth'"
        ref="comment"
        :showRate="true"
        :node="currentNode"
      ></comment>
      <knowledgeGraphBox
        v-if="activeName === 'third'"
        :currentNode="currentNode"
        :topH="topH"
        permission="overview"
      ></knowledgeGraphBox>
      <div class="logMana" v-if="activeName === 'fourth'">
        <logManage
          pageFrom="history"
          condition="condition"
          :currentNode="currentNode"
          :topH="topH"
        ></logManage>
      </div>
      <div
        class="version-record"
        v-if="activeName === 'fifth'"
        :style="{ top: topH + 84 + 'px' }"
      >
        <version-record :catalogId="currentNode.id"></version-record>
      </div>
    </div>
    <div v-else-if="!loading" class="directory-content" v-loading="loading">
      <datablau-null
        :tip="$t('assets.common.noAssetsInfo.view')"
        style="width: 160px; margin-top: 20%; margin-left: calc(50% - 80px)"
      ></datablau-null>
    </div>
  </div>
</template>

<script>
import index from './index'
export default index
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.assets-list-box {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  &.assets-list-box1 {
    top: 98px;
  }
  &.assets-list-box2 {
    top: 134px;
  }
}
.resize-column-middle {
  left: 289px;
  top: 0;
  background-color: transparent;
  width: 10px;
  z-index: 8;
}
.overview-left-box {
  position: absolute;
  left: 0;
  width: 50px;
  top: 0;
  bottom: 0;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  padding-top: 15px;
  .list {
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
    &:hover {
      i {
        color: #409eff;
      }
    }
    &.list-active {
      i {
        color: #409eff;
      }
    }
    i {
      font-size: 20px;
      color: #999999;
    }
  }
}
.directory-tree {
  position: absolute;
  left: 50px;
  width: 240px;
  top: 0;
  bottom: 0;
}
.directory-content {
  position: absolute;
  top: 0;
  left: 290px;
  bottom: 0;
  right: 0;
  padding: 0px 20px;
  background-color: #fff;

  &.directory-content-detail {
    /deep/ .top-base-info-page {
      border-bottom: 0;
    }
  }
  /deep/ .top-base-info-page {
    border-bottom: 1px solid $border-color;
  }

  &.only-content {
    left: 0;
  }

  .base-info {
    margin-top: 10px;
  }
  /deep/ .datablau-tabs {
    .el-tabs__content {
      .el-tab-pane {
        padding: 0;
        padding-top: 10px;
      }
    }
  }
  .abstract {
    position: absolute;
    width: 100%;
    display: flex;
    bottom: 0;
    top: 165px;
    overflow: scroll;
    .statistics-info {
      width: calc(100% - 340px);
      border-right: 1px solid #d8d8d8;
    }
    .attr-info {
      width: 340px;
      padding: 10px 20px;
    }
  }
  /deep/ .ql-snow {
    .comment-list {
      padding: 0;
    }
    .row-publish {
      margin: 20px 0 !important;
    }
  }
}
.logMana {
  position: absolute;
  top: 168px;
  bottom: 0;
  left: 0;
  right: 0;
}
.version-record {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
