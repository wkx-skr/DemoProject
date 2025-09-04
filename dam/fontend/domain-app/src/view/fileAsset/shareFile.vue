<template>
  <div>
    <el-dialog
      title="扩展属性"
      :visible.sync="showShareFileUpd"
      :close-on-click-modal="true"
      append-to-body
      width="700px"
    >
      <share-file-udp></share-file-udp>
    </el-dialog>
    <div class="tree-area" :class="{ user: !hasAccess }">
      <div class="page-title-row short">
        <span class="menu-of-tree menu font-medium">文件类资产</span>
        <i class="el-icon-more" style="" @click="callTopOptions"></i>
      </div>

      <div class="tree-search-box">
        <el-input
          size="small"
          suffix-icon="el-icon-search"
          placeholder="输入关键字过滤"
          v-model="keyword"
          clearable
          style=""
        ></el-input>
      </div>
      <div class="tree-box hideBottom">
        <!-- :default-expanded-keys="expandedKeys"
          :default-expand-all="defaultExpandAll" -->
        <el-tree
          class="grey-tree"
          v-loading="treeLoading"
          ref="shareFileTree"
          node-key="id"
          auto-expand-parent
          :check-strictly="false"
          :filter-node-method="filterNode"
          :data="treeData"
          :props="defaultProps"
          :render-content="renderContent"
          :expand-on-click-node="true"
          :show-checkbox="hasAccess && false"
          :highlight-current="true"
          @node-click="handleItemClicked"
          @node-expand="updateTreeBoxScrollbar(300)"
          @node-collapse="updateTreeBoxScrollbar(800)"
        ></el-tree>
        <!-- @check-change="handleCheckChange" -->
      </div>
    </div>
    <div class="content-area">
      <file-list
        v-if="nowFolder"
        v-show="contentStatus === 'folder' && nowFolder"
        :key="'folder' + nowFolder.id"
        :listData="listData"
        :folderData="nowFolder"
        @showFileDetail="showFileDetail"
      ></file-list>
      <file-detail
        v-if="contentStatus === 'scan' && currentFileData"
        :fileData="currentFileData"
        :key="'file' + currentFileData.id"
        @back="backToFolder"
        @goToUpdate="goToUpdate"
        @editCurrent="contentStatus = 'write'"
        :frontEnd="false"
      ></file-detail>
      <!-- <scan
        v-if="contentStatus==='scan' && nowDomain"
        :data="nowDomain"
        :key="nowDomainId"
        @editCurrent="contentStatus='write'"
        @goToUpdate="goToUpdate"
        @back="backToFolder"
        :frontEnd="false"
        :service-type="currentServiceType"
      ></scan> -->
      <!-- <standard-detail
        v-else-if="contentStatus==='write' && nowDomain"
        :domainId="nowDomainId"
        :data="nowDomain"
        ref="standardDetail"
        @reloadStandard="handleReload"
        @scanCurrent="contentStatus='scan'"
        :key="nowDomainId"></standard-detail> -->
      <!-- <standard-detail
        v-else-if="contentStatus==='add'"
        :options="options"
        :udps="udps"
        @reloadStandard="handleReload"
        key="add"></standard-detail> -->
      <!-- <folder-detail
        v-if="nowFolder"
        v-show="contentStatus==='folder' && nowFolder"
        :key="nowFolder.id"
        :listData="listData"
        :folderData="nowFolder"
      ></folder-detail> -->
    </div>
  </div>
</template>

<script>
import main from './shareFile.js'
export default main
</script>

<style lang="scss" scoped="scoped">
$grey-border: 1px solid #eaecf1;
@import '../../assets/styles/const';
.tree-area {
  &.user {
    .tab-box {
      display: none;
    }
    //.tree-box {
    //    top:50px;bottom:10px;
    //}
    .manage-box {
      display: none;
    }
  }
  .tab-box {
    height: 50px;
    .link {
      display: inline-block;
      width: 3em;
      margin: 0 22px;
      text-align: center;
      line-height: 48px;
      color: #9b9ea2;
      &:hover,
      &.checked {
        color: #515560;
      }
      &.checked {
        border-bottom: 2px solid $cl-color;
      }
      &:not(.checked) {
        cursor: pointer;
      }
    }
    .sep {
      color: #ddd;
    }
    border-bottom: $grey-border;
  }
  .tree-search-box {
    padding: 10px;
  }
  .tree-box {
    position: absolute;
    top: 100px;
    left: 0;
    right: 0;
    bottom: 50px;
    &.hideBottom {
      bottom: 10px;
    }
  }
  .manage-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    border-top: $grey-border;
    padding: 10px;
    span {
      position: absolute;
      right: 10px;
      top: 15px;
      color: #9b9ea2;
    }
  }
}
.page-btn-group {
  .margin0 {
    margin-left: 0;
  }
}
</style>
