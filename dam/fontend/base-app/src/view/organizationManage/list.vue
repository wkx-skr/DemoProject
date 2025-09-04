<template>
  <div>
    <datablau-input
      maxlength="100"
      style="width: 260px; margin: 10px; position: relative; top: -1px"
      v-model="keyword"
      clearable
      :iconfont-state="true"
      :placeholder="$t('system.organization.placeholder.search')"
      class="list-input"
    ></datablau-input>
    <datablau-easy-tree
      ref="tree2"
      :data-supervise="true"
      :data-icon-function="dataIconFunction"
      :data-options-function="dataOptionsFunction"
      @node-click="handleNodeClick"
      node-key="id"
      :props="defaultProps"
      :default-expanded-keys="defaultExpandedKeys"
      auto-expand-parent
      :data="wholeTreeData"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :allow-drag="allowDrag"
      v-loading="treeLoading"
      height="calc(100vh - 110px)"
      :itemSize="34"
    ></datablau-easy-tree>
    <!-- <el-dropdown style="position: absolute;bottom: 5px;left: 105px">
      <el-button type="primary" size="mini">
        导出<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item><div @click="tableExport(true)">导出全部机构</div></el-dropdown-item>
        <el-dropdown-item><div @click="tableExport(false)">导出当前机构</div></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown> -->
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>

<style scoped lang="scss">
.grey-tree {
  position: absolute;
  top: 54px;
  bottom: 52px;
  left: 0;
  right: 0;
  overflow: auto;
}
</style>
<style lang="scss">
.icon-i-user .path2:before {
  margin-left: -1em !important;
}
.icon-i-folder {
  margin-right: 6px;
}
</style>
