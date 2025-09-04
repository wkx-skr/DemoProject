<template>
  <div class="catalogueList">
    <div class="tree-area">
      <div class="en-tree-box">
        <datablau-input
          maxlength="100"
          style="
            width: 230px;
            margin: 10px;
            position: relative;
            top: -1px;
            display: inline-block;
          "
          :iconfont-state="true"
          :placeholder="
            $t('meta.lineageManage.lineageCatalogue.treePlaceholder')
          "
          v-model="keyword"
          clearable
        ></datablau-input>
        <el-tooltip
          class="item"
          effect="dark"
          :content="$t('meta.lineageManage.lineageCatalogue.addDirectory')"
          placement="top"
        >
          <i
            class="iconfont icon-tianjia"
            style="
              padding-top: 10px;
              line-height: 34px;
              color: grey;
              cursor: pointer;
            "
            @click="addCatalogue"
          ></i>
        </el-tooltip>
      </div>
      <div class="tree-box">
        <datablau-tree
          class="el-tree light-blue-tree grey-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="id"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          :showOverflowTooltip="true"
          setId="id"
        ></datablau-tree>
      </div>
    </div>
    <div class="folder-line"></div>
    <div class="citic-card-tabs">
      <add-detail
        v-if="addType === 'next'"
        :type="'next'"
        :dataDetail="dataDetail"
        ref="adddetail"
        @fatherMethod="getTree"
      ></add-detail>
      <add-detail
        v-if="addType === 'peer'"
        :type="'peer'"
        :dataDetail="dataDetail"
        ref="adddetail"
        @fatherMethod="getTree"
      ></add-detail>
      <detail-scan
        v-show="addType === 'scan'"
        :type="'peer'"
        ref="detailScan"
        @treeClick="treeClick"
      ></detail-scan>
    </div>
  </div>
</template>
<script>
import catalogueList from './main.js'
export default catalogueList
</script>
<style scoped lang="scss">
.catalogueList {
  .tree-area {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 280px;
    background-color: var(--white-grey-bgc);
    border-right: none;
    // border: 1px solid var(--border-color-lighter);
    border-left: none;
    .tree-box {
      position: absolute;
      top: 52px;
      right: 0;
      bottom: 50px;
      // border-top: 1px solid #E6E6E6;
      left: 0;
      overflow: auto;
    }
  }
  .folder-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 280px;
    z-index: 2;
    width: 1px;
    cursor: e-resize !important;
    background-color: #e0e0e0;
  }
  .citic-card-tabs {
    top: 0;
    left: 280px;
    background: #fff;
  }
}
</style>
<style lang="scss"></style>
