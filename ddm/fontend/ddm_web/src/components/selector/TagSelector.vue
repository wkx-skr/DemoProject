<template>
  <div>
    <datablau-dialog
      :title="$store.state.$v.modelList.chooseTag"
      :visible.sync="visible"
      width="320px"
      :close-on-click-modal="false"
      append-to-body
      :key="key"
    >
      <div>
        <datablau-input
          v-model="keyword"
          :iconfont-state="true"
          :placeholder="$store.state.$v.userMgr.placeholder_01"
          size="small"
        ></datablau-input>
        <div class="tree-box">
          <datablau-tree
            class="has-cnt"
            ref="modelTree"
            :data="treeData"
            v-loading="!treeDataLoaded"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            show-checkbox
            @check-change="handleCheckChange"
            :default-expand-all="false"
            :expand-on-click-node="false"
            node-key="id"
            :default-expanded-keys="[0]"
            :showOverflowTooltip="true"
          ></datablau-tree>
        </div>
      </div>
        <div slot="footer" >
            <datablau-button
              size="small"
              style="margin-top:10px;"
              type="secondary"
              @click="closeDialog"
            >{{$store.state.$v.modelDetail.cancel}}</datablau-button>
            <datablau-button
              size="small"
              type="primary"
              style="margin-top:10px;"
              :disabled="!canClose"
              @click="onTagSelected"
            >{{$store.state.$v.modelDetail.ok}}</datablau-button>
            </div>
    </datablau-dialog>
  </div>
</template>

<script>
import tagSelector from './tagSelector'
export default tagSelector
</script>
<style scoped lang="scss">
.top-title {
  margin-bottom:10px;
}
.datablau-input {
  display: block;
}
.tree-box {
  padding-top: 8px;
  position: relative;
  left: -6px;
  height:350px;
  overflow:auto;
}
/deep/ .el-input__inner {
    font-size: 12px;
    color: #999;
    font-weight: 400;
  }
  /deep/ .grey-tree .tree-item-outer .tree-label {
    position: unset;
    font-weight: 400;
    color:#555;font-size: 12px;
  }
  /deep/ .grey-tree.datablau-tree .el-icon-caret-right {
    display: none;
  }
  /deep/ .el-tree > .el-tree-node > .el-tree-node__content {
    padding-left: 18px !important;
  }
  /deep/ .el-tree-node__content {
    color:#555 !important;
    background: #fff !important;
  }
</style>
