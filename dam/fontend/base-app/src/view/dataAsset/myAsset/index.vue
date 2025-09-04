<!-- 数据资产 -- 资产浏览 -->
<template>
  <div style="width: 100%; height: 100%" v-loading="loading">
    <div class="directory-tree">
      <directory-tree
        ref="myTree"
        :clickNode="clickNode"
        :editable="false"
        :treeData="treeData"
        :originTreeData="originTreeData"
        :allCatalogs="allCatalogs"
        :currentNode="currentNode"
        :structureList="structureList"
        :authFunction="authFunction"
        :curStructureId="curStructureId"
        @node-click="handleNodeClick"
        :getSubCatalog="getSubCatalog"
        :pageId="2"
      ></directory-tree>
    </div>
    <div class="resize-column-middle"></div>
    <div v-if="currentNode.id" class="directory-content" v-loading="loading">
      <div class="datablau-breadcrumb-header">
        <div>
          <datablau-breadcrumb
            :showBack="false"
            :nodeData="breadcrumbNodes"
            @nodeClick="handleNodeClick"
            @back="goBack"
          ></datablau-breadcrumb>
        </div>
      </div>
      <top-base-info
        :editable="false"
        :baseInfo="baseInfo"
        :clickNode="clickNode"
      ></top-base-info>
      <datablau-tabs v-model="activeName" @tab-click="handleClick">
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
      <summary-info
        v-if="activeName === 'first'"
        :editable="false"
        :summaryInfo="summaryInfo"
        :topH="topH"
        :authFunction="authFunction"
        :authTooltip="authTooltip"
        :currentNode="currentNode"
        :pageId="0"
      ></summary-info>
      <assets-list
        v-if="activeName === 'second'"
        :type="2"
        ref="assetsList"
        :assetsType="assetsType"
        :clickNode="clickNode"
        :id="currentNode.id"
        :currentNode="currentNode"
        :breadcrumbNodes="breadcrumbNodes"
        :treeData="curtreeData"
        :topH="topH"
      ></assets-list>
      <comment
        v-if="activeName === 'sixth'"
        ref="comment"
        :onlyList="true"
        :showRate="true"
        :node="currentNode"
      ></comment>
      <knowledgeGraphBox
        :topH="topH"
        v-if="activeName === 'third'"
        :currentNode="currentNode"
        permission="myasset"
      ></knowledgeGraphBox>
      <div class="logMana" v-if="activeName === 'fourth'">
        <logManage
          :topH="topH"
          pageFrom="history"
          condition="condition"
          :currentNode="currentNode"
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
    <div v-else-if="currentStructure.id" class="directory-content">
      <structure-details
        :structureInfo="currentStructure.structureDto"
        :structureIndex="currentStructure.index"
        :clickNode="clickNode"
      ></structure-details>
    </div>
    <div v-else-if="!loading" class="directory-content">
      <template v-if="originTreeData.length">
        <datablau-null
          :tip="
            $t('assets.catalogue.noPermission', {
              name: `[${$t('assets.catalogue.catalog')}]`,
              type: $t('assets.catalogue.access'),
            })
          "
          style="width: 160px; margin-top: 20%; margin-left: calc(50% - 80px)"
        ></datablau-null>
      </template>
      <template v-else>
        <datablau-null
          :tip="$t('assets.catalogue.noAssets')"
          style="width: 160px; margin-top: 20%; margin-left: calc(50% - 80px)"
        ></datablau-null>
      </template>
    </div>
  </div>
</template>

<script>
import index from './index'
export default index
</script>

<style lang="scss" scoped>
/deep/ .directory-tree {
  .bottom-part {
    padding-top: 10px;
    .datablau-tooltip {
      top: 15px;
    }
  }
}
.resize-column-middle {
  left: 235px;
  top: 0;
  background-color: transparent;
  width: 10px;
  z-index: 8;
}
.directory-tree {
  position: absolute;
  left: 0;
  width: 240px;
  top: 0;
  bottom: 0;
}
.directory-content {
  position: absolute;
  top: 0;
  left: 240px;
  bottom: 0;
  right: 0;
  padding: 0px 20px;
  background-color: #fff;
  .datablau-breadcrumb-header {
    padding-left: 0;
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
