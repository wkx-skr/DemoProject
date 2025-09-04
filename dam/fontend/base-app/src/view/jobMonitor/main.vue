<template>
  <div class="page">
    <datablau-page-title
      :name="$t('system.taskMonitoring.taskMonitoring')"
    ></datablau-page-title>
    <div class="tree-area">
      <div class="tree-box" style="bottom: 0">
        <datablau-tree
          :props="defaultProps"
          :load="loadNodes"
          lazy
          :data-icon-function="dataIconFunction"
          @node-click="handleNodeClick"
          ref="tree"
        ></datablau-tree>
      </div>
    </div>
    <div class="resize-column-middle" style="left: 280px; z-index: 2"></div>
    <div class="content-area">
      <server-message :message="currentMessage" v-if="currentMessage"></server-message>
      <instance-message
        :raw-message="currentInstance"
        v-if="currentInstance"
        @update-tree-item="updateTreeItem"
      ></instance-message>
    </div>
  </div>
</template>
<script>
import Main from './main.js'
export default Main
</script>
<style scoped lang="scss">
.page {
  height: 100%;
  background-color: #FFF;
}
.detail-page {
  background-color: #FFF;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
}
.tab-page-header {
  margin-left: 10px;
  margin-right: 10px;
}
.status-style {
  width: 7px;
  height: 7px;
  display: inline-block;
  transform: translateY(-2px);
  border-radius: 50%;
}

@import '~@/next/components/basic/color.sass';
.tree-area {
  position: absolute;
  top: 50px;
  bottom: 0;
  left: 0;
  width: 280px;
  background-color: var(--white-grey-bgc);
  //border-right: none;
  //border-top: none;
  border-left: none;
  .tree-box {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 50px;
    // border-top: 1px solid #E6E6E6;
    left: 0;
    overflow: auto;
  }
}
.content-area {
  //position: absolute;
  //background: pink;
  border-left: 1px solid var(--border-color-lighter);
  border-top:1px solid var(--border-color-lighter);
  left: 280px;
  top: 50px;
  overflow: auto;
}
</style>
